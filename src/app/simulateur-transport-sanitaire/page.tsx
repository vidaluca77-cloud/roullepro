import type { Metadata } from "next";
import Link from "next/link";
import {
  Car,
  Cross,
  Stethoscope,
  ChevronRight,
  ArrowRight,
  Scale,
  ShieldCheck,
  Wallet,
  LayoutGrid,
  HelpCircle,
} from "lucide-react";
import { buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/sanitaire-seo";
import { buildSimulateurJsonLd, jsonLdHtml } from "@/lib/seo-schema";
import {
  ArticleContainer,
  SectionHeading,
  Lead,
  StatGrid,
  StatCard,
  Callout,
  DataTable,
  FaqAccordion,
  CtaBand,
} from "@/components/sanitaire/editorial/EditorialUI";

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

const COMPARATIF: { critere: string; taxi: string; vsl: string; ambulance: string }[] = [
  { critere: "Position du patient", taxi: "Assis", vsl: "Assis", ambulance: "Allongé / surveillance" },
  { critere: "Conducteur", taxi: "Chauffeur agréé CPAM", vsl: "Auxiliaire ambulancier", ambulance: "Équipage qualifié (2 pers.)" },
  { critere: "Grille tarifaire", taxi: "Convention CPAM taxi", vsl: "Avenant 11 sanitaire", ambulance: "Avenant 11 sanitaire" },
  { critere: "Niveau de prix", taxi: "Modéré", vsl: "Modéré", ambulance: "Le plus élevé" },
  { critere: "Transport partagé", taxi: "Possible", vsl: "Possible", ambulance: "Non" },
  { critere: "Remboursement CPAM", taxi: "65 % / 100 % ALD", vsl: "65 % / 100 % ALD", ambulance: "65 % / 100 % ALD" },
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
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0066CC] hover:shadow-lg"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0066CC] ring-1 ring-blue-100">
                  <Icone className="h-6 w-6" />
                </span>
                <div className="mt-3 text-lg font-bold text-[#0B1120]">{m.titre}</div>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{m.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066CC]">
                  {m.cta}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <ArticleContainer>
        <section id="comparatif" className="space-y-6">
          <SectionHeading icon={Scale}>
            Taxi conventionné, VSL ou ambulance : le comparatif
          </SectionHeading>
          <Lead>
            Ces trois modes de transport sanitaire répondent à des besoins différents et suivent des grilles
            tarifaires distinctes. Le tableau ci-dessous résume leurs principales caractéristiques ; le choix est
            toujours déterminé par le médecin sur la prescription, en fonction de votre état de santé.
          </Lead>
          <DataTable>
            <thead>
              <tr className="bg-gradient-to-r from-[#0B1120] to-[#0f1d3a] text-left text-white">
                <th className="px-4 py-3 font-semibold">Critère</th>
                <th className="px-4 py-3 font-semibold">Taxi conventionné</th>
                <th className="px-4 py-3 font-semibold">VSL</th>
                <th className="px-4 py-3 font-semibold">Ambulance</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {COMPARATIF.map((row, i) => (
                <tr key={row.critere} className={i % 2 === 1 ? "bg-slate-50/70" : "bg-white"}>
                  <td className="px-4 py-3 font-medium text-[#0B1120]">{row.critere}</td>
                  <td className="px-4 py-3">{row.taxi}</td>
                  <td className="px-4 py-3">{row.vsl}</td>
                  <td className="px-4 py-3">{row.ambulance}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </section>

        <section id="remboursement" className="space-y-6">
          <SectionHeading icon={ShieldCheck}>Un remboursement commun aux trois modes</SectionHeading>
          <StatGrid>
            <StatCard value="100 %" label="ALD, AT/MP, hospitalisation" accent />
            <StatCard value="65 %" label="Autres motifs (part de base)" />
            <StatCard value="4 €" label="Franchise par trajet (8 €/jour, 50 €/an)" />
          </StatGrid>
          <Lead>
            Quel que soit le mode prescrit, le remboursement suit les mêmes règles : sur prescription médicale de
            transport, l&apos;Assurance maladie prend en charge <strong>65 %</strong> du tarif conventionné pour la
            plupart des motifs, et <strong>100 %</strong> en cas d&apos;affection longue durée (ALD) en lien avec le
            transport, d&apos;accident du travail, de maladie professionnelle ou d&apos;hospitalisation. Le tiers
            payant évite d&apos;avancer la part remboursée ; une franchise de 4 € par trajet (plafonnée à 8 €/jour et
            50 €/an) reste à charge.
          </Lead>
          <Callout title="Pour aller plus loin" icon={Wallet}>
            Consultez notre guide{" "}
            <Link
              href="/blog/remboursement-transport-medical"
              className="font-medium text-[#0066CC] underline underline-offset-2 hover:text-[#0052a3]"
            >
              remboursement du transport médical
            </Link>{" "}
            ou les conditions officielles sur{" "}
            <a
              href="https://www.ameli.fr/assure/remboursements/rembourse/transports/prise-charge-frais-transport"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#0066CC] underline underline-offset-2 hover:text-[#0052a3]"
            >
              ameli.fr
            </a>.
          </Callout>
        </section>

        <section id="simulateurs" className="space-y-6">
          <SectionHeading icon={LayoutGrid}>Accéder aux simulateurs dédiés</SectionHeading>
          <Lead>
            Chaque mode dispose de son simulateur détaillé, avec le calcul complet et la possibilité de déposer une
            demande de transport auprès des professionnels de votre secteur :
          </Lead>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/simulateur-taxi-conventionne"
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0066CC] hover:shadow-lg"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0066CC] ring-1 ring-blue-100">
                <Car className="h-5 w-5" />
              </span>
              <span className="mt-3 font-semibold text-[#0B1120]">
                Simulateur de prix du taxi conventionné
              </span>
              <span className="mt-1 text-sm text-slate-600">grille CPAM 2026</span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066CC]">
                Ouvrir le simulateur
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link
              href="/tarif-vsl"
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0066CC] hover:shadow-lg"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0066CC] ring-1 ring-blue-100">
                <Stethoscope className="h-5 w-5" />
              </span>
              <span className="mt-3 font-semibold text-[#0B1120]">Simulateur et prix du VSL</span>
              <span className="mt-1 text-sm text-slate-600">grille avenant 11</span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066CC]">
                Ouvrir le simulateur
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link
              href="/tarif-ambulance"
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0066CC] hover:shadow-lg"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0066CC] ring-1 ring-blue-100">
                <Cross className="h-5 w-5" />
              </span>
              <span className="mt-3 font-semibold text-[#0B1120]">Simulateur et tarif ambulance</span>
              <span className="mt-1 text-sm text-slate-600">
                grille avenant 11, prix avec ou sans prise en charge
              </span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066CC]">
                Ouvrir le simulateur
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </section>

        <section id="faq" className="space-y-6">
          <SectionHeading icon={HelpCircle}>Questions fréquentes sur le transport sanitaire</SectionHeading>
          <FaqAccordion items={FAQ} />
        </section>

        <CtaBand
          href="/transport-medical"
          title="Besoin d'un transport sanitaire ?"
          description="Choisissez le simulateur adapté à votre prescription, obtenez une estimation et transmettez gratuitement votre demande aux transporteurs de votre secteur."
          cta="Déposer une demande de transport"
        />
      </ArticleContainer>

      <div aria-hidden className="h-16" />
    </main>
  );
}
