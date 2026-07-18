/**
 * Drip 2 — J+5 après octroi de l'essai Essential (essai 7 jours).
 * Objectif : rappeler que l'essai se termine bientôt + récap valeur + conversion.
 *
 * Envoyé uniquement aux essais AUTO (sans carte enregistrée). Les pros ayant activé
 * un abonnement Stripe reçoivent le rappel Stripe trial_will_end (~J-3) ; le cron ne
 * leur envoie donc pas cet email (voir drip-essential/route.ts) pour éviter un doublon.
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  PRICE_ESSENTIAL_DISPLAY,
  RP_COLOR_PRIMARY,
  RP_COLOR_SUCCESS,
} from "@/lib/email-templates/sanitaire-base";

export interface DripJ5Params {
  nomAffiche: string;
  ville: string | null;
  joursRestants: number;
  expiresAt: string; // ISO
  viewsTotal: number;
  revealsTotal: number;
  messagesTotal: number;
  dashboardUrl: string;
  upgradeUrl: string;
}

function formatDateFR(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Paris",
    });
  } catch {
    return iso;
  }
}

export function renderDripJ5FinEssai(p: DripJ5Params): {
  subject: string;
  html: string;
  text: string;
} {
  const nomAffiche = escapeHtml(p.nomAffiche);
  const ville = p.ville ? escapeHtml(p.ville) : null;
  const jours = p.joursRestants;
  const joursLabel = `${jours} jour${jours > 1 ? "s" : ""}`;
  const dateFin = formatDateFR(p.expiresAt);
  const totalSignaux = p.viewsTotal + p.revealsTotal + p.messagesTotal;

  const headerBadge = `
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 20px;margin:0 0 24px;text-align:center">
      <div style="font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.5px">
        Votre essai gratuit se termine dans ${joursLabel} &mdash; le ${dateFin}
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
        En continuant avec le plan Pro — ${escapeHtml(PRICE_ESSENTIAL_DISPLAY)}
      </div>
      <ul style="margin:0;padding-left:20px;color:#374151;line-height:1.8;font-size:14px">
        <li>Demandes de transport de votre département reçues <strong>par email</strong></li>
        <li>Badge <strong>Pro vérifié</strong> conservé et fiche affichée en premier</li>
        <li>Équipe de <strong>6 experts IA</strong> du transport sanitaire (réponses sourcées)</li>
        <li>Forum entre pros vérifiés et statistiques détaillées</li>
        <li>Sans engagement &mdash; <strong>résiliable en 1 clic</strong> à tout moment</li>
      </ul>
    </div>
  `;

  const intro = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6">Bonjour ${nomAffiche},</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Votre essai gratuit du plan Pro${ville ? ` sur <strong>${ville}</strong>` : ""} se termine dans
      <strong>${joursLabel}</strong>, le <strong>${dateFin}</strong>.
      Pour continuer à recevoir les demandes de transport de votre département et garder votre
      visibilité, activez votre abonnement dès maintenant.
    </p>
  `;

  const downgrade = `
    <p style="margin:0 0 8px;color:#6b7280;line-height:1.6;font-size:13px">
      Si vous ne souhaitez pas continuer, votre fiche restera visible en mode gratuit mais perdra
      le badge Pro vérifié et passera après les pros abonnés dans les résultats de votre département.
    </p>
  `;

  const bodyHtml = `
    ${headerBadge}
    ${intro}
    ${statsBlock}
    ${valueProps}
    ${downgrade}
  `;

  const plainText = [
    `Votre essai se termine dans ${joursLabel} — RoullePro`,
    "─".repeat(60),
    "",
    `Bonjour ${p.nomAffiche},`,
    "",
    `Votre essai gratuit du plan Pro${ville ? ` sur ${p.ville}` : ""} se termine dans ${joursLabel}, le ${dateFin}. Pour continuer à recevoir les demandes de transport de votre département et garder votre visibilité, activez votre abonnement dès maintenant.`,
    "",
    ...(totalSignaux > 0 ? [
      "CE QUE VOUS A APPORTÉ L'ESSAI",
      `- ${p.viewsTotal} vues totales`,
      `- ${p.revealsTotal} numéros révélés`,
      `- ${p.messagesTotal} messages`,
      "",
    ] : []),
    `EN CONTINUANT AVEC LE PLAN PRO — ${PRICE_ESSENTIAL_DISPLAY}`,
    "- Demandes de transport de votre département reçues par email",
    "- Badge Pro vérifié conservé et fiche affichée en premier",
    "- Équipe de 6 experts IA du transport sanitaire (réponses sourcées)",
    "- Forum entre pros vérifiés et statistiques détaillées",
    "- Sans engagement — résiliable en 1 clic à tout moment",
    "",
    "Si vous ne souhaitez pas continuer, votre fiche restera visible en mode gratuit mais perdra le badge Pro vérifié et passera après les pros abonnés dans les résultats.",
    "",
    `→ Continuer avec le plan Pro — ${PRICE_ESSENTIAL_DISPLAY} : ${p.upgradeUrl}`,
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
    preheader: `Plus que ${joursLabel} pour continuer votre plan Pro RoullePro.`,
    title: `Votre essai se termine dans ${joursLabel}`,
    bodyHtml,
    ctaLabel: `Continuer avec le plan Pro — ${PRICE_ESSENTIAL_DISPLAY}`,
    ctaUrl: p.upgradeUrl,
    accentColor: RP_COLOR_SUCCESS,
    plainText,
  });

  return {
    subject: `Votre essai RoullePro se termine dans ${joursLabel}`,
    html,
    text: plainText,
  };
}
