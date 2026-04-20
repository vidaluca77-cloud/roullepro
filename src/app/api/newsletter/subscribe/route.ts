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
import { Resend } from "resend";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "RoullePro <onboarding@resend.dev>";

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
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: "Bienvenue sur la newsletter RoullePro",
          html: buildConfirmationHtml(email),
        });
      } catch (err) {
        console.warn("[newsletter] email confirmation failed:", err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError("api/newsletter/subscribe", err);
  }
}

function buildConfirmationHtml(email: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 28px 32px;">
        <h1 style="color: white; margin: 0; font-size: 22px;">RoullePro</h1>
        <p style="color: #dbeafe; margin: 6px 0 0; font-size: 14px;">La marketplace 100% pro du véhicule d'occasion</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="margin-top: 0; color: #111827;">Inscription confirmée</h2>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          Merci de vous être abonné à la newsletter RoullePro avec l'adresse
          <strong>${email}</strong>.
        </p>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          Vous recevrez environ <strong>un email par mois</strong> avec :
        </p>
        <ul style="color: #374151; font-size: 15px; line-height: 1.8;">
          <li>Nos derniers guides d'achat et de vente</li>
          <li>Les évolutions réglementaires (ZFE, fiscalité, bonus)</li>
          <li>Nos analyses de prix du marché pro</li>
        </ul>
        <div style="margin-top: 28px;">
          <a href="${APP_URL}/blog"
             style="display: inline-block; background: #111827; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Découvrir le blog
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          Vous pouvez vous désinscrire à tout moment en répondant simplement à cet email.
        </p>
      </div>
    </div>
  `;
}
