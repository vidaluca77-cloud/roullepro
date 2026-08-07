/**
 * Email de suivi envoyé à un pro après un appel (dispatch ou dédié) où
 * l'agent vocal lui a proposé l'abonnement, pour lui laisser un lien cliquable
 * plutôt que de ne compter que sur la mémoire de l'appel.
 *
 * N'est envoyé QUE pour les pros en statut "essai_termine_libre" (cf.
 * /api/voice/statut-abonnement) — jamais à un abonné actif ni à un pro encore
 * en période offerte.
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  RP_COLOR_PRIMARY,
} from "@/lib/email-templates/sanitaire-base";

export interface VoicePropositionAbonnementParams {
  nomPro: string;
  lienAbonnement: string;
}

export function renderVoicePropositionAbonnement(p: VoicePropositionAbonnementParams): {
  subject: string;
  html: string;
  text: string;
} {
  const nomPro = escapeHtml(p.nomPro);
  const lienAbonnement = escapeHtml(p.lienAbonnement);

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Bonjour ${nomPro},
    </p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Suite à notre appel, voici le lien pour activer votre abonnement RoullePro
      et continuer à recevoir des demandes de transport de patients.
    </p>

    <div style="text-align:center;margin:32px 0">
      <a href="${lienAbonnement}"
         style="display:inline-block;background:${RP_COLOR_PRIMARY};color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;line-height:1.2">
        Activer mon abonnement
      </a>
    </div>

    <p style="margin:0 0 12px;color:#6b7280;font-size:13px;line-height:1.6">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur&nbsp;:
    </p>
    <p style="margin:0 0 20px;word-break:break-all;font-size:12px;color:#0066CC">
      ${lienAbonnement}
    </p>

    <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6">
      Cet e-mail fait suite à un appel téléphonique de notre assistant. Vous pouvez
      répondre à cet e-mail pour toute question, ou nous appeler directement.
    </p>
  `;

  const plainText = [
    `Bonjour ${p.nomPro},`,
    "",
    "Suite à notre appel, voici le lien pour activer votre abonnement RoullePro et continuer à recevoir des demandes de transport de patients.",
    "",
    `→ Activer mon abonnement : ${p.lienAbonnement}`,
    "",
    "Cet e-mail fait suite à un appel téléphonique de notre assistant. Vous pouvez répondre à cet e-mail pour toute question, ou nous appeler directement.",
    "",
    "─".repeat(60),
    "L'équipe RoullePro",
    "Annuaire du transport sanitaire",
    "06 15 47 28 13 · contact@roullepro.com",
    "https://www.roullepro.com",
  ].join("\n");

  const { html } = buildSanitaireEmail({
    preheader: "Le lien pour activer votre abonnement RoullePro suite à notre appel.",
    title: "Votre abonnement RoullePro",
    bodyHtml,
    plainText,
  });

  return {
    subject: "Votre lien d'abonnement RoullePro — suite à notre appel",
    html,
    text: plainText,
  };
}
