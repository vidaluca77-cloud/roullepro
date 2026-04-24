export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

export async function POST(req: Request) {
  try {
    const supabaseUser = await createServerClient();
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const supabaseAdmin = getAdminClient();
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { pro_id, action, reason } = await req.json();
    if (!pro_id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const { data: pro } = await supabaseAdmin
      .from("pros_sanitaire")
      .select("id, raison_sociale, nom_commercial, ville, ville_slug, categorie, slug, claimed_by, email_public, source, free_trial_ends_at")
      .eq("id", pro_id)
      .maybeSingle();
    if (!pro) return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });

    let proEmail: string | null = pro.email_public;
    if (!proEmail && pro.claimed_by) {
      const { data: claimerProfile } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("id", pro.claimed_by)
        .maybeSingle();
      proEmail = claimerProfile?.email || null;
    }

    const nomAffiche = pro.nom_commercial || pro.raison_sociale;

    if (action === "approve") {
      const isSelfRegistered = (pro as typeof pro & { source: string | null }).source === "self_registration";
      const updatePayload: Record<string, unknown> = {
        claim_status: "approved",
        verified: true,
        validated_at: new Date().toISOString(),
        validated_by: user.id,
        rejection_reason: null,
      };
      // Pour les inscriptions spontanées, rendre la fiche active
      if (isSelfRegistered) {
        updatePayload.actif = true;
      }
      const { error } = await supabaseAdmin
        .from("pros_sanitaire")
        .update(updatePayload)
        .eq("id", pro_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (proEmail) {
        const freeTrialEnd = (pro as typeof pro & { free_trial_ends_at: string | null }).free_trial_ends_at;
        const trialDateStr = freeTrialEnd
          ? new Date(freeTrialEnd).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : null;
        const ficheUrl = `${APP_URL}/transport-medical/${pro.ville_slug}/${pro.categorie === "taxi_conventionne" ? "taxi-conventionne" : pro.categorie}/${pro.slug}`;
        const html = isSelfRegistered
          ? `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
  <h2 style="color:#0B8C3F">Votre fiche est désormais visible !</h2>
  <p>Bonne nouvelle, votre inscription pour <strong>${nomAffiche}</strong> a été validée par notre équipe. Votre fiche est désormais visible à l'adresse&nbsp;:</p>
  <div style="text-align:center;margin:16px 0">
    <a href="${ficheUrl}" style="display:inline-block;background:#f0f6ff;color:#0066CC;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;border:1px solid #bfdbfe">${ficheUrl}</a>
  </div>
  <p>Votre fiche de base est gratuite. Profitez-en pour l'enrichir et recevoir vos premiers patients.</p>
  <div style="text-align:center;margin:24px 0">
    <a href="${APP_URL}/transport-medical/pro/dashboard" style="display:inline-block;background:#0066CC;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">Acc&eacute;der &agrave; mon espace pro</a>
  </div>
  <p style="font-size:13px;color:#6b7280">Besoin d&rsquo;aide ? contact@roullepro.com</p>
</div>`
          : `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
  <h2 style="color:#0B8C3F">Votre fiche est validée</h2>
  <p>Bonne nouvelle, la fiche <strong>${nomAffiche}</strong> est désormais certifiée sur RoullePro. Elle affiche le badge <strong>&laquo;&nbsp;Pro vérifié&nbsp;&raquo;</strong> visible de tous les patients.</p>
  <div style="text-align:center;margin:24px 0">
    <a href="${APP_URL}/transport-medical/pro/dashboard" style="display:inline-block;background:#0066CC;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">Acc&eacute;der &agrave; mon espace pro</a>
  </div>
  <p style="font-size:13px;color:#6b7280">Besoin d&rsquo;aide ? contact@roullepro.com &mdash; 06 15 47 28 13</p>
</div>`;
        await sendEmail({
          to: proEmail,
          subject: isSelfRegistered
            ? `Votre fiche ${nomAffiche} est validée — RoullePro`
            : `Fiche ${nomAffiche} validée sur RoullePro`,
          html,
        }).catch(() => undefined);
      }
    } else {
      // reject
      const { error } = await supabaseAdmin
        .from("pros_sanitaire")
        .update({
          claim_status: "rejected",
          verified: false,
          claimed: false,
          claimed_by: null,
          claimed_at: null,
          rejection_reason: reason || "Justificatif non conforme",
          validated_at: new Date().toISOString(),
          validated_by: user.id,
        })
        .eq("id", pro_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (proEmail) {
        const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
  <h2 style="color:#b91c1c">R&eacute;clamation refus&eacute;e</h2>
  <p>Votre r&eacute;clamation de la fiche <strong>${nomAffiche}</strong> n&rsquo;a pas pu &ecirc;tre valid&eacute;e.</p>
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px;margin:16px 0">
    <div style="font-size:12px;color:#991b1b;font-weight:600;margin-bottom:4px">MOTIF</div>
    <div style="color:#7f1d1d">${(reason || "Justificatif non conforme").replace(/</g, "&lt;")}</div>
  </div>
  <p>Vous pouvez soumettre une nouvelle r&eacute;clamation avec un justificatif conforme (KBIS de moins de 3 mois ou agr&eacute;ment pr&eacute;fectoral de transport sanitaire).</p>
  <p style="font-size:13px;color:#6b7280">Questions ? contact@roullepro.com &mdash; 06 15 47 28 13</p>
</div>`;
        await sendEmail({
          to: proEmail,
          subject: `R&eacute;clamation de ${nomAffiche} refus&eacute;e`,
          html,
        }).catch(() => undefined);
      }
    }

    const categorieUrl = pro.categorie === "taxi_conventionne" ? "taxi-conventionne" : pro.categorie;
    try {
      revalidatePath(`/transport-medical/${pro.ville_slug}/${categorieUrl}/${pro.slug}`);
      revalidatePath(`/transport-medical/${pro.ville_slug}/${categorieUrl}`);
      revalidatePath(`/transport-medical/${pro.ville_slug}`);
      revalidatePath("/admin/sanitaire/reclamations");
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
