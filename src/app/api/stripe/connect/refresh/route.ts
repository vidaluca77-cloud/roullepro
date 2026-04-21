/**
 * GET /api/stripe/connect/refresh?garage_id=...
 * Regenere un Account Link si le precedent a expire.
 * Stripe redirige ici quand le lien est expire ou que l'utilisateur click "Refresh".
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
  const garageId = searchParams.get("garage_id");
  if (!garageId) {
    return NextResponse.redirect(`${siteUrl()}/admin/garages?error=missing_garage`);
  }

  const sbService = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: garage } = await sbService
    .from("garages_partenaires")
    .select("stripe_account_id")
    .eq("id", garageId)
    .single();

  const accountId = (garage as { stripe_account_id: string | null } | null)?.stripe_account_id;
  if (!accountId) {
    return NextResponse.redirect(`${siteUrl()}/admin/garages/${garageId}?error=no_account`);
  }

  const stripe = getStripe();
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${siteUrl()}/api/stripe/connect/refresh?garage_id=${garageId}`,
    return_url: `${siteUrl()}/admin/garages/${garageId}?stripe=success`,
    type: "account_onboarding",
  });

  return NextResponse.redirect(link.url);
}
