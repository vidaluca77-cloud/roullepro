/**
 * Helpers d'envoi d'email via SDK Resend officiel.
 * Silencieux si RESEND_API_KEY n'est pas configuré.
 *
 * FROM_EMAIL : utilise RESEND_FROM_EMAIL en priorité (domaine vérifié),
 * sinon tombe sur onboarding@resend.dev (domaine de test Resend, fonctionnel sans vérification).
 */

import { Resend } from 'resend';

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'RoullePro <onboarding@resend.dev>';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://roullepro.com';

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Resend] RESEND_API_KEY manquant — email non envoyé');
    return null;
  }
  return new Resend(apiKey);
}

async function sendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  reply_to?: string;
}) {
  const resend = getResendClient();
  if (!resend) return;

  console.log('[Resend] Envoi email →', payload.to, '|', payload.subject);

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    ...(payload.reply_to ? { replyTo: payload.reply_to } : {}),
  });

  if (error) {
    console.error('[Resend] Erreur envoi email:', error.message);
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
  if (!adminEmail) return;

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

/* ─────────────────────────────────────────
   5. Notification acheteur — réponse du vendeur
───────────────────────────────────────── */
export async function sendReplyNotification({
  buyerEmail,
  buyerName,
  vendeurName,
  annonceTitle,
  annonceId,
  replyContent,
}: {
  buyerEmail: string;
  buyerName: string;
  vendeurName: string;
  annonceTitle: string;
  annonceId: string;
  replyContent: string;
}) {
  const annonceUrl = `${APP_URL}/annonces/${annonceId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 28px 32px;">
        <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">RoullePro</h1>
        <p style="color: rgba(255,255,255,0.75); margin: 4px 0 0; font-size: 13px;">Marketplace B2B du transport routier</p>
      </div>
      <div style="padding: 32px;">
        <div style="background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 24px;">
          <p style="margin: 0; color: #1d4ed8; font-weight: 600; font-size: 14px;">
            💬 Le vendeur a répondu à votre message
          </p>
        </div>
        <p style="color: #6b7280; font-size: 15px; margin-top: 0;">
          Bonjour ${buyerName || ''},<br><br>
          <strong style="color: #1f2937;">${vendeurName}</strong> a répondu à votre message
          concernant l'annonce <strong style="color: #1f2937;">${annonceTitle}</strong>.
        </p>
        <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 24px 0; background: #f9fafb;">
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Réponse de ${vendeurName}</p>
          <p style="margin: 0; color: #374151; white-space: pre-line; line-height: 1.7; font-size: 15px;">${replyContent.replace(/\n/g, '<br>')}</p>
        </div>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${annonceUrl}"
            style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 10px;
                   text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
            Voir l'annonce →
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0; border-top: 1px solid #f3f4f6; padding-top: 20px;">
          Vous pouvez contacter le vendeur directement depuis la page de l'annonce sur RoullePro.
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: buyerEmail,
    subject: `[RoullePro] ${vendeurName} a répondu à votre message — "${annonceTitle}"`,
    html,
  });
}

/* ─────────────────────────────────────────
   6. Alerte — nouvelle annonce dans une catégorie suivie
───────────────────────────────────────── */
export async function sendAlerteNouvelleAnnonce({
  abonneEmail,
  abonneName,
  categorieName,
  annonceTitle,
  annonceId,
  annoncePrice,
  annonceCity,
  annonceImageUrl,
}: {
  abonneEmail: string;
  abonneName: string;
  categorieName: string;
  annonceTitle: string;
  annonceId: string;
  annoncePrice?: number | null;
  annonceCity?: string;
  annonceImageUrl?: string;
}) {
  const annonceUrl = `${APP_URL}/annonces/${annonceId}`;
  const unsubscribeUrl = `${APP_URL}/profil?section=alertes`;
  const priceText = annoncePrice
    ? `${Number(annoncePrice).toLocaleString('fr-FR')} €`
    : 'Prix sur demande';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 28px 32px;">
        <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">RoullePro</h1>
        <p style="color: rgba(255,255,255,0.75); margin: 4px 0 0; font-size: 13px;">Marketplace B2B du transport routier</p>
      </div>

      <div style="padding: 32px;">
        <div style="background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 24px;">
          <p style="margin: 0; color: #1d4ed8; font-weight: 600; font-size: 14px;">
            🔔 Nouvelle annonce dans <strong>${categorieName}</strong>
          </p>
        </div>

        <p style="color: #6b7280; font-size: 15px; margin-top: 0;">
          Bonjour ${abonneName || 'cher professionnel'},<br><br>
          Une nouvelle annonce correspond à votre alerte pour la catégorie
          <strong style="color: #1f2937;">${categorieName}</strong>.
        </p>

        <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin: 24px 0;">
          ${annonceImageUrl ? `
          <div style="height: 200px; overflow: hidden; background: #f3f4f6;">
            <img src="${annonceImageUrl}" alt="${annonceTitle}"
              style="width: 100%; height: 100%; object-fit: cover;" />
          </div>` : ''}
          <div style="padding: 20px;">
            <span style="background: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">
              ${categorieName}
            </span>
            <h2 style="margin: 12px 0 8px; font-size: 18px; color: #111827;">${annonceTitle}</h2>
            <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
              <span style="font-size: 22px; font-weight: 700; color: #2563eb;">${priceText}</span>
              ${annonceCity ? `<span style="color: #6b7280; font-size: 14px;">📍 ${annonceCity}</span>` : ''}
            </div>
          </div>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${annonceUrl}"
            style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 10px;
                   text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
            Voir l'annonce →
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 28px 0;" />

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Vous recevez cet email car vous êtes abonné aux alertes <strong>${categorieName}</strong> sur RoullePro.<br>
          <a href="${unsubscribeUrl}" style="color: #6b7280;">Gérer mes alertes</a>
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: abonneEmail,
    subject: `[RoullePro] Nouvelle annonce ${categorieName} : ${annonceTitle}`,
    html,
  });
}

/* ─────────────────────────────────────────
   7. Email de bienvenue — nouvelle inscription
───────────────────────────────────────── */
export async function sendWelcomeEmail({
  userEmail,
  userName,
}: {
  userEmail: string;
  userName?: string;
}) {
  const loginUrl = `${APP_URL}/auth/login`;
  const deposerUrl = `${APP_URL}/deposer-annonce`;
  const annoncesUrl = `${APP_URL}/annonces`;

  const prenom = userName?.trim().split(' ')[0] || '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 40px 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Bienvenue sur RoullePro</h1>
        <p style="color: #bfdbfe; margin: 8px 0 0 0; font-size: 15px;">La marketplace B2B du transport routier professionnel</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">
          Bonjour${prenom ? ' ' + prenom : ''},
        </h2>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
          Merci de rejoindre <strong>RoullePro</strong>, la première plateforme B2B dédiée aux professionnels du transport routier.
          Votre compte est maintenant actif — voici par où commencer :
        </p>

        <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #1f2937;">🚀 Premiers pas</h3>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
            <li>Complétez votre profil vendeur (KBIS, SIRET)</li>
            <li>Déposez votre première annonce <strong>gratuitement</strong></li>
            <li>Parcourez les annonces disponibles (VTC, taxi, ambulance, TPMR, navette, utilitaires)</li>
            <li>Activez les alertes sur les catégories qui vous intéressent</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${deposerUrl}" style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; margin: 4px;">
            Déposer une annonce
          </a>
          <a href="${annoncesUrl}" style="background: #f3f4f6; color: #1f2937; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; margin: 4px;">
            Parcourir les annonces
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 24px;">
          <strong>100% gratuit</strong> pour les vendeurs, aucune commission prélevée sur vos ventes.
          Une question ? Répondez directement à cet email, notre équipe vous répondra sous 24h.
        </p>

        <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <a href="${loginUrl}" style="color: #2563eb;">Se connecter</a> ·
          <a href="${APP_URL}/comment-ca-marche" style="color: #2563eb;">Comment ça marche</a> ·
          <a href="${APP_URL}/contact" style="color: #2563eb;">Nous contacter</a>
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: userEmail,
    subject: 'Bienvenue sur RoullePro — votre compte est actif',
    html,
  });
}

/* ═══════════════════════════════════════════════════════════
   DÉPÔT-VENTE — fonctions email
═══════════════════════════════════════════════════════════ */

const APP_URL_DV = process.env.NEXT_PUBLIC_APP_URL || 'https://roullepro.com';

function emailHeader(title?: string) {
  return `
    <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 28px 32px;">
      <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">RoullePro</h1>
      <p style="color: rgba(255,255,255,0.75); margin: 4px 0 0; font-size: 13px;">Service dépôt-vente professionnel</p>
      ${title ? `<p style="color: white; font-weight: 600; margin: 12px 0 0; font-size: 16px;">${title}</p>` : ''}
    </div>
  `;
}

function emailFooter() {
  return `
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0; border-top: 1px solid #f3f4f6; padding-top: 20px;">
      RoullePro — Service dépôt-vente |
      <a href="${APP_URL_DV}" style="color: #6b7280;">roullepro.com</a>
    </p>
  `;
}

/* ── Candidature garage — confirmation au candidat ── */
export async function sendGarageCandidatureConfirmation(
  to: string,
  raison_sociale: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader("Candidature reçue")}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px; color: #374151;">Bonjour,</p>
        <p style="font-size: 15px; color: #374151;">
          Nous avons bien reçu la candidature de <strong>${raison_sociale}</strong>
          pour devenir garage partenaire RoullePro.
        </p>
        <div style="background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 24px 0;">
          <p style="margin: 0; color: #1d4ed8; font-size: 14px;">
            Notre équipe examine votre dossier et vous contactera sous <strong>48 heures ouvrées</strong>.
          </p>
        </div>
        <p style="font-size: 14px; color: #6b7280;">
          En attendant, n'hésitez pas à consulter notre site pour en savoir plus sur le partenariat.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${APP_URL_DV}/depot-vente"
            style="background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
            En savoir plus
          </a>
        </div>
        ${emailFooter()}
      </div>
    </div>
  `;
  await sendEmail({
    to,
    subject: "[RoullePro] Candidature garage partenaire bien reçue",
    html,
  });
}

/* ── Candidature garage — notification admin ── */
export async function sendGarageCandidatureAdminNotification(
  candidatureId: string,
  raison_sociale: string
) {
  const adminUrl = `${APP_URL_DV}/admin/garages/${candidatureId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader("Nouvelle candidature garage")}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Nouvelle candidature garage partenaire reçue.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280; width: 140px;">Raison sociale</td>
            <td style="padding: 8px 0; font-weight: 600;">${raison_sociale}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">ID candidature</td>
            <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${candidatureId}</td>
          </tr>
        </table>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${adminUrl}"
            style="background: #111827; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
            Traiter la candidature
          </a>
        </div>
        ${emailFooter()}
      </div>
    </div>
  `;
  await sendEmail({
    to: "admin@roullepro.com",
    subject: `[RoullePro Admin] Nouvelle candidature garage : ${raison_sociale}`,
    html,
  });
}

/* ── Changement statut garage ── */
export async function sendGarageStatusUpdate(
  to: string,
  raison_sociale: string,
  statut: string
) {
  let statusHtml = '';
  let subject = '';

  if (statut === 'actif') {
    subject = "[RoullePro] Votre garage a été validé — bienvenue !";
    statusHtml = `
      <div style="background: #d1fae5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; color: #065f46; font-weight: 600;">Félicitations ! Votre garage est maintenant actif sur RoullePro.</p>
      </div>
      <p style="color: #374151; font-size: 15px;">
        Vous pouvez accéder à votre tableau de bord pour recevoir vos premiers dépôts.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${APP_URL_DV}/garage/dashboard"
          style="background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
          Accéder à mon dashboard
        </a>
      </div>
    `;
  } else if (statut === 'pre_valide') {
    subject = "[RoullePro] Votre candidature est pré-validée";
    statusHtml = `
      <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e; font-weight: 600;">Votre dossier est pré-validé. Un conseiller RoullePro vous contactera sous peu.</p>
      </div>
    `;
  } else if (statut === 'refuse') {
    subject = "[RoullePro] Candidature garage non retenue";
    statusHtml = `
      <div style="background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; color: #991b1b; font-weight: 600;">Votre candidature n'a pas été retenue à ce stade.</p>
      </div>
      <p style="color: #374151; font-size: 15px;">
        Pour toute question, n'hésitez pas à nous contacter via <a href="mailto:contact@roullepro.com" style="color: #2563eb;">contact@roullepro.com</a>.
      </p>
    `;
  } else if (statut === 'suspendu') {
    subject = "[RoullePro] Compte garage suspendu";
    statusHtml = `
      <div style="background: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; color: #9a3412; font-weight: 600;">Votre compte garage a été temporairement suspendu.</p>
      </div>
      <p style="color: #374151; font-size: 15px;">
        Contactez-nous à <a href="mailto:contact@roullepro.com" style="color: #2563eb;">contact@roullepro.com</a> pour plus d'informations.
      </p>
    `;
  } else {
    subject = `[RoullePro] Mise à jour de votre dossier garage (${statut})`;
    statusHtml = `<p style="color: #374151; font-size: 15px;">Statut de votre dossier : <strong>${statut}</strong></p>`;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader()}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px; color: #374151;">Bonjour <strong>${raison_sociale}</strong>,</p>
        ${statusHtml}
        ${emailFooter()}
      </div>
    </div>
  `;
  await sendEmail({ to, subject, html });
}

/* ── Confirmation RDV dépôt au vendeur ── */
export async function sendDepotRdvConfirmation(
  to: string,
  depot: { id: string; marque?: string | null; modele?: string | null; date_depot_prevu?: string | null },
  garage: { raison_sociale: string; adresse?: string | null; ville?: string | null; contact_telephone?: string | null }
) {
  const vehicule = [depot.marque, depot.modele].filter(Boolean).join(' ') || 'votre véhicule';
  const dateStr = depot.date_depot_prevu
    ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(depot.date_depot_prevu))
    : 'date à confirmer';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader("Rendez-vous de dépôt confirmé")}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Votre rendez-vous de dépôt pour <strong>${vehicule}</strong> est confirmé.</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Garage</p>
          <p style="margin: 0 0 4px; font-weight: 700; font-size: 16px;">${garage.raison_sociale}</p>
          ${garage.adresse ? `<p style="margin: 0; color: #374151; font-size: 14px;">${garage.adresse}${garage.ville ? ', ' + garage.ville : ''}</p>` : ''}
          ${garage.contact_telephone ? `<p style="margin: 4px 0 0; color: #2563eb; font-size: 14px;">${garage.contact_telephone}</p>` : ''}
          <p style="margin: 12px 0 0; font-size: 13px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Date prévue</p>
          <p style="margin: 4px 0 0; font-weight: 600; color: #1f2937;">${dateStr}</p>
        </div>
        <p style="font-size: 13px; color: #6b7280;">Pensez à apporter la carte grise et les clés du véhicule.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${APP_URL_DV}/dashboard/depots/${depot.id}"
            style="background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
            Voir mon dépôt
          </a>
        </div>
        ${emailFooter()}
      </div>
    </div>
  `;
  await sendEmail({ to, subject: `[RoullePro] RDV de dépôt confirmé — ${vehicule}`, html });
}

/* ── Notification RDV au garage ── */
export async function sendDepotRdvNotification(
  to: string,
  depot: { id: string; marque?: string | null; modele?: string | null; annee?: number | null; kilometrage?: number | null; date_depot_prevu?: string | null },
  vendeur_name: string
) {
  const vehicule = [depot.marque, depot.modele].filter(Boolean).join(' ') || 'véhicule';
  const dateStr = depot.date_depot_prevu
    ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(depot.date_depot_prevu))
    : 'date à confirmer';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader("Nouveau véhicule à recevoir")}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Un nouveau dépôt a été planifié dans votre garage.</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; color: #6b7280;">Véhicule</td>
              <td style="padding: 8px 0; font-weight: 600;">${vehicule}${depot.annee ? ' (' + depot.annee + ')' : ''}</td>
            </tr>
            ${depot.kilometrage ? `<tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 8px 0; color: #6b7280;">Kilométrage</td><td style="padding: 8px 0;">${Number(depot.kilometrage).toLocaleString('fr-FR')} km</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; color: #6b7280;">Vendeur</td>
              <td style="padding: 8px 0;">${vendeur_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Date prévue</td>
              <td style="padding: 8px 0; font-weight: 600; color: #2563eb;">${dateStr}</td>
            </tr>
          </table>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${APP_URL_DV}/garage/dashboard/depots/${depot.id}"
            style="background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
            Voir la fiche dépôt
          </a>
        </div>
        ${emailFooter()}
      </div>
    </div>
  `;
  await sendEmail({ to, subject: `[RoullePro] Nouveau dépôt prévu — ${vehicule} le ${dateStr}`, html });
}

