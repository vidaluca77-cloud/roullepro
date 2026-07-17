/**
 * Estimateur de prix indicatif selon la convention tarifaire CPAM des taxis
 * conventionnes.
 *
 * Source : arrete du 29 juillet 2025 (JO du 8 aout 2025) approuvant la decision
 * UNCAM du 18 juillet 2025, en vigueur depuis le 1er octobre 2025.
 * Grille des taux km departementaux verifiee le 17/07/2026.
 *
 * IMPORTANT : cette estimation est INDICATIVE et ne vaut pas devis. Elle ignore
 * volontairement les elements inconnus au moment de la demande (retour a vide,
 * TPMR, transport partage, peages).
 *
 * Zero dependance : importable cote front (affichage temps reel) comme serveur.
 */

import { estDROM } from "./departement";

/** Mention obligatoire a afficher a cote de toute estimation. */
export const MENTION_ESTIMATION_CPAM =
  "Estimation indicative selon la convention CPAM (arrêté du 29/07/2025), ne vaut pas devis.";

/** Regles tarifaires conventionnelles (montants en euros). */
export const REGLES_CPAM = {
  /** Forfait de prise en charge, incluant les 4 premiers km en charge. */
  forfaitPriseEnCharge: 13.0,
  /** Nombre de km inclus dans le forfait. */
  kmInclus: 4,
  /** Forfait applicable au depart/arrivee dans une grande ville. */
  forfaitGrandeVille: 15.0,
  /** Taux de majoration nuit / week-end / jour ferie (sur le socle). */
  tauxMajorationNuitWe: 0.5,
  /** Supplement forfaitaire par trajet en DROM. */
  supplementDrom: 3.0,
} as const;

/** Grille officielle des taux kilometriques par departement (euros / km). */
export const TAUX_KM_PAR_DEPARTEMENT: Record<string, number> = {
  "01": 1.13, "02": 1.2, "2A": 1.27, "2B": 1.27, "03": 1.19, "04": 1.14,
  "05": 1.18, "06": 1.27, "07": 1.17, "08": 1.17, "09": 1.15, "10": 1.13,
  "11": 1.08, "12": 1.16, "13": 1.1, "14": 1.07, "15": 1.13, "16": 1.12,
  "17": 1.1, "18": 1.26, "19": 1.16, "21": 1.12, "22": 1.13, "23": 1.18,
  "24": 1.11, "25": 1.08, "26": 1.16, "27": 1.21, "28": 1.19, "29": 1.07,
  "30": 1.08, "31": 1.1, "32": 1.19, "33": 1.07, "34": 1.07, "35": 1.07,
  "36": 1.25, "37": 1.18, "38": 1.22, "39": 1.11, "40": 1.13, "41": 1.13,
  "42": 1.08, "43": 1.24, "44": 1.08, "45": 1.07, "46": 1.13, "47": 1.11,
  "48": 1.25, "49": 1.08, "50": 1.16, "51": 1.12, "52": 1.26, "53": 1.09,
  "54": 1.09, "55": 1.12, "56": 1.07, "57": 1.14, "58": 1.27, "59": 1.2,
  "60": 1.2, "61": 1.17, "62": 1.2, "63": 1.08, "64": 1.14, "65": 1.07,
  "66": 1.18, "67": 1.07, "68": 1.07, "69": 1.07, "70": 1.08, "71": 1.1,
  "72": 1.07, "73": 1.15, "74": 1.22, "75": 1.22, "76": 1.18, "77": 1.07,
  "78": 1.07, "79": 1.08, "80": 1.15, "81": 1.07, "82": 1.07, "83": 1.16,
  "84": 1.2, "85": 1.07, "86": 1.11, "87": 1.1, "88": 1.1, "89": 1.11,
  "90": 1.08, "91": 1.07, "92": 1.07, "93": 1.07, "94": 1.07, "95": 1.07,
  "971": 1.07, "972": 1.2, "973": 1.1, "974": 1.22, "976": 1.1,
};

/** Villes ouvrant droit au forfait grande ville. */
const VILLES_GRANDE_VILLE = [
  "marseille", "paris", "nice", "toulouse", "lyon", "strasbourg",
  "montpellier", "rennes", "bordeaux", "lille", "grenoble", "nantes",
];

