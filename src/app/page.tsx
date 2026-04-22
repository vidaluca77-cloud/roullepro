import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  BadgeCheck,
  Wrench,
  FileCheck2,
  Truck,
  Search,
  MapPin,
  Phone,
  Mail,
  Camera,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { getLatestPosts } from "@/lib/blog";
import { ArticleCard } from "@/components/blog/ArticleCard";
import AnnoncesTicker from "@/components/AnnoncesTicker";

// Rafraîchissement toutes les 5 minutes pour toujours afficher les dernières annonces
export const revalidate = 300;

// ─── DONNÉES ───────────────────────────────────────────────
const CATEGORIES = [
  { name: "VTC", slug: "vtc", tag: "Premium", accent: "from-blue-500/10 to-blue-500/0 border-blue-200", dot: "bg-blue-500" },
  { name: "Taxi", slug: "taxi", tag: "Licencié", accent: "from-amber-500/10 to-amber-500/0 border-amber-200", dot: "bg-amber-500" },
  { name: "Ambulance / VSL", slug: "ambulance", tag: "Sanitaire", accent: "from-rose-500/10 to-rose-500/0 border-rose-200", dot: "bg-rose-500" },
  { name: "TPMR / PMR", slug: "tpmr", tag: "Aménagé", accent: "from-emerald-500/10 to-emerald-500/0 border-emerald-200", dot: "bg-emerald-500" },
  { name: "Navette / Minibus", slug: "navette", tag: "Collectif", accent: "from-violet-500/10 to-violet-500/0 border-violet-200", dot: "bg-violet-500" },
  { name: "Utilitaires", slug: "utilitaire", tag: "Pro", accent: "from-orange-500/10 to-orange-500/0 border-orange-200", dot: "bg-orange-500" },
  { name: "Matériel & Équipement", slug: "materiel", tag: "Accessoires", accent: "from-slate-500/10 to-slate-500/0 border-slate-200", dot: "bg-slate-500" },
];

const TRUST_POINTS = [
  { icon: ShieldCheck, title: "Vérification SIRET & KBIS", desc: "Chaque vendeur est contrôlé contre le registre national des entreprises avant publication." },
  { icon: Lock, title: "Paiement séquestre", desc: "Les fonds sont bloqués par notre partenaire Stripe jusqu'à la remise du véhicule." },
  { icon: BadgeCheck, title: "Annonces modérées", desc: "Chaque annonce est revue manuellement sous 24h pour garantir un catalogue de qualité." },
  { icon: Wrench, title: "Réseau de garages partenaires", desc: "Expertise 40 points, photos HD et mandat de vente signé chez des pros certifiés." },
];

const STEPS = [
  { n: "01", title: "Créez votre compte pro", desc: "Inscription gratuite avec vérification SIRET et KBIS. Profil activé sous 24h." },
  { n: "02", title: "Publiez ou recherchez", desc: "Dépôt en moins de 5 minutes. Recherche filtrée par catégorie, marque, ville et budget." },
  { n: "03", title: "Transaction sécurisée", desc: "Échangez dans votre messagerie, puis concluez via paiement séquestre Stripe." },
];

// ─── DATA FETCH ────────────────────────────────────────────
async function getRecentAnnonces() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data } = await supabase
      .from("annonces")
      .select("id, title, price, city, images, annee, kilometrage, created_at, categories(name, slug)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(12);
    return data || [];
  } catch {
    return [];
  }
}

