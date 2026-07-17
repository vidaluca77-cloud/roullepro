/**
 * Estimateur de prix indicatif pour les VSL et ambulances selon la convention
 * nationale des transporteurs sanitaires prives (avenant 11).
 *
 * Sources : avenant n° 11 a la convention nationale des transporteurs sanitaires
 * (signe le 13/04/2023, arrete du 03/05/2023, JORF du 06/05/2023) ; grille
 * « tarif majore » (entreprises certifiees geolocalisation + SEFi) applicable
 * depuis le 01/01/2025, retenue ici car couvrant la quasi-totalite du parc.
 * Valeurs verifiees le 17/07/2026.
 *
 * IMPORTANT : ces conventions sont DISTINCTES de la grille CPAM des taxis
 * (cf. tarif-cpam.ts). L'estimation est INDICATIVE et ne vaut pas devis. Elle
 * ignore volontairement les elements inconnus a la demande (forfait
 * agglomeration / prise en charge IDF, TPMR, aeroport, peages, transport
 * partage). Zero dependance : importable cote front comme serveur.
 */

import {
  estNuit,
  estDimancheOuFerie,
  estSamediApres12h,
  estimerPrixCPAM,
  MENTION_ESTIMATION_CPAM,
  type EstimationCPAM,
} from "./tarif-cpam";

/** Mention obligatoire pour les estimations VSL / ambulance. */
export const MENTION_ESTIMATION_TRANSPORT_SANITAIRE =
  "Estimation indicative selon la convention nationale des transporteurs sanitaires (avenant 11, tarif majoré), ne vaut pas devis.";

/** Identifiant de convention trace dans prix_estime_details. */
export const CONVENTION_TRANSPORT_SANITAIRE = "transporteurs_sanitaires_avenant_11";
export const CONVENTION_TAXI = "cpam_taxi_arrete_29_07_2025";

/** Km inclus dans le forfait departemental VSL / ambulance (grille majoree). */
const KM_INCLUS = 3;

/** Regles VSL (tarif majore, avenant 11). */
export const REGLES_VSL = {
  /** Forfait departemental unique (3 premiers km inclus). */
  forfait: 15.75,
  /** Tarif kilometrique national a partir du 4e km. */
  tauxKm: 1.1,
  /** Majoration nuit (20h-8h) : +50 %. */
  tauxNuit: 0.5,
  /** Majoration dimanche / ferie (des samedi 12h) : +25 %. */
  tauxDimanche: 0.25,
} as const;

/** Regles ambulance (tarif majore, avenant 11). */
export const REGLES_AMBULANCE = {
  /** Forfait departemental national unique (3 premiers km inclus). */
  forfait: 57.39,
  /** Tarif kilometrique national a partir du 4e km. */
  tauxKm: 2.44,
  /** Majoration nuit (20h-8h) : +75 %. */
  tauxNuit: 0.75,
  /** Majoration dimanche / ferie (des samedi 12h) : +50 %. */
  tauxDimanche: 0.5,
} as const;

function arrondi2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Valorisation « trajets courts » VSL (ajoutee au total pour distance <= 18 km).
 * Montant unique jusqu'a 7 km, puis palier degressif par km jusqu'au 18e.
 */
function valorisationTrajetCourtVSL(distanceKm: number): number {
  if (distanceKm <= 7) return 8.54;
  if (distanceKm <= 8) return 7.68;
  if (distanceKm <= 9) return 7.03;
  if (distanceKm <= 10) return 6.35;
  if (distanceKm <= 11) return 5.22;
  if (distanceKm <= 12) return 4.62;
  if (distanceKm <= 13) return 4.01;
  if (distanceKm <= 14) return 3.41;
  if (distanceKm <= 15) return 2.8;
  if (distanceKm <= 16) return 2.07;
  if (distanceKm <= 17) return 1.5;
  if (distanceKm <= 18) return 0.91;
  return 0;
}

/**
 * Valorisation « trajets courts » ambulance (ajoutee au total pour distance
 * <= 19 km).
 */
function valorisationTrajetCourtAmbulance(distanceKm: number): number {
  if (distanceKm <= 5) return 9.75;
  if (distanceKm <= 10) return 7.53;
  if (distanceKm <= 15) return 5.47;
  if (distanceKm <= 19) return 3.42;
  return 0;
}

/** Detail de la majoration nuit / dimanche appliquee (null si aucune). */
export type MajorationTransportSanitaire = {
  libelle: "nuit" | "dimanche_ferie";
  taux: number;
  montant: number;
};

export type EstimationTransportSanitaireDetails = {
  type: "vsl" | "ambulance";
  convention: string;
  forfait: number;
  kmFactures: number;
  tauxKm: number;
  montantKm: number;
  valorisationTrajetCourt: number;
  majoration: MajorationTransportSanitaire | null;
  majorationAppliquee: boolean;
  allerRetour: boolean;
};

export type EstimationTransportSanitaire = {
  total: number;
  details: EstimationTransportSanitaireDetails;
};

export type EstimationTransportSanitaireInput = {
  /** Distance routiere estimee de la course, en km. */
  distanceKm: number;
  /** Date souhaitee (ISO ou Date) pour la majoration nuit / dimanche / ferie. */
  dateSouhaitee?: string | Date | null;
  allerRetour?: boolean;
};

type ConfigTarif = {
  type: "vsl" | "ambulance";
  forfait: number;
  tauxKm: number;
  tauxNuit: number;
  tauxDimanche: number;
  valorisation: (distanceKm: number) => number;
};

