import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import AnnonceCard from '@/components/AnnonceCard';

export const revalidate = 3600;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://roullepro.com';

const CAT_META: Record<string, { title: string; description: string; h1: string }> = {
  vtc: {
    title: 'Annonces VTC professionnels à vendre',
    description: 'Achetez ou vendez des véhicules VTC (Voiture de Transport avec Chauffeur) entre professionnels. Toutes marques, tous kilométrages. Marketplace B2B RoullePro.',
    h1: 'Annonces VTC — véhicules professionnels',
  },
  taxi: {
    title: 'Annonces taxis & licences à vendre',
    description: 'Achetez ou vendez des taxis avec ou sans licence. Véhicules professionnels certifiés, entre professionnels du transport. RoullePro marketplace B2B.',
    h1: 'Annonces Taxi — véhicules et licences',
  },
  ambulance: {
    title: 'Annonces ambulances & VSL professionnels',
    description: 'Achetez ou vendez des ambulances et véhicules sanitaires légers (VSL) entre professionnels de santé. Toutes configurations sur RoullePro.',
    h1: 'Annonces Ambulance / VSL — véhicules sanitaires',
  },
  tpmr: {
    title: 'Annonces véhicules TPMR / PMR à vendre',
    description: 'Achetez ou vendez des véhicules adaptés au transport de personnes à mobilité réduite (TPMR/PMR). Rampes, élévateurs, toutes configurations.',
    h1: 'Annonces TPMR / PMR — transport personnes à mobilité réduite',
  },
  navette: {
    title: 'Annonces navettes & minibus professionnels',
    description: 'Achetez ou vendez des navettes et minibus pour transport collectif entre professionnels. Toutes capacités, toutes marques sur RoullePro.',
    h1: 'Annonces Navette / Minibus — transport collectif',
  },
  materiel: {
    title: 'Annonces matériel & équipement transport',
    description: 'Achetez ou vendez du matériel et équipement professionnel pour le transport routier. Équipements embarqués, accessoires, outillage.',
    h1: 'Annonces Matériel & Équipement — transport routier',
  },
  utilitaire: {
    title: 'Annonces véhicules utilitaires professionnels',
    description: 'Achetez ou vendez des véhicules utilitaires légers et lourds entre professionnels. PTAC, charge utile, volume. Marketplace B2B RoullePro.',
    h1: 'Annonces Véhicules Utilitaires — professionnels',
  },
};

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getCategoryData(slug: string) {
  const supabase = getSupabase();
  const [{ data: category }, { data: annonces }] = await Promise.all([
    supabase.from('categories').select('id, name, slug').eq('slug', slug).single(),
    supabase
      .from('annonces')
      .select('*, categories(id, name, slug)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(200),
  ]);

  if (!category) return null;
  const categoryAnnonces = (annonces || []).filter(
    (a: any) => a.categories?.slug === slug
  );
  return { category, annonces: categoryAnnonces };
}

export async function generateStaticParams() {
  return Object.keys(CAT_META).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const meta = CAT_META[params.slug];
  if (!meta) return { title: 'Catégorie introuvable' };

  const data = await getCategoryData(params.slug);
  const count = data?.annonces.length || 0;
  const description = count > 0
    ? `${count} annonce${count > 1 ? 's' : ''} — ${meta.description}`
    : meta.description;

  return {
    title: meta.title,
    description,
    openGraph: {
      title: `${meta.title} | RoullePro`,
      description,
      url: `${APP_URL}/annonces/categorie/${params.slug}`,
      siteName: 'RoullePro',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: meta.title, description },
    alternates: { canonical: `${APP_URL}/annonces/categorie/${params.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const meta = CAT_META[params.slug];
  if (!meta) notFound();

  const data = await getCategoryData(params.slug);
  if (!data) notFound();

  const { category, annonces } = data;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: APP_URL },
          { '@type': 'ListItem', position: 2, name: 'Annonces', item: `${APP_URL}/annonces` },
          { '@type': 'ListItem', position: 3, name: category.name, item: `${APP_URL}/annonces/categorie/${params.slug}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: meta.title,
        description: meta.description,
        url: `${APP_URL}/annonces/categorie/${params.slug}`,
        numberOfItems: annonces.length,
        itemListElement: annonces.slice(0, 10).map((a: any, idx: number) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `${APP_URL}/annonces/${a.id}`,
          name: a.title,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600">Accueil</Link>
            <span aria-hidden="true">/</span>
            <Link href="/annonces" className="hover:text-blue-600">Annonces</Link>
            <span aria-hidden="true">/</span>
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{meta.h1}</h1>
            <p className="text-gray-600">
              {annonces.length > 0
                ? `${annonces.length} annonce${annonces.length > 1 ? 's' : ''} disponible${annonces.length > 1 ? 's' : ''}`
                : 'Aucune annonce pour le moment'}
            </p>
          </div>

          {/* Grille annonces */}
          {annonces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {annonces.map((annonce: any) => (
                <AnnonceCard
                  key={annonce.id}
                  annonce={annonce}
                  isFavorite={false}
                  onToggleFavorite={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-4">
                Aucune annonce dans cette catégorie pour le moment.
              </p>
              <Link
                href="/annonces"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Voir toutes les annonces
              </Link>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-2">
              Vous vendez un {category.name} ?
            </h2>
            <p className="text-blue-100 mb-6">
              Déposez votre annonce gratuitement et touchez des milliers de professionnels du transport routier.
            </p>
            <Link
              href="/deposer-annonce"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition"
            >
              Déposer une annonce
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
