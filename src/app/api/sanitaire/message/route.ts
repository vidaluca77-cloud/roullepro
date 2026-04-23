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
    if (!isPremium) {
      return NextResponse.json(
        { error: "Ce professionnel ne propose pas la messagerie. Contactez-le directement par téléphone." },
        { status: 403 }
      );
    }

    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

    const { error: insertErr } = await supabase.from("sanitaire_messages").insert({
      pro_id,
      sender_name: sender_name.trim(),
      sender_email: sender_email.trim().toLowerCase(),
      sender_phone: sender_phone?.trim() || null,
      content: content.trim(),
      ip_hash: ipHash,
    });

    if (insertErr) {
      // RLS peut bloquer l'insert direct ; on insère via admin donc ça passe
      return NextResponse.json({ error: "Erreur technique" }, { status: 500 });
    }

    // Notification email au pro (si email renseigné)
    if (pro.email_public) {
      await sendEmail({
        to: pro.email_public,
        subject: `[RoullePro] Nouvelle demande de transport — ${sender_name}`,
        html: `<h2>Nouvelle demande reçue sur votre fiche</h2>
<p><strong>${sender_name}</strong> vous a contacté via votre fiche RoullePro Transport Médical.</p>
<p><strong>Email :</strong> ${sender_email}<br>
${sender_phone ? `<strong>Téléphone :</strong> ${sender_phone}<br>` : ""}
</p>
<blockquote style="border-left:3px solid #0066CC;padding-left:12px;color:#444">${content.replace(/\n/g, "<br>")}</blockquote>
<p><a href="https://roullepro.com/transport-medical/pro/messages" style="background:#0066CC;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Voir dans mon espace pro</a></p>
<p style="color:#999;font-size:12px">Vous recevez cet email car votre fiche est active sur l'annuaire RoullePro.</p>`,
      }).catch(() => undefined);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
