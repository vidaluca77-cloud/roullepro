import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  Cross,
  Car,
  Users,
  MapPin,
  Phone,
  ShieldCheck,
  Search,
  ChevronRight,
  Building2,
  BadgeCheck,
  Clock,
  Heart,
} from "lucide-react";
import SearchHero from "@/components/sanitaire/SearchHero";
import RechercheEtablissement from "@/components/RechercheEtablissement";
import DemandeTransportForm from "@/components/sanitaire/DemandeTransportForm";
import { CATEGORIES_SANITAIRE } from "@/lib/sanitaire-data";
import { getProStats } from "@/lib/stats";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Taxi conventionné CPAM, VSL, ambulance — Annuaire national | RoullePro",
  description:
    "Annuaire gratuit du transport sanitaire en France : 26 000+ ambulances, VSL et taxis conventionnés CPAM. Téléphone direct, tarif Sécurité sociale, tiers payant.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "RoullePro — Annuaire transport sanitaire France",
    description: "26 000+ ambulances, VSL et taxis conventionnés CPAM avec téléphone direct.",
    type: "website",
    locale: "fr_FR",
  },
};

// Les comptages proviennent du helper unique getProStats (filtre de visibilite canonique, cache 15 min).

async function getTopVilles() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("sanitaire_top_villes")
    .select("ville, ville_slug, departement, count")
    .limit(12);
  return (data ?? []) as { ville: string; ville_slug: string; departement: string; count: number }[];
}

async function getRegionsCount() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("sanitaire_regions")
    .select("region, count");
  return ((data ?? []) as { region: string; count: number }[]).map((r) => ({
    region: r.region,
    count: r.count,
    slug: r.region.toLowerCase().replace(/\s+/g, "-").replace(/'/g, "-"),
  }));
}

// Hopitaux phares : un CHU par grande ville (le plus gros par capacite),
// pour creer un maillage interne riche depuis l'accueil vers les fiches
// etablissements et les pages de transport conventionne.
const VILLES_HOPITAUX_PHARES = [
  "lyon",
  "marseille",
  "reims",
  "toulouse",
  "bordeaux",
  "nantes",
  "lille",
  "strasbourg",
  "rennes",
];

type HopitalPhare = {
  id: string;
  raison_sociale: string;
  nom_court: string | null;
  slug: string;
  ville: string | null;
  ville_slug: string | null;
  departement: string | null;
  capacite_lits: number | null;
};

async function getHopitauxPhares(): Promise<HopitalPhare[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("etablissements_sante_public")
    .select("id, raison_sociale, nom_court, slug, ville, ville_slug, departement, capacite_lits")
    .eq("categorie_simple", "hopital")
    .in("ville_slug", VILLES_HOPITAUX_PHARES)
    .order("capacite_lits", { ascending: false, nullsFirst: false })
    .limit(200);

  // Un seul etablissement par ville (le premier, donc le plus gros).
  const parVille = new Map<string, HopitalPhare>();
  for (const e of (data as HopitalPhare[]) ?? []) {
    if (!e.ville_slug || parVille.has(e.ville_slug)) continue;
    parVille.set(e.ville_slug, e);
  }
  // On respecte l'ordre de la liste des villes cibles.
  return VILLES_HOPITAUX_PHARES.map((v) => parVille.get(v)).filter(
    (e): e is HopitalPhare => Boolean(e)
  );
}

