/**
 * Jeton signé HMAC-SHA256 permettant à un pro d'accepter une demande de
 * transport directement depuis l'email, sans passer par le dashboard.
 *
 * Format du token : `${proId}.${exp}.${signatureHex}`
 *  - proId : fiche pro autorisée à accepter
 *  - exp   : timestamp d'expiration (secondes epoch)
 *  - signature : HMAC_SHA256(`${demandeId}.${proId}.${exp}`, DEMANDE_ACCEPT_SECRET)
 *
 * Le demandeId n'est PAS dans le token (il provient de l'URL) : il entre
 * dans la signature, ce qui lie le token à une demande précise.
 */

import crypto from "crypto";

const TTL_SECONDS = 48 * 60 * 60; // 48h

function getSecret(): string | null {
  return process.env.DEMANDE_ACCEPT_SECRET || null;
}

function sign(demandeId: string, proId: string, exp: number, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${demandeId}.${proId}.${exp}`)
    .digest("hex");
}

/**
 * Génère un token d'acceptation directe. Renvoie null si le secret n'est pas
 * configuré (le lien n'est alors simplement pas inclus dans l'email).
 */
export function signDemandeAcceptToken(
  demandeId: string,
  proId: string
): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const sig = sign(demandeId, proId, exp, secret);
  return `${proId}.${exp}.${sig}`;
}

/** Construit l'URL complète d'acceptation directe, ou null si pas de secret. */
export function buildAccepterDirectUrl(
  appUrl: string,
  demandeId: string,
  proId: string
): string | null {
  const token = signDemandeAcceptToken(demandeId, proId);
  if (!token) return null;
  return `${appUrl}/api/demande-transport/${demandeId}/accepter-direct?token=${encodeURIComponent(token)}`;
}

export type VerifyResult =
  | { ok: true; proId: string }
  | { ok: false; reason: "no_secret" | "malformed" | "bad_signature" | "expired" };

/**
 * Vérifie un token pour une demande donnée. Compare la signature en temps
 * constant et contrôle l'expiration.
 */
export function verifyDemandeAcceptToken(
  demandeId: string,
  token: string | null | undefined
): VerifyResult {
  const secret = getSecret();
  if (!secret) return { ok: false, reason: "no_secret" };
  if (!token) return { ok: false, reason: "malformed" };

  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };
  const [proId, expStr, sigHex] = parts;
  const exp = Number(expStr);
  if (!proId || !Number.isFinite(exp) || !/^[0-9a-f]+$/i.test(sigHex)) {
    return { ok: false, reason: "malformed" };
  }

  const expected = sign(demandeId, proId, exp, secret);
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(sigHex, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_signature" };
  }

  if (Math.floor(Date.now() / 1000) > exp) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, proId };
}
