/**
 * Studio réseaux sociaux — publication automatique (Lot 3).
 *
 * Logique de sélection/idempotence (pure, testable) + publishers HTTP directs vers
 * les Graph API Meta et l'API Google Business Profile. Réutilise le fuseau/quota de
 * studio-social.ts. Aucun token n'est jamais loggé.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { META_GRAPH_VERSION, tokenARafraichir, expiresAtDepuisExpiresIn } from "@/lib/studio-social-oauth";
import { dechiffrerToken, chiffrerToken } from "@/lib/studio-social-crypto";
import { sendEmail } from "@/lib/email";
import { renderStudioSocialEchec } from "@/lib/email-templates/sanitaire";
import {
  textePourProvider,
  QUOTA_PUBLICATIONS_MOIS,
  PROVIDER_LABEL,
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

// Instagram traite l'image de façon asynchrone après /media : publier trop tôt
// renvoie "Media ID is not available". On attend le statut FINISHED avec un
// polling court et borné pour rester dans le budget d'exécution du cron.
const IG_POLL_TENTATIVES = 5;
const IG_POLL_DELAI_MS = 1_500;

function attendre(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Attend que le conteneur média Instagram soit prêt (status_code=FINISHED) avant publication. */
export async function attendreConteneurPret(
  containerId: string,
  token: string
): Promise<{ pret: boolean; erreur?: string }> {
  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${containerId}?fields=status_code&access_token=${encodeURIComponent(token)}`;
  for (let tentative = 0; tentative < IG_POLL_TENTATIVES; tentative += 1) {
    if (tentative > 0) await attendre(IG_POLL_DELAI_MS);
    try {
      const res = await fetchTimeout(url, { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) continue; // on retente : l'erreur transitoire ne doit pas faire échouer tout de suite
      const statut = data?.status_code;
      if (statut === "FINISHED") return { pret: true };
      if (statut === "ERROR" || statut === "EXPIRED") {
        return { pret: false, erreur: `traitement de l'image Instagram échoué (${statut})` };
      }
      // IN_PROGRESS ou PUBLISHED : on continue à attendre / on tente quand même.
    } catch {
      // erreur réseau transitoire pendant le polling : on retente jusqu'à épuisement.
    }
  }
  return { pret: false };
}

/** Publie sur Instagram : création du container /media, attente FINISHED, puis /media_publish. */
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

    const { pret, erreur: erreurPolling } = await attendreConteneurPret(creerData.id, token);
    if (!pret) {
      // Le conteneur existe déjà côté Meta : un nouvel essai identique créerait un
      // conteneur orphelin supplémentaire, mais jamais de double publication.
      return {
        erreur:
          erreurPolling ||
          "image Instagram pas encore traitée par Meta — nouvelle tentative à la prochaine planification",
        retryable: true,
      };
    }

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

// ── Publication d'un post réclamé (partagée entre le cron horaire et la
//    publication immédiate déclenchée par le pro) ───────────────────────
export type ProInfo = {
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

export type ContextePro = {
  pro: ProInfo;
  connexions: Map<string, Connexion>;
  quotaRestant: number;
};

function nomAffiche(p: ProInfo): string {
  return (p.nom_commercial?.trim() || p.raison_sociale?.trim() || "RoullePro").slice(0, 80);
}

/**
 * Publie un post déjà réclamé (statut publication_en_cours) sur toutes ses cibles
 * connectées, persiste chaque résultat immédiatement (idempotence par external_id),
 * marque le statut terminal et envoie l'e-mail d'échec le cas échéant. Utilisée à la
 * fois par le cron horaire (plusieurs posts) et par la publication immédiate déclenchée
 * par le pro (un seul post) : le comportement doit rester rigoureusement identique.
 */
export async function publierPost(
  admin: SupabaseClient,
  ctx: ContextePro,
  post: PostAPublier,
  connexionsSignalees: Set<string>,
  stats: { cibles_ok: number; cibles_ko: number; connexions_en_erreur: number; emails: number },
  studioUrl: string
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
    await envoyerEmailEchec(ctx.pro, post, echecs, studioUrl).then(
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

async function envoyerEmailEchec(
  pro: ProInfo,
  post: PostAPublier,
  echecs: Array<{ provider: string; motif: string }>,
  studioUrl: string
): Promise<void> {
  if (!pro.email_public) return;
  const sujet = (post.contenu || "").trim().slice(0, 80) || "Votre post";
  const tpl = renderStudioSocialEchec({
    nomAffiche: nomAffiche(pro),
    sujet,
    echecs,
    studioUrl,
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

/**
 * Charge la fiche, revalide l'éligibilité au Studio (plan actif) et déchiffre les
 * tokens des connexions actives. Renvoie null si le pro n'est plus éligible.
 */
export async function chargerContexte(
  admin: SupabaseClient,
  proId: string,
  peutUtiliserStudioSocial: (pro: ProInfo) => boolean,
  lireUsageMois: (admin: SupabaseClient, proId: string, mois: string) => Promise<{ publications: number }>,
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

  type ConnexionStockee = {
    provider: string;
    account_id: string | null;
    account_name: string | null;
    access_token_chiffre: string | null;
    refresh_token_chiffre: string | null;
    token_expires_at: string | null;
    statut: string | null;
  };

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
