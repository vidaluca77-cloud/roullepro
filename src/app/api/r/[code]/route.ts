export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getClientIp } from "@/lib/rate-limit";

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "roullepro-default-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

const CODE_RE = /^[a-z0-9_-]{2,40}$/i;

function isValidHttpsUrl(s: string): URL | null {
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") return null;
    if (!u.hostname || u.hostname.length > 253) return null;
    return u;
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const code = (params.code || "").trim();
    if (!CODE_RE.test(code)) {
      return NextResponse.json(
        { error: "Code partenaire invalide" },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const to = url.searchParams.get("to");
    if (!to) {
      return NextResponse.json(
        { error: "Paramètre 'to' manquant" },
        { status: 400 }
      );
    }

    const target = isValidHttpsUrl(to);
    if (!target) {
      return NextResponse.json(
        { error: "URL cible invalide (HTTPS requis)" },
        { status: 400 }
      );
    }

    // Log du clic (fire-and-forget, ne bloque pas la redirection)
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null;
    const referer = request.headers.get("referer")?.slice(0, 500) || null;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    supabaseAdmin
      .from("partner_clicks")
      .insert({
        partner_code: code.toLowerCase(),
        target_url: target.toString().slice(0, 1000),
        ip_hash: hashIp(ip),
        user_agent: userAgent,
        referer: referer,
      })
      .then(({ error }) => {
        if (error) {
          console.error("[partner-clicks] insert", error.message);
        }
      });

    // Redirection 302 immédiate
    return NextResponse.redirect(target.toString(), 302);
  } catch (e) {
    console.error("[r/code]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
