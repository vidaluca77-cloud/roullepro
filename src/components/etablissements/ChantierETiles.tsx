/**
 * Bloc "Pages thematiques par type d'etablissement et ville" pose sur la page
 * /etablissements. Liste les 105 pages Chantier E groupees par type.
 */

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TYPES_ETABLISSEMENTS } from "@/lib/types-etablissements";
import { CHANTIER_E_COMBOS } from "@/lib/chantier-e-combos";

export default function ChantierETiles() {
  return (
    <section className="max-w-6xl mx-auto px-4 pb-14">
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Transport medical par type d&apos;etablissement et ville
      </h2>
      <p className="text-gray-600 mb-8 max-w-3xl">
        Acces direct aux transporteurs conventionnes CPAM selon le type d&apos;etablissement
        que vous devez rejoindre, dans les principales villes francaises.
      </p>
      <div className="space-y-8">
        {TYPES_ETABLISSEMENTS.map((type) => {
          const combos = CHANTIER_E_COMBOS[type.slug] ?? [];
          if (combos.length === 0) return null;
          return (
            <div key={type.slug}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {type.libellePluriel}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {combos.map((c) => (
                  <Link
                    key={c.villeSlug}
                    href={`/etablissements/type/${type.slug}/${c.villeSlug}/`}
                    className="group flex items-center justify-between gap-1 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-blue-300 hover:bg-blue-50 transition"
                  >
                    <span className="text-sm text-gray-800 truncate">
                      {c.villeNom}
                      <span className="text-gray-400 ml-1 text-xs">({c.nbEtabs})</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
