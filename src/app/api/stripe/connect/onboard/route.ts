/**
 * POST /api/stripe/connect/onboard
 * Cree (ou recupere) un compte Stripe Connect Express pour un garage partenaire
 * et genere un Account Link d'onboarding. Reserve aux admins RoullePro.
 *
 * Body JSON : { garage_id: string }
 * Reponse   : { url: string } (URL hebergee Stripe vers laquelle rediriger le garage)
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const sbService = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await sbService
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if ((profile as { role?: string } | null)?.role !== "admin") {
    return NextResponse.json(
      { error: "Acces reserve aux administrateurs" },
      { status: 403 }
    );
  }

  let body: { garage_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const garageId = body.garage_id;
  if (!garageId) {
    return NextResponse.json({ error: "garage_id requis" }, { status: 400 });
  }

  const { data: garage, error: garageErr } = await sbService
    .from("garages_partenaires")
    .select("id, ville, contact_email, stripe_account_id")
    .eq("id", garageId)
    .single();

  if (garageErr || !garage) {
    return NextResponse.json({ error: "Garage introuvable" }, { status: 404 });
  }

  const stripe = getStripe();
  let accountId = (garage as { stripe_account_id: string | null }).stripe_account_id;

  // Creer un compte Express si besoin
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      email: (garage as { contact_email: string }).contact_email || undefined,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      business_type: "company",
      metadata: {
        garage_id: garageId,
        ville: (garage as { ville: string }).ville || "",
        platform: "roullepro",
      },
    });
    accountId = account.id;

    await sbService
      .from("garages_partenaires")
      .update({
        stripe_account_id: accountId,
        stripe_connect_onboarding_started_at: new Date().toISOString(),
      })
      .eq("id", garageId);
  }

  // Generer un Account Link d'onboarding
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${siteUrl()}/api/stripe/connect/refresh?garage_id=${garageId}`,
    return_url: `${siteUrl()}/admin/garages/${garageId}?stripe=success`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: link.url, account_id: accountId });
}
