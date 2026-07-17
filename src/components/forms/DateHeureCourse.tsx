"use client";

/**
 * Composant partage de saisie date + heure d'une course, utilise par tous les
 * formulaires de demande de transport (home, widget, fiche etablissement,
 * fiche pro).
 *
 * Refonte (cf. audit formulaires §5) : l'input unique `datetime-local` collait
 * l'heure au calendrier et la majorite des patients la laissaient vide ou
 * fausse. On scinde donc en DEUX champs distincts (date + heure), avec un
 * recapitulatif francais de confirmation comme garde-fou.
 *
 * L'interface publique reste INCHANGEE (value "YYYY-MM-DDTHH:mm", onChange,
 * toISODateSouhaitee, memes props) : les 4 formulaires parents beneficient du
 * nouveau rendu sans modification.
 */

import { useEffect, useMemo, useState } from "react";
import {
  bornesDateHeure,
  combineDateHeure,
  formaterRecap,
  splitDateHeure,
  toISODateSouhaitee,
  validerDateHeure,
} from "@/lib/date-heure";

// Re-export pour conserver l'import existant des parents
// (`import DateHeureCourse, { toISODateSouhaitee } from "..."`).
export { toISODateSouhaitee };

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
  const initial = splitDateHeure(value);
  const [datePart, setDatePart] = useState(initial.date);
  const [timePart, setTimePart] = useState(initial.time);

  // Resynchronise l'etat interne si la valeur est pilotee de l'exterieur
  // (reset apres envoi du formulaire, pre-remplissage eventuel).
  useEffect(() => {
    if (value !== combineDateHeure(datePart, timePart)) {
      const s = splitDateHeure(value);
      setDatePart(s.date);
      setTimePart(s.time);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Bornes du selecteur (recalculees une fois par montage).
  const { minDate, maxDate } = useMemo(() => bornesDateHeure(), []);

  const { erreur, champ } = useMemo(
    () => validerDateHeure(datePart, timePart),
    [datePart, timePart]
  );

  const recap = useMemo(
    () => (erreur ? null : formaterRecap(datePart, timePart)),
    [datePart, timePart, erreur]
  );

  // onChange n'est appele qu'avec une chaine complete (sinon "").
  const emettre = (d: string, t: string) => {
    setDatePart(d);
    setTimePart(t);
    onChange(combineDateHeure(d, t));
  };

  const dateId = `${id}-date`;
  const heureId = `${id}-heure`;
  const errId = `${id}-erreur`;

  return (
    <div>
      {label && (
        <span className={labelClassName} id={`${id}-label`}>
          {label}
        </span>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={dateId} className={labelClassName}>
            Date de prise en charge
          </label>
          <input
            id={dateId}
            type="date"
            value={datePart}
            onChange={(e) => emettre(e.target.value, timePart)}
            required={required}
            min={minDate}
            max={maxDate}
            className={inputClassName}
            aria-invalid={erreur != null && champ === "date"}
            aria-describedby={erreur && champ === "date" ? errId : undefined}
          />
        </div>
        <div>
          <label htmlFor={heureId} className={labelClassName}>
            Heure de prise en charge
          </label>
          <input
            id={heureId}
            type="time"
            value={timePart}
            onChange={(e) => emettre(datePart, e.target.value)}
            required={required}
            step={300}
            className={inputClassName}
            aria-invalid={erreur != null && champ === "heure"}
            aria-describedby={erreur && champ === "heure" ? errId : undefined}
          />
        </div>
      </div>
      {erreur && (
        <p id={errId} className="text-xs text-red-600 mt-1">
          {erreur}
        </p>
      )}
      {recap && (
        <p className="text-xs text-gray-600 mt-1.5 font-medium">{recap}</p>
      )}
    </div>
  );
}
