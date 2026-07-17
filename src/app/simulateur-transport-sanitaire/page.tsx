import type { Metadata } from "next";
import Link from "next/link";
import { Car, Cross, Stethoscope, ChevronRight, ArrowRight } from "lucide-react";
import { buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/sanitaire-seo";
import { buildSimulateurJsonLd, jsonLdHtml } from "@/lib/seo-schema";

export const revalidate = 3600;

const TITLE = "Simulateur transport sanitaire 2026 : taxi, VSL, ambulance";
const DESCRIPTION =
  "Simulateur de transport sanitaire 2026 : estimez et comparez le prix d'un taxi conventionné, d'un VSL ou d'une ambulance selon la grille CPAM et l'avenant 11. Tableau comparatif et remboursement expliqué.";
const H1 = "Simulateur de transport sanitaire : taxi conventionné, VSL, ambulance";
const CANONICAL = "/simulateur-transport-sanitaire";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "website",
    locale: "fr_FR",
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Comment choisir entre taxi conventionné, VSL et ambulance ?",
    answer:
      "Le mode de transport est déterminé par le médecin sur la prescription, en fonction de votre état de santé. Le taxi conventionné et le VSL transportent des patients autonomes en position assise ; l'ambulance est réservée aux transports allongés ou sous surveillance médicale. Le VSL est conduit par un auxiliaire ambulancier, le taxi conventionné par un chauffeur agréé CPAM.",
  },
  {
    question: "Quel est le transport sanitaire le moins cher ?",
    answer:
      "Le taxi conventionné et le VSL, qui transportent des patients assis, sont généralement moins chers que l'ambulance, laquelle mobilise un véhicule équipé et un équipage qualifié. Le prix exact dépend de la distance, du département et de l'horaire : utilisez les simulateurs dédiés pour comparer les trois modes sur votre trajet réel.",
  },
  {
    question: "Les trois modes de transport sont-ils remboursés par la CPAM ?",
    answer:
      "Oui. Sur prescription médicale de transport, le taxi conventionné, le VSL et l'ambulance sont pris en charge par l'Assurance maladie à 65 % pour la plupart des motifs et à 100 % en cas d'ALD en lien avec le transport, d'accident du travail, de maladie professionnelle ou d'hospitalisation. Une franchise de 4 € par trajet (plafonnée à 8 €/jour et 50 €/an) reste à charge.",
  },
  {
    question: "Comment fonctionne le simulateur de transport sanitaire ?",
    answer:
      "Chaque simulateur calcule la distance entre vos adresses de départ et d'arrivée, puis applique la grille conventionnée du mode choisi : convention CPAM pour le taxi conventionné, convention des transporteurs sanitaires (avenant 11) pour le VSL et l'ambulance. Le résultat est une estimation indicative qui ne vaut pas devis.",
  },
  {
    question: "Sur quelle grille tarifaire reposent les estimations ?",
    answer:
      "Les estimations reposent sur les barèmes officiels 2026 : l'arrêté du 29 juillet 2025 pour le taxi conventionné et l'avenant 11 de la convention des transporteurs sanitaires pour le VSL et l'ambulance. Aucun tarif n'est inventé : les montants proviennent exclusivement de ces grilles, appliquées au département de votre course.",
  },
];

type ModeCard = {
  type: "taxi" | "vsl" | "ambulance";
  titre: string;
  href: string;
  icone: typeof Car;
  description: string;
  cta: string;
};

const MODES: ModeCard[] = [
  {
    type: "taxi",
    titre: "Taxi conventionné",
    href: "/simulateur-taxi-conventionne",
    icone: Car,
    description:
      "Pour les patients autonomes en position assise. Chauffeur agréé CPAM, grille conventionnée taxi (arrêté du 29 juillet 2025).",
    cta: "Simuler un taxi conventionné",
  },
  {
    type: "vsl",
    titre: "VSL",
    href: "/tarif-vsl",
    icone: Stethoscope,
    description:
      "Véhicule sanitaire léger conduit par un auxiliaire ambulancier, pour les patients assis nécessitant un accompagnement. Grille avenant 11.",
    cta: "Simuler un VSL",
  },
  {
    type: "ambulance",
    titre: "Ambulance",
    href: "/tarif-ambulance",
    icone: Cross,
    description:
      "Pour les transports allongés ou sous surveillance médicale. Véhicule équipé et équipage qualifié. Grille avenant 11.",
    cta: "Simuler une ambulance",
  },
];

