/**
 * Confirmation au patient après acceptation d'une course par un professionnel,
 * suite à une demande passée par téléphone via l'agent vocal IA (source_form
 * = 'voice_ia'). Même contenu informatif que la confirmation existante du
 * formulaire web, adapté pour rappeler que la demande a été prise par appel.
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  RP_COLOR_PRIMARY,
} from "@/lib/email-templates/sanitaire-base";

export interface VoiceConfirmationPatientParams {
  nomPatient: string;
  nomPro: string;
  telephonePro: string;
  typeTransport: string;
  dateSouhaitee: string;
  lienSuivi: string;
}

export function renderVoiceConfirmationPatient(p: VoiceConfirmationPatientParams): {
  subject: string;
  html: string;
  text: string;
} {
  const nomPatient = escapeHtml(p.nomPatient);
  const nomPro = escapeHtml(p.nomPro);
  const telephonePro = escapeHtml(p.telephonePro);
  const dateSouhaitee = escapeHtml(p.dateSouhaitee);
  const lienSuivi = escapeHtml(p.lienSuivi);

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Bonjour ${nomPatient},
    </p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Suite à votre appel, votre demande de transport a été prise en charge par
      <strong>${nomPro}</strong>.
    </p>

    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:10px;overflow:hidden">
      <tr>
        <td style="padding:12px 16px;color:#6b7280;font-size:13px">Professionnel</td>
        <td style="padding:12px 16px;color:#111827;font-size:14px;font-weight:600">${nomPro}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#6b7280;font-size:13px">Téléphone</td>
        <td style="padding:12px 16px;color:#111827;font-size:14px;font-weight:600">${telephonePro}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#6b7280;font-size:13px">Date souhaitée</td>
        <td style="padding:12px 16px;color:#111827;font-size:14px;font-weight:600">${dateSouhaitee}</td>
      </tr>
    </table>

    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Le professionnel vous contactera directement pour confirmer les derniers détails.
    </p>

    <div style="text-align:center;margin:32px 0">
      <a href="${lienSuivi}"
         style="display:inline-block;background:${RP_COLOR_PRIMARY};color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;line-height:1.2">
        Suivre ma demande
      </a>
    </div>

    <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6">
      Cette confirmation fait suite à un appel téléphonique traité par notre assistant.
      Si vous n'êtes pas à l'origine de cette demande, contactez-nous immédiatement.
    </p>
  `;

  const plainText = [
    `Bonjour ${p.nomPatient},`,
    "",
    `Suite à votre appel, votre demande de transport a été prise en charge par ${p.nomPro}.`,
    "",
    `Professionnel : ${p.nomPro}`,
    `Téléphone : ${p.telephonePro}`,
    `Date souhaitée : ${p.dateSouhaitee}`,
    "",
    "Le professionnel vous contactera directement pour confirmer les derniers détails.",
    "",
    `→ Suivre ma demande : ${p.lienSuivi}`,
    "",
    "─".repeat(60),
    "L'équipe RoullePro",
    "Annuaire du transport sanitaire",
    "06 15 47 28 13 · contact@roullepro.com",
    "https://www.roullepro.com",
  ].join("\n");

  const { html } = buildSanitaireEmail({
    preheader: `${p.nomPro} a accepté votre demande de transport.`,
    title: "Votre transport est confirmé",
    bodyHtml,
    plainText,
  });

  return {
    subject: `Confirmation — ${p.nomPro} prend en charge votre transport`,
    html,
    text: plainText,
  };
}
