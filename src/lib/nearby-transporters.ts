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
 *
 * Priorisation business : les pros payants (plan != 'gratuit') sont mis en avant,
 * suivis des fiches reclamees (claimed = true), puis du reste par distance/ville.
 * Le champ priorite (0/1/2) sert a alimenter le badge "Verifie" dans l'UI.
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
  /** 0 = pro payant, 1 = fiche reclamee (claimed), 2 = base sans abonnement ni reclamation. */
  priorite: 0 | 1 | 2;
  /** True si la fiche merite le badge "Verifie" (priorite < 2). */
  verifie: boolean;
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
  plan: string | null;
  claimed: boolean | null;
};

const SELECT_COLUMNS =
  "slug, raison_sociale, nom_commercial, ville, ville_slug, categorie, latitude, longitude, plan, claimed";

function computePriorite(plan: string | null, claimed: boolean | null): 0 | 1 | 2 {
  if (plan && plan !== "gratuit") return 0;
  if (claimed === true) return 1;
  return 2;
}

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

/** Tri composite : priorite ASC (payants > claimed > base), puis distance ASC. */
function sortNearby(a: NearbyTransporter, b: NearbyTransporter): number {
  if (a.priorite !== b.priorite) return a.priorite - b.priorite;
  return a.distance_km - b.distance_km;
}

function mapRowToTransporter(
  r: Row,
  refLat: number | null,
  refLng: number | null
): NearbyTransporter {
  const priorite = computePriorite(r.plan, r.claimed);
  const hasGeo = r.latitude != null && r.longitude != null;
  const hasRef = refLat != null && refLng != null;
  const distance_km =
    hasGeo && hasRef
      ? Math.round(haversineKm(refLat, refLng, r.latitude as number, r.longitude as number) * 10) / 10
      : 0;
  return {
    slug: r.slug as string,
    nom: r.nom_commercial || r.raison_sociale,
    ville: r.ville ?? "",
    ville_slug: r.ville_slug as string,
    categorie: r.categorie,
    type: CATEGORIE_TO_URL_SLUG[r.categorie] ?? r.categorie,
    distance_km,
    priorite,
    verifie: priorite < 2,
  };
}

async function queryNearby(
  latitude: number,
  longitude: number,
  limit: number,
  departement: string | null,
  villeSlug: string | null
): Promise<NearbyTransporter[]> {
  // Bounding box ~30 km (1 deg lat ~= 111 km, 1 deg lng ~= 73 km a 45 deg N).
  const RAYON_KM = 30;
  const dLat = RAYON_KM / 111;
  const dLng = RAYON_KM / 73;

  const supabase = getSupabaseEtab();

  // Query A : pros dans la bounding box geographique (avec geoloc).
  const queryGeo = supabase
    .from("pros_sanitaire")
    .select(SELECT_COLUMNS)
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

  // Query B : TOUS les pros payants OU claimed du departement (meme sans geoloc).
  // Garantit que les fiches reclamees / payantes du dept remontent toujours,
  // meme si leur geoloc est absente ou hors bounding box 30 km.
  const queryPrioritaires = departement
    ? supabase
        .from("pros_sanitaire")
        .select(SELECT_COLUMNS)
        .eq("actif", true)
        .eq("suspendu", false)
        .or(PUBLIC_TAXI_FILTER)
        .in("categorie", ["taxi_conventionne", "vsl", "ambulance"])
        .eq("departement", departement)
        .or("plan.neq.gratuit,claimed.eq.true")
        .limit(200)
    : null;

  // Query C : pros payants OU claimed dans la meme ville (boost local).
  const queryVille = villeSlug
    ? supabase
        .from("pros_sanitaire")
        .select(SELECT_COLUMNS)
        .eq("actif", true)
        .eq("suspendu", false)
        .or(PUBLIC_TAXI_FILTER)
        .in("categorie", ["taxi_conventionne", "vsl", "ambulance"])
        .eq("ville_slug", villeSlug)
        .limit(50)
    : null;

  const [geoRes, prioRes, villeRes] = await Promise.all([
    queryGeo,
    queryPrioritaires ?? Promise.resolve({ data: [] }),
    queryVille ?? Promise.resolve({ data: [] }),
  ]);

  const rowsGeo = ((geoRes.data ?? []) as Row[]).filter((r) => r.slug && r.ville_slug);
  const rowsPrio = ((prioRes.data ?? []) as Row[]).filter((r) => r.slug && r.ville_slug);
  const rowsVille = ((villeRes.data ?? []) as Row[]).filter((r) => r.slug && r.ville_slug);

  // Deduplication par slug (un pro peut etre dans plusieurs queries).
  const dedup = new Map<string, Row>();
  for (const r of [...rowsPrio, ...rowsVille, ...rowsGeo]) {
    if (!dedup.has(r.slug as string)) dedup.set(r.slug as string, r);
  }

  return Array.from(dedup.values())
    .map((r) => mapRowToTransporter(r, latitude, longitude))
    .sort(sortNearby)
    .slice(0, limit);
}

