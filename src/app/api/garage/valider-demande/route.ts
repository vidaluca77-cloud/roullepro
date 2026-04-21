/**
 * POST /api/garage/valider-demande
 * Le garage valide une demande de depot-vente en cours en fixant le prix de vente.
 * Le depot passe de "demande_en_attente" a "rdv_pris" (pret a accueillir le vehicule).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSbClient } from "@supabase/supabase-js";
import { apiError } from "@/lib/api-utils";
import { sendDepotDemandeValidee } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  let body: {
    depot_id?: string;
    prix_valide?: number;
    commission_garage_pct?: number;
    frais_preparation?: number;
    note_garage?: string;
  };
  try {
    body = await req.json();
  } catch {
    return apiError("POST /api/garage/valider-demande", "Invalid JSON", 400, "Corps de requete invalide");
  }

  const { depot_id, prix_valide, commission_garage_pct, frais_preparation, note_garage } = body;

  if (!depot_id || !prix_valide || Number(prix_valide) <= 0) {
    return NextResponse.json(
      { error: "depot_id et prix_valide (> 0) sont requis" },
      { status: 400 }
    );
  }

  const prixNum = Number(prix_valide);
  if (prixNum < 500 || prixNum > 250000) {
    return NextResponse.json(
      { error: "Le prix doit etre compris entre 500 et 250000 euros" },
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
      .select("id, statut, raison_sociale, contact_email, ville")
      .eq("user_id", user.id)
      .single();

    if (!garage || garage.statut !== "actif") {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    const { data: depot } = await sbService
      .from("depots")
      .select("id, statut, vendeur_id, marque, modele, annee, kilometrage, prix_propose_vendeur")
      .eq("id", depot_id)
      .eq("garage_id", garage.id)
      .single();

    if (!depot) {
      return NextResponse.json({ error: "Depot introuvable" }, { status: 404 });
    }

    if (depot.statut !== "demande_en_attente") {
      return NextResponse.json(
        { error: "Cette demande n'est plus en attente de validation" },
        { status: 400 }
      );
    }

    // Calcul des parts (88 / 7 / 4 / 1 par defaut + forfait prep)
    const commissionGarage = commission_garage_pct !== undefined
      ? Math.max(0, Math.min(20, Number(commission_garage_pct)))
      : 7;
    const forfaitPrep = frais_preparation !== undefined
      ? Math.max(0, Math.min(2000, Number(frais_preparation)))
      : 250;

    // Prix net vendeur prévisionnel : prix - 4% RP - 7% garage - forfait prep
    const partRp = prixNum * 0.04;
    const partGarage = prixNum * (commissionGarage / 100) + forfaitPrep;
    const prixVendeurNet = Math.round((prixNum - partRp - partGarage) * 100) / 100;

    if (prixVendeurNet <= 0) {
      return NextResponse.json(
        { error: "Configuration invalide : prix net vendeur serait negatif" },
        { status: 400 }
      );
    }

    // Date limite = 90 jours apres validation
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + 90);

    const { error: updateError } = await sbService
      .from("depots")
      .update({
        statut: "rdv_pris",
        prix_valide_garage: prixNum,
        prix_affiche: prixNum,
        prix_vendeur_net: prixVendeurNet,
        commission_garage_pct: commissionGarage,
        frais_preparation: forfaitPrep,
        validee_at: new Date().toISOString(),
        date_limite: dateLimit.toISOString(),
      })
      .eq("id", depot_id);

    if (updateError) {
      return apiError("POST /api/garage/valider-demande", updateError, 500, "Erreur lors de la validation");
    }

    await sbService.from("depot_events").insert({
      depot_id,
      type: "demande_validee",
      ancien_statut: "demande_en_attente",
      nouveau_statut: "rdv_pris",
      acteur_id: user.id,
      payload: {
        prix_valide: prixNum,
        prix_vendeur_net: prixVendeurNet,
        commission_garage_pct: commissionGarage,
        frais_preparation: forfaitPrep,
        prix_propose_vendeur: depot.prix_propose_vendeur ?? null,
        note_garage: note_garage ?? null,
      },
    });

    // Email au vendeur
    const { data: profile } = await sbService
      .from("profiles")
      .select("email")
      .eq("id", depot.vendeur_id)
      .single();

    const vendeurEmail = (profile as { email?: string } | null)?.email;
    if (vendeurEmail) {
      await sendDepotDemandeValidee(vendeurEmail, depot, {
        ...garage,
        prix_valide: prixNum,
        prix_vendeur_net: prixVendeurNet,
        note_garage: note_garage ?? null,
      }).catch(() => null);
    }

    return NextResponse.json({
      ok: true,
      prix_valide: prixNum,
      prix_vendeur_net: prixVendeurNet,
    });
  } catch (err) {
    return apiError("POST /api/garage/valider-demande", err);
  }
}
