/**
 * Matcher mots-cles + scoring de pertinence des candidats veille.
 *
 * Strategie de scoring :
 *  - Chaque mot-cle a un poids brut (entre 2 et 10).
 *  - Bonus +5 si le mot-cle apparait dans le titre (pas juste dans le summary).
 *  - Bonus +3 si une combinaison transport + (sanitaire|medical|cpam|maladie)
 *    est presente dans le texte.
 *  - Anti-bruit : si seul un mot-cle contextuel faible (poids <= 3) matche
 *    (ex : "CPAM" ou "ARS" seul), on force le score a 0. Ces termes seuls
 *    sont trop generiques pour declencher la veille.
 *
 * Le matching est tolerant aux accents (NFD).
 */

import type { RawCandidate } from "./sources/types";

export const VEILLE_KEYWORDS: Array<{
  kw: string;
  weight: number;
  tag?: string;
}> = [
  // High-value transport sanitaire (poids 8-10)
  { kw: "transport sanitaire", weight: 10 },
  { kw: "taxi conventionné", weight: 10 },
  { kw: "taxi-conventionné", weight: 10 },
  { kw: "véhicule sanitaire léger", weight: 10 },
  { kw: "ambulance", weight: 8 },
  { kw: "VSL", weight: 8 },
  { kw: "SEFi", weight: 10 },
  { kw: "service électronique de facturation", weight: 10 },
  { kw: "agrément transport sanitaire", weight: 10 },

  // Reglementation transport medical (poids 5-7)
  { kw: "transport partagé", weight: 6 },
  { kw: "convention nationale taxi", weight: 8 },
  { kw: "ATSU", weight: 6 },
  { kw: "transport médical", weight: 6 },
  { kw: "transport de patient", weight: 6 },
  { kw: "transport de malade", weight: 6 },
  { kw: "garde ambulancière", weight: 7 },
  { kw: "garde départementale", weight: 5 },
  { kw: "auxiliaire ambulancier", weight: 6 },
  { kw: "DEA", weight: 3 },

  // CPAM / facturation / tarification (poids 4-9)
  { kw: "tarification transport", weight: 8 },
  { kw: "remboursement transport", weight: 7 },
  { kw: "prescription médicale de transport", weight: 9 },
  { kw: "PMT", weight: 4 },
  { kw: "tiers payant", weight: 4 },
  { kw: "facturation électronique", weight: 5 },
  { kw: "feuille de soins", weight: 4 },
  { kw: "CPAM", weight: 4 },
  { kw: "assurance maladie", weight: 3 },

  // Cadres reglementaires (poids 2-3)
  { kw: "code de la santé publique", weight: 3 },
  { kw: "ARS", weight: 2 },
  { kw: "agence régionale de santé", weight: 2 },
  { kw: "véhicule de transport", weight: 3 },

  // Conventions tarifaires (poids 4-5)
  { kw: "convention médicale", weight: 4 },
  { kw: "avenant tarifaire", weight: 5 },
  { kw: "tarif conventionnel", weight: 5 },

  // Filiere taxi (poids 3-6)
  { kw: "loi LOTI", weight: 4 },
  { kw: "carte professionnelle taxi", weight: 6 },
  { kw: "ADS", weight: 3 },
  { kw: "stationnement taxi", weight: 4 },

  // Contexte hospitalier connexe (poids 2-5)
  { kw: "transport prescrit", weight: 5 },
  { kw: "hémodialyse", weight: 4 },
  { kw: "transport bariatrique", weight: 4 },
  { kw: "dialyse", weight: 3 },
  { kw: "sortie d'hospitalisation", weight: 4 },
  { kw: "soins de suite", weight: 3 },
  { kw: "consultation externe", weight: 2 },
];

export const MIN_RELEVANCE_SCORE = 6;

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

const TRANSPORT_RE = /transport/;
const MEDICAL_RE = /(sanitaire|medical|cpam|maladie|ambulan|vsl|taxi)/;

export function matchCandidate(candidate: RawCandidate): {
  score: number;
  matched: string[];
} {
  const titleNorm = normalize(candidate.title || "");
  const summaryNorm = normalize(candidate.summary || "");
  const haystack = `${titleNorm} ${summaryNorm}`;

  const matched: string[] = [];
  let score = 0;
  let hasStrongKeyword = false;
  let hasTransport = false;
  let hasMedical = false;

  for (const { kw, weight } of VEILLE_KEYWORDS) {
    const kwNorm = normalize(kw);
    if (!haystack.includes(kwNorm)) continue;
    matched.push(kw);
    let w = weight;
    // Bonus titre (le mot-cle est presque toujours plus pertinent dans le titre).
    if (titleNorm.includes(kwNorm)) w += 5;
    score += w;
    if (weight >= 6) hasStrongKeyword = true;
    if (TRANSPORT_RE.test(kwNorm)) hasTransport = true;
    if (MEDICAL_RE.test(kwNorm)) hasMedical = true;
  }

  // Bonus combinaison transport + medical/sanitaire.
  if (hasTransport && hasMedical) score += 3;

  // Anti-bruit : que des mots-cles contextuels faibles → score 0.
  if (!hasStrongKeyword) score = 0;

  return { score, matched };
}

export function isRelevant(candidate: RawCandidate): boolean {
  return matchCandidate(candidate).score >= MIN_RELEVANCE_SCORE;
}
