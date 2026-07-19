import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, Search, Phone, Cross, Car, Users, BadgeCheck, Star } from "lucide-react";
import { CATEGORIES_SANITAIRE, getCategorieBySlug, getCategorieByKey, slugifyVille, REGIONS_FR_SEO, type ProSanitaire } from "@/lib/sanitaire-data";
import { tokenize, buildVilleOrFilter, buildVillePhraseFilter, matchesVilleSlug, villeSlugMatchScore } from "@/lib/sanitaire-search";
import { resolveRechercheMetadata } from "@/lib/recherche-metadata";
import AmeliBadge from "@/components/sanitaire/AmeliBadge";
import OpenStatusBadge from "@/components/sanitaire/OpenStatusBadge";
import GeolocBouton from "@/components/sanitaire/GeolocBouton";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    categorie?: string;
    ameli?: string;
    lat?: string;
    lng?: string;
    radius?: string;
  }>;
};

// Page de recherche a facettes (?q, ?categorie, ?lat/lng, ?ameli...) : elle reproduit
// le contenu des hubs canoniques (/transport-medical/[ville], /[ville]/[categorie]) et
// genere une infinite d'URLs parametrees. Google a fini par indexer certaines de ces
// URLs (?categorie=vsl, ?q=... issu du SearchAction JSON-LD). On resout les
// metadonnees cote serveur pour :
//  - ?categorie=vsl|ambulance|taxi_conventionne -> canonical vers la page dediee
//    (/vsl-autour-de-moi, /ambulance-autour-de-moi, /taxi-vsl-autour-de-moi) et
//    ainsi transferer les positions vers ces pages.
//  - ?q=... / ?lat&lng (recherche libre ou geolocalisee) -> noindex,follow +
//    canonical vers la page de recherche (contenu dynamique/duplique).
//  - sans parametre -> page de recherche canonique, indexable.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, categorie, lat, lng } = await searchParams;
  const meta = resolveRechercheMetadata({
    q,
    categorie,
    geo: Boolean(lat && lng),
  });
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.canonicalPath },
    robots: { index: meta.index, follow: true },
  };
}

