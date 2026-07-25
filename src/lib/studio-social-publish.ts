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
  /** Renseigné à la tentative, jamais persisté (cf. resultatPersistable). */
  retryable?: boolean;
  tokenInvalide?: boolean;
};

/** Connexion en mémoire : tokens DÉJÀ déchiffrés, jamais loggés ni renvoyés au client. */
export type Connexion = {
  provider: string;
  account_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  statut: string | null;
};

/** Retire les métadonnées de tentative avant écriture dans social_posts.resultats. */
export function resultatPersistable(r: ProviderResultat): ProviderResultat {
  const out: ProviderResultat = {};
  if (r.external_id) out.external_id = r.external_id;
  if (r.url) out.url = r.url;
  if (r.erreur) out.erreur = r.erreur;
  return out;
}

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
 * Répartit équitablement les posts d'un run entre les pros : au plus `maxParPro`
 * posts par pro, puis entrelacement round-robin (ordre d'échéance conservé au sein
 * d'un pro). Sans cela, un pro avec 50 posts échus monopoliserait tous les runs.
 */
export function repartirEquitablement(
  posts: PostAPublier[],
  maxParPro: number,
  maxTotal: number
): PostAPublier[] {
  const files = new Map<string, PostAPublier[]>();
  const ordrePros: string[] = [];
  for (const p of posts) {
    let file = files.get(p.pro_id);
    if (!file) {
      file = [];
      files.set(p.pro_id, file);
      ordrePros.push(p.pro_id);
    }
    if (file.length < maxParPro) file.push(p);
  }
  const out: PostAPublier[] = [];
  for (let tour = 0; tour < maxParPro && out.length < maxTotal; tour += 1) {
    for (const proId of ordrePros) {
      const p = files.get(proId)?.[tour];
      if (p) out.push(p);
      if (out.length >= maxTotal) break;
    }
  }
  return out;
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

/** Sous-ensemble de supabase-js nécessaire au claim (facilite le test). */
export type ClientClaim = {
  from(table: string): {
    update(valeurs: Record<string, unknown>): {
      eq(
        colonne: string,
        valeur: unknown
      ): {
        eq(
          colonne: string,
          valeur: unknown
        ): {
          // PromiseLike : le builder supabase-js est « thenable » sans être une Promise.
          select(colonnes: string): PromiseLike<{ data: Array<{ id: string }> | null }>;
        };
      };
    };
  };
};

/**
 * Claim atomique d'un post AVANT tout appel réseau : l'update est conditionné au
 * statut 'planifie', donc deux runs qui se chevauchent ne peuvent pas publier le
 * même post — le perdant obtient 0 ligne et renvoie false.
 */
export async function reclamerPost(
  admin: ClientClaim,
  postId: string
): Promise<boolean> {
  const { data } = await admin
    .from("social_posts")
    .update({ statut: "publication_en_cours" })
    .eq("id", postId)
    .eq("statut", "planifie")
    .select("id");
  return !!data && data.length > 0;
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
// Court, pour tenir dans le budget d'exécution d'une fonction Netlify (cf. le
// deadline du cron) : un timeout ne peut de toute façon pas être réessayé.
const TIMEOUT_MS = 8_000;

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
    if (!res.ok) return erreurHttp(res, data);
    const id: string | undefined = data?.post_id || data?.id;
    if (!id) return { erreur: "réponse Facebook sans identifiant" };
    return { external_id: id, url: `https://www.facebook.com/${id}` };
  } catch (e) {
    return erreurReseau(e);
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
    if (!creerRes.ok) return erreurHttp(creerRes, creerData);
    if (!creerData?.id) return { erreur: "réponse Instagram sans conteneur média" };

    const publierRes = await fetchTimeout(`${base}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: creerData.id, access_token: token }),
    });
    const publierData = await publierRes.json().catch(() => ({}));
    if (!publierRes.ok) return erreurHttp(publierRes, publierData);
    if (!publierData?.id) return { erreur: "réponse Instagram sans identifiant" };
    return { external_id: publierData.id };
  } catch (e) {
    return erreurReseau(e);
  }
}

/**
 * Vérifie que account_id est bien une ressource de location GBP publiable :
 * `accounts/{compte}/locations/{location}`. Un simple `accounts/{id}` ne permet pas
 * de publier (cf. callback Google qui liste et stocke la location).
 */
export function estLocationGbp(accountId: string | null | undefined): boolean {
  return /^accounts\/[^/]+\/locations\/[^/]+$/.test((accountId || "").trim());
}

/** Publie un localPost sur Google Business Profile. */
export async function publierGbp(
  conn: Connexion,
  post: PostAPublier,
  accessTokenFrais?: string
): Promise<ProviderResultat> {
  const accountLocation = (conn.account_id || "").trim();
  const token = accessTokenFrais || conn.access_token;
  if (!accountLocation || !token) return { erreur: "connexion Google Business incomplète" };
  if (!estLocationGbp(accountLocation)) {
    return {
      erreur: "aucun établissement Google Business sélectionné — reconnectez le compte",
    };
  }
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
    if (!res.ok) return erreurHttp(res, data);
    const name: string | undefined = data?.name;
    if (!name) return { erreur: "réponse Google Business sans identifiant" };
    return { external_id: name, url: data?.searchUrl };
  } catch (e) {
    return erreurReseau(e);
  }
}

export type RafraichissementGoogle =
  | { ok: true; accessToken: string; expiresIn: number | null }
  | { ok: false; tokenInvalide: boolean };

/**
 * Rafraîchit un access_token Google via le refresh_token. `tokenInvalide` indique un
 * refus définitif (invalid_grant : consentement révoqué) qui doit marquer la connexion
 * en erreur. Ne loggue jamais les tokens.
 */
export async function rafraichirTokenGoogle(
  refreshToken: string
): Promise<RafraichissementGoogle> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return { ok: false, tokenInvalide: false };
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
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.access_token) {
      return { ok: false, tokenInvalide: tokenRejete(res.status, data) };
    }
    return { ok: true, accessToken: data.access_token, expiresIn: data?.expires_in ?? null };
  } catch {
    return { ok: false, tokenInvalide: false };
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
export function extraireErreur(data: unknown): string {
  const err = (data as { error?: { message?: string } | string })?.error;
  if (typeof err === "string") return err.slice(0, 300);
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message?: string }).message || "erreur API").slice(0, 300);
  }
  return "erreur API";
}

/**
 * Erreur avec réponse de la plateforme : seul ce cas peut être réessayé, et
 * uniquement sur 429 (quota) ou 5xx (incident distant). Un 4xx métier est définitif.
 */
export function erreurHttp(
  res: { status: number },
  data: unknown
): ProviderResultat {
  const out: ProviderResultat = { erreur: extraireErreur(data) };
  if (res.status === 429 || res.status >= 500) out.retryable = true;
  if (tokenRejete(res.status, data)) out.tokenInvalide = true;
  return out;
}

/** Détecte un token révoqué/expiré : Meta code 190, Google 401 / invalid_grant. */
export function tokenRejete(status: number, data: unknown): boolean {
  if (status === 401) return true;
  const err = (data as { error?: unknown })?.error;
  if (typeof err === "string") return err === "invalid_grant" || err === "invalid_token";
  if (err && typeof err === "object") {
    const code = (err as { code?: number }).code;
    if (code === 190) return true;
    const statut = (err as { status?: string }).status;
    if (statut === "UNAUTHENTICATED") return true;
  }
  return false;
}

/**
 * Échec sans réponse de la plateforme (coupure, timeout). JAMAIS réessayable :
 * la publication a peut-être abouti côté plateforme, un second envoi créerait un doublon.
 */
export function erreurReseau(e: unknown): ProviderResultat {
  const nom = e instanceof Error ? e.name : "";
  if (nom === "AbortError" || nom === "TimeoutError") {
    return {
      erreur:
        "délai dépassé sans réponse de la plateforme — vérifiez votre page avant de replanifier",
    };
  }
  return { erreur: (e instanceof Error ? e.message : String(e)).slice(0, 300) };
}
