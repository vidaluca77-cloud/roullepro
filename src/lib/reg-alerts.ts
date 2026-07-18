/**
 * Helpers pour le module Veille Reglementaire (reg_alerts).
 * Lecture publique uniquement (RLS Supabase : status = 'published').
 */

import { createClient } from "@supabase/supabase-js";

export type RegUrgency = "critical" | "high" | "medium" | "info";

export type RegSource = { label: string; url: string };
export type RegKeyNumber = { label: string; value: string };

export type RegAlert = {
  id: string;
  slug: string;
  title_short: string;
  title_long: string;
  summary_oneliner: string;
  metiers: string[];
  activites: string[];
  regions: string[];
  urgency: RegUrgency;
  applicable_from: string | null;
  deadline: string | null;
  what_changes: string;
  who_is_concerned: string;
  concrete_actions: string[];
  key_numbers: RegKeyNumber[];
  sources: RegSource[];
  disclaimer: string | null;
  status: string;
  published_at: string | null;
  last_content_update: string | null;
  created_at: string;
  updated_at: string;
};

export type RegMetier = { code: string; label: string; description: string | null };

export const METIER_OPTIONS: { code: string; label: string }[] = [
  { code: "ambulance", label: "Ambulance" },
  { code: "vsl", label: "VSL" },
  { code: "taxi_conventionne", label: "Taxi conventionné" },
];

export const URGENCY_OPTIONS: { code: RegUrgency; label: string }[] = [
  { code: "critical", label: "Critique" },
  { code: "high", label: "Élevée" },
  { code: "medium", label: "Moyenne" },
  { code: "info", label: "Info" },
];

export const URGENCY_ORDER: Record<RegUrgency, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  info: 3,
};

export const URGENCY_CLASSES: Record<RegUrgency, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
};

export const URGENCY_LABEL: Record<RegUrgency, string> = {
  critical: "Critique",
  high: "Urgence élevée",
  medium: "Importance moyenne",
  info: "Information",
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function normalizeArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return [];
}

function normalizeAlert(row: Record<string, unknown>): RegAlert {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title_short: (row.title_short as string) ?? "",
    title_long: (row.title_long as string) ?? "",
    summary_oneliner: (row.summary_oneliner as string) ?? "",
    metiers: normalizeArray<string>(row.metiers),
    activites: normalizeArray<string>(row.activites),
    regions: normalizeArray<string>(row.regions),
    urgency: (row.urgency as RegUrgency) ?? "info",
    applicable_from: (row.applicable_from as string) ?? null,
    deadline: (row.deadline as string) ?? null,
    what_changes: (row.what_changes as string) ?? "",
    who_is_concerned: (row.who_is_concerned as string) ?? "",
    concrete_actions: normalizeArray<string>(row.concrete_actions),
    key_numbers: normalizeArray<RegKeyNumber>(row.key_numbers),
    sources: normalizeArray<RegSource>(row.sources),
    disclaimer: (row.disclaimer as string) ?? null,
    status: (row.status as string) ?? "draft",
    published_at: (row.published_at as string) ?? null,
    last_content_update: (row.last_content_update as string) ?? null,
    created_at: (row.created_at as string) ?? "",
    updated_at: (row.updated_at as string) ?? "",
  };
}

export async function listPublishedAlerts(filters?: {
  metier?: string;
  urgency?: RegUrgency;
}): Promise<RegAlert[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  let query = supabase
    .from("reg_alerts")
    .select("*")
    .eq("status", "published");

  if (filters?.metier) {
    query = query.contains("metiers", [filters.metier]);
  }
  if (filters?.urgency) {
    query = query.eq("urgency", filters.urgency);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const alerts = (data as Record<string, unknown>[]).map(normalizeAlert);
  alerts.sort((a, b) => {
    const u = URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency];
    if (u !== 0) return u;
    const da = a.applicable_from ? Date.parse(a.applicable_from) : 0;
    const db = b.applicable_from ? Date.parse(b.applicable_from) : 0;
    return db - da;
  });
  return alerts;
}

export async function getAlertBySlug(slug: string): Promise<RegAlert | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("reg_alerts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return normalizeAlert(data as Record<string, unknown>);
}

/**
 * Lecture admin : recupere une alerte par slug SANS filtre status.
 * A n'utiliser qu'apres verification admin cote serveur. Utilise un client
 * service_role pour contourner la RLS (qui filtre status=published).
 */
export async function getAlertBySlugForAdmin(slug: string): Promise<RegAlert | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await admin
    .from("reg_alerts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return normalizeAlert(data as Record<string, unknown>);
}

export async function listAllPublishedSlugs(): Promise<{ slug: string; updated_at: string | null }[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("reg_alerts")
    .select("slug, updated_at")
    .eq("status", "published");
  if (!data) return [];
  return (data as { slug: string; updated_at: string | null }[]).filter((r) => r.slug);
}

export async function getMetiers(): Promise<RegMetier[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("reg_metiers").select("code, label, description");
  if (!data) return [];
  return data as RegMetier[];
}

export function metierLabel(code: string): string {
  const found = METIER_OPTIONS.find((m) => m.code === code);
  return found ? found.label : code;
}

export function formatFrDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  });
}

export function formatApplicableFrom(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const formatted = formatFrDate(iso);
  if (d.getTime() <= now.getTime()) {
    return `Applicable depuis le ${formatted}`;
  }
  return `Applicable à partir du ${formatted}`;
}
