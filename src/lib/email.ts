/**
 * Helpers d'envoi d'email via SDK Resend officiel.
 * Silencieux si RESEND_API_KEY n'est pas configuré.
 *
 * FROM_EMAIL : utilise RESEND_FROM_EMAIL en priorité (domaine vérifié),
 * sinon tombe sur onboarding@resend.dev (domaine de test Resend, fonctionnel sans vérification).
 */

/**
 * Helpers d'envoi d'email via l'API Resend (fetch direct, pas le SDK).
 * Plus robuste sur Netlify Functions.
 */

import { buildAccepterDirectUrl } from '@/lib/demande-accept-token';
import { MENTION_ESTIMATION_CPAM } from '@/lib/tarif-cpam';
import { MENTION_ESTIMATION_TRANSPORT_SANITAIRE } from '@/lib/tarif-transport-sanitaire';

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'RoullePro <onboarding@resend.dev>';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://roullepro.com';

/**
 * Echappe les caracteres HTML dangereux dans les valeurs saisies par
 * l'utilisateur avant interpolation dans un template email (anti-XSS).
 */
export function escapeHtml(s: string | null | undefined): string {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  /** Version texte brut de l'email (améliore le score anti-spam). Si absent, Resend utilise le HTML seul. */
  text?: string;
  reply_to?: string;
  /** Alias retro-compatible de reply_to (prioritaire si fourni). */
  replyTo?: string;
  bcc?: string | string[];
  /** Tags Resend pour le filtrage dans le dashboard (category, source_form, ...). */
  tags?: Array<{ name: string; value: string }>;
}): Promise<{ id: string | null } | null> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Resend] RESEND_API_KEY manquant — email non envoyé');
    return null;
  }

  const replyTo = payload.replyTo || payload.reply_to;
  console.log('[Resend] Envoi email →', payload.to, '|', payload.subject, '| from:', FROM_EMAIL);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        ...(payload.text ? { text: payload.text } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(payload.bcc ? { bcc: payload.bcc } : {}),
        ...(payload.tags && payload.tags.length ? { tags: payload.tags } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[Resend] HTTP', res.status, body);
      return null;
    }

    const data = await res.json().catch(() => null);
    console.log('[Resend] OK', data?.id);
    return { id: data?.id ?? null };
  } catch (e) {
    console.error('[Resend] Exception:', e instanceof Error ? e.message : String(e));
    return null;
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

function emailHeader(
  title?: string,
  tagline: string = 'Service dépôt-vente professionnel'
) {
  return `
    <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 28px 32px;">
      <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">RoullePro</h1>
      <p style="color: rgba(255,255,255,0.75); margin: 4px 0 0; font-size: 13px;">${tagline}</p>
      ${title ? `<p style="color: white; font-weight: 600; margin: 12px 0 0; font-size: 16px;">${title}</p>` : ''}
    </div>
  `;
}

function emailFooter(tagline: string = 'Service dépôt-vente') {
  return `
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0; border-top: 1px solid #f3f4f6; padding-top: 20px;">
      RoullePro — ${tagline} |
      <a href="${APP_URL_DV}" style="color: #6b7280;">roullepro.com</a>
    </p>
  `;
}

/* ── Candidature garage — confirmation au candidat ── */
export async function sendGarageCandidatureConfirmation(
  to: string,
  raison_sociale: string,
  setupLink?: string | null
) {
  const passwordBlock = setupLink
    ? `
        <div style="background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; padding: 16px 18px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #065f46; font-size: 14px; font-weight: 600;">
            Étape suivante : définissez votre mot de passe
          </p>
          <p style="margin: 0 0 14px 0; color: #047857; font-size: 13px;">
            Créez dès maintenant votre mot de passe pour accéder à votre espace garage dès la validation de votre dossier.
          </p>
          <div style="text-align: center;">
            <a href="${setupLink}"
              style="background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
              Définir mon mot de passe
            </a>
          </div>
          <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 11px; text-align: center;">
            Ce lien est valide 1 heure. Vous pourrez en générer un nouveau via la page « mot de passe oublié ».
          </p>
        </div>`
    : "";

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
        ${passwordBlock}
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
  statut: string,
  setupLink?: string | null,
  accountCreated?: boolean
) {
  let statusHtml = '';
  let subject = '';

  if (statut === 'actif') {
    subject = "[RoullePro] Votre garage a été validé — bienvenue !";
    const accessBlock = setupLink
      ? `
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; color: #1e3a8a; font-weight: 700; font-size: 15px;">${accountCreated ? "Votre compte a été créé" : "Accès à votre espace garage"}</p>
        <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
          ${accountCreated
            ? `Un compte a été créé avec l'adresse <strong>${to}</strong>. Cliquez sur le bouton ci-dessous pour définir votre mot de passe et accéder à votre tableau de bord.`
            : `Cliquez sur le bouton ci-dessous pour accéder en un clic à votre tableau de bord ou redéfinir votre mot de passe.`}
        </p>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${setupLink}"
          style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
          ${accountCreated ? "Définir mon mot de passe" : "Accéder à mon dashboard"}
        </a>
      </div>
      <p style="color: #6b7280; font-size: 13px; text-align: center;">
        Ce lien est valable 1 heure. Si vous avez déjà un compte, vous pouvez aussi vous connecter directement sur
        <a href="${APP_URL_DV}/auth/login" style="color: #2563eb;">roullepro.com</a>.
      </p>`
      : `
      <div style="text-align: center; margin: 24px 0;">
        <a href="${APP_URL_DV}/garage/dashboard"
          style="background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
          Accéder à mon dashboard
        </a>
      </div>`;

    statusHtml = `
      <div style="background: #d1fae5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; color: #065f46; font-weight: 600;">Félicitations ! Votre garage est maintenant actif sur RoullePro.</p>
      </div>
      <p style="color: #374151; font-size: 15px;">
        Vous pouvez accéder à votre tableau de bord pour recevoir vos premiers dépôts.
      </p>
      ${accessBlock}
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

/* ── Bienvenue garage — après définition du mot de passe ── */
export async function sendGarageWelcome(
  to: string,
  raison_sociale: string
) {
  const dashboardUrl = `${APP_URL_DV}/garage/dashboard`;
  const connectUrl = `${APP_URL_DV}/garage/dashboard?tab=stripe`;

  const subject = "[RoullePro] Bienvenue \u2014 premiers pas avec votre espace garage";

  const step = (
    n: string,
    color: string,
    title: string,
    body: string
  ) => `
          <tr>
            <td style="width: 36px; vertical-align: top; padding: 10px 12px 10px 0;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: ${color}; color: white; font-weight: 700; font-size: 14px; text-align: center; line-height: 28px;">${n}</div>
            </td>
            <td style="padding: 10px 0;">
              <p style="margin: 0; color: #111827; font-weight: 600; font-size: 15px;">${title}</p>
              <p style="margin: 4px 0 0; color: #4b5563; font-size: 14px;">${body}</p>
            </td>
          </tr>`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; background: #f9fafb;">
      ${emailHeader("Bienvenue sur RoullePro")}
      <div style="background: white; padding: 28px 32px;">
        <p style="font-size: 15px; color: #374151;">Bonjour <strong>${raison_sociale}</strong>,</p>

        <div style="background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 10px; padding: 18px; margin: 20px 0;">
          <p style="margin: 0; color: #065f46; font-weight: 600; font-size: 15px;">
            Votre mot de passe est défini, votre compte garage est prêt.
          </p>
          <p style="margin: 6px 0 0 0; color: #047857; font-size: 14px;">
            Vous pouvez maintenant recevoir des demandes de dépôt-vente et gérer vos véhicules depuis votre tableau de bord.
          </p>
        </div>

        <h2 style="color: #111827; font-size: 17px; margin: 28px 0 14px;">Vos premiers pas</h2>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 12px 0;">
          ${step(
            "1",
            "#2563eb",
            "Activez les paiements Stripe",
            "Connectez votre compte Stripe pour recevoir automatiquement votre commission \u00e0 chaque vente. Indispensable avant la premi\u00e8re vente."
          )}
          ${step(
            "2",
            "#2563eb",
            "Recevez les demandes de d\u00e9p\u00f4t-vente",
            "D\u00e8s qu\u2019un vendeur de votre zone fait une demande, elle appara\u00eet dans l\u2019onglet &laquo;&nbsp;Demandes \u00e0 traiter&nbsp;&raquo;. Validez ou refusez le prix propos\u00e9 en un clic."
          )}
          ${step(
            "3",
            "#2563eb",
            "Mettez le v\u00e9hicule en vente",
            "Apr\u00e8s r\u00e9ception du v\u00e9hicule, marquez-le comme re\u00e7u depuis le d\u00e9tail du d\u00e9p\u00f4t. Il passe automatiquement en vente sur votre page publique."
          )}
          ${step(
            "4",
            "#10b981",
            "Encaissez automatiquement",
            "L\u2019acheteur paie via Stripe Checkout sur votre page publique. Votre commission (7&nbsp;% + 250&nbsp;\u20ac de frais de pr\u00e9paration) est vers\u00e9e automatiquement sur votre compte Stripe."
          )}
        </table>

        <div style="text-align: center; margin: 32px 0 16px;">
          <a href="${dashboardUrl}"
            style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
            Accéder à mon tableau de bord
          </a>
        </div>

        <div style="text-align: center; margin: 12px 0 24px;">
          <a href="${connectUrl}"
            style="background: white; color: #2563eb; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; border: 1px solid #bfdbfe;">
            Activer les paiements Stripe
          </a>
        </div>

        <div style="background: #f9fafb; border-radius: 10px; padding: 18px; margin: 28px 0 20px;">
          <p style="margin: 0 0 6px; color: #111827; font-weight: 600; font-size: 14px;">Comment ça marche pour vous&nbsp;?</p>
          <p style="margin: 0; color: #4b5563; font-size: 13px; line-height: 1.6;">
            • Aucun frais de mise en ligne, vous ne payez que quand vous vendez.<br>
            • Votre page publique est protégée&nbsp;: ni votre SIRET ni votre raison sociale n’y apparaissent.<br>
            • RoullePro gère les photos HD, l’expertise 40 points, le contrat et l’encaissement.
          </p>
        </div>

        <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 24px 0 16px;">
          Une question&nbsp;? Répondez à cet email ou écrivez à
          <a href="mailto:contact@roullepro.com" style="color: #2563eb;">contact@roullepro.com</a>.
        </p>

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

/* ── Expiration annonce 90j ── */
export async function sendAnnonceExpiration(
  to: string,
  annonce: { id: string; title?: string | null; marque?: string | null; modele?: string | null }
) {
  const vehicule = annonce.title || [annonce.marque, annonce.modele].filter(Boolean).join(" ") || "Votre annonce";
  const relanceUrl = `${APP_URL}/dashboard/annonces/${annonce.id}/edit`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader("Votre annonce a expiré")}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Bonjour,</p>
        <p style="font-size: 14px;">Votre annonce <strong>${vehicule}</strong> a atteint sa durée maximale de publication (90 jours) et vient d'expirer.</p>
        <p style="font-size: 14px; color: #374151;">Vous avez 2 possibilités :</p>
        <ul style="font-size: 14px; color: #374151; line-height: 1.6;">
          <li><strong>Relancer</strong> gratuitement votre annonce pour 90 jours supplémentaires</li>
          <li><strong>Confier votre véhicule</strong> à un garage partenaire en dépôt-vente pour vendre plus vite</li>
        </ul>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${relanceUrl}" style="background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; margin: 0 6px;">Relancer mon annonce</a>
          <a href="${APP_URL}/depot-vente/garages" style="background: #10b981; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; margin: 6px;">Dépôt-vente</a>
        </div>
        ${emailFooter()}
      </div>
    </div>
  `;
  await sendEmail({ to, subject: `[RoullePro] Annonce expirée — ${vehicule}`, html });
}

/* ── Paiement séquestre en attente vendeur ── */
export async function sendEscrowSellerFundsHeld(
  to: string,
  data: { annonceTitle: string; amountSeller: number; transactionId: string }
) {
  const amount = (data.amountSeller / 100).toFixed(2);
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader("Paiement reçu en séquestre")}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Bonne nouvelle : un acheteur a payé <strong>${amount} €</strong> pour votre véhicule <strong>${data.annonceTitle}</strong>.</p>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>Les fonds sont sécurisés sur notre compte séquestre.</strong> Ils seront transférés sur votre compte Stripe Connect dès la confirmation de la livraison du véhicule par l'acheteur.</p>
        </div>
        <p style="font-size: 14px; color: #374151;">Organisez la livraison avec l'acheteur puis demandez-lui de confirmer la réception depuis son espace RoullePro.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${APP_URL}/dashboard/transactions/${data.transactionId}" style="background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">Voir la transaction</a>
        </div>
        ${emailFooter()}
      </div>
    </div>
  `;
  await sendEmail({ to, subject: `[RoullePro] Paiement sécurisé reçu — ${data.annonceTitle}`, html });
}

/* ═══════════════════════════════════════════════════════════
   DEMANDES DE TRANSPORT (chantier FINESS) — formulaires unifiés
═══════════════════════════════════════════════════════════ */

function ligneInfo(label: string, valeur?: string | null): string {
  if (!valeur) return '';
  return `<tr style="border-bottom:1px solid #e5e7eb"><td style="padding:8px 0;color:#6b7280;width:140px">${label}</td><td style="padding:8px 0;font-weight:600">${valeur}</td></tr>`;
}

function formatDateSouhaitee(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(d);
}

/**
 * Formate une ligne "Distance estimée : X km · Estimation CPAM : ~Y €" pour les
 * emails de transport. Renvoie null si aucune donnee exploitable (jamais de 0 €
 * trompeur). Toujours accompagnee de la mention indicative CPAM a l'affichage.
 */
function formatEstimationCourse(
  distanceKm?: number | null,
  prixEstime?: number | null
): string | null {
  const parts: string[] = [];
  if (typeof distanceKm === 'number' && Number.isFinite(distanceKm) && distanceKm > 0) {
    parts.push(`Distance estimée : ${distanceKm} km`);
  }
  if (typeof prixEstime === 'number' && Number.isFinite(prixEstime) && prixEstime > 0) {
    parts.push(`Estimation : ~${prixEstime} €`);
  }
  return parts.length ? parts.join(' · ') : null;
}

/**
 * Mention indicative adaptee au type de transport : taxi -> convention CPAM ;
 * VSL / ambulance -> convention nationale des transporteurs sanitaires.
 */
function mentionEstimation(typeTransport?: string | null): string {
  return typeTransport === 'vsl' || typeTransport === 'ambulance'
    ? MENTION_ESTIMATION_TRANSPORT_SANITAIRE
    : MENTION_ESTIMATION_CPAM;
}

/** Signature commerciale commune a tous les emails de transport (tutoiement). */
function signatureBloc(): string {
  return `
    <p style="font-size:14px;color:#374151;margin:24px 0 0">
      Lucas Horville<br>
      <a href="tel:+33615472813" style="color:#2563eb;text-decoration:none">06 15 47 28 13</a><br>
      <a href="mailto:contact@roullepro.com" style="color:#2563eb">contact@roullepro.com</a>
    </p>
  `;
}

/** Bouton d'action standard (CTA). */
function emailButton(href: string, label: string, color = '#2563eb'): string {
  return `<a href="${href}" style="background:${color};color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">${label}</a>`;
}

/** Construit un href tel: a partir d'un numero saisi librement. */
function telHref(tel?: string | null): string | null {
  if (!tel) return null;
  const digits = String(tel).replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : null;
}

/** URL du dashboard pro ou les demandes acceptees sont gerees. */
const DASHBOARD_PRO_URL = `${APP_URL_DV}/transport-medical/pro/dashboard`;

/* ── 1. Notification au pro — nouvelle demande de transport ── */
const TAUX_LIBELLE: Record<string, string> = {
  '100': '100 %',
  '65': '65 %',
  autre: 'Autre',
};

/** Libelle lisible du taux de prise en charge. */
function tauxLibelle(taux?: string | null, autre?: string | null): string | null {
  if (!taux) return null;
  if (taux === 'autre') {
    return `Autre${autre ? ` (${escapeHtml(autre)} %)` : ''}`;
  }
  return TAUX_LIBELLE[taux] || escapeHtml(taux);
}

/**
 * Email envoye aux pros notifies. NE CONTIENT PAS le nom/telephone/email du
 * demandeur (masques jusqu'a acceptation, cf. chantier 7). Le pro accede aux
 * coordonnees en cliquant "Voir + accepter" dans son dashboard.
 */
export async function sendDemandeTransportPro(p: {
  to: string;
  proNom: string;
  typeLibelle: string;
  lieuDepart?: string | null;
  lieuArrivee?: string | null;
  dateSouhaitee?: string | null;
  allerRetour?: boolean;
  mobilite?: string | null;
  precisions?: string | null;
  tauxPriseEnCharge?: string | null;
  tauxPriseEnChargeAutre?: string | null;
  bonTransportMedical?: boolean;
  sourceForm?: string | null;
  typeTransport?: string | null;
  distanceKm?: number | null;
  prixEstime?: number | null;
  demandeId?: string | null;
  proId?: string | null;
}): Promise<{ id: string | null } | null> {
  const dateStr = formatDateSouhaitee(p.dateSouhaitee);
  const estimationStr = formatEstimationCourse(p.distanceKm, p.prixEstime);
  const dashboardUrl = `${APP_URL_DV}/dashboard/demandes`;
  const accepterUrl =
    p.demandeId && p.proId
      ? buildAccepterDirectUrl(APP_URL_DV, p.demandeId, p.proId)
      : null;
  const tauxStr = p.tauxPriseEnCharge
    ? p.tauxPriseEnCharge === 'autre'
      ? `Autre${p.tauxPriseEnChargeAutre ? ` (${escapeHtml(p.tauxPriseEnChargeAutre)} %)` : ''}`
      : TAUX_LIBELLE[p.tauxPriseEnCharge] || escapeHtml(p.tauxPriseEnCharge)
    : null;
  const bonStr = p.bonTransportMedical
    ? 'Oui'
    : 'Manquant (le patient devra en fournir un)';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader(`Nouvelle demande de transport (${escapeHtml(p.typeLibelle)})`, 'Annuaire du transport sanitaire')}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Bonjour <strong>${escapeHtml(p.proNom)}</strong>,</p>
        <p style="font-size: 15px; color: #374151;">
          Une personne recherche un transport <strong>${escapeHtml(p.typeLibelle)}</strong> dans votre departement
          via RoullePro. Les premieres reponses sont prioritaires : la course est attribuee au premier pro qui accepte.
        </p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0">
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            ${ligneInfo('Type', escapeHtml(p.typeLibelle))}
            ${ligneInfo('Départ', escapeHtml(p.lieuDepart))}
            ${ligneInfo('Arrivée', escapeHtml(p.lieuArrivee))}
            ${ligneInfo('Date souhaitée', escapeHtml(dateStr))}
            ${p.allerRetour ? ligneInfo('Trajet', 'Aller-retour') : ''}
            ${ligneInfo('Mobilité', escapeHtml(p.mobilite))}
            ${tauxStr ? ligneInfo('Taux de prise en charge', tauxStr) : ''}
            ${ligneInfo('Bon de transport', bonStr)}
          </table>
        </div>
        ${estimationStr ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 16px;margin:16px 0"><p style="margin:0;font-size:14px;color:#1e40af;font-weight:600">${estimationStr}</p><p style="margin:6px 0 0;font-size:12px;color:#64748b">${mentionEstimation(p.typeTransport)}</p></div>` : ''}
        ${p.precisions ? `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0"><p style="margin:0 0 4px;font-size:12px;color:#a16207;font-weight:600;text-transform:uppercase">Précisions</p><p style="margin:0;font-size:14px;color:#374151">${escapeHtml(p.precisions).replace(/\n/g, '<br>')}</p></div>` : ''}
        <div style="text-align:center;margin:24px 0">
          ${accepterUrl ? `${emailButton(accepterUrl, 'Accepter cette course', '#10b981')}<br><br>` : ''}
          <a href="${dashboardUrl}" style="background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">Voir + accepter</a>
        </div>
        <p style="font-size:13px;color:#6b7280">${accepterUrl ? 'Le bouton « Accepter cette course » te permet de prendre la course en un clic (lien valable 48h). ' : ''}Les coordonnees du demandeur te seront communiquees des que tu auras accepte la course.</p>
        ${emailFooter('Annuaire du transport sanitaire')}
      </div>
    </div>
  `;
  return sendEmail({
    to: p.to,
    subject: `[RoullePro] Demande de transport ${p.typeLibelle} a prendre`,
    html,
    replyTo: 'contact@roullepro.com',
    tags: [
      { name: 'category', value: 'demande_transport' },
      ...(p.sourceForm ? [{ name: 'source_form', value: p.sourceForm }] : []),
      ...(p.typeTransport ? [{ name: 'type_transport', value: p.typeTransport }] : []),
    ],
  });
}

/* ── 2. Confirmation au demandeur ── */
export async function sendDemandeTransportConfirmation(p: {
  to: string;
  demandeurNom: string;
  typeLibelle: string;
  nbPros: number;
  suiviUrl?: string | null;
}) {
  const typeLibelle = escapeHtml(p.typeLibelle);
  const corps =
    p.nbPros > 0
      ? `Votre demande de transport <strong>${typeLibelle}</strong> a été transmise à ${p.nbPros} professionnel${p.nbPros > 1 ? 's' : ''} proche${p.nbPros > 1 ? 's' : ''} de vous. Ils vous recontacteront directement par téléphone.`
      : `Votre demande de transport <strong>${typeLibelle}</strong> a bien été enregistrée. Nous recherchons un professionnel disponible dans votre secteur et reviendrons vers vous rapidement.`;
  // Lien de suivi (facultatif) : le patient consulte l'avancement et peut annuler.
  const suiviBloc = p.suiviUrl
    ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 18px;margin:20px 0">
        <p style="margin:0 0 10px;font-size:14px;color:#166534">Suivez l'avancement de votre demande et annulez-la si besoin, à tout moment et sans compte :</p>
        <div style="text-align:center">${emailButton(p.suiviUrl, 'Suivre ma demande', '#16a34a')}</div>
      </div>`
    : '';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader('Votre demande de transport est transmise', 'Annuaire du transport sanitaire')}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Bonjour ${escapeHtml(p.demandeurNom) || ''},</p>
        <div style="background:#eff6ff;border-left:4px solid #2563eb;border-radius:0 8px 8px 0;padding:14px 18px;margin:20px 0">
          <p style="margin:0;color:#1d4ed8;font-size:14px">${corps}</p>
        </div>
        ${suiviBloc}
        <p style="font-size:14px;color:#374151">
          Gardez votre téléphone à portée de main. Si vous n'êtes pas rappelé rapidement, vous pouvez aussi
          contacter d'autres transporteurs directement depuis l'annuaire RoullePro.
        </p>
        <div style="text-align:center;margin:24px 0">
          <a href="${APP_URL_DV}/transport-medical" style="background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">Voir l'annuaire transport médical</a>
        </div>
        ${emailFooter('Annuaire du transport sanitaire')}
      </div>
    </div>
  `;
  await sendEmail({
    to: p.to,
    subject: `[RoullePro] Votre demande de transport ${p.typeLibelle} est transmise`,
    html,
  });
}

/* ── 3. Email de secours interne (aucun pro joignable) ── */
export async function sendDemandeTransportFallback(p: {
  to: string;
  typeLibelle: string;
  demandeurNom: string;
  telephone: string;
  email?: string | null;
  departement?: string | null;
  ville?: string | null;
  lieuDepart?: string | null;
  lieuArrivee?: string | null;
  dateSouhaitee?: string | null;
  precisions?: string | null;
  demandeId: string;
}) {
  const dateStr = formatDateSouhaitee(p.dateSouhaitee);
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader(`Demande sans pro joignable (${p.typeLibelle})`, 'Annuaire du transport sanitaire')}
      <div style="padding: 28px 32px;">
        <div style="background:#fff7ed;border:1px solid #fdba74;border-radius:8px;padding:14px 18px;margin-bottom:20px">
          <p style="margin:0;color:#9a3412;font-weight:600;font-size:14px">Aucun professionnel avec email n'a pu être notifié automatiquement. À traiter manuellement.</p>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0">
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            ${ligneInfo('Type', escapeHtml(p.typeLibelle))}
            ${ligneInfo('Demandeur', escapeHtml(p.demandeurNom))}
            ${ligneInfo('Téléphone', escapeHtml(p.telephone))}
            ${p.email ? ligneInfo('Email', escapeHtml(p.email)) : ''}
            ${ligneInfo('Département', escapeHtml(p.departement))}
            ${ligneInfo('Ville', escapeHtml(p.ville))}
            ${ligneInfo('Départ', escapeHtml(p.lieuDepart))}
            ${ligneInfo('Arrivée', escapeHtml(p.lieuArrivee))}
            ${ligneInfo('Date souhaitée', escapeHtml(dateStr))}
            ${ligneInfo('ID demande', escapeHtml(p.demandeId))}
          </table>
        </div>
        ${p.precisions ? `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0"><p style="margin:0 0 4px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase">Précisions</p><p style="margin:0;font-size:14px;color:#374151">${escapeHtml(p.precisions).replace(/\n/g, '<br>')}</p></div>` : ''}
        ${emailFooter('Annuaire du transport sanitaire')}
      </div>
    </div>
  `;
  await sendEmail({
    to: p.to,
    subject: `[RoullePro Interne] Demande transport ${p.typeLibelle} à traiter — ${p.ville || p.departement || ''}`,
    html,
  });
}

/* ── 4. Acceptation : email au pro qui a pris la course (coords client) ── */
export async function sendDemandeTransportAcceptationPro(p: {
  to: string;
  proNom: string;
  clientNom?: string | null;
  clientTelephone?: string | null;
  clientEmail?: string | null;
  typeLibelle: string;
  lieuDepart?: string | null;
  lieuArrivee?: string | null;
  dateSouhaitee?: string | null;
  allerRetour?: boolean;
  mobilite?: string | null;
  precisions?: string | null;
  tauxPriseEnCharge?: string | null;
  tauxPriseEnChargeAutre?: string | null;
  bonTransportMedical?: boolean;
  demandeId: string;
}) {
  const dateStr = formatDateSouhaitee(p.dateSouhaitee);
  const tel = telHref(p.clientTelephone);
  const tauxStr = tauxLibelle(p.tauxPriseEnCharge, p.tauxPriseEnChargeAutre);
  const bonStr = p.bonTransportMedical
    ? 'Oui'
    : 'Manquant (le patient devra en fournir un)';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader('Course acceptée — coordonnées du client', 'Annuaire du transport sanitaire')}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Bonjour <strong>${escapeHtml(p.proNom)}</strong>,</p>
        <p style="font-size: 15px; color: #374151;">
          Tu viens d'accepter cette course de transport <strong>${escapeHtml(p.typeLibelle)}</strong>.
          Elle t'est désormais attribuée. Voici les coordonnées du client pour le contacter et organiser le trajet.
        </p>
        <div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:12px;padding:20px;margin:20px 0">
          <p style="margin:0 0 10px;font-size:12px;color:#065f46;text-transform:uppercase;font-weight:600;letter-spacing:0.05em">Client</p>
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            ${ligneInfo('Nom', escapeHtml(p.clientNom))}
            ${p.clientTelephone ? `<tr style="border-bottom:1px solid #d1fae5"><td style="padding:8px 0;color:#6b7280;width:140px">Téléphone</td><td style="padding:8px 0;font-weight:600">${tel ? `<a href="${tel}" style="color:#047857">${escapeHtml(p.clientTelephone)}</a>` : escapeHtml(p.clientTelephone)}</td></tr>` : ''}
            ${p.clientEmail ? `<tr><td style="padding:8px 0;color:#6b7280;width:140px">Email</td><td style="padding:8px 0;font-weight:600"><a href="mailto:${escapeHtml(p.clientEmail)}" style="color:#047857">${escapeHtml(p.clientEmail)}</a></td></tr>` : ''}
          </table>
        </div>
        ${tel ? `<div style="text-align:center;margin:24px 0">${emailButton(tel, 'Appeler le client', '#10b981')}</div>` : ''}
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0">
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            ${ligneInfo('Type', escapeHtml(p.typeLibelle))}
            ${ligneInfo('Départ', escapeHtml(p.lieuDepart))}
            ${ligneInfo('Arrivée', escapeHtml(p.lieuArrivee))}
            ${ligneInfo('Date souhaitée', escapeHtml(dateStr))}
            ${p.allerRetour ? ligneInfo('Trajet', 'Aller-retour') : ''}
            ${ligneInfo('Mobilité', escapeHtml(p.mobilite))}
            ${tauxStr ? ligneInfo('Taux de prise en charge', tauxStr) : ''}
            ${ligneInfo('Bon de transport', bonStr)}
          </table>
        </div>
        ${p.precisions ? `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0"><p style="margin:0 0 4px;font-size:12px;color:#a16207;font-weight:600;text-transform:uppercase">Précisions</p><p style="margin:0;font-size:14px;color:#374151">${escapeHtml(p.precisions).replace(/\n/g, '<br>')}</p></div>` : ''}
        <p style="font-size:14px;color:#374151">
          Une fois le transport effectué, pense à marquer la course comme terminée depuis ton tableau de bord.
        </p>
        <div style="text-align:center;margin:24px 0">${emailButton(DASHBOARD_PRO_URL, 'Ouvrir mon tableau de bord')}</div>
        ${signatureBloc()}
        ${emailFooter('Annuaire du transport sanitaire')}
      </div>
    </div>
  `;
  await sendEmail({
    to: p.to,
    subject: 'Course acceptée — coordonnées client',
    html,
    replyTo: 'contact@roullepro.com',
    tags: [
      { name: 'category', value: 'demande_transport_acceptation_pro' },
    ],
  });
}

/* ── 5. Acceptation : email au client (nom + tel du pro accepteur) ── */
export async function sendDemandeTransportAcceptationClient(p: {
  to: string;
  clientNom?: string | null;
  proNom: string;
  proTelephone?: string | null;
  typeLibelle: string;
  lieuDepart?: string | null;
  lieuArrivee?: string | null;
  dateSouhaitee?: string | null;
  allerRetour?: boolean;
  tauxPriseEnCharge?: string | null;
  tauxPriseEnChargeAutre?: string | null;
  bonTransportMedical?: boolean;
}) {
  const dateStr = formatDateSouhaitee(p.dateSouhaitee);
  const tel = telHref(p.proTelephone);
  const tauxStr = tauxLibelle(p.tauxPriseEnCharge, p.tauxPriseEnChargeAutre);
  const bonStr = p.bonTransportMedical
    ? 'Oui'
    : 'Manquant (à fournir au professionnel)';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader('Un professionnel a accepté ta course', 'Annuaire du transport sanitaire')}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Bonjour ${escapeHtml(p.clientNom) || ''},</p>
        <p style="font-size: 15px; color: #374151;">
          Bonne nouvelle : un professionnel a accepté ta demande de transport <strong>${escapeHtml(p.typeLibelle)}</strong>.
          Il va te contacter, mais tu peux aussi l'appeler directement.
        </p>
        <div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:12px;padding:20px;margin:20px 0">
          <p style="margin:0 0 6px;font-size:12px;color:#065f46;text-transform:uppercase;font-weight:600;letter-spacing:0.05em">Ton transporteur</p>
          <p style="margin:0;font-weight:700;font-size:16px;color:#065f46">${escapeHtml(p.proNom)}</p>
          ${p.proTelephone ? `<p style="margin:6px 0 0;font-size:15px">${tel ? `<a href="${tel}" style="color:#047857;font-weight:600">${escapeHtml(p.proTelephone)}</a>` : escapeHtml(p.proTelephone)}</p>` : ''}
        </div>
        ${tel ? `<div style="text-align:center;margin:24px 0">${emailButton(tel, 'Appeler le professionnel', '#10b981')}</div>` : ''}
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0">
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            ${ligneInfo('Type', escapeHtml(p.typeLibelle))}
            ${ligneInfo('Départ', escapeHtml(p.lieuDepart))}
            ${ligneInfo('Arrivée', escapeHtml(p.lieuArrivee))}
            ${ligneInfo('Date souhaitée', escapeHtml(dateStr))}
            ${p.allerRetour ? ligneInfo('Trajet', 'Aller-retour') : ''}
            ${tauxStr ? ligneInfo('Taux de prise en charge', tauxStr) : ''}
            ${ligneInfo('Bon de transport', bonStr)}
          </table>
        </div>
        <p style="font-size:14px;color:#374151">
          Le professionnel te recontactera pour confirmer les détails du trajet. Garde ton téléphone à portée de main.
        </p>
        ${signatureBloc()}
        ${emailFooter('Annuaire du transport sanitaire')}
      </div>
    </div>
  `;
  await sendEmail({
    to: p.to,
    subject: 'Ta course a été acceptée par un professionnel',
    html,
    replyTo: 'contact@roullepro.com',
    tags: [
      { name: 'category', value: 'demande_transport_acceptation_client' },
    ],
  });
}

/* ── 6. Acceptation : info aux autres pros (course prise par un autre) ── */
export async function sendDemandeTransportAutreAcceptee(p: {
  to: string;
  proNom: string;
  typeLibelle: string;
  lieuDepart?: string | null;
  lieuArrivee?: string | null;
  dateSouhaitee?: string | null;
}) {
  const dateStr = formatDateSouhaitee(p.dateSouhaitee);
  const trajet = [p.lieuDepart, p.lieuArrivee].filter(Boolean).join(' → ');
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader('Course attribuée à un autre professionnel', 'Annuaire du transport sanitaire')}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Bonjour <strong>${escapeHtml(p.proNom)}</strong>,</p>
        <p style="font-size: 15px; color: #374151;">
          La course de transport <strong>${escapeHtml(p.typeLibelle)}</strong>${trajet ? ` (${escapeHtml(trajet)})` : ''}${dateStr ? ` du ${escapeHtml(dateStr)}` : ''}
          vient d'être acceptée par un autre professionnel. Tu n'as donc rien à faire de ton côté.
        </p>
        <p style="font-size: 14px; color: #374151;">
          Merci pour ta réactivité. D'autres demandes te seront proposées dès qu'une course correspondra à ton secteur.
        </p>
        <div style="text-align:center;margin:24px 0">${emailButton(DASHBOARD_PRO_URL, 'Voir mes demandes')}</div>
        ${signatureBloc()}
        ${emailFooter('Annuaire du transport sanitaire')}
      </div>
    </div>
  `;
  await sendEmail({
    to: p.to,
    subject: 'Course attribuée à un autre professionnel',
    html,
    replyTo: 'contact@roullepro.com',
    tags: [
      { name: 'category', value: 'demande_transport_autre_acceptee' },
    ],
  });
}

/* ── 7. Annulation par le patient : info au pro qui avait accepté ── */
export async function sendDemandeTransportAnnuleePro(p: {
  to: string;
  proNom: string;
  typeLibelle: string;
  lieuDepart?: string | null;
  lieuArrivee?: string | null;
  dateSouhaitee?: string | null;
}) {
  const dateStr = formatDateSouhaitee(p.dateSouhaitee);
  const trajet = [p.lieuDepart, p.lieuArrivee].filter(Boolean).join(' → ');
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader('Course annulée par le patient', 'Annuaire du transport sanitaire')}
      <div style="padding: 28px 32px;">
        <p style="font-size: 15px;">Bonjour <strong>${escapeHtml(p.proNom)}</strong>,</p>
        <p style="font-size: 15px; color: #374151;">
          Le patient a annulé la course de transport <strong>${escapeHtml(p.typeLibelle)}</strong>${trajet ? ` (${escapeHtml(trajet)})` : ''}${dateStr ? ` prévue le ${escapeHtml(dateStr)}` : ''}
          que tu avais acceptée. Tu n'as donc plus à assurer ce trajet.
        </p>
        <p style="font-size: 14px; color: #374151;">
          Toutes nos excuses pour le désagrément. D'autres demandes te seront proposées dès qu'une course correspondra à ton secteur.
        </p>
        <div style="text-align:center;margin:24px 0">${emailButton(DASHBOARD_PRO_URL, 'Voir mes demandes')}</div>
        ${signatureBloc()}
        ${emailFooter('Annuaire du transport sanitaire')}
      </div>
    </div>
  `;
  await sendEmail({
    to: p.to,
    subject: 'Course annulée par le patient',
    html,
    replyTo: 'contact@roullepro.com',
    tags: [
      { name: 'category', value: 'demande_transport_annulee_pro' },
    ],
  });
}

