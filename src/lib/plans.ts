/**
 * Configuration des 3 plans d'abonnement RoullePro.
 *
 * Plans :
 *   - free     : 0€/mois    — 1 annonce active max
 *   - pro      : 19€/mois   — 5 annonces, 1 mise en avant/mois, badge Pro
 *   - premium  : 49€/mois   — illimité, 5 mises en avant/mois, badge Premium
 */

export type PlanId = 'free' | 'pro' | 'premium';

export interface PlanConfig {
  id: PlanId;
  name: string;
  priceMonthly: number; // en euros
  stripePriceId: string | null; // null pour free
  tagline: string;
  features: string[];
  limits: {
    maxActiveAnnonces: number; // -1 = illimité
    featuredPerMonth: number;
    statsLevel: 'basic' | 'detailed' | 'advanced';
    csvExport: boolean;
    logoOnProfile: boolean;
    realtimeLeads: boolean;
  };
  badge?: { label: string; className: string };
  highlight?: boolean;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    stripePriceId: null,
    tagline: 'Pour tester la plateforme',
    features: [
      '1 annonce active',
      'Messagerie intégrée',
      'Badge vendeur vérifié (après KBIS)',
      'Support email standard',
    ],
    limits: {
      maxActiveAnnonces: 1,
      featuredPerMonth: 0,
      statsLevel: 'basic',
      csvExport: false,
      logoOnProfile: false,
      realtimeLeads: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 19,
    stripePriceId: 'price_1TOLo0JQRPoIacwzusC6cZqM',
    tagline: 'Pour les vendeurs réguliers',
    features: [
      '5 annonces actives',
      '1 mise en avant par mois',
      'Badge Pro sur vos annonces et profil',
      'Statistiques détaillées de vues',
      'Support prioritaire (sous 12h)',
    ],
    limits: {
      maxActiveAnnonces: 5,
      featuredPerMonth: 1,
      statsLevel: 'detailed',
      csvExport: false,
      logoOnProfile: false,
      realtimeLeads: false,
    },
    badge: { label: 'Pro', className: 'bg-blue-100 text-blue-700 border border-blue-200' },
    highlight: true,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    priceMonthly: 49,
    stripePriceId: 'price_1TOLo4JQRPoIacwzFeeVlLd3',
    tagline: 'Pour concessionnaires et flottes',
    features: [
      'Annonces illimitées',
      '5 mises en avant par mois',
      'Badge Premium exclusif',
      'Statistiques avancées + export CSV',
      'Logo de votre entreprise sur le profil',
      'Leads en temps réel (notifications push)',
      'Support dédié (sous 2h)',
    ],
    limits: {
      maxActiveAnnonces: -1, // illimité
      featuredPerMonth: 5,
      statsLevel: 'advanced',
      csvExport: true,
      logoOnProfile: true,
      realtimeLeads: true,
    },
    badge: { label: 'Premium', className: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border border-amber-500' },
  },
};

export function getPlan(planId?: string | null): PlanConfig {
  if (planId === 'pro' || planId === 'premium') return PLANS[planId];
  return PLANS.free;
}

/** Trouve le plan depuis un stripe_price_id (pour le webhook). */
export function planFromPriceId(priceId: string): PlanId | null {
  if (priceId === PLANS.pro.stripePriceId) return 'pro';
  if (priceId === PLANS.premium.stripePriceId) return 'premium';
  return null;
}

/** Vérifie si l'utilisateur peut créer une nouvelle annonce. */
export function canCreateAnnonce(plan: PlanConfig, currentActiveCount: number): boolean {
  if (plan.limits.maxActiveAnnonces === -1) return true;
  return currentActiveCount < plan.limits.maxActiveAnnonces;
}
