import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { MapPin, Building2, ChevronRight, BadgeCheck, ShieldCheck } from "lucide-react";
import { getTypeEtablissement } from "@/lib/types-etablissements";
import { getComboMeta, getAllCombosFlat } from "@/lib/chantier-e-combos";
import { getNearbyTransporters } from "@/lib/nearby-transporters";
import { typeLabel } from "@/lib/nearby-transporters";

export const revalidate = 86400;

type Props = {
  params: Promise<{ type: string; ville: string }>;
};

// Mapping pour resoudre les mismatchs entre pros_sanitaire (saint-etienne)
// et etablissements_sante_public (st-etienne).
const VILLE_SLUG_FINESS_ALIASES: Record<string, string> = {
  "saint-etienne": "st-etienne",
  "saint-denis": "st-denis",
};

function aliasFiness(villeSlug: string): string {
  return VILLE_SLUG_FINESS_ALIASES[villeSlug] ?? villeSlug;
}

type Etab = {
  id: string;
  slug: string | null;
  nom_affichage: string | null;
  raison_sociale: string;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  telephone: string | null;
  capacite_lits: number | null;
  categorie_finess_libelle: string | null;
  latitude: number | null;
  longitude: number | null;
};

async function fetchEtablissementsByType(
  villeSlug: string,
  categorieSimple: string,
  limit = 30
): Promise<Etab[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const finessSlug = aliasFiness(villeSlug);
  const slugsToTry = Array.from(new Set([villeSlug, finessSlug]));
  const { data, error } = await supabase
    .from("etablissements_sante_public")
    .select(
      "id, slug, nom_affichage, raison_sociale, adresse, code_postal, ville, telephone, capacite_lits, categorie_finess_libelle, latitude, longitude"
    )
    .eq("categorie_simple", categorieSimple)
    .in("ville_slug", slugsToTry)
    .order("capacite_lits", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) return [];
  return (data || []) as Etab[];
}

