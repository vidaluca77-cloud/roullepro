import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import slugify from "slugify";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import PromoteForm from "../_components/PromoteForm";
import RunIngestButton from "../_components/RunIngestButton";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "lucas.horville@lvlia.net";
const PAGE_SIZE = 25;

type Candidate = {
  id: string;
  source: string;
  source_url: string;
  source_identifier: string | null;
  title: string;
  summary: string | null;
  publication_date: string | null;
  detected_at: string;
  keywords_matched: string[] | null;
  relevance_score: number | null;
  status: "pending" | "dismissed" | "promoted" | "duplicate";
  promoted_alert_id: string | null;
  dismissed_reason: string | null;
};

type IngestionRun = {
  id: string;
  source: string | null;
  started_at: string;
  finished_at: string | null;
  status: string | null;
  items_fetched: number | null;
  items_matched: number | null;
  items_inserted: number | null;
  items_duplicates: number | null;
  error_message: string | null;
  stats: Record<string, unknown> | null;
};

const STATUS_BADGE: Record<
  Candidate["status"],
  { label: string; cls: string }
> = {
  pending: {
    label: "En attente",
    cls: "bg-amber-100 text-amber-800 border-amber-200",
  },
  promoted: {
    label: "Promu",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  dismissed: {
    label: "Ignoré",
    cls: "bg-slate-100 text-slate-600 border-slate-200",
  },
  duplicate: {
    label: "Doublon",
    cls: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

function fmtDateOnly(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
}

async function ensureAdmin(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/admin/veille/candidats");
  }
  if (user.email !== ADMIN_EMAIL) {
    // Fallback : check profiles.role === 'admin' (pattern existant).
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || (profile as { role?: string }).role !== "admin") {
      redirect("/");
    }
  }
  return user.id;
}

// ============================================================
// Server actions
// ============================================================

async function runIngest(
  dryRun: boolean
): Promise<{ ok: boolean; result?: unknown; error?: string }> {
  "use server";
  await ensureAdmin();

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";
  const secret = process.env.CRON_SECRET;
  if (!secret) return { ok: false, error: "CRON_SECRET manquant" };

  const qs = dryRun ? "?dry_run=1" : "";
  try {
    const res = await fetch(`${appUrl}/api/cron/veille-ingest${qs}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: body?.error || `HTTP ${res.status}` };
    return { ok: true, result: body };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur réseau",
    };
  }
}

async function dismissCandidate(formData: FormData): Promise<void> {
  "use server";
  const userId = await ensureAdmin();
  const id = String(formData.get("id") || "");
  const reason = String(formData.get("reason") || "").slice(0, 200) || null;
  if (!id) return;
  const sb = getServiceSupabase();
  await sb
    .from("reg_alerts_candidates")
    .update({
      status: "dismissed",
      dismissed_at: new Date().toISOString(),
      dismissed_by: userId,
      dismissed_reason: reason,
    })
    .eq("id", id);
}

async function restoreCandidate(formData: FormData): Promise<void> {
  "use server";
  await ensureAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const sb = getServiceSupabase();
  await sb
    .from("reg_alerts_candidates")
    .update({
      status: "pending",
      dismissed_at: null,
      dismissed_by: null,
      dismissed_reason: null,
    })
    .eq("id", id);
}

function parseJsonArray(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr)
      ? (arr.filter((x) => typeof x === "string") as string[])
      : [];
  } catch {
    return [];
  }
}

async function promoteCandidate(
  formData: FormData
): Promise<{ ok: boolean; alertId?: string; error?: string }> {
  "use server";
  const userId = await ensureAdmin();
  if (!userId) return { ok: false, error: "Non authentifié" };

  const candidateId = String(formData.get("candidate_id") || "");
  if (!candidateId) return { ok: false, error: "candidate_id manquant" };

  const titleShort = String(formData.get("title_short") || "").trim();
  const titleLong = String(formData.get("title_long") || "").trim() || titleShort;
  const slugRaw = String(formData.get("slug") || "").trim();
  const summary = String(formData.get("summary_oneliner") || "").trim();
  const whatChanges = String(formData.get("what_changes") || "").trim();
  const whoConcerned = String(formData.get("who_is_concerned") || "").trim();
  const urgency = String(formData.get("urgency") || "medium");
  const metiers = parseJsonArray(formData.get("metiers"));
  const activites = parseJsonArray(formData.get("activites"));
  const regionsRaw = String(formData.get("regions") || "");
  const regions = regionsRaw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const applicableFrom = String(formData.get("applicable_from") || "") || null;
  const deadline = String(formData.get("deadline") || "") || null;
  const actionsText = String(formData.get("concrete_actions") || "");
  const concreteActions = actionsText
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const sourcesText = String(formData.get("sources_text") || "");
  const sources = sourcesText
    .split(/\r?\n/)
    .map((line) => {
      const [label, url] = line.split("|").map((s) => s.trim());
      if (!url) return null;
      return { label: label || url, url };
    })
    .filter((x): x is { label: string; url: string } => x !== null);

  if (!titleShort || !slugRaw) {
    return { ok: false, error: "Titre court et slug requis" };
  }

  const cleanSlug = slugify(slugRaw, { lower: true, strict: true });
  if (!cleanSlug) return { ok: false, error: "Slug invalide" };

  const sb = getServiceSupabase();

  const { data: created, error: insertError } = await sb
    .from("reg_alerts")
    .insert({
      slug: cleanSlug,
      title_short: titleShort.slice(0, 200),
      title_long: titleLong.slice(0, 500),
      summary_oneliner: summary.slice(0, 400),
      metiers,
      activites,
      regions,
      urgency,
      applicable_from: applicableFrom,
      deadline,
      what_changes: whatChanges,
      who_is_concerned: whoConcerned,
      concrete_actions: concreteActions,
      key_numbers: [],
      sources,
      status: "draft",
    })
    .select("id")
    .single();

  if (insertError || !created) {
    const msg = insertError?.message || "Insertion alerte échouée";
    return { ok: false, error: msg };
  }

  const alertId = (created as { id: string }).id;

  await sb
    .from("reg_alerts_candidates")
    .update({
      status: "promoted",
      promoted_alert_id: alertId,
      promoted_at: new Date().toISOString(),
      promoted_by: userId,
    })
    .eq("id", candidateId);

  return { ok: true, alertId };
}

// ============================================================
// Page
// ============================================================

type SearchParams = { status?: string; page?: string };

export default async function CandidatsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await ensureAdmin();
  const sp = await searchParams;
  const statusFilter = (sp.status as Candidate["status"] | undefined) ?? "pending";
  const page = Math.max(1, Number.parseInt(sp.page || "1", 10) || 1);

  const sb = getServiceSupabase();

  // Compteurs.
  const countsStatuses: Candidate["status"][] = [
    "pending",
    "promoted",
    "dismissed",
    "duplicate",
  ];
  const counts: Record<string, number> = {};
  for (const s of countsStatuses) {
    const { count } = await sb
      .from("reg_alerts_candidates")
      .select("id", { count: "exact", head: true })
      .eq("status", s);
    counts[s] = count ?? 0;
  }

  // Liste paginee.
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data: candidatesRows, count: totalCount } = await sb
    .from("reg_alerts_candidates")
    .select("*", { count: "exact" })
    .eq("status", statusFilter)
    .order("detected_at", { ascending: false })
    .range(from, to);

  const candidates = (candidatesRows || []) as Candidate[];
  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE));

  // Liens alertes promues (pour afficher slug).
  const promotedIds = candidates
    .filter((c) => c.status === "promoted" && c.promoted_alert_id)
    .map((c) => c.promoted_alert_id as string);
  const slugByAlertId = new Map<string, string>();
  if (promotedIds.length > 0) {
    const { data } = await sb
      .from("reg_alerts")
      .select("id, slug")
      .in("id", promotedIds);
    for (const row of (data || []) as { id: string; slug: string }[]) {
      slugByAlertId.set(row.id, row.slug);
    }
  }

  // Derniere run.
  const { data: lastRunData } = await sb
    .from("reg_ingestion_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const lastRun = lastRunData as IngestionRun | null;

  // Refs metiers + activites.
  const { data: metiersData } = await sb
    .from("reg_metiers")
    .select("code, label");
  const metiersOptions = (
    (metiersData as { code: string; label: string }[]) || [
      { code: "ambulance", label: "Ambulance" },
      { code: "vsl", label: "VSL" },
      { code: "taxi_conventionne", label: "Taxi conventionné" },
    ]
  ).map((m) => ({ code: m.code, label: m.label || m.code }));

  const { data: activitesData } = await sb
    .from("reg_activites")
    .select("code, label");
  const activitesOptions = ((activitesData as { code: string; label: string }[]) || []).map(
    (a) => ({ code: a.code, label: a.label || a.code })
  );

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm text-slate-500 mb-4">
          <Link href="/admin" className="hover:text-blue-700">
            Admin
          </Link>{" "}
          <span>›</span> Veille — Candidats à valider
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Candidats veille réglementaire
          </h1>
          <Link
            href="/admin/veille/alertes"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition"
          >
            Gérer les alertes
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <p className="text-slate-600 mb-6">
          Pipeline d&apos;ingestion automatique DILA JORF. Validez ou ignorez les candidats détectés.
        </p>

        {/* Status banner */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-blue-700" />
              <h2 className="font-bold text-slate-900">Dernière exécution</h2>
            </div>
            {lastRun ? (
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-slate-500">Démarrée :</span>{" "}
                  <strong>{fmtDate(lastRun.started_at)}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Statut :</span>{" "}
                  <span
                    className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      lastRun.status === "success"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : lastRun.status === "failed"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                    }`}
                  >
                    {lastRun.status || "—"}
                  </span>
                </p>
                <p>
                  <span className="text-slate-500">Stats :</span> Fetched{" "}
                  <strong>{lastRun.items_fetched ?? 0}</strong> · Match{" "}
                  <strong>{lastRun.items_matched ?? 0}</strong> · Insérés{" "}
                  <strong>{lastRun.items_inserted ?? 0}</strong> · Doublons{" "}
                  <strong>{lastRun.items_duplicates ?? 0}</strong>
                </p>
                {lastRun.error_message && (
                  <p className="text-red-700 text-xs">{lastRun.error_message}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Aucune exécution enregistrée.</p>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 justify-center">
            <RunIngestButton action={runIngest} />
            <p className="text-xs text-slate-500">
              Cron auto : jeudi 9h Paris. Le bouton lance maintenant.
            </p>
          </div>
        </div>

        {/* Tabs status */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(
            [
              { code: "pending" as const, label: "En attente", icon: <Clock className="h-3.5 w-3.5" /> },
              { code: "promoted" as const, label: "Promus", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
              { code: "dismissed" as const, label: "Ignorés", icon: <XCircle className="h-3.5 w-3.5" /> },
              { code: "duplicate" as const, label: "Doublons", icon: <RefreshCw className="h-3.5 w-3.5" /> },
            ]
          ).map((t) => {
            const active = statusFilter === t.code;
            return (
              <Link
                key={t.code}
                href={`/admin/veille/candidats?status=${t.code}`}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition ${
                  active
                    ? "bg-blue-700 text-white border-blue-700"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                {t.icon}
                {t.label}
                <span
                  className={`ml-1 text-xs font-bold ${
                    active ? "text-blue-100" : "text-slate-500"
                  }`}
                >
                  {counts[t.code] ?? 0}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {candidates.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              Aucun candidat dans cet état.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {candidates.map((c) => (
                <li key={c.id} className="p-4 hover:bg-slate-50">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${STATUS_BADGE[c.status].cls}`}
                        >
                          {STATUS_BADGE[c.status].label}
                        </span>
                        <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {c.source}
                        </span>
                        {typeof c.relevance_score === "number" && (
                          <span
                            className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              c.relevance_score >= 15
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : c.relevance_score >= 10
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : "bg-amber-100 text-amber-800 border-amber-200"
                            }`}
                          >
                            score {c.relevance_score}
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          Détecté {fmtDate(c.detected_at)}
                        </span>
                        {c.publication_date && (
                          <span className="text-xs text-slate-500">
                            · JO {fmtDateOnly(c.publication_date)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {c.title}
                      </h3>
                      {c.summary && (
                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                          {c.summary}
                        </p>
                      )}
                      {c.keywords_matched && c.keywords_matched.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {c.keywords_matched.map((kw) => (
                            <span
                              key={kw}
                              className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                      {c.dismissed_reason && (
                        <p className="text-xs text-red-700 mt-1">
                          Raison : {c.dismissed_reason}
                        </p>
                      )}
                      <a
                        href={c.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-800 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Source
                      </a>
                    </div>

                    <div className="flex flex-col gap-2 items-end flex-shrink-0">
                      {c.status === "pending" && (
                        <>
                          <PromoteForm
                            candidateId={c.id}
                            defaults={{
                              title_short: c.title.slice(0, 80),
                              title_long: c.title,
                              slug: slugify(c.title.slice(0, 80), {
                                lower: true,
                                strict: true,
                              }),
                              summary_oneliner: (c.summary || "").slice(0, 200),
                              what_changes: c.summary || "",
                              sources: [
                                {
                                  label: c.source === "dila_jorf" ? "JORF" : c.source,
                                  url: c.source_url,
                                },
                              ],
                            }}
                            metiersOptions={metiersOptions}
                            activitesOptions={activitesOptions}
                            action={promoteCandidate}
                          />
                          <form action={dismissCandidate}>
                            <input type="hidden" name="id" value={c.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-red-300 hover:text-red-700 text-slate-700 text-xs font-medium rounded-lg transition"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Ignorer
                            </button>
                          </form>
                        </>
                      )}

                      {c.status === "promoted" && c.promoted_alert_id && (
                        <Link
                          href={`/veille-reglementaire/${slugByAlertId.get(c.promoted_alert_id) || ""}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Voir l&apos;alerte
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}

                      {c.status === "dismissed" && (
                        <form action={restoreCandidate}>
                          <input type="hidden" name="id" value={c.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 text-slate-700 text-xs font-medium rounded-lg transition"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Restaurer
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-slate-600">
              Page <strong>{page}</strong> sur <strong>{totalPages}</strong> ·{" "}
              {totalCount ?? 0} candidats
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/veille/candidats?status=${statusFilter}&page=${page - 1}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-lg transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Précédent
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/veille/candidats?status=${statusFilter}&page=${page + 1}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-lg transition"
                >
                  Suivant
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour admin
          </Link>
        </div>
      </div>
    </main>
  );
}
