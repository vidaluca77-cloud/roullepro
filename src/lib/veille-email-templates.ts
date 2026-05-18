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
