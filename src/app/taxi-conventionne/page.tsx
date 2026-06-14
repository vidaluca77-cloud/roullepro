import type { Metadata } from "next";
import Link from "next/link";
import { Car, ChevronRight, Shield, Search, MapPin } from "lucide-react";
import { buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/sanitaire-seo";

export const revalidate = 3600;

const TITLE =
  "Taxi conventionné CPAM 2026 — Annuaire, tarifs, prescription et remboursement";
const DESCRIPTION =
  "Tout savoir sur le taxi conventionné CPAM : tarif convention 2026, prescription, prise en charge ALD, agrément. Annuaire France entière par ville.";
const H1 =
  "Taxi conventionné — Tarifs, remboursement et annuaire CPAM France entière";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/taxi-conventionne" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Maillage interne vers les hubs villes : 20 grandes villes ciblees "taxi conventionne [ville]".
const VILLES: { nom: string; slug: string }[] = [
  { nom: "Paris", slug: "paris" },
  { nom: "Marseille", slug: "marseille" },
  { nom: "Lyon", slug: "lyon" },
  { nom: "Toulouse", slug: "toulouse" },
  { nom: "Nice", slug: "nice" },
  { nom: "Nantes", slug: "nantes" },
  { nom: "Strasbourg", slug: "strasbourg" },
  { nom: "Montpellier", slug: "montpellier" },
  { nom: "Bordeaux", slug: "bordeaux" },
  { nom: "Lille", slug: "lille" },
  { nom: "Rennes", slug: "rennes" },
  { nom: "Reims", slug: "reims" },
  { nom: "Saint-Étienne", slug: "saint-etienne" },
  { nom: "Le Havre", slug: "le-havre" },
  { nom: "Toulon", slug: "toulon" },
  { nom: "Grenoble", slug: "grenoble" },
  { nom: "Dijon", slug: "dijon" },
  { nom: "Angers", slug: "angers" },
  { nom: "Nîmes", slug: "nimes" },
  { nom: "Saint-Denis", slug: "saint-denis" },
];

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Quel est le tarif d'un taxi conventionné CPAM en 2026 ?",
    answer:
      "Le tarif du taxi conventionné est encadré par la convention nationale 2025-2026 conclue entre l'Assurance maladie et les organisations de taxis. Il comprend une prise en charge de 2,80 €, un kilomètre tarif A à 1,12 €/km et une heure d'attente à 28,80 €/h, avec un abattement conventionnel appliqué sur le tarif préfectoral. Les majorations de nuit, dimanche et jours fériés s'appliquent selon le département.",
  },
  {
    question: "Faut-il une prescription pour prendre un taxi conventionné ?",
    answer:
      "Oui. La prescription médicale de transport (bon de transport, CERFA 11574*07) établie par le médecin traitant ou hospitalier est obligatoire pour bénéficier du remboursement CPAM. Sans prescription, la course est facturée comme un taxi classique au tarif libre, sans prise en charge par la Sécurité sociale.",
  },
  {
    question: "Le taxi conventionné est-il remboursé à 100 % en ALD ?",
    answer:
      "Oui. En cas d'affection longue durée (ALD) en lien avec le transport, d'accident du travail, de maladie professionnelle ou d'hospitalisation, le transport en taxi conventionné est pris en charge à 100 % par la CPAM. Pour les autres motifs, le remboursement est de 65 %, le complément étant assuré par votre mutuelle. La franchise médicale de 4 € par trajet reste à votre charge.",
  },
  {
    question: "Comment trouver un taxi conventionné autour de moi ?",
    answer:
      "Utilisez l'annuaire RoullePro : recherchez votre ville pour afficher les taxis conventionnés CPAM les plus proches, avec téléphone direct, agrément et modes de paiement. L'annuaire couvre la France entière à partir de données publiques officielles, vérifiées auprès de l'Assurance maladie.",
  },
  {
    question: "Les taxis G7 sont-ils conventionnés CPAM ?",
    answer:
      "Certains chauffeurs affiliés à des centrales comme G7 disposent d'une convention CPAM individuelle, mais ce n'est pas automatique : le conventionnement est attaché au chauffeur et à son autorisation de stationnement, pas à la centrale. Vérifiez toujours que le taxi est bien conventionné avant la course et présentez votre bon de transport.",
  },
  {
    question: "Faut-il choisir un VSL ou un taxi conventionné ?",
    answer:
      "Le choix est médical et indiqué par le médecin sur la prescription. Le taxi conventionné convient à un patient autonome transporté assis sans accompagnement sanitaire. Le VSL (Véhicule Sanitaire Léger) est conduit par un auxiliaire ambulancier formé aux premiers secours et relève du transport sanitaire agréé ARS : il est indiqué lorsque le patient a besoin d'une aide pour se déplacer.",
  },
  {
    question: "Comment trouver un taxi conventionné dans le 75, 94 ou 93 ?",
    answer:
      "Chaque département dispose de ses propres taxis conventionnés CPAM. À Paris (75), dans le Val-de-Marne (94) ou en Seine-Saint-Denis (93), consultez la page ville correspondante de l'annuaire RoullePro pour afficher les entreprises agréées de votre secteur et leurs coordonnées directes.",
  },
  {
    question: "Existe-t-il un contrat type pour le taxi conventionné ?",
    answer:
      "Oui. Le conventionnement repose sur la convention nationale type fixée par l'Assurance maladie, signée localement entre la CPAM et le taxi. Elle définit les tarifs, l'abattement, les obligations de tiers payant et les conditions de transport partagé. Le chauffeur doit afficher son agrément et respecter les tarifs conventionnés.",
  },
  {
    question: "Quelles sanctions en cas de fraude au transport conventionné ?",
    answer:
      "Le non-respect de la convention (surfacturation, fausse déclaration de kilométrage, transport sans prescription facturé à l'Assurance maladie) expose le taxi à des sanctions financières, au remboursement des sommes indûment perçues et, dans les cas graves, à des poursuites pour fraude. La CPAM mène des contrôles réguliers.",
  },
  {
    question: "Comment un taxi peut-il perdre son conventionnement CPAM ?",
    answer:
      "Le retrait de l'agrément ou de la convention peut intervenir en cas de manquements répétés : facturation abusive, non-respect des tarifs conventionnés, défaut de tiers payant, perte de l'autorisation de stationnement (ADS) ou condamnation. La décision relève de la CPAM, après procédure contradictoire.",
  },
];

