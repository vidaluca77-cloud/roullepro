import { NextResponse } from "next/server";
import { buildXml, buildGuidesSitemap } from "@/lib/sitemap-builders";

export const revalidate = 3600;

export async function GET() {
  const entries = buildGuidesSitemap();
  const xml = buildXml(entries);
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
