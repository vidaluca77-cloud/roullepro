import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

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

  return [...staticPages, ...categoryPages, ...annoncePages];
}
