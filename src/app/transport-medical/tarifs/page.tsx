import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  CheckCircle2,
  Shield,
  Sparkles,
  Wallet,
  XCircle,
  ArrowRight,
  MessageCircle,
  Building2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tarifs — RoullePro Transport Médical",
  description:
    "Tout est gratuit pour les professionnels du transport sanitaire en 2026. Pas de commission, pas d'algorithme, pas d'engagement. Plus tard, des options simples et transparentes pour ceux qui le souhaitent.",
  alternates: { canonical: "/transport-medical/tarifs" },
};

export const dynamic = "force-dynamic";

export default async function TarifsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let ficheId: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("pros_sanitaire")
      .select("id")
      .eq("claimed_by", user.id)
      .maybeSingle();
    ficheId = data?.id ?? null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50/40">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-300/30 text-xs font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Gratuit pour tous les pros en 2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
            Un annuaire honnête,
            <br />
            sans commission ni algorithme
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            RoullePro n&apos;est pas une plateforme VTC. Vos patients restent vos patients, vos coordonnées sont
            visibles à vie, et vous gardez la main sur votre activité.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/transport-medical/pro/reclamer"
              className="inline-flex items-center gap-2 bg-white text-[#0066CC] hover:bg-blue-50 font-semibold px-5 py-3 rounded-xl transition"
            >
              Réclamer ma fiche gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/transport-medical/notre-engagement"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-5 py-3 rounded-xl transition"
            >
              Notre engagement
            </Link>
          </div>
        </div>
      </section>

      {/* Promesse 2026 */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="bg-white border-2 border-emerald-200 rounded-3xl p-8 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Heart className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Notre promesse
              </div>
              <div className="text-xl font-bold text-gray-900">
                Tout est gratuit pour les professionnels en 2026
              </div>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed mb-6">
            Pendant la phase de lancement, l&apos;ensemble des fonctionnalités est offert sans condition aux
            ambulanciers, sociétés de VSL et taxis conventionnés. Pas de carte bancaire à fournir, pas de période
            d&apos;essai déguisée, pas de relance commerciale agressive. Vous nous aidez à construire un annuaire
            utile, on vous aide à exister en ligne sans intermédiaire.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Fiche complète et illimitée",
              "Site web et email visibles publiquement",
              "Description, photos et horaires détaillés",
              "Bouton WhatsApp et appel direct",
              "Demandes de transport reçues par email",
              "Badge « Pro vérifié » après contrôle SIRET",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ce qu'on ne fera jamais */}
      <section className="max-w-5xl mx-auto px-4 pb-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
          Ce que RoullePro ne fera jamais
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Notre modèle est un annuaire enrichi, pas une plateforme de courses.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              t: "Pas de commission sur vos transports",
              d: "Vous facturez vos patients comme vous l'avez toujours fait. Aucun centime ne transite par RoullePro.",
            },
            {
              t: "Pas d'algorithme de matching",
              d: "Le patient ou l'EHPAD vous choisit directement. Personne ne décide à votre place qui prend la course.",
            },
            {
              t: "Pas de notation publique à 5 étoiles",
              d: "Le transport sanitaire repose sur la confiance, pas sur des avis anonymes qui peuvent ruiner une réputation.",
            },
            {
              t: "Pas d'enchère sur la visibilité",
              d: "Pas de système où celui qui paie le plus écrase les autres. La proximité reste le critère principal.",
            },
            {
              t: "Pas de revente de vos données",
              d: "Les coordonnées des patients restent strictement entre vous et eux. Aucune monétisation tierce.",
            },
            {
              t: "Pas d'engagement caché",
              d: "Si un jour vous prenez une option payante, elle sera mensuelle, sans engagement, résiliable en un clic.",
            },
          ].map((item) => (
            <div key={item.t} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">{item.t}</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plus tard - options envisagées */}
      <section className="max-w-5xl mx-auto px-4 pb-14">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-blue-100">
              <Wallet className="w-5 h-5 text-[#0066CC]" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#0066CC]">
                Plus tard, à titre indicatif
              </div>
              <div className="text-xl font-bold text-gray-900">
                Des options simples pour ceux qui veulent aller plus loin
              </div>
            </div>
          </div>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Quand l&apos;annuaire aura prouvé son utilité, deux options resteront strictement facultatives. Aucune
            n&apos;est nécessaire pour être visible, vérifié et joignable. Les tarifs ci-dessous sont indicatifs et
            seront annoncés au moins 60 jours avant toute mise en place.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Option Visibilité (envisagée)
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <div className="text-3xl font-bold text-gray-900">~19 €</div>
                <div className="text-sm text-gray-500">/mois HT, sans engagement</div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Un coup de pouce ponctuel pour apparaître mieux dans votre ville, avec des statistiques détaillées
                de votre fiche. Pas de Top 1, pas d&apos;enchère : juste un bonus de visibilité raisonnable.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" />
                  Mise en avant locale modérée
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" />
                  Statistiques de vues et de demandes
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" />
                  Galerie photos étendue
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Option Établissements (envisagée)
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <div className="text-3xl font-bold text-gray-900">~49 €</div>
                <div className="text-sm text-gray-500">/mois HT, sans engagement</div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Pour les sociétés qui travaillent avec EHPAD, cabinets et hôpitaux : recevoir les demandes
                récurrentes de prescripteurs B2B et un canal direct avec les établissements partenaires.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" />
                  Demandes des prescripteurs (EHPAD, dialyse...)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" />
                  Multi-utilisateurs pour la flotte
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" />
                  Support dédié par téléphone
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 text-xs text-gray-600 bg-white/60 border border-blue-100 rounded-xl p-3">
            <Shield className="w-3.5 h-3.5 inline mr-1 text-[#0066CC]" />
            Tant que rien n&apos;est annoncé officiellement, ces options ne sont pas commercialisées. Aucun pro
            inscrit aujourd&apos;hui ne sera basculé automatiquement vers une offre payante.
          </div>
        </div>
      </section>

      {/* Pour les établissements */}
      <section className="max-w-5xl mx-auto px-4 pb-14">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-[#0066CC]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Vous êtes un EHPAD, un cabinet médical ou un hôpital ?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nous construisons un module dédié aux prescripteurs réguliers : annuaire de partenaires de
                confiance, demandes de transport en quelques clics, suivi des trajets sans complexité. Si vous
                travaillez dans un établissement, écrivez-nous pour rejoindre la phase pilote (gratuite).
              </p>
              <Link
                href="mailto:contact@roullepro.com?subject=Phase%20pilote%20%C3%A9tablissement"
                className="inline-flex items-center gap-2 text-[#0066CC] hover:text-[#0052a3] font-semibold"
              >
                contact@roullepro.com
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-14 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          {ficheId ? "Votre fiche est déjà active" : "Prêt à reprendre la main sur votre fiche ?"}
        </h2>
        <p className="text-gray-600 mb-6">
          {ficheId
            ? "Vous pouvez à tout moment l'enrichir depuis votre espace pro."
            : "Cinq minutes suffisent. Aucun engagement, aucun paiement, aucune relance commerciale."}
        </p>
        <Link
          href={ficheId ? "/transport-medical/pro/dashboard" : "/transport-medical/pro/reclamer"}
          className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          {ficheId ? "Aller à mon espace pro" : "Réclamer ma fiche gratuitement"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#0066CC]" />
          Questions fréquentes
        </h2>
        <div className="space-y-3">
          <Faq q="Pourquoi tout est-il gratuit en 2026 ?">
            Parce qu&apos;un annuaire ne vaut rien sans les pros qui le font vivre. Tant que la base ne couvre pas
            l&apos;ensemble du territoire avec des fiches enrichies par leurs propriétaires, faire payer
            n&apos;aurait aucun sens. Quand le service prouvera son utilité, des options payantes pourront
            apparaître, mais le socle restera toujours gratuit.
          </Faq>
          <Faq q="Pourquoi pas de notation publique ?">
            Parce que le transport sanitaire ne fonctionne pas comme une course Uber. Un patient stressé, une
            famille dépassée, un délai serré : le contexte rend les avis injustes. Nous préférons un système de
            confiance basé sur la vérification SIRET, l&apos;ancienneté et l&apos;échange direct.
          </Faq>
          <Faq q="Comment vous rémunérerez-vous plus tard ?">
            Avec des options strictement facultatives pour les pros qui veulent davantage de visibilité ou un
            canal B2B avec les établissements. Jamais de commission sur les courses, jamais de revente de
            données, jamais d&apos;enchère. Le socle public restera gratuit.
          </Faq>
          <Faq q="Ma fiche est déjà en ligne, dois-je faire quelque chose ?">
            Oui : la réclamer. Cela ne coûte rien et vous donne le contrôle (modification, photos, horaires,
            site web, demandes de transport). Sans réclamation, votre fiche reste basée sur les données SIRENE
            publiques.
          </Faq>
          <Faq q="Je suis ambulancier, VSL ou taxi conventionné, est-ce pour moi ?">
            Oui. Tous les professionnels du transport sanitaire inscrits au registre INSEE (NAF 86.90A, 49.32Z,
            49.39A) sont concernés, qu&apos;ils soient artisans, sociétés ou groupes.
          </Faq>
          <Faq q="Puis-je supprimer ma fiche ?">
            Oui, à tout moment depuis votre espace pro ou par simple email à contact@roullepro.com. La
            suppression est définitive et effective sous 48 h.
          </Faq>
        </div>
      </section>
    </main>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="bg-white border border-gray-200 rounded-xl p-4 group">
      <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
        {q}
        <span className="text-[#0066CC] group-open:rotate-45 transition">+</span>
      </summary>
      <p className="mt-3 text-sm text-gray-600 leading-relaxed">{children}</p>
    </details>
  );
}
