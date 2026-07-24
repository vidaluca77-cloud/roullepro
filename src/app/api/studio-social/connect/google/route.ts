/**
 * GET /api/studio-social/connect/google
 *
 * Démarre le flux OAuth Google (Google Business Profile). Réservé aux abonnés Pro et
 * gouverné par le feature flag STUDIO_SOCIAL_GBP_ENABLED : tant que l'accès à l'API
 * GBP n'est pas accordé (quota), la connexion est indisponible. Demande un
 * access_type=offline pour obtenir un refresh_token.
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
  construireUrlAuthGoogle,
  appUrl,
} from "@/lib/studio-social-oauth";

const STUDIO_URL = "/transport-medical/pro/studio-social";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${appUrl()}/auth/login?next=${STUDIO_URL}`);
  }

  const admin = getAdminServiceClient();
  const pro = await getProStudioActif(admin, user.id);
  if (!pro) {
    return NextResponse.redirect(`${appUrl()}${STUDIO_URL}?erreur=plan`);
  }
  if (!providerActive("google_business")) {
    return NextResponse.redirect(`${appUrl()}${STUDIO_URL}?erreur=indisponible`);
  }

  const nonce = randomBytes(16).toString("hex");
  const state = `${nonce}.${pro.id}`;
  const cookieStore = await cookies();
  cookieStore.set("ss_oauth_google", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(construireUrlAuthGoogle(state));
}
