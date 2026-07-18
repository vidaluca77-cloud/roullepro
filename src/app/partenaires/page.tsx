import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Users, ArrowRight, ShieldCheck, Scale } from "lucide-react";

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

        <section aria-labelledby="nos-partenaires" className="mb-10">
          <h2
            id="nos-partenaires"
            className="text-xl font-bold text-gray-900 mb-4"
          >
            Nos partenaires
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-blue-700" />
                <h3 className="font-semibold text-gray-900">
                  Giva — Assurance pro
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
                Devis en ligne d&apos;assurance professionnelle adaptée au
                transport sanitaire (ambulance, VSL, taxi conventionné) via notre
                courtier partenaire.
              </p>
              <Link
                href="/partenaires/assurance-pro"
                className="inline-flex items-center gap-1.5 text-sm bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-4 py-2 rounded-xl transition self-start"
              >
                Découvrir l&apos;offre
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-5 h-5 text-amber-700" />
                <h3 className="font-semibold text-gray-900">
                  Allopoints Protect — Permis
                </h3>
                <span className="ml-auto inline-flex items-center rounded-full bg-amber-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  −5 %
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
                Protégez votre permis, votre outil de travail. Contestation des
                contraventions avec perte de points par des avocats spécialistes
                (95 % de réussite). −5 % avec RoullePro.
              </p>
              <Link
                href="/partenaires/protection-permis"
                className="inline-flex items-center gap-1.5 text-sm bg-amber-700 hover:bg-amber-800 text-white font-semibold px-4 py-2 rounded-xl transition self-start"
              >
                Découvrir l&apos;offre
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

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
