/**
 * Client Stripe côté serveur.
 * Nécessite STRIPE_SECRET_KEY dans les variables Netlify.
 */

import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY manquant dans les variables d\'environnement');
  }
  _stripe = new Stripe(key, {
    apiVersion: '2024-06-20' as any,
    typescript: true,
  });
  return _stripe;
}
