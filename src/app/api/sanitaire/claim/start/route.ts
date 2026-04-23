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

function normalizeDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() || "";
}

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { ok } = checkRateLimit(`claim-start:${ip}`, 3, 60_000);
    if (!ok) return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });

    const { pro_id, method, contact } = await req.json();
    if (!pro_id || !method || !contact) {
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

    // Validation du contact
    if (method === "email_domaine") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
        return NextResponse.json({ error: "Email invalide" }, { status: 400 });
      }
      const freeDomains = ["gmail.com", "yahoo.fr", "yahoo.com", "hotmail.com", "hotmail.fr", "outlook.com", "outlook.fr", "wanadoo.fr", "orange.fr", "free.fr", "laposte.net", "sfr.fr"];
      const domain = normalizeDomain(contact);
      if (freeDomains.includes(domain)) {
        return NextResponse.json(
          { error: "Merci d'utiliser un email du domaine de votre entreprise (pas gmail/yahoo/orange). Sinon choisissez la vérification par SMS." },
          { status: 400 }
        );
      }
    }

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
        contact: contact.trim(),
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
      await sendEmail({
        to: contact.trim(),
        subject: `[RoullePro] Votre code de vérification — ${code}`,
        html: `<h2>Vérification de votre fiche</h2>
<p>Voici votre code de vérification pour réclamer la fiche de <strong>${pro.nom_commercial || pro.raison_sociale}</strong> sur RoullePro Transport Médical :</p>
<div style="font-size:32px;font-weight:bold;letter-spacing:8px;background:#f0f6ff;padding:20px;text-align:center;border-radius:12px;color:#0066CC;margin:20px 0">${code}</div>
<p>Ce code expire dans 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
      }).catch(() => undefined);
    } else {
      // SMS : pas de provider encore, on logge et on crée le claim quand même
      // TODO : brancher Twilio/OVHcloud SMS quand user fournit les credentials
      console.log(`[SMS FALLBACK] code ${code} pour ${contact} claim ${claim.id}`);
    }

    return NextResponse.json({ claim_id: claim.id, ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
