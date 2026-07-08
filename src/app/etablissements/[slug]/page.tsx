import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, Building2 } from "lucide-react";
import {
  TYPES_ETABLISSEMENT,
  getTypeBySlug,
  getEtablissementBySlug,
  getSupabaseEtab,
  type EtablissementPublic,
} from "@/lib/etablissements-data";
import { buildBreadcrumbJsonLd, jsonLdHtml } from "@/lib/seo-schema";
import { FinessFooter } from "../FinessFooter";
import FicheEtablissement from "./FicheEtablissement";

export const revalidate = 86400;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

// Static : les 8 types + top 500 fiches par capacite (le reste en ISR).
export async function generateStaticParams() {
  const typeParams = TYPES_ETABLISSEMENT.map((t) => ({ slug: t.slug }));
  const supabase = getSupabaseEtab();
  const { data } = await supabase
    .from("etablissements_sante_public")
    .select("slug")
    .order("capacite_lits", { ascending: false, nullsFirst: false })
    .limit(500);
  const ficheParams = (data as { slug: string }[] | null)?.map((r) => ({ slug: r.slug })) ?? [];
  return [...typeParams, ...ficheParams];
}

// Les 100 plus grands de la categorie, tries capacite puis ville.
async function fetchTop(categorie: string): Promise<EtablissementPublic[]> {
  const supabase = getSupabaseEtab();
  const { data } = await supabase
    .from("etablissements_sante_public")
    .select(
      "id, raison_sociale, nom_court, nom_affichage, slug, categorie_simple, ville, ville_slug, departement, capacite_lits"
    )
    .eq("categorie_simple", categorie)
    .order("capacite_lits", { ascending: false, nullsFirst: false })
    .order("ville", { ascending: true })
    .limit(100);
  return (data as EtablissementPublic[]) ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = getTypeBySlug(slug);
  if (t) {
    return {
      title: `${t.labelPluriel} conventionnes en France — Annuaire RoullePro`,
      description: `Annuaire des ${t.labelPluriel.toLowerCase()} en France (donnees FINESS). Adresse, ville, taxi conventionne CPAM, VSL et ambulance vers chaque etablissement.`,
      alternates: { canonical: `/etablissements/${t.slug}` },
    };
  }
  const e = await getEtablissementBySlug(slug);
  if (!e) return {};
  const nom = e.nom_affichage || e.nom_court || e.raison_sociale;
  const ville = e.ville ? ` ${e.ville}` : "";
  const villeA = e.ville ? ` à ${e.ville}` : "";
  const titleLong = `Transport médical vers ${nom}${ville} — Taxi / VSL / Ambulance conventionné`;
  const titleCourt = `${nom}${ville} — Transport médical conventionné`;
  return {
    title: titleLong.length > 60 ? titleCourt : titleLong,
    description: `Organisez votre transport conventionné (taxi CPAM, VSL) pour vous rendre à ${nom}${villeA}. Prise en charge CPAM, tiers payant, réservation en ligne.`,
    alternates: { canonical: `/etablissements/${e.slug}` },
  };
}

export default async function EtablissementSlugPage({ params }: Props) {
  const { slug } = await params;

  // Cas 1 : le slug est un type connu → page categorie.
  const t = getTypeBySlug(slug);
  if (t) {
    const etablissements = await fetchTop(t.categorie);

    const villeCount = new Map<string, { ville: string; slug: string; nb: number }>();
    for (const e of etablissements) {
      if (!e.ville_slug || !e.ville) continue;
      const cur = villeCount.get(e.ville_slug) || { ville: e.ville, slug: e.ville_slug, nb: 0 };
      cur.nb += 1;
      villeCount.set(e.ville_slug, cur);
    }
    const villes = Array.from(villeCount.values())
      .filter((v) => v.nb >= 3)
      .sort((a, b) => b.nb - a.nb);

    const breadLd = buildBreadcrumbJsonLd([
      { label: "Accueil", href: "/" },
      { label: "Etablissements de sante", href: "/etablissements" },
      { label: t.labelPluriel, href: `/etablissements/${t.slug}` },
    ]);

    // ItemList JSON-LD : liste ordonnee des etablissements de la categorie.
    const itemListLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${t.labelPluriel} en France`,
      numberOfItems: etablissements.length,
      itemListElement: etablissements.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://roullepro.com/etablissements/${e.slug}`,
        name: e.nom_affichage || e.nom_court || e.raison_sociale,
      })),
    };

    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(itemListLd) }}
        />

        <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4">
              <Link href="/etablissements" className="hover:text-white">
                Etablissements
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">{t.labelPluriel}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">{t.labelPluriel} en France</h1>
            <p className="text-blue-100 max-w-2xl">{t.description}</p>
          </div>
        </section>

        {villes.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 pt-10">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Par ville</h2>
            <div className="flex flex-wrap gap-2">
              {villes.map((v) => (
                <Link
                  key={v.slug}
                  href={`/etablissements/${t.slug}/${v.slug}`}
                  className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-[#0066CC] text-sm px-3 py-1.5 rounded-full transition"
                >
                  {v.ville}
                  <span className="text-xs text-gray-500">· {v.nb}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {etablissements.length > 0
              ? `${t.labelPluriel} referencés`
              : `Aucun ${t.label.toLowerCase()} référencé pour l'instant`}
          </h2>
          {etablissements.length === 0 ? (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-gray-700">
              Cette categorie est en cours d&apos;enrichissement. Les etablissements apparaitront
              apres le prochain import FINESS.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {etablissements.map((e) => (
                <Link
                  key={e.id}
                  href={`/etablissements/${e.slug}`}
                  className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 transition hover:border-blue-200"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Building2 className="w-4 h-4 text-[#0066CC] mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {e.nom_affichage || e.nom_court || e.raison_sociale}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {e.ville}
                        {e.departement ? ` (${e.departement})` : ""}
                        {e.capacite_lits ? ` · ${e.capacite_lits} lits` : ""}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#0066CC] flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <FinessFooter />
      </main>
    );
  }

  // Cas 2 : le slug est une fiche etablissement.
  const e = await getEtablissementBySlug(slug);
  if (!e) notFound();
  return <FicheEtablissement e={e} />;
}
