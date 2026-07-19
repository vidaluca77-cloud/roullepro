/**
 * Helpers purs (sans I/O) pour enrichir les pages
 * /transport-medical/[ville]/[categorie] : bloc tarifs departemental, FAQ locale
 * generee, selection d'etablissements desservis et maillage "autres villes".
 *
 * REGLE ABSOLUE : aucun chiffre tarifaire n'est ecrit en dur ici. Les montants
 * proviennent exclusivement de tarif-cpam.ts (taxi conventionne, grille
 * prefectorale departementale) et de tarif-transport-sanitaire.ts (VSL /
 * ambulance, convention nationale avenant 11). Ces modules restent la seule
 * source de verite, comme pour les simulateurs.
 *
 * Zero dependance runtime : testable en isolation.
 */

import type { CategorieSanitaire } from "./sanitaire-data";
import {
  REGLES_CPAM,
  TAUX_KM_PAR_DEPARTEMENT,
  MENTION_ESTIMATION_CPAM,
} from "./tarif-cpam";
import {
  REGLES_VSL,
  REGLES_AMBULANCE,
  MENTION_ESTIMATION_TRANSPORT_SANITAIRE,
} from "./tarif-transport-sanitaire";

/** Metadonnees d'affichage par categorie (libelles francais naturels). */
const CAT_META: Record<
  CategorieSanitaire,
  { singulier: string; article: string; deArticle: string }
> = {
  ambulance: { singulier: "ambulance", article: "une ambulance", deArticle: "d'une ambulance" },
  vsl: { singulier: "VSL", article: "un VSL", deArticle: "d'un VSL" },
  taxi_conventionne: {
    singulier: "taxi conventionné",
    article: "un taxi conventionné",
    deArticle: "d'un taxi conventionné",
  },
};

/** Route du simulateur / de la page tarif correspondante. */
const SIMULATEUR_PAR_CATEGORIE: Record<CategorieSanitaire, { href: string; label: string }> = {
  taxi_conventionne: {
    href: "/simulateur-taxi-conventionne",
    label: "Estimer le prix d'une course en taxi conventionné",
  },
  vsl: { href: "/tarif-vsl", label: "Estimer le prix d'une course en VSL" },
  ambulance: { href: "/tarif-ambulance", label: "Estimer le prix d'un transport en ambulance" },
};

