export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 3) return NextResponse.json({ results: [] });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Recherche par SIRET exact ou par raison sociale
  const isSiret = /^\d{14}$/.test(q.replace(/\s/g, ""));
  const query = supabase
    .from("pros_sanitaire")
    .select("id, siret, raison_sociale, nom_commercial, ville, code_postal, categorie, claimed")
    .eq("actif", true)
    .limit(12);

  const { data } = isSiret
    ? await query.eq("siret", q.replace(/\s/g, ""))
    : await query.or(`raison_sociale.ilike.%${q}%,nom_commercial.ilike.%${q}%,ville.ilike.%${q}%`);

  return NextResponse.json({ results: data || [] });
}
