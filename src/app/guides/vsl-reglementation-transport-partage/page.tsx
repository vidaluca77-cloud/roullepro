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

const SLUG = "vsl-reglementation-transport-partage";
const TITLE = "VSL : réglementation et transport partagé 2025-2027";
const DESCRIPTION =
  "VSL réglementation, transport partagé obligatoire (décret 2025-202), SEFi 2027, plan d'économies CPAM : le guide complet pour les véhicules sanitaires légers.";
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
  { id: "cadre", label: "Cadre VSL et conventionnement" },
  { id: "transport-partage", label: "Transport partagé obligatoire" },
  { id: "sefi", label: "SEFi obligatoire 2027" },
  { id: "economies", label: "Plan d'économies CPAM" },
  { id: "differences", label: "Différences ambulance / VSL / taxi" },
  { id: "faq", label: "FAQ" },
];

const FAQ: FaqItem[] = [
  {
    q: "Quelle différence entre un VSL et une ambulance ?",
    a: "Le VSL (Véhicule Sanitaire Léger) transporte assis des patients dont l'état n'exige pas un transport allongé ni la présence d'un personnel médical d'urgence. C'est une berline aménagée, conduite par un auxiliaire ambulancier formé, principalement utilisée pour les soins programmés. L'ambulance, elle, transporte un patient allongé et requiert deux personnels formés à bord (DEA et auxiliaire). Le tarif et l'agrément sont différents.",
  },
  {
    q: "Mon entreprise VSL est-elle concernée par le décret 2025-202 sur le transport partagé ?",
    a: "Oui, totalement. Le décret n°2025-202 du 2 mars 2025 cible précisément les transports assis programmés vers des soins itératifs (dialyse, chimiothérapie, radiothérapie). Or, ces missions sont au cœur de l'activité VSL. Depuis le 1er avril 2025, le transport partagé est obligatoire sur ces trajets, sauf justification médicale écrite refusant le partage.",
  },
  {
    q: "Comment se préparer au SEFi 2027 quand on est une petite société VSL ?",
    a: "Identifier dès 2026 un éditeur agréé proposant une offre adaptée aux petites flottes (tarification par véhicule, sans frais d'installation prohibitifs). Mutualiser éventuellement la solution avec d'autres confrères locaux. Prévoir la formation du gérant et des conducteurs en amont. Le déploiement complet prend trois à quatre mois en moyenne.",
  },
  {
    q: "Quelles sont les sanctions en cas de refus systématique du transport partagé ?",
    a: "Un refus systématique non motivé médicalement entraîne une diminution des courses confiées par les plateformes de coordination de l'Assurance maladie, puis peut conduire à une suspension du conventionnement. Les refus doivent toujours être justifiés par l'état du patient et documentés (refus du médecin, incompatibilité d'horaires, état médical incompatible). Le simple confort du patient ne suffit pas.",
  },
  {
    q: "Le plan d'économies CPAM 2025-2027 va-t-il faire baisser ma rémunération ?",
    a: "Pas mécaniquement. Le plan vise 300 millions d'euros d'économies sur trois ans, principalement par le développement du transport partagé (qui mutualise les coûts), un contrôle accru des prescriptions et une optimisation des trajets longue distance. Les tarifs unitaires ne sont pas en baisse, mais les volumes facturables sont rationalisés. Les entreprises qui s'adaptent au transport partagé peuvent maintenir voire augmenter leur chiffre d'affaires.",
  },
];

