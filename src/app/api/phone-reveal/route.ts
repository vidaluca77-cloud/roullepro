export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "roullepro-default-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    // Anti-spam : 30 reveals par IP par heure (un visiteur normal en fait < 5)
    const { ok } = checkRateLimit(`phone-reveal:${ip}`, 30, 3_600_000);
    if (!ok) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const body = await request.json().catch(() => null);
    const proId = body?.pro_id;
    if (!proId || typeof proId !== "string") {
      return NextResponse.json({ error: "pro_id manquant" }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Vérifier que la fiche existe (silencieux pour ne pas leaker)
    const { data: fiche } = await supabaseAdmin
      .from("pros_sanitaire")
      .select("id")
      .eq("id", proId)
      .maybeSingle();
    if (!fiche) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null;
    const referrer = request.headers.get("referer")?.slice(0, 500) || null;

    await supabaseAdmin.from("phone_reveals").insert({
      pro_id: proId,
      ip_hash: hashIp(ip),
      user_agent: userAgent,
      referrer,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[phone-reveal]", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: true });
  }
}
