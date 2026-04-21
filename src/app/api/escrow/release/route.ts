export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";
import { notifyUser } from "@/lib/notify";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * POST /api/escrow/release
 * Body: { tx_id: string }
 * Appelé par l'acheteur UNIQUEMENT pour confirmer la livraison/réception.
 * Déclenche le transfer vers le vendeur (et optionnellement le garage).
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await request.json();
    const txId = body?.tx_id;
    if (!txId) return NextResponse.json({ error: "tx_id requis" }, { status: 400 });

    const admin = getAdmin();
    const { data: tx, error } = await admin
      .from("escrow_transactions")
      .select("*, annonces(title, user_id, profiles!inner(stripe_account_id))")
      .eq("id", txId)
      .single();

    if (error || !tx) return NextResponse.json({ error: "Transaction introuvable" }, { status: 404 });
    if (tx.buyer_id !== user.id) return NextResponse.json({ error: "Seul l'acheteur peut libérer les fonds" }, { status: 403 });
    if (tx.status !== "held") return NextResponse.json({ error: `Transaction en statut ${tx.status} — ne peut être libérée` }, { status: 400 });

    const seller: any = Array.isArray(tx.annonces?.profiles) ? tx.annonces.profiles[0] : tx.annonces?.profiles;
    const sellerAccountId = seller?.stripe_account_id;
    if (!sellerAccountId) return NextResponse.json({ error: "Compte Stripe vendeur introuvable" }, { status: 400 });

    const stripe = getStripe();

    // Transfer vers le vendeur
    const transfer = await stripe.transfers.create({
      amount: tx.amount_seller,
      currency: tx.currency,
      destination: sellerAccountId,
      transfer_group: tx.transfer_group,
      metadata: { escrow_tx_id: tx.id, role: "seller" },
    });

    // Mise à jour transaction
    await admin
      .from("escrow_transactions")
      .update({
        status: "released",
        released_at: new Date().toISOString(),
        transfer_to_seller_id: transfer.id,
      })
      .eq("id", tx.id);

    // Marquer annonce vendue
    if (tx.annonce_id) {
      await admin.from("annonces").update({ status: "sold" }).eq("id", tx.annonce_id);
    }

    // Push vendeur
    if (tx.seller_id) {
      notifyUser(tx.seller_id, {
        title: "Fonds libérés",
        body: `Vous avez reçu ${(tx.amount_seller / 100).toFixed(2)} € pour ${tx.annonces?.title || "votre véhicule"}`,
        url: `/dashboard/transactions/${tx.id}`,
        tag: `escrow-${tx.id}`,
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, transfer_id: transfer.id });
  } catch (e: any) {
    console.error("[escrow/release]", e?.message);
    return NextResponse.json({ error: e?.message || "Erreur interne" }, { status: 500 });
  }
}
