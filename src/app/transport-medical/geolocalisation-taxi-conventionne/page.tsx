import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { BASE_URL } from "@/lib/seo-schema";
import FaqAccordion, { type FaqItem } from "@/app/guides/_components/FaqAccordion";
import SefiLayout, { type SectionEntry } from "../_sefi/SefiLayout";
import SefiJsonLd from "../_sefi/SefiJsonLd";
import SefiCta from "../_sefi/SefiCta";
import SefiMaillage from "../_sefi/SefiMaillage";
import {
  CITATION_ARTICLE_L322_5_3,
  REPERES_COUTS_GEOLOC,
  SOLUTIONS_GEOLOC,
  AIDE_EQUIPEMENT,
  DATE_VERIFICATION,
  SOURCES,
  type Source,
} from "@/lib/sefi-data";

const SLUG = "geolocalisation-taxi-conventionne";
const TITLE = "Géolocalisation taxi conventionné : obligation 2027";
const DESCRIPTION =
  "Géolocalisation obligatoire pour les taxis conventionnés au 1er janvier 2027 : texte de loi, décret en attente, solutions identifiées, repères de coûts et aide à l'équipement. Sources vérifiées le 18 juillet 2026.";
const PUBLISHED_AT = "2026-07-18T08:00:00Z";
const UPDATED_AT = "2026-07-18T08:00:00Z";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${BASE_URL}/transport-medical/${SLUG}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/transport-medical/${SLUG}`,
    type: "article",
    publishedTime: PUBLISHED_AT,
    modifiedTime: UPDATED_AT,
    images: ["/logo-roullepro-horizontal.png"],
  },
};

const SECTIONS: SectionEntry[] = [
  { id: "obligation", label: "L'obligation de géolocalisation" },
  { id: "decret", label: "Décret en attente" },
  { id: "solutions", label: "Solutions identifiées" },
  { id: "couts", label: "Repères de coûts" },
  { id: "aide", label: "Aide à l'équipement" },
  { id: "faq", label: "Questions fréquentes" },
];

const FAQ: FaqItem[] = [
  {
    q: "La géolocalisation est-elle obligatoire pour les taxis conventionnés ?",
    a: "Oui. L'article 27 de la loi n° 2026-534 du 25 juin 2026 impose aux taxis conventionnés et aux transporteurs sanitaires d'équiper l'ensemble de leurs véhicules d'un dispositif de géolocalisation certifié par l'assurance maladie, au plus tard le 1er janvier 2027. En temps réel, la géolocalisation sert à valider les données kilométriques de la facturation.",
  },
  {
    q: "Quel dispositif de géolocalisation choisir ?",
    a: "Le dispositif doit être certifié par l'Assurance maladie. À la date du 18 juillet 2026, la liste officielle des dispositifs certifiés n'a pas été trouvée publiée. En pratique, la géolocalisation passe aujourd'hui par des applications professionnelles sur smartphone, tablette ou terminaux embarqués, l'activation de la passerelle vers la CPAM pouvant se faire par mise à jour de l'éditeur métier. Attendez la publication du décret et de la liste officielle avant tout engagement définitif.",
  },
  {
    q: "Combien coûte la géolocalisation d'un véhicule ?",
    a: "À titre indicatif (repères de marché non spécifiques CPAM) : un abonnement de géolocalisation va de 12–19 € HT/mois en entrée de gamme à 20–45 € HT/mois en standard B2B, voire jusqu'à 150 € HT/mois en premium métier. Un boîtier coûte 250–450 € HT l'unité, plus un abonnement d'environ 10–15 €/mois. Des alternatives économiques existent à partir d'environ 9 € HT/mois.",
  },
  {
    q: "Une aide à l'équipement est-elle prévue ?",
    a: "Oui, dans son principe : la convention-cadre nationale des taxis prévoit une aide / un forfait à l'équipement pour l'acquisition d'outils de géolocalisation. Toutefois, le montant précis de ce forfait n'est pas chiffré dans les textes consultés au 18 juillet 2026 ; il est à confirmer auprès de la Cnam ou de votre CPAM.",
  },
];

const PAGE_SOURCES: Source[] = [
  SOURCES.loi2026534,
  SOURCES.lofficiel,
  SOURCES.servicePublic,
  SOURCES.conventionCadre,
  SOURCES.etudeImpact,
  SOURCES.fnap,
  ...SOLUTIONS_GEOLOC.map((s) => s.source),
  ...REPERES_COUTS_GEOLOC.map((r) => r.source),
];

export default function GeolocalisationPage() {
  return (
    <>
      <SefiJsonLd
        slug={SLUG}
        title={TITLE}
        description={DESCRIPTION}
        breadcrumbLabel="Géolocalisation taxi conventionné"
        publishedAt={PUBLISHED_AT}
        updatedAt={UPDATED_AT}
        faq={FAQ}
      />
      <SefiLayout
        title="Géolocalisation obligatoire du taxi conventionné en 2027"
        intro="Au plus tard le 1er janvier 2027, chaque véhicule de taxi conventionné, VSL ou ambulance devra être équipé d'un dispositif de géolocalisation certifié par l'assurance maladie. Texte de loi, décret en attente, solutions identifiées et repères de coûts, au 18 juillet 2026."
        breadcrumbLabel="Géolocalisation taxi conventionné"
        sections={SECTIONS}
        publishedDate="Juillet 2026"
        updatedAt={UPDATED_AT}
        sources={PAGE_SOURCES}
      >
        <section id="obligation">
          <h2>L&apos;obligation de géolocalisation</h2>
          <p>
            L&apos;
            <a href={SOURCES.loi2026534.url} target="_blank" rel="noopener noreferrer">
              article 27 de la loi n° 2026-534 du 25 juin 2026
            </a>{" "}
            (article L. 322-5-3 du code de la sécurité sociale rétabli) impose
            l&apos;équipement de <em>l&apos;ensemble</em> des véhicules :
          </p>
          <blockquote>
            <p>« {CITATION_ARTICLE_L322_5_3} »</p>
          </blockquote>
          <p>
            La géolocalisation, en temps réel, sert à <strong>valider les données
            kilométriques de la facturation</strong> (
            <a href={SOURCES.lofficiel.url} target="_blank" rel="noopener noreferrer">
              L&apos;Officiel des Métiers, 28 juin 2026
            </a>
            ). Le dispositif doit être <strong>certifié par l&apos;Assurance
            maladie</strong> ; à ce jour, la géolocalisation passe majoritairement par
            des applications professionnelles sur smartphone, tablette ou terminaux
            embarqués.
          </p>
        </section>

        <section id="decret">
          <h2>Décret en attente</h2>
          <div className="not-prose my-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 mb-1">
                  À confirmer : décret et liste officielle non publiés au{" "}
                  {DATE_VERIFICATION}
                </p>
                <p className="text-sm text-amber-900">
                  Le décret en Conseil d&apos;État doit préciser les conditions
                  d&apos;utilisation du dispositif, notamment pour ne pas empiéter sur la
                  vie privée des chauffeurs hors service ni sur le secret médical. Ce
                  décret n&apos;a pas été retrouvé publié au {DATE_VERIFICATION}. De même,
                  la liste officielle des dispositifs de géolocalisation certifiés par
                  l&apos;Assurance maladie n&apos;a pas été trouvée publiée à cette date.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="solutions">
          <h2>Solutions identifiées</h2>
          <p>
            Voici les approches et solutions repérées dans les sources consultées.
            Aucune ne peut, à ce stade, se prévaloir d&apos;une certification officielle
            de l&apos;Assurance maladie tant que le référentiel n&apos;est pas publié.
          </p>
          <div className="not-prose my-6 space-y-3">
            {SOLUTIONS_GEOLOC.map((s) => (
              <div
                key={s.nom}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <h3 className="font-bold text-slate-900">{s.nom}</h3>
                <p className="text-sm text-slate-600 mt-1">{s.description}</p>
                <a
                  href={s.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-700 hover:underline mt-2 inline-block"
                >
                  Source : {s.source.nom}
                </a>
              </div>
            ))}
          </div>
          <p>
            Plusieurs de ces solutions sont aussi des logiciels de facturation : voir
            notre{" "}
            <Link href="/transport-medical/logiciels-sefi">
              comparatif des logiciels SEFi
            </Link>
            .
          </p>
        </section>

        <section id="couts">
          <h2>Repères de coûts</h2>
          <p>
            Ces repères de marché sont indicatifs et non spécifiques au conventionnement
            CPAM. Ils permettent d&apos;anticiper un budget.
          </p>
          <div className="not-prose my-6 overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Poste</th>
                  <th className="text-left px-3 py-2 font-semibold">Repère de coût</th>
                  <th className="text-left px-3 py-2 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 align-top">
                {REPERES_COUTS_GEOLOC.map((r) => (
                  <tr key={r.categorie}>
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {r.categorie}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{r.detail}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <a
                        href={r.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        {r.source.nom}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="aide">
          <h2>Aide à l&apos;équipement</h2>
          <p>
            {AIDE_EQUIPEMENT.principe} En revanche, le montant précis du forfait est{" "}
            <strong>{AIDE_EQUIPEMENT.montant}</strong> dans les textes consultés : il
            est à confirmer auprès de la Cnam ou de votre CPAM (
            <a
              href={AIDE_EQUIPEMENT.source.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {AIDE_EQUIPEMENT.source.nom}
            </a>
            ).
          </p>
        </section>

        <SefiCta />

        <section id="faq">
          <h2>Questions fréquentes</h2>
          <FaqAccordion items={FAQ} />
        </section>

        <SefiMaillage current="geolocalisation-taxi-conventionne" />
      </SefiLayout>
    </>
  );
}