export default async function HomePage() {
  const [stats, topVilles, regions, hopitauxPhares] = await Promise.all([
    getProStats(),
    getTopVilles(),
    getRegionsCount(),
    getHopitauxPhares(),
  ]);

  // JSON-LD : Organization + WebSite avec SearchAction (sitelinks search box Google)
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RoullePro",
    alternateName: "Roulle Pro",
    url: "https://roullepro.com",
    logo: "https://roullepro.com/android-chrome-512x512.png",
    description: `Annuaire officiel du transport sanitaire en France : ${stats.total.toLocaleString("fr-FR")} ambulances, VSL et taxis conventionnés CPAM.`,
    foundingDate: "2025",
    areaServed: { "@type": "Country", name: "France" },
    knowsAbout: [
      "Transport sanitaire", "Ambulance", "VSL", "Taxi conventionné",
      "CPAM", "Tiers payant", "Convention nationale transport", "FINESS", "ARS",
    ],
    sameAs: [
      "https://www.linkedin.com/company/roullepro",
      "https://www.facebook.com/roullepro",
    ],
  };
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "RoullePro",
    url: "https://roullepro.com",
    inLanguage: "fr-FR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://roullepro.com/transport-medical/recherche?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <section className="relative bg-gradient-to-br from-[#0B1120] via-[#0f2048] to-[#0066CC] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium mb-6">
              <BadgeCheck className="w-3.5 h-3.5" />
              Annuaire officiel — {stats.total.toLocaleString("fr-FR")} professionnels référencés
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
              Trouvez une ambulance, un VSL ou un taxi conventionné près de chez vous
            </h1>
            <p className="text-base sm:text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Annuaire opérationnel du transport sanitaire en France. Numéros directs, contacts visibles à vie. Pas d&apos;algorithme, pas de notation. 100 % gratuit pour les patients.
            </p>

            <SearchHero variant="hero" />

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-blue-200">Recherches populaires :</span>
              <Link href="/transport-medical/recherche?q=Paris&categorie=ambulance" className="text-white hover:underline">
                Ambulance Paris
              </Link>
              <span className="text-blue-300">·</span>
              <Link href="/transport-medical/recherche?q=Lyon&categorie=vsl" className="text-white hover:underline">
                VSL Lyon
              </Link>
              <span className="text-blue-300">·</span>
              <Link href="/transport-medical/recherche?q=Marseille&categorie=taxi-conventionne" className="text-white hover:underline">
                Taxi conventionné Marseille
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recherche d'etablissement de sante par nom ou ville */}
      <section className="max-w-6xl mx-auto px-4 pt-8 sm:pt-10">
        <div className="max-w-2xl mx-auto">
          <RechercheEtablissement />
          <p className="mt-2 text-center text-sm text-gray-500">
            Trouvez votre hôpital, clinique, EHPAD ou centre de dialyse.
          </p>
        </div>
      </section>

      {/* Formulaire de conversion : demande directe taxi/VSL/ambulance */}
      <section className="max-w-6xl mx-auto px-4 mt-6 relative z-10">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl mx-auto">
          <div className="text-center mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              Besoin d&apos;un transport maintenant ?
            </h2>
            <p className="text-sm text-gray-600">
              Decrivez votre besoin, les transporteurs conventionnes proches de vous vous rappellent.
            </p>
          </div>
          <DemandeTransportForm sourcePage="home" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Quel type de transport vous faut-il ?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chaque transport sanitaire correspond à un besoin précis. Cliquez sur la catégorie qui vous concerne.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <CategorieCard
            href="/transport-medical/recherche?categorie=ambulance"
            icon={<Cross className="w-6 h-6" />}
            color="bg-rose-50 text-rose-600 border-rose-100"
            title="Ambulance"
            count={stats.byCategory.ambulance}
            description="Transport médicalisé, équipage diplômé, matériel à bord. Urgences et transports programmés."
          />
          <CategorieCard
            href="/transport-medical/recherche?categorie=vsl"
            icon={<Car className="w-6 h-6" />}
            color="bg-blue-50 text-blue-600 border-blue-100"
            title="VSL"
            count={stats.byCategory.vsl}
            description="Véhicule Sanitaire Léger, transport assis sur prescription, remboursé par la Sécurité sociale."
          />
          <CategorieCard
            href="/transport-medical/recherche?categorie=taxi-conventionne"
            icon={<Users className="w-6 h-6" />}
            color="bg-amber-50 text-amber-600 border-amber-100"
            title="Taxi conventionné"
            count={stats.byCategory.taxi_conventionne}
            description="Taxi agréé par la CPAM, transport assis sur prescription, tiers payant Sécurité sociale."
          />
        </div>
      </section>

      {hopitauxPhares.length > 0 && (
        <section className="border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Hôpitaux près de chez vous
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Trouvez un taxi conventionné, un VSL ou une ambulance pour votre rendez-vous à
                l&apos;hôpital.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hopitauxPhares.map((h) => {
                const nom = h.nom_court || h.raison_sociale;
                return (
                  <div
                    key={h.id}
                    className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-lg transition"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066CC] flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/etablissements/${h.slug}`}
                          className="font-bold text-gray-900 hover:text-[#0066CC] transition block truncate"
                        >
                          {nom}
                        </Link>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {h.ville}
                          {h.departement ? ` (${h.departement})` : ""}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/transport-medical/vers/${h.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#0066CC] hover:gap-2 transition-all"
                    >
                      Taxi conventionné et VSL vers {nom}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/etablissements/hopitaux"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0066CC] hover:underline"
              >
                Voir tous les hôpitaux en France
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Régions couvertes</h2>
              <p className="text-gray-600">Explorez l'annuaire par région.</p>
            </div>
            <Link href="/transport-medical" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[#0066CC] hover:underline">
              Voir tout l'annuaire <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {regions.slice(0, 9).map((r) => (
              <Link
                key={r.region}
                href={`/transport-medical/recherche?q=${encodeURIComponent(r.region)}`}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#0066CC]" />
                  <div>
                    <div className="font-semibold text-gray-900">{r.region}</div>
                    <div className="text-xs text-gray-500">{r.count.toLocaleString("fr-FR")} professionnels</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Villes les plus recherchées</h2>
            <p className="text-gray-600">Accédez directement aux professionnels de votre ville.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {topVilles.map((v) => (
            <Link
              key={v.ville_slug}
              href={`/transport-medical/recherche?q=${encodeURIComponent(v.ville)}`}
              className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition"
            >
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">{v.ville}</div>
                <div className="text-xs text-gray-500">{v.count} pros · {v.departement}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Comment trouver un transport sanitaire ?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Trois étapes simples pour contacter directement un professionnel agréé.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <Step
              n="01"
              icon={<Search className="w-5 h-5" />}
              title="Recherchez votre ville"
              desc="Tapez le nom de votre ville ou code postal dans le moteur de recherche ci-dessus."
            />
            <Step
              n="02"
              icon={<MapPin className="w-5 h-5" />}
              title="Choisissez un professionnel"
              desc="Parcourez les ambulanciers, VSL et taxis conventionnés disponibles dans votre secteur."
            />
            <Step
              n="03"
              icon={<Phone className="w-5 h-5" />}
              title="Appelez directement"
              desc="Numéros de téléphone cliquables. Aucune inscription ni commission. 100 % gratuit pour les patients."
            />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Trust
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Professionnels vérifiés"
            desc="Chaque pro est identifié par son SIRET et peut faire valider son agrément préfectoral pour obtenir le badge Pro vérifié."
          />
          <Trust
            icon={<Heart className="w-5 h-5" />}
            title="Gratuit pour les patients"
            desc="Aucun frais, aucune commission. RoullePro est un annuaire indépendant financé par les professionnels eux-mêmes."
          />
          <Trust
            icon={<Clock className="w-5 h-5" />}
            title="Données à jour"
            desc="L'annuaire est mis à jour en continu à partir des registres officiels et par les professionnels eux-mêmes."
          />
        </div>
      </section>

      {/* Nos guides : hubs nationaux thematiques (maillage interne SEO Phase 2) */}
      <section className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Nos guides</h2>
            <p className="text-gray-600 max-w-2xl">
              Tout comprendre sur le transport médical conventionné : modes de transport, prescription, tarifs et
              remboursement CPAM.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: "/taxi-conventionne", title: "Taxi conventionné", desc: "Tarifs convention CPAM, prescription, remboursement et annuaire par ville." },
              { href: "/vsl", title: "VSL — Véhicule Sanitaire Léger", desc: "Définition, indications médicales, tarif et remboursement du transport assis." },
              { href: "/transport-medical", title: "Transport médical", desc: "Ambulance, VSL, taxi conventionné : le guide complet et l'annuaire France entière." },
              { href: "/transport-sanitaire", title: "Transport sanitaire", desc: "Cadre légal, agrément ARS, spécialités et entreprises agréées." },
              { href: "/ambulance-autour-de-moi", title: "Ambulance autour de moi", desc: "Trouver une ambulance proche, bons réflexes en cas d'urgence et remboursement." },
              { href: "/transport-medical/dom/reunion", title: "Transport médical outre-mer", desc: "Réunion, Martinique, Guadeloupe, Mayotte : prise en charge CGSS / CSSM et démarches." },
            ].map((g) => (
              <Link
                key={g.href}
                href={g.href}
                className="group block bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-gray-900">{g.title}</h3>
                  <ChevronRight className="w-4 h-4 text-[#0066CC] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-sm text-gray-600">{g.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bande prescripteurs */}
      <section className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#0066CC]/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-[#0066CC]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#0066CC] uppercase tracking-wide mb-1">
                  Médecins, EHPAD, hôpitaux, centres de dialyse
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  Vous prescrivez du transport sanitaire ?
                </h2>
                <p className="text-sm sm:text-base text-gray-600 max-w-xl">
                  Accédez gratuitement à l’annuaire opérationnel pendant 3 mois. Sans engagement.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/prescripteurs"
                className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-3 rounded-xl transition"
              >
                Demander un accès pilote <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gradient-to-br from-[#0B1120] to-[#0f2048] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-14">
          <div className="grid md:grid-cols-[2fr_1fr] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-medium mb-4">
                <Building2 className="w-3.5 h-3.5" />
                Vous êtes un professionnel du transport sanitaire ?
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Réclamez votre fiche gratuitement
              </h2>
              <p className="text-blue-100 mb-6 max-w-xl">
                Gérez votre fiche, répondez aux demandes des patients, mettez en avant votre activité. Réclamation gratuite, validation sous 48 h après vérification de votre agrément.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/pro"
                  className="inline-flex items-center gap-2 bg-white text-[#0066CC] font-semibold px-5 py-3 rounded-xl hover:bg-blue-50 transition"
                >
                  Découvrir l'espace pro <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/annonces"
                  className="inline-flex items-center gap-2 border border-white/30 text-white font-medium px-5 py-3 rounded-xl hover:bg-white/10 transition"
                >
                  Marketplace véhicules pro
                </Link>
              </div>
            </div>
            <div className="hidden md:block bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-xs uppercase tracking-wide text-blue-200 mb-2">Écosystème RoullePro</div>
              <ul className="space-y-2 text-sm text-blue-100">
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-blue-300" /> Annuaire sanitaire gratuit</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-blue-300" /> Marketplace véhicules pro</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-blue-300" /> Dépôt-vente avec garages</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-blue-300" /> Vérification SIRET systématique</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function CategorieCard({
  href,
  icon,
  color,
  title,
  count,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  color: string;
  title: string;
  count: number;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group block bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${color}`}>
        {icon}
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-500">{count.toLocaleString("fr-FR")} pros</span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="inline-flex items-center gap-1 text-sm font-medium text-[#0066CC] group-hover:gap-2 transition-all">
        Voir les professionnels <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  );
}

function Step({ n, icon, title, desc }: { n: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066CC] flex items-center justify-center">{icon}</div>
        <div className="text-xs font-semibold text-gray-400">ÉTAPE {n}</div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}

function Trust({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066CC] flex items-center justify-center mb-3">{icon}</div>
      <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}
