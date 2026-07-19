import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ChevronRight, Shield, Search, MapPin, ClipboardCheck } from "lucide-react";
import { buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/sanitaire-seo";
import { REGLES_VSL, REGLES_AMBULANCE } from "@/lib/tarif-transport-sanitaire";
import { REGLES_CPAM } from "@/lib/tarif-cpam";

export const revalidate = 3600;

const TITLE = "Bon de transport : prescription, remboursement CPAM et démarches";
const DESCRIPTION =
  "Le bon de transport médical (CERFA 11574) : qui le prescrit, transport assis ou allongé, entente préalable et remboursement CPAM. Démarches patient expliquées.";
const H1 = "Bon de transport : prescription médicale, remboursement CPAM et démarches";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://roullepro.com/bon-de-transport" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", locale: "fr_FR" },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

// Montants tarifaires : lus depuis les libs (aucun chiffre en dur), formatés en euros.
const euro = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

// Maillage hub -> spokes : villes prioritaires vers les hubs ville de l'annuaire.
const VILLES_PRIORITAIRES: { nom: string; slug: string }[] = [
  { nom: "Nice", slug: "nice" },
  { nom: "Marseille", slug: "marseille" },
  { nom: "Lille", slug: "lille" },
  { nom: "Caen", slug: "caen" },
  { nom: "Rouen", slug: "rouen" },
  { nom: "Toulon", slug: "toulon" },
  { nom: "Rennes", slug: "rennes" },
  { nom: "Nancy", slug: "nancy" },
  { nom: "Bordeaux", slug: "bordeaux" },
  { nom: "Paris", slug: "paris" },
  { nom: "Lyon", slug: "lyon" },
  { nom: "Toulouse", slug: "toulouse" },
];

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Qu'est-ce qu'un bon de transport ?",
    answer:
      "Le « bon de transport » est le nom courant de la prescription médicale de transport, établie sur le formulaire CERFA 11574*07 (référence S3138g). Ce document, rédigé par un médecin, atteste que l'état de santé du patient justifie un transport et précise le mode adapté (transport assis en taxi conventionné ou VSL, ou transport allongé en ambulance). Il conditionne la prise en charge du trajet par l'Assurance maladie.",
  },
  {
    question: "Qui délivre le bon de transport ?",
    answer:
      "La prescription médicale de transport est délivrée par un médecin : le médecin traitant, un médecin hospitalier lors d'une hospitalisation ou d'une consultation, ou le médecin de la structure de soins. Le prescripteur évalue l'état du patient et coche le mode de transport adapté. Dans certains cas, une sage-femme ou un chirurgien-dentiste peut prescrire un transport dans le cadre de leur compétence.",
  },
  {
    question: "Quelle est la durée de validité d'un bon de transport ?",
    answer:
      "La prescription doit en principe être établie avant le transport (prescription préalable). Pour les soins et transports répétés (dialyse, chimiothérapie, radiothérapie), le médecin peut établir une prescription couvrant une série de trajets sur une période donnée. En cas d'urgence, la prescription peut être régularisée a posteriori par le médecin. Présentez toujours le bon de transport au transporteur et à l'Assurance maladie pour obtenir le remboursement.",
  },
  {
    question: "Faut-il un bon de transport pour un taxi conventionné ou un VSL ?",
    answer:
      "Oui. Sans prescription médicale de transport, la course n'est pas remboursée par la Sécurité sociale : elle est facturée comme un transport classique au tarif libre. Le bon de transport est indispensable pour bénéficier de la prise en charge et, le plus souvent, de la dispense d'avance des frais (tiers payant) auprès du taxi conventionné, du VSL ou de l'ambulance.",
  },
  {
    question: "Qu'est-ce que l'entente préalable pour un transport ?",
    answer:
      "Certains transports nécessitent, en plus de la prescription, un accord préalable du service médical de l'Assurance maladie. C'est le cas des transports sur une longue distance (plus de 150 km aller), des transports en série (au moins quatre transports de plus de 50 km sur une période de deux mois pour un même traitement) et des transports par avion ou par bateau de ligne régulière. Sans réponse de la caisse sous 15 jours, l'accord est réputé acquis.",
  },
  {
    question: "Comment le bon de transport est-il remboursé par la CPAM ?",
    answer:
      "Le transport prescrit est remboursé à 55 % du tarif conventionnel par l'Assurance maladie, le complément étant en général pris en charge par la mutuelle. Le remboursement passe à 100 % dans certaines situations : affection de longue durée (ALD) en lien avec le transport, accident du travail ou maladie professionnelle, maternité à partir du 6e mois, bénéficiaires de la complémentaire santé solidaire (CSS) ou de l'AME. Une franchise médicale de 4 € par trajet (plafonnée à 8 € par jour et à 50 € par an, tous dispositifs confondus) reste à la charge du patient.",
  },
];

