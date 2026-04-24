import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  BadgeCheck,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  Building2,
  Search,
  ChevronRight,
  CheckCircle2,
  Star,
  Truck,
  Wrench,
} from "lucide-react";
import ReclamerRechercheForm from "@/components/sanitaire/ReclamerRechercheForm";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Espace professionnels — Ambulances, VSL, Taxis conventionnés | RoullePro",
  description:
    "Réclamez gratuitement votre fiche sur RoullePro. Augmentez votre visibilité, recevez des demandes directement, gérez votre présence en ligne. Inscription SIRET vérifiée.",
  alternates: { canonical: "/pro" },
};

async function getCount() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { count } = await supabase
    .from("pros_sanitaire")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function ProPage() {
  const total = await getCount();

  return (
    <main className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-[#0B1120] via-[#0f2048] to-[#0066CC] text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-16 sm:pt-20 sm:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium mb-5">
              <Building2 className="w-3.5 h-3.5" />
              Espace professionnels — Transport sanitaire
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
              Votre fiche sur RoullePro, gratuite et vérifiée
            </h1>
            <p className="text-base sm:text-lg text-blue-100 mb-8 max-w-2xl">
              Rejoignez les {total.toLocaleString("fr-FR")} professionnels référencés. Recevez des demandes directement, valorisez votre agrément, gérez votre présence en ligne. 100 % gratuit pour les fonctionnalités de base.
            </p>

            <ReclamerRechercheForm />

            <div className="mt-4 text-sm text-blue-100">
              Saisissez votre nom d'entreprise ou votre SIRET pour trouver votre fiche.
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Pourquoi réclamer votre fiche ?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            RoullePro est l'annuaire indépendant du transport sanitaire. Les patients et leurs familles recherchent des professionnels chaque jour.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Benefit
            icon={<BadgeCheck className="w-5 h-5" />}
            title="Badge Pro vérifié"
            desc="Un signe de confiance pour les patients. Obtenu après validation de votre agrément préfectoral."
          />
          <Benefit
            icon={<MessageSquare className="w-5 h-5" />}
            title="Demandes directes"
            desc="Les patients vous contactent via la fiche. Messagerie dédiée, pas de commission."
          />
          <Benefit
            icon={<BarChart3 className="w-5 h-5" />}
            title="Statistiques de vues"
            desc="Suivez combien de fois votre fiche est consultée et optimisez votre présence."
          />
          <Benefit
            icon={<Search className="w-5 h-5" />}
            title="Visibilité SEO"
            desc="Chaque fiche est optimisée pour Google. Votre entreprise remonte sur les recherches locales."
          />
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-14 sm:py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Comment ça marche</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une procédure simple et sécurisée pour reprendre le contrôle de votre fiche.
            </p>
          </div>
          <ol className="space-y-4">
            {[
              {
                n: "01",
                title: "Trouvez votre fiche",
                desc: "Recherchez par nom d'entreprise ou SIRET. Si elle n'existe pas encore, contactez-nous pour la créer.",
              },
              {
                n: "02",
                title: "Recevez un code par email",
                desc: "Un code à 6 chiffres est envoyé à votre email professionnel pour confirmer que vous êtes bien le gestionnaire.",
              },
              {
                n: "03",
                title: "Transmettez votre justificatif",
                desc: "KBIS ou agrément préfectoral (PDF/JPG/PNG, max 10 Mo). Validation par notre équipe sous 48 h ouvrées.",
              },
              {
                n: "04",
                title: "Gérez votre fiche",
                desc: "Modifiez horaires, coordonnées, description, photos. Répondez aux demandes des patients.",
              },
            ].map((step) => (
              <li key={step.n} className="flex gap-5 bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 text-[#0066CC] flex items-center justify-center text-sm font-bold">
                  {step.n}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Passez au niveau supérieur</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            La fiche gratuite couvre l'essentiel. Les abonnements Essential, Premium et Pro+ débloquent plus de visibilité et d'outils.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <PlanCard
            nom="Essential"
            prix="19,90 €"
            couleur="border-blue-200"
            accent="bg-blue-50 text-[#0066CC]"
            avantages={[
              "Badge Pro vérifié",
              "Mise en avant locale",
              "Statistiques basiques",
              "Support email",
            ]}
          />
          <PlanCard
            nom="Premium"
            prix="39 €"
            couleur="border-indigo-300 ring-2 ring-indigo-100"
            accent="bg-indigo-50 text-indigo-700"
            populaire
            avantages={[
              "Tout Essential",
              "Photos illimitées",
              "Badge Recommandé",
              "Priorité dans les résultats",
              "Statistiques avancées",
            ]}
          />
          <PlanCard
            nom="Pro+"
            prix="79 €"
            couleur="border-amber-200"
            accent="bg-amber-50 text-amber-700"
            avantages={[
              "Tout Premium",
              "Page entreprise enrichie",
              "Multi-fiches (flotte)",
              "Leads qualifiés",
              "Support prioritaire",
            ]}
          />
        </div>
        <div className="text-center mt-8">
          <Link
            href="/transport-medical/tarifs"
            className="inline-flex items-center gap-2 text-[#0066CC] font-semibold hover:underline"
          >
            Voir le détail des tarifs <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">L'écosystème RoullePro</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Au-delà de l'annuaire, RoullePro accompagne les pros du transport routier.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <EcosystemCard
              href="/annonces"
              icon={<Truck className="w-5 h-5" />}
              title="Marketplace véhicules"
              desc="Achetez et vendez des ambulances, VSL, taxis, VTC, utilitaires entre professionnels vérifiés."
            />
            <EcosystemCard
              href="/depot-vente"
              icon={<Wrench className="w-5 h-5" />}
              title="Dépôt-vente garages"
              desc="Confiez la vente de votre véhicule à un garage partenaire : expertise, photos, négociation."
            />
            <EcosystemCard
              href="/blog"
              icon={<Star className="w-5 h-5" />}
              title="Guides & actualités"
              desc="Réglementation sanitaire, conventionnement CPAM, cession de licence : tout pour piloter votre activité."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gradient-to-br from-[#0B1120] to-[#0f2048] text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Prêt à rejoindre l'annuaire ?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Réclamation gratuite. Validation manuelle par notre équipe sous 48 h ouvrées.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/transport-medical/pro/reclamer"
              className="inline-flex items-center gap-2 bg-white text-[#0066CC] font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition"
            >
              Réclamer ma fiche <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/30 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Benefit({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition">
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066CC] flex items-center justify-center mb-3">{icon}</div>
      <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}

function PlanCard({
  nom,
  prix,
  couleur,
  accent,
  avantages,
  populaire = false,
}: {
  nom: string;
  prix: string;
  couleur: string;
  accent: string;
  avantages: string[];
  populaire?: boolean;
}) {
  return (
    <div className={`relative bg-white rounded-2xl border ${couleur} p-6`}>
      {populaire && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Le plus populaire
        </div>
      )}
      <div className={`inline-flex px-2.5 py-0.5 rounded text-xs font-medium ${accent} mb-3`}>{nom}</div>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-bold text-gray-900">{prix}</span>
        <span className="text-sm text-gray-500">/mois</span>
      </div>
      <ul className="space-y-2 mb-5">
        {avantages.map((a) => (
          <li key={a} className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span>{a}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/transport-medical/tarifs"
        className="block text-center text-sm font-semibold text-[#0066CC] hover:underline"
      >
        Choisir ce plan
      </Link>
    </div>
  );
}

function EcosystemCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group block bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition"
    >
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066CC] flex items-center justify-center mb-3">{icon}</div>
      <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{desc}</p>
      <span className="inline-flex items-center gap-1 text-sm font-medium text-[#0066CC] group-hover:gap-2 transition-all">
        En savoir plus <ChevronRight className="w-4 h-4" />
      </span>
    </Link>
  );
}
