/**
 * Durée de l'essai gratuit Pro (transport sanitaire), exprimée en jours.
 *
 * Surchargeable via la variable d'environnement STRIPE_TRIAL_JOURS.
 * Valeur par défaut (et fallback si la variable est absente ou invalide) : 7 jours.
 */
export const SANITAIRE_TRIAL_DAYS: number = (() => {
  const raw = parseInt(process.env.STRIPE_TRIAL_JOURS ?? "", 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 7;
})();
