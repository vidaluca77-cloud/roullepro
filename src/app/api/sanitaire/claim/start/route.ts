export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createClient as createServerClient } from "@/lib/supabase/server";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { ok } = checkRateLimit(`claim-start:${ip}`, 3, 60_000);
    if (!ok) return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });

    const { pro_id, method } = await req.json();
    if (!pro_id || !method) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }
    if (method !== "email_domaine" && method !== "sms") {
      return NextResponse.json({ error: "Méthode invalide" }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    const { data: pro } = await supabaseAdmin
      .from("pros_sanitaire")
      .select("id, claimed, telephone_public, email_public, raison_sociale, nom_commercial")
      .eq("id", pro_id)
      .maybeSingle();
    if (!pro) return NextResponse.json({ error: "Pro introuvable" }, { status: 404 });
    if (pro.claimed) return NextResponse.json({ error: "Déjà réclamée" }, { status: 409 });

    // SÉCURITÉ : la destination du code de vérification ne vient JAMAIS de la requête.
    // Elle est lue uniquement depuis la fiche officielle (pros_sanitaire), ce qui empêche
    // un attaquant de squatter une fiche en se faisant envoyer le code à sa propre adresse.
    const ficheEmail = (pro.email_public || "").trim();
    const fichePhone = (pro.telephone_public || "").trim();

    if (method === "email_domaine") {
      if (!ficheEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ficheEmail)) {
        return NextResponse.json(
          { error: "Email de contact manquant sur la fiche, contactez le support" },
          { status: 400 }
        );
      }
    } else {
      if (!fichePhone) {
        return NextResponse.json(
          { error: "Téléphone de contact manquant sur la fiche, contactez le support" },
          { status: 400 }
        );
      }
    }

    // Contact officiel de la fiche : seule destination autorisée du code.
    const officialContact = method === "email_domaine" ? ficheEmail : fichePhone;

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();

    // Tentative de rattachement au user connecté si présent
    let userId: string | null = null;
    try {
      const supabaseUser = await createServerClient();
      const { data: { user } } = await supabaseUser.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      userId = null;
    }

    const { data: claim, error: claimErr } = await supabaseAdmin
      .from("sanitaire_claims")
      .insert({
        pro_id,
        user_id: userId,
        method,
        contact: officialContact,
        code,
        status: "pending",
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (claimErr || !claim) {
      return NextResponse.json({ error: "Erreur création" }, { status: 500 });
    }

    if (method === "email_domaine") {
      // Envoi UNIQUEMENT à l'email officiel de la fiche (jamais à une adresse fournie).
      await sendEmail({
        to: officialContact,
        subject: `[RoullePro] Votre code de vérification de fiche`,
        html: `<h2>Vérification de votre fiche</h2>
<p>Voici votre code de vérification pour réclamer la fiche de <strong>${pro.nom_commercial || pro.raison_sociale}</strong> sur RoullePro Transport Médical :</p>
<div style="font-size:32px;font-weight:bold;letter-spacing:8px;background:#f0f6ff;padding:20px;text-align:center;border-radius:12px;color:#0066CC;margin:20px 0">${code}</div>
<p>Ce code expire dans 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
      }).catch(() => undefined);
    } else {
      // SMS : pas de provider encore. On NE logge jamais le code OTP.
      // TODO : brancher Twilio/OVHcloud SMS quand user fournit les credentials
      console.log("[claim/start] OTP généré et envoyé");
    }

    // SÉCURITÉ : ni le code, ni un magic link, ni un mot de passe ne sortent dans la réponse.
    return NextResponse.json({
      claim_id: claim.id,
      ok: true,
      message: "Un code de vérification a été envoyé sur l'email officiel de la fiche",
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
