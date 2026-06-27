/**
 * POST /api/demande-transport/[id]/terminer
 * Un pro marque comme terminee une course qu'il a acceptee.
 *
 * - Auth obligatoire (JWT Supabase)
 * - Le pro ne voit/termine que ses propres lignes (RLS) au statut 'acceptee'
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

  // RLS : ne retourne que les propositions des fiches detenues par l'utilisateur.
  const { data: own } = await supabase
    .from("demandes_transport_pros")
    .select("id, statut")
    .eq("demande_id", demandeId)
    .eq("statut", "acceptee")
    .limit(1);

  const ligne = own?.[0];
  if (!ligne) {
    return NextResponse.json(
      { error: "Course introuvable, non acceptee ou non autorisee" },
      { status: 404 }
    );
  }

  const admin = getAdminClient();
  const { data: updated, error } = await admin
    .from("demandes_transport_pros")
    .update({ statut: "terminee" })
    .eq("id", ligne.id)
    .eq("statut", "acceptee")
    .select("id")
    .maybeSingle();

  if (error || !updated) {
    return NextResponse.json(
      { error: "Impossible de marquer la course comme terminee" },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, statut: "terminee" });
}
