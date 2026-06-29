export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { renderValidateDecision } from "@/lib/email-templates/sanitaire";

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
      .select("id, raison_sociale, nom_commercial, ville, ville_slug, categorie, slug, claimed_by, email_public, source, free_trial_ends_at, departement")
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

      // Invalide le cache "transporteurs proches" du departement pour que la
      // fiche nouvellement verifiee remonte immediatement.
      try {
        const { revalidateTag } = await import("next/cache");
        const dept = (pro as typeof pro & { departement: string | null }).departement;
        if (dept) revalidateTag(`nearby-transporters-dept:${dept}`);
      } catch {}

      // Promouvoir le claimer en rôle 'pro' (sans rétrograder un admin)
      if (pro.claimed_by) {
        await supabaseAdmin
          .from("profiles")
          .update({ role: "pro", is_verified: true })
          .eq("id", pro.claimed_by)
          .neq("role", "admin");
      }

      if (proEmail) {
        const ficheUrl = `${APP_URL}/transport-medical/${pro.ville_slug}/${pro.categorie === "taxi_conventionne" ? "taxi-conventionne" : pro.categorie}/${pro.slug}`;
        await sendEmail({
          to: proEmail,
          ...renderValidateDecision({
            action: "approve",
            isSelfRegistered,
            nomAffiche,
            ficheUrl,
            appUrl: APP_URL,
          }),
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
        await sendEmail({
          to: proEmail,
          ...renderValidateDecision({
            action: "reject",
            isSelfRegistered: false,
            nomAffiche,
            ficheUrl: "",
            appUrl: APP_URL,
            reason: reason || "Justificatif non conforme",
          }),
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
