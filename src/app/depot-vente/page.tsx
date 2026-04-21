import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  MapPin,
  Camera,
  CreditCard,
  HelpCircle,
  ChevronDown,
  Star,
} from 'lucide-react';

export const metadata: Metadata = {
  title: "Dépôt-vente véhicule professionnel — RoullePro",
  description:
    "Confiez la vente de votre véhicule professionnel à RoullePro. Estimation gratuite, garage partenaire certifié, paiement sécurisé. 88% du prix de vente reversé.",
  alternates: { canonical: 'https://roullepro.com/depot-vente' },
  openGraph: {
    title: "Dépôt-vente véhicule professionnel — RoullePro",
    description:
      "Confiez la vente de votre véhicule à un garage partenaire RoullePro. Commission réduite, visibilité maximale.",
    url: 'https://roullepro.com/depot-vente',
    siteName: 'RoullePro',
    locale: 'fr_FR',
    type: 'website',
  },
};

const FAQ = [
  {
    question: "Combien de temps dure le mandat de dépôt-vente ?",
    answer:
      "Le mandat est de 90 jours renouvelables. Si le véhicule n'est pas vendu à l'issue de cette période, vous le reprenez sans frais ni pénalité.",
  },
  {
    question: "Comment est calculé mon prix net vendeur ?",
    answer:
      "Vous fixez votre prix net souhaité. Le prix affiché aux acheteurs inclut les commissions (7% garage + 4% RoullePro) et les frais de préparation (250 € nets). Exemple : prix net 11 450 € → prix affiché 14 000 €.",
  },
  {
    question: "Que comprend la préparation à 250 € ?",
    answer:
      "Expertise 40 points, nettoyage complet intérieur/extérieur, photos HD professionnelles et mise en avant sur la plateforme RoullePro.",
  },
  {
    question: "Est-ce que je dois me déplacer ?",
    answer:
      "Oui, vous déposez votre véhicule chez un garage partenaire de votre choix. Le reste (photos, annonce, visites, offres) est géré par le garage et RoullePro.",
  },
  {
    question: "Comment suis-je payé lors de la vente ?",
    answer:
      "Dès l'acceptation d'une offre, l'acheteur verse un acompte de 500 € via Stripe. Le solde est versé directement lors de la signature chez le garage. RoullePro reverse votre part sous 48h ouvrées.",
  },
  {
    question: "Puis-je retirer mon véhicule avant la fin des 90 jours ?",
    answer:
      "Oui, à tout moment si aucune offre n'est en cours. Si une offre a été acceptée, le retrait n'est plus possible.",
  },
];

const ETAPES = [
  {
    num: '01',
    icon: TrendingUp,
    title: 'Estimez gratuitement',
    description:
      "Renseignez les infos de votre véhicule et obtenez une fourchette de prix instantanée. Sans engagement.",
  },
  {
    num: '02',
    icon: MapPin,
    title: 'Choisissez un garage',
    description:
      "Sélectionnez un garage partenaire certifié RoullePro près de chez vous et prenez rendez-vous en ligne.",
  },
  {
    num: '03',
    icon: Camera,
    title: 'On s\'occupe de tout',
    description:
      "Expertise 40 points, photos HD, annonce optimisée. Votre véhicule est mis en vente sur RoullePro sous 48h.",
  },
  {
    num: '04',
    icon: CreditCard,
    title: 'Paiement sécurisé',
    description:
      "Recevez les offres, acceptez ou refusez. L'acompte est sécurisé via Stripe. Paiement du solde garanti.",
  },
];

const TEMOIGNAGES = [
  {
    nom: "Marc Lefebvre",
    poste: "Gérant — Ambulances Lefebvre & Fils",
    texte:
      "Nous avons confié 3 VSL à RoullePro en 6 mois. Vendus en moyenne en 38 jours, avec des prix supérieurs à ce qu'on espérait. Le garage partenaire était vraiment professionnel.",
  },
  {
    nom: "Sandra Moreau",
    poste: "Directrice — Transport Moreau SARL",
    texte:
      "Processus simple, transparent et rapide. J'avais peur des complications administratives — en réalité tout se fait en ligne. Je recommande.",
  },
  {
    nom: "Karim Benzara",
    poste: "Auto-entrepreneur VTC — Paris",
    texte:
      "Vendu mon Vito en 22 jours pour 12 800 € net. Bien au-delà de ce que j'aurais obtenu en le bradant moi-même. Le service RoullePro vaut vraiment le coup.",
  },
];

