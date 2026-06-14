import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import GuideLayout, { type SectionEntry } from "../_components/GuideLayout";
import FaqAccordion, { type FaqItem } from "../_components/FaqAccordion";
import JsonLd from "../_components/JsonLd";

export const revalidate = 3600;

const SLUG = "comment-se-faire-conventionner-cpam";
const TITLE =
  "Comment se faire conventionner CPAM en 2026 : guide complet taxi / VSL / ambulance";
const DESCRIPTION =
  "Conventionnement CPAM 2026 : conditions d'éligibilité, étapes, documents à fournir, délais, tarifs CNAMTS et erreurs fréquentes pour les taxis, VSL et ambulances.";
const PUBLISHED_AT = "2026-06-14T08:00:00Z";
const UPDATED_AT = "2026-06-14T08:00:00Z";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `/guides/${SLUG}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    publishedTime: PUBLISHED_AT,
    modifiedTime: UPDATED_AT,
    images: ["/logo-roullepro-horizontal.png"],
  },
};

const SECTIONS: SectionEntry[] = [
  { id: "pourquoi", label: "Pourquoi se conventionner" },
  { id: "eligibilite", label: "Conditions d'éligibilité" },
  { id: "etapes", label: "Les étapes du conventionnement" },
  { id: "documents", label: "Documents à fournir" },
  { id: "delais", label: "Délais et tarifs" },
  { id: "erreurs", label: "Erreurs fréquentes" },
  { id: "faq", label: "FAQ" },
];

const FAQ: FaqItem[] = [
  {
    q: "Le conventionnement CPAM est-il obligatoire pour un taxi, un VSL ou une ambulance ?",
    a: "Pour un taxi, le conventionnement est facultatif : un taxi peut exercer sans convention, mais il ne pourra alors pas transporter de patients en tiers payant remboursé par l'Assurance maladie. Pour les ambulances et les VSL, l'activité de transport sanitaire de patients suppose un agrément de l'ARS et une relation conventionnelle avec l'Assurance maladie pour facturer les transports prescrits. Sans conventionnement, l'accès au marché du transport de patients remboursé est très limité.",
  },
  {
    q: "Combien de temps prend une demande de conventionnement CPAM ?",
    a: "Le délai varie selon les caisses et la complétude du dossier, mais il faut généralement compter de quelques semaines à plusieurs mois. L'étape la plus longue est souvent l'obtention préalable de l'autorisation préfectorale ou de l'agrément ARS. Une fois ces documents en main et le dossier CPAM complet, la signature de la convention et l'activation de la facturation peuvent intervenir relativement vite. Anticiper et soigner le dossier réduit fortement les allers-retours.",
  },
  {
    q: "Faut-il un véhicule spécifique pour se faire conventionner ?",
    a: "Cela dépend de l'activité. Pour une ambulance ou un VSL, le véhicule doit être conforme aux normes du transport sanitaire et figurer dans l'agrément ARS. Pour un taxi conventionné, c'est le taxi qui sert au transport, équipé d'un taximètre et d'un lumineux, et titulaire d'une autorisation de stationnement. Dans tous les cas, le véhicule doit être en règle, assuré pour le transport de personnes et entretenu selon les obligations en vigueur.",
  },
  {
    q: "Qu'est-ce que la facturation SESAM-Vitale et est-elle obligatoire ?",
    a: "SESAM-Vitale est le système de télétransmission des feuilles de soins électroniques vers l'Assurance maladie. Il permet de facturer en tiers payant et d'être payé rapidement. Pour un transporteur conventionné, disposer d'un équipement compatible SESAM-Vitale est en pratique indispensable. À l'horizon du 1er janvier 2027, le SEFi renforce cette logique en imposant une facturation intégrée en temps réel avec géolocalisation pour le transport sanitaire conventionné.",
  },
  {
    q: "Puis-je me faire conventionner pour plusieurs activités à la fois ?",
    a: "Oui, une entreprise peut cumuler plusieurs activités, par exemple ambulance et VSL, à condition de remplir les conditions propres à chacune : agrément ARS couvrant les véhicules concernés, équipages qualifiés et véhicules conformes. Le conventionnement avec l'Assurance maladie portera sur les activités effectivement autorisées. Un artisan taxi peut aussi, séparément, conventionner son taxi tout en exerçant une activité de taxi classique.",
  },
  {
    q: "Que se passe-t-il si mon dossier de conventionnement est incomplet ?",
    a: "Un dossier incomplet est la première cause de retard. La caisse réclame les pièces manquantes, ce qui rallonge le délai de plusieurs semaines. Il est donc essentiel de vérifier la liste exacte des documents demandés par ta CPAM, de fournir des copies lisibles et à jour, et de respecter les formats attendus. Constituer un dossier complet dès le départ est le meilleur moyen d'obtenir un conventionnement rapide.",
  },
  {
    q: "Le conventionnement peut-il être suspendu ou retiré ?",
    a: "Oui. Le conventionnement comporte des engagements : appliquer la grille tarifaire conventionnelle, respecter les obligations de transport partagé, facturer correctement, accepter les contrôles. Le non-respect répété de ces engagements, des facturations irrégulières ou la perte de l'agrément ARS peuvent entraîner une suspension puis une résiliation de la convention, avec parfois un recouvrement des sommes indûment perçues. Le respect des règles protège ton activité.",
  },
  {
    q: "RoullePro peut-il m'aider une fois conventionné ?",
    a: "Oui. Une fois conventionné, tu peux créer ta fiche professionnelle sur RoullePro pour être visible auprès des patients et des prescripteurs de ta ville. Le plan Pro te donne accès à la veille réglementaire filtrée par métier, à un profil de conformité avec score, et au suivi des échéances comme la nouvelle tarification taxi ou le SEFi 2027. C'est un moyen de sécuriser ton activité conventionnée et de développer ton volume de courses.",
  },
];

export default function ConventionnementCpamGuide() {
  return (
    <>
      <JsonLd
        slug={SLUG}
        title={TITLE}
        description={DESCRIPTION}
        breadcrumbLabel="Se faire conventionner CPAM"
        publishedAt={PUBLISHED_AT}
        updatedAt={UPDATED_AT}
        faq={FAQ}
      />
      <GuideLayout
        title={TITLE}
        intro="Taxi, VSL ou ambulance : le conventionnement CPAM ouvre l'accès au transport de patients remboursé et au tiers payant. Conditions, étapes, documents, délais, tarifs et pièges à éviter pour se conventionner sereinement en 2026."
        breadcrumbLabel="Se faire conventionner CPAM"
        sections={SECTIONS}
        publishedDate="Juin 2026"
      >
        <p>
          Se faire <strong>conventionner par la CPAM</strong> est une étape clé pour tout professionnel du transport de patients : taxi, VSL ou ambulance. Le conventionnement t&apos;autorise à transporter des assurés sur prescription médicale, à pratiquer le <strong>tiers payant</strong> et à être payé directement par l&apos;Assurance maladie. C&apos;est l&apos;accès à un marché stable et récurrent. Ce guide détaille pas à pas pourquoi et comment se conventionner, quelles conditions remplir, quels documents préparer et quelles erreurs éviter pour réussir du premier coup.
        </p>

        <section id="pourquoi">
          <h2>Pourquoi se conventionner</h2>
          <p>
            Le conventionnement transforme l&apos;activité d&apos;un transporteur. Pour un taxi, il ouvre l&apos;accès aux <strong>courses sanitaires prescrites</strong>, un volume d&apos;activité régulier et peu sensible aux saisons, contrairement aux courses touristiques ou ponctuelles. Les trajets de dialyse, de chimiothérapie ou les sorties d&apos;hospitalisation génèrent des rendez-vous réguliers, parfois plusieurs fois par semaine pour un même patient.
          </p>
          <p>
            Le deuxième avantage est la <strong>sécurité financière</strong>. Avec le tiers payant et la télétransmission, le transporteur est payé par l&apos;Assurance maladie selon une grille tarifaire connue à l&apos;avance. Le risque d&apos;impayé est très faible et la trésorerie plus prévisible que sur une activité libre. Pour une ambulance ou un VSL, le conventionnement est tout simplement la condition d&apos;exercice de l&apos;essentiel de leur métier.
          </p>
          <p>
            Enfin, le conventionnement améliore la <strong>visibilité</strong> auprès des prescripteurs et des établissements de soins, qui orientent en priorité vers des transporteurs conventionnés. Être référencé comme professionnel conventionné renforce la confiance des patients et des hôpitaux partenaires.
          </p>
        </section>

        <section id="eligibilite">
          <h2>Conditions d&apos;éligibilité</h2>
          <p>
            Avant de déposer une demande, tu dois remplir plusieurs conditions, qui varient selon l&apos;activité visée.
          </p>
          <ul>
            <li>
              <strong>Autorisation ou agrément.</strong> Pour un taxi, une autorisation de stationnement (ADS) délivrée par une commune. Pour une ambulance ou un VSL, un agrément de transport sanitaire délivré par l&apos;Agence Régionale de Santé.
            </li>
            <li>
              <strong>Véhicule conforme.</strong> Taxi équipé d&apos;un taximètre, d&apos;un lumineux et de l&apos;équipement obligatoire ; ambulance ou VSL conformes aux normes du transport sanitaire et inscrits à l&apos;agrément.
            </li>
            <li>
              <strong>Formation et qualification.</strong> Pour le transport sanitaire, un équipage qualifié : Diplôme d&apos;État d&apos;Ambulancier pour l&apos;ambulance, auxiliaire ambulancier pour le VSL. Pour le taxi, la carte professionnelle de conducteur de taxi en cours de validité.
            </li>
            <li>
              <strong>Entreprise en règle.</strong> Immatriculation, assurance pour le transport de personnes, situation fiscale et sociale à jour.
            </li>
          </ul>
          <p>
            Ces prérequis conditionnent l&apos;acceptation du dossier. La CPAM vérifie que tu disposes des autorisations nécessaires avant d&apos;examiner la demande de conventionnement proprement dite.
          </p>
        </section>

        <section id="etapes">
          <h2>Les étapes du conventionnement</h2>
          <p>
            Le parcours de conventionnement suit quatre grandes étapes, qu&apos;il vaut mieux dérouler dans l&apos;ordre.
          </p>
          <ol>
            <li>
              <strong>Obtenir l&apos;autorisation préalable.</strong> Selon ton activité, décroche d&apos;abord l&apos;autorisation de stationnement auprès de la commune (taxi) ou l&apos;agrément de transport sanitaire auprès de l&apos;ARS (ambulance, VSL). C&apos;est la fondation : sans elle, aucune demande de conventionnement n&apos;aboutira.
            </li>
            <li>
              <strong>Constituer le dossier CPAM.</strong> Rassemble l&apos;ensemble des pièces justificatives demandées par ta caisse primaire d&apos;assurance maladie. Vérifie la liste exacte auprès de ta CPAM, car les attendus peuvent varier d&apos;un département à l&apos;autre.
            </li>
            <li>
              <strong>Signer la convention.</strong> Pour le taxi conventionné, l&apos;adhésion s&apos;inscrit dans le cadre de la convention-cadre nationale du 13 mai 2025 et de sa déclinaison locale. Pour le transport sanitaire, la relation conventionnelle encadre la facturation des transports prescrits. La signature acte tes engagements tarifaires et de service.
            </li>
            <li>
              <strong>Mettre en place la facturation SESAM-Vitale.</strong> Équipe-toi d&apos;un système de télétransmission compatible pour facturer en tiers payant. Anticipe dès maintenant le passage au SEFi, qui deviendra obligatoire pour le transport sanitaire conventionné au 1er janvier 2027, avec facturation intégrée et géolocalisation.
            </li>
          </ol>
        </section>

        <section id="documents">
          <h2>Documents à fournir</h2>
          <p>
            La liste exacte est précisée par ta CPAM, mais un dossier de conventionnement comprend généralement les pièces suivantes.
          </p>
          <ul>
            <li>Justificatif d&apos;immatriculation de l&apos;entreprise (extrait Kbis ou équivalent)</li>
            <li>Autorisation de stationnement (taxi) ou agrément ARS (ambulance, VSL)</li>
            <li>Carte professionnelle de conducteur de taxi en cours de validité, le cas échéant</li>
            <li>Diplômes et attestations de l&apos;équipage (DEA, auxiliaire ambulancier)</li>
            <li>Carte grise du ou des véhicules concernés</li>
            <li>Attestation d&apos;assurance couvrant le transport de personnes</li>
            <li>Relevé d&apos;identité bancaire pour le versement des remboursements</li>
            <li>Attestation de régularité fiscale et sociale</li>
            <li>Formulaire de demande de conventionnement complété et signé</li>
          </ul>
          <p>
            Fournis des copies lisibles, datées et à jour. Un document expiré ou illisible suffit à bloquer le traitement du dossier.
          </p>
        </section>

        <section id="delais">
          <h2>Délais et tarifs négociés CNAMTS</h2>
          <p>
            Le <strong>délai</strong> de conventionnement dépend surtout de l&apos;obtention des autorisations préalables et de la complétude du dossier CPAM. Une fois les pièces réunies, la signature et l&apos;activation de la facturation interviennent dans des délais raisonnables. Prévois néanmoins plusieurs semaines, voire quelques mois si l&apos;agrément ARS reste à obtenir.
          </p>
          <p>
            Les <strong>tarifs</strong> applicables aux transports conventionnés sont négociés au niveau national entre l&apos;Assurance maladie (CNAMTS) et les organisations professionnelles, puis déclinés localement. Pour le taxi conventionné, la convention-cadre du 13 mai 2025 a introduit une nouvelle grille en vigueur depuis le 1er octobre 2025, articulée autour d&apos;une base kilométrique et de suppléments encadrés. Pour les ambulances et VSL, les tarifs relèvent du transport sanitaire national. Tu ne fixes pas librement tes prix : tu appliques la grille conventionnelle, sans dépassement.
          </p>
        </section>

        <section id="erreurs">
          <h2>Erreurs fréquentes à éviter</h2>
          <ul>
            <li>
              <strong>Déposer la demande avant d&apos;avoir l&apos;autorisation préalable.</strong> Sans ADS ou agrément ARS, le dossier ne peut pas aboutir. Commence toujours par l&apos;autorisation.
            </li>
            <li>
              <strong>Sous-estimer la complétude du dossier.</strong> Une pièce manquante ou périmée déclenche des allers-retours coûteux en temps. Vérifie la liste auprès de ta CPAM.
            </li>
            <li>
              <strong>Négliger l&apos;équipement de facturation.</strong> Sans SESAM-Vitale opérationnel, le tiers payant est impossible. Anticipe aussi le SEFi 2027 pour le transport sanitaire.
            </li>
            <li>
              <strong>Ignorer les obligations conventionnelles.</strong> Tarifs, transport partagé obligatoire depuis le 1er avril 2025, acceptation des contrôles : le non-respect expose à la suspension du conventionnement.
            </li>
            <li>
              <strong>Oublier de se rendre visible.</strong> Une fois conventionné, encore faut-il que patients et prescripteurs te trouvent. Créer une fiche professionnelle est un levier simple de développement.
            </li>
          </ul>
        </section>

        <section id="faq">
          <h2>Questions fréquentes</h2>
          <FaqAccordion items={FAQ} />
        </section>

        <div className="not-prose my-10 bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-2xl p-7">
          <h2 className="text-xl font-bold mb-2">Conventionné ? Rends-toi visible sur RoullePro</h2>
          <p className="text-blue-100 text-sm mb-5">
            Crée ta fiche professionnelle pour être trouvé par les patients et les prescripteurs de ta ville, et active le plan Pro pour la veille réglementaire et le suivi de tes échéances.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/transport-medical/inscription"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-blue-800 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Créer ma fiche pro
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pro"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/20 transition"
            >
              Découvrir l&apos;offre Pro
            </Link>
          </div>
        </div>

        <section className="not-prose mt-12 pt-8 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Pour aller plus loin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/taxi-conventionne"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition"
            >
              <h3 className="font-semibold text-slate-900 mb-1">Taxi conventionné</h3>
              <p className="text-sm text-slate-600">
                Hub national des taxis agréés CPAM.
              </p>
            </Link>
            <Link
              href="/vsl"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition"
            >
              <h3 className="font-semibold text-slate-900 mb-1">VSL</h3>
              <p className="text-sm text-slate-600">
                Annuaire des véhicules sanitaires légers.
              </p>
            </Link>
            <Link
              href="/transport-medical"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition"
            >
              <h3 className="font-semibold text-slate-900 mb-1">Annuaire transport médical</h3>
              <p className="text-sm text-slate-600">
                Ambulances, VSL et taxis conventionnés par ville.
              </p>
            </Link>
            <Link
              href="/guides/vsl-vs-taxi-conventionne"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition"
            >
              <h3 className="font-semibold text-slate-900 mb-1">VSL vs Taxi conventionné</h3>
              <p className="text-sm text-slate-600">
                Comparatif des deux modes de transport assis.
              </p>
            </Link>
          </div>
        </section>
      </GuideLayout>
    </>
  );
}
