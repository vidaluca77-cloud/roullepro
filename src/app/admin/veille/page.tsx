/**
 * /admin/veille — Dashboard principal veille réglementaire J+1
 *
 * Affiche :
 *   - Nb candidats non triés (status=pending)
 *   - Nb drafts en attente de publication
 *   - Nb alertes publiées cette semaine
 *   - Top sources des candidats (dernières 7j)
 *   - Liens 1-clic vers les pages d'action
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  RefreshCw,
  Send,
  Zap,
} from "lucide-react";
import { ensureAdmin, getServiceSupabase } from "./alertes/_helpers";
import {
  publishAlertForm,
} from "./alertes/_actions";

export const dynamic = "force-dynamic";

// Re-export server action pour usage dans ce composant serveur
async function publishDraftFromDashboard(formData: FormData): Promise<void> {
  "use server";
  return publishAlertForm(formData);
}

type DraftAlert = {
  id: string;
  slug: string;
  title_short: string;
  urgency: string | null;
  created_at: string;
};

type SourceCount = {
  source: string;
  count: number;
};


function fmtDate(iso: string | null | undefined): string {
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

const URGENCY_BADGE: Record<string, { label: string; cls: string }> = {
  critical: { label: "Critique", cls: "bg-red-100 text-red-800 border-red-200" },
  high: { label: "Élevée", cls: "bg-orange-100 text-orange-800 border-orange-200" },
  medium: { label: "Moyenne", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  info: { label: "Info", cls: "bg-blue-100 text-blue-800 border-blue-200" },
  low: { label: "Faible", cls: "bg-slate-100 text-slate-700 border-slate-200" },
};

export default async function VeilleDashboardPage() {
  await ensureAdmin("/admin/veille");
  const sb = getServiceSupabase();

  // --- Compteurs ---
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    pendingRes,
    draftRes,
    publishedWeekRes,
    draftAlertsRes,
    topSourcesRes,
    lastRunRes,
  ] = await Promise.all([
    // Candidats non tries
    sb
      .from("reg_alerts_candidates")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    // Brouillons en attente
    sb
      .from("reg_alerts")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    // Publiees cette semaine
    sb
      .from("reg_alerts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .gte("published_at", weekAgo),
    // Liste brouillons pour bouton 1-click
    sb
      .from("reg_alerts")
      .select("id, slug, title_short, urgency, created_at")
      .eq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(10),
    // Top sources des candidats (7j)
    sb
      .from("reg_alerts_candidates")
      .select("source")
      .gte("detected_at", weekAgo),
    // Derniere ingestion
    sb
      .from("reg_ingestion_runs")
      .select("source, started_at, status, items_inserted, items_matched")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const pendingCount = pendingRes.count ?? 0;
  const draftCount = draftRes.count ?? 0;
  const publishedWeekCount = publishedWeekRes.count ?? 0;
  const draftAlerts = (draftAlertsRes.data || []) as DraftAlert[];

  // Calcul top sources depuis les resultats bruts
  const sourceMap = new Map<string, number>();
  for (const row of (topSourcesRes.data || []) as { source: string }[]) {
    sourceMap.set(row.source, (sourceMap.get(row.source) ?? 0) + 1);
  }
  const topSources: SourceCount[] = Array.from(sourceMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => ({ source, count }));

  const lastRun = lastRunRes.data as {
    source: string | null;
    started_at: string;
    status: string | null;
    items_inserted: number | null;
    items_matched: number | null;
  } | null;

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <nav className="text-sm text-slate-500 mb-4">
          <Link href="/admin" className="hover:text-blue-700">Admin</Link>
          {" "}<span aria-hidden>›</span>{" "}
          <span className="text-slate-900">Veille réglementaire</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Dashboard veille J+1
            </h1>
            <p className="text-slate-600 mt-1 text-sm">
              Pipeline d&apos;ingestion quotidienne. Validez les candidats, publiez les brouillons.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/veille/candidats"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 text-sm font-semibold rounded-lg transition"
            >
              <Clock className="h-4 w-4" />
              Candidats
            </Link>
            <Link
              href="/admin/veille/alertes"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 text-sm font-semibold rounded-lg transition"
            >
              <FileText className="h-4 w-4" />
              Alertes
            </Link>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            href="/admin/veille/candidats?status=pending"
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-amber-300 hover:shadow-sm transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Candidats non triés</span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <p className={`text-4xl font-bold ${pendingCount > 0 ? "text-amber-600" : "text-slate-400"}`}>
              {pendingCount}
            </p>
            <p className="text-xs text-slate-500 mt-1 group-hover:text-blue-600">
              Voir les candidats
              <ArrowRight className="inline h-3 w-3 ml-1" />
            </p>
          </Link>

          <Link
            href="/admin/veille/alertes?status=draft"
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Brouillons à publier</span>
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <p className={`text-4xl font-bold ${draftCount > 0 ? "text-blue-600" : "text-slate-400"}`}>
              {draftCount}
            </p>
            <p className="text-xs text-slate-500 mt-1 group-hover:text-blue-600">
              Voir les brouillons
              <ArrowRight className="inline h-3 w-3 ml-1" />
            </p>
          </Link>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Publiées cette semaine</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <p className={`text-4xl font-bold ${publishedWeekCount > 0 ? "text-emerald-600" : "text-slate-400"}`}>
              {publishedWeekCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">7 derniers jours</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Brouillons 1-click publish */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Send className="h-5 w-5 text-blue-700" />
              <h2 className="font-bold text-slate-900">Brouillons — Publier en 1 clic</h2>
            </div>

            {draftAlerts.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Aucun brouillon en attente.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {draftAlerts.map((a) => {
                  const badge = URGENCY_BADGE[a.urgency ?? "info"] ?? URGENCY_BADGE.info;
                  return (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                          {a.title_short}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">Créé {fmtDate(a.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          href={`/veille-reglementaire/${a.slug}?preview=1`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Aperçu
                        </Link>
                        <form action={publishDraftFromDashboard}>
                          <input type="hidden" name="id" value={a.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
                          >
                            <Send className="h-3 w-3" />
                            Publier
                          </button>
                        </form>
                        <Link
                          href={`/admin/veille/alertes/${a.slug}/edit`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 text-xs font-medium rounded-lg transition"
                        >
                          Éditer
                        </Link>
                      </div>
                    </li>
                  );
                })}
                {draftCount > draftAlerts.length && (
                  <li className="pt-2 text-center">
                    <Link
                      href="/admin/veille/alertes?status=draft"
                      className="text-sm text-blue-700 hover:underline"
                    >
                      Voir tous les brouillons ({draftCount})
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Top sources + Ingestion */}
          <div className="space-y-4">
            {/* Top sources */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-blue-700" />
                <h2 className="font-bold text-slate-900">Top sources (7 derniers jours)</h2>
              </div>
              {topSources.length === 0 ? (
                <p className="text-sm text-slate-500">Aucun candidat détecté cette semaine.</p>
              ) : (
                <ul className="space-y-2">
                  {topSources.map((s) => (
                    <li key={s.source} className="flex items-center justify-between gap-2">
                      <span className="text-sm text-slate-700 font-medium">{s.source}</span>
                      <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100">
                        {s.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Derniere ingestion + bouton lancer */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-blue-700" />
                <h2 className="font-bold text-slate-900">Ingestion quotidienne</h2>
              </div>
              {lastRun ? (
                <div className="text-sm space-y-1 mb-4">
                  <p>
                    <span className="text-slate-500">Dernière run :</span>{" "}
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
                    <span className="text-slate-500">Insérés :</span>{" "}
                    <strong>{lastRun.items_inserted ?? 0}</strong> /{" "}
                    <span className="text-slate-500">Match :</span>{" "}
                    <strong>{lastRun.items_matched ?? 0}</strong>
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500 mb-4">Aucune exécution enregistrée.</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/admin/veille/candidats"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Lancer l&apos;ingestion
                </Link>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Cron auto : quotidien 07h UTC. Le bouton ci-dessus pointe vers la page candidats qui permet de lancer manuellement.
              </p>
            </div>
          </div>
        </div>

        {/* Liens utiles */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-700" />
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/admin/veille/candidats?status=pending"
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition"
            >
              <span className="text-sm font-semibold text-slate-900">Valider les candidats</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              href="/admin/veille/alertes?status=draft"
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition"
            >
              <span className="text-sm font-semibold text-slate-900">Gérer les brouillons</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              href="/veille-reglementaire"
              target="_blank"
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition"
            >
              <span className="text-sm font-semibold text-slate-900">Page publique veille</span>
              <ExternalLink className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Retour admin
          </Link>
        </div>
      </div>
    </main>
  );
}
