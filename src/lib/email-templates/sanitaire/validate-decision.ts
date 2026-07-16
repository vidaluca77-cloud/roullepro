/**
 * Email 7 — Décision de validation admin (approbation ou refus)
 * Déclenché depuis validate/route.ts après action admin.
 *
 * 7a — approve : 2 variants (self_registered vs claim)
 * 7b — reject  : avec motif (bug subject entités HTML corrigé)
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  RP_COLOR_PRIMARY,
  RP_COLOR_SUCCESS,
  RP_COLOR_DANGER,
} from "@/lib/email-templates/sanitaire-base";

export interface ValidateDecisionParams {
  action: "approve" | "reject";
  isSelfRegistered: boolean;
  nomAffiche: string;
  ficheUrl: string;
  appUrl: string;
  reason?: string | null;
}

export function renderValidateDecision(p: ValidateDecisionParams): {
  subject: string;
  html: string;
  text: string;
} {
  const nomAffiche = escapeHtml(p.nomAffiche);
  const ficheUrl   = escapeHtml(p.ficheUrl);
  const dashUrl    = `${p.appUrl}/transport-medical/pro/dashboard`;

  // ─── 7b REFUS ────────────────────────────────────────────────────────────
  if (p.action === "reject") {
    const reason = p.reason || "Justificatif non conforme";
    const reclamerUrl = `${p.appUrl}/transport-medical/pro/reclamer`;

    const bodyHtml = `
      <p style="margin:0 0 16px;color:#374151;line-height:1.6">
        Votre réclamation de la fiche <strong>${nomAffiche}</strong> n'a pas pu être validée.
      </p>

      <!-- Bloc motif -->
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin:0 0 20px">
        <div style="font-size:12px;font-weight:700;color:#991b1b;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">
          Motif
        </div>
        <div style="color:#7f1d1d;font-size:14px;line-height:1.5">
          ${escapeHtml(reason)}
        </div>
      </div>

      <p style="margin:0 0 8px;color:#374151;line-height:1.6">
        Vous pouvez soumettre une nouvelle réclamation avec un justificatif conforme
        (KBIS de moins de 3 mois ou agrément préfectoral de transport sanitaire).
      </p>
    `;

    const plainText = [
      `Réclamation de ${p.nomAffiche} refusée — RoullePro`,
      "─".repeat(60),
      "",
      `Votre réclamation de la fiche ${p.nomAffiche} n'a pas pu être validée.`,
      "",
      "MOTIF",
      reason,
      "",
      "Vous pouvez soumettre une nouvelle réclamation avec un justificatif conforme (KBIS de moins de 3 mois ou agrément préfectoral de transport sanitaire).",
      "",
      `→ Soumettre une nouvelle réclamation : ${reclamerUrl}`,
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
      preheader: "Vous pouvez soumettre une nouvelle réclamation avec un justificatif conforme.",
      title: "Réclamation refusée",
      bodyHtml,
      ctaLabel: "Soumettre une nouvelle réclamation",
      ctaUrl: reclamerUrl,
      accentColor: RP_COLOR_DANGER,
      plainText,
    });

    return {
      // Subject en UTF-8 pur, sans entités HTML (correction du bug "R&eacute;clamation")
      subject: `Réclamation de ${p.nomAffiche} refusée — RoullePro`,
      html,
      text: plainText,
    };
  }

  // ─── 7a APPROBATION ──────────────────────────────────────────────────────

  if (p.isSelfRegistered) {
    // Variant inscription spontanée
    const bodyHtml = `
      <p style="margin:0 0 16px;color:#374151;line-height:1.6">
        Bonne nouvelle, votre inscription <strong>${nomAffiche}</strong> a été validée par notre équipe.
        Votre fiche est désormais visible publiquement.
      </p>

      <!-- URL fiche -->
      <div style="background:#f0f6ff;border:1px solid #cfe3ff;border-radius:10px;padding:12px 16px;margin:0 0 20px;text-align:center">
        <a href="${ficheUrl}"
           style="color:${RP_COLOR_PRIMARY};font-size:14px;word-break:break-all;text-decoration:none;font-weight:600">
          ${ficheUrl}
        </a>
      </div>

      <p style="margin:0 0 8px;color:#374151;line-height:1.6">
        Votre essai Essential gratuit reste actif. Connectez-vous à votre espace pro
        pour suivre vos statistiques (vues, appels, demandes).
      </p>
    `;

    const plainText = [
      `Votre fiche ${p.nomAffiche} est validée — RoullePro`,
      "─".repeat(60),
      "",
      `Bonne nouvelle, votre inscription ${p.nomAffiche} a été validée par notre équipe. Votre fiche est désormais visible publiquement.`,
      "",
      `Votre fiche : ${p.ficheUrl}`,
      "",
      "Votre essai Essential gratuit reste actif. Connectez-vous à votre espace pro pour suivre vos statistiques (vues, appels, demandes).",
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

    const { html } = buildSanitaireEmail({
      preheader: "Votre fiche est désormais visible publiquement avec le badge Pro vérifié.",
      title: "Votre fiche est désormais en ligne",
      bodyHtml,
      ctaLabel: "Accéder à mon espace pro",
      ctaUrl: dashUrl,
      accentColor: RP_COLOR_SUCCESS,
      plainText,
    });

    return {
      subject: `Votre fiche ${p.nomAffiche} est validée — RoullePro`,
      html,
      text: plainText,
    };
  } else {
    // Variant réclamation
    const bodyHtml = `
      <p style="margin:0 0 16px;color:#374151;line-height:1.6">
        Bonne nouvelle, la fiche <strong>${nomAffiche}</strong> est désormais certifiée sur RoullePro.
        Elle affiche le badge <strong>«&nbsp;Pro vérifié&nbsp;»</strong> visible de tous les patients.
      </p>

      <p style="margin:0 0 20px;color:#374151;line-height:1.6">
        Votre essai Essential gratuit reste actif. Profitez-en pour compléter vos photos, horaires et description.
      </p>
    `;

    const plainText = [
      `Fiche ${p.nomAffiche} validée — Badge Pro vérifié activé`,
      "─".repeat(60),
      "",
      `Bonne nouvelle, la fiche ${p.nomAffiche} est désormais certifiée sur RoullePro. Elle affiche le badge « Pro vérifié » visible de tous les patients.`,
      "",
      "Votre essai Essential gratuit reste actif. Profitez-en pour compléter vos photos, horaires et description.",
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

    const { html } = buildSanitaireEmail({
      preheader: "Votre fiche affiche désormais le badge Pro vérifié.",
      title: "Votre fiche est validée",
      bodyHtml,
      ctaLabel: "Accéder à mon espace pro",
      ctaUrl: dashUrl,
      accentColor: RP_COLOR_SUCCESS,
      plainText,
    });

    return {
      subject: `Fiche ${p.nomAffiche} validée — Badge Pro vérifié activé`,
      html,
      text: plainText,
    };
  }
}
