/**
 * GET /api/studio-social/connect/google/callback
 *
 * Callback OAuth Google : échange le code contre un access_token + refresh_token,
 * résout l'établissement Google Business Profile à publier (`accounts/{id}/locations/{id}`)
 * puis stocke les tokens CHIFFRÉS côté serveur (jamais exposés au client).
 *
 * L'API localPosts ne publie que sur une ressource de location : stocker un simple
 * `accounts/{id}` rendait la connexion inutilisable. La liste des établissements est
 * conservée en metadata (sans token) pour permettre un choix ultérieur.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import { getProStudioActif } from "@/lib/studio-social";
import { chiffrerToken, tokenKeyConfigured } from "@/lib/studio-social-crypto";
import {
  providerActive,
  googleRedirectUri,
  GOOGLE_SCOPES,
  expiresAtDepuisExpiresIn,
  appUrl,
} from "@/lib/studio-social-oauth";

const STUDIO_URL = "/transport-medical/pro/studio-social";

type Location = { name?: string; title?: string };

function retour(statut: "connecte" | "erreur", detail?: string) {
  const q = statut === "connecte" ? "connecte=google" : `erreur=${detail || "google"}`;
  return NextResponse.redirect(`${appUrl()}${STUDIO_URL}?${q}`);
}

/** Établissements du compte GBP. `name` est relatif : `locations/{id}`. */
async function listerLocations(compte: string, accessToken: string): Promise<Location[]> {
  const url =
    `https://mybusinessbusinessinformation.googleapis.com/v1/${compte}/locations` +
    `?readMask=name,title&pageSize=100`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  return (data?.locations as Location[] | undefined) || [];
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const refus = url.searchParams.get("error");

  const cookieStore = await cookies();
  const attendu = cookieStore.get("ss_oauth_google")?.value;
  cookieStore.delete("ss_oauth_google");

  // L'utilisateur a refusé/annulé côté Google : pas une erreur technique.
  if (refus) return retour("erreur", "annule");
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
  if (!tokenKeyConfigured()) return retour("erreur", "chiffrement");

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

    // 1. Compte GBP.
    const accRes = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!accRes.ok) return retour("erreur", "no_account");
    const accData = await accRes.json().catch(() => ({}));
    const compteBrut = accData?.accounts?.[0];
    const compte: string | null = compteBrut?.name ?? null;
    if (!compte) return retour("erreur", "no_account");

    // 2. Établissement publiable : `accounts/{id}/locations/{id}`.
    const locations = await listerLocations(compte, accessToken);
    const premiere = locations.find((l) => !!l.name);
    if (!premiere?.name) return retour("erreur", "no_location");
    const accountLocation = `${compte}/${premiere.name}`;

    const maj: Record<string, unknown> = {
      pro_id: pro.id,
      provider: "google_business",
      account_id: accountLocation,
      account_name: premiere.title || compteBrut?.accountName || null,
      access_token_chiffre: chiffrerToken(accessToken),
      token_expires_at: expiresAt,
      scopes: GOOGLE_SCOPES.join(" "),
      account_metadata: {
        compte,
        locations: locations
          .filter((l) => !!l.name)
          .map((l) => ({ name: `${compte}/${l.name}`, title: l.title ?? null }))
          .slice(0, 20),
      },
      statut: "active",
      updated_at: new Date().toISOString(),
    };
    // Google ne renvoie le refresh_token qu'au premier consentement : ne jamais
    // écraser celui déjà stocké par un null, sinon plus aucun rafraîchissement.
    if (refreshToken) maj.refresh_token_chiffre = chiffrerToken(refreshToken);

    await admin
      .from("social_connections")
      .upsert(maj, { onConflict: "pro_id,provider" });

    return retour("connecte");
  } catch {
    return retour("erreur", "exception");
  }
}
