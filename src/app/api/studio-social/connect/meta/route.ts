/**
 * GET /api/studio-social/connect/meta
 *
 * Démarre le flux OAuth Facebook Login (Facebook Page + Instagram Business). Réservé
 * aux abonnés Pro et gouverné par le feature flag STUDIO_SOCIAL_META_ENABLED : tant
 * que l'app Meta n'est pas validée (App Review), la connexion est indisponible.
 *
 * Génère un state anti-CSRF stocké en cookie httpOnly, puis redirige vers Meta.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import { getProStudioActif } from "@/lib/studio-social";
import {
  providerActive,
  construireUrlAuthMeta,
  appUrl,
} from "@/lib/studio-social-oauth";

const STUDIO_URL = "/transport-medical/pro/studio-social";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(
      `${appUrl()}/auth/login?next=${encodeURIComponent(STUDIO_URL)}`
    );
  }

  const admin = getAdminServiceClient();
  const pro = await getProStudioActif(admin, user.id);
  if (!pro) {
    return NextResponse.redirect(`${appUrl()}${STUDIO_URL}?erreur=plan`);
  }
  if (!providerActive("facebook")) {
    return NextResponse.redirect(`${appUrl()}${STUDIO_URL}?erreur=indisponible`);
  }

  const nonce = randomBytes(16).toString("hex");
  const state = `${nonce}.${pro.id}`;
  const cookieStore = await cookies();
  cookieStore.set("ss_oauth_meta", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(construireUrlAuthMeta(state));
}
