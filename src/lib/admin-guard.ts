import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getAdminServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

type GuardOk = { ok: true; userId: string; admin: SupabaseClient };
type GuardErr = { ok: false; response: NextResponse };

/**
 * Verifie que l'appelant est authentifie et possede le role admin
 * (profiles.role = 'admin'). Retourne un client service-role pour les
 * lectures/ecritures admin si autorise.
 */
export async function requireAdmin(): Promise<GuardOk | GuardErr> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Authentification requise" }, { status: 401 }),
    };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Accès refusé" }, { status: 403 }),
    };
  }
  return { ok: true, userId: user.id, admin: getAdminServiceClient() };
}
