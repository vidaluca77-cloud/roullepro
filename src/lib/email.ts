/**
 * Helpers d'envoi d'email via Resend.
 * Silencieux si RESEND_API_KEY n'est pas configuré.
 *
 * FROM_EMAIL : utilise RESEND_FROM_EMAIL en priorité (domaine vérifié),
 * sinon tombe sur onboarding@resend.dev (domaine de test Resend, fonctionnel sans vérification).
 */

const RESEND_API = 'https://api.resend.com/emails';

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'RoullePro <onboarding@resend.dev>';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://roullepro.com';

async function sendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  reply_to?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // pas de clé = mode silencieux

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        ...(payload.reply_to ? { reply_to: payload.reply_to } : {}),
      }),
    });

    if (!res.ok) {
      console.error('[Resend] error:', await res.text());
    }
  } catch (err) {
    console.error('[Resend] fetch error:', err);
  }
}

/* ─────────────────────────────────────────
   1. Notification vendeur — nouveau message
───────────────────────────────────────── */
export async function sendVendeurNotification({
  vendeurEmail,
  vendeurName,
  senderName,
  senderEmail,
  annonceTitle,
  annonceId,
  messageContent,
}: {
  vendeurEmail: string;
  vendeurName: string;
  senderName: string;
  senderEmail: string;
  annonceTitle: string;
  annonceId: string;
  messageContent: string;
}) {
  const dashboardUrl = `${APP_URL}/dashboard`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background: #2563eb; padding: 24px 32px;">
        <h1 style="color: white; margin: 0; font-size: 20px;">RoullePro</h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #1f2937; margin-top: 0;">Nouveau message reçu</h2>
        <p style="color: #6b7280; font-size: 15px;">
          Bonjour ${vendeurName || 'cher vendeur'},<br><br>
          Vous avez reçu un nouveau message concernant votre annonce
          <strong style="color: #1f2937;">${annonceTitle}</strong>.
        </p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">De</p>
          <p style="margin: 0; font-weight: 600; color: #1f2937;">${senderName}</p>
          <a href="mailto:${senderEmail}" style="color: #2563eb; font-size: 14px;">${senderEmail}</a>
          <p style="margin: 16px 0 8px 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
          <p style="margin: 0; color: #374151; white-space: pre-line; line-height: 1.6; font-size: 15px;">${messageContent.replace(/\n/g, '<br>')}</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${dashboardUrl}" style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
            Répondre depuis mon espace
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Vous pouvez répondre directement à cet email ou passer par votre
          <a href="${dashboardUrl}" style="color: #2563eb;">dashboard RoullePro</a>.
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: vendeurEmail,
    subject: `[RoullePro] Nouveau message pour "${annonceTitle}"`,
    html,
    reply_to: senderEmail,
  });
}

