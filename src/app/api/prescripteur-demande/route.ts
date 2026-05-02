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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const TYPE_ORG_VALUES = [
  "cabinet_medical",
  "hopital",
  "ehpad",
  "dialyse",
  "autre",
] as const;
const TYPE_ORG_LABELS: Record<string, string> = {
  cabinet_medical: "Cabinet médical",
  hopital: "Hôpital / clinique",
  ehpad: "EHPAD",
  dialyse: "Centre de dialyse",
  autre: "Autre",
};

const VOLUME_VALUES = ["moins_10", "10_50", "50_200", "plus_200"] as const;
const VOLUME_LABELS: Record<string, string> = {
  moins_10: "Moins de 10 / mois",
  "10_50": "10 à 50 / mois",
  "50_200": "50 à 200 / mois",
  plus_200: "Plus de 200 / mois",
};

const PRESTA_VALUES = ["oui", "non", "parfois"] as const;
const PRESTA_LABELS: Record<string, string> = {
  oui: "Oui",
  non: "Non",
  parfois: "Parfois",
};

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isPhone(s: string): boolean {
  const digits = s.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 20;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    // Anti-spam : 3 demandes par IP par heure
    const { ok } = checkRateLimit(`prescripteur-demande:${ip}`, 3, 3_600_000);
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
      organisation,
      type_organisation,
      ville,
      prenom,
      nom,
      email,
      telephone,
      volume_mensuel,
      prestataire_actuel,
      message,
      hp,
    } = body;

    // Honeypot : on retourne ok silencieusement
    if (hp) {
      return NextResponse.json({ ok: true });
    }

    // Validations
    if (!organisation || typeof organisation !== "string" || organisation.trim().length < 2) {
      return NextResponse.json({ error: "Organisation requise" }, { status: 400 });
    }
    if (!type_organisation || !TYPE_ORG_VALUES.includes(type_organisation)) {
      return NextResponse.json({ error: "Type d'organisation invalide" }, { status: 400 });
    }
    if (!ville || typeof ville !== "string" || ville.trim().length < 2) {
      return NextResponse.json({ error: "Ville requise" }, { status: 400 });
    }
    if (!prenom || typeof prenom !== "string" || prenom.trim().length < 2) {
      return NextResponse.json({ error: "Prénom requis" }, { status: 400 });
    }
    if (!nom || typeof nom !== "string" || nom.trim().length < 2) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !isEmail(email.trim())) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }
    if (!telephone || typeof telephone !== "string" || !isPhone(telephone.trim())) {
      return NextResponse.json({ error: "Téléphone invalide" }, { status: 400 });
    }
    if (!volume_mensuel || !VOLUME_VALUES.includes(volume_mensuel)) {
      return NextResponse.json({ error: "Volume invalide" }, { status: 400 });
    }
    if (!prestataire_actuel || !PRESTA_VALUES.includes(prestataire_actuel)) {
      return NextResponse.json({ error: "Réponse prestataire invalide" }, { status: 400 });
    }

    const cleanOrg = organisation.trim().slice(0, 200);
    const cleanVille = ville.trim().slice(0, 100);
    const cleanPrenom = prenom.trim().slice(0, 80);
    const cleanNom = nom.trim().slice(0, 80);
    const cleanEmail = email.trim().slice(0, 200).toLowerCase();
    const cleanPhone = telephone.trim().slice(0, 30);
    const cleanMsg = message ? String(message).trim().slice(0, 2000) : null;
    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("prescripteur_demandes")
      .insert({
        organisation: cleanOrg,
        type_organisation,
        ville: cleanVille,
        prenom: cleanPrenom,
        nom: cleanNom,
        email: cleanEmail,
        telephone: cleanPhone,
        volume_mensuel,
        prestataire_actuel,
        message: cleanMsg,
        ip_hash: hashIp(ip),
        user_agent: userAgent,
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("[prescripteur-demande] insert", insertErr);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Email 1 : récap vers contact@
    const adminSubject = `Nouvelle demande pilote prescripteur — ${cleanOrg} (${cleanVille})`;
    const adminHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #0066CC; margin-bottom: 16px;">Nouvelle demande d'accès pilote</h2>
        <p>Un prescripteur souhaite tester RoullePro.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f9fafb; border-radius: 8px; overflow: hidden;">
          <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; width: 40%;"><strong>Organisation</strong></td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(cleanOrg)}</td></tr>
          <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;"><strong>Type</strong></td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(TYPE_ORG_LABELS[type_organisation])}</td></tr>
          <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;"><strong>Ville</strong></td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(cleanVille)}</td></tr>
          <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;"><strong>Contact</strong></td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(cleanPrenom)} ${escapeHtml(cleanNom)}</td></tr>
          <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;"><strong>Email</strong></td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${escapeHtml(cleanEmail)}" style="color: #0066CC;">${escapeHtml(cleanEmail)}</a></td></tr>
          <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;"><strong>Téléphone</strong></td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;"><a href="tel:${escapeHtml(cleanPhone.replace(/\s/g, ""))}" style="color: #0066CC;">${escapeHtml(cleanPhone)}</a></td></tr>
          <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;"><strong>Volume mensuel</strong></td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(VOLUME_LABELS[volume_mensuel])}</td></tr>
          <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;"><strong>Prestataire actuel</strong></td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(PRESTA_LABELS[prestataire_actuel])}</td></tr>
          ${cleanMsg ? `<tr><td style="padding: 12px 16px; vertical-align: top;"><strong>Message</strong></td><td style="padding: 12px 16px; white-space: pre-wrap;">${escapeHtml(cleanMsg)}</td></tr>` : ""}
        </table>
        <p style="font-size: 13px; color: #6b7280; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          Demande #${inserted.id.slice(0, 8)} reçue depuis la page <a href="https://roullepro.com/prescripteurs" style="color: #0066CC;">/prescripteurs</a>.
        </p>
      </div>
    `;

    sendEmail({
      to: "contact@roullepro.com",
      subject: adminSubject,
      html: adminHtml,
      reply_to: cleanEmail,
    }).catch(() => {});

    // Email 2 : auto-réponse au prescripteur
    const userSubject = "Votre demande d'accès pilote RoullePro";
    const userHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #0066CC; margin-bottom: 16px;">Merci pour votre demande</h2>
        <p>Bonjour ${escapeHtml(cleanPrenom)},</p>
        <p>
          Nous avons bien reçu votre demande d'accès pilote pour
          <strong>${escapeHtml(cleanOrg)}</strong>.
        </p>
        <p>
          Notre équipe revient vers vous <strong>sous 48h ouvrées</strong> pour organiser
          votre accès et répondre à vos questions.
        </p>
        <p style="background: #f0f7ff; border-left: 4px solid #0066CC; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
          Pendant 3 mois, vous bénéficiez d'un accès gratuit, sans engagement,
          à l'ensemble de l'annuaire opérationnel du transport sanitaire en France.
        </p>
        <p>
          En attendant, vous pouvez déjà consulter
          <a href="https://roullepro.com/transport-medical" style="color: #0066CC;">notre annuaire public</a>
          (24 000+ fiches actives, numéros directs, 100 % gratuit pour les patients).
        </p>
        <p style="margin-top: 24px;">
          Une question urgente ? Répondez simplement à cet email ou écrivez à
          <a href="mailto:contact@roullepro.com" style="color: #0066CC;">contact@roullepro.com</a>.
        </p>
        <p style="margin-top: 24px;">
          Cordialement,<br/>
          L'équipe RoullePro
        </p>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          RoullePro — Annuaire opérationnel du transport sanitaire en France.
          Pas d'algorithme, pas de notation, contacts visibles à vie.
        </p>
      </div>
    `;

    sendEmail({
      to: cleanEmail,
      subject: userSubject,
      html: userHtml,
    }).catch(() => {});

    return NextResponse.json({ ok: true, id: inserted.id });
  } catch (e) {
    console.error("[prescripteur-demande]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
