import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BASE_URL, jsonLdHtml, buildBreadcrumbJsonLd } from "@/lib/seo-schema";

export const revalidate = 3600;

type RapportData = {
  trimestre: string;
  titre: string;
  datePublication: string;
  datePublicationISO: string;
  resume: string;
  contenu: React.ReactNode;
  sources: { label: string; url: string }[];
};

const RAPPORTS: Record<string, RapportData> = {
  "t2-2026": {
    trimestre: "T2 2026",
    titre:
      "Transport sanitaire en France — Rapport T2 2026 : réformes en cours, régions sous-dotées, projections 2027",
    datePublication: "28 juin 2026",
    datePublicationISO: "2026-06-28",
    resume:
      "Analyse trimestrielle du marché du transport sanitaire français : impact du transport partagé obligatoire, nouvelle convention-cadre taxis CPAM, protocole de maîtrise des dépenses CNAM 2025-2027, régions sous-dotées et projections à horizon 2027.",
    sources: [
      {
        label: "CNAM — Rapport Charges et Produits 2026",
        url: "https://www.ameli.fr",
      },
      {
        label: "DREES — Les dépenses de santé en 2024 (édition 2025)",
        url: "https://drees.solidarites-sante.gouv.fr/sites/default/files/2025-09/Les%20d%C3%A9penses%20de%20sant%C3%A9%20en%202024_MEL.pdf",
      },
      {
        label: "Protocole d'accord CNAM/UNOCAM — JO 30 septembre 2025",
        url: "https://emploi.fhf.fr/sites/default/files/2025-10/joe_20250930_0228_0015.pdf",
      },
      {
        label:
          "FNAP — Chiffres de 2023 pour mieux connaître le transport sanitaire",
        url: "https://www.federationnationaleambulanciersprives.fr/index.php/accueil-fnap?view=article&id=1247",
      },
      {
        label:
          "Le Monde — Taxis et ambulances fragilisés par les nouvelles règles (février 2026)",
        url: "https://www.lemonde.fr/economie/article/2026/02/04/les-taxis-et-entreprises-d-ambulances-fragilises-par-les-nouvelles-regles-du-transport-sanitaire_6665349_3234.html",
      },
      {
        label: "Fondation IFRAP — Transport sanitaire juin 2026",
        url: "https://www.ifrap.org/transports-sanitaires-et-franchises-medicales-il-faut-remonter-le-plafond",
      },
      {
        label: "Regulateur.net — Transport sanitaire en 2026",
        url: "https://regulateur.net/blog/agrement-ars-pour-un-vehicule/",
      },
      {
        label: "RoullePro — Guide conformité transport sanitaire 2026-2027",
        url: "https://roullepro.com/guides/transport-sanitaire-conformite-2026-2027",
      },
    ],
    contenu: null,
  },
};

// Générer les params statiques pour les rapports connus
export function generateStaticParams() {
  return Object.keys(RAPPORTS).map((trimestre) => ({ trimestre }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trimestre: string }>;
}): Promise<Metadata> {
  const { trimestre } = await params;
  const rapport = RAPPORTS[trimestre];
  if (!rapport) {
    return { title: "Rapport introuvable" };
  }
  return {
    title: `${rapport.titre}`,
    description: rapport.resume,
    alternates: { canonical: `/observatoire/rapports/${trimestre}` },
    openGraph: {
      title: rapport.titre,
      description: rapport.resume,
      type: "article",
      publishedTime: rapport.datePublicationISO,
      authors: ["Lucas Horville"],
    },
  };
}

