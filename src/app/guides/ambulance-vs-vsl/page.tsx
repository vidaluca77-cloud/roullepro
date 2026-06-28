import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type SectionEntry } from "../_components/GuideLayout";
import FaqAccordion, { type FaqItem } from "../_components/FaqAccordion";
import JsonLd from "../_components/JsonLd";

export const revalidate = 3600;

const SLUG = "ambulance-vs-vsl";
const TITLE =
  "Ambulance ou VSL : quelle prescription médicale et quelle prise en charge ?";
const DESCRIPTION =
  "Ambulance ou VSL : transport allongé ou assis, équipage diplômé, tarifs CPAM, urgence ou programmé. Comprends les critères médicaux de prescription et la prise en charge 2026.";
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
  { id: "definition-ambulance", label: "Qu'est-ce qu'une ambulance ?" },
  { id: "definition-vsl", label: "Qu'est-ce qu'un VSL ?" },
  { id: "comparatif", label: "Tableau comparatif" },
  { id: "criteres", label: "Critères médicaux de prescription" },
  { id: "demarches", label: "Démarches de prise en charge" },
  { id: "faq", label: "FAQ" },
];

const FAQ: FaqItem[] = [
  {
    q: "Quelle est la différence entre une ambulance et un VSL ?",
    a: "L'ambulance transporte les patients allongés ou dont l'état nécessite une surveillance et une assistance médicale pendant le trajet. Elle est équipée de matériel de soins et son équipage comprend un diplômé d'État ambulancier. Le VSL transporte des patients assis, autonomes et en état stable, conduit par un auxiliaire ambulancier. En résumé : l'ambulance relève du transport allongé et médicalisé, le VSL du transport assis sans assistance médicale lourde.",
  },
  {
    q: "Qui décide si j'ai besoin d'une ambulance ou d'un VSL ?",
    a: "C'est le médecin prescripteur qui détermine le mode de transport adapté à ton état de santé, en s'appuyant sur le référentiel de prescription des transports défini par l'Assurance maladie. Il coche la case correspondante sur la prescription médicale de transport. Tu ne choisis pas librement l'ambulance si ton état ne le justifie pas : une ambulance prescrite sans justification médicale peut donner lieu à un remboursement réduit ou refusé.",
  },
  {
    q: "L'ambulance est-elle mieux remboursée que le VSL ?",
    a: "Le taux de remboursement est identique : 55 % du tarif conventionné en régime général, 100 % en ALD, maternité à partir du premier jour du sixième mois, accident du travail, maladie professionnelle, nouveau-nés de moins de 30 jours, CSS et AME. La différence se situe sur le tarif lui-même : une ambulance coûte plus cher qu'un VSL, car elle mobilise un équipage diplômé et du matériel médical. La prise en charge suit le mode prescrit par le médecin.",
  },
  {
    q: "Quel équipage trouve-t-on dans une ambulance et dans un VSL ?",
    a: "Une ambulance est armée d'un équipage de deux personnes au minimum, dont au moins un titulaire du Diplôme d'État d'Ambulancier (DEA), accompagné d'un auxiliaire ambulancier. Le VSL est conduit par un seul auxiliaire ambulancier ou un conducteur titulaire d'un titre équivalent, formé aux gestes de premiers secours. L'ambulance dispose donc d'une compétence médicale plus poussée, adaptée aux patients fragiles ou allongés.",
  },
  {
    q: "Une ambulance peut-elle être utilisée pour un transport programmé ?",
    a: "Oui. Si l'ambulance est associée à l'urgence, elle réalise aussi de nombreux transports programmés : sorties d'hospitalisation de patients devant rester allongés, transferts entre établissements, retours à domicile après une intervention. Le critère n'est pas l'urgence mais l'état du patient : dès lors qu'un transport allongé ou une surveillance sont nécessaires, l'ambulance s'impose, qu'il s'agisse d'une urgence ou d'un rendez-vous planifié.",
  },
  {
    q: "Puis-je passer du VSL à l'ambulance si mon état se dégrade ?",
    a: "Le mode de transport est défini par la prescription en fonction de ton état au moment de l'évaluation médicale. Si ton état se dégrade durablement, le médecin peut établir une nouvelle prescription adaptée. En cas de dégradation soudaine pendant un trajet en VSL, le conducteur, formé aux premiers secours, alerte les services d'urgence : il ne transforme pas son VSL en ambulance, car le véhicule et l'équipement ne le permettent pas.",
  },
  {
    q: "Le transport partagé existe-t-il pour l'ambulance comme pour le VSL ?",
    a: "Le transport partagé concerne surtout le transport assis : VSL et taxi conventionné, notamment pour les trajets programmés vers la dialyse, la chimiothérapie et la radiothérapie, où il est obligatoire depuis le 1er avril 2025 quand l'état du patient le permet. L'ambulance, qui transporte des patients allongés ou nécessitant une surveillance, n'est pas concernée par cette obligation de partage dans les mêmes conditions.",
  },
  {
    q: "Comment trouver une ambulance ou un VSL agréé près de chez moi ?",
    a: "L'annuaire RoullePro recense les ambulances, VSL et taxis conventionnés par ville et par département, avec leur numéro SIRET et leurs coordonnées. Chaque fiche indique la catégorie et le conventionnement du transporteur. Tu peux aussi te tourner vers l'établissement de soins qui t'oriente, ou consulter la liste des transporteurs agréés par l'Agence Régionale de Santé de ta région.",
  },
];

