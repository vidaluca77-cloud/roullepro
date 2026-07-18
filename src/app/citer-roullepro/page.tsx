import type { Metadata } from "next";
import Link from "next/link";
import { BASE_URL, jsonLdHtml, buildBreadcrumbJsonLd } from "@/lib/seo-schema";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Comment citer RoullePro — Guide pour journalistes, chercheurs et Wikipédia",
  description:
    "Formats de citation APA, Chicago, MLA et Wikipédia pour les données de l'Observatoire RoullePro, les fiches professionnelles, les guides et les alertes réglementaires. Licence CC-BY-SA 4.0.",
  alternates: { canonical: "/citer-roullepro" },
  openGraph: {
    title: "Comment citer RoullePro — Journalistes, chercheurs, Wikipédia",
    description:
      "Formats de citation officiels pour les données RoullePro. Licence CC-BY-SA 4.0.",
    type: "website",
  },
};

const today = new Date();
const dateStr = today.toLocaleDateString("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Paris",
});
const dateISO = today.toISOString().slice(0, 10);

type CitationBlock = {
  format: string;
  texte: string;
};

type Section = {
  id: string;
  titre: string;
  description: string;
  citations: CitationBlock[];
};

const SECTIONS: Section[] = [
  {
    id: "observatoire",
    titre: "Citer l'Observatoire du transport sanitaire",
    description:
      "Pour citer les données agrégées de l'Observatoire (statistiques nationales, tableaux par département, exports CSV/JSON).",
    citations: [
      {
        format: "APA",
        texte: `RoullePro. (${today.getFullYear()}). Observatoire du transport sanitaire en France [Ensemble de données]. Récupéré le ${dateStr} sur https://www.roullepro.com/observatoire`,
      },
      {
        format: "Chicago",
        texte: `RoullePro. "Observatoire du transport sanitaire en France." Mis à jour ${dateStr}. https://www.roullepro.com/observatoire.`,
      },
      {
        format: "MLA",
        texte: `RoullePro. "Observatoire du transport sanitaire en France." RoullePro, ${dateStr}, www.roullepro.com/observatoire.`,
      },
      {
        format: "Wikipédia",
        texte: `{{cite web|url=https://www.roullepro.com/observatoire|title=Observatoire du transport sanitaire en France|website=RoullePro|access-date=${dateISO}|language=fr}}`,
      },
    ],
  },
  {
    id: "fiche-pro",
    titre: "Citer une fiche professionnelle",
    description:
      "Pour citer une fiche individuelle d'ambulancier, de VSL ou de taxi conventionné. Remplacez {ville}, {categorie} et {slug} par les valeurs de l'URL.",
    citations: [
      {
        format: "APA",
        texte: `RoullePro. (${today.getFullYear()}). [Nom du professionnel] — Fiche transport sanitaire [Fiche professionnelle]. Récupéré le ${dateStr} sur https://www.roullepro.com/transport-medical/{ville}/{categorie}/{slug}`,
      },
      {
        format: "Chicago",
        texte: `RoullePro. "[Nom du professionnel] — Fiche transport sanitaire." RoullePro, ${dateStr}. https://www.roullepro.com/transport-medical/{ville}/{categorie}/{slug}.`,
      },
      {
        format: "MLA",
        texte: `RoullePro. "[Nom du professionnel]." RoullePro, ${dateStr}, www.roullepro.com/transport-medical/{ville}/{categorie}/{slug}.`,
      },
      {
        format: "Wikipédia",
        texte: `{{cite web|url=https://www.roullepro.com/transport-medical/{ville}/{categorie}/{slug}|title=[Nom du professionnel] — ambulance / VSL / taxi conventionné|website=RoullePro|access-date=${dateISO}|language=fr}}`,
      },
    ],
  },
  {
    id: "guide",
    titre: "Citer un guide pratique",
    description:
      "Pour citer un article du centre de ressources RoullePro (guides, fiches pratiques). Remplacez {slug-du-guide} par le slug de l'article.",
    citations: [
      {
        format: "APA",
        texte: `RoullePro. (${today.getFullYear()}). [Titre du guide] [Guide pratique]. Récupéré le ${dateStr} sur https://www.roullepro.com/guides/{slug-du-guide}`,
      },
      {
        format: "Chicago",
        texte: `RoullePro. "[Titre du guide]." RoullePro, ${dateStr}. https://www.roullepro.com/guides/{slug-du-guide}.`,
      },
      {
        format: "MLA",
        texte: `RoullePro. "[Titre du guide]." RoullePro, ${dateStr}, www.roullepro.com/guides/{slug-du-guide}.`,
      },
      {
        format: "Wikipédia",
        texte: `{{cite web|url=https://www.roullepro.com/guides/{slug-du-guide}|title=[Titre du guide]|website=RoullePro|access-date=${dateISO}|language=fr}}`,
      },
    ],
  },
  {
    id: "veille",
    titre: "Citer une alerte de veille réglementaire",
    description:
      "Pour citer une alerte réglementaire publiée sur RoullePro (décrets, arrêtés, circulaires). Remplacez {slug-alerte} par le slug de l'alerte.",
    citations: [
      {
        format: "APA",
        texte: `RoullePro. (${today.getFullYear()}). [Titre de l'alerte] [Alerte réglementaire]. Récupéré le ${dateStr} sur https://www.roullepro.com/veille-reglementaire/{slug-alerte}`,
      },
      {
        format: "Chicago",
        texte: `RoullePro. "[Titre de l'alerte]." Veille réglementaire RoullePro, ${dateStr}. https://www.roullepro.com/veille-reglementaire/{slug-alerte}.`,
      },
      {
        format: "MLA",
        texte: `RoullePro. "[Titre de l'alerte]." RoullePro Veille Réglementaire, ${dateStr}, www.roullepro.com/veille-reglementaire/{slug-alerte}.`,
      },
      {
        format: "Wikipédia",
        texte: `{{cite web|url=https://www.roullepro.com/veille-reglementaire/{slug-alerte}|title=[Titre de l'alerte]|website=RoullePro|access-date=${dateISO}|language=fr}}`,
      },
    ],
  },
];

