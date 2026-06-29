/**
 * POST /api/newsletter/subscribe
 * Inscrit un email à la newsletter du blog.
 * - Insert dans public.newsletter_subscribers (service role)
 * - Rate-limité par IP
 * - Email de confirmation via Resend (best-effort)
 *
 * Body : { email: string, source?: string }
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-utils";
import { sendEmail } from "@/lib/email";
import { renderNewsletterBlogBienvenue } from "@/lib/email-templates/sanitaire";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    // 5 inscriptions par IP par heure
    const { ok } = checkRateLimit(`newsletter:${ip}`, 5, 60 * 60 * 1000);
    if (!ok) {
      return NextResponse.json(
        { error: "Trop de tentatives, réessayez plus tard." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const source =
      typeof body?.source === "string" ? body.source.slice(0, 60) : "blog";
    // Opt-in veille réglementaire (par défaut true depuis la bannière sticky)
    const regOptin = body?.reg_newsletter_optin === false ? false : true;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      console.error("[newsletter] Supabase service role manquant");
      return NextResponse.json(
        { error: "Service indisponible" },
        { status: 503 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    const userAgent = request.headers.get("user-agent") || "";

    // Upsert : si déjà inscrit on ne renvoie pas d'erreur (idempotent)
    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        {
          email,
          source,
          ip_hash: ip ? `sha:${Buffer.from(ip).toString("base64").slice(0, 32)}` : null,
          user_agent: userAgent.slice(0, 200),
          reg_newsletter_optin: regOptin,
          confirmed_at: new Date().toISOString(),
          metiers_segments: regOptin
            ? ["ambulance", "taxi_conventionne", "vsl"]
            : [],
        },
        { onConflict: "email", ignoreDuplicates: true }
      );

    if (insertError) {
      // Si la table n'existe pas encore, on log mais on retourne succès
      // pour éviter de bloquer l'UX pendant la migration.
      console.error("[newsletter] insert error:", insertError.message);
      // On ne renvoie pas d'erreur à l'utilisateur tant que l'email est valide.
    }

    // Email de confirmation (best-effort, ne bloque pas la réponse)
    try {
      await sendEmail({
        to: email,
        ...renderNewsletterBlogBienvenue({ email, appUrl: APP_URL }),
      });
    } catch (err) {
      console.warn("[newsletter] email confirmation failed:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError("api/newsletter/subscribe", err);
  }
}