export default function AmbulanceVsVslGuide() {
  return (
    <>
      <JsonLd
        slug={SLUG}
        title={TITLE}
        description={DESCRIPTION}
        breadcrumbLabel="Ambulance vs VSL"
        publishedAt={PUBLISHED_AT}
        updatedAt={UPDATED_AT}
        faq={FAQ}
      />
      <GuideLayout
        title={TITLE}
        intro="Ambulance ou VSL : le choix dépend de ton état de santé, pas de tes préférences. Transport allongé contre transport assis, équipage diplômé contre auxiliaire, urgence contre programmé : voici comment le médecin tranche et comment se passe la prise en charge."
        breadcrumbLabel="Ambulance vs VSL"
        sections={SECTIONS}
        publishedDate="Juin 2026"
        publishedAt={PUBLISHED_AT}
        updatedAt={UPDATED_AT}
      >
        <p>
          Lorsqu&apos;un transport vers des soins est nécessaire, deux solutions sanitaires reviennent souvent : l&apos;<strong>ambulance</strong> et le <strong>VSL</strong> (Véhicule Sanitaire Léger). Toutes deux sont des transports sanitaires agréés par l&apos;Agence Régionale de Santé, prescrits par un médecin et remboursés par l&apos;Assurance maladie. Mais elles répondent à des besoins très différents. L&apos;ambulance prend en charge les patients fragiles, allongés ou nécessitant une surveillance, tandis que le VSL convient aux patients assis et autonomes. Comprendre cette frontière t&apos;évite une prescription inadaptée et un remboursement réduit.
        </p>

        <section id="definition-ambulance">
          <h2>Qu&apos;est-ce qu&apos;une ambulance ?</h2>
          <p>
            L&apos;<strong>ambulance</strong> est un véhicule de transport sanitaire conçu pour le transport <strong>allongé</strong> de patients dont l&apos;état nécessite une position couchée, une surveillance ou une assistance pendant le trajet. Elle est équipée d&apos;un brancard, d&apos;un matelas à dépression, d&apos;oxygène, d&apos;un défibrillateur et de matériel de premiers secours. C&apos;est un véritable outil de soins mobile.
          </p>
          <p>
            Son <strong>équipage comprend au minimum deux personnes</strong>, dont au moins un titulaire du <strong>Diplôme d&apos;État d&apos;Ambulancier</strong> (DEA), accompagné d&apos;un auxiliaire ambulancier. Cette double présence permet d&apos;assurer la sécurité du patient, de surveiller ses constantes et d&apos;intervenir si son état évolue. L&apos;entreprise d&apos;ambulance doit détenir un agrément de l&apos;ARS, gage de conformité du matériel et de qualification des équipages.
          </p>
          <p>
            Les motifs de recours à l&apos;ambulance sont variés : entrée ou sortie d&apos;hospitalisation d&apos;un patient devant rester allongé, transfert entre deux établissements, retour à domicile après une intervention lourde, examen ou traitement nécessitant une surveillance, ou prise en charge à la suite d&apos;un appel au SAMU lorsque la situation ne relève pas du SMUR. L&apos;ambulance intervient donc aussi bien en urgence que pour des transports programmés.
          </p>
        </section>

        <section id="definition-vsl">
          <h2>Qu&apos;est-ce qu&apos;un VSL ?</h2>
          <p>
            Le <strong>VSL</strong> est un véhicule sanitaire léger, de type berline ou monospace, destiné au transport <strong>assis</strong> de patients en état stable, autonomes, mais qui ne peuvent pas se rendre seuls à leurs soins. Comme l&apos;ambulance, il relève du transport sanitaire et son entreprise doit obtenir l&apos;agrément de l&apos;ARS.
          </p>
          <p>
            Le VSL est conduit par un seul <strong>auxiliaire ambulancier</strong> ou un conducteur titulaire d&apos;un titre équivalent, formé aux gestes de premiers secours. Il peut transporter jusqu&apos;à trois patients assis simultanément. Le conducteur aide le patient à monter et descendre et reste attentif à son état, mais il n&apos;assure pas la surveillance médicale d&apos;une ambulance et le véhicule ne dispose pas de matériel de soins.
          </p>
          <p>
            Les motifs courants sont les séances de dialyse, de chimiothérapie ou de radiothérapie, les consultations de spécialistes, les examens d&apos;imagerie et les sorties d&apos;hospitalisation sans contrainte d&apos;allongement. Le VSL n&apos;intervient jamais en urgence et ne transporte pas de patient allongé : c&apos;est le critère qui le sépare nettement de l&apos;ambulance.
          </p>
        </section>

        <section id="comparatif">
          <h2>Tableau comparatif Ambulance / VSL</h2>
          <p>
            Le tableau ci-dessous met en regard les caractéristiques de l&apos;ambulance et du VSL pour t&apos;aider à comprendre la logique de prescription.
          </p>
          <div className="not-prose my-6 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    Critère
                  </th>
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    Ambulance
                  </th>
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    VSL
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr>
                  <td className="border border-slate-200 px-4 py-3 font-medium">État du patient</td>
                  <td className="border border-slate-200 px-4 py-3">Allongé, surveillance ou assistance nécessaire</td>
                  <td className="border border-slate-200 px-4 py-3">Assis, autonome, état stable</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-200 px-4 py-3 font-medium">Équipement</td>
                  <td className="border border-slate-200 px-4 py-3">Brancard, oxygène, défibrillateur, matériel de soins</td>
                  <td className="border border-slate-200 px-4 py-3">Véhicule sanitaire sans matériel de soins lourd</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-4 py-3 font-medium">Équipage</td>
                  <td className="border border-slate-200 px-4 py-3">2 personnes dont 1 diplômé d&apos;État (DEA)</td>
                  <td className="border border-slate-200 px-4 py-3">1 auxiliaire ambulancier</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-200 px-4 py-3 font-medium">Tarif CPAM</td>
                  <td className="border border-slate-200 px-4 py-3">Plus élevé (équipage et matériel)</td>
                  <td className="border border-slate-200 px-4 py-3">Plus économique</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-4 py-3 font-medium">Urgence / programmé</td>
                  <td className="border border-slate-200 px-4 py-3">Urgence et transport programmé</td>
                  <td className="border border-slate-200 px-4 py-3">Transport programmé uniquement</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-200 px-4 py-3 font-medium">Nombre de patients</td>
                  <td className="border border-slate-200 px-4 py-3">1 patient (transport individuel)</td>
                  <td className="border border-slate-200 px-4 py-3">Jusqu&apos;à 3 patients (transport partagé possible)</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-4 py-3 font-medium">Prise en charge ALD</td>
                  <td className="border border-slate-200 px-4 py-3">100 % sur prescription</td>
                  <td className="border border-slate-200 px-4 py-3">100 % sur prescription</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-200 px-4 py-3 font-medium">Agrément</td>
                  <td className="border border-slate-200 px-4 py-3">Agrément ARS</td>
                  <td className="border border-slate-200 px-4 py-3">Agrément ARS</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="criteres">
          <h2>Critères médicaux de prescription</h2>
          <p>
            Le médecin ne choisit pas le mode de transport au hasard. Il s&apos;appuie sur le <strong>référentiel de prescription des transports</strong> défini par l&apos;Assurance maladie (CNAMTS), qui hiérarchise les modes selon l&apos;état du patient et impose de retenir le transport le moins coûteux compatible avec sa situation. Quatre niveaux de déficience guident la décision.
          </p>
          <ul>
            <li>
              <strong>Transport allongé obligatoire :</strong> le patient ne peut pas être transporté assis, en raison d&apos;une pathologie, d&apos;une intervention ou d&apos;un état de fatigue majeur. L&apos;ambulance s&apos;impose.
            </li>
            <li>
              <strong>Surveillance ou assistance pendant le trajet :</strong> le patient présente un risque d&apos;aggravation, a besoin d&apos;oxygène ou d&apos;une présence soignante. L&apos;ambulance reste nécessaire même pour un transport assis techniquement possible.
            </li>
            <li>
              <strong>Aide au déplacement sans surveillance médicale :</strong> le patient peut s&apos;asseoir et n&apos;a pas besoin de soins pendant le trajet, mais ne peut pas utiliser un transport en commun ou conduire. Le VSL est alors adapté.
            </li>
            <li>
              <strong>Autonomie complète :</strong> le patient peut se déplacer seul ou par ses propres moyens, éventuellement avec un taxi conventionné si une prise en charge est justifiée.
            </li>
          </ul>
          <p>
            Une prescription d&apos;ambulance sans justification au regard de ce référentiel expose le transporteur et le patient à un <strong>contrôle de l&apos;Assurance maladie</strong> et à une éventuelle révision du remboursement. C&apos;est pourquoi le médecin documente le motif médical sur la prescription.
          </p>
        </section>

        <section id="demarches">
          <h2>Démarches de prise en charge</h2>
          <p>
            La procédure de remboursement est commune à l&apos;ambulance et au VSL.
          </p>
          <ol>
            <li>
              <strong>Prescription médicale de transport.</strong> Le médecin établit le formulaire en indiquant le mode prescrit (ambulance ou VSL), le motif et la période. Pour certains transports, notamment de longue distance ou en série, une entente préalable de la caisse peut être requise.
            </li>
            <li>
              <strong>Réservation du transporteur.</strong> Tu contactes une entreprise agréée. Pour un transport programmé, anticipe la réservation. Pour une situation urgente relevant du SAMU, c&apos;est la régulation médicale qui déclenche l&apos;ambulance.
            </li>
            <li>
              <strong>Tiers payant.</strong> Sur présentation de ta carte Vitale et de la prescription, le transporteur facture directement la Sécurité sociale. Tu n&apos;avances pas les frais, hormis la part complémentaire éventuelle et la franchise médicale de transport.
            </li>
          </ol>
          <p>
            Avant de réserver, vérifie que le professionnel est agréé. Sur l&apos;annuaire RoullePro, la catégorie de chaque transporteur est indiquée, ce qui te permet de distinguer immédiatement une ambulance d&apos;un VSL.
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
              href="/transport-sanitaire"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition"
            >
              <h3 className="font-semibold text-slate-900 mb-1">Transport sanitaire</h3>
              <p className="text-sm text-slate-600">
                Tout savoir sur le transport sanitaire agréé.
              </p>
            </Link>
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
              href="/transport-medical"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition"
            >
              <h3 className="font-semibold text-slate-900 mb-1">Annuaire transport médical</h3>
              <p className="text-sm text-slate-600">
                Ambulances, VSL et taxis conventionnés près de chez toi.
              </p>
            </Link>
            <Link
              href="/guides/vsl-vs-taxi-conventionne"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition"
            >
              <h3 className="font-semibold text-slate-900 mb-1">VSL vs Taxi conventionné</h3>
              <p className="text-sm text-slate-600">
                Comparatif des deux modes de transport assis remboursés.
              </p>
            </Link>
          </div>
        </section>
      </GuideLayout>
    </>
  );
}