const FORMAT_COLORS: Record<string, string> = {
  APA: "bg-blue-100 text-blue-800",
  Chicago: "bg-purple-100 text-purple-800",
  MLA: "bg-green-100 text-green-800",
  "Wikipédia": "bg-gray-100 text-gray-700",
};

export default function CiterRoullePro() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Comment citer RoullePro — Guide pour journalistes, chercheurs et Wikipédia",
    description:
      "Formats de citation APA, Chicago, MLA et Wikipédia pour les données RoullePro.",
    url: `${BASE_URL}/citer-roullepro`,
    publisher: {
      "@type": "Organization",
      name: "RoullePro",
      url: BASE_URL,
    },
    inLanguage: "fr",
    dateModified: today.toISOString(),
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { label: "Accueil", href: "/" },
    { label: "Citer RoullePro", href: "/citer-roullepro" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbJsonLd) }}
      />

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Fil d'ariane */}
        <nav aria-label="Fil d'ariane" className="text-sm text-gray-500 mb-6">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-blue-700 transition">
                Accueil
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-700 font-medium">Citer RoullePro</li>
          </ol>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Comment citer RoullePro
        </h1>

        <p className="text-lg text-gray-600 mb-3 max-w-2xl">
          Cette page s'adresse aux journalistes, chercheurs, étudiants et
          contributeurs Wikipédia souhaitant utiliser les données RoullePro.
          Toutes nos données sont publiées sous licence{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 underline"
          >
            CC-BY-SA 4.0
          </a>
          : vous pouvez les réutiliser librement, y compris commercialement, à
          condition de citer RoullePro et de partager sous la même licence.
        </p>

        <p className="text-sm text-gray-500 mb-10">
          Pour toute demande spécifique (interview, partenariat éditorial, accès
          données brutes), contactez-nous :{" "}
          <a
            href="mailto:presse@roullepro.com"
            className="text-blue-700 underline"
          >
            presse@roullepro.com
          </a>
        </p>

        {/* Sections de citation */}
        <div className="space-y-12">
          {SECTIONS.map((section) => (
            <section key={section.id} aria-labelledby={`titre-${section.id}`}>
              <h2
                id={`titre-${section.id}`}
                className="text-2xl font-semibold text-gray-800 mb-2"
              >
                {section.titre}
              </h2>
              <p className="text-sm text-gray-600 mb-4">{section.description}</p>
              <div className="space-y-3">
                {section.citations.map((c) => (
                  <div
                    key={c.format}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          FORMAT_COLORS[c.format] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {c.format}
                      </span>
                    </div>
                    <p className="text-sm font-mono text-gray-800 select-all whitespace-pre-wrap break-words">
                      {c.texte}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Charte d'usage de la marque */}
        <section
          className="mt-14 border-t border-gray-200 pt-10"
          aria-labelledby="charte-titre"
        >
          <h2
            id="charte-titre"
            className="text-2xl font-semibold text-gray-800 mb-4"
          >
            Charte d'usage de la marque RoullePro
          </h2>
          <div className="prose prose-gray max-w-none text-sm text-gray-700 space-y-3">
            <p>
              <strong>Nom officiel</strong> : RoullePro (R majuscule, P
              majuscule, sans espace ni trait d'union).
            </p>
            <p>
              <strong>Couleur principale</strong> : bleu (#1D4ED8 en hex,
              équivalent Tailwind <code>blue-700</code>).
            </p>
            <p>
              <strong>Mention obligatoire</strong> lors de toute réutilisation
              de données : <em>"Source : RoullePro (www.roullepro.com)"</em> avec
              lien hypertexte vers la page de la donnée citée.
            </p>
            <p>
              <strong>Logo</strong> : disponible sur demande à{" "}
              <a
                href="mailto:presse@roullepro.com"
                className="text-blue-700 underline"
              >
                presse@roullepro.com
              </a>
              . Ne pas déformer, recolorer ni utiliser sur fond similaire sans
              accord préalable.
            </p>
            <p>
              <strong>Interdictions</strong> : il est interdit de laisser
              entendre que RoullePro approuve ou cautionne un contenu tiers sans
              accord explicite écrit.
            </p>
          </div>
        </section>

        {/* Contact presse */}
        <section
          className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-6"
          aria-labelledby="contact-titre"
        >
          <h2
            id="contact-titre"
            className="text-xl font-semibold text-blue-900 mb-3"
          >
            Contact presse
          </h2>
          <p className="text-sm text-blue-800 mb-2">
            Pour toute demande journalistique, collaboration éditoriale ou
            accès aux données brutes :
          </p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              Email :{" "}
              <a
                href="mailto:presse@roullepro.com"
                className="font-semibold underline"
              >
                presse@roullepro.com
              </a>
            </li>
            <li>
              Contact général :{" "}
              <a
                href="mailto:contact@roullepro.com"
                className="underline"
              >
                contact@roullepro.com
              </a>
            </li>
            <li>
              Formulaire de contact :{" "}
              <Link href="/contact" className="underline">
                www.roullepro.com/contact
              </Link>
            </li>
          </ul>
        </section>

        {/* Lien observatoire */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/observatoire"
            className="text-blue-700 hover:text-blue-800 text-sm font-medium"
          >
            Accéder à l'Observatoire du transport sanitaire
          </Link>
        </div>
      </main>
    </>
  );
}
