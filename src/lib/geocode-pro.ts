/**
 * Geocodage best-effort des pros sanitaires a l'inscription / au claim.
 *
 * Strategie en cascade (s'arrete des qu'on a une coordonnee fiable) :
 *  1) API Adresse FR (api-adresse.data.gouv.fr) avec adresse complete
 *  2) API Recherche Entreprises (recherche-entreprises.api.gouv.fr) via SIRET
 *  3) API Adresse FR avec code postal + ville (centre de commune)
 *
 * Toujours best-effort : si rien ne marche, on renvoie null sans throw.
 * Les APIs gouv sont gratuites, sans cle, rate limit ~50 req/s.
 *
 * Utilise dans :
 *  - src/app/api/sanitaire/inscription/route.ts (apres INSERT)
 *  - src/app/api/sanitaire/claim/verify/route.ts (apres claim=true)
 */

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  source: "api_adresse_full" | "sirene_geo" | "sirene_addr+api_adresse" | "api_adresse_cp_ville";
  score?: number;
  label?: string;
};

type AdresseInput = {
  adresse?: string | null;
  code_postal?: string | null;
  ville?: string | null;
  siret?: string | null;
};

/** Score minimum API Adresse pour accepter un resultat (0..1). */
const MIN_SCORE = 0.5;

async function tryApiAdresse(query: string): Promise<GeocodeResult | null> {
  if (!query.trim()) return null;
  const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`;
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) return null;
    const data = (await resp.json()) as {
      features?: Array<{
        geometry?: { coordinates?: [number, number] };
        properties?: { score?: number; label?: string };
      }>;
    };
    const f = data.features?.[0];
    if (!f?.geometry?.coordinates) return null;
    const score = f.properties?.score ?? 0;
    if (score < MIN_SCORE) return null;
    const [lng, lat] = f.geometry.coordinates;
    return {
      latitude: lat,
      longitude: lng,
      source: "api_adresse_full",
      score,
      label: f.properties?.label,
    };
  } catch {
    return null;
  }
}

async function trySirene(siret: string): Promise<GeocodeResult | { adresse: string } | null> {
  const url = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(siret)}&page=1&per_page=1`;
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) return null;
    const data = (await resp.json()) as {
      results?: Array<{
        siege?: { latitude?: string | null; longitude?: string | null; adresse?: string | null };
        matching_etablissements?: Array<{
          latitude?: string | null;
          longitude?: string | null;
          adresse?: string | null;
        }>;
      }>;
    };
    const r = data.results?.[0];
    if (!r) return null;
    // Cherche d'abord dans matching_etablissements (le SIRET exact)
    const candidates = [...(r.matching_etablissements ?? []), ...(r.siege ? [r.siege] : [])];
    for (const e of candidates) {
      if (e.latitude && e.longitude) {
        const lat = parseFloat(e.latitude as string);
        const lng = parseFloat(e.longitude as string);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          return { latitude: lat, longitude: lng, source: "sirene_geo", label: e.adresse ?? undefined };
        }
      }
    }
    // Pas de geo mais une adresse : on relaie pour fallback api-adresse
    const e = candidates.find((c) => c.adresse);
    if (e?.adresse) return { adresse: e.adresse };
    return null;
  } catch {
    return null;
  }
}

export async function geocodePro(input: AdresseInput): Promise<GeocodeResult | null> {
  // 1) Adresse complete via API Adresse FR
  if (input.adresse) {
    const parts = [input.adresse, input.code_postal, input.ville].filter(Boolean).join(" ");
    const r = await tryApiAdresse(parts);
    if (r) return r;
  }

  // 2) SIRET via API Recherche Entreprises
  if (input.siret) {
    const r = await trySirene(input.siret);
    if (r && "latitude" in r) return r;
    // SIRENE a renvoye une adresse mais pas de coord -> on tente l'API Adresse
    if (r && "adresse" in r && r.adresse) {
      const geo = await tryApiAdresse(r.adresse);
      if (geo) return { ...geo, source: "sirene_addr+api_adresse" };
    }
  }

  // 3) Fallback : code postal + ville (centre de commune)
  if (input.code_postal && input.ville) {
    const r = await tryApiAdresse(`${input.code_postal} ${input.ville}`);
    if (r) return { ...r, source: "api_adresse_cp_ville" };
  }

  return null;
}
