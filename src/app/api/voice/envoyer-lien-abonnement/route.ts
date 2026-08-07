/**
 * POST /api/voice/envoyer-lien-abonnement
 *
 * Appelée par l'agent vocal après avoir proposé l'abonnement à un pro dont le
 * statut est "essai_termine_libre" (vérifié via /api/voice/statut-abonnement
 * juste avant — cette route ne revérifie pas mais fait confiance à l'appelant
 * pour respecter la séquence, le contrôle métier réel reste côté Stripe/webhook).
 *
 * Crée une session Stripe Checkout en mode admin (pas de session utilisateur
 * Supabase requise, contrairement à /api/sanitaire/stripe/checkout qui est
 * pensée pour un pro connecté au dashboard) et envoie le lien par e-mail
 * plutôt que de le dicter à voix — cohérent avec un usage tel/mobile.
 *
 * Plan par défaut : "essential" (19,90 €/mois) sauf si plan_key est fourni
 * explicitement dans le corps. Ne propose jamais "premium" (Plan Établissements,
 * encore en pilote) sans confirmation explicite du plan_key par l'appelant.
 *
 * Sécurité : Authorization: Bearer ${VOICE_AGENT_SECRET}.
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifierSecretAgentVocal, reponseNonAutorisee } from "@/lib/voice-agent-auth";
import { getStripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import { renderVoicePropositionAbonnement } from "@/lib/email-templates/sanitaire";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

const PRICE_ENV_MAP: Record<string, string> = {
  essential: "STRIPE_PRICE_SANITAIRE_ESSENTIAL",
  premium: "STRIPE_PRICE_SANITAIRE_PREMIUM",
  pro_plus: "STRIPE_PRICE_SANITAIRE_PROPLUS",
};
const PRICE_ID_DEFAULTS: Record<string, string> = {
  essential: "price_1TZFdwJQRPoIacwzQ4zPEYLF",
  premium: "price_1TPTHrJQRPoIacwzXphLkYRy",
  pro_plus: "price_1TPTHrJQRPoIacwz0HDK9iC1",
};

export async function POST(req: Request) {
  if (!verifierSecretAgentVocal(req)) return reponseNonAutorisee();

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
    }

    const proId = (body.pro_id ?? "").toString().trim();
    const planKey = (body.plan_key ?? "essential").toString().trim();

    if (!proId) {
      return NextResponse.json({ error: "pro_id est obligatoire" }, { status: 400 });
    }
    if (!PRICE_ENV_MAP[planKey]) {
      return NextResponse.json(
        { error: "plan_key invalide", plans_valides: Object.keys(PRICE_ENV_MAP) },
        { status: 400 }
      );
    }
    // Garde-fou : le plan Établissements (premium, 49€/mo) est en pilote et ne
    // doit pas être vendu en self-service par l'agent vocal sans validation humaine.
    if (planKey === "premium") {
      return NextResponse.json(
        {
          error: "plan_pilote_non_disponible",
          message_pour_agent:
            "Le plan Établissements est encore en phase pilote et ne peut pas être proposé pour une souscription immédiate. Proposez le plan Pro (essential) à la place, ou transférez la demande à un humain.",
        },
        { status: 409 }
      );
    }

    const admin = getAdminClient();
    const { data: pro, error } = await admin
      .from("pros_sanitaire")
      .select("id, nom_commercial, raison_sociale, email_public, stripe_customer_id")
      .eq("id", proId)
      .maybeSingle();

    if (error || !pro) {
      return NextResponse.json({ error: "Professionnel introuvable" }, { status: 404 });
    }
    if (!pro.email_public) {
      return NextResponse.json(
        {
          error: "email_absent",
          message_pour_agent:
            "Ce professionnel n'a pas d'adresse email enregistrée, demandez-la-lui à voix avant de continuer, ou transférez à un humain.",
        },
        { status: 422 }
      );
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.roullepro.com";
    const priceId = process.env[PRICE_ENV_MAP[planKey]] || PRICE_ID_DEFAULTS[planKey];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: pro.stripe_customer_id || undefined,
      customer_email: pro.stripe_customer_id ? undefined : pro.email_public,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { pro_id: proId, plan_key: planKey, source: "voice_ia" },
      },
      metadata: { pro_id: proId, plan_key: planKey, source: "voice_ia" },
      automatic_tax: { enabled: true },
      billing_address_collection: "required",
      customer_update: pro.stripe_customer_id ? { address: "auto", name: "auto" } : undefined,
      tax_id_collection: { enabled: true },
      success_url: `${baseUrl}/transport-medical/pro/dashboard?upgraded=1`,
      cancel_url: `${baseUrl}/transport-medical/tarifs`,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Échec de création de la session Stripe" }, { status: 500 });
    }

    const nomPro = pro.nom_commercial || pro.raison_sociale || "Professionnel";
    const template = renderVoicePropositionAbonnement({ nomPro, lienAbonnement: session.url });
    const sent = await sendEmail({
      to: pro.email_public,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [{ name: "category", value: "voice_ia_abonnement" }],
    });

    return NextResponse.json({
      ok: true,
      email_envoye: !!sent?.id,
      message_pour_agent:
        "Le lien pour activer l'abonnement vient d'être envoyé par email au professionnel. Informez-le qu'il va le recevoir dans quelques instants.",
    });
  } catch (e) {
    console.error("[voice/envoyer-lien-abonnement] erreur inattendue", e);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