export default function BonDeTransportPage() {
  const faqLd = buildFaqJsonLd(FAQ);
  const breadLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Transport médical", url: "/transport-medical" },
    { name: "Bon de transport", url: "/bon-de-transport" },
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }} />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/transport-medical" className="hover:text-white">Transport médical</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Bon de transport</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-5">
            <FileText className="w-3.5 h-3.5" />
            Guide patient — CERFA 11574 et prise en charge
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{H1}</h1>
          <p className="text-blue-100 max-w-2xl">
            Qu'est-ce qu'un bon de transport, qui le délivre, quelle est sa durée de validité, quand faut-il une
            entente préalable et comment se faire rembourser un transport assis ou allongé par la Sécurité sociale.
          </p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-sm sm:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">

        <section id="definition">
          <h2>Qu'est-ce qu'un bon de transport ?</h2>
          <p>
            Le « bon de transport » est le nom courant de la <strong>prescription médicale de transport</strong>.
            Il s'agit d'un document officiel établi par un médecin sur le formulaire CERFA 11574*07
            (référence S3138g), qui atteste que l'état de santé du patient justifie un transport pour se rendre à
            un lieu de soins ou en revenir. C'est ce document qui ouvre droit à la prise en charge du trajet par
            l'Assurance maladie.
          </p>
          <p>
            Le bon de transport indique le mode de transport adapté à l'état du patient, choisi médicalement par
            le prescripteur : transport assis (taxi conventionné ou VSL) ou transport allongé nécessitant une
            surveillance (ambulance). Ce choix conditionne le remboursement : un transport plus médicalisé que
            nécessaire peut ne pas être pris en charge.
          </p>
        </section>

        <section id="qui-delivre">
          <h2>Qui délivre le bon de transport ?</h2>
          <p>
            La prescription médicale de transport est établie par un médecin. Selon la situation, il peut s'agir :
          </p>
          <ul>
            <li>du <strong>médecin traitant</strong>, pour un transport lié à un suivi de ville ;</li>
            <li>d'un <strong>médecin hospitalier</strong>, lors d'une hospitalisation, d'une consultation externe ou d'une sortie ;</li>
            <li>du médecin de la structure de soins qui prend en charge le patient ;</li>
            <li>dans certains cas, d'une <strong>sage-femme</strong> ou d'un <strong>chirurgien-dentiste</strong>, dans le cadre de leur compétence.</li>
          </ul>
          <p>
            Le prescripteur évalue le niveau d'autonomie et l'état clinique du patient, puis coche le mode de
            transport adapté. Le patient n'a pas à choisir lui-même entre taxi conventionné, VSL et ambulance :
            c'est une décision médicale.
          </p>
        </section>

        <section id="remplir">
          <h2>Comment remplir et utiliser le CERFA 11574</h2>
          <p>
            Le CERFA 11574*07 comporte plusieurs parties : l'identification du patient, le motif médical du
            transport, le mode prescrit, et les mentions relatives à l'éventuelle entente préalable. Une fois la
            prescription obtenue, le patient réserve son transport auprès d'un transporteur conventionné, présente
            le bon de transport et sa carte Vitale le jour du trajet, puis conserve un exemplaire pour le
            remboursement.
          </p>
          <p>
            Pour un accompagnement pas-à-pas, consultez nos guides pratiques :{" "}
            <Link href="/blog/bon-transport-medical-cerfa-11574">obtenir et remplir le bon de transport (CERFA 11574)</Link>{" "}
            et{" "}
            <Link href="/blog/cerfa-11574-bon-transport-medical-exemple-rempli">un exemple de CERFA 11574 rempli champ par champ</Link>.
          </p>
        </section>

        <section id="validite">
          <h2>Durée de validité du bon de transport</h2>
          <p>
            La prescription doit en principe être établie <strong>avant</strong> le transport. Deux situations
            particulières existent :
          </p>
          <ul>
            <li>
              <strong>Transports répétés</strong> : pour des soins itératifs (dialyse, chimiothérapie,
              radiothérapie), le médecin peut établir une prescription couvrant une série de trajets sur une
              période déterminée, ce qui évite d'obtenir un bon avant chaque séance.
            </li>
            <li>
              <strong>Urgence</strong> : lorsque le transport n'a pas pu être prescrit à l'avance, la prescription
              peut être régularisée a posteriori par le médecin.
            </li>
          </ul>
          <p>
            Dans tous les cas, conservez le bon de transport : il vous sera demandé par le transporteur et par
            l'Assurance maladie pour obtenir le remboursement.
          </p>
        </section>

        <section id="mode">
          <h2>Transport assis ou ambulance : quel mode sur le bon ?</h2>
          <p>
            Le médecin coche sur le bon de transport le mode le moins médicalisé compatible avec l'état du
            patient. Le transport assis (taxi conventionné ou VSL) concerne les patients pouvant voyager assis ;
            l'ambulance est réservée aux patients devant être allongés ou nécessitant une surveillance. À titre
            indicatif, les forfaits conventionnels de référence diffèrent nettement selon le mode :
          </p>
          <div className="overflow-x-auto not-prose my-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 border-b border-gray-200">Mode de transport</th>
                  <th className="text-left font-semibold px-3 py-2 border-b border-gray-200">Position</th>
                  <th className="text-left font-semibold px-3 py-2 border-b border-gray-200">Forfait de référence</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Taxi conventionné</td>
                  <td className="px-3 py-2">Assise</td>
                  <td className="px-3 py-2">Prise en charge {euro(REGLES_CPAM.forfaitPriseEnCharge)} + tarif kilométrique départemental</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">VSL</td>
                  <td className="px-3 py-2">Assise</td>
                  <td className="px-3 py-2">Forfait {euro(REGLES_VSL.forfait)} + {euro(REGLES_VSL.tauxKm)}/km au-delà des km inclus</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium">Ambulance</td>
                  <td className="px-3 py-2">Allongée</td>
                  <td className="px-3 py-2">Forfait {euro(REGLES_AMBULANCE.forfait)} + {euro(REGLES_AMBULANCE.tauxKm)}/km au-delà des km inclus</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Ces montants sont des références conventionnelles et ne constituent pas un devis. Pour une estimation
            adaptée à votre trajet réel, utilisez le{" "}
            <Link href="/tarif-vsl">simulateur de prix VSL</Link>, le{" "}
            <Link href="/simulateur-taxi-conventionne">simulateur du taxi conventionné</Link> ou l'estimateur du{" "}
            <Link href="/tarif-ambulance">tarif ambulance</Link>. Pour comprendre chaque mode, consultez nos guides
            dédiés au <Link href="/vsl">VSL</Link> et au{" "}
            <Link href="/taxi-conventionne">taxi conventionné CPAM</Link>.
          </p>
        </section>

        <section id="entente-prealable">
          <h2>Entente préalable : quand est-elle requise ?</h2>
          <p>
            Pour certains transports, la prescription ne suffit pas : un <strong>accord préalable</strong> du
            service médical de l'Assurance maladie est nécessaire. Sont notamment concernés :
          </p>
          <ul>
            <li>les transports sur une <strong>longue distance</strong> (plus de 150 km aller) ;</li>
            <li>les <strong>transports en série</strong> : au moins quatre transports de plus de 50 km (aller) sur une période de deux mois, pour un même traitement ;</li>
            <li>les transports par <strong>avion</strong> ou par <strong>bateau</strong> de ligne régulière.</li>
          </ul>
          <p>
            La demande d'accord préalable est adressée au service médical avant le transport. En l'absence de
            réponse de la caisse dans un délai de 15 jours, l'accord est réputé acquis.
          </p>
        </section>

        <section id="remboursement">
          <h2>Remboursement du transport prescrit</h2>
          <p>
            Sur présentation du bon de transport, le transport prescrit est pris en charge par la Sécurité sociale.
            Le taux dépend de la situation :
          </p>
          <ul>
            <li>
              <strong>55 %</strong> du tarif conventionnel dans le cas général ; le complément est habituellement
              pris en charge par la mutuelle complémentaire santé.
            </li>
            <li>
              <strong>100 %</strong> en cas d'affection de longue durée (ALD) en lien avec le transport, d'accident
              du travail ou de maladie professionnelle, de maternité à partir du 1er jour du 6e mois, ou pour les
              bénéficiaires de la complémentaire santé solidaire (CSS) et de l'AME.
            </li>
          </ul>
          <p>
            Grâce à la dispense d'avance des frais (tiers payant), le patient présente sa carte Vitale et le bon de
            transport : le transporteur conventionné facture directement l'Assurance maladie. Une{" "}
            <strong>franchise médicale de 4 €</strong> par trajet (plafonnée à 8 € par jour et à 50 € par an, tous
            dispositifs confondus) reste à la charge du patient.
          </p>
          <p>
            Pour aller plus loin, consultez nos articles sur le{" "}
            <Link href="/blog/remboursement-transport-medical">remboursement du transport médical</Link>, la{" "}
            <Link href="/blog/franchise-medicale-transport-sanitaire">franchise médicale</Link> et le{" "}
            <Link href="/blog/transport-medical-ald-remboursement-100-2026">transport en ALD remboursé à 100 %</Link>.
          </p>
        </section>

        <section id="trouver">
          <h2>Réserver un transporteur avec votre bon de transport</h2>
          <p>
            Une fois le bon de transport obtenu, choisissez un transporteur conventionné près de chez vous.
            L'annuaire RoullePro recense, à partir de données publiques officielles, les taxis conventionnés, VSL
            et ambulances de votre secteur, avec le téléphone direct et le statut de conventionnement.
          </p>
          <div className="not-prose grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 my-6">
            {VILLES_PRIORITAIRES.map((v) => (
              <Link
                key={v.slug}
                href={`/transport-medical/${v.slug}`}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 transition"
              >
                Transport médical {v.nom}
              </Link>
            ))}
          </div>
          <p>
            Consultez aussi l'annuaire complet du{" "}
            <Link href="/transport-medical">transport sanitaire en France</Link> ou recherchez directement un{" "}
            <Link href="/vsl-autour-de-moi">VSL autour de vous</Link>.
          </p>
        </section>

        <section id="sources">
          <h2>Sources officielles</h2>
          <p>Les informations réglementaires de cette page sont vérifiables auprès des sources publiques suivantes :</p>
          <ul>
            <li>
              Assurance maladie —{" "}
              <a href="https://www.ameli.fr/assure/remboursements/rembourse/frais-transport" target="_blank" rel="noopener noreferrer nofollow">
                Frais de transport : prise en charge et remboursements (ameli.fr)
              </a>
            </li>
            <li>
              Assurance maladie —{" "}
              <a href="https://www.ameli.fr/medecin/exercice-liberal/regles-de-prescription-et-formalites/prescription-transports" target="_blank" rel="noopener noreferrer nofollow">
                Prescription des transports (ameli.fr)
              </a>
            </li>
            <li>
              Assurance maladie —{" "}
              <a href="https://www.ameli.fr/assure/droits-demarches/maladie-accident-hospitalisation/affection-longue-duree-ald/transports-maladie-chronique" target="_blank" rel="noopener noreferrer nofollow">
                Transport en affection de longue durée (ALD) (ameli.fr)
              </a>
            </li>
            <li>
              Service-public.fr —{" "}
              <a href="https://www.service-public.fr/particuliers/vosdroits/F2951" target="_blank" rel="noopener noreferrer nofollow">
                Prise en charge des frais de transport pour raison médicale
              </a>
            </li>
          </ul>
        </section>
      </article>

      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes sur le bon de transport</h2>
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
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Trouver un transporteur conventionné</h2>
          <p className="text-blue-100 mb-6 leading-relaxed">
            Recherchez par ville pour afficher les taxis conventionnés, VSL et ambulances autour de vous.
          </p>
          <form action="/transport-medical/recherche" className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl max-w-xl mx-auto">
            <div className="flex-1 flex items-center gap-3 px-4">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Votre ville (ex : Rennes, Bordeaux, Lille...)"
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
          <div className="mt-6">
            <Link
              href="/transport-medical"
              className="inline-flex items-center gap-1 text-sm text-white/90 font-semibold hover:text-white"
            >
              <ClipboardCheck className="w-4 h-4" />
              Voir tout l'annuaire du transport sanitaire
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
