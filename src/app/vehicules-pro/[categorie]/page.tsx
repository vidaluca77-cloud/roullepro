import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowRight, Truck, MapPin, ShieldCheck, Lock } from "lucide-react";
import {
  CATEGORIES_SEO,
  VILLES_SEO,
  findCategorie,
} from "@/lib/seo-data";
import FAQSection from "@/components/FAQSection";

export const revalidate = 600; // 10 min

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

type Props = { params: Promise<{ categorie: string }> };

export async function generateStaticParams() {
  return CATEGORIES_SEO.map((c) => ({ categorie: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorie } = await params;
  const cat = findCategorie(categorie);
  if (!cat) return { title: "Page introuvable" };

  const title =
    cat.nomH1 + " - Annonces verifiees | RoullePro";
  const description =
    "Trouvez votre " +
    cat.nomPhrase +
    " d'occasion sur RoullePro. Vendeurs verifies SIRET, paiement sequestre Stripe, moderation 24h. Catalogue mis a jour en temps reel.";

  return {
    title,
    description,
    alternates: {
      canonical: APP_URL + "/vehicules-pro/" + cat.slug,
    },
    openGraph: {
      title,
      description,
      url: APP_URL + "/vehicules-pro/" + cat.slug,
      siteName: "RoullePro",
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default async function CategorieSeoPage({ params }: Props) {
  const { categorie } = await params;
  const cat = findCategorie(categorie);
  if (!cat) notFound();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: annonces } = await supabase
    .from("annonces")
    .select(
      "id, title, price, city, images, annee, kilometrage, categories!inner(slug, name)",
    )
    .eq("status", "active")
    .eq("categories.slug", cat.slugBdd)
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
      question: "Ou acheter un " + cat.nomPhrase + " d'occasion verifie ?",
      answer:
        "RoullePro est la plateforme specialisee pour l'achat de " +
        cat.nomPhrase +
        " d'occasion entre professionnels. Chaque vendeur est controle par son numero SIRET, les annonces sont moderees sous 24 heures et le paiement est securise par sequestre Stripe.",
    },
    {
      question: "Quel est le prix moyen d'un " + cat.nomPhrase + " d'occasion ?",
      answer:
        "Le prix varie selon l'annee, le kilometrage, les equipements et la region. Les annonces de la categorie " +
        cat.nomH1 +
        " sur RoullePro affichent le prix vendeur, negociable ou non, avec possibilite d'estimation gratuite via notre outil d'estimation.",
    },
    {
      question: "Comment vendre mon " + cat.nomPhrase + " rapidement ?",
      answer:
        "Deux options : (1) deposer une annonce gratuitement apres verification SIRET, (2) passer par notre service depot-vente dans l'un des garages partenaires qui prend en charge expertise, photos, publication et gestion des visites contre commission sur la vente.",
    },
    {
      question: "Les annonces sont-elles fiables ?",
      answer:
        "Oui. 100 pourcent des vendeurs sont verifies SIRET contre le registre INSEE. Chaque annonce est ensuite moderee manuellement avant publication. Le paiement sequestre Stripe bloque les fonds jusqu'a la remise effective du vehicule.",
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
            name: "Vehicules pro",
            item: APP_URL + "/vehicules-pro",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: cat.nomH1,
            item: APP_URL + "/vehicules-pro/" + cat.slug,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: cat.nomH1 + " sur RoullePro",
        url: APP_URL + "/vehicules-pro/" + cat.slug,
        description: cat.intro,
        inLanguage: "fr-FR",
        isPartOf: { "@id": APP_URL + "/#website" },
        dateModified: new Date().toISOString(),
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: items.length,
          itemListElement: items.slice(0, 10).map((a: any, i: number) => ({
            "@type": "ListItem",
            position: i + 1,
            url: APP_URL + "/annonces/" + a.id,
            name: a.title,
          })),
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

      {/* Hero */}
      <section className="bg-[#0B1120] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <nav className="text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-white">
              Accueil
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{cat.nomH1}</span>
          </nav>
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight max-w-3xl">
            {cat.nomH1}
          </h1>
          <p className="mt-5 text-slate-300 text-lg max-w-2xl leading-relaxed">
            {cat.intro}
          </p>
          <div className="mt-6 text-xs text-slate-400">
            Mis a jour le {dateMaj} - {items.length} annonce
            {items.length > 1 ? "s" : ""} active
            {items.length > 1 ? "s" : ""}
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-blue-400" />
              Vendeurs verifies SIRET
            </span>
            <span className="flex items-center gap-2">
              <Lock size={15} className="text-blue-400" />
              Paiement sequestre Stripe
            </span>
          </div>
        </div>
      </section>

      {/* Grille annonces */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            Annonces recentes
          </h2>
          <Link
            href={"/annonces/categorie/" + cat.slugBdd}
            className="text-sm text-slate-700 hover:text-blue-600 inline-flex items-center gap-1.5"
          >
            Voir toutes les annonces
            <ArrowRight size={14} />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-12 text-center">
            <Truck size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600">
              Aucune annonce active dans cette categorie pour le moment.
              Revenez bientot ou
              <Link
                href="/deposer-annonce"
                className="text-blue-600 font-medium ml-1 hover:underline"
              >
                deposez la premiere
              </Link>
              .
            </p>
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
      </section>

      {/* Liens villes */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            {cat.nomH1} par ville
          </h2>
          <p className="text-slate-600 mb-8 text-sm">
            Parcourez les annonces par agglomeration francaise.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {VILLES_SEO.map((v) => (
              <Link
                key={v.slug}
                href={"/vehicules-pro/" + cat.slug + "/" + v.slug}
                className="px-4 py-3 rounded-lg bg-white ring-1 ring-slate-200 hover:ring-slate-900 text-sm text-slate-800 hover:text-slate-900 transition"
              >
                {cat.nomPhrase} {v.nom}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mots cles connexes */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">
          Recherches frequentes
        </h2>
        <div className="flex flex-wrap gap-2">
          {cat.motsClesConnexes.map((mc) => (
            <Link
              key={mc}
              href={"/annonces?q=" + encodeURIComponent(mc)}
              className="inline-flex items-center px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white text-sm text-slate-700 transition"
            >
              {mc}
            </Link>
          ))}
        </div>
      </section>

      <FAQSection
        title={"Questions frequentes - " + cat.nomH1}
        items={faq}
      />
    </div>
  );
}