/** Departements ouvrant droit au forfait grande ville (petite couronne). */
const DEPARTEMENTS_GRANDE_VILLE = new Set(["92", "93", "94"]);

function normaliserVille(v: string | null | undefined): string {
  return (v || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function estGrandeVille(
  villeDepart?: string | null,
  villeArrivee?: string | null,
  departementDepart?: string | null,
  departementArrivee?: string | null
): boolean {
  const vd = normaliserVille(villeDepart);
  const va = normaliserVille(villeArrivee);
  // Une grande ville peut apparaitre en fin de libelle ("13 rue X, 75011 Paris").
  const matchVille = (v: string) =>
    v.length > 0 && VILLES_GRANDE_VILLE.some((g) => v === g || v.endsWith(" " + g));
  if (matchVille(vd) || matchVille(va)) return true;
  if (departementDepart && DEPARTEMENTS_GRANDE_VILLE.has(departementDepart)) return true;
  if (departementArrivee && DEPARTEMENTS_GRANDE_VILLE.has(departementArrivee)) return true;
  return false;
}

/** Calcule la date de Paques (dimanche) pour une annee (algorithme de Meeus). */
function dimancheDePaques(annee: number): { mois: number; jour: number } {
  const a = annee % 19;
  const b = Math.floor(annee / 100);
  const c = annee % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mois = Math.floor((h + l - 7 * m + 114) / 31); // 3 = mars, 4 = avril
  const jour = ((h + l - 7 * m + 114) % 31) + 1;
  return { mois, jour };
}

/** Renvoie l'ensemble des jours feries francais (jour-mois) pour une annee. */
function joursFeriesFrance(annee: number): Set<string> {
  const cle = (mois: number, jour: number) => `${mois}-${jour}`;
  const feries = new Set<string>([
    cle(1, 1), // Jour de l'An
    cle(5, 1), // Fete du Travail
    cle(5, 8), // Victoire 1945
    cle(7, 14), // Fete nationale
    cle(8, 15), // Assomption
    cle(11, 1), // Toussaint
    cle(11, 11), // Armistice
    cle(12, 25), // Noel
  ]);
  const paques = dimancheDePaques(annee);
  const base = Date.UTC(annee, paques.mois - 1, paques.jour);
  const jour = 86400000;
  const ajoute = (offset: number) => {
    const d = new Date(base + offset * jour);
    feries.add(cle(d.getUTCMonth() + 1, d.getUTCDate()));
  };
  ajoute(1); // Lundi de Paques
  ajoute(39); // Ascension
  ajoute(50); // Lundi de Pentecote
  return feries;
}

type PartsParis = { annee: number; mois: number; jour: number; heure: number; jourSemaine: number };

/** Extrait les composantes locales (Europe/Paris) d'une date. */
function composantesParis(date: Date): PartsParis {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const annee = get("year");
  const mois = get("month");
  const jour = get("day");
  let heure = get("hour");
  if (heure === 24) heure = 0;
  const jourSemaine = new Date(Date.UTC(annee, mois - 1, jour)).getUTCDay(); // 0 = dimanche
  return { annee, mois, jour, heure, jourSemaine };
}

function dateValide(date: Date | null | undefined): date is Date {
  return !!date && !Number.isNaN(date.getTime());
}

/**
 * Plage nuit (20h-8h, Europe/Paris). Helper factorise, reutilise par les
 * estimateurs VSL / ambulance qui appliquent un taux nuit distinct.
 */
export function estNuit(date: Date | null | undefined): boolean {
  if (!dateValide(date)) return false;
  const { heure } = composantesParis(date);
  return heure >= 20 || heure < 8;
}

/**
 * Dimanche ou jour ferie (interpretation Europe/Paris). Ne tient pas compte de
 * l'heure : combiner avec estNuit pour les regles de non-cumul.
 */
export function estDimancheOuFerie(date: Date | null | undefined): boolean {
  if (!dateValide(date)) return false;
  const { annee, mois, jour, jourSemaine } = composantesParis(date);
  if (jourSemaine === 0) return true; // dimanche
  return joursFeriesFrance(annee).has(`${mois}-${jour}`); // ferie
}

/**
 * Samedi a partir de 12h (Europe/Paris) : le tarif dimanche/ferie s'applique
 * des le samedi apres-midi dans les conventions de transport sanitaire.
 */
export function estSamediApres12h(date: Date | null | undefined): boolean {
  if (!dateValide(date)) return false;
  const { heure, jourSemaine } = composantesParis(date);
  return jourSemaine === 6 && heure >= 12;
}

/**
 * Determine si une majoration nuit / week-end / jour ferie s'applique a la
 * date souhaitee (interpretation Europe/Paris) :
 *  - nuit : 20h-8h
 *  - samedi apres 12h
 *  - dimanche
 *  - jour ferie
 */
export function majorationNuitWeApplicable(date: Date | null | undefined): boolean {
  return estNuit(date) || estDimancheOuFerie(date) || estSamediApres12h(date);
}

export type EstimationCPAMInput = {
  /** Distance routiere estimee de la course, en km. */
  distanceKm: number;
  /** Departement de l'ADS (taux km applique). */
  departementCible: string;
  villeDepart?: string | null;
  villeArrivee?: string | null;
  departementDepart?: string | null;
  departementArrivee?: string | null;
  /** Date souhaitee (ISO ou Date) pour la majoration nuit/WE/ferie. */
  dateSouhaitee?: string | Date | null;
  allerRetour?: boolean;
};

export type EstimationCPAMDetails = {
  forfait: number;
  kmFactures: number;
  tauxKm: number;
  montantKm: number;
  forfaitGrandeVille: number;
  supplementDrom: number;
  majorationNuitWe: number;
  majorationNuitWeAppliquee: boolean;
  allerRetour: boolean;
};

export type EstimationCPAM = {
  total: number;
  details: EstimationCPAMDetails;
};

function arrondi2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Estime le prix conventionnel CPAM d'une course. Renvoie null si la distance
 * ou le taux km departemental sont indisponibles (pas d'estimation trompeuse).
 */
export function estimerPrixCPAM(input: EstimationCPAMInput): EstimationCPAM | null {
  const { distanceKm, departementCible } = input;
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return null;
  const tauxKm = TAUX_KM_PAR_DEPARTEMENT[departementCible];
  if (typeof tauxKm !== "number") return null;

  const forfait = REGLES_CPAM.forfaitPriseEnCharge;
  const kmFactures = Math.max(0, distanceKm - REGLES_CPAM.kmInclus);
  const montantKm = kmFactures * tauxKm;
  const forfaitGrandeVille = estGrandeVille(
    input.villeDepart,
    input.villeArrivee,
    input.departementDepart,
    input.departementArrivee
  )
    ? REGLES_CPAM.forfaitGrandeVille
    : 0;

  // Socle sur lequel s'applique la majoration nuit/WE/ferie.
  const socle = forfait + forfaitGrandeVille + montantKm;
  const dateObj =
    input.dateSouhaitee instanceof Date
      ? input.dateSouhaitee
      : input.dateSouhaitee
        ? new Date(input.dateSouhaitee)
        : null;
  const majorationAppliquee = majorationNuitWeApplicable(dateObj);
  const majorationNuitWe = majorationAppliquee ? socle * REGLES_CPAM.tauxMajorationNuitWe : 0;

  const supplementDrom = estDROM(departementCible) ? REGLES_CPAM.supplementDrom : 0;

  // Total d'un trajet, puis x2 si aller-retour.
  const totalTrajet = socle + majorationNuitWe + supplementDrom;
  const allerRetour = !!input.allerRetour;
  const total = arrondi2(allerRetour ? totalTrajet * 2 : totalTrajet);

  return {
    total,
    details: {
      forfait,
      kmFactures: Math.round(kmFactures * 10) / 10,
      tauxKm,
      montantKm: arrondi2(montantKm),
      forfaitGrandeVille,
      supplementDrom,
      majorationNuitWe: arrondi2(majorationNuitWe),
      majorationNuitWeAppliquee: majorationAppliquee,
      allerRetour,
    },
  };
}
