import type { Metadata } from "next";
import Link from "next/link";
import { Car, ChevronRight } from "lucide-react";
import { buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/sanitaire-seo";
import { buildSimulateurJsonLd, jsonLdHtml } from "@/lib/seo-schema";
import SimulateurTarif from "@/components/sanitaire/SimulateurTarif";

export const revalidate = 3600;

const TITLE = "Simulateur prix taxi conventionné 2026 — estimation en ligne CPAM";
const DESCRIPTION =
  "Simulateur de prix du taxi conventionné 2026 : estimez le tarif de votre course (forfait, kilomètres, majorations) selon la grille CPAM en vigueur. Estimation gratuite, remboursement expliqué.";
const H1 = "Simulateur de prix du taxi conventionné (tarif CPAM 2026)";
const CANONICAL = "/simulateur-taxi-conventionne";

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
    question: "Comment fonctionne le simulateur de prix du taxi conventionné ?",
    answer:
      "Indiquez votre adresse de départ et d'arrivée : le simulateur calcule la distance de la course, puis applique la grille tarifaire conventionnée CPAM en vigueur (forfait de prise en charge, tarif kilométrique de votre département, majorations éventuelles de nuit, week-end ou jour férié). Le résultat est une estimation indicative, qui ne vaut pas devis.",
  },
  {
    question: "Le taxi conventionné est-il remboursé ?",
    answer:
      "Oui. Sur prescription médicale de transport, le taxi conventionné est pris en charge par l'Assurance maladie à 65 % pour la plupart des motifs, et à 100 % en cas d'affection longue durée (ALD) en lien avec le transport, d'accident du travail, de maladie professionnelle ou d'hospitalisation. Le tiers payant évite d'avancer la part remboursée. Une franchise de 4 € par trajet (plafonnée à 8 €/jour et 50 €/an) reste à charge.",
  },
  {
    question: "Comment est calculé le tarif d'un taxi conventionné CPAM ?",
    answer:
      "Le tarif conventionné combine un forfait de prise en charge (incluant les premiers kilomètres), un tarif kilométrique fixé département par département, un forfait « grande ville » dans certaines agglomérations, et des majorations pour les trajets de nuit, le dimanche et les jours fériés. Ces montants sont fixés par la convention CPAM (arrêté du 29 juillet 2025).",
  },
  {
    question: "Quel est le prix d'une course en taxi conventionné ?",
    answer:
      "Le prix dépend de la distance, du département et de l'horaire. Pour l'estimer, utilisez le simulateur ci-dessus : il applique automatiquement le tarif kilométrique de votre département et les majorations éventuelles à partir de vos adresses réelles.",
  },
  {
    question: "Faut-il une prescription pour un taxi conventionné remboursé ?",
    answer:
      "Oui. Sans prescription médicale de transport (bon de transport, CERFA 11574*07), la course est facturée comme un taxi classique au tarif préfectoral libre, sans prise en charge par la Sécurité sociale.",
  },
  {
    question: "L'estimation du simulateur est-elle un devis ?",
    answer:
      "Non. L'estimation est indicative : elle applique la grille conventionnée aux données que vous saisissez, mais ne tient pas compte de certains éléments propres à la course (temps d'attente, transport partagé, péages, retour à vide). Seul le transporteur peut établir un montant définitif.",
  },
  {
    question: "Le simulateur fonctionne-t-il pour le VSL et l'ambulance ?",
    answer:
      "Oui. Le sélecteur en haut du simulateur permet de basculer entre taxi conventionné, VSL et ambulance. Chaque mode applique sa propre grille : convention CPAM pour le taxi, convention des transporteurs sanitaires (avenant 11) pour le VSL et l'ambulance.",
  },
];

