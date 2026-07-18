import type { Metadata } from "next";
import Link from "next/link";
import {
  Stethoscope,
  ChevronRight,
  MapPin,
  Route,
  Ruler,
  Moon,
  Calculator,
  Coins,
  ShieldCheck,
  Wallet,
  Percent,
  HelpCircle,
  Car,
  Cross,
} from "lucide-react";
import { buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/sanitaire-seo";
import { buildSimulateurJsonLd, jsonLdHtml } from "@/lib/seo-schema";
import SimulateurTarif from "@/components/sanitaire/SimulateurTarif";
import PartenaireAllopoints from "@/components/PartenaireAllopoints";
import {
  ArticleContainer,
  SectionHeading,
  Lead,
  FeatureGrid,
  FeatureCard,
  StatGrid,
  StatCard,
  Callout,
  FaqAccordion,
  CtaBand,
} from "@/components/sanitaire/editorial/EditorialUI";

export const revalidate = 3600;

const TITLE = "Prix VSL 2026 : tarif, calcul et remboursement du transport";
const DESCRIPTION =
  "Prix d'un VSL en 2026 : estimez le tarif de votre transport en véhicule sanitaire léger (forfait, kilomètres, majorations) selon la grille conventionnée avenant 11. Combien coûte un VSL, remboursement CPAM 65 % ou 100 % expliqué.";
const H1 = "Prix d'un VSL 2026 : tarif, calcul et remboursement";
const CANONICAL = "/tarif-vsl";

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
    question: "Combien coûte un VSL en 2026 ?",
    answer:
      "Le prix d'un VSL (véhicule sanitaire léger) dépend de la distance, du département et de l'horaire. Il combine un forfait départemental de prise en charge, un tarif au kilomètre et d'éventuelles majorations (nuit, dimanche, jour férié). Utilisez le simulateur ci-dessus pour estimer le coût de votre course à partir de vos adresses réelles, selon la grille conventionnée (avenant 11) en vigueur.",
  },
  {
    question: "Quel est le tarif d'un VSL ?",
    answer:
      "Le tarif d'un VSL suit la convention des transporteurs sanitaires (avenant 11). Il additionne un forfait départemental incluant les premiers kilomètres, un tarif kilométrique au-delà du forfait, une valorisation des trajets courts, et des majorations pour la nuit, le dimanche et les jours fériés. Le VSL est généralement moins cher qu'une ambulance car il transporte des patients en position assise.",
  },
  {
    question: "Le VSL est-il remboursé par la CPAM ?",
    answer:
      "Oui. Sur prescription médicale de transport, le VSL est pris en charge par l'Assurance maladie à 65 % pour la plupart des motifs, et à 100 % en cas d'affection longue durée (ALD) en lien avec le transport, d'accident du travail, de maladie professionnelle ou d'hospitalisation. Le tiers payant évite d'avancer la part remboursée. Une franchise de 4 € par trajet (plafonnée à 8 €/jour et 50 €/an) reste à charge.",
  },
  {
    question: "Comment est calculé le prix d'un VSL ?",
    answer:
      "Le prix d'un VSL combine un forfait départemental de prise en charge (qui inclut les premiers kilomètres), un tarif kilométrique appliqué au-delà, une valorisation des trajets courts et des majorations pour les horaires spécifiques (nuit, dimanche, jour férié). Ces montants sont fixés par la convention des transporteurs sanitaires et varient selon le département.",
  },
  {
    question: "Quelle différence entre un VSL et un taxi conventionné ?",
    answer:
      "Le VSL est un véhicule sanitaire conduit par un auxiliaire ambulancier formé, qui peut aider le patient à se déplacer et assurer plusieurs transports assis simultanés. Le taxi conventionné est un taxi classique agréé par la CPAM, sans qualification sanitaire du chauffeur. Les deux transportent des patients assis mais suivent des grilles tarifaires différentes : convention des transporteurs sanitaires pour le VSL, convention CPAM taxi pour le taxi conventionné.",
  },
  {
    question: "Faut-il une prescription pour un VSL remboursé ?",
    answer:
      "Oui. Sans prescription médicale de transport (bon de transport, CERFA 11574*07), la course en VSL n'est pas prise en charge par la Sécurité sociale et reste intégralement à votre charge. La prescription précise le mode de transport adapté à votre état de santé.",
  },
  {
    question: "Le VSL peut-il transporter plusieurs patients ?",
    answer:
      "Oui. Le VSL est prévu pour le transport assis de plusieurs patients à la fois, notamment vers des soins itératifs (dialyse, chimiothérapie, radiothérapie). En cas de transport partagé, une tarification réduite s'applique. Le simulateur estime une course individuelle ; le montant réel peut être inférieur en cas de partage.",
  },
  {
    question: "L'estimation du simulateur VSL est-elle un devis ?",
    answer:
      "Non. L'estimation applique la grille conventionnée aux données que vous saisissez, mais ne tient pas compte de certains éléments propres à la course (temps d'attente, transport partagé, péages, retour à vide). Seul le transporteur peut établir un montant définitif.",
  },
];