/* ═══════════════════════════════════════════════════════════
   NOTIFICATIONS ADMIN — demandes de transport (module admin PR #29)
═══════════════════════════════════════════════════════════ */

/** Destinataire des notifications admin transport. */
function adminNotificationEmail(): string {
  return process.env.ADMIN_NOTIFICATION_EMAIL || 'contact@roullepro.com';
}

const LIBELLE_TYPE_ADMIN: Record<string, string> = {
  taxi: 'Taxi conventionné',
  vsl: 'VSL',
  ambulance: 'Ambulance',
};

/* ── Admin : nouvelle demande de transport reçue ── */
export async function sendAdminNouvelleDemande(demande: {
  id: string;
  nom?: string | null;
  telephone?: string | null;
  email?: string | null;
  type_transport?: string | null;
  date_souhaitee?: string | null;
  lieu_depart?: string | null;
  lieu_arrivee?: string | null;
  departement_cible?: string | null;
  ville_cible?: string | null;
  precisions?: string | null;
  taux_prise_en_charge?: string | null;
  taux_prise_en_charge_autre?: string | null;
  source_form?: string | null;
  distance_km?: number | null;
  prix_estime?: number | null;
  pros_notifies?: number;
}): Promise<{ id: string | null } | null> {
  const type = demande.type_transport || '';
  const typeLib = LIBELLE_TYPE_ADMIN[type] || type || 'Transport';
  const dpt = demande.departement_cible || '—';
  const dateStr = formatDateSouhaitee(demande.date_souhaitee);
  const estimationStr = formatEstimationCourse(demande.distance_km, demande.prix_estime);
  const tel = telHref(demande.telephone);
  const tauxStr = tauxLibelle(demande.taux_prise_en_charge, demande.taux_prise_en_charge_autre);
  const adminUrl = `${APP_URL}/admin/transport-medical/demandes/${demande.id}`;
  const nbPros = demande.pros_notifies ?? 0;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      ${emailHeader(`Nouvelle demande de transport (${escapeHtml(typeLib)})`, 'Annuaire du transport sanitaire')}
      <div style="padding: 28px 32px;">
        ${nbPros === 0 ? `<div style="background:#fff7ed;border:1px solid #fdba74;border-radius:8px;padding:14px 18px;margin-bottom:20px"><p style="margin:0;color:#9a3412;font-weight:600;font-size:14px">Aucun professionnel notifié automatiquement. À traiter manuellement.</p></div>` : ''}
        <p style="font-size:15px;color:#374151">Une nouvelle demande de transport vient d'être déposée sur RoullePro.</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0">
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            ${ligneInfo('Nom', escapeHtml(demande.nom))}
            ${demande.telephone ? `<tr style="border-bottom:1px solid #e5e7eb"><td style="padding:8px 0;color:#6b7280;width:140px">Téléphone</td><td style="padding:8px 0;font-weight:600">${tel ? `<a href="${tel}" style="color:#2563eb">${escapeHtml(demande.telephone)}</a>` : escapeHtml(demande.telephone)}</td></tr>` : ''}
            ${demande.email ? `<tr style="border-bottom:1px solid #e5e7eb"><td style="padding:8px 0;color:#6b7280;width:140px">Email</td><td style="padding:8px 0;font-weight:600"><a href="mailto:${escapeHtml(demande.email)}" style="color:#2563eb">${escapeHtml(demande.email)}</a></td></tr>` : ''}
            ${ligneInfo('Type', escapeHtml(typeLib))}
            ${ligneInfo('Date souhaitée', escapeHtml(dateStr))}
            ${ligneInfo('Départ', escapeHtml(demande.lieu_depart))}
            ${ligneInfo('Arrivée', escapeHtml(demande.lieu_arrivee))}
            ${ligneInfo('Département', escapeHtml(dpt))}
            ${ligneInfo('Ville', escapeHtml(demande.ville_cible))}
            ${estimationStr ? ligneInfo('Estimation', estimationStr) : ''}
            ${tauxStr ? ligneInfo('Taux de prise en charge', tauxStr) : ''}
            ${ligneInfo('Source formulaire', escapeHtml(demande.source_form))}
            ${ligneInfo('Pros notifiés', String(nbPros))}
          </table>
        </div>
        ${estimationStr ? `<p style="margin:-8px 0 16px;font-size:12px;color:#64748b">${mentionEstimation(demande.type_transport)}</p>` : ''}
        ${demande.precisions ? `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0"><p style="margin:0 0 4px;font-size:12px;color:#a16207;font-weight:600;text-transform:uppercase">Précisions</p><p style="margin:0;font-size:14px;color:#374151">${escapeHtml(demande.precisions).replace(/\n/g, '<br>')}</p></div>` : ''}
        <div style="text-align:center;margin:24px 0">${emailButton(adminUrl, 'Voir dans l\'admin')}</div>
        ${emailFooter('Annuaire du transport sanitaire')}
      </div>
    </div>
  `;

  return sendEmail({
    to: adminNotificationEmail(),
    subject: `[RoullePro] Nouvelle demande ${type || 'transport'} dpt ${dpt} — ${demande.nom || ''}`.trim(),
    html,
    tags: [{ name: 'category', value: 'admin_nouvelle_demande_transport' }],
  });
}

/* ── Admin : récap quotidien des demandes de transport ── */
export async function sendAdminRecapQuotidien(stats: {
  date: string;
  total: number;
  par_statut: { envoyee: number; acceptee: number; terminee: number; annulee: number };
  par_type: { taxi: number; vsl: number; ambulance: number };
  top_departements: Array<{ dpt: string; count: number }>;
  demandes_du_jour: Array<{
    id: string;
    nom: string | null;
    type: string | null;
    dpt: string | null;
    statut: string | null;
    created_at: string | null;
  }>;
}): Promise<{ id: string | null } | null> {
  const dateFR = (() => {
    const d = new Date(stats.date);
    if (Number.isNaN(d.getTime())) return stats.date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(d);
  })();
  const adminUrl = `${APP_URL}/admin/transport-medical/demandes`;

  const carte = (label: string, valeur: number, color: string) => `
    <td style="padding:6px">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center">
        <div style="font-size:24px;font-weight:800;color:${color}">${valeur}</div>
        <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;margin-top:4px">${label}</div>
      </div>
    </td>`;

  const lignesDemandes = stats.demandes_du_jour
    .map((d) => {
      const heure = d.created_at
        ? new Date(d.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : '';
      const typeLib = d.type ? LIBELLE_TYPE_ADMIN[d.type] || d.type : '—';
      return `<tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:8px 6px;color:#6b7280;font-size:12px">${escapeHtml(heure)}</td>
        <td style="padding:8px 6px;font-size:13px">${escapeHtml(d.nom) || '—'}</td>
        <td style="padding:8px 6px;font-size:13px">${escapeHtml(typeLib)}</td>
        <td style="padding:8px 6px;font-size:13px">${escapeHtml(d.dpt) || '—'}</td>
        <td style="padding:8px 6px;font-size:12px;color:#6b7280">${escapeHtml(d.statut) || '—'}</td>
      </tr>`;
    })
    .join('');

  const topDpt = stats.top_departements.length
    ? stats.top_departements
        .map(
          (t) =>
            `<span style="display:inline-block;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:600;padding:4px 10px;border-radius:20px;margin:2px">${escapeHtml(t.dpt)} · ${t.count}</span>`
        )
        .join('')
    : '<span style="color:#9ca3af;font-size:13px">Aucun</span>';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937;">
      ${emailHeader(`Récap demandes transport — ${dateFR}`, 'Annuaire du transport sanitaire')}
      <div style="padding: 28px 32px;">
        <p style="font-size:15px;color:#374151"><strong>${stats.total}</strong> demande${stats.total > 1 ? 's' : ''} sur les dernières 24 heures.</p>

        <h3 style="font-size:14px;color:#111827;margin:24px 0 8px">Par statut</h3>
        <table style="width:100%;border-collapse:collapse"><tr>
          ${carte('Envoyées', stats.par_statut.envoyee, '#2563eb')}
          ${carte('Acceptées', stats.par_statut.acceptee, '#16a34a')}
          ${carte('Terminées', stats.par_statut.terminee, '#6b7280')}
          ${carte('Annulées', stats.par_statut.annulee, '#dc2626')}
        </tr></table>

        <h3 style="font-size:14px;color:#111827;margin:24px 0 8px">Par catégorie</h3>
        <table style="width:100%;border-collapse:collapse"><tr>
          ${carte('Taxi', stats.par_type.taxi, '#2563eb')}
          ${carte('VSL', stats.par_type.vsl, '#2563eb')}
          ${carte('Ambulance', stats.par_type.ambulance, '#2563eb')}
        </tr></table>

        <h3 style="font-size:14px;color:#111827;margin:24px 0 8px">Top départements</h3>
        <div>${topDpt}</div>

        <h3 style="font-size:14px;color:#111827;margin:24px 0 8px">Demandes du jour</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr style="border-bottom:2px solid #e5e7eb">
            <td style="padding:8px 6px;color:#6b7280;font-size:11px;text-transform:uppercase">Heure</td>
            <td style="padding:8px 6px;color:#6b7280;font-size:11px;text-transform:uppercase">Patient</td>
            <td style="padding:8px 6px;color:#6b7280;font-size:11px;text-transform:uppercase">Type</td>
            <td style="padding:8px 6px;color:#6b7280;font-size:11px;text-transform:uppercase">Dpt</td>
            <td style="padding:8px 6px;color:#6b7280;font-size:11px;text-transform:uppercase">Statut</td>
          </tr>
          ${lignesDemandes}
        </table>

        <div style="text-align:center;margin:28px 0">${emailButton(adminUrl, 'Ouvrir le module admin')}</div>
        ${emailFooter('Annuaire du transport sanitaire')}
      </div>
    </div>
  `;

  return sendEmail({
    to: adminNotificationEmail(),
    subject: `[RoullePro] Récap demandes transport — ${dateFR}`,
    html,
    tags: [{ name: 'category', value: 'admin_recap_quotidien_transport' }],
  });
}
