export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSupabaseEtab } from "@/lib/etablissements-data";

// Recherche etablissement pour l'autocomplete public.
// Ne doit pas etre indexee : en-tete X-Robots-Tag noindex.
//
// On matche sur le nom d'affichage, la raison sociale, la ville et la chaine
// d'alias semantiques (search_aliases) generee a l'import. Les alias contiennent
// les formes avec ET sans accents ainsi que des raccourcis ("chu caen", "pitie"),
// ce qui permet de retrouver un etablissement via son nom usuel.
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

  // Variante sans accents pour matcher les alias normalises.
  const qNorm = q
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

  const supabase = getSupabaseEtab();

  // Requete enrichie : nom_affichage + search_aliases (colonnes ajoutees par la
  // migration de remap FINESS). Si ces colonnes n'existent pas encore sur la base
  // ciblee, PostgREST renvoie une erreur et on retombe sur la requete historique.
  const ors = [
    `nom_affichage.ilike.%${q}%`,
    `raison_sociale.ilike.%${q}%`,
    `ville.ilike.%${q}%`,
    `search_aliases.ilike.%${q}%`,
  ];
  if (qNorm && qNorm !== q.toLowerCase()) {
    ors.push(`search_aliases.ilike.%${qNorm}%`);
  }

  const enriched = await supabase
    .from("etablissements_sante_public")
    .select(
      "id, slug, nom_court, nom_affichage, raison_sociale, ville, departement, categorie_simple"
    )
    .or(ors.join(","))
    .order("capacite_lits", { ascending: false, nullsFirst: false })
    .order("raison_sociale", { ascending: true })
    .limit(10);

  if (!enriched.error) {
    return NextResponse.json({ results: enriched.data ?? [] }, { headers });
  }

  // Repli : base sans les colonnes nom_affichage/search_aliases.
  const legacy = await supabase
    .from("etablissements_sante_public")
    .select("id, slug, nom_court, raison_sociale, ville, departement, categorie_simple")
    .or(`raison_sociale.ilike.%${q}%,ville.ilike.%${q}%`)
    .order("capacite_lits", { ascending: false, nullsFirst: false })
    .order("raison_sociale", { ascending: true })
    .limit(10);

  if (legacy.error) {
    return NextResponse.json({ results: [] }, { status: 500, headers });
  }

  return NextResponse.json({ results: legacy.data ?? [] }, { headers });
}
