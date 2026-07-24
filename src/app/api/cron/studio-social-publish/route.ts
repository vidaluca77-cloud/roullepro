/**
 * GET|POST /api/cron/studio-social-publish
 *
 * Publication automatique des posts planifiés du Studio réseaux sociaux (Lot 3).
 *
 * Sélectionne les posts au statut 'planifie' dont scheduled_at est échu, les
 * regroupe par pro, puis publie sur chaque cible connectée (Facebook / Instagram /
 * Google Business Profile) en respectant :
 *   - le quota mensuel de publications (QUOTA_PUBLICATIONS_MOIS, mois Europe/Paris) ;
 *   - l'idempotence : une cible déjà publiée (external_id présent) n'est jamais
 *     republiée, même si le post repasse dans le run (cf. providersAPublier).
 * Chaque tentative réseau est réessayée une fois. Le token Google est rafraîchi si
 * son expiration est proche. Les résultats sont fusionnés dans social_posts.resultats,
 * le statut global recalculé (publie / echec / planifie) et published_at renseigné.
 * En cas d'échec partiel, un email best-effort est envoyé au pro.
 *
 * Sécurité : Authorization: Bearer ${CRON_SECRET}. Les tokens ne sont jamais loggés.
 * Planification : Netlify Scheduled Function studio-social-publish, horaire (netlify.toml).
 */

import { NextResponse } from "next/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import { sendEmail } from "@/lib/email";
import { renderStudioSocialEchec } from "@/lib/email-templates/sanitaire";
import { bornesMoisParis, type SocialProvider } from "@/lib/studio-social";
import { tokenARafraichir, expiresAtDepuisExpiresIn } from "@/lib/studio-social-oauth";
import {
  selectionnerPostsAPublier,
  providersAPublier,
  fusionnerResultats,
  statutGlobal,
  publicationsRestantesMois,
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

const MAX_POSTS_PAR_RUN = 100;

type ProInfo = {
  id: string;
  raison_sociale: string | null;
  nom_commercial: string | null;
  email_public: string | null;
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

  const admin = getAdminServiceClient();
  const now = new Date();
  const { debut, fin } = bornesMoisParis(now);

  // Posts planifiés échus (fenêtre large ; le filtrage fin est fait par la logique pure).
  const { data: postsData, error } = await admin
    .from("social_posts")
    .select("id, pro_id, contenu, hashtags, image_url, providers_cibles, scheduled_at, resultats")
    .eq("statut", "planifie")
    .lte("scheduled_at", now.toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(MAX_POSTS_PAR_RUN);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const posts = (postsData as PostAPublier[] | null) || [];
  const stats = {
    scanned: posts.length,
    publies: 0,
    partiels: 0,
    echecs: 0,
    cibles_ok: 0,
    cibles_ko: 0,
    quota_atteint: 0,
    emails: 0,
    errors: 0,
  };
  const errorsLog: Array<{ post_id: string; error: string }> = [];

  // Regroupe par pro pour mutualiser le comptage de quota et le chargement des connexions.
  const parPro = new Map<string, PostAPublier[]>();
  for (const p of posts) {
    const arr = parPro.get(p.pro_id) || [];
    arr.push(p);
    parPro.set(p.pro_id, arr);
  }

  for (const [proId, postsDuPro] of Array.from(parPro.entries())) {
    try {
      // ── Quota mensuel de publications déjà consommé ──
      const { count } = await admin
        .from("social_posts")
        .select("id", { count: "exact", head: true })
        .eq("pro_id", proId)
        .eq("statut", "publie")
        .gte("published_at", debut)
        .lt("published_at", fin);
      const quotaRestant = publicationsRestantesMois(count ?? 0);
      if (quotaRestant <= 0) {
        stats.quota_atteint += postsDuPro.length;
        continue;
      }

      // ── Connexions actives du pro ──
      const { data: connData } = await admin
        .from("social_connections")
        .select("provider, account_id, access_token, refresh_token, token_expires_at, statut")
        .eq("pro_id", proId);
      const connexions = (connData as Connexion[] | null) || [];
      const connexionsParProvider = new Map<string, Connexion>(
        connexions.map((c) => [c.provider, c])
      );

      // ── Fiche pro (email + nom d'affichage) ──
      const { data: proData } = await admin
        .from("pros_sanitaire")
        .select("id, raison_sociale, nom_commercial, email_public")
        .eq("id", proId)
        .single();
      const pro = proData as ProInfo | null;

      const aPublier = selectionnerPostsAPublier(postsDuPro, now, quotaRestant);

      for (const post of aPublier) {
        const providers = providersAPublier(post, connexionsParProvider);
        if (providers.length === 0) continue;

        const nouveaux: Record<string, ProviderResultat> = {};
        for (const provider of providers) {
          const conn = connexionsParProvider.get(provider)!;
          const resultat = await publierAvecRetry(admin, provider, conn, post);
          nouveaux[provider] = resultat;
          if (resultat.external_id) stats.cibles_ok += 1;
          else stats.cibles_ko += 1;
        }

        const resultats = fusionnerResultats(post.resultats, nouveaux);
        const statut = statutGlobal(post, resultats);
        const publie = statut === "publie";

        const maj: Record<string, unknown> = { resultats, statut };
        if (publie) maj.published_at = new Date().toISOString();

        const { error: updErr } = await admin
          .from("social_posts")
          .update(maj)
          .eq("id", post.id);
        if (updErr) {
          stats.errors += 1;
          errorsLog.push({ post_id: post.id, error: `update: ${updErr.message}` });
          continue;
        }

        if (statut === "publie") stats.publies += 1;
        else if (statut === "echec") stats.echecs += 1;

        // ── Email d'échec (best-effort) sur toute cible en erreur ──
        const echecs = Object.entries(nouveaux)
          .filter(([, r]) => !r.external_id && r.erreur)
          .map(([provider, r]) => ({ provider, motif: r.erreur || "erreur inconnue" }));
        if (echecs.length > 0) {
          if (statut === "publie") stats.partiels += 1;
          if (pro?.email_public) {
            await envoyerEmailEchec(pro, post, echecs).then(
              () => {
                stats.emails += 1;
              },
              () => {
                /* email non bloquant */
              }
            );
          }
        }
      }
    } catch (e) {
      stats.errors += 1;
      errorsLog.push({
        post_id: `pro:${proId}`,
        error: e instanceof Error ? e.message : String(e),
      });
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
 * Publie sur un provider avec un retry. Pour Google, rafraîchit d'abord le token si
 * son expiration est proche et persiste le nouveau token. Ne loggue jamais les tokens.
 */
async function publierAvecRetry(
  admin: ReturnType<typeof getAdminServiceClient>,
  provider: SocialProvider,
  conn: Connexion,
  post: PostAPublier
): Promise<ProviderResultat> {
  let tokenFrais: string | undefined;
  if (
    provider === "google_business" &&
    conn.refresh_token &&
    tokenARafraichir(conn.token_expires_at)
  ) {
    const rafraichi = await rafraichirTokenGoogle(conn.refresh_token);
    if (rafraichi) {
      tokenFrais = rafraichi.accessToken;
      await admin
        .from("social_connections")
        .update({
          access_token: rafraichi.accessToken,
          token_expires_at: expiresAtDepuisExpiresIn(rafraichi.expiresIn),
        })
        .eq("pro_id", post.pro_id)
        .eq("provider", provider);
    }
  }

  let dernier = await publierSurProvider(provider, conn, post, tokenFrais);
  if (!dernier.external_id) {
    dernier = await publierSurProvider(provider, conn, post, tokenFrais);
  }
  return dernier;
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
