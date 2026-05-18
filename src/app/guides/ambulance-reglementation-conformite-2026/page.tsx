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

const SLUG = "ambulance-reglementation-conformite-2026";
const TITLE = "Ambulance : réglementation et conformité 2026";
const DESCRIPTION =
  "Arrêté ambulance 2026, équipements obligatoires, SEFi 2027, plan d'économies CPAM : tout ce que les sociétés d'ambulances doivent savoir pour rester conformes.";
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
  { id: "cadre", label: "Cadre légal et catégories de véhicules" },
  { id: "equipements", label: "Équipements obligatoires (arrêté 20 avril 2026)" },
  { id: "sefi", label: "SEFi et géolocalisation au 1er janvier 2027" },
  { id: "economies", label: "Plan d'économies CPAM 2025-2027" },
  { id: "mise-en-conformite", label: "Mettre la flotte en conformité" },
  { id: "faq", label: "FAQ" },
];

const FAQ: FaqItem[] = [
  {
    q: "Mon entreprise ambulancière est-elle concernée par l'arrêté du 20 avril 2026 ?",
    a: "Oui, toutes les entreprises de transport sanitaire opérant des véhicules de catégorie A (ambulance de soins d'urgence) ou de catégorie B (ambulance de transport) sont concernées. L'arrêté du 20 avril 2026 publié au Journal officiel du 25 avril 2026 actualise les caractéristiques techniques, les équipements obligatoires et les conditions de fonctionnement de ces véhicules.",
  },
  {
    q: "Quelle est la date butoir de mise en conformité ambulance ?",
    a: "La mise en conformité technique doit être effective au plus tard le 25 avril 2028, soit deux ans après la publication de l'arrêté. Les nouveaux véhicules mis en service après cette date doivent être directement conformes aux nouvelles spécifications. Les véhicules en service au 25 avril 2026 bénéficient d'une période de transition de 24 mois.",
  },
  {
    q: "Que prévoit le SEFi pour les ambulances ?",
    a: "Le Service Électronique de Facturation Intégrée impose à compter du 1er janvier 2027 la facturation électronique en temps réel à la CPAM, ainsi qu'une géolocalisation GPS permettant de tracer le trajet effectif du véhicule. Toutes les ambulances conventionnées sont concernées. Le matériel et le logiciel doivent être déployés et opérationnels avant cette date.",
  },
  {
    q: "Quel est le coût estimé de la mise en conformité ?",
    a: "Le coût varie fortement selon l'âge de la flotte et les équipements déjà présents. Pour le seul volet télématique (SEFi + GPS + terminal embarqué), il faut compter entre 30 et 80 euros HT par véhicule et par mois pour un service intégré. Pour l'adaptation technique d'un véhicule existant (équipements imposés par l'arrêté de 2026), comptez entre 2 000 et 8 000 euros HT selon les écarts. Une ambulance neuve conforme s'achète entre 70 000 et 110 000 euros HT.",
  },
  {
    q: "Quelles sont les sanctions en cas de non-conformité ?",
    a: "La non-conformité aux nouvelles caractéristiques techniques peut entraîner le refus de l'agrément préfectoral indispensable à l'exercice. Le défaut de SEFi au 1er janvier 2027 expose à la suspension du conventionnement avec l'Assurance maladie. Sans conventionnement, l'activité de transport sanitaire devient économiquement non viable. Des contrôles peuvent également déclencher des recouvrements d'indus.",
  },
];

