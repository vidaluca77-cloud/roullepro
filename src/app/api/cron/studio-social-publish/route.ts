/**
 * GET|POST /api/cron/studio-social-publish
 *
 * Publication automatique des posts planifiés du Studio réseaux sociaux (Lot 3).
 *
 * Garanties :
 *   - Claim atomique : chaque post passe de 'planifie' à 'publication_en_cours' par
 *     un update conditionnel AVANT tout appel réseau. Deux runs qui se chevauchent
 *     ne peuvent donc pas publier le même post (le perdant obtient 0 ligne).
 *   - Idempotence par cible : le résultat de chaque plateforme est persisté
 *     immédiatement après son appel, et une cible ayant déjà un external_id n'est
 *     jamais republiée (cf. providersAPublier).
 *   - Retry sûr : uniquement sur 429 / 5xx avec réponse reçue. Un timeout n'est
 *     jamais rejoué (la plateforme a peut-être accepté le premier envoi).
 *   - Quota mensuel réservé atomiquement sur des compteurs monotones, remboursé si
 *     aucune cible n'a été publiée.
 *   - Éligibilité revalidée (plan actif) : une fiche dégradée ne publie plus.
 *   - Budget d'exécution borné (deadline + posts par run) et équité entre pros.
 *
 * Sécurité : Authorization: Bearer ${CRON_SECRET}. Les tokens sont déchiffrés en
 * mémoire uniquement et ne sont jamais loggés.
 * Planification : Netlify Scheduled Function studio-social-publish, horaire (netlify.toml).
 */

import { NextResponse } from "next/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { renderStudioSocialEchec } from "@/lib/email-templates/sanitaire";
import {
  moisParis,
  incrementerUsageMois,
  lireUsageMois,
  PROVIDER_LABEL,
  QUOTA_PUBLICATIONS_MOIS,
  type SocialProvider,
} from "@/lib/studio-social";
import { peutUtiliserStudioSocial } from "@/lib/sanitaire-plans";
import { tokenARafraichir, expiresAtDepuisExpiresIn } from "@/lib/studio-social-oauth";
import { dechiffrerToken, chiffrerToken, tokenKeyConfigured } from "@/lib/studio-social-crypto";
import {
  selectionnerPostsAPublier,
  repartirEquitablement,
  providersAPublier,
  fusionnerResultats,
  resultatPersistable,
  statutGlobal,
  publicationsRestantesMois,
  reclamerPost,
  publierSurProvider,
  rafraichirTokenGoogle,
  type PostAPublier,
  type ProviderResultat,
  type Connexion,
} from "@/lib/studio-social-publish";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://www.roullepro.com").replace(/\/$/, "");
const STUDIO_URL = `${APP_URL}/transport-medical/pro/studio-social`;

/** Budget d'exécution : la fonction doit rendre la main bien avant le timeout Netlify. */
const DEADLINE_MS = 20_000;
const MAX_POSTS_PAR_RUN = 12;
const MAX_POSTS_PAR_PRO = 3;
/** Au-delà, un post réclamé par un run interrompu est considéré comme perdu. */
const CLAIM_PERIME_MS = 30 * 60 * 1000;

type ProInfo = {
  id: string;
  raison_sociale: string | null;
  nom_commercial: string | null;
  email_public: string | null;
  plan: string | null;
  plan_expires_at: string | null;
  plan_active_until: string | null;
  free_trial_ends_at: string | null;
  stripe_subscription_id: string | null;
};

type ConnexionStockee = {
  provider: string;
  account_id: string | null;
  account_name: string | null;
  access_token_chiffre: string | null;
  refresh_token_chiffre: string | null;
  token_expires_at: string | null;
  statut: string | null;
};

