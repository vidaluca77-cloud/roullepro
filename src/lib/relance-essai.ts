/**
 * Logique pure des relances automatiques de fin d'essai / d'offre gratuite.
 *
 * Un pro sanitaire « claimed » bénéficie d'une période offerte (50 premiers = 6 mois,
 * 50 suivants = 2 mois, puis essai 7 jours). La fin de cette période est portée par
 * COALESCE(free_trial_ends_at, plan_active_until). On relance par email à J-7, J-3 et
 * J-1 avant l'échéance, comparaison faite en DATE CALENDAIRE Europe/Paris (et non en
 * heures glissantes), pour que « dans 3 jours » corresponde bien à 3 jours de calendrier.
 *
 * Deux variantes de ton selon la présence d'une carte enregistrée (stripe_subscription_id) :
 *  - « informatif » : la bascule vers l'abonnement Pro est automatique, rien à faire.
 *  - « conversion » : la période offerte s'arrête, il faut passer au plan Pro pour continuer.
 *
 * Ce module ne fait AUCUN accès réseau/DB : il est intégralement testable.
 */

export type TypeRelance = "J7" | "J3" | "J1";

/** Nombre de jours calendaires avant l'échéance pour chaque relance. */
export const FENETRES_RELANCE: Record<TypeRelance, number> = {
  J7: 7,
  J3: 3,
  J1: 1,
};

/** Variante de ton de l'email. */
export type VarianteRelance = "informatif" | "conversion";

/** Champs d'une fiche pro nécessaires à la sélection et au choix du template. */
export type ProRelance = {
  id: string;
  claimed: boolean | null;
  free_trial_ends_at: string | null;
  plan_active_until: string | null;
  stripe_subscription_id: string | null;
};

export type RelanceSelection = {
  type: TypeRelance;
  /** Date calendaire (Europe/Paris) de l'échéance, format YYYY-MM-DD. Clé d'idempotence. */
  echeanceDate: string;
  /** Jours calendaires restants avant l'échéance (7, 3 ou 1). */
  joursRestants: number;
};

/**
 * Échéance de fin d'offre : free_trial_ends_at prioritaire, sinon plan_active_until.
 * Retourne l'ISO string ou null si aucune des deux n'est renseignée / valide.
 */
export function calculerEcheance(pro: ProRelance): string | null {
  const brut = pro.free_trial_ends_at ?? pro.plan_active_until;
  if (!brut) return null;
  const t = new Date(brut).getTime();
  if (Number.isNaN(t)) return null;
  return brut;
}

/**
 * Date calendaire Europe/Paris d'un instant donné, au format YYYY-MM-DD.
 * Utilise Intl (dispo nativement dans Node) — pas de dépendance timezone externe.
 */
export function dateCalendaireParis(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  // en-CA formate en YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function ymdEnJoursUTC(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/**
 * Nombre de jours calendaires (Europe/Paris) entre maintenant et l'échéance.
 * Positif si l'échéance est dans le futur, 0 le jour même, négatif si passée.
 */
export function joursCalendairesParis(echeanceIso: string, now: Date): number {
  return (
    ymdEnJoursUTC(dateCalendaireParis(echeanceIso)) -
    ymdEnJoursUTC(dateCalendaireParis(now))
  );
}

/**
 * Détermine la relance à envoyer aujourd'hui pour un pro, ou null si aucune.
 *
 * Conditions : fiche claimed, échéance renseignée, et jours calendaires restants
 * strictement égaux à 7, 3 ou 1. L'idempotence (ne pas renvoyer deux fois la même
 * relance) est gérée en amont via la table relances_essai.
 */
export function selectionnerRelance(params: {
  pro: ProRelance;
  now: Date;
}): RelanceSelection | null {
  const { pro, now } = params;
  if (!pro.claimed) return null;

  const echeance = calculerEcheance(pro);
  if (!echeance) return null;

  const restants = joursCalendairesParis(echeance, now);

  const type = (Object.keys(FENETRES_RELANCE) as TypeRelance[]).find(
    (t) => FENETRES_RELANCE[t] === restants
  );
  if (!type) return null;

  return {
    type,
    echeanceDate: dateCalendaireParis(echeance),
    joursRestants: restants,
  };
}

/**
 * Choix du ton de l'email :
 *  - carte enregistrée (stripe_subscription_id présent) → « informatif » (bascule auto).
 *  - sinon → « conversion » (il faut souscrire pour continuer).
 */
export function choisirVariante(pro: ProRelance): VarianteRelance {
  return pro.stripe_subscription_id ? "informatif" : "conversion";
}
