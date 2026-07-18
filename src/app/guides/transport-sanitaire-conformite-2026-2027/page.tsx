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
import MaillageTransporteurs from "@/components/etablissements/MaillageTransporteurs";

export const revalidate = 3600;

const SLUG = "transport-sanitaire-conformite-2026-2027";
const TITLE =
  "Conformité transport sanitaire 2026-2027 : guide complet";
const DESCRIPTION =
  "Transport sanitaire conformité 2026 : SEFi 2027, convention taxi CPAM 2025, arrêté ambulance 2026, transport partagé. Tout ce qu'il faut savoir pour se mettre en règle.";
const PUBLISHED_AT = "2026-05-18T08:00:00Z";
const UPDATED_AT = "2026-05-18T08:00:00Z";

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
  { id: "panorama", label: "Panorama des évolutions 2025-2028" },
  { id: "concernes", label: "Qui est concerné" },
  { id: "calendrier", label: "Calendrier consolidé" },
  { id: "alertes-cles", label: "Les 5 alertes clés" },
  { id: "guides-metier", label: "Guides par métier" },
  { id: "se-preparer", label: "Comment se préparer" },
  { id: "faq", label: "FAQ" },
];

const FAQ: FaqItem[] = [
  {
    q: "Mon entreprise de transport sanitaire est-elle concernée par ces réformes ?",
    a: "Oui, dès lors que vous facturez tout ou partie de votre activité à l'Assurance maladie. Les transporteurs sanitaires conventionnés (ambulance, VSL, taxi conventionné) sont tous touchés à différents niveaux. Les taxis conventionnés sont impactés par la convention-cadre du 13 mai 2025 et par l'obligation SEFi au 1er janvier 2027. Les VSL et taxis sont concernés par le transport partagé obligatoire issu du décret n°2025-202 du 2 mars 2025. Les ambulances sont impactées par l'arrêté du 20 avril 2026 sur les caractéristiques techniques, ainsi que par le SEFi.",
  },
  {
    q: "Quelles sont les principales dates butoirs ?",
    a: "1er avril 2025 : entrée en vigueur du transport partagé obligatoire pour les transports assis programmés (dialyse, chimiothérapie, radiothérapie, soins itératifs).\n1er octobre 2025 : nouvelle tarification taxi conventionné en application.\n1er janvier 2027 : obligation SEFi (facturation électronique) et géolocalisation GPS pour tous les transporteurs sanitaires conventionnés. Fin de la période transitoire taxi conventionné.\n25 avril 2028 : date limite de mise en conformité technique des ambulances avec l'arrêté du 20 avril 2026.",
  },
  {
    q: "Que se passe-t-il si je ne suis pas en conformité ?",
    a: "Les conventions avec les organismes payeurs peuvent être suspendues ou résiliées. Sans conventionnement, vous ne pouvez plus exercer dans le cadre du tiers payant, ce qui rend l'activité économiquement quasiment impossible. Des contrôles a posteriori peuvent également déboucher sur des indus, des pénalités financières voire des poursuites pour fraude en cas de manquements graves.",
  },
  {
    q: "Combien va coûter la mise en conformité ?",
    a: "Pour le SEFi et la géolocalisation, comptez en général entre 30 et 80 euros HT par véhicule et par mois pour un service logiciel intégré incluant boîtier GPS, terminal de facturation et logiciel de planification. Pour la mise aux normes ambulance, le coût dépend de l'âge de la flotte. Plusieurs aides peuvent être mobilisées (crédits-bails, leasing, plan de financement avec la branche). Demandez systématiquement plusieurs devis.",
  },
  {
    q: "Comment se préparer concrètement dès aujourd'hui ?",
    a: "Auditez votre flotte (âge, kilométrage, équipements actuels) avant fin 2026. Choisissez votre prestataire SEFi en 2026 pour avoir le temps de former vos équipes. Mettez à jour vos contrats avec les hôpitaux et établissements pour prévoir le transport partagé. Suivez les publications officielles via la veille RoullePro et le Journal officiel. Préparez un budget de mise en conformité ambulance pluriannuel.",
  },
  {
    q: "Où trouver les textes officiels ?",
    a: "Les textes sont publiés sur Legifrance.gouv.fr (décrets, arrêtés) et au Journal officiel de la République française. Les conventions et avenants tarifaires sont accessibles sur ameli.fr. Les circulaires d'application sont diffusées par la Cnam aux URPS et aux organisations professionnelles. RoullePro publie une synthèse pédagogique de chaque texte dans sa veille réglementaire.",
  },
];

