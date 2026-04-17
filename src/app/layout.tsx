import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://roullepro.com';

export const metadata: Metadata = {
  title: {
    default: 'RoullePro — Marketplace véhicules professionnels',
    template: '%s | RoullePro',
  },
  description: 'Achetez et vendez des véhicules professionnels : VTC, taxi, ambulance, TPMR, navette. La marketplace B2B du transport routier.',
  metadataBase: new URL(APP_URL),
  openGraph: {
    siteName: 'RoullePro',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
