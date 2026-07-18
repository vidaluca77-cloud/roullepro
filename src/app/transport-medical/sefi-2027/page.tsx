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
  CALENDRIER,
  CITATION_ARTICLE_L322_5_3,
  CITATION_ENTREE_VIGUEUR,
  DATE_VERIFICATION,
  SOURCES,
  type Source,
} from "@/lib/sefi-data";

const SLUG = "sefi-2027";
const TITLE = "SEFi 2027 : l'obligation pour les taxis conventionnés";
const DESCRIPTION =
  "SEFi et géolocalisation obligatoires au 1er janvier 2027 pour les taxis conventionnés, VSL et ambulances : article 27 de la loi n° 2026-534, calendrier, sanctions et démarches. Sources officielles vérifiées.";
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
  { id: "obligation", label: "L'obligation en 2027" },
  { id: "concernes", label: "Qui est concerné" },
  { id: "calendrier", label: "Le calendrier en 3 étapes" },
  { id: "quotidien", label: "Ce que ça change au quotidien" },
  { id: "sanctions", label: "Sanctions" },
  { id: "decret", label: "État du décret" },
  { id: "faq", label: "Questions fréquentes" },
];

const FAQ: FaqItem[] = [
  {
    q: "Le SEFi est-il obligatoire pour les taxis conventionnés en 2027 ?",
    a: "Oui. L'article 27 de la loi n° 2026-534 du 25 juin 2026 rétablit l'article L. 322-5-3 du code de la sécurité sociale et impose aux entreprises de transport sanitaire et aux taxis conventionnés d'équiper l'ensemble de leurs véhicules d'un système électronique de facturation intégré (SEFi) et d'un dispositif de géolocalisation certifié par l'assurance maladie, à une date fixée par décret et au plus tard le 1er janvier 2027.",
  },
  {
    q: "Qui est précisément concerné par l'obligation ?",
    a: "Les entreprises de transport sanitaire (ambulances, VSL) et les entreprises de taxi ayant conclu une convention avec un organisme local d'assurance maladie. La mesure s'applique en métropole et en Guadeloupe, Guyane, Martinique, La Réunion, Mayotte, Saint-Barthélemy, Saint-Martin et Saint-Pierre-et-Miquelon. Elle n'est pas applicable en Polynésie française, Nouvelle-Calédonie, Wallis-et-Futuna ni dans les TAAF.",
  },
  {
    q: "Quelles sanctions en cas de non-conformité ?",
    a: "L'article 27 ne fixe aucune sanction chiffrée. C'est la convention-cadre nationale des taxis qui prévoit les conséquences : à défaut d'équipement certifié au 1er janvier 2027, l'entreprise ne conserve pas son conventionnement ; et depuis le 31 mai 2026, facturer avec un logiciel non certifié CNDA peut entraîner une suspension du conventionnement. Le régime de sanction définitif reste à préciser par voie réglementaire.",
  },
  {
    q: "Le décret d'application est-il publié ?",
    a: "Non, à la date du 18 juillet 2026. L'article 27 renvoie à un décret en Conseil d'État (conditions d'utilisation de la géolocalisation) et à un décret simple (date d'entrée en vigueur). Au 30 juin 2026, la fiche service-public indique que des textes sont en attente. Aucun décret spécifique à l'article 27 n'a été retrouvé publié à ce jour : cette information est à confirmer.",
  },
  {
    q: "Faut-il immobiliser le véhicule pour se mettre en conformité ?",
    a: "Pas nécessairement. Selon la presse spécialisée, la géolocalisation passe le plus souvent par des applications sur smartphone, tablette ou terminaux embarqués, et l'activation de la passerelle vers la CPAM peut se faire par une simple mise à jour de l'éditeur métier. L'effort principal porte sur l'achat d'un matériel homologué et la prise en main du nouvel outil de facturation.",
  },
  {
    q: "Quelle est la différence entre le SEFi et la géolocalisation ?",
    a: "Le SEFi (système électronique de facturation intégré) est un service en ligne intégré au logiciel métier qui élabore une facture normée à partir de la prescription de transport et des données de l'Assurance maladie, avec numérisation des pièces justificatives. La géolocalisation, en temps réel, sert à valider les données kilométriques de la facturation. Les deux équipements sont exigés conjointement par l'article 27.",
  },
];

const PAGE_SOURCES: Source[] = [
  SOURCES.loi2026534,
  SOURCES.senat12nov2025,
  SOURCES.etudeImpact,
  SOURCES.servicePublic,
  SOURCES.lofficiel,
  SOURCES.conventionCadre,
  SOURCES.senat31mars2026,
  SOURCES.cndaActu,
  SOURCES.sesamSefi,
];

