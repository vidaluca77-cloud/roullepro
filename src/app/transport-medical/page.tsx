import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Cross, Car, MapPin, Search, Phone, Shield, Users, Clock, ChevronRight } from "lucide-react";
import { CATEGORIES_SANITAIRE, REGIONS_MVP } from "@/lib/sanitaire-data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Annuaire du transport sanitaire — Cross, VSL, Taxi conventionné",
  description:
    "Trouvez gratuitement une ambulance, un VSL ou un taxi conventionné près de chez vous. Numéros directs, horaires, avis. Annuaire gratuit du transport médical en France.",
  alternates: { canonical: "/transport-medical" },
  openGraph: {
    title: "Annuaire du transport sanitaire — Cross, VSL, Taxi conventionné",
    description:
      "Trouvez une ambulance, un VSL ou un taxi conventionné près de chez vous. Numéros directs, horaires, avis. 100 % gratuit pour les patients.",
    type: "website",
  },
};

async function getStats() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { count: total } = await supabase
    .from("pros_sanitaire")
    .select("*", { count: "exact", head: true })
    .eq("actif", true);
  const { count: ambulances } = await supabase
    .from("pros_sanitaire")
    .select("*", { count: "exact", head: true })
    .eq("actif", true)
    .eq("categorie", "ambulance");
  const { count: vsl } = await supabase
    .from("pros_sanitaire")
    .select("*", { count: "exact", head: true })
    .eq("actif", true)
    .eq("categorie", "vsl");
  const { count: taxis } = await supabase
    .from("pros_sanitaire")
    .select("*", { count: "exact", head: true })
    .eq("actif", true)
    .eq("categorie", "taxi_conventionne");
  return { total: total ?? 0, ambulances: ambulances ?? 0, vsl: vsl ?? 0, taxis: taxis ?? 0 };
}

async function getTopVilles() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  // Recupere jusqu a 10 000 lignes pour avoir un comptage fiable
  const rows: { ville: string; ville_slug: string; departement: string }[] = [];
  let from = 0;
  const size = 1000;
  for (let i = 0; i < 10; i += 1) {
    const { data } = await supabase
      .from("pros_sanitaire")
      .select("ville, ville_slug, departement")
      .eq("actif", true)
      .range(from, from + size - 1);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < size) break;
    from += size;
  }
  const map = new Map<string, { ville: string; ville_slug: string; departement: string; count: number }>();
  rows.forEach((row) => {
    const key = row.ville_slug;
    if (!map.has(key)) map.set(key, { ...row, count: 0 });
    map.get(key)!.count += 1;
  });
  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 24);
}

