/**
 * Matcher mots-cles + scoring de pertinence des candidats veille.
 * Le matching est tolerant aux accents (NFD).
 */

import type { RawCandidate } from "./sources/types";

export const VEILLE_KEYWORDS: Array<{
  kw: string;
  weight: number;
  tag?: string;
}> = [
  // High-value (poids 10)
  { kw: "transport sanitaire", weight: 10 },
  { kw: "taxi conventionné", weight: 10 },
  { kw: "taxi-conventionné", weight: 10 },
  { kw: "ambulance", weight: 8 },
  { kw: "véhicule sanitaire léger", weight: 10 },
  { kw: "VSL", weight: 8 },
  { kw: "SEFi", weight: 10 },
  { kw: "service électronique de facturation", weight: 10 },
  // Médium (poids 4-8)
  { kw: "transport partagé", weight: 6 },
  { kw: "convention nationale taxi", weight: 8 },
  { kw: "ATSU", weight: 6 },
  { kw: "transport médical", weight: 6 },
  { kw: "CPAM", weight: 4 },
  { kw: "assurance maladie", weight: 3 },
  // Contexte (poids 2-5)
  { kw: "transport prescrit", weight: 5 },
  { kw: "hémodialyse", weight: 4 },
  { kw: "transport bariatrique", weight: 4 },
  { kw: "dialyse", weight: 3 },
];

export const MIN_RELEVANCE_SCORE = 6;

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function matchCandidate(candidate: RawCandidate): {
  score: number;
  matched: string[];
} {
  const text = `${candidate.title} ${candidate.summary ?? ""}`;
  const haystack = normalize(text);

  const matched: string[] = [];
  let score = 0;
  for (const { kw, weight } of VEILLE_KEYWORDS) {
    if (haystack.includes(normalize(kw))) {
      matched.push(kw);
      score += weight;
    }
  }
  return { score, matched };
}

export function isRelevant(candidate: RawCandidate): boolean {
  return matchCandidate(candidate).score >= MIN_RELEVANCE_SCORE;
}
