export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Autocomplete villes pour la recherche particulier.
 * GET /api/sanitaire/autocomplete?q=bay
 * Renvoie les villes qui matchent + leur nombre de fiches.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const isCodePostal = /^\d{2,5}$/.test(q);

  const { data } = isCodePostal
    ? await supabase
        .from("pros_sanitaire")
        .select("ville, ville_slug, code_postal, departement")
        .eq("actif", true)
        .ilike("code_postal", `${q}%`)
        .limit(200)
    : await supabase
        .from("pros_sanitaire")
        .select("ville, ville_slug, code_postal, departement")
        .eq("actif", true)
        .ilike("ville", `${q}%`)
        .limit(200);

  const rows = data || [];
  const map = new Map<string, { ville: string; ville_slug: string; code_postal: string; departement: string; count: number }>();
  rows.forEach((row) => {
    const key = row.ville_slug;
    if (!map.has(key)) {
      map.set(key, {
        ville: row.ville,
        ville_slug: row.ville_slug,
        code_postal: row.code_postal,
        departement: row.departement,
        count: 0,
      });
    }
    map.get(key)!.count += 1;
  });

  const results = Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return NextResponse.json({ results });
}
