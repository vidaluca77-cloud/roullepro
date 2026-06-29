/**
 * Email 8 — Confirmation d'inscription à la newsletter blog RoullePro
 * Déclenché depuis api/newsletter/subscribe/route.ts.
 * Repositionnement : transport sanitaire uniquement (plus de marketplace véhicule).
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  RP_COLOR_PRIMARY,
} from "@/lib/email-templates/sanitaire-base";

export interface NewsletterBlogBienvenueParams {
  email: string;
  appUrl: string;
}

export function renderNewsletterBlogBienvenue(p: NewsletterBlogBienvenueParams): {
  subject: string;
  html: string;
  text: string;
} {
  const safeEmail = escapeHtml(p.email);
  const blogUrl   = `${p.appUrl}/blog`;

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Merci de vous être abonné à la newsletter RoullePro avec l'adresse
      <strong>${safeEmail}</strong>.
    </p>

    <p style="margin:0 0 12px;color:#374151;line-height:1.6">
      Vous recevrez environ <strong>un e-mail par mois</strong> avec&nbsp;:
    </p>

    <ul style="margin:0 0 24px;padding-left:20px;color:#374151;font-size:15px;line-height:1.8">
      <li>Les actualités du transport sanitaire en France (taxis conventionnés, ambulances, VSL)</li>
      <li>Les évolutions de la convention CPAM, des tarifs, des règles de remboursement</li>
      <li>Nos guides pratiques pour patients et professionnels</li>
      <li>Les nouveautés de l'annuaire (nouvelles fiches, fonctionnalités)</li>
    </ul>

    <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6">
      Vous pouvez vous désinscrire à tout moment en répondant simplement à cet e-mail.
    </p>
  `;

  const plainText = [
    "Inscription confirmée — Newsletter RoullePro Transport sanitaire",
    "─".repeat(60),
    "",
    `Merci de vous être abonné à la newsletter RoullePro avec l'adresse ${p.email}.`,
    "",
    "Vous recevrez environ un e-mail par mois avec :",
    "  - Les actualités du transport sanitaire en France (taxis conventionnés, ambulances, VSL)",
    "  - Les évolutions de la convention CPAM, des tarifs, des règles de remboursement",
    "  - Nos guides pratiques pour patients et professionnels",
    "  - Les nouveautés de l'annuaire (nouvelles fiches, fonctionnalités)",
    "",
    `→ Découvrir le blog : ${blogUrl}`,
    "",
    "Vous pouvez vous désinscrire à tout moment en répondant simplement à cet e-mail.",
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
    preheader: "Vous recevrez 1 e-mail par mois avec les actualités du transport sanitaire.",
    title: "Inscription confirmée",
    bodyHtml,
    ctaLabel: "Découvrir le blog",
    ctaUrl: blogUrl,
    accentColor: RP_COLOR_PRIMARY,
    plainText,
  });

  return {
    subject: "Bienvenue sur la newsletter RoullePro — Transport sanitaire",
    html,
    text: plainText,
  };
}
