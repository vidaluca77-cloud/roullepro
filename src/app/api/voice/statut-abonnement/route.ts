/**
 * GET /api/voice/statut-abonnement?pro_id=...
 *
 * Appelée par l'agent vocal AVANT de proposer un abonnement à un pro pendant
 * un appel (dispatch ou dédié upsell), pour savoir s'il est légitime de le
 * faire. Réutilise les helpers canoniques de src/lib/sanitaire-plans.ts
 * (abonnementActif, echeanceOffre) — même source de vérité que le cron de
 * relance essai et le contrôle d'accès aux courses, pour ne jamais diverger.
 *
 * Trois statuts possibles renvoyés à l'agent :
 *  - "abonne_actif"      : a déjà un abonnement payant actif -> ne rien proposer
 *  - "en_essai"          : période offerte/essai en cours -> ne pas encore vendre
 *  - "essai_termine_libre": essai/offre expirée, pas d'abonnement actif -> cible légitime pour l'upsell
 *
 * Sécurité : Authorization: Bearer ${VOICE_AGENT_SECRET}.
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifierSecretAgentVocal, reponseNonAutorisee } from "@/lib/voice-agent-auth";
import { abonnementActif, echeanceOffre } from "@/lib/sanitaire-plans";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function GET(req: Request) {
  if (!verifierSecretAgentVocal(req)) return reponseNonAutorisee();

  try {
    const url = new URL(req.url);
    const proId = url.searchParams.get("pro_id");
    if (!proId) {
      return NextResponse.json({ error: "pro_id est obligatoire" }, { status: 400 });
    }

    const admin = getAdminClient();

    const { data: pro, error } = await admin
      .from("pros_sanitaire")
      .select(
        "id, claimed, plan, plan_expires_at, plan_active_until, free_trial_ends_at, stripe_subscription_id, nom_commercial, raison_sociale"
      )
      .eq("id", proId)
      .maybeSingle();

    if (error || !pro) {
      return NextResponse.json({ error: "Professionnel introuvable" }, { status: 404 });
    }

    if (!pro.claimed) {
      return NextResponse.json({
        ok: true,
        statut: "non_inscrit",
        message_pour_agent:
          "Ce professionnel n'a pas encore de fiche RoullePro. Proposez-lui de créer un compte gratuit avant de parler d'abonnement.",
      });
    }

    if (abonnementActif(pro)) {
      return NextResponse.json({
        ok: true,
        statut: "abonne_actif",
        nom: pro.nom_commercial || pro.raison_sociale,
        message_pour_agent:
          "Ce professionnel a déjà un abonnement payant actif. Ne proposez pas d'abonnement, remerciez-le simplement.",
      });
    }

    const echeance = echeanceOffre(pro);
    const enEssai = echeance ? new Date(echeance).getTime() > Date.now() : false;

    if (enEssai) {
      return NextResponse.json({
        ok: true,
        statut: "en_essai",
        echeance,
        nom: pro.nom_commercial || pro.raison_sociale,
        message_pour_agent:
          "Ce professionnel est encore en période d'essai/offerte. Ne proposez pas encore l'abonnement — informez-le seulement de la date de fin si demandé.",
      });
    }

    return NextResponse.json({
      ok: true,
      statut: "essai_termine_libre",
      echeance,
      nom: pro.nom_commercial || pro.raison_sociale,
      message_pour_agent:
        "La période offerte de ce professionnel est terminée et il n'a pas d'abonnement actif. Vous pouvez lui proposer de passer à l'offre Pro, dans le respect des créneaux horaires autorisés pour les appels commerciaux.",
    });
  } catch (e) {
    console.error("[voice/statut-abonnement] erreur inattendue", e);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
