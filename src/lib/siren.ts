/**
 * Vérification SIREN/SIRET via l'API publique recherche-entreprises.api.gouv.fr
 * (API gratuite, sans clé, maintenue par la DINUM).
 * Doc : https://recherche-entreprises.api.gouv.fr/
 */

export type SirenResult = {
  valid: boolean;
  active: boolean;
  raison_sociale?: string;
  siege_adresse?: string;
  siege_code_postal?: string;
  siege_ville?: string;
  activite_principale?: string;
  activite_libelle?: string;
  date_creation?: string;
  tranche_effectifs?: string;
  error?: string;
};

/**
 * Algorithme de Luhn pour valider la clé d'un SIREN (9 chiffres) ou SIRET (14 chiffres).
 * Exception : le SIRET de La Poste (35600000000000 et variantes) ne respecte pas Luhn.
 */
function luhnCheck(num: string): boolean {
  if (num.startsWith("356000000")) return true; // La Poste
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num.charAt(i), 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function isValidSiretFormat(siret: string): boolean {
  const clean = siret.replace(/\s/g, "");
  if (!/^\d{14}$/.test(clean)) return false;
  return luhnCheck(clean);
}

export function isValidSirenFormat(siren: string): boolean {
  const clean = siren.replace(/\s/g, "");
  if (!/^\d{9}$/.test(clean)) return false;
  return luhnCheck(clean);
}

/**
 * Interroge l'API gouvernementale pour valider un SIRET et récupérer les infos publiques.
 */
export async function verifySiret(siret: string): Promise<SirenResult> {
  const clean = siret.replace(/\s/g, "");

  if (!isValidSiretFormat(clean)) {
    return { valid: false, active: false, error: "Format SIRET invalide (14 chiffres + clé Luhn)" };
  }

  const siren = clean.substring(0, 9);
  const url = `https://recherche-entreprises.api.gouv.fr/search?q=${siren}&per_page=1`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      // Timeout 5s — si l'API gouv est lente, on laisse passer sans bloquer
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return { valid: true, active: true, error: `API indisponible (${res.status})` };
    }

    const data = await res.json();
    if (!data?.results || data.results.length === 0) {
      return { valid: false, active: false, error: "SIRET introuvable dans la base Sirene" };
    }

    const entreprise = data.results[0];
    const siege = entreprise.siege ?? {};
    const active = entreprise.etat_administratif === "A";

    return {
      valid: true,
      active,
      raison_sociale:
        entreprise.nom_raison_sociale ||
        entreprise.nom_complet ||
        undefined,
      siege_adresse: siege.adresse || undefined,
      siege_code_postal: siege.code_postal || undefined,
      siege_ville: siege.libelle_commune || undefined,
      activite_principale: entreprise.activite_principale || undefined,
      activite_libelle: entreprise.libelle_activite_principale || undefined,
      date_creation: entreprise.date_creation || undefined,
      tranche_effectifs: entreprise.tranche_effectif_salarie || undefined,
    };
  } catch (err) {
    // En cas d'erreur réseau, on ne bloque pas la candidature mais on le signale
    const msg = err instanceof Error ? err.message : "Erreur réseau";
    return { valid: true, active: true, error: `Vérification impossible : ${msg}` };
  }
}