export default async function HubPage() {
  const alerts = await getAlertsBySlug([
    "transport-partage-obligatoire-decret-2025-202",
    "convention-cadre-nationale-taxi-conventionne-2025",
    "sefi-geolocalisation-obligation-2027-transport-sanitaire",
    "arrete-20-avril-2026-caracteristiques-ambulances-jorf-25-avril-2026",
    "protocole-accord-maitrise-depenses-transport-sanitaire-2025-2027",
  ]);

  return (
    <>
      <JsonLd
        slug={SLUG}
        title={TITLE}
        description={DESCRIPTION}
        breadcrumbLabel="Conformité 2026-2027"
        publishedAt={PUBLISHED_AT}
        updatedAt={UPDATED_AT}
        faq={FAQ}
      />
      <GuideLayout
        title={TITLE}
        intro="Décret transport partagé, convention taxi conventionné, arrêté ambulance, obligation SEFi : panorama des évolutions qui transforment le transport sanitaire entre 2025 et 2028, avec calendrier consolidé et guides par métier."
        breadcrumbLabel="Conformité 2026-2027"
        sections={SECTIONS}
        publishedDate="Mai 2026"
        publishedAt={PUBLISHED_AT}
        updatedAt={UPDATED_AT}
      >
        <section id="panorama">
          <h2>Panorama des évolutions 2025-2028</h2>
          <p>
            Entre mars 2025 et avril 2028, la profession du transport sanitaire conventionné traverse l&apos;une des plus profondes vagues de réforme de la décennie. Quatre grands textes structurent ce mouvement : un décret rendant le transport partagé obligatoire pour certains soins itératifs, une convention-cadre nationale rénovant la relation entre les taxis conventionnés et l&apos;Assurance maladie, un arrêté actualisant les caractéristiques techniques des ambulances, et un dispositif d&apos;obligation de facturation électronique intégrée doublée d&apos;une géolocalisation GPS. Le tout s&apos;inscrit dans un protocole national de maîtrise des dépenses 2025-2027 visant 300 millions d&apos;euros d&apos;économies.
          </p>
          <p>
            L&apos;ensemble vise trois objectifs convergents pour la puissance publique : <strong>réduire les dépenses de transport sanitaire</strong> qui ont fortement progressé depuis 2015, <strong>améliorer la traçabilité et la qualité du service rendu</strong> aux patients, et <strong>fluidifier la facturation</strong> entre les transporteurs et les caisses primaires. Du point de vue des entreprises de transport, cela représente un effort d&apos;investissement, de formation et de réorganisation important, à anticiper rigoureusement pour éviter toute interruption de l&apos;activité conventionnée.
          </p>
          <p>
            Ce guide RoullePro fait la synthèse de l&apos;essentiel à connaître pour les dirigeants d&apos;entreprises ambulancières, de sociétés de VSL et les taxis conventionnés. Il s&apos;appuie exclusivement sur des textes officiels datés et fournit des liens directs vers nos fiches analytiques détaillées par alerte.
          </p>
        </section>

        <section id="concernes">
          <h2>Qui est concerné</h2>
          <p>
            La portée de chaque texte varie selon la catégorie de transporteur, mais <strong>tous les acteurs conventionnés sont touchés à au moins un titre</strong>. Le tableau ci-dessous résume les principaux périmètres.
          </p>
          <h3>Ambulances</h3>
          <p>
            Les entreprises de transport sanitaire opérant des véhicules de catégorie A et B sont directement concernées par l&apos;arrêté du 20 avril 2026 publié au Journal officiel du 25 avril 2026, qui actualise les caractéristiques techniques, les équipements obligatoires et les conditions de fonctionnement des ambulances. Elles entrent également dans le champ du SEFi obligatoire au 1er janvier 2027 et du protocole national 2025-2027.
          </p>
          <h3>VSL</h3>
          <p>
            Les véhicules sanitaires légers, qui assurent les transports assis professionnalisés, sont au cœur du dispositif de transport partagé obligatoire issu du décret n°2025-202 du 2 mars 2025. Ils relèvent également de l&apos;obligation SEFi 2027 et du protocole 2025-2027.
          </p>
          <h3>Taxis conventionnés</h3>
          <p>
            Les taxis ayant signé une convention avec l&apos;Assurance maladie sont impactés par la convention-cadre nationale du 13 mai 2025, la nouvelle grille tarifaire en application depuis le 1er octobre 2025, l&apos;obligation de transport partagé pour les soins itératifs, et le SEFi 2027.
          </p>
        </section>

        <CtaUpgrade variant="compact" />

        <section id="calendrier">
          <h2>Calendrier consolidé 2025-2028</h2>
          <p>
            Pour visualiser l&apos;ordre dans lequel les obligations entrent en vigueur, voici le calendrier consolidé des principales échéances. Il est mis à jour à chaque évolution officielle dans notre <Link href="/veille-reglementaire">veille réglementaire</Link>.
          </p>
          <div className="not-prose my-6 overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Date</th>
                  <th className="text-left px-3 py-2 font-semibold">Évolution</th>
                  <th className="text-left px-3 py-2 font-semibold">Métiers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap font-medium">1er avril 2025</td>
                  <td className="px-3 py-2">Transport partagé obligatoire (soins itératifs)</td>
                  <td className="px-3 py-2 text-slate-600">VSL, taxi</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap font-medium">13 mai 2025</td>
                  <td className="px-3 py-2">Signature convention-cadre taxi CPAM</td>
                  <td className="px-3 py-2 text-slate-600">Taxi</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap font-medium">1er octobre 2025</td>
                  <td className="px-3 py-2">Nouvelle tarification taxi conventionné en vigueur</td>
                  <td className="px-3 py-2 text-slate-600">Taxi</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap font-medium">25 avril 2026</td>
                  <td className="px-3 py-2">Publication arrêté ambulance au JORF</td>
                  <td className="px-3 py-2 text-slate-600">Ambulance</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap font-medium">1er janvier 2027</td>
                  <td className="px-3 py-2">SEFi et géolocalisation GPS obligatoires</td>
                  <td className="px-3 py-2 text-slate-600">Tous</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap font-medium">1er janvier 2027</td>
                  <td className="px-3 py-2">Fin période transitoire convention taxi</td>
                  <td className="px-3 py-2 text-slate-600">Taxi</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap font-medium">25 avril 2028</td>
                  <td className="px-3 py-2">Mise en conformité ambulance terminée</td>
                  <td className="px-3 py-2 text-slate-600">Ambulance</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Ce calendrier appelle une lecture proactive : la majorité des obligations à fort impact opérationnel se concentrent sur les années 2026 et 2027. Les entreprises qui anticipent dès 2026 leurs investissements en télématique embarquée et en facturation électronique éviteront de subir la pression de fin 2026 quand les solutions disponibles seront congestionnées.
          </p>
        </section>

        <section id="alertes-cles">
          <h2>Les 5 alertes clés</h2>
          <p>
            Chaque évolution majeure est documentée dans une alerte RoullePro indépendante, avec ses sources, son périmètre exact, ses actions concrètes et ses chiffres clés. Voici les cinq alertes phares qui structurent la conformité 2025-2027.
          </p>
          <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            {alerts.map((a) => (
              <AlertCardLink key={a.slug} alert={a} />
            ))}
          </div>
          <p>
            Pour la liste complète et toujours à jour, consultez{" "}
            <Link href="/veille-reglementaire">notre veille réglementaire</Link>, mise à jour en continu, et abonnez-vous à la newsletter hebdomadaire segmentée par métier (mardi matin) pour ne rien manquer.
          </p>
        </section>

        <section id="guides-metier">
          <h2>Guides par métier</h2>
          <p>
            Selon votre catégorie d&apos;exercice, les obligations applicables diffèrent. RoullePro a publié un guide approfondi par métier, avec les détails techniques, les coûts estimés et les actions à mener.
          </p>
          <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <Link
              href="/guides/ambulance-reglementation-conformite-2026"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition no-underline"
            >
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Ambulance
              </h3>
              <p className="text-sm text-slate-600">
                Arrêté du 20 avril 2026, équipements obligatoires, SEFi et plan d&apos;économies CPAM.
              </p>
            </Link>
            <Link
              href="/guides/taxi-conventionne-convention-cpam-2025"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition no-underline"
            >
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Taxi conventionné
              </h3>
              <p className="text-sm text-slate-600">
                Convention-cadre du 13 mai 2025, nouvelle tarification, transport partagé, SEFi 2027.
              </p>
            </Link>
            <Link
              href="/guides/vsl-reglementation-transport-partage"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition no-underline"
            >
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                VSL
              </h3>
              <p className="text-sm text-slate-600">
                Transport partagé obligatoire (décret 2025-202), SEFi 2027, plan d&apos;économies.
              </p>
            </Link>
          </div>
        </section>

        <section id="se-preparer">
          <h2>Comment se préparer</h2>
          <p>
            La règle d&apos;or pour traverser sereinement la période 2025-2028 est de <strong>traiter chaque obligation comme un projet</strong> avec un pilote interne, un budget, un calendrier et des indicateurs de suivi. Les entreprises qui réussissent leur mise en conformité partagent quatre habitudes :
          </p>
          <ol>
            <li>
              <strong>Auditer la flotte et les outils existants</strong>. Recenser l&apos;âge des véhicules, les équipements présents, le logiciel de facturation actuel, le système de planification et de géolocalisation. Identifier les écarts avec les obligations à venir.
            </li>
            <li>
              <strong>Choisir tôt les prestataires technologiques</strong>. Pour la facturation électronique SEFi et la géolocalisation, les éditeurs reconnus par la Cnam sont peu nombreux. Engager le contrat dès 2026 garantit la disponibilité du service et un déploiement serein avant le 1er janvier 2027.
            </li>
            <li>
              <strong>Former les équipes en continu</strong>. Régulateurs, chauffeurs et personnels administratifs doivent comprendre les nouvelles règles de facturation, de transport partagé et de traçabilité. Prévoir au moins une session de formation par semestre.
            </li>
            <li>
              <strong>Mettre à jour les contrats avec les établissements</strong>. Les hôpitaux, EHPAD et cliniques sont vos donneurs d&apos;ordre. Ils doivent comprendre les changements de tarification, le transport partagé et les nouvelles règles de prise en charge.
            </li>
          </ol>
          <p>
            Pour aller plus loin, l&apos;abonnement Pro RoullePro vous donne accès à un <strong>profil de conformité par fiche</strong> avec score 0-100, calendrier d&apos;échéances filtré par métier et activité, plan d&apos;action par alerte avec checklist cochable, et export PDF du rapport de conformité à présenter en interne ou aux financeurs.
          </p>
          <p>
            Sur l&apos;échéance 2027, consultez notre dossier dédié : <Link href="/transport-medical/sefi-2027">l&apos;obligation SEFi 2027</Link>, le <Link href="/transport-medical/logiciels-sefi">comparatif des logiciels SEFi</Link> et la <Link href="/transport-medical/geolocalisation-taxi-conventionne">géolocalisation du taxi conventionné</Link>.
          </p>
        </section>

        <CtaUpgrade />

        <section id="faq">
          <h2>Questions fréquentes</h2>
          <FaqAccordion items={FAQ} />
        </section>

        <MaillageTransporteurs />
      </GuideLayout>
    </>
  );
}