/* ── Notification nouvelle offre au vendeur ── */
export async function sendDepotOffreVendeur(
  to: string,
  depot: { id: string; marque?: string | null; modele?: string | null },
  offre: { id: string; montant: number; message?: string | null; expire_at?: string | null }
) {
  const vehicule = [depot.marque, depot.modele].filter(Boolean).join(' ') || 'votre véhicule';
  const expireStr = offre.expire_at
    ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(offre.expire_at))
    : '48 heures';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader("Nouvelle offre reçue")}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Vous avez reçu une nouvelle offre pour <strong>${vehicule}</strong>.</p>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Montant proposé</p>
          <p style="margin: 8px 0 0; font-size: 32px; font-weight: 800; color: #2563eb;">${Number(offre.montant).toLocaleString('fr-FR')} €</p>
        </div>
        ${offre.message ? `
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Message de l'acheteur</p>
            <p style="margin: 0; font-size: 14px; color: #374151;">${offre.message}</p>
          </div>
        ` : ''}
        <p style="font-size: 13px; color: #ef4444; font-weight: 600;">Cette offre expire le ${expireStr}. Répondez rapidement !</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${APP_URL_DV}/dashboard/depots/${depot.id}"
            style="background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
            Accepter ou refuser l'offre
          </a>
        </div>
        ${emailFooter()}
      </div>
    </div>
  `;
  await sendEmail({ to, subject: `[RoullePro] Nouvelle offre de ${Number(offre.montant).toLocaleString('fr-FR')} € pour ${vehicule}`, html });
}

/* ── Confirmation offre à l'acheteur ── */
export async function sendDepotOffreAcheteur(
  to: string,
  depot: { id: string; marque?: string | null; modele?: string | null; annee?: number | null },
  offre: { id: string; montant: number; expire_at?: string | null }
) {
  const vehicule = [depot.marque, depot.modele].filter(Boolean).join(' ') || 'le véhicule';
  const expireStr = offre.expire_at
    ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(offre.expire_at))
    : 'sous 48 heures';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader("Offre transmise au vendeur")}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Votre offre pour <strong>${vehicule}${depot.annee ? ' (' + depot.annee + ')' : ''}</strong> a bien été transmise au vendeur.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Votre offre</p>
          <p style="margin: 8px 0 0; font-size: 32px; font-weight: 800; color: #16a34a;">${Number(offre.montant).toLocaleString('fr-FR')} €</p>
        </div>
        <p style="font-size: 14px; color: #374151;">Le vendeur a jusqu'au <strong>${expireStr}</strong> pour accepter ou décliner votre offre. Vous recevrez un email dès qu'il aura répondu.</p>
        ${emailFooter()}
      </div>
    </div>
  `;
  await sendEmail({ to, subject: `[RoullePro] Votre offre de ${Number(offre.montant).toLocaleString('fr-FR')} € a été transmise`, html });
}

