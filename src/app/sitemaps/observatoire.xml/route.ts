import { NextResponse } from "next/server";
import { BASE_URL, buildXml } from "@/lib/sitemap-builders";

export const revalidate = 3600;

// Liste des slugs de rapports trimestriels publiés
const RAPPORTS_PUBLIES = ["t2-2026"];

export async function GET() {
  const now = new Date().toISOString();

  const entries: { url: string; lastmod: string; changefreq: "monthly" | "weekly"; priority: number }[] = [
    {
      url: `${BASE_URL}/observatoire`,
      lastmod: now,
      changefreq: "monthly",
      priority: 0.8,
    },
    ...RAPPORTS_PUBLIES.map((slug) => ({
      url: `${BASE_URL}/observatoire/rapports/${slug}`,
      lastmod: now,
      changefreq: "monthly" as const,
      priority: 0.7,
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
