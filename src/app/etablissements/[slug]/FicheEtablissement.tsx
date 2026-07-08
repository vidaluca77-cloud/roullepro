import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  Phone,
  Globe,
  BedDouble,
  Car,
  Stethoscope,
  Cross,
  Navigation,
} from "lucide-react";
import {
  getTypeByCategorie,
  getSupabaseEtab,
  formatSourceDate,
  type EtablissementPublic,
} from "@/lib/etablissements-data";
import { buildBreadcrumbJsonLd, jsonLdHtml, BASE_URL } from "@/lib/seo-schema";
import { getNearbyTransporters, typeLabel } from "@/lib/nearby-transporters";
import MiniFormulaireReservation from "./MiniFormulaireReservation";

// JSON-LD : @type schema.org selon categorie_simple (cf. rapport SEO Action 4).
function schemaType(categorie: string): string {
  if (categorie === "ehpad") return "NursingHome";
  if (categorie === "hopital") return "Hospital";
  if (
    categorie === "clinique" ||
    categorie === "centre-sante" ||
    categorie === "maison-sante" ||
    categorie === "centre-dialyse" ||
    categorie === "rehabilitation"
  ) {
    return "MedicalClinic";
  }
  return "MedicalOrganization";
}

// Specialite medicale schema.org pour certaines categories.
function medicalSpecialty(categorie: string): string | undefined {
  if (categorie === "centre-dialyse") return "Nephrology";
  if (categorie === "rehabilitation") return "PhysicalTherapy";
  return undefined;
}

async function fetchSimilaires(
  e: EtablissementPublic
): Promise<EtablissementPublic[]> {
  if (!e.ville_slug) return [];
  const supabase = getSupabaseEtab();
  const { data } = await supabase
    .from("etablissements_sante_public")
    .select("id, raison_sociale, nom_court, nom_affichage, slug, categorie_simple, ville")
    .eq("ville_slug", e.ville_slug)
    .neq("id", e.id)
    .limit(6);
  return (data as EtablissementPublic[]) ?? [];
}

// Etablissements de la MEME categorie ET MEME ville (maillage interne).
async function fetchMemeCategorieVille(
  e: EtablissementPublic
): Promise<EtablissementPublic[]> {
  if (!e.ville_slug) return [];
  const supabase = getSupabaseEtab();
  const { data } = await supabase
    .from("etablissements_sante_public")
    .select("id, raison_sociale, nom_court, nom_affichage, slug, categorie_simple, ville")
    .eq("ville_slug", e.ville_slug)
    .eq("categorie_simple", e.categorie_simple)
    .neq("id", e.id)
    .limit(5);
  return (data as EtablissementPublic[]) ?? [];
}

