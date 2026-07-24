/**
 * GET /api/studio-social/connections
 *
 * Renvoie l'état public des connexions réseaux du pro connecté (connecté/déconnecté
 * + disponibilité selon les feature flags), SANS aucun token. Réservé aux abonnés Pro.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import { getProStudioActif } from "@/lib/studio-social";
import { construireEtatConnexions } from "@/lib/studio-social-oauth";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const admin = getAdminServiceClient();
  const pro = await getProStudioActif(admin, user.id);
  if (!pro) {
    return NextResponse.json(
      { error: "Le Studio réseaux sociaux est réservé aux abonnés Pro." },
      { status: 403 }
    );
  }

  const { data } = await admin
    .from("social_connections")
    .select("provider, account_name, statut")
    .eq("pro_id", pro.id);

  return NextResponse.json({
    ok: true,
    connexions: construireEtatConnexions(data || []),
  });
}
