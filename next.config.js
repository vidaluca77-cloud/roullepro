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
  // CSP en Report-Only : surveille sans bloquer.
  // Sources autorisées identifiées par audit :
  //   - Supabase (API, Auth, Storage)
  //   - Netlify RUM (same-origin /_next/)
  //   - Next.js inline scripts/styles (unsafe-inline requis pour App Router)
  {
    key: 'Content-Security-Policy-Report-Only',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https: data: blob:",
      `connect-src 'self' https://ypgolzcibtjljfydxcun.supabase.co wss://ypgolzcibtjljfydxcun.supabase.co https://api.resend.com`,
      "font-src 'self' data:",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  images: {
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
};

module.exports = nextConfig;
