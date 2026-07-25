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
 * Champs portant la fin de la période offerte. Les trois colonnes coexistent selon
 * l'origine de l'offre :
 *  - `free_trial_ends_at` : offres à la souscription (inscription, 6 mois des 50
 *    premiers, 2 mois des 50 suivants) — la fiche reste `plan = 'gratuit'` ;
 *  - `plan_active_until`  : fin de période payée, posée par le webhook Stripe ;
 *  - `plan_expires_at`    : essais automatiques 7 jours (cf. sanitaire-auto-trial.ts),
 *    seule colonne renseignée pour ceux-là.
 */
export type ProEcheanceFields = {
  free_trial_ends_at?: string | null;
  plan_active_until?: string | null;
  plan_expires_at?: string | null;
};

/**
 * Fin de la période offerte / payée d'un pro, ou null si aucune des trois colonnes
 * n'est renseignée (offre sans échéance connue).
 *
 * Source de vérité unique : `relance-essai.calculerEcheance` délègue ici, pour que
 * les emails de relance et le contrôle d'accès ne puissent pas diverger.
 */
export function echeanceOffre(pro: ProEcheanceFields): string | null {
  const brut = pro.free_trial_ends_at ?? pro.plan_active_until ?? pro.plan_expires_at;
  if (!brut) return null;
  if (Number.isNaN(new Date(brut).getTime())) return null;
  return brut;
}

/**
 * Abonnement Stripe réellement actif. Le webhook remet `plan = 'gratuit'` à la
 * résiliation tout en conservant `stripe_subscription_id` : la seule présence de
 * l'identifiant ne suffit donc pas, il faut aussi un plan payant.
 */
export function abonnementActif(
  pro: (ProAcceptationFields & ProEcheanceFields) | null | undefined
): boolean {
  return !!pro && !!pro.stripe_subscription_id && isPaidPlan(pro.plan);
}

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

/**
 * Détermine si un pro a le droit d'utiliser le Studio réseaux sociaux IA.
 *
 * Règle métier : le Studio est ouvert à TOUS les pros réclamés, SAUF ceux dont la
 * période offerte est terminée et qui n'ont pas d'abonnement actif.
 *
 * Vrai si :
 *  - abonnement Stripe actif (plan payant + subscription id) ;
 *  - OU période offerte non terminée, quelle que soit la colonne qui la porte
 *    (cf. echeanceOffre) et quelle que soit la valeur de `plan` ;
 *  - OU aucune échéance connue — une offre sans date n'est pas « terminée ».
 * Faux uniquement si : échéance dépassée et pas d'abonnement actif.
 *
 * NE PAS remplacer par peutAccepterCourses : celui-ci exige `isPaidPlan(plan)` et
 * ne lit que `plan_expires_at`, ce qui excluait les offres longues (6 mois / 2 mois)
 * portées par `free_trial_ends_at` sur une fiche restée `plan = 'gratuit'`.
 */
export function peutUtiliserStudioSocial(
  pro: (ProAcceptationFields & ProEcheanceFields) | null | undefined,
  now: number = Date.now()
): boolean {
  if (!pro) return false;
  if (abonnementActif(pro)) return true;
  const echeance = echeanceOffre(pro);
  if (!echeance) return true;
  return new Date(echeance).getTime() > now;
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
