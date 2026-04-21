/**
 * Service Web Push (VAPID) — envoi de notifications aux abonnés.
 * Clés publiques/privées configurées via variables d'environnement :
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY  (exposée côté client)
 *   VAPID_PRIVATE_KEY
 *   VAPID_SUBJECT = mailto:contact@roullepro.com
 */
import webpush from "web-push";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:contact@roullepro.com";
  if (!pub || !priv) {
    throw new Error("Clés VAPID manquantes (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)");
  }
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export interface PushSubRecord {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendPush(sub: PushSubRecord, payload: PushPayload): Promise<{ ok: boolean; gone: boolean; error?: string }> {
  ensureConfigured();
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload)
    );
    return { ok: true, gone: false };
  } catch (err: any) {
    const statusCode = err?.statusCode;
    const gone = statusCode === 404 || statusCode === 410;
    return { ok: false, gone, error: err?.message || "Erreur envoi push" };
  }
}
