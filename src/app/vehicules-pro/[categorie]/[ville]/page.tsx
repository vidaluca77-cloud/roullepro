import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowRight, Truck, MapPin, ShieldCheck } from "lucide-react";
import {
  CATEGORIES_SEO,
  VILLES_SEO,
  findCategorie,
  findVille,
} from "@/lib/seo-data";
import FAQSection from "@/components/FAQSection";

export const revalidate = 600;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

type Props = { params: Promise<{ categorie: string; ville: string }> };

export async function generateStaticParams() {
  const pairs: { categorie: string; ville: string }[] = [];
  for (const c of CATEGORIES_SEO) {
    for (const v of VILLES_SEO) {
      pairs.push({ categorie: c.slug, ville: v.slug });
    }
  }
  return pairs;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorie, ville } = await params;
  const cat = findCategorie(categorie);
  const v = findVille(ville);
  if (!cat || !v) return { title: "Page introuvable" };

  const title =
    cat.nomH1 + " a " + v.nom + " - Annonces verifiees | RoullePro";
  const description =
    "Trouvez un " +
    cat.nomPhrase +
    " d'occasion a " +
    v.nom +
    " (" +
    v.region +
    ") sur RoullePro. Vendeurs pros verifies SIRET, paiement sequestre Stripe, catalogue mis a jour en temps reel.";

  return {
    title,
    description,
    alternates: {
      canonical: APP_URL + "/vehicules-pro/" + cat.slug + "/" + v.slug,
    },
    openGraph: {
      title,
      description,
      url: APP_URL + "/vehicules-pro/" + cat.slug + "/" + v.slug,
      siteName: "RoullePro",
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default async function CategorieVilleSeoPage({ params }: Props) {
  const { categorie, ville } = await params;
  const cat = findCategorie(categorie);
  const v = findVille(ville);
  if (!cat || !v) notFound();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Recherche annonces de la categorie ET de la ville (matching insensible a la casse)
  const { data: annonces } = await supabase
    .from("annonces")
    .select(
      "id, title, price, city, images, annee, kilometrage, categories!inner(slug, name)",
    )
    .eq("status", "active")
    .eq("categories.slug", cat.slugBdd)
    .ilike("city", "%" + v.nom + "%")
    .order("created_at", { ascending: false })
    .limit(24);

  const items = annonces || [];
  const dateMaj = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const faq = [
    {
      question:
        "Ou trouver un " + cat.nomPhrase + " d'occasion a " + v.nom + " ?",
      answer:
        "RoullePro regroupe les annonces de " +
        cat.nomPhrase +
        " d'occasion a " +
        v.nom +
        " et dans toute la region " +
        v.region +
        ". Tous les vendeurs sont verifies SIRET, les annonces sont moderees sous 24 heures et le paiement est securise par sequestre Stripe.",
    },
    {
      question:
        "Comment vendre un " + cat.nomPhrase + " rapidement a " + v.nom + " ?",
      answer:
        "Vous pouvez deposer gratuitement une annonce apres verification SIRET, ou passer par notre service depot-vente avec un garage partenaire a " +
        v.nom +
        " qui prend en charge l'expertise, les photos, la publication et la gestion des visites.",
    },
    {
      question:
        "Y a-t-il un garage partenaire RoullePro a " + v.nom + " ?",
      answer:
        "Notre reseau de garages partenaires pour le service depot-vente se deploie progressivement sur tout le territoire francais, notamment a " +
        v.nom +
        " (" +
        v.region +
        "). Consultez la page depot-vente pour voir les garages disponibles dans votre region.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: APP_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: cat.nomH1,
            item: APP_URL + "/vehicules-pro/" + cat.slug,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: v.nom,
            item: APP_URL + "/vehicules-pro/" + cat.slug + "/" + v.slug,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: cat.nomH1 + " a " + v.nom,
        url: APP_URL + "/vehicules-pro/" + cat.slug + "/" + v.slug,
        description:
          "Annonces verifiees de " +
          cat.nomPhrase +
          " d'occasion a " +
          v.nom +
          " sur RoullePro.",
        inLanguage: "fr-FR",
        isPartOf: { "@id": APP_URL + "/#website" },
        dateModified: new Date().toISOString(),
        spatialCoverage: {
          "@type": "Place",
          name: v.nom,
          address: {
            "@type": "PostalAddress",
            addressLocality: v.nom,
            addressRegion: v.region,
            addressCountry: "FR",
          },
        },
      },
    ],
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-[#0B1120] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <nav className="text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-white">
              Accueil
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={"/vehicules-pro/" + cat.slug}
              className="hover:text-white"
            >
              {cat.nomH1}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{v.nom}</span>
          </nav>
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight max-w-3xl">
            {cat.nomH1} a {v.nom}
          </h1>
          <p className="mt-5 text-slate-300 text-lg max-w-2xl">
            Achetez ou vendez un {cat.nomPhrase} d'occasion a {v.nom} ({v.region}).
            Vendeurs pros verifies SIRET, paiement securise par sequestre Stripe,
            moderation manuelle 24 heures.
          </p>
          <div className="mt-6 text-xs text-slate-400">
            Mis a jour le {dateMaj} - {items.length} annonce
            {items.length > 1 ? "s" : ""} a {v.nom}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            Annonces a {v.nom}
          </h2>
          <Link
            href={"/vehicules-pro/" + cat.slug}
            className="text-sm text-slate-700 hover:text-blue-600 inline-flex items-center gap-1.5"
          >
            Voir toute la categorie
            <ArrowRight size={14} />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-12 text-center">
            <Truck size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 mb-4">
              Aucune annonce de {cat.nomPhrase} a {v.nom} pour le moment.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href={"/vehicules-pro/" + cat.slug}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
              >
                Voir toutes les annonces {cat.nomPhrase}
              </Link>
              <Link
                href="/deposer-annonce"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg ring-1 ring-slate-300 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Deposer une annonce
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map((a: any) => (
              <Link
                key={a.id}
                href={"/annonces/" + a.id}
                className="group block"
              >
                <div className="relative aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden ring-1 ring-slate-200">
                  {a.images?.[0] ? (
                    <img
                      src={a.images[0]}
                      alt={a.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Truck size={36} className="text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-slate-900 text-[15px] line-clamp-2 group-hover:text-blue-600">
                    {a.title}
                  </h3>
                  <div className="mt-1 text-sm text-slate-500 flex items-center gap-2">
                    {a.city && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} />
                        {a.city}
                      </span>
                    )}
                    {a.annee && <span>- {a.annee}</span>}
                  </div>
                  {a.price && (
                    <div className="mt-2 font-bold text-slate-900">
                      {Number(a.price).toLocaleString("fr-FR")} EUR
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 flex items-center gap-2 text-sm text-slate-600">
          <ShieldCheck size={16} className="text-blue-600" />
          Toutes les annonces sont verifiees SIRET et moderees sous 24 heures.
        </div>
      </section>

      {/* Autres villes */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {cat.nomH1} dans d'autres villes
          </h2>
          <div className="flex flex-wrap gap-2">
            {VILLES_SEO.filter((x) => x.slug !== v.slug).map((x) => (
              <Link
                key={x.slug}
                href={"/vehicules-pro/" + cat.slug + "/" + x.slug}
                className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 hover:ring-slate-900 text-xs text-slate-700 hover:text-slate-900 transition"
              >
                {cat.nomPhrase} {x.nom}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FAQSection
        title={"Questions frequentes - " + cat.nomH1 + " a " + v.nom}
        items={faq}
      />
    </div>
  );
}
