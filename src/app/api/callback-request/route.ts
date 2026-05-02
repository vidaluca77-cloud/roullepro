export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "roullepro-default-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

const SLOT_LABELS: Record<string, string> = {
  asap: "Dès que possible",
  matin: "Matin",
  "apres-midi": "Après-midi",
  soir: "Soir",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    // Anti-spam : 3 demandes par IP par heure
    const { ok } = checkRateLimit(`callback-request:${ip}`, 3, 3_600_000);
    if (!ok) {
      return NextResponse.json(
        { error: "Trop de demandes, réessayez plus tard." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Body invalide" }, { status: 400 });
    }

    const {
      pro_id,
      visitor_name,
      visitor_phone,
      visitor_message,
      preferred_slot,
      hp,
    } = body;

    // Honeypot
    if (hp) {
      return NextResponse.json({ ok: true });
    }

    if (!pro_id || typeof pro_id !== "string") {
      return NextResponse.json({ error: "pro_id manquant" }, { status: 400 });
    }
    if (!visitor_name || typeof visitor_name !== "string" || visitor_name.trim().length < 2) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }
    if (!visitor_phone || typeof visitor_phone !== "string" || visitor_phone.trim().length < 6) {
      return NextResponse.json({ error: "Téléphone requis" }, { status: 400 });
    }
    if (preferred_slot && !["asap", "matin", "apres-midi", "soir"].includes(preferred_slot)) {
      return NextResponse.json({ error: "Créneau invalide" }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Charger la fiche pour email_public et nom
    const { data: fiche } = await supabaseAdmin
      .from("pros_sanitaire")
      .select("id, raison_sociale, nom_commercial, email_public, ville, slug, ville_slug, categorie")
      .eq("id", pro_id)
      .maybeSingle();

    if (!fiche) {
      return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });
    }

    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null;
    const cleanName = visitor_name.trim().slice(0, 80);
    const cleanPhone = visitor_phone.trim().slice(0, 20);
    const cleanMsg = visitor_message ? String(visitor_message).trim().slice(0, 500) : null;
    const slot = preferred_slot || "asap";

    // Destinataire email (selon décision Lucas : si pas d'email_public, on route vers contact@)
    const FALLBACK = "contact@roullepro.com";
    const target = fiche.email_public && fiche.email_public.includes("@")
      ? fiche.email_public
      : FALLBACK;

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("callback_requests")
      .insert({
        pro_id: fiche.id,
        visitor_name: cleanName,
        visitor_phone: cleanPhone,
        visitor_message: cleanMsg,
        preferred_slot: slot,
        email_sent_to: target,
        ip_hash: hashIp(ip),
        user_agent: userAgent,
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("[callback-request] insert", insertErr);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Envoi email (silencieux si Resend non configuré)
    const proNom = fiche.nom_commercial || fiche.raison_sociale;
    const ficheUrl = `https://roullepro.com/transport-medical/${fiche.ville_slug}/${
      fiche.categorie === "taxi_conventionne" ? "taxi-conventionne" : fiche.categorie
    }/${fiche.slug}`;
    const dashboardUrl = "https://roullepro.com/transport-medical/pro/dashboard";

    const subject = target === FALLBACK
      ? `[Demande de rappel non routée] ${proNom} (${fiche.ville})`
      : `Nouvelle demande de rappel — ${cleanName}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #0066CC; margin-bottom: 16px;">Nouvelle demande de rappel</h2>
        <p>Bonjour,</p>
        <p>
          Un visiteur de RoullePro souhaite être rappelé par
          <strong>${escapeHtml(proNom)}</strong> (${escapeHtml(fiche.ville)}).
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f9fafb; border-radius: 8px; overflow: hidden;">
          <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;"><strong>Nom</strong></td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(cleanName)}</td></tr>
          <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;"><strong>Téléphone</strong></td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;"><a href="tel:${escapeHtml(cleanPhone.replace(/\s/g, ""))}" style="color: #0066CC;">${escapeHtml(cleanPhone)}</a></td></tr>
          <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;"><strong>Créneau souhaité</strong></td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(SLOT_LABELS[slot] || slot)}</td></tr>
          ${cleanMsg ? `<tr><td style="padding: 12px 16px; vertical-align: top;"><strong>Message</strong></td><td style="padding: 12px 16px; white-space: pre-wrap;">${escapeHtml(cleanMsg)}</td></tr>` : ""}
        </table>
        <p style="margin-top: 24px;">
          <a href="${dashboardUrl}" style="display: inline-block; background: #0066CC; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Voir mon tableau de bord
          </a>
        </p>
        <p style="font-size: 13px; color: #6b7280; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          Demande envoyée depuis <a href="${ficheUrl}" style="color: #0066CC;">votre fiche RoullePro</a>.
          Vous pouvez répondre directement à cet email pour contacter le visiteur,
          ou simplement le rappeler au numéro ci-dessus.
        </p>
      </div>
    `;

    // sendEmail est silencieux en cas d'erreur, on ne bloque pas la réponse
    sendEmail({ to: target, subject, html }).catch(() => {});

    return NextResponse.json({ ok: true, id: inserted.id });
  } catch (e) {
    console.error("[callback-request]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
