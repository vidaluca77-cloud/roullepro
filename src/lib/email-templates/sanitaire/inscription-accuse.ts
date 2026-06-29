/**
 * Email 1 — Accusé d'inscription (au pro)
 * Déclenché après inscription spontanée réussie.
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  PRICE_ESSENTIAL_DISPLAY,
  RP_COLOR_SUCCESS,
  RP_COLOR_PRIMARY,
} from "@/lib/email-templates/sanitaire-base";

export interface InscriptionAccuseParams {
  prenom: string;
  nom_commercial: string;
  raison_sociale: string;
  ville: string;
  categorie: string;
  appUrl: string;
}

export function renderInscriptionAccuse(p: InscriptionAccuseParams): {
  subject: string;
  html: string;
  text: string;
} {
  const nomAffiche = escapeHtml(p.nom_commercial || p.raison_sociale);
  const prenom     = escapeHtml(p.prenom);
  const ville      = escapeHtml(p.ville);
  const categorie  = escapeHtml(p.categorie);
  const dashUrl    = `${p.appUrl}/transport-medical/pro/dashboard`;

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6">
      Nous avons bien enregistré votre demande d'inscription pour
      <strong>${nomAffiche}</strong> sur l'annuaire RoullePro Transport Sanitaire.
    </p>

    <p style="margin:0 0 16px;color:#374151;font-size:13px">
      Ville&nbsp;: ${ville} &mdash; Catégorie&nbsp;: ${categorie}
    </p>

    <!-- Bloc essai -->
    <div style="background:#ecfdf5;border:1px solid ${RP_COLOR_SUCCESS};border-radius:12px;padding:16px 20px;margin:0 0 24px">
      <div style="font-size:13px;font-weight:700;color:${RP_COLOR_SUCCESS};margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">
        Bonne nouvelle — Essai Essential 2 mois activé
      </div>
      <p style="margin:0;color:#14532d;font-size:14px;line-height:1.6">
        Votre essai Essential 2 mois est activé automatiquement.
        Vous bénéficiez dès maintenant de la visibilité optimisée,
        des coordonnées affichées en premier dans votre département
        et de la réception de demandes de transport.
      </p>
    </div>

    <!-- Prochaines étapes -->
    <h2 style="margin:0 0 12px;font-size:17px;font-weight:700;color:#111827">
      Prochaines étapes
    </h2>
    <ol style="margin:0 0 20px;padding-left:20px;color:#374151;line-height:1.8">
      <li>
        <strong>Confirmez votre adresse e-mail</strong> — un second e-mail vous a été envoyé.
      </li>
      <li>
        <strong>Validation manuelle de votre fiche</strong> sous 24 à 48 h ouvrées par notre équipe.
      </li>
      <li>
        <strong>Complétez votre fiche</strong> (photos, horaires, description) depuis votre espace pro.
      </li>
    </ol>

    <p style="margin:0 0 8px;color:#374151;line-height:1.6">
      Dès validation, votre fiche est visible publiquement dans l'annuaire
      et reçoit le badge <strong>Pro vérifié</strong>.
    </p>
  `;

  const plainText = [
    `Bienvenue ${p.prenom}, votre demande est bien reçue`,
    "─".repeat(60),
    "",
    `Nous avons bien enregistré votre demande d'inscription pour ${p.nom_commercial || p.raison_sociale} sur l'annuaire RoullePro Transport Sanitaire.`,
    "",
    "ESSAI ESSENTIAL 2 MOIS ACTIVÉ",
    `Votre essai Essential 2 mois est activé automatiquement. Vous bénéficiez dès maintenant de la visibilité optimisée, des coordonnées affichées en premier dans votre département et de la réception de demandes de transport.`,
    "",
    "PROCHAINES ÉTAPES",
    "1. Confirmez votre adresse e-mail — un second e-mail vous a été envoyé.",
    "2. Validation manuelle de votre fiche sous 24 à 48 h ouvrées par notre équipe.",
    "3. Complétez votre fiche (photos, horaires, description) depuis votre espace pro.",
    "",
    "Dès validation, votre fiche est visible publiquement dans l'annuaire et reçoit le badge Pro vérifié.",
    "",
    `→ Accéder à mon espace pro : ${dashUrl}`,
    "",
    "─".repeat(60),
    "L'équipe RoullePro",
    "Annuaire du transport sanitaire",
    "06 15 47 28 13 · contact@roullepro.com",
    "https://www.roullepro.com",
    "",
    "E-mail transactionnel envoyé suite à une action sur votre compte RoullePro.",
  ].join("\n");

  const { html, text } = buildSanitaireEmail({
    preheader: `Votre essai Essential 2 mois est activé. Notre équipe valide votre fiche sous 24 h.`,
    title: `Bienvenue ${prenom}, votre demande est bien reçue`,
    bodyHtml,
    ctaLabel: "Accéder à mon espace pro",
    ctaUrl: dashUrl,
    accentColor: RP_COLOR_PRIMARY,
    plainText,
  });

  return {
    subject: "Votre inscription a bien été enregistrée — RoullePro",
    html,
    text,
  };
}
