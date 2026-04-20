import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import {
  Search, Shield, Zap, Users, ArrowRight,
  CheckCircle, Star, TrendingUp, Truck, BookOpen
} from 'lucide-react';
import { getLatestPosts } from '@/lib/blog';
import { ArticleCard } from '@/components/blog/ArticleCard';

// Catégories avec SVG inline pour un rendu propre sans émojis
const CATEGORIES = [
  {
    name: 'VTC',
    slug: 'vtc',
    description: 'Voitures de transport avec chauffeur',
    bg: 'bg-blue-600',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-100',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="14" width="32" height="16" rx="4" fill="currentColor" opacity=".15"/>
        <rect x="8" y="10" width="20" height="10" rx="3" fill="currentColor" opacity=".3"/>
        <circle cx="12" cy="30" r="3.5" fill="currentColor"/>
        <circle cx="28" cy="30" r="3.5" fill="currentColor"/>
        <rect x="4" y="20" width="32" height="2" fill="currentColor" opacity=".2"/>
      </svg>
    ),
  },
  {
    name: 'Taxi',
    slug: 'taxi',
    description: 'Taxis et véhicules licenciés',
    bg: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-100',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="14" width="32" height="16" rx="4" fill="currentColor" opacity=".15"/>
        <rect x="8" y="10" width="20" height="10" rx="3" fill="currentColor" opacity=".3"/>
        <rect x="15" y="5" width="10" height="6" rx="2" fill="currentColor" opacity=".5"/>
        <circle cx="12" cy="30" r="3.5" fill="currentColor"/>
        <circle cx="28" cy="30" r="3.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: 'Ambulance / VSL',
    slug: 'ambulance',
    description: 'Véhicules sanitaires légers',
    bg: 'bg-red-600',
    lightBg: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-100',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="14" width="28" height="16" rx="3" fill="currentColor" opacity=".15"/>
        <rect x="26" y="14" width="10" height="10" rx="2" fill="currentColor" opacity=".2"/>
        <path d="M17 18h6M20 15v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="10" cy="30" r="3.5" fill="currentColor"/>
        <circle cx="28" cy="30" r="3.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: 'TPMR / PMR',
    slug: 'tpmr',
    description: 'Transport personnes à mobilité réduite',
    bg: 'bg-emerald-600',
    lightBg: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-100',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="12" width="32" height="18" rx="4" fill="currentColor" opacity=".15"/>
        <path d="M14 22l-4 6h16l-4-6" fill="currentColor" opacity=".4"/>
        <circle cx="20" cy="16" r="3" fill="currentColor" opacity=".5"/>
        <circle cx="10" cy="30" r="3.5" fill="currentColor"/>
        <circle cx="30" cy="30" r="3.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: 'Navette / Minibus',
    slug: 'navette',
    description: 'Minibus et navettes collectives',
    bg: 'bg-violet-600',
    lightBg: 'bg-violet-50',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-100',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="12" width="36" height="18" rx="4" fill="currentColor" opacity=".15"/>
        <rect x="4" y="14" width="8" height="7" rx="1.5" fill="currentColor" opacity=".3"/>
        <rect x="14" y="14" width="8" height="7" rx="1.5" fill="currentColor" opacity=".3"/>
        <rect x="24" y="14" width="8" height="7" rx="1.5" fill="currentColor" opacity=".3"/>
        <circle cx="10" cy="30" r="3.5" fill="currentColor"/>
        <circle cx="30" cy="30" r="3.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: 'Utilitaires',
    slug: 'utilitaire',
    description: 'Fourgons, camionnettes, utilitaires',
    bg: 'bg-orange-500',
    lightBg: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-100',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="14" width="28" height="16" rx="3" fill="currentColor" opacity=".15"/>
        <rect x="28" y="18" width="10" height="10" rx="2" fill="currentColor" opacity=".2"/>
        <rect x="4" y="16" width="10" height="8" rx="1.5" fill="currentColor" opacity=".35"/>
        <circle cx="10" cy="30" r="3.5" fill="currentColor"/>
        <circle cx="28" cy="30" r="3.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: 'Matériel & Équipement',
    slug: 'materiel',
    description: 'Équipements et accessoires pro',
    bg: 'bg-slate-600',
    lightBg: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-100',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="10" fill="currentColor" opacity=".12"/>
        <circle cx="20" cy="20" r="5" fill="currentColor" opacity=".3"/>
        <path d="M20 8v4M20 28v4M8 20h4M28 20h4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M11.5 11.5l2.8 2.8M25.7 25.7l2.8 2.8M11.5 28.5l2.8-2.8M25.7 14.3l2.8-2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
      </svg>
    ),
  },
];

