export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const PRICE_ENV_MAP: Record<string, string> = {
  essential: "STRIPE_PRICE_SANITAIRE_ESSENTIAL",
  premium: "STRIPE_PRICE_SANITAIRE_PREMIUM",
  pro_plus: "STRIPE_PRICE_SANITAIRE_PROPLUS",
};

// Prix Stripe live créés pour l'annuaire sanitaire — fallback si env non définie
// essential : nouveau price 19,90 € TTC (tax_behavior=inclusive) pour facturation TVA correcte par Stripe Tax
// Ancien price price_1TPTHrJQRPoIacwzO3PxAv8M conservé pour les abonnements existants
const PRICE_ID_DEFAULTS: Record<string, string> = {
  essential: "price_1TZFdwJQRPoIacwzQ4zPEYLF",
  premium: "price_1TPTHrJQRPoIacwzXphLkYRy",
  pro_plus: "price_1TPTHrJQRPoIacwz0HDK9iC1",
};

const PLAN_AMOUNT_FALLBACK: Record<string, number> = {
  essential: 1990,
  premium: 3900,
  pro_plus: 7900,
};

export async function POST(req: Request) {
  try {
    const { plan_key, pro_id } = await req.json();
    if (!plan_key || !pro_id) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }
    if (!PRICE_ENV_MAP[plan_key]) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    const supabaseUser = await createServerClient();
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: pro } = await supabaseAdmin
      .from("pros_sanitaire")
      .select("id, claimed_by, raison_sociale, nom_commercial, stripe_customer_id, stripe_subscription_id, plan, plan_offer_source, plan_expires_at")
      .eq("id", pro_id)
      .maybeSingle();
    if (!pro || pro.claimed_by !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Calcul du trial Stripe : si le pro est déjà en essai gratuit (auto-trial 2 mois ou offre),
    // on aligne le premier débit sur la fin de son essai actuel — pas de 14j de bonus supplémentaire.
    let trialBehavior: { trial_period_days: number } | { trial_end: number } = {
      trial_period_days: 14,
    };
    const planExpiresAt = pro.plan_expires_at ? new Date(pro.plan_expires_at).getTime() : 0;
    const isOnFreeTrial = !pro.stripe_subscription_id && !!pro.plan_offer_source;
    if (isOnFreeTrial && planExpiresAt > Date.now()) {
      // trial_end attend un timestamp UNIX en secondes
      trialBehavior = { trial_end: Math.floor(planExpiresAt / 1000) };
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";
    const priceId = process.env[PRICE_ENV_MAP[plan_key]] || PRICE_ID_DEFAULTS[plan_key];

    const lineItems = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `Annuaire Transport Sanitaire — Plan ${plan_key}`,
                description: pro.nom_commercial || pro.raison_sociale,
              },
              unit_amount: PLAN_AMOUNT_FALLBACK[plan_key],
              recurring: { interval: "month" as const },
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: pro.stripe_customer_id || undefined,
      customer_email: pro.stripe_customer_id ? undefined : user.email,
      line_items: lineItems,
      subscription_data: {
        ...trialBehavior,
        metadata: { pro_id, plan_key, user_id: user.id },
      },
      metadata: { pro_id, plan_key, user_id: user.id, source: "sanitaire" },
      // Stripe Tax : calcul automatique de la TVA FR (20 %) en TTC -> ventile HT + TVA sur la facture
      automatic_tax: { enabled: true },
      // Collecter l'adresse de facturation (requise par Stripe Tax pour determiner le taux)
      billing_address_collection: "required",
      // Permettre a Stripe de creer / mettre a jour l'adresse sur le Customer (pre-requis automatic_tax)
      customer_update: pro.stripe_customer_id ? { address: "auto", name: "auto" } : undefined,
      // Activer la collecte du numero de TVA intracommunautaire (auto-liquidation B2B UE)
      tax_id_collection: { enabled: true },
      success_url: `${baseUrl}/transport-medical/pro/dashboard?upgraded=1`,
      cancel_url: `${baseUrl}/transport-medical/tarifs`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
