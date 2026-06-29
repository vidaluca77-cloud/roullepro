/**
 * Email 6 — Notification admin réclamation
 * Déclenché après vérification OTP réussie dans claim/verify.
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  RP_COLOR_PRIMARY,
} from "@/lib/email-templates/sanitaire-base";

export interface ClaimAdminParams {
  nomAffiche: string;
  ville: string;
  categorie: string;
  accountEmail: string;
  method: string;
  adminUrl: string;
}

export function renderClaimAdmin(p: ClaimAdminParams): {
  subject: string;
  html: string;
  text: string;
} {
  const nomAffiche   = escapeHtml(p.nomAffiche);
  const ville        = escapeHtml(p.ville);
  const categorie    = escapeHtml(p.categorie);
  const accountEmail = escapeHtml(p.accountEmail);
  const method       = escapeHtml(p.method);

  const bodyHtml = `
    <!-- Bloc infos réclamation -->
    <div style="background:#f0f6ff;border:1px solid #cfe3ff;border-radius:12px;padding:16px 20px;margin:0 0 20px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr>
          <td style="padding:5px 8px;color:#6b7280;width:35%">Fiche</td>
          <td style="padding:5px 8px;font-weight:600;color:#111827">${nomAffiche}</td>
        </tr>
        <tr>
          <td style="padding:5px 8px;color:#6b7280">Ville</td>
          <td style="padding:5px 8px;color:#111827">${ville}</td>
        </tr>
        <tr>
          <td style="padding:5px 8px;color:#6b7280">Catégorie</td>
          <td style="padding:5px 8px;color:#111827">${categorie}</td>
        </tr>
        <tr>
          <td style="padding:5px 8px;color:#6b7280">E-mail réclamant</td>
          <td style="padding:5px 8px;color:#111827">${accountEmail}</td>
        </tr>
        <tr>
          <td style="padding:5px 8px;color:#6b7280">Méthode</td>
          <td style="padding:5px 8px;color:#111827">${method}</td>
        </tr>
      </table>
    </div>

    <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.6">
      Vérifier la cohérence SIRET / e-mail réclamant / nom de l'entreprise avant d'approuver.
    </p>
  `;

  const plainText = [
    `Réclamation à valider : ${p.nomAffiche} (${p.ville})`,
    "─".repeat(60),
    "",
    "INFORMATIONS DE LA RÉCLAMATION",
    `Fiche          : ${p.nomAffiche}`,
    `Ville          : ${p.ville}`,
    `Catégorie      : ${p.categorie}`,
    `E-mail récl.   : ${p.accountEmail}`,
    `Méthode        : ${p.method}`,
    "",
    "Vérifier la cohérence SIRET / e-mail réclamant / nom de l'entreprise avant d'approuver.",
    "",
    `→ Ouvrir la file d'attente : ${p.adminUrl}`,
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
    preheader: "Réclamation en attente — vérifier cohérence SIRET / réclamant.",
    title: "Nouvelle réclamation à valider",
    bodyHtml,
    ctaLabel: "Ouvrir la file d'attente",
    ctaUrl: p.adminUrl,
    accentColor: RP_COLOR_PRIMARY,
    plainText,
  });

  return {
    subject: `Réclamation à valider : ${p.nomAffiche} (${p.ville})`,
    html,
    text: plainText,
  };
}
