import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Crown, ListChecks, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  ACTIVITES_GROUPS,
  METIERS_OPTIONS,
  REGIONS_FR,
  isPaidPlan,
  recomputeAndPersistScore,
  type ComplianceProfile,
} from "@/lib/compliance";
import ComplianceForm from "../_components/ComplianceForm";

export const dynamic = "force-dynamic";

type Params = { pro_id: string };

const ALLOWED_METIERS = new Set(METIERS_OPTIONS.map((m) => m.code));
const ALLOWED_ACTIVITES = new Set(
  ACTIVITES_GROUPS.flatMap((g) => g.items.map((i) => i.code))
);
const ALLOWED_REGIONS = new Set(REGIONS_FR.map((r) => r.code));

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

async function saveProfile(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié." };

  const proId = String(formData.get("pro_id") || "");
  if (!proId) return { ok: false, error: "pro_id manquant." };

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
    return {
      ok: false,
      error: "Fonctionnalité réservée aux abonnés Pro.",
    };
  }

  const metiers = parseJsonArray(formData.get("metiers")).filter((m) =>
    ALLOWED_METIERS.has(m)
  );
  if (metiers.length === 0) {
    return { ok: false, error: "Sélectionnez au moins un métier." };
  }

  const activites = parseJsonArray(formData.get("activites")).filter((a) =>
    ALLOWED_ACTIVITES.has(a)
  );

  const regionRaw = String(formData.get("region_code") || "").trim();
  const regionCode =
    regionRaw && ALLOWED_REGIONS.has(regionRaw) ? regionRaw : null;

  const fleetRaw = String(formData.get("fleet_size") || "").trim();
  const fleetSize = fleetRaw ? Number.parseInt(fleetRaw, 10) : null;

  const sefi = formData.get("sefi_certified") === "1";

  const tagsRaw = String(formData.get("custom_tags") || "");
  const customTags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20);

  const payload = {
    pro_id: proId,
    user_id: user.id,
    metiers,
    activites,
    region_code: regionCode,
    fleet_size: Number.isFinite(fleetSize) ? fleetSize : null,
    sefi_certified: sefi,
    custom_tags: customTags,
  };

  const { error } = await supabase
    .from("pro_compliance_profiles")
    .upsert(payload, { onConflict: "pro_id" });

  if (error) {
    console.error("[compliance] upsert error:", error.message);
    return { ok: false, error: "Enregistrement impossible. Réessayez." };
  }

  // Recalcul score (best-effort, non bloquant).
  await recomputeAndPersistScore(supabase, proId);

  return { ok: true };
}

export default async function ConformiteFichePage({
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
      `/auth/login?next=/transport-medical/pro/dashboard/conformite/${proId}`
    );
  }

  const { data: fiche } = await supabase
    .from("pros_sanitaire")
    .select("id, nom_commercial, raison_sociale, categorie, departement, plan, claimed_by")
    .eq("id", proId)
    .maybeSingle();

  if (!fiche || fiche.claimed_by !== user.id) {
    notFound();
  }

  const ficheName =
    (fiche.nom_commercial as string) ||
    (fiche.raison_sociale as string) ||
    "Mon entreprise";

  // Gate plan.
  if (!isPaidPlan(fiche.plan as string | null)) {
    return (
      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Breadcrumb ficheName={ficheName} proId={proId} />

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8 mt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-4 uppercase tracking-wide">
              <Crown className="h-3.5 w-3.5" />
              Réservé aux abonnés Pro
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              Conformité réglementaire ciblée
            </h1>
            <p className="text-slate-700 mb-4 leading-relaxed">
              Recevez uniquement les alertes réglementaires qui concernent votre activité réelle : ambulance, VSL, taxi conventionné, dialyse, urgence, île-de-France...
            </p>
            <ul className="space-y-2 text-sm text-slate-700 mb-6">
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-blue-700 mt-0.5 flex-shrink-0" />
                Profil de conformité par fiche (métiers + activités + région)
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-blue-700 mt-0.5 flex-shrink-0" />
                Alertes filtrées par votre périmètre, pas de bruit
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-blue-700 mt-0.5 flex-shrink-0" />
                Score de conformité et checklists (bientôt)
              </li>
            </ul>
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

  const defaultMetiers =
    profile?.metiers && profile.metiers.length > 0
      ? profile.metiers
      : [String(fiche.categorie)];

  const defaultRegion =
    profile?.region_code || null;

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Breadcrumb ficheName={ficheName} proId={proId} />

        <div className="mt-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            Profil de conformité
          </h1>
          <p className="text-slate-600">
            Pour <strong>{ficheName}</strong>. Plus c&apos;est précis, mieux on vous adresse uniquement les alertes pertinentes.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
          <ComplianceForm
            proId={proId}
            defaultMetiers={defaultMetiers}
            defaultActivites={profile?.activites || []}
            defaultRegionCode={defaultRegion}
            defaultFleetSize={profile?.fleet_size ?? null}
            defaultSefi={profile?.sefi_certified ?? false}
            defaultTags={profile?.custom_tags || []}
            action={saveProfile}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/transport-medical/pro/dashboard"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </Link>
          {profile && (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/transport-medical/pro/dashboard/conformite/${proId}/alertes`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition"
              >
                <ListChecks className="h-4 w-4" />
                Mes alertes ciblées
              </Link>
              <Link
                href={`/transport-medical/pro/dashboard/conformite/${proId}/calendrier`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:border-slate-300 transition"
              >
                Calendrier
              </Link>
            </div>
          )}
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
        <li className="text-slate-700">Conformité — {ficheName}</li>
      </ol>
    </nav>
  );
}
