/**
 * POST /api/stripe/checkout
 * Body : { plan: 'pro' | 'premium' }
 * Crée une session Stripe Checkout et redirige l'utilisateur.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
import { PLANS, type PlanId } from '@/lib/plans';
import { apiError } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://roullepro.com';

export async function POST(request: Request) {
  try {
    const ssr = await createClient();
    const { data: { user } } = await ssr.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const plan = body?.plan as PlanId;
    if (plan !== 'pro' && plan !== 'premium') {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    const priceId = PLANS[plan].stripePriceId;
    if (!priceId) {
      return NextResponse.json({ error: 'Plan non facturable' }, { status: 400 });
    }

    // Récupérer ou créer le customer Stripe
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await admin
      .from('profiles')
      .select('email, full_name, company_name, stripe_customer_id')
      .eq('id', user.id)
      .single();

    const stripe = getStripe();
    let customerId = profile?.stripe_customer_id || null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        name: profile?.company_name || profile?.full_name || undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await admin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/dashboard?checkout=success`,
      cancel_url: `${APP_URL}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan,
        },
      },
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return apiError('api/stripe/checkout', err);
  }
}