async function getRegionsCouvertes() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const rows: { region: string }[] = [];
  let from = 0;
  const size = 1000;
  for (let i = 0; i < 25; i += 1) {
    const { data } = await supabase
      .from("pros_sanitaire")
      .select("region")
      .eq("actif", true)
      .range(from, from + size - 1);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < size) break;
    from += size;
  }
  const counts = new Map<string, number>();
  rows.forEach((r) => {
    if (!r.region) return;
    counts.set(r.region, (counts.get(r.region) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([nom, count]) => ({ nom, count }))
    .sort((a, b) => b.count - a.count);
}

export default async function TransportMedicalHome() {
  const stats = await getStats();
  const topVilles = await getTopVilles();
  const regionsCouvertes = await getRegionsCouvertes();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-400 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-6">
            <Shield className="w-3.5 h-3.5" />
            Annuaire public, gratuit, sans inscription
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-3xl">
            Trouver une <span className="text-blue-300">ambulance</span>, un{" "}
            <span className="text-blue-300">VSL</span> ou un{" "}
            <span className="text-blue-300">taxi conventionné</span> près de chez vous
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mb-8">
            Numéros directs, horaires, transport remboursé par la Sécurité sociale. Un annuaire clair,
            sans publicité agressive, fait pour les patients et leurs proches.
          </p>

          <form action="/transport-medical/recherche" className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl max-w-2xl">
            <div className="flex-1 flex items-center gap-3 px-4">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Votre ville (ex : Caen, Rennes, Rouen...)"
                className="w-full py-3 text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              <Search className="w-4 h-4" />
              Rechercher
            </button>
          </form>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl">
            <Stat label="Professionnels référencés" value={stats.total.toLocaleString("fr-FR")} />
            <Stat label="Ambulances" value={stats.ambulances.toLocaleString("fr-FR")} />
            <Stat label="VSL" value={stats.vsl.toLocaleString("fr-FR")} />
            <Stat label="Taxis conventionnés" value={stats.taxis.toLocaleString("fr-FR")} />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Choisir le bon transport</h2>
        <p className="text-gray-600 mb-8">Chaque type répond à un besoin précis, souvent sur prescription médicale.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {CATEGORIES_SANITAIRE.map((cat) => (
            <div key={cat.slug} className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-200 transition">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition">
                {cat.icone === "ambulance" ? (
                  <Cross className="w-6 h-6 text-[#0066CC]" />
                ) : cat.icone === "car" ? (
                  <Car className="w-6 h-6 text-[#0066CC]" />
                ) : (
                  <Users className="w-6 h-6 text-[#0066CC]" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{cat.label}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{cat.description}</p>
              <Link
                href={`/transport-medical/recherche?categorie=${cat.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#0066CC] hover:text-[#0052a3]"
              >
                Voir les pros <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Les villes les plus actives</h2>
          <p className="text-gray-600 mb-8">Plus de {stats.total.toLocaleString("fr-FR")} professionnels référencés dans {regionsCouvertes.length} régions françaises.</p>
          {topVilles.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-gray-600">L'annuaire est en cours d'import. Les premières fiches arrivent dans quelques minutes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {topVilles.map((v) => (
                <Link
                  key={v.ville_slug}
                  href={`/transport-medical/${v.ville_slug}`}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-[#0066CC] hover:shadow-sm transition"
                >
                  <div className="text-sm font-semibold text-gray-900">{v.ville}</div>
                  <div className="text-xs text-gray-500">{v.count} pro{v.count > 1 ? "s" : ""} · {v.departement}</div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Régions couvertes</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {regionsCouvertes.map((r) => (
                <div
                  key={r.nom}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3"
                >
                  <div className="text-sm font-semibold text-gray-900">{r.nom}</div>
                  <div className="text-xs text-gray-500">{r.count.toLocaleString("fr-FR")} pros</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium mb-4">
              <Shield className="w-3.5 h-3.5" />
              Vous êtes un professionnel du transport sanitaire ?
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Votre entreprise est déjà dans l'annuaire. Récupérez votre fiche en 2 minutes.
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Nous avons référencé tous les pros du transport sanitaire à partir des données publiques
              de l'INSEE. Votre fiche existe probablement déjà — vérifiez, personnalisez, et recevez
              directement les demandes de vos patients.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/transport-medical/pro"
                className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-3 rounded-xl transition"
              >
                Réclamer ma fiche gratuitement
              </Link>
              <Link
                href="/transport-medical/tarifs"
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold px-5 py-3 rounded-xl transition"
              >
                Voir les abonnements
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 space-y-4">
            <Benefit icon={<Phone className="w-5 h-5 text-[#0066CC]" />} title="Recevez les appels patients">
              Numéro cliquable, messagerie interne (Premium), statistiques précises.
            </Benefit>
            <Benefit icon={<Clock className="w-5 h-5 text-[#0066CC]" />} title="Mise en ligne instantanée">
              Réclamez par email de votre domaine ou SMS sur votre numéro public.
            </Benefit>
            <Benefit icon={<Shield className="w-5 h-5 text-[#0066CC]" />} title="Badge « Pro vérifié »">
              Rassurez patients et familles avec un badge visible sur votre fiche.
            </Benefit>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-blue-100 mt-0.5">{label}</div>
    </div>
  );
}

function Benefit({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <div className="font-semibold text-gray-900 mb-0.5">{title}</div>
        <div className="text-sm text-gray-600">{children}</div>
      </div>
    </div>
  );
}
