import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Users, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Programme partenaire",
  description:
    "Programme partenaire RoullePro pour assureurs, fournisseurs d'équipement, logiciels métier et centres de formation pour ambulanciers et taxis conventionnés.",
  alternates: { canonical: "https://roullepro.com/partenaires" },
  openGraph: {
    title: "Programme partenaire — RoullePro",
    description:
      "Notre programme partenaire est en cours de lancement. Contactez-nous.",
    url: "https://roullepro.com/partenaires",
    type: "website",
  },
};

export default function PartenairesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50/40">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 mb-6">
            <Users className="w-6 h-6 text-[#0066CC]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Programme partenaire RoullePro
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            En cours de lancement.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-6">
          <p className="text-gray-700 leading-relaxed">
            Vous êtes <strong>assureur</strong>, <strong>fournisseur d&apos;équipement</strong>,
            éditeur de <strong>logiciel métier</strong> ou{" "}
            <strong>centre de formation</strong> pour ambulanciers et taxis
            conventionnés ?
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            Notre programme partenaire est en cours de lancement. Nous
            cherchons à mettre en avant des acteurs qui apportent une vraie
            valeur aux 24 000+ professionnels du transport sanitaire référencés
            sur RoullePro.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            Contactez-nous pour échanger :
          </p>
          <a
            href="mailto:contact@roullepro.com?subject=Programme%20partenaire%20RoullePro"
            className="mt-5 inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-3 rounded-xl transition"
          >
            <Mail className="w-4 h-4" />
            contact@roullepro.com
          </a>
        </div>

        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 sm:p-6">
          <p className="text-sm text-gray-700">
            <strong className="text-gray-900">Notre engagement :</strong>{" "}
            transparence totale sur nos critères de sélection. Aucune mise en
            avant payante des fiches professionnelles. Pas d&apos;algorithme,
            pas de notation. Voir{" "}
            <Link
              href="/transport-medical/notre-engagement"
              className="text-[#0066CC] hover:underline inline-flex items-center gap-1"
            >
              notre charte
              <ArrowRight className="w-3 h-3" />
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
