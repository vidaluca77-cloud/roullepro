import type { Metadata } from "next";
import InscriptionForm from "@/components/sanitaire/InscriptionForm";

export const metadata: Metadata = {
  title: "Inscrire mon entreprise de transport sanitaire — RoullePro",
  description:
    "Ambulances, VSL, taxis conventionnés : créez votre fiche gratuitement en 3 minutes. Sans carte bancaire.",
  alternates: {
    canonical: "https://roullepro.com/transport-medical/inscription",
  },
  openGraph: {
    title: "Inscrire mon entreprise de transport sanitaire — RoullePro",
    description:
      "Ambulances, VSL, taxis conventionnés : créez votre fiche gratuitement en 3 minutes. Sans carte bancaire.",
    type: "website",
    url: "https://roullepro.com/transport-medical/inscription",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Inscription pros transport sanitaire",
  description:
    "Inscrivez gratuitement votre entreprise de transport sanitaire (ambulance, VSL, taxi conventionné) sur RoullePro.",
  url: "https://roullepro.com/transport-medical/inscription",
  provider: {
    "@type": "Organization",
    name: "RoullePro",
    url: "https://roullepro.com",
  },
  serviceType: "Annuaire transport sanitaire",
  areaServed: {
    "@type": "Country",
    name: "France",
  },
};

export default function InscriptionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-gradient-to-b from-white to-blue-50/40">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* En-tête */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-[#0066CC] text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              🚑 Inscription gratuite · Sans CB
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Inscrivez votre entreprise
            </h1>
            <p className="text-gray-600 leading-relaxed max-w-lg mx-auto">
              Votre entreprise n'est pas encore dans notre annuaire ? Créez votre fiche gratuitement
              en 3 minutes et recevez directement les demandes de patients.
            </p>
          </div>

          {/* Carte formulaire */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <InscriptionForm />
          </div>

          {/* Note déjà référencé */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Votre entreprise est déjà dans l'annuaire ?{" "}
            <a
              href="/transport-medical/pro/reclamer"
              className="text-[#0066CC] hover:underline font-medium"
            >
              Réclamez votre fiche existante
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
