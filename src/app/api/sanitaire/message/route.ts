export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { ok } = checkRateLimit(`sanitaire-msg:${ip}`, 5, 60_000);
    if (!ok) return NextResponse.json({ error: "Trop de requêtes, réessayez dans un instant." }, { status: 429 });

    const { pro_id, sender_name, sender_email, sender_phone, content } = await req.json();

    if (!pro_id || !sender_name?.trim() || !sender_email?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Tous les champs requis" }, { status: 400 });
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(sender_email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }
    if (content.trim().length < 20) {
      return NextResponse.json({ error: "Message trop court (20 caractères minimum)" }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { data: pro, error: proErr } = await supabase
      .from("pros_sanitaire")
      .select("id, raison_sociale, nom_commercial, email_public, plan, claimed_by, ville")
      .eq("id", pro_id)
      .maybeSingle();

    if (proErr || !pro) return NextResponse.json({ error: "Pro introuvable" }, { status: 404 });

    const isPremium = pro.plan === "premium" || pro.plan === "pro_plus";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

    // On enregistre TOUJOURS le message (même si pro gratuit), pour compter les tentatives
    // et servir de levier commercial dans le dashboard pro
    const { error: insertErr } = await supabase.from("sanitaire_messages").insert({
      pro_id,
      sender_name: sender_name.trim(),
      sender_email: sender_email.trim().toLowerCase(),
      sender_phone: sender_phone?.trim() || null,
      content: content.trim(),
      ip_hash: ipHash,
    });

    if (insertErr) {
      return NextResponse.json({ error: "Erreur technique" }, { status: 500 });
    }

    const dashboardUrl = "https://roullepro.com/transport-medical/pro/dashboard";
    const messagesUrl = "https://roullepro.com/transport-medical/pro/messages";
    const tarifsUrl = "https://roullepro.com/transport-medical/tarifs";

    // Notification email au pro
    if (pro.email_public) {
      if (isPremium) {
        // Pro Premium : email complet avec contenu
        await sendEmail({
          to: pro.email_public,
          subject: `Nouvelle demande de transport — ${sender_name}`,
          html: `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px">
<h2 style="color:#0066CC">Nouvelle demande reçue</h2>
<p><strong>${sender_name}</strong> vous a contacté via votre fiche RoullePro Transport Sanitaire.</p>
<div style="background:#f0f6ff;border-radius:12px;padding:16px;margin:20px 0">
<p style="margin:4px 0"><strong>Email :</strong> <a href="mailto:${sender_email}">${sender_email}</a></p>
${sender_phone ? `<p style="margin:4px 0"><strong>Téléphone :</strong> <a href="tel:${sender_phone}">${sender_phone}</a></p>` : ""}
</div>
<div style="border-left:4px solid #0066CC;padding:12px 16px;background:#f9fafb;color:#374151">${content.replace(/\n/g, "<br>")}</div>
<div style="text-align:center;margin:32px 0"><a href="${messagesUrl}" style="background:#0066CC;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600">Répondre dans mon espace</a></div>
<p style="color:#6b7280;font-size:12px;margin-top:24px">Vous recevez cet email car votre fiche Premium est active sur l'annuaire RoullePro.</p>
</div>`,
        }).catch(() => undefined);
      } else {
        // Pro gratuit/Essential : teaser (pas de contenu)
        await sendEmail({
          to: pro.email_public,
          subject: `Un patient essaie de vous joindre sur RoullePro`,
          html: `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px">
<h2 style="color:#0066CC">Un patient cherche à vous contacter</h2>
<p>Un patient vient de remplir un formulaire de demande sur votre fiche <strong>${pro.nom_commercial || pro.raison_sociale}</strong>.</p>
<div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:12px;padding:20px;margin:20px 0">
<div style="font-weight:600;color:#92400e;margin-bottom:8px">⚠️ Message verrouillé</div>
<p style="color:#78350f;margin:0;font-size:14px">Pour lire les messages patients et y répondre, activez l'abonnement <strong>Premium à 39€/mois</strong> (14 jours offerts).</p>
</div>
<div style="text-align:center;margin:32px 0"><a href="${tarifsUrl}" style="background:#0066CC;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600">Débloquer la messagerie</a></div>
<p style="color:#6b7280;font-size:12px">En Premium : messagerie illimitée, badge « Recommandé », mise en avant dans les résultats, statistiques.</p>
<p style="color:#9ca3af;font-size:11px;margin-top:24px">Si vous ne souhaitez plus recevoir ces notifications, <a href="${dashboardUrl}" style="color:#6b7280">gérez vos préférences</a>.</p>
</div>`,
        }).catch(() => undefined);
      }
    }

    // Réponse côté patient
    if (!isPremium) {
      return NextResponse.json({
        ok: true,
        warning: "Ce professionnel ne lit pas encore les messages en ligne. Contactez-le directement par téléphone pour une réponse immédiate.",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
