/**
 * Email 5 — Bienvenue après réclamation validée (au pro)
 * Déclenché après vérification OTP réussie dans claim/verify.
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  PRICE_ESSENTIAL_DISPLAY,
  RP_COLOR_PRIMARY,
  RP_COLOR_SUCCESS,
} from "@/lib/email-templates/sanitaire-base";

export interface ClaimBienvenueParams {
  nomAffiche: string;
  accountEmail: string;
  tempPassword: string | null;
  magicLink: string | null;
  appUrl: string;
}

export function renderClaimBienvenue(p: ClaimBienvenueParams): {
  subject: string;
  html: string;
  text: string;
} {
  const nomAffiche    = escapeHtml(p.nomAffiche);
  const accountEmail  = escapeHtml(p.accountEmail);
  const tempPassword  = p.tempPassword ? escapeHtml(p.tempPassword) : null;
  const magicLink     = p.magicLink ? escapeHtml(p.magicLink) : null;
  const loginUrl      = magicLink ?? `${p.appUrl}/auth/login`;

  const credentialsBlock = tempPassword
    ? `<div style="background:#f0f6ff;border:1px solid #cfe3ff;border-radius:12px;padding:16px 20px;margin:0 0 24px">
        <div style="font-size:12px;font-weight:700;color:${RP_COLOR_PRIMARY};margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px">
          Vos identifiants de connexion
        </div>
        <div style="font-family:monospace;font-size:14px;color:#111827;line-height:1.8">
          E-mail&nbsp;: <strong>${accountEmail}</strong><br />
          Mot de passe temporaire&nbsp;: <strong>${tempPassword}</strong>
        </div>
        <div style="font-size:12px;color:#6b7280;margin-top:10px">
          Modifiez-le dès votre première connexion dans <em>Mon profil</em>.
        </div>
      </div>`
    : "";

  const magicLinkNote = magicLink
    ? `<div style="font-size:12px;color:#6b7280;margin-top:8px">
        Ce lien vous connecte automatiquement — valable 1 heure.
      </div>`
    : "";

  const bodyHtml = `
    <p style="margin:0 0 20px;color:#374151;line-height:1.6">
      Votre réclamation de fiche est bien enregistrée. Notre équipe la valide manuellement
      sous 24 h ouvrées, puis le badge <strong>Pro vérifié</strong> apparaîtra sur votre fiche publique.
    </p>

    ${credentialsBlock}

    <!-- CTA connexion -->
    <div style="text-align:center;margin:28px 0">
      <a href="${loginUrl}"
         style="display:inline-block;background:${RP_COLOR_PRIMARY};color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;line-height:1.2">
        Accéder à mon espace pro
      </a>
      ${magicLinkNote}
    </div>

    <!-- Bloc essai -->
    <div style="background:#ecfdf5;border:1px solid ${RP_COLOR_SUCCESS};border-radius:12px;padding:16px 20px;margin:0 0 24px">
      <div style="font-size:12px;font-weight:700;color:${RP_COLOR_SUCCESS};margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">
        Essai Essential 7 jours activé
      </div>
      <p style="margin:0;color:#14532d;font-size:14px;line-height:1.6">
        Votre essai Essential de 7 jours est activé. Vous bénéficiez de la visibilité optimisée
        et de la réception des demandes de transport.
        À l'issue de l'essai, l'abonnement Essential continue à ${escapeHtml(PRICE_ESSENTIAL_DISPLAY)} (sans engagement).
      </p>
    </div>

    <!-- Prochaines étapes -->
    <h2 style="margin:0 0 12px;font-size:17px;font-weight:700;color:#111827">
      Prochaines étapes
    </h2>
    <ol style="margin:0 0 20px;padding-left:20px;color:#374151;line-height:1.8">
      <li>
        <strong>Complétez votre fiche</strong> — photos, horaires détaillés, description (5 minutes).
      </li>
      <li>
        <strong>Vérifiez vos coordonnées</strong> — téléphone public, e-mail professionnel.
      </li>
      <li>
        <strong>Activez le plan Essential à ${escapeHtml(PRICE_ESSENTIAL_DISPLAY)}</strong> à la fin de votre essai
        pour conserver le référencement optimisé et continuer à recevoir des demandes.
      </li>
    </ol>

    <!-- Bloc important -->
    <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:12px;padding:16px 20px;margin:0 0 8px">
      <div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">
        Important
      </div>
      <p style="margin:0;color:#78350f;font-size:14px;line-height:1.6">
        L'annuaire RoullePro Transport Sanitaire est gratuit pour les patients.
        La fiche gratuite reste visible à vie. Les abonnements payants débloquent&nbsp;:
        messagerie, mise en avant, statistiques détaillées, réception de demandes.
      </p>
    </div>
  `;

  const credText = p.tempPassword
    ? [
        "VOS IDENTIFIANTS DE CONNEXION",
        `E-mail              : ${p.accountEmail}`,
        `Mot de passe temp.  : ${p.tempPassword}`,
        "Modifiez-le dès votre première connexion dans Mon profil.",
        "",
      ].join("\n")
    : "";

  const magicText = p.magicLink
    ? `→ Accéder à mon espace pro (lien auto-login, 1 h) : ${p.magicLink}`
    : `→ Se connecter : ${p.appUrl}/auth/login`;

  const plainText = [
    `Bienvenue ${p.nomAffiche}`,
    "─".repeat(60),
    "",
    "Votre réclamation de fiche est bien enregistrée. Notre équipe la valide manuellement sous 24 h ouvrées, puis le badge Pro vérifié apparaîtra sur votre fiche publique.",
    "",
    credText,
    magicText,
    "",
    "ESSAI ESSENTIAL 7 JOURS ACTIVÉ",
    `Votre essai Essential de 7 jours est activé. À l'issue de l'essai, l'abonnement Essential continue à ${PRICE_ESSENTIAL_DISPLAY} (sans engagement).`,
    "",
    "PROCHAINES ÉTAPES",
    `1. Complétez votre fiche — photos, horaires détaillés, description (5 minutes).`,
    `2. Vérifiez vos coordonnées — téléphone public, e-mail professionnel.`,
    `3. Activez le plan Essential à ${PRICE_ESSENTIAL_DISPLAY} à la fin de votre essai pour conserver le référencement optimisé.`,
    "",
    "IMPORTANT",
    "L'annuaire RoullePro Transport Sanitaire est gratuit pour les patients. La fiche gratuite reste visible à vie. Les abonnements payants débloquent : messagerie, mise en avant, statistiques détaillées, réception de demandes.",
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
    preheader: `Votre essai Essential de 7 jours est activé. Connectez-vous pour compléter votre fiche.`,
    title: `Bienvenue ${nomAffiche}`,
    bodyHtml,
    plainText,
  });

  return {
    subject: `Bienvenue sur RoullePro — Votre fiche ${p.nomAffiche} est en cours de validation`,
    html,
    text: plainText,
  };
}
