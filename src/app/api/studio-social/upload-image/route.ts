/**
 * POST /api/studio-social/upload-image
 *
 * Upload d'une image (multipart/form-data) pour un post du Studio réseaux
 * sociaux, stockée dans le bucket public `studio-social`. Remplace la saisie
 * d'une URL externe : les pros n'ont pas d'URL d'image à disposition, ils ont
 * un fichier sur leur téléphone/ordinateur.
 *
 * Réservé aux abonnés Pro actifs (même garde que le reste du Studio). L'URL
 * publique renvoyée est celle attendue par Facebook (/photos, /feed) et
 * Instagram (/media) qui téléchargent l'image depuis cette URL — elle doit
 * donc être publiquement accessible sans authentification.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import { getProStudioActif } from "@/lib/studio-social";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo — aligné sur le bucket studio-social
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const BUCKET = "studio-social";

function extFromMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function randomKey(): string {
  return Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 10);
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`studio-social-image:${ip}`, 30, 600);
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

    const admin = getAdminServiceClient();
    const pro = await getProStudioActif(admin, user.id);
    if (!pro) {
      return NextResponse.json(
        { error: "Le Studio réseaux sociaux est réservé aux abonnés Pro." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
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

    const ext = extFromMime(mime);
    const path = `pros/${pro.id}/${randomKey()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, { contentType: mime, upsert: false });

    if (uploadError) {
      console.error("[studio-social upload-image]", uploadError);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi. Réessayez." },
        { status: 500 }
      );
    }

    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ ok: true, url: pub.publicUrl });
  } catch (err) {
    console.error("[studio-social upload-image fatal]", err);
    return NextResponse.json({ error: "Erreur serveur. Réessayez." }, { status: 500 });
  }
}
