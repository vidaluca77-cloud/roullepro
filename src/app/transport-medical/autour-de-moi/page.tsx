import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, LocateFixed } from "lucide-react";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/lib/sanitaire-seo";
import AutourDeMoiClient from "./AutourDeMoiClient";

export const revalidate = 86400;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

const TITRE = "Ambulance, VSL et taxi conventionné autour de moi — Transport sanitaire près de chez vous";
const DESCRIPTION =
  "Trouvez une ambulance, un VSL ou un taxi conventionné CPAM autour de vous en un clic. Géolocalisation instantanée, téléphone direct, plus de 25 000 professionnels agréés ARS et conventionnés Sécurité sociale partout en France.";

export const metadata: Metadata = {
  title: TITRE,
  description: DESCRIPTION,
  alternates: { canonical: "/transport-medical/autour-de-moi" },
  openGraph: { title: TITRE, description: DESCRIPTION, type: "website", locale: "fr_FR" },
  twitter: { card: "summary_large_image", title: TITRE, description: DESCRIPTION },
};

const FAQS = [
  {
    question: "Comment trouver une ambulance autour de moi ?",
    answer:
      "Cliquez sur « Trouver les transports autour de moi » : votre navigateur détecte votre position et affiche instantanément les ambulances, VSL et taxis conventionnés les plus proches, classés par distance, avec leur numéro de téléphone. Vous pouvez aussi rechercher par ville ou code postal.",
  },
  {
    question: "Le transport sanitaire près de chez moi est-il remboursé ?",
    answer:
      "Oui. Sur prescription médicale, le transport en ambulance, VSL ou taxi conventionné est pris en charge par la Sécurité sociale à 55 % du tarif conventionné, et à 100 % en cas d'Affection Longue Durée (ALD), de maternité, d'accident du travail ou d'hospitalisation liée. Le tiers payant évite l'avance de frais.",
  },
  {
    question: "Quelle est la différence entre ambulance, VSL et taxi conventionné ?",
    answer:
      "L'ambulance assure un transport médicalisé allongé avec équipage diplômé (DEA) et matériel médical, pour les urgences ou les patients allongés. Le VSL transporte les patients assis en état stable (dialyse, chimiothérapie, consultations). Le taxi conventionné est un taxi agréé par la CPAM pour les patients autonomes sur prescription.",
  },
  {
    question: "Ma position est-elle enregistrée ?",
    answer:
      "Non. Votre position est utilisée uniquement dans votre navigateur pour calculer les professionnels les plus proches. Elle n'est ni stockée, ni transmise à un tiers.",
  },
  {
    question: "Les ambulances sont-elles disponibles 24h/24 autour de moi ?",
    answer:
      "De nombreuses sociétés d'ambulances conventionnées assurent une permanence de garde 24h/24 pour les transports urgents. Pour les transports programmés (VSL, taxi conventionné : dialyse, consultation, examen), il est recommandé de réserver à l'avance.",
  },
];

export default function AutourDeMoiPage() {
  const breadLd = buildBreadcrumbJsonLd([
    { name: "Annuaire", url: "/transport-medical" },
    { name: "Autour de moi", url: "/transport-medical/autour-de-moi" },
  ]);
  const faqLd = buildFaqJsonLd(FAQS);
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Transport sanitaire autour de moi — RoullePro",
    url: `${BASE_URL}/transport-medical/autour-de-moi`,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: DESCRIPTION,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4 flex-wrap">
            <Link href="/transport-medical" className="hover:text-white">Annuaire</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Autour de moi</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
            <LocateFixed className="w-8 h-8 flex-shrink-0" />
            Transport sanitaire autour de moi
          </h1>
          <p className="text-blue-100 max-w-3xl">
            Ambulance, VSL ou taxi conventionné CPAM près de chez vous, géolocalisés en un clic. Plus de
            25 000 professionnels agréés ARS et conventionnés Sécurité sociale, partout en France.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8">
        <AutourDeMoiClient />

        <article className="bg-white border border-gray-200 rounded-2xl p-6 mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Trouver un transport sanitaire près de chez vous
          </h2>
          <div className="space-y-3 text-gray-700 leading-relaxed">
            <p>
              RoullePro référence plus de 25 000 professionnels du transport sanitaire partout en France :
              sociétés d'ambulances, Véhicules Sanitaires Légers (VSL) et taxis conventionnés par la CPAM. La
              recherche « autour de moi » utilise la géolocalisation de votre appareil pour afficher, en temps
              réel, les professionnels les plus proches, classés par distance, avec leur numéro de téléphone en
              accès direct.
            </p>
            <p>
              Que vous cherchiez une <strong>ambulance autour de vous</strong> pour un transport allongé, un{" "}
              <strong>VSL</strong> pour une séance de dialyse ou de chimiothérapie, ou un{" "}
              <strong>taxi conventionné CPAM près de chez vous</strong> pour une consultation, tous les
              établissements référencés sont agréés par l'Agence Régionale de Santé (ARS) ou conventionnés par
              l'Assurance maladie. Le transport sanitaire prescrit par un médecin est remboursé par la Sécurité
              sociale, avec tiers payant : vous n'avancez pas les frais.
            </p>
            <p>
              Vous préférez chercher par commune ? Utilisez la{" "}
              <Link href="/transport-medical/recherche" className="text-[#0066CC] underline">
                recherche par ville
              </Link>{" "}
              ou parcourez l'
              <Link href="/transport-medical" className="text-[#0066CC] underline">
                annuaire complet du transport médical
              </Link>
              .
            </p>
          </div>
        </article>

        <article className="bg-white border border-gray-200 rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Questions fréquentes</h2>
          <div className="space-y-4">
            {FAQS.map((q, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-900 mb-1">{q.question}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
