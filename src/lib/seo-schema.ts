/**
 * Helpers SEO partagés (Phase A) : URL canonique avec www + JSON-LD réutilisables.
 *
 * BASE_URL est figé sur le domaine canonique avec www (cohérent avec le sitemap
 * et les pages villes), distinct de NEXT_PUBLIC_APP_URL qui peut varier en preview.
 */

export const BASE_URL = "https://www.roullepro.com";

export type BreadcrumbItem = { label: string; href: string };

/**
 * Sérialise un objet JSON-LD pour injection via dangerouslySetInnerHTML.
 * Échappe `<` (et `>` par symétrie) pour empêcher toute fermeture prématurée
 * de la balise <script> si un champ (ex nom_affichage) contient ces caractères.
 */
export function jsonLdHtml(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

/** Préfixe une URL relative avec BASE_URL ; laisse les URLs absolues intactes. */
function toAbsolute(href: string): string {
  if (href.startsWith("http")) return href;
  return `${BASE_URL}${href.startsWith("/") ? href : `/${href}`}`;
}

/**
 * BreadcrumbList JSON-LD pour le fil d'Ariane enrichi Google.
 * Positions 1..N, URLs absolues préfixées BASE_URL.
 */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: toAbsolute(item.href),
    })),
  };
}

export type MedicalBusinessInput = {
  name: string;
  url: string;
  categorie?: string | null;
  telephone?: string | null;
  ville?: string | null;
  codePostal?: string | null;
  adresse?: string | null;
  region?: string | null;
  ratingValue?: number | null;
  reviewCount?: number | null;
};

/**
 * MedicalBusiness JSON-LD pour un transporteur sanitaire
 * (ambulance / VSL / taxi conventionné). Ajoute medicalSpecialty
 * "MedicalTransport" quand la catégorie est sanitaire.
 */
export function buildMedicalBusinessJsonLd(pro: MedicalBusinessInput) {
  const isSanitaire =
    pro.categorie === "ambulance" ||
    pro.categorie === "vsl" ||
    pro.categorie === "taxi_conventionne";

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": isSanitaire ? "MedicalBusiness" : "LocalBusiness",
    name: pro.name,
    url: toAbsolute(pro.url),
    telephone: pro.telephone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: pro.adresse || undefined,
      postalCode: pro.codePostal || undefined,
      addressLocality: pro.ville || undefined,
      addressRegion: pro.region || undefined,
      addressCountry: "FR",
    },
    ...(isSanitaire ? { medicalSpecialty: "MedicalTransport" } : {}),
    ...(pro.ratingValue && pro.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: pro.ratingValue,
            reviewCount: pro.reviewCount,
          },
        }
      : {}),
  };

  return jsonLd;
}
