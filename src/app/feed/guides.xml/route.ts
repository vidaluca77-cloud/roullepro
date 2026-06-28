import { NextResponse } from "next/server";
import { GUIDES_LIST } from "@/lib/guides-list";

export const revalidate = 1800;

const BASE_URL = "https://roullepro.com";
const LAST_BUILD = new Date().toUTCString();

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const items = GUIDES_LIST.map((guide) => {
    const link = `${BASE_URL}/guides/${guide.slug}`;
    return `
    <item>
      <title>${escapeXml(guide.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(guide.description)}</description>
      <pubDate>${new Date(guide.publishedAt).toUTCString()}</pubDate>
      <lastBuildDate>${new Date(guide.updatedAt).toUTCString()}</lastBuildDate>
      <author>contact@roullepro.com (Lucas Horville)</author>
      <category>Transport sanitaire</category>
    </item>`;
  }).join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Guides RoullePro — Transport sanitaire</title>
    <link>${BASE_URL}/guides/transport-sanitaire-conformite-2026-2027</link>
    <description>Guides pratiques et réglementaires sur le transport sanitaire en France : ambulance, VSL, taxi conventionné CPAM.</description>
    <language>fr-FR</language>
    <lastBuildDate>${LAST_BUILD}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed/guides.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE_URL}/android-chrome-512x512.png</url>
      <title>RoullePro</title>
      <link>${BASE_URL}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=1800",
    },
  });
}
