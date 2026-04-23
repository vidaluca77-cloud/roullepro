import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getAllPosts, CATEGORIES } from '@/lib/blog';
import { CATEGORIES_SEO, VILLES_SEO } from '@/lib/seo-data';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://roullepro.com';

export const revalidate = 3600; // recalculé toutes les heures

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/annonces`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/deposer-annonce`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/comment-ca-marche`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/depot-vente`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/depot-vente/garages`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/depot-vente/estimer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/depot-vente/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...[
      "caen",
      "chelles",
      "marseille",
      "paris",
      "lyon",
      "toulouse",
      "bordeaux",
      "lille",
      "nantes",
      "rennes",
      "strasbourg",
      "montpellier",
      "nice",
      "rouen",
      "grenoble",
      "reims",
      "saint-etienne",
      "le-havre",
    ].map((ville) => ({
      url: `${BASE_URL}/depot-vente/${ville}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...[
      "renault-trafic",
      "renault-master",
      "renault-kangoo",
      "peugeot-expert",
      "peugeot-boxer",
      "citroen-jumpy",
      "citroen-berlingo",
      "fiat-ducato",
      "ford-transit",
      "mercedes-vito",
      "mercedes-sprinter",
      "iveco-daily",
    ].map((modele) => ({
      url: `${BASE_URL}/annonces/modele/${modele}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    {
      url: `${BASE_URL}/garage/inscription`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/cgu`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Pages catégories dédiées
  const { data: categories } = await supabase
    .from('categories')
    .select('slug');

  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((c) => ({
    url: `${BASE_URL}/annonces/categorie/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  // Pages annonces actives
  const { data: annonces } = await supabase
    .from('annonces')
    .select('id, updated_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1000);

  const annoncePages: MetadataRoute.Sitemap = (annonces || []).map((a) => ({
    url: `${BASE_URL}/annonces/${a.id}`,
    lastModified: new Date(a.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Articles de blog
  const blogPosts: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }));

  // Pages catégories blog
  const blogCategoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${BASE_URL}/blog/categorie/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Pages SEO programmatiques : /vehicules-pro/[categorie]
  const vehiculesProCatPages: MetadataRoute.Sitemap = CATEGORIES_SEO.map((c) => ({
    url: `${BASE_URL}/vehicules-pro/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Pages SEO programmatiques : /vehicules-pro/[categorie]/[ville]
  const vehiculesProCatVillePages: MetadataRoute.Sitemap = [];
  for (const c of CATEGORIES_SEO) {
    for (const v of VILLES_SEO) {
      vehiculesProCatVillePages.push({
        url: `${BASE_URL}/vehicules-pro/${c.slug}/${v.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });
    }
  }

  // Annuaire transport sanitaire
  const sanitaireStatic: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/transport-medical`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${BASE_URL}/transport-medical/pro`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${BASE_URL}/transport-medical/tarifs`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${BASE_URL}/transport-medical/recherche`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.6 },
  ];

  // Villes: pagination pour depasser la limite Supabase par defaut (1000)
  const villesAll: { ville_slug: string }[] = [];
  {
    let from = 0;
    const size = 1000;
    // 25 pages max = 25 000 lignes, largement suffisant
    for (let i = 0; i < 25; i += 1) {
      const { data } = await supabase
        .from('pros_sanitaire')
        .select('ville_slug')
        .range(from, from + size - 1);
      if (!data || data.length === 0) break;
      villesAll.push(...data);
      if (data.length < size) break;
      from += size;
    }
  }
  const villes = villesAll;
  const villesUniques = Array.from(new Set((villes || []).map((v: { ville_slug: string }) => v.ville_slug).filter(Boolean)));
  const sanitaireVillePages: MetadataRoute.Sitemap = villesUniques.map((slug) => ({
    url: `${BASE_URL}/transport-medical/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const categoriesSanitaire = ['ambulance', 'vsl', 'taxi-conventionne'];
  const sanitaireVilleCatPages: MetadataRoute.Sitemap = [];
  for (const slug of villesUniques) {
    for (const c of categoriesSanitaire) {
      sanitaireVilleCatPages.push({
        url: `${BASE_URL}/transport-medical/${slug}/${c}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      });
    }
  }

  // Fiches pros: pagination pour recuperer toutes les fiches
  const proSlugsAll: { slug: string; ville_slug: string; categorie: string }[] = [];
  {
    let from = 0;
    const size = 1000;
    for (let i = 0; i < 30; i += 1) {
      const { data } = await supabase
        .from('pros_sanitaire')
        .select('slug, ville_slug, categorie')
        .order('claimed', { ascending: false })
        .range(from, from + size - 1);
      if (!data || data.length === 0) break;
      proSlugsAll.push(...data);
      if (data.length < size) break;
      from += size;
    }
  }
  const proSlugs = proSlugsAll;
  const sanitaireFichePages: MetadataRoute.Sitemap = (proSlugs || []).map((p: { slug: string; ville_slug: string; categorie: string }) => ({
    url: `${BASE_URL}/transport-medical/${p.ville_slug}/${p.categorie === 'taxi_conventionne' ? 'taxi-conventionne' : p.categorie}/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...annoncePages,
    ...blogPosts,
    ...blogCategoryPages,
    ...vehiculesProCatPages,
    ...vehiculesProCatVillePages,
    ...sanitaireStatic,
    ...sanitaireVillePages,
    ...sanitaireVilleCatPages,
    ...sanitaireFichePages,
  ];
}
