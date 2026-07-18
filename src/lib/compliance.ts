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

// =============================================================
// Phase 4 : score conformité + checklists + deadlines
// =============================================================

export type ChecklistProgress = { checked: number; total: number };
export type ProgressByAlert = Map<string, ChecklistProgress>;

export type DeadlineRow = {
  id: string;
  alert_id: string;
  label: string;
  description: string | null;
  due_date: string;
  kind: "echeance" | "application" | "transition" | "rappel" | string;
  position: number | null;
};

export type DeadlineWithAlert = DeadlineRow & {
  alert: {
    slug: string;
    title_short: string;
    urgency: string;
  };
  status: "past" | "soon" | "future";
};

export type ChecklistItem = {
  id: string;
  alert_id: string;
  item_key: string;
  label: string;
  description: string | null;
  position: number | null;
  recommended: boolean | null;
};

export type ChecklistItemWithProgress = ChecklistItem & {
  checked: boolean;
  note: string | null;
  checked_at: string | null;
};

const URGENCY_WEIGHT: Record<string, number> = {
  critical: 40,
  high: 30,
  medium: 15,
  low: 5,
  info: 5,
};

function urgencyWeight(u: string | null | undefined): number {
  if (!u) return 5;
  return URGENCY_WEIGHT[u] ?? 5;
}

/**
 * Calcule le score de conformite 0-100.
 *  - Base : 100
 *  - Pour chaque alerte pertinente :
 *      penalite = poids(urgency) * (1 - couverture_checklist)
 *      (si pas de checklist, couverture = 0 et pleine penalite)
 *  - Bonus SEFi : +10 (plafonne a 100)
 */
