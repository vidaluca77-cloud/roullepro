/**
 * POST /api/stripe/webhook
 * Reçoit les événements Stripe et synchronise la table subscriptions + profiles.plan.
 *
 * Setup :
 *   1. Dans le dashboard Stripe → Developers → Webhooks, créer un endpoint
 *      pointant vers https://roullepro.com/api/stripe/webhook
 *   2. Événements à écouter :
 *        - checkout.session.completed
 *        - customer.subscription.created
 *        - customer.subscription.updated
 *        - customer.subscription.deleted
 *   3. Copier la signing secret (whsec_...) dans STRIPE_WEBHOOK_SECRET
 *
 * La route exige les bytes bruts (raw body) pour vérifier la signature.
 */

import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
import { planFromPriceId, type PlanId } from '@/lib/plans';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Node runtime requis pour raw body / crypto

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** Handler paiement depot-vente reussi : cree la transaction et met a jour le depot */
async function handleDepotVenteCheckout(session: Stripe.Checkout.Session) {
  const db = admin();
  const depotId = session.metadata?.depot_id;
  if (!depotId) {
    console.error('[stripe webhook] depot-vente sans depot_id', session.id);
    return;
  }

  const piId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id;

  // Verifier qu'on n'a pas deja traite ce paiement (idempotence)
  const { data: existing } = await db
    .from('transactions_depot')
    .select('id')
    .eq('stripe_checkout_session_id', session.id)
    .maybeSingle();

  if (existing) {
    console.log('[stripe webhook] depot-vente session deja traitee:', session.id);
    return;
  }

  const montantTotalCents = session.amount_total ?? 0;
  const partVendeur = parseInt(session.metadata?.part_vendeur_cents ?? '0', 10);
  const partGarage = parseInt(session.metadata?.part_garage_cents ?? '0', 10);
  const partRp = parseInt(session.metadata?.part_roullepro_cents ?? '0', 10);
  const forfaitPrep = parseInt(session.metadata?.forfait_preparation_cents ?? '25000', 10);
  const offreId = session.metadata?.offre_id || null;
  const acheteurEmail = session.metadata?.acheteur_email
    || session.customer_details?.email
    || session.customer_email
    || '';

  await db.from('transactions_depot').insert({
    depot_id: depotId,
    offre_id: offreId,
    acheteur_email: acheteurEmail,
    montant_total_cents: montantTotalCents,
    part_vendeur_cents: partVendeur,
    part_garage_cents: partGarage,
    part_roullepro_cents: partRp,
    forfait_preparation_cents: forfaitPrep,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: piId ?? null,
    statut: 'paid',
    paye_at: new Date().toISOString(),
  });

  await db.from('depots').update({
    statut: 'vendu_paye',
    prix_final_vente: montantTotalCents / 100,
    date_vente: new Date().toISOString(),
  }).eq('id', depotId);

  await db.from('depot_events').insert({
    depot_id: depotId,
    type_event: 'paiement_acheteur_recu',
    description: `Paiement Stripe Checkout recu - ${montantTotalCents / 100} EUR - session ${session.id}`,
  });
}

/** Handler account.updated : synchronise l'etat Connect des garages partenaires */
async function handleConnectAccountUpdated(account: Stripe.Account) {
  const db = admin();
  const chargesEnabled = account.charges_enabled === true;
  const payoutsEnabled = account.payouts_enabled === true;
  const detailsSubmitted = account.details_submitted === true;
  const transfersActive = account.capabilities?.transfers === "active";

  const connectReady = chargesEnabled && payoutsEnabled && detailsSubmitted && transfersActive;

  const { error } = await db
    .from("garages_partenaires")
    .update({
      stripe_connect_ready: connectReady,
      stripe_connect_details_submitted: detailsSubmitted,
      stripe_connect_charges_enabled: chargesEnabled,
      stripe_connect_payouts_enabled: payoutsEnabled,
      stripe_connect_updated_at: new Date().toISOString(),
    })
    .eq("stripe_account_id", account.id);

  if (error) {
    console.error("[stripe webhook] account.updated sync fail", account.id, error);
  }
}

/** Handler account.application.deauthorized : garage a revoque la connexion */
async function handleConnectDeauthorized(accountId: string) {
  const db = admin();
  await db
    .from("garages_partenaires")
    .update({
      stripe_account_id: null,
      stripe_connect_ready: false,
      stripe_connect_details_submitted: false,
      stripe_connect_charges_enabled: false,
      stripe_connect_payouts_enabled: false,
      stripe_connect_deauthorized_at: new Date().toISOString(),
    })
    .eq("stripe_account_id", accountId);
}