export default async function AmbulanceGuide() {
  const alerts = await getAlertsBySlug([
    "arrete-20-avril-2026-caracteristiques-ambulances-jorf-25-avril-2026",
    "sefi-geolocalisation-obligation-2027-transport-sanitaire",
    "protocole-accord-maitrise-depenses-transport-sanitaire-2025-2027",
  ]);

  return (
    <>
      <JsonLd
        slug={SLUG}
        title={TITLE}
        description={DESCRIPTION}
        breadcrumbLabel="Ambulance"
        publishedAt={PUBLISHED_AT}
        updatedAt={UPDATED_AT}
        faq={FAQ}
      />
      <GuideLayout
        title={TITLE}
        intro="Arrêté du 20 avril 2026, SEFi 2027, plan d'économies CPAM : guide complet pour les entreprises ambulancières qui doivent piloter leur conformité d'ici 2028."
        breadcrumbLabel="Ambulance"
        sections={SECTIONS}
        publishedDate="Mai 2026"
      >
        <section id="cadre">
          <h2>Cadre légal et catégories de véhicules</h2>
          <p>
            Le transport sanitaire par ambulance relève du Code de la santé publique et plus particulièrement des articles L. 6312-1 et suivants relatifs aux entreprises de transport sanitaire agréées. Toute entreprise exerçant cette activité doit détenir un agrément préfectoral délivré par l&apos;Agence régionale de santé, agrément qui conditionne l&apos;exercice et le conventionnement avec l&apos;Assurance maladie.
          </p>
          <p>
            On distingue deux catégories principales de véhicules. Les <strong>ambulances de catégorie A</strong> sont conçues pour la prise en charge et le transport de patients dont l&apos;état nécessite des soins d&apos;urgence ; elles sont équipées en conséquence pour la réanimation et la surveillance médicale. Les <strong>ambulances de catégorie B</strong> sont destinées au transport de patients dont l&apos;état ne justifie pas une intervention médicale d&apos;urgence mais qui doivent être allongés ou semi-allongés pour des raisons médicales.
          </p>
          <p>
            En 2026, ce cadre est complété par l&apos;arrêté du 20 avril 2026 qui actualise en profondeur les caractéristiques techniques des deux catégories, dans la continuité de la norme européenne NF EN 1789. Cet arrêté est la pierre angulaire de la réforme côté véhicule.
          </p>
        </section>

        <section id="equipements">
          <h2>Équipements obligatoires (arrêté 20 avril 2026)</h2>
          <p>
            L&apos;<strong>arrêté du 20 avril 2026 publié au Journal officiel du 25 avril 2026</strong> redéfinit le contenu minimal embarqué dans une ambulance conventionnée. La liste détaillée des équipements et fournitures est annexée à l&apos;arrêté ; elle est dense et engage à la fois l&apos;achat de matériel, sa maintenance et la traçabilité des consommables.
          </p>
          <p>
            Sans entrer dans le détail de chaque ligne, on peut regrouper les exigences en six familles. <strong>Matériel de soins d&apos;urgence</strong> : oxygénothérapie, aspirateur de mucosités, défibrillateur automatique externe et matériel de réanimation pour les ambulances de catégorie A. <strong>Matériel d&apos;immobilisation</strong> : attelles, matelas immobilisateur à dépression, plan dur, collier cervical en plusieurs tailles. <strong>Matériel de transport du patient</strong> : brancard principal, brancard de portage, chaise portoir, drap de transfert. <strong>Hygiène et infectieux</strong> : conteneur DASRI, équipements de protection individuelle, désinfectants validés normes EN. <strong>Communication et signalisation</strong> : radio, dispositifs visuels et sonores prioritaires, équipement de signalisation au point d&apos;intervention. <strong>Confort et sécurité du patient</strong> : ceintures, dispositifs anti-glissement, climatisation cellule sanitaire.
          </p>
          <p>
            Les véhicules en service au 25 avril 2026 doivent être mis en conformité <strong>au plus tard le 25 avril 2028</strong>. Les nouveaux véhicules mis en circulation après le 25 avril 2026 doivent être directement conformes. Les services préfectoraux et les agences régionales de santé peuvent contrôler la conformité lors des visites d&apos;agrément ou sur signalement.
          </p>
          <p>
            Pour les détails techniques officiels, l&apos;analyse complète figure dans notre alerte dédiée et nous renvoyons aux annexes de l&apos;arrêté pour la liste exhaustive.
          </p>
          <div className="not-prose my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts
              .filter((a) =>
                a.slug === "arrete-20-avril-2026-caracteristiques-ambulances-jorf-25-avril-2026"
              )
              .map((a) => (
                <AlertCardLink key={a.slug} alert={a} />
              ))}
          </div>
        </section>

        <section id="sefi">
          <h2>SEFi et géolocalisation au 1er janvier 2027</h2>
          <p>
            Le <strong>SEFi</strong> (Service Électronique de Facturation Intégrée) est l&apos;autre grand chantier de conformité pour les ambulanciers. Il s&apos;agit d&apos;un dispositif imposant la facturation électronique en temps réel à l&apos;Assurance maladie, couplée à une géolocalisation GPS du véhicule durant chaque mission conventionnée.
          </p>
          <p>
            Concrètement, le transporteur doit déployer dans chaque véhicule un boîtier télématique compatible et utiliser un logiciel de facturation agréé qui transmet la prestation à la CPAM dès la fin de la course. Le terminal enregistre l&apos;identifiant du conducteur, l&apos;identifiant du patient, le bon de transport, l&apos;heure et le lieu de prise en charge, le trajet GPS et l&apos;heure et le lieu de dépose.
          </p>
          <p>
            Cette obligation s&apos;applique à toutes les entreprises conventionnées au <strong>1er janvier 2027</strong>, sans distinction de taille. Elle vise officiellement à réduire les délais de paiement, à fluidifier la relation tiers payant et à fiabiliser les contrôles. Pour les ambulanciers, c&apos;est aussi une opportunité d&apos;améliorer la productivité (réduction de la saisie manuelle, suivi de flotte en temps réel) à condition de bien choisir son éditeur.
          </p>
          <p>
            Le déploiement prend en pratique de quatre à six mois entre la signature du contrat, l&apos;installation des boîtiers, le paramétrage du logiciel, la formation des équipes et la phase de tests avec la CPAM. <strong>Une décision doit donc être prise au plus tard à l&apos;été 2026</strong> pour être opérationnel le 1er janvier 2027 sans précipitation.
          </p>
          <CtaUpgrade variant="compact" />
        </section>

        <section id="economies">
          <h2>Plan d&apos;économies CPAM 2025-2027</h2>
          <p>
            Le <strong>protocole national de maîtrise des dépenses de transport sanitaire 2025-2027</strong> fixe un objectif de 300 millions d&apos;euros d&apos;économies sur trois ans, à partager entre les différents leviers identifiés par la Cnam. Pour les ambulanciers, les principales conséquences opérationnelles sont les suivantes.
          </p>
          <p>
            Premièrement, le contrôle accru des prescriptions médicales et des bons de transport. Les prescripteurs sont incités à privilégier les modes de transport les moins onéreux compatibles avec l&apos;état du patient, et les caisses examinent plus systématiquement les dépassements (transport allongé prescrit alors que le patient peut être assis, par exemple).
          </p>
          <p>
            Deuxièmement, la limitation des trajets longs. Au-delà de 150 kilomètres, l&apos;accord préalable de la CPAM est requis ; les caisses appliquent ces règles avec plus de rigueur depuis 2025. Pour le transporteur, cela implique de bien vérifier la prescription et le formulaire d&apos;entente préalable S3139 avant la course.
          </p>
          <p>
            Troisièmement, l&apos;encouragement au transport partagé pour les soins itératifs, qui touche surtout VSL et taxi conventionné mais qui impacte indirectement les ambulances quand le partage devient impossible et qu&apos;une justification médicale formelle est nécessaire.
          </p>
          <p>
            Ces orientations sont à intégrer dans le pilotage de l&apos;entreprise. La <Link href="/veille-reglementaire">veille réglementaire</Link> publie régulièrement les évolutions des règles d&apos;application.
          </p>
        </section>

        <section id="mise-en-conformite">
          <h2>Mettre la flotte en conformité</h2>
          <p>
            La conformité des ambulances en 2026-2028 se gère comme un véritable plan industriel. Voici les cinq étapes clés à mettre en œuvre.
          </p>
          <h3>1. Auditer la flotte existante</h3>
          <p>
            Recenser tous les véhicules par ordre d&apos;immatriculation et de catégorie, lister les équipements actuels, identifier les écarts par rapport à l&apos;arrêté du 20 avril 2026. Cet audit permet de prioriser les véhicules à mettre à jour en premier (souvent les plus anciens ou ceux dont l&apos;agrément arrive à échéance).
          </p>
          <h3>2. Bâtir un plan d&apos;investissement pluriannuel</h3>
          <p>
            Étaler les achats d&apos;équipements et les remplacements de véhicules entre 2026 et 2028 pour éviter un pic de dépenses. Mobiliser les leviers de financement disponibles : leasing opérationnel, crédit-bail, plan de financement avec la branche professionnelle.
          </p>
          <h3>3. Choisir un éditeur SEFi reconnu</h3>
          <p>
            Privilégier les solutions intégrées (boîtier + logiciel + service de support) plutôt que des briques séparées. Vérifier la liste des éditeurs en relation avec la Cnam, demander plusieurs devis détaillés et négocier l&apos;engagement pluriannuel pour obtenir des conditions avantageuses.
          </p>
          <h3>4. Former les équipes</h3>
          <p>
            Formation initiale des ambulanciers et auxiliaires ambulanciers aux nouveaux équipements et au logiciel SEFi. Mise à jour des protocoles internes (check-list de prise en main, gestion des consommables, traçabilité). Désignation d&apos;un référent télématique dans l&apos;entreprise.
          </p>
          <h3>5. Tenir un journal de conformité</h3>
          <p>
            Documenter chaque mise à jour : date de mise en service de l&apos;équipement, références fournisseurs, formations dispensées. Ce journal est précieux en cas de contrôle ARS ou CPAM, et il alimente la production des rapports de conformité.
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
