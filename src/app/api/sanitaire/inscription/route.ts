export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { slugifyVille } from "@/lib/sanitaire-data";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

// Mapping département → région
function regionFromDep(dep: string): string {
  const map: Record<string, string> = {
    "01": "Auvergne-Rhône-Alpes",
    "02": "Hauts-de-France",
    "03": "Auvergne-Rhône-Alpes",
    "04": "Provence-Alpes-Côte d'Azur",
    "05": "Provence-Alpes-Côte d'Azur",
    "06": "Provence-Alpes-Côte d'Azur",
    "07": "Auvergne-Rhône-Alpes",
    "08": "Grand Est",
    "09": "Occitanie",
    "10": "Grand Est",
    "11": "Occitanie",
    "12": "Occitanie",
    "13": "Provence-Alpes-Côte d'Azur",
    "14": "Normandie",
    "15": "Auvergne-Rhône-Alpes",
    "16": "Nouvelle-Aquitaine",
    "17": "Nouvelle-Aquitaine",
    "18": "Centre-Val de Loire",
    "19": "Nouvelle-Aquitaine",
    "21": "Bourgogne-Franche-Comté",
    "22": "Bretagne",
    "23": "Nouvelle-Aquitaine",
    "24": "Nouvelle-Aquitaine",
    "25": "Bourgogne-Franche-Comté",
    "26": "Auvergne-Rhône-Alpes",
    "27": "Normandie",
    "28": "Centre-Val de Loire",
    "29": "Bretagne",
    "2A": "Corse",
    "2B": "Corse",
    "30": "Occitanie",
    "31": "Occitanie",
    "32": "Occitanie",
    "33": "Nouvelle-Aquitaine",
    "34": "Occitanie",
    "35": "Bretagne",
    "36": "Centre-Val de Loire",
    "37": "Centre-Val de Loire",
    "38": "Auvergne-Rhône-Alpes",
    "39": "Bourgogne-Franche-Comté",
    "40": "Nouvelle-Aquitaine",
    "41": "Centre-Val de Loire",
    "42": "Auvergne-Rhône-Alpes",
    "43": "Auvergne-Rhône-Alpes",
    "44": "Pays de la Loire",
    "45": "Centre-Val de Loire",
    "46": "Occitanie",
    "47": "Nouvelle-Aquitaine",
    "48": "Occitanie",
    "49": "Pays de la Loire",
    "50": "Normandie",
    "51": "Grand Est",
    "52": "Grand Est",
    "53": "Pays de la Loire",
    "54": "Grand Est",
    "55": "Grand Est",
    "56": "Bretagne",
    "57": "Grand Est",
    "58": "Bourgogne-Franche-Comté",
    "59": "Hauts-de-France",
    "60": "Hauts-de-France",
    "61": "Normandie",
    "62": "Hauts-de-France",
    "63": "Auvergne-Rhône-Alpes",
    "64": "Nouvelle-Aquitaine",
    "65": "Occitanie",
    "66": "Occitanie",
    "67": "Grand Est",
    "68": "Grand Est",
    "69": "Auvergne-Rhône-Alpes",
    "70": "Bourgogne-Franche-Comté",
    "71": "Bourgogne-Franche-Comté",
    "72": "Pays de la Loire",
    "73": "Auvergne-Rhône-Alpes",
    "74": "Auvergne-Rhône-Alpes",
    "75": "Île-de-France",
    "76": "Normandie",
    "77": "Île-de-France",
    "78": "Île-de-France",
    "79": "Nouvelle-Aquitaine",
    "80": "Hauts-de-France",
    "81": "Occitanie",
    "82": "Occitanie",
    "83": "Provence-Alpes-Côte d'Azur",
    "84": "Provence-Alpes-Côte d'Azur",
    "85": "Pays de la Loire",
    "86": "Nouvelle-Aquitaine",
    "87": "Nouvelle-Aquitaine",
    "88": "Grand Est",
    "89": "Bourgogne-Franche-Comté",
    "90": "Bourgogne-Franche-Comté",
    "91": "Île-de-France",
    "92": "Île-de-France",
    "93": "Île-de-France",
    "94": "Île-de-France",
    "95": "Île-de-France",
    "971": "Guadeloupe",
    "972": "Martinique",
    "973": "Guyane",
    "974": "La Réunion",
    "976": "Mayotte",
  };
  return map[dep] || "France";
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function randomSuffix(n = 4): string {
  return Math.random().toString(36).substring(2, 2 + n);
}

const InscriptionSchema = z.object({
  siret: z
    .string()
    .optional()
    .transform((v) => v?.replace(/\s/g, "") || "")
    .refine((v) => v === "" || /^\d{14}$/.test(v), { message: "SIRET invalide (14 chiffres)" }),
  raison_sociale: z.string().min(2, "Raison sociale requise"),
  nom_commercial: z.string().optional().default(""),
  categorie: z.enum(["ambulance", "vsl", "taxi_conventionne"], {
    required_error: "Catégorie requise",
  }),
  adresse: z.string().min(3, "Adresse requise"),
  code_postal: z.string().regex(/^\d{5}$/, "Code postal invalide (5 chiffres)"),
  ville: z.string().min(2, "Ville requise"),
  telephone: z
    .string()
    .transform((v) => v.replace(/[\s.-]/g, ""))
    .refine((v) => /^\+?\d{10,}$/.test(v), { message: "Téléphone invalide (min 10 chiffres)" }),
  email: z.string().email("Email invalide"),
  site_web: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return undefined;
      if (v && !v.startsWith("http")) return `https://${v}`;
      return v;
    })
    .pipe(z.string().url("URL invalide").optional()),
  horaires: z.record(z.string()).optional().nullable(),
  description: z.string().max(2000, "Description trop longue (max 2000 caractères)").optional(),
  services: z.array(z.string()).optional().default([]),
  nom: z.string().min(2, "Nom requis"),
  prenom: z.string().min(2, "Prénom requis"),
  password: z.string().min(8, "Mot de passe : 8 caractères minimum"),
  captcha_token: z.string().optional().default(""),
  kbis_path: z
    .string()
    .min(1, "Justificatif Kbis requis")
    .refine((v) => v.startsWith("kbis/"), { message: "Chemin de justificatif invalide" }),
  rgpd_accepted: z.literal(true, { errorMap: () => ({ message: "Vous devez accepter les CGU" }) }),
});

