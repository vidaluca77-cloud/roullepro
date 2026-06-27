/**
 * POST /api/admin/demandes-transport/[id]/annuler
 * Annule une demande avec motif obligatoire. Passe la demande en 'annulee' et
 * expire toutes les propositions encore ouvertes. Auth admin.
 * Body: { motif: string }
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const motif = body && typeof body.motif === "string" ? body.motif.trim() : "";
  if (!motif) {
    return NextResponse.json({ error: "Motif obligatoire" }, { status: 400 });
  }

  const { data: demande } = await guard.admin
    .from("demandes_transport")
    .select("id, statut")
    .eq("id", id)
    .maybeSingle();
  if (!demande) return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });

  const { error: updErr } = await guard.admin
    .from("demandes_transport")
    .update({
      statut: "annulee",
      annulee_at: new Date().toISOString(),
      annulee_par: guard.userId,
      annulee_motif: motif.slice(0, 2000),
    })
    .eq("id", id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  // Expire les propositions encore ouvertes.
  await guard.admin
    .from("demandes_transport_pros")
    .update({ statut: "expiree" })
    .eq("demande_id", id)
    .eq("statut", "proposee");

  return NextResponse.json({ ok: true, statut: "annulee" });
}
