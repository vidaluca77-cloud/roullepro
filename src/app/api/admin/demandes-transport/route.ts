/**
 * GET /api/admin/demandes-transport
 * Liste paginee des demandes de transport pour le module admin, depuis la vue
 * admin_demandes_transport_overview. Auth admin (profiles.role = 'admin').
 *
 * Query params :
 *   statut    (repetable) filtre statut
 *   categorie (repetable) filtre type_transport (taxi|vsl|ambulance)
 *   dpt       departement_cible
 *   q         recherche texte (nom | telephone | email)
 *   sort      'asc' | 'desc' (created_at, defaut desc)
 *   limit     defaut 50
 *   offset    defaut 0
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const statuts = url.searchParams.getAll("statut").filter(Boolean);
  const categories = url.searchParams.getAll("categorie").filter(Boolean);
  const dpt = url.searchParams.get("dpt");
  const q = (url.searchParams.get("q") || "").trim();
  const sort = url.searchParams.get("sort") === "asc" ? "asc" : "desc";
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 50, 1), 200);
  const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);

  let query = guard.admin
    .from("admin_demandes_transport_overview")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: sort === "asc" })
    .range(offset, offset + limit - 1);

  if (statuts.length) query = query.in("statut", statuts);
  if (categories.length) query = query.in("type_transport", categories);
  if (dpt) query = query.eq("departement_cible", dpt);
  if (q) {
    const safe = q.replace(/[%,]/g, " ");
    query = query.or(
      `nom.ilike.%${safe}%,telephone.ilike.%${safe}%,email.ilike.%${safe}%`
    );
  }

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    demandes: data || [],
    count: count ?? 0,
    limit,
    offset,
  });
}
