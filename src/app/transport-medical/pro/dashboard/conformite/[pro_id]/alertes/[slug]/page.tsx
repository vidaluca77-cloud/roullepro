import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  ListChecks,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  isPaidPlan,
  getChecklistForAlert,
  recomputeAndPersistScore,
  formatFrDateShort,
} from "@/lib/compliance";
import {
  URGENCY_CLASSES,
  URGENCY_LABEL,
  formatApplicableFrom,
  type RegUrgency,
} from "@/lib/reg-alerts";
import ChecklistItem from "../../../_components/ChecklistItem";

export const dynamic = "force-dynamic";

type Params = { pro_id: string; slug: string };

async function toggleChecklistItem(
  proId: string,
  alertId: string,
  itemKey: string,
  checked: boolean
): Promise<{ ok: boolean; error?: string }> {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié." };

  // Ownership : la fiche doit appartenir a l'utilisateur.
  const { data: fiche } = await supabase
    .from("pros_sanitaire")
    .select("id, claimed_by, plan")
    .eq("id", proId)
    .maybeSingle();

  if (!fiche || fiche.claimed_by !== user.id) {
    return { ok: false, error: "Fiche introuvable ou non autorisée." };
  }

  if (!isPaidPlan(fiche.plan as string | null)) {
    return { ok: false, error: "Fonctionnalité réservée aux abonnés Pro." };
  }

  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from("pro_checklist_progress")
    .upsert(
      {
        pro_id: proId,
        alert_id: alertId,
        item_key: itemKey,
        checked,
        checked_at: checked ? nowIso : null,
        user_id: user.id,
        updated_at: nowIso,
      },
      { onConflict: "pro_id,alert_id,item_key" }
    );

  if (error) {
    console.error("[checklist toggle] upsert error:", error.message);
    return { ok: false, error: "Enregistrement impossible." };
  }

  // Recalcul score (best-effort, non bloquant).
  await recomputeAndPersistScore(supabase, proId);

  return { ok: true };
}

export default async function ChecklistAlertePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { pro_id: proId, slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/auth/login?next=/transport-medical/pro/dashboard/conformite/${proId}/alertes/${slug}`
    );
  }

  const { data: fiche } = await supabase
    .from("pros_sanitaire")
    .select("id, nom_commercial, raison_sociale, plan, claimed_by")
    .eq("id", proId)
    .maybeSingle();
  if (!fiche || fiche.claimed_by !== user.id) notFound();

  if (!isPaidPlan(fiche.plan as string | null)) {
    redirect(`/transport-medical/pro/dashboard/conformite/${proId}`);
  }

  const { data: alert } = await supabase
    .from("reg_alerts")
    .select(
      "id, slug, title_short, title_long, summary_oneliner, urgency, applicable_from, deadline, status"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!alert) notFound();

  const ficheName =
    (fiche.nom_commercial as string) ||
    (fiche.raison_sociale as string) ||
    "Mon entreprise";

  const items = await getChecklistForAlert(
    supabase,
    alert.id as string,
    proId
  );
  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const urgency = (alert.urgency as RegUrgency) || "info";

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link
                href="/transport-medical/pro/dashboard"
                className="hover:text-blue-700"
              >
                Dashboard pro
              </Link>
            </li>
            <li>
              <ChevronRight className="inline h-3.5 w-3.5 mx-0.5" />
            </li>
            <li>
              <Link
                href={`/transport-medical/pro/dashboard/conformite/${proId}/alertes`}
                className="hover:text-blue-700"
              >
                Alertes — {ficheName}
              </Link>
            </li>
            <li>
              <ChevronRight className="inline h-3.5 w-3.5 mx-0.5" />
            </li>
            <li className="text-slate-700 truncate max-w-xs">
              {alert.title_short}
            </li>
          </ol>
        </nav>

        {/* Header alerte */}
        <div className="mt-6 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${URGENCY_CLASSES[urgency]}`}
            >
              <AlertTriangle className="h-3 w-3" />
              {URGENCY_LABEL[urgency]}
            </span>
            <Link
              href={`/veille-reglementaire/${alert.slug}`}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300"
            >
              <ExternalLink className="h-3 w-3" />
              Fiche publique
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {alert.title_short}
          </h1>
          <p className="text-slate-600 mb-3">{alert.summary_oneliner}</p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            {alert.applicable_from && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatApplicableFrom(alert.applicable_from as string)}
              </span>
            )}
            {alert.deadline && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-red-600" />
                Échéance le {formatFrDateShort(alert.deadline as string)}
              </span>
            )}
          </div>
        </div>

        {/* Plan d'action */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-blue-700" />
              <h2 className="text-lg font-bold text-slate-900">Plan d&apos;action</h2>
            </div>
            <span
              className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${
                totalCount > 0 && checkedCount === totalCount
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {checkedCount} / {totalCount} items
            </span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              Aucun plan d&apos;action n&apos;est encore défini pour cette alerte.
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((it) => (
                <ChecklistItem
                  key={it.id}
                  proId={proId}
                  alertId={alert.id as string}
                  itemKey={it.item_key}
                  label={it.label}
                  description={it.description}
                  recommended={it.recommended === true}
                  initialChecked={it.checked}
                  toggle={toggleChecklistItem}
                />
              ))}
            </ul>
          )}

          <p className="text-xs text-slate-500 mt-5 leading-relaxed">
            Progression sauvegardée automatiquement. Le score de conformité est recalculé à chaque coche.
          </p>
        </section>

        <div className="mt-6">
          <Link
            href={`/transport-medical/pro/dashboard/conformite/${proId}/alertes`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux alertes
          </Link>
        </div>
      </div>
    </main>
  );
}
