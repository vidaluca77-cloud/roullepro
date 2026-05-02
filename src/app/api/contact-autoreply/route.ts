export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * POST /api/contact-autoreply
 * Envoie une auto-réponse type "72h + liens utiles" à l'utilisateur
 * qui vient de soumettre le formulaire de contact via Netlify Forms.
 * N'a aucune dépendance avec la persistance Netlify.
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    // Limite 5/h par IP pour éviter qu'un bot transforme l'endpoint en mailer
    const { ok } = checkRateLimit(`contact-autoreply:${ip}`, 5, 3_600_000);
    if (!ok) {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: true });

    const email = String(body.email || "").trim().toLowerCase();
    const fullName = String(body.full_name || body.name || "").trim().slice(0, 80);
    const subject = String(body.subject || "").trim().slice(0, 80);

    // Email valide minimum
    if (!email || !email.includes("@") || email.length > 120) {
      return NextResponse.json({ ok: true });
    }

    const greeting = fullName ? `Bonjour ${escapeHtml(fullName)},` : "Bonjour,";
    const subjectLine = subject
      ? `Votre message « ${escapeHtml(subject)} » bien reçu — RoullePro`
      : "Votre message bien reçu — RoullePro";

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #0066CC; margin-bottom: 16px;">Bien reçu</h2>
        <p>${greeting}</p>
        <p>
          Merci d'avoir contacté RoullePro. Nous traitons toutes les demandes
          <strong>sous 72 heures ouvrées</strong>.
        </p>
        <div style="background: #f0f7ff; border: 1px solid #cfe3ff; border-radius: 12px; padding: 16px 20px; margin: 24px 0;">
          <p style="margin: 0 0 12px 0; font-weight: 600; color: #0b3a78;">
            Pour aller plus vite
          </p>
          <p style="margin: 0 0 8px 0; font-size: 14px;">
            La plupart des demandes ont une réponse immédiate via nos pages dédiées :
          </p>
          <ul style="margin: 12px 0 0 0; padding-left: 20px; font-size: 14px;">
            <li style="margin-bottom: 8px;">
              <strong>Vous êtes le professionnel d'une fiche ?</strong><br/>
              <a href="https://roullepro.com/transport-medical/pro/reclamer" style="color: #0066CC;">
                Réclamez votre fiche
              </a>
              et reprenez la main sur vos coordonnées en moins de 5 minutes.
            </li>
            <li style="margin-bottom: 8px;">
              <strong>Erreur sur une fiche, activité cessée, demande de suppression ?</strong><br/>
              <a href="https://roullepro.com/signaler" style="color: #0066CC;">
                Page de signalement
              </a>
              — toutes les corrections passent par là, traitement sous 72 h.
            </li>
            <li>
              <strong>Question RGPD ?</strong>
              <a href="https://roullepro.com/rgpd" style="color: #0066CC;">
                Politique RGPD et droits
              </a>.
            </li>
          </ul>
        </div>
        <p style="font-size: 13px; color: #6b7280;">
          Si votre demande concerne strictement une autre question, nous y répondrons par retour
          de cet email. Inutile de relancer avant 72 h.
        </p>
        <p style="font-size: 13px; color: #6b7280; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          L'équipe RoullePro<br/>
          <a href="https://roullepro.com" style="color: #0066CC;">roullepro.com</a>
        </p>
      </div>
    `;

    sendEmail({
      to: email,
      subject: subjectLine,
      html,
      reply_to: "contact@roullepro.com",
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[contact-autoreply]", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: true });
  }
}
