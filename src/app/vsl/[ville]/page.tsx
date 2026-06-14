import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Car, ChevronRight, Shield, Phone, MapPin, BadgeCheck } from "lucide-react";
import { buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/sanitaire-seo";
import { type ProSanitaire } from "@/lib/sanitaire-data";
import { VSL_VILLES, getVslVille, type VslVille } from "@/data/vsl-villes";

export const revalidate = 3600;
export const dynamicParams = false;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";
const MAX_VSL_SSR = 60;

type Props = { params: Promise<{ ville: string }> };

export function generateStaticParams() {
  return VSL_VILLES.map((v) => ({ ville: v.slug }));
}

async function fetchVslForVille(villeSlug: string): Promise<ProSanitaire[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data, error } = await supabase
    .from("pros_sanitaire_public")
    .select("*")
    .eq("actif", true)
    .eq("suspendu", false)
    .eq("ville_slug", villeSlug)
    .eq("categorie", "vsl")
    .order("plan", { ascending: false })
    .order("claimed", { ascending: false })
    .order("raison_sociale")
    .limit(MAX_VSL_SSR);
  if (error) return [];
  return (data || []) as ProSanitaire[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville } = await params;
  const v = getVslVille(ville);
  if (!v) return {};
  const title = `VSL ${v.nom} — Véhicule Sanitaire Léger conventionné CPAM`;
  const description = `Trouvez un VSL agréé CPAM à ${v.nom}. Tarif convention, prescription, dispense d'avance des frais, véhicules adaptés. Annuaire vérifié.`;
  return {
    title,
    description,
    alternates: { canonical: `/vsl/${v.slug}` },
    openGraph: { title, description, type: "website", locale: "fr_FR" },
    twitter: { card: "summary", title, description },
  };
}

function buildIntro(v: VslVille): string {
  if (v.introOverride) return v.introOverride;
  const hops = v.hopitaux.slice(0, 3).join(", ");
  return `À ${v.nom} et dans le département ${v.departement} (${v.codeDepartement}), les sociétés de VSL (Véhicule Sanitaire Léger) assurent le transport assis des patients sur prescription médicale, pris en charge par la ${v.cpamLibelle}. Que ce soit pour des séances de dialyse, de chimiothérapie ou de radiothérapie, des consultations de suivi ou un retour d'hospitalisation depuis des établissements comme ${hops}, RoullePro centralise les coordonnées des entreprises agréées et conventionnées. Le VSL est conduit par un auxiliaire ambulancier formé aux premiers secours et permet la dispense d'avance des frais (tiers payant) : vous n'avancez pas les frais sur la part remboursée. Le tarif est encadré par la convention nationale CPAM 2025-2026, et la prise en charge atteint 100 % pour les patients en affection longue durée (ALD). Consultez ci-dessous les VSL référencés à ${v.nom} ou accédez à l'annuaire complet du transport sanitaire local.`;
}

function buildVilleFaq(v: VslVille): { question: string; answer: string }[] {
  return [
    {
      question: `Comment trouver un VSL conventionné CPAM à ${v.nom} ?`,
      answer: `Utilisez l'annuaire RoullePro ${v.nom} pour localiser les sociétés de VSL agréées et conventionnées par la ${v.cpamLibelle}. Chaque fiche indique le téléphone direct, la zone d'intervention et le statut de conventionnement, vérifié à partir des données publiques.`,
    },
    {
      question: `Le VSL est-il remboursé à ${v.nom} ?`,
      answer: `Oui. À ${v.nom} comme partout en France, le VSL prescrit par un médecin est remboursé à 100 % en cas d'affection longue durée (ALD), d'accident du travail ou d'hospitalisation, et à 65 % pour les autres motifs, le complément étant pris en charge par la mutuelle. La dispense d'avance des frais s'applique avec la carte Vitale et le bon de transport.`,
    },
    {
      question: `Quel est le tarif d'un VSL à ${v.nom} en 2026 ?`,
      answer: `Le tarif du VSL à ${v.nom} suit la convention nationale CPAM 2025-2026 : forfait de prise en charge de 13,50 € et indemnité kilométrique de 0,93 €/km en tarif A urbain, avec d'éventuelles majorations de nuit, dimanche et jours fériés selon le département ${v.codeDepartement}.`,
    },
    {
      question: `Faut-il une prescription pour un VSL à ${v.nom} ?`,
      answer: `Oui. La prescription médicale de transport (bon de transport, CERFA 11574*07) établie par le médecin traitant ou hospitalier est obligatoire. Le médecin coche le mode adapté à votre état — VSL, taxi conventionné ou ambulance — ce qui conditionne le remboursement par la ${v.cpamLibelle}.`,
    },
    {
      question: `Quelle différence entre VSL et taxi conventionné à ${v.nom} ?`,
      answer: `Le taxi conventionné transporte un patient autonome assis, sans qualification sanitaire du chauffeur. Le VSL relève du transport sanitaire agréé ARS : son conducteur est formé aux premiers secours et l'entreprise dispose d'un agrément spécifique. À ${v.nom}, le choix entre les deux est indiqué par le médecin selon votre état de santé.`,
    },
  ];
}

