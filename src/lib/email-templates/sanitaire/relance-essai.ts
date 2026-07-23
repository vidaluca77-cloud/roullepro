/**
 * Relance de fin d'essai / d'offre gratuite (cron relance-essai, fenêtres J-7 / J-3 / J-1).
 *
 * Deux variantes de ton :
 *  - « informatif » : le pro a enregistré une carte (stripe_subscription_id). Son abonnement
 *    Pro démarrera automatiquement à la fin de l'essai — rien à faire, ton rassurant.
 *  - « conversion » : le pro n'a pas de carte. Sa période offerte s'arrête ; on l'invite à
 *    passer au plan Pro (19,90 €/mois, sans engagement) pour continuer à recevoir les courses.
 *
 * Les contenus J-7 / J-3 / J-1 diffèrent légèrement (urgence croissante, J-1 = dernier jour).
 */

import {
  buildSanitaireEmail,
  escapeHtml,
  PRICE_ESSENTIAL_DISPLAY,
  RP_COLOR_PRIMARY,
  RP_COLOR_SUCCESS,
} from "@/lib/email-templates/sanitaire-base";
import type { TypeRelance, VarianteRelance } from "@/lib/relance-essai";

export interface RelanceEssaiParams {
  variante: VarianteRelance;
  type: TypeRelance;
  nomAffiche: string;
  ville: string | null;
  /** ISO de l'échéance (fin d'offre). */
  echeanceIso: string;
  /** Gestion de l'abonnement (variante informatif) ou souscription (variante conversion). */
  ctaUrl: string;
  dashboardUrl: string;
}

function formatDateFR(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Paris",
    });
  } catch {
    return iso;
  }
}

/** Libellé « dans X jours » / « demain » / « aujourd'hui » selon la fenêtre. */
function echeanceLabel(type: TypeRelance): string {
  switch (type) {
    case "J7":
      return "dans 7 jours";
    case "J3":
      return "dans 3 jours";
    case "J1":
      return "demain";
  }
}