export default function SefiObligationPage() {
  return (
    <>
      <SefiJsonLd
        slug={SLUG}
        title={TITLE}
        description={DESCRIPTION}
        breadcrumbLabel="SEFi 2027"
        publishedAt={PUBLISHED_AT}
        updatedAt={UPDATED_AT}
        faq={FAQ}
      />
      <SefiLayout
        title="SEFi et géolocalisation obligatoires au 1er janvier 2027"
        intro="Système électronique de facturation intégré (SEFi) et géolocalisation certifiée deviennent obligatoires pour les taxis conventionnés, VSL et ambulances. Voici le texte de loi, le calendrier, les sanctions réelles et l'état du décret, au 18 juillet 2026."
        breadcrumbLabel="SEFi 2027"
        sections={SECTIONS}
        publishedDate="Juillet 2026"
        updatedAt={UPDATED_AT}
        sources={PAGE_SOURCES}
      >
        <section id="obligation">
          <h2>L&apos;obligation SEFi + géolocalisation au 1er janvier 2027</h2>
          <p>
            L&apos;obligation résulte de l&apos;
            <a href={SOURCES.loi2026534.url} target="_blank" rel="noopener noreferrer">
              article 27 de la loi n° 2026-534 du 25 juin 2026 relative à la lutte
              contre les fraudes sociales et fiscales
            </a>
            , qui rétablit l&apos;
            <strong>article L. 322-5-3 du code de la sécurité sociale</strong>. La
            rédaction est identique à celle adoptée par le{" "}
            <a href={SOURCES.senat12nov2025.url} target="_blank" rel="noopener noreferrer">
              Sénat en séance du 12 novembre 2025
            </a>
            .
          </p>
          <blockquote>
            <p>« {CITATION_ARTICLE_L322_5_3} »</p>
          </blockquote>
          <p>
            L&apos;entrée en vigueur intervient «&nbsp;{CITATION_ENTREE_VIGUEUR}&nbsp;».
            Deux équipements sont donc exigés sur <em>l&apos;ensemble</em> des
            véhicules : un <strong>dispositif de géolocalisation certifié par
            l&apos;assurance maladie</strong> et un{" "}
            <strong>système électronique de facturation intégré (SEFi)</strong>. Selon l&apos;
            <a href={SOURCES.etudeImpact.url} target="_blank" rel="noopener noreferrer">
              étude d&apos;impact du Sénat
            </a>
            , le SEFi consiste en un service en ligne, intégré au logiciel métier,
            permettant d&apos;élaborer une facture normée à partir d&apos;une
            prescription de transport et des données détenues par l&apos;Assurance
            maladie, avec un service de numérisation des pièces justificatives.
          </p>
        </section>

        <section id="concernes">
          <h2>Qui est concerné</h2>
          <p>
            Sont visées les <strong>entreprises de transport sanitaire</strong>{" "}
            (ambulances, VSL) <strong>et les entreprises de taxi ayant conclu une
            convention</strong> avec un organisme local d&apos;assurance maladie, c&apos;est-à-dire
            les taxis conventionnés CPAM (
            <a href={SOURCES.servicePublic.url} target="_blank" rel="noopener noreferrer">
              service-public / Entreprendre
            </a>
            ).
          </p>
          <p>
            La mesure est applicable en métropole et en Guadeloupe, Guyane,
            Martinique, La Réunion, Mayotte, Saint-Barthélemy, Saint-Martin et
            Saint-Pierre-et-Miquelon. Elle n&apos;est pas applicable en Polynésie
            française, Nouvelle-Calédonie, Wallis-et-Futuna ni dans les TAAF (
            <a href={SOURCES.etudeImpact.url} target="_blank" rel="noopener noreferrer">
              étude d&apos;impact du Sénat
            </a>
            ).
          </p>
        </section>

        <section id="calendrier">
          <h2>Le calendrier en 3 étapes</h2>
          <p>
            Trois échéances structurent la mise en conformité des taxis conventionnés
            et des transporteurs sanitaires.
          </p>
          <div className="not-prose my-6 space-y-4">
            {CALENDRIER.map((etape) => (
              <div
                key={etape.dateIso}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="text-sm font-bold text-blue-700">{etape.date}</div>
                <div className="font-semibold text-slate-900 mt-1">{etape.titre}</div>
                <p className="text-sm text-slate-600 mt-1">{etape.description}</p>
                <a
                  href={etape.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-700 hover:underline mt-2 inline-block"
                >
                  Source : {etape.source.nom}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section id="quotidien">
          <h2>Ce que ça change au quotidien</h2>
          <p>
            Pour le chauffeur, le SEFi apporte la facturation en ligne pré-alimentée à
            partir des référentiels de l&apos;Assurance maladie et de la prescription
            électronique de transport (sans ressaisie), l&apos;intégration automatique
            des informations à la facture, la télétransmission en ligne, la
            numérisation des pièces justificatives via SCOR (fin des papiers à trier et
            à envoyer) et un objectif «&nbsp;zéro rejet&nbsp;» (
            <a href={SOURCES.sesamSefi.url} target="_blank" rel="noopener noreferrer">
              GIE SESAM-Vitale
            </a>
            ).
          </p>
          <p>
            Concrètement, pour un taxi indépendant, cela implique l&apos;achat
            d&apos;un matériel homologué et la prise en main d&apos;un nouvel outil de
            facturation. Bonne nouvelle relayée par la presse spécialisée : il ne sera
            pas toujours nécessaire d&apos;immobiliser le véhicule, la géolocalisation
            passant par des applications sur smartphone, tablette ou terminaux
            embarqués, et une mise à jour de l&apos;éditeur pouvant suffire à activer la
            passerelle vers la CPAM (
            <a href={SOURCES.lofficiel.url} target="_blank" rel="noopener noreferrer">
              L&apos;Officiel des Métiers, 28 juin 2026
            </a>
            ).
          </p>
        </section>

        <section id="sanctions">
          <h2>Sanctions : ce que dit vraiment la loi</h2>
          <p>
            Soyons précis : l&apos;
            <a href={SOURCES.loi2026534.url} target="_blank" rel="noopener noreferrer">
              article 27
            </a>{" "}
            <strong>ne fixe aucune sanction chiffrée</strong>. L&apos;étude d&apos;impact
            indique seulement que la mesure «&nbsp;permettrait d&apos;assortir
            l&apos;obligation de sanctions en cas de manquement&nbsp;», sans les
            détailler.
          </p>
          <p>
            En pratique, les conséquences reposent sur la{" "}
            <a href={SOURCES.conventionCadre.url} target="_blank" rel="noopener noreferrer">
              convention-cadre nationale des taxis
            </a>
            {" "}: à défaut d&apos;équipement certifié au 1er janvier 2027,
            l&apos;entreprise ne conserve pas son conventionnement ; et depuis le 31 mai
            2026, facturer avec un logiciel non certifié CNDA peut entraîner une
            suspension du conventionnement. La perte du conventionnement, plus que toute
            amende, constitue donc le vrai risque économique.
          </p>
        </section>

        <section id="decret">
          <h2>État du décret d&apos;application</h2>
          <div className="not-prose my-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 mb-1">
                  À confirmer : décret non publié au {DATE_VERIFICATION}
                </p>
                <p className="text-sm text-amber-900">
                  L&apos;article 27 renvoie à deux textes : un décret en Conseil
                  d&apos;État (conditions d&apos;utilisation de la géolocalisation) et un
                  décret simple (date d&apos;entrée en vigueur). Au 30 juin 2026, la
                  fiche service-public indique que «&nbsp;des textes sont en
                  attente&nbsp;». Aucun décret spécifique à l&apos;article 27 n&apos;a été
                  retrouvé publié au Journal officiel dans les sources consultées à la
                  date du {DATE_VERIFICATION}. Vérifiez sa parution avant toute décision
                  d&apos;équipement.
                </p>
              </div>
            </div>
          </div>
          <p>
            À noter : le décret évoqué au Sénat le 31 mars 2026 comme «&nbsp;soumis à la
            mi-mars 2026 au Conseil d&apos;État&nbsp;» concerne l&apos;agrément des
            véhicules PMR issu de la LFSS 2025, et <strong>non</strong> le décret
            géolocalisation de l&apos;article 27 (
            <a href={SOURCES.senat31mars2026.url} target="_blank" rel="noopener noreferrer">
              Sénat, séance du 31 mars 2026
            </a>
            ).
          </p>
        </section>

        <p>
          Pour choisir votre outil, consultez notre{" "}
          <Link href="/transport-medical/logiciels-sefi">
            comparatif des logiciels SEFi
          </Link>{" "}
          et notre page dédiée à la{" "}
          <Link href="/transport-medical/geolocalisation-taxi-conventionne">
            géolocalisation du taxi conventionné
          </Link>
          .
        </p>

        <SefiCta />

        <section id="faq">
          <h2>Questions fréquentes</h2>
          <FaqAccordion items={FAQ} />
        </section>

        <SefiMaillage current="sefi-2027" />
      </SefiLayout>
    </>
  );
}
