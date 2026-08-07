/**
 * POST /api/voice/demande-transport
 *
 * Appelée par l'agent vocal Retell AI (function calling) pendant un appel
 * patient entrant, une fois les informations recueillies à voix.
 *
 * Ne réimplémente PAS le dispatch : insère dans `demandes_transport` avec
 * source_form='voice_ia', exactement comme /api/demande-transport (formulaire
 * web). Le trigger existant `dispatch_demande_transport()` (AFTER INSERT) se
 * déclenche automatiquement et fait tout le fan-out vers les pros.
 *
 * Volontairement plus permissif que la route formulaire sur la validation
 * (pas de rate-limit IP — l'appelant n'a pas d'IP HTTP côté agent, c'est
 * Retell qui appelle depuis ses propres serveurs), mais protégé par le
 * secret partagé VOICE_AGENT_SECRET.
 *
 * Sécurité : Authorization: Bearer ${VOICE_AGENT_SECRET}.
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { verifierSecretAgentVocal, reponseNonAutorisee } from "@/lib/voice-agent-auth";
import { normaliserDepartement, codePostalToDepartement } from "@/lib/departement";
import { extraireCodePostal } from "@/lib/geocode-adresse";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

const TYPES_TRANSPORT = ["taxi", "vsl", "ambulance"] as const;
type TypeTransportVoice = (typeof TYPES_TRANSPORT)[number];

export async function POST(req: Request) {
  if (!verifierSecretAgentVocal(req)) return reponseNonAutorisee();

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
    }

    const typeTransport = body.type_transport as TypeTransportVoice;
    const nom = (body.nom ?? "").toString().trim();
    const telephone = (body.telephone ?? "").toString().trim();
    const email = (body.email ?? "").toString().trim() || null;
    const adresseDepart = (body.adresse_depart ?? "").toString().trim();
    const adresseArrivee = (body.adresse_arrivee ?? "").toString().trim();
    const dateSouhaiteeRaw = (body.date_souhaitee ?? "").toString().trim();
    const bonTransport = body.bon_transport === true;
    const retellCallId = (body.retell_call_id ?? "").toString().trim() || null;

    if (!TYPES_TRANSPORT.includes(typeTransport)) {
      return NextResponse.json(
        { error: "type_transport invalide", champs_attendus: TYPES_TRANSPORT },
        { status: 400 }
      );
    }
    if (!nom || !telephone) {
      return NextResponse.json({ error: "nom et telephone sont obligatoires" }, { status: 400 });
    }
    if (!adresseDepart || !adresseArrivee) {
      return NextResponse.json(
        { error: "adresse_depart et adresse_arrivee sont obligatoires" },
        { status: 400 }
      );
    }
    if (!dateSouhaiteeRaw) {
      return NextResponse.json({ error: "date_souhaitee est obligatoire" }, { status: 400 });
    }

    const dateSouhaitee = new Date(dateSouhaiteeRaw);
    if (Number.isNaN(dateSouhaitee.getTime())) {
      return NextResponse.json({ error: "date_souhaitee non parseable" }, { status: 400 });
    }

    const cp = extraireCodePostal(adresseDepart);
    const departement = normaliserDepartement(cp ? codePostalToDepartement(cp) : null);

    const admin = getAdminClient();
    const suiviToken = crypto.randomUUID();

    const { data: demande, error } = await admin
      .from("demandes_transport")
      .insert({
        type_transport: typeTransport,
        nom,
        telephone,
        email,
        lieu_depart: adresseDepart,
        lieu_arrivee: adresseArrivee,
        date_souhaitee: dateSouhaitee.toISOString(),
        bon_transport_medical: bonTransport,
        departement_cible: departement,
        source_form: "voice_ia",
        suivi_token: suiviToken,
        statut: "envoyee",
      })
      .select("id, suivi_token")
      .single();

    if (error || !demande) {
      console.error("[voice/demande-transport] insert error", error);
      return NextResponse.json({ error: "Échec de création de la demande" }, { status: 500 });
    }

    // Trace d'audit de l'appel — best-effort, ne bloque jamais la réponse à l'agent.
    if (retellCallId) {
      await admin
        .from("appels_agent_ia")
        .insert({
          type_appel: "patient_entrant",
          demande_id: demande.id,
          retell_call_id: retellCallId,
          statut: "en_cours",
        })
        .then(undefined, (e) => console.error("[voice/demande-transport] log appel", e));
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.roullepro.com";

    return NextResponse.json({
      ok: true,
      demande_id: demande.id,
      lien_suivi: `${appUrl}/suivi/${demande.suivi_token}`,
      message_pour_agent:
        "Demande créée avec succès, les professionnels disponibles vont être contactés. Le patient recevra une confirmation par email/SMS dès qu'un professionnel accepte.",
    });
  } catch (e) {
    console.error("[voice/demande-transport] erreur inattendue", e);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
