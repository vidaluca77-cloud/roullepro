"use client";

/**
 * Composant partage de saisie date + heure d'une course, utilise par tous les
 * formulaires de demande de transport (home, widget, fiche etablissement,
 * fiche pro).
 *
 * Objectifs (cf. audit formulaires §5) :
 *  - date ET heure obligatoires (fini le `type=date` sans heure) ;
 *  - pas de 15 min (step=900) ;
 *  - `min` = maintenant + 30 min, `max` = +6 mois ;
 *  - message d'erreur clair en francais si la date est passee / hors bornes.
 *
 * La valeur exposee au parent est la chaine `datetime-local` locale
 * ("YYYY-MM-DDTHH:mm"). Le parent la convertit en ISO avec offset via
 * `toISODateSouhaitee` juste avant l'envoi API.
 */

import { useMemo } from "react";

/** Marge minimale avant la premiere course reservable (en minutes). */
const MARGE_MIN_MINUTES = 30;
/** Horizon maximal de reservation (en mois). */
const HORIZON_MAX_MOIS = 6;

/** Formate une Date en chaine locale "YYYY-MM-DDTHH:mm" pour un input datetime-local. */
function formatLocalInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/**
 * Convertit la chaine `datetime-local` locale saisie en ISO (avec offset du
 * fuseau du navigateur, typiquement Europe/Paris pour la cible). Renvoie null si
 * vide ou invalide. Tue le decalage TZ a l'affichage cote pro.
 */
export function toISODateSouhaitee(local: string | null | undefined): string | null {
  if (!local) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

type Props = {
  /** Chaine datetime-local ("YYYY-MM-DDTHH:mm"). */
  value: string;
  onChange: (local: string) => void;
  required?: boolean;
  label?: string;
  id?: string;
  inputClassName?: string;
  labelClassName?: string;
};

export default function DateHeureCourse({
  value,
  onChange,
  required = true,
  label = "Date et heure souhaitées",
  id = "date-heure-course",
  inputClassName,
  labelClassName,
}: Props) {
  // Bornes recalculees a chaque rendu (memo pour stabilite dans un cycle).
  const { min, max } = useMemo(() => {
    const now = new Date();
    const minDate = new Date(now.getTime() + MARGE_MIN_MINUTES * 60_000);
    const maxDate = new Date(now);
    maxDate.setMonth(maxDate.getMonth() + HORIZON_MAX_MOIS);
    return { min: formatLocalInput(minDate), max: formatLocalInput(maxDate) };
  }, []);

  // Message d'erreur clair si la valeur saisie est hors bornes.
  const erreur = useMemo(() => {
    if (!value) return null;
    if (value < min) return "Merci de choisir une date et une heure à venir (au moins 30 minutes à l'avance).";
    if (value > max) return `Merci de choisir une date dans les ${HORIZON_MAX_MOIS} prochains mois.`;
    return null;
  }, [value, min, max]);

  return (
    <div>
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}
      <input
        id={id}
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min}
        max={max}
        step={900}
        className={inputClassName}
      />
      {erreur && <p className="text-xs text-red-600 mt-1">{erreur}</p>}
    </div>
  );
}
