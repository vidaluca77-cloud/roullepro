export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

function getIpHash(req: Request): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function POST(req: Request) {
  try {
    const { pro_id } = await req.json();
    if (!pro_id) return NextResponse.json({ error: "pro_id requis" }, { status: 400 });

    const supabase = getAdminClient();
    const ipHash = getIpHash(req);
    const userAgent = req.headers.get("user-agent")?.slice(0, 200) || null;
    const referrer = req.headers.get("referer")?.slice(0, 200) || null;

    await supabase.from("sanitaire_vues").insert({
      pro_id,
      ip_hash: ipHash,
      user_agent: userAgent,
      referrer,
    });

    // Incrément atomique du compteur
    await supabase.rpc("increment_vues_sanitaire", { p_pro_id: pro_id }).then(() => undefined, async () => {
      // Fallback si la fonction RPC n'existe pas : fetch + update
      const { data } = await supabase
        .from("pros_sanitaire")
        .select("vues_totales")
        .eq("id", pro_id)
        .single();
      if (data) {
        await supabase
          .from("pros_sanitaire")
          .update({ vues_totales: (data.vues_totales ?? 0) + 1 })
          .eq("id", pro_id);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
