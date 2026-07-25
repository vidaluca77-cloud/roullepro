/**
 * GET /api/studio-social/connect/meta/callback
 *
 * Callback OAuth Meta : échange le code contre un token utilisateur longue durée,
 * récupère la Page Facebook (/me/accounts) et le compte Instagram Business lié, puis
 * stocke les tokens de Page CHIFFRÉS côté serveur (jamais exposés au client).
 *
 * Sécurité : state anti-CSRF (cookie httpOnly) + propriété de la fiche. Le
 * client_secret et les tokens ne circulent jamais en query string : échange en corps
 * POST, lectures Graph avec un header Authorization.
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
  metaRedirectUri,
  META_GRAPH_VERSION,
  META_SCOPES,
  appUrl,
} from "@/lib/studio-social-oauth";

const STUDIO_URL = "/transport-medical/pro/studio-social";
const GRAPH = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

function retour(statut: "connecte" | "erreur", detail?: string) {
  const q = statut === "connecte" ? "connecte=meta" : `erreur=${detail || "meta"}`;
  return NextResponse.redirect(`${appUrl()}${STUDIO_URL}?${q}`);
}

/** Appel Graph authentifié par header : le token ne finit ni dans une URL ni dans un log. */
async function graph(chemin: string, token: string): Promise<Response> {
  return fetch(`${GRAPH}/${chemin}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const refus = url.searchParams.get("error");

  const cookieStore = await cookies();
  const attendu = cookieStore.get("ss_oauth_meta")?.value;
  cookieStore.delete("ss_oauth_meta");

  // L'utilisateur a refusé/annulé côté Meta : pas une erreur technique.
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
  if (!providerActive("facebook")) return retour("erreur", "indisponible");
  if (!tokenKeyConfigured()) return retour("erreur", "chiffrement");

  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;

  try {
    // 1. Code → token utilisateur courte durée (secret en corps POST).
    const tokenRes = await fetch(`${GRAPH}/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: metaRedirectUri(),
        code,
      }).toString(),
    });
    if (!tokenRes.ok) return retour("erreur", "token");
    const tokenData = await tokenRes.json();
    const shortToken: string | undefined = tokenData?.access_token;
    if (!shortToken) return retour("erreur", "token");

    // 2. Échange → token utilisateur longue durée (~60 j).
    const longRes = await fetch(`${GRAPH}/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortToken,
      }).toString(),
    });
    const longData = longRes.ok ? await longRes.json() : {};
    const userToken: string = longData?.access_token || shortToken;

    // 3. Pages gérées (/me/accounts suffit, sans business_management).
    const pagesRes = await graph(
      "me/accounts?fields=id,name,access_token,instagram_business_account",
      userToken
    );
    if (!pagesRes.ok) return retour("erreur", "pages");
    const pagesData = await pagesRes.json();
    const pages: Array<{ id?: string; name?: string; access_token?: string }> =
      pagesData?.data || [];
    const page = pages[0];
    if (!page?.id || !page?.access_token) return retour("erreur", "no_page");

    // Liste des Pages conservée (sans token) pour permettre un choix ultérieur.
    const metadata = {
      pages: pages
        .filter((p) => p.id)
        .map((p) => ({ id: p.id, name: p.name ?? null }))
        .slice(0, 20),
    };
    const nowIso = new Date().toISOString();
    const pageTokenChiffre = chiffrerToken(page.access_token);

    // 4. Connexion Facebook (token de Page longue durée = pas d'expiration fixe).
    await admin.from("social_connections").upsert(
      {
        pro_id: pro.id,
        provider: "facebook",
        account_id: page.id,
        account_name: page.name || null,
        access_token_chiffre: pageTokenChiffre,
        refresh_token_chiffre: null,
        token_expires_at: null,
        scopes: META_SCOPES.join(","),
        account_metadata: metadata,
        statut: "active",
        updated_at: nowIso,
      },
      { onConflict: "pro_id,provider" }
    );

    // 5. Compte Instagram Business lié à la Page (si présent).
    const igId: string | undefined = (
      page as { instagram_business_account?: { id?: string } }
    ).instagram_business_account?.id;
    if (igId) {
      let igNom: string | null = null;
      try {
        const igRes = await graph(`${igId}?fields=username`, page.access_token);
        if (igRes.ok) igNom = (await igRes.json())?.username ?? null;
      } catch {
        /* nom best-effort */
      }
      await admin.from("social_connections").upsert(
        {
          pro_id: pro.id,
          provider: "instagram",
          account_id: igId,
          account_name: igNom,
          access_token_chiffre: pageTokenChiffre,
          refresh_token_chiffre: null,
          token_expires_at: null,
          scopes: META_SCOPES.join(","),
          account_metadata: {},
          statut: "active",
          updated_at: nowIso,
        },
        { onConflict: "pro_id,provider" }
      );
    }

    return retour("connecte");
  } catch {
    return retour("erreur", "exception");
  }
}
