/**
 * Drip 3 — J-13 avant la fin de l'essai (fenêtre configurable avant plan_expires_at).
 * Objectif : pousser la conversion Essential 19,90 €/mois — message urgence + récap valeur.
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  PRICE_ESSENTIAL_DISPLAY,
  RP_COLOR_DANGER,
  RP_COLOR_PRIMARY,
  RP_COLOR_SUCCESS,
} from "@/lib/email-templates/sanitaire-base";

export interface DripJ13PreExpireParams {
  nomAffiche: string;
  ville: string | null;
  joursRestants: number;
  expiresAt: string; // ISO
  viewsTotal: number;
  revealsTotal: number;
  messagesTotal: number;
  upgradeUrl: string;
  dashboardUrl: string;
}

function formatDateFR(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function renderDripJ13PreExpire(p: DripJ13PreExpireParams): {
  subject: string;
  html: string;
  text: string;
} {
  const nomAffiche = escapeHtml(p.nomAffiche);
  const ville = p.ville ? escapeHtml(p.ville) : null;
  const dateFin = formatDateFR(p.expiresAt);

  const jours = p.joursRestants;
  const urgent = jours <= 7;

  const totalSignaux = p.viewsTotal + p.revealsTotal + p.messagesTotal;

  const headerBadge = `
    <div style="background:${urgent ? "#fef2f2" : "#fffbeb"};border:1px solid ${urgent ? "#fecaca" : "#fde68a"};border-radius:12px;padding:14px 20px;margin:0 0 24px;text-align:center">
      <div style="font-size:13px;font-weight:700;color:${urgent ? RP_COLOR_DANGER : "#92400e"};text-transform:uppercase;letter-spacing:.5px">
        Votre essai expire dans ${jours} jour${jours > 1 ? "s" : ""} &mdash; le ${dateFin}
      </div>
    </div>
  `;

  const statsBlock = totalSignaux > 0
    ? `
      <div style="background:#f0f6ff;border:1px solid #cfe3ff;border-radius:12px;padding:18px 22px;margin:0 0 24px">
        <div style="font-size:13px;font-weight:700;color:${RP_COLOR_PRIMARY};margin-bottom:14px;text-transform:uppercase;letter-spacing:.5px">
          Ce que vous a apporté l'essai
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="text-align:center">
          <tr>
            <td style="padding:8px 4px">
              <div style="font-size:26px;font-weight:700;color:#111827;line-height:1.1">${p.viewsTotal}</div>
              <div style="font-size:12px;color:#6b7280;margin-top:4px">vues totales</div>
            </td>
            <td style="padding:8px 4px;border-left:1px solid #cfe3ff;border-right:1px solid #cfe3ff">
              <div style="font-size:26px;font-weight:700;color:#111827;line-height:1.1">${p.revealsTotal}</div>
              <div style="font-size:12px;color:#6b7280;margin-top:4px">numéros révélés</div>
            </td>
            <td style="padding:8px 4px">
              <div style="font-size:26px;font-weight:700;color:#111827;line-height:1.1">${p.messagesTotal}</div>
              <div style="font-size:12px;color:#6b7280;margin-top:4px">messages</div>
            </td>
          </tr>
        </table>
      </div>
    `
    : "";

  const valueProps = `
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:18px 22px;margin:0 0 24px">
      <div style="font-size:13px;font-weight:700;color:${RP_COLOR_SUCCESS};margin-bottom:12px;text-transform:uppercase;letter-spacing:.5px">
        En continuant avec Essential — ${PRICE_ESSENTIAL_DISPLAY}
      </div>
      <ul style="margin:0;padding-left:20px;color:#374151;line-height:1.8;font-size:14px">
        <li>Coordonnées affichées <strong>en premier</strong> dans votre département</li>
        <li>Badge <strong>Pro vérifié</strong> conservé sur votre fiche</li>
        <li>Réception illimitée des demandes de transport sur votre zone</li>
        <li>Statistiques détaillées (vues, reveals, messages)</li>
        <li>Sans engagement &mdash; <strong>résiliable en 1 clic</strong> à tout moment</li>
      </ul>
    </div>
  `;

  const downgrade = `
    <p style="margin:0 0 8px;color:#6b7280;line-height:1.6;font-size:13px">
      Si vous ne souhaitez pas continuer, votre fiche restera visible en mode gratuit
      mais perdra le badge Pro vérifié et passera après les pros Essential dans les résultats
      de votre département.
    </p>
  `;

  const intro = ville
    ? `<p style="margin:0 0 16px;color:#374151;line-height:1.6">Bonjour ${nomAffiche},</p>
       <p style="margin:0 0 16px;color:#374151;line-height:1.6">
         Votre essai Essential gratuit sur ${ville} se termine dans <strong>${jours} jours</strong>,
         le <strong>${dateFin}</strong>.
       </p>`
    : `<p style="margin:0 0 16px;color:#374151;line-height:1.6">Bonjour ${nomAffiche},</p>
       <p style="margin:0 0 16px;color:#374151;line-height:1.6">
         Votre essai Essential gratuit se termine dans <strong>${jours} jours</strong>,
         le <strong>${dateFin}</strong>.
       </p>`;

  const bodyHtml = `
    ${headerBadge}
    ${intro}
    ${statsBlock}
    ${valueProps}
    ${downgrade}
  `;

  const plainText = [
    `Votre essai expire dans ${jours} jour${jours > 1 ? "s" : ""} — RoullePro`,
    "─".repeat(60),
    "",
    `Bonjour ${p.nomAffiche},`,
    "",
    `Votre essai Essential gratuit${ville ? ` sur ${p.ville}` : ""} se termine dans ${jours} jours, le ${dateFin}.`,
    "",
    ...(totalSignaux > 0 ? [
      "CE QUE VOUS A APPORTÉ L'ESSAI",
      `- ${p.viewsTotal} vues totales`,
      `- ${p.revealsTotal} numéros révélés`,
      `- ${p.messagesTotal} messages`,
      "",
    ] : []),
    `EN CONTINUANT AVEC ESSENTIAL — ${PRICE_ESSENTIAL_DISPLAY}`,
    "- Coordonnées affichées EN PREMIER dans votre département",
    "- Badge Pro vérifié conservé",
    "- Réception illimitée des demandes de transport sur votre zone",
    "- Statistiques détaillées (vues, reveals, messages)",
    "- Sans engagement — résiliable en 1 clic à tout moment",
    "",
    "Si vous ne souhaitez pas continuer, votre fiche restera visible en mode gratuit mais perdra le badge Pro vérifié et passera après les pros Essential dans les résultats.",
    "",
    `→ Passer à Essential — ${PRICE_ESSENTIAL_DISPLAY} : ${p.upgradeUrl}`,
    `→ Mon tableau de bord : ${p.dashboardUrl}`,
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
    preheader: `Plus que ${jours} jour${jours > 1 ? "s" : ""} pour continuer votre fiche RoullePro Essential.`,
    title: urgent
      ? `Plus que ${jours} jour${jours > 1 ? "s" : ""} avant la fin de votre essai`
      : "Votre essai Essential expire bientôt",
    bodyHtml,
    ctaLabel: `Passer à Essential — ${PRICE_ESSENTIAL_DISPLAY}`,
    ctaUrl: p.upgradeUrl,
    accentColor: urgent ? RP_COLOR_DANGER : RP_COLOR_SUCCESS,
    plainText,
  });

  return {
    subject: urgent
      ? `Plus que ${jours} jour${jours > 1 ? "s" : ""} : continuez votre fiche pour ${PRICE_ESSENTIAL_DISPLAY}`
      : `Votre essai expire bientôt — continuez pour ${PRICE_ESSENTIAL_DISPLAY}`,
    html,
    text: plainText,
  };
}
