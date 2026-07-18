/**
 * Geocodage d'une adresse / ville libre saisie par un demandeur de transport,
 * pour deriver le departement et la ville cible et permettre au trigger
 * dispatch_demande_transport() de fan-outer la demande aux bons pros.
 *
 * Source : API Adresse FR (api-adresse.data.gouv.fr), gratuite, sans cle,
 * rate limit ~50 req/s. Toujours best-effort : si rien ne marche, renvoie null
 * sans throw.
 *
 * Garde-fous de fiabilite (le geocodage d'une saisie manuelle peut tomber dans
 * la mauvaise commune et produire une distance / estimation absurde) :
 *  - coherence code postal : si la saisie contient un CP a 5 chiffres, le
 *    departement du resultat doit correspondre a ce CP ;
 *  - biais geographique : on peut privilegier les resultats proches d'un point
 *    de reference (le depart) quand l'arrivee est saisie sans code postal ;
 *  - distance aberrante : un resultat tres eloigne du depart pour une saisie
 *    courte et sans CP est juge non fiable.
 *
 * Utilise dans :
 *  - src/app/api/demande-transport/route.ts (POST)
 */

import { codePostalToDepartement, normaliserDepartement } from "@/lib/departement";
import { distanceHaversineKm } from "@/lib/distance-course";

export type GeocodeAdresseResult = {
  latitude: number;
  longitude: number;
  departement: string; // ex "76" ou "2A" / "2B"
  code_postal: string | null;
  ville: string | null;
  score: number;
  label: string;
};

/** Options de geocodage : biais de proximite autour d'un point de reference. */
export type GeocodeOptions = {
  /** Point (le depart) autour duquel privilegier les resultats les plus proches. */
  biais?: { lat: number; lng: number } | null;
};

/** Contexte pour juger la fiabilite d'un resultat de geocodage. */
export type ContexteFiabilite = {
  /** Point de reference (le depart) pour detecter un resultat aberrant. */
  reference?: { lat: number; lng: number } | null;
};

/** Score minimum API Adresse pour accepter un resultat (0..1). */
const MIN_SCORE = 0.4;

/**
 * Au-dela de cette distance (a vol d'oiseau) entre le depart et un resultat
 * d'arrivee saisi sans code postal et court, on juge le geocodage non fiable.
 */
export const SEUIL_DISTANCE_ABERRANTE_KM = 300;

/**
 * En-deca de cette longueur, une saisie sans code postal est trop pauvre pour
 * lever l'ambiguite de commune : on lui applique le garde-fou de distance.
 */
export const LONGUEUR_SAISIE_COURTE = 40;

/**
 * Extrait un code postal francais a 5 chiffres d'une saisie libre, ou null.
 * On prend le premier bloc de 5 chiffres isole (borne par des non-chiffres).
 */
export function extraireCodePostal(query: string | null | undefined): string | null {
  const m = (query || "").match(/(?<!\d)(\d{5})(?!\d)/);
  return m ? m[1] : null;
}

/**
 * Verifie la coherence departementale entre la saisie et le resultat geocode.
 * - saisie sans code postal : coherent (rien a verifier de ce cote) ;
 * - saisie avec code postal : le departement du resultat doit correspondre au
 *   departement deduit du code postal (gere Corse 2A/2B et DROM 97x).
 */
export function departementCoherentAvecSaisie(
  query: string | null | undefined,
  departementResultat: string | null | undefined
): boolean {
  const cp = extraireCodePostal(query);
  if (!cp) return true;
  const depAttendu = codePostalToDepartement(cp);
  if (!depAttendu) return true;
  const depResultat = normaliserDepartement(departementResultat);
  if (!depResultat) return false;
  return depAttendu === depResultat;
}

/**
 * Juge si un resultat de geocodage est suffisamment fiable pour en tirer une
 * distance / estimation et une ville d'arrivee. Renvoie false si :
 *  1. la saisie contient un CP incoherent avec le departement geocode ;
 *  2. la saisie est courte, sans CP, et le resultat est tres eloigne du depart.
 */
export function geocodageEstFiable(
  query: string | null | undefined,
  result: GeocodeAdresseResult,
  contexte: ContexteFiabilite = {}
): boolean {
  // 1. Garde-fou code postal.
  if (!departementCoherentAvecSaisie(query, result.departement)) return false;

  // 2. Garde-fou distance (uniquement saisie courte sans code postal).
  const q = (query || "").trim();
  const cp = extraireCodePostal(q);
  if (!cp && contexte.reference && q.length < LONGUEUR_SAISIE_COURTE) {
    const d = distanceHaversineKm(contexte.reference, {
      lat: result.latitude,
      lng: result.longitude,
    });
    if (d > SEUIL_DISTANCE_ABERRANTE_KM) return false;
  }

  return true;
}

export async function geocodeAdresse(
  query: string,
  options: GeocodeOptions = {}
): Promise<GeocodeAdresseResult | null> {
  const q = (query || "").trim();
  if (!q) return null;
  let url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=1`;
  // Biais de proximite : l'API Adresse privilegie les resultats proches de
  // lat/lon, ce qui leve l'ambiguite de commune quand la saisie est pauvre.
  if (options.biais && Number.isFinite(options.biais.lat) && Number.isFinite(options.biais.lng)) {
    url += `&lat=${options.biais.lat}&lon=${options.biais.lng}`;
  }
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!resp.ok) return null;
    const data = (await resp.json()) as {
      features?: Array<{
        geometry?: { coordinates?: [number, number] };
        properties?: {
          score?: number;
          label?: string;
          postcode?: string;
          city?: string;
          citycode?: string;
        };
      }>;
    };
    const f = data.features?.[0];
    if (!f?.geometry?.coordinates) return null;
    const score = f.properties?.score ?? 0;
    if (score < MIN_SCORE) return null;
    const cp = f.properties?.postcode || null;
    const citycode = f.properties?.citycode || null;
    // citycode INSEE est plus fiable que postcode pour la Corse / DROM.
    const departement =
      normaliserDepartement(citycode) || codePostalToDepartement(cp);
    if (!departement) return null;
    const [lng, lat] = f.geometry.coordinates;
    return {
      latitude: lat,
      longitude: lng,
      departement,
      code_postal: cp,
      ville: f.properties?.city || null,
      score,
      label: f.properties?.label || q,
    };
  } catch {
    return null;
  }
}
