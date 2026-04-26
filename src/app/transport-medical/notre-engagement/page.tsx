import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Phone,
  Heart,
  XCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Notre engagement — RoullePro Transport Médical",
  description:
    "RoullePro n'est pas une plateforme VTC pour le transport sanitaire. Pas d'algorithme, pas de notation publique, pas de commission. Vous gardez vos patients et votre liberté.",
  alternates: { canonical: "/transport-medical/notre-engagement" },
  openGraph: {
    title: "Notre engagement — RoullePro Transport Médical",
    description:
      "Pas d'algorithme. Pas de notation publique. Pas de commission. Vous gardez vos patients.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function NotreEngagementPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-4xl mx-auto px-4 py-14">
          <p className="text-blue-200 text-sm font-medium mb-3">
            Notre engagement
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            RoullePro n&apos;est pas Uber pour le transport sanitaire.
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-2xl">
            Vous gardez vos patients. Vous gardez vos tarifs. Vous gardez votre liberté.
            Nous remplaçons votre standard téléphonique, pas votre relation client.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pourquoi cet engagement ?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Le transport sanitaire est un métier de confiance et de proximité. Le chauffeur
            connaît ses patients réguliers, leur état de santé, leurs habitudes. Cette relation
            humaine n&apos;a pas vocation à être remplacée par un algorithme qui distribue les
            courses de manière opaque, comme c&apos;est le cas dans le monde du VTC.
          </p>
          <p className="text-gray-700 leading-relaxed">
            RoullePro n&apos;est pas une plateforme de mise en relation algorithmique.
            C&apos;est un annuaire moderne, doublé d&apos;une boîte de réception, qui
            facilite le premier contact entre patients, prescripteurs et professionnels du
            transport sanitaire — sans jamais s&apos;interposer dans la relation qui suit.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-5">
          Nos 5 engagements concrets
        </h2>

        <div className="space-y-4 mb-10">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 flex gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-6 h-6 text-[#0066CC]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Pas d&apos;algorithme de matching</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Jamais RoullePro ne décide à quel professionnel va une demande. C&apos;est
                toujours le patient ou le prescripteur qui choisit, en regardant les fiches
                comme dans un annuaire classique. Aucun pro n&apos;est &laquo;&nbsp;envoyé&nbsp;&raquo;
                quelque part par une machine.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 flex gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-[#0066CC]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Vos patients restent vos patients</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Une fois en relation, RoullePro disparaît. Vous échangez vos numéros, vous
                fidélisez votre clientèle, vous prenez vos rendez-vous suivants directement,
                sans repasser par notre site. Votre fonds de commerce vous appartient.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 flex gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-[#0066CC]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">
                Votre numéro reste visible gratuitement, à vie
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Téléphone, email, site internet&nbsp;: vos coordonnées publiques sont toujours
                affichées sur votre fiche, peu importe votre abonnement. Nous ne facturons jamais
                l&apos;accès au contact d&apos;un professionnel.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 flex gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-[#0066CC]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">
                Pas de notation publique ni de classement par étoiles
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Aucun score de réactivité ne vous pénalise si vous prenez vos vacances, si
                vous refusez une course ou si vous éteignez votre téléphone le dimanche. Pas
                d&apos;étoiles affichées qui enterreraient un nouveau pro face à un confrère
                installé. La modération se fait à l&apos;humain, sur signalement.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 flex gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#0066CC]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">
                Pas de commission. Tarification transparente.
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Nous ne prélevons rien sur vos courses. Notre modèle est simple&nbsp;: un
                abonnement plat optionnel pour ceux qui veulent plus de visibilité ou des leads
                de prescripteurs (EHPAD, cabinets médicaux). En 2026, toutes les fonctionnalités
                de base sont gratuites pour les professionnels.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 sm:p-8 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            Comparaison avec une plateforme VTC
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-blue-200">
                  <th className="text-left py-3 pr-4 text-gray-600 font-medium">&nbsp;</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Plateforme VTC type
                  </th>
                  <th className="text-left py-3 pl-4 text-[#0066CC] font-bold">RoullePro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-700">Distribution des courses</td>
                  <td className="py-3 px-4 text-gray-600">Algorithme automatique</td>
                  <td className="py-3 pl-4 text-gray-900 font-medium">Le client choisit</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-700">Commission</td>
                  <td className="py-3 px-4 text-gray-600">20-25% par course</td>
                  <td className="py-3 pl-4 text-gray-900 font-medium">0% sur les courses</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-700">Notation</td>
                  <td className="py-3 px-4 text-gray-600">Étoiles publiques, suspension</td>
                  <td className="py-3 pl-4 text-gray-900 font-medium">Aucune</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-700">Relation client</td>
                  <td className="py-3 px-4 text-gray-600">Anonymisée, propriété de la plateforme</td>
                  <td className="py-3 pl-4 text-gray-900 font-medium">Directe, à vous</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-700">Numéro de téléphone</td>
                  <td className="py-3 px-4 text-gray-600">Masqué</td>
                  <td className="py-3 pl-4 text-gray-900 font-medium">Affiché publiquement</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-gray-700">Tarifs</td>
                  <td className="py-3 px-4 text-gray-600">Imposés, dynamiques</td>
                  <td className="py-3 pl-4 text-gray-900 font-medium">Tarifs Sécu standards</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border-2 border-[#0066CC] rounded-2xl p-6 sm:p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-[#0066CC] mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Vous êtes professionnel du transport sanitaire&nbsp;?
          </h2>
          <p className="text-gray-700 mb-6 max-w-xl mx-auto leading-relaxed">
            Réclamez votre fiche gratuitement et rejoignez un annuaire qui respecte
            votre métier. Pendant toute l&apos;année 2026, l&apos;ensemble des fonctionnalités
            est gratuit pour les professionnels.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/transport-medical"
              className="inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              Trouver ma fiche dans l&apos;annuaire
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/transport-medical/inscription"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#0066CC] border-2 border-[#0066CC] font-semibold px-6 py-3 rounded-xl transition"
            >
              Inscrire mon entreprise
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          Une question&nbsp;? Écrivez-nous à{" "}
          <a href="mailto:contact@roullepro.com" className="text-[#0066CC] hover:underline">
            contact@roullepro.com
          </a>
        </p>
      </section>
    </main>
  );
}
