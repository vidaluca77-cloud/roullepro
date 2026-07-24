/**
 * GET /api/studio-social/connect/google/callback
 *
 * Callback OAuth Google : échange le code contre un access_token + refresh_token,
 * récupère le premier compte Google Business Profile, puis stocke les tokens côté
 * serveur (jamais exposés). Le refresh_token permet le rafraîchissement automatique
 * lors des publications (cf. Lot 3).
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import { getProStudioActif } from "@/lib/studio-social";
import {
  providerActive,
  googleRedirectUri,
  GOOGLE_SCOPES,
  expiresAtDepuisExpiresIn,
  appUrl,
} from "@/lib/studio-social-oauth";

const STUDIO_URL = "/transport-medical/pro/studio-social";

function retour(statut: "connecte" | "erreur", detail?: string) {
  const q = statut === "connecte" ? "connecte=google" : `erreur=${detail || "google"}`;
  return NextResponse.redirect(`${appUrl()}${STUDIO_URL}?${q}`);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const attendu = cookieStore.get("ss_oauth_google")?.value;
  cookieStore.delete("ss_oauth_google");

  if (!code || !state || !attendu || state !== attendu) {
    return retour("erreur", "state");
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return retour("erreur", "auth");

  const admin = getAdminServiceClient();
  const pro = await getProStudioActif(admin, user.id);
  const proIdState = state.split(".")[1];
  if (!pro || pro.id !== proIdState) return retour("erreur", "plan");
  if (!providerActive("google_business")) return retour("erreur", "indisponible");

  try {
    const body = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    });
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!tokenRes.ok) return retour("erreur", "token");
    const tokenData = await tokenRes.json();
    const accessToken: string | undefined = tokenData?.access_token;
    const refreshToken: string | null = tokenData?.refresh_token ?? null;
    if (!accessToken) return retour("erreur", "token");
    const expiresAt = expiresAtDepuisExpiresIn(tokenData?.expires_in);

    // Compte GBP (best-effort) : nom du premier compte pour l'affichage.
    let accountId: string | null = null;
    let accountName: string | null = null;
    try {
      const accRes = await fetch(
        "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (accRes.ok) {
        const acc = (await accRes.json())?.accounts?.[0];
        accountId = acc?.name ?? null;
        accountName = acc?.accountName ?? null;
      }
    } catch {
      /* best-effort */
    }

    await admin.from("social_connections").upsert(
      {
        pro_id: pro.id,
        provider: "google_business",
        account_id: accountId,
        account_name: accountName,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresAt,
        scopes: GOOGLE_SCOPES.join(" "),
        statut: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "pro_id,provider" }
    );

    return retour("connecte");
  } catch {
    return retour("erreur", "exception");
  }
}
