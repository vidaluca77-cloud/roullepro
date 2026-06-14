import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { findNearestCities, getDepartmentFromVille } from "@/lib/internal-linking";

/**
 * Bloc de maillage interne "Transport médical dans les villes proches" (Phase C SEO).
 *
 * S'appuie sur la table de coordonnees statique (src/lib/internal-linking.ts) et ne
 * fait aucun appel reseau. Sert de fallback sur les hubs villes quand le calcul de
 * proximite base sur les fiches Supabase ne renvoie rien (aucune fiche geolocalisee).
 *
 * Si la ville est inconnue de la table de coordonnees, le composant ne rend rien et
 * laisse l'appelant afficher un lien generique vers l'annuaire.
 */
export default function NearbyCities({
  villeSlug,
  nomVille,
  limit = 5,
}: {
  villeSlug: string;
  nomVille: string;
  limit?: number;
}) {
  const nearest = findNearestCities(villeSlug, limit);
  if (nearest.length === 0) return null;

  const dept = getDepartmentFromVille(villeSlug);

  return (
    <section className="max-w-6xl mx-auto px-4 pb-10">
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Transport médical dans les villes proches
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Tu ne trouves pas de transporteur à {nomVille} ? Élargis ta recherche aux villes
          les plus proches.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {nearest.map((v) => (
            <Link
              key={v.slug}
              href={`/transport-medical/${v.slug}`}
              className="flex items-start gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-[#0066CC] hover:bg-blue-50 transition"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-[#0066CC]" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  {v.label}
                  <span className="text-xs font-normal text-gray-400">· {v.distanceKm} km</span>
                </div>
                <div className="text-xs text-gray-600">
                  Transport médical conventionné à {v.label}
                </div>
              </div>
            </Link>
          ))}
        </div>
        {dept && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              href={`/transport-medical/departement/${dept.code}`}
              className="inline-flex items-center gap-1 text-sm text-[#0066CC] font-semibold hover:underline"
            >
              Voir tout le transport médical {dept.nom ? `en ${dept.nom}` : `dans le département ${dept.code}`}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
