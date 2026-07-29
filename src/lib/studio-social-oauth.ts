/**
 * Studio réseaux sociaux — connexions OAuth (Lot 2), feature-flaggées.
 *
 * Tant que les apps ne sont pas validées (App Review Meta, quota GBP), les cartes
 * de connexion affichent « Bientôt disponible » : les flags STUDIO_SOCIAL_META_ENABLED
 * et STUDIO_SOCIAL_GBP_ENABLED gouvernent l'activation. Le reste du Studio
 * (génération + copie manuelle) fonctionne sans ces connexions.
 *
 * Ce module regroupe la logique pure (flags, scopes, construction des URLs OAuth,
 * calcul d'expiration). Les échanges de tokens et le stockage vivent dans les routes.
 * Les tokens ne sont JAMAIS renvoyés au client.
 */
import type { SocialProvider } from "@/lib/studio-social";

// ── Feature flags ────────────────────────────────────────────
function flagActif(v: string | undefined): boolean {
  if (!v) return false;
  return ["1", "true", "on", "yes"].includes(v.trim().toLowerCase());
}

export function metaActive(): boolean {
  return flagActif(process.env.STUDIO_SOCIAL_META_ENABLED);
}

export function gbpActive(): boolean {
  return flagActif(process.env.STUDIO_SOCIAL_GBP_ENABLED);
}

/** Un provider est activé si son flag l'est ET si l'app OAuth est configurée. */
export function providerActive(provider: SocialProvider): boolean {
  if (provider === "google_business") {
    return gbpActive() && !!process.env.GOOGLE_OAUTH_CLIENT_ID && !!process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  }
  // facebook + instagram partagent l'app Meta.
  return metaActive() && !!process.env.META_APP_ID && !!process.env.META_APP_SECRET;
}

// ── Scopes ───────────────────────────────────────────────────
/**
 * Périmètre validé en App Review.
 *
 * `business_management` est nécessaire depuis le changement de plateforme Meta de
 * septembre 2023 (Graph API v17+) : /me/accounts ne retourne plus les Pages
 * rattachées à un compte Business Manager (Meta Business Suite) sans cette
 * permission, même pour un utilisateur Admin de la Page et de l'app. Comme la
 * quasi-totalité des pros gèrent leur Page via un portefeuille professionnel, ce
 * scope est indispensable pour que la connexion fonctionne dans le cas général —
 * pas seulement en test. Voir la documentation Meta :
 * https://developers.facebook.com/docs/graph-api/changelog/non-versioned-changes/nvc-2023#user-accounts
 * https://developers.facebook.com/docs/graph-api/reference/user/accounts/#limitations
 */
export const META_SCOPES = [
  "pages_show_list",
  "pages_manage_posts",
  "pages_read_engagement",
  "business_management",
  "instagram_basic",
  "instagram_content_publish",
];

export const GOOGLE_SCOPES = ["https://www.googleapis.com/auth/business.manage"];

export const META_GRAPH_VERSION = "v21.0";

// ── URLs de redirection (callbacks) ──────────────────────────
export function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.URL ||
    "https://www.roullepro.com"
  ).replace(/\/$/, "");
}

export function metaRedirectUri(): string {
  return `${appUrl()}/api/studio-social/connect/meta/callback`;
}

export function googleRedirectUri(): string {
  return `${appUrl()}/api/studio-social/connect/google/callback`;
}

// ── Construction des URLs d'autorisation ─────────────────────
export function construireUrlAuthMeta(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID || "",
    redirect_uri: metaRedirectUri(),
    state,
    scope: META_SCOPES.join(","),
    response_type: "code",
  });
  return `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
}

export function construireUrlAuthGoogle(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: GOOGLE_SCOPES.join(" "),
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// ── Expiration des tokens ────────────────────────────────────
/**
 * Convertit une durée `expires_in` (secondes) en timestamp ISO absolu, ou null si
 * absente/invalide (ex. token de Page Meta longue durée sans expiration).
 */
export function expiresAtDepuisExpiresIn(
  expiresIn: number | null | undefined,
  now: number = Date.now()
): string | null {
  if (!expiresIn || !Number.isFinite(expiresIn) || expiresIn <= 0) return null;
  return new Date(now + expiresIn * 1000).toISOString();
}

/** Un token GBP est à rafraîchir si son expiration est dans moins de `margeMs`. */
export function tokenARafraichir(
  tokenExpiresAt: string | null | undefined,
  now: number = Date.now(),
  margeMs = 5 * 60 * 1000
): boolean {
  if (!tokenExpiresAt) return false;
  const exp = new Date(tokenExpiresAt).getTime();
  if (Number.isNaN(exp)) return false;
  return exp - now <= margeMs;
}

// ── Vue publique d'une connexion (sans token) ────────────────
export type ConnexionPublique = {
  provider: SocialProvider;
  connecte: boolean;
  disponible: boolean;
  account_name: string | null;
  statut: string | null;
};

/**
 * Construit l'état public des 3 providers pour l'UI à partir des connexions
 * stockées. N'expose jamais les tokens. `disponible` reflète le feature flag.
 */
export function construireEtatConnexions(
  connexions: Array<{ provider: string; account_name: string | null; statut: string | null }>
): ConnexionPublique[] {
  const parProvider = new Map(connexions.map((c) => [c.provider, c]));
  const providers: SocialProvider[] = ["facebook", "instagram", "google_business"];
  return providers.map((provider) => {
    const c = parProvider.get(provider);
    return {
      provider,
      // 'en_attente_choix' : plusieurs établissements détectés, l'utilisateur doit
      // choisir avant que la connexion soit réellement active (cf. écran de choix).
      connecte: !!c && c.statut === "active",
      disponible: providerActive(provider),
      account_name: c?.account_name ?? null,
      statut: c?.statut ?? null,
    };
  });
}
