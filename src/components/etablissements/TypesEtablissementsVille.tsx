/**
 * Bloc "Acceder par type d'etablissement" pose sur les pages
 * /transport-medical/[ville]. Maillage vers les pages Chantier E
 * /etablissements/type/[type]/[ville] uniquement quand la combinaison
 * existe dans CHANTIER_E_COMBOS (sinon le lien serait 404).
 */

import Link from "next/link";
import { BedDouble, Activity, Stethoscope, Building2, Cross } from "lucide-react";
import { TYPES_ETABLISSEMENTS } from "@/lib/types-etablissements";
import { getComboMeta } from "@/lib/chantier-e-combos";

const TYPE_ICONS: Record<string, typeof BedDouble> = {
  ehpad: BedDouble,
  hopital: Cross,
  clinique: Building2,
  "centre-dialyse": Activity,
  rehabilitation: Stethoscope,
};

export default function TypesEtablissementsVille({
  villeSlug,
  nomVille,
}: {
  villeSlug: string;
  nomVille: string;
}) {
  // Garde uniquement les types qui ont une page Chantier E pour cette ville.
  const available = TYPES_ETABLISSEMENTS.map((t) => ({
    type: t,
    combo: getComboMeta(t.slug, villeSlug),
  })).filter((x) => x.combo);

  if (available.length === 0) return null;

  return (
    <section className="bg-gray-50 py-10 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Trouver un transporteur par type d&apos;etablissement a {nomVille}
        </h2>
        <p className="text-slate-600 mb-6">
          Choisissez le type d&apos;etablissement de sante vers lequel vous devez vous rendre. Chaque
          page presente les structures concernees et les transporteurs conventionnes CPAM qui les desservent.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {available.map(({ type, combo }) => {
            const Icon = TYPE_ICONS[type.slug] ?? Building2;
            return (
              <Link
                key={type.slug}
                href={`/etablissements/type/${type.slug}/${villeSlug}/`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition text-center"
              >
                <Icon className="w-6 h-6 mx-auto mb-2 text-blue-700" aria-hidden="true" />
                <div className="font-semibold text-gray-900 text-sm leading-tight">
                  {type.libellePluriel}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {combo!.nbEtabs} a {nomVille}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