export default function TaxiConventionnePage() {
  const faqLd = buildFaqJsonLd(FAQ);
  const breadLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Transport médical", url: "/transport-medical" },
    { name: "Taxi conventionné", url: "/taxi-conventionne" },
  ]);
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Transport médical en taxi conventionné CPAM",
    name: "Annuaire national des taxis conventionnés CPAM",
    description:
      "Annuaire France entière des taxis conventionnés par l'Assurance maladie. Transport assis sur prescription médicale, remboursé par la Sécurité sociale avec tiers payant.",
    provider: { "@type": "Organization", name: "RoullePro", url: BASE_URL },
    areaServed: { "@type": "Country", name: "France" },
    audience: { "@type": "Patient" },
    url: `${BASE_URL}/taxi-conventionne`,
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/transport-medical" className="hover:text-white">Transport médical</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Taxi conventionné</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-5">
            <Car className="w-3.5 h-3.5" />
            Guide complet et annuaire CPAM France entière
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{H1}</h1>
          <p className="text-blue-100 max-w-2xl">
            Tarif convention CPAM 2025-2026, prescription médicale, remboursement, agrément et annuaire des
            taxis conventionnés ville par ville. Tout ce qu'il faut savoir pour organiser un transport assis
            remboursé par la Sécurité sociale.
          </p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-sm sm:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">

        <section id="definition">
          <h2>Qu'est-ce qu'un taxi conventionné CPAM ?</h2>
          <p>
            Un taxi conventionné est un taxi traditionnel ayant signé une convention avec la Caisse primaire
            d'assurance maladie (CPAM) pour assurer le transport médical des patients. Concrètement, le taxi
            conventionné transporte, sur prescription, des assurés sociaux vers leur lieu de soins (consultation,
            hôpital, centre de dialyse, séance de chimiothérapie) et facture directement l'Assurance maladie grâce
            au tiers payant. Le patient n'avance pas les frais sur la part remboursée par la Sécurité sociale.
          </p>
          <p>
            Contrairement au VSL et à l'ambulance, le taxi conventionné ne relève pas du transport sanitaire agréé
            par l'ARS : le chauffeur n'a pas de qualification sanitaire. Il transporte des patients autonomes,
            capables de voyager assis sans accompagnement médical. C'est le mode de transport le plus économique
            pour la collectivité, ce qui explique que le médecin le privilégie lorsque l'état du patient le permet.
          </p>
        </section>

        <section id="differences">
          <h2>Différence taxi conventionné, VSL et ambulance</h2>
          <p>
            Trois modes de transport conventionné coexistent et répondent chacun à un besoin précis indiqué par le
            médecin sur la prescription. Le tableau suivant les compare critère par critère.
          </p>
          <div className="overflow-x-auto not-prose my-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 border-b border-gray-200">Critère</th>
                  <th className="text-left font-semibold px-3 py-2 border-b border-gray-200">Taxi conventionné</th>
                  <th className="text-left font-semibold px-3 py-2 border-b border-gray-200">VSL</th>
                  <th className="text-left font-semibold px-3 py-2 border-b border-gray-200">Ambulance</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Conducteur</td>
                  <td className="px-3 py-2">Chauffeur de taxi sans qualification sanitaire</td>
                  <td className="px-3 py-2">Auxiliaire ambulancier formé aux premiers secours</td>
                  <td className="px-3 py-2">Équipage de 2 dont un DEA (Diplôme d'État d'Ambulancier)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Agrément requis</td>
                  <td className="px-3 py-2">Convention CPAM (pas d'agrément ARS)</td>
                  <td className="px-3 py-2">Agrément ARS transport sanitaire</td>
                  <td className="px-3 py-2">Agrément ARS transport sanitaire</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Position de transport</td>
                  <td className="px-3 py-2">Assise</td>
                  <td className="px-3 py-2">Assise</td>
                  <td className="px-3 py-2">Allongée (brancard)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Équipement médical</td>
                  <td className="px-3 py-2">Aucun</td>
                  <td className="px-3 py-2">Léger (trousse de secours)</td>
                  <td className="px-3 py-2">Oxygène, brancard, défibrillateur, matériel de secours</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Indication patient</td>
                  <td className="px-3 py-2">Patient autonome assis</td>
                  <td className="px-3 py-2">État stable, déplacement assis avec aide</td>
                  <td className="px-3 py-2">Patient allongé, surveillance ou urgence</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Prescription</td>
                  <td className="px-3 py-2">Obligatoire (bon de transport)</td>
                  <td className="px-3 py-2">Obligatoire (bon de transport)</td>
                  <td className="px-3 py-2">Obligatoire (bon de transport)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Tarif référence</td>
                  <td className="px-3 py-2">Tarif convention locale CPAM (prise en charge 2,80 €, 1,12 €/km)</td>
                  <td className="px-3 py-2">Forfait 13,50 € + 0,93 €/km (tarif A urbain)</td>
                  <td className="px-3 py-2">Forfait départemental ambulance + kilométrage</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium">Remboursement CPAM</td>
                  <td className="px-3 py-2">100 % ALD / AT / hospitalisation, 65 % autres motifs</td>
                  <td className="px-3 py-2">100 % ALD / AT / hospitalisation, 65 % autres motifs</td>
                  <td className="px-3 py-2">100 % ALD / AT / hospitalisation, 55 % autres motifs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="devenir">
          <h2>Comment devenir taxi conventionné CPAM</h2>
          <p>
            Pour être conventionné, un taxi doit d'abord disposer d'une autorisation de stationnement (ADS, ou
            « licence ») et d'une carte professionnelle de chauffeur de taxi. Il dépose ensuite une demande de
            conventionnement auprès de la CPAM de son département, qui examine le respect des critères
            (ancienneté de l'autorisation, accessibilité du véhicule, engagement sur les tarifs conventionnés).
            Une fois la convention signée, le chauffeur peut pratiquer le tiers payant et facturer directement
            l'Assurance maladie.
          </p>
          <p>
            Les démarches détaillées, les pièces à fournir et les obligations du conventionnement sont expliquées
            dans notre guide dédié :{" "}
            <Link href="/blog/agrement-cpam-taxi-conventionne">agrément CPAM du taxi conventionné</Link>.
          </p>
        </section>

        <section id="tarif">
          <h2>Tarif convention 2025-2026</h2>
          <p>
            Le tarif du taxi conventionné est encadré par la convention nationale conclue entre l'Assurance maladie
            et les organisations professionnelles, déclinée localement par chaque CPAM. Il s'appuie sur le tarif
            préfectoral du taxi, auquel un abattement conventionnel est appliqué. Les principaux paramètres de
            référence sont :
          </p>
          <ul>
            <li>Prise en charge : 2,80 € ;</li>
            <li>Kilomètre tarif A (zone urbaine, course chargée) : 1,12 €/km ;</li>
            <li>Heure d'attente : 28,80 €/h ;</li>
            <li>Majorations de nuit, dimanche et jours fériés selon le barème préfectoral départemental.</li>
          </ul>
          <p>
            Le transport partagé, lorsque plusieurs patients voyagent ensemble vers des soins itératifs (dialyse,
            chimiothérapie, radiothérapie), fait l'objet d'une tarification réduite et reste à privilégier.
          </p>
        </section>

        <section id="prescription">
          <h2>Prescription médicale : obligatoire</h2>
          <p>
            Le recours à un taxi conventionné nécessite une prescription médicale de transport établie sur le
            formulaire CERFA 11574*07 (référence S3138g). Peuvent la prescrire le médecin traitant, un médecin
            hospitalier, et, dans certains cas, le médecin de la structure de soins. Le prescripteur coche le mode
            de transport adapté à l'état du patient — taxi conventionné, VSL ou ambulance — et ce choix conditionne
            le remboursement. Sans prescription, la course est un trajet de taxi classique non remboursé.
          </p>
        </section>

        <section id="remboursement">
          <h2>Remboursement du taxi conventionné</h2>
          <p>
            Le transport en taxi conventionné prescrit par un médecin est pris en charge par la Sécurité sociale.
            Le taux dépend du motif :
          </p>
          <ul>
            <li>
              <strong>100 %</strong> en cas d'affection longue durée (ALD) en lien avec le transport, d'accident du
              travail ou de maladie professionnelle, d'hospitalisation, de maternité à partir du 1er jour du
              6e mois, ou pour les bénéficiaires de la CSS et de l'AME ;
            </li>
            <li>
              <strong>65 %</strong> pour les autres motifs ; le complément est généralement pris en charge par la
              mutuelle complémentaire santé.
            </li>
          </ul>
          <p>
            Grâce à la dispense d'avance des frais (tiers payant), vous présentez votre carte Vitale et le bon de
            transport : le taxi facture directement la CPAM. La franchise médicale de 4 € par trajet (plafonnée à
            8 € par jour et 50 € par an) reste à votre charge.
          </p>
        </section>

        <section id="choisir">
          <h2>Choisir un taxi conventionné selon les besoins</h2>
          <p>
            Tous les taxis conventionnés n'offrent pas les mêmes prestations. Selon votre situation, vérifiez :
          </p>
          <ul>
            <li>L'accessibilité PMR (personne à mobilité réduite) si vous utilisez un fauteuil roulant pliable ;</li>
            <li>La possibilité de transport en position semi-allongée pour les trajets longs et fatigants ;</li>
            <li>La disponibilité pour les courtes distances urbaines comme pour les longues distances (transferts inter-hospitaliers, retour à domicile éloigné) ;</li>
            <li>La pratique systématique de la dispense d'avance des frais (tiers payant) ;</li>
            <li>La capacité à assurer des trajets réguliers pour des soins itératifs avec un planning fiable.</li>
          </ul>
          <p>
            Pour un patient nécessitant une surveillance ou devant être allongé, c'est un VSL ou une ambulance qui
            sera prescrit. Consultez notre guide{" "}
            <Link href="/vsl">VSL (Véhicule Sanitaire Léger)</Link> pour comparer les options.
          </p>
        </section>

        <section id="villes">
          <h2>Trouver un taxi conventionné par ville</h2>
          <p>
            L'annuaire RoullePro couvre la France entière. Accédez directement aux taxis conventionnés CPAM de
            votre ville parmi les principales agglomérations :
          </p>
          <div className="not-prose grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 my-6">
            {VILLES.map((v) => (
              <Link
                key={v.slug}
                href={`/transport-medical/${v.slug}`}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 transition"
              >
                Taxi conventionné {v.nom}
              </Link>
            ))}
          </div>
        </section>
      </article>

      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes sur le taxi conventionné</h2>
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

      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white mb-4">
            <Shield className="w-3.5 h-3.5" />
            Annuaire public, gratuit, sans inscription
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Trouver un taxi conventionné près de chez moi
          </h2>
          <p className="text-blue-100 mb-6 leading-relaxed">
            Recherchez par ville pour afficher les taxis conventionnés CPAM autour de vous.
          </p>
          <form action="/transport-medical/recherche" className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl max-w-xl mx-auto">
            <input type="hidden" name="categorie" value="taxi-conventionne" />
            <div className="flex-1 flex items-center gap-3 px-4">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Votre ville (ex : Paris, Marseille, Lyon...)"
                className="w-full py-3 text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              <Search className="w-4 h-4" />
              Rechercher
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
