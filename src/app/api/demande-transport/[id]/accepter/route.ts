/**
 * POST /api/demande-transport/[id]/accepter
 * Un pro claimed accepte une demande de transport ouverte (premier servi).
 *
 * - Auth obligatoire (JWT Supabase)
 * - Le pro ne voit que ses propres lignes de proposition (RLS)
 * - Acceptation race-safe : UPDATE conditionnel statut='proposee' + trigger SQL
 *   qui cascade (ferme les autres pros, ferme TCP). Si la demande est deja prise,
 *   le trigger retombe la ligne en 'autre_acceptee' -> on renvoie 409.
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
    .select("id, pro_id, statut")
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

  // UPDATE conditionnel race-safe : ne passe a 'acceptee' que si encore 'proposee'.
  const { data: updated } = await admin
    .from("demandes_transport_pros")
    .update({ statut: "acceptee", acceptee_at: new Date().toISOString() })
    .eq("id", ligne.id)
    .eq("statut", "proposee")
    .select("id")
    .maybeSingle();

  if (!updated) {
    return NextResponse.json({ error: "Demande deja acceptee par un autre" }, { status: 409 });
  }

  // Le trigger a soit confirme 'acceptee', soit retombe 'autre_acceptee' si course prise.
  const { data: apres } = await admin
    .from("demandes_transport_pros")
    .select("statut")
    .eq("id", ligne.id)
    .maybeSingle();

  if (apres?.statut !== "acceptee") {
    return NextResponse.json({ error: "Demande deja acceptee par un autre" }, { status: 409 });
  }

  // Course attribuee : on revele les coordonnees en clair du demandeur.
  const { data: demande } = await admin
    .from("demandes_transport")
    .select(
      "id, nom, telephone, email, type_transport, lieu_depart, lieu_arrivee, date_souhaitee, aller_retour, mobilite, precisions, taux_prise_en_charge, taux_prise_en_charge_autre, bon_transport_medical"
    )
    .eq("id", demandeId)
    .maybeSingle();

  return NextResponse.json({ ok: true, statut: "acceptee", demande });
}
