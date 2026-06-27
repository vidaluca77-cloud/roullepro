/**
 * POST /api/demande-transport/[id]/decliner
 * Un pro decline une demande de transport ouverte. Sans effet de cascade.
 *
 * - Auth obligatoire (JWT Supabase)
 * - Le pro ne voit/decline que ses propres lignes de proposition (RLS)
 */

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

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

  const { data: own } = await supabase
    .from("demandes_transport_pros")
    .select("id, statut")
    .eq("demande_id", demandeId)
    .eq("statut", "proposee")
    .limit(1);

  const ligne = own?.[0];
  if (!ligne) {
    return NextResponse.json(
      { error: "Demande introuvable, deja traitee ou non autorisee" },
      { status: 404 }
    );
  }

  const admin = getAdminClient();
  await admin
    .from("demandes_transport_pros")
    .update({ statut: "declinee", declinee_at: new Date().toISOString() })
    .eq("id", ligne.id)
    .eq("statut", "proposee");

  return NextResponse.json({ ok: true, statut: "declinee" });
}
