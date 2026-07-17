/**
 * Helpers de gate plan pour le module transport sanitaire (pros_sanitaire.plan).
 *
 * IMPORTANT : ne pas confondre avec src/lib/plans.ts qui concerne le module
 * marketplace véhicules pros (annonces). Les deux référentiels coexistent.
 *
 * Plans côté pros_sanitaire :
 *  - gratuit  : pas de fonctions premium
 *  - essential : Pro 19,90 €/mois — débloque la messagerie patient
 *  - premium  : Premium 49 €/mois (badge premium dans les listings)
 *  - pro_plus : Pro Plus (offres ultérieures)
 *  - pro      : alias historique (compat ascendante)
 */

export const PAID_PLANS = [
  "essential",
  "premium",
  "pro_plus",
  "pro",
] as const;

export type PaidPlan = (typeof PAID_PLANS)[number];
export type SanitairePlan = "gratuit" | PaidPlan;

export function isPaidPlan(plan: string | null | undefined): boolean {
  if (!plan) return false;
  return (PAID_PLANS as readonly string[]).includes(plan);
}

/** Champs minimaux d'une fiche pro nécessaires au contrôle d'accès aux courses. */
export type ProAcceptationFields = {
  plan: string | null | undefined;
  plan_expires_at?: string | null;
  stripe_subscription_id?: string | null;
};

/**
 * Détermine si un pro a le droit d'ACCEPTER une course.
 *
 * Contrairement à isPaidPlan (qui ne regarde que la chaîne `plan`), ce helper
 * est TEMPOREL : il refuse un essai « essential » dont la date d'expiration est
 * dépassée, même si le cron de rétrogradation en 'gratuit' n'est pas encore passé.
 *
 * Vrai si :
 *  - plan payant réel avec abonnement Stripe actif (stripe_subscription_id présent,
 *    plan_expires_at peut être nul) ;
 *  - OU essai en cours : plan payant ET plan_expires_at dans le futur.
 * Faux si : plan 'gratuit' (ou vide), ou essai expiré.
 */
export function peutAccepterCourses(
  pro: ProAcceptationFields | null | undefined,
  now: number = Date.now()
): boolean {
  if (!pro || !isPaidPlan(pro.plan)) return false;
  // Abonné Stripe actif : plan payant confirmé, plan_expires_at éventuellement nul.
  if (pro.stripe_subscription_id) return true;
  // Sinon (essai auto/offert) : l'accès dépend de la date d'expiration.
  if (!pro.plan_expires_at) return false;
  const expires = new Date(pro.plan_expires_at).getTime();
  if (Number.isNaN(expires)) return false;
  return expires > now;
}

export function getPlanLabel(plan: string | null | undefined): string {
  switch (plan) {
    case "essential":
      return "Pro";
    case "premium":
      return "Premium";
    case "pro_plus":
      return "Pro Plus";
    case "pro":
      return "Pro";
    case "gratuit":
    case "":
    case null:
    case undefined:
      return "Gratuit";
    default:
      return String(plan);
  }
}
