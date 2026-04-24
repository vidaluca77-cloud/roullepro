import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { MapPin, Phone, Shield, Cross, Car, Users, ChevronRight, Star, BadgeCheck } from "lucide-react";
import {
  CATEGORIES_SANITAIRE,
  getCategorieByKey,
  deslugifyVille,
  planDisplay,
  type ProSanitaire,
} from "@/lib/sanitaire-data";
import {
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
  getVilleFaq,
  getVillesVoisines,
} from "@/lib/sanitaire-seo";

export const revalidate = 3600;

type Props = {
  params: Promise<{ ville: string }>;
};

// Limite à 150 fiches max en SSR pour éviter le bloat HTML sur les grandes villes
// (Paris, Strasbourg, etc.). Au-delà, l'utilisateur navigue par catégorie.
const MAX_PROS_PER_VILLE_SSR = 150;
const MAX_PROS_PER_CATEGORIE_SSR = 50;

async function fetchProsForVille(villeSlug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data, error } = await supabase
    .from("pros_sanitaire")
    .select("*")
    .eq("actif", true)
    .eq("ville_slug", villeSlug)
    .order("plan", { ascending: false })
    .order("claimed", { ascending: false })
    .order("raison_sociale")
    .limit(MAX_PROS_PER_VILLE_SSR);
  if (error) return [];
  return (data || []) as ProSanitaire[];
}

async function countProsForVille(villeSlug: string): Promise<number> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { count } = await supabase
    .from("pros_sanitaire")
    .select("*", { count: "exact", head: true })
    .eq("actif", true)
    .eq("ville_slug", villeSlug);
  return count ?? 0;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville } = await params;
  const nomVille = deslugifyVille(ville);
  const pros = await fetchProsForVille(ville);

  if (pros.length === 0) {
    return {
      title: `Transport sanitaire à ${nomVille}`,
      description: `Ambulances, VSL et taxis conventionnés à ${nomVille}. Annuaire gratuit.`,
      alternates: { canonical: `/transport-medical/${ville}` },
    };
  }

  return {
    title: `Ambulance, VSL, Taxi conventionné à ${nomVille} — ${pros.length} pros`,
    description: `Trouvez ${pros.length} professionnels du transport sanitaire à ${nomVille} : ambulances, VSL, taxis conventionnés. Numéros directs, horaires, remboursement Sécurité sociale.`,
    alternates: { canonical: `/transport-medical/${ville}` },
    openGraph: {
      title: `Transport sanitaire à ${nomVille} — ${pros.length} professionnels`,
      description: `Annuaire complet des ambulances, VSL et taxis conventionnés à ${nomVille}.`,
      type: "website",
    },
  };
}

