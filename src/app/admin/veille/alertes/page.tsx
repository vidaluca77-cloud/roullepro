import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Edit3,
  Eye,
  FileText,
  RotateCcw,
  Send,
  Archive,
} from "lucide-react";
import { ensureAdmin, getServiceSupabase } from "./_helpers";
import {
  publishAlertForm,
  unpublishAlertForm,
  archiveAlertForm,
  deleteAlert,
} from "./_actions";
import DeleteAlertButton from "./_components/DeleteAlertButton";

export const dynamic = "force-dynamic";

const STATUS_TABS: { code: string; label: string }[] = [
  { code: "draft", label: "Brouillons" },
  { code: "published", label: "Publiées" },
  { code: "archived", label: "Archivées" },
  { code: "all", label: "Toutes" },
];

const URGENCY_BADGE: Record<string, { label: string; cls: string }> = {
  critical: {
    label: "Critique",
    cls: "bg-red-100 text-red-800 border-red-200",
  },
  high: {
    label: "Élevée",
    cls: "bg-orange-100 text-orange-800 border-orange-200",
  },
  medium: {
    label: "Moyenne",
    cls: "bg-amber-100 text-amber-800 border-amber-200",
  },
  low: {
    label: "Faible",
    cls: "bg-blue-100 text-blue-800 border-blue-200",
  },
  info: {
    label: "Info",
    cls: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  draft: {
    label: "Brouillon",
    cls: "bg-amber-100 text-amber-800 border-amber-200",
  },
  published: {
    label: "Publiée",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  archived: {
    label: "Archivée",
    cls: "bg-slate-200 text-slate-700 border-slate-300",
  },
};

type AlertRow = {
  id: string;
  slug: string;
  title_short: string;
  urgency: string | null;
  metiers: string[] | null;
  status: string;
  applicable_from: string | null;
  deadline: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR");
}

function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminAlertesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await ensureAdmin();
  const sp = await searchParams;
  const statusFilter = STATUS_TABS.find((t) => t.code === sp.status)?.code || "draft";

  const sb = getServiceSupabase();

  // Compteurs.
  const counts: Record<string, number> = {};
  for (const t of STATUS_TABS) {
    if (t.code === "all") continue;
    const { count } = await sb
      .from("reg_alerts")
      .select("id", { count: "exact", head: true })
      .eq("status", t.code);
    counts[t.code] = count ?? 0;
  }
  const { count: totalCount } = await sb
    .from("reg_alerts")
    .select("id", { count: "exact", head: true });
  counts.all = totalCount ?? 0;

  let query = sb
    .from("reg_alerts")
    .select(
      "id, slug, title_short, urgency, metiers, status, applicable_from, deadline, published_at, created_at, updated_at"
    )
    .order("created_at", { ascending: false });
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }
  const { data: alertsRows } = await query;
  const alerts = (alertsRows || []) as AlertRow[];

  // Compteur de candidats sources par alerte.
  const alertIds = alerts.map((a) => a.id);
  const candidatesByAlert = new Map<string, number>();
  if (alertIds.length > 0) {
    const { data: candData } = await sb
      .from("reg_alerts_candidates")
      .select("promoted_alert_id")
      .in("promoted_alert_id", alertIds);
    for (const row of (candData || []) as { promoted_alert_id: string | null }[]) {
      if (!row.promoted_alert_id) continue;
      candidatesByAlert.set(
        row.promoted_alert_id,
        (candidatesByAlert.get(row.promoted_alert_id) || 0) + 1
      );
    }
  }

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link
              href="/admin/veille/candidats"
              className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-blue-700 mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Candidats à valider
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Alertes réglementaires
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Gérer les alertes <code>reg_alerts</code> : prévisualiser, modifier, publier, archiver.
            </p>
          </div>
        </div>

        {/* Compteurs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {STATUS_TABS.map((t) => (
            <Link
              key={t.code}
              href={`/admin/veille/alertes?status=${t.code}`}
              className={`bg-white border rounded-xl px-4 py-3 transition ${
                statusFilter === t.code
                  ? "border-blue-400 ring-1 ring-blue-200"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t.label}
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {counts[t.code] ?? 0}
              </p>
            </Link>
          ))}
        </div>

        {/* Liste */}
        {alerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">
              Aucune alerte pour ce statut.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {alerts.map((a) => {
              const urgencyBadge =
                URGENCY_BADGE[a.urgency || "info"] || URGENCY_BADGE.info;
              const statusBadge =
                STATUS_BADGE[a.status] || {
                  label: a.status,
                  cls: "bg-slate-100 text-slate-700 border-slate-200",
                };
              const candCount = candidatesByAlert.get(a.id) || 0;
              return (
                <li
                  key={a.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${urgencyBadge.cls}`}
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {urgencyBadge.label}
                        </span>
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${statusBadge.cls}`}
                        >
                          {statusBadge.label}
                        </span>
                        {(a.metiers || []).map((m) => (
                          <span
                            key={m}
                            className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {m}
                          </span>
                        ))}
                        {candCount > 0 && (
                          <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            {candCount} candidat{candCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-bold text-slate-900 mb-1">
                        {a.title_short}
                      </h2>
                      <p className="text-xs font-mono text-slate-500 mb-2 truncate">
                        {a.slug}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Créée {fmtDateTime(a.created_at)}
                        </span>
                        {a.published_at && (
                          <span className="inline-flex items-center gap-1">
                            <Send className="h-3 w-3" />
                            Publiée {fmtDate(a.published_at)}
                          </span>
                        )}
                        {a.applicable_from && (
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Applicable {fmtDate(a.applicable_from)}
                          </span>
                        )}
                        {a.deadline && (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-3 w-3" />
                            Échéance {fmtDate(a.deadline)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                      <a
                        href={`/veille-reglementaire/${a.slug}?preview=admin`}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Prévisualiser
                      </a>
                      <Link
                        href={`/admin/veille/alertes/${a.slug}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Modifier
                      </Link>

                      {a.status === "draft" && (
                        <>
                          <form action={publishAlertForm}>
                            <input type="hidden" name="id" value={a.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Publier
                            </button>
                          </form>
                          <DeleteAlertButton
                            id={a.id}
                            title={a.title_short}
                            action={deleteAlert}
                          />
                        </>
                      )}

                      {a.status === "published" && (
                        <>
                          <form action={unpublishAlertForm}>
                            <input type="hidden" name="id" value={a.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-amber-300 hover:border-amber-500 text-amber-800 text-xs font-semibold rounded-lg transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Repasser en draft
                            </button>
                          </form>
                          <form action={archiveAlertForm}>
                            <input type="hidden" name="id" value={a.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold rounded-lg transition"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              Archiver
                            </button>
                          </form>
                        </>
                      )}

                      {a.status === "archived" && (
                        <form action={unpublishAlertForm}>
                          <input type="hidden" name="id" value={a.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-amber-300 hover:border-amber-500 text-amber-800 text-xs font-semibold rounded-lg transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Repasser en draft
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
