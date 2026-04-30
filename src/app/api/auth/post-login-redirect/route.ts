export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Renvoie l'URL de redirection idéale après connexion.
 * - Si l'utilisateur a au moins une fiche pros_sanitaire réclamée → /transport-medical/pro/dashboard
 * - Sinon → /dashboard (dashboard générique marketplace)
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ target: "/auth/login" }, { status: 401 });
    }

    const { count } = await supabase
      .from("pros_sanitaire")
      .select("id", { count: "exact", head: true })
      .eq("claimed_by", user.id);

    const target = (count ?? 0) > 0 ? "/transport-medical/pro/dashboard" : "/dashboard";
    return NextResponse.json({ target });
  } catch {
    return NextResponse.json({ target: "/dashboard" });
  }
}
