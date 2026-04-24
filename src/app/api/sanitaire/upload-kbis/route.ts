export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

function extFromMime(mime: string): string {
  if (mime === "application/pdf") return "pdf";
  if (mime === "image/png") return "png";
  return "jpg";
}

function randomKey(): string {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).substring(2, 10)
  );
}

export async function POST(req: Request) {
  try {
    // Rate limit : 10 uploads / 10 min / IP
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`upload-kbis:${ip}`, 10, 600);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429 }
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
        { error: "Format non autorisé (PDF, JPG ou PNG uniquement)" },
        { status: 400 }
      );
    }

    const ext = extFromMime(mime);
    // Chemin : kbis/pending/YYYY-MM/<random>.<ext>
    const now = new Date();
    const yyyymm = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const path = `kbis/pending/${yyyymm}/${randomKey()}.${ext}`;

    const supabaseAdmin = getAdminClient();
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabaseAdmin.storage
      .from("sanitaire-documents")
      .upload(path, arrayBuffer, {
        contentType: mime,
        upsert: false,
      });

    if (uploadError) {
      console.error("[upload-kbis] upload error:", uploadError);
      return NextResponse.json(
        { error: "Erreur lors de l'upload. Réessayez." },
        { status: 500 }
      );
    }

    return NextResponse.json({ path, size: file.size, mime });
  } catch (err) {
    console.error("[upload-kbis] fatal:", err);
    return NextResponse.json(
      { error: "Erreur serveur. Réessayez." },
      { status: 500 }
    );
  }
}
