/**
 * Recherche des transporteurs sanitaires conventionnes CPAM les plus proches
 * d'un etablissement de sante (fiches /etablissements/[slug] et
 * /transport-medical/vers/[slug]).
 *
 * Methode geo : Haversine en memoire apres un prefiltre par bounding box
 * (~30 km) cote Supabase. Pas de PostGIS requis — meme strategie que
 * getVillesVoisines (sanitaire-seo.ts), validee en prod sur pros_sanitaire.
 *
 * Le perimetre public/conventionne reutilise PUBLIC_TAXI_FILTER : les taxis ne
 * sont visibles que verifies ou reclames (conventionnes CPAM), ambulances et VSL
 * sont par nature conventionnables. Les fiches reclamees ne sont JAMAIS modifiees
 * ici : on ne fait que les lister.
 */

import { unstable_cache } from "next/cache";
import { getSupabaseEtab } from "./etablissements-data";
import { CATEGORIES_SANITAIRE, PUBLIC_TAXI_FILTER, type CategorieSanitaire } from "./sanitaire-data";

export type NearbyTransporter = {
  slug: string;
  nom: string;
  ville: string;
  ville_slug: string;
  categorie: CategorieSanitaire;
  /** Segment d'URL de la categorie : "taxi-conventionne" | "vsl" | "ambulance". */
  type: string;
  distance_km: number;
};

// categorie BDD -> segment d'URL (taxi_conventionne -> taxi-conventionne, etc.).
const CATEGORIE_TO_URL_SLUG: Record<string, string> = Object.fromEntries(
  CATEGORIES_SANITAIRE.map((c) => [c.key, c.slug])
);

const URL_SLUG_TO_LABEL: Record<string, string> = {
  "taxi-conventionne": "Taxi conventionné",
  ambulance: "Ambulance",
  vsl: "VSL",
};

/** Libelle humain pour un segment de categorie ("taxi-conventionne" -> "Taxi conventionné"). */
export function typeLabel(type: string): string {
  return URL_SLUG_TO_LABEL[type] ?? type;
}

type Row = {
  slug: string | null;
  raison_sociale: string;
  nom_commercial: string | null;
  ville: string | null;
  ville_slug: string | null;
  categorie: CategorieSanitaire;
  latitude: number | null;
  longitude: number | null;
};

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

async function queryNearby(
  latitude: number,
  longitude: number,
  limit: number
): Promise<NearbyTransporter[]> {
  // Bounding box ~30 km (1 deg lat ~= 111 km, 1 deg lng ~= 73 km a 45 deg N).
  const RAYON_KM = 30;
  const dLat = RAYON_KM / 111;
  const dLng = RAYON_KM / 73;

  const supabase = getSupabaseEtab();
  const { data } = await supabase
    .from("pros_sanitaire")
    .select(
      "slug, raison_sociale, nom_commercial, ville, ville_slug, categorie, latitude, longitude"
    )
    .eq("actif", true)
    .eq("suspendu", false)
    .or(PUBLIC_TAXI_FILTER)
    .in("categorie", ["taxi_conventionne", "vsl", "ambulance"])
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .gte("latitude", latitude - dLat)
    .lte("latitude", latitude + dLat)
    .gte("longitude", longitude - dLng)
    .lte("longitude", longitude + dLng)
    .limit(1000);

  const rows = (data ?? []) as Row[];
  return rows
    .filter((r) => r.slug && r.ville_slug && r.latitude != null && r.longitude != null)
    .map((r) => ({
      slug: r.slug as string,
      nom: r.nom_commercial || r.raison_sociale,
      ville: r.ville ?? "",
      ville_slug: r.ville_slug as string,
      categorie: r.categorie,
      type: CATEGORIE_TO_URL_SLUG[r.categorie] ?? r.categorie,
      distance_km: Math.round(haversineKm(latitude, longitude, r.latitude as number, r.longitude as number) * 10) / 10,
    }))
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, limit);
}

/**
 * Retourne les transporteurs conventionnes proches d'un etablissement, tries par
 * distance croissante. Mise en cache 1 jour (cle nearby-transporters:{slug})
 * car la requete charge jusqu'a 1000 fiches puis trie en memoire.
 */
export async function getNearbyTransporters(
  latitude: number | null,
  longitude: number | null,
  etablissementSlug: string,
  limit = 10
): Promise<NearbyTransporter[]> {
  if (latitude == null || longitude == null) return [];
  const load = unstable_cache(
    () => queryNearby(latitude, longitude, limit),
    ["nearby-transporters", etablissementSlug, String(limit)],
    { revalidate: 86400, tags: [`nearby-transporters:${etablissementSlug}`] }
  );
  return load();
}
