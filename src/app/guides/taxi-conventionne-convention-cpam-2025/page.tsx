import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, {
  type SectionEntry,
} from "../_components/GuideLayout";
import AlertCardLink from "../_components/AlertCardLink";
import CtaUpgrade from "../_components/CtaUpgrade";
import FaqAccordion, { type FaqItem } from "../_components/FaqAccordion";
import JsonLd from "../_components/JsonLd";
import { getAlertsBySlug } from "../_lib/fetch-alerts";

export const revalidate = 3600;

const SLUG = "taxi-conventionne-convention-cpam-2025";
const TITLE = "Taxi conventionné CPAM : nouvelle convention 2025-2027";
const META_TITLE = "Taxi conventionné CPAM 2025 — Mise à jour 2026 incluse";
const DESCRIPTION =
  "Tout sur le taxi conventionné CPAM : convention 2025-2026, tarifs, remboursement, comment trouver un agréé. Guide actualisé avec les changements 2026.";
const PUBLISHED_AT = "2026-05-18T08:00:00Z";
const UPDATED_AT = "2026-05-18T08:00:00Z";

export const metadata: Metadata = {
  title: META_TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `/guides/${SLUG}` },
  openGraph: {
    title: META_TITLE,
    description: DESCRIPTION,
    type: "article",
    publishedTime: PUBLISHED_AT,
    modifiedTime: UPDATED_AT,
    images: ["/logo-roullepro-horizontal.png"],
  },
};

const SECTIONS: SectionEntry[] = [
  { id: "convention", label: "Convention-cadre du 13 mai 2025" },
  { id: "tarification", label: "Nouvelle tarification" },
  { id: "transport-partage", label: "Transport partagé obligatoire" },
  { id: "sefi", label: "SEFi 2027" },
  { id: "transition", label: "Transition jusqu'au 1er janvier 2027" },
  { id: "faq", label: "FAQ" },
];

const FAQ: FaqItem[] = [
  {
    q: "Mon entreprise de taxi conventionné est-elle concernée par la nouvelle convention de mai 2025 ?",
    a: "Oui, si vous êtes conventionné avec une caisse primaire d'assurance maladie pour le transport sanitaire de patients. La convention-cadre nationale du 13 mai 2025 remplace les conventions départementales antérieures pour ce qui concerne les règles communes. Une convention locale peut compléter le dispositif sur les aspects propres à chaque territoire.",
  },
  {
    q: "Quelle est la nouvelle tarification taxi conventionné 2025 ?",
    a: "La tarification entrée en vigueur le 1er octobre 2025 distingue une base kilométrique unifiée et une série de suppléments (prise en charge, attente, retour à vide, dimanches et jours fériés, transport partagé, longue distance). Les barèmes précis sont fixés par l'avenant tarifaire signé en parallèle de la convention-cadre et publiés sur ameli.fr. RoullePro publie une fiche dédiée avec les chiffres clés.",
  },
  {
    q: "Quand le transport partagé est-il obligatoire pour un taxi conventionné ?",
    a: "Depuis le 1er avril 2025, le transport partagé est obligatoire pour les transports assis programmés vers les centres de dialyse, de chimiothérapie, de radiothérapie ou pour les soins itératifs comparables, dès lors que le partage est compatible avec l'état du patient et les horaires de soins. Le décret n°2025-202 du 2 mars 2025 fixe les modalités et les justifications de refus.",
  },
  {
    q: "Ai-je besoin d'un nouveau terminal de paiement pour le SEFi 2027 ?",
    a: "Oui. Le SEFi suppose un terminal embarqué connecté à un logiciel de facturation conventionné, capable de transmettre la course à la CPAM en temps réel et de tracer la géolocalisation GPS du véhicule. Les terminaux taxi classiques (taximètres certifiés et terminaux carte bancaire) ne suffisent pas seuls. Un boîtier complémentaire et un logiciel agréé doivent être déployés au plus tard le 1er janvier 2027.",
  },
  {
    q: "Que se passe-t-il si je ne renouvelle pas mon conventionnement aux nouvelles règles ?",
    a: "Le conventionnement peut être suspendu, puis résilié. En pratique, sans conventionnement, vous ne pouvez plus facturer en tiers payant à la CPAM pour le transport sanitaire de patients. L'activité conventionnée devient alors impossible. Les pénalités peuvent être complétées par des recouvrements d'indus si des manquements antérieurs sont identifiés.",
  },
];

