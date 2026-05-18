/**
 * Helpers pour le module Conformite (Phase 3) :
 * - Profil de conformite par fiche pros_sanitaire (1 profil = 1 fiche revendiquee)
 * - Matching profil x reg_alerts pour afficher les alertes ciblees
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { RegAlert } from "@/lib/reg-alerts";

export const ACTIVITES_GROUPS: {
  group: string;
  items: { code: string; label: string }[];
}[] = [
  {
    group: "Types de transport",
    items: [
      { code: "transport_assis", label: "Transport assis" },
      { code: "transport_allonge", label: "Transport allongé" },
      { code: "longue_distance", label: "Longue distance" },
    ],
  },
  {
    group: "Spécialités médicales",
    items: [
      { code: "dialyse", label: "Dialyse" },
      { code: "chimiotherapie", label: "Chimiothérapie" },
      { code: "radiotherapie", label: "Radiothérapie" },
      { code: "soins_iteratifs", label: "Soins itératifs" },
      { code: "urgence", label: "Urgence" },
    ],
  },
  {
    group: "Contextes",
    items: [
      { code: "domicile_etablissement", label: "Domicile ↔ établissement" },
      { code: "etablissement_etablissement", label: "Établissement ↔ établissement" },
      { code: "ruralite", label: "Ruralité" },
      { code: "ile_de_france", label: "Île-de-France" },
    ],
  },
];

export const METIERS_OPTIONS: { code: string; label: string }[] = [
  { code: "ambulance", label: "Ambulance" },
  { code: "vsl", label: "VSL" },
  { code: "taxi_conventionne", label: "Taxi conventionné" },
];

export const REGIONS_FR: { code: string; label: string }[] = [
  { code: "ARA", label: "Auvergne-Rhône-Alpes" },
  { code: "BFC", label: "Bourgogne-Franche-Comté" },
  { code: "BRE", label: "Bretagne" },
  { code: "CVL", label: "Centre-Val de Loire" },
  { code: "COR", label: "Corse" },
  { code: "GES", label: "Grand Est" },
  { code: "HDF", label: "Hauts-de-France" },
  { code: "IDF", label: "Île-de-France" },
  { code: "NOR", label: "Normandie" },
  { code: "NAQ", label: "Nouvelle-Aquitaine" },
  { code: "OCC", label: "Occitanie" },
  { code: "PDL", label: "Pays de la Loire" },
  { code: "PAC", label: "Provence-Alpes-Côte d'Azur" },
  { code: "GUA", label: "Guadeloupe" },
  { code: "MTQ", label: "Martinique" },
  { code: "GUF", label: "Guyane" },
  { code: "REU", label: "La Réunion" },
  { code: "MYT", label: "Mayotte" },
];

export type ComplianceProfile = {
  id: string;
  pro_id: string;
  user_id: string;
  metiers: string[];
  activites: string[];
  region_code: string | null;
  fleet_size: number | null;
  sefi_certified: boolean | null;
  custom_tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export type AlertMatchInfo = {
  matchedMetiers: string[];
  matchedActivites: string[];
  matchedRegion: boolean;
};

export type MatchedAlert = RegAlert & { match: AlertMatchInfo };

function intersect<T>(a: T[] | null | undefined, b: T[] | null | undefined): T[] {
  if (!a || !b) return [];
  const set = new Set(b);
  return a.filter((x) => set.has(x));
}

/**
 * Recupere les alertes qui matchent le profil de conformite.
 * Logique :
 *   - metiers && profile.metiers (intersection non vide)
 *   - OU activites && profile.activites (si profil a des activites)
 *   - ET (alerte non regionalisee OU region_code de l'alerte contient celle du profil)
 */
export async function fetchMatchedAlerts(
  supabase: SupabaseClient,
  profile: ComplianceProfile
): Promise<MatchedAlert[]> {
  const { data, error } = await supabase
    .from("reg_alerts")
    .select("*")
    .eq("status", "published");

  if (error || !data) return [];

  const alerts = data as unknown as RegAlert[];
  const matched: MatchedAlert[] = [];

  for (const a of alerts) {
    const matchedMetiers = intersect(a.metiers, profile.metiers);
    const matchedActivites = profile.activites.length
      ? intersect(a.activites, profile.activites)
      : [];

    const hasOverlap = matchedMetiers.length > 0 || matchedActivites.length > 0;
    if (!hasOverlap) continue;

    const regions = Array.isArray(a.regions) ? a.regions : [];
    const matchedRegion =
      regions.length === 0 ||
      (!!profile.region_code && regions.includes(profile.region_code));

    if (!matchedRegion) continue;

    matched.push({
      ...a,
      match: { matchedMetiers, matchedActivites, matchedRegion },
    });
  }

  // Tri : urgence puis applicable_from desc.
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, info: 3 };
  matched.sort((x, y) => {
    const u = (order[x.urgency] ?? 99) - (order[y.urgency] ?? 99);
    if (u !== 0) return u;
    const dx = x.applicable_from ? Date.parse(x.applicable_from) : 0;
    const dy = y.applicable_from ? Date.parse(y.applicable_from) : 0;
    return dy - dx;
  });

  return matched;
}

export function metierLabel(code: string): string {
  return METIERS_OPTIONS.find((m) => m.code === code)?.label || code;
}

export function activiteLabel(code: string): string {
  for (const g of ACTIVITES_GROUPS) {
    const found = g.items.find((i) => i.code === code);
    if (found) return found.label;
  }
  return code;
}

export function regionLabel(code: string | null | undefined): string {
  if (!code) return "Non renseignée";
  return REGIONS_FR.find((r) => r.code === code)?.label || code;
}

export function isPaidPlan(plan: string | null | undefined): boolean {
  return (
    plan === "essential" || plan === "premium" || plan === "pro_plus" || plan === "pro"
  );
}

export function describeMatch(info: AlertMatchInfo): string {
  const parts: string[] = [];
  if (info.matchedMetiers.length > 0) {
    parts.push(
      `métier ${info.matchedMetiers.map(metierLabel).join(", ")}`
    );
  }
  if (info.matchedActivites.length > 0) {
    parts.push(
      `activité ${info.matchedActivites.map(activiteLabel).join(", ")}`
    );
  }
  if (parts.length === 0) return "Pertinent pour votre profil";
  return `Match : ${parts.join(" + ")}`;
}