function nomAffiche(p: ProInfo): string {
  return (p.nom_commercial?.trim() || p.raison_sociale?.trim() || "RoullePro").slice(0, 80);
}

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET non configuré" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!tokenKeyConfigured()) {
    return NextResponse.json(
      { error: "STUDIO_SOCIAL_TOKEN_KEY non configurée" },
      { status: 500 }
    );
  }

  const admin = getAdminServiceClient();
  const now = new Date();
  const dateLimite = Date.now() + DEADLINE_MS;
  const mois = moisParis(now);

  const stats = {
    scanned: 0,
    claims_perdus: 0,
    claims_liberes: 0,
    publies: 0,
    partiels: 0,
    echecs: 0,
    cibles_ok: 0,
    cibles_ko: 0,
    quota_atteint: 0,
    plan_inactif: 0,
    connexions_en_erreur: 0,
    emails: 0,
    deadline: false,
    errors: 0,
  };
  const errorsLog: Array<{ post_id: string; error: string }> = [];

  stats.claims_liberes = await libererClaimsPerimes(admin, now);

  // Fenêtre large : le filtrage fin (échéance, quota, équité) est fait ensuite.
  const { data: postsData, error } = await admin
    .from("social_posts")
    .select("id, pro_id, contenu, hashtags, image_url, providers_cibles, scheduled_at, resultats")
    .eq("statut", "planifie")
    .lte("scheduled_at", now.toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(MAX_POSTS_PAR_RUN * 10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const candidats = repartirEquitablement(
    (postsData as PostAPublier[] | null) || [],
    MAX_POSTS_PAR_PRO,
    MAX_POSTS_PAR_RUN
  );
  stats.scanned = candidats.length;

  // Contexte par pro, chargé paresseusement et mémoïsé sur le run.
  const contextes = new Map<string, ContextePro | null>();
  // Une seule alerte « reconnexion » par connexion et par run.
  const connexionsSignalees = new Set<string>();

  for (const post of candidats) {
    if (Date.now() > dateLimite) {
      stats.deadline = true;
      break;
    }

    let ctx: ContextePro | null | undefined = contextes.get(post.pro_id);
    if (ctx === undefined) {
      ctx = await chargerContexte(admin, post.pro_id, mois);
      contextes.set(post.pro_id, ctx);
    }
    if (!ctx) {
      stats.plan_inactif += 1;
      continue;
    }
    if (ctx.quotaRestant <= 0) {
      stats.quota_atteint += 1;
      continue;
    }
    if (selectionnerPostsAPublier([post], now, ctx.quotaRestant).length === 0) continue;

    // ── Claim atomique : seul le run qui obtient la ligne publie ──
    if (!(await reclamerPost(admin, post.id))) {
      stats.claims_perdus += 1;
      continue;
    }

    // ── Réservation d'une publication sur le compteur mensuel ──
    const apres = await incrementerUsageMois(admin, post.pro_id, { publications: 1 }, mois);
    if (!apres || apres.publications > QUOTA_PUBLICATIONS_MOIS) {
      if (apres) await incrementerUsageMois(admin, post.pro_id, { publications: -1 }, mois);
      await admin.from("social_posts").update({ statut: "planifie" }).eq("id", post.id);
      stats.quota_atteint += 1;
      ctx.quotaRestant = 0;
      continue;
    }
    ctx.quotaRestant -= 1;

    try {
      const resultat = await publierPost(admin, ctx, post, connexionsSignalees, stats);
      if (!resultat.auMoinsUnePublication) {
        // Rien n'est parti : la réservation de quota est rendue.
        await incrementerUsageMois(admin, post.pro_id, { publications: -1 }, mois);
        ctx.quotaRestant += 1;
      }
      if (resultat.statut === "publie") stats.publies += 1;
      else if (resultat.statut === "echec") stats.echecs += 1;
      if (resultat.statut !== "publie" && resultat.auMoinsUnePublication) stats.partiels += 1;
    } catch (e) {
      stats.errors += 1;
      errorsLog.push({
        post_id: post.id,
        error: e instanceof Error ? e.message : String(e),
      });
      // Le claim ne doit pas rester bloqué : statut terminal explicite.
      await admin
        .from("social_posts")
        .update({ statut: "echec" })
        .eq("id", post.id)
        .eq("statut", "publication_en_cours");
      await incrementerUsageMois(admin, post.pro_id, { publications: -1 }, mois);
    }
  }

  return NextResponse.json({
    ok: true,
    at: now.toISOString(),
    stats,
    errors: errorsLog.length > 0 ? errorsLog.slice(0, 20) : undefined,
  });
}

// ── Contexte pro ─────────────────────────────────────────────
type ContextePro = {
  pro: ProInfo;
  connexions: Map<string, Connexion>;
  quotaRestant: number;
};

/**
 * Charge la fiche, revalide l'éligibilité au Studio (plan actif) et déchiffre les
 * tokens des connexions actives. Renvoie null si le pro n'est plus éligible.
 */
async function chargerContexte(
  admin: SupabaseClient,
  proId: string,
  mois: string
): Promise<ContextePro | null> {
  const { data: proData } = await admin
    .from("pros_sanitaire")
    .select(
      "id, raison_sociale, nom_commercial, email_public, plan, plan_expires_at, plan_active_until, free_trial_ends_at, stripe_subscription_id"
    )
    .eq("id", proId)
    .maybeSingle();
  const pro = proData as ProInfo | null;
  if (!pro || !peutUtiliserStudioSocial(pro)) return null;

  const usage = await lireUsageMois(admin, proId, mois);
  const quotaRestant = publicationsRestantesMois(usage.publications);

  const { data: connData } = await admin
    .from("social_connections")
    .select(
      "provider, account_id, account_name, access_token_chiffre, refresh_token_chiffre, token_expires_at, statut"
    )
    .eq("pro_id", proId);

  const connexions = new Map<string, Connexion>();
  for (const c of (connData as ConnexionStockee[] | null) || []) {
    connexions.set(c.provider, {
      provider: c.provider,
      account_id: c.account_id,
      access_token: dechiffrerToken(c.access_token_chiffre),
      refresh_token: dechiffrerToken(c.refresh_token_chiffre),
      token_expires_at: c.token_expires_at,
      statut: c.statut,
    });
  }

  return { pro, connexions, quotaRestant };
}

// ── Publication d'un post réclamé ────────────────────────────
async function publierPost(
  admin: SupabaseClient,
  ctx: ContextePro,
  post: PostAPublier,
  connexionsSignalees: Set<string>,
  stats: { cibles_ok: number; cibles_ko: number; connexions_en_erreur: number; emails: number }
): Promise<{ statut: "publie" | "echec" | "planifie"; auMoinsUnePublication: boolean }> {
  const cibles = (post.providers_cibles || []).filter(
    (p): p is SocialProvider =>
      p === "facebook" || p === "instagram" || p === "google_business"
  );
  const publiables = providersAPublier(post, ctx.connexions);
  let resultats = fusionnerResultats(post.resultats, {});
  let auMoinsUnePublication = false;

  // Cibles injoignables (connexion supprimée / en erreur) : on les marque en échec
  // pour que le post atteigne un statut terminal et ne soit pas rescanné sans fin.
  for (const cible of cibles) {
    if (resultats[cible]?.external_id) continue;
    if (publiables.includes(cible)) continue;
    resultats = fusionnerResultats(resultats, {
      [cible]: { erreur: `${PROVIDER_LABEL[cible]} non connecté — reconnectez le compte` },
    });
  }

  for (const provider of publiables) {
    const conn = ctx.connexions.get(provider)!;
    const resultat = await publierAvecRetry(admin, ctx, provider, conn, post, connexionsSignalees, stats);
    if (resultat.external_id) {
      stats.cibles_ok += 1;
      auMoinsUnePublication = true;
    } else {
      stats.cibles_ko += 1;
    }
    // Persistance immédiate : un crash après cet appel ne republiera pas cette cible.
    resultats = fusionnerResultats(resultats, { [provider]: resultatPersistable(resultat) });
    await admin.from("social_posts").update({ resultats }).eq("id", post.id);
  }

  const statut = statutGlobal(post, resultats);
  const dejaPublie = cibles.some((c) => resultats[c]?.external_id);

  const maj: Record<string, unknown> = { resultats, statut: statut === "planifie" ? "echec" : statut };
  // published_at dès la première cible réellement publiée, même en échec partiel :
  // le post a bien été diffusé, il ne doit pas apparaître comme jamais publié.
  if (dejaPublie) maj.published_at = new Date().toISOString();
  await admin.from("social_posts").update(maj).eq("id", post.id);

  const echecs = cibles
    .filter((c) => !resultats[c]?.external_id && resultats[c]?.erreur)
    .map((c) => ({ provider: c, motif: resultats[c].erreur || "erreur inconnue" }));
  if (echecs.length > 0 && ctx.pro.email_public) {
    await envoyerEmailEchec(ctx.pro, post, echecs).then(
      () => {
        stats.emails += 1;
      },
      () => {
        /* email non bloquant */
      }
    );
  }

  return { statut, auMoinsUnePublication };
}

/**
 * Publie sur un provider. Pour Google, rafraîchit d'abord le token si son expiration
 * est proche. Un seul rejeu, et uniquement si la plateforme a répondu 429/5xx.
 * Un token rejeté marque la connexion en erreur (« Reconnecter » côté UI).
 */
async function publierAvecRetry(
  admin: SupabaseClient,
  ctx: ContextePro,
  provider: SocialProvider,
  conn: Connexion,
  post: PostAPublier,
  connexionsSignalees: Set<string>,
  stats: { connexions_en_erreur: number }
): Promise<ProviderResultat> {
  let tokenFrais: string | undefined;
  if (
    provider === "google_business" &&
    conn.refresh_token &&
    tokenARafraichir(conn.token_expires_at)
  ) {
    const rafraichi = await rafraichirTokenGoogle(conn.refresh_token);
    if (rafraichi.ok) {
      tokenFrais = rafraichi.accessToken;
      await admin
        .from("social_connections")
        .update({
          access_token_chiffre: chiffrerToken(rafraichi.accessToken),
          token_expires_at: expiresAtDepuisExpiresIn(rafraichi.expiresIn),
        })
        .eq("pro_id", post.pro_id)
        .eq("provider", provider);
    } else if (rafraichi.tokenInvalide) {
      await marquerConnexionEnErreur(admin, ctx, provider, connexionsSignalees, stats);
      return { erreur: "accès Google révoqué — reconnectez le compte" };
    }
  }

  let resultat = await publierSurProvider(provider, conn, post, tokenFrais);
  if (!resultat.external_id && resultat.retryable) {
    resultat = await publierSurProvider(provider, conn, post, tokenFrais);
  }
  if (resultat.tokenInvalide) {
    await marquerConnexionEnErreur(admin, ctx, provider, connexionsSignalees, stats);
  }
  return resultat;
}

/**
 * Marque la connexion en erreur (l'UI affiche « Reconnecter ») et empêche les
 * tentatives suivantes du run sur cette plateforme.
 */
async function marquerConnexionEnErreur(
  admin: SupabaseClient,
  ctx: ContextePro,
  provider: SocialProvider,
  connexionsSignalees: Set<string>,
  stats: { connexions_en_erreur: number }
): Promise<void> {
  const clef = `${ctx.pro.id}:${provider}`;
  const conn = ctx.connexions.get(provider);
  if (conn) conn.statut = "error";
  if (connexionsSignalees.has(clef)) return;
  connexionsSignalees.add(clef);
  stats.connexions_en_erreur += 1;
  await admin
    .from("social_connections")
    .update({ statut: "error" })
    .eq("pro_id", ctx.pro.id)
    .eq("provider", provider);
}

/**
 * Rend au statut 'planifie' les posts réclamés par un run interrompu avant tout
 * appel réseau abouti. Les cibles déjà publiées gardent leur external_id, donc le
 * rejeu ne crée pas de doublon.
 */
async function libererClaimsPerimes(admin: SupabaseClient, now: Date): Promise<number> {
  const limite = new Date(now.getTime() - CLAIM_PERIME_MS).toISOString();
  const { data } = await admin
    .from("social_posts")
    .update({ statut: "planifie" })
    .eq("statut", "publication_en_cours")
    .lt("updated_at", limite)
    .select("id");
  return data?.length ?? 0;
}

async function envoyerEmailEchec(
  pro: ProInfo,
  post: PostAPublier,
  echecs: Array<{ provider: string; motif: string }>
): Promise<void> {
  if (!pro.email_public) return;
  const sujet = (post.contenu || "").trim().slice(0, 80) || "Votre post";
  const tpl = renderStudioSocialEchec({
    nomAffiche: nomAffiche(pro),
    sujet,
    echecs,
    studioUrl: STUDIO_URL,
  });
  await sendEmail({
    to: pro.email_public,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    tags: [
      { name: "category", value: "studio_social_echec" },
      { name: "cibles", value: echecs.map((e) => e.provider).join("_").slice(0, 40) },
    ],
  });
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
