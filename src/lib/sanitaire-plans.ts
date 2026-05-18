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
