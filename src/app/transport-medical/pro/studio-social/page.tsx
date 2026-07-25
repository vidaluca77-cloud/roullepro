import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, CheckCircle2, ShieldCheck, Share2 } from "lucide-react";
import { peutUtiliserStudioSocial } from "@/lib/sanitaire-plans";
import { mistralConfigured } from "@/lib/ia-assistant";
import StudioSocial from "@/components/sanitaire/StudioSocial";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Studio réseaux sociaux IA",
  description:
    "Générez, planifiez et publiez vos posts Facebook, Instagram et Google Business Profile grâce à l'IA. Inclus dans l'abonnement Pro.",
  robots: { index: false, follow: false },
};

export default async function StudioSocialPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/transport-medical/pro/studio-social");
  }

  const { data: pros } = await supabase
    .from("pros_sanitaire")
    .select(
      "id, raison_sociale, nom_commercial, ville, plan, plan_expires_at, stripe_subscription_id"
    )
    .eq("claimed_by", user.id);

  const fiches = (pros || []) as {
    raison_sociale: string | null;
    nom_commercial: string | null;
    ville: string | null;
    plan: string | null;
    plan_expires_at: string | null;
    stripe_subscription_id: string | null;
  }[];
  const ficheActive = fiches.find((f) => peutUtiliserStudioSocial(f));

  if (!ficheActive) {
    return <StudioPresentation />;
  }

  const nomAffiche =
    ficheActive.nom_commercial || ficheActive.raison_sociale || "votre entreprise";

  return (
    <main className="min-h-screen bg-gray-50">
      <StudioSocial nomAffiche={nomAffiche} configured={mistralConfigured()} />
    </main>
  );
}

function StudioPresentation() {
  const avantages = [
    "Génération de posts localisés Facebook, Instagram et Google Business Profile",
    "Calendrier éditorial : conseils patients, zone desservie, coulisses, réassurance",
    "Ton professionnel et chaleureux, adapté à chaque plateforme",
    "Planification et publication automatique (bientôt) ou copie en un clic",
    "Personnalisé avec le nom, la ville et le département de votre entreprise",
    "8 posts générés et 8 publications par mois inclus dans l'abonnement Pro",
  ];
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-sm mb-4">
            <Sparkles className="w-4 h-4" /> Nouveau — réservé aux abonnés Pro
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Votre agent IA réseaux sociaux
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Un studio qui rédige vos posts localisés pour Facebook, Instagram et Google Business
            Profile, monte votre calendrier éditorial et publie à votre place. Concentrez-vous sur
            vos transports, l&apos;IA gère votre présence en ligne.
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
            <Share2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Débloquez le Studio réseaux sociaux</h2>
          </div>
          <p className="text-sm text-gray-600 mb-5 max-w-lg mx-auto">
            Le Studio est inclus dans l&apos;abonnement Pro, avec l&apos;équipe de 6 experts IA, la
            messagerie patients, le forum entre pros vérifiés et la veille réglementaire.
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
