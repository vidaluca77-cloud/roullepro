/**
 * Geocodage d'une adresse / ville libre saisie par un demandeur de transport,
 * pour deriver le departement et la ville cible et permettre au trigger
 * dispatch_demande_transport() de fan-outer la demande aux bons pros.
 *
 * Source : API Adresse FR (api-adresse.data.gouv.fr), gratuite, sans cle,
 * rate limit ~50 req/s. Toujours best-effort : si rien ne marche, renvoie null
 * sans throw.
 *
 * Utilise dans :
 *  - src/app/api/demande-transport/route.ts (POST)
 */

import { codePostalToDepartement, normaliserDepartement } from "@/lib/departement";

export type GeocodeAdresseResult = {
  latitude: number;
  longitude: number;
  departement: string; // ex "76" ou "2A" / "2B"
  code_postal: string | null;
  ville: string | null;
  score: number;
  label: string;
};

/** Score minimum API Adresse pour accepter un resultat (0..1). */
const MIN_SCORE = 0.4;

export async function geocodeAdresse(query: string): Promise<GeocodeAdresseResult | null> {
  const q = (query || "").trim();
  if (!q) return null;
  const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=1`;
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
