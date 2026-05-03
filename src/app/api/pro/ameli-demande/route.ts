export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";
const ADMIN_EMAIL = "contact@roullepro.com";

const PROOF_TYPE_LABELS: Record<string, string> = {
  attestation_ameli: "Attestation Ameli",
  contrat_conventionnement: "Contrat de conventionnement",
  capture_compte_ameli: "Capture compte ameli.fr",
  autre: "Autre",
};

export async function POST(req: Request) {
  try {
    const supabaseUser = await createServerClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json();
    const {
      pro_id,
      siret,
      numero_am,
      date_convention,
      proof_type,
      proof_file_url,
      proof_file_size_bytes,
      proof_mime,
      declaration_honneur,
      existing_request_id,
    } = body;

    // Validations
    if (!pro_id || typeof pro_id !== "string") {
      return NextResponse.json({ error: "pro_id manquant" }, { status: 400 });
    }
    if (!siret || typeof siret !== "string" || siret.length !== 14) {
      return NextResponse.json({ error: "SIRET invalide" }, { status: 400 });
    }
    if (
      !["attestation_ameli", "contrat_conventionnement", "capture_compte_ameli", "autre"].includes(
        proof_type
      )
    ) {
      return NextResponse.json({ error: "Type de preuve invalide" }, { status: 400 });
    }
    if (!proof_file_url || typeof proof_file_url !== "string") {
      return NextResponse.json({ error: "Fichier preuve manquant" }, { status: 400 });
    }
    if (declaration_honneur !== true) {
      return NextResponse.json(
        { error: "La déclaration sur l'honneur est obligatoire" },
        { status: 400 }
      );
    }

    // Le path doit commencer par <user_id>/ (cohérence avec policy storage)
    if (!proof_file_url.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: "Chemin fichier invalide" }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // Vérifier que l'user est bien claimer de la fiche
    const { data: pro } = await supabaseAdmin
      .from("pros_sanitaire")
      .select(
        "id, raison_sociale, nom_commercial, ville, ville_slug, categorie, slug, claimed_by, claim_status, ameli_conventionne, ameli_source"
      )
      .eq("id", pro_id)
      .maybeSingle();

    if (!pro) return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });

    if (pro.claimed_by !== user.id || pro.claim_status !== "approved") {
      return NextResponse.json(
        { error: "Vous n'êtes pas le gérant validé de cette fiche" },
        { status: 403 }
      );
    }

    // Si déjà conventionné via cnam_annuaire, refuser (pas besoin de demande manuelle)
    if (pro.ameli_conventionne && pro.ameli_source === "cnam_annuaire") {
      return NextResponse.json(
        { error: "Cette fiche est déjà conventionnée Ameli (annuaire CNAM)" },
        { status: 409 }
      );
    }

    // Si une demande pending existe déjà (autre que celle qu'on resoumet), refuser
    const { data: pendings } = await supabaseAdmin
      .from("ameli_badge_requests")
      .select("id, status")
      .eq("pro_id", pro_id)
      .in("status", ["pending"]);

    if (pendings && pendings.length > 0) {
      return NextResponse.json(
        { error: "Une demande est déjà en cours d'examen pour cette fiche" },
        { status: 409 }
      );
    }

    // Si resubmit après need_info, fermer l'ancienne en passant son status à... non, on en crée une nouvelle pending et on archive l'ancienne en spam? Non plus simple : on supprime l'ancienne need_info ou on la passe à rejected.
    // Décision : on bascule l'ancienne need_info à 'rejected' avec rejection_reason='Resoumission' pour libérer le UNIQUE partial.
    if (existing_request_id && typeof existing_request_id === "string") {
      await supabaseAdmin
        .from("ameli_badge_requests")
        .update({
          status: "rejected",
          rejection_reason: "Resoumission par le pro avec nouveaux éléments",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", existing_request_id)
        .eq("pro_id", pro_id)
        .eq("status", "need_info");
    }

    // Créer la demande
    const { data: created, error: insErr } = await supabaseAdmin
      .from("ameli_badge_requests")
      .insert({
        pro_id,
        user_id: user.id,
        siret,
        numero_am: numero_am || null,
        date_convention: date_convention || null,
        proof_type,
        proof_file_url,
        proof_file_size_bytes: proof_file_size_bytes || null,
        proof_mime: proof_mime || null,
        declaration_honneur: true,
        status: "pending",
      })
      .select("id")
      .single();

    if (insErr || !created) {
      return NextResponse.json(
        { error: insErr?.message || "Erreur création demande" },
        { status: 500 }
      );
    }

    const nomAffiche = pro.nom_commercial || pro.raison_sociale;
    const proofLabel = PROOF_TYPE_LABELS[proof_type] || proof_type;

    // === Email pro (accusé de réception) ===
    const { data: proProfile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .maybeSingle();
    const proEmail = proProfile?.email || user.email;

    if (proEmail) {
      const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
  <h2 style="color:#0066CC">Demande de badge Ameli reçue</h2>
  <p>Nous avons bien reçu votre demande pour <strong>${nomAffiche}</strong>.</p>
  <p>Notre équipe va vérifier votre justificatif (<strong>${proofLabel}</strong>) sous un délai indicatif de <strong>5 jours ouvrés</strong>.</p>
  <p>Vous recevrez un email dès que votre demande aura été traitée.</p>
  <div style="text-align:center;margin:24px 0">
    <a href="${APP_URL}/transport-medical/pro/dashboard" style="display:inline-block;background:#0066CC;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">Accéder à mon espace pro</a>
  </div>
  <p style="font-size:13px;color:#6b7280">Questions ? contact@roullepro.com</p>
</div>`;
      await sendEmail({
        to: proEmail,
        subject: `Demande badge Ameli reçue — ${nomAffiche}`,
        html,
      }).catch(() => undefined);
    }

    // === Email admin (notification nouvelle demande) ===
    const adminHtml = `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
  <h2 style="color:#0B8C3F">Nouvelle demande badge Ameli</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr><td style="padding:6px 0;color:#6b7280">Fiche</td><td style="padding:6px 0;font-weight:600">${nomAffiche}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Ville</td><td style="padding:6px 0">${pro.ville || "—"}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">SIRET</td><td style="padding:6px 0">${siret}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">N° AM</td><td style="padding:6px 0">${numero_am || "—"}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Date convention</td><td style="padding:6px 0">${date_convention || "—"}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Type preuve</td><td style="padding:6px 0">${proofLabel}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Demandeur</td><td style="padding:6px 0">${proEmail || user.id}</td></tr>
  </table>
  <div style="text-align:center;margin:24px 0">
    <a href="${APP_URL}/admin/ameli-requests" style="display:inline-block;background:#0066CC;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">Examiner la demande</a>
  </div>
</div>`;
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `[Ameli] Nouvelle demande — ${nomAffiche}`,
      html: adminHtml,
    }).catch(() => undefined);

    return NextResponse.json({ ok: true, request_id: created.id });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
