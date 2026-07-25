/**
 * Studio réseaux sociaux — email d'échec de publication automatique (Lot 3).
 *
 * Envoyé au pro lorsqu'un post planifié n'a pas pu être publié sur au moins une
 * cible (token expiré/révoqué, image manquante, refus de l'API). On liste les
 * réseaux en échec avec un motif court et on invite à corriger + republier depuis
 * le Studio. Aucun token ni détail sensible n'apparaît dans l'email.
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  RP_COLOR_DANGER,
} from "@/lib/email-templates/sanitaire-base";

export interface StudioSocialEchecParams {
  nomAffiche: string;
  /** Sujet ou début du contenu du post concerné. */
  sujet: string;
  /** Échecs par réseau : libellé du réseau + motif court. */
  echecs: Array<{ provider: string; motif: string }>;
  studioUrl: string;
}

const PROVIDER_LABEL: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  google_business: "Google Business Profile",
};

export function renderStudioSocialEchec(p: StudioSocialEchecParams): {
  subject: string;
  html: string;
  text: string;
} {
  const nomAffiche = escapeHtml(p.nomAffiche);
  const sujet = escapeHtml(p.sujet);

  const lignesHtml = p.echecs
    .map(
      (e) => `
        <li style="margin-bottom:6px">
          <strong>${escapeHtml(PROVIDER_LABEL[e.provider] || e.provider)}</strong> —
          <span style="color:#6b7280">${escapeHtml(e.motif)}</span>
        </li>`
    )
    .join("");

  const bodyHtml = `
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 20px;margin:0 0 24px;text-align:center">
      <div style="font-size:13px;font-weight:700;color:${RP_COLOR_DANGER};text-transform:uppercase;letter-spacing:.5px">
        Une publication automatique n'a pas abouti
      </div>
    </div>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6">Bonjour ${nomAffiche},</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Votre post planifié « <strong>${sujet}</strong> » n'a pas pu être publié sur
      ${p.echecs.length > 1 ? "les réseaux suivants" : "le réseau suivant"} :
    </p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#374151;line-height:1.7;font-size:14px">
      ${lignesHtml}
    </ul>
    <p style="margin:0 0 8px;color:#6b7280;line-height:1.6;font-size:13px">
      Vous pouvez vérifier vos connexions, corriger le post (par exemple ajouter une image
      pour Instagram) puis le replanifier depuis votre Studio réseaux sociaux.
    </p>
  `;

  const lignesText = p.echecs
    .map((e) => `- ${PROVIDER_LABEL[e.provider] || e.provider} : ${e.motif}`)
    .join("\n");

  const plainText = [
    "Une publication automatique n'a pas abouti — RoullePro",
    "─".repeat(60),
    "",
    `Bonjour ${p.nomAffiche},`,
    "",
    `Votre post planifié « ${p.sujet} » n'a pas pu être publié sur ${
      p.echecs.length > 1 ? "les réseaux suivants" : "le réseau suivant"
    } :`,
    "",
    lignesText,
    "",
    "Vous pouvez vérifier vos connexions, corriger le post (par exemple ajouter une image pour Instagram) puis le replanifier depuis votre Studio réseaux sociaux.",
    "",
    `→ Ouvrir mon Studio réseaux sociaux : ${p.studioUrl}`,
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
    preheader: `Votre post « ${p.sujet} » n'a pas pu être publié. Corrigez et replanifiez en 1 clic.`,
    title: "Une publication automatique n'a pas abouti",
    bodyHtml,
    ctaLabel: "Ouvrir mon Studio",
    ctaUrl: p.studioUrl,
    accentColor: RP_COLOR_DANGER,
    plainText,
  });

  return {
    subject: "Une publication réseaux sociaux RoullePro n'a pas abouti",
    html,
    text: plainText,
  };
}
