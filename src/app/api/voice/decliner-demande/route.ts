/**
 * POST /api/voice/decliner-demande
 *
 * Appelée par l'agent vocal quand le pro dit "non" pendant l'appel de dispatch.
 * Ne déclenche aucune cascade particulière (le trigger on_demande_pro_acceptee
 * ne réagit qu'aux passages à 'acceptee') — la demande reste ouverte pour les
 * autres pros déjà sollicités ou pour une relance ultérieure.
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
    const motif = (body.motif ?? "").toString().trim() || null;
    const retellCallId = (body.retell_call_id ?? "").toString().trim() || null;

    if (!demandeProId) {
      return NextResponse.json({ error: "demande_pro_id est obligatoire" }, { status: 400 });
    }

    const admin = getAdminClient();

    const { error } = await admin
      .from("demandes_transport_pros")
      .update({ statut: "declinee", declinee_at: new Date().toISOString() })
      .eq("id", demandeProId)
      .eq("statut", "proposee");

    if (error) {
      console.error("[voice/decliner-demande] update error", error);
      return NextResponse.json({ error: "Échec de la mise à jour" }, { status: 500 });
    }

    if (retellCallId) {
      await admin
        .from("appels_agent_ia")
        .update({
          resultat: motif ? `decline: ${motif}` : "decline",
          statut: "termine",
          ended_at: new Date().toISOString(),
        })
        .eq("retell_call_id", retellCallId)
        .then(undefined, (e) => console.error("[voice/decliner-demande] log appel", e));
    }

    return NextResponse.json({
      ok: true,
      message_pour_agent: "Bien noté, merci pour votre réponse.",
    });
  } catch (e) {
    console.error("[voice/decliner-demande] erreur inattendue", e);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
