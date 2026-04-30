/**
 * Données et helpers partagés pour l'annuaire transport sanitaire.
 */

export type CategorieSanitaire = "ambulance" | "vsl" | "taxi_conventionne";

export const CATEGORIES_SANITAIRE: {
  slug: string;
  key: CategorieSanitaire;
  label: string;
  labelPluriel: string;
  description: string;
  icone: string;
}[] = [
  {
    slug: "ambulance",
    key: "ambulance",
    label: "Ambulance",
    labelPluriel: "Ambulances",
    description:
      "Transport médicalisé d'urgence ou programmé, réalisé par un équipage diplômé (DEA) avec matériel médical à bord.",
    icone: "ambulance",
  },
  {
    slug: "vsl",
    key: "vsl",
    label: "VSL (Véhicule Sanitaire Léger)",
    labelPluriel: "VSL",
    description:
      "Transport assis de patients en situation stable, sur prescription médicale, remboursé par la Sécurité sociale.",
    icone: "car",
  },
  {
    slug: "taxi-conventionne",
    key: "taxi_conventionne",
    label: "Taxi conventionné",
    labelPluriel: "Taxis conventionnés",
    description:
      "Taxi agréé par la CPAM pour transporter des patients assis sur prescription médicale, avec tiers payant.",
    icone: "taxi",
  },
];

export const REGIONS_MVP = [
  {
    slug: "normandie",
    nom: "Normandie",
    departements: ["14", "27", "50", "61", "76"],
  },
  {
    slug: "bretagne",
    nom: "Bretagne",
    departements: ["22", "29", "35", "56"],
  },
];

export const PLANS_SANITAIRE = [
  {
    key: "gratuit",
    nom: "Fiche gratuite",
    prix: 0,
    prixLabel: "Gratuit",
    couleur: "gray",
    avantages: [
      "Fiche visible publiquement",
      "Téléphone public cliquable",
      "Adresse et horaires",
      "Mention « Pro non vérifié »",
    ],
    cta: "Déjà actif",
  },
  {
    key: "essential",
    nom: "Essential",
    prix: 19.9,
    prixLabel: "19,90 €/mois",
    couleur: "blue",
    stripePriceEnv: "STRIPE_PRICE_SANITAIRE_ESSENTIAL",
    avantages: [
      "Badge « Pro vérifié »",
      "Galerie de 5 photos",
      "Description étendue (1000 caractères)",
      "Statistiques de vues",
      "Lien site web cliquable",
      "Horaires détaillés",
    ],
    cta: "Choisir Essential",
  },
  {
    key: "premium",
    nom: "Premium",
    prix: 39,
    prixLabel: "39 €/mois",
    couleur: "indigo",
    populaire: true,
    stripePriceEnv: "STRIPE_PRICE_SANITAIRE_PREMIUM",
    avantages: [
      "Tout Essential inclus",
      "Top 3 des résultats de ville",
      "Messagerie patients activée",
      "Badge « Recommandé »",
      "Vidéo de présentation",
      "Galerie de 20 photos",
      "Statistiques avancées",
      "Notifications temps réel",
    ],
    cta: "Choisir Premium",
  },
  {
    key: "pro_plus",
    nom: "Pro+",
    prix: 79,
    prixLabel: "79 €/mois",
    couleur: "violet",
    stripePriceEnv: "STRIPE_PRICE_SANITAIRE_PROPLUS",
    avantages: [
      "Tout Premium inclus",
      "Top 1 des résultats de ville",
      "Plusieurs utilisateurs (flotte)",
      "Alertes bons de transport",
      "API (sur demande)",
      "Support prioritaire",
    ],
    cta: "Choisir Pro+",
  },
] as const;

export function getCategorieBySlug(slug: string) {
  return CATEGORIES_SANITAIRE.find((c) => c.slug === slug);
}

export function getCategorieByKey(key: string) {
  return CATEGORIES_SANITAIRE.find((c) => c.key === key);
}

export function planDisplay(plan: string | null | undefined): { label: string; couleur: string } {
  switch (plan) {
    case "premium":
      return { label: "Premium", couleur: "indigo" };
    case "essential":
      return { label: "Vérifié", couleur: "blue" };
    case "pro_plus":
      return { label: "Pro+", couleur: "violet" };
    default:
      return { label: "Non vérifié", couleur: "gray" };
  }
}

/**
 * Filtre PostgREST pour ne montrer publiquement que :
 *  - les ambulances et VSL (toutes)
 *  - les taxis VERIFIES (verified=true) ou RECLAMES par un pro (claimed=true)
 *  - PAS les taxis importés SIRENE non-vérifiés (faux positifs : taxis non conventionnés).
 *
 * S'applique à toute requête qui liste les pros pour le grand public
 * (annuaire, recherche, autocomplete, sitemaps, compteurs, pages dept/ville).
 * NE PAS appliquer aux pages /pro et au dashboard pro.
 */
export const PUBLIC_TAXI_FILTER =
  "categorie.neq.taxi_conventionne,verified.eq.true,claimed.eq.true";

export function slugifyVille(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function deslugifyVille(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export type ProSanitaire = {
  id: string;
  siret: string;
  siren: string;
  raison_sociale: string;
  nom_commercial: string | null;
  slug: string;
  categorie: CategorieSanitaire;
  adresse: string | null;
  code_postal: string;
  ville: string;
  ville_slug: string;
  departement: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  telephone_public: string | null;
  email_public: string | null;
  site_web: string | null;
  horaires: Record<string, string> | null;
  description: string | null;
  services: string[] | null;
  photos: string[] | null;
  // Champs ADS (taxis conventionnes uniquement, art. L.3121-1 Code des transports)
  numero_ads: string | null;
  commune_ads: string | null;
  commune_ads_slug: string | null;
  zupc_communes: string[] | null;
  logo_url: string | null;
  video_url: string | null;
  claimed: boolean;
  claimed_by: string | null;
  claimed_at: string | null;
  plan: "gratuit" | "essential" | "premium" | "pro_plus";
  plan_active_until: string | null;
  vues_totales: number;
  appels_cliques: number;
  verified: boolean;
  claim_status: "none" | "en_attente_validation" | "approved" | "rejected" | null;
  justificatif_url: string | null;
  rejection_reason: string | null;
  validated_at: string | null;
  validated_by: string | null;
  created_at: string;
  updated_at: string;
};
