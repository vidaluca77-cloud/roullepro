import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 1800;

const BASE_URL = "https://roullepro.com";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type AlertRow = {
  slug: string;
  title_short: string;
  summary_oneliner: string;
  applicable_from: string | null;
  created_at: string;
};

export async function GET() {
  const supabase = getSupabase();
  const lastBuild = new Date().toUTCString();

  let items = "";

  if (supabase) {
    const { data } = await supabase
      .from("reg_alerts")
      .select("slug, title_short, summary_oneliner, applicable_from, created_at")
      .eq("status", "published")
      .order("applicable_from", { ascending: false, nullsFirst: false })
      .limit(50);

    if (data && data.length > 0) {
      items = (data as AlertRow[])
        .map((row) => {
          const link = `${BASE_URL}/veille-reglementaire/${row.slug}`;
          const pubDate = row.applicable_from
            ? new Date(row.applicable_from).toUTCString()
            : new Date(row.created_at).toUTCString();
          return `
    <item>
      <title>${escapeXml(row.title_short)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(row.summary_oneliner)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>Veille réglementaire</category>
    </item>`;
        })
        .join("\n");
    }
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Veille réglementaire RoullePro — Transport sanitaire</title>
    <link>${BASE_URL}/veille-reglementaire</link>
    <description>Alertes et actualités réglementaires pour les professionnels du transport sanitaire en France : ambulance, VSL, taxi conventionné CPAM.</description>
    <language>fr-FR</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed/veille.xml" rel="self" type="application/rss+xml" />
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