/** Handler refund ou echec paiement depot-vente */
async function handleDepotVenteRefund(paymentIntentId: string, eventType: string) {
  const db = admin();
  const { data: tx } = await db
    .from('transactions_depot')
    .select('id, depot_id, statut')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle();
  if (!tx) return;

  const newStatut = eventType === 'charge.refunded' ? 'refunded' : 'failed';
  await db.from('transactions_depot').update({ statut: newStatut }).eq('id', tx.id);

  await db.from('depot_events').insert({
    depot_id: tx.depot_id,
    type_event: newStatut,
    description: `Evenement Stripe: ${eventType} - PI ${paymentIntentId}`,
  });
}

/** Upsert subscription + met à jour profiles.plan */
async function syncSubscription(sub: Stripe.Subscription) {
  const db = admin();
  const priceId = sub.items.data[0]?.price?.id || '';
  const planId = planFromPriceId(priceId);
  if (!planId) {
    console.warn('[stripe webhook] price_id inconnu:', priceId);
    return;
  }

  // Récupérer le user_id via metadata ou via le customer
  let userId =
    (sub.metadata?.supabase_user_id as string | undefined) ||
    null;

  if (!userId) {
    // Fallback : retrouver via stripe_customer_id
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
    const { data: profile } = await db
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();
    userId = profile?.id || null;
  }

  if (!userId) {
    console.error('[stripe webhook] user_id introuvable pour subscription', sub.id);
    return;
  }

  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

  // Stripe v22 : current_period_start/end sont sur subscription_item, plus sur subscription
  const item: any = sub.items.data[0] || {};
  const periodStart = item.current_period_start as number | undefined;
  const periodEnd = item.current_period_end as number | undefined;

  await db.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_subscription_id: sub.id,
      stripe_customer_id: customerId,
      stripe_price_id: priceId,
      plan: planId,
      status: sub.status,
      current_period_start: periodStart
        ? new Date(periodStart * 1000).toISOString()
        : null,
      current_period_end: periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null,
      cancel_at_period_end: sub.cancel_at_period_end,
      canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
    },
    { onConflict: 'stripe_subscription_id' }
  );

  // Déterminer le plan effectif à mettre sur profiles.plan
  const activeStatuses = ['active', 'trialing'];
  const effectivePlan: PlanId =
    activeStatuses.includes(sub.status) ? planId : 'free';

  await db.from('profiles').update({ plan: effectivePlan }).eq('id', userId);
}

export async function POST(request: Request) {
  // 1. Vérifier la présence du header AVANT toute init Stripe
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
  }

  // 2. Vérifier la présence des secrets (renvoie 500 explicite si mal config)
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!secret || !stripeKey) {
    console.error('[stripe webhook] config manquante', {
      hasWebhookSecret: !!secret,
      hasStripeKey: !!stripeKey,
    });
    return NextResponse.json(
      { error: 'Config serveur incomplète (env vars)' },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err: any) {
    console.error('[stripe webhook] signature invalide:', err.message);
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Cas 1 : abonnement SaaS
        if (session.mode === 'subscription' && session.subscription) {
          const subId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscription(sub);
          break;
        }

        // Cas 2 : paiement depot-vente (mode payment + metadata.type=depot_vente)
        if (session.mode === 'payment' && session.metadata?.type === 'depot_vente') {
          await handleDepotVenteCheckout(session);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscription(sub);
        break;
      }
      case 'charge.refunded':
      case 'payment_intent.payment_failed': {
        const obj = event.data.object as Stripe.Charge | Stripe.PaymentIntent;
        const piId = 'payment_intent' in obj
          ? (typeof obj.payment_intent === 'string' ? obj.payment_intent : obj.payment_intent?.id)
          : obj.id;
        if (piId) await handleDepotVenteRefund(piId, event.type);
        break;
      }
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await handleConnectAccountUpdated(account);
        break;
      }
      case 'account.application.deauthorized': {
        // L'objet est une Application ; l'account ID est dans event.account
        const accountId = event.account;
        if (accountId) await handleConnectDeauthorized(accountId);
        break;
      }
      case 'transfer.created':
      case 'transfer.updated':
      case 'transfer.reversed': {
        // Log uniquement pour l'instant - aucune table transfers cote RoullePro
        const transfer = event.data.object as Stripe.Transfer;
        console.log(`[stripe webhook] ${event.type}`, transfer.id, transfer.amount, transfer.destination);
        break;
      }
      default:
        // événement ignoré
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[stripe webhook] handler error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