async function verifyCaptcha(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) {
    console.warn("[hCaptcha] HCAPTCHA_SECRET manquant — skip captcha (dev-mode)");
    return true;
  }
  if (!token) return false;
  const res = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
  });
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

export async function POST(req: Request) {
  const supabaseAdmin = getAdminClient();
  let createdUserId: string | null = null;

  try {
    // 1. Rate limit (large pour la phase de lancement — à resserrer plus tard)
    const ip = getClientIp(req);
    const { ok: rlOk } = checkRateLimit(`inscription:${ip}`, 20, 3_600_000);
    if (!rlOk) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans 1 heure." },
        { status: 429 }
      );
    }

    // 2. Parse + validation Zod
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
    }
    const parsed = InscriptionSchema.safeParse(body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(" · ");
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    const data = parsed.data;

    // 3. Vérification hCaptcha — non-bloquante (logging only).
    // Le rate limit (20/h/IP) + l'anti-doublon SIRET servent de filet.
    // On log les échecs pour détecter d'éventuels spams ultérieurement.
    const captchaOk = await verifyCaptcha(data.captcha_token);
    if (!captchaOk) {
      console.warn("[hCaptcha] token invalide ou vide — on laisse passer", {
        ip,
        email: data.email,
        hasToken: Boolean(data.captcha_token),
      });
      await supabaseAdmin.from("sanitaire_inscription_logs").insert({
        siret: data.siret || null,
        email: data.email,
        raison_sociale: data.raison_sociale,
        ville: data.ville,
        ip,
        user_agent: req.headers.get("user-agent") || "",
        status: "captcha_warning",
        reason: data.captcha_token ? "hCaptcha token refusé" : "hCaptcha token vide",
      }).then(() => undefined, () => undefined);
      // Pas de return — on continue le flow
    }

    // 4. Unicité SIRET
    if (data.siret) {
      const { data: existingPro } = await supabaseAdmin
        .from("pros_sanitaire")
        .select("id")
        .eq("siret", data.siret)
        .limit(1)
        .maybeSingle();
      if (existingPro) {
        await supabaseAdmin.from("sanitaire_inscription_logs").insert({
          siret: data.siret,
          email: data.email,
          raison_sociale: data.raison_sociale,
          ville: data.ville,
          ip,
          user_agent: req.headers.get("user-agent") || "",
          status: "rejected_duplicate",
          reason: "SIRET déjà référencé",
          pro_id: existingPro.id,
        });
        return NextResponse.json(
          {
            error: `Cette entreprise est déjà référencée. Revendiquez sa fiche ici : /transport-medical/pro/reclamer?siret=${data.siret}`,
          },
          { status: 409 }
        );
      }
    }

    // 5. Unicité email auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const emailAlreadyExists = existingUsers?.users?.some(
      (u) => u.email?.toLowerCase() === data.email.toLowerCase()
    );
    if (emailAlreadyExists) {
      return NextResponse.json(
        {
          error:
            "Cet email est déjà associé à un compte. Connectez-vous pour réclamer ou créer une fiche.",
        },
        { status: 409 }
      );
    }

    // 6. Créer le user auth
    const fullName = `${data.prenom} ${data.nom}`;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: false,
      user_metadata: {
        full_name: fullName,
        phone: data.telephone,
        via: "sanitaire_inscription",
      },
    });
    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Erreur création de compte" },
        { status: 500 }
      );
    }
    createdUserId = authData.user.id;

    // 7. UPDATE profiles (le trigger handle_new_user a déjà créé la ligne)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        email: data.email,
        full_name: fullName,
        phone: data.telephone,
        company_name: data.raison_sociale,
        siret: data.siret || null,
        city: data.ville,
        role: "pro",
      })
      .eq("id", createdUserId);
    if (profileError) {
      throw new Error(`Erreur profil : ${profileError.message}`);
    }

    // 8. Calculer slug
    const baseSlug = slugify(data.nom_commercial || data.raison_sociale);
    let slug = baseSlug;
    const { data: slugCheck } = await supabaseAdmin
      .from("pros_sanitaire")
      .select("id")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();
    if (slugCheck) {
      slug = `${baseSlug}-${randomSuffix()}`;
    }

    // 9. ville_slug
    const ville_slug = slugifyVille(data.ville);

    // 10. Département / région
    const cp = data.code_postal;
    const departement = cp.startsWith("97") ? cp.substring(0, 3) : cp.substring(0, 2);
    const region = regionFromDep(departement);

    // 11. INSERT pros_sanitaire
    const freeTrialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: proData, error: proError } = await supabaseAdmin
      .from("pros_sanitaire")
      .insert({
        siret: data.siret || "",
        siren: data.siret ? data.siret.substring(0, 9) : "",
        raison_sociale: data.raison_sociale,
        nom_commercial: data.nom_commercial || null,
        slug,
        categorie: data.categorie,
        adresse: data.adresse,
        code_postal: data.code_postal,
        ville: data.ville,
        ville_slug,
        departement,
        region,
        telephone_public: data.telephone,
        email_public: data.email,
        site_web: data.site_web || null,
        horaires: data.horaires || null,
        description: data.description || null,
        services: data.services && data.services.length > 0 ? data.services : null,
        source: "self_registration",
        kbis_url: data.kbis_path,
        kbis_uploaded_at: new Date().toISOString(),
        claimed: true,
        claimed_by: createdUserId,
        claimed_at: new Date().toISOString(),
        claim_status: "en_attente_validation",
        verified: false,
        actif: false,
        plan: "gratuit",
        free_trial_ends_at: freeTrialEndsAt,
      })
      .select("id")
      .single();

    if (proError || !proData) {
      // Cas duplicate SIRET non détecté par la pré-vérif (race condition, casse, etc.)
      if (
        proError &&
        ((proError as { code?: string }).code === "23505" ||
          /duplicate key|pros_sanitaire_siret_key/i.test(proError.message || ""))
      ) {
        // Rollback user auth
        if (createdUserId) {
          await supabaseAdmin.auth.admin.deleteUser(createdUserId).catch(() => undefined);
          createdUserId = null;
        }
        await supabaseAdmin.from("sanitaire_inscription_logs").insert({
          siret: data.siret || null,
          email: data.email,
          raison_sociale: data.raison_sociale,
          ville: data.ville,
          ip,
          user_agent: req.headers.get("user-agent") || "",
          status: "rejected_duplicate",
          reason: "SIRET déjà référencé (détecté à l'INSERT)",
        }).then(() => undefined, () => undefined);
        return NextResponse.json(
          {
            error: data.siret
              ? `Cette entreprise est déjà référencée. Revendiquez sa fiche ici : /transport-medical/pro/reclamer?siret=${data.siret}`
              : "Cette entreprise est déjà référencée. Contactez-nous pour réclamer la fiche.",
          },
          { status: 409 }
        );
      }
      throw new Error(`Erreur insertion fiche : ${proError?.message}`);
    }

    // 12. INSERT log
    await supabaseAdmin.from("sanitaire_inscription_logs").insert({
      siret: data.siret || null,
      email: data.email,
      raison_sociale: data.raison_sociale,
      ville: data.ville,
      ip,
      user_agent: req.headers.get("user-agent") || "",
      status: "created",
      pro_id: proData.id,
      user_id: createdUserId,
      kbis_url: data.kbis_path,
    });

    // 13. Emails
    const encodedEmail = encodeURIComponent(data.email);
    const nomAffiche = data.nom_commercial || data.raison_sociale;

    // Email utilisateur
    await sendEmail({
      to: data.email,
      subject: "Votre inscription RoullePro a bien été reçue",
      html: `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
  <h2 style="color:#0066CC">Inscription reçue — merci, ${data.prenom}&nbsp;!</h2>
  <p>Nous avons bien reçu votre demande d'inscription pour <strong>${nomAffiche}</strong> sur RoullePro Transport Médical.</p>
  <h3 style="color:#374151">Prochaines étapes</h3>
  <ol>
    <li><strong>Vérifiez votre email</strong> — un lien de confirmation vous a été envoyé séparément.</li>
    <li><strong>Validation par notre équipe</strong> — votre fiche sera validée manuellement sous 24 à 48 h.</li>
    <li><strong>Complétez votre fiche</strong> — après validation, ajoutez photos, horaires détaillés et description.</li>
  </ol>
  <p>Une fois validée, votre fiche sera visible publiquement. Vous bénéficierez de <strong>14 jours Pro offerts</strong> sans carte bancaire.</p>
  <p style="font-size:13px;color:#6b7280">Questions ? <a href="mailto:contact@roullepro.com">contact@roullepro.com</a></p>
</div>`,
    }).catch(() => undefined);

    // Email admin
    const adminEmail = process.env.ADMIN_EMAIL || "contact@roullepro.com";
    await sendEmail({
      to: adminEmail,
      subject: `Nouvelle inscription : ${nomAffiche} (${data.ville})`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
  <h2>Nouvelle inscription pro</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
    <tr><td style="padding:6px;color:#6b7280">Entreprise</td><td style="padding:6px;font-weight:600">${nomAffiche}</td></tr>
    <tr><td style="padding:6px;color:#6b7280">SIRET</td><td style="padding:6px">${data.siret || "Non fourni"}</td></tr>
    <tr><td style="padding:6px;color:#6b7280">Catégorie</td><td style="padding:6px">${data.categorie}</td></tr>
    <tr><td style="padding:6px;color:#6b7280">Ville</td><td style="padding:6px">${data.ville} (${data.code_postal})</td></tr>
    <tr><td style="padding:6px;color:#6b7280">Email</td><td style="padding:6px">${data.email}</td></tr>
    <tr><td style="padding:6px;color:#6b7280">Téléphone</td><td style="padding:6px">${data.telephone}</td></tr>
    <tr><td style="padding:6px;color:#6b7280">Gérant</td><td style="padding:6px">${fullName}</td></tr>
    <tr><td style="padding:6px;color:#6b7280">Justificatif Kbis</td><td style="padding:6px;color:#059669;font-weight:600">✓ Téléversé (à vérifier dans l'admin)</td></tr>
  </table>
  <a href="${APP_URL}/admin/sanitaire/reclamations?tab=pending&source=self_registration" style="display:inline-block;background:#0066CC;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Voir dans l'admin</a>
</div>`,
    }).catch(() => undefined);

    // 14. Email confirmation Supabase
    try {
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email: data.email,
        password: data.password,
        options: {
          redirectTo: `${APP_URL}/auth/callback?next=/transport-medical/pro/dashboard`,
        },
      });
      if (linkData?.properties?.action_link) {
        const actionLink = linkData.properties.action_link;
        await sendEmail({
          to: data.email,
          subject: "Confirmez votre adresse email — RoullePro",
          html: `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
  <h2 style="color:#0066CC">Confirmez votre adresse email</h2>
  <p>Cliquez sur le bouton ci-dessous pour confirmer votre email et activer votre compte RoullePro.</p>
  <div style="text-align:center;margin:28px 0">
    <a href="${actionLink}" style="display:inline-block;background:#0066CC;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px">Confirmer mon email</a>
  </div>
  <p style="font-size:12px;color:#9ca3af">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>${actionLink}</p>
  <p style="font-size:13px;color:#6b7280;margin-top:24px">Questions ? <a href="mailto:contact@roullepro.com">contact@roullepro.com</a></p>
</div>`,
        }).catch(() => undefined);
      }
    } catch {
      // Non-bloquant
    }

    // 15. Return
    return NextResponse.json({
      ok: true,
      redirect: `/transport-medical/inscription/merci?email=${encodedEmail}`,
    });
  } catch (err) {
    // Rollback du user si créé
    if (createdUserId) {
      try {
        const supabaseAdmin2 = getAdminClient();
        await supabaseAdmin2.auth.admin.deleteUser(createdUserId);
      } catch {
        // best effort
      }
    }
    console.error("[inscription] Erreur:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