export default async function VslVillePage({ params }: Props) {
  const { ville } = await params;
  const v = getVslVille(ville);
  if (!v) notFound();

  const vslList = await fetchVslForVille(v.slug);
  const intro = buildIntro(v);
  const faq = buildVilleFaq(v);

  const faqLd = buildFaqJsonLd(faq);
  const breadLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "VSL", url: "/vsl" },
    { name: v.nom, url: `/vsl/${v.slug}` },
  ]);
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Transport sanitaire en VSL (Véhicule Sanitaire Léger)",
    name: `VSL conventionné CPAM à ${v.nom}`,
    description: `Annuaire des sociétés de VSL agréées et conventionnées CPAM à ${v.nom} (${v.departement}). Transport assis sur prescription, remboursé par la Sécurité sociale.`,
    provider: { "@type": "Organization", name: "RoullePro", url: BASE_URL },
    areaServed: { "@type": "City", name: v.nom },
    audience: { "@type": "Patient" },
    url: `${BASE_URL}/vsl/${v.slug}`,
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/vsl" className="hover:text-white">VSL</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{v.nom}</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-5">
            <Car className="w-3.5 h-3.5" />
            VSL conventionné CPAM · {v.departement} ({v.codeDepartement})
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            VSL {v.nom} — Véhicule Sanitaire Léger conventionné CPAM en {v.departement} {v.codeDepartement}
          </h1>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-10 prose prose-sm sm:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">
        <p className="lead">{intro}</p>

        <section id="definition">
          <h2>Qu'est-ce qu'un VSL ?</h2>
          <p>
            Le VSL (Véhicule Sanitaire Léger) est un véhicule agréé par l'ARS et conventionné CPAM, dédié au
            transport de patients en position assise ne nécessitant pas de surveillance médicale constante. Il est
            conduit par un auxiliaire ambulancier formé aux gestes de premiers secours. À {v.nom}, il complète
            l'offre d'ambulances et de taxis conventionnés du transport médical local.{" "}
            <Link href="/vsl">Voir le guide national complet du VSL</Link>.
          </p>
        </section>

        <section id="liste">
          <h2>Liste des VSL à {v.nom}</h2>
          {vslList.length > 0 ? (
            <div className="not-prose grid sm:grid-cols-2 gap-4 my-6">
              {vslList.map((pro) => (
                <Link
                  key={pro.id}
                  href={`/transport-medical/${v.slug}/vsl/${pro.slug}`}
                  className="block bg-white rounded-2xl p-5 border border-gray-200 hover:border-blue-200 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {pro.nom_commercial || pro.raison_sociale}
                      </div>
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
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    {pro.telephone_public ? (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-[#0066CC]">
                        <Phone className="w-3.5 h-3.5" />
                        {pro.telephone_public}
                      </span>
                    ) : null}
                    <span className="ml-auto text-xs text-[#0066CC] font-medium inline-flex items-center gap-0.5">
                      Voir la fiche <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="not-prose bg-blue-50 border border-blue-100 rounded-2xl p-6 my-6">
              <p className="text-gray-700 mb-3">
                L'annuaire des VSL de {v.nom} est en cours d'enrichissement. En attendant, consultez l'ensemble du
                transport sanitaire référencé localement.
              </p>
              <Link
                href={`/transport-medical/${v.slug}`}
                className="inline-flex items-center gap-1 text-sm text-[#0066CC] font-semibold hover:underline"
              >
                Voir le transport sanitaire à {v.nom}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
          <p>
            Vous pouvez aussi consulter l'ensemble des ambulances, VSL et taxis conventionnés de la ville sur la
            page <Link href={`/transport-medical/${v.slug}`}>transport sanitaire à {v.nom}</Link>, ou élargir au{" "}
            <Link href={`/transport-medical/departement/${v.codeDepartement}`}>
              département {v.codeDepartement}
            </Link>.
          </p>
        </section>

        <section id="tarif">
          <h2>Tarif et remboursement du VSL à {v.nom}</h2>
          <p>
            Le tarif du VSL à {v.nom} suit la convention nationale CPAM 2025-2026 : forfait de prise en charge de
            13,50 € et indemnité kilométrique de 0,93 €/km en tarif A urbain, avec d'éventuelles majorations de
            nuit, dimanche et jours fériés. La prise en charge par la {v.cpamLibelle} est de 100 % en cas d'ALD,
            d'accident du travail ou d'hospitalisation, et de 65 % pour les autres motifs. Grâce au tiers payant,
            vous présentez votre carte Vitale et le bon de transport sans avancer les frais. La franchise médicale
            de 4 € par trajet (plafonnée à 8 € par jour et 50 € par an) reste à votre charge.
          </p>
        </section>
      </article>

      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes — VSL à {v.nom}</h2>
          <div className="space-y-4">
            {faq.map((q, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-900 mb-1">{q.question}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white mb-4">
            <Shield className="w-3.5 h-3.5" />
            Annuaire public, gratuit, sans inscription
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Besoin d'un VSL à {v.nom} ?</h2>
          <p className="text-blue-100 mb-6 leading-relaxed">
            Consultez le transport sanitaire complet de votre ville : ambulances, VSL et taxis conventionnés.
          </p>
          <Link
            href={`/transport-medical/${v.slug}`}
            className="inline-flex items-center gap-2 bg-white text-[#0066CC] font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition"
          >
            Transport sanitaire à {v.nom}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
