/** @type {import('next').NextConfig} */

// Headers de sécurité injectés via Next.js headers() API.
// Netlify [[headers]] ne s'applique pas aux routes gérées par @netlify/plugin-nextjs
// (Edge Functions) — on centralise ici pour garantir leur présence sur toutes les pages.
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
  // HSTS — forcer HTTPS, 2 ans, incluant sous-domaines
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // CSP en mode enforce : bloque réellement les sources non autorisées.
  // Sources autorisées identifiées par audit :
  //   - Supabase (API, Auth, Storage)
  //   - Netlify RUM (same-origin /_next/)
  //   - Next.js inline scripts/styles (unsafe-inline requis pour App Router)
  //   - Resend (connect-src api.resend.com)
  //   - Google Tag Manager + Google Analytics (tracking marketing)
  //   - Google Ads (conversions + tag remarketing)
  //   - hCaptcha (protection anti-bot)
  //   - Stripe Checkout (frame pour formulaire de paiement hosted)
  //   - Google Maps / Places (autocomplete d'adresse des formulaires de transport)
  //   - API Adresse nationale (fallback autocomplete si Google ne charge pas)
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com https://www.gstatic.com https://maps.googleapis.com https://hcaptcha.com https://*.hcaptcha.com https://taxiconnectpro.net",
      "style-src 'self' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com",
      "img-src 'self' https: data: blob:",
      `connect-src 'self' https://ypgolzcibtjljfydxcun.supabase.co wss://ypgolzcibtjljfydxcun.supabase.co https://api.resend.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://maps.googleapis.com https://api-adresse.data.gouv.fr https://hcaptcha.com https://*.hcaptcha.com https://taxiconnectpro.net`,
      "font-src 'self' data:",
      "frame-src https://checkout.stripe.com https://hcaptcha.com https://*.hcaptcha.com https://www.google.com https://taxiconnectpro.net",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  images: {
    // Les visuels de catégorie du blog sont des SVG statiques internes (trusted).
    // contentDispositionType + CSP empêchent toute exécution de script embarqué.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ypgolzcibtjljfydxcun.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        // Appliqué sur toutes les routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Canonicalisation du domaine : redirection 301 www -> non-www (roullepro.com).
      // Unifie l'autorite du domaine et supprime les signaux divergents entre
      // les versions www / non-www (essentiel pour l'indexation et la citation IA).
      // La version non-www est la version canonique retenue (majoritaire dans le code).
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.roullepro.com' }],
        destination: 'https://roullepro.com/:path*',
        permanent: true,
      },
      // Fusion 301 : suppression du doublon /blog/transport-medical-nice qui
      // cannibalise le hub ville /transport-medical/nice (cannibalisation GSC).
      {
        source: '/blog/transport-medical-nice',
        destination: '/transport-medical/nice',
        permanent: true,
      },
      // Corse : code historique "20" -> Corse-du-Sud (2A) par défaut
      {
        source: '/transport-medical/departement/20',
        destination: '/transport-medical/departement/2A',
        permanent: true,
      },
      // Codes DOM-TOM invalides (970, 978, 980) -> page d'accueil transport médical
      // Les codes valides DOM-TOM sont : 971, 972, 973, 974, 976
      {
        source: '/transport-medical/departement/970',
        destination: '/transport-medical/departement/971',
        permanent: true,
      },
      {
        source: '/transport-medical/departement/978',
        destination: '/transport-medical/departement/976',
        permanent: true,
      },
      {
        source: '/transport-medical/departement/980',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