// ─── PAGE ──────────────────────────────────────────────────
export default async function HomePage() {
  const recentAnnonces = await getRecentAnnonces();
  const latestPosts = getLatestPosts(3);

  return (
    <div className="bg-white">
      {/* ═══════════════════════════════════════════════════════════
          HERO — Éditorial, sobre, affirmé
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#0B1120] text-white">
        {/* Motif radial subtil */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.25), transparent 60%)",
          }}
        />
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 70% 50% at 50% 50%, black, transparent 70%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-28 lg:pt-32 lg:pb-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-1 text-xs font-medium text-blue-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
              </span>
              Marketplace B2B du transport professionnel
            </div>

            <h1 className="mt-7 text-[44px] sm:text-5xl lg:text-[68px] font-semibold tracking-[-0.03em] leading-[1.02]">
              Le marché des véhicules pros
              <span className="block text-blue-300/90 italic font-light mt-1">
                entre professionnels.
              </span>
            </h1>

            <p className="mt-8 text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl">
              VTC, taxi, ambulance, utilitaire, TPMR, navette — achetez et vendez
              sereinement avec des pros vérifiés, un paiement séquestre et
              un accompagnement par de vrais humains.
            </p>

            {/* Recherche */}
            <form
              action="/annonces"
              method="get"
              className="mt-10 flex flex-col sm:flex-row gap-3 max-w-2xl"
            >
              <div className="relative flex-1 group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition"
                  size={18}
                />
                <input
                  type="text"
                  name="q"
                  placeholder="Renault Trafic, Tesla Model 3, ambulance Paris…"
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.08] transition backdrop-blur-sm"
                />
              </div>
              <button
                type="submit"
                className="h-14 px-7 bg-white text-slate-900 hover:bg-blue-50 font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                Explorer
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-blue-400" />
                Vendeurs vérifiés SIRET
              </span>
              <span className="flex items-center gap-2">
                <Lock size={15} className="text-blue-400" />
                Paiement séquestre Stripe
              </span>
              <span className="flex items-center gap-2">
                <BadgeCheck size={15} className="text-blue-400" />
                Dépôt 100 % gratuit
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          BANDEAU TEMPS RÉEL — nouvelles annonces sans rechargement
          ═══════════════════════════════════════════════════════════ */}
      <AnnoncesTicker
        initial={recentAnnonces.map((a: any) => ({
          id: a.id,
          title: a.title,
          price: a.price,
          city: a.city,
          created_at: a.created_at,
          categories: a.categories
            ? { name: a.categories.name, slug: a.categories.slug }
            : null,
        }))}
      />

      {/* ═══════════════════════════════════════════════════════════
          BANDEAU CATÉGORIES — discret, sous le hero
          ═══════════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold flex-shrink-0 mr-2">
              Catégories
            </span>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/annonces/categorie/${cat.slug}`}
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 text-sm text-slate-700 hover:border-slate-900 hover:text-slate-900 transition"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ANNONCES RÉCENTES — en premier pour l'effet marketplace
          ═══════════════════════════════════════════════════════════ */}
      {recentAnnonces.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-2">
                Dernières opportunités
              </div>
              <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
                Récemment publiés
              </h2>
            </div>
            <Link
              href="/annonces"
              className="hidden sm:inline-flex items-center gap-1.5 text-slate-900 hover:text-blue-600 font-medium text-sm transition group"
            >
              Tout le catalogue
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentAnnonces.slice(0, 8).map((a: any) => (
              <Link
                key={a.id}
                href={`/annonces/${a.id}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden ring-1 ring-slate-200/70 group-hover:ring-slate-900/20 transition">
                  {a.images?.[0] ? (
                    <img
                      src={a.images[0]}
                      alt={a.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                      <Truck size={36} className="text-slate-300" />
                    </div>
                  )}
                  {(a.categories as any)?.name && (
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {(a.categories as any).name}
                    </div>
                  )}
                </div>
                <div className="mt-4 px-0.5">
                  <h3 className="font-semibold text-slate-900 text-[15px] leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {a.title}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                    {a.annee && <span>{a.annee}</span>}
                    {a.annee && a.kilometrage && <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />}
                    {a.kilometrage && <span>{Number(a.kilometrage).toLocaleString("fr-FR")} km</span>}
                    {a.city && (
                      <>
                        {(a.annee || a.kilometrage) && <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />}
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {a.city}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-3 text-lg font-bold text-slate-900">
                    {a.price ? `${Number(a.price).toLocaleString("fr-FR")} €` : "Sur demande"}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 sm:hidden text-center">
            <Link
              href="/annonces"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition"
            >
              Voir toutes les annonces <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          CONFIANCE — argumentaire dense, éditorial
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-2xl mb-14">
            <div className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-2">
              Infrastructure de confiance
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
              Pensé pour les pros,<br />
              <span className="text-slate-500">construit comme une banque.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 rounded-3xl overflow-hidden ring-1 ring-slate-200">
            {TRUST_POINTS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="bg-white p-7 lg:p-8 hover:bg-slate-50 transition">
                  <div className="w-11 h-11 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-5">
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-[15px]">{p.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DÉPÔT-VENTE — offre phare
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <div className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-3">
                Service Dépôt-vente
              </div>
              <h2 className="text-3xl lg:text-[42px] font-semibold tracking-tight text-slate-900 leading-[1.1]">
                On vend votre véhicule pour vous,
                <span className="block text-slate-500">pendant que vous roulez.</span>
              </h2>
              <p className="mt-6 text-slate-600 text-lg leading-relaxed">
                Expertise 40 points, photos HD, mandat chez un garage partenaire.
                Vous touchez jusqu'à <strong className="text-slate-900">88 % du prix de vente</strong>.
                Si votre véhicule n'est pas vendu en 90 jours, vous le récupérez sans frais.
              </p>

              <div className="mt-8 grid sm:grid-cols-2 gap-3">
                {[
                  { icon: TrendingUp, text: "Estimation gratuite instantanée" },
                  { icon: Camera, text: "Photos HD + expertise 40 points" },
                  { icon: MapPin, text: "Garages partenaires certifiés" },
                  { icon: CreditCard, text: "Paiement séquestre Stripe" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={14} className="text-white" />
                      </div>
                      <span className="text-slate-700 text-sm leading-snug">{item.text}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/depot-vente/estimer"
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3.5 rounded-xl transition"
                >
                  Estimer mon véhicule
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/depot-vente"
                  className="inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-900 hover:border-slate-900 font-semibold px-6 py-3.5 rounded-xl transition"
                >
                  Comprendre le mandat
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "88 %", desc: "du prix reversé", tone: "bg-slate-900 text-white" },
                  { label: "90 j", desc: "de mandat", tone: "bg-white text-slate-900 ring-1 ring-slate-200" },
                  { label: "0 €", desc: "si pas vendu", tone: "bg-white text-slate-900 ring-1 ring-slate-200" },
                  { label: "48 h", desc: "réponse garantie", tone: "bg-blue-600 text-white" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`${stat.tone} rounded-2xl p-8 lg:p-10 flex flex-col justify-center aspect-square`}
                  >
                    <div className="text-4xl lg:text-5xl font-semibold tracking-tight">{stat.label}</div>
                    <div className="mt-1 text-sm opacity-80">{stat.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          COMMENT ÇA MARCHE
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-2xl mb-14">
            <div className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-2">
              Protocole
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
              Trois étapes,
              <span className="text-slate-500"> zéro friction.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                className="relative bg-white rounded-2xl p-8 ring-1 ring-slate-200/70 hover:ring-slate-900/20 transition"
              >
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="text-4xl font-semibold text-slate-200 tracking-tight">{step.n}</span>
                  <div className="h-px flex-1 bg-slate-100" />
                  {i < 2 && (
                    <ArrowRight size={16} className="text-slate-300 hidden md:block" />
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 text-lg mb-2 tracking-tight">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          RESSOURCES PROS — blog
          ═══════════════════════════════════════════════════════════ */}
      {latestPosts.length > 0 && (
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-12">
              <div className="max-w-xl">
                <div className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-2">
                  Ressources
                </div>
                <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
                  Le journal des pros du transport
                </h2>
                <p className="mt-4 text-slate-500 text-lg">
                  Fiscalité, financement, réglementation, prix du marché : l'essentiel
                  pour acheter et vendre mieux.
                </p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-slate-900 font-medium text-sm hover:text-blue-600 transition self-start md:self-end group"
              >
                Tous les articles
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          CTA FINAL — band plein largeur, affirmé
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#0B1120] text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 70% 50% at 50% 50%, black, transparent 70%)",
          }}
        />
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-blue-500/20 blur-3xl pointer-events-none"
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28 text-center">
          <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Votre prochain véhicule pro vous attend.
            <span className="block text-blue-300/90 italic font-light mt-2">Ou votre prochain acheteur.</span>
          </h2>
          <p className="mt-6 text-slate-400 text-lg max-w-xl mx-auto">
            Rejoignez la communauté des professionnels du transport et publiez
            gratuitement votre première annonce dès aujourd'hui.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/deposer-annonce"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-blue-50 px-7 py-4 rounded-xl font-semibold text-[15px] transition shadow-lg shadow-blue-900/30"
            >
              Déposer une annonce
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/annonces"
              className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-white px-7 py-4 rounded-xl font-semibold text-[15px] transition backdrop-blur-sm"
            >
              Parcourir le catalogue
            </Link>
          </div>

          <div className="mt-14 pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-sm text-slate-400">
            <a href="tel:0615472813" className="inline-flex items-center gap-2 hover:text-white transition">
              <Phone size={15} className="text-blue-400" />
              06 15 47 28 13
            </a>
            <a href="mailto:contact@roullepro.com" className="inline-flex items-center gap-2 hover:text-white transition">
              <Mail size={15} className="text-blue-400" />
              contact@roullepro.com
            </a>
            <span className="inline-flex items-center gap-2">
              <FileCheck2 size={15} className="text-blue-400" />
              Entreprise française immatriculée
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
