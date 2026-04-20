/**
 * POST /api/stripe/portal
 * Redirige vers le portail client Stripe pour gérer l'abonnement
 * (changer de plan, mettre à jour la carte, annuler, télécharger les factures).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
import { apiError } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://roullepro.com';

export async function POST() {
  try {
    const ssr = await createClient();
    const { data: { user } } = await ssr.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Aucun abonnement actif — souscrivez d\'abord à un plan.' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return apiError('api/stripe/portal', err);
  }
}
