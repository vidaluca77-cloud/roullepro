import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, Building2 } from "lucide-react";
import {
  getTypeBySlug,
  getSupabaseEtab,
  type EtablissementPublic,
} from "@/lib/etablissements-data";
import { buildBreadcrumbJsonLd } from "@/lib/seo-schema";
import { FinessFooter } from "../../FinessFooter";

export const revalidate = 86400;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string; ville: string }> };

// Top 500 combinaisons (type, ville) en static ; le reste en ISR a la demande.
export async function generateStaticParams() {
  const supabase = getSupabaseEtab();
  const { data } = await supabase
    .from("etablissements_sante_public")
    .select("categorie_simple, ville_slug")
    .not("ville_slug", "is", null)
    .limit(5000);
  if (!data) return [];

  const { getTypeByCategorie } = await import("@/lib/etablissements-data");
  const seen = new Map<string, { slug: string; ville: string }>();
  for (const row of data as { categorie_simple: string; ville_slug: string }[]) {
    const t = getTypeByCategorie(row.categorie_simple);
    if (!t || !row.ville_slug) continue;
    const key = `${t.slug}/${row.ville_slug}`;
    if (!seen.has(key)) seen.set(key, { slug: t.slug, ville: row.ville_slug });
    if (seen.size >= 500) break;
  }
  return Array.from(seen.values());
}

async function fetchEtablissements(
  categorie: string,
  villeSlug: string
): Promise<EtablissementPublic[]> {
  const supabase = getSupabaseEtab();
  const { data } = await supabase
    .from("etablissements_sante_public")
    .select(
      "id, raison_sociale, nom_court, slug, categorie_simple, adresse, code_postal, ville, ville_slug, departement, capacite_lits"
    )
    .eq("categorie_simple", categorie)
    .eq("ville_slug", villeSlug)
    .order("capacite_lits", { ascending: false, nullsFirst: false })
    .limit(100);
  return (data as EtablissementPublic[]) ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, ville } = await params;
  const t = getTypeBySlug(slug);
  if (!t) return {};
  const etabs = await fetchEtablissements(t.categorie, ville);
  const nomVille = etabs[0]?.ville || ville;
  return {
    title: `${t.labelPluriel} a ${nomVille} — Taxi conventionne et VSL | RoullePro`,
    description: `${t.labelPluriel} a ${nomVille} (donnees FINESS). Adresse, capacite, et organisation du transport medical conventionne CPAM (taxi, VSL, ambulance).`,
    alternates: { canonical: `/etablissements/${t.slug}/${ville}` },
  };
}

export default async function TypeVillePage({ params }: Props) {
  const { slug, ville } = await params;
  const t = getTypeBySlug(slug);
  if (!t) notFound();

  const etablissements = await fetchEtablissements(t.categorie, ville);
  if (etablissements.length === 0) notFound();

  const nomVille = etablissements[0]?.ville || ville;
  const departement = etablissements[0]?.departement || "";

  const breadLd = buildBreadcrumbJsonLd([
    { label: "Accueil", href: "/" },
    { label: "Etablissements de sante", href: "/etablissements" },
    { label: t.labelPluriel, href: `/etablissements/${t.slug}` },
    { label: nomVille, href: `/etablissements/${t.slug}/${ville}` },
  ]);

  // ItemList JSON-LD : liste ordonnee des etablissements de la ville.
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${t.labelPluriel} a ${nomVille}`,
    numberOfItems: etablissements.length,
    itemListElement: etablissements.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.roullepro.com/etablissements/${e.slug}`,
      name: e.nom_court || e.raison_sociale,
    })),
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4">
            <Link href="/etablissements" className="hover:text-white">
              Etablissements
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/etablissements/${t.slug}`} className="hover:text-white">
              {t.labelPluriel}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{nomVille}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            {t.labelPluriel} conventionnes a {nomVille}
          </h1>
          <p className="text-blue-100">
            {etablissements.length} etablissement{etablissements.length > 1 ? "s" : ""}
            {departement ? ` · Departement ${departement}` : ""}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-3">
          {etablissements.map((e) => {
            const nomEtab = e.nom_court || e.raison_sociale;
            return (
              <div
                key={e.id}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 transition hover:border-blue-200"
              >
                <Link
                  href={`/etablissements/${e.slug}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Building2 className="w-4 h-4 text-[#0066CC] mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">{nomEtab}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {e.adresse ? `${e.adresse}, ` : ""}
                        {e.code_postal} {e.ville}
                        {e.capacite_lits ? ` · ${e.capacite_lits} lits` : ""}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#0066CC] flex-shrink-0" />
                </Link>
                <Link
                  href={`/transport-medical/vers/${e.slug}`}
                  className="inline-flex items-center gap-1 text-xs text-[#0066CC] hover:underline mt-2 ml-7"
                >
                  Taxi conventionne et VSL vers {nomEtab}
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <FinessFooter />
    </main>
  );
}
