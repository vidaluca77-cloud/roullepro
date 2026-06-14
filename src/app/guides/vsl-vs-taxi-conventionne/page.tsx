import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type SectionEntry } from "../_components/GuideLayout";
import FaqAccordion, { type FaqItem } from "../_components/FaqAccordion";
import JsonLd from "../_components/JsonLd";

export const revalidate = 3600;

const SLUG = "vsl-vs-taxi-conventionne";
const TITLE =
  "VSL vs Taxi conventionné : différences, tarifs, prise en charge CPAM 2026";
const DESCRIPTION =
  "VSL ou taxi conventionné ? Différences de véhicule, agrément, tarification CPAM, équipage et prise en charge ALD. Le guide complet du transport assis remboursé en 2026.";
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
  { id: "definition-vsl", label: "Qu'est-ce qu'un VSL ?" },
  { id: "definition-taxi", label: "Qu'est-ce qu'un taxi conventionné ?" },
  { id: "comparatif", label: "Tableau comparatif" },
  { id: "choisir", label: "Quand choisir l'un ou l'autre" },
  { id: "demarches", label: "Démarches de prise en charge" },
  { id: "faq", label: "FAQ" },
];

const FAQ: FaqItem[] = [
  {
    q: "Quelle est la différence principale entre un VSL et un taxi conventionné ?",
    a: "Le VSL (Véhicule Sanitaire Léger) est un véhicule sanitaire dédié, conduit par un auxiliaire ambulancier formé aux gestes de premiers secours, soumis à l'agrément de l'Agence Régionale de Santé. Le taxi conventionné est un taxi ordinaire titulaire d'une autorisation de stationnement, dont le chauffeur n'a pas de formation médicale spécifique, et qui a signé une convention avec la CPAM. Tu peux être transporté assis dans les deux cas, mais le VSL relève du transport sanitaire au sens strict, alors que le taxi conventionné reste une activité de taxi encadrée par une convention.",
  },
  {
    q: "Le VSL et le taxi conventionné sont-ils remboursés de la même façon ?",
    a: "Oui, le niveau de remboursement est identique : 55 % du tarif conventionné en régime général, et 100 % en cas d'ALD, de maternité à partir du premier jour du sixième mois, d'accident du travail ou de maladie professionnelle, pour les nouveau-nés de moins de 30 jours ou avec la CSS et l'AME. Dans les deux cas, une prescription médicale de transport est obligatoire et le tiers payant évite l'avance de frais. La différence porte sur la grille tarifaire appliquée, pas sur le taux de prise en charge.",
  },
  {
    q: "Puis-je choisir librement entre un VSL et un taxi conventionné ?",
    a: "En partie. Le médecin prescrit un mode de transport adapté à ton état de santé en cochant la case correspondante sur le formulaire de prescription. Si la prescription mentionne un transport assis, tu peux en pratique faire appel soit à un VSL, soit à un taxi conventionné, selon la disponibilité des professionnels et le tarif applicable dans ton département. Si la prescription impose une ambulance, ni le VSL ni le taxi ne conviennent.",
  },
  {
    q: "Le taxi conventionné est-il moins cher que le VSL pour la CPAM ?",
    a: "Cela dépend du département et de la distance. La tarification du taxi conventionné repose sur une convention locale adossée à la convention-cadre nationale du 13 mai 2025, avec une base kilométrique et des suppléments. Le VSL suit un tarif national de transport sanitaire. Sur certains trajets, le taxi conventionné est plus avantageux pour l'Assurance maladie, sur d'autres c'est le VSL. La CPAM encourage le mode le plus économique compatible avec l'état du patient.",
  },
  {
    q: "Combien de patients un VSL ou un taxi conventionné peut-il transporter en même temps ?",
    a: "Le VSL transporte jusqu'à trois patients assis simultanément. Le taxi conventionné peut lui aussi pratiquer le transport partagé, devenu obligatoire depuis le 1er avril 2025 pour les transports assis programmés vers les centres de dialyse, de chimiothérapie et de radiothérapie lorsque l'état du patient le permet. Le partage réduit le coût pour la Sécurité sociale et n'a pas d'impact sur ton remboursement.",
  },
  {
    q: "Ai-je besoin d'une prescription pour un VSL ou un taxi conventionné ?",
    a: "Oui, dans les deux cas une prescription médicale de transport est nécessaire pour obtenir un remboursement. Elle est établie par le médecin sur le formulaire CERFA dédié et précise le mode de transport, le motif et la période. Sans prescription, le transport n'est pas pris en charge, sauf situations particulières comme une hospitalisation programmée relevant d'un autre dispositif. Le taxi conventionné peut aussi réaliser des courses classiques sans prescription, mais elles ne sont alors pas remboursées.",
  },
  {
    q: "Le chauffeur de VSL a-t-il une formation que le chauffeur de taxi conventionné n'a pas ?",
    a: "Oui. Le conducteur de VSL détient l'attestation d'auxiliaire ambulancier ou un titre équivalent et a suivi une formation aux gestes et soins d'urgence. Il sait installer un patient, surveiller son état pendant le trajet et réagir en cas de malaise. Le chauffeur de taxi conventionné n'a pas d'obligation de formation médicale : il assure un transport assis pour des patients autonomes ne nécessitant pas de surveillance particulière.",
  },
  {
    q: "Comment trouver un VSL ou un taxi conventionné près de chez moi ?",
    a: "Tu peux consulter l'annuaire RoullePro qui recense les ambulances, VSL et taxis conventionnés par ville et par département, avec leurs coordonnées. Chaque fiche indique la catégorie du transporteur et son numéro SIRET. Tu peux aussi demander à ton établissement de soins, qui travaille généralement avec des transporteurs partenaires, ou consulter les listes de professionnels conventionnés mises à disposition par ta caisse primaire d'assurance maladie.",
  },
];

