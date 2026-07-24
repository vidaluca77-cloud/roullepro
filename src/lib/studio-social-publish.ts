/**
 * Studio réseaux sociaux — publication automatique (Lot 3).
 *
 * Logique de sélection/idempotence (pure, testable) + publishers HTTP directs vers
 * les Graph API Meta et l'API Google Business Profile. Réutilise le fuseau/quota de
 * studio-social.ts. Aucun token n'est jamais loggé.
 */
import { META_GRAPH_VERSION } from "@/lib/studio-social-oauth";
import {
  textePourProvider,
  QUOTA_PUBLICATIONS_MOIS,
  type SocialProvider,
} from "@/lib/studio-social";

// ── Types ────────────────────────────────────────────────────
export type PostAPublier = {
  id: string;
  pro_id: string;
  contenu: string;
  hashtags: string[];
  image_url: string | null;
  providers_cibles: string[];
  scheduled_at: string | null;
  resultats: Record<string, ProviderResultat> | null;
};

export type ProviderResultat = {
  external_id?: string;
  url?: string;
  erreur?: string;
};

export type Connexion = {
  provider: string;
  account_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  statut: string | null;
};

// ── Sélection des posts à publier ────────────────────────────
/**
 * Filtre et ordonne les posts planifiés effectivement publiables maintenant :
 * statut planifié (implicite : déjà filtré côté SQL), échéance passée, au moins
 * une cible. Ne dépasse pas `quotaRestant` publications sur le mois.
 */
export function selectionnerPostsAPublier(
  posts: PostAPublier[],
  now: Date,
  quotaRestant: number
): PostAPublier[] {
  const nowMs = now.getTime();
  const eligibles = posts
    .filter((p) => {
      if (!p.scheduled_at) return false;
      const t = new Date(p.scheduled_at).getTime();
      if (Number.isNaN(t) || t > nowMs) return false;
      return (p.providers_cibles || []).length > 0;
    })
    .sort((a, b) => {
      const ta = new Date(a.scheduled_at!).getTime();
      const tb = new Date(b.scheduled_at!).getTime();
      return ta - tb;
    });
  return eligibles.slice(0, Math.max(0, quotaRestant));
}

/**
 * Providers restant à publier pour un post : cibles connectées (connexion active)
 * qui n'ont PAS déjà un external_id dans resultats (idempotence : jamais republier).
 */
export function providersAPublier(
  post: PostAPublier,
  connexionsParProvider: Map<string, Connexion>
): SocialProvider[] {
  const resultats = post.resultats || {};
  const cibles = (post.providers_cibles || []).filter(
    (p): p is SocialProvider =>
      p === "facebook" || p === "instagram" || p === "google_business"
  );
  return cibles.filter((prov) => {
    if (resultats[prov]?.external_id) return false; // déjà publié
    const conn = connexionsParProvider.get(prov);
    return !!conn && conn.statut === "active" && !!conn.access_token;
  });
}

/** Fusionne les résultats existants avec les nouveaux (par provider). */
export function fusionnerResultats(
  existants: Record<string, ProviderResultat> | null | undefined,
  nouveaux: Record<string, ProviderResultat>
): Record<string, ProviderResultat> {
  return { ...(existants || {}), ...nouveaux };
}

/**
 * Statut global d'un post après tentative :
 *  - 'publie' si TOUTES les cibles ont un external_id ;
 *  - 'echec' si au moins une cible reste en erreur ;
 *  - 'planifie' si aucune cible n'a pu être tentée (ex. aucune connexion active).
 */
export function statutGlobal(
  post: PostAPublier,
  resultats: Record<string, ProviderResultat>
): "publie" | "echec" | "planifie" {
  const cibles = (post.providers_cibles || []).filter(
    (p) => p === "facebook" || p === "instagram" || p === "google_business"
  );
  if (cibles.length === 0) return "planifie";
  const auMoinsUnResultat = cibles.some((c) => resultats[c]);
  if (!auMoinsUnResultat) return "planifie";
  const toutesPubliees = cibles.every((c) => resultats[c]?.external_id);
  if (toutesPubliees) return "publie";
  return "echec";
}

export function publicationsRestantesMois(publicationsCeMois: number): number {
  return Math.max(0, QUOTA_PUBLICATIONS_MOIS - publicationsCeMois);
}

// ── Payloads (testables) ─────────────────────────────────────
export function payloadFacebookFeed(post: PostAPublier): { message: string } {
  return { message: textePourProvider("facebook", post.contenu, post.hashtags) };
}

export function payloadInstagramCaption(post: PostAPublier): string {
  return textePourProvider("instagram", post.contenu, post.hashtags);
}

