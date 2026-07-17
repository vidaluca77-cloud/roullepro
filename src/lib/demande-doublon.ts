/**
 * Detection de doublons de demandes de transport.
 *
 * Probleme constate en prod : ~24 % des demandes sont des re-soumissions du
 * meme patient pour le meme trajet a la meme date en moins de 24h (le patient
 * n'ayant aucun retour immediat, il redepose plusieurs fois la meme demande).
 *
 * Ces fonctions pures decrivent le critere de correspondance et sont testees
 * unitairement. La route API les applique sur les demandes recentes (statut
 * 'envoyee', < 24h) avant d'inserer, pour ne PAS recreer ni re-notifier les pros.
 *
 * Cas legitimes qui NE doivent PAS etre bloques :
 *   - date_souhaitee differente ;
 *   - trajet different, y compris le retour (depart/arrivee inverses) ;
 *   - demande precedente annulee/acceptee (statut != 'envoyee' cote requete SQL).
 */

/** Fenetre anti-doublon : une re-soumission dans les 24h est un doublon. */
export const FENETRE_DOUBLON_MS = 24 * 60 * 60 * 1000;

/**
 * Normalise un numero pour la comparaison (tolerant : mobiles ET fixes).
 *
 * On retire tout sauf les chiffres, on retire l'indicatif pays (+33 / 0033) et
 * on reconstruit la forme nationale a 10 chiffres (prefixe 0). Ainsi
 * "+33 6 63 60 33 04" et "0663603304" sont consideres identiques.
 */
export function normaliserTelephoneComparaison(tel: string | null | undefined): string {
  if (!tel) return "";
  let d = String(tel).replace(/\D/g, "");
  let indicatifRetire = false;
  if (d.startsWith("0033")) {
    d = d.slice(4);
    indicatifRetire = true;
  } else if (d.startsWith("33") && d.length >= 11) {
    d = d.slice(2);
    indicatifRetire = true;
  }
  // Apres retrait de l'indicatif, un numero FR national a 9 chiffres : on
  // reajoute le 0 initial pour aligner sur la forme "0XXXXXXXXX".
  if (indicatifRetire && d.length === 9) d = `0${d}`;
  return d;
}

/**
 * Normalise un libelle de lieu pour la comparaison : minuscules, sans accents,
 * ponctuation reduite et espaces compresses. Renvoie "" pour une valeur vide.
 */
export function normaliserLieu(lieu: string | null | undefined): string {
  if (!lieu) return "";
  return String(lieu)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[.,;]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Deux dates souhaitees sont identiques si elles pointent le meme instant. */
export function memeDateSouhaitee(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (!a || !b) return false;
  const ta = new Date(a).getTime();
  const tb = new Date(b).getTime();
  if (Number.isNaN(ta) || Number.isNaN(tb)) return false;
  return ta === tb;
}

export interface DemandeComparable {
  telephone: string | null;
  lieu_depart: string | null;
  lieu_arrivee: string | null;
  date_souhaitee: string | null;
}

/**
 * Vrai si `nouvelle` est un doublon de `existante` : meme telephone (normalise),
 * meme lieu de depart, meme lieu d'arrivee et meme date souhaitee.
 *
 * La fenetre temporelle (< 24h) et le filtre statut='envoyee' sont appliques en
 * amont par la requete SQL ; cette fonction ne juge que la correspondance metier.
 */
export function estDoublonDemande(
  nouvelle: DemandeComparable,
  existante: DemandeComparable
): boolean {
  const telA = normaliserTelephoneComparaison(nouvelle.telephone);
  const telB = normaliserTelephoneComparaison(existante.telephone);
  if (!telA || telA !== telB) return false;

  if (!memeDateSouhaitee(nouvelle.date_souhaitee, existante.date_souhaitee)) return false;

  const departA = normaliserLieu(nouvelle.lieu_depart);
  const departB = normaliserLieu(existante.lieu_depart);
  if (!departA || departA !== departB) return false;

  // Arrivee : les deux vides comptent comme identiques ; un retour (depart et
  // arrivee inverses) donne des libelles differents et n'est donc PAS un doublon.
  const arriveeA = normaliserLieu(nouvelle.lieu_arrivee);
  const arriveeB = normaliserLieu(existante.lieu_arrivee);
  if (arriveeA !== arriveeB) return false;

  return true;
}

/**
 * Retourne la premiere demande existante consideree comme doublon de `nouvelle`,
 * ou `null` si aucune ne correspond.
 */
export function trouverDoublon<T extends DemandeComparable>(
  nouvelle: DemandeComparable,
  existantes: readonly T[]
): T | null {
  for (const e of existantes) {
    if (estDoublonDemande(nouvelle, e)) return e;
  }
  return null;
}
