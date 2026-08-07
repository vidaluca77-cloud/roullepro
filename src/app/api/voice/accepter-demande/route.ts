/**
 * POST /api/voice/accepter-demande
 *
 * Appelée par l'agent vocal Retell AI pendant un appel sortant vers un pro,
 * quand celui-ci dit "oui" à voix pour prendre en charge une course.
 *
 * Ne réimplémente AUCUNE logique métier : un simple
 *   UPDATE demandes_transport_pros SET statut='acceptee' WHERE id=...
 * suffit à déclencher le trigger existant on_demande_pro_acceptee() qui :
 *   - verrouille la demande (pg_advisory_xact_lock, anti double-acceptation)
 *   - met à jour demandes_transport.statut/accepte_par_pro_id/accepte_at
 *   - ferme les autres pros sollicités (statut='autre_acceptee')
 *   - annule les réservations TCP concurrentes du même groupe
 *
 * Le patient est informé via le schéma déjà en place (email existant déclenché
 * par la même cascade). Rien de nouveau à écrire côté notification patient.
 *
 * Sécurité : Authorization: Bearer ${VOICE_AGENT_SECRET}.
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifierSecretAgentVocal, reponseNonAutorisee } from "@/lib/voice-agent-auth";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function POST(req: Request) {
  if (!verifierSecretAgentVocal(req)) return reponseNonAutorisee();

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
    }

    const demandeProId = (body.demande_pro_id ?? "").toString().trim();
    const retellCallId = (body.retell_call_id ?? "").toString().trim() || null;

    if (!demandeProId) {
      return NextResponse.json({ error: "demande_pro_id est obligatoire" }, { status: 400 });
    }

    const admin = getAdminClient();

    // On ne touche que les lignes encore "proposee" — si un autre pro ou le
    // dashboard web a déjà accepté entre-temps, on le signale à l'agent au
    // lieu de silencieusement écraser un état déjà tranché.
    const { data: ligne, error: selectError } = await admin
      .from("demandes_transport_pros")
      .select("id, statut, demande_id, pro_id")
      .eq("id", demandeProId)
      .maybeSingle();

    if (selectError || !ligne) {
      return NextResponse.json({ error: "Proposition introuvable" }, { status: 404 });
    }

    if (ligne.statut !== "proposee") {
      return NextResponse.json({
        ok: false,
        deja_traitee: true,
        statut_actuel: ligne.statut,
        message_pour_agent:
          ligne.statut === "autre_acceptee"
            ? "Cette course a déjà été prise par un autre professionnel, merci de l'indiquer poliment à l'interlocuteur."
            : "Cette proposition n'est plus disponible (déjà déclinée ou expirée).",
      });
    }

    const { error: updateError } = await admin
      .from("demandes_transport_pros")
      .update({ statut: "acceptee", acceptee_at: new Date().toISOString() })
      .eq("id", demandeProId)
      .eq("statut", "proposee"); // garde-fou anti race-condition en plus du trigger

    if (updateError) {
      console.error("[voice/accepter-demande] update error", updateError);
      return NextResponse.json({ error: "Échec de la mise à jour" }, { status: 500 });
    }

    if (retellCallId) {
      await admin
        .from("appels_agent_ia")
        .update({ resultat: "accepte", statut: "termine", ended_at: new Date().toISOString() })
        .eq("retell_call_id", retellCallId)
        .then(undefined, (e) => console.error("[voice/accepter-demande] log appel", e));
    }

    return NextResponse.json({
      ok: true,
      demande_id: ligne.demande_id,
      message_pour_agent:
        "C'est confirmé. Le patient va recevoir une notification automatique avec vos coordonnées.",
    });
  } catch (e) {
    console.error("[voice/accepter-demande] erreur inattendue", e);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
