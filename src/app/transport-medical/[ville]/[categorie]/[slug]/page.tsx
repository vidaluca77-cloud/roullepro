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
import {
  buildProJsonLd,
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
  buildFicheSeoText,
  getFicheFaq,
  getVillesVoisines,
} from "@/lib/sanitaire-seo";
import ContactProForm from "@/components/sanitaire/ContactProForm";
import TrackVue from "@/components/sanitaire/TrackVue";
import OwnerBanner from "@/components/sanitaire/OwnerBanner";

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
    .eq("actif", true)
    .eq("slug", slug)
    .maybeSingle();
  return data as ProSanitaire | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, ville, categorie } = await params;
  const pro = await fetchPro(slug);
  if (!pro) return { title: "Fiche introuvable" };
  const nom = pro.nom_commercial || pro.raison_sociale;
  const cat = getCategorieBySlug(categorie);
  const catLabel = cat?.label || "Transport sanitaire";
  const seo = buildFicheSeoText(pro);
  // Description meta : 2 premieres phrases du texte SEO, tronquees a 158 chars
  const metaDesc = (
    pro.description?.slice(0, 158) ||
    seo.paragraphes[0]?.slice(0, 158) ||
    `${catLabel} ${nom} à ${pro.ville}. Téléphone, adresse, horaires.`
  );
  return {
    title: `${nom} — ${catLabel} à ${pro.ville}`,
    description: metaDesc,
    alternates: { canonical: `/transport-medical/${ville}/${categorie}/${slug}` },
    openGraph: {
      title: `${nom} — ${catLabel} à ${pro.ville}`,
      description: metaDesc,
      type: "website",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${nom} — ${pro.ville}`,
      description: metaDesc,
    },
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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const villesVoisines = await getVillesVoisines(
    supabase,
    pro.latitude,
    pro.longitude,
    pro.ville_slug || ville,
    6,
    pro.departement
  );

  const seoText = buildFicheSeoText(pro, villesVoisines);
  const proLd = buildProJsonLd(pro, ville, categorie, slug, seoText.paragraphes.join(" "));
  const faqQuestions = getFicheFaq(pro);
  const faqLd = buildFaqJsonLd(faqQuestions);
  const breadLd = buildBreadcrumbJsonLd([
    { name: "Annuaire", url: "/transport-medical" },
    { name: pro.ville, url: `/transport-medical/${ville}` },
    { name: cat?.labelPluriel || "Fiche", url: `/transport-medical/${ville}/${categorie}` },
    {
      name: pro.nom_commercial || pro.raison_sociale,
      url: `/transport-medical/${ville}/${categorie}/${slug}`,
    },
  ]);

  return (
    <main className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(proLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }} />
      <TrackVue proId={pro.id} />
      <OwnerBanner proId={pro.id} claimedBy={pro.claimed_by || null} />

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
          <article className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">{seoText.titre}</h2>
            <div className="space-y-3">
              {seoText.paragraphes.map((p, i) => (
                <p key={i} className="text-gray-700 leading-relaxed">{p}</p>
              ))}
            </div>
          </article>

          {pro.description && isPremium && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Présentation par le professionnel</h2>
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
            <h2 className="text-lg font-bold text-gray-900 mb-1">Contacter cette entreprise</h2>
            {!isPremium && pro.telephone_public && (
              <p className="text-sm text-gray-600 mb-4">
                Pour une réponse immédiate, appelez directement. Vous pouvez aussi laisser un message ci-dessous.
              </p>
            )}
            {!isPremium && pro.telephone_public && (
              <a
                href={`tel:${pro.telephone_public.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-3 rounded-xl transition w-full justify-center mb-5"
              >
                <Phone className="w-4 h-4" />
                Appeler le {pro.telephone_public}
              </a>
            )}
            <ContactProForm proId={pro.id} proNom={pro.nom_commercial || pro.raison_sociale} />
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
              <p className="text-center mt-2">
                <Link
                  href="/transport-medical/inscription"
                  className="text-xs text-[#0066CC] hover:underline"
                >
                  Ou inscrire une autre entreprise
                </Link>
              </p>
            </div>
          )}
        </aside>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Questions fréquentes</h2>
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
        <section className="max-w-5xl mx-auto px-4 pb-12">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Transport sanitaire près de {pro.ville}</h2>
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
    </main>
  );
}