export default function SimulateurTaxiConventionnePage() {
  const faqLd = buildFaqJsonLd(FAQ);
  const breadLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Transport médical", url: "/transport-medical" },
    { name: "Simulateur taxi conventionné", url: CANONICAL },
  ]);
  const appLd = buildSimulateurJsonLd({
    name: "Simulateur de prix du taxi conventionné CPAM",
    description:
      "Estimez en ligne le tarif d'une course en taxi conventionné selon la grille CPAM 2026 : forfait, kilométrage départemental et majorations.",
    url: CANONICAL,
    featureList: [
      "Estimation du prix d'une course en taxi conventionné",
      "Application de la grille tarifaire CPAM par département",
      "Calcul des majorations nuit, dimanche et jours fériés",
      "Estimation VSL et ambulance",
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
            <span className="text-white">Simulateur taxi conventionné</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-5">
            <Car className="w-3.5 h-3.5" />
            Estimation prix taxi conventionné · grille CPAM 2026
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{H1}</h1>
          <p className="text-blue-100 max-w-2xl">
            Estimez gratuitement le prix de votre course en taxi conventionné à partir de vos adresses réelles.
            Le simulateur applique la grille tarifaire CPAM en vigueur (forfait, tarif au kilomètre de votre
            département, majorations) et vous permet de déposer une demande de transport en un clic.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 -mt-8 relative z-10">
        <SimulateurTarif typeParDefaut="taxi" />
      </section>

      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-sm sm:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">
        <section id="calcul">
          <h2>Comment se calcule le tarif d&apos;un taxi conventionné ?</h2>
          <p>
            Le tarif du taxi conventionné n&apos;est pas fixé librement : il suit une grille conventionnelle
            négociée entre l&apos;Assurance maladie et les organisations de taxis (arrêté du 29 juillet 2025,
            en vigueur depuis le 1er octobre 2025). Le montant d&apos;une course dépend de plusieurs composantes
            que le simulateur additionne automatiquement :
          </p>
          <ul>
            <li>
              <strong>Le forfait de prise en charge</strong>, qui inclut les premiers kilomètres de la course ;
            </li>
            <li>
              <strong>Le tarif kilométrique départemental</strong>, appliqué à chaque kilomètre au-delà du forfait :
              il varie d&apos;un département à l&apos;autre, ce qui explique qu&apos;une même distance ne coûte pas
              le même prix partout en France ;
            </li>
            <li>
              <strong>Un forfait « grande ville »</strong> pour les départs ou arrivées dans certaines grandes
              agglomérations et la petite couronne parisienne ;
            </li>
            <li>
              <strong>Les majorations de nuit, du dimanche et des jours fériés</strong>, appliquées sur le socle
              de la course lorsque l&apos;horaire saisi les déclenche ;
            </li>
            <li>
              <strong>Un supplément outre-mer</strong> pour les courses réalisées dans les DROM.
            </li>
          </ul>
          <p>
            Le résultat affiché est une <strong>estimation indicative</strong> : elle ne remplace pas le devis du
            transporteur et ignore volontairement les éléments inconnus au moment de la demande (temps
            d&apos;attente, transport partagé, péages, retour à vide).
          </p>
        </section>

        <section id="remboursement">
          <h2>Remboursement du taxi conventionné par la CPAM</h2>
          <p>
            Sur prescription médicale de transport, le taxi conventionné est pris en charge par la Sécurité
            sociale. Le taux dépend du motif :
          </p>
          <ul>
            <li>
              <strong>100 %</strong> en cas d&apos;affection longue durée (ALD) en lien avec le transport,
              d&apos;accident du travail, de maladie professionnelle, d&apos;hospitalisation, de maternité à partir
              du 1er jour du 6e mois, ou pour les bénéficiaires de la Complémentaire santé solidaire (CSS) et de
              l&apos;AME ;
            </li>
            <li>
              <strong>65 %</strong> pour les autres motifs ; le complément est généralement pris en charge par la
              mutuelle.
            </li>
          </ul>
          <p>
            Grâce au tiers payant, vous n&apos;avancez pas la part remboursée : présentez votre carte Vitale et
            votre bon de transport. Une franchise médicale de 4 € par trajet (plafonnée à 8 € par jour et 50 € par
            an) reste à votre charge. Les conditions détaillées figurent sur{" "}
            <a href="https://www.ameli.fr/assure/remboursements/rembourse/transports/prise-charge-frais-transport" target="_blank" rel="noopener noreferrer">
              ameli.fr
            </a>{" "}
            et dans notre guide{" "}
            <Link href="/blog/remboursement-transport-medical">remboursement du transport médical</Link>.
          </p>
        </section>

        <section id="cas-particuliers">
          <h2>Prix taxi conventionné : les cas particuliers</h2>
          <p>
            Plusieurs situations font varier le prix d&apos;une course conventionnée :
          </p>
          <ul>
            <li>
              <strong>Trajets de nuit (20h-8h), dimanches et jours fériés</strong> : une majoration s&apos;applique
              sur le socle de la course. Renseignez la date et l&apos;heure dans le simulateur pour la voir apparaître.
            </li>
            <li>
              <strong>Aller-retour</strong> : le tarif est doublé lorsque le transporteur assure le retour. Cochez
              la case « aller-retour » pour l&apos;inclure.
            </li>
            <li>
              <strong>Transport partagé</strong> : lorsque plusieurs patients voyagent ensemble vers des soins
              itératifs (dialyse, chimiothérapie), une tarification réduite s&apos;applique. Le simulateur estime une
              course individuelle.
            </li>
            <li>
              <strong>Sans prescription</strong> : la course relève alors du tarif préfectoral libre du taxi et
              n&apos;est pas remboursée.
            </li>
          </ul>
        </section>

        <section id="difference">
          <h2>Taxi conventionné, VSL ou ambulance ?</h2>
          <p>
            Le taxi conventionné transporte des patients autonomes en position assise, sans qualification sanitaire
            du chauffeur. Le VSL (Véhicule Sanitaire Léger) est conduit par un auxiliaire ambulancier et s&apos;adresse
            aux patients qui ont besoin d&apos;une aide pour se déplacer ; l&apos;ambulance est réservée aux transports
            allongés ou sous surveillance. Le mode de transport est indiqué par le médecin sur la prescription. Pour
            comparer les trois, consultez notre{" "}
            <Link href="/simulateur-transport-sanitaire">hub des simulateurs de transport sanitaire</Link> ou la page{" "}
            <Link href="/taxi-conventionne">taxi conventionné CPAM</Link>.
          </p>
          <div className="not-prose grid sm:grid-cols-2 gap-3 my-6">
            <Link href="/tarif-vsl" className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 transition">
              Simulateur et tarif VSL →
            </Link>
            <Link href="/tarif-ambulance" className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 transition">
              Simulateur et tarif ambulance →
            </Link>
          </div>
        </section>
      </article>

      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Questions fréquentes sur le prix du taxi conventionné
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
