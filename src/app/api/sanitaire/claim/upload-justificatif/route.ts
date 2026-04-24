export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { ok } = checkRateLimit(`claim-upload:${ip}`, 5, 60_000);
    if (!ok) return NextResponse.json({ error: "Trop de tentatives" }, { status: 429 });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const claimId = form.get("claim_id") as string | null;
    if (!file || !claimId) return NextResponse.json({ error: "Fichier ou claim_id manquant" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Format non accepté (PDF, JPG, PNG uniquement)" }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    // Vérifie que le claim existe et est pending
    const { data: claim } = await supabaseAdmin
      .from("sanitaire_claims")
      .select("id, pro_id, status")
      .eq("id", claimId)
      .maybeSingle();
    if (!claim) return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });

    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const path = `${claim.pro_id}/${claim.id}-${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: upErr } = await supabaseAdmin.storage
      .from("sanitaire-justificatifs")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, justificatif_path: path });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
