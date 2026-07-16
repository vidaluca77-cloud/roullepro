/**
 * Drip 1 — J+3 après octroi de l'essai Essential.
 * Objectif : rappel valeur + booster engagement (compléter la fiche, photos, horaires).
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  RP_COLOR_PRIMARY,
  RP_COLOR_SUCCESS,
} from "@/lib/email-templates/sanitaire-base";

export interface DripJ3Params {
  nomAffiche: string;
  ville: string | null;
  dashboardUrl: string;
  ficheUrl: string | null;
}

export function renderDripJ3Essai(p: DripJ3Params): {
  subject: string;
  html: string;
  text: string;
} {
  const nomAffiche = escapeHtml(p.nomAffiche);
  const ville = p.ville ? escapeHtml(p.ville) : null;
  const ficheLine = p.ficheUrl
    ? `<p style="margin:0 0 16px;color:#374151;line-height:1.6;font-size:14px">
         Votre fiche publique :
         <a href="${p.ficheUrl}" style="color:${RP_COLOR_PRIMARY}">${p.ficheUrl}</a>
       </p>`
    : "";

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Bonjour ${nomAffiche},
    </p>

    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Cela fait 3 jours que votre essai Essential gratuit est actif sur RoullePro.
      ${ville ? `Votre fiche est en ligne pour la zone <strong>${ville}</strong>` : "Votre fiche est en ligne"}
      et reçoit déjà ses premières visites.
    </p>

    ${ficheLine}

    <div style="background:#f0f6ff;border:1px solid #cfe3ff;border-radius:12px;padding:18px 22px;margin:0 0 24px">
      <div style="font-size:13px;font-weight:700;color:${RP_COLOR_PRIMARY};margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px">
        3 actions pour multiplier vos appels x2
      </div>
      <ol style="margin:0;padding-left:20px;color:#374151;line-height:1.8;font-size:14px">
        <li><strong>Ajoutez 3 à 5 photos</strong> (véhicule, équipement, équipe) &mdash; les fiches avec photos reçoivent 2,4&times; plus de clics.</li>
        <li><strong>Précisez vos horaires</strong> (urgences nuit/week-end, jours fériés) &mdash; c'est le 1er critère de choix des patients.</li>
        <li><strong>Rédigez 2-3 lignes de description</strong> (spécialités : PMR, dialyse, longue distance, pédiatrie).</li>
      </ol>
    </div>

    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Tout se fait en 5 minutes depuis votre espace pro.
      Plus votre fiche est complète, plus elle remonte dans l'annuaire de votre département.
    </p>

    <div style="background:#ecfdf5;border:1px solid ${RP_COLOR_SUCCESS};border-radius:12px;padding:14px 20px;margin:0 0 24px">
      <div style="font-size:13px;color:#14532d;line-height:1.6">
        <strong>Rappel</strong> : votre essai Essential est gratuit jusqu'à expiration &mdash;
        aucun paiement requis pendant cette période, aucun engagement.
      </div>
    </div>
  `;

  const plainText = [
    "Boostez votre fiche RoullePro — 3 actions en 5 minutes",
    "─".repeat(60),
    "",
    `Bonjour ${p.nomAffiche},`,
    "",
    `Cela fait 3 jours que votre essai Essential gratuit est actif sur RoullePro.${ville ? ` Votre fiche est en ligne pour la zone ${p.ville}` : " Votre fiche est en ligne"} et reçoit déjà ses premières visites.`,
    "",
    ...(p.ficheUrl ? [`Votre fiche publique : ${p.ficheUrl}`, ""] : []),
    "3 ACTIONS POUR MULTIPLIER VOS APPELS X2",
    "1. Ajoutez 3 à 5 photos (véhicule, équipement, équipe) — les fiches avec photos reçoivent 2,4× plus de clics.",
    "2. Précisez vos horaires (urgences nuit/week-end, jours fériés) — c'est le 1er critère de choix des patients.",
    "3. Rédigez 2-3 lignes de description (spécialités : PMR, dialyse, longue distance, pédiatrie).",
    "",
    "Tout se fait en 5 minutes depuis votre espace pro. Plus votre fiche est complète, plus elle remonte dans l'annuaire de votre département.",
    "",
    "Rappel : votre essai Essential est gratuit jusqu'à expiration — aucun paiement requis pendant cette période, aucun engagement.",
    "",
    `→ Compléter ma fiche : ${p.dashboardUrl}`,
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
    preheader: "3 actions concrètes pour booster votre fiche RoullePro cette semaine",
    title: "Vos 3 prochaines actions pour booster votre fiche",
    bodyHtml,
    ctaLabel: "Compléter ma fiche",
    ctaUrl: p.dashboardUrl,
    accentColor: RP_COLOR_PRIMARY,
    plainText,
  });

  return {
    subject: "Boostez votre fiche RoullePro — 3 actions en 5 minutes",
    html,
    text: plainText,
  };
}
