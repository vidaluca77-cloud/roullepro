import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  Cross,
  Car,
  Users,
  MapPin,
  Phone,
  ShieldCheck,
  Search,
  ChevronRight,
  Building2,
  BadgeCheck,
  Clock,
  Heart,
} from "lucide-react";
import SearchHero from "@/components/sanitaire/SearchHero";
import { CATEGORIES_SANITAIRE } from "@/lib/sanitaire-data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "RoullePro — Trouvez une ambulance, un VSL ou un taxi conventionné",
  description:
    "Annuaire gratuit du transport sanitaire en France. Trouvez une ambulance, un VSL ou un taxi conventionné près de chez vous. Numéros directs, horaires, tarifs.",
  alternates: { canonical: "/" },
};

async function getStats() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [total, ambulances, vsl, taxis] = await Promise.all([
    supabase.from("pros_sanitaire").select("*", { count: "exact", head: true }).eq("actif", true),
    supabase.from("pros_sanitaire").select("*", { count: "exact", head: true }).eq("actif", true).eq("categorie", "ambulance"),
    supabase.from("pros_sanitaire").select("*", { count: "exact", head: true }).eq("actif", true).eq("categorie", "vsl"),
    supabase.from("pros_sanitaire").select("*", { count: "exact", head: true }).eq("actif", true).eq("categorie", "taxi_conventionne"),
  ]);
  return {
    total: total.count ?? 0,
    ambulances: ambulances.count ?? 0,
    vsl: vsl.count ?? 0,
    taxis: taxis.count ?? 0,
  };
}

async function getTopVilles() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const rows: { ville: string; ville_slug: string; departement: string }[] = [];
  let from = 0;
  const size = 1000;
  for (let i = 0; i < 22; i += 1) {
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
  return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 12);
}