// Distance Haversine en km entre deux points lat/lng.
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default async function RecherchePage({ searchParams }: Props) {
  const { q, categorie, ameli, lat, lng, radius } = await searchParams;
  const queryVille = (q || "").trim();

  // ---------------------------------------------------------------------------
  // Redirections 301 SEO : si la requete correspond a une page canonique
  // (hub categorie nationale, hub region, hub ville, hub ville+categorie),
  // on redirige vers l'URL canonique pour eviter le contenu duplique et
  // concentrer le jus SEO. On NE redirige PAS si une geolocalisation est
  // active (lat/lng) car c'est une vraie recherche dynamique.
  // ---------------------------------------------------------------------------
  if (!lat && !lng) {
    // 1. Normaliser le slug de categorie : accepte "taxi-conventionne" (slug)
    // ou "taxi_conventionne" (key) en provenance d'anciens liens.
    const categorieParam = categorie ? categorie.trim() : "";
    const catSlugNormalized = categorieParam.replace(/_/g, "-");
    const catFromSlug = catSlugNormalized ? getCategorieBySlug(catSlugNormalized) : null;
    const catFromKey = categorieParam ? getCategorieByKey(categorieParam) : null;
    const matchedCat = catFromSlug || catFromKey;

    // 2. Si q correspond a une region FR connue -> hub region.
    if (queryVille) {
      const qSlug = slugifyVille(queryVille);
      const matchedRegionSeo = REGIONS_FR_SEO.find((r) => r.slug === qSlug);
      if (matchedRegionSeo) {
        redirect(`/transport-medical/region/${matchedRegionSeo.slug}`);
      }

      // 3. Si q correspond a une ville connue en base -> hub ville (eventuellement +categorie).
      const supabaseRedirect = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: villeMatch } = await supabaseRedirect
        .from("pros_sanitaire_public")
        .select("ville_slug")
        .eq("ville_slug", qSlug)
        .eq("actif", true)
        .limit(1);
      if (villeMatch && villeMatch.length > 0) {
        if (matchedCat) {
          redirect(`/transport-medical/${qSlug}/${matchedCat.slug}`);
        }
        redirect(`/transport-medical/${qSlug}`);
      }
    } else if (matchedCat) {
      // 4. Categorie seule (sans q) -> hub categorie nationale.
      redirect(`/transport-medical/categorie/${matchedCat.slug}`);
    }
  }
  // ---------------------------------------------------------------------------

  const cat = categorie ? getCategorieBySlug(categorie) || getCategorieByKey(categorie) : null;
  // Filtre conventionne Ameli : OFF par defaut (inclusivite). Active via ?ameli=1
  const ameliOnly = ameli === "1";

  // Geolocalisation "autour de moi" : tri par distance si lat/lng fournis.
  const userLat = lat ? parseFloat(lat) : null;
  const userLng = lng ? parseFloat(lng) : null;
  const hasGeo =
    userLat !== null && userLng !== null && Number.isFinite(userLat) && Number.isFinite(userLng);
  const RADIUS_OPTIONS = [5, 10, 20, 50];
  const rayonKm = (() => {
    const r = radius ? parseInt(radius, 10) : 10;
    return RADIUS_OPTIONS.includes(r) ? r : 10;
  })();

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
  if (hasGeo) {
    // Recherche "autour de moi" : bounding box puis tri Haversine par distance.
    // 1 deg lat ~= 111 km ; 1 deg lng ~= 73 km a 45 deg N (marge suffisante en France metropolitaine).
    const dLat = rayonKm / 111;
    const dLng = rayonKm / 73;
    let query = supabase
      .from("pros_sanitaire_public")
      .select("*")
      .eq("actif", true).eq("suspendu", false)
      .not("latitude", "is", null)
      .gte("latitude", userLat! - dLat)
      .lte("latitude", userLat! + dLat)
      .gte("longitude", userLng! - dLng)
      .lte("longitude", userLng! + dLng)
      .limit(500);
    if (cat) query = query.eq("categorie", cat.key);
    if (ameliOnly) query = query.eq("ameli_conventionne", true).not("ameli_last_seen", "is", null);
    const { data } = await query;
    const withDist = ((data || []) as ProSanitaire[])
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => ({
        ...p,
        distance_km: haversineKm(userLat!, userLng!, p.latitude as number, p.longitude as number),
      }))
      .filter((p) => p.distance_km <= rayonKm)
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, 100);
    pros = withDist as ProSanitaire[];
  } else if (matchedRegion) {
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
    // Recherche par ville tolérante aux saisies multi-mots partielles.
    // Bug prod : « thury harcourt » / « le hom » ne retrouvaient pas la ville
    // « thury-harcourt-le-hom » car l'ancien filtre comparait la requête brute
    // (espaces) au nom de ville (traits d'union) ou exigeait un slug exact.
    // On matche désormais par tokens (chaque token = préfixe d'un mot).
    const isCodePostal = /^\d{2,5}$/.test(queryVille);
    let query = supabase
      .from("pros_sanitaire_public")
      .select("*")
      .eq("actif", true).eq("suspendu", false)
      .order("plan", { ascending: false })
      .order("claimed", { ascending: false })
      .limit(300);
    if (isCodePostal) {
      query = query.or(`code_postal.eq.${queryVille},code_postal.ilike.${queryVille}*`);
    } else {
      // Chaque `.or()` est combiné en AND : tous les tokens doivent matcher.
      for (const token of tokenize(queryVille)) {
        query = query.or(buildVilleOrFilter(token));
      }
      // Requête multi-mots : on exige aussi la suite de mots consécutive dans le
      // slug (« le hom » -> « ...-le-hom »). Cela cible « thury-harcourt-le-hom »
      // et écarte « hombourg-haut »/« homecourt », évitant que ces pros d'autres
      // régions saturent les 300 lignes triées par plan et n'évincent Le Hom.
      const phraseFilter = buildVillePhraseFilter(queryVille);
      if (phraseFilter) {
        query = query.or(phraseFilter);
      }
    }
    if (cat) query = query.eq("categorie", cat.key);
    if (ameliOnly) query = query.eq("ameli_conventionne", true).not("ameli_last_seen", "is", null);
    const { data } = await query;
    let rows = (data || []) as ProSanitaire[];
    // Filtrage précis « préfixe de mot » côté serveur (le filtre SQL est une
    // sur-approximation par sous-chaîne). On garde tel quel pour le code postal.
    if (!isCodePostal) {
      rows = rows.filter((p) => matchesVilleSlug(p.ville_slug, queryVille));
      // Classement par pertinence : une ville qui contient la requête comme suite
      // de mots consécutifs (« le hom » -> « thury-harcourt-le-hom ») passe avant
      // un simple préfixe de token (« hom » -> « hombourg »). Tri stable : à score
      // égal, l'ordre plan/claimed issu de la requête SQL est conservé.
      rows.sort(
        (a, b) =>
          villeSlugMatchScore(b.ville_slug, queryVille) -
          villeSlugMatchScore(a.ville_slug, queryVille)
      );
    }
    pros = rows.slice(0, 100);
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

  // Etat par defaut : aucune recherche active. On ne montre jamais "0 resultat".
  // On peuple la grille avec un echantillon de pros mis en avant (claimed/plan en priorite).
  const aucuneRecherche = !hasGeo && !matchedRegion && !queryVille && !cat;
  if (aucuneRecherche) {
    let query = supabase
      .from("pros_sanitaire_public")
      .select("*")
      .eq("actif", true).eq("suspendu", false)
      .order("claimed", { ascending: false })
      .order("plan", { ascending: false })
      .limit(24);
    if (ameliOnly) query = query.eq("ameli_conventionne", true).not("ameli_last_seen", "is", null);
    const { data } = await query;
    pros = (data || []) as ProSanitaire[];
  }

  // Villes populaires proposees en raccourci sur l'etat d'accueil.
  const VILLES_POPULAIRES = ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Bordeaux", "Lille"];

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            {aucuneRecherche
              ? "Trouvez un professionnel près de chez vous"
              : hasGeo
                ? `${cat ? cat.labelPluriel : "Transport sanitaire"} autour de vous`
                : `${cat ? `${cat.labelPluriel} ` : "Résultats "}${queryVille ? `à ${queryVille}` : ""}`}
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

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <GeolocBouton radius={rayonKm} categorie={categorie} className="[&_button]:bg-white [&_button]:border-white [&_button]:text-[#0066CC] [&_button]:hover:bg-blue-50" />
            {hasGeo && (
              <div className="flex items-center gap-2 text-sm text-blue-100">
                <span>Rayon :</span>
                {RADIUS_OPTIONS.map((r) => {
                  const params = new URLSearchParams();
                  params.set("lat", String(userLat));
                  params.set("lng", String(userLng));
                  params.set("radius", String(r));
                  if (categorie) params.set("categorie", categorie);
                  return (
                    <Link
                      key={r}
                      href={`/transport-medical/recherche?${params.toString()}`}
                      className={`px-2.5 py-1 rounded-full border transition ${
                        r === rayonKm
                          ? "bg-white text-[#0066CC] border-white font-semibold"
                          : "border-white/30 text-white hover:bg-white/10"
                      }`}
                    >
                      {r} km
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8">
        {aucuneRecherche && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <p className="text-gray-700 font-medium mb-1">
              Tapez votre ville ci-dessus ou cliquez sur « Autour de moi » pour trouver un professionnel proche.
            </p>
            <p className="text-sm text-gray-500 mb-4">Ou choisissez une ville parmi les plus recherchées :</p>
            <div className="flex flex-wrap gap-2">
              {VILLES_POPULAIRES.map((v) => (
                <Link
                  key={v}
                  href={`/transport-medical/recherche?q=${encodeURIComponent(v)}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#0066CC] bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1.5 transition"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {v}
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="text-sm text-gray-600 mb-4">
          {aucuneRecherche
            ? "Professionnels mis en avant"
            : `${pros.length} résultat${pros.length > 1 ? "s" : ""}`}
        </div>
        {pros.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-gray-600 mb-4">
              {hasGeo
                ? `Aucun professionnel dans un rayon de ${rayonKm} km. Élargissez le rayon ci-dessus ou tapez votre ville.`
                : "Aucun professionnel référencé pour cette recherche. Essayez une ville voisine ou élargissez le type."}
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
                    <OpenStatusBadge horaires={pro.horaires} variant="card" />
                    <AmeliBadge
                      conventionne={pro.ameli_conventionne}
                      lastSeen={pro.ameli_last_seen}
                      variant="sm"
                    />
                    {typeof (pro as ProSanitaire & { distance_km?: number }).distance_km === "number" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 rounded-full px-2 py-0.5">
                        <MapPin className="w-3 h-3" />
                        {(pro as ProSanitaire & { distance_km?: number }).distance_km!.toFixed(1)} km
                      </span>
                    )}
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
