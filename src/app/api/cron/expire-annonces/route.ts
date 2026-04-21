export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendAnnonceExpiration } from "@/lib/email";
import { notifyUser } from "@/lib/notify";

/**
 * Cron job appelé par pg_cron Supabase (ou manuellement) pour :
 * 1. Identifier les annonces actives > 90j
 * 2. Les passer en "expired"
 * 3. Envoyer un email au vendeur avec options de relance
 * 4. Envoyer une notif push si activée
 *
 * Sécurité : header x-cron-secret obligatoire
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // 1. Récupérer les annonces à expirer (avec infos vendeur)
  const { data: toExpire, error: selectError } = await admin
    .from("annonces")
    .select("id, title, marque, modele, user_id, created_at, expires_at, profiles!inner(email, full_name)")
    .eq("status", "active")
    .or(`expires_at.lt.${new Date().toISOString()},and(expires_at.is.null,created_at.lt.${new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString()})`);

  if (selectError) {
    console.error("[cron/expire] select error:", selectError.message);
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  if (!toExpire || toExpire.length === 0) {
    return NextResponse.json({ expired: 0, notified: 0 });
  }

  const ids = toExpire.map((a) => a.id);

  // 2. Passer en "expired"
  const { error: updateError } = await admin
    .from("annonces")
    .update({ status: "expired", updated_at: new Date().toISOString() })
    .in("id", ids);

  if (updateError) {
    console.error("[cron/expire] update error:", updateError.message);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 3. Notifier chaque vendeur (email + push)
  let notified = 0;
  for (const annonce of toExpire) {
    const profile: any = Array.isArray(annonce.profiles) ? annonce.profiles[0] : annonce.profiles;
    const email = profile?.email;
    if (email) {
      try {
        await sendAnnonceExpiration(email, annonce);
        notified += 1;
      } catch (e: any) {
        console.error("[cron/expire] email error:", e?.message);
      }
    }
    if (annonce.user_id) {
      try {
        await notifyUser(annonce.user_id, {
          title: "Votre annonce a expiré",
          body: `${annonce.title || "Votre véhicule"} — relancez gratuitement en 1 clic`,
          url: `/dashboard/annonces/${annonce.id}/edit`,
          tag: `expire-${annonce.id}`,
        });
      } catch (e: any) {
        console.error("[cron/expire] push error:", e?.message);
      }
    }
  }

  return NextResponse.json({ expired: ids.length, notified });
}

// Permettre GET manuel pour test
export async function GET(request: Request) {
  return POST(request);
}
