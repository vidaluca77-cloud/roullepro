import type { Metadata } from "next";
import Link from "next/link";
import { Search, BadgeCheck, MessageCircle, BarChart3, Star, Shield } from "lucide-react";
import ReclamerRechercheForm from "@/components/sanitaire/ReclamerRechercheForm";
import PromoBanner from "@/components/sanitaire/PromoBanner";

export const metadata: Metadata = {
  title: "Espace pros — Réclamer ma fiche transport sanitaire",
  description:
    "Vous êtes ambulancier, VSL ou taxi conventionné ? Votre fiche est déjà pré-remplie. Récupérez-la gratuitement et recevez des demandes de patients.",
  alternates: { canonical: "/transport-medical/pro" },
};

export default function EspacePro() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white">
      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-6">
            <Shield className="w-3.5 h-3.5" />
            Espace professionnels du transport sanitaire
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-5 max-w-3xl">
            Votre fiche existe déjà. Récupérez-la en 2 minutes.
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl">
            Nous avons pré-rempli votre fiche à partir des données publiques de l'INSEE. Vérifiez-la,
            ajoutez vos informations, et recevez directement les demandes de transport de vos patients.
          </p>

          <ReclamerRechercheForm />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">Pourquoi réclamer votre fiche ?</h2>
        <p className="text-gray-600 text-center mb-10">Tout est gratuit pour démarrer. Vous passez en payant quand vous en tirez de la valeur.</p>

        <div className="grid md:grid-cols-3 gap-6">
          <Feature
            icon={<BadgeCheck className="w-6 h-6 text-[#0066CC]" />}
            title="Badge Pro vérifié"
            desc="Rassurez patients et familles avec un marqueur de confiance visible sur votre fiche."
          />
          <Feature
            icon={<MessageCircle className="w-6 h-6 text-[#0066CC]" />}
            title="Demandes directes"
            desc="Recevez téléphone et messages de patients qui cherchent vos services — sans intermédiaire."
          />
          <Feature
            icon={<BarChart3 className="w-6 h-6 text-[#0066CC]" />}
            title="Statistiques précises"
            desc="Suivez vues, appels cliqués et conversions, mois par mois, depuis votre espace pro."
          />
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">Nos abonnements pro</h2>
          <p className="text-gray-600 text-center mb-8">Sans engagement, résiliable en 1 clic. Fiche de base gratuite.</p>
          <div className="max-w-3xl mx-auto mb-10">
            <PromoBanner variant="hero" ctaHint="3 mois offerts sur le plan Essential pour les 100 premiers pros qui activent l’abonnement." />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <PlanCard
              name="Fiche gratuite"
              price="0 €"
              features={[
                "Fiche visible publiquement",
                "Téléphone cliquable",
                "Horaires + adresse",
                "Mention « Non vérifié »",
              ]}
              cta="Déjà actif"
              disabled
            />
            <PlanCard
              name="Essential"
              price="19,90 €/mois"
              features={[
                "Badge Pro vérifié",
                "Galerie de 5 photos",
                "Description étendue",
                "Statistiques de vues",
                "Lien site web cliquable",
              ]}
              cta="Commencer Essential"
              href="/transport-medical/tarifs"
            />
            <PlanCard
              name="Premium"
              price="39 €/mois"
              features={[
                "Tout Essential inclus",
                "Top 3 des résultats de ville",
                "Messagerie patients activée",
                "Badge Recommandé",
                "20 photos + vidéo",
                "Notifications temps réel",
              ]}
              cta="Commencer Premium"
              href="/transport-medical/tarifs"
              popular
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-6">
            Besoin du plan Pro+ (flotte multi-utilisateurs, API) ?{" "}
            <Link href="/contact" className="text-[#0066CC] hover:underline">Contactez-nous</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">{icon}</div>
      <div className="font-semibold text-gray-900 mb-2">{title}</div>
      <div className="text-sm text-gray-600 leading-relaxed">{desc}</div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  features,
  cta,
  href,
  popular,
  disabled,
}: {
  name: string;
  price: string;
  features: string[];
  cta: string;
  href?: string;
  popular?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl p-6 border-2 transition ${popular ? "border-indigo-400 shadow-xl" : "border-gray-200"}`}>
      {popular && (
        <div className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full mb-3">
          <Star className="w-3 h-3" />
          Le plus populaire
        </div>
      )}
      <div className="text-lg font-bold text-gray-900 mb-1">{name}</div>
      <div className="text-3xl font-bold text-[#0066CC] mb-5">{price}</div>
      <ul className="space-y-2 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="w-4 h-4 rounded-full bg-blue-100 text-[#0066CC] flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</span>
            {f}
          </li>
        ))}
      </ul>
      {disabled ? (
        <button
          disabled
          className="w-full bg-gray-100 text-gray-500 font-semibold px-4 py-2.5 rounded-xl cursor-not-allowed"
        >
          {cta}
        </button>
      ) : (
        <Link
          href={href || "#"}
          className={`block text-center font-semibold px-4 py-2.5 rounded-xl transition ${popular ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-[#0066CC] hover:bg-[#0052a3] text-white"}`}
        >
          {cta}
        </Link>
      )}
    </div>
  );
}
