/**
 * POST /api/garage/refuser-demande
 * Le garage refuse une demande de depot-vente (vehicule non eligible, etc.).
 * Statut passe a "demande_refusee" et le vendeur est notifie par email.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSbClient } from "@supabase/supabase-js";
import { apiError } from "@/lib/api-utils";
import { sendDepotDemandeRefusee } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  let body: { depot_id?: string; refus_raison?: string };
  try {
    body = await req.json();
  } catch {
    return apiError("POST /api/garage/refuser-demande", "Invalid JSON", 400, "Corps de requete invalide");
  }

  const { depot_id, refus_raison } = body;
  if (!depot_id || !refus_raison?.trim() || refus_raison.trim().length < 5) {
    return NextResponse.json(
      { error: "depot_id et refus_raison (min 5 caracteres) sont requis" },
      { status: 400 }
    );
  }

  try {
    const sbService = createSbClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: garage } = await sbService
      .from("garages_partenaires")
      .select("id, statut, raison_sociale, ville")
      .eq("user_id", user.id)
      .single();

    if (!garage || garage.statut !== "actif") {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    const { data: depot } = await sbService
      .from("depots")
      .select("id, statut, vendeur_id, marque, modele, annee, kilometrage")
      .eq("id", depot_id)
      .eq("garage_id", garage.id)
      .single();

    if (!depot) {
      return NextResponse.json({ error: "Depot introuvable" }, { status: 404 });
    }

    if (depot.statut !== "demande_en_attente") {
      return NextResponse.json(
        { error: "Cette demande n'est plus en attente" },
        { status: 400 }
      );
    }

    const { error: updateError } = await sbService
      .from("depots")
      .update({
        statut: "demande_refusee",
        refus_raison: refus_raison.trim(),
        refuse_at: new Date().toISOString(),
      })
      .eq("id", depot_id);

    if (updateError) {
      return apiError("POST /api/garage/refuser-demande", updateError, 500, "Erreur lors du refus");
    }

    await sbService.from("depot_events").insert({
      depot_id,
      type: "demande_refusee",
      ancien_statut: "demande_en_attente",
      nouveau_statut: "demande_refusee",
      acteur_id: user.id,
      payload: { refus_raison: refus_raison.trim() },
    });

    const { data: profile } = await sbService
      .from("profiles")
      .select("email")
      .eq("id", depot.vendeur_id)
      .single();

    const vendeurEmail = (profile as { email?: string } | null)?.email;
    if (vendeurEmail) {
      await sendDepotDemandeRefusee(vendeurEmail, depot, garage, refus_raison.trim()).catch(() => null);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError("POST /api/garage/refuser-demande", err);
  }
}
