export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * POST /api/stripe/connect-seller/onboard
 * Crée (si besoin) un compte Stripe Connect Express pour un vendeur particulier,
 * et retourne un onboarding link.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const admin = getAdmin();
    const { data: profile } = await admin
      .from("profiles")
      .select("id, email, stripe_account_id, full_name")
      .eq("id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

    let accountId = profile.stripe_account_id;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "FR",
        email: profile.email || user.email || undefined,
        capabilities: { transfers: { requested: true } },
        business_type: "individual",
        metadata: { supabase_user_id: user.id, role: "seller" },
      });
      accountId = account.id;
      await admin.from("profiles").update({ stripe_account_id: accountId }).eq("id", user.id);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/dashboard/paiements?refresh=1`,
      return_url: `${appUrl}/dashboard/paiements?onboarded=1`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (e: any) {
    console.error("[connect-seller/onboard]", e?.message);
    return NextResponse.json({ error: e?.message || "Erreur" }, { status: 500 });
  }
}
