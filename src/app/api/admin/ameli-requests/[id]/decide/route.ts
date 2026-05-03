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

type Action = "approve" | "reject" | "need_info" | "spam";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUser = await createServerClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();
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

    const requestId = params.id;
    const body = await req.json();
    const action = body.action as Action;
    const reason: string | null = body.reason || null;
    const adminNotes: string | null = body.admin_notes || null;

    if (!requestId || !["approve", "reject", "need_info", "spam"].includes(action)) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    // Charger la demande + fiche pro
    const { data: amReq } = await supabaseAdmin
      .from("ameli_badge_requests")
      .select(
        "id, pro_id, user_id, siret, numero_am, date_convention, proof_type, proof_file_url, status"
      )
      .eq("id", requestId)
      .maybeSingle();

    if (!amReq) {
      return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
    }

    if (amReq.status !== "pending" && amReq.status !== "need_info") {
      return NextResponse.json(
        { error: `Demande déjà traitée (statut: ${amReq.status})` },
        { status: 409 }
      );
    }

    const { data: pro } = await supabaseAdmin
      .from("pros_sanitaire")
      .select(
        "id, raison_sociale, nom_commercial, ville, ville_slug, categorie, slug, email_public, claimed_by"
      )
      .eq("id", amReq.pro_id)
      .maybeSingle();

    if (!pro) {
      return NextResponse.json({ error: "Fiche pro introuvable" }, { status: 404 });
    }

    // Récupérer email du pro (claimer en priorité)
    let proEmail: string | null = null;
    if (amReq.user_id) {
      const { data: claimer } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("id", amReq.user_id)
        .maybeSingle();
      proEmail = claimer?.email || null;
    }
    if (!proEmail) proEmail = pro.email_public;

    const nomAffiche = pro.nom_commercial || pro.raison_sociale;
    const categorieUrl = pro.categorie === "taxi_conventionne" ? "taxi-conventionne" : pro.categorie;
    const ficheUrl = `${APP_URL}/transport-medical/${pro.ville_slug}/${categorieUrl}/${pro.slug}`;

    const now = new Date().toISOString();

    // === APPROVE ===
    if (action === "approve") {
      // 1. Update request
      const { error: errReq } = await supabaseAdmin
        .from("ameli_badge_requests")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: now,
          rejection_reason: null,
          admin_notes: adminNotes,
        })
        .eq("id", requestId);
      if (errReq) return NextResponse.json({ error: errReq.message }, { status: 500 });

      // 2. Update pro
      const { error: errPro } = await supabaseAdmin
        .from("pros_sanitaire")
        .update({
          ameli_conventionne: true,
          ameli_last_seen: now,
          ameli_source: "manual_verified",
        })
        .eq("id", amReq.pro_id);
      if (errPro) return NextResponse.json({ error: errPro.message }, { status: 500 });

      // 3. Email pro
      if (proEmail) {
        const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
  <h2 style="color:#0B8C3F">Votre badge Ameli est accordé</h2>
  <p>Bonne nouvelle, votre demande de badge Conventionné Ameli pour <strong>${nomAffiche}</strong> a été validée.</p>
  <p>Le badge vert est désormais visible sur votre fiche publique :</p>
  <div style="text-align:center;margin:16px 0">
    <a href="${ficheUrl}" style="display:inline-block;background:#f0fdf4;color:#0B8C3F;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;border:1px solid #bbf7d0">${ficheUrl}</a>
  </div>
  <div style="text-align:center;margin:24px 0">
    <a href="${APP_URL}/transport-medical/pro/dashboard" style="display:inline-block;background:#0066CC;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">Accéder à mon espace pro</a>
  </div>
  <p style="font-size:13px;color:#6b7280">Besoin d'aide ? contact@roullepro.com</p>
</div>`;
        await sendEmail({
          to: proEmail,
          subject: `Badge Ameli accordé pour ${nomAffiche} — RoullePro`,
          html,
        }).catch(() => undefined);
      }
    }

    // === REJECT ===
    else if (action === "reject") {
      const motif = reason || "Justificatif non conforme";
      const { error: errReq } = await supabaseAdmin
        .from("ameli_badge_requests")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: now,
          rejection_reason: motif,
          admin_notes: adminNotes,
        })
        .eq("id", requestId);
      if (errReq) return NextResponse.json({ error: errReq.message }, { status: 500 });

      if (proEmail) {
        const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
  <h2 style="color:#b91c1c">Demande de badge Ameli refusée</h2>
  <p>Votre demande de badge Conventionné Ameli pour <strong>${nomAffiche}</strong> n'a pas pu être validée.</p>
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px;margin:16px 0">
    <div style="font-size:12px;color:#991b1b;font-weight:600;margin-bottom:4px">MOTIF</div>
    <div style="color:#7f1d1d">${motif.replace(/</g, "&lt;")}</div>
  </div>
  <p>Vous pouvez soumettre une nouvelle demande avec un justificatif conforme (attestation Ameli, contrat de conventionnement ou capture du compte ameli.fr daté).</p>
  <div style="text-align:center;margin:24px 0">
    <a href="${APP_URL}/transport-medical/pro/ameli-demande" style="display:inline-block;background:#0066CC;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">Refaire une demande</a>
  </div>
  <p style="font-size:13px;color:#6b7280">Questions ? contact@roullepro.com</p>
</div>`;
        await sendEmail({
          to: proEmail,
          subject: `Demande de badge Ameli refusée — ${nomAffiche}`,
          html,
        }).catch(() => undefined);
      }
    }

    // === NEED_INFO ===
    else if (action === "need_info") {
      const motif = reason || "Informations complémentaires requises";
      const { error: errReq } = await supabaseAdmin
        .from("ameli_badge_requests")
        .update({
          status: "need_info",
          reviewed_by: user.id,
          reviewed_at: now,
          rejection_reason: motif,
          admin_notes: adminNotes,
        })
        .eq("id", requestId);
      if (errReq) return NextResponse.json({ error: errReq.message }, { status: 500 });

      if (proEmail) {
        const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
  <h2 style="color:#b45309">Informations complémentaires requises</h2>
  <p>Pour traiter votre demande de badge Ameli pour <strong>${nomAffiche}</strong>, nous avons besoin d'éléments supplémentaires.</p>
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px;margin:16px 0">
    <div style="font-size:12px;color:#92400e;font-weight:600;margin-bottom:4px">PRÉCISION DEMANDÉE</div>
    <div style="color:#78350f">${motif.replace(/</g, "&lt;")}</div>
  </div>
  <div style="text-align:center;margin:24px 0">
    <a href="${APP_URL}/transport-medical/pro/ameli-demande" style="display:inline-block;background:#0066CC;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">Compléter ma demande</a>
  </div>
  <p style="font-size:13px;color:#6b7280">Questions ? contact@roullepro.com</p>
</div>`;
        await sendEmail({
          to: proEmail,
          subject: `Demande de badge Ameli — informations complémentaires — ${nomAffiche}`,
          html,
        }).catch(() => undefined);
      }
    }

    // === SPAM ===
    else if (action === "spam") {
      const { error: errReq } = await supabaseAdmin
        .from("ameli_badge_requests")
        .update({
          status: "spam",
          reviewed_by: user.id,
          reviewed_at: now,
          rejection_reason: reason || "Demande marquée comme spam",
          admin_notes: adminNotes,
        })
        .eq("id", requestId);
      if (errReq) return NextResponse.json({ error: errReq.message }, { status: 500 });
      // Pas d'email pour spam
    }

    // Revalidation cache (uniquement si approve modifie la fiche)
    if (action === "approve") {
      try {
        revalidatePath(ficheUrl);
        revalidatePath(`/transport-medical/${pro.ville_slug}/${categorieUrl}`);
        revalidatePath(`/transport-medical/${pro.ville_slug}`);
        revalidatePath("/transport-medical/pro/dashboard");
      } catch {}
    }

    return NextResponse.json({ ok: true, action });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