export default async function VslGuide() {
  const alerts = await getAlertsBySlug([
    "transport-partage-obligatoire-decret-2025-202",
    "sefi-geolocalisation-obligation-2027-transport-sanitaire",
    "protocole-accord-maitrise-depenses-transport-sanitaire-2025-2027",
  ]);

  return (
    <>
      <JsonLd
        slug={SLUG}
        title={TITLE}
        description={DESCRIPTION}
        breadcrumbLabel="VSL"
        publishedAt={PUBLISHED_AT}
        updatedAt={UPDATED_AT}
        faq={FAQ}
      />
      <GuideLayout
        title={TITLE}
        intro="Transport partagé obligatoire depuis avril 2025, SEFi 2027, plan national d'économies : le guide complet pour les sociétés de VSL qui veulent maîtriser la réforme sans subir."
        breadcrumbLabel="VSL"
        sections={SECTIONS}
        publishedDate="Mai 2026"
        publishedAt={PUBLISHED_AT}
        updatedAt={UPDATED_AT}
      >
        <section id="cadre">
          <h2>Cadre VSL et conventionnement</h2>
          <p>
            Le <strong>Véhicule Sanitaire Léger</strong>, plus connu sous l&apos;acronyme VSL, est défini par le Code de la santé publique comme un véhicule destiné au transport assis professionnalisé de patients ne nécessitant pas un transport allongé ni la présence permanente d&apos;un personnel médical d&apos;urgence. Concrètement, il s&apos;agit d&apos;une berline ou d&apos;un véhicule de tourisme aménagé pouvant accueillir trois patients assis à l&apos;arrière, conduite par un <strong>auxiliaire ambulancier titulaire de la formation réglementaire</strong>.
          </p>
          <p>
            Le VSL est un maillon essentiel de la chaîne des soins programmés. Il assure quotidiennement les trajets domicile-établissement pour les patients dialysés, sous chimiothérapie, en rééducation, en consultations spécialisées ou en soins itératifs. Il est mobilisé sur prescription médicale et facturé en tiers payant à l&apos;Assurance maladie, sous réserve de conventionnement et de respect du parcours réglementaire.
          </p>
          <p>
            Pour exercer en VSL, l&apos;entreprise doit détenir un agrément préfectoral délivré par l&apos;Agence régionale de santé. Cet agrément précise le nombre de véhicules autorisés et les catégories de transport autorisées. Une convention nationale et locale lie l&apos;entreprise aux caisses primaires d&apos;assurance maladie pour la facturation et les tarifs.
          </p>
        </section>

        <section id="transport-partage">
          <h2>Transport partagé obligatoire (décret 2025-202)</h2>
          <p>
            Le <strong>décret n°2025-202 du 2 mars 2025</strong> est probablement la réforme la plus structurante pour le secteur VSL depuis dix ans. Il rend <strong>obligatoire le transport partagé</strong>, c&apos;est-à-dire le regroupement de plusieurs patients dans le même véhicule, pour les <strong>transports assis programmés vers les centres de dialyse, de chimiothérapie, de radiothérapie ou pour les soins itératifs comparables</strong>. L&apos;obligation s&apos;applique depuis le <strong>1er avril 2025</strong>.
          </p>
          <p>
            Le principe : dès lors que les conditions sont compatibles (état du patient, horaires de soins, distance entre les domiciles), le transporteur est tenu d&apos;accepter et d&apos;organiser le partage du trajet. Pour les VSL, c&apos;est la nature même de la profession qui est concernée puisque les trajets vers les centres de dialyse et de chimiothérapie représentent une part majeure de l&apos;activité.
          </p>
          <h3>Modalités pratiques</h3>
          <p>
            Le partage se construit en amont avec les plateformes de coordination mises en place par l&apos;Assurance maladie ou par les établissements de santé eux-mêmes. Le transporteur reçoit une mission préprogrammée incluant plusieurs patients à embarquer successivement ou simultanément. La rémunération est encadrée par un barème spécifique transport partagé, plus avantageux à la course mais réparti entre plusieurs prises en charge.
          </p>
          <h3>Refus motivés</h3>
          <p>
            Le décret autorise le refus de partage dans certains cas : incompatibilité d&apos;horaires des soins, état clinique du patient empêchant la cohabitation (fragilité immunitaire, contagiosité, claustrophobie médicalement documentée), distance excessive entre les domiciles des patients. Tout refus doit être <strong>documenté et justifié médicalement</strong>. Un refus systématique sans motif valable expose à des sanctions conventionnelles.
          </p>
          <div className="not-prose my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts
              .filter((a) => a.slug === "transport-partage-obligatoire-decret-2025-202")
              .map((a) => (
                <AlertCardLink key={a.slug} alert={a} />
              ))}
          </div>
        </section>

        <CtaUpgrade variant="compact" />

        <section id="sefi">
          <h2>SEFi obligatoire au 1er janvier 2027</h2>
          <p>
            Au même titre que les ambulances et les taxis conventionnés, les <strong>VSL doivent passer au SEFi le 1er janvier 2027</strong>. Le Service Électronique de Facturation Intégrée impose la facturation électronique en temps réel à la CPAM et la <strong>géolocalisation GPS</strong> du véhicule pendant la mission.
          </p>
          <p>
            Pour une société VSL, le SEFi se concrétise par l&apos;installation d&apos;un boîtier télématique dans chaque véhicule et l&apos;adoption d&apos;un logiciel de facturation agréé. Ce dernier remplace les outils de facturation actuels (SESAM-Vitale et télétransmission classique) en s&apos;y intégrant ou en s&apos;y substituant selon l&apos;éditeur retenu.
          </p>
          <p>
            <strong>Pour une petite structure</strong>, le coût mensuel oscille entre 30 et 60 euros HT par véhicule, hors investissement initial éventuel pour le boîtier. Il est recommandé de demander plusieurs devis détaillés et de privilégier les solutions intégrées (boîtier + logiciel + support + tablette conducteur) plutôt que d&apos;assembler des briques séparées.
          </p>
          <p>
            <strong>Le délai de mise en œuvre</strong> est en moyenne de trois à six mois entre la signature et la pleine opérationnalité. Il faut donc engager le choix de l&apos;éditeur au plus tard à l&apos;été 2026 pour être prêt le 1er janvier 2027. Au-delà de cette date, l&apos;impossibilité de facturer en SEFi conduit à un blocage du flux tiers payant avec la CPAM.
          </p>
        </section>

        <section id="economies">
          <h2>Plan d&apos;économies CPAM 2025-2027</h2>
          <p>
            Le <strong>protocole national de maîtrise des dépenses 2025-2027</strong> vise <strong>300 millions d&apos;euros d&apos;économies</strong> sur les transports sanitaires en trois ans. Le levier principal est précisément le développement du transport partagé, complété par le contrôle des prescriptions et la rationalisation des trajets longue distance.
          </p>
          <p>
            Pour les VSL, le plan se traduit par trois changements pratiques. <strong>Premièrement</strong>, une priorisation du partage qui modifie la répartition des courses (les courses individuelles deviennent l&apos;exception sur les trajets dialyse/chimio). <strong>Deuxièmement</strong>, un renforcement des contrôles : la cohérence prescription / trajet / mode de transport est vérifiée plus systématiquement, et les écarts sont sanctionnés par des refus de remboursement. <strong>Troisièmement</strong>, une responsabilisation des prescripteurs qui doivent justifier l&apos;impossibilité du transport partagé pour pouvoir prescrire un trajet individuel.
          </p>
          <p>
            Pour les entreprises VSL qui anticipent et adaptent leur organisation (planification par groupes, communication renforcée avec les centres de soins, formation des conducteurs au partage), le plan peut être neutre voire positif financièrement, le volume facturable étant maintenu et la productivité augmentée.
          </p>
        </section>

        <section id="differences">
          <h2>Différences ambulance / VSL / taxi conventionné</h2>
          <p>
            Les trois métiers cohabitent dans le paysage du transport sanitaire et leur articulation est régulièrement source de confusion pour les prescripteurs et les patients. Voici les principales distinctions à retenir.
          </p>
          <div className="not-prose my-6 overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Critère</th>
                  <th className="text-left px-3 py-2 font-semibold">Ambulance</th>
                  <th className="text-left px-3 py-2 font-semibold">VSL</th>
                  <th className="text-left px-3 py-2 font-semibold">Taxi conventionné</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-3 py-2 font-medium">Position du patient</td>
                  <td className="px-3 py-2">Allongé</td>
                  <td className="px-3 py-2">Assis</td>
                  <td className="px-3 py-2">Assis</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium">Personnel à bord</td>
                  <td className="px-3 py-2">DEA + auxiliaire</td>
                  <td className="px-3 py-2">Auxiliaire ambulancier</td>
                  <td className="px-3 py-2">Chauffeur taxi conventionné</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium">Type d&apos;agrément</td>
                  <td className="px-3 py-2">ARS (sanitaire)</td>
                  <td className="px-3 py-2">ARS (sanitaire)</td>
                  <td className="px-3 py-2">Préfecture (taxi) + convention CPAM</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium">Transport partagé obligatoire</td>
                  <td className="px-3 py-2">Non systématique</td>
                  <td className="px-3 py-2">Oui (décret 2025-202)</td>
                  <td className="px-3 py-2">Oui (décret 2025-202)</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium">SEFi 2027</td>
                  <td className="px-3 py-2">Oui</td>
                  <td className="px-3 py-2">Oui</td>
                  <td className="px-3 py-2">Oui</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Pour aller plus loin dans la comparaison des obligations, consultez les guides dédiés{" "}
            <Link href="/guides/ambulance-reglementation-conformite-2026">ambulance</Link> et{" "}
            <Link href="/guides/taxi-conventionne-convention-cpam-2025">taxi conventionné</Link>.
          </p>
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
              href="/guides/taxi-conventionne-convention-cpam-2025"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition"
            >
              <h3 className="font-semibold text-slate-900 mb-1">
                Guide taxi conventionné
              </h3>
              <p className="text-sm text-slate-600">
                Convention CPAM, transport partagé et SEFi pour les taxis.
              </p>
            </Link>
          </div>
        </section>
      </GuideLayout>
    </>
  );
}
