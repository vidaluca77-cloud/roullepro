export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { isPaidPlan } from "@/lib/sanitaire-plans";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 1. Authentification du pro
    const supabaseUser = await createServerClient();
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    // 2. Validation du contenu
    const { content } = await req.json();
    if (!content?.trim() || content.trim().length < 5) {
      return NextResponse.json({ error: "Réponse trop courte (5 caractères minimum)" }, { status: 400 });
    }

    const supabase = getAdminClient();

    // 3. Récupération du message + de la fiche pro associée, vérification ownership
    const { data: message, error: msgErr } = await supabase
      .from("sanitaire_messages")
      .select("id, pro_id, sender_name, sender_email, content, created_at")
      .eq("id", id)
      .maybeSingle();

    if (msgErr || !message) {
      return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
    }

    const { data: pro } = await supabase
      .from("pros_sanitaire")
      .select("id, raison_sociale, nom_commercial, plan, claimed_by")
      .eq("id", message.pro_id)
      .maybeSingle();

    if (!pro || pro.claimed_by !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // 4. La messagerie (et donc la réponse) est réservée aux plans payants
    if (!isPaidPlan(pro.plan)) {
      return NextResponse.json(
        { error: "La réponse aux messages est réservée au plan Pro." },
        { status: 403 }
      );
    }

    // 5. Insertion de la réponse
    const { data: reply, error: replyError } = await supabase
      .from("sanitaire_replies")
      .insert({ message_id: id, content: content.trim() })
      .select()
      .single();

    if (replyError) {
      return NextResponse.json({ error: replyError.message }, { status: 500 });
    }

    // 6. Marquage du message comme répondu (et lu)
    await supabase
      .from("sanitaire_messages")
      .update({ replied: true, read_by_pro: true })
      .eq("id", id);

    // 7. Notification email au patient (fire-and-forget)
    const proName = pro.nom_commercial || pro.raison_sociale || "Le professionnel";
    if (message.sender_email) {
      await sendEmail({
        to: message.sender_email,
        subject: `Réponse à votre demande de transport — ${proName}`,
        html: `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1f2937">
<div style="background:#0066CC;border-radius:12px 12px 0 0;padding:20px 24px">
  <h2 style="color:#fff;margin:0;font-size:18px">RoullePro · Transport sanitaire</h2>
</div>
<div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px">
  <p style="margin-top:0">Bonjour ${message.sender_name || ""},</p>
  <p><strong>${proName}</strong> a répondu à votre demande de transport.</p>
  <div style="border-left:4px solid #0066CC;background:#f0f6ff;padding:14px 18px;border-radius:0 8px 8px 0;margin:20px 0;white-space:pre-line;color:#374151">${content.trim().replace(/\n/g, "<br>")}</div>
  <p style="color:#6b7280;font-size:13px;margin-top:24px">Vous pouvez répondre directement à cet email pour poursuivre l'échange.</p>
  <p style="color:#9ca3af;font-size:11px;margin-top:16px;border-top:1px solid #f3f4f6;padding-top:16px">Message envoyé via <a href="${APP_URL}/transport-medical" style="color:#0066CC">RoullePro</a>.</p>
</div>
</div>`,
      }).catch(() => undefined);
    }

    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
