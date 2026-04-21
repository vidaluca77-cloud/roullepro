/**
 * POST /api/depot-vente/[id]/confirmer-remise
 * Appelee par le garage ou un admin apres remise physique du vehicule a l'acheteur.
 * Declenche le transfer Stripe vers le compte Connect du garage (part garage + forfait preparation).
 * Met le depot en statut "remis_acheteur" et la transaction en "remise_confirmee" puis "splitted".
 * Le virement SEPA vers le vendeur reste manuel via marquer-vire.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSbClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";
import { apiError } from "@/lib/api-utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const depotId = params.id;

  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const sbService = createSbClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verification role
    const { data: profile } = await sbService
      .from("profiles")
      .select("email, role")
      .eq("id", user.id)
      .single();

    const { data: depot, error: depotErr } = await sbService
      .from("depots")
      .select("id, statut, garage_id")
      .eq("id", depotId)
      .single();
    if (depotErr || !depot) {
      return NextResponse.json({ error: "Depot introuvable" }, { status: 404 });
    }

    const { data: garage, error: garageErr } = await sbService
      .from("garages_partenaires")
      .select("id, contact_email, stripe_account_id, ville")
      .eq("id", depot.garage_id)
      .single();
    if (garageErr || !garage) {
      return NextResponse.json({ error: "Garage introuvable" }, { status: 404 });
    }

    const isAdmin = profile?.role === "admin";
    const isGarageContact =
      garage.contact_email?.toLowerCase() === profile?.email?.toLowerCase();
    if (!isAdmin && !isGarageContact) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    if (!garage.stripe_account_id) {
      return NextResponse.json(
        { error: "Le garage n'a pas de compte Stripe Connect configure. Contactez l'admin RoullePro." },
        { status: 400 }
      );
    }

    // Derniere transaction payee pour ce depot
    const { data: tx, error: txErr } = await sbService
      .from("transactions_depot")
      .select("*")
      .eq("depot_id", depotId)
      .in("statut", ["paid", "remise_confirmee"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (txErr || !tx) {
      return NextResponse.json(
        { error: "Aucun paiement valide trouve pour ce depot" },
        { status: 400 }
      );
    }

    if (tx.statut === "splitted" || tx.stripe_transfer_garage_id) {
      return NextResponse.json({ error: "Remise deja confirmee, transfer deja effectue" }, { status: 400 });
    }

    const stripe = getStripe();

    // 1. Marquer la remise confirmee
    await sbService
      .from("transactions_depot")
      .update({
        statut: "remise_confirmee",
        remise_confirmee_at: new Date().toISOString(),
      })
      .eq("id", tx.id);

    // 2. Creer un Transfer vers le compte Connect du garage (part garage + forfait prep)
    // En mode test Stripe : les transferts fonctionnent uniquement entre comptes test.
    const totalGarageCents = Number(tx.part_garage_cents);

    let transferId: string | null = null;
    try {
      const transfer = await stripe.transfers.create({
        amount: totalGarageCents,
        currency: "eur",
        destination: garage.stripe_account_id,
        description: `RoullePro depot-vente ${depotId.substring(0, 8)} - part garage`,
        metadata: {
          depot_id: depotId,
          transaction_id: tx.id,
        },
      });
      transferId = transfer.id;
    } catch (transferErr) {
      const msg = transferErr instanceof Error ? transferErr.message : "Erreur transfer Stripe";
      console.error("[confirmer-remise] transfer error:", msg);
      return NextResponse.json(
        { error: `Transfer Stripe echoue : ${msg}. La remise reste enregistree, un admin peut reessayer.` },
        { status: 500 }
      );
    }

    // 3. Mettre a jour la transaction et le depot
    await sbService
      .from("transactions_depot")
      .update({
        statut: "splitted",
        stripe_transfer_garage_id: transferId,
        splitted_at: new Date().toISOString(),
      })
      .eq("id", tx.id);

    await sbService
      .from("depots")
      .update({ statut: "remis_acheteur" })
      .eq("id", depotId);

    await sbService.from("depot_events").insert({
      depot_id: depotId,
      type_event: "remise_confirmee",
      description: `Remise confirmee. Transfer garage ${totalGarageCents / 100} EUR -> ${transferId}`,
      created_by: user.id,
    });

    return NextResponse.json({
      ok: true,
      transfer_id: transferId,
      part_garage_cents: totalGarageCents,
      part_vendeur_cents: Number(tx.part_vendeur_cents),
      message:
        "Remise confirmee. Le garage a ete paye. Le virement SEPA vers le vendeur doit etre declenche manuellement par un admin RoullePro.",
    });
  } catch (err) {
    return apiError("POST /api/depot-vente/[id]/confirmer-remise", err);
  }
}
