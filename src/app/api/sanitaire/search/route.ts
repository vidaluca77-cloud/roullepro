export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { tokenize, buildOrFilter, matchesQuery } from "@/lib/sanitaire-search";

const SELECT_COLS =
  "id, siret, raison_sociale, nom_commercial, ville, code_postal, categorie, claimed";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 3) return NextResponse.json({ results: [] });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Recherche par SIRET exact
  const isSiret = /^\d{14}$/.test(q.replace(/\s/g, ""));
  if (isSiret) {
    const { data } = await supabase
      .from("pros_sanitaire_public")
      .select(SELECT_COLS)
      .eq("actif", true)
      .eq("suspendu", false)
      .eq("siret", q.replace(/\s/g, ""))
      .limit(12);
    return NextResponse.json({ results: data || [] });
  }

  // Recherche tolérante : chaque token doit matcher (AND) sur raison_sociale,
  // nom_commercial ou ville, insensible à la casse et aux accents.
  const tokens = tokenize(q);
  if (tokens.length === 0) return NextResponse.json({ results: [] });

  let query = supabase
    .from("pros_sanitaire_public")
    .select(SELECT_COLS)
    .eq("actif", true)
    .eq("suspendu", false)
    .limit(30);

  // Chaque `.or()` est combiné en AND avec les précédents -> token-AND / champ-OR.
  for (const token of tokens) {
    query = query.or(buildOrFilter(token));
  }

  const { data, error } = await query;

  let rows = data || [];
  // Repli en cas d'indisponibilité de l'opérateur regex : ancienne recherche
  // sous-chaîne large, puis filtrage exact côté JS pour rester tolérant.
  if (error) {
    const like = `%${q}%`;
    const { data: fallback } = await supabase
      .from("pros_sanitaire_public")
      .select(SELECT_COLS)
      .eq("actif", true)
      .eq("suspendu", false)
      .or(
        `raison_sociale.ilike.${like},nom_commercial.ilike.${like},ville.ilike.${like}`
      )
      .limit(200);
    rows = fallback || [];
  }

  const results = rows.filter((r) => matchesQuery(r, q)).slice(0, 12);
  return NextResponse.json({ results });
}