export default async function FicheEtablissement({ e }: { e: EtablissementPublic }) {
  const t = getTypeByCategorie(e.categorie_simple);
  const nom = e.nom_affichage || e.nom_court || e.raison_sociale;
  const [similaires, memeCategorieVille, nearbyTransporters] = await Promise.all([
    fetchSimilaires(e),
    fetchMemeCategorieVille(e),
    getNearbyTransporters(e.latitude, e.longitude, e.slug, 10, e.ville_slug ?? null, e.departement ?? null),
  ]);

  const adresseComplete = [e.adresse, [e.code_postal, e.ville].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  const lieuArrivee = [nom, e.ville].filter(Boolean).join(", ");
  const mapsQuery =
    e.latitude != null && e.longitude != null
      ? `${e.latitude},${e.longitude}`
      : adresseComplete || nom;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
  const labelPluriel = t?.labelPluriel ?? "Établissements";
  const labelPlurielLc = labelPluriel.toLowerCase();

  const specialty = medicalSpecialty(e.categorie_simple);
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType(e.categorie_simple),
    name: nom,
    url: `https://roullepro.com/etablissements/${e.slug}`,
    ...(e.telephone ? { telephone: e.telephone } : {}),
    ...(specialty ? { medicalSpecialty: specialty } : {}),
    address: {
      "@type": "PostalAddress",
      ...(e.adresse ? { streetAddress: e.adresse } : {}),
      ...(e.code_postal ? { postalCode: e.code_postal } : {}),
      ...(e.ville ? { addressLocality: e.ville } : {}),
      ...(e.region ? { addressRegion: e.region } : {}),
      addressCountry: "FR",
    },
    ...(e.latitude != null && e.longitude != null
      ? { geo: { "@type": "GeoCoordinates", latitude: e.latitude, longitude: e.longitude } }
      : {}),
  };

  const breadLd = buildBreadcrumbJsonLd([
    { label: "Accueil", href: "/" },
    { label: "Etablissements de sante", href: "/etablissements" },
    ...(t ? [{ label: t.labelPluriel, href: `/etablissements/${t.slug}` }] : []),
    { label: nom, href: `/etablissements/${e.slug}` },
  ]);

  // FAQ standardisee (variables nom / ville) + JSON-LD FAQPage.
  const faq = [
    {
      q: `Comment réserver un taxi conventionné vers ${nom} ?`,
      a: `Indiquez votre nom, votre téléphone et la date souhaitée dans le formulaire de réservation en haut de cette page. Votre demande est transmise aux transporteurs conventionnés proches de ${e.ville || "votre secteur"}, qui vous rappellent pour organiser le trajet vers ${nom}.`,
    },
    {
      q: "Quels documents fournir pour bénéficier du tiers payant ?",
      a: "Préparez la prescription médicale de transport établie par votre médecin, votre carte Vitale à jour et votre attestation de mutuelle. Ces documents permettent au transporteur d'appliquer le tiers payant et d'éviter l'avance des frais.",
    },
    {
      q: `Combien coûte un transport vers ${nom} ?`,
      a: "Le tarif suit la convention nationale entre l'Assurance Maladie et les transporteurs. Sur prescription médicale, le transport conventionné est pris en charge à 100 % par la CPAM, sans reste à charge dans la plupart des situations.",
    },
    {
      q: "Quelle différence entre VSL et taxi conventionné ?",
      a: "Le VSL (véhicule sanitaire léger) est un véhicule dédié au transport assis de patients, conduit par un auxiliaire ambulancier. Le taxi conventionné est un taxi agréé par la CPAM. Les deux assurent un transport assis remboursé sur prescription ; le choix dépend de l'état du patient et de l'offre locale.",
    },
    {
      q: "Comment obtenir une prescription médicale de transport ?",
      a: "La prescription est rédigée par votre médecin traitant ou par le médecin de l'établissement, sur le formulaire CERFA dédié, lorsque votre état de santé justifie un transport. Elle conditionne la prise en charge par l'Assurance Maladie.",
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

  // ItemList JSON-LD : transporteurs conventionnes proches (signal SEO maillage).
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(faqLd) }} />
      {transporteursLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(transporteursLd) }}
        />
      )}

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-[1.6fr_1fr] gap-8 items-start">
          <div>
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
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Transport médical conventionné pour {nom}
              {e.ville ? `, ${e.ville}` : ""}
            </h1>
            {t && <p className="text-blue-100">{e.categorie_finess_libelle || t.label}</p>}
            {e.ville && (
              <p className="text-sm text-blue-200 mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {e.ville}
                {e.departement ? ` (${e.departement})` : ""}
              </p>
            )}
          </div>
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <MiniFormulaireReservation
              etablissementId={e.id}
              lieuArrivee={lieuArrivee}
              departementCible={e.departement}
              villeCible={e.ville}
            />
          </div>
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

            {e.telephone && (
              <a
                href={`tel:${e.telephone.replace(/\s+/g, "")}`}
                className="md:hidden mt-4 inline-flex items-center justify-center gap-2 w-full bg-[#0066CC] text-white font-semibold px-4 py-2.5 rounded-xl transition hover:bg-[#0052a3]"
              >
                <Phone className="w-4 h-4" />
                Appeler {nom}
              </a>
            )}
          </div>

          {/* Comment se rendre a l'etablissement : modes de transport */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Comment se rendre à {nom}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5 text-[#0066CC]">
                  <Car className="w-5 h-5" />
                  <h3 className="font-semibold text-gray-900">Taxi conventionné CPAM</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Transport pris en charge à 100 % sur prescription médicale. Tiers payant possible.
                </p>
                <Link
                  href={`/transport-medical/vers/${e.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#0066CC] hover:gap-2 transition-all"
                >
                  Réserver un taxi
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5 text-[#0066CC]">
                  <Stethoscope className="w-5 h-5" />
                  <h3 className="font-semibold text-gray-900">VSL</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Véhicule sanitaire léger pour patients en position assise. Idéal pour examens et
                  consultations.
                </p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5 text-[#0066CC]">
                  <Cross className="w-5 h-5" />
                  <h3 className="font-semibold text-gray-900">Ambulance</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Transport allongé pour patients ne pouvant pas se déplacer.
                </p>
                <Link
                  href="/ambulance-autour-de-moi"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#0066CC] hover:gap-2 transition-all"
                >
                  Trouver une ambulance autour de moi
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5 text-[#0066CC]">
                  <Navigation className="w-5 h-5" />
                  <h3 className="font-semibold text-gray-900">Voiture personnelle</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {adresseComplete ? `Adresse : ${adresseComplete}` : "Adresse non communiquée."}
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#0066CC] hover:gap-2 transition-all"
                >
                  Itinéraire Google Maps
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Prise en charge CPAM */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Prise en charge CPAM</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Le transport médical conventionné vers {nom} à {e.ville || "votre ville"} est remboursé
              à 100 % par la CPAM lorsqu&apos;il est réalisé sur prescription médicale et qu&apos;il
              correspond à votre état de santé. Le médecin établit une prescription médicale de
              transport, document obligatoire qui justifie le recours à un taxi conventionné, un VSL
              ou une ambulance. Grâce au tiers payant, vous n&apos;avancez pas les frais : le
              transporteur est réglé directement par l&apos;Assurance Maladie et, le cas échéant, par
              votre mutuelle. Pour bénéficier de cette prise en charge, présentez au transporteur
              votre prescription médicale, votre carte Vitale à jour et votre attestation de mutuelle.
              Pensez à conserver ces documents pour chaque trajet, aller comme retour. Le choix entre
              VSL et taxi conventionné dépend de votre autonomie et de l&apos;offre disponible près de
              {` ${e.ville || "chez vous"}`}, mais le niveau de remboursement reste identique. En cas
              de doute sur votre situation, votre médecin ou la caisse d&apos;Assurance Maladie peut
              vous indiquer les conditions exactes applicables à votre transport.
            </p>
          </div>

          {/* Transporteurs conventionnes proches (bloc differenciant — donnee geo) */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyTransporters.map((tr) => (
                  <Link
                    key={tr.slug}
                    href={`/transport-medical/${tr.ville_slug}/${tr.type}/${tr.slug}`}
                    className="block rounded-xl border border-gray-200 p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900">{tr.nom}</h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {tr.verifie ? (
                          <span
                            className="text-xs rounded bg-emerald-50 px-2 py-1 text-emerald-700 border border-emerald-200"
                            title="Transporteur vérifié par RoullePro"
                          >
                            Vérifié
                          </span>
                        ) : null}
                        {tr.distance_km > 0 ? (
                          <span className="text-xs rounded bg-blue-50 px-2 py-1 text-blue-700">
                            {tr.distance_km} km
                          </span>
                        ) : null}
                      </div>
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
              <Link
                href="/transport-medical"
                className="text-blue-700 font-medium hover:underline"
              >
                Voir tous les transporteurs →
              </Link>
            </section>
          )}

          {/* FAQ structuree */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Questions fréquentes</h2>
            <div className="divide-y divide-gray-100">
              {faq.map((f) => (
                <details key={f.q} className="group py-3">
                  <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-medium text-gray-900">
                    {f.q}
                    <ChevronRight className="w-4 h-4 text-[#0066CC] flex-shrink-0 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>

          {memeCategorieVille.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Autres {labelPlurielLc} à {e.ville}
              </h2>
              <div className="space-y-2">
                {memeCategorieVille.map((s) => (
                  <Link
                    key={s.id}
                    href={`/etablissements/${s.slug}`}
                    className="flex items-center justify-between gap-3 text-sm text-gray-700 hover:text-[#0066CC] py-1.5 border-b border-gray-100 last:border-0"
                  >
                    {s.nom_affichage || s.nom_court || s.raison_sociale}
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  </Link>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {t && e.ville_slug && (
                  <Link
                    href={`/etablissements/${t.slug}/${e.ville_slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066CC] hover:underline"
                  >
                    Voir tous les {labelPlurielLc} près de {e.ville}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
                {t && (
                  <Link
                    href={`/etablissements/${t.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066CC] hover:underline"
                  >
                    Tous les {labelPlurielLc} en France
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          )}

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
                    {s.nom_affichage || s.nom_court || s.raison_sociale}
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
    </main>
  );
}
