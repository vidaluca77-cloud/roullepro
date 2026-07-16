/**
 * Drip 2 — J+7 après octroi de l'essai Essential.
 * Objectif : montrer les 1ers résultats (vues/reveals/messages) + conversion soft.
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  PRICE_ESSENTIAL_DISPLAY,
  RP_COLOR_PRIMARY,
  RP_COLOR_SUCCESS,
} from "@/lib/email-templates/sanitaire-base";

export interface DripJ7Params {
  nomAffiche: string;
  ville: string | null;
  views7d: number;
  reveals7d: number;
  messages7d: number;
  dashboardUrl: string;
  upgradeUrl: string;
}

export function renderDripJ7Resultats(p: DripJ7Params): {
  subject: string;
  html: string;
  text: string;
} {
  const nomAffiche = escapeHtml(p.nomAffiche);
  const ville = p.ville ? escapeHtml(p.ville) : null;

  const totalSignaux = p.views7d + p.reveals7d + p.messages7d;
  const tone: "actif" | "calme" = totalSignaux >= 5 ? "actif" : "calme";

  const statsBlock = `
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:18px 22px;margin:0 0 24px">
      <div style="font-size:13px;font-weight:700;color:${RP_COLOR_PRIMARY};margin-bottom:14px;text-transform:uppercase;letter-spacing:.5px">
        Vos 7 derniers jours
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="text-align:center">
        <tr>
          <td style="padding:8px 4px">
            <div style="font-size:28px;font-weight:700;color:#111827;line-height:1.1">${p.views7d}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px">vues de fiche</div>
          </td>
          <td style="padding:8px 4px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
            <div style="font-size:28px;font-weight:700;color:#111827;line-height:1.1">${p.reveals7d}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px">numéros révélés</div>
          </td>
          <td style="padding:8px 4px">
            <div style="font-size:28px;font-weight:700;color:#111827;line-height:1.1">${p.messages7d}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px">messages reçus</div>
          </td>
        </tr>
      </table>
    </div>
  `;

  const intro = tone === "actif"
    ? `<p style="margin:0 0 16px;color:#374151;line-height:1.6">
         Bonjour ${nomAffiche},
       </p>
       <p style="margin:0 0 16px;color:#374151;line-height:1.6">
         Une semaine que votre essai Essential est actif${ville ? ` sur la zone <strong>${ville}</strong>` : ""}.
         Voici les signaux générés par votre fiche RoullePro ces 7 derniers jours.
       </p>`
    : `<p style="margin:0 0 16px;color:#374151;line-height:1.6">
         Bonjour ${nomAffiche},
       </p>
       <p style="margin:0 0 16px;color:#374151;line-height:1.6">
         Une semaine que votre essai Essential est actif${ville ? ` sur la zone <strong>${ville}</strong>` : ""}.
         Le démarrage est calme — c'est normal sur les 10 premiers jours, le temps que votre fiche
         soit indexée par Google et remonte dans les résultats locaux.
       </p>`;

  const conclusion = tone === "actif"
    ? `<p style="margin:0 0 16px;color:#374151;line-height:1.6">
         Continuez : chaque vue est un patient potentiel, chaque numéro révélé un appel probable
         dans les 48 h. À ce rythme, comptez 4 à 8 nouvelles courses générées par mois.
       </p>`
    : `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin:0 0 24px">
         <div style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">
           2 leviers pour activer votre fiche
         </div>
         <ol style="margin:0;padding-left:20px;color:#78350f;line-height:1.8;font-size:14px">
           <li><strong>Ajoutez photos et description</strong> si pas encore fait &mdash; impact direct sur le CTR.</li>
           <li><strong>Vérifiez vos horaires</strong>, surtout urgences nuit/week-end : c'est ce que cherchent les patients.</li>
         </ol>
       </div>`;

  const bodyHtml = `
    ${intro}

    ${statsBlock}

    ${conclusion}

    <div style="background:#ecfdf5;border:1px solid ${RP_COLOR_SUCCESS};border-radius:12px;padding:14px 20px;margin:0 0 8px">
      <div style="font-size:13px;color:#14532d;line-height:1.6">
        <strong>Votre essai gratuit</strong> est toujours en cours.
        Le passage à l'offre Essential se fait à tout moment pour
        <strong>${PRICE_ESSENTIAL_DISPLAY}</strong>, sans engagement &mdash; résiliable en 1 clic.
      </div>
    </div>
  `;

  const plainText = [
    "RoullePro — 1 semaine d'essai : vos premiers résultats",
    "─".repeat(60),
    "",
    `Bonjour ${p.nomAffiche},`,
    "",
    `Une semaine que votre essai Essential est actif${ville ? ` sur la zone ${p.ville}` : ""}.`,
    "",
    "VOS 7 DERNIERS JOURS",
    `- ${p.views7d} vues de fiche`,
    `- ${p.reveals7d} numéros révélés`,
    `- ${p.messages7d} messages reçus`,
    "",
    tone === "actif"
      ? "Continuez : chaque vue est un patient potentiel, chaque numéro révélé un appel probable dans les 48 h."
      : "Le démarrage est calme — c'est normal sur les 10 premiers jours. 2 leviers : ajoutez photos + description, et vérifiez vos horaires (surtout urgences nuit/week-end).",
    "",
    `Votre essai gratuit est toujours en cours. Le passage à Essential se fait à tout moment pour ${PRICE_ESSENTIAL_DISPLAY}, sans engagement — résiliable en 1 clic.`,
    "",
    `→ Voir mon tableau de bord : ${p.dashboardUrl}`,
    `→ Passer à Essential maintenant : ${p.upgradeUrl}`,
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
    preheader: `${p.views7d} vues, ${p.reveals7d} numéros révélés, ${p.messages7d} messages cette semaine.`,
    title: "Vos premiers résultats sur RoullePro",
    bodyHtml,
    ctaLabel: "Voir mon tableau de bord",
    ctaUrl: p.dashboardUrl,
    accentColor: RP_COLOR_PRIMARY,
    plainText,
  });

  return {
    subject: tone === "actif"
      ? `Votre 1ère semaine : ${p.views7d} vues, ${p.reveals7d} numéros révélés`
      : "1 semaine d'essai RoullePro — comment activer votre fiche",
    html,
    text: plainText,
  };
}
