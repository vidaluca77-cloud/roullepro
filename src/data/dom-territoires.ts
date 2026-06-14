/**
 * Donnees editoriales des pages DOM (departements et regions d'outre-mer)
 * pour le transport medical conventionne (Phase 2 SEO).
 *
 * Chaque entree alimente une page generee dynamiquement par la route
 * /transport-medical/dom/[territoire]/page.tsx. On isole les DOM dans un
 * sous-dossier /dom pour ne pas interferer avec la route dynamique existante
 * /transport-medical/[ville] (annuaire local branche sur Supabase).
 *
 * Specificite metier : outre-mer, l'Assurance Maladie est geree par la CGSS
 * (Caisse Generale de Securite Sociale) en Guadeloupe, Martinique, Guyane et
 * a La Reunion, et par la CSSM (Caisse de Securite Sociale de Mayotte) a
 * Mayotte — et non par une CPAM comme en metropole.
 */

export type DomCaisse = "CGSS" | "CSSM";

export type DomTerritoire = {
  /** Slug d'URL : /transport-medical/dom/[slug]. */
  slug: string;
  /** Nom affiche du territoire (avec accents). */
  nom: string;
  /** Region administrative. */
  region: string;
  /** Code departement (3 caracteres pour l'outre-mer). */
  dept: string;
  /** Code postal de la prefecture / racine du territoire. */
  codePostal: string;
  /** Organisme gestionnaire de l'Assurance Maladie locale. */
  caisse: DomCaisse;
  /** Libelle complet de la caisse competente. */
  caisseLibelle: string;
  /** Principales communes (ancrage editorial et maillage interne). */
  communes: string[];
  /** Population estimee du territoire. */
  population: string;
  /** Prefecture / chef-lieu. */
  prefecture: string;
  /** Principaux etablissements de sante locaux. */
  hopitaux: string[];
};

export const DOM_TERRITOIRES: DomTerritoire[] = [
  {
    slug: "reunion",
    nom: "La Réunion",
    region: "La Réunion",
    dept: "974",
    codePostal: "97400",
    caisse: "CGSS",
    caisseLibelle: "CGSS de La Réunion (Caisse Générale de Sécurité Sociale)",
    communes: ["Saint-Denis", "Saint-Pierre", "Saint-Paul", "Le Tampon", "Saint-André"],
    population: "environ 870 000 habitants",
    prefecture: "Saint-Denis",
    hopitaux: [
      "CHU de La Réunion - Félix Guyon (Saint-Denis)",
      "CHU site Sud - Saint-Pierre",
      "Groupe Hospitalier Est Réunion (Saint-Benoît)",
    ],
  },
  {
    slug: "martinique",
    nom: "La Martinique",
    region: "Martinique",
    dept: "972",
    codePostal: "97200",
    caisse: "CGSS",
    caisseLibelle: "CGSS de la Martinique (Caisse Générale de Sécurité Sociale)",
    communes: ["Fort-de-France", "Le Lamentin", "Schœlcher", "Le Robert", "Sainte-Marie"],
    population: "environ 350 000 habitants",
    prefecture: "Fort-de-France",
    hopitaux: [
      "CHU de Martinique - Pierre Zobda-Quitman (Fort-de-France)",
      "Hôpital du Lamentin",
      "Hôpital Louis Domergue (Trinité)",
    ],
  },
  {
    slug: "guadeloupe",
    nom: "La Guadeloupe",
    region: "Guadeloupe",
    dept: "971",
    codePostal: "97100",
    caisse: "CGSS",
    caisseLibelle: "CGSS de la Guadeloupe (Caisse Générale de Sécurité Sociale)",
    communes: ["Les Abymes", "Baie-Mahault", "Le Gosier", "Pointe-à-Pitre", "Petit-Bourg"],
    population: "environ 380 000 habitants",
    prefecture: "Basse-Terre",
    hopitaux: [
      "CHU de la Guadeloupe (Les Abymes)",
      "Centre Hospitalier de la Basse-Terre",
      "Centre Hospitalier Maurice Selbonne (Bouillante)",
    ],
  },
  {
    slug: "mayotte",
    nom: "Mayotte",
    region: "Mayotte",
    dept: "976",
    codePostal: "97600",
    caisse: "CSSM",
    caisseLibelle: "CSSM (Caisse de Sécurité Sociale de Mayotte)",
    communes: ["Mamoudzou", "Koungou", "Dzaoudzi", "Dembéni", "Sada"],
    population: "environ 320 000 habitants",
    prefecture: "Mamoudzou",
    hopitaux: [
      "Centre Hospitalier de Mayotte - CHM (Mamoudzou)",
      "Dispensaires et centres de référence de Kahani et Dzaoudzi",
    ],
  },
];

export function getDomTerritoire(slug: string): DomTerritoire | null {
  return DOM_TERRITOIRES.find((t) => t.slug === slug) ?? null;
}

export function getDomTerritoireSlugs(): string[] {
  return DOM_TERRITOIRES.map((t) => t.slug);
}
