export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_PHOTOS = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

function extFromMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function randomKey(): string {
  return Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 10);
}

function isProPlan(plan: string | null | undefined): boolean {
  return plan === "essential" || plan === "premium" || plan === "pro_plus";
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`sanitaire-photo:${ip}`, 30, 600);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Trop d'envois récents. Réessayez dans quelques minutes." },
        { status: 429 }
      );
    }

    const supabaseUser = await createServerClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file");
    const proIdRaw = formData.get("pro_id");
    const proId = typeof proIdRaw === "string" ? proIdRaw : null;
    if (!proId) return NextResponse.json({ error: "pro_id requis" }, { status: 400 });

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "Fichier vide" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 5 Mo)" },
        { status: 400 }
      );
    }

    const mime = file.type || "application/octet-stream";
    if (!ALLOWED_TYPES.includes(mime)) {
      return NextResponse.json(
        { error: "Format non autorisé (JPG, PNG ou WEBP uniquement)" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminClient();

    // Vérifie ownership + plan
    const { data: pro, error: proError } = await supabaseAdmin
      .from("pros_sanitaire")
      .select("id, claimed_by, plan, photos, slug, ville_slug, categorie")
      .eq("id", proId)
      .maybeSingle();
    if (proError || !pro) {
      return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });
    }
    if (pro.claimed_by !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
    if (!isProPlan(pro.plan)) {
      return NextResponse.json(
        { error: "Photos réservées au plan Pro. Activez votre abonnement pour les ajouter." },
        { status: 402 }
      );
    }

    const photos: string[] = Array.isArray(pro.photos) ? pro.photos : [];
    if (photos.length >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Limite atteinte (${MAX_PHOTOS} photos max). Supprimez-en avant d'en ajouter.` },
        { status: 400 }
      );
    }

    const ext = extFromMime(mime);
    const path = `pros/${proId}/${randomKey()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from("sanitaire-photos")
      .upload(path, arrayBuffer, { contentType: mime, upsert: false });

    if (uploadError) {
      console.error("[sanitaire-photo upload]", uploadError);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi. Réessayez." },
        { status: 500 }
      );
    }

    const { data: pub } = supabaseAdmin.storage
      .from("sanitaire-photos")
      .getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    const newPhotos = [...photos, publicUrl];
    const { error: updateError } = await supabaseAdmin
      .from("pros_sanitaire")
      .update({ photos: newPhotos })
      .eq("id", proId);
    if (updateError) {
      // Rollback du fichier si update échoue
      await supabaseAdmin.storage.from("sanitaire-photos").remove([path]);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Invalide le cache des pages publiques
    try {
      const categorieUrl = pro.categorie === "taxi_conventionne" ? "taxi-conventionne" : pro.categorie;
      revalidatePath(`/transport-medical/${pro.ville_slug}/${categorieUrl}/${pro.slug}`);
    } catch {}

    return NextResponse.json({ ok: true, url: publicUrl, photos: newPhotos });
  } catch (err) {
    console.error("[sanitaire-photo upload fatal]", err);
    return NextResponse.json({ error: "Erreur serveur. Réessayez." }, { status: 500 });
  }
}
