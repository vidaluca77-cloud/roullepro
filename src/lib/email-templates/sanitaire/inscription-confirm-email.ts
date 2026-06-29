/**
 * Email 2 — Confirmation d'adresse e-mail (au pro)
 * Déclenché après génération du lien Supabase signup.
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  RP_COLOR_PRIMARY,
} from "@/lib/email-templates/sanitaire-base";

export interface InscriptionConfirmEmailParams {
  actionLink: string;
}

export function renderInscriptionConfirmEmail(p: InscriptionConfirmEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const safeLink = escapeHtml(p.actionLink);

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Pour activer votre compte RoullePro et accéder à votre espace pro,
      confirmez votre adresse e-mail en cliquant sur le bouton ci-dessous.
    </p>

    <div style="text-align:center;margin:32px 0">
      <a href="${safeLink}"
         style="display:inline-block;background:${RP_COLOR_PRIMARY};color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;line-height:1.2">
        Confirmer mon e-mail
      </a>
    </div>

    <p style="margin:0 0 12px;color:#6b7280;font-size:13px;line-height:1.6">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur&nbsp;:
    </p>
    <p style="margin:0 0 20px;word-break:break-all;font-size:12px;color:#0066CC">
      ${safeLink}
    </p>

    <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6">
      Lien valable 24 heures. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.
    </p>
  `;

  const plainText = [
    "Confirmez votre adresse e-mail",
    "─".repeat(60),
    "",
    "Pour activer votre compte RoullePro et accéder à votre espace pro, confirmez votre adresse e-mail en cliquant sur le lien ci-dessous.",
    "",
    `→ Confirmer mon e-mail : ${p.actionLink}`,
    "",
    "Lien valable 24 heures. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.",
    "",
    "─".repeat(60),
    "L'équipe RoullePro",
    "Annuaire du transport sanitaire",
    "06 15 47 28 13 · contact@roullepro.com",
    "https://www.roullepro.com",
    "",
    "E-mail transactionnel envoyé suite à une action sur votre compte RoullePro.",
  ].join("\n");

  const { html } = buildSanitaireEmail({
    preheader: "Cliquez pour activer votre compte RoullePro Transport Sanitaire.",
    title: "Confirmez votre adresse e-mail",
    bodyHtml,
    // Le CTA est inline dans le bodyHtml — pas de ctaLabel/ctaUrl séparés pour éviter doublon
    plainText,
  });

  return {
    subject: "Confirmez votre adresse e-mail — RoullePro",
    html,
    text: plainText,
  };
}