export default function VslVsTaxiGuide() {
  return (
    <>
      <JsonLd
        slug={SLUG}
        title={TITLE}
        description={DESCRIPTION}
        breadcrumbLabel="VSL vs Taxi conventionné"
        publishedAt={PUBLISHED_AT}
        updatedAt={UPDATED_AT}
        faq={FAQ}
      />
      <GuideLayout
        title={TITLE}
        intro="VSL ou taxi conventionné : deux solutions de transport assis remboursées par la Sécurité sociale, mais aux règles, équipages et tarifs différents. Voici comment les distinguer et choisir le bon mode selon ta situation."
        breadcrumbLabel="VSL vs Taxi conventionné"
        sections={SECTIONS}
        publishedDate="Juin 2026"
      >
        <p>
          Quand un médecin te prescrit un transport assis, deux modes principaux peuvent te conduire à ton rendez-vous médical et être remboursés par l&apos;Assurance maladie : le <strong>VSL</strong> et le <strong>taxi conventionné</strong>. Les deux transportent des patients assis, autonomes, sur prescription, et les deux pratiquent le tiers payant. Pourtant, ils ne relèvent pas du même cadre réglementaire, n&apos;emploient pas le même type de conducteur et ne sont pas tarifés de la même façon. Comprendre ces différences t&apos;aide à choisir le transport le plus adapté et à éviter les mauvaises surprises sur ton remboursement.
        </p>

        <section id="definition-vsl">
          <h2>Qu&apos;est-ce qu&apos;un VSL ?</h2>
          <p>
            Le <strong>VSL</strong>, ou Véhicule Sanitaire Léger, est un véhicule de transport sanitaire dédié, de type berline ou monospace, identifié par une signalétique réglementaire. Il est destiné au transport assis de patients dont l&apos;état de santé est stable mais qui ne peuvent pas se déplacer seuls vers leurs soins. Le VSL relève pleinement de la catégorie du <strong>transport sanitaire</strong> au sens du Code de la santé publique.
          </p>
          <p>
            Pour exercer, une entreprise de VSL doit obtenir un <strong>agrément de l&apos;Agence Régionale de Santé</strong> (ARS). Cet agrément garantit la conformité du véhicule, la qualification de l&apos;équipage et le respect des normes de sécurité et d&apos;hygiène. Le conducteur détient l&apos;attestation d&apos;<strong>auxiliaire ambulancier</strong> ou un titre équivalent, et il a été formé aux gestes de premiers secours. Il peut aider le patient à monter et descendre, l&apos;installer correctement et surveiller son état pendant le trajet.
          </p>
          <p>
            Le VSL transporte jusqu&apos;à trois patients assis en même temps. Les motifs de recours les plus fréquents sont les séances de dialyse, de chimiothérapie ou de radiothérapie, les consultations de spécialistes, les examens d&apos;imagerie et les sorties d&apos;hospitalisation. Le VSL ne transporte jamais de patient allongé et n&apos;intervient pas en urgence : ces missions relèvent de l&apos;ambulance.
          </p>
        </section>

        <section id="definition-taxi">
          <h2>Qu&apos;est-ce qu&apos;un taxi conventionné ?</h2>
          <p>
            Le <strong>taxi conventionné</strong> est un taxi ordinaire, titulaire d&apos;une autorisation de stationnement (ADS) délivrée par une commune, qui a signé une <strong>convention avec la Caisse Primaire d&apos;Assurance Maladie</strong>. Cette convention l&apos;autorise à transporter des patients sur prescription médicale et à pratiquer le tiers payant, c&apos;est-à-dire à se faire payer directement par la Sécurité sociale sans que le patient avance les frais.
          </p>
          <p>
            Contrairement au VSL, le taxi conventionné ne relève pas du transport sanitaire mais de l&apos;activité de taxi, encadrée par le Code des transports. Le <strong>chauffeur n&apos;a pas de formation médicale spécifique</strong> : il assure un transport assis pour des patients autonomes qui ne nécessitent ni installation particulière ni surveillance. Le véhicule n&apos;est pas un véhicule sanitaire et ne porte pas la signalétique des VSL.
          </p>
          <p>
            Le conventionnement repose désormais sur la <strong>convention-cadre nationale du 13 mai 2025</strong>, complétée par des conventions locales. Depuis le 1er octobre 2025, une nouvelle grille tarifaire s&apos;applique, et le transport partagé est obligatoire depuis le 1er avril 2025 pour certains trajets programmés. Le taxi conventionné peut aussi réaliser des courses classiques, non médicales, qui ne sont alors pas remboursées par l&apos;Assurance maladie.
          </p>
        </section>

        <section id="comparatif">
          <h2>Tableau comparatif VSL / Taxi conventionné</h2>
          <p>
            Le tableau ci-dessous résume les principales différences entre le VSL et le taxi conventionné pour le transport assis remboursé.
          </p>
          <div className="not-prose my-6 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    Critère
                  </th>
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    VSL
                  </th>
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    Taxi conventionné
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr>
                  <td className="border border-slate-200 px-4 py-3 font-medium">Type de véhicule</td>
                  <td className="border border-slate-200 px-4 py-3">Véhicule sanitaire dédié, signalétique réglementaire</td>
                  <td className="border border-slate-200 px-4 py-3">Taxi ordinaire avec lumineux et compteur</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-200 px-4 py-3 font-medium">Agrément / autorisation</td>
                  <td className="border border-slate-200 px-4 py-3">Agrément ARS (transport sanitaire)</td>
                  <td className="border border-slate-200 px-4 py-3">Autorisation de stationnement + convention CPAM</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-4 py-3 font-medium">Tarification CPAM</td>
                  <td className="border border-slate-200 px-4 py-3">Tarif national de transport sanitaire</td>
                  <td className="border border-slate-200 px-4 py-3">Convention locale : base km + suppléments (convention-cadre 2025)</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-200 px-4 py-3 font-medium">Équipage</td>
                  <td className="border border-slate-200 px-4 py-3">Auxiliaire ambulancier formé aux premiers secours</td>
                  <td className="border border-slate-200 px-4 py-3">Chauffeur de taxi sans formation médicale</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-4 py-3 font-medium">Accompagnement du patient</td>
                  <td className="border border-slate-200 px-4 py-3">Aide à l&apos;installation et surveillance pendant le trajet</td>
                  <td className="border border-slate-200 px-4 py-3">Transport simple, patient autonome</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-200 px-4 py-3 font-medium">Prise en charge ALD</td>
                  <td className="border border-slate-200 px-4 py-3">100 % sur prescription</td>
                  <td className="border border-slate-200 px-4 py-3">100 % sur prescription</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-4 py-3 font-medium">Transport partagé</td>
                  <td className="border border-slate-200 px-4 py-3">Jusqu&apos;à 3 patients</td>
                  <td className="border border-slate-200 px-4 py-3">Obligatoire depuis le 1er avril 2025 sur certains trajets programmés</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-200 px-4 py-3 font-medium">Plafond kilométrique</td>
                  <td className="border border-slate-200 px-4 py-3">Trajet vers l&apos;établissement adapté le plus proche</td>
                  <td className="border border-slate-200 px-4 py-3">Trajet vers l&apos;établissement adapté le plus proche ; longue distance encadrée</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Dans les deux cas, l&apos;Assurance maladie rembourse sur la base du trajet vers l&apos;<strong>établissement de soins approprié le plus proche</strong> du domicile. Un trajet plus long n&apos;est pris en charge intégralement que s&apos;il est médicalement justifié.
          </p>
        </section>

        <section id="choisir">
          <h2>Quand choisir l&apos;un ou l&apos;autre</h2>
          <p>
            Le choix entre VSL et taxi conventionné dépend d&apos;abord de ta <strong>prescription médicale</strong>. Si le médecin a coché le transport assis, les deux modes sont en principe envisageables. Voici les critères qui orientent en pratique vers l&apos;un ou l&apos;autre.
          </p>
          <p>
            <strong>Privilégie le VSL</strong> si tu as besoin d&apos;une aide pour monter et descendre du véhicule, si ton état nécessite une surveillance pendant le trajet, ou si tu réalises des soins itératifs lourds comme la dialyse ou la chimiothérapie pour lesquels un personnel formé est rassurant. Le VSL est aussi pertinent quand l&apos;établissement de soins travaille déjà avec des entreprises de transport sanitaire partenaires.
          </p>
          <p>
            <strong>Le taxi conventionné convient</strong> lorsque tu es totalement autonome, que tu n&apos;as besoin d&apos;aucune assistance et que tu te rends à une consultation, un examen simple ou une séance de kinésithérapie. Dans certaines zones rurales où l&apos;offre de VSL est limitée, le taxi conventionné est parfois la seule solution disponible rapidement. Il offre aussi une grande souplesse horaire.
          </p>
          <p>
            Dans tous les cas, l&apos;Assurance maladie privilégie le mode de transport <strong>le moins onéreux compatible avec ton état de santé</strong>. Tu n&apos;as pas à arbitrer seul sur le coût : c&apos;est le médecin prescripteur qui définit le cadre, et le transporteur applique la grille tarifaire en vigueur.
          </p>
        </section>

        <section id="demarches">
          <h2>Démarches de prise en charge</h2>
          <p>
            Pour être remboursé, que tu choisisses un VSL ou un taxi conventionné, la démarche est la même et repose sur trois éléments.
          </p>
          <ol>
            <li>
              <strong>Obtenir la prescription médicale de transport.</strong> Ton médecin remplit le formulaire dédié en précisant le mode de transport, le motif médical et la période concernée. Conserve l&apos;original, le transporteur en a besoin pour facturer.
            </li>
            <li>
              <strong>Réserver le transporteur.</strong> Contacte un VSL ou un taxi conventionné de ton secteur, en indiquant la date, l&apos;heure et l&apos;adresse du rendez-vous. Pour les trajets programmés comme la dialyse, réserve au moins 24 heures à l&apos;avance et accepte le transport partagé quand il t&apos;est proposé.
            </li>
            <li>
              <strong>Présenter ta carte Vitale et la prescription.</strong> Au moment de la prise en charge, le transporteur enregistre tes droits et applique le tiers payant. Tu n&apos;avances pas les frais, sauf la part éventuelle non couverte par ta complémentaire et la franchise médicale de transport.
            </li>
          </ol>
          <p>
            Pense à vérifier que le professionnel est bien conventionné. Sur l&apos;annuaire RoullePro, chaque fiche précise la catégorie du transporteur. Pour le taxi, le conventionnement CPAM est la condition indispensable au remboursement : un taxi non conventionné ne pourra pas pratiquer le tiers payant.
          </p>
        </section>

        <section id="faq">
          <h2>Questions fréquentes</h2>
          <FaqAccordion items={FAQ} />
        </section>

        <section className="not-prose mt-12 pt-8 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Pour aller plus loin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/vsl"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition"
            >
              <h3 className="font-semibold text-slate-900 mb-1">Trouver un VSL</h3>
              <p className="text-sm text-slate-600">
                Annuaire des véhicules sanitaires légers par ville.
              </p>
            </Link>
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
              href="/transport-medical"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition"
            >
              <h3 className="font-semibold text-slate-900 mb-1">Annuaire transport médical</h3>
              <p className="text-sm text-slate-600">
                Ambulances, VSL et taxis conventionnés près de chez toi.
              </p>
            </Link>
            <Link
              href="/guides/comment-se-faire-conventionner-cpam"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition"
            >
              <h3 className="font-semibold text-slate-900 mb-1">Se faire conventionner CPAM</h3>
              <p className="text-sm text-slate-600">
                Guide complet du conventionnement taxi, VSL et ambulance.
              </p>
            </Link>
          </div>
        </section>
      </GuideLayout>
    </>
  );
}
