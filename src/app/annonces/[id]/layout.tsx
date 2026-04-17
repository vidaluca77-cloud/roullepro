import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://roullepro.com';

type Props = {
  params: { id: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: annonce } = await supabase
      .from('annonces')
      .select('title, description, price, city, images, categories(name)')
      .eq('id', params.id)
      .eq('status', 'active')
      .single();

    if (!annonce) {
      return {
        title: 'Annonce introuvable',
        description: "Cette annonce n'existe pas ou a été supprimée.",
      };
    }

    const cat = (annonce.categories as any)?.name || '';
    const price = annonce.price ? `${Number(annonce.price).toLocaleString('fr-FR')} €` : 'Prix sur demande';
    const city = annonce.city ? ` — ${annonce.city}` : '';
    const title = `${annonce.title} | ${cat}${city}`;
    const description = annonce.description
      ? annonce.description.slice(0, 160)
      : `${annonce.title} · ${cat} · ${price}${city}. Achetez ce véhicule professionnel sur RoullePro.`;

    // OG image : route /api/og dynamique
    const ogImageUrl = `${APP_URL}/api/og?id=${params.id}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${APP_URL}/annonces/${params.id}`,
        siteName: 'RoullePro',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: annonce.title,
          },
        ],
        type: 'website',
        locale: 'fr_FR',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
      },
      alternates: {
        canonical: `${APP_URL}/annonces/${params.id}`,
      },
    };
  } catch {
    return {
      title: 'RoullePro — Marketplace véhicules professionnels',
      description: 'Achetez et vendez des véhicules professionnels VTC, taxi, ambulance sur RoullePro.',
    };
  }
}

export default function AnnonceLayout({ children }: Props) {
  return <>{children}</>;
}
