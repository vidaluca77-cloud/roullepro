import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AnnonceDetail from './AnnonceDetail';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://roullepro.com';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getAnnonce(id: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('annonces')
    .select('*, profiles(*), categories(name, slug)')
    .eq('id', id)
    .eq('status', 'active')
    .single();
  return data;
}

interface PageProps {
  params: { id: string };
}

export default async function AnnonceDetailPage({ params }: PageProps) {
  const annonce = await getAnnonce(params.id);

  if (!annonce) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Annonce introuvable</p>
        <Link
          href="/annonces"
          className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Retour aux annonces
        </Link>
      </div>
    );
  }

  const vendeur = annonce.profiles || null;
  const images = annonce.images || annonce.photos || [];
  const catName = annonce.categories?.name || '';
  const catSlug = annonce.categories?.slug || '';
  const price = annonce.price ? Number(annonce.price) : null;
  const city = annonce.city || annonce.ville || '';

  /* ── JSON-LD structured data ── */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Accueil',
            item: APP_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Annonces',
            item: `${APP_URL}/annonces`,
          },
          ...(catName && catSlug
            ? [
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: catName,
                  item: `${APP_URL}/annonces/${catSlug}`,
                },
                {
                  '@type': 'ListItem',
                  position: 4,
                  name: annonce.title,
                  item: `${APP_URL}/annonces/${annonce.id}`,
                },
              ]
            : [
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: annonce.title,
                  item: `${APP_URL}/annonces/${annonce.id}`,
                },
              ]),
        ],
      },
      // Product
      {
        '@type': 'Product',
        name: annonce.title,
        description: annonce.description || `${annonce.title} — ${catName}${city ? ` à ${city}` : ''}`,
        url: `${APP_URL}/annonces/${annonce.id}`,
        ...(images.length > 0 ? { image: images } : {}),
        ...(catName ? { category: catName } : {}),
        ...(annonce.marque ? { brand: { '@type': 'Brand', name: annonce.marque } } : {}),
        additionalProperty: [
          ...(annonce.annee
            ? [{ '@type': 'PropertyValue', name: 'Année', value: String(annonce.annee) }]
            : []),
          ...(annonce.kilometrage
            ? [{ '@type': 'PropertyValue', name: 'Kilométrage', value: `${Number(annonce.kilometrage).toLocaleString('fr-FR')} km` }]
            : []),
          ...(annonce.modele
            ? [{ '@type': 'PropertyValue', name: 'Modèle', value: annonce.modele }]
            : []),
          ...(city
            ? [{ '@type': 'PropertyValue', name: 'Localisation', value: city }]
            : []),
        ],
        offers: {
          '@type': 'Offer',
          priceCurrency: 'EUR',
          ...(price
            ? { price: price.toFixed(2), priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
            : { availability: 'https://schema.org/InStock' }),
          availability: 'https://schema.org/InStock',
          url: `${APP_URL}/annonces/${annonce.id}`,
          seller: vendeur
            ? {
                '@type': 'Organization',
                name: vendeur.company_name || vendeur.entreprise || vendeur.full_name || 'Vendeur professionnel',
                ...(city ? { address: { '@type': 'PostalAddress', addressLocality: city, addressCountry: 'FR' } } : {}),
              }
            : undefined,
        },
      },
    ],
  };

  return (
    <>
      {/* JSON-LD injecté dans le <head> via script tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Contenu statique SSR visible par Google */}
      <div className="sr-only">
        <h1>{annonce.title}</h1>
        {catName && <p>Catégorie : {catName}</p>}
        {price && <p>Prix : {price.toLocaleString('fr-FR')} €</p>}
        {city && <p>Localisation : {city}</p>}
        {annonce.marque && <p>Marque : {annonce.marque}</p>}
        {annonce.modele && <p>Modèle : {annonce.modele}</p>}
        {annonce.annee && <p>Année : {annonce.annee}</p>}
        {annonce.kilometrage && <p>Kilométrage : {Number(annonce.kilometrage).toLocaleString('fr-FR')} km</p>}
        {annonce.description && <p>{annonce.description}</p>}
      </div>

      {/* Composant client pour les interactions */}
      <AnnonceDetail annonce={annonce} vendeur={vendeur} />
    </>
  );
}
