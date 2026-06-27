import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, ShieldCheck, Phone, Clock } from "lucide-react";
import {
  getEtablissementBySlug,
  getSupabaseEtab,
  type EtablissementPublic,
} from "@/lib/etablissements-data";
import { buildBreadcrumbJsonLd, jsonLdHtml, BASE_URL } from "@/lib/seo-schema";
import { getNearbyTransporters, typeLabel } from "@/lib/nearby-transporters";
import DemandeTransportForm from "@/components/sanitaire/DemandeTransportForm";

export const revalidate = 86400;
export const dynamicParams = true;

// On pre-genere les 500 plus gros etablissements ; le reste est rendu a la demande (ISR).
export async function generateStaticParams() {
  const supabase = getSupabaseEtab();
  const { data } = await supabase
    .from("etablissements_sante_public")
    .select("slug, capacite_lits")
    .order("capacite_lits", { ascending: false, nullsFirst: false })
    .limit(500);
  return ((data as { slug: string }[]) ?? [])
    .filter((e) => e.slug)
    .map((e) => ({ slug: e.slug }));
}

// Autres etablissements de la meme ville, pour un maillage croise complet
// (lien vers la fiche et vers la page de transport de chacun).
async function fetchAutresEtablissements(
  e: EtablissementPublic
): Promise<EtablissementPublic[]> {
  if (!e.ville_slug) return [];
  const supabase = getSupabaseEtab();
  const { data } = await supabase
    .from("etablissements_sante_public")
    .select("id, raison_sociale, nom_court, nom_affichage, slug, categorie_simple, ville")
    .eq("ville_slug", e.ville_slug)
    .neq("id", e.id)
    .order("capacite_lits", { ascending: false, nullsFirst: false })
    .limit(5);
  return (data as EtablissementPublic[]) ?? [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEtablissementBySlug(slug);
  if (!e) return { title: "Transport médical" };
  const nom = e.nom_affichage || e.nom_court || e.raison_sociale;
  const ville = e.ville ? ` ${e.ville}` : "";
  const villeA = e.ville ? ` à ${e.ville}` : "";
  return {
    title: `Taxi VSL ambulance pour ${nom}${ville} — Conventionné CPAM`,
    description: `Réservez en ligne un taxi conventionné, VSL ou ambulance pour ${nom}${villeA}. Pris en charge CPAM, devis gratuit, professionnels agréés.`,
    alternates: { canonical: `/transport-medical/vers/${e.slug}` },
  };
}

export default async function TransportVersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = await getEtablissementBySlug(slug);
  if (!e) notFound();

  const nom = e.nom_affichage || e.nom_court || e.raison_sociale;
  const [autres, nearbyTransporters] = await Promise.all([
    fetchAutresEtablissements(e),
    getNearbyTransporters(e.latitude, e.longitude, e.slug, 10),
  ]);

  const breadLd = buildBreadcrumbJsonLd([
    { label: "Accueil", href: "/" },
    { label: "Transport medical", href: "/transport-medical" },
    { label: `Transport vers ${nom}`, href: `/transport-medical/vers/${e.slug}` },
  ]);

  const faq = [
    {
      q: `Comment reserver un transport vers ${nom} ?`,
      a: `Remplissez le formulaire ci-dessus en choisissant le type de transport (taxi conventionne, VSL ou ambulance). Votre demande est transmise aux professionnels agrees proches de ${
        e.ville || "l'etablissement"
      }, qui vous rappellent directement.`,
    },
    {
      q: "Le transport est-il rembourse par la Securite sociale ?",
      a: "Oui, sur prescription medicale, le transport en taxi conventionne, VSL ou ambulance est pris en charge par l'Assurance Maladie selon votre situation. Le tiers payant evite l'avance de frais avec les professionnels conventionnes.",
    },
    {
      q: "Quelle difference entre taxi conventionne, VSL et ambulance ?",
      a: "Le taxi conventionne et le VSL transportent un patient assis. L'ambulance transporte un patient allonge ou necessitant une surveillance medicale. Le choix depend de votre etat de sante et de la prescription.",
    },
  ];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const transporteursLd =
    nearbyTransporters.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Transporteurs conventionnés proches de ${nom}`,
          itemListElement: nearbyTransporters.map((tr, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${BASE_URL}/transport-medical/${tr.ville_slug}/${tr.type}/${tr.slug}`,
            name: tr.nom,
          })),
        }
      : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(faqLd) }}
      />
      {transporteursLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(transporteursLd) }}
        />
      )}

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4 flex-wrap">
            <Link href="/transport-medical" className="hover:text-white">
              Transport medical
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Transport vers {nom}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Réserver un transport médical vers {nom}
            {e.ville ? ` (${e.ville})` : ""}
          </h1>
          <p className="text-blue-100 max-w-2xl">
            Taxi conventionne CPAM, VSL ou ambulance vers {nom}
            {e.ville ? ` a ${e.ville}` : ""}. Indiquez votre besoin, votre demande est transmise
            aux transporteurs agrees de votre secteur.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Pourquoi passer par RoullePro ?
            </h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#0066CC] flex-shrink-0 mt-0.5" />
                Professionnels agrees et conventionnes, identifies par leur SIRET.
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#0066CC] flex-shrink-0 mt-0.5" />
                Mise en relation directe : les transporteurs vous rappellent.
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#0066CC] flex-shrink-0 mt-0.5" />
                Gratuit pour les patients, sans inscription ni commission.
              </li>
            </ul>
          </div>

          {(e.adresse || e.ville) && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Adresse de {nom}</h2>
              <p className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-[#0066CC] mt-0.5" />
                <span>
                  {e.adresse ? `${e.adresse}, ` : ""}
                  {e.code_postal} {e.ville}
                  {e.departement ? ` (${e.departement})` : ""}
                </span>
              </p>
              <Link
                href={`/etablissements/${e.slug}`}
                className="inline-flex items-center gap-1 text-sm text-[#0066CC] hover:underline mt-3"
              >
                Voir la fiche complete de {nom}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {autres.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                {autres.length} autre{autres.length > 1 ? "s" : ""} etablissement
                {autres.length > 1 ? "s" : ""}
                {e.ville ? ` a ${e.ville}` : ""}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Organisez aussi un transport conventionne vers ces etablissements proches.
              </p>
              <ul className="space-y-3">
                {autres.map((a) => {
                  const nomAutre = a.nom_affichage || a.nom_court || a.raison_sociale;
                  return (
                    <li
                      key={a.id}
                      className="flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                    >
                      <Link
                        href={`/etablissements/${a.slug}`}
                        className="text-sm font-medium text-gray-900 hover:text-[#0066CC]"
                      >
                        {nomAutre}
                      </Link>
                      <Link
                        href={`/transport-medical/vers/${a.slug}`}
                        className="inline-flex items-center gap-1 text-xs text-[#0066CC] hover:underline"
                      >
                        Taxi conventionne et VSL vers {nomAutre}
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {nearbyTransporters.length > 0 ? (
            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Transporteurs conventionnés proches de {nom}
              </h2>
              <p className="text-slate-600 mb-6">
                Voici les transporteurs sanitaires conventionnés CPAM les plus proches pour vous
                rendre à {nom}
                {e.ville ? `, ${e.ville}` : ""} — taxi conventionné, VSL ou ambulance selon votre
                prescription médicale.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nearbyTransporters.map((tr) => (
                  <Link
                    key={tr.slug}
                    href={`/transport-medical/${tr.ville_slug}/${tr.type}/${tr.slug}`}
                    className="block rounded-xl border border-gray-200 p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900">{tr.nom}</h3>
                      <span className="text-xs rounded bg-blue-50 px-2 py-1 text-blue-700 flex-shrink-0">
                        {tr.distance_km} km
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {tr.ville} — {typeLabel(tr.type)}
                    </p>
                    <span className="mt-3 inline-block text-sm text-blue-700">Voir la fiche →</span>
                  </Link>
                ))}
              </div>
              <p className="mt-6 text-sm text-slate-500">
                Tous les transporteurs listés sont conventionnés avec l&apos;Assurance Maladie
                (CPAM). Le tiers payant s&apos;applique sur présentation de votre prescription
                médicale.
              </p>
            </section>
          ) : (
            <section className="rounded-xl border border-gray-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Trouver un transporteur conventionné pour {nom}
              </h2>
              <p className="text-slate-600 mb-4">
                Aucun transporteur référencé dans notre annuaire à proximité immédiate. Consultez
                notre annuaire complet par ville :
              </p>
              <Link href="/transport-medical" className="text-blue-700 font-medium hover:underline">
                Voir tous les transporteurs →
              </Link>
            </section>
          )}

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Questions frequentes</h2>
            <div className="space-y-4">
              {faq.map((f) => (
                <div key={f.q}>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.q}</h3>
                  <p className="text-sm text-gray-600">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="md:sticky md:top-6 self-start">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <DemandeTransportForm
              sourcePage="transport-vers"
              etablissementId={e.id}
              departementCible={e.departement}
              villeCible={e.ville}
              titre={`Organiser mon transport vers ${nom}`}
            />
          </div>
        </aside>
      </section>
    </main>
  );
}
