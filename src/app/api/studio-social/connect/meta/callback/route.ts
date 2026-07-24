/**
 * GET /api/studio-social/connect/meta/callback
 *
 * Callback OAuth Meta : échange le code contre un token utilisateur longue durée,
 * récupère la Page Facebook (/me/accounts) et le compte Instagram Business lié, puis
 * stocke les tokens de Page côté serveur (jamais exposés au client).
 *
 * Sécurité : vérifie le state anti-CSRF (cookie httpOnly) et la propriété de la fiche.
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
  metaRedirectUri,
  META_GRAPH_VERSION,
  META_SCOPES,
  appUrl,
} from "@/lib/studio-social-oauth";

const STUDIO_URL = "/transport-medical/pro/studio-social";

function retour(statut: "connecte" | "erreur", detail?: string) {
  const q = statut === "connecte" ? "connecte=meta" : `erreur=${detail || "meta"}`;
  return NextResponse.redirect(`${appUrl()}${STUDIO_URL}?${q}`);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const attendu = cookieStore.get("ss_oauth_meta")?.value;
  cookieStore.delete("ss_oauth_meta");

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

  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;

  try {
    // 1. Code → token utilisateur courte durée.
    const tokenUrl = new URL(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token`
    );
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", metaRedirectUri());
    tokenUrl.searchParams.set("code", code);
    const tokenRes = await fetch(tokenUrl.toString());
    if (!tokenRes.ok) return retour("erreur", "token");
    const tokenData = await tokenRes.json();
    const shortToken: string | undefined = tokenData?.access_token;
    if (!shortToken) return retour("erreur", "token");

    // 2. Échange → token utilisateur longue durée (~60 j).
    const longUrl = new URL(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token`
    );
    longUrl.searchParams.set("grant_type", "fb_exchange_token");
    longUrl.searchParams.set("client_id", appId);
    longUrl.searchParams.set("client_secret", appSecret);
    longUrl.searchParams.set("fb_exchange_token", shortToken);
    const longRes = await fetch(longUrl.toString());
    const longData = longRes.ok ? await longRes.json() : {};
    const userToken: string = longData?.access_token || shortToken;

    // 3. Page(s) gérée(s) : on retient la première.
    const pagesRes = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${encodeURIComponent(userToken)}`
    );
    if (!pagesRes.ok) return retour("erreur", "pages");
    const pagesData = await pagesRes.json();
    const page = (pagesData?.data || [])[0];
    if (!page?.id || !page?.access_token) return retour("erreur", "no_page");

    const nowIso = new Date().toISOString();

    // 4. Connexion Facebook (token de Page longue durée = pas d'expiration fixe).
    await admin.from("social_connections").upsert(
      {
        pro_id: pro.id,
        provider: "facebook",
        account_id: page.id,
        account_name: page.name || null,
        access_token: page.access_token,
        refresh_token: null,
        token_expires_at: null,
        scopes: META_SCOPES.join(","),
        statut: "active",
        updated_at: nowIso,
      },
      { onConflict: "pro_id,provider" }
    );

    // 5. Compte Instagram Business lié à la Page (si présent).
    const igId: string | undefined = page.instagram_business_account?.id;
    if (igId) {
      let igNom: string | null = null;
      try {
        const igRes = await fetch(
          `https://graph.facebook.com/${META_GRAPH_VERSION}/${igId}?fields=username&access_token=${encodeURIComponent(page.access_token)}`
        );
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
          access_token: page.access_token,
          refresh_token: null,
          token_expires_at: null,
          scopes: META_SCOPES.join(","),
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
