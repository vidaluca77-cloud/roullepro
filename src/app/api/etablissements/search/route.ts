export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSupabaseEtab } from "@/lib/etablissements-data";

// Recherche etablissement pour l'autocomplete public.
// Ne doit pas etre indexee : en-tete X-Robots-Tag noindex.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("q") ?? "").trim();

  // On retire les caracteres qui casseraient le filtre .or() de PostgREST
  // (virgules, parentheses) et les jokers ILIKE saisis par l'utilisateur.
  const q = raw.replace(/[,%()]/g, " ").replace(/\s+/g, " ").trim();

  const headers = { "X-Robots-Tag": "noindex" };

  if (q.length < 2) {
    return NextResponse.json({ results: [] }, { headers });
  }

  const supabase = getSupabaseEtab();
  const { data, error } = await supabase
    .from("etablissements_sante_public")
    .select("id, slug, nom_court, raison_sociale, ville, departement, categorie_simple")
    .or(`raison_sociale.ilike.%${q}%,ville.ilike.%${q}%`)
    .order("capacite_lits", { ascending: false, nullsFirst: false })
    .order("raison_sociale", { ascending: true })
    .limit(10);

  if (error) {
    return NextResponse.json({ results: [] }, { status: 500, headers });
  }

  return NextResponse.json({ results: data ?? [] }, { headers });
}
