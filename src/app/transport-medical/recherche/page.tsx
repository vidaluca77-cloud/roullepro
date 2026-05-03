import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { MapPin, Search, Phone, Cross, Car, Users, BadgeCheck, Star } from "lucide-react";
import { CATEGORIES_SANITAIRE, getCategorieBySlug, slugifyVille, type ProSanitaire } from "@/lib/sanitaire-data";
import AmeliBadge from "@/components/sanitaire/AmeliBadge";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; categorie?: string; ameli?: string }>;
};

export default async function RecherchePage({ searchParams }: Props) {
  const { q, categorie, ameli } = await searchParams;
  const queryVille = (q || "").trim();
  const cat = categorie ? getCategorieBySlug(categorie) : null;
  const villeSlug = slugifyVille(queryVille);
  // Filtre conventionne Ameli : OFF par defaut (inclusivite). Active via ?ameli=1
  const ameliOnly = ameli === "1";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Liste des regions FR (avec accents, format DB)
  const REGIONS_FR = new Set([
    "Auvergne-Rhône-Alpes",
    "Bourgogne-Franche-Comté",
    "Bretagne",
    "Centre-Val de Loire",
    "Corse",
    "Grand Est",
    "Hauts-de-France",
    "Ile-de-France",
    "Île-de-France",
    "Normandie",
    "Nouvelle-Aquitaine",
    "Occitanie",
    "Pays de la Loire",
    "Provence-Alpes-Côte d'Azur",
    "Guadeloupe",
    "Martinique",
    "Guyane",
    "La Réunion",
    "Mayotte",
  ]);
  // Detection robuste : compare en lowercase + sans accents pour tolerer les variations de saisie
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const queryNorm = norm(queryVille);
  const matchedRegion = queryVille
    ? Array.from(REGIONS_FR).find((r) => norm(r) === queryNorm)
    : null;

  let pros: ProSanitaire[] = [];
  if (matchedRegion) {
    // Recherche par region (clic depuis la page d'accueil ou saisie d'un nom de region)
    let query = supabase
      .from("pros_sanitaire_public")
      .select("*")
      .eq("actif", true).eq("suspendu", false)
      .eq("region", matchedRegion)
      .order("plan", { ascending: false })
      .order("claimed", { ascending: false })
      .limit(100);
    if (cat) query = query.eq("categorie", cat.key);
    if (ameliOnly) query = query.eq("ameli_conventionne", true).not("ameli_last_seen", "is", null);
    const { data } = await query;
    pros = (data || []) as ProSanitaire[];
  } else if (queryVille) {
    let query = supabase
      .from("pros_sanitaire_public")
      .select("*")
      .eq("actif", true).eq("suspendu", false)
      .or(`ville_slug.eq.${villeSlug},ville.ilike.%${queryVille}%,code_postal.eq.${queryVille}`)
      .order("plan", { ascending: false })
      .order("claimed", { ascending: false })
      .limit(100);
    if (cat) query = query.eq("categorie", cat.key);
    if (ameliOnly) query = query.eq("ameli_conventionne", true).not("ameli_last_seen", "is", null);
    const { data } = await query;
    pros = (data || []) as ProSanitaire[];
  } else if (cat) {
    let query = supabase
      .from("pros_sanitaire_public")
      .select("*")
      .eq("actif", true).eq("suspendu", false)
      .eq("categorie", cat.key)
      .order("plan", { ascending: false })
      .limit(100);
    if (ameliOnly) query = query.eq("ameli_conventionne", true).not("ameli_last_seen", "is", null);
    const { data } = await query;
    pros = (data || []) as ProSanitaire[];
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            {cat ? `${cat.labelPluriel} ` : "Résultats "}{queryVille ? `à ${queryVille}` : ""}
          </h1>
          <form action="/transport-medical/recherche" className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-4">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                name="q"
                defaultValue={queryVille}
                placeholder="Ville ou code postal"
                className="w-full py-3 text-gray-900 bg-transparent outline-none"
              />
            </div>
            <select
              name="categorie"
              defaultValue={categorie || ""}
              className="px-4 py-3 text-gray-900 bg-transparent outline-none border-l border-gray-200"
            >
              <option value="">Tous types</option>
              {CATEGORIES_SANITAIRE.map((c) => (
                <option key={c.slug} value={c.slug}>{c.labelPluriel}</option>
              ))}
            </select>
            <button className="inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-6 py-3 rounded-xl transition">
              <Search className="w-4 h-4" />
              Rechercher
            </button>
            {/* Le filtre Ameli est passe en query string (?ameli=1) lorsque la case est cochee.
                Si elle est decochee, l'input n'est pas soumis et le filtre se desactive. */}
            <label className="hidden sm:flex items-center gap-2 px-3 cursor-pointer" title="Afficher uniquement les societes referencees dans l'annuaire sante de l'Assurance Maladie">
              <input
                type="checkbox"
                name="ameli"
                value="1"
                defaultChecked={ameliOnly}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-gray-700 font-medium whitespace-nowrap">Conventionne Ameli uniquement</span>
            </label>
          </form>
          <label className="sm:hidden mt-3 flex items-center gap-2 cursor-pointer text-white">
            <input
              type="checkbox"
              form=""
              checked={ameliOnly}
              readOnly
              className="w-4 h-4 rounded border-white/30 text-emerald-500 bg-white/10"
            />
            <span className="text-sm">Conventionne Ameli uniquement</span>
          </label>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-sm text-gray-600 mb-4">{pros.length} résultat{pros.length > 1 ? "s" : ""}</div>
        {pros.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-gray-600 mb-4">
              Aucun professionnel référencé pour cette recherche. Essayez une ville voisine ou élargissez le type.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/transport-medical" className="text-[#0066CC] font-medium hover:underline">
                Retour à l&apos;annuaire
              </Link>
              <span className="hidden sm:block text-gray-300">|</span>
              <Link
                href="/transport-medical/inscription"
                className="inline-flex items-center gap-1 text-[#0066CC] font-medium hover:underline"
              >
                Votre entreprise n&apos;est pas listée ? Inscrivez-la gratuitement
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {pros.map((pro) => {
              const catObj = CATEGORIES_SANITAIRE.find((c) => c.key === pro.categorie);
              const isPremium = pro.plan === "premium" || pro.plan === "pro_plus";
              const Icon = pro.categorie === "ambulance" ? Cross : pro.categorie === "vsl" ? Car : Users;
              return (
                <Link
                  key={pro.id}
                  href={`/transport-medical/${pro.ville_slug}/${catObj?.slug || "fiche"}/${pro.slug}`}
                  className={`block bg-white rounded-2xl p-5 border transition hover:shadow-lg ${isPremium ? "border-indigo-300 ring-1 ring-indigo-200" : "border-gray-200 hover:border-blue-200"}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#0066CC]" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{pro.nom_commercial || pro.raison_sociale}</div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {pro.code_postal} {pro.ville}
                        </div>
                      </div>
                    </div>
                    {pro.verified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-[#0066CC] px-2 py-0.5 rounded-full flex-shrink-0">
                        <BadgeCheck className="w-3 h-3" />
                        Vérifié
                      </span>
                    ) : isPremium ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full flex-shrink-0">
                        <Star className="w-3 h-3" />
                        Recommandé
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {pro.telephone_public && (
                      <div className="inline-flex items-center gap-1 text-sm font-medium text-[#0066CC]">
                        <Phone className="w-3.5 h-3.5" />
                        {pro.telephone_public}
                      </div>
                    )}
                    <AmeliBadge
                      conventionne={pro.ameli_conventionne}
                      lastSeen={pro.ameli_last_seen}
                      variant="sm"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
