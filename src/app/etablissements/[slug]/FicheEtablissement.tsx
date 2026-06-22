import Link from "next/link";
import { ChevronRight, MapPin, Phone, Globe, BedDouble, Car } from "lucide-react";
import {
  getTypeByCategorie,
  getSupabaseEtab,
  formatSourceDate,
  type EtablissementPublic,
} from "@/lib/etablissements-data";
import { buildBreadcrumbJsonLd } from "@/lib/seo-schema";
import { FinessFooter } from "../page";

// JSON-LD : Hospital / MedicalClinic / NursingHome selon la categorie.
function schemaType(categorie: string): string {
  if (categorie === "ehpad") return "NursingHome";
  if (categorie === "clinique") return "MedicalClinic";
  return "Hospital";
}

async function fetchSimilaires(
  e: EtablissementPublic
): Promise<EtablissementPublic[]> {
  if (!e.ville_slug) return [];
  const supabase = getSupabaseEtab();
  const { data } = await supabase
    .from("etablissements_sante_public")
    .select("id, raison_sociale, nom_court, slug, categorie_simple, ville")
    .eq("ville_slug", e.ville_slug)
    .neq("id", e.id)
    .limit(6);
  return (data as EtablissementPublic[]) ?? [];
}

export default async function FicheEtablissement({ e }: { e: EtablissementPublic }) {
  const t = getTypeByCategorie(e.categorie_simple);
  const nom = e.nom_court || e.raison_sociale;
  const similaires = await fetchSimilaires(e);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType(e.categorie_simple),
    name: e.raison_sociale,
    url: `https://www.roullepro.com/etablissements/${e.slug}`,
    telephone: e.telephone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: e.adresse || undefined,
      postalCode: e.code_postal || undefined,
      addressLocality: e.ville || undefined,
      addressRegion: e.region || undefined,
      addressCountry: "FR",
    },
    ...(e.latitude && e.longitude
      ? { geo: { "@type": "GeoCoordinates", latitude: e.latitude, longitude: e.longitude } }
      : {}),
  };

  const breadLd = buildBreadcrumbJsonLd([
    { label: "Accueil", href: "/" },
    { label: "Etablissements de sante", href: "/etablissements" },
    ...(t ? [{ label: t.labelPluriel, href: `/etablissements/${t.slug}` }] : []),
    { label: nom, href: `/etablissements/${e.slug}` },
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }} />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4 flex-wrap">
            <Link href="/etablissements" className="hover:text-white">
              Etablissements
            </Link>
            {t && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link href={`/etablissements/${t.slug}`} className="hover:text-white">
                  {t.labelPluriel}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{nom}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{nom}</h1>
          {t && <p className="text-blue-100">{e.categorie_finess_libelle || t.label}</p>}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Informations</h2>
            <dl className="space-y-3 text-sm">
              {(e.adresse || e.ville) && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#0066CC] mt-0.5" />
                  <dd className="text-gray-700">
                    {e.adresse ? `${e.adresse}, ` : ""}
                    {e.code_postal} {e.ville}
                    {e.departement ? ` (${e.departement})` : ""}
                  </dd>
                </div>
              )}
              {e.telephone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#0066CC]" />
                  <dd className="text-gray-700">{e.telephone}</dd>
                </div>
              )}
              {e.site_web && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#0066CC]" />
                  <dd>
                    <a
                      href={e.site_web}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-[#0066CC] hover:underline break-all"
                    >
                      {e.site_web}
                    </a>
                  </dd>
                </div>
              )}
              {e.capacite_lits != null && (
                <div className="flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-[#0066CC]" />
                  <dd className="text-gray-700">{e.capacite_lits} lits</dd>
                </div>
              )}
            </dl>
          </div>

          {similaires.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Etablissements similaires a {e.ville}
              </h2>
              <div className="space-y-2">
                {similaires.map((s) => (
                  <Link
                    key={s.id}
                    href={`/etablissements/${s.slug}`}
                    className="flex items-center justify-between gap-3 text-sm text-gray-700 hover:text-[#0066CC] py-1.5 border-b border-gray-100 last:border-0"
                  >
                    {s.nom_court || s.raison_sociale}
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-[#0066CC] text-white rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Car className="w-5 h-5" />
              <h2 className="text-lg font-bold">Transport medical vers {nom}</h2>
            </div>
            <p className="text-sm text-blue-100 mb-4">
              Reservez un taxi conventionne, un VSL ou une ambulance vers {nom}. Demande
              transmise aux professionnels de votre zone.
            </p>
            <Link
              href={`/transport-medical/vers/${e.slug}`}
              className="inline-flex items-center justify-center gap-2 bg-white text-[#0066CC] font-semibold px-4 py-2.5 rounded-xl w-full transition hover:bg-blue-50"
            >
              Organiser mon transport
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 border-t border-gray-200 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Donnees issues du fichier FINESS (Ministere de la Sante) publiees sous Licence
            Ouverte 2.0. Derniere mise a jour : {formatSourceDate(e.source_updated_at)}.
          </p>
          <a
            href={`mailto:contact@roullepro.com?subject=${encodeURIComponent(
              `Signaler une erreur sur la fiche ${nom}`
            )}`}
            className="text-xs text-[#0066CC] hover:underline"
          >
            Signaler une erreur sur cette fiche
          </a>
        </div>
      </section>

      <FinessFooter />
    </main>
  );
}
