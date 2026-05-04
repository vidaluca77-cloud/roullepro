/**
 * ROUTE ONE-SHOT : Activation manuelle TAXIS FLOREL le 04/05/2026.
 * À SUPPRIMER après usage.
 *
 * - Crée le compte auth taxisflorel@gmail.com avec mdp temporaire
 * - Lie la fiche TAXIS FLOREL au compte (claim_status=approved, verified=true)
 * - Clôture la sanitaire_claim pending
 * - Renvoie le mot de passe temporaire dans la réponse JSON pour que Lucas
 *   puisse l'envoyer manuellement par email au pro.
 */
export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

const PRO_ID = "0ec01a83-7c5d-4bb3-990c-a16f54a01aa0"; // TAXIS FLOREL
const CLAIM_ID = "955b0392-0951-45fc-a09b-bcaa90780c29";
const EMAIL = "taxisflorel@gmail.com";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

function generateTempPassword(len = 16): string {
  const ALPHA = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(len))
    .map((b) => ALPHA[b % ALPHA.length])
    .join("");
}

const getAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function POST() {
  try {
    // Auth admin check
    const supabaseUser = await createServerClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const sb = getAdmin();
    const { data: prof } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!prof || prof.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const adminId = user.id;
    const tempPassword = generateTempPassword(16);
    const log: string[] = [];

    // Step 1 : Créer le compte (idempotent : si existe déjà, on récupère son id)
    let userId: string | null = null;

    const { data: created, error: createErr } = await sb.auth.admin.createUser({
      email: EMAIL,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { source: "admin_manual_taxisflorel" },
    });

    if (createErr) {
      // Peut-être déjà créé : on cherche
      log.push(`createUser err: ${createErr.message}`);
      const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
      const existing = list?.users?.find((u) => u.email?.toLowerCase() === EMAIL);
      if (!existing) {
        return NextResponse.json(
          { error: `Échec création compte : ${createErr.message}`, log },
          { status: 500 }
        );
      }
      userId = existing.id;
      log.push(`Compte déjà existant, id=${userId}. MDP temporaire NON appliqué.`);
      // On reset le mdp pour pouvoir le communiquer
      const { error: updPwdErr } = await sb.auth.admin.updateUserById(userId, {
        password: tempPassword,
      });
      if (updPwdErr) {
        log.push(`updatePwd err: ${updPwdErr.message}`);
      } else {
        log.push("MDP temporaire appliqué via updateUserById");
      }
    } else {
      userId = created.user.id;
      log.push(`Compte créé id=${userId}`);
    }

    if (!userId) {
      return NextResponse.json({ error: "User id introuvable", log }, { status: 500 });
    }

    // Step 2 : Profile
    const { data: existingProf } = await sb
      .from("profiles")
      .select("id, role, email")
      .eq("id", userId)
      .maybeSingle();
    if (!existingProf) {
      const { error: insErr } = await sb
        .from("profiles")
        .insert({ id: userId, email: EMAIL, role: "pro" });
      if (insErr) log.push(`insert profile err: ${insErr.message}`);
      else log.push("Profile créé (role=pro)");
    } else if (existingProf.role !== "pro" && existingProf.role !== "admin") {
      await sb.from("profiles").update({ role: "pro" }).eq("id", userId);
      log.push(`Profile role mis à jour: ${existingProf.role} -> pro`);
    } else {
      log.push(`Profile déjà OK (role=${existingProf.role})`);
    }

    // Step 3 : Lier fiche TAXIS FLOREL
    const now = new Date().toISOString();
    const { data: pro, error: updErr } = await sb
      .from("pros_sanitaire")
      .update({
        claimed_by: userId,
        claimed: true,
        claim_status: "approved",
        claimed_at: now,
        verified: true,
        validated_at: now,
        validated_by: adminId,
        email_public: EMAIL,
      })
      .eq("id", PRO_ID)
      .select(
        "id, raison_sociale, ville, ville_slug, slug, categorie, claim_status, verified, email_public"
      )
      .single();
    if (updErr) {
      return NextResponse.json(
        { error: `Échec lien fiche : ${updErr.message}`, log },
        { status: 500 }
      );
    }
    log.push(`Fiche liée: ${pro?.raison_sociale}`);

    // Step 4 : Clôturer la claim
    const { error: closeErr } = await sb
      .from("sanitaire_claims")
      .update({ status: "verified", verified_at: now, user_id: userId })
      .eq("id", CLAIM_ID);
    if (closeErr) log.push(`close claim err: ${closeErr.message}`);
    else log.push("Claim clôturée");

    // Step 5 : Email pro avec mdp temporaire
    const categorieUrl =
      pro?.categorie === "taxi_conventionne" ? "taxi-conventionne" : pro?.categorie;
    const ficheUrl = `${APP_URL}/transport-medical/${pro?.ville_slug}/${categorieUrl}/${pro?.slug}`;
    const dashboardUrl = `${APP_URL}/transport-medical/pro/dashboard`;
    const loginUrl = `${APP_URL}/auth/login`;

    const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
  <h2 style="color:#0B8C3F">Votre fiche RoullePro est activée</h2>
  <p>Bonjour,</p>
  <p>Votre fiche professionnelle <strong>${pro?.raison_sociale}</strong> a été activée et liée à votre adresse email <strong>${EMAIL}</strong>.</p>

  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:18px 0">
    <div style="font-size:12px;color:#065f46;font-weight:700;letter-spacing:.5px">VOS IDENTIFIANTS DE CONNEXION</div>
    <div style="margin-top:8px;font-size:14px"><strong>Email :</strong> ${EMAIL}</div>
    <div style="margin-top:4px;font-size:14px"><strong>Mot de passe temporaire :</strong> <code style="background:#fff;padding:3px 8px;border-radius:6px;border:1px solid #d1fae5;font-size:14px">${tempPassword}</code></div>
    <div style="margin-top:10px;font-size:12px;color:#065f46">Pour des raisons de sécurité, merci de changer ce mot de passe lors de votre première connexion.</div>
  </div>

  <div style="text-align:center;margin:24px 0">
    <a href="${loginUrl}" style="display:inline-block;background:#0066CC;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">Me connecter à mon espace pro</a>
  </div>

  <h3 style="color:#111827;margin-top:28px">Que pouvez-vous faire maintenant ?</h3>
  <ul style="font-size:14px;line-height:1.7;color:#374151">
    <li>Compléter et corriger les informations de votre fiche</li>
    <li>Ajouter votre numéro de téléphone, votre site web et vos horaires</li>
    <li>Demander le badge Conventionné Ameli si vous l'êtes</li>
    <li>Recevoir directement les demandes des particuliers</li>
  </ul>

  <p style="font-size:14px">Votre fiche publique :<br>
    <a href="${ficheUrl}" style="color:#0066CC">${ficheUrl}</a>
  </p>

  <p style="font-size:13px;color:#6b7280;margin-top:24px">Une question ? Répondez à cet email ou écrivez-nous à contact@roullepro.com</p>
  <p style="font-size:13px;color:#6b7280">L'équipe RoullePro</p>
</div>`;

    const emailRes = await sendEmail({
      to: EMAIL,
      subject: `Votre fiche ${pro?.raison_sociale} est activée sur RoullePro`,
      html,
    }).catch((e) => ({ error: (e as Error).message }));

    log.push(`Email envoyé: ${JSON.stringify(emailRes).slice(0, 200)}`);

    return NextResponse.json({
      ok: true,
      user_id: userId,
      email: EMAIL,
      temp_password: tempPassword,
      pro: pro,
      log,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