/** Corps localPost GBP : résumé + CTA « Appeler ». */
export function payloadGbpLocalPost(post: PostAPublier): Record<string, unknown> {
  const summary = textePourProvider("google_business", post.contenu, post.hashtags).slice(0, 1500);
  return {
    languageCode: "fr",
    summary,
    callToAction: { actionType: "CALL" },
    topicType: "STANDARD",
  };
}

// ── Publishers HTTP ──────────────────────────────────────────
const TIMEOUT_MS = 12_000;

async function fetchTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Publie sur une Page Facebook (feed, ou photo si image). */
export async function publierFacebook(
  conn: Connexion,
  post: PostAPublier
): Promise<ProviderResultat> {
  const pageId = conn.account_id;
  const token = conn.access_token;
  if (!pageId || !token) return { erreur: "connexion Facebook incomplète" };
  try {
    const base = `https://graph.facebook.com/${META_GRAPH_VERSION}/${pageId}`;
    const message = textePourProvider("facebook", post.contenu, post.hashtags);
    const url = post.image_url ? `${base}/photos` : `${base}/feed`;
    const body: Record<string, string> = { access_token: token };
    if (post.image_url) {
      body.url = post.image_url;
      body.caption = message;
    } else {
      body.message = message;
    }
    const res = await fetchTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { erreur: extraireErreur(data) };
    const id: string | undefined = data?.post_id || data?.id;
    if (!id) return { erreur: "réponse Facebook sans identifiant" };
    return { external_id: id, url: `https://www.facebook.com/${id}` };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

/** Publie sur Instagram : création du container /media puis /media_publish. */
export async function publierInstagram(
  conn: Connexion,
  post: PostAPublier
): Promise<ProviderResultat> {
  const igId = conn.account_id;
  const token = conn.access_token;
  if (!igId || !token) return { erreur: "connexion Instagram incomplète" };
  if (!post.image_url) return { erreur: "Instagram nécessite une image" };
  try {
    const base = `https://graph.facebook.com/${META_GRAPH_VERSION}/${igId}`;
    const caption = textePourProvider("instagram", post.contenu, post.hashtags);
    const creerRes = await fetchTimeout(`${base}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: post.image_url, caption, access_token: token }),
    });
    const creerData = await creerRes.json().catch(() => ({}));
    if (!creerRes.ok || !creerData?.id) return { erreur: extraireErreur(creerData) };

    const publierRes = await fetchTimeout(`${base}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: creerData.id, access_token: token }),
    });
    const publierData = await publierRes.json().catch(() => ({}));
    if (!publierRes.ok || !publierData?.id) return { erreur: extraireErreur(publierData) };
    return { external_id: publierData.id };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

/** Publie un localPost sur Google Business Profile. */
export async function publierGbp(
  conn: Connexion,
  post: PostAPublier,
  accessTokenFrais?: string
): Promise<ProviderResultat> {
  const accountLocation = conn.account_id; // format attendu : accounts/{id}/locations/{id}
  const token = accessTokenFrais || conn.access_token;
  if (!accountLocation || !token) return { erreur: "connexion Google Business incomplète" };
  try {
    const url = `https://mybusiness.googleapis.com/v4/${accountLocation}/localPosts`;
    const res = await fetchTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payloadGbpLocalPost(post)),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { erreur: extraireErreur(data) };
    const name: string | undefined = data?.name;
    if (!name) return { erreur: "réponse Google Business sans identifiant" };
    return { external_id: name, url: data?.searchUrl };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

/**
 * Rafraîchit un access_token Google via le refresh_token. Renvoie le nouveau token
 * + son expiration ISO, ou null en cas d'échec. Ne loggue jamais les tokens.
 */
export async function rafraichirTokenGoogle(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number | null } | null> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  try {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });
    const res = await fetchTimeout("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.access_token) return null;
    return { accessToken: data.access_token, expiresIn: data?.expires_in ?? null };
  } catch {
    return null;
  }
}

// ── Dispatch par provider ────────────────────────────────────
export async function publierSurProvider(
  provider: SocialProvider,
  conn: Connexion,
  post: PostAPublier,
  accessTokenFrais?: string
): Promise<ProviderResultat> {
  if (provider === "facebook") return publierFacebook(conn, post);
  if (provider === "instagram") return publierInstagram(conn, post);
  return publierGbp(conn, post, accessTokenFrais);
}

// ── Utilitaires d'erreur ─────────────────────────────────────
function extraireErreur(data: unknown): string {
  const err = (data as { error?: { message?: string } | string })?.error;
  if (typeof err === "string") return err.slice(0, 300);
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message?: string }).message || "erreur API").slice(0, 300);
  }
  return "erreur API";
}

function messageErreur(e: unknown): string {
  return (e instanceof Error ? e.message : String(e)).slice(0, 300);
}
