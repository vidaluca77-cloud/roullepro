/**
 * Utilitaires pour envoyer des notifications aux utilisateurs :
 * - Web Push sur toutes leurs subscriptions actives
 * - Nettoie les subscriptions mortes (410/404)
 */
import { createClient } from "@supabase/supabase-js";
import { sendPush, type PushPayload } from "@/lib/push";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function notifyUser(userId: string, payload: PushPayload): Promise<{ sent: number; removed: number }> {
  const admin = getAdmin();
  const { data: subs, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error || !subs || subs.length === 0) return { sent: 0, removed: 0 };

  let sent = 0;
  const deadIds: string[] = [];
  for (const sub of subs) {
    const res = await sendPush(sub, payload);
    if (res.ok) sent += 1;
    else if (res.gone) deadIds.push(sub.id);
  }
  if (deadIds.length > 0) {
    await admin.from("push_subscriptions").delete().in("id", deadIds);
  }
  return { sent, removed: deadIds.length };
}