export default async function RapportPage({
  params,
}: {
  params: Promise<{ trimestre: string }>;
}) {
  const { trimestre } = await params;
  const rapport = RAPPORTS[trimestre];
  if (!rapport) notFound();

  const reportJsonLd = {
    "@context": "https://schema.org",
    "@type": "Report",
    name: rapport.titre,
    description: rapport.resume,
    datePublished: rapport.datePublicationISO,
    url: `${BASE_URL}/observatoire/rapports/${trimestre}`,
    author: {
      "@type": "Person",
      name: "Lucas Horville",
      url: `${BASE_URL}/auteur/lucas-horville`,
    },
    publisher: {
      "@type": "Organization",
      name: "RoullePro",
      url: BASE_URL,
    },
    inLanguage: "fr",
    about: {
      "@type": "Thing",
      name: "Transport sanitaire en France",
    },
    license: "https://creativecommons.org/licenses/by-sa/4.0/",
    isPartOf: {
      "@type": "Dataset",
      name: "Observatoire du transport sanitaire — RoullePro",
      url: `${BASE_URL}/observatoire`,
    },
  };

  const newsArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: rapport.titre,
    description: rapport.resume,
    datePublished: rapport.datePublicationISO,
    dateModified: rapport.datePublicationISO,
    url: `${BASE_URL}/observatoire/rapports/${trimestre}`,
    author: {
      "@type": "Person",
      name: "Lucas Horville",
    },
    publisher: {
      "@type": "Organization",
      name: "RoullePro",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo-roullepro-circle.png`,
      },
    },
    articleSection: "Observatoire",
    inLanguage: "fr",
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { label: "Accueil", href: "/" },
    { label: "Observatoire", href: "/observatoire" },
    {
      label: `Rapport ${rapport.trimestre}`,
      href: `/observatoire/rapports/${trimestre}`,
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(reportJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(newsArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbJsonLd) }}
      />

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Fil d'ariane */}
        <nav aria-label="Fil d'ariane" className="text-sm text-gray-500 mb-6">
          <ol className="flex items-center flex-wrap gap-2">
            <li>
              <Link href="/" className="hover:text-blue-700 transition">
                Accueil
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href="/observatoire"
                className="hover:text-blue-700 transition"
              >
                Observatoire
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-700 font-medium">
              Rapport {rapport.trimestre}
            </li>
          </ol>
        </nav>

        {/* Badge */}
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
            Observatoire — {rapport.trimestre}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {rapport.titre}
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span>Publié le {rapport.datePublication}</span>
          <span>•</span>
          <span>Auteur : Lucas Horville, RoullePro</span>
        </div>

        <p className="text-lg text-gray-600 mb-10 border-l-4 border-blue-500 pl-4">
          {rapport.resume}
        </p>

        {/* Section 1 : Dépenses AM */}
        <section className="mb-10" aria-labelledby="depenses-titre">
          <h2
            id="depenses-titre"
            className="text-2xl font-semibold text-gray-800 mb-4"
          >
            1. Dépenses d'Assurance maladie : 6,74 milliards d'euros en 2024
          </h2>
          <p className="text-gray-700 mb-3">
            Selon le rapport Charges et Produits 2026 de la Caisse nationale
            d'Assurance maladie (CNAM), les dépenses de transport sanitaire
            remboursées par l'Assurance maladie ont atteint{" "}
            <strong>6,74 milliards d'euros en 2024</strong>, soit une hausse de
            45 % par rapport à 2019. Ce montant se décompose en :
          </p>
          <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-4">
            <li>
              <strong>3,67 milliards d'euros</strong> pour les transporteurs
              sanitaires (ambulances et VSL)
            </li>
            <li>
              <strong>3,07 milliards d'euros</strong> pour les taxis
              conventionnés CPAM (+45 % depuis 2019)
            </li>
          </ul>
          <p className="text-gray-700 mb-3">
            La DREES (Direction de la recherche, des études, de l'évaluation et
            des statistiques) évalue la consommation de transports sanitaires en
            ambulatoire à{" "}
            <strong>6,9 milliards d'euros en 2024 en valeur totale</strong>
            (incluant la part patient), en hausse de 2,3 % sur un an. La charge
            de l'Assurance maladie s'établit à 6,15 milliards d'euros, soit{" "}
            <strong>93,2 % du total</strong> — les patients en ALD (affections
            de longue durée) bénéficiant d'une prise en charge à 100 % et
            représentant 90,4 % de la dépense en 2023.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-900">
            <p className="font-semibold mb-2">Points de repère historiques</p>
            <ul className="space-y-1">
              <li>2016 : 4,4 Md€ (base)</li>
              <li>2019 : 4,65 Md€ (avant pandémie)</li>
              <li>2022 : 6,0 Md€ (+36 % vs 2019)</li>
              <li>2023 : 6,3 Md€ (+9 % en un an)</li>
              <li>
                <strong>2024 : 6,74 Md€ (+7 % en un an)</strong>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 2 : Professionnels */}
        <section className="mb-10" aria-labelledby="pros-titre">
          <h2
            id="pros-titre"
            className="text-2xl font-semibold text-gray-800 mb-4"
          >
            2. Le secteur en chiffres : 5 200 entreprises de transport
            sanitaire, 40 000 taxis conventionnés
          </h2>
          <p className="text-gray-700 mb-3">
            D'après les données FNAP (Fédération Nationale des Ambulanciers
            Privés) publiées en 2024, on dénombrait en 2023 :
          </p>
          <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-4">
            <li>
              <strong>5 212 transporteurs sanitaires</strong> possédant 14 772
              ambulances et 14 285 VSL
            </li>
            <li>
              <strong>28 916 entreprises de taxis</strong> conventionnées CPAM
              possédant <strong>40 132 taxis conventionnés</strong>
            </li>
          </ul>
          <p className="text-gray-700 mb-3">
            En 2025, ces chiffres sont restés relativement stables mais le
            secteur ambulancier a subi des turbulences importantes : selon{" "}
            <em>Le Monde</em> (février 2026), les redressements et liquidations
            judiciaires ont{" "}
            <strong>
              plus que doublé entre 2024 et 2025, concernant 180 entreprises
              d'ambulances sur moins de 5 000
            </strong>
            . La Banque de France recense 4 435 entreprises dans le secteur
            sanitaire (code NAF 8621Z) pour 2024.
          </p>
          <p className="text-gray-700">
            Le secteur emploie environ{" "}
            <strong>30 000 salariés dans les entreprises de taxis</strong>{" "}
            (source Le Monde, mai 2025) et plus de 60 000 personnels pour
            l'ensemble du transport sanitaire (ambulanciers DEA, auxiliaires,
            chauffeurs VSL).
          </p>
        </section>

        {/* Section 3 : Réformes */}
        <section className="mb-10" aria-labelledby="reformes-titre">
          <h2
            id="reformes-titre"
            className="text-2xl font-semibold text-gray-800 mb-4"
          >
            3. Les grandes réformes 2025-2027 en cours
          </h2>

          <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-6">
            3.1 Transport partagé obligatoire (décret n° 2025-202)
          </h3>
          <p className="text-gray-700 mb-3">
            En application de l'article 69 de la LFSS 2024, le décret n°
            2025-202 du 28 février 2025 a rendu le transport partagé
            obligatoire pour les patients en soins itératifs transportés en VSL
            ou taxi conventionné, <strong>depuis le 1er avril 2025</strong>. Le
            refus non justifié médicalement entraîne la perte du tiers payant.
            Les objectifs fixés par l'Assurance maladie sont :
          </p>
          <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-4">
            <li>Fin 2024 : 30 % des trajets éligibles partagés</li>
            <li>Fin 2025 : 45 %</li>
            <li>
              <strong>Fin 2026 : objectif supérieur à 50 %</strong>
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-6">
            3.2 Nouvelle convention-cadre taxi CPAM (mai 2025)
          </h3>
          <p className="text-gray-700 mb-3">
            La nouvelle convention-cadre entre la CNAM et les taxis
            conventionnés est entrée en vigueur le{" "}
            <strong>1er novembre 2025</strong>. Elle instaure un forfait unique
            de prise en charge de <strong>13 euros</strong> incluant les quatre
            premiers kilomètres, puis un tarif kilométrique uniformisé par
            département (en baisse dans de nombreux territoires). Objectif CNAM
            : 150 millions d'euros d'économies sur les taxis à l'horizon 2027.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-6">
            3.3 Protocole de maîtrise des dépenses ambulances/VSL (septembre
            2025)
          </h3>
          <p className="text-gray-700 mb-3">
            Signé le 24 septembre 2025 et approuvé par arrêté au Journal
            Officiel du 30 septembre 2025, le protocole entre la CNAM,
            l'UNOCAM et les fédérations d'ambulanciers vise{" "}
            <strong>150 millions d'euros d'économies sur 2025-2027</strong>.
            Chronique prévisionnelle : 43 M€ en 2025, 111 M€ en 2026, 2 M€ en
            2027. Les leviers incluent la substitution ambulance → VSL (+2 %
            des trajets), l'extension du transport partagé et la certification
            SEFi.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-6">
            3.4 SEFi : facturation électronique obligatoire au 1er janvier 2027
          </h3>
          <p className="text-gray-700 mb-3">
            Le système de facturation électronique SEFi (avec géolocalisation
            GPS certifiée par l'Assurance maladie) devient obligatoire pour
            tous les transporteurs sanitaires conventionnés au{" "}
            <strong>1er janvier 2027</strong>. Les transporteurs déjà équipés
            bénéficient de tarifs préférentiels sur le transport partagé dès
            2025.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-6">
            3.5 Arrêté technique ambulances (20 avril 2026)
          </h3>
          <p className="text-gray-700">
            Un arrêté du 20 avril 2026 met à jour les caractéristiques
            techniques réglementaires des ambulances. Les transporteurs ont
            jusqu'au{" "}
            <strong>25 avril 2028</strong> pour mettre leur flotte en
            conformité.
          </p>
        </section>

        {/* Section 4 : Régions sous-dotées */}
        <section className="mb-10" aria-labelledby="regions-titre">
          <h2
            id="regions-titre"
            className="text-2xl font-semibold text-gray-800 mb-4"
          >
            4. Régions sous-dotées en transport sanitaire
          </h2>
          <p className="text-gray-700 mb-3">
            La densité de professionnels du transport sanitaire varie
            significativement selon les territoires. Les données RoullePro (base
            SIRENE/FINESS, 26 000+ fiches actives) permettent d'identifier
            plusieurs territoires en tension structurelle :
          </p>
          <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Creuse (23), Lozère (48), Ariège (09)</strong> :
              densités inférieures à la moitié de la moyenne nationale, avec
              des zones rurales sans transporteur conventionné dans un rayon
              de 30 km.
            </li>
            <li>
              <strong>Mayotte (976)</strong> : couverture très insuffisante au
              regard de la croissance démographique, avec moins de 5 entreprises
              de transport sanitaire conventionné référencées.
            </li>
            <li>
              <strong>Seine-Saint-Denis (93)</strong> : paradoxe de la
              densité — nombre élevé de professionnels mais saturation de la
              demande liée à la concentration de patients en ALD et à la
              prévalence des pathologies chroniques.
            </li>
            <li>
              <strong>Guyane (973)</strong> : couverture limitée aux centres
              urbains (Cayenne, Saint-Laurent), vaste territoire non desservi.
            </li>
          </ul>
          <p className="text-gray-700">
            Le pacte de lutte contre les déserts médicaux, présenté par le
            gouvernement en avril 2025, identifie 153 zones prioritaires mais
            ne prévoit pas de dispositif spécifique pour le transport sanitaire,
            qui reste soumis aux dynamiques économiques conventionnelles.
          </p>
        </section>

        {/* Section 5 : Projections */}
        <section className="mb-10" aria-labelledby="projections-titre">
          <h2
            id="projections-titre"
            className="text-2xl font-semibold text-gray-800 mb-4"
          >
            5. Projections 2026-2027
          </h2>
          <p className="text-gray-700 mb-3">
            L'Assurance maladie vise une <strong>stabilisation</strong> voire
            une légère baisse des dépenses de transport sanitaire à partir de
            2026, après une décennie de croissance ininterrompue. Les
            principales hypothèses :
          </p>
          <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Effet transport partagé</strong> : si l'objectif de 50 %
              de trajets partagés est atteint fin 2026, l'économie annuelle
              estimée par la CNAM est de 70 à 80 M€ sur les seuls VSL et taxis.
            </li>
            <li>
              <strong>Baisse des tarifs taxis</strong> : la convention-cadre
              de novembre 2025 devrait générer 100 à 120 M€ d'économies
              effectives en 2026, selon la CNAM.
            </li>
            <li>
              <strong>Risque de désertification accrue</strong> : la compression
              des tarifs fragilise les petites entreprises artisanales. Le
              scénario défavorable verrait 500 à 800 entreprises de taxis
              conventionnés cesser leur activité sanitaire d'ici fin 2027.
            </li>
            <li>
              <strong>SEFi comme outil de contrôle</strong> : l'obligation de
              facturation électronique dès janvier 2027 permettra à la CNAM de
              renforcer le contrôle des facturations, avec un gain estimé de
              50 à 70 M€/an sur la lutte contre la fraude.
            </li>
          </ul>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-900">
            <p className="font-semibold mb-1">Note méthodologique</p>
            <p>
              Les projections ci-dessus sont issues de l'agrégation des
              objectifs officiels CNAM, des données de la Fondation IFRAP et du
              rapport Charges et Produits 2026. Elles sont données à titre
              indicatif et peuvent évoluer selon les négociations
              conventionnelles à venir.
            </p>
          </div>
        </section>

        {/* Sources */}
        <section className="mb-10" aria-labelledby="sources-titre">
          <h2
            id="sources-titre"
            className="text-xl font-semibold text-gray-800 mb-4"
          >
            Sources utilisées
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {rapport.sources.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Navigation retour */}
        <div className="pt-6 border-t border-gray-200">
          <Link
            href="/observatoire"
            className="text-blue-700 hover:text-blue-800 text-sm font-medium"
          >
            Retour à l'Observatoire
          </Link>
        </div>
      </main>
    </>
  );
}