export default async function VillePage({ params }: Props) {
  const { ville } = await params;
  const [pros, totalCount] = await Promise.all([
    fetchProsForVille(ville),
    countProsForVille(ville),
  ]);

  if (pros.length === 0) {
    const nomVille = deslugifyVille(ville);
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Link href="/transport-medical" className="inline-flex items-center gap-1 text-sm text-[#0066CC] hover:underline mb-6">
            ← Retour à l'annuaire
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Transport sanitaire à {nomVille}</h1>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <p className="text-gray-700 mb-4">
              Aucun professionnel référencé à {nomVille} pour l'instant. L'annuaire est en cours
              d'enrichissement — les pros de votre ville apparaîtront sous peu.
            </p>
            <p className="text-sm text-gray-600">
              Vous êtes ambulancier, VSL ou taxi conventionné à {nomVille} ?{" "}
              <Link href="/transport-medical/pro" className="text-[#0066CC] font-medium hover:underline">
                Inscrivez votre entreprise
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    );
  }

  const nomVille = pros[0].ville;
  const departement = pros[0].departement;
  const region = pros[0].region;

  const groupedFull = {
    ambulance: pros.filter((p) => p.categorie === "ambulance"),
    vsl: pros.filter((p) => p.categorie === "vsl"),
    taxi_conventionne: pros.filter((p) => p.categorie === "taxi_conventionne"),
  };
  const grouped = {
    ambulance: groupedFull.ambulance.slice(0, MAX_PROS_PER_CATEGORIE_SSR),
    vsl: groupedFull.vsl.slice(0, MAX_PROS_PER_CATEGORIE_SSR),
    taxi_conventionne: groupedFull.taxi_conventionne.slice(0, MAX_PROS_PER_CATEGORIE_SSR),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Transport sanitaire à ${nomVille}`,
    description: `Annuaire des ambulances, VSL et taxis conventionnés à ${nomVille}`,
    url: `https://roullepro.com/transport-medical/${ville}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: pros.length,
      itemListElement: pros.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "LocalBusiness",
          name: p.nom_commercial || p.raison_sociale,
          telephone: p.telephone_public || undefined,
          address: {
            "@type": "PostalAddress",
            streetAddress: p.adresse || undefined,
            postalCode: p.code_postal,
            addressLocality: p.ville,
            addressCountry: "FR",
          },
        },
      })),
    },
  };

  const faqQuestions = getVilleFaq(nomVille, pros.length);
  const faqLd = buildFaqJsonLd(faqQuestions);
  const breadLd = buildBreadcrumbJsonLd([
    { name: "Annuaire", url: "/transport-medical" },
    { name: nomVille, url: `/transport-medical/${ville}` },
  ]);

  const firstWithGeo = pros.find((p) => p.latitude && p.longitude);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const villesVoisines = firstWithGeo
    ? await getVillesVoisines(
        supabase,
        firstWithGeo.latitude,
        firstWithGeo.longitude,
        ville,
        8
      )
    : [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }} />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4">
            <Link href="/transport-medical" className="hover:text-white">Annuaire</Link>
            <ChevronRight className="w-3 h-3" />
            <span>{region}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{nomVille}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Transport sanitaire à {nomVille}
          </h1>
          <p className="text-blue-100">
            {totalCount} professionnels référencés · Département {departement} · {region}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES_SANITAIRE.map((cat) => {
              const count = grouped[cat.key].length;
              if (count === 0) return null;
              return (
                <Link
                  key={cat.slug}
                  href={`/transport-medical/${ville}/${cat.slug}`}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-1.5 text-sm"
                >
                  {cat.labelPluriel} · {count}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="prose prose-sm max-w-none text-gray-700 mb-8">
          <p className="leading-relaxed">
            L'annuaire RoullePro recense <strong>{pros.length} professionnels du transport sanitaire
            à {nomVille}</strong> ({departement}, {region}) : {grouped.ambulance.length} ambulance{grouped.ambulance.length > 1 ? "s" : ""},{" "}
            {grouped.vsl.length} VSL et {grouped.taxi_conventionne.length} taxi{grouped.taxi_conventionne.length > 1 ? "s" : ""} conventionné{grouped.taxi_conventionne.length > 1 ? "s" : ""}.
            Chaque fiche est identifiée par un numéro SIRET officiel. Les transports en ambulance, VSL et
            taxi conventionné sont pris en charge par la Sécurité sociale sur prescription médicale,
            avec tiers payant : vous n'avancez pas les frais.
          </p>
          <p className="leading-relaxed mt-3">
            Les ambulances assurent les transports médicalisés (urgences, patients allongés) avec un
            équipage diplômé (DEA). Les VSL prennent en charge les patients stables en position assise.
            Les taxis conventionnés transportent les patients autonomes vers leur lieu de soins. Tous
            doivent être agréés par l'ARS (ambulances, VSL) ou la CPAM (taxis).
          </p>
        </div>

        {(["ambulance", "vsl", "taxi_conventionne"] as const).map((key) => {
          const cat = getCategorieByKey(key);
          const list = grouped[key];
          const totalInCat = groupedFull[key].length;
          if (!cat || list.length === 0) return null;
          const hasMore = totalInCat > list.length;
          return (
            <section key={key} className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  {key === "ambulance" ? (
                    <Cross className="w-5 h-5 text-[#0066CC]" />
                  ) : key === "vsl" ? (
                    <Car className="w-5 h-5 text-[#0066CC]" />
                  ) : (
                    <Users className="w-5 h-5 text-[#0066CC]" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {cat.labelPluriel} à {nomVille} ({totalInCat})
                  </h2>
                  <p className="text-xs text-gray-500">{cat.description}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {list.map((pro) => (
                  <ProCard key={pro.id} pro={pro} villeSlug={ville} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-6 text-center">
                  <Link
                    href={`/transport-medical/${ville}/${cat.slug}`}
                    className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-medium px-5 py-2.5 rounded-xl transition"
                  >
                    Voir les {totalInCat} {cat.labelPluriel.toLowerCase()} à {nomVille}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </section>
          );
        })}
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes — {nomVille}</h2>
          <div className="space-y-4">
            {faqQuestions.map((q, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-900 mb-1">{q.question}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {villesVoisines.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Transport sanitaire près de {nomVille}</h2>
            <p className="text-sm text-gray-600 mb-4">Villes voisines avec des professionnels référencés.</p>
            <div className="flex flex-wrap gap-2">
              {villesVoisines.map((v) => (
                <Link
                  key={v.ville_slug}
                  href={`/transport-medical/${v.ville_slug}`}
                  className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-[#0066CC] text-sm px-3 py-1.5 rounded-full transition"
                >
                  {v.ville}
                  <span className="text-xs text-gray-500">· {v.nb}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-gray-50 py-10 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vous êtes pro à {nomVille} ?</h2>
          <p className="text-gray-600 mb-4">Votre fiche est déjà pré-remplie. Récupérez-la gratuitement en 2 minutes.</p>
          <Link
            href="/transport-medical/pro"
            className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-3 rounded-xl transition"
          >
            Réclamer ma fiche
          </Link>
        </div>
      </section>
    </main>
  );
}

function ProCard({ pro, villeSlug }: { pro: ProSanitaire; villeSlug: string }) {
  const plan = planDisplay(pro.plan);
  const isPremium = pro.plan === "premium" || pro.plan === "pro_plus";
  const cat = getCategorieByKey(pro.categorie);
  return (
    <Link
      href={`/transport-medical/${villeSlug}/${cat?.slug || "fiche"}/${pro.slug}`}
      className={`block bg-white rounded-2xl p-5 border transition hover:shadow-lg ${
        isPremium ? "border-indigo-300 ring-1 ring-indigo-200" : "border-gray-200 hover:border-blue-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">{pro.nom_commercial || pro.raison_sociale}</div>
          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {pro.adresse ? `${pro.adresse}, ${pro.code_postal} ${pro.ville}` : `${pro.code_postal} ${pro.ville}`}
          </div>
        </div>
        {pro.verified && (
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-[#0066CC] px-2 py-0.5 rounded-full flex-shrink-0">
            <BadgeCheck className="w-3 h-3" />
            Vérifié
          </span>
        )}
        {isPremium && !pro.verified && (
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full flex-shrink-0">
            <Star className="w-3 h-3" />
            Recommandé
          </span>
        )}
      </div>

      {pro.description && isPremium ? (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{pro.description}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 mt-3">
        {pro.telephone_public ? (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-[#0066CC]">
            <Phone className="w-3.5 h-3.5" />
            {pro.telephone_public}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <Shield className="w-3 h-3" />
            {plan.label}
          </span>
        )}
        <span className="ml-auto text-xs text-[#0066CC] font-medium inline-flex items-center gap-0.5">
          Voir la fiche <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
