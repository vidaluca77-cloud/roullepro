export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { normaliserTelephoneFr } from "@/lib/sms";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function PATCH(req: Request) {
  try {
    const supabaseUser = await createServerClient();
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json();
    const { pro_id, ...fields } = body;
    if (!pro_id) return NextResponse.json({ error: "pro_id requis" }, { status: 400 });

    const supabaseAdmin = getAdminClient();
    // Vérifie ownership + récupère les infos nécessaires pour revalidation
    const { data: pro } = await supabaseAdmin
      .from("pros_sanitaire")
      .select("claimed_by, slug, ville_slug, categorie")
      .eq("id", pro_id)
      .maybeSingle();
    if (!pro || pro.claimed_by !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const allowed: Record<string, unknown> = {};
    const allowedKeys = [
      "nom_commercial",
      "telephone_public",
      "email_public",
      "site_web",
      "adresse",
      "description",
      "services",
      "horaires",
      "photos",
      "logo_url",
      "video_url",
      // Champs ADS (taxis conventionnes uniquement, art. L.3121-1 Code des transports)
      "numero_ads",
      "commune_ads",
      "commune_ads_slug",
      "zupc_communes",
      // Notifications SMS (phase 1)
      "sms_notifications",
      "telephone_sms",
    ];
    for (const k of allowedKeys) {
      if (k in fields) allowed[k] = fields[k];
    }

    // Notifications SMS : normalisation serveur du numero (E.164) + coherence.
    if ("sms_notifications" in allowed) {
      allowed.sms_notifications = allowed.sms_notifications === true;
    }
    if ("telephone_sms" in allowed) {
      const brut = allowed.telephone_sms;
      if (brut == null || String(brut).trim() === "") {
        allowed.telephone_sms = null;
      } else {
        const numero = normaliserTelephoneFr(String(brut));
        if (!numero) {
          return NextResponse.json(
            { error: "Numero de mobile SMS invalide" },
            { status: 400 }
          );
        }
        allowed.telephone_sms = numero;
      }
    }
    // Un opt-in SMS sans numero valide est incoherent : on refuse.
    if (allowed.sms_notifications === true && !allowed.telephone_sms) {
      return NextResponse.json(
        { error: "Un numero de mobile est requis pour activer les SMS" },
        { status: 400 }
      );
    }

    // Reserve les champs ADS aux taxis conventionnes : un ambulancier/VSL ne peut pas saisir d ADS.
    if (pro.categorie !== "taxi_conventionne") {
      delete allowed.numero_ads;
      delete allowed.commune_ads;
      delete allowed.commune_ads_slug;
      delete allowed.zupc_communes;
    }

    // Auto-derive le slug commune ADS si la commune est saisie sans slug explicite
    if (typeof allowed.commune_ads === "string" && !("commune_ads_slug" in allowed)) {
      const v = allowed.commune_ads as string;
      allowed.commune_ads_slug = v
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || null;
    }

    const { error } = await supabaseAdmin.from("pros_sanitaire").update(allowed).eq("id", pro_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Invalide le cache des pages publiques impactées
    const categorieUrl = pro.categorie === "taxi_conventionne" ? "taxi-conventionne" : pro.categorie;
    try {
      revalidatePath(`/transport-medical/${pro.ville_slug}/${categorieUrl}/${pro.slug}`);
      revalidatePath(`/transport-medical/${pro.ville_slug}/${categorieUrl}`);
      revalidatePath(`/transport-medical/${pro.ville_slug}`);
      revalidatePath("/transport-medical");
    } catch {}

    // Ping IndexNow immediat (fire-and-forget, prod uniquement)
    try {
      const { pingIndexNow, buildFicheUrl } = await import("@/lib/indexnow");
      const ficheUrl = buildFicheUrl({
        ville_slug: pro.ville_slug,
        categorie: pro.categorie,
        slug: pro.slug,
      });
      if (ficheUrl) void pingIndexNow([ficheUrl]);
    } catch (err) {
      console.warn(
        "[fiche update] indexnow error:",
        err instanceof Error ? err.message : err
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
