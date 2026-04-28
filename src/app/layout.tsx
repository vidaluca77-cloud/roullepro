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
    default: "RoullePro — Annuaire des ambulances, VSL et taxis conventionnés en France",
    template: "%s | RoullePro",
  },
  description: "Annuaire gratuit du transport sanitaire en France : trouvez une ambulance, un VSL ou un taxi conventionné près de chez vous. Plus de 26 000 fiches avec téléphone direct, adresse et horaires. Remboursé par la Sécurité sociale.",
  keywords: [
    "ambulance",
    "VSL",
    "taxi conventionné",
    "transport sanitaire",
    "annuaire ambulance",
    "taxi CPAM",
    "transport médical",
    "ambulancier",
    "transport remboursé sécurité sociale",
  ],
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    siteName: 'RoullePro',
    locale: 'fr_FR',
    type: 'website',
    url: APP_URL,
    title: "RoullePro — Annuaire des ambulances, VSL et taxis conventionnés en France",
    description: "Annuaire gratuit du transport sanitaire : 26 000+ fiches d'ambulances, VSL et taxis conventionnés avec téléphone direct.",
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'RoullePro — Annuaire transport sanitaire',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "RoullePro — Annuaire ambulances, VSL et taxis conventionnés",
    description: "26 000+ fiches d'ambulances, VSL et taxis conventionnés en France. Téléphone direct, gratuit.",
    images: ['/android-chrome-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    other: {
      'msvalidate.01': '04B7518070BB4F3A74451EC51C01C8B7',
    },
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
      alternateName: ["Roulle Pro", "Annuaire RoullePro"],
      url: APP_URL,
      logo: APP_URL + "/android-chrome-512x512.png",
      image: APP_URL + "/android-chrome-512x512.png",
      description:
        "RoullePro est le premier annuaire francais gratuit du transport sanitaire : ambulances, VSL et taxis conventionnes. Plus de 26 000 fiches issues du registre SIRENE de l'INSEE, avec telephone direct, adresse et horaires. Service complementaire : marketplace B2B de vehicules professionnels.",
      knowsAbout: [
        "Transport sanitaire",
        "Ambulances",
        "VSL (Vehicule Sanitaire Leger)",
        "Taxi conventionne",
        "Taxi CPAM",
        "Transport medical",
        "TPMR",
        "Agrement ARS",
        "Conventionnement CPAM",
        "Remboursement Securite sociale",
      ],
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
        "Annuaire national gratuit du transport sanitaire (ambulances, VSL, taxis conventionnes) avec plus de 26 000 fiches.",
      publisher: { "@id": APP_URL + "/#organization" },
      inLanguage: "fr-FR",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: APP_URL + "/transport-medical/recherche?q={search_term_string}",
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
