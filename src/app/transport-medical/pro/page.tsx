import type { Metadata } from "next";
import Link from "next/link";
import { Search, BadgeCheck, MessageCircle, BarChart3, Star, Shield, Sparkles, Users, CheckCircle2 } from "lucide-react";
import ReclamerRechercheForm from "@/components/sanitaire/ReclamerRechercheForm";

export const metadata: Metadata = {
  title: "Espace pros ambulanciers, VSL et taxis conventionnés — Réclamer ma fiche gratuitement",
  description:
    "Ambulancier, VSL ou taxi conventionné CPAM ? Votre fiche est déjà créée sur le 1er annuaire du transport sanitaire en France (26 000+ pros). Réclamez-la gratuitement, recevez les demandes patients en direct, sans commission. Forum entre pros vérifiés. Badge Pro vérifié, statistiques, veille réglementaire et équipe de 6 experts IA sourcés à partir de 19,90€/mois.",
  keywords: [
    "annuaire ambulancier",
    "annuaire VSL",
    "annuaire taxi conventionné",
    "réclamer fiche transport sanitaire",
    "logiciel ambulancier",
    "référencement entreprise ambulance",
    "acquisition patients transport médical",
    "plateforme transport sanitaire France",
  ],
  alternates: { canonical: "/transport-medical/pro" },
  openGraph: {
    title: "Espace pros transport sanitaire — Réclamer votre fiche RoullePro",
    description: "Le 1er annuaire ambulance, VSL et taxi conventionné CPAM en France. 26 000+ pros référencés. Réclamez votre fiche gratuitement.",
    type: "website",
    locale: "fr_FR",
  },
};

const proPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "RoullePro — Référencement pro du transport sanitaire",
  serviceType: "Référencement et acquisition de patients pour ambulanciers, VSL et taxis conventionnés CPAM",
  provider: {
    "@type": "Organization",
    name: "RoullePro",
    url: "https://roullepro.com",
  },
  areaServed: { "@type": "Country", name: "France" },
  audience: {
    "@type": "BusinessAudience",
    audienceType: "Ambulanciers, sociétés de VSL, taxis conventionnés CPAM",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Abonnements pro RoullePro",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Fiche gratuite",
        price: "0",
        priceCurrency: "EUR",
        description: "Fiche visible publiquement, téléphone cliquable, horaires + adresse",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "19.90",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "19.90",
          priceCurrency: "EUR",
          unitText: "MONTH",
        },
        description: "Badge Pro vérifié, messagerie patients, équipe de 6 experts IA du transport sanitaire (réponses sourcées ameli.fr, Légifrance…), forum entre pros vérifiés, veille réglementaire, statistiques",
      },
    ],
  },
};

export default function EspacePro() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(proPageJsonLd) }}
      />
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

      {/* Nouveautés : équipe d'experts IA + forum */}
      <section className="max-w-5xl mx-auto px-4 pb-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-7">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Inclus dans le plan Pro
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Une équipe de 6 experts IA dédiés</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Assistant général, Expert Réglementaire, Expert Facturation, Conseiller Commercial, Conseiller RH et
              Conseiller Gestion : des réponses concrètes à vos questions métier, appuyées sur des sources
              officielles (ameli.fr, Légifrance, service-public.fr, URSSAF…) avec citations cliquables et mémoire
              de vos conversations.
            </p>
            <ul className="space-y-2">
              {[
                "Conventionnement CPAM, agréments ARS, cartes pro",
                "Facturation SEFi/B2, rejets NOEMIE, tarifs et majorations",
                "Marchés publics, RH ambulancier, fiscalité et gestion",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-7">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0066CC] bg-blue-100 px-3 py-1 rounded-full mb-3">
              <Users className="w-3.5 h-3.5" /> Réservé aux pros vérifiés
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Le forum entre professionnels</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Échangez entre confrères du transport sanitaire dans 7 catégories métier. La lecture est ouverte à
              tous ; publier et répondre est réservé aux professionnels vérifiés (fiche réclamée et validée).
            </p>
            <ul className="space-y-2">
              {[
                "Conventionnement, facturation, réglementation",
                "Matériel & véhicules, emploi & RH",
                "Entraide entre confrères et retours d'expérience",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/forum" className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066CC] hover:underline mt-4">
              Découvrir le forum
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">Nos abonnements pro</h2>
          <p className="text-gray-600 text-center mb-8">Sans engagement, résiliable en 1 clic. Fiche de base gratuite.</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <PlanCard
              name="Fiche gratuite"
              price="0 €"
              features={[
                "Fiche visible publiquement",
                "Téléphone cliquable",
                "Horaires + adresse",
                "Mention « Non vérifié »",
                "Forum entre pros (écriture pour pros vérifiés)",
              ]}
              cta="Déjà actif"
              disabled
            />
            <PlanCard
              name="Plan Pro"
              price="19,90 €/mois"
              features={[
                "2 mois d'essai offerts",
                "Badge Pro vérifié",
                "Messagerie patients activée",
                "Équipe de 6 experts IA du transport sanitaire (réponses sourcées)",
                "Forum entre pros vérifiés (écriture)",
                "Galerie de 5 photos, description étendue",
                "Veille réglementaire métier (alertes email)",
                "Tableau de bord conformité",
                "Statistiques de vues et notifications email",
              ]}
              cta="Activer le plan Pro"
              href="/transport-medical/tarifs"
              popular
            />
          </div>
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
