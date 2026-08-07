/**
 * POST /api/voice/log-appel
 *
 * Webhook générique appelé par Retell AI en fin d'appel (call_ended /
 * call_analyzed) pour journaliser l'appel dans `appels_agent_ia`, même quand
 * aucune des autres routes voice/* n'a été appelée pendant l'appel (ex : appel
 * sans suite, répondeur, raccroché immédiat, mauvais numéro).
 *
 * Fait un upsert sur retell_call_id : si une ligne existe déjà (créée par
 * demande-transport/accepter-demande/decliner-demande), elle est complétée
 * plutôt que dupliquée.
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

const TYPES_APPEL = ["patient_entrant", "pro_dispatch", "pro_upsell"] as const;

export async function POST(req: Request) {
  if (!verifierSecretAgentVocal(req)) return reponseNonAutorisee();

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
    }

    const retellCallId = (body.retell_call_id ?? "").toString().trim();
    if (!retellCallId) {
      return NextResponse.json({ error: "retell_call_id est obligatoire" }, { status: 400 });
    }

    const typeAppel = (body.type_appel ?? "").toString().trim();
    const proId = (body.pro_id ?? "").toString().trim() || null;
    const demandeId = (body.demande_id ?? "").toString().trim() || null;
    const numeroAppele = (body.numero_appele ?? "").toString().trim() || null;
    const resultat = (body.resultat ?? "").toString().trim() || null;
    const dureeSecondes = Number.isFinite(body.duree_secondes) ? body.duree_secondes : null;
    const transcriptUrl = (body.transcript_url ?? "").toString().trim() || null;
    const enregistrementUrl = (body.enregistrement_url ?? "").toString().trim() || null;

    const admin = getAdminClient();

    const { data: existante } = await admin
      .from("appels_agent_ia")
      .select("id")
      .eq("retell_call_id", retellCallId)
      .maybeSingle();

    const payload: Record<string, unknown> = {
      retell_call_id: retellCallId,
      statut: "termine",
      ended_at: new Date().toISOString(),
    };
    if (TYPES_APPEL.includes(typeAppel as any)) payload.type_appel = typeAppel;
    if (proId) payload.pro_id = proId;
    if (demandeId) payload.demande_id = demandeId;
    if (numeroAppele) payload.numero_appele = numeroAppele;
    if (resultat) payload.resultat = resultat;
    if (dureeSecondes !== null) payload.duree_secondes = dureeSecondes;
    if (transcriptUrl) payload.transcript_url = transcriptUrl;
    if (enregistrementUrl) payload.enregistrement_url = enregistrementUrl;

    if (existante) {
      const { error } = await admin
        .from("appels_agent_ia")
        .update(payload)
        .eq("id", existante.id);
      if (error) {
        console.error("[voice/log-appel] update error", error);
        return NextResponse.json({ error: "Échec de la mise à jour du log" }, { status: 500 });
      }
    } else {
      const { error } = await admin.from("appels_agent_ia").insert(payload);
      if (error) {
        console.error("[voice/log-appel] insert error", error);
        return NextResponse.json({ error: "Échec de la création du log" }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[voice/log-appel] erreur inattendue", e);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
