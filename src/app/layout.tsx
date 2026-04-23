import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';

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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
};

// Schema.org Organization + WebSite pour signaler l'entite a Google et aux IA
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": APP_URL + "/#organization",
      name: "RoullePro",
      url: APP_URL,
      logo: APP_URL + "/android-chrome-512x512.png",
      image: APP_URL + "/android-chrome-512x512.png",
      description:
        "Premiere place de marche francaise dediee aux vehicules professionnels du transport routier : taxi, VTC, ambulance, VSL, TPMR, navette et utilitaires. Vendeurs verifies par SIRET, paiement sequestre Stripe, moderation manuelle 24h.",
      email: "contact@roullepro.com",
      telephone: "+33615472813",
      areaServed: { "@type": "Country", name: "France" },
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+33615472813",
        email: "contact@roullepro.com",
        contactType: "customer service",
        availableLanguage: ["French"],
        areaServed: "FR",
      },
    },
    {
      "@type": "WebSite",
      "@id": APP_URL + "/#website",
      url: APP_URL,
      name: "RoullePro",
      description:
        "Marketplace professionnelle des vehicules de transport : taxi, VTC, ambulance, VSL, TPMR, navette, utilitaire.",
      publisher: { "@id": APP_URL + "/#organization" },
      inLanguage: "fr-FR",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: APP_URL + "/annonces?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
