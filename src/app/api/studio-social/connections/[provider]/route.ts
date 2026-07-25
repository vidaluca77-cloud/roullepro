/**
 * DELETE /api/studio-social/connections/[provider]
 *
 * Déconnecte un réseau (supprime le token stocké) pour le pro connecté. Gère la
 * révocation côté RoullePro ; la révocation côté plateforme reste à la main du pro.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import { getProStudioActif, estProviderValide } from "@/lib/studio-social";

export async function DELETE(
  _req: Request,
  { params }: { params: { provider: string } }
) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  if (!estProviderValide(params.provider)) {
    return NextResponse.json({ error: "Provider inconnu" }, { status: 400 });
  }

  const admin = getAdminServiceClient();
  const pro = await getProStudioActif(admin, user.id);
  if (!pro) {
    return NextResponse.json(
      { error: "Le Studio réseaux sociaux est réservé aux abonnés Pro." },
      { status: 403 }
    );
  }

  const { error } = await admin
    .from("social_connections")
    .delete()
    .eq("pro_id", pro.id)
    .eq("provider", params.provider);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
