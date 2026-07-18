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
import { notifyDemandeAcceptee } from "@/lib/demande-transport-accept";
import { peutAccepterCourses } from "@/lib/sanitaire-plans";

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

  // Demande annulée par le patient : plus acceptable (garde-fou contre un
  // dashboard obsolète qui afficherait encore le bouton accepter).
  const { data: demandeStatut } = await admin
    .from("demandes_transport")
    .select("statut")
    .eq("id", demandeId)
    .maybeSingle();
  if (demandeStatut?.statut === "annulee") {
    return NextResponse.json(
      { error: "Cette demande a été annulée par le patient." },
      { status: 409 }
    );
  }

  // Verrou abonnement : un pro en plan gratuit (essai terminé ou jamais abonné)
  // continue de VOIR et de RECEVOIR les courses, mais ne peut pas les accepter.
  const { data: pro } = await admin
    .from("pros_sanitaire")
    .select("plan, plan_expires_at, stripe_subscription_id")
    .eq("id", ligne.pro_id)
    .maybeSingle();

  if (!peutAccepterCourses(pro)) {
    return NextResponse.json(
      {
        error:
          "Votre période d'essai est terminée. Passez au plan Pro (19,90 €/mois TTC) pour accepter les courses.",
        code: "abonnement_requis",
      },
      { status: 403 }
    );
  }

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

  // Notifications post-acceptation (pro accepteur + client + autres pros). Best-effort.
  await notifyDemandeAcceptee(admin, demandeId, ligne.pro_id, user.email).catch(
    () => undefined
  );

  return NextResponse.json({ ok: true, statut: "acceptee", demande });
}
