import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Phone,
  HeartHandshake,
  Stethoscope,
  Building2,
  Cross,
  Activity,
} from "lucide-react";
import PrescripteurForm from "./PrescripteurForm";

export const metadata: Metadata = {
  title: "Accès pilote prescripteurs",
  description:
    "Trouvez un transport sanitaire disponible pour votre patient en 30 secondes. Accès gratuit pendant 3 mois, sans engagement. Pour cabinets médicaux, hôpitaux, EHPAD et centres de dialyse.",
  alternates: { canonical: "https://roullepro.com/prescripteurs" },
  openGraph: {
    title: "Accès pilote prescripteurs — RoullePro",
    description:
      "Trouvez un transport sanitaire disponible pour votre patient en 30 secondes. Accès gratuit 3 mois.",
    url: "https://roullepro.com/prescripteurs",
    type: "website",
  },
};

export default function PrescripteursPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50/40">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#003F7F] via-[#0052a3] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium mb-6">
              <BadgeCheck className="w-3.5 h-3.5" />
              Programme pilote — accès gratuit 3 mois
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4 max-w-3xl mx-auto">
              Trouvez un transport sanitaire disponible pour votre patient en
              30 secondes
            </h1>
            <p className="text-base sm:text-lg text-blue-100 mb-2 max-w-2xl mx-auto">
              Accès gratuit pendant 3 mois. Aucun engagement.
            </p>
            <p className="text-sm text-blue-200 max-w-2xl mx-auto">
              Annuaire opérationnel du transport sanitaire en France. Pas
              d&apos;algorithme, pas de notation. Contacts visibles à vie.
            </p>
          </div>
        </div>
      </section>

      {/* Bénéfices */}
      <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              <Phone className="w-5 h-5 text-[#0066CC]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1.5">
              Numéros directs
            </h3>
            <p className="text-sm text-gray-600">
              Le téléphone du professionnel, pas un standard. Pas
              d&apos;intermédiaire, pas de centrale d&apos;appels.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              <BadgeCheck className="w-5 h-5 text-[#0066CC]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1.5">
              Annuaire complet
            </h3>
            <p className="text-sm text-gray-600">
              Plus de 24 000 fiches actives en France : ambulances, VSL, taxis
              conventionnés. Mises à jour en continu.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              <HeartHandshake className="w-5 h-5 text-[#0066CC]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1.5">
              Gratuit pour vos patients
            </h3>
            <p className="text-sm text-gray-600">
              Vos patients ne paient rien. Aucune commission cachée, aucune
              surfacturation.
            </p>
          </div>
        </div>
      </section>

      {/* Pour qui */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pour qui ?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Stethoscope, label: "Cabinets médicaux" },
              { icon: Cross, label: "Hôpitaux & cliniques" },
              { icon: Building2, label: "EHPAD" },
              { icon: Activity, label: "Centres de dialyse" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-blue-50/60 border border-blue-100"
              >
                <Icon className="w-4 h-4 text-[#0066CC] flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulaire */}
      <section
        id="formulaire"
        className="max-w-2xl mx-auto px-4 pb-16 sm:pb-24 scroll-mt-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Demander un accès pilote
          </h2>
          <p className="text-sm text-gray-600">
            Remplissez ce formulaire, nous revenons vers vous sous 48h ouvrées.
          </p>
        </div>

        <PrescripteurForm />

        <p className="mt-6 text-center text-sm text-gray-500">
          Une question ?{" "}
          <a
            href="mailto:contact@roullepro.com"
            className="text-[#0066CC] hover:underline"
          >
            contact@roullepro.com
          </a>
        </p>
      </section>

      {/* Footer infos */}
      <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
        <p className="text-xs text-gray-400">
          RoullePro est un service indépendant. Notre engagement :{" "}
          <Link href="/transport-medical/notre-engagement" className="underline hover:text-gray-600">
            transparence sur nos critères
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
