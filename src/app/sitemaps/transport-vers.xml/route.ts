import { NextResponse } from "next/server";
import { BASE_URL, countEtablissementsChunks } from "@/lib/sitemap-builders";

export const revalidate = 3600;

// Index de sitemaps : pointe vers les chunks /sitemaps/transport-vers-N.xml.
export async function GET() {
  const chunks = await countEtablissementsChunks();
  const lastmod = new Date().toISOString();
  const items = Array.from({ length: chunks }, (_, i) => `  <sitemap>
    <loc>${BASE_URL}/sitemaps/transport-vers-${i}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join("\n");

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
