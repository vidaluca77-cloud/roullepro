import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { ensureAdmin, getServiceSupabase } from "../../_helpers";
import { updateAlert } from "../../_actions";
import EditAlertForm from "../../_components/EditAlertForm";
import { getAlertBySlugForAdmin } from "@/lib/reg-alerts";

export const dynamic = "force-dynamic";

type RouteParams = { slug: string };

export default async function EditAlertPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  await ensureAdmin();
  const { slug } = await params;
  const alert = await getAlertBySlugForAdmin(slug);
  if (!alert) notFound();

  const sb = getServiceSupabase();
  const [{ data: metiersData }, { data: activitesData }] = await Promise.all([
    sb.from("reg_metiers").select("code, label").order("label"),
    sb.from("reg_activites").select("code, label").order("label"),
  ]);
  const metiersOptions = ((metiersData as { code: string; label: string }[]) || [])
    .map((m) => ({ code: m.code, label: m.label }))
    .concat(
      // Fallback si reg_metiers est vide.
      ((metiersData?.length || 0) === 0
        ? [
            { code: "ambulance", label: "Ambulance" },
            { code: "vsl", label: "VSL" },
            { code: "taxi_conventionne", label: "Taxi conventionné" },
          ]
        : []) as { code: string; label: string }[]
    );
  const activitesOptions = (
    (activitesData as { code: string; label: string }[]) || []
  ).map((a) => ({ code: a.code, label: a.label }));

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link
              href="/admin/veille/alertes"
              className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-blue-700 mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Toutes les alertes
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Modifier l&apos;alerte
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Statut actuel : <strong>{alert.status}</strong> · slug actuel :{" "}
              <code className="font-mono text-xs">{alert.slug}</code>
            </p>
          </div>
          <a
            href={`/veille-reglementaire/${alert.slug}?preview=admin`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition"
          >
            <Eye className="h-4 w-4" />
            Prévisualiser
          </a>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
          <EditAlertForm
            alertId={alert.id}
            defaults={{
              title_short: alert.title_short,
              title_long: alert.title_long,
              slug: alert.slug,
              summary_oneliner: alert.summary_oneliner,
              urgency: alert.urgency,
              metiers: alert.metiers,
              activites: alert.activites,
              regions: alert.regions,
              applicable_from: alert.applicable_from,
              deadline: alert.deadline,
              what_changes: alert.what_changes,
              who_is_concerned: alert.who_is_concerned,
              concrete_actions: alert.concrete_actions,
              sources: alert.sources,
              key_numbers: alert.key_numbers,
            }}
            metiersOptions={metiersOptions}
            activitesOptions={activitesOptions}
            action={updateAlert}
          />
        </div>
      </div>
    </main>
  );
}
