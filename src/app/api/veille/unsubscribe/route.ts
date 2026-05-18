/**
 * GET /api/veille/unsubscribe?token=<uuid>
 * POST /api/veille/unsubscribe (form-encoded ou multipart : token=<uuid>) — RFC 8058 List-Unsubscribe=One-Click
 *
 * Desinscription 1 clic : positionne reg_newsletter_optin=false et unsubscribed_at=now.
 * Redirect vers une page de confirmation (GET) ou renvoie 200 (POST RFC8058).
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

function redirectTo(path: string) {
  return NextResponse.redirect(`${APP_URL}${path}`, { status: 302 });
}

async function processUnsubscribe(
  token: string
): Promise<{ ok: boolean; reason?: string }> {
  if (!token) return { ok: false, reason: "missing_token" };

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error("[veille-unsubscribe] Supabase service role manquant");
    return { ok: false, reason: "config" };
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, reason: "not_found" };
  }

  const { error: updateError } = await supabase
    .from("newsletter_subscribers")
    .update({
      reg_newsletter_optin: false,
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  if (updateError) {
    console.error("[veille-unsubscribe] update error:", updateError.message);
    return { ok: false, reason: "update_failed" };
  }

  return { ok: true };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() || "";
  const result = await processUnsubscribe(token);

  if (result.ok) {
    return redirectTo("/veille-reglementaire/desinscription-ok");
  }
  return redirectTo("/veille-reglementaire/desinscription-erreur");
}

export async function POST(request: Request) {
  // RFC 8058 : List-Unsubscribe-Post: List-Unsubscribe=One-Click
  // Body form-encoded ou multipart, on accepte les deux.
  let token = "";
  const contentType = request.headers.get("content-type") || "";

  try {
    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const form = await request.formData();
      const raw = form.get("token");
      if (typeof raw === "string") token = raw.trim();
    } else if (contentType.includes("application/json")) {
      const json = await request.json().catch(() => null);
      if (json && typeof json.token === "string") token = json.token.trim();
    } else {
      const url = new URL(request.url);
      token = url.searchParams.get("token")?.trim() || "";
    }
  } catch (err) {
    console.warn("[veille-unsubscribe] parse body failed:", err);
  }

  const result = await processUnsubscribe(token);
  if (result.ok) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  return NextResponse.json({ ok: false }, { status: 400 });
}
