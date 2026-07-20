/**
 * SMS de recrutement aux pros NON inscrits (claimed=false) de la commune de
 * depart d'une demande de transport.
 *
 * Contexte : ~47 % des demandes ne notifient personne faute de pro revendique
 * dans le secteur, alors que la base contient des pros conventionnes avec
 * telephone public dans la commune meme. On les previent pour les inciter a
 * activer leur fiche gratuite.
 *
 * Ce module ne contient que des fonctions PURES (ciblage, message, fenetre
 * horaire) : l'envoi effectif et la journalisation restent dans la route
 * demande-transport, ou tout est best-effort et jamais bloquant.
 */

import { retirerAccents } from "@/lib/sms";
import { normalizeForMatch } from "@/lib/sanitaire-search";
import type { TypeTransport } from "@/lib/transport-types";

/** Plafond de SMS de recrutement par demande (garde-fou anti-spam). */
export const PLAFOND_SMS_RECRUTEMENT = 8;

/** Debut de la fenetre d'envoi (heure de Paris, incluse). */
export const HEURE_DEBUT_ENVOI = 8;
/** Fin de la fenetre d'envoi (heure de Paris, exclue). */
export const HEURE_FIN_ENVOI = 20;

/** Libelle du type de transport pour le corps du SMS (sans accent, GSM-7). */
const TYPE_LIBELLE_RECRUTEMENT: Record<TypeTransport, string> = {
  taxi: "taxi conventionne",
  vsl: "VSL",
  ambulance: "ambulance",
};

/**
 * Construit le slug de commune (identique au format `ville_slug` en base) a
 * partir d'un nom de ville, pour un matching EXACT sur la commune de depart
 * (pas les communes voisines). Ex. « Saint-Maurice-de-Gourdans » ->
 * « saint-maurice-de-gourdans ». Renvoie `null` si le nom est vide.
 */
export function communeSlugRecrutement(ville: string | null | undefined): string | null {
  if (!ville) return null;
  const slug = normalizeForMatch(ville)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || null;
}

/**
 * Normalise un telephone public en mobile FR metropolitain E.164 (`+336…` /
 * `+337…`) EXCLUSIVEMENT. Renvoie `null` pour tout numero fixe, non FR, ou
 * mobile hors metropole : le SMS de recrutement ne cible que les mobiles
 * 06/07 (ou +336/+337) exploitables. Tolere espaces, points et tirets.
 */
export function normaliserMobileRecrutement(tel: string | null | undefined): string | null {
  if (!tel) return null;
  const brut = String(tel).trim();
  const aPlus = brut.startsWith("+") || brut.startsWith("00");
  let chiffres = brut.replace(/[^\d]/g, "");
  if (!chiffres) return null;

  if (brut.startsWith("00")) chiffres = chiffres.slice(2);

  // Deja en international : on n'accepte que +33 metropole (6/7).
  if (aPlus || chiffres.startsWith("33")) {
    if (!chiffres.startsWith("33")) return null;
    let reste = chiffres.slice(2);
    // +33 avec un 0 en trop (ex. +33 06…).
    if (reste.startsWith("0")) reste = reste.slice(1);
    if ((reste.startsWith("6") || reste.startsWith("7")) && reste.length === 9) {
      return `+33${reste}`;
    }
    return null;
  }

  // Format national : 10 chiffres commencant par 06 ou 07.
  if (chiffres.length === 10 && (chiffres.startsWith("06") || chiffres.startsWith("07"))) {
    return `+33${chiffres.slice(1)}`;
  }
  return null;
}

/** Vrai si l'heure de `date` (fuseau Europe/Paris) est dans [8 h, 20 h[. */
export function dansFenetreEnvoiParis(date: Date): boolean {
  if (Number.isNaN(date.getTime())) return false;
  const heureStr = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    hour12: false,
  }).format(date);
  const heure = Number.parseInt(heureStr, 10);
  if (Number.isNaN(heure)) return false;
  return heure >= HEURE_DEBUT_ENVOI && heure < HEURE_FIN_ENVOI;
}

/**
 * Construit le message SMS de recrutement, ex. :
 *   "RoullePro: un patient cherche un taxi conventionne a
 *    Saint-Maurice-de-Gourdans le 20/07 a 14h30. Activez votre fiche gratuite
 *    pour voir et accepter la demande: <lien>"
 *
 * - AUCUNE coordonnee patient ;
 * - date/heure au fuseau Europe/Paris ;
 * - sans accents (GSM-7) ;
 * - format aligne sur les SMS transactionnels existants (pas de mention STOP,
 *   les SMS existants n'en ont pas ; l'opt-out passe par la table sms_optout).
 */
export function construireMessageSmsRecrutement(params: {
  typeTransport: TypeTransport;
  dateSouhaitee: string;
  villeDepart: string;
  url: string;
}): string {
  const type =
    TYPE_LIBELLE_RECRUTEMENT[params.typeTransport] ||
    retirerAccents(String(params.typeTransport));
  const ville = retirerAccents((params.villeDepart || "").trim());

  let quand = "";
  const d = new Date(params.dateSouhaitee);
  if (!Number.isNaN(d.getTime())) {
    const dateStr = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      day: "2-digit",
      month: "2-digit",
    }).format(d);
    const heureStr = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .format(d)
      .replace(":", "h");
    quand = ` le ${dateStr} a ${heureStr}`;
  }

  const message = `RoullePro: un patient cherche un ${type} a ${ville}${quand}. Activez votre fiche gratuite pour voir et accepter la demande: ${params.url}`;
  return retirerAccents(message);
}

/** Fiche pro minimale necessaire au ciblage. */
export type ProRecrutement = {
  id: string;
  telephone_public: string | null;
};

/** Cible retenue pour l'envoi : identifiant pro + mobile E.164. */
export type CibleRecrutement = {
  proId: string;
  numero: string;
};

/**
 * Selectionne les cibles finales du SMS de recrutement a partir des fiches
 * eligibles (deja filtrees en amont : claimed=false, actif, non suspendu,
 * meme commune, bonne categorie) :
 *   - ne garde que les mobiles FR metropolitains (06/07 -> +336/+337) ;
 *   - exclut les numeros presents dans `optout` ;
 *   - deduplique les numeros (plusieurs fiches peuvent partager un numero) ;
 *   - plafonne a `plafond` envois.
 * Fonction pure : cœur testable du ciblage.
 */
export function selectionnerCiblesRecrutement(params: {
  pros: ProRecrutement[];
  optout?: Set<string>;
  plafond?: number;
}): CibleRecrutement[] {
  const optout = params.optout ?? new Set<string>();
  const plafond = params.plafond ?? PLAFOND_SMS_RECRUTEMENT;
  const vus = new Set<string>();
  const cibles: CibleRecrutement[] = [];

  for (const pro of params.pros) {
    if (cibles.length >= plafond) break;
    const numero = normaliserMobileRecrutement(pro.telephone_public);
    if (!numero) continue;
    if (optout.has(numero)) continue;
    if (vus.has(numero)) continue;
    vus.add(numero);
    cibles.push({ proId: pro.id, numero });
  }
  return cibles;
}
