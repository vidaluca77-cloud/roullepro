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
const PRICE_ID_DEFAULTS: Record<string, string> = {
  essential: "price_1TPTHrJQRPoIacwzO3PxAv8M",
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
      .select("id, claimed_by, raison_sociale, nom_commercial, stripe_customer_id")
      .eq("id", pro_id)
      .maybeSingle();
    if (!pro || pro.claimed_by !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
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
        trial_period_days: 14,
        metadata: { pro_id, plan_key, user_id: user.id },
      },
      metadata: { pro_id, plan_key, user_id: user.id, source: "sanitaire" },
      success_url: `${baseUrl}/transport-medical/pro/dashboard?upgraded=1`,
      cancel_url: `${baseUrl}/transport-medical/tarifs`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
