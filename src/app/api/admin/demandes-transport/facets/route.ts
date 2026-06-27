/**
 * GET /api/admin/demandes-transport/facets
 * Renvoie la liste distincte des departements cibles pour peupler le filtre
 * du module admin. Auth admin.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { data, error } = await guard.admin
    .from("admin_demandes_transport_overview")
    .select("departement_cible")
    .not("departement_cible", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const departements = Array.from(
    new Set((data || []).map((r) => r.departement_cible as string).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));

  return NextResponse.json({ departements });
}
