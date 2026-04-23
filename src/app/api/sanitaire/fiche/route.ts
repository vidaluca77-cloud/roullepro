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

export async function PATCH(req: Request) {
  try {
    const supabaseUser = await createServerClient();
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json();
    const { pro_id, ...fields } = body;
    if (!pro_id) return NextResponse.json({ error: "pro_id requis" }, { status: 400 });

    const supabaseAdmin = getAdminClient();
    // Vérifie ownership
    const { data: pro } = await supabaseAdmin
      .from("pros_sanitaire")
      .select("claimed_by")
      .eq("id", pro_id)
      .maybeSingle();
    if (!pro || pro.claimed_by !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const allowed: Record<string, unknown> = {};
    const allowedKeys = [
      "nom_commercial",
      "telephone_public",
      "email_public",
      "site_web",
      "adresse",
      "description",
      "services",
      "horaires",
      "photos",
      "logo_url",
      "video_url",
    ];
    for (const k of allowedKeys) {
      if (k in fields) allowed[k] = fields[k];
    }

    const { error } = await supabaseAdmin.from("pros_sanitaire").update(allowed).eq("id", pro_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
