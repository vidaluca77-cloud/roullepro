/**
 * GET /api/stripe/connect/callback
 * Callback OAuth Stripe Connect (flow Standard, scope=read_write).
 * Cette route est utilisee uniquement si l'on opte pour OAuth plutot que Express.
 * En mode Express (par defaut ici), Stripe redirige vers le return_url de l'Account Link
 * et cette callback n'est PAS invoquee. Elle est conservee pour permettre l'option OAuth
 * Standard future (ex : garages ayant deja un compte Stripe).
 *
 * Query params fournis par Stripe : code, state, error, error_description
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient as createSbClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://roullepro.com"
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // garage_id attendu
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    console.error("[stripe connect callback] error", error, errorDescription);
    const target = state
      ? `${siteUrl()}/admin/garages/${state}?stripe=error&msg=${encodeURIComponent(errorDescription || error)}`
      : `${siteUrl()}/admin/garages?stripe=error`;
    return NextResponse.redirect(target);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${siteUrl()}/admin/garages?stripe=error&msg=missing_params`);
  }

  try {
    const stripe = getStripe();
    // Echange code contre stripe_user_id
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });

    const connectedAccountId = response.stripe_user_id;
    if (!connectedAccountId) {
      throw new Error("stripe_user_id absent de la reponse OAuth");
    }

    const sbService = createSbClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await sbService
      .from("garages_partenaires")
      .update({
        stripe_account_id: connectedAccountId,
        stripe_connect_onboarding_started_at: new Date().toISOString(),
      })
      .eq("id", state);

    return NextResponse.redirect(
      `${siteUrl()}/admin/garages/${state}?stripe=success`
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "erreur OAuth";
    console.error("[stripe connect callback] exchange fail", msg);
    return NextResponse.redirect(
      `${siteUrl()}/admin/garages/${state}?stripe=error&msg=${encodeURIComponent(msg)}`
    );
  }
}
