import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, CheckCircle2, ShieldCheck, MessageSquare } from "lucide-react";
import { isPaidPlan } from "@/lib/sanitaire-plans";
import { mistralConfigured } from "@/lib/ia-assistant";
import AssistantChat from "@/components/sanitaire/AssistantChat";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Équipe d'experts IA métier",
  description:
    "Votre équipe de 6 experts IA du transport sanitaire (réglementaire, facturation, commercial, RH, gestion) avec réponses sourcées (ameli.fr, Légifrance…). Réservé aux abonnés Pro.",
  robots: { index: false, follow: false },
};

export default async function AssistantPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/transport-medical/pro/assistant");
  }

  const { data: pros } = await supabase
    .from("pros_sanitaire")
    .select("id, raison_sociale, nom_commercial, ville, plan")
    .eq("claimed_by", user.id);

  const fiches = (pros || []) as {
    id: string;
    raison_sociale: string | null;
    nom_commercial: string | null;
    ville: string | null;
    plan: string | null;
  }[];
  const fichePayante = fiches.find((f) => isPaidPlan(f.plan));

  // Non-payant : page de présentation + CTA d'upgrade.
  if (!fichePayante) {
    return <AssistantPresentation />;
  }

  const nomAffiche =
    fichePayante.nom_commercial || fichePayante.raison_sociale || "votre entreprise";

  return (
    <main className="min-h-screen bg-gray-50">
      <AssistantChat nomAffiche={nomAffiche} configured={mistralConfigured()} />
    </main>
  );
}

function AssistantPresentation() {
  const avantages = [
    "Conventionnement CPAM, agréments et quotas de véhicules",
    "Facturation SEFi / B2, télétransmission et gestion des rejets NOEMIE",
    "Tarifs préfectoraux, majorations et abattement conventionnel",
    "Réglementation taxi conventionné, VSL et ambulance (ARS, cartes pro)",
    "Prescriptions médicales de transport (PMT), séries, ALD",
    "Marchés publics, garde ambulancière et RH ambulancier",
  ];
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-sm mb-4">
            <Sparkles className="w-4 h-4" /> Nouveau — réservé aux abonnés Pro
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Votre équipe de 6 experts IA du transport sanitaire
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Assistant général, Expert Réglementaire, Expert Facturation, Conseiller Commercial, Conseiller RH et
            Conseiller Gestion. Des réponses concrètes appuyées sur des sources officielles (ameli.fr, Légifrance,
            service-public.fr, URSSAF…) avec citations cliquables, disponibles 24h/24.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {avantages.map((a) => (
            <div key={a} className="flex items-start gap-3 bg-white border border-gray-200 rounded-2xl p-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{a}</span>
            </div>
          ))}
        </div>

        <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Débloquez l&apos;assistant IA</h2>
          </div>
          <p className="text-sm text-gray-600 mb-5 max-w-lg mx-auto">
            L&apos;équipe de 6 experts IA est incluse dans l&apos;abonnement Pro, avec la messagerie
            patients, le forum entre pros vérifiés, la veille réglementaire et le tableau de bord conformité.
          </p>
          <Link
            href="/transport-medical/tarifs"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            <Sparkles className="w-4 h-4" /> Voir les offres Pro
          </Link>
          <p className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Sans engagement, résiliable en 1 clic
          </p>
        </div>
      </section>
    </main>
  );
}
