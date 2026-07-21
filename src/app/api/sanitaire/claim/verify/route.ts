export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { renderClaimBienvenue, renderClaimAdmin } from "@/lib/email-templates/sanitaire";
import { telephoneSmsParDefaut } from "@/lib/sms";

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
      .select(
        "id, raison_sociale, nom_commercial, ville, ville_slug, slug, categorie, email_public, adresse, code_postal, departement, siret, latitude, longitude, telephone_public, telephone_sms, phone_e164"
      )
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

    // SMS actives par defaut : le pro devient inscrit en revendiquant sa fiche.
    // Numero pre-rempli depuis le mobile connu (sans ecraser un numero existant).
    updates.sms_notifications = true;
    const telSms = telephoneSmsParDefaut({
      telephoneSmsActuel: pro.telephone_sms as string | null,
      phoneE164: pro.phone_e164 as string | null,
      telephonePublic: pro.telephone_public as string | null,
    });
    if (telSms !== undefined) updates.telephone_sms = telSms;
    const { error: updErr } = await supabaseAdmin
      .from("pros_sanitaire")
      .update(updates)
      .eq("id", claim.pro_id);
    if (updErr) return NextResponse.json({ error: "Erreur association" }, { status: 500 });

    await supabaseAdmin
      .from("sanitaire_claims")
      .update({ status: "verified", verified_at: new Date().toISOString(), user_id: userId })
      .eq("id", claim_id);

    // Geocodage best-effort si la fiche n'a pas encore de coordonnees.
    // Permet au pro reclame de remonter immediatement dans les listes
    // "transporteurs proches" du departement et de la ville.
    if (pro.latitude == null || pro.longitude == null) {
      try {
        const { geocodePro } = await import("@/lib/geocode-pro");
        const geo = await geocodePro({
          adresse: pro.adresse as string | null,
          code_postal: pro.code_postal as string | null,
          ville: pro.ville as string | null,
          siret: pro.siret as string | null,
        });
        if (geo) {
          await supabaseAdmin
            .from("pros_sanitaire")
            .update({ latitude: geo.latitude, longitude: geo.longitude })
            .eq("id", claim.pro_id);
          console.log("[claim/verify] geocode OK:", {
            slug: pro.slug,
            source: geo.source,
            score: geo.score,
          });
        }
      } catch (err) {
        console.warn(
          "[claim/verify] geocode error:",
          err instanceof Error ? err.message : err
        );
      }
    }

    // Invalide les caches "transporteurs proches" du departement pour que
    // ce pro nouvellement reclame apparaisse immediatement sur les fiches
    // etablissement, sans attendre les 24h de cache.
    try {
      const { revalidateTag } = await import("next/cache");
      if (pro.departement) {
        revalidateTag(`nearby-transporters-dept:${pro.departement}`);
      }
    } catch {}

    // Rattrapage a l'inscription : rattache automatiquement les demandes
    // ouvertes pertinentes (categorie + geo + fenetre 7 jours) au pro qui vient
    // de revendiquer sa fiche. Place APRES le geocodage ci-dessus pour que le
    // repli 15 km beneficie des coordonnees fraichement calculees. Best-effort :
    // un echec ne casse jamais le claim.
    try {
      const { rattraperDemandesPourPro } = await import(
        "@/lib/rattrapage-inscription"
      );
      const rattrapage = await rattraperDemandesPourPro({
        admin: supabaseAdmin,
        proId: claim.pro_id,
      });
      console.log("[claim/verify] rattrapage demandes:", {
        pro_id: claim.pro_id,
        rattrapees: rattrapage.rattrapees,
      });
    } catch (err) {
      console.warn(
        "[claim/verify] rattrapage error:",
        err instanceof Error ? err.message : err
      );
    }

    // Auto-inscription newsletter veille reglementaire (best-effort, non bloquant)
    const newsletterEmail = accountEmail || pro.email_public || null;
    if (newsletterEmail && pro.categorie) {
      try {
        const { autoSubscribePro } = await import("@/lib/veille-auto-subscribe");
        const result = await autoSubscribePro({
          email: newsletterEmail,
          categorie: pro.categorie as string,
          supabase: supabaseAdmin,
        });
        console.log("[claim/verify] auto-subscribe veille:", {
          email: newsletterEmail,
          status: result.status,
          sent: result.sent_confirmation,
          reason: result.reason,
        });
      } catch (err) {
        console.warn(
          "[claim/verify] auto-subscribe veille error:",
          err instanceof Error ? err.message : err
        );
      }
    }

    // Ping IndexNow immediat (fire-and-forget, prod uniquement)
    try {
      const { pingIndexNow, buildFicheUrl } = await import("@/lib/indexnow");
      const ficheUrl = buildFicheUrl({
        ville_slug: (pro as { ville_slug?: string | null }).ville_slug,
        categorie: (pro as { categorie?: string | null }).categorie,
        slug: (pro as { slug?: string | null }).slug,
      });
      if (ficheUrl) void pingIndexNow([ficheUrl]);
    } catch (err) {
      console.warn(
        "[claim/verify] indexnow error:",
        err instanceof Error ? err.message : err
      );
    }

    // Octroi essai Pro gratuit (7 jours par défaut, best-effort, non bloquant)
    try {
      const { grantAutoTrial } = await import("@/lib/sanitaire-auto-trial");
      const trial = await grantAutoTrial(claim.pro_id);
      console.log("[claim/verify] auto-trial:", { pro_id: claim.pro_id, result: trial });
    } catch (err) {
      console.warn(
        "[claim/verify] auto-trial error:",
        err instanceof Error ? err.message : err
      );
    }

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
      await sendEmail({
        to: accountEmail,
        ...renderClaimBienvenue({
          nomAffiche,
          accountEmail,
          tempPassword,
          magicLink,
          appUrl: APP_URL,
        }),
      }).catch(() => undefined);
    }

    // Notification admin
    try {
      const nomAffiche = pro.nom_commercial || pro.raison_sociale;
      const adminUrl = `${APP_URL}/admin/sanitaire/reclamations`;
      await sendEmail({
        to: "contact@roullepro.com",
        ...renderClaimAdmin({
          nomAffiche,
          ville: pro.ville as string,
          categorie: pro.categorie as string,
          accountEmail: accountEmail ?? "",
          method: claim.method,
          adminUrl,
        }),
      }).catch(() => undefined);
    } catch {}

    // SÉCURITÉ : le mot de passe temporaire et le magic link ne sortent JAMAIS dans la
    // réponse JSON. Ils sont transmis uniquement par email à l'adresse officielle de la
    // fiche, ce qui empêche le squat d'une fiche par un appelant qui n'a pas accès à
    // cette boîte mail.
    return NextResponse.json({
      ok: true,
      pro_id: claim.pro_id,
      created_account: createdAccount,
      message: "Un code de vérification a été envoyé sur l'email officiel de la fiche",
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
