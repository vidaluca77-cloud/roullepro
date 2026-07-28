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
import {
  moisParis,
  incrementerUsageMois,
  lireUsageMois,
  QUOTA_PUBLICATIONS_MOIS,
} from "@/lib/studio-social";
import { peutUtiliserStudioSocial } from "@/lib/sanitaire-plans";
import { tokenKeyConfigured } from "@/lib/studio-social-crypto";
import {
  selectionnerPostsAPublier,
  repartirEquitablement,
  reclamerPost,
  chargerContexte,
  publierPost,
  type PostAPublier,
  type ContextePro,
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
      ctx = await chargerContexte(admin, post.pro_id, peutUtiliserStudioSocial, lireUsageMois, mois);
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
      const resultat = await publierPost(admin, ctx, post, connexionsSignalees, stats, STUDIO_URL);
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

/**
 * Rend au statut 'planifie' les posts réclamés par un run interrompu avant tout
 * appel réseau abouti. Les cibles déjà publiées gardent leur external_id, donc le
 * rejeu ne crée pas de doublon.
 */
async function libererClaimsPerimes(admin: ReturnType<typeof getAdminServiceClient>, now: Date): Promise<number> {
  const limite = new Date(now.getTime() - CLAIM_PERIME_MS).toISOString();
  const { data } = await admin
    .from("social_posts")
    .update({ statut: "planifie" })
    .eq("statut", "publication_en_cours")
    .lt("updated_at", limite)
    .select("id");
  return data?.length ?? 0;
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
