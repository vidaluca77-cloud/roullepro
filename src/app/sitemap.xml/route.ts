import { NextResponse } from "next/server";
import { BASE_URL, SANITAIRE_FICHES_CHUNKS } from "@/lib/sitemap-builders";

export const revalidate = 3600;

export async function GET() {
  const ids: number[] = [0, 1];
  for (let i = 0; i < SANITAIRE_FICHES_CHUNKS; i += 1) ids.push(2 + i);

  const lastmod = new Date().toISOString();
  const items = ids
    .map(
      (id) => `  <sitemap>
    <loc>${BASE_URL}/sitemaps/${id}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`
    )
    .join("\n");

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
