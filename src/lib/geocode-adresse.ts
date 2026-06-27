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

export type GeocodeAdresseResult = {
  latitude: number;
  longitude: number;
  departement: string; // ex "76" ou "2A" / "2B"
  code_postal: string | null;
  ville: string | null;
  score: number;
  label: string;
};

/**
 * Extrait un code departement (2 ou 3 caracteres) a partir d'un code postal FR.
 * - 97XXX -> "97X" (DROM/COM, ex 97400 -> "974")
 * - 98XXX -> "98X" (Polynesie/Wallis, ex 98800 -> "988")
 * - 20XXX -> "2A" / "2B" selon la borne (Corse)
 * - sinon les 2 premiers chiffres
 */
function codePostalToDepartement(cp: string): string | null {
  if (!/^\d{5}$/.test(cp)) return null;
  if (cp.startsWith("97") || cp.startsWith("98")) return cp.slice(0, 3);
  if (cp.startsWith("20")) {
    const n = parseInt(cp, 10);
    return n >= 20200 ? "2B" : "2A";
  }
  return cp.slice(0, 2);
}

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
    // citycode INSEE est plus fiable que postcode pour la Corse / DROM
    let departement: string | null = null;
    if (citycode && /^(\d{2}|2A|2B)/i.test(citycode)) {
      // citycode commence par 2A/2B (Corse) ou 2 chiffres / 3 chiffres pour DROM
      if (/^(2A|2B)/i.test(citycode)) {
        departement = citycode.slice(0, 2).toUpperCase();
      } else if (citycode.startsWith("97") || citycode.startsWith("98")) {
        departement = citycode.slice(0, 3);
      } else {
        departement = citycode.slice(0, 2);
      }
    } else if (cp) {
      departement = codePostalToDepartement(cp);
    }
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