/* ── Accusé de réception de la demande au vendeur ── */
export async function sendDepotDemandeAccuse(
  to: string,
  depot: { id: string; marque?: string | null; modele?: string | null },
  garage: { raison_sociale: string; ville?: string | null }
) {
  const vehicule = [depot.marque, depot.modele].filter(Boolean).join(" ") || "votre véhicule";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader("Demande de dépôt-vente transmise")}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Votre demande de dépôt-vente pour <strong>${vehicule}</strong> a bien été transmise au garage partenaire RoullePro${garage.ville ? " de " + garage.ville : ""}.</p>
        <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 6px; font-size: 13px; color: #6b21a8; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Statut</p>
          <p style="margin: 0; font-weight: 700; color: #6b21a8;">En attente de validation par le garage</p>
        </div>
        <p style="font-size: 14px; color: #374151;">Le garage va examiner votre demande, valider le prix de vente proposé puis vous recontacter pour fixer le dépôt du véhicule. Vous recevrez un email dès que le garage aura répondu (généralement sous 48 heures).</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${APP_URL_DV}/dashboard" style="background: #7c3aed; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">Voir ma demande</a>
        </div>
        ${emailFooter()}
      </div>
    </div>
  `;
  await sendEmail({ to, subject: `[RoullePro] Demande de dépôt-vente transmise — ${vehicule}`, html });
}

/* ── Notification nouvelle demande au garage ── */
export async function sendDepotDemandeGarage(
  to: string,
  depot: { id: string; marque?: string | null; modele?: string | null; annee?: number | null; kilometrage?: number | null },
  vendeur_name: string,
  prix_propose_vendeur: number | null,
  message_vendeur: string | null
) {
  const vehicule = [depot.marque, depot.modele].filter(Boolean).join(" ") || "véhicule";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader("Nouvelle demande de dépôt-vente")}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Un particulier souhaite vous confier son véhicule en dépôt-vente. Merci d'examiner la demande et de valider le prix de vente (ou de refuser si le véhicule ne convient pas).</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 8px 0; color: #6b7280;">Véhicule</td><td style="padding: 8px 0; font-weight: 600;">${vehicule}${depot.annee ? " (" + depot.annee + ")" : ""}</td></tr>
            ${depot.kilometrage ? `<tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 8px 0; color: #6b7280;">Kilométrage</td><td style="padding: 8px 0;">${Number(depot.kilometrage).toLocaleString("fr-FR")} km</td></tr>` : ""}
            <tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 8px 0; color: #6b7280;">Vendeur</td><td style="padding: 8px 0;">${vendeur_name}</td></tr>
            ${prix_propose_vendeur ? `<tr><td style="padding: 8px 0; color: #6b7280;">Prix souhaité</td><td style="padding: 8px 0; font-weight: 700; color: #2563eb;">${Number(prix_propose_vendeur).toLocaleString("fr-FR")} €</td></tr>` : ""}
          </table>
        </div>
        ${message_vendeur ? `<div style="background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 16px 0;"><p style="margin: 0 0 4px; font-size: 12px; color: #a16207; font-weight: 600; text-transform: uppercase;">Message du vendeur</p><p style="margin: 0; font-size: 14px; color: #374151;">${message_vendeur}</p></div>` : ""}
        <div style="text-align: center; margin: 24px 0;">
          <a href="${APP_URL_DV}/garage/dashboard/depots/${depot.id}" style="background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">Traiter la demande</a>
        </div>
        ${emailFooter()}
      </div>
    </div>
  `;
  await sendEmail({ to, subject: `[RoullePro] Nouvelle demande de dépôt-vente — ${vehicule}`, html });
}

/* ── Demande validée par le garage ── */
export async function sendDepotDemandeValidee(
  to: string,
  depot: { id: string; marque?: string | null; modele?: string | null },
  info: { raison_sociale?: string; ville?: string | null; prix_valide: number; prix_vendeur_net: number; note_garage?: string | null }
) {
  const vehicule = [depot.marque, depot.modele].filter(Boolean).join(" ") || "votre véhicule";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader("Demande validée — prochaine étape : dépôt")}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Bonne nouvelle : votre demande de dépôt-vente pour <strong>${vehicule}</strong> a été validée par le garage partenaire RoullePro${info.ville ? " de " + info.ville : ""}.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 6px; font-size: 13px; color: #166534; text-transform: uppercase; font-weight: 600;">Prix de vente validé</p>
          <p style="margin: 0 0 12px; font-size: 28px; font-weight: 800; color: #16a34a;">${Number(info.prix_valide).toLocaleString("fr-FR")} €</p>
          <p style="margin: 0 0 4px; font-size: 13px; color: #166534; text-transform: uppercase; font-weight: 600;">Vous touchez net</p>
          <p style="margin: 0; font-size: 22px; font-weight: 700; color: #16a34a;">${Number(info.prix_vendeur_net).toLocaleString("fr-FR")} €</p>
          <p style="margin: 6px 0 0; font-size: 12px; color: #6b7280;">Après commissions RoullePro (4 %) + garage (7 % + forfait préparation).</p>
        </div>
        ${info.note_garage ? `<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;"><p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Message du garage</p><p style="margin: 0; font-size: 14px; color: #374151;">${info.note_garage}</p></div>` : ""}
        <p style="font-size: 14px; color: #374151;">Prochaine étape : convenir avec le garage de la date à laquelle vous lui confiez le véhicule. Une fois déposé, il sera mis en vente et vous serez payé sous 48 h après la vente.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${APP_URL_DV}/dashboard" style="background: #16a34a; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">Voir mon dépôt</a>
        </div>
        ${emailFooter()}
      </div>
    </div>
  `;
  await sendEmail({ to, subject: `[RoullePro] Demande validée — ${vehicule} à ${Number(info.prix_valide).toLocaleString("fr-FR")} €`, html });
}

/* ── Demande refusée par le garage ── */
export async function sendDepotDemandeRefusee(
  to: string,
  depot: { id: string; marque?: string | null; modele?: string | null },
  garage: { raison_sociale?: string; ville?: string | null },
  raison: string
) {
  const vehicule = [depot.marque, depot.modele].filter(Boolean).join(" ") || "votre véhicule";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader("Demande non retenue")}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Nous vous remercions pour votre demande de dépôt-vente concernant <strong>${vehicule}</strong>.</p>
        <p style="font-size: 14px; color: #374151;">Après examen, le garage partenaire RoullePro${garage.ville ? " de " + garage.ville : ""} n'est malheureusement pas en mesure d'accueillir ce véhicule.</p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #991b1b; font-weight: 600; text-transform: uppercase;">Raison du refus</p>
          <p style="margin: 0; font-size: 14px; color: #374151;">${raison}</p>
        </div>
        <p style="font-size: 14px; color: #374151;">N'hésitez pas à essayer avec un autre garage partenaire RoullePro dans une autre ville, ou à mettre directement votre véhicule en vente en tant que particulier sur notre plateforme.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${APP_URL_DV}/depot-vente/garages" style="background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">Voir les autres garages</a>
        </div>
        ${emailFooter()}
      </div>
    </div>
  `;
  await sendEmail({ to, subject: `[RoullePro] Demande non retenue — ${vehicule}`, html });
}
