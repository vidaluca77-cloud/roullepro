import { NextResponse } from "next/server";
import { BASE_URL, buildXml } from "@/lib/sitemap-builders";
import { TERMES } from "@/lib/glossaire-data";

export const revalidate = 3600;

export function GET() {
  const lastmod = new Date().toISOString();

  const entries = [
    {
      url: `${BASE_URL}/glossaire`,
      lastmod,
      changefreq: "monthly" as const,
      priority: 0.8,
    },
    ...TERMES.map((terme) => ({
      url: `${BASE_URL}/glossaire/${terme.slug}`,
      lastmod: terme.miseAJour ? new Date(terme.miseAJour).toISOString() : lastmod,
      changefreq: "monthly" as const,
      priority: 0.6,
    })),
  ];

  const xml = buildXml(entries);

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
