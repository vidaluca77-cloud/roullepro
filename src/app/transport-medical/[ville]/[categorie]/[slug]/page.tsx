import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  MapPin,
  Phone,
  Shield,
  Globe,
  Mail,
  ChevronRight,
  BadgeCheck,
  Star,
  Cross,
  Car,
  Users,
  Lock,
  MessageCircle,
} from "lucide-react";
import { getCategorieBySlug, planDisplay, type ProSanitaire } from "@/lib/sanitaire-data";
import ContactProForm from "@/components/sanitaire/ContactProForm";
import TrackVue from "@/components/sanitaire/TrackVue";

export const revalidate = 1800;

type Props = {
  params: Promise<{ ville: string; categorie: string; slug: string }>;
};

async function fetchPro(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("pros_sanitaire")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data as ProSanitaire | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, ville } = await params;
  const pro = await fetchPro(slug);
  if (!pro) return { title: "Fiche introuvable" };
  const nom = pro.nom_commercial || pro.raison_sociale;
  return {
    title: `${nom} — ${pro.ville}`,
    description: pro.description
      ? pro.description.slice(0, 160)
      : `Transport sanitaire ${nom} à ${pro.ville}. Téléphone, adresse, horaires.`,
    alternates: { canonical: `/transport-medical/${ville}/${(await params).categorie}/${slug}` },
  };
}

export default async function FicheProPage({ params }: Props) {
  const { ville, categorie, slug } = await params;
  const pro = await fetchPro(slug);
  if (!pro) notFound();

  const cat = getCategorieBySlug(categorie);
  const isPremium = pro.plan === "premium" || pro.plan === "pro_plus";
  const plan = planDisplay(pro.plan);
  const showMessageForm = isPremium;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: pro.nom_commercial || pro.raison_sociale,
    telephone: pro.telephone_public || undefined,
    url: `https://roullepro.com/transport-medical/${ville}/${categorie}/${slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: pro.adresse || undefined,
      postalCode: pro.code_postal,
      addressLocality: pro.ville,
      addressCountry: "FR",
    },
    geo: pro.latitude && pro.longitude
      ? { "@type": "GeoCoordinates", latitude: pro.latitude, longitude: pro.longitude }
      : undefined,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TrackVue proId={pro.id} />

      <section className={`${isPremium ? "bg-gradient-to-br from-indigo-700 via-indigo-800 to-[#0066CC]" : "bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC]"} text-white`}>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4 flex-wrap">
            <Link href="/transport-medical" className="hover:text-white">Annuaire</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/transport-medical/${ville}`} className="hover:text-white">{pro.ville}</Link>
            <ChevronRight className="w-3 h-3" />
            {cat && (
              <>
                <Link href={`/transport-medical/${ville}/${categorie}`} className="hover:text-white">{cat.labelPluriel}</Link>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-white">{pro.nom_commercial || pro.raison_sociale}</span>
          </nav>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              {pro.categorie === "ambulance" ? (
                <Cross className="w-8 h-8 text-white" />
              ) : pro.categorie === "vsl" ? (
                <Car className="w-8 h-8 text-white" />
              ) : (
                <Users className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {pro.verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-white text-[#0066CC] px-2 py-0.5 rounded-full">
                    <BadgeCheck className="w-3 h-3" />
                    Pro vérifié
                  </span>
                )}
                {isPremium && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3" />
                    Recommandé
                  </span>
                )}
                {!pro.claimed && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-white/10 border border-white/20 text-white px-2 py-0.5 rounded-full">
                    <Shield className="w-3 h-3" />
                    Non vérifié
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">{pro.nom_commercial || pro.raison_sociale}</h1>
              {cat && <p className="text-blue-100 text-sm">{cat.label} · {pro.ville} ({pro.departement})</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {pro.description && isPremium && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">À propos</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{pro.description}</p>
            </div>
          )}

          {pro.photos && pro.photos.length > 0 && isPremium && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Photos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {pro.photos.slice(0, 20).map((url, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {pro.services && pro.services.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Services proposés</h2>
              <div className="flex flex-wrap gap-2">
                {pro.services.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full bg-blue-50 text-[#0066CC] text-sm">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contacter cette entreprise</h2>
            {showMessageForm ? (
              <ContactProForm proId={pro.id} proNom={pro.nom_commercial || pro.raison_sociale} />
            ) : (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <MessageCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Contact direct par téléphone</div>
                    <p className="text-sm text-gray-600">
                      {pro.telephone_public
                        ? "Appelez directement le professionnel aux coordonnées ci-dessous."
                        : "Ce professionnel n'a pas encore vérifié sa fiche. Utilisez la recherche pour trouver une alternative disponible à proximité."}
                    </p>
                  </div>
                </div>
                {pro.telephone_public && (
                  <a
                    href={`tel:${pro.telephone_public.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-3 rounded-xl transition w-full justify-center"
                  >
                    <Phone className="w-4 h-4" />
                    Appeler le {pro.telephone_public}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Coordonnées</h2>
            <div className="space-y-3">
              {pro.telephone_public && (
                <a
                  href={`tel:${pro.telephone_public.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition"
                >
                  <Phone className="w-5 h-5 text-[#0066CC]" />
                  <div>
                    <div className="text-xs text-gray-500">Téléphone</div>
                    <div className="font-semibold text-gray-900">{pro.telephone_public}</div>
                  </div>
                </a>
              )}
              {pro.adresse && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500">Adresse</div>
                    <div className="text-sm text-gray-900">
                      {pro.adresse}<br />
                      {pro.code_postal} {pro.ville}
                    </div>
                  </div>
                </div>
              )}
              {pro.site_web && isPremium && (
                <a
                  href={pro.site_web.startsWith("http") ? pro.site_web : `https://${pro.site_web}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                >
                  <Globe className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Site web</div>
                    <div className="text-sm text-[#0066CC] truncate">{pro.site_web.replace(/^https?:\/\//, "")}</div>
                  </div>
                </a>
              )}
              {pro.email_public && isPremium && (
                <a
                  href={`mailto:${pro.email_public}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                >
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-sm text-gray-900 truncate">{pro.email_public}</div>
                  </div>
                </a>
              )}
              <div className="text-xs text-gray-400 pt-3 border-t border-gray-100">
                SIRET : {pro.siret}
              </div>
            </div>
          </div>

          {!pro.claimed && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <Lock className="w-5 h-5 text-[#0066CC] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Vous êtes le gérant ?</div>
                  <p className="text-xs text-gray-600">Cette fiche n'a pas encore été réclamée. Récupérez-la pour ajouter photos, horaires et description.</p>
                </div>
              </div>
              <Link
                href={`/transport-medical/pro/reclamer?pro=${pro.id}`}
                className="block text-center bg-[#0066CC] hover:bg-[#0052a3] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
              >
                Réclamer ma fiche
              </Link>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
