import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Crown,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  fetchMatchedAlerts,
  getProgressByAlert,
  isPaidPlan,
  metierLabel,
  activiteLabel,
  regionLabel,
  type ComplianceProfile,
} from "@/lib/compliance";
import AlertCard from "../../_components/AlertCard";

export const dynamic = "force-dynamic";

type Params = { pro_id: string };

export default async function ConformiteAlertesPage({
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
      `/auth/login?next=/transport-medical/pro/dashboard/conformite/${proId}/alertes`
    );
  }

  const { data: fiche } = await supabase
    .from("pros_sanitaire")
    .select("id, nom_commercial, raison_sociale, categorie, plan, claimed_by")
    .eq("id", proId)
    .maybeSingle();

  if (!fiche || fiche.claimed_by !== user.id) {
    notFound();
  }

  const ficheName =
    (fiche.nom_commercial as string) ||
    (fiche.raison_sociale as string) ||
    "Mon entreprise";

  if (!isPaidPlan(fiche.plan as string | null)) {
    return (
      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Breadcrumb ficheName={ficheName} proId={proId} />
          <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-4 uppercase tracking-wide">
              <Crown className="h-3.5 w-3.5" />
              Réservé aux abonnés Pro
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">
              Alertes ciblées indisponibles
            </h1>
            <p className="text-slate-700 mb-5">
              Cette fiche n&apos;est pas sur un plan Pro. Activez le plan pour bénéficier des alertes filtrées par votre profil.
            </p>
            <Link
              href="/transport-medical/tarifs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              Passer Pro à 19,90 €/mois
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
            <ShieldCheck className="h-10 w-10 text-blue-700 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Renseignez votre profil de conformité
            </h1>
            <p className="text-slate-600 mb-5">
              Avant de pouvoir afficher des alertes ciblées, il faut nous indiquer vos métiers, activités et région.
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

  const matched = await fetchMatchedAlerts(supabase, profile);
  const progressByAlert = await getProgressByAlert(supabase, proId);

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumb ficheName={ficheName} proId={proId} />

        {/* Header */}
        <div className="mt-6 mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
              Alertes ciblées
            </h1>
            <p className="text-slate-600">
              Filtrées selon le profil de <strong>{ficheName}</strong>.
            </p>
          </div>
          <Link
            href={`/transport-medical/pro/dashboard/conformite/${proId}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg font-medium hover:border-slate-300 text-slate-700 text-sm"
          >
            <Pencil className="h-4 w-4" />
            Modifier mon profil
          </Link>
        </div>

        {/* Profile summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Votre profil
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {profile.metiers.map((m) => (
              <span
                key={m}
                className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200"
              >
                {metierLabel(m)}
              </span>
            ))}
            {profile.activites.map((a) => (
              <span
                key={a}
                className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                {activiteLabel(a)}
              </span>
            ))}
            <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Région : {regionLabel(profile.region_code)}
            </span>
          </div>
        </div>

        {/* Total */}
        <p className="text-slate-700 mb-4">
          <strong>{matched.length}</strong>{" "}
          {matched.length > 1 ? "alertes vous concernent" : "alerte vous concerne"}.
        </p>

        {/* Liste */}
        {matched.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900 mb-1">
                Aucune alerte critique pour votre profil actuellement
              </p>
              <p className="text-sm text-emerald-800">
                Vous serez notifié dès qu&apos;une réglementation concernera votre périmètre.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {matched.map((a) => (
              <li key={a.id}>
                <AlertCard
                  alert={a}
                  proId={proId}
                  progress={progressByAlert.get(a.id)}
                />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8">
          <Link
            href="/transport-medical/pro/dashboard"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </Link>
        </div>
      </div>
    </main>
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
        <li className="text-slate-700">Alertes ciblées</li>
      </ol>
    </nav>
  );
}
