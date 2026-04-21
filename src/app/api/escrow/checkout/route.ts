export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * POST /api/escrow/checkout
 * Body: { annonce_id: string }
 * L'acheteur (user authentifié) crée une session Checkout. Le paiement est
 * capturé sur le compte RoullePro. Les fonds seront transférés au vendeur
 * (et éventuellement au garage) après confirmation de livraison.
 *
 * Commission RoullePro : 3 % (min 20 €). Garage : 0 à 5 % selon cas (optionnel).
 */
const COMMISSION_RATE = 0.03;
const COMMISSION_MIN_CENTS = 2000;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Vous devez être connecté pour acheter" }, { status: 401 });

    const body = await request.json();
    const annonceId = body?.annonce_id;
    if (!annonceId) return NextResponse.json({ error: "annonce_id requis" }, { status: 400 });

    const admin = getAdmin();

    // Récupérer annonce + vendeur
    const { data: annonce, error: annErr } = await admin
      .from("annonces")
      .select("id, title, price, status, user_id, profiles!inner(id, email, stripe_account_id, stripe_connect_ready)")
      .eq("id", annonceId)
      .single();

    if (annErr || !annonce) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    if (annonce.status !== "active") return NextResponse.json({ error: "Annonce non disponible" }, { status: 400 });
    if (annonce.user_id === user.id) return NextResponse.json({ error: "Vous ne pouvez pas acheter votre propre annonce" }, { status: 400 });

    const priceEuros = Number(annonce.price);
    if (!priceEuros || priceEuros <= 0) return NextResponse.json({ error: "Prix invalide" }, { status: 400 });

    const seller: any = Array.isArray(annonce.profiles) ? annonce.profiles[0] : annonce.profiles;
    if (!seller?.stripe_account_id || !seller?.stripe_connect_ready) {
      return NextResponse.json(
        { error: "Le vendeur n'a pas encore activé le paiement sécurisé. Contactez-le via messagerie." },
        { status: 400 }
      );
    }

    const amountTotal = Math.round(priceEuros * 100);
    const commission = Math.max(Math.round(amountTotal * COMMISSION_RATE), COMMISSION_MIN_CENTS);
    const amountSeller = amountTotal - commission;

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

    // Créer la transaction côté DB d'abord pour avoir un ID
    const { data: tx, error: txErr } = await admin
      .from("escrow_transactions")
      .insert({
        annonce_id: annonceId,
        buyer_id: user.id,
        seller_id: annonce.user_id,
        amount_total: amountTotal,
        amount_seller: amountSeller,
        amount_platform: commission,
        currency: "eur",
        status: "pending",
      })
      .select()
      .single();

    if (txErr || !tx) {
      console.error("[escrow/checkout] db insert:", txErr?.message);
      return NextResponse.json({ error: "Erreur création transaction" }, { status: 500 });
    }

    const transferGroup = `escrow_${tx.id}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${annonce.title} — Paiement sécurisé RoullePro`,
              description: "Fonds séquestrés, libérés après confirmation de livraison",
            },
            unit_amount: amountTotal,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        transfer_group: transferGroup,
        metadata: {
          escrow_tx_id: tx.id,
          annonce_id: annonceId,
          buyer_id: user.id,
          seller_id: annonce.user_id,
        },
      },
      metadata: {
        escrow_tx_id: tx.id,
      },
      success_url: `${appUrl}/dashboard/transactions/${tx.id}?paid=1`,
      cancel_url: `${appUrl}/annonces/${annonceId}?cancelled=1`,
    });

    await admin
      .from("escrow_transactions")
      .update({ checkout_session_id: session.id, transfer_group: transferGroup })
      .eq("id", tx.id);

    return NextResponse.json({ url: session.url, session_id: session.id, tx_id: tx.id });
  } catch (e: any) {
    console.error("[escrow/checkout]", e?.message);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
