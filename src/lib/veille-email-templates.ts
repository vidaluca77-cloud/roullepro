/**
 * Templates HTML pour les emails de la veille reglementaire RoullePro.
 * Hardcode de l'expediteur veille = "RoullePro Veille <veille@roullepro.com>".
 */

export const VEILLE_FROM_EMAIL = "RoullePro Veille <veille@roullepro.com>";

const METIER_LABELS: Record<string, string> = {
  ambulance: "Ambulance",
  vsl: "VSL",
  taxi_conventionne: "Taxi conventionné",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function metiersLabels(metiers: string[]): string {
  return metiers
    .map((m) => METIER_LABELS[m] || m)
    .map(escapeHtml)
    .join(", ");
}

const HEADER = `
  <div style="background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); padding: 28px 32px;">
    <h1 style="color: white; margin: 0; font-size: 22px;">RoullePro Veille</h1>
    <p style="color: #dbeafe; margin: 6px 0 0; font-size: 14px;">Veille réglementaire transport sanitaire</p>
  </div>
`;

function footer(unsubscribeUrl?: string): string {
  return `
    <div style="background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0;">
      <p style="color: #64748b; font-size: 12px; margin: 0 0 8px; line-height: 1.6;">
        Synthèse informative, ne se substitue pas aux textes officiels.
        Consultez un juriste pour toute question d'application.
      </p>
      ${
        unsubscribeUrl
          ? `<p style="color: #94a3b8; font-size: 12px; margin: 0;">
              <a href="${escapeHtml(unsubscribeUrl)}" style="color: #64748b; text-decoration: underline;">Se désinscrire en 1 clic</a>
              · RoullePro — France
            </p>`
          : `<p style="color: #94a3b8; font-size: 12px; margin: 0;">RoullePro — France</p>`
      }
    </div>
  `;
}

export function buildVeilleConfirmationHtml(params: {
  email: string;
  metiers: string[];
  confirmUrl: string;
}): string {
  const { email, metiers, confirmUrl } = params;
  const labels = metiersLabels(metiers) || "tous les métiers";

  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    ${HEADER}
    <div style="padding: 32px;">
      <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Confirmez votre inscription</h2>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">
        Bonjour, vous avez demandé à recevoir la veille réglementaire RoullePro à l'adresse
        <strong>${escapeHtml(email)}</strong>.
      </p>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">
        Segments choisis : <strong>${labels}</strong>.
      </p>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">
        Pour activer votre inscription, cliquez sur le bouton ci-dessous. Ce lien expire dans 72 heures.
      </p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${escapeHtml(confirmUrl)}"
           style="display: inline-block; background: #1d4ed8; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Je confirme mon inscription
        </a>
      </div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
        Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>
        <a href="${escapeHtml(confirmUrl)}" style="color: #1d4ed8; word-break: break-all;">${escapeHtml(confirmUrl)}</a>
      </p>
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
        Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message. Aucun email ne vous sera envoyé tant que l'inscription n'est pas confirmée.
      </p>
    </div>
    ${footer()}
  </div>
</body>
</html>`;
}

export type WeeklyAlertSummary = {
  slug: string;
  title_short: string;
  summary_oneliner: string;
  urgency: "critical" | "high" | "medium" | "info";
  applicable_from: string | null;
};

const URGENCY_BADGE: Record<
  "critical" | "high" | "medium" | "info",
  { label: string; bg: string; fg: string; border: string }
> = {
  critical: { label: "Critique", bg: "#fee2e2", fg: "#991b1b", border: "#fecaca" },
  high: { label: "Urgence élevée", bg: "#ffedd5", fg: "#9a3412", border: "#fed7aa" },
  medium: { label: "Importance moyenne", bg: "#fef3c7", fg: "#92400e", border: "#fde68a" },
  info: { label: "Information", bg: "#dbeafe", fg: "#1e40af", border: "#bfdbfe" },
};

function formatApplicableFromFr(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const formatted = d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const now = new Date();
  return d.getTime() <= now.getTime()
    ? `Applicable depuis le ${formatted}`
    : `Applicable à partir du ${formatted}`;
}

export function buildVeilleWeeklyHtml(params: {
  alertes: WeeklyAlertSummary[];
  metiers: string[];
  unsubscribeUrl: string;
  appUrl: string;
  mode?: "weekly" | "weekly_fallback";
}): string {
  const { alertes, metiers, unsubscribeUrl, appUrl, mode = "weekly" } = params;
  const segmentLabels = metiersLabels(metiers) || "tous les métiers";

  const intro =
    mode === "weekly_fallback"
      ? `Pas d'alerte publiée cette semaine. Voici un rappel des évolutions réglementaires majeures actuellement en vigueur pour ${segmentLabels}.`
      : `Voici les évolutions réglementaires de la semaine pour ${segmentLabels}.`;

  const alertCards = alertes
    .map((a) => {
      const badge = URGENCY_BADGE[a.urgency] || URGENCY_BADGE.info;
      const detailUrl = `${appUrl}/veille-reglementaire/${a.slug}`;
      const applicable = formatApplicableFromFr(a.applicable_from);
      return `
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 14px; background: #ffffff;">
          <div style="margin-bottom: 10px;">
            <span style="display: inline-block; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; background: ${badge.bg}; color: ${badge.fg}; border: 1px solid ${badge.border}; text-transform: uppercase; letter-spacing: 0.4px;">
              ${escapeHtml(badge.label)}
            </span>
          </div>
          <h3 style="margin: 0 0 8px; color: #0f172a; font-size: 17px; line-height: 1.35;">
            <a href="${escapeHtml(detailUrl)}" style="color: #0f172a; text-decoration: none;">${escapeHtml(a.title_short)}</a>
          </h3>
          <p style="margin: 0 0 12px; color: #334155; font-size: 14px; line-height: 1.55;">
            ${escapeHtml(a.summary_oneliner)}
          </p>
          ${
            applicable
              ? `<p style="margin: 0 0 12px; color: #64748b; font-size: 12px;">${escapeHtml(applicable)}</p>`
              : ""
          }
          <a href="${escapeHtml(detailUrl)}" style="display: inline-block; color: #1d4ed8; font-size: 14px; font-weight: 600; text-decoration: none;">
            Lire l'analyse &rarr;
          </a>
        </div>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    ${HEADER}
    <div style="padding: 28px 32px;">
      <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 22px;">
        ${escapeHtml(intro)}
      </p>
      ${alertCards}
      <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #e2e8f0; text-align: center;">
        <a href="${escapeHtml(appUrl)}/veille-reglementaire"
           style="display: inline-block; background: #0f172a; color: white; padding: 12px 22px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Voir toutes les alertes
        </a>
      </div>
    </div>
    ${footer(unsubscribeUrl)}
  </div>
</body>
</html>`;
}

export function buildVeilleWelcomeHtml(params: {
  email: string;
  unsubscribeUrl: string;
}): string {
  const { email, unsubscribeUrl } = params;
  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    ${HEADER}
    <div style="padding: 32px;">
      <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Bienvenue dans la veille RoullePro</h2>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">
        Votre inscription est confirmée pour <strong>${escapeHtml(email)}</strong>.
      </p>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">
        Vous recevrez désormais un email hebdomadaire (mardi matin) avec les alertes réglementaires qui concernent votre métier : décrets, conventions, arrêtés. Sources officielles, langage clair, actions concrètes.
      </p>
      <p style="color: #334155; font-size: 15px; line-height: 1.6; background: #eff6ff; border-left: 4px solid #1d4ed8; padding: 12px 16px; margin: 24px 0;">
        Pas de spam, pas de pub. Désinscription en 1 clic à tout moment depuis n'importe quel email reçu.
      </p>
    </div>
    ${footer(unsubscribeUrl)}
  </div>
</body>
</html>`;
}
