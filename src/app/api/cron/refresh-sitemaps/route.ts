import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  SANITAIRE_FICHES_CHUNKS,
  countEtablissementsChunks,
} from "@/lib/sitemap-builders";

export const dynamic = "force-dynamic";

/**
 * Endpoint appele par un cron externe (Netlify scheduled function, Supabase pg_cron via webhook,
 * ou cron-job.org) pour rafraichir les sitemaps statiques.
 *
 * Strategie : revalidatePath() sur chaque chunk pour forcer Next a regenerer le XML
 * au prochain hit. Cela evite de servir des sitemaps avec des fiches obsoletes ou manquantes.
 *
 * Cadence recommandee : 1 fois par jour (suffisant vu que les fiches changent peu).
 *
 * Protection : header Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const revalidated: string[] = [];

  // Sitemap index racine
  revalidatePath("/sitemap.xml");
  revalidated.push("/sitemap.xml");

  // Chunk 0 : pages statiques (incl. departements + hub)
  revalidatePath("/sitemaps/0");
  revalidated.push("/sitemaps/0");

  // Chunk 1 : villes + categorie/ville
  revalidatePath("/sitemaps/1");
  revalidated.push("/sitemaps/1");

  // Chunks 2..N : fiches pros paginees
  for (let i = 0; i < SANITAIRE_FICHES_CHUNKS; i += 1) {
    const id = 2 + i;
    revalidatePath(`/sitemaps/${id}`);
    revalidated.push(`/sitemaps/${id}`);
  }

  // Chunks etablissements FINESS + pages "transport vers" (declares directement
  // dans l'index racine depuis le fix shards vides).
  const etabChunks = await countEtablissementsChunks();
  for (let i = 0; i < etabChunks; i += 1) {
    revalidatePath(`/sitemaps/etablissements-${i}`);
    revalidated.push(`/sitemaps/etablissements-${i}`);
    revalidatePath(`/sitemaps/transport-vers-${i}`);
    revalidated.push(`/sitemaps/transport-vers-${i}`);
  }

  return NextResponse.json({
    success: true,
    refreshed_at: new Date().toISOString(),
    chunks: revalidated.length,
    paths: revalidated,
  });
}
