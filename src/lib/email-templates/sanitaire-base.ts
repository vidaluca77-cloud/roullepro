/**
 * Base template et constantes pour les emails sanitaire RoullePro.
 * Toutes les couleurs, constantes de marque et le builder HTML centralisés ici.
 */

// ─── Constantes de marque ────────────────────────────────────────────────────

export const PRICE_ESSENTIAL_DISPLAY = "19,90 EUR/mois";

export const RP_COLOR_PRIMARY  = "#0066CC";
export const RP_COLOR_SUCCESS  = "#0B8C3F";
export const RP_COLOR_DANGER   = "#b91c1c";
export const RP_COLOR_MUTED    = "#6b7280";

export const RP_PHONE          = "06 15 47 28 13";
export const RP_CONTACT_EMAIL  = "contact@roullepro.com";
export const RP_SITE_URL       = "https://www.roullepro.com";

// ─── Escape HTML (réutilise la logique de @/lib/email) ───────────────────────

export function escapeHtml(s: string | null | undefined): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Builder principal ───────────────────────────────────────────────────────

export interface BuildSanitaireEmailOptions {
  preheader: string;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  accentColor?: string;
  plainText?: string;
}

export function buildSanitaireEmail(opts: BuildSanitaireEmailOptions): {
  html: string;
  text: string;
} {
  const accent = opts.accentColor ?? RP_COLOR_PRIMARY;

  const ctaBlock = opts.ctaLabel && opts.ctaUrl
    ? `<div style="text-align:center;margin:32px 0">
        <a href="${opts.ctaUrl}"
           style="display:inline-block;background:${accent};color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;line-height:1.2">
          ${escapeHtml(opts.ctaLabel)}
        </a>
      </div>`
    : "";

  const footerHtml = `
    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:13px;color:${RP_COLOR_MUTED};text-align:center">
      <p style="margin:4px 0">
        L'équipe RoullePro &mdash; Annuaire du transport sanitaire
      </p>
      <p style="margin:4px 0">
        ${escapeHtml(RP_PHONE)} &middot;
        <a href="mailto:${RP_CONTACT_EMAIL}" style="color:${RP_COLOR_PRIMARY}">${RP_CONTACT_EMAIL}</a>
      </p>
      <p style="margin:4px 0">
        <a href="${RP_SITE_URL}" style="color:${RP_COLOR_PRIMARY}">${RP_SITE_URL}</a>
      </p>
      <p style="margin:12px 0 0;font-size:11px;color:#9ca3af">
        E-mail transactionnel envoyé suite à une action sur votre compte RoullePro.
      </p>
    </div>`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <!-- Preheader masqué -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#f9fafb">
    ${escapeHtml(opts.preheader)}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;padding:32px 16px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:24px">
              <div style="font-size:22px;font-weight:700;color:${RP_COLOR_PRIMARY};letter-spacing:-0.3px">
                RoullePro &mdash; Transport sanitaire
              </div>
            </td>
          </tr>

          <!-- Carte blanche -->
          <tr>
            <td style="background:#ffffff;border-radius:12px;padding:32px 32px 24px;box-shadow:0 1px 3px rgba(0,0,0,.07)">

              <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#111827;line-height:1.3">
                ${opts.title}
              </h1>

              ${opts.bodyHtml}

              ${ctaBlock}

              ${footerHtml}

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // ─── Version texte ────────────────────────────────────────────────────────
  const defaultText = [
    opts.title,
    "─".repeat(60),
    "",
    opts.bodyHtml
      // Supprimer les balises HTML
      .replace(/<[^>]+>/g, " ")
      // Décoder les entités HTML basiques
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&mdash;/g, "—")
      .replace(/&middot;/g, "·")
      .replace(/&laquo;/g, "«")
      .replace(/&raquo;/g, "»")
      .replace(/&zwnj;/g, "")
      // Nettoyer les espaces multiples
      .replace(/\s{2,}/g, "\n")
      .trim(),
    "",
    ...(opts.ctaLabel && opts.ctaUrl
      ? [`→ ${opts.ctaLabel} : ${opts.ctaUrl}`, ""]
      : []),
    "─".repeat(60),
    "L'équipe RoullePro",
    "Annuaire du transport sanitaire",
    `${RP_PHONE} · ${RP_CONTACT_EMAIL}`,
    RP_SITE_URL,
    "",
    "E-mail transactionnel envoyé suite à une action sur votre compte RoullePro.",
  ].join("\n");

  return {
    html,
    text: opts.plainText ?? defaultText,
  };
}
