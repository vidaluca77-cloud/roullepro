import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { BadgeCheck, ChevronRight } from "lucide-react";
import { getCategorieByKey } from "@/lib/sanitaire-data";

/**
 * Bloc "Autres transporteurs à [Ville]" (Phase C SEO, maillage interne).
 *
 * Server Component asynchrone : interroge Supabase pour lister d'autres pros de la
 * meme ville (memes categorie si fournie), en excluant la fiche courante. Les fiches
 * revendiquees (claimed) remontent en premier, faute de note disponible sur les pros
 * sanitaire. Si aucune autre fiche n'existe, affiche un lien vers le hub ville.
 */
export default async function OtherProsInCity({
  villeSlug,
  nomVille,
  excludeProId,
  categorie,
  limit = 4,
}: {
  villeSlug: string;
  nomVille: string;
  excludeProId: string;
  categorie?: string;
  limit?: number;
}) {
  if (!villeSlug) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let query = supabase
    .from("pros_sanitaire")
    .select("id, raison_sociale, nom_commercial, slug, categorie, claimed, ville_slug")
    .eq("actif", true)
    .eq("suspendu", false)
    .eq("ville_slug", villeSlug)
    .neq("id", excludeProId)
    .order("claimed", { ascending: false })
    .limit(limit);
  if (categorie) query = query.eq("categorie", categorie);

  const { data } = await query;
  const autres = ((data ?? []) as Array<{
    id: string;
    raison_sociale: string;
    nom_commercial: string | null;
    slug: string;
    categorie: string;
    claimed: boolean;
    ville_slug: string;
  }>).map((p) => ({
    id: p.id,
    nom: p.nom_commercial || p.raison_sociale,
    slug: p.slug,
    categorie: p.categorie,
    claimed: p.claimed === true,
  }));

  return (
    <section className="max-w-5xl mx-auto px-4 pb-10">
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Autres transporteurs à {nomVille}
        </h2>
        {autres.length === 0 ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Découvre l&apos;ensemble des transporteurs médicaux référencés à {nomVille}.
            </p>
            <Link
              href={`/transport-medical/${villeSlug}`}
              className="inline-flex items-center gap-1 text-sm text-[#0066CC] font-semibold hover:underline"
            >
              Voir tous les transporteurs médicaux à {nomVille}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              D&apos;autres professionnels du transport médical sont référencés à {nomVille}.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {autres.map((p) => {
                const catSlug =
                  p.categorie === "taxi_conventionne"
                    ? "taxi-conventionne"
                    : getCategorieByKey(p.categorie)?.slug || p.categorie;
                return (
                  <li key={p.id}>
                    <Link
                      href={`/transport-medical/${villeSlug}/${catSlug}/${p.slug}`}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-[#0066CC] text-sm text-gray-800 transition"
                    >
                      <span className="truncate">{p.nom}</span>
                      {p.claimed && (
                        <BadgeCheck className="w-4 h-4 text-[#0066CC] flex-shrink-0" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href={`/transport-medical/${villeSlug}`}
                className="inline-flex items-center gap-1 text-sm text-[#0066CC] font-semibold hover:underline"
              >
                Voir tous les transporteurs médicaux à {nomVille}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