function euros(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function eurosKm(n: number): string {
  return euros(n) + "/km";
}

function pourcent(taux: number): string {
  return "+" + Math.round(taux * 100) + " %";
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export type TarifLigne = { label: string; valeur: string };

export type TarifBlock = {
  titre: string;
  intro: string;
  lignes: TarifLigne[];
  mention: string;
  simulateur: { href: string; label: string };
};

/**
 * Construit le bloc "Tarifs [categorie] dans le departement". Toutes les valeurs
 * sont derivees des constantes des librairies tarifaires. Renvoie null si, pour
 * un taxi conventionne, le taux kilometrique departemental est indisponible
 * (pas d'affichage tarifaire trompeur).
 */
export function buildTarifBlock(
  categorieKey: CategorieSanitaire,
  depCode: string,
  depNom: string
): TarifBlock | null {
  const meta = CAT_META[categorieKey];
  const simulateur = SIMULATEUR_PAR_CATEGORIE[categorieKey];
  const zone = `le département ${depNom} (${depCode})`;

  if (categorieKey === "taxi_conventionne") {
    const tauxKm = TAUX_KM_PAR_DEPARTEMENT[depCode];
    if (typeof tauxKm !== "number") return null;
    return {
      titre: `Tarifs taxi conventionné dans le département ${depNom} (${depCode})`,
      intro: `Le tarif d'un taxi conventionné est fixé par la convention CPAM. Le tarif kilométrique est propre à ${zone} ; le forfait de prise en charge et les majorations sont nationaux.`,
      lignes: [
        {
          label: `Prise en charge (${REGLES_CPAM.kmInclus} premiers km inclus)`,
          valeur: euros(REGLES_CPAM.forfaitPriseEnCharge),
        },
        {
          label: `Tarif kilométrique (au-delà du ${REGLES_CPAM.kmInclus}e km)`,
          valeur: eurosKm(tauxKm),
        },
        { label: "Forfait grande ville (le cas échéant)", valeur: euros(REGLES_CPAM.forfaitGrandeVille) },
        {
          label: "Majoration nuit, dimanche et jour férié",
          valeur: pourcent(REGLES_CPAM.tauxMajorationNuitWe),
        },
      ],
      mention: MENTION_ESTIMATION_CPAM,
      simulateur,
    };
  }

  const regles = categorieKey === "vsl" ? REGLES_VSL : REGLES_AMBULANCE;
  return {
    titre: `Tarifs ${meta.singulier} dans le département ${depNom} (${depCode})`,
    intro: `Le tarif ${meta.deArticle} suit la convention nationale des transporteurs sanitaires (avenant 11). Un forfait départemental et un tarif kilométrique national s'appliquent, majorés la nuit, le dimanche et les jours fériés.`,
    lignes: [
      { label: "Forfait départemental (3 premiers km inclus)", valeur: euros(regles.forfait) },
      { label: "Tarif kilométrique (au-delà du 3e km)", valeur: eurosKm(regles.tauxKm) },
      { label: "Majoration nuit (20h-8h)", valeur: pourcent(regles.tauxNuit) },
      { label: "Majoration dimanche et jour férié", valeur: pourcent(regles.tauxDimanche) },
    ],
    mention: MENTION_ESTIMATION_TRANSPORT_SANITAIRE,
    simulateur,
  };
}

export type FaqItem = { question: string; answer: string };

/**
 * FAQ locale generee (4-5 questions) avec variables ville / departement /
 * categorie. Phrasage naturel, sans bourrage de mots-cles ; les reponses
 * n'ecrivent aucun montant en dur (renvoi vers le bloc tarifs / le simulateur).
 */
export function buildLocalFaq(
  nomVille: string,
  depNom: string,
  categorieKey: CategorieSanitaire
): FaqItem[] {
  const meta = CAT_META[categorieKey];
  const sing = meta.singulier;
  const art = meta.article;

  const faq: FaqItem[] = [
    {
      question: `Le transport en ${sing} à ${nomVille} est-il remboursé par l'Assurance Maladie ?`,
      answer: `Oui. Sur prescription médicale, le transport en ${sing} à ${nomVille} est pris en charge par l'Assurance Maladie : 100 % en cas d'affection de longue durée (ALD) ou d'hospitalisation, et une prise en charge partielle dans les autres cas. La plupart des professionnels pratiquent le tiers payant, sans avance de frais.`,
    },
    {
      question: `Comment obtenir un bon de transport pour ${art} à ${nomVille} ?`,
      answer: `Le bon de transport (prescription médicale de transport) est établi par votre médecin traitant ou par le médecin hospitalier avant le déplacement. Il indique le mode de transport prescrit et conditionne le remboursement par la CPAM. Présentez-le au professionnel avec votre carte Vitale.`,
    },
  ];

  if (categorieKey === "ambulance") {
    faq.push({
      question: `Dans quels cas faut-il une ambulance plutôt qu'un VSL à ${nomVille} ?`,
      answer: `L'ambulance est prescrite lorsque l'état du patient impose un transport allongé, une surveillance médicale ou la présence d'un équipage diplômé. Pour un patient autonome transporté en position assise, le médecin oriente plutôt vers un VSL ou un taxi conventionné.`,
    });
  } else {
    faq.push({
      question: `Peut-on réserver ${art} à ${nomVille} pour des séances régulières (dialyse, chimiothérapie) ?`,
      answer: `Oui. ${cap(art)} est adapté aux trajets itératifs vers les centres de dialyse ou les séances de chimiothérapie autour de ${nomVille}. Réalisés sur prescription, ces transports réguliers sont généralement pris en charge à 100 % au titre de l'ALD.`,
    });
  }

  faq.push(
    {
      question: `Comment réserver ${art} à ${nomVille} ?`,
      answer: `Contactez directement l'un des professionnels référencés sur cette page : chaque fiche affiche le téléphone et les disponibilités. Pour un transport programmé (hospitalisation, consultation), réservez si possible 48 h à l'avance ; en cas d'urgence vitale, composez le 15.`,
    },
    {
      question: `Quels sont les tarifs ${meta.deArticle} ${depNom ? `dans le département ${depNom}` : `à ${nomVille}`} ?`,
      answer: `Les tarifs sont fixés par la réglementation conventionnelle et ne varient pas d'un professionnel à l'autre. Consultez le détail dans la section « Tarifs » de cette page, ou estimez le coût de votre trajet avec notre simulateur.`,
    }
  );

  return faq;
}

/** Ligne minimale d'etablissement remontee de la BDD (select restreint). */
export type EtabRow = {
  id: string;
  slug: string;
  raison_sociale: string;
  nom_court: string | null;
  nom_affichage: string | null;
  categorie_simple: string | null;
};

export type SelectionEtablissements = {
  scope: "ville" | "departement";
  rows: EtabRow[];
};

/**
 * Selectionne jusqu'a `max` etablissements a afficher : ceux de la ville en
 * priorite, complétés par ceux du departement si la ville en compte moins de 3.
 * Dedoublonne par id. Renvoie une liste vide si aucune donnee (le composant
 * n'affiche alors pas la section).
 */
export function selectEtablissementsAffichage(
  villeRows: EtabRow[],
  deptRows: EtabRow[],
  max = 6
): SelectionEtablissements {
  if (villeRows.length >= 3) {
    return { scope: "ville", rows: villeRows.slice(0, max) };
  }
  const vus = new Set(villeRows.map((r) => r.id));
  const fusion: EtabRow[] = [...villeRows];
  for (const r of deptRows) {
    if (fusion.length >= max) break;
    if (!vus.has(r.id)) {
      fusion.push(r);
      vus.add(r.id);
    }
  }
  const scope: "ville" | "departement" = fusion.length > villeRows.length ? "departement" : "ville";
  return { scope, rows: fusion.slice(0, max) };
}

export type VilleMaillage = { nom: string; slug: string; count: number };

/**
 * Regroupe les pros d'un departement par ville pour le bloc "Autres villes du
 * departement". Exclut la ville courante, trie par nombre de pros decroissant
 * puis alphabetiquement, et limite a `max` villes.
 */
export function topVillesDepartement(
  rows: { ville: string; ville_slug: string }[],
  villeSlugCourant: string,
  max = 8
): VilleMaillage[] {
  const parVille = new Map<string, VilleMaillage>();
  for (const r of rows) {
    if (!r.ville_slug || r.ville_slug === villeSlugCourant) continue;
    const existant = parVille.get(r.ville_slug);
    if (existant) existant.count += 1;
    else parVille.set(r.ville_slug, { nom: r.ville, slug: r.ville_slug, count: 1 });
  }
  return Array.from(parVille.values())
    .sort((a, b) => b.count - a.count || a.nom.localeCompare(b.nom, "fr"))
    .slice(0, max);
}