// Fallback : aucune geoloc dispo cote etablissement -> on liste les transporteurs
// conventionnes par ville_slug, puis par departement, sans distance.
async function queryFallbackVilleDept(
  villeSlug: string | null,
  departement: string | null,
  limit: number
): Promise<NearbyTransporter[]> {
  const supabase = getSupabaseEtab();

  async function run(filterCol: "ville_slug" | "departement", filterVal: string) {
    const { data } = await supabase
      .from("pros_sanitaire")
      .select(SELECT_COLUMNS)
      .eq("actif", true)
      .eq("suspendu", false)
      .or(PUBLIC_TAXI_FILTER)
      .in("categorie", ["taxi_conventionne", "vsl", "ambulance"])
      .eq(filterCol, filterVal)
      .limit(limit * 5);
    const rows = (data ?? []) as Row[];
    return rows
      .filter((r) => r.slug && r.ville_slug)
      .map<NearbyTransporter>((r) => {
        const priorite = computePriorite(r.plan, r.claimed);
        return {
          slug: r.slug as string,
          nom: r.nom_commercial || r.raison_sociale,
          ville: r.ville ?? "",
          ville_slug: r.ville_slug as string,
          categorie: r.categorie,
          type: CATEGORIE_TO_URL_SLUG[r.categorie] ?? r.categorie,
          distance_km: 0,
          priorite,
          verifie: priorite < 2,
        };
      })
      .sort(sortNearby)
      .slice(0, limit);
  }

  if (villeSlug) {
    const byVille = await run("ville_slug", villeSlug);
    if (byVille.length > 0) return byVille;
  }
  if (departement) {
    return await run("departement", departement);
  }
  return [];
}

/**
 * Retourne les transporteurs conventionnes proches d'un etablissement, tries
 * par priorisation business (payants > claimed > base) puis distance croissante.
 * Mise en cache 1 jour (cle nearby-transporters-v4:{slug}).
 *
 * Fallback : si l'etablissement n'a pas de geoloc (cas frequent sur le referentiel
 * FINESS importe sans lat/lng), on liste les transporteurs par ville_slug puis
 * par departement. La distance est alors 0 (l'UI doit traiter ce cas en masquant
 * la mention km).
 */
export async function getNearbyTransporters(
  latitude: number | null,
  longitude: number | null,
  etablissementSlug: string,
  limit = 10,
  villeSlug: string | null = null,
  departement: string | null = null
): Promise<NearbyTransporter[]> {
  const load = unstable_cache(
    async () => {
      if (latitude != null && longitude != null) {
        const nearby = await queryNearby(latitude, longitude, limit, departement, villeSlug);
        if (nearby.length > 0) return nearby;
      }
      return queryFallbackVilleDept(villeSlug, departement, limit);
    },
    ["nearby-transporters-v4", etablissementSlug, String(limit)],
    { revalidate: 86400, tags: [`nearby-transporters:${etablissementSlug}`] }
  );
  return load();
}