async function getRegionsCount() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const rows: { region: string }[] = [];
  let from = 0;
  const size = 1000;
  for (let i = 0; i < 22; i += 1) {
    const { data } = await supabase
      .from("pros_sanitaire")
      .select("region")
      .eq("actif", true)
      .range(from, from + size - 1);
    if (!data || data.length === 0) break;
    rows.push(...(data as { region: string }[]));
    if (data.length < size) break;
    from += size;
  }
  const map = new Map<string, number>();
  rows.forEach((row) => {
    if (!row.region) return;
    map.set(row.region, (map.get(row.region) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([region, count]) => ({ region, count, slug: region.toLowerCase().replace(/\s+/g, "-").replace(/'/g, "-") }))
    .sort((a, b) => b.count - a.count);
}

export default async function HomePage() {
  const [stats, topVilles, regions] = await Promise.all([getStats(), getTopVilles(), getRegionsCount()]);

  return (
    <main className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-[#0B1120] via-[#0f2048] to-[#0066CC] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium mb-6">
              <BadgeCheck className="w-3.5 h-3.5" />
              Annuaire officiel — {stats.total.toLocaleString("fr-FR")} professionnels référencés
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
              Trouvez une ambulance, un VSL ou un taxi conventionné près de chez vous
            </h1>
            <p className="text-base sm:text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Numéros directs, horaires, tarifs. 100 % gratuit pour les patients. Transport médical dans toute la France.
            </p>

            <SearchHero variant="hero" />

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-blue-200">Recherches populaires :</span>
              <Link href="/transport-medical/recherche?q=Paris&categorie=ambulance" className="text-white hover:underline">
                Ambulance Paris
              </Link>
              <span className="text-blue-300">·</span>
              <Link href="/transport-medical/recherche?q=Lyon&categorie=vsl" className="text-white hover:underline">
                VSL Lyon
              </Link>
              <span className="text-blue-300">·</span>
              <Link href="/transport-medical/recherche?q=Marseille&categorie=taxi-conventionne" className="text-white hover:underline">
                Taxi conventionné Marseille
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Quel type de transport vous faut-il ?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chaque transport sanitaire correspond à un besoin précis. Cliquez sur la catégorie qui vous concerne.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <CategorieCard
            href="/transport-medical/recherche?categorie=ambulance"
            icon={<Cross className="w-6 h-6" />}
            color="bg-rose-50 text-rose-600 border-rose-100"
            title="Ambulance"
            count={stats.ambulances}
            description="Transport médicalisé, équipage diplômé, matériel à bord. Urgences et transports programmés."
          />
          <CategorieCard
            href="/transport-medical/recherche?categorie=vsl"
            icon={<Car className="w-6 h-6" />}
            color="bg-blue-50 text-blue-600 border-blue-100"
            title="VSL"
            count={stats.vsl}
            description="Véhicule Sanitaire Léger, transport assis sur prescription, remboursé par la Sécurité sociale."
          />
          <CategorieCard
            href="/transport-medical/recherche?categorie=taxi-conventionne"
            icon={<Users className="w-6 h-6" />}
            color="bg-amber-50 text-amber-600 border-amber-100"
            title="Taxi conventionné"
            count={stats.taxis}
            description="Taxi agréé par la CPAM, transport assis sur prescription, tiers payant Sécurité sociale."
          />
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Régions couvertes</h2>
              <p className="text-gray-600">Explorez l'annuaire par région.</p>
            </div>
            <Link href="/transport-medical" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[#0066CC] hover:underline">
              Voir tout l'annuaire <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {regions.slice(0, 9).map((r) => (
              <Link
                key={r.region}
                href={`/transport-medical/recherche?q=${encodeURIComponent(r.region)}`}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#0066CC]" />
                  <div>
                    <div className="font-semibold text-gray-900">{r.region}</div>
                    <div className="text-xs text-gray-500">{r.count.toLocaleString("fr-FR")} professionnels</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Villes les plus recherchées</h2>
            <p className="text-gray-600">Accédez directement aux professionnels de votre ville.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {topVilles.map((v) => (
            <Link
              key={v.ville_slug}
              href={`/transport-medical/recherche?q=${encodeURIComponent(v.ville)}`}
              className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition"
            >
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">{v.ville}</div>
                <div className="text-xs text-gray-500">{v.count} pros · {v.departement}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Comment trouver un transport sanitaire ?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Trois étapes simples pour contacter directement un professionnel agréé.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <Step
              n="01"
              icon={<Search className="w-5 h-5" />}
              title="Recherchez votre ville"
              desc="Tapez le nom de votre ville ou code postal dans le moteur de recherche ci-dessus."
            />
            <Step
              n="02"
              icon={<MapPin className="w-5 h-5" />}
              title="Choisissez un professionnel"
              desc="Parcourez les ambulanciers, VSL et taxis conventionnés disponibles dans votre secteur."
            />
            <Step
              n="03"
              icon={<Phone className="w-5 h-5" />}
              title="Appelez directement"
              desc="Numéros de téléphone cliquables. Aucune inscription ni commission. 100 % gratuit pour les patients."
            />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Trust
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Professionnels vérifiés"
            desc="Chaque pro est identifié par son SIRET et peut faire valider son agrément préfectoral pour obtenir le badge Pro vérifié."
          />
          <Trust
            icon={<Heart className="w-5 h-5" />}
            title="Gratuit pour les patients"
            desc="Aucun frais, aucune commission. RoullePro est un annuaire indépendant financé par les professionnels eux-mêmes."
          />
          <Trust
            icon={<Clock className="w-5 h-5" />}
            title="Données à jour"
            desc="L'annuaire est mis à jour en continu à partir des registres officiels et par les professionnels eux-mêmes."
          />
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gradient-to-br from-[#0B1120] to-[#0f2048] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-14">
          <div className="grid md:grid-cols-[2fr_1fr] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-medium mb-4">
                <Building2 className="w-3.5 h-3.5" />
                Vous êtes un professionnel du transport sanitaire ?
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Réclamez votre fiche gratuitement
              </h2>
              <p className="text-blue-100 mb-6 max-w-xl">
                Gérez votre fiche, répondez aux demandes des patients, mettez en avant votre activité. Réclamation gratuite, validation sous 48 h après vérification de votre agrément.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/pro"
                  className="inline-flex items-center gap-2 bg-white text-[#0066CC] font-semibold px-5 py-3 rounded-xl hover:bg-blue-50 transition"
                >
                  Découvrir l'espace pro <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/annonces"
                  className="inline-flex items-center gap-2 border border-white/30 text-white font-medium px-5 py-3 rounded-xl hover:bg-white/10 transition"
                >
                  Marketplace véhicules pro
                </Link>
              </div>
            </div>
            <div className="hidden md:block bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-xs uppercase tracking-wide text-blue-200 mb-2">Écosystème RoullePro</div>
              <ul className="space-y-2 text-sm text-blue-100">
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-blue-300" /> Annuaire sanitaire gratuit</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-blue-300" /> Marketplace véhicules pro</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-blue-300" /> Dépôt-vente avec garages</li>
                <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-blue-300" /> Vérification SIRET systématique</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function CategorieCard({
  href,
  icon,
  color,
  title,
  count,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  color: string;
  title: string;
  count: number;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group block bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${color}`}>
        {icon}
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-500">{count.toLocaleString("fr-FR")} pros</span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="inline-flex items-center gap-1 text-sm font-medium text-[#0066CC] group-hover:gap-2 transition-all">
        Voir les professionnels <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  );
}

function Step({ n, icon, title, desc }: { n: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066CC] flex items-center justify-center">{icon}</div>
        <div className="text-xs font-semibold text-gray-400">ÉTAPE {n}</div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}

function Trust({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066CC] flex items-center justify-center mb-3">{icon}</div>
      <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}
