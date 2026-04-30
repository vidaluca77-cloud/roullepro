export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

function generateTempPassword(): string {
  // 16 caractères alphanumériques sûrs
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 16; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { ok } = checkRateLimit(`claim-verify:${ip}`, 10, 60_000);
    if (!ok) return NextResponse.json({ error: "Trop de tentatives" }, { status: 429 });

    const { claim_id, code, justificatif_url } = await req.json();
    if (!claim_id || !code) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

    const supabaseAdmin = getAdminClient();
    const { data: claim } = await supabaseAdmin
      .from("sanitaire_claims")
      .select("*")
      .eq("id", claim_id)
      .maybeSingle();

    if (!claim) return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
    if (claim.status !== "pending") return NextResponse.json({ error: "Demande expirée ou déjà traitée" }, { status: 409 });
    if (new Date(claim.expires_at) < new Date()) {
      await supabaseAdmin.from("sanitaire_claims").update({ status: "expired" }).eq("id", claim_id);
      return NextResponse.json({ error: "Code expiré" }, { status: 410 });
    }
    if (claim.attempts >= 5) {
      await supabaseAdmin.from("sanitaire_claims").update({ status: "rejected" }).eq("id", claim_id);
      return NextResponse.json({ error: "Trop de tentatives erronées" }, { status: 429 });
    }
    if (claim.code !== code.trim()) {
      await supabaseAdmin.from("sanitaire_claims").update({ attempts: claim.attempts + 1 }).eq("id", claim_id);
      return NextResponse.json({ error: "Code incorrect" }, { status: 400 });
    }

    // Récupère infos pro
    const { data: pro } = await supabaseAdmin
      .from("pros_sanitaire")
      .select("id, raison_sociale, nom_commercial, ville, categorie")
      .eq("id", claim.pro_id)
      .maybeSingle();
    if (!pro) return NextResponse.json({ error: "Pro introuvable" }, { status: 404 });

    // Détermine l'email à associer au compte
    const accountEmail = claim.method === "email_domaine" ? claim.contact : null;

    // Session utilisateur actuelle (si connecté)
    const supabaseUser = await createServerClient();
    const { data: { user: sessionUser } } = await supabaseUser.auth.getUser();
    let userId: string | null = null;
    let createdAccount = false;
    let tempPassword: string | null = null;

    // REGLE : si un email est fourni (email_domaine), le compte associe est TOUJOURS
    // celui de cet email, meme si un autre user est connecte en session.
    // Cela evite d attribuer la fiche au mauvais compte.
    if (accountEmail) {
      // Cherche un user existant avec cet email via getUserByEmail (plus fiable que listUsers pagine)
      let found: { id: string; email?: string } | null = null;
      try {
        // Pagination complete pour trouver l user existant
        for (let page = 1; page <= 20; page++) {
          const { data: pageUsers } = await supabaseAdmin.auth.admin.listUsers({
            page,
            perPage: 1000,
          });
          const match = pageUsers?.users?.find(
            (u) => u.email?.toLowerCase() === accountEmail.toLowerCase()
          );
          if (match) {
            found = { id: match.id, email: match.email };
            break;
          }
          if (!pageUsers?.users || pageUsers.users.length < 1000) break;
        }
      } catch {}

      if (found) {
        userId = found.id;
        // User existant : on reset le mot de passe pour permettre la connexion
        tempPassword = generateTempPassword();
        try {
          await supabaseAdmin.auth.admin.updateUserById(found.id, {
            password: tempPassword,
          });
        } catch {
          tempPassword = null;
        }
      } else {
        // Crée un nouveau compte avec mot de passe temporaire
        tempPassword = generateTempPassword();
        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: accountEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: pro.nom_commercial || pro.raison_sociale,
            source: "sanitaire_claim",
          },
        });
        if (createErr || !created.user) {
          return NextResponse.json({ error: "Impossible de créer le compte" }, { status: 500 });
        }
        userId = created.user.id;
        createdAccount = true;

        try {
          await supabaseAdmin.from("profiles").upsert({
            id: userId,
            email: accountEmail,
            full_name: pro.nom_commercial || pro.raison_sociale,
          });
        } catch {}
      }
    } else if (sessionUser?.id) {
      // Flux SMS : on utilise la session existante (email non fourni par la reclamation)
      userId = sessionUser.id;
    } else {
      return NextResponse.json(
        { error: "Connectez-vous avant de réclamer via SMS.", requires_auth: true },
        { status: 401 }
      );
    }

    // Lie le pro au user mais en attente de validation admin (verified reste false)
    const updates: Record<string, unknown> = {
      claimed: true,
      claimed_by: userId,
      claimed_at: new Date().toISOString(),
      verified: false,
      claim_status: "en_attente_validation",
      ...(justificatif_url ? { justificatif_url } : {}),
      rejection_reason: null,
    };
    if (claim.method === "email_domaine") {
      updates.email_public = claim.contact;
    }
    const { error: updErr } = await supabaseAdmin
      .from("pros_sanitaire")
      .update(updates)
      .eq("id", claim.pro_id);
    if (updErr) return NextResponse.json({ error: "Erreur association" }, { status: 500 });

    await supabaseAdmin
      .from("sanitaire_claims")
      .update({ status: "verified", verified_at: new Date().toISOString(), user_id: userId })
      .eq("id", claim_id);

    // Génère un magic link de connexion
    let magicLink: string | null = null;
    if (accountEmail) {
      try {
        const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: accountEmail,
          options: {
            redirectTo: `${APP_URL}/transport-medical/pro/dashboard?welcome=1`,
          },
        });
        magicLink = linkData?.properties?.action_link ?? null;
      } catch {
        magicLink = null;
      }
    }

    // Email de bienvenue
    if (accountEmail) {
      const nomAffiche = pro.nom_commercial || pro.raison_sociale;
      const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
  <div style="text-align:center;padding:24px 0;border-bottom:1px solid #e5e7eb">
    <div style="font-size:24px;font-weight:700;color:#0066CC">RoullePro — Transport sanitaire</div>
  </div>
  <h2 style="color:#0066CC;margin-top:32px">Bienvenue ${nomAffiche}</h2>
  <p>Votre réclamation de fiche est bien enregistrée et <strong>en attente de validation</strong> par notre équipe (généralement sous 24h ouvrées). Vous avez dès à présent accès à votre espace pro pour compléter votre fiche.</p>
  <p>Une fois validée, votre fiche affichera le badge <strong>« Pro vérifié »</strong> visible de tous les patients.</p>

  ${tempPassword ? `
  <div style="background:#f0f6ff;border:1px solid #cfe3ff;border-radius:12px;padding:16px;margin:24px 0">
    <div style="font-size:13px;color:#0066CC;font-weight:600;margin-bottom:8px">VOS IDENTIFIANTS DE CONNEXION</div>
    <div style="font-family:monospace;font-size:14px">
      Email : <strong>${accountEmail}</strong><br/>
      Mot de passe temporaire : <strong>${tempPassword}</strong>
    </div>
    <div style="font-size:12px;color:#6b7280;margin-top:10px">
      Changez-le dès votre première connexion dans Mon profil.
    </div>
  </div>
  ` : ""}

  ${magicLink ? `
  <div style="text-align:center;margin:32px 0">
    <a href="${magicLink}" style="display:inline-block;background:#0066CC;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600">
      Accéder à mon espace pro
    </a>
    <div style="font-size:12px;color:#6b7280;margin-top:8px">Ce lien vous connecte automatiquement (valable 1 heure)</div>
  </div>
  ` : `
  <div style="text-align:center;margin:32px 0">
    <a href="${APP_URL}/auth/login" style="display:inline-block;background:#0066CC;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600">
      Me connecter
    </a>
  </div>
  `}

  <h3 style="margin-top:32px">Vos prochaines étapes</h3>
  <ol style="line-height:1.8">
    <li><strong>Complétez votre fiche</strong> — photos, horaires, description (5 minutes)</li>
    <li><strong>Vérifiez vos coordonnées</strong> — téléphone public, email professionnel</li>
    <li><strong>Activez le plan Pro (19,90€/mois)</strong> pour lire les messages patients et bénéficier d'une meilleure visibilité dans votre ville</li>
  </ol>

  <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:12px;padding:16px;margin:24px 0">
    <div style="font-weight:600;color:#92400e;margin-bottom:6px">Important</div>
    <div style="font-size:14px;color:#78350f">
      L'annuaire RoullePro Transport Sanitaire est gratuit pour les patients. Votre fiche gratuite reste visible à vie. Les abonnements payants débloquent des fonctions supplémentaires (messagerie, mise en avant, statistiques).
    </div>
  </div>

  <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:13px;color:#6b7280;text-align:center">
    Besoin d'aide ? Écrivez à <a href="mailto:contact@roullepro.com" style="color:#0066CC">contact@roullepro.com</a> ou appelez le 06 15 47 28 13.
  </div>
</div>`;

      await sendEmail({
        to: accountEmail,
        subject: `Bienvenue sur RoullePro — Réclamation de ${nomAffiche} en cours de validation`,
        html,
      }).catch(() => undefined);
    }

    // Notification admin
    try {
      const nomAffiche = pro.nom_commercial || pro.raison_sociale;
      const adminUrl = `${APP_URL}/admin/sanitaire/reclamations`;
      const adminHtml = `
<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
  <h2 style="color:#0066CC">Nouvelle réclamation à valider</h2>
  <div style="background:#f0f6ff;border:1px solid #cfe3ff;border-radius:12px;padding:16px;margin:16px 0">
    <div><strong>Fiche :</strong> ${nomAffiche}</div>
    <div><strong>Ville :</strong> ${pro.ville}</div>
    <div><strong>Catégorie :</strong> ${pro.categorie}</div>
    <div><strong>Email réclamant :</strong> ${accountEmail}</div>
    <div><strong>Méthode :</strong> ${claim.method}</div>
  </div>
  <p>Réclamation à valider manuellement — vérifiez la cohérence SIRET / email réclamant / nom de l'entreprise avant d'approuver.</p>
  <div style="text-align:center;margin:24px 0">
    <a href="${adminUrl}" style="display:inline-block;background:#0066CC;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">
      Ouvrir la file d'attente
    </a>
  </div>
</div>`;
      await sendEmail({
        to: "contact@roullepro.com",
        subject: `[RoullePro Admin] Réclamation en attente : ${nomAffiche}`,
        html: adminHtml,
      }).catch(() => undefined);
    } catch {}

    return NextResponse.json({
      ok: true,
      pro_id: claim.pro_id,
      created_account: createdAccount,
      magic_link: magicLink,
      email: accountEmail,
      has_temp_password: !!tempPassword,
      temp_password: tempPassword,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
