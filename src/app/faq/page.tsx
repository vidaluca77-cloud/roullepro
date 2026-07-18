import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";
import { FAQ_GLOBALE } from "@/lib/faq-globale";
import { jsonLdHtml } from "@/lib/seo-schema";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "FAQ transport sanitaire — Tout ce qu'il faut savoir",
  description:
    "Toutes vos questions sur l'ambulance, le VSL et le taxi conventionné CPAM : remboursement, prescription, conventionnement, transport partagé 2025, agréments ARS. Réponses claires et officielles.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ transport sanitaire — Tout ce qu'il faut savoir | RoullePro",
    description:
      "Ambulance, VSL, taxi conventionné CPAM : remboursement, prescription, conventionnement, transport partagé 2025. Vos questions, nos réponses.",
    type: "website",
    locale: "fr_FR",
  },
};

// Groupes thématiques pour organiser l'accordéon
const GROUPES = [
  {
    id: "types",
    titre: "Types de transport sanitaire",
    indices: [0, 7, 8, 16],
  },
  {
    id: "remboursement",
    titre: "Remboursement et prise en charge",
    indices: [1, 9, 14, 15, 21],
  },
  {
    id: "prescription",
    titre: "Prescription et démarches patients",
    indices: [2, 17, 18, 19, 20],
  },
  {
    id: "conventionnement",
    titre: "Conventionnement et agréments",
    indices: [3, 4, 5, 10, 13, 22],
  },
  {
    id: "reglementation",
    titre: "Réglementation 2025-2027",
    indices: [6, 11, 23],
  },
  {
    id: "professionnels",
    titre: "Pour les professionnels",
    indices: [12, 24],
  },
];

export default function FaqPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_GLOBALE.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.reponse,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(faqLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-4xl mx-auto px-4 py-14">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-6">
            <Link href="/" className="hover:text-white">
              Accueil
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">FAQ</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            FAQ transport sanitaire
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Ambulance, VSL, taxi conventionné CPAM : toutes les réponses sur le
            transport médical remboursé par la Sécurité sociale.
          </p>
          <p className="mt-3 text-xs text-blue-300">
            {FAQ_GLOBALE.length} questions répondues — mis à jour{" "}
            {new Date().toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
              timeZone: "Europe/Paris",
            })}
          </p>
        </div>
      </section>

      {/* Navigation thématique */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {GROUPES.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:border-[#0066CC] hover:text-[#0066CC] transition"
            >
              {g.titre}
            </a>
          ))}
        </div>

        {/* Accordéons par groupe */}
        <div className="space-y-10">
          {GROUPES.map((groupe) => (
            <section key={groupe.id} id={groupe.id}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                {groupe.titre}
              </h2>
              <div className="divide-y divide-gray-200 rounded-2xl bg-white border border-gray-200 overflow-hidden">
                {groupe.indices.map((idx) => {
                  const item = FAQ_GLOBALE[idx];
                  if (!item) return null;
                  return (
                    <details
                      key={idx}
                      className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                        <h3 className="font-semibold text-gray-900 text-base leading-snug">
                          {item.question}
                        </h3>
                        <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed text-sm">
                        {item.reponse}
                      </p>
                    </details>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* FAQ complète sans groupe */}
        <section id="toutes-les-questions" className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Toutes les questions
          </h2>
          <div className="divide-y divide-gray-200 rounded-2xl bg-white border border-gray-200 overflow-hidden">
            {FAQ_GLOBALE.map((item, idx) => (
              <details
                key={idx}
                className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                  <h3 className="font-semibold text-gray-900 text-base leading-snug">
                    {item.question}
                  </h3>
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-gray-700 leading-relaxed text-sm">
                  {item.reponse}
                </p>
              </details>
            ))}
          </div>
        </section>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Trouver un transporteur sanitaire
            </h2>
            <p className="text-gray-600 text-sm">
              Ambulances, VSL et taxis conventionnés près de chez vous.
              Téléphone direct, horaires, conventionnement CPAM vérifié.
            </p>
          </div>
          <Link
            href="/transport-medical"
            className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-3 rounded-xl transition whitespace-nowrap"
          >
            Accéder à l&apos;annuaire
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
