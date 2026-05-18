/**
 * GET /api/veille/confirm?token=<uuid>
 * Valide le token de confirmation double opt-in.
 * - Si token valide et non expire : reg_newsletter_optin=true + redirect vers /confirmation-ok
 * - Sinon : redirect vers /confirmation-expiree
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

function redirectTo(path: string) {
  return NextResponse.redirect(`${APP_URL}${path}`, { status: 302 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() || "";

  if (!token) {
    return redirectTo("/veille-reglementaire/confirmation-expiree");
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error("[veille-confirm] Supabase service role manquant");
    return redirectTo("/veille-reglementaire/confirmation-expiree");
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, confirmation_token_expires_at")
    .eq("confirmation_token", token)
    .maybeSingle();

  if (error || !data) {
    return redirectTo("/veille-reglementaire/confirmation-expiree");
  }

  if (
    data.confirmation_token_expires_at &&
    new Date(data.confirmation_token_expires_at).getTime() < Date.now()
  ) {
    return redirectTo("/veille-reglementaire/confirmation-expiree");
  }

  const { error: updateError } = await supabase
    .from("newsletter_subscribers")
    .update({
      reg_newsletter_optin: true,
      confirmed_at: nowIso,
      confirmation_token: null,
      confirmation_token_expires_at: null,
      unsubscribed_at: null,
    })
    .eq("id", data.id);

  if (updateError) {
    console.error("[veille-confirm] update error:", updateError.message);
    return redirectTo("/veille-reglementaire/confirmation-expiree");
  }

  return redirectTo("/veille-reglementaire/confirmation-ok");
}