export function computeComplianceScore(
  profile: Pick<ComplianceProfile, "metiers" | "activites" | "sefi_certified">,
  relevantAlerts: { id: string; urgency: string }[],
  progress: ProgressByAlert
): number {
  let penalty = 0;
  for (const a of relevantAlerts) {
    const p = progress.get(a.id);
    const coverage = p && p.total > 0 ? p.checked / p.total : 0;
    const weight = urgencyWeight(a.urgency);
    penalty += weight * (1 - coverage);
  }
  const bonus = profile.sefi_certified ? 10 : 0;
  const raw = 100 - penalty + bonus;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function scoreBand(score: number): {
  label: string;
  bg: string;
  fg: string;
  border: string;
} {
  if (score >= 80) {
    return {
      label: "Bon",
      bg: "bg-green-100",
      fg: "text-green-800",
      border: "border-green-200",
    };
  }
  if (score >= 50) {
    return {
      label: "À améliorer",
      bg: "bg-orange-100",
      fg: "text-orange-800",
      border: "border-orange-200",
    };
  }
  return {
    label: "Attention",
    bg: "bg-red-100",
    fg: "text-red-800",
    border: "border-red-200",
  };
}

/**
 * Retourne la progression checklist par alerte pour un pro donne.
 * Joint pro_checklist_progress (cochés par cet user) avec reg_alert_checklists (total par alerte).
 */
export async function getProgressByAlert(
  supabase: SupabaseClient,
  proId: string
): Promise<ProgressByAlert> {
  const map: ProgressByAlert = new Map();

  const { data: totals } = await supabase
    .from("reg_alert_checklists")
    .select("alert_id");

  if (totals) {
    for (const row of totals as { alert_id: string }[]) {
      const cur = map.get(row.alert_id) || { checked: 0, total: 0 };
      cur.total += 1;
      map.set(row.alert_id, cur);
    }
  }

  const { data: checked } = await supabase
    .from("pro_checklist_progress")
    .select("alert_id, checked")
    .eq("pro_id", proId)
    .eq("checked", true);

  if (checked) {
    for (const row of checked as { alert_id: string }[]) {
      const cur = map.get(row.alert_id) || { checked: 0, total: 0 };
      cur.checked += 1;
      map.set(row.alert_id, cur);
    }
  }

  return map;
}

/**
 * Retourne les deadlines pour les alertes pertinentes du profil,
 * triees par due_date asc, avec status passe/proche/futur.
 */
export async function getUpcomingDeadlines(
  supabase: SupabaseClient,
  profile: ComplianceProfile,
  opts: { onlyFuture?: boolean } = {}
): Promise<DeadlineWithAlert[]> {
  const matched = await fetchMatchedAlerts(supabase, profile);
  if (matched.length === 0) return [];

  const alertIds = matched.map((a) => a.id);
  const alertById = new Map<string, { slug: string; title_short: string; urgency: string }>();
  for (const a of matched) {
    alertById.set(a.id, {
      slug: a.slug,
      title_short: a.title_short,
      urgency: a.urgency,
    });
  }

  const { data, error } = await supabase
    .from("reg_alert_deadlines")
    .select("id, alert_id, label, description, due_date, kind, position")
    .in("alert_id", alertIds)
    .order("due_date", { ascending: true });

  if (error || !data) return [];

  const now = Date.now();
  const ninety = 90 * 24 * 60 * 60 * 1000;

  const result: DeadlineWithAlert[] = [];
  for (const row of data as DeadlineRow[]) {
    const alert = alertById.get(row.alert_id);
    if (!alert) continue;
    const ts = row.due_date ? Date.parse(row.due_date) : 0;
    let status: "past" | "soon" | "future" = "future";
    if (ts < now) status = "past";
    else if (ts < now + ninety) status = "soon";
    if (opts.onlyFuture && status === "past") continue;
    result.push({ ...row, alert, status });
  }
  return result;
}

/**
 * Recalcule et persiste le score conformite + last_scored_at.
 * A appeler apres save profil et apres chaque toggle item checklist.
 * Best-effort : log mais ne throw pas si update echoue.
 */
export async function recomputeAndPersistScore(
  supabase: SupabaseClient,
  proId: string
): Promise<number | null> {
  const { data: profileRow } = await supabase
    .from("pro_compliance_profiles")
    .select("*")
    .eq("pro_id", proId)
    .maybeSingle();

  if (!profileRow) return null;
  const profile = profileRow as ComplianceProfile;

  const relevant = await fetchMatchedAlerts(supabase, profile);
  const progress = await getProgressByAlert(supabase, proId);

  const score = computeComplianceScore(
    profile,
    relevant.map((a) => ({ id: a.id, urgency: a.urgency })),
    progress
  );

  const { error } = await supabase
    .from("pro_compliance_profiles")
    .update({
      compliance_score: score,
      last_scored_at: new Date().toISOString(),
    })
    .eq("pro_id", proId);

  if (error) {
    console.warn("[compliance] persist score error:", error.message);
  }
  return score;
}

/**
 * Charge la checklist d'une alerte avec l'etat de progression du pro.
 */
export async function getChecklistForAlert(
  supabase: SupabaseClient,
  alertId: string,
  proId: string
): Promise<ChecklistItemWithProgress[]> {
  const { data: items } = await supabase
    .from("reg_alert_checklists")
    .select("id, alert_id, item_key, label, description, position, recommended")
    .eq("alert_id", alertId)
    .order("position", { ascending: true });

  if (!items) return [];

  const { data: progressRows } = await supabase
    .from("pro_checklist_progress")
    .select("item_key, checked, note, checked_at")
    .eq("pro_id", proId)
    .eq("alert_id", alertId);

  const byKey = new Map<
    string,
    { checked: boolean; note: string | null; checked_at: string | null }
  >();
  for (const row of (progressRows || []) as {
    item_key: string;
    checked: boolean;
    note: string | null;
    checked_at: string | null;
  }[]) {
    byKey.set(row.item_key, {
      checked: !!row.checked,
      note: row.note,
      checked_at: row.checked_at,
    });
  }

  return (items as ChecklistItem[]).map((it) => {
    const p = byKey.get(it.item_key);
    return {
      ...it,
      checked: p?.checked ?? false,
      note: p?.note ?? null,
      checked_at: p?.checked_at ?? null,
    };
  });
}

export function formatFrDateShort(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Paris",
  });
}

export const DEADLINE_KIND_LABEL: Record<string, string> = {
  echeance: "Échéance",
  application: "Application",
  transition: "Transition",
  rappel: "Rappel",
};
