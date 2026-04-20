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
        if (session.mode === 'subscription' && session.subscription) {
          const subId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscription(sub);
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
