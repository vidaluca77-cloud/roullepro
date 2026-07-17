import type { Metadata } from "next";
import Link from "next/link";
import {
  Cross,
  ChevronRight,
  MapPin,
  Route,
  Ruler,
  Moon,
  Calculator,
  Ban,
  Milestone,
  Percent,
  ShieldCheck,
  Wallet,
  HelpCircle,
  Car,
  Stethoscope,
} from "lucide-react";
import { buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/sanitaire-seo";
import { buildSimulateurJsonLd, jsonLdHtml } from "@/lib/seo-schema";
import SimulateurTarif from "@/components/sanitaire/SimulateurTarif";
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

const TITLE = "Tarif ambulance 2026 : prix, calcul et remboursement CPAM";
const DESCRIPTION =
  "Tarif ambulance 2026 : calculez le prix d'un transport en ambulance (forfait, kilomètres, majorations nuit et dimanche) selon la grille conventionnée avenant 11. Prix avec ou sans prise en charge, longue distance, remboursement expliqué.";
const H1 = "Tarif ambulance 2026 : prix, calcul et remboursement";
const CANONICAL = "/tarif-ambulance";

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
    question: "Combien coûte une ambulance en 2026 ?",
    answer:
      "Le prix d'un transport en ambulance dépend de la distance, du département et de l'horaire. Il combine un forfait départemental de prise en charge, un tarif au kilomètre et d'éventuelles majorations (nuit, dimanche, jour férié). Utilisez le simulateur ci-dessus pour obtenir une estimation à partir de vos adresses réelles, calculée selon la grille conventionnée (avenant 11) en vigueur en 2026.",
  },
  {
    question: "Quel est le tarif d'une ambulance sans prise en charge ?",
    answer:
      "Sans prescription médicale de transport, la course n'est pas remboursée par l'Assurance maladie : vous réglez l'intégralité du tarif conventionné (forfait + kilomètres + majorations éventuelles). Le simulateur affiche ce montant total, qui correspond au prix « sans prise en charge » à régler au transporteur. Avec une prescription, la Sécurité sociale rembourse 65 % ou 100 % selon votre situation.",
  },
  {
    question: "Comment est calculé le tarif d'une ambulance ?",
    answer:
      "Le tarif d'une ambulance suit la convention des transporteurs sanitaires (avenant 11). Il additionne un forfait départemental incluant les premiers kilomètres, un tarif kilométrique au-delà du forfait, une valorisation des trajets courts et des majorations pour la nuit, le dimanche et les jours fériés. Ces montants sont fixés par la convention et varient selon le département.",
  },
  {
    question: "Quel est le tarif d'une ambulance sur longue distance ?",
    answer:
      "Sur une longue distance, le forfait de prise en charge reste identique mais le tarif kilométrique s'applique à un plus grand nombre de kilomètres : le montant kilométrique devient la composante principale du prix. Le simulateur applique automatiquement le tarif au kilomètre du département de la course, quelle que soit la distance ; renseignez vos adresses réelles pour une estimation longue distance fiable.",
  },
  {
    question: "Y a-t-il une majoration la nuit et le dimanche ?",
    answer:
      "Oui. Une majoration s'applique pour les transports de nuit ainsi que le dimanche et les jours fériés, conformément à la convention. Renseignez la date et l'heure du transport dans le simulateur pour voir la majoration apparaître dans le détail du calcul.",
  },
  {
    question: "L'ambulance est-elle remboursée par la CPAM ?",
    answer:
      "Oui, sur prescription médicale de transport. L'ambulance est prise en charge à 65 % pour la plupart des motifs et à 100 % en cas d'affection longue durée (ALD) en lien avec le transport, d'accident du travail, de maladie professionnelle, d'hospitalisation ou de maternité. Le tiers payant évite d'avancer la part remboursée. Une franchise de 4 € par trajet (plafonnée à 8 €/jour et 50 €/an) reste à charge.",
  },
  {
    question: "Quelle différence de prix entre ambulance, VSL et taxi conventionné ?",
    answer:
      "L'ambulance est le mode le plus cher car il mobilise un véhicule équipé et un équipage qualifié pour un transport allongé ou sous surveillance. Le VSL et le taxi conventionné, réservés aux patients en position assise, appliquent des grilles moins élevées. Comparez les trois avec le simulateur ou consultez notre hub des simulateurs de transport sanitaire.",
  },
  {
    question: "L'estimation du simulateur vaut-elle devis ?",
    answer:
      "Non. L'estimation applique la grille conventionnée aux données que vous saisissez, mais ne tient pas compte de certains éléments propres à la course (temps d'attente, péages, retour à vide, matériel spécifique). Seul le transporteur peut établir un montant définitif.",
  },
];