export default function SimulateurTransportSanitairePage() {
  const faqLd = buildFaqJsonLd(FAQ);
  const breadLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Transport médical", url: "/transport-medical" },
    { name: "Simulateur transport sanitaire", url: CANONICAL },
  ]);
  const appLd = buildSimulateurJsonLd({
    name: "Simulateurs de transport sanitaire (taxi, VSL, ambulance)",
    description:
      "Comparez et estimez le prix d'un taxi conventionné, d'un VSL ou d'une ambulance selon la grille CPAM et l'avenant 11 (2026).",
    url: CANONICAL,
    featureList: [
      "Comparaison taxi conventionné, VSL et ambulance",
      "Estimation du prix par département",
      "Grille CPAM taxi et avenant 11 sanitaire",
      "Remboursement CPAM 65 % ou 100 %",
    ],
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(appLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadLd) }} />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/transport-medical" className="hover:text-white">Transport médical</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Simulateur transport sanitaire</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{H1}</h1>
          <p className="text-blue-100 max-w-2xl">
            Estimez et comparez en ligne le prix d&apos;un transport sanitaire selon le mode prescrit. Chaque
            simulateur applique la grille conventionnée en vigueur en 2026 (convention CPAM pour le taxi, avenant 11
            pour le VSL et l&apos;ambulance) à partir de vos adresses réelles.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid sm:grid-cols-3 gap-4">
          {MODES.map((m) => {
            const Icone = m.icone;
            return (
              <Link
                key={m.type}
                href={m.href}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 hover:border-[#0066CC] hover:shadow-md transition flex flex-col"
              >
                <div className="inline-flex items-center gap-2 text-[#0066CC] font-bold text-lg mb-2">
                  <Icone className="w-5 h-5" />
                  {m.titre}
                </div>
                <p className="text-sm text-gray-600 flex-1">{m.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066CC]">
                  {m.cta}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-sm sm:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">
        <section id="comparatif">
          <h2>Taxi conventionné, VSL ou ambulance : le comparatif</h2>
          <p>
            Ces trois modes de transport sanitaire répondent à des besoins différents et suivent des grilles
            tarifaires distinctes. Le tableau ci-dessous résume leurs principales caractéristiques ; le choix est
            toujours déterminé par le médecin sur la prescription, en fonction de votre état de santé.
          </p>
          <div className="not-prose overflow-x-auto my-6">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left font-semibold px-3 py-2.5 border-b border-gray-200">Critère</th>
                  <th className="text-left font-semibold px-3 py-2.5 border-b border-gray-200">Taxi conventionné</th>
                  <th className="text-left font-semibold px-3 py-2.5 border-b border-gray-200">VSL</th>
                  <th className="text-left font-semibold px-3 py-2.5 border-b border-gray-200">Ambulance</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2.5 font-medium">Position du patient</td>
                  <td className="px-3 py-2.5">Assis</td>
                  <td className="px-3 py-2.5">Assis</td>
                  <td className="px-3 py-2.5">Allongé / surveillance</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2.5 font-medium">Conducteur</td>
                  <td className="px-3 py-2.5">Chauffeur agréé CPAM</td>
                  <td className="px-3 py-2.5">Auxiliaire ambulancier</td>
                  <td className="px-3 py-2.5">Équipage qualifié (2 pers.)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2.5 font-medium">Grille tarifaire</td>
                  <td className="px-3 py-2.5">Convention CPAM taxi</td>
                  <td className="px-3 py-2.5">Avenant 11 sanitaire</td>
                  <td className="px-3 py-2.5">Avenant 11 sanitaire</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2.5 font-medium">Niveau de prix</td>
                  <td className="px-3 py-2.5">Modéré</td>
                  <td className="px-3 py-2.5">Modéré</td>
                  <td className="px-3 py-2.5">Le plus élevé</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2.5 font-medium">Transport partagé</td>
                  <td className="px-3 py-2.5">Possible</td>
                  <td className="px-3 py-2.5">Possible</td>
                  <td className="px-3 py-2.5">Non</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-medium">Remboursement CPAM</td>
                  <td className="px-3 py-2.5">65 % / 100 % ALD</td>
                  <td className="px-3 py-2.5">65 % / 100 % ALD</td>
                  <td className="px-3 py-2.5">65 % / 100 % ALD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="remboursement">
          <h2>Un remboursement commun aux trois modes</h2>
          <p>
            Quel que soit le mode prescrit, le remboursement suit les mêmes règles : sur prescription médicale de
            transport, l&apos;Assurance maladie prend en charge <strong>65 %</strong> du tarif conventionné pour la
            plupart des motifs, et <strong>100 %</strong> en cas d&apos;affection longue durée (ALD) en lien avec le
            transport, d&apos;accident du travail, de maladie professionnelle ou d&apos;hospitalisation. Le tiers
            payant évite d&apos;avancer la part remboursée ; une franchise de 4 € par trajet (plafonnée à 8 €/jour et
            50 €/an) reste à charge.
          </p>
          <p>
            Pour approfondir, consultez notre guide{" "}
            <Link href="/blog/remboursement-transport-medical">remboursement du transport médical</Link> ou les
            conditions officielles sur{" "}
            <a href="https://www.ameli.fr/assure/remboursements/rembourse/transports/prise-charge-frais-transport" target="_blank" rel="noopener noreferrer">
              ameli.fr
            </a>.
          </p>
        </section>

        <section id="simulateurs">
          <h2>Accéder aux simulateurs dédiés</h2>
          <p>
            Chaque mode dispose de son simulateur détaillé, avec le calcul complet et la possibilité de déposer une
            demande de transport auprès des professionnels de votre secteur :
          </p>
          <ul>
            <li>
              <Link href="/simulateur-taxi-conventionne">Simulateur de prix du taxi conventionné</Link> — grille CPAM 2026 ;
            </li>
            <li>
              <Link href="/tarif-vsl">Simulateur et prix du VSL</Link> — grille avenant 11 ;
            </li>
            <li>
              <Link href="/tarif-ambulance">Simulateur et tarif ambulance</Link> — grille avenant 11, prix avec ou sans prise en charge.
            </li>
          </ul>
        </section>
      </article>

      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Questions fréquentes sur le transport sanitaire
          </h2>
          <div className="space-y-4">
            {FAQ.map((q, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-900 mb-1">{q.question}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
