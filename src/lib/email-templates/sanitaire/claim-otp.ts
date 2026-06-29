/**
 * Email 4 — Code OTP de vérification (au pro)
 * Déclenché lors du démarrage d'une réclamation de fiche via e-mail.
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  RP_COLOR_PRIMARY,
} from "@/lib/email-templates/sanitaire-base";

export interface ClaimOtpParams {
  code: string;
  nomAffiche: string;
}

export function renderClaimOtp(p: ClaimOtpParams): {
  subject: string;
  html: string;
  text: string;
} {
  const code       = escapeHtml(p.code);
  const nomAffiche = escapeHtml(p.nomAffiche);

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Voici votre code de vérification pour réclamer la fiche
      <strong>${nomAffiche}</strong> sur RoullePro Transport Sanitaire.
    </p>

    <!-- Bloc code OTP -->
    <div style="background:#f0f6ff;border:1px solid #cfe3ff;border-radius:12px;padding:24px;margin:24px 0;text-align:center">
      <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:${RP_COLOR_PRIMARY};line-height:1.2">
        ${code}
      </div>
    </div>

    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Ce code expire dans <strong>15 minutes</strong>.
    </p>

    <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6">
      Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.
      Après saisie du code, votre réclamation sera validée manuellement par notre équipe sous 24 h ouvrées.
    </p>
  `;

  const plainText = [
    `Code de vérification : ${p.code} — RoullePro`,
    "─".repeat(60),
    "",
    `Voici votre code de vérification pour réclamer la fiche ${p.nomAffiche} sur RoullePro Transport Sanitaire.`,
    "",
    `Votre code : ${p.code}`,
    "",
    "Ce code expire dans 15 minutes.",
    "",
    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.",
    "Après saisie du code, votre réclamation sera validée manuellement par notre équipe sous 24 h ouvrées.",
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
    preheader: "Votre code de vérification expire dans 15 minutes.",
    title: "Vérification de votre fiche",
    bodyHtml,
    plainText,
  });

  return {
    subject: `Code de vérification : ${p.code} — RoullePro`,
    html,
    text: plainText,
  };
}