/* ─────────────────────────────────────────
   2. Notification admin — nouvelle annonce pending
───────────────────────────────────────── */
export async function sendAdminNewAnnoncePending({
  annonceId,
  annonceTitle,
  vendeurName,
  vendeurEmail,
  categorie,
  price,
  city,
}: {
  annonceId: string;
  annonceTitle: string;
  vendeurName: string;
  vendeurEmail: string;
  categorie?: string;
  price?: number | null;
  city?: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return; // pas d'admin email configuré = silencieux

  const adminUrl = `${APP_URL}/admin`;
  const annonceUrl = `${APP_URL}/annonces/${annonceId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background: #111827; padding: 24px 32px; display: flex; align-items: center; gap: 12px;">
        <h1 style="color: white; margin: 0; font-size: 18px;">RoullePro · Admin</h1>
      </div>
      <div style="padding: 32px;">
        <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 15px;">⏳ Nouvelle annonce en attente de modération</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; color: #6b7280; width: 130px;">Titre</td>
            <td style="padding: 10px 0; font-weight: 600;">${annonceTitle}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; color: #6b7280;">Vendeur</td>
            <td style="padding: 10px 0;">${vendeurName || '—'} · <a href="mailto:${vendeurEmail}" style="color: #2563eb;">${vendeurEmail}</a></td>
          </tr>
          ${categorie ? `<tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 10px 0; color: #6b7280;">Catégorie</td><td style="padding: 10px 0;">${categorie}</td></tr>` : ''}
          ${price ? `<tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 10px 0; color: #6b7280;">Prix</td><td style="padding: 10px 0; font-weight: 600; color: #2563eb;">${Number(price).toLocaleString('fr-FR')} €</td></tr>` : ''}
          ${city ? `<tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 10px 0; color: #6b7280;">Ville</td><td style="padding: 10px 0;">${city}</td></tr>` : ''}
        </table>
        <div style="display: flex; gap: 12px; margin-top: 32px; text-align: center;">
          <a href="${adminUrl}" style="flex: 1; background: #111827; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
            Ouvrir la modération
          </a>
          <a href="${annonceUrl}" style="flex: 1; background: #f3f4f6; color: #374151; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
            Voir l'annonce
          </a>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `[RoullePro] Nouvelle annonce à modérer : "${annonceTitle}"`,
    html,
  });
}

/* ─────────────────────────────────────────
   3. Notification vendeur — annonce approuvée
───────────────────────────────────────── */
export async function sendVendeurAnnonceApprouvee({
  vendeurEmail,
  vendeurName,
  annonceTitle,
  annonceId,
}: {
  vendeurEmail: string;
  vendeurName: string;
  annonceTitle: string;
  annonceId: string;
}) {
  const annonceUrl = `${APP_URL}/annonces/${annonceId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background: #2563eb; padding: 24px 32px;">
        <h1 style="color: white; margin: 0; font-size: 20px;">RoullePro</h1>
      </div>
      <div style="padding: 32px;">
        <div style="background: #d1fae5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; color: #065f46; font-weight: 600; font-size: 15px;">✅ Votre annonce est maintenant en ligne !</p>
        </div>
        <p style="color: #6b7280; font-size: 15px;">
          Bonjour ${vendeurName || ''},<br><br>
          Votre annonce <strong style="color: #1f2937;">${annonceTitle}</strong> a été validée et est désormais visible par tous les acheteurs sur RoullePro.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${annonceUrl}" style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
            Voir mon annonce en ligne
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Merci de faire confiance à RoullePro.
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: vendeurEmail,
    subject: `[RoullePro] Votre annonce "${annonceTitle}" est en ligne`,
    html,
  });
}

/* ─────────────────────────────────────────
   4. Notification vendeur — annonce refusée
───────────────────────────────────────── */
export async function sendVendeurAnnonceRefusee({
  vendeurEmail,
  vendeurName,
  annonceTitle,
}: {
  vendeurEmail: string;
  vendeurName: string;
  annonceTitle: string;
}) {
  const depotUrl = `${APP_URL}/deposer-annonce`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background: #2563eb; padding: 24px 32px;">
        <h1 style="color: white; margin: 0; font-size: 20px;">RoullePro</h1>
      </div>
      <div style="padding: 32px;">
        <div style="background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 15px;">Annonce non publiée</p>
        </div>
        <p style="color: #6b7280; font-size: 15px;">
          Bonjour ${vendeurName || ''},<br><br>
          Votre annonce <strong style="color: #1f2937;">${annonceTitle}</strong> n'a pas pu être publiée car elle ne respecte pas nos conditions d'utilisation.
        </p>
        <p style="color: #6b7280; font-size: 15px;">
          Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à déposer une nouvelle annonce en vous assurant que votre véhicule correspond bien aux catégories professionnelles acceptées sur RoullePro.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${depotUrl}" style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
            Déposer une nouvelle annonce
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Merci de faire confiance à RoullePro.
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: vendeurEmail,
    subject: `[RoullePro] Votre annonce "${annonceTitle}" n'a pas été publiée`,
    html,
  });
}