export default function TarifAmbulancePage() {
  const faqLd = buildFaqJsonLd(FAQ);
  const breadLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Transport médical", url: "/transport-medical" },
    { name: "Tarif ambulance", url: CANONICAL },
  ]);
  const appLd = buildSimulateurJsonLd({
    name: "Simulateur de tarif ambulance",
    description:
      "Estimez en ligne le prix d'un transport en ambulance selon la grille conventionnée 2026 (avenant 11) : forfait, kilométrage départemental et majorations.",
    url: CANONICAL,
    featureList: [
      "Estimation du prix d'un transport en ambulance",
      "Calcul du tarif ambulance longue distance",
      "Majorations nuit, dimanche et jours fériés",
      "Prix avec ou sans prise en charge",
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
            <span className="text-white">Tarif ambulance</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-5">
            <Cross className="w-3.5 h-3.5" />
            Prix ambulance · grille conventionnée 2026
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{H1}</h1>
          <p className="text-blue-100 max-w-2xl">
            Calculez gratuitement le prix d&apos;un transport en ambulance à partir de vos adresses réelles.
            Le simulateur applique la grille conventionnée des transporteurs sanitaires en vigueur (forfait,
            tarif au kilomètre de votre département, majorations) et vous permet de déposer une demande de
            transport en un clic.
          </p>
        </div>
      </section>

      <section id="simulateur" className="max-w-3xl mx-auto px-4 -mt-8 relative z-10 scroll-mt-24">
        <SimulateurTarif typeParDefaut="ambulance" />
      </section>

      <ArticleContainer>
        <section id="calcul" className="space-y-6">
          <SectionHeading icon={Calculator}>
            Comment est calculé le tarif d&apos;une ambulance ?
          </SectionHeading>
          <Lead>
            Le tarif d&apos;une ambulance n&apos;est pas fixé librement : il suit la convention nationale des
            transporteurs sanitaires et son avenant 11, qui encadre les prix du transport sanitaire depuis 2025.
            Le prix d&apos;une course additionne plusieurs composantes que le simulateur calcule automatiquement :
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
            transporteur et ignore les éléments inconnus au moment de la demande (temps d&apos;attente, péages,
            retour à vide, matériel médical spécifique).
          </Callout>
        </section>

        <section id="sans-prise-en-charge" className="space-y-6">
          <SectionHeading icon={Ban}>
            Tarif ambulance sans prise en charge ni prescription
          </SectionHeading>
          <Lead>
            Beaucoup de patients cherchent le <strong>tarif d&apos;une ambulance sans prise en charge</strong>,
            c&apos;est-à-dire le montant à régler lorsque le transport n&apos;est pas remboursé. Sans prescription
            médicale de transport (bon de transport, CERFA 11574*07), la course n&apos;ouvre droit à aucun
            remboursement de l&apos;Assurance maladie : vous réglez l&apos;intégralité du tarif conventionné.
          </Lead>
          <Lead>
            Le montant total affiché par le simulateur correspond précisément à ce prix « sans prise en charge » :
            forfait départemental, kilomètres facturés et majorations éventuelles, avant tout remboursement. Avec
            une prescription, ce même total est ensuite pris en charge à 65 % ou 100 % par la Sécurité sociale
            (voir la section remboursement ci-dessous).
          </Lead>
        </section>

        <section id="longue-distance" className="space-y-6">
          <SectionHeading icon={Milestone}>Tarif ambulance longue distance</SectionHeading>
          <Lead>
            Sur une <strong>longue distance</strong>, la structure du prix ne change pas mais ses proportions
            évoluent : le forfait de prise en charge reste identique, tandis que le tarif kilométrique
            s&apos;applique à un nombre de kilomètres bien plus élevé. Le montant kilométrique devient alors la
            composante dominante du prix total.
          </Lead>
          <Lead>
            Pour un transfert entre villes, un rapatriement ou un transport vers un centre spécialisé éloigné, le
            simulateur applique automatiquement le tarif au kilomètre du département de la course, quelle que soit
            la distance. Renseignez vos adresses réelles de départ et d&apos;arrivée pour obtenir une estimation
            longue distance fiable, puis déposez votre demande auprès des transporteurs de votre secteur.
          </Lead>
        </section>

        <CtaBand
          href="#simulateur"
          title="Estimez le prix de votre transport en ambulance"
          description="Renseignez vos adresses réelles et déposez une demande de transport auprès des transporteurs de votre secteur, sans engagement."
          cta="Déposer une demande de transport"
        />

        <section id="majorations" className="space-y-6">
          <SectionHeading icon={Moon}>Majorations nuit, dimanche et jours fériés</SectionHeading>
          <Lead>
            La convention prévoit des <strong>majorations</strong> lorsque le transport est réalisé la nuit, le
            dimanche ou un jour férié. Ces majorations s&apos;ajoutent au socle de la course (forfait + kilomètres)
            et peuvent augmenter sensiblement le prix d&apos;un transport nocturne ou de week-end.
          </Lead>
          <Lead>
            Pour les visualiser, renseignez la <strong>date et l&apos;heure</strong> du transport dans le
            simulateur : la majoration correspondante apparaît alors dans le détail du calcul, avec son taux et son
            montant. En l&apos;absence de date, l&apos;estimation correspond à un transport de jour en semaine.
          </Lead>
        </section>

        <section id="grille-2026" className="space-y-6">
          <SectionHeading icon={Route}>Grille tarifaire ambulance 2026 (avenant 11)</SectionHeading>
          <Lead>
            Les tarifs des ambulances sont fixés par la <strong>convention nationale des transporteurs sanitaires</strong>
            {" "}et son <strong>avenant 11</strong>, qui s&apos;applique en 2026. Cette grille définit, département par
            département, le forfait de prise en charge, le tarif kilométrique et les taux de majoration. Aucun
            transporteur conventionné ne peut facturer au-delà de ces montants pour une course prescrite.
          </Lead>
          <Lead>
            Le simulateur de cette page s&apos;appuie exclusivement sur cette grille conventionnée : aucun tarif
            n&apos;est inventé, tout provient des barèmes officiels en vigueur. Les conditions détaillées de prise
            en charge figurent sur{" "}
            <a
              href="https://www.ameli.fr/assure/remboursements/rembourse/transports/prise-charge-frais-transport"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#0066CC] underline underline-offset-2 hover:text-[#0052a3]"
            >
              ameli.fr
            </a>.
          </Lead>
        </section>

        <section id="remboursement" className="space-y-6">
          <SectionHeading icon={ShieldCheck}>Remboursement de l&apos;ambulance par la CPAM</SectionHeading>
          <Lead>
            Sur prescription médicale de transport, l&apos;ambulance est prise en charge par la Sécurité sociale.
            Le taux dépend du motif :
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
            an) reste à votre charge. Pour aller plus loin, consultez notre guide{" "}
            <Link
              href="/blog/remboursement-transport-medical"
              className="font-medium text-[#0066CC] underline underline-offset-2 hover:text-[#0052a3]"
            >
              remboursement du transport médical
            </Link>.
          </Callout>
        </section>

        <section id="difference" className="space-y-6">
          <SectionHeading icon={Percent}>Ambulance, VSL ou taxi conventionné ?</SectionHeading>
          <Lead>
            L&apos;ambulance est réservée aux transports allongés ou sous surveillance médicale : c&apos;est le mode
            le plus complet, et le plus cher. Le VSL (Véhicule Sanitaire Léger) et le taxi conventionné
            s&apos;adressent aux patients transportés en position assise, avec des grilles tarifaires moins élevées.
            Le mode de transport est indiqué par le médecin sur la prescription. Pour comparer les trois, consultez
            notre{" "}
            <Link
              href="/simulateur-transport-sanitaire"
              className="font-medium text-[#0066CC] underline underline-offset-2 hover:text-[#0052a3]"
            >
              hub des simulateurs de transport sanitaire
            </Link>.
          </Lead>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/tarif-vsl"
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#0066CC]/40 hover:shadow-md"
            >
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0066CC] ring-1 ring-blue-100">
                <Stethoscope className="h-5 w-5" />
              </span>
              <span className="font-semibold text-[#0B1120]">Simulateur et tarif VSL</span>
              <ChevronRight className="ml-auto h-5 w-5 text-[#0066CC] transition group-hover:translate-x-0.5" />
            </Link>
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
          </div>
        </section>

        <section id="faq" className="space-y-6">
          <SectionHeading icon={HelpCircle}>
            Questions fréquentes sur le tarif de l&apos;ambulance
          </SectionHeading>
          <FaqAccordion items={FAQ} />
        </section>

        <CtaBand
          href="#simulateur"
          title="Besoin d'un transport en ambulance ?"
          description="Obtenez une estimation immédiate puis transmettez gratuitement votre demande aux transporteurs conventionnés de votre secteur."
          cta="Déposer une demande de transport"
        />
      </ArticleContainer>
    </main>
  );
}
