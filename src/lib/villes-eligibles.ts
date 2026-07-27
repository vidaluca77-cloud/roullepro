/**
 * Source unique des listes de villes utilisees par les generateStaticParams
 * des hubs sanitaire (/taxi-conventionne/[ville], /ambulance/[ville],
 * /vsl/[ville]) et par le sitemap.
 *
 * Un seul balayage de `pros_sanitaire_public` alimente toutes les listes : le
 * resultat est memoise au niveau du module, donc partage entre les routes
 * pre-generees pendant un meme build.
 *
 * Degradation controlee : sans credentials Supabase (ou en cas d'erreur
 * reseau), les fonctions renvoient une liste vide. Le build ne casse pas ; les
 * pages basculent simplement en ISR a la demande (`dynamicParams` reste actif).
 */

import { createClient } from "@supabase/supabase-js";
import { getVilleSeoOverride } from "./sanitaire-ville-seo";

/**
 * Seuil anti "scaled/thin content" : une page ville n'est indexable que si elle
 * recense au moins ce nombre de professionnels reels, ou si elle beneficie d'un
 * contenu editorial unique. Aligne sur le robots noindex des pages ville.
 */
export const SEUIL_INDEX_VILLE = 3;

const PAGE_SIZE = 1000;
// > 25 000 pros actifs : 40 pages de 1000 evitent toute troncature silencieuse.
const MAX_PAGES = 40;

type VilleRow = { ville_slug: string; categorie: string };

async function scanPros(): Promise<VilleRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const rows: VilleRow[] = [];
  try {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const from = page * PAGE_SIZE;
      const { data, error } = await supabase
        .from("pros_sanitaire_public")
        .select("ville_slug, categorie")
        .eq("actif", true)
        .eq("suspendu", false)
        .range(from, from + PAGE_SIZE - 1);
      if (error || !data || data.length === 0) break;
      rows.push(...(data as VilleRow[]).filter((r) => r.ville_slug));
      if (data.length < PAGE_SIZE) break;
    }
  } catch {
    return rows;
  }
  return rows;
}

let scanCache: Promise<VilleRow[]> | null = null;

function loadPros(): Promise<VilleRow[]> {
  if (!scanCache) scanCache = scanPros();
  return scanCache;
}

/**
 * Villes qui franchissent le seuil de qualite, toutes categories confondues,
 * plus celles disposant d'un contenu editorial dedie.
 */
export async function getVillesEligibles(): Promise<string[]> {
  const rows = await loadPros();
  const parVille = new Map<string, number>();
  for (const r of rows) parVille.set(r.ville_slug, (parVille.get(r.ville_slug) ?? 0) + 1);
  return Array.from(parVille.keys()).filter(
    (slug) => (parVille.get(slug) ?? 0) >= SEUIL_INDEX_VILLE || getVilleSeoOverride(slug) !== null
  );
}

/**
 * Villes comptant au moins `seuil` professionnels d'une categorie donnee.
 * `categorieKey` est la cle Supabase ("ambulance", "vsl", "taxi_conventionne").
 */
export async function getVillesAvecCategorie(categorieKey: string, seuil = 1): Promise<string[]> {
  const rows = await loadPros();
  const parVille = new Map<string, number>();
  for (const r of rows) {
    if (r.categorie !== categorieKey) continue;
    parVille.set(r.ville_slug, (parVille.get(r.ville_slug) ?? 0) + 1);
  }
  return Array.from(parVille.keys()).filter((slug) => (parVille.get(slug) ?? 0) >= seuil);
}
