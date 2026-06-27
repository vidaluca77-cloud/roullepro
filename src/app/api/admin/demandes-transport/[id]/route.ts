/**
 * GET   /api/admin/demandes-transport/[id]  -> detail + timeline pros
 * PATCH /api/admin/demandes-transport/[id]  -> mise a jour admin_notes uniquement
 *
 * Auth admin (profiles.role = 'admin'), lectures/ecritures en service role.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { data: demande, error: demErr } = await guard.admin
    .from("admin_demandes_transport_overview")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (demErr) return NextResponse.json({ error: demErr.message }, { status: 500 });
  if (!demande) return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });

  const { data: pros, error: prosErr } = await guard.admin
    .from("demandes_transport_pros")
    .select(
      "id, pro_id, statut, proposee_at, vue_at, acceptee_at, declinee_at, email_status, email_sent_at, email_resend_id, pros_sanitaire ( raison_sociale, nom_commercial, telephone_public, email_public, ville, plan, claimed )"
    )
    .eq("demande_id", id)
    .order("proposee_at", { ascending: true });

  if (prosErr) return NextResponse.json({ error: prosErr.message }, { status: 500 });

  return NextResponse.json({ demande, pros: pros || [] });
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  // Seul admin_notes est modifiable via ce endpoint.
  const adminNotes =
    body.admin_notes == null ? null : String(body.admin_notes).slice(0, 5000);

  const { error } = await guard.admin
    .from("demandes_transport")
    .update({ admin_notes: adminNotes })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
