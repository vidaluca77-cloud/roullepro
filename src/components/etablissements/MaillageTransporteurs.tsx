/**
 * Encart de maillage interne : "Trouver un transporteur conventionne".
 * Server component async — les etablissements (et donc leurs slugs) sont lus
 * en BDD au build/ISR, ce qui evite tout lien casse vers /transport-medical/vers/[slug].
 *
 * variant "dialyse" met en avant les centres de dialyse / oncologie pour les
 * articles traitant des soins iteratifs (chimio, dialyse, radiotherapie).
 */

import Link from "next/link";
import {
  fetchTopEtablissements,
  nomEtablissement,
  type CategorieSimple,
} from "@/lib/etablissements-data";

type Variant = "default" | "dialyse";

const CATEGORIES_PAR_VARIANT: Record<Variant, CategorieSimple[]> = {
  default: ["hopital", "clinique"],
  dialyse: ["centre-dialyse", "centre-oncologie", "hopital"],
};

export default async function MaillageTransporteurs({
  variant = "default",
}: {
  variant?: Variant;
}) {
  const etabs = await fetchTopEtablissements(CATEGORIES_PAR_VARIANT[variant], 10);
  if (etabs.length === 0) return null;

  return (
    <aside className="not-prose my-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h2 className="text-xl font-semibold mb-3">
        Trouver un transporteur conventionné pour votre rendez-vous
      </h2>
      <p className="text-slate-600 mb-4">
        Sélectionnez l&apos;établissement où vous devez vous rendre :
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {etabs.map((e) => {
          const nom = nomEtablissement(e);
          return (
            <li key={e.id}>
              <Link
                href={`/transport-medical/vers/${e.slug}`}
                className="text-blue-700 hover:underline"
              >
                → {nom}
                {e.ville ? ` (${e.ville})` : ""}
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        href="/etablissements"
        className="mt-4 inline-block text-blue-700 font-medium hover:underline"
      >
        Voir tous les établissements de France →
      </Link>
    </aside>
  );
}
