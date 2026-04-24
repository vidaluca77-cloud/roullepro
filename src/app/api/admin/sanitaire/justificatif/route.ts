export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function GET(req: Request) {
  try {
    const supabaseUser = await createServerClient();
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const supabaseAdmin = getAdminClient();
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");
    const bucketParam = searchParams.get("bucket");
    if (!path) return NextResponse.json({ error: "path manquant" }, { status: 400 });

    // Détection automatique du bucket selon le préfixe du chemin
    let bucket = bucketParam || "sanitaire-justificatifs";
    if (!bucketParam && path.startsWith("kbis/")) {
      bucket = "sanitaire-documents";
    }
    // Sécurité : seuls ces buckets sont autorisés
    const allowedBuckets = ["sanitaire-justificatifs", "sanitaire-documents"];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ error: "Bucket non autorisé" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, 300); // URL valide 5 minutes
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ url: data.signedUrl });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