export default async function TaxiGuide() {
  const alerts = await getAlertsBySlug([
    "convention-cadre-nationale-taxi-conventionne-2025",
    "transport-partage-obligatoire-decret-2025-202",
    "sefi-geolocalisation-obligation-2027-transport-sanitaire",
  ]);

  return (
    <>
      <JsonLd
        slug={SLUG}
        title={TITLE}
        description={DESCRIPTION}
        breadcrumbLabel="Taxi conventionné"
        publishedAt={PUBLISHED_AT}
        updatedAt={UPDATED_AT}
        faq={FAQ}
      />
      <GuideLayout
        title={TITLE}
        intro="Convention-cadre du 13 mai 2025, nouvelle tarification depuis octobre 2025, transport partagé et SEFi 2027 : tout ce que les taxis conventionnés doivent maîtriser pour la période 2025-2027."
        breadcrumbLabel="Taxi conventionné"
        sections={SECTIONS}
        publishedDate="Mai 2026"
      >
        <section id="convention">
          <h2>Convention-cadre du 13 mai 2025</h2>
          <p>
            La <strong>convention-cadre nationale</strong> régissant les relations entre les taxis conventionnés et l&apos;Assurance maladie a été signée le <strong>13 mai 2025</strong> entre la Cnam et les organisations professionnelles représentatives. Elle structure l&apos;ensemble des règles communes applicables au transport assis de patients par les taxis ayant choisi le conventionnement avec une caisse primaire.
          </p>
          <p>
            Cette convention remplace en grande partie les conventions départementales hétérogènes qui s&apos;étaient empilées au fil des années. Elle harmonise les conditions d&apos;adhésion, les engagements respectifs des parties, les obligations de qualité de service, le traitement des litiges et les conditions de fin de conventionnement. Une convention locale peut compléter le dispositif sur des aspects géographiques précis (zones rurales, départements à forte saisonnalité).
          </p>
          <p>
            Les principaux engagements pour le transporteur sont les suivants : appliquer la grille tarifaire conventionnelle sans dépassement, respecter les horaires programmés, accepter le transport partagé dans les conditions du décret n°2025-202, facturer en tiers payant via les outils conventionnels (et SEFi au 1er janvier 2027), et participer aux contrôles diligentés par l&apos;Assurance maladie.
          </p>
        </section>

        <section id="tarification">
          <h2>Nouvelle tarification depuis le 1er octobre 2025</h2>
          <p>
            La <strong>nouvelle grille tarifaire</strong> est entrée en application le <strong>1er octobre 2025</strong>, avec un avenant tarifaire annexé à la convention-cadre. Elle est articulée autour d&apos;une base kilométrique nationale unifiée et de suppléments encadrés, dont les principaux sont :
          </p>
          <ul>
            <li>Forfait de prise en charge à l&apos;origine du trajet</li>
            <li>Tarif kilométrique pondéré selon la zone (urbaine, périurbaine, rurale)</li>
            <li>Supplément retour à vide quand le transporteur ne reçoit pas de course retour</li>
            <li>Supplément dimanche, jours fériés et nuit</li>
            <li>Tarif spécifique pour le transport partagé (deux à quatre patients dans le même véhicule)</li>
            <li>Encadrement spécifique pour la longue distance (au-delà de 150 km, avec entente préalable)</li>
          </ul>
          <p>
            Les barèmes précis sont publiés sur ameli.fr et peuvent évoluer par avenant. Pour les taxis conventionnés, il est essentiel d&apos;intégrer immédiatement les nouveaux tarifs dans le terminal de facturation et de former les conducteurs aux nouvelles règles de calcul. <strong>L&apos;application d&apos;un ancien tarif n&apos;est plus tolérée</strong> et expose à des rejets de facturation.
          </p>
          <div className="not-prose my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts
              .filter((a) => a.slug === "convention-cadre-nationale-taxi-conventionne-2025")
              .map((a) => (
                <AlertCardLink key={a.slug} alert={a} />
              ))}
          </div>
        </section>

        <CtaUpgrade variant="compact" />

        <section id="transport-partage">
          <h2>Transport partagé obligatoire</h2>
          <p>
            Le <strong>décret n°2025-202 du 2 mars 2025</strong> a rendu le transport partagé obligatoire à compter du <strong>1er avril 2025</strong>, pour les transports assis programmés à destination de centres de soins itératifs (dialyse, chimiothérapie, radiothérapie, soins comparables réguliers). Le principe est simple : lorsque les conditions sont compatibles (état du patient, horaires de soins, capacité du véhicule), le transporteur doit accepter le partage du trajet entre plusieurs patients.
          </p>
          <p>
            Pour le taxi conventionné, cela implique en pratique trois changements opérationnels. <strong>D&apos;une part</strong>, accepter les missions partagées qui lui sont proposées par les plateformes de coordination de l&apos;Assurance maladie ou par les centres de soins partenaires. <strong>D&apos;autre part</strong>, organiser le véhicule pour accueillir plusieurs patients en sécurité (places assises, ceintures, accessibilité). <strong>Enfin</strong>, documenter les éventuels refus de partage dans des cas justifiés par l&apos;état médical du patient.
          </p>
          <p>
            Le non-respect répété de l&apos;obligation de partage peut entraîner une diminution du volume de courses confiées par les plateformes et, à terme, une suspension du conventionnement.
          </p>
        </section>

        <section id="sefi">
          <h2>SEFi obligatoire au 1er janvier 2027</h2>
          <p>
            Le <strong>SEFi</strong> (Service Électronique de Facturation Intégrée) devient obligatoire pour tous les transporteurs sanitaires conventionnés, y compris les taxis, au <strong>1er janvier 2027</strong>. Il impose la facturation en temps réel à la CPAM via un logiciel agréé, et la <strong>géolocalisation GPS</strong> du véhicule durant la course.
          </p>
          <p>
            Pour un taxi conventionné, le SEFi se traduit par l&apos;installation d&apos;un boîtier télématique dans le véhicule et l&apos;adoption d&apos;un logiciel de facturation agréé. Ce logiciel remplace ou complète le système actuel de prise en charge (carte Vitale, terminal CPAM, télétransmission). L&apos;intégralité de la prestation (bon de transport, identité du patient, trajet effectif, durée, suppléments) est transmise à la CPAM dès la fin de la course.
          </p>
          <p>
            Les éditeurs de logiciels agréés sont en nombre limité et leurs carnets de commandes se remplissent rapidement à l&apos;approche de 2027. Il est fortement conseillé de signer un contrat dans le courant de 2026 et de prévoir trois à six mois entre la signature et la pleine opérationnalité (paramétrage, installation, formation, tests CPAM).
          </p>
        </section>

        <section id="transition">
          <h2>Transition jusqu&apos;au 1er janvier 2027</h2>
          <p>
            La convention-cadre du 13 mai 2025 prévoit une <strong>période de transition de 18 mois</strong> entre le 1er octobre 2025 (entrée en vigueur de la nouvelle tarification) et le <strong>1er janvier 2027</strong> (généralisation du SEFi et fin du dispositif transitoire). Cette période est précieuse pour préparer sereinement la mise en conformité complète.
          </p>
          <p>
            Plan d&apos;action conseillé pour un taxi conventionné :
          </p>
          <ol>
            <li>
              <strong>Avant fin 2026</strong> : choisir et signer le contrat avec un éditeur SEFi agréé. Demander au moins deux devis comparatifs, vérifier la compatibilité avec le taximètre existant, négocier la durée d&apos;engagement.
            </li>
            <li>
              <strong>Premier semestre 2026</strong> : participer aux formations proposées par l&apos;organisation professionnelle ou directement par la CPAM. Former les conducteurs aux nouveaux tarifs et au transport partagé.
            </li>
            <li>
              <strong>Second semestre 2026</strong> : installation du boîtier SEFi, paramétrage du logiciel, phase de tests avec la CPAM en facturation parallèle. Documenter chaque étape.
            </li>
            <li>
              <strong>Décembre 2026</strong> : bascule complète SEFi, archivage des derniers documents au format ancien, mise à jour des contrats clients (hôpitaux, EHPAD, cliniques) pour intégrer les changements de tarif et de mode de facturation.
            </li>
          </ol>
        </section>

        <CtaUpgrade />

        <section id="faq">
          <h2>Questions fréquentes</h2>
          <FaqAccordion items={FAQ} />
        </section>

        <section className="not-prose mt-12 pt-8 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Pour aller plus loin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/guides/transport-sanitaire-conformite-2026-2027"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition"
            >
              <h3 className="font-semibold text-slate-900 mb-1">Guide hub</h3>
              <p className="text-sm text-slate-600">
                Panorama complet 2025-2028 toutes catégories.
              </p>
            </Link>
            <Link
              href="/guides/vsl-reglementation-transport-partage"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition"
            >
              <h3 className="font-semibold text-slate-900 mb-1">Guide VSL</h3>
              <p className="text-sm text-slate-600">
                Transport partagé et SEFi pour les véhicules sanitaires légers.
              </p>
            </Link>
          </div>
        </section>
      </GuideLayout>
    </>
  );
}