const AVANTAGES = [
  {
    icon: Shield,
    title: 'Vendeurs vérifiés SIRET',
    description: 'Chaque professionnel est vérifié via le registre national des entreprises. KBIS obligatoire.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Zap,
    title: 'Publication immédiate',
    description: 'Déposez votre annonce en moins de 5 minutes. Photos, prix, description — tout en un.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Users,
    title: '100% B2B',
    description: 'Une plateforme exclusivement dédiée aux professionnels du transport routier.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: TrendingUp,
    title: 'Annonces gratuites',
    description: 'Publiez sans frais. Seuls les boosts optionnels sont payants.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
];



async function getStats() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const [{ count: annoncesCount }, { count: vendeursCount }] = await Promise.all([
      supabase.from('annonces').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ]);
    return {
      annonces: annoncesCount ?? 0,
      vendeurs: vendeursCount ?? 0,
    };
  } catch {
    return { annonces: 0, vendeurs: 0 };
  }
}

async function getRecentAnnonces() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from('annonces')
      .select('id, title, price, city, images, categories(name, slug)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6);
    return data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [recentAnnonces, stats] = await Promise.all([getRecentAnnonces(), getStats()]);

  const STATS = [
    { value: stats.annonces > 0 ? `${stats.annonces}+` : '0', label: 'Annonces actives' },
    { value: stats.vendeurs > 0 ? `${stats.vendeurs}+` : '0', label: 'Vendeurs certifiés' },
    { value: '100%', label: 'Dépôt gratuit' },
    { value: 'B2B', label: 'Pros uniquement' },
  ];

  return (
    <div className="bg-white">

      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white">
        {/* Grille décorative en arrière-plan */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Cercle lumineux */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500 opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-blue-400 opacity-10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Marketplace B2B du transport routier
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              Achetez et vendez <br className="hidden sm:block"/>
              <span className="text-blue-400">entre professionnels</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
              VTC, taxi, ambulance, TPMR, navette, utilitaires — la plateforme dédiée
              aux pros du transport routier. Annonces vérifiées, vendeurs certifiés.
            </p>

            {/* Barre de recherche */}
            <form action="/annonces" method="get" className="flex gap-2 max-w-xl">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  name="q"
                  placeholder="Marque, modèle, ville..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition text-base backdrop-blur-sm"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition whitespace-nowrap flex items-center gap-2"
              >
                Rechercher
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-slate-400">
              {['Dépôt gratuit', 'Vendeurs vérifiés SIRET', 'Modération sous 24h'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-blue-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ────────────────────────────────────────── */}
      <section className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s: { value: string; label: string }) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-sm text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CATÉGORIES ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Parcourir par catégorie</h2>
          <p className="text-slate-500 text-lg">7 catégories spécialisées pour le transport professionnel</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/annonces/categorie/${cat.slug}`}
              className={`group relative flex flex-col gap-3 p-5 rounded-2xl border-2 ${cat.borderColor} ${cat.lightBg} hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.bg} bg-opacity-10 ${cat.textColor}`}>
                {cat.icon}
              </div>
              <div>
                <div className={`font-semibold text-slate-900 text-sm`}>{cat.name}</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-tight">{cat.description}</div>
              </div>
              <ArrowRight size={14} className={`absolute top-5 right-5 ${cat.textColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </Link>
          ))}
          {/* Toutes les annonces */}
          <Link
            href="/annonces"
            className="group flex flex-col gap-3 p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              <Truck size={22} />
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm">Toutes les annonces</div>
              <div className="text-xs text-slate-500 mt-0.5">Voir tout le catalogue</div>
            </div>
          </Link>
        </div>
      </section>

      {/* ─── ANNONCES RÉCENTES ────────────────────────────────── */}
      {recentAnnonces.length > 0 && (
        <section className="bg-slate-50 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Annonces récentes</h2>
                <p className="text-slate-500 mt-1">Les dernières opportunités publiées</p>
              </div>
              <Link
                href="/annonces"
                className="hidden sm:flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm transition"
              >
                Voir tout <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentAnnonces.map((a: any) => {
                const cat = CATEGORIES.find(c => c.slug === (a.categories as any)?.slug);
                return (
                  <Link
                    key={a.id}
                    href={`/annonces/${a.id}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      {a.images?.[0] ? (
                        <img
                          src={a.images[0]}
                          alt={a.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Truck size={40} className="text-slate-300" />
                        </div>
                      )}
                      {(a.categories as any)?.name && (
                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${cat ? `${cat.lightBg} ${cat.textColor}` : 'bg-white text-slate-700'}`}>
                          {(a.categories as any).name}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{a.title}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xl font-bold text-blue-600">
                          {a.price ? `${Number(a.price).toLocaleString('fr-FR')} €` : 'Sur demande'}
                        </span>
                        {a.city && (
                          <span className="text-xs text-slate-400">{a.city}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link
                href="/annonces"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
              >
                Voir toutes les annonces <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── AVANTAGES ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Pourquoi RoullePro ?</h2>
          <p className="text-slate-500 text-lg">La référence B2B du transport routier professionnel</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AVANTAGES.map((av) => {
            const Icon = av.icon;
            return (
              <div key={av.title} className="p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl ${av.bg} flex items-center justify-center mb-4`}>
                  <Icon size={22} className={av.color} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{av.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{av.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ───────────────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Comment ça marche ?</h2>
            <p className="text-slate-500 text-lg">Vendez ou achetez en 3 étapes simples</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Créez votre compte pro',
                description: 'Inscrivez-vous gratuitement et vérifiez votre entreprise avec votre SIRET et un extrait KBIS.',
                color: 'text-blue-600',
                bg: 'bg-blue-600',
              },
              {
                step: '02',
                title: 'Publiez votre annonce',
                description: 'Ajoutez vos photos, renseignez les caractéristiques du véhicule et définissez votre prix.',
                color: 'text-blue-600',
                bg: 'bg-blue-600',
              },
              {
                step: '03',
                title: 'Concluez la vente',
                description: 'Recevez des messages directement dans votre espace. Échangez en toute confiance avec des pros vérifiés.',
                color: 'text-blue-600',
                bg: 'bg-blue-600',
              },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-blue-200 to-transparent" />
                )}
                <div className="bg-white rounded-2xl p-7 border border-slate-100 hover:shadow-md transition-shadow">
                  <div className={`w-14 h-14 rounded-2xl ${item.bg} bg-opacity-10 flex items-center justify-center mb-5`}>
                    <span className={`text-xl font-extrabold ${item.color}`}>{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-lg">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG / RESSOURCES PROS */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <BookOpen size={14} /> Ressources pros
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                Nos derniers guides pour professionnels
              </h2>
              <p className="text-gray-600 mt-3 max-w-2xl">
                Prix, fiscalité, financement, réglementation : tout ce qu&apos;il faut savoir pour
                acheter et vendre malin dans le transport pro.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition self-start"
            >
              Voir le blog <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getLatestPosts(3).map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 md:p-14 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Rejoignez les professionnels du transport
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Déposez votre première annonce gratuitement aujourd'hui et touchez des acheteurs professionnels qualifiés.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/deposer-annonce"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-base transition"
              >
                Déposer une annonce gratuite
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/annonces"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-base transition backdrop-blur-sm"
              >
                Parcourir les annonces
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
