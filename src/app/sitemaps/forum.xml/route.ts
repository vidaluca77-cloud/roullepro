import { NextResponse } from "next/server";
import { BASE_URL, buildXml } from "@/lib/sitemap-builders";
import { getForumServiceClient } from "@/lib/forum";

export const revalidate = 3600;

export async function GET() {
  const lastmod = new Date().toISOString();
  const supabase = getForumServiceClient();

  const [{ data: categories }, { data: threads }] = await Promise.all([
    supabase.from("forum_categories").select("slug"),
    supabase
      .from("forum_threads")
      .select("slug, updated_at, category_id, forum_categories(slug)")
      .order("updated_at", { ascending: false })
      .limit(5000),
  ]);

  const entries = [
    { url: `${BASE_URL}/forum`, lastmod, changefreq: "daily" as const, priority: 0.7 },
    ...(categories || []).map((c) => ({
      url: `${BASE_URL}/forum/${c.slug}`,
      lastmod,
      changefreq: "daily" as const,
      priority: 0.6,
    })),
    ...(threads || [])
      .map((t) => {
        const cat = (t as { forum_categories?: { slug?: string } }).forum_categories;
        if (!cat?.slug) return null;
        return {
          url: `${BASE_URL}/forum/${cat.slug}/${t.slug}`,
          lastmod: t.updated_at ? new Date(t.updated_at).toISOString() : lastmod,
          changefreq: "weekly" as const,
          priority: 0.5,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null),
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