export default function TarifVslPage() {
  const faqLd = buildFaqJsonLd(FAQ);
  const breadLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Transport médical", url: "/transport-medical" },
    { name: "Prix VSL", url: CANONICAL },
  ]);
  const appLd = buildSimulateurJsonLd({
    name: "Simulateur de prix VSL",
    description:
      "Estimez en ligne le tarif d'un transport en VSL selon la grille conventionnée 2026 (avenant 11) : forfait, kilométrage départemental et majorations.",
    url: CANONICAL,
    featureList: [
      "Estimation du prix d'une course en VSL",
      "Application de la grille conventionnée par département",
      "Calcul des majorations nuit, dimanche et jours fériés",
      "Comparaison avec le taxi conventionné et l'ambulance",
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
            <span className="text-white">Prix VSL</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-5">
            <Stethoscope className="w-3.5 h-3.5" />
            Prix VSL · grille conventionnée 2026
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{H1}</h1>
          <p className="text-blue-100 max-w-2xl">
            Estimez gratuitement le prix d&apos;un transport en VSL (véhicule sanitaire léger) à partir de vos
            adresses réelles. Le simulateur applique la grille conventionnée des transporteurs sanitaires en
            vigueur (forfait, tarif au kilomètre de votre département, majorations) et vous permet de déposer une
            demande de transport en un clic.
          </p>
        </div>
      </section>

      <section id="simulateur" className="max-w-3xl mx-auto px-4 -mt-8 relative z-10 scroll-mt-24">
        <SimulateurTarif typeParDefaut="vsl" />
      </section>

      <ArticleContainer>
        <section id="calcul" className="space-y-6">
          <SectionHeading icon={Calculator}>Comment est calculé le prix d&apos;un VSL ?</SectionHeading>
          <Lead>
            Le prix d&apos;un VSL n&apos;est pas fixé librement : il suit la convention nationale des transporteurs
            sanitaires et son avenant 11, applicable en 2026. Le montant d&apos;une course additionne plusieurs
            composantes que le simulateur calcule automatiquement :
          </Lead>
          <FeatureGrid>
            <FeatureCard icon={MapPin} title="Le forfait départemental de prise en charge">
              qui inclut les premiers kilomètres de la course et varie d&apos;un département à l&apos;autre.
            </FeatureCard>
            <FeatureCard icon={Route} title="Le tarif kilométrique">
              appliqué à chaque kilomètre au-delà du forfait.
            </FeatureCard>
            <FeatureCard icon={Ruler} title="Une valorisation des trajets courts">
              prévue par la convention pour les courses de faible distance.
            </FeatureCard>
            <FeatureCard icon={Moon} title="Les majorations de nuit, du dimanche et des jours fériés">
              appliquées lorsque l&apos;horaire saisi les déclenche.
            </FeatureCard>
          </FeatureGrid>
          <Callout title="À retenir">
            Le résultat affiché est une <strong>estimation indicative</strong> : elle ne remplace pas le devis du
            transporteur et ignore les éléments inconnus au moment de la demande (temps d&apos;attente, transport
            partagé, péages, retour à vide).
          </Callout>
        </section>

        <section id="cout" className="space-y-6">
          <SectionHeading icon={Coins}>Combien coûte un VSL ?</SectionHeading>
          <Lead>
            La question « <strong>combien coûte un VSL ?</strong> » n&apos;a pas de réponse unique : le prix dépend
            avant tout de la distance parcourue et du département, car le tarif kilométrique est fixé
            département par département. Une même distance ne coûte donc pas le même prix partout en France.
          </Lead>
          <Lead>
            Le VSL est généralement <strong>moins cher qu&apos;une ambulance</strong>, car il transporte des
            patients en position assise sans nécessiter un équipage ni un véhicule médicalisé. Pour connaître le
            coût de votre course précise, saisissez vos adresses de départ et d&apos;arrivée dans le simulateur :
            il applique automatiquement le tarif de votre département.
          </Lead>
        </section>

        <CtaBand
          href="#simulateur"
          title="Estimez le prix de votre course en VSL"
          description="Renseignez vos adresses réelles et déposez une demande de transport auprès des transporteurs de votre secteur, sans engagement."
          cta="Déposer une demande de transport"
        />

        <section id="remboursement" className="space-y-6">
          <SectionHeading icon={ShieldCheck}>Remboursement du VSL par la CPAM</SectionHeading>
          <Lead>
            Sur prescription médicale de transport, le VSL est pris en charge par la Sécurité sociale. Le taux
            dépend du motif :
          </Lead>
          <StatGrid>
            <StatCard value="100 %" label="ALD, AT/MP, hospitalisation, maternité, CSS et AME" accent />
            <StatCard value="65 %" label="Autres motifs (complément par la mutuelle)" />
            <StatCard value="4 €" label="Franchise par trajet (8 €/jour, 50 €/an)" />
          </StatGrid>
          <div className="space-y-3 text-slate-600 leading-relaxed">
            <p>
              <strong className="text-[#0B1120]">100 %</strong> en cas d&apos;affection longue durée (ALD) en lien
              avec le transport, d&apos;accident du travail, de maladie professionnelle, d&apos;hospitalisation, de
              maternité à partir du 1er jour du 6e mois, ou pour les bénéficiaires de la Complémentaire santé
              solidaire (CSS) et de l&apos;AME ;
            </p>
            <p>
              <strong className="text-[#0B1120]">65 %</strong> pour les autres motifs ; le complément est
              généralement pris en charge par la mutuelle.
            </p>
          </div>
          <Callout title="Bon à savoir" icon={Wallet}>
            Grâce au tiers payant, vous n&apos;avancez pas la part remboursée : présentez votre carte Vitale et
            votre bon de transport. Une franchise médicale de 4 € par trajet (plafonnée à 8 € par jour et 50 € par
            an) reste à votre charge. Les conditions détaillées figurent sur{" "}
            <a
              href="https://www.ameli.fr/assure/remboursements/rembourse/transports/prise-charge-frais-transport"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#0066CC] underline underline-offset-2 hover:text-[#0052a3]"
            >
              ameli.fr
            </a>{" "}
            et dans notre guide{" "}
            <Link
              href="/blog/remboursement-transport-medical"
              className="font-medium text-[#0066CC] underline underline-offset-2 hover:text-[#0052a3]"
            >
              remboursement du transport médical
            </Link>.
          </Callout>
        </section>

        <section id="difference" className="space-y-6">
          <SectionHeading icon={Percent}>VSL, taxi conventionné ou ambulance ?</SectionHeading>
          <Lead>
            Le VSL est conduit par un auxiliaire ambulancier qui peut aider le patient à se déplacer ; il
            s&apos;adresse aux personnes autonomes en position assise mais nécessitant un accompagnement adapté. Le
            taxi conventionné transporte également des patients assis, mais sans qualification sanitaire du
            chauffeur. L&apos;ambulance, elle, est réservée aux transports allongés ou sous surveillance. Le mode
            de transport est indiqué par le médecin sur la prescription. Pour comparer les trois, consultez notre{" "}
            <Link
              href="/simulateur-transport-sanitaire"
              className="font-medium text-[#0066CC] underline underline-offset-2 hover:text-[#0052a3]"
            >
              hub des simulateurs de transport sanitaire
            </Link>.
          </Lead>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/simulateur-taxi-conventionne"
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#0066CC]/40 hover:shadow-md"
            >
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0066CC] ring-1 ring-blue-100">
                <Car className="h-5 w-5" />
              </span>
              <span className="font-semibold text-[#0B1120]">Simulateur taxi conventionné</span>
              <ChevronRight className="ml-auto h-5 w-5 text-[#0066CC] transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/tarif-ambulance"
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#0066CC]/40 hover:shadow-md"
            >
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0066CC] ring-1 ring-blue-100">
                <Cross className="h-5 w-5" />
              </span>
              <span className="font-semibold text-[#0B1120]">Simulateur et tarif ambulance</span>
              <ChevronRight className="ml-auto h-5 w-5 text-[#0066CC] transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>

        <section id="faq" className="space-y-6">
          <SectionHeading icon={HelpCircle}>Questions fréquentes sur le prix du VSL</SectionHeading>
          <FaqAccordion items={FAQ} />
        </section>

        <CtaBand
          href="#simulateur"
          title="Besoin d'un transport en VSL ?"
          description="Obtenez une estimation immédiate puis transmettez gratuitement votre demande aux transporteurs conventionnés de votre secteur."
          cta="Déposer une demande de transport"
        />

        <PartenaireAllopoints />
      </ArticleContainer>
    </main>
  );
}