export async function generateStaticParams() {
  return getAllCombosFlat().map(({ typeSlug, villeSlug }) => ({
    type: typeSlug,
    ville: villeSlug,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, ville } = await params;
  const typeMeta = getTypeEtablissement(type);
  const combo = getComboMeta(type, ville);
  if (!typeMeta || !combo) return { title: "Page introuvable" };
  const title = `Transport medical ${typeMeta.libellePluriel} ${combo.villeNom} | Taxi VSL Ambulance CPAM | RoullePro`;
  const description = typeMeta.metaDescriptionTemplate.replace("{ville}", combo.villeNom);
  const canonical = `https://roullepro.com/etablissements/type/${type}/${ville}/`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
  };
}

export default async function Page({ params }: Props) {
  const { type, ville } = await params;
  const typeMeta = getTypeEtablissement(type);
  const combo = getComboMeta(type, ville);
  if (!typeMeta || !combo) notFound();

  const etabs = await fetchEtablissementsByType(ville, typeMeta.categorieSimple, 30);

  // Recupere les transporteurs autour du premier etab geolocalise (echantillon de la ville).
  const etabRef = etabs.find((e) => e.latitude != null && e.longitude != null) ?? etabs[0];
  const transporteurs = etabRef
    ? await getNearbyTransporters(
        etabRef.latitude,
        etabRef.longitude,
        `hub-${type}-${ville}`,
        12,
        ville,
        null
      )
    : [];

  const villeNom = combo.villeNom;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://roullepro.com/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Etablissements de sante",
        item: "https://roullepro.com/etablissements/",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${typeMeta.libellePluriel} ${villeNom}`,
        item: `https://roullepro.com/etablissements/type/${type}/${ville}/`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0066CC] to-[#0052a3] text-white py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <nav className="text-sm text-blue-100 mb-4 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:underline">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/etablissements/" className="hover:underline">Etablissements de sante</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{typeMeta.libellePluriel} {villeNom}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Transport medical vers {typeMeta.articleDefini} de {villeNom}
          </h1>
          <p className="text-lg text-blue-50 max-w-3xl">
            {combo.nbEtabs} {typeMeta.libellePluriel.toLowerCase()} recenses a {villeNom}. Trouvez un taxi conventionne, VSL ou ambulance pour vos trajets vers ces etablissements, avec prise en charge CPAM.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full">
              <ShieldCheck className="w-4 h-4" /> Conventionne Assurance Maladie
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full">
              <Building2 className="w-4 h-4" /> Source FINESS officielle
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full">
              <BadgeCheck className="w-4 h-4" /> Tiers payant CPAM
            </span>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {typeMeta.libellePluriel} a {villeNom} : transport conventionne CPAM
          </h2>
          <p className="text-gray-700 leading-relaxed">{typeMeta.introContexte}</p>
          <p className="text-gray-700 leading-relaxed mt-4">
            Sur prescription medicale, le transport vers {typeMeta.articleDefini} de {villeNom} est pris en charge a 100% par l&apos;Assurance Maladie via le tiers payant. RoullePro vous permet de comparer les transporteurs conventionnes les plus proches et de reserver directement.
          </p>
        </div>
      </section>

      {/* Liste etablissements */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {typeMeta.libellePluriel} a {villeNom}
          </h2>
          {etabs.length === 0 ? (
            <p className="text-gray-600">Aucun etablissement actuellement reference. Vous etes un professionnel ou un gestionnaire d&apos;etablissement ? <Link href="/contact" className="text-[#0066CC] hover:underline">Contactez-nous</Link>.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {etabs.map((e) => (
                <li key={e.id}>
                  {e.slug ? (
                    <Link
                      href={`/etablissements/${e.slug}/`}
                      className="block bg-white rounded-2xl p-5 border border-gray-200 hover:border-blue-200 hover:shadow-md transition"
                    >
                      <div className="font-semibold text-gray-900 mb-1.5">{e.nom_affichage || e.raison_sociale}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mb-1.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{e.adresse}{e.code_postal ? `, ${e.code_postal}` : ""} {e.ville}</span>
                      </div>
                      {e.categorie_finess_libelle && (
                        <div className="text-xs text-gray-400 mt-1.5">{e.categorie_finess_libelle}</div>
                      )}
                      {e.capacite_lits != null && e.capacite_lits > 0 && (
                        <div className="text-xs text-gray-500 mt-1">Capacite : {e.capacite_lits} lits</div>
                      )}
                    </Link>
                  ) : (
                    <div className="block bg-white rounded-2xl p-5 border border-gray-200">
                      <div className="font-semibold text-gray-900 mb-1.5">{e.nom_affichage || e.raison_sociale}</div>
                      <div className="text-xs text-gray-500">{e.adresse}, {e.code_postal} {e.ville}</div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Transporteurs conventionnes */}
      {transporteurs.length > 0 && (
        <section className="py-10 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Transporteurs conventionnes CPAM a {villeNom}
            </h2>
            <p className="text-gray-600 mb-6">
              Taxi conventionne, VSL et ambulance pour vos trajets vers {typeMeta.articleDefini} de {villeNom}.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {transporteurs.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/transport-medical/${t.ville_slug}/${t.type}/${t.slug}/`}
                    className="block bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-200 hover:bg-white transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{t.nom}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{typeLabel(t.type)} - {t.ville}</div>
                      </div>
                      {t.verifie && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                          <BadgeCheck className="w-3 h-3" /> Verifie
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CTA pros + maillage */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Vous etes transporteur a {villeNom} ?
            </h2>
            <p className="text-gray-600 mb-4">
              Inscrivez votre societe de taxi conventionne, VSL ou ambulance sur RoullePro et soyez visible aupres des {typeMeta.libellePluriel.toLowerCase()} et patients de votre zone.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/inscription"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold rounded-xl transition"
              >
                Referencer mon entreprise
              </Link>
              <Link
                href={`/transport-medical/${ville}/`}
                className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-xl transition"
              >
                Voir tous les transporteurs {villeNom}
              </Link>
            </div>
          </div>

          {/* Maillage : autres types dans la meme ville */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Autres etablissements a {villeNom}
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { slug: "ehpad", label: "EHPAD" },
                { slug: "hopital", label: "Hopitaux" },
                { slug: "clinique", label: "Cliniques" },
                { slug: "centre-dialyse", label: "Dialyse" },
                { slug: "rehabilitation", label: "Reeducation" },
              ]
                .filter((t) => t.slug !== type)
                .filter((t) => getComboMeta(t.slug, ville))
                .map((t) => (
                  <Link
                    key={t.slug}
                    href={`/etablissements/type/${t.slug}/${ville}/`}
                    className="inline-flex items-center px-4 py-2 text-sm bg-white border border-gray-300 rounded-full text-gray-700 hover:border-blue-300 hover:text-blue-700 transition"
                  >
                    {t.label} a {villeNom}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
