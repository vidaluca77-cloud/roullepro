import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://roullepro.com';

export async function generateMetadata(): Promise<Metadata> {
  // Récupère le nombre d'annonces actives pour enrichir la description
  let count = 0;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { count: c } = await supabase
      .from('annonces')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');
    count = c || 0;
  } catch {
    // Fallback silencieux
  }

  const description = count > 0
    ? `${count} annonce${count > 1 ? 's' : ''} de véhicules professionnels : VTC, taxi, ambulance, TPMR, navette. Achetez et vendez entre professionnels du transport routier.`
    : 'Annonces de véhicules professionnels : VTC, taxi, ambulance, TPMR, navette. La marketplace B2B du transport routier.';

  return {
    title: 'Annonces véhicules professionnels',
    description,
    openGraph: {
      title: 'Annonces — RoullePro',
      description,
      url: `${APP_URL}/annonces`,
      siteName: 'RoullePro',
      images: [
        {
          url: `${APP_URL}/api/og`,
          width: 1200,
          height: 630,
          alt: 'RoullePro — Annonces véhicules professionnels',
        },
      ],
      type: 'website',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Annonces — RoullePro',
      description,
      images: [`${APP_URL}/api/og`],
    },
    alternates: {
      canonical: `${APP_URL}/annonces`,
    },
  };
}

export default function AnnoncesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
