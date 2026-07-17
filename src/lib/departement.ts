/**
 * Normalisation du code departement francais — source unique partagee front + serveur.
 *
 * Objectif : eviter la divergence entre la derivation cote front (Google Places,
 * cf. use-places-autocomplete.ts) et cote serveur (API Adresse, cf.
 * geocode-adresse.ts). Un departement mal normalise casse le dispatch
 * departemental (WHERE p.departement = NEW.departement_cible) silencieusement.
 *
 * Gere : metropole (2 chiffres), Corse (2A / 2B), DROM / COM (97x, 98x).
 */

/**
 * Deduit un code departement a partir d'un code postal FR a 5 chiffres.
 * - 97XXX -> "97X" (DROM, ex 97400 -> "974")
 * - 98XXX -> "98X" (COM, ex 98800 -> "988")
 * - 20XXX -> "2A" / "2B" (Corse, borne 20200)
 * - sinon les 2 premiers chiffres
 */
export function codePostalToDepartement(cp: string | null | undefined): string | null {
  if (!cp || !/^\d{5}$/.test(cp)) return null;
  if (cp.startsWith("97") || cp.startsWith("98")) return cp.slice(0, 3);
  if (cp.startsWith("20")) {
    const n = parseInt(cp, 10);
    return n >= 20200 ? "2B" : "2A";
  }
  return cp.slice(0, 2);
}

/**
 * Normalise une valeur departement quelconque (code postal, code INSEE,
 * "2A"/"2B", "976", "76"...) vers le code departement canonique attendu par
 * le dispatch. Renvoie null si non reconnaissable.
 */
export function normaliserDepartement(value: string | null | undefined): string | null {
  const v = (value || "").trim();
  if (!v) return null;
  // Corse.
  if (/^2[ab]$/i.test(v)) return v.toUpperCase();
  // Code postal complet.
  if (/^\d{5}$/.test(v)) return codePostalToDepartement(v);
  // Code INSEE commune (5 caracteres, peut commencer par 2A/2B).
  if (/^(2A|2B)\d{3}$/i.test(v)) return v.slice(0, 2).toUpperCase();
  if (/^\d{2}\d{3}$/.test(v)) {
    if (v.startsWith("97") || v.startsWith("98")) return v.slice(0, 3);
    return v.slice(0, 2);
  }
  // Deja un code departement (2 chiffres metropole, 3 chiffres DROM/COM).
  if (/^\d{3}$/.test(v) && (v.startsWith("97") || v.startsWith("98"))) return v;
  if (/^\d{2}$/.test(v)) return v;
  return null;
}

/** DROM (971 Guadeloupe, 972 Martinique, 973 Guyane, 974 Reunion, 976 Mayotte). */
const DEPARTEMENTS_DROM = new Set(["971", "972", "973", "974", "976"]);

export function estDROM(departement: string | null | undefined): boolean {
  return !!departement && DEPARTEMENTS_DROM.has(departement.trim());
}
