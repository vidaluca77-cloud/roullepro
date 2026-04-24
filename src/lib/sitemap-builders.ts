/**
 * Helpers pour construire les fragments de sitemap XML.
 * Separes par type de contenu pour generer des chunks rapides a servir.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getAllPosts, CATEGORIES } from "./blog";
import { CATEGORIES_SEO, VILLES_SEO } from "./seo-data";

export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

// Supabase limite les reponses a 1000 lignes par defaut.
export const CHUNK_SIZE = 1000;

// 18 228 fiches actives / 1000 + marge = 20 chunks
export const SANITAIRE_FICHES_CHUNKS = 20;

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
  ];

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
  ];
}

/** id 1 : villes sanitaire + pages categorie/ville */
export async function buildSanitaireVillesEntries(): Promise<SitemapEntry[]> {
  const supabase = getSupabase();

  const villesAll: string[] = [];
  let from = 0;
  const size = 1000;
  for (let i = 0; i < 25; i += 1) {
    const { data } = await supabase
      .from("pros_sanitaire")
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

  const villePages: SitemapEntry[] = villesUniques.map((slug) => ({
    url: `${BASE_URL}/transport-medical/${slug}`,
    changefreq: "daily",
    priority: 0.7,
  }));

  const categoriesSanitaire = ["ambulance", "vsl", "taxi-conventionne"];
  const villeCatPages: SitemapEntry[] = [];
  for (const slug of villesUniques) {
    for (const c of categoriesSanitaire) {
      villeCatPages.push({
        url: `${BASE_URL}/transport-medical/${slug}/${c}`,
        changefreq: "weekly",
        priority: 0.6,
      });
    }
  }

  return [...villePages, ...villeCatPages];
}

/** id 2..21 : fiches pros sanitaire paginees */
export async function buildSanitaireFichesEntries(chunkIndex: number): Promise<SitemapEntry[]> {
  const supabase = getSupabase();
  const offset = chunkIndex * CHUNK_SIZE;

  const { data } = await supabase
    .from("pros_sanitaire")
    .select("slug, ville_slug, categorie")
    .eq("actif", true)
    .order("id", { ascending: true })
    .range(offset, offset + CHUNK_SIZE - 1);

  if (!data || data.length === 0) return [];
  const rows = data as { slug: string; ville_slug: string; categorie: string }[];
  return rows
    .filter((p) => p.slug && p.ville_slug && p.categorie)
    .map((p) => ({
      url: `${BASE_URL}/transport-medical/${p.ville_slug}/${
        p.categorie === "taxi_conventionne" ? "taxi-conventionne" : p.categorie
      }/${p.slug}`,
      changefreq: "weekly" as const,
      priority: 0.5,
    }));
}
