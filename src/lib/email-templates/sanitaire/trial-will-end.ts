/**
 * Email fin d'essai — déclenché par l'événement Stripe `customer.subscription.trial_will_end`
 * (envoyé automatiquement par Stripe 3 jours avant la fin de la période d'essai).
 * Objectif : rappeler la valeur de l'offre Pro avant le premier débit, sans être anxiogène.
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  PRICE_ESSENTIAL_DISPLAY,
  RP_COLOR_PRIMARY,
  RP_COLOR_SUCCESS,
} from "@/lib/email-templates/sanitaire-base";

export interface TrialWillEndParams {
  nomAffiche: string;
  joursRestants: number;
  upgradeUrl: string;
  dashboardUrl: string;
}

export function renderTrialWillEnd(p: TrialWillEndParams): {
  subject: string;
  html: string;
  text: string;
} {
  const nomAffiche = escapeHtml(p.nomAffiche);
  const jours = p.joursRestants > 0 ? p.joursRestants : 3;
  const joursLabel = `${jours} jour${jours > 1 ? "s" : ""}`;

  const headerBadge = `
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 20px;margin:0 0 24px;text-align:center">
      <div style="font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.5px">
        Votre essai gratuit se termine dans ${joursLabel}
      </div>
    </div>
  `;

  const valueProps = `
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:18px 22px;margin:0 0 24px">
      <div style="font-size:13px;font-weight:700;color:${RP_COLOR_SUCCESS};margin-bottom:12px;text-transform:uppercase;letter-spacing:.5px">
        En continuant avec le plan Pro — ${PRICE_ESSENTIAL_DISPLAY}
      </div>
      <ul style="margin:0;padding-left:20px;color:#374151;line-height:1.8;font-size:14px">
        <li>Votre fiche reste <strong>visible en premier</strong> dans votre département</li>
        <li>Accès à l'<strong>équipe de 6 experts IA</strong> du transport sanitaire (réponses sourcées)</li>
        <li>Messagerie patients et réception des demandes de transport</li>
        <li>Forum entre pros vérifiés</li>
        <li>Sans engagement &mdash; <strong>résiliable en 1 clic</strong> à tout moment</li>
      </ul>
    </div>
  `;

  const bodyHtml = `
    ${headerBadge}
    <p style="margin:0 0 16px;color:#374151;line-height:1.6">Bonjour ${nomAffiche},</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Votre essai gratuit du plan Pro se termine dans <strong>${joursLabel}</strong>.
      Aucune action n'est requise si vous souhaitez continuer : votre abonnement Pro prendra
      le relais automatiquement pour ${PRICE_ESSENTIAL_DISPLAY}.
    </p>
    ${valueProps}
    <p style="margin:0 0 8px;color:#6b7280;line-height:1.6;font-size:13px">
      Vous pouvez gérer ou résilier votre abonnement à tout moment depuis votre espace pro.
    </p>
  `;

  const plainText = [
    `Votre essai gratuit se termine dans ${joursLabel} — RoullePro`,
    "─".repeat(60),
    "",
    `Bonjour ${p.nomAffiche},`,
    "",
    `Votre essai gratuit du plan Pro se termine dans ${joursLabel}. Aucune action n'est requise si vous souhaitez continuer : votre abonnement Pro prendra le relais automatiquement pour ${PRICE_ESSENTIAL_DISPLAY}.`,
    "",
    `EN CONTINUANT AVEC LE PLAN PRO — ${PRICE_ESSENTIAL_DISPLAY}`,
    "- Votre fiche reste visible en premier dans votre département",
    "- Accès à l'équipe de 6 experts IA du transport sanitaire (réponses sourcées)",
    "- Messagerie patients et réception des demandes de transport",
    "- Forum entre pros vérifiés",
    "- Sans engagement — résiliable en 1 clic à tout moment",
    "",
    "Vous pouvez gérer ou résilier votre abonnement à tout moment depuis votre espace pro.",
    "",
    `→ Gérer mon abonnement : ${p.dashboardUrl}`,
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
    preheader: `Votre essai gratuit se termine dans ${joursLabel}. Votre plan Pro continue à ${PRICE_ESSENTIAL_DISPLAY}.`,
    title: `Votre essai gratuit se termine dans ${joursLabel}`,
    bodyHtml,
    ctaLabel: "Gérer mon abonnement",
    ctaUrl: p.dashboardUrl,
    accentColor: RP_COLOR_PRIMARY,
    plainText,
  });

  return {
    subject: `Votre essai gratuit RoullePro se termine dans ${joursLabel}`,
    html,
    text: plainText,
  };
}
