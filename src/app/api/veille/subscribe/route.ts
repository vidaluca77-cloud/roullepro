/**
 * POST /api/veille/subscribe
 * Inscription double opt-in a la newsletter veille reglementaire.
 *
 * Body : { email: string, metiers: string[] } ou metiers in {ambulance, vsl, taxi_conventionne}
 *
 * - Rate-limite par IP (5/heure)
 * - Validation email + au moins 1 metier
 * - Upsert sur newsletter_subscribers avec source='veille_reglementaire',
 *   confirmation_token = uuid, expires_at = now + 72h, reg_newsletter_optin=false
 * - Si deja inscrit avec reg_newsletter_optin=true : renvoie message "deja inscrit"
 * - Envoi mail de confirmation Resend (best-effort, non bloquant pour la reponse)
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-utils";
import {
  VEILLE_FROM_EMAIL,
  buildVeilleConfirmationHtml,
} from "@/lib/veille-email-templates";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";
const ALLOWED_METIERS = new Set(["ambulance", "vsl", "taxi_conventionne"]);

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { ok } = checkRateLimit(`veille-subscribe:${ip}`, 5, 60 * 60 * 1000);
    if (!ok) {
      return NextResponse.json(
        { error: "Trop de tentatives, réessayez dans une heure." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const rawMetiers = Array.isArray(body?.metiers) ? body.metiers : [];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const metiers: string[] = Array.from(
      new Set(
        (rawMetiers as unknown[])
          .filter((m): m is string => typeof m === "string")
          .map((m) => m.trim().toLowerCase())
          .filter((m) => ALLOWED_METIERS.has(m))
      )
    );

    if (metiers.length === 0) {
      return NextResponse.json(
        { error: "Sélectionnez au moins un métier" },
        { status: 400 }
      );
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      console.error("[veille-subscribe] Supabase service role manquant");
      return NextResponse.json(
        { error: "Service indisponible" },
        { status: 503 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // Verifier si deja inscrit avec opt-in confirme.
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, reg_newsletter_optin, unsubscribed_at")
      .eq("email", email)
      .maybeSingle();

    if (existing?.reg_newsletter_optin === true && !existing.unsubscribed_at) {
      return NextResponse.json({
        ok: true,
        alreadySubscribed: true,
        message: "Vous êtes déjà inscrit à la veille.",
      });
    }

    const confirmationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    const userAgent = (request.headers as Headers).get("user-agent") || "";
    const ipHash = ip
      ? `sha:${Buffer.from(ip).toString("base64").slice(0, 32)}`
      : null;

    const upsertPayload = {
      email,
      source: "veille_reglementaire",
      metiers_segments: metiers,
      confirmation_token: confirmationToken,
      confirmation_token_expires_at: expiresAt,
      reg_newsletter_optin: false,
      unsubscribed_at: null,
      ip_hash: ipHash,
      user_agent: userAgent.slice(0, 200),
    };

    const { error: upsertError } = await supabase
      .from("newsletter_subscribers")
      .upsert(upsertPayload, { onConflict: "email" });

    if (upsertError) {
      console.error("[veille-subscribe] upsert error:", upsertError.message);
      return NextResponse.json(
        { error: "Inscription impossible. Réessayez plus tard." },
        { status: 500 }
      );
    }

    // Envoi email confirmation (best-effort, n'echoue pas la requete).
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        const confirmUrl = `${APP_URL}/api/veille/confirm?token=${confirmationToken}`;
        await resend.emails.send({
          from: VEILLE_FROM_EMAIL,
          to: email,
          subject: "Confirmez votre inscription à la veille RoullePro",
          html: buildVeilleConfirmationHtml({
            email,
            metiers,
            confirmUrl,
          }),
        });
      } catch (err) {
        console.warn("[veille-subscribe] resend send failed:", err);
      }
    } else {
      console.warn("[veille-subscribe] RESEND_API_KEY manquant, email non envoye");
    }

    return NextResponse.json({
      ok: true,
      message: "Email de confirmation envoyé. Vérifiez votre boîte mail.",
    });
  } catch (err) {
    return apiError("api/veille/subscribe", err);
  }
}
