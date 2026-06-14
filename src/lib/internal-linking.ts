/**
 * Maillage interne automatique (Phase C SEO).
 *
 * Fournit un fallback statique pour relier les hubs villes entre eux meme quand
 * aucune fiche Supabase de la ville n'a de coordonnees (latitude/longitude). On
 * s'appuie sur une table de coordonnees des principales villes francaises et un
 * calcul Haversine pour proposer les villes les plus proches.
 *
 * Ce module ne fait AUCUN appel reseau : il est purement statique et sans effet
 * de bord, donc reutilisable cote serveur comme cote client.
 */

import { getDepartementByCode } from "./departements-fr";

export type CityCoord = {
  /** ville_slug aligne sur Supabase / route /transport-medical/[ville]. */
  slug: string;
  /** Nom affiche (avec accents). */
  label: string;
  /** Latitude WGS84. */
  lat: number;
  /** Longitude WGS84. */
  lng: number;
  /** Code departement (2 ou 3 caracteres). */
  departement: string;
};

export type NearestCity = {
  slug: string;
  label: string;
  distanceKm: number;
};

/**
 * Coordonnees des principales villes francaises (centre-ville approximatif).
 * Source : coordonnees geographiques publiques INSEE / OpenStreetMap.
 * Le slug correspond au ville_slug utilise dans Supabase et les routes.
 */
export const CITY_COORDS: CityCoord[] = [
  { slug: "paris", label: "Paris", lat: 48.8566, lng: 2.3522, departement: "75" },
  { slug: "marseille", label: "Marseille", lat: 43.2965, lng: 5.3698, departement: "13" },
  { slug: "lyon", label: "Lyon", lat: 45.764, lng: 4.8357, departement: "69" },
  { slug: "toulouse", label: "Toulouse", lat: 43.6047, lng: 1.4442, departement: "31" },
  { slug: "nice", label: "Nice", lat: 43.7102, lng: 7.262, departement: "06" },
  { slug: "nantes", label: "Nantes", lat: 47.2184, lng: -1.5536, departement: "44" },
  { slug: "strasbourg", label: "Strasbourg", lat: 48.5734, lng: 7.7521, departement: "67" },
  { slug: "montpellier", label: "Montpellier", lat: 43.6108, lng: 3.8767, departement: "34" },
  { slug: "bordeaux", label: "Bordeaux", lat: 44.8378, lng: -0.5792, departement: "33" },
  { slug: "lille", label: "Lille", lat: 50.6292, lng: 3.0573, departement: "59" },
  { slug: "rennes", label: "Rennes", lat: 48.1173, lng: -1.6778, departement: "35" },
  { slug: "reims", label: "Reims", lat: 49.2583, lng: 4.0317, departement: "51" },
  { slug: "le-havre", label: "Le Havre", lat: 49.4944, lng: 0.1079, departement: "76" },
  { slug: "saint-etienne", label: "Saint-Étienne", lat: 45.4397, lng: 4.3872, departement: "42" },
  { slug: "toulon", label: "Toulon", lat: 43.1242, lng: 5.928, departement: "83" },
  { slug: "grenoble", label: "Grenoble", lat: 45.1885, lng: 5.7245, departement: "38" },
  { slug: "dijon", label: "Dijon", lat: 47.322, lng: 5.0415, departement: "21" },
  { slug: "angers", label: "Angers", lat: 47.4784, lng: -0.5632, departement: "49" },
  { slug: "nimes", label: "Nîmes", lat: 43.8367, lng: 4.3601, departement: "30" },
  { slug: "villeurbanne", label: "Villeurbanne", lat: 45.7719, lng: 4.8902, departement: "69" },
  { slug: "aix-en-provence", label: "Aix-en-Provence", lat: 43.5297, lng: 5.4474, departement: "13" },
  { slug: "clermont-ferrand", label: "Clermont-Ferrand", lat: 45.7772, lng: 3.087, departement: "63" },
  { slug: "brest", label: "Brest", lat: 48.3904, lng: -4.4861, departement: "29" },
  { slug: "limoges", label: "Limoges", lat: 45.8336, lng: 1.2611, departement: "87" },
  { slug: "tours", label: "Tours", lat: 47.3941, lng: 0.6848, departement: "37" },
  { slug: "amiens", label: "Amiens", lat: 49.8941, lng: 2.2958, departement: "80" },
  { slug: "perpignan", label: "Perpignan", lat: 42.6887, lng: 2.8948, departement: "66" },
  { slug: "metz", label: "Metz", lat: 49.1193, lng: 6.1757, departement: "57" },
  { slug: "besancon", label: "Besançon", lat: 47.238, lng: 6.0243, departement: "25" },
  { slug: "boulogne-billancourt", label: "Boulogne-Billancourt", lat: 48.8333, lng: 2.25, departement: "92" },
];

const COORDS_BY_SLUG = new Map(CITY_COORDS.map((c) => [c.slug, c]));

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Retourne les villes les plus proches d'une ville donnee, par distance croissante.
 * Si la ville n'est pas connue dans la table de coordonnees, retourne un tableau vide
 * (fallback gracieux : l'appelant affiche alors un lien generique vers l'annuaire).
 */
export function findNearestCities(slug: string, limit = 5): NearestCity[] {
  const origin = COORDS_BY_SLUG.get(slug);
  if (!origin) return [];

  return CITY_COORDS.filter((c) => c.slug !== origin.slug)
    .map((c) => ({
      slug: c.slug,
      label: c.label,
      distanceKm: Math.round(haversineKm(origin.lat, origin.lng, c.lat, c.lng)),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

/**
 * Deduit le departement (code + libelle) d'une ville depuis la table de coordonnees.
 * Retourne null si la ville est inconnue ou si le code departement n'est pas reference.
 */
export function getDepartmentFromVille(
  slug: string
): { code: string; nom: string } | null {
  const city = COORDS_BY_SLUG.get(slug);
  if (!city) return null;
  const dept = getDepartementByCode(city.departement);
  if (!dept) return { code: city.departement, nom: "" };
  return { code: dept.code, nom: dept.nom };
}
