export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

/**
 * GET /api/admin/ameli-requests/signed-url?path=<user_id>/<file>.pdf
 * Génère une signed URL temporaire (60 min) pour un justificatif Ameli.
 * Bucket privé ameli-proofs. Admins uniquement.
 */
export async function GET(request: Request) {
  try {
    const { createClient: createServerClient } = await import("@/lib/supabase/server");
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json({ error: "Paramètre path manquant" }, { status: 400 });
    }

    const adminClient = getAdminClient();
    const { data, error } = await adminClient.storage
      .from("ameli-proofs")
      .createSignedUrl(filePath, 3600);

    if (error || !data) {
      console.error("Erreur signed URL ameli-proofs:", error);
      return NextResponse.json({ error: "Impossible de générer le lien" }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error: unknown) {
    console.error("Erreur serveur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
