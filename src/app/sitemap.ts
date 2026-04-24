import { MetadataRoute } from "next";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getAllPosts, CATEGORIES } from "@/lib/blog";
import { CATEGORIES_SEO, VILLES_SEO } from "@/lib/seo-data";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";
const CHUNK_SIZE = 5000;

// Nombre total de chunks pour les fiches sanitaires (estime 18 228 / 5000 = 4 chunks)
// On declare 6 pour avoir de la marge, les vides seront ignores par Google
const SANITAIRE_FICHES_CHUNKS = 6;

export const revalidate = 3600;

// Next.js va generer:
//   /sitemap.xml (index, automatique quand on utilise generateSitemaps)
//   /sitemap/0.xml, /sitemap/1.xml, etc.
export async function generateSitemaps() {
  return [
    { id: 0 }, // pages statiques + annonces + blog + vehicules-pro
    { id: 1 }, // villes sanitaire + categories ville sanitaire
    { id: 2 }, // fiches sanitaire chunk 1
    { id: 3 }, // fiches sanitaire chunk 2
    { id: 4 }, // fiches sanitaire chunk 3
    { id: 5 }, // fiches sanitaire chunk 4
    { id: 6 }, // fiches sanitaire chunk 5
    { id: 7 }, // fiches sanitaire chunk 6 (reserve)
  ];
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (id === 0) {
    return buildStaticAndCommercePages(supabase);
  }
  if (id === 1) {
    return buildSanitaireVillesAndCategories(supabase);
  }
  // id >= 2 : fiches sanitaire chunkees
  const chunkIndex = id - 2;
  return buildSanitaireFiches(supabase, chunkIndex);
}

async function buildStaticAndCommercePages(
  supabase: SupabaseClient
): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/annonces`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/deposer-annonce`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/comment-ca-marche`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/depot-vente`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/depot-vente/garages`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE_URL}/depot-vente/estimer`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/depot-vente/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pro`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/garage/inscription`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/cgu`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const depotVilles = [
    "caen", "chelles", "marseille", "paris", "lyon", "toulouse", "bordeaux",
    "lille", "nantes", "rennes", "strasbourg", "montpellier", "nice", "rouen",
    "grenoble", "reims", "saint-etienne", "le-havre",
  ];
  const depotVillePages: MetadataRoute.Sitemap = depotVilles.map((ville) => ({
    url: `${BASE_URL}/depot-vente/${ville}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const modeles = [
    "renault-trafic", "renault-master", "renault-kangoo", "peugeot-expert",
    "peugeot-boxer", "citroen-jumpy", "citroen-berlingo", "fiat-ducato",
    "ford-transit", "mercedes-vito", "mercedes-sprinter", "iveco-daily",
  ];
  const modelePages: MetadataRoute.Sitemap = modeles.map((modele) => ({
    url: `${BASE_URL}/annonces/modele/${modele}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const { data: categories } = await supabase.from("categories").select("slug");
  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((c: { slug: string }) => ({
    url: `${BASE_URL}/annonces/categorie/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  const { data: annonces } = await supabase
    .from("annonces")
    .select("id, updated_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1000);
  const annoncePages: MetadataRoute.Sitemap = (annonces || []).map((a: { id: string; updated_at: string | null }) => ({
    url: `${BASE_URL}/annonces/${a.id}`,
    lastModified: new Date(a.updated_at || new Date()),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const blogPosts: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const blogCategoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${BASE_URL}/blog/categorie/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const vehiculesProCatPages: MetadataRoute.Sitemap = CATEGORIES_SEO.map((c) => ({
    url: `${BASE_URL}/vehicules-pro/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const vehiculesProCatVillePages: MetadataRoute.Sitemap = [];
  for (const c of CATEGORIES_SEO) {
    for (const v of VILLES_SEO) {
      vehiculesProCatVillePages.push({
        url: `${BASE_URL}/vehicules-pro/${c.slug}/${v.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      });
    }
  }

  const sanitaireStatic: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/transport-medical`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE_URL}/transport-medical/pro`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${BASE_URL}/transport-medical/tarifs`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${BASE_URL}/transport-medical/recherche`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.6 },
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

async function buildSanitaireVillesAndCategories(
  supabase: SupabaseClient
): Promise<MetadataRoute.Sitemap> {
  // Recupere villes uniques (distinct via agregation cote Supabase impossible en simple select,
  // on paginera donc en recuperant les ville_slug puis on dedupe en memoire).
  const villesAll: string[] = [];
  {
    let from = 0;
    const size = 1000;
    for (let i = 0; i < 25; i += 1) {
      const { data } = await supabase
        .from("pros_sanitaire")
        .select("ville_slug")
        .eq("actif", true)
        .range(from, from + size - 1);
      if (!data || data.length === 0) break;
      villesAll.push(...(data as { ville_slug: string }[]).map((r) => r.ville_slug).filter(Boolean));
      if (data.length < size) break;
      from += size;
    }
  }
  const villesUniques = Array.from(new Set(villesAll));

  const villePages: MetadataRoute.Sitemap = villesUniques.map((slug) => ({
    url: `${BASE_URL}/transport-medical/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const categoriesSanitaire = ["ambulance", "vsl", "taxi-conventionne"];
  const villeCatPages: MetadataRoute.Sitemap = [];
  for (const slug of villesUniques) {
    for (const c of categoriesSanitaire) {
      villeCatPages.push({
        url: `${BASE_URL}/transport-medical/${slug}/${c}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      });
    }
  }

  return [...villePages, ...villeCatPages];
}

async function buildSanitaireFiches(
  supabase: SupabaseClient,
  chunkIndex: number
): Promise<MetadataRoute.Sitemap> {
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
      url: `${BASE_URL}/transport-medical/${p.ville_slug}/${p.categorie === "taxi_conventionne" ? "taxi-conventionne" : p.categorie}/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
}
