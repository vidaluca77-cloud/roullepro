/**
 * Logique pure d'analyse du lien de reinitialisation de mot de passe.
 *
 * Quand l'utilisateur clique sur le lien recu par email, Supabase le renvoie
 * vers la page /auth/reinitialiser :
 *  - en flux PKCE (defaut de @supabase/ssr) : avec un parametre de requete
 *    `?code=<code>` a echanger via exchangeCodeForSession ;
 *  - en cas d'erreur (lien expire / deja utilise) : avec des parametres
 *    `error`, `error_code`, `error_description`, soit en query, soit en hash.
 *
 * Cette fonction n'a aucune dependance a Supabase / React : testable unitairement.
 */

export type LienRecuperation = {
  /** Code PKCE a echanger contre une session, ou null. */
  code: string | null;
  /** true si le lien porte une erreur (expire / invalide). */
  erreur: boolean;
  /** Message francais lisible a afficher a l'utilisateur, ou null. */
  messageErreur: string | null;
};

/** Transforme une portion d'URL (query ou hash) en URLSearchParams. */
function lireParams(portion: string): URLSearchParams {
  const nettoye = portion.replace(/^[?#]/, "");
  return new URLSearchParams(nettoye);
}

/**
 * Analyse la query et le hash de l'URL de retour.
 * @param search window.location.search (ex. "?code=abc" ou "?error=...")
 * @param hash   window.location.hash   (ex. "#error=access_denied&...")
 */
export function analyserLienRecuperation(
  search: string,
  hash: string
): LienRecuperation {
  const q = lireParams(search || "");
  const h = lireParams(hash || "");

  const error = q.get("error") || h.get("error");
  const errorCode = q.get("error_code") || h.get("error_code");
  const errorDescription =
    q.get("error_description") || h.get("error_description");

  if (error || errorCode) {
    return {
      code: null,
      erreur: true,
      messageErreur: messageDepuisErreur(errorCode, errorDescription),
    };
  }

  return {
    code: q.get("code"),
    erreur: false,
    messageErreur: null,
  };
}

/** Traduit un code/description d'erreur Supabase en message francais. */
function messageDepuisErreur(
  errorCode: string | null,
  errorDescription: string | null
): string {
  const desc = (errorDescription || "").toLowerCase();
  if (errorCode === "otp_expired" || desc.includes("expired")) {
    return "Ce lien de réinitialisation a expiré ou a déjà été utilisé.";
  }
  return "Le lien de réinitialisation est invalide.";
}
