import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Activity } from "lucide-react";
import { jsonLdHtml, buildBreadcrumbJsonLd, BASE_URL } from "@/lib/seo-schema";
import { TERMES } from "@/lib/glossaire-data";
import SourcesBlock from "@/components/SourcesBlock";

export const revalidate = 3600;

export async function generateStaticParams() {
  return TERMES.map((t) => ({ slug: t.slug }));
}

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const terme = TERMES.find((t) => t.slug === params.slug);
  if (!terme) return {};

  const title = terme.abreviation
    ? `${terme.termeComplet} (${terme.abreviation}) : définition transport sanitaire`
    : `${terme.termeComplet} : définition transport sanitaire`;

  return {
    title,
    description: terme.definitionCourte,
    alternates: { canonical: `/glossaire/${terme.slug}` },
    openGraph: {
      title,
      description: terme.definitionCourte,
      type: "article",
      locale: "fr_FR",
      url: `${BASE_URL}/glossaire/${terme.slug}`,
    },
  };
}

const CATEGORIE_LABELS: Record<string, string> = {
  metier: "Métiers",
  vehicule: "Véhicules",
  reglementation: "Réglementation",
  financement: "Financement",
  medical: "Médical",
  administratif: "Administratif",
  technique: "Technique",
};

export default function GlossaireSlugPage({ params }: PageProps) {
  const terme = TERMES.find((t) => t.slug === params.slug);
  if (!terme) notFound();

  const relatedTermes = (terme.termeReliesSlug || [])
    .map((slug) => TERMES.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => t != null)
    .slice(0, 8);

  // JSON-LD : DefinedTerm
  const definedTerm = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${BASE_URL}/glossaire/${terme.slug}`,
    name: terme.terme,
    alternateName: terme.termeComplet,
    description: terme.definitionCourte,
    url: `${BASE_URL}/glossaire/${terme.slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      "@id": `${BASE_URL}/glossaire`,
      name: "Glossaire du transport sanitaire — RoullePro",
      url: `${BASE_URL}/glossaire`,
    },
    ...(terme.sourcesLegales && terme.sourcesLegales.length > 0
      ? { sameAs: terme.sourcesLegales.map((s) => s.url) }
      : {}),
  };

  const breadcrumb = buildBreadcrumbJsonLd([
    { label: "Accueil", href: "/" },
    { label: "Glossaire", href: "/glossaire" },
    { label: terme.terme, href: `/glossaire/${terme.slug}` },
  ]);

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${BASE_URL}/glossaire/${terme.slug}`,
    name: terme.termeComplet,
    description: terme.definitionCourte,
    url: `${BASE_URL}/glossaire/${terme.slug}`,
    lastReviewed: terme.miseAJour,
    inLanguage: "fr",
    mainContentOfPage: {
      "@type": "WebPageElement",
      cssSelector: ".glossaire-speakable",
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".glossaire-speakable"],
    },
    isPartOf: {
      "@type": "WebSite",
      "@id": `${BASE_URL}`,
      name: "RoullePro",
      url: BASE_URL,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      "@id": `${BASE_URL}/glossaire/${terme.slug}#breadcrumb`,
    },
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(definedTerm) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(webPage) }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Fil d'Ariane">
        <ol className="flex items-center gap-1 flex-wrap">
          <li>
            <Link href="/" className="hover:text-blue-600 transition">
              Accueil
            </Link>
          </li>
          <li className="text-gray-300">/</li>
          <li>
            <Link href="/glossaire" className="hover:text-blue-600 transition">
              Glossaire
            </Link>
          </li>
          <li className="text-gray-300">/</li>
          <li className="text-gray-700 font-medium">{terme.terme}</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium capitalize">
            {CATEGORIE_LABELS[terme.categorie] || terme.categorie}
          </span>
          {terme.abreviation && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
              Abréviation : {terme.abreviation}
            </span>
          )}
        </div>

        <div className="glossaire-speakable">
          <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-1">
            {terme.terme}
          </h1>
          <p className="text-xl text-gray-600 mb-4">{terme.termeComplet}</p>
          <p className="text-gray-700 text-lg leading-relaxed bg-blue-50 border-l-4 border-blue-400 pl-4 py-3 rounded-r-lg">
            {terme.definitionCourte}
          </p>
        </div>

        {terme.alternativesOrtho && terme.alternativesOrtho.length > 0 && (
          <p className="text-sm text-gray-500 mt-3">
            <strong>Synonymes / variantes :</strong>{" "}
            {terme.alternativesOrtho.join(", ")}
          </p>
        )}
      </header>

      {/* Définition longue */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-blue-600" aria-hidden="true" />
          Définition complète
        </h2>
        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-4">
          {terme.definitionLongue.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* Sources légales */}
      {terme.sourcesLegales && terme.sourcesLegales.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Sources légales
          </h2>
          <ul className="space-y-2">
            {terme.sourcesLegales.map((source) => (
              <li
                key={source.url}
                className="flex items-start gap-2 text-sm"
              >
                <span
                  className="text-blue-400 mt-0.5 shrink-0"
                  aria-hidden="true"
                >
                  —
                </span>
                <span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#0066CC] hover:underline"
                  >
                    {source.intitule}
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Exemples concrets */}
      {terme.exemples && terme.exemples.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Exemples concrets
          </h2>
          <ul className="space-y-2">
            {terme.exemples.map((exemple, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <span
                  className="text-green-500 mt-0.5 shrink-0 font-bold"
                  aria-hidden="true"
                >
                  {i + 1}.
                </span>
                {exemple}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Termes liés */}
      {relatedTermes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Termes liés
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedTermes.map((related) => (
              <Link
                key={related.slug}
                href={`/glossaire/${related.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-400 hover:text-blue-700 transition group"
              >
                <BookOpen
                  size={14}
                  className="text-gray-400 group-hover:text-blue-500"
                  aria-hidden="true"
                />
                <span className="font-medium">{related.terme}</span>
                <span className="text-gray-400 text-xs">
                  — {related.termeComplet.slice(0, 35)}
                  {related.termeComplet.length > 35 ? "..." : ""}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Pour aller plus loin */}
      <section className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-2xl">
        <h2 className="font-semibold text-gray-800 mb-3">
          Pour aller plus loin
        </h2>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <li>
            <Link
              href="/glossaire"
              className="text-blue-700 hover:underline"
            >
              Retour au glossaire complet
            </Link>
          </li>
          <li>
            <Link
              href="/transport-medical"
              className="text-blue-700 hover:underline"
            >
              Annuaire transport médical
            </Link>
          </li>
          <li>
            <Link href="/guides" className="text-blue-700 hover:underline">
              Guides pratiques RoullePro
            </Link>
          </li>
          <li>
            <Link href="/faq" className="text-blue-700 hover:underline">
              FAQ transport sanitaire
            </Link>
          </li>
        </ul>
      </section>

      {/* Sources block */}
      <SourcesBlock variant="guide" />

      {/* Mise à jour */}
      <p className="text-xs text-gray-400 mt-6 text-right">
        Dernière mise à jour le{" "}
        {new Date(terme.miseAJour).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
    </main>
  );
}
