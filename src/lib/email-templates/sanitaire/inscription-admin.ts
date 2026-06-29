/**
 * Email 3 — Notification admin inscription spontanée
 * Déclenché après inscription spontanée réussie.
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  RP_COLOR_PRIMARY,
} from "@/lib/email-templates/sanitaire-base";

export interface InscriptionAdminParams {
  nomAffiche: string;
  siret: string;
  categorie: string;
  ville: string;
  code_postal: string;
  email: string;
  telephone: string;
  fullName: string;
  appUrl: string;
}

export function renderInscriptionAdmin(p: InscriptionAdminParams): {
  subject: string;
  html: string;
  text: string;
} {
  const nomAffiche  = escapeHtml(p.nomAffiche);
  const siret       = escapeHtml(p.siret || "Non fourni");
  const categorie   = escapeHtml(p.categorie);
  const ville       = escapeHtml(p.ville);
  const codePosta   = escapeHtml(p.code_postal);
  const email       = escapeHtml(p.email);
  const telephone   = escapeHtml(p.telephone);
  const fullName    = escapeHtml(p.fullName);
  const adminUrl    = `${p.appUrl}/admin/sanitaire/reclamations?tab=pending&source=self_registration`;

  const bodyHtml = `
    <!-- Tableau des infos -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px">
      <tr style="background:#f9fafb">
        <td style="padding:8px 12px;color:#6b7280;width:35%">Entreprise</td>
        <td style="padding:8px 12px;font-weight:600;color:#111827">${nomAffiche}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;color:#6b7280">SIRET</td>
        <td style="padding:8px 12px;color:#111827">${siret}</td>
      </tr>
      <tr style="background:#f9fafb">
        <td style="padding:8px 12px;color:#6b7280">Catégorie</td>
        <td style="padding:8px 12px;color:#111827">${categorie}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;color:#6b7280">Ville</td>
        <td style="padding:8px 12px;color:#111827">${ville} (${codePosta})</td>
      </tr>
      <tr style="background:#f9fafb">
        <td style="padding:8px 12px;color:#6b7280">E-mail</td>
        <td style="padding:8px 12px;color:#111827">${email}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;color:#6b7280">Téléphone</td>
        <td style="padding:8px 12px;color:#111827">${telephone}</td>
      </tr>
      <tr style="background:#f9fafb">
        <td style="padding:8px 12px;color:#6b7280">Gérant</td>
        <td style="padding:8px 12px;color:#111827">${fullName}</td>
      </tr>
    </table>

    <!-- Bloc avertissement -->
    <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:14px 16px;margin-bottom:24px">
      <div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:6px;text-transform:uppercase">
        À vérifier manuellement
      </div>
      <div style="font-size:13px;color:#78350f;line-height:1.5">
        Cohérence SIRET / nom / adresse, justificatif KBIS si fourni.
      </div>
    </div>
  `;

  const plainText = [
    `Nouvelle inscription pro : ${p.nomAffiche} (${p.ville})`,
    "─".repeat(60),
    "",
    "INFORMATIONS DE LA FICHE",
    `Entreprise : ${p.nomAffiche}`,
    `SIRET      : ${p.siret || "Non fourni"}`,
    `Catégorie  : ${p.categorie}`,
    `Ville      : ${p.ville} (${p.code_postal})`,
    `E-mail     : ${p.email}`,
    `Téléphone  : ${p.telephone}`,
    `Gérant     : ${p.fullName}`,
    "",
    "À VÉRIFIER : cohérence SIRET / nom / adresse, justificatif KBIS si fourni.",
    "",
    `→ Ouvrir l'admin : ${adminUrl}`,
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
    preheader: "Inscription spontanée à valider — vérifier SIRET et justificatif.",
    title: "Nouvelle inscription pro à valider",
    bodyHtml,
    ctaLabel: "Ouvrir l'admin",
    ctaUrl: adminUrl,
    accentColor: RP_COLOR_PRIMARY,
    plainText,
  });

  return {
    subject: `Nouvelle inscription pro : ${p.nomAffiche} (${p.ville})`,
    html,
    text: plainText,
  };
}
