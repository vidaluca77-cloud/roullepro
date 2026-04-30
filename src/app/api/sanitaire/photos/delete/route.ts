export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function POST(req: Request) {
  try {
    const supabaseUser = await createServerClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json();
    const { pro_id, url } = body as { pro_id?: string; url?: string };
    if (!pro_id || !url) {
      return NextResponse.json({ error: "pro_id et url requis" }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    const { data: pro } = await supabaseAdmin
      .from("pros_sanitaire")
      .select("id, claimed_by, photos, slug, ville_slug, categorie")
      .eq("id", pro_id)
      .maybeSingle();
    if (!pro) return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });
    if (pro.claimed_by !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const photos: string[] = Array.isArray(pro.photos) ? pro.photos : [];
    const newPhotos = photos.filter((p) => p !== url);

    // Tente de supprimer le fichier physique uniquement s'il appartient au bucket sanitaire-photos
    const marker = "/sanitaire-photos/";
    const idx = url.indexOf(marker);
    if (idx >= 0) {
      const path = url.substring(idx + marker.length);
      try {
        await supabaseAdmin.storage.from("sanitaire-photos").remove([path]);
      } catch {}
    }

    const { error: updateError } = await supabaseAdmin
      .from("pros_sanitaire")
      .update({ photos: newPhotos })
      .eq("id", pro_id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    try {
      const categorieUrl = pro.categorie === "taxi_conventionne" ? "taxi-conventionne" : pro.categorie;
      revalidatePath(`/transport-medical/${pro.ville_slug}/${categorieUrl}/${pro.slug}`);
    } catch {}

    return NextResponse.json({ ok: true, photos: newPhotos });
  } catch (err) {
    console.error("[sanitaire-photo delete]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
