/**
 * Helpers pour construire les fragments de sitemap XML.
 * Separes par type de contenu pour generer des chunks rapides a servir.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getAllPosts, CATEGORIES } from "./blog";
import { CATEGORIES_SEO, VILLES_SEO } from "./seo-data";
import { getAllDepartementCodes } from "./departements-fr";
import { VSL_VILLES } from "../data/vsl-villes";
import { DOM_TERRITOIRES } from "../data/dom-territoires";

export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

// Supabase limite les reponses a 1000 lignes par defaut.
export const CHUNK_SIZE = 1000;

// 59 611 fiches actives / 1000 + grosse marge = 80 chunks (post Sprint 2.5 import SIRENE)
export const SANITAIRE_FICHES_CHUNKS = 80;

type SitemapEntry = {
  url: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly" | "hourly" | "always" | "never";
  priority?: number;
};

export function buildXml(entries: SitemapEntry[]): string {
  const now = new Date().toISOString();
  const urls = entries
    .map(
      (e) => `<url>
<loc>${escapeXml(e.url)}</loc>
<lastmod>${e.lastmod || now}</lastmod>
<changefreq>${e.changefreq || "weekly"}</changefreq>
<priority>${(e.priority ?? 0.5).toFixed(1)}</priority>
</url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** id 0 : pages statiques + marketplace + blog + vehicules-pro */
export async function buildStaticEntries(): Promise<SitemapEntry[]> {
  const supabase = getSupabase();

  const staticPages: SitemapEntry[] = [
    { url: BASE_URL, changefreq: "daily", priority: 1.0 },
    { url: `${BASE_URL}/annonces`, changefreq: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/deposer-annonce`, changefreq: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/comment-ca-marche`, changefreq: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/pricing`, changefreq: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, changefreq: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, changefreq: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/depot-vente`, changefreq: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/depot-vente/garages`, changefreq: "daily", priority: 0.85 },
    { url: `${BASE_URL}/depot-vente/estimer`, changefreq: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/depot-vente/faq`, changefreq: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pro`, changefreq: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/prescripteurs`, changefreq: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/partenaires`, changefreq: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/garage/inscription`, changefreq: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/cgu`, changefreq: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/mentions-legales`, changefreq: "yearly", priority: 0.3 },
  ];

  const depotVilles = [
    "caen", "chelles", "marseille", "paris", "lyon", "toulouse", "bordeaux",
    "lille", "nantes", "rennes", "strasbourg", "montpellier", "nice", "rouen",
    "grenoble", "reims", "saint-etienne", "le-havre",
  ];
  const depotVillePages: SitemapEntry[] = depotVilles.map((ville) => ({
    url: `${BASE_URL}/depot-vente/${ville}`,
    changefreq: "weekly",
    priority: 0.85,
  }));

  const modeles = [
    "renault-trafic", "renault-master", "renault-kangoo", "peugeot-expert",
    "peugeot-boxer", "citroen-jumpy", "citroen-berlingo", "fiat-ducato",
    "ford-transit", "mercedes-vito", "mercedes-sprinter", "iveco-daily",
  ];
  const modelePages: SitemapEntry[] = modeles.map((modele) => ({
    url: `${BASE_URL}/annonces/modele/${modele}`,
    changefreq: "weekly",
    priority: 0.8,
  }));

  const { data: categories } = await supabase.from("categories").select("slug");
  const categoryPages: SitemapEntry[] = (categories || []).map((c: { slug: string }) => ({
    url: `${BASE_URL}/annonces/categorie/${c.slug}`,
    changefreq: "daily",
    priority: 0.85,
  }));

  const { data: annonces } = await supabase
    .from("annonces")
    .select("id, updated_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1000);
  const annoncePages: SitemapEntry[] = (annonces || []).map(
    (a: { id: string; updated_at: string | null }) => ({
      url: `${BASE_URL}/annonces/${a.id}`,
      lastmod: new Date(a.updated_at || new Date()).toISOString(),
      changefreq: "weekly",
      priority: 0.6,
    })
  );

  const blogPosts: SitemapEntry[] = getAllPosts().map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastmod: new Date(p.date).toISOString(),
    changefreq: "monthly",
    priority: 0.65,
  }));

  const blogCategoryPages: SitemapEntry[] = CATEGORIES.map((c) => ({
    url: `${BASE_URL}/blog/categorie/${c.slug}`,
    changefreq: "weekly",
    priority: 0.6,
  }));

  const vehiculesProCatPages: SitemapEntry[] = CATEGORIES_SEO.map((c) => ({
    url: `${BASE_URL}/vehicules-pro/${c.slug}`,
    changefreq: "daily",
    priority: 0.8,
  }));

  const vehiculesProCatVillePages: SitemapEntry[] = [];
  for (const c of CATEGORIES_SEO) {
    for (const v of VILLES_SEO) {
      vehiculesProCatVillePages.push({
        url: `${BASE_URL}/vehicules-pro/${c.slug}/${v.slug}`,
        changefreq: "weekly",
        priority: 0.7,
      });
    }
  }

  const sanitaireStatic: SitemapEntry[] = [
    { url: `${BASE_URL}/transport-medical`, changefreq: "daily", priority: 0.9 },
    { url: `${BASE_URL}/transport-medical/pro`, changefreq: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/transport-medical/tarifs`, changefreq: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/transport-medical/recherche`, changefreq: "daily", priority: 0.6 },
    { url: `${BASE_URL}/transport-medical/inscription`, changefreq: "monthly", priority: 0.7 },
  ];

  // Hubs nationaux thematiques (Phase 2 SEO) : forte priorite, requetes a fort volume.
  const sanitaireHubs: SitemapEntry[] = [
    { url: `${BASE_URL}/vsl`, changefreq: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/taxi-conventionne`, changefreq: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/transport-sanitaire`, changefreq: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/ambulance-autour-de-moi`, changefreq: "weekly", priority: 0.8 },
  ];

  // Pages VSL par ville (Phase 2 SEO) : 30 grandes villes.
  const vslVilles: SitemapEntry[] = VSL_VILLES.map((v) => ({
    url: `${BASE_URL}/vsl/${v.slug}`,
    changefreq: "weekly",
    priority: 0.8,
  }));

  // Pages DOM (departements et regions d'outre-mer) : transport medical conventionne.
  const sanitaireDom: SitemapEntry[] = DOM_TERRITOIRES.map((t) => ({
    url: `${BASE_URL}/transport-medical/dom/${t.slug}`,
    changefreq: "weekly",
    priority: 0.8,
  }));

  // Pages departement (101 entrees : metropole + outre-mer)
  const sanitaireDepartements: SitemapEntry[] = getAllDepartementCodes().map((code) => ({
    url: `${BASE_URL}/transport-medical/departement/${code}`,
    changefreq: "weekly",
    priority: 0.75,
  }));

  return [
    ...staticPages,
    ...depotVillePages,
    ...modelePages,
    ...categoryPages,
    ...annoncePages,
    ...blogPosts,
    ...blogCategoryPages,
    ...vehiculesProCatPages,
    ...vehiculesProCatVillePages,
    ...sanitaireStatic,
    ...sanitaireHubs,
    ...vslVilles,
    ...sanitaireDom,
    ...sanitaireDepartements,
  ];
}

// Pagination des sitemaps FINESS : 10 000 URLs par page.
export const ETAB_CHUNK_SIZE = 10000;

/**
 * Nombre de chunks necessaires pour couvrir toutes les fiches etablissements.
 * Avec ~18 900 fiches et un chunk de 10 000, retourne 2.
 */
export async function countEtablissementsChunks(): Promise<number> {
  const supabase = getSupabase();
  const { count } = await supabase
    .from("etablissements_sante_public")
    .select("slug", { count: "exact", head: true });
  return Math.max(1, Math.ceil((count || 0) / ETAB_CHUNK_SIZE));
}

/**
 * Fiches etablissements FINESS, paginees par 10 000.
 * /etablissements/[slug]
 */
export async function buildEtablissementsEntries(chunkIndex = 0): Promise<SitemapEntry[]> {
  const supabase = getSupabase();
  const offset = chunkIndex * ETAB_CHUNK_SIZE;
  const { data } = await supabase
    .from("etablissements_sante_public")
    .select("slug, source_updated_at")
    .order("slug", { ascending: true })
    .range(offset, offset + ETAB_CHUNK_SIZE - 1);
  if (!data) return [];
  return (data as { slug: string; source_updated_at: string | null }[])
    .filter((e) => e.slug)
    .map((e) => ({
      url: `${BASE_URL}/etablissements/${e.slug}`,
      lastmod: e.source_updated_at || undefined,
      changefreq: "monthly" as const,
      priority: 0.6,
    }));
}

/**
 * Pages de conversion "transport vers [etablissement]", paginees par 10 000.
 * /transport-medical/vers/[slug]
 */
export async function buildTransportVersEntries(chunkIndex = 0): Promise<SitemapEntry[]> {
  const supabase = getSupabase();
  const offset = chunkIndex * ETAB_CHUNK_SIZE;
  const { data } = await supabase
    .from("etablissements_sante_public")
    .select("slug, source_updated_at")
    .order("slug", { ascending: true })
    .range(offset, offset + ETAB_CHUNK_SIZE - 1);
  if (!data) return [];
  return (data as { slug: string; source_updated_at: string | null }[])
    .filter((e) => e.slug)
    .map((e) => ({
      url: `${BASE_URL}/transport-medical/vers/${e.slug}`,
      lastmod: e.source_updated_at || undefined,
      changefreq: "weekly" as const,
      priority: 0.7,
    }));
}

/** Guides SEO transport sanitaire (Phase 5). */
export function buildGuidesSitemap(): SitemapEntry[] {
  const slugs = [
    "transport-sanitaire-conformite-2026-2027",
    "ambulance-reglementation-conformite-2026",
    "taxi-conventionne-convention-cpam-2025",
    "vsl-reglementation-transport-partage",
  ];

  // Phase B : pages comparatives long-tail (lastmod = date de publication).
  const comparatives = [
    "vsl-vs-taxi-conventionne",
    "ambulance-vs-vsl",
    "comment-se-faire-conventionner-cpam",
  ];

  return [
    ...slugs.map((slug) => ({
      url: `${BASE_URL}/guides/${slug}`,
      changefreq: "monthly" as const,
      priority: 0.8,
    })),
    ...comparatives.map((slug) => ({
      url: `${BASE_URL}/guides/${slug}`,
      lastmod: "2026-06-14",
      changefreq: "monthly" as const,
      priority: 0.8,
    })),
  ];
}

/** Veille reglementaire : page liste + une entree par alerte publiee */
export async function buildRegAlertsSitemap(): Promise<SitemapEntry[]> {
  const supabase = getSupabase();

  const entries: SitemapEntry[] = [
    {
      url: `${BASE_URL}/veille-reglementaire`,
      changefreq: "daily",
      priority: 0.8,
    },
  ];

  const { data } = await supabase
    .from("reg_alerts")
    .select("slug, updated_at")
    .eq("status", "published");

  if (data) {
    for (const row of data as { slug: string; updated_at: string | null }[]) {
      if (!row.slug) continue;
      entries.push({
        url: `${BASE_URL}/veille-reglementaire/${row.slug}`,
        lastmod: row.updated_at || undefined,
        changefreq: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}

/** id 1 : villes sanitaire + pages categorie/ville */
export async function buildSanitaireVillesEntries(): Promise<SitemapEntry[]> {
  const supabase = getSupabase();

  const villesAll: string[] = [];
  let from = 0;
  const size = 1000;
  for (let i = 0; i < 25; i += 1) {
    const { data } = await supabase
      .from("pros_sanitaire_public")
      .select("ville_slug")
      .eq("actif", true)
      .range(from, from + size - 1);
    if (!data || data.length === 0) break;
    villesAll.push(
      ...(data as { ville_slug: string }[]).map((r) => r.ville_slug).filter(Boolean)
    );
    if (data.length < size) break;
    from += size;
  }
  const villesUniques = Array.from(new Set(villesAll));

  // Top villes FR à fort volume de recherche : priority surélevée pour signaler
  // à Google les pages stratégiques (données DataForSEO Search Volume).
  const VILLES_TOP_FR = new Set([
    "paris", "marseille", "lyon", "toulouse", "nice", "nantes", "montpellier",
    "strasbourg", "bordeaux", "lille", "rennes", "reims", "saint-etienne",
    "toulon", "le-havre", "grenoble", "dijon", "angers", "nimes", "villeurbanne",
  ]);

  const villePages: SitemapEntry[] = villesUniques.map((slug) => ({
    url: `${BASE_URL}/transport-medical/${slug}`,
    changefreq: "daily",
    priority: VILLES_TOP_FR.has(slug) ? 0.9 : 0.75,
  }));

  const categoriesSanitaire = ["ambulance", "vsl", "taxi-conventionne"];
  const villeCatPages: SitemapEntry[] = [];
  for (const slug of villesUniques) {
    const isTopVille = VILLES_TOP_FR.has(slug);
    for (const c of categoriesSanitaire) {
      villeCatPages.push({
        url: `${BASE_URL}/transport-medical/${slug}/${c}`,
        changefreq: "weekly",
        // Pages hub locales = forte valeur SEO (cible "ambulance Paris" 1600/m)
        priority: isTopVille ? 0.85 : 0.7,
      });
    }
  }

  return [...villePages, ...villeCatPages];
}

/**
 * id 2..81 : fiches pros sanitaire paginees.
 *
 * Filtre qualite (applique en JS apres le SELECT pour ne pas toucher la vue
 * partagee `pros_sanitaire_public`) : on ne garde dans le sitemap QUE les
 * fiches qui valent le coup d'etre indexees, pour eviter de noyer Google
 * dans des fiches SIRENE brutes sans donnees enrichies.
 *
 * On garde la fiche si AU MOINS UN de ces criteres est vrai :
 *   - claimed = true (revendiquee par un pro)
 *   - verified = true (verifiee par RoullePro)
 *   - plan != 'gratuit' (vraie entreprise active sur la plateforme)
 *   - telephone_public renseigne et non vide
 *   - description renseignee, > 50 caracteres
 *
 * Sinon : EXCLUE du sitemap (fiche SIRENE brute non enrichie).
 */
export async function buildSanitaireFichesEntries(chunkIndex: number): Promise<SitemapEntry[]> {
  const supabase = getSupabase();
  const offset = chunkIndex * CHUNK_SIZE;

  const { data } = await supabase
    .from("pros_sanitaire_public")
    .select(
      "slug, ville_slug, categorie, claimed, verified, updated_at, telephone_public, description, plan"
    )
    .eq("actif", true)
    .order("id", { ascending: true })
    .range(offset, offset + CHUNK_SIZE - 1);

  if (!data || data.length === 0) return [];
  const rows = data as {
    slug: string;
    ville_slug: string;
    categorie: string;
    claimed?: boolean | null;
    verified?: boolean | null;
    updated_at?: string | null;
    telephone_public?: string | null;
    description?: string | null;
    plan?: string | null;
  }[];
  return rows
    .filter((p) => p.slug && p.ville_slug && p.categorie)
    .filter((p) => {
      const claimed = p.claimed === true;
      const verified = p.verified === true;
      const paid = !!p.plan && p.plan !== "gratuit";
      const hasPhone =
        typeof p.telephone_public === "string" && p.telephone_public.trim().length > 0;
      const hasDescription =
        typeof p.description === "string" && p.description.trim().length > 50;
      return claimed || verified || paid || hasPhone || hasDescription;
    })
    .map((p) => {
      // Fiches claimed/verified = vraies entreprises actives → priority haute, changefreq weekly
      // Fiches inactives → priority basse + changefreq monthly (signal honnête à Google)
      const isActive = p.claimed === true || p.verified === true;
      return {
        url: `${BASE_URL}/transport-medical/${p.ville_slug}/${
          p.categorie === "taxi_conventionne" ? "taxi-conventionne" : p.categorie
        }/${p.slug}`,
        lastmod: p.updated_at || undefined,
        changefreq: isActive ? ("weekly" as const) : ("monthly" as const),
        priority: isActive ? 0.8 : 0.5,
      };
    });
}