export default function DepotVentePage() {
  return (
    <div className="bg-white">

      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-500 opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-blue-400 opacity-10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Service dépôt-vente professionnel
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              Nous vendons votre <br className="hidden sm:block" />
              <span className="text-blue-400">véhicule pour vous</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
              Confiez votre véhicule professionnel à un garage partenaire certifié. Nous gérons
              l'estimation, les photos, l'annonce et les offres. Vous touchez jusqu'à 88% du
              prix de vente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/depot-vente/estimer"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-xl transition text-base"
              >
                Obtenir une estimation gratuite
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/depot-vente/garages"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition text-base backdrop-blur-sm"
              >
                Voir les garages partenaires
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
              {[
                "Estimation gratuite et sans engagement",
                "88% du prix reversé au vendeur",
                "Reprise garantie si pas vendu en 90 jours",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-blue-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMMENT CA MARCHE ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Comment ça marche</h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            De l'estimation à la vente, RoullePro et ses garages partenaires s'occupent de tout.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ETAPES.map((etape, i) => {
            const Icon = etape.icon;
            return (
              <div key={etape.num} className="relative">
                {i < ETAPES.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[65%] w-[70%] h-px bg-gradient-to-r from-blue-200 to-transparent z-0" />
                )}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon size={22} className="text-blue-600" />
                    </div>
                    <span className="text-3xl font-extrabold text-slate-100">{etape.num}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{etape.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{etape.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── COMBIEN CA COUTE ────────────────────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Combien ça coûte</h2>
            <p className="text-slate-500 text-lg">
              Transparence totale — aucun frais caché.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Grille de répartition */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 text-lg mb-6">Répartition du prix de vente</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <div className="text-3xl font-extrabold text-emerald-600">88%</div>
                    <div className="text-sm font-medium text-emerald-700 mt-0.5">Pour vous</div>
                    <div className="text-xs text-slate-500 mt-1">Prix net vendeur</div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <div className="text-lg font-bold text-blue-600">7%</div>
                      <div className="text-xs font-medium text-blue-700">Garage partenaire</div>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                      <div className="text-lg font-bold text-indigo-600">4%</div>
                      <div className="text-xs font-medium text-indigo-700">RoullePro</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <div className="text-lg font-bold text-slate-600">250 €</div>
                      <div className="text-xs font-medium text-slate-600">Frais de préparation</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exemple concret */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
              <h3 className="font-bold text-lg mb-6">Exemple concret — véhicule à 14 000 €</h3>
              <div className="space-y-3">
                {[
                  { label: "Prix de vente affiché", value: "14 000 €", highlight: false },
                  { label: "Commission garage (7%)", value: "- 980 €", highlight: false },
                  { label: "Commission RoullePro (4%)", value: "- 560 €", highlight: false },
                  { label: "Frais de préparation", value: "- 250 €", highlight: false },
                  { label: "Vous recevez", value: "12 210 €", highlight: true },
                ].map((row) => (
                  <div
                    key={row.label}
                    className={`flex justify-between items-center py-2 ${
                      row.highlight
                        ? 'border-t-2 border-white/30 mt-2 pt-4'
                        : 'border-b border-white/10'
                    }`}
                  >
                    <span className={`text-sm ${row.highlight ? 'font-bold text-white' : 'text-blue-100'}`}>
                      {row.label}
                    </span>
                    <span className={`font-bold ${row.highlight ? 'text-xl' : 'text-white'}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-blue-200 text-xs mt-4">
                Soit 87,2% du prix de vente reversé. Les frais de préparation incluent expertise, photos HD et mise en ligne.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FILET DE SECURITE ───────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-8 md:p-12 border border-emerald-100">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <Shield size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Le filet de sécurité RoullePro</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                Si votre véhicule n'est pas vendu dans les <strong>90 jours</strong> suivant le dépôt, vous
                le récupérez sans frais et sans aucune pénalité. Zéro risque pour vous.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: Clock, title: "90 jours de mandat", desc: "Renouvelable si souhaité" },
                  { icon: Shield, title: "Reprise garantie", desc: "Aucun frais si pas vendu" },
                  { icon: CheckCircle, title: "Contrat tripartite", desc: "Sécurité juridique totale" },
                ].map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-3">
                      <ItemIcon size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{item.title}</div>
                        <div className="text-xs text-slate-500">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TEMOIGNAGES ─────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Ils nous font confiance</h2>
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TEMOIGNAGES.map((t) => (
              <div key={t.nom} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">
                  "{t.texte}"
                </p>
                <div className="border-t border-slate-100 pt-4">
                  <div className="font-semibold text-slate-900 text-sm">{t.nom}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.poste}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <HelpCircle size={14} /> FAQ
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Questions fréquentes</h2>
        </div>

        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.question} className="group bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
              <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none font-medium text-slate-900 hover:text-blue-600 transition-colors">
                {item.question}
                <ChevronDown
                  size={18}
                  className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0"
                />
              </summary>
              <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-50">
                <p className="mt-3">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ─── CTA FINAL ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-14 text-white text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à vendre votre véhicule ?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Obtenez votre estimation gratuite en moins de 2 minutes. Sans engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/depot-vente/estimer"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-base transition"
              >
                Obtenir une estimation gratuite
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/garage/inscription"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-base transition backdrop-blur-sm"
              >
                Devenir garage partenaire
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