function toDate(v: string | Date | null | undefined): Date | null {
  if (v instanceof Date) return v;
  if (!v) return null;
  return new Date(v);
}

/**
 * Coeur de calcul commun VSL / ambulance : forfait (3 km inclus) + km au-dela du
 * 3e + valorisation trajet court, l'ensemble majore le cas echeant (nuit OU
 * dimanche/ferie, non cumulables), puis x2 si aller-retour.
 */
function estimer(
  cfg: ConfigTarif,
  input: EstimationTransportSanitaireInput
): EstimationTransportSanitaire | null {
  const { distanceKm } = input;
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return null;

  const kmFactures = Math.max(0, distanceKm - KM_INCLUS);
  const montantKm = kmFactures * cfg.tauxKm;
  const valorisationTrajetCourt = cfg.valorisation(distanceKm);

  // Assiette majorable : forfait + km + valorisation courte distance.
  const assiette = cfg.forfait + montantKm + valorisationTrajetCourt;

  const dateObj = toDate(input.dateSouhaitee);
  // Non-cumul : la nuit prime sur le dimanche / ferie.
  let majoration: MajorationTransportSanitaire | null = null;
  if (estNuit(dateObj)) {
    majoration = { libelle: "nuit", taux: cfg.tauxNuit, montant: arrondi2(assiette * cfg.tauxNuit) };
  } else if (estDimancheOuFerie(dateObj) || estSamediApres12h(dateObj)) {
    majoration = {
      libelle: "dimanche_ferie",
      taux: cfg.tauxDimanche,
      montant: arrondi2(assiette * cfg.tauxDimanche),
    };
  }

  const totalTrajet = assiette + (majoration ? majoration.montant : 0);
  const allerRetour = !!input.allerRetour;
  const total = arrondi2(allerRetour ? totalTrajet * 2 : totalTrajet);

  return {
    total,
    details: {
      type: cfg.type,
      convention: CONVENTION_TRANSPORT_SANITAIRE,
      forfait: cfg.forfait,
      kmFactures: Math.round(kmFactures * 10) / 10,
      tauxKm: cfg.tauxKm,
      montantKm: arrondi2(montantKm),
      valorisationTrajetCourt,
      majoration,
      majorationAppliquee: majoration !== null,
      allerRetour,
    },
  };
}

/** Estime le prix indicatif d'une course VSL (convention avenant 11). */
export function estimerPrixVSL(
  input: EstimationTransportSanitaireInput
): EstimationTransportSanitaire | null {
  return estimer(
    {
      type: "vsl",
      forfait: REGLES_VSL.forfait,
      tauxKm: REGLES_VSL.tauxKm,
      tauxNuit: REGLES_VSL.tauxNuit,
      tauxDimanche: REGLES_VSL.tauxDimanche,
      valorisation: valorisationTrajetCourtVSL,
    },
    input
  );
}

/** Estime le prix indicatif d'une course ambulance (convention avenant 11). */
export function estimerPrixAmbulance(
  input: EstimationTransportSanitaireInput
): EstimationTransportSanitaire | null {
  return estimer(
    {
      type: "ambulance",
      forfait: REGLES_AMBULANCE.forfait,
      tauxKm: REGLES_AMBULANCE.tauxKm,
      tauxNuit: REGLES_AMBULANCE.tauxNuit,
      tauxDimanche: REGLES_AMBULANCE.tauxDimanche,
      valorisation: valorisationTrajetCourtAmbulance,
    },
    input
  );
}

/** Type de transport gere par l'aiguillage d'estimation. */
export type TypeTransportEstimation = "taxi" | "vsl" | "ambulance";

/** Details normalises stockes en base (jsonb) : trace toujours type + convention. */
export type DetailsCourse =
  | (EstimationCPAM["details"] & { type: "taxi"; convention: string })
  | EstimationTransportSanitaireDetails;

export type EstimationCourse = {
  total: number;
  details: DetailsCourse;
  /** Mention legale adaptee au type de transport. */
  mention: string;
};

export type EstimationCourseInput = {
  typeTransport: TypeTransportEstimation;
  distanceKm: number;
  /** Departement de l'ADS (requis pour le taux km taxi). */
  departementCible: string;
  villeDepart?: string | null;
  villeArrivee?: string | null;
  departementDepart?: string | null;
  departementArrivee?: string | null;
  dateSouhaitee?: string | Date | null;
  allerRetour?: boolean;
};

/**
 * Aiguillage unique : applique la convention correspondant au type de transport.
 * Taxi -> grille CPAM (inchangee) ; VSL / ambulance -> avenant 11. Renvoie null
 * si l'estimation n'est pas calculable (distance ou taux km indisponible).
 */
export function estimerPrixCourse(input: EstimationCourseInput): EstimationCourse | null {
  if (input.typeTransport === "vsl") {
    const est = estimerPrixVSL(input);
    if (!est) return null;
    return { total: est.total, details: est.details, mention: MENTION_ESTIMATION_TRANSPORT_SANITAIRE };
  }
  if (input.typeTransport === "ambulance") {
    const est = estimerPrixAmbulance(input);
    if (!est) return null;
    return { total: est.total, details: est.details, mention: MENTION_ESTIMATION_TRANSPORT_SANITAIRE };
  }
  // Taxi : convention CPAM inchangee.
  const est = estimerPrixCPAM(input);
  if (!est) return null;
  return {
    total: est.total,
    details: { ...est.details, type: "taxi", convention: CONVENTION_TAXI },
    mention: MENTION_ESTIMATION_CPAM,
  };
}
