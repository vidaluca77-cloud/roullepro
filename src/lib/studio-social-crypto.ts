/**
 * Studio réseaux sociaux — chiffrement des tokens OAuth au repos.
 *
 * AES-256-GCM avec un IV aléatoire par écriture. La clé vient de la variable
 * d'environnement STUDIO_SOCIAL_TOKEN_KEY (32 octets : 64 caractères hex ou base64).
 * Format stocké : 'v1.<iv b64>.<tag b64>.<ciphertext b64>'.
 *
 * Le chiffrement échoue bruyamment si la clé est absente ou invalide : on préfère
 * refuser une connexion plutôt que stocker un token en clair. Le déchiffrement, lui,
 * renvoie null en cas de problème (clé tournée, donnée corrompue) pour que l'appelant
 * marque la connexion en erreur. Aucun token n'est jamais loggé.
 */
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const PREFIXE = "v1";
const IV_OCTETS = 12;
const CLE_OCTETS = 32;

/** Décode STUDIO_SOCIAL_TOKEN_KEY (hex ou base64) en clé de 32 octets. */
export function decoderCle(brut: string | undefined | null): Buffer | null {
  const v = (brut || "").trim();
  if (!v) return null;
  if (/^[0-9a-fA-F]{64}$/.test(v)) return Buffer.from(v, "hex");
  try {
    const buf = Buffer.from(v, "base64");
    return buf.length === CLE_OCTETS ? buf : null;
  } catch {
    return null;
  }
}

export function tokenKeyConfigured(): boolean {
  return decoderCle(process.env.STUDIO_SOCIAL_TOKEN_KEY) !== null;
}

function cle(): Buffer {
  const k = decoderCle(process.env.STUDIO_SOCIAL_TOKEN_KEY);
  if (!k) {
    throw new Error(
      "STUDIO_SOCIAL_TOKEN_KEY manquante ou invalide (32 octets attendus, en hex ou base64)."
    );
  }
  return k;
}

/** Chiffre un token. Renvoie null pour une entrée vide (colonne laissée à NULL). */
export function chiffrerToken(clair: string | null | undefined): string | null {
  if (!clair) return null;
  const iv = randomBytes(IV_OCTETS);
  const cipher = createCipheriv("aes-256-gcm", cle(), iv);
  const ct = Buffer.concat([cipher.update(clair, "utf8"), cipher.final()]);
  return [
    PREFIXE,
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    ct.toString("base64"),
  ].join(".");
}

/** Déchiffre un token stocké. Renvoie null si absent, malformé ou non authentifié. */
export function dechiffrerToken(stocke: string | null | undefined): string | null {
  if (!stocke) return null;
  const parts = stocke.split(".");
  if (parts.length !== 4 || parts[0] !== PREFIXE) return null;
  try {
    const iv = Buffer.from(parts[1], "base64");
    const tag = Buffer.from(parts[2], "base64");
    const ct = Buffer.from(parts[3], "base64");
    if (iv.length !== IV_OCTETS) return null;
    const decipher = createDecipheriv("aes-256-gcm", cle(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
