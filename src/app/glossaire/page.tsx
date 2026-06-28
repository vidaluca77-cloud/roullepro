import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { jsonLdHtml, buildBreadcrumbJsonLd, BASE_URL } from "@/lib/seo-schema";
import { TERMES } from "@/lib/glossaire-data";
import GlossaireClient from "./GlossaireClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Glossaire complet du transport sanitaire — 200+ définitions | RoullePro",
  description:
    "Encyclopédie du transport sanitaire conventionné CPAM en France : tous les termes officiels (DEA, ARS, FINESS, ALD, T2A...) expliqués avec sources Légifrance.",
  alternates: { canonical: "/glossaire" },
  openGraph: {
    title: "Glossaire complet du transport sanitaire — 200+ définitions | RoullePro",
    description:
      "Encyclopédie du transport sanitaire conventionné CPAM en France : tous les termes officiels (DEA, ARS, FINESS, ALD, T2A...) expliqués avec sources Légifrance.",
    type: "website",
    locale: "fr_FR",
    url: `${BASE_URL}/glossaire`,
  },
};

export default function GlossairePage() {
  // JSON-LD : DefinedTermSet
  const definedTermSet = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${BASE_URL}/glossaire`,
    name: "Glossaire du transport sanitaire — RoullePro",
    description:
      "Encyclopédie de référence des termes officiels du transport sanitaire en France : ambulances, VSL, taxis conventionnés, réglementation ARS/CPAM, financement Assurance Maladie.",
    url: `${BASE_URL}/glossaire`,
    inLanguage: "fr",
    hasDefinedTerm: TERMES.map((t) => ({
      "@type": "DefinedTerm",
      name: t.terme,
      alternateName: t.termeComplet,
      description: t.definitionCourte,
      url: `${BASE_URL}/glossaire/${t.slug}`,
      inDefinedTermSet: `${BASE_URL}/glossaire`,
    })),
  };

  const breadcrumb = buildBreadcrumbJsonLd([
    { label: "Accueil", href: "/" },
    { label: "Glossaire", href: "/glossaire" },
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(definedTermSet) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumb) }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Fil d'Ariane">
        <ol className="flex items-center gap-1">
          <li>
            <Link href="/" className="hover:text-blue-600 transition">
              Accueil
            </Link>
          </li>
          <li className="text-gray-300">/</li>
          <li className="text-gray-700 font-medium">Glossaire</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen
            className="text-blue-600 shrink-0"
            size={28}
            aria-hidden="true"
          />
          <h1 className="text-3xl font-bold text-gray-900">
            Glossaire du transport sanitaire
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-3xl leading-relaxed">
          Encyclopédie de référence du transport sanitaire conventionné en
          France : {TERMES.length} termes officiels définis et sourcés — diplômes,
          véhicules, réglementation ARS et CPAM, financement Assurance Maladie
          et équipements techniques. Chaque définition cite la source légale
          (Légifrance, ameli.fr, code de la santé publique).
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Mise à jour : juin 2026 — Sources : Légifrance, ameli.fr, ARS, ATIH,
          INSEE
        </p>
      </header>

      {/* Interactive search + filter (client component) */}
      <GlossaireClient />

      {/* Internal links */}
      <aside className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
        <h2 className="font-semibold text-gray-800 mb-3">
          Approfondir vos connaissances
        </h2>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <li>
            <Link
              href="/transport-medical"
              className="text-blue-700 hover:underline"
            >
              Annuaire transport médical
            </Link>
          </li>
          <li>
            <Link
              href="/guides/transport-sanitaire-conformite-2026-2027"
              className="text-blue-700 hover:underline"
            >
              Guide conformité 2026-2027
            </Link>
          </li>
          <li>
            <Link href="/faq" className="text-blue-700 hover:underline">
              FAQ transport sanitaire
            </Link>
          </li>
          <li>
            <Link href="/guides" className="text-blue-700 hover:underline">
              Tous les guides
            </Link>
          </li>
          <li>
            <Link
              href="/veille-reglementaire"
              className="text-blue-700 hover:underline"
            >
              Veille réglementaire
            </Link>
          </li>
        </ul>
      </aside>

      {/* Sources block */}
      <aside
        aria-label="Sources des données"
        className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mt-6"
      >
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Sources
        </h2>
        <ul className="space-y-2 text-sm">
          {[
            {
              label: "Légifrance",
              href: "https://www.legifrance.gouv.fr",
              desc: "Textes législatifs et réglementaires (code de la santé publique, décrets, arrêtés)",
            },
            {
              label: "Assurance Maladie (ameli.fr)",
              href: "https://www.ameli.fr",
              desc: "Conventions, tarifs, conditions de remboursement",
            },
            {
              label: "Agences Régionales de Santé (ARS)",
              href: "https://www.ars.sante.fr",
              desc: "Agréments, instructions réglementaires, schémas régionaux",
            },
            {
              label: "ATIH — Référentiel FINESS",
              href: "https://finess.esante.gouv.fr",
              desc: "Identifiants des établissements et transporteurs sanitaires",
            },
            {
              label: "INSEE — Répertoire SIRENE",
              href: "https://www.sirene.fr",
              desc: "Données d'entreprise, SIRET, codes NAF",
            },
          ].map((src) => (
            <li key={src.href} className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5" aria-hidden="true">
                —
              </span>
              <span>
                <a
                  href={src.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#0066CC] hover:underline"
                >
                  {src.label}
                </a>{" "}
                <span className="text-gray-600">: {src.desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </main>
  );
}
