import { Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import AnnoncesClient from './AnnoncesClient';

export const revalidate = 60; // ISR : revalider toutes les 60s

async function getInitialData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [{ data: categories }, { data: annonces }] = await Promise.all([
    supabase.from('categories').select('id, name, slug').order('sort_order'),
    supabase
      .from('annonces')
      .select('*, categories(id, name, slug)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(200),
  ]);

  return {
    categories: categories || [],
    annonces: annonces || [],
  };
}

interface PageProps {
  searchParams: Record<string, string>;
}

// Composant interne qui reçoit les searchParams et les données SSR
async function AnnoncesPageInner({ searchParams }: PageProps) {
  const { categories, annonces } = await getInitialData();
  return (
    <AnnoncesClient
      initialAnnonces={annonces}
      initialCategories={categories}
      initialSearch={searchParams.q || ''}
      initialCategorie={searchParams.categorie || ''}
    />
  );
}

export default function AnnoncesPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
      </div>
    }>
      <AnnoncesPageInner searchParams={searchParams} />
    </Suspense>
  );
}
