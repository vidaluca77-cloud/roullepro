import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getUpcomingDeadlines,
  isPaidPlan,
  formatFrDateShort,
  DEADLINE_KIND_LABEL,
  type ComplianceProfile,
  type DeadlineWithAlert,
} from "@/lib/compliance";
import { URGENCY_CLASSES, URGENCY_LABEL, type RegUrgency } from "@/lib/reg-alerts";

export const dynamic = "force-dynamic";

type Params = { pro_id: string };

export default async function CalendrierPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { pro_id: proId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/auth/login?next=/transport-medical/pro/dashboard/conformite/${proId}/calendrier`
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

  const ficheName =
    (fiche.nom_commercial as string) ||
    (fiche.raison_sociale as string) ||
    "Mon entreprise";

  const { data: profileRow } = await supabase
    .from("pro_compliance_profiles")
    .select("*")
    .eq("pro_id", proId)
    .maybeSingle();
  const profile = profileRow as ComplianceProfile | null;

  if (!profile) {
    return (
      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Breadcrumb ficheName={ficheName} proId={proId} />
          <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <Calendar className="h-10 w-10 text-blue-700 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Profil non rempli
            </h1>
            <p className="text-slate-600 mb-5">
              Complétez votre profil de conformité pour afficher le calendrier des échéances.
            </p>
            <Link
              href={`/transport-medical/pro/dashboard/conformite/${proId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              Compléter mon profil
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const deadlines = await getUpcomingDeadlines(supabase, profile);

  const past = deadlines.filter((d) => d.status === "past");
  const soon = deadlines.filter((d) => d.status === "soon");
  const future = deadlines.filter((d) => d.status === "future");

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumb ficheName={ficheName} proId={proId} />

        <div className="mt-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
            Calendrier de conformité
          </h1>
          <p className="text-slate-600">
            Échéances réglementaires pour <strong>{ficheName}</strong>, filtrées selon votre profil.
          </p>
        </div>

        {deadlines.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex items-start gap-3">
            <CalendarCheck className="h-6 w-6 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900 mb-1">
                Aucune échéance enregistrée pour votre périmètre
              </p>
              <p className="text-sm text-emerald-800">
                Le calendrier se remplira automatiquement à mesure que de nouvelles alertes seront publiées.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <Group
              title="Dans les 90 prochains jours"
              tone="urgent"
              icon={<CalendarClock className="h-5 w-5" />}
              deadlines={soon}
              proId={proId}
              empty="Aucune échéance proche."
            />
            <Group
              title="À plus de 90 jours"
              tone="future"
              icon={<Calendar className="h-5 w-5" />}
              deadlines={future}
              proId={proId}
              empty="Aucune échéance future."
            />
            <Group
              title="Échéances passées"
              tone="past"
              icon={<CalendarX className="h-5 w-5" />}
              deadlines={past}
              proId={proId}
              empty="Aucune échéance passée."
            />
          </div>
        )}

        <div className="mt-10">
          <Link
            href={`/transport-medical/pro/dashboard/conformite/${proId}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au profil
          </Link>
        </div>
      </div>
    </main>
  );
}

function Group({
  title,
  tone,
  icon,
  deadlines,
  proId,
  empty,
}: {
  title: string;
  tone: "urgent" | "future" | "past";
  icon: React.ReactNode;
  deadlines: DeadlineWithAlert[];
  proId: string;
  empty: string;
}) {
  const toneClass =
    tone === "urgent"
      ? "text-orange-700"
      : tone === "past"
        ? "text-slate-500"
        : "text-blue-700";
  return (
    <section>
      <h2
        className={`flex items-center gap-2 text-base font-bold mb-3 ${toneClass}`}
      >
        {icon}
        {title}
        <span className="ml-1 text-xs font-semibold text-slate-500">
          ({deadlines.length})
        </span>
      </h2>
      {deadlines.length === 0 ? (
        <p className="text-sm text-slate-500 italic bg-slate-100 rounded-lg px-4 py-3">
          {empty.replace(/italic/g, "")}
        </p>
      ) : (
        <ul className="space-y-3">
          {deadlines.map((d) => {
            const urgency = (d.alert.urgency as RegUrgency) || "info";
            return (
              <li
                key={d.id}
                className="bg-white border border-slate-200 rounded-xl p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${URGENCY_CLASSES[urgency]}`}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {URGENCY_LABEL[urgency]}
                      </span>
                      <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {DEADLINE_KIND_LABEL[d.kind] || d.kind}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-0.5">
                      {d.label}
                    </h3>
                    {d.description && (
                      <p className="text-sm text-slate-600 mb-1">
                        {d.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">
                      Alerte :{" "}
                      <Link
                        href={`/transport-medical/pro/dashboard/conformite/${proId}/alertes/${d.alert.slug}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {d.alert.title_short}
                      </Link>
                      {" · "}
                      <Link
                        href={`/veille-reglementaire/${d.alert.slug}`}
                        className="inline-flex items-center gap-0.5 text-slate-600 hover:text-slate-900"
                      >
                        Fiche publique
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        {tone === "urgent"
                          ? "Échéance"
                          : tone === "past"
                            ? "Passée"
                            : "Date"}
                      </p>
                      <p
                        className={`text-base font-bold ${
                          tone === "urgent"
                            ? "text-orange-700"
                            : tone === "past"
                              ? "text-slate-500"
                              : "text-slate-900"
                        }`}
                      >
                        {formatFrDateShort(d.due_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Breadcrumb({ ficheName, proId }: { ficheName: string; proId: string }) {
  return (
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
            href={`/transport-medical/pro/dashboard/conformite/${proId}`}
            className="hover:text-blue-700"
          >
            Conformité — {ficheName}
          </Link>
        </li>
        <li>
          <ChevronRight className="inline h-3.5 w-3.5 mx-0.5" />
        </li>
        <li className="text-slate-700">Calendrier</li>
      </ol>
    </nav>
  );
}
