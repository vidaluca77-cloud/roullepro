/**
 * POST /api/depot-vente/[id]/checkout
 * L'acheteur paie le prix du vehicule via Stripe Checkout.
 * Les fonds arrivent sur le compte Stripe principal RoullePro (escrow implicite).
 * Le split vers le garage Connect et le virement SEPA vers le vendeur ne sont
 * declenches qu'apres confirmation de remise physique du vehicule.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient as createSbClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";
import { apiError } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: { id: string } };

export async function POST(req: NextRequest, { params }: RouteParams) {
  const depotId = params.id;
  const ip = getClientIp(req);
  const { ok } = checkRateLimit(`depot-checkout:${ip}`, 5, 60 * 60 * 1000);
  if (!ok) {
    return NextResponse.json({ error: "Trop de tentatives, reessayez plus tard" }, { status: 429 });
  }

  let body: { acheteur_email?: string; acheteur_telephone?: string; offre_id?: string };
  try {
    body = await req.json();
  } catch {
    return apiError("POST /api/depot-vente/[id]/checkout", "Invalid JSON", 400, "Corps de requete invalide");
  }

  const acheteurEmail = body.acheteur_email?.toLowerCase().trim();
  if (!acheteurEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(acheteurEmail)) {
    return NextResponse.json({ error: "Email acheteur invalide" }, { status: 400 });
  }

  try {
    const sb = createSbClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Recuperation du depot + garage
    const { data: depot, error: depotErr } = await sb
      .from("depots")
      .select("id, statut, marque, modele, annee, kilometrage, prix_affiche, prix_vendeur_net, commission_rp_pct, commission_garage_pct, frais_preparation, garage_id")
      .eq("id", depotId)
      .single();

    if (depotErr || !depot) {
      return NextResponse.json({ error: "Depot introuvable" }, { status: 404 });
    }

    if (!["en_vente", "offre_acceptee"].includes(depot.statut)) {
      return NextResponse.json(
        { error: "Ce vehicule n'est pas disponible a l'achat actuellement" },
        { status: 400 }
      );
    }

    const prixAffiche = Number(depot.prix_affiche ?? 0);
    if (prixAffiche <= 0) {
      return NextResponse.json({ error: "Prix du vehicule non defini" }, { status: 400 });
    }

    // Calcul des parts (en centimes)
    const montantTotalCents = Math.round(prixAffiche * 100);
    const rpPct = Number(depot.commission_rp_pct ?? 4);
    const garagePct = Number(depot.commission_garage_pct ?? 7);
    const forfaitPrepCents = Math.round(Number(depot.frais_preparation ?? 250) * 100);
    const partRoulleproCents = Math.round(montantTotalCents * rpPct / 100);
    const partGarageCents = Math.round(montantTotalCents * garagePct / 100) + forfaitPrepCents;
    const partVendeurCents = montantTotalCents - partRoulleproCents - partGarageCents;

    if (partVendeurCents <= 0) {
      return NextResponse.json({ error: "Configuration des commissions invalide" }, { status: 400 });
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

    const titre = `${depot.marque ?? ""} ${depot.modele ?? ""}`.trim() || "Vehicule professionnel";
    const description = [
      depot.annee ? `Annee ${depot.annee}` : null,
      depot.kilometrage ? `${Number(depot.kilometrage).toLocaleString("fr-FR")} km` : null,
      "Vente via RoullePro - Paiement securise",
    ].filter(Boolean).join(" | ");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: acheteurEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: montantTotalCents,
            product_data: {
              name: titre,
              description,
            },
          },
        },
      ],
      metadata: {
        type: "depot_vente",
        depot_id: depotId,
        offre_id: body.offre_id ?? "",
        acheteur_email: acheteurEmail,
        acheteur_telephone: body.acheteur_telephone ?? "",
        part_vendeur_cents: String(partVendeurCents),
        part_garage_cents: String(partGarageCents),
        part_roullepro_cents: String(partRoulleproCents),
        forfait_preparation_cents: String(forfaitPrepCents),
      },
      success_url: `${baseUrl}/depot-vente/garages/${depot.garage_id}/achat-confirme?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/depot-vente/garages/${depot.garage_id}`,
      payment_intent_data: {
        description: `RoullePro depot-vente ${titre} - depot ${depotId.substring(0, 8)}`,
        metadata: {
          type: "depot_vente",
          depot_id: depotId,
        },
      },
    });

    return NextResponse.json({ url: session.url, session_id: session.id });
  } catch (err) {
    return apiError("POST /api/depot-vente/[id]/checkout", err);
  }
}
