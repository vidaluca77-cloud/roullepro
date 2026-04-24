import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

// Doit matcher generateSitemaps() dans src/app/sitemap.ts
// id 0 : statiques, id 1 : villes/categories sanitaire, id 2..21 : fiches sanitaire
const SITEMAP_IDS = Array.from({ length: 22 }, (_, i) => i);

export const revalidate = 3600;

export async function GET() {
  const lastmod = new Date().toISOString();
  const items = SITEMAP_IDS.map(
    (id) => `  <sitemap>
    <loc>${BASE_URL}/sitemap/${id}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>
`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
