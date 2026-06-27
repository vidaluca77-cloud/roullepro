/**
 * POST /api/demande-transport/[id]/refuser
 * Un pro refuse une demande de transport qui lui est proposee. Sans cascade :
 * seule la ligne du pro passe en 'declinee', la demande mere reste ouverte pour
 * les autres pros.
 *
 * - Auth obligatoire (JWT Supabase)
 * - Le pro ne refuse que ses propres lignes (fiche claimed_by = user.id, via RLS)
 */

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminServiceClient } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: RouteParams) {
  const { id: demandeId } = await params;
  if (!demandeId) {
    return NextResponse.json({ error: "id manquant" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  // RLS : ne retourne que les propositions des fiches detenues par l'utilisateur
  // (pros_sanitaire.claimed_by = auth.uid()).
  const { data: own } = await supabase
    .from("demandes_transport_pros")
    .select("id")
    .eq("demande_id", demandeId)
    .eq("statut", "proposee")
    .limit(1);

  const ligne = own?.[0];
  if (!ligne) {
    return NextResponse.json(
      { error: "Demande introuvable, déjà traitée ou non autorisée" },
      { status: 404 }
    );
  }

  const admin = getAdminServiceClient();
  await admin
    .from("demandes_transport_pros")
    .update({ statut: "declinee", declinee_at: new Date().toISOString() })
    .eq("id", ligne.id)
    .eq("statut", "proposee");

  return NextResponse.json({ ok: true });
}