export function renderRelanceEssai(p: RelanceEssaiParams): {
  subject: string;
  html: string;
  text: string;
} {
  const nomAffiche = escapeHtml(p.nomAffiche);
  const ville = p.ville ? escapeHtml(p.ville) : null;
  const dateFin = formatDateFR(p.echeanceIso);
  const quand = echeanceLabel(p.type);
  const dernierJour = p.type === "J1";

  const badgeColor = dernierJour ? "#fef2f2" : "#fffbeb";
  const badgeBorder = dernierJour ? "#fecaca" : "#fde68a";
  const badgeText = dernierJour ? "#b91c1c" : "#92400e";
  const badgeTitre =
    p.variante === "informatif"
      ? `Votre essai gratuit se termine ${quand} — le ${dateFin}`
      : `Votre période offerte se termine ${quand} — le ${dateFin}`;

  const headerBadge = `
    <div style="background:${badgeColor};border:1px solid ${badgeBorder};border-radius:12px;padding:14px 20px;margin:0 0 24px;text-align:center">
      <div style="font-size:13px;font-weight:700;color:${badgeText};text-transform:uppercase;letter-spacing:.5px">
        ${badgeTitre}
      </div>
    </div>
  `;

  const valueTitle =
    p.variante === "informatif"
      ? `Votre abonnement Pro — ${escapeHtml(PRICE_ESSENTIAL_DISPLAY)}`
      : `En continuant avec le plan Pro — ${escapeHtml(PRICE_ESSENTIAL_DISPLAY)}`;

  const valueProps = `
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:18px 22px;margin:0 0 24px">
      <div style="font-size:13px;font-weight:700;color:${RP_COLOR_SUCCESS};margin-bottom:12px;text-transform:uppercase;letter-spacing:.5px">
        ${valueTitle}
      </div>
      <ul style="margin:0;padding-left:20px;color:#374151;line-height:1.8;font-size:14px">
        <li>Demandes de transport de votre département reçues <strong>en priorité par email</strong></li>
        <li>Badge <strong>Pro vérifié</strong> et fiche affichée en premier dans les résultats</li>
        <li>Accès à l'<strong>équipe de 6 experts IA</strong> du transport sanitaire (réponses sourcées)</li>
        <li>Messagerie patients, forum entre pros vérifiés et statistiques détaillées</li>
        <li>Sans engagement &mdash; <strong>résiliable en 1 clic</strong> à tout moment</li>
      </ul>
    </div>
  `;

  // ─── Corps selon variante ───────────────────────────────────────────────
  let intro: string;
  let closing: string;
  let ctaLabel: string;
  let accent: string;
  let subject: string;
  let preheader: string;

  if (p.variante === "informatif") {
    accent = RP_COLOR_PRIMARY;
    intro = `
      <p style="margin:0 0 16px;color:#374151;line-height:1.6">Bonjour ${nomAffiche},</p>
      <p style="margin:0 0 16px;color:#374151;line-height:1.6">
        Votre essai gratuit du plan Pro${ville ? ` sur <strong>${ville}</strong>` : ""} se termine
        <strong>${quand}</strong>, le <strong>${dateFin}</strong>.
        Aucune action n'est nécessaire : votre abonnement Pro (${escapeHtml(PRICE_ESSENTIAL_DISPLAY)})
        démarrera automatiquement pour que vous continuiez à recevoir les courses sans interruption.
      </p>
    `;
    closing = `
      <p style="margin:0 0 8px;color:#6b7280;line-height:1.6;font-size:13px">
        Vous gardez la main : vous pouvez consulter, modifier ou résilier votre abonnement en 1 clic
        depuis votre espace pro, à tout moment.
      </p>
    `;
    ctaLabel = "Gérer mon abonnement";
    subject = dernierJour
      ? "Votre abonnement Pro RoullePro démarre demain"
      : `Votre essai RoullePro se termine ${quand} — abonnement Pro automatique`;
    preheader = `Rien à faire : votre plan Pro (${PRICE_ESSENTIAL_DISPLAY}) prend le relais ${quand}.`;
  } else {
    accent = RP_COLOR_SUCCESS;
    const urgence = dernierJour
      ? `C'est le <strong>dernier jour</strong> : passez au plan Pro dès aujourd'hui pour ne pas perdre votre visibilité ni les demandes de transport de votre département.`
      : `Pour continuer à recevoir les demandes de transport de votre département en priorité et garder votre visibilité, passez au plan Pro (${escapeHtml(PRICE_ESSENTIAL_DISPLAY)}, sans engagement).`;
    intro = `
      <p style="margin:0 0 16px;color:#374151;line-height:1.6">Bonjour ${nomAffiche},</p>
      <p style="margin:0 0 16px;color:#374151;line-height:1.6">
        Votre période offerte${ville ? ` sur <strong>${ville}</strong>` : ""} se termine
        <strong>${quand}</strong>, le <strong>${dateFin}</strong>. ${urgence}
      </p>
    `;
    closing = `
      <p style="margin:0 0 8px;color:#6b7280;line-height:1.6;font-size:13px">
        Sans abonnement, votre fiche restera visible en mode gratuit mais perdra le badge Pro vérifié
        et passera après les pros abonnés dans les résultats de votre département.
      </p>
    `;
    ctaLabel = `Passer au plan Pro — ${PRICE_ESSENTIAL_DISPLAY}`;
    subject = dernierJour
      ? `Dernier jour : votre offre RoullePro se termine demain`
      : `Votre offre RoullePro se termine ${quand} — passez au plan Pro`;
    preheader = `Continuez à recevoir les courses : plan Pro à ${PRICE_ESSENTIAL_DISPLAY}, sans engagement.`;
  }

  const title =
    p.variante === "informatif"
      ? `Votre essai se termine ${quand}`
      : `Votre offre se termine ${quand}`;

  const bodyHtml = `
    ${headerBadge}
    ${intro}
    ${valueProps}
    ${closing}
  `;

  // ─── Version texte ───────────────────────────────────────────────────────
  const valueLines = [
    `${p.variante === "informatif" ? "VOTRE ABONNEMENT PRO" : "EN CONTINUANT AVEC LE PLAN PRO"} — ${PRICE_ESSENTIAL_DISPLAY}`,
    "- Demandes de transport de votre département reçues en priorité par email",
    "- Badge Pro vérifié et fiche affichée en premier dans les résultats",
    "- Accès à l'équipe de 6 experts IA du transport sanitaire (réponses sourcées)",
    "- Messagerie patients, forum entre pros vérifiés et statistiques détaillées",
    "- Sans engagement — résiliable en 1 clic à tout moment",
  ];

  const introText =
    p.variante === "informatif"
      ? `Votre essai gratuit du plan Pro${ville ? ` sur ${p.ville}` : ""} se termine ${quand}, le ${dateFin}. Aucune action n'est nécessaire : votre abonnement Pro (${PRICE_ESSENTIAL_DISPLAY}) démarrera automatiquement pour que vous continuiez à recevoir les courses sans interruption.`
      : `Votre période offerte${ville ? ` sur ${p.ville}` : ""} se termine ${quand}, le ${dateFin}. ${dernierJour ? "C'est le dernier jour : passez au plan Pro dès aujourd'hui pour ne pas perdre votre visibilité ni les demandes de transport de votre département." : `Pour continuer à recevoir les demandes de transport de votre département en priorité et garder votre visibilité, passez au plan Pro (${PRICE_ESSENTIAL_DISPLAY}, sans engagement).`}`;

  const closingText =
    p.variante === "informatif"
      ? "Vous gardez la main : vous pouvez consulter, modifier ou résilier votre abonnement en 1 clic depuis votre espace pro, à tout moment."
      : "Sans abonnement, votre fiche restera visible en mode gratuit mais perdra le badge Pro vérifié et passera après les pros abonnés dans les résultats de votre département.";

  const plainText = [
    title,
    "─".repeat(60),
    "",
    `Bonjour ${p.nomAffiche},`,
    "",
    introText,
    "",
    ...valueLines,
    "",
    closingText,
    "",
    `→ ${ctaLabel} : ${p.ctaUrl}`,
    `→ Mon tableau de bord : ${p.dashboardUrl}`,
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
    preheader,
    title,
    bodyHtml,
    ctaLabel,
    ctaUrl: p.ctaUrl,
    accentColor: accent,
    plainText,
  });

  return { subject, html, text: plainText };
}
