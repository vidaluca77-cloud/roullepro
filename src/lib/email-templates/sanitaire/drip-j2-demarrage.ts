/**
 * Drip 1 — J+2 après octroi de l'essai Essential (essai 7 jours).
 * Objectif : bien démarrer — compléter sa fiche, connecter le Studio réseaux sociaux IA,
 * découvrir les 6 assistants IA et le forum entre pros. Réactive l'engagement tôt dans
 * un essai court.
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  RP_COLOR_PRIMARY,
  RP_COLOR_SUCCESS,
  RP_SITE_URL,
} from "@/lib/email-templates/sanitaire-base";

export interface DripJ2Params {
  nomAffiche: string;
  ville: string | null;
  dashboardUrl: string;
  ficheUrl: string | null;
}

export function renderDripJ2Demarrage(p: DripJ2Params): {
  subject: string;
  html: string;
  text: string;
} {
  const nomAffiche = escapeHtml(p.nomAffiche);
  const ville = p.ville ? escapeHtml(p.ville) : null;
  const forumUrl = `${RP_SITE_URL}/forum`;
  const studioUrl = `${RP_SITE_URL}/transport-medical/pro/studio-social`;

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
      Votre essai gratuit du plan Pro est actif depuis 2 jours.
      ${ville ? `Votre fiche est en ligne pour la zone <strong>${ville}</strong>` : "Votre fiche est en ligne"},
      référencée sur Google et lisible par les IA génératives (ChatGPT, Perplexity),
      et vous recevez déjà par email les demandes de transport de votre département.
    </p>

    ${ficheLine}

    <div style="background:#f0f6ff;border:1px solid #cfe3ff;border-radius:12px;padding:18px 22px;margin:0 0 24px">
      <div style="font-size:13px;font-weight:700;color:${RP_COLOR_PRIMARY};margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px">
        4 actions pour bien démarrer
      </div>
      <ol style="margin:0;padding-left:20px;color:#374151;line-height:1.8;font-size:14px">
        <li><strong>Complétez votre fiche</strong> (photos, horaires, description) depuis votre tableau de bord — les fiches complètes reçoivent bien plus de clics.</li>
        <li><strong>Connectez vos réseaux sociaux au Studio IA</strong> : vous autorisez Facebook, Instagram et Google Business en quelques clics, puis une IA spécialisée du transport sanitaire rédige et programme vos publications à votre place.</li>
        <li><strong>Consultez l'équipe de 6 assistants IA</strong> spécialisés du transport sanitaire : conventionnement CPAM, facturation SEFi/B2, tarifs, RH, gestion… avec des réponses sourcées (ameli.fr, Légifrance, service-public.fr).</li>
        <li><strong>Rejoignez le forum entre pros vérifiés</strong> pour échanger avec vos confrères.</li>
      </ol>
    </div>

    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Tout se fait en quelques minutes depuis votre espace pro. Plus votre fiche est complète,
      plus elle remonte dans l'annuaire de votre département.
    </p>

    <div style="background:#ecfdf5;border:1px solid ${RP_COLOR_SUCCESS};border-radius:12px;padding:14px 20px;margin:0 0 24px">
      <div style="font-size:13px;color:#14532d;line-height:1.6">
        <strong>Rappel</strong> : votre essai est gratuit pendant 7 jours &mdash;
        aucun paiement requis pendant cette période, aucun engagement.
      </div>
    </div>
  `;

  const plainText = [
    "Bien démarrer sur RoullePro — 4 actions en quelques minutes",
    "─".repeat(60),
    "",
    `Bonjour ${p.nomAffiche},`,
    "",
    `Votre essai gratuit du plan Pro est actif depuis 2 jours.${ville ? ` Votre fiche est en ligne pour la zone ${p.ville}` : " Votre fiche est en ligne"}, référencée sur Google et lisible par les IA génératives (ChatGPT, Perplexity), et vous recevez déjà par email les demandes de transport de votre département.`,
    "",
    ...(p.ficheUrl ? [`Votre fiche publique : ${p.ficheUrl}`, ""] : []),
    "4 ACTIONS POUR BIEN DÉMARRER",
    "1. Complétez votre fiche (photos, horaires, description) depuis votre tableau de bord.",
    `2. Connectez vos réseaux sociaux au Studio IA : ${studioUrl} — vous autorisez Facebook, Instagram et Google Business, puis une IA rédige et programme vos publications à votre place.`,
    "3. Consultez l'équipe de 6 assistants IA spécialisés du transport sanitaire (réponses sourcées : ameli.fr, Légifrance, service-public.fr).",
    `4. Rejoignez le forum entre pros vérifiés : ${forumUrl}`,
    "",
    "Tout se fait en quelques minutes depuis votre espace pro. Plus votre fiche est complète, plus elle remonte dans l'annuaire de votre département.",
    "",
    "Rappel : votre essai est gratuit pendant 7 jours — aucun paiement requis pendant cette période, aucun engagement.",
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
    preheader: "Complétez votre fiche, activez le Studio réseaux sociaux IA, découvrez les 6 assistants IA et le forum entre pros.",
    title: "Vos premières actions pour bien démarrer",
    bodyHtml,
    ctaLabel: "Compléter ma fiche",
    ctaUrl: p.dashboardUrl,
    accentColor: RP_COLOR_PRIMARY,
    plainText,
  });

  return {
    subject: "Bien démarrer sur RoullePro — 4 actions en quelques minutes",
    html,
    text: plainText,
  };
}
