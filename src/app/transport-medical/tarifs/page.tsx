import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  CheckCircle2,
  Sparkles,
  XCircle,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import CheckoutButton from "@/components/sanitaire/CheckoutButton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Une seule offre simple et honnête : Plan Pro à 19,90€/mois pour activer la messagerie patients, l'équipe de 6 experts IA du transport sanitaire (réponses sourcées ameli.fr, Légifrance…) et la visibilité. Forum entre pros vérifiés inclus. Pas de commission, sans engagement.",
  alternates: { canonical: "/transport-medical/tarifs" },
};

export const dynamic = "force-dynamic";

export default async function TarifsPage({
  searchParams,
}: {
  searchParams: Promise<{ raison?: string }>;
}) {
  const { raison } = await searchParams;
  const abonnementRequis = raison === "abonnement_requis";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let ficheId: string | null = null;
  let currentPlan: string | null = null;
  let stripeSubId: string | null = null;
  let planOfferSource: string | null = null;
  let planExpiresAt: string | null = null;
  if (user) {
    // Un pro connecté peut avoir réclamé une (ou plusieurs) fiche(s) : on prend
    // la première pour l'emmener directement au checkout, sans jamais lui
    // redemander de rechercher son entreprise.
    const { data: fiches } = await supabase
      .from("pros_sanitaire")
      .select("id, plan, stripe_subscription_id, plan_offer_source, plan_expires_at")
      .eq("claimed_by", user.id)
      .order("created_at", { ascending: true })
      .limit(1);
    const data = fiches?.[0] ?? null;
    ficheId = data?.id ?? null;
    currentPlan = data?.plan ?? null;
    stripeSubId = (data?.stripe_subscription_id as string | null) ?? null;
    planOfferSource = (data?.plan_offer_source as string | null) ?? null;
    planExpiresAt = (data?.plan_expires_at as string | null) ?? null;
  }
  const isPro =
    currentPlan === "essential" || currentPlan === "premium" || currentPlan === "pro_plus";
  // En essai gratuit (auto-trial) : pas d'abonnement Stripe + offer_source présent
  const isOnFreeTrial = isPro && !stripeSubId && !!planOfferSource;
  const trialEndsAtLabel = planExpiresAt
    ? new Date(planExpiresAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50/40">
      {abonnementRequis && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              Votre période d&apos;essai est terminée. Passez au plan Pro (19,90 €/mois TTC)
              pour accepter les courses qui vous sont proposées. Vous continuez à recevoir
              toutes les demandes par email et SMS.
            </p>
          </div>
        </div>
      )}
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-300/30 text-xs font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Une offre, simple et transparente
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
            Une fiche gratuite à vie,
            <br />
            une option Pro à 19,90€
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            RoullePro n&apos;est pas une plateforme VTC. Vos patients restent vos patients, vos coordonnées sont
            visibles à vie, et vous gardez la main sur votre activité.
          </p>
        </div>
      </section>

      {/* Bandeau promo de lancement */}
      {!isPro && (
        <section className="max-w-5xl mx-auto px-4 pt-10">
        </section>
      )}

      {/* Les deux plans */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Plan gratuit */}
          <div className="bg-white border border-gray-200 rounded-3xl p-7 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-emerald-600" />
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Pour tous les pros
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">Fiche Gratuite</div>
            <div className="flex items-baseline gap-1 mb-5">
              <div className="text-4xl font-bold text-gray-900">0 €</div>
              <div className="text-sm text-gray-500">à vie</div>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {[
                "Fiche complète et illimitée",
                "Site web et email visibles publiquement",
                "Description, photos et horaires détaillés",
                "Bouton WhatsApp et appel direct",
                "Badge « Pro vérifié » après contrôle SIRET",
                "Réception des appels téléphoniques directs",
                "Forum entre pros : lecture libre, écriture réservée aux pros vérifiés",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={ficheId ? "/transport-medical/pro/dashboard" : "/transport-medical/pro/reclamer"}
              className="block text-center bg-gray-900 hover:bg-gray-800 text-white font-semibold px-5 py-3 rounded-xl transition"
            >
              {ficheId ? "Aller à mon espace pro" : "Réclamer ma fiche gratuitement"}
            </Link>
          </div>

          {/* Plan Pro 19,90€ */}
          <div className="bg-white border-2 border-emerald-400 rounded-3xl p-7 shadow-lg relative flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-xs font-semibold bg-emerald-600 text-white px-3 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              Recommandé
            </div>
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-5 h-5 text-[#0066CC]" />
              <div className="text-xs font-semibold uppercase tracking-wide text-[#0066CC]">
                Pour aller plus loin
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">Plan Pro</div>
            <div className="flex items-baseline gap-1 mb-5">
              <div className="text-4xl font-bold text-[#0066CC]">19,90 €</div>
              <div className="text-sm text-gray-500">/mois TTC, sans engagement</div>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {[
                "Tout ce qui est inclus dans la fiche gratuite",
                "Messagerie patients activée",
                "Équipe de 6 experts IA du transport sanitaire, réponses sourcées (ameli.fr, Légifrance…)",
                "Lecture et réponse aux demandes structurées",
                "Meilleure visibilité dans votre ville",
                "Veille réglementaire métier incluse (alertes par email)",
                "Tableau de bord conformité (checklist obligations légales)",
                "Statistiques détaillées (vues, appels, messages)",
                "Recevez par email les demandes de transport de votre département",
                "Résiliation en un clic, sans frais",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            {isPro && !isOnFreeTrial ? (
              <div className="block text-center bg-emerald-50 text-emerald-700 font-semibold px-5 py-3 rounded-xl border border-emerald-200">
                Votre plan actuel
              </div>
            ) : isOnFreeTrial && ficheId ? (
              <div className="space-y-2">
                <div className="text-center text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Vous êtes en essai gratuit{trialEndsAtLabel ? ` jusqu'au ${trialEndsAtLabel}` : ""}. Activez votre abonnement dès maintenant : votre carte ne sera débitée qu'à la fin de l'essai.
                </div>
                <CheckoutButton planKey="essential" ficheId={ficheId} popular />
              </div>
            ) : user && ficheId ? (
              <CheckoutButton planKey="essential" ficheId={ficheId} popular />
            ) : (
              <Link
                href={
                  user ? "/transport-medical/pro" : "/auth/login?next=/transport-medical/tarifs"
                }
                className="block text-center bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-3 rounded-xl transition"
              >
                {user ? "Réclamer ma fiche d'abord" : "Se connecter pour activer"}
              </Link>
            )}
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
              d: "Le plan Pro est mensuel, sans engagement, résiliable en un clic depuis votre espace pro.",
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

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-14 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          {ficheId
            ? "Votre fiche est déjà active"
            : "Prêt à reprendre la main sur votre fiche ?"}
        </h2>
        <p className="text-gray-600 mb-6">
          {ficheId
            ? "Vous pouvez à tout moment l'enrichir ou activer le plan Pro depuis votre espace."
            : "Cinq minutes suffisent. La fiche est gratuite à vie. Le plan Pro est optionnel et résiliable en un clic."}
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
          <Faq q="Que comprend exactement la fiche gratuite ?">
            Tout ce dont un pro a besoin pour exister en ligne : nom, adresse, téléphone, email, site web,
            description, photos, horaires, badge vérifié. Les patients peuvent vous appeler directement, vous
            écrire par email ou via WhatsApp. Cette fiche reste gratuite à vie, sans condition.
          </Faq>
          <Faq q="Pourquoi 19,90€ pour le plan Pro ?">
            Parce que la messagerie structurée (demandes datées, lieux, type de transport) et la mise en avant
            locale ont un coût technique réel. 19,90€/mois c&apos;est ce qu&apos;il faut pour faire vivre le
            service correctement, sans pub ni revente de données. C&apos;est aussi un prix juste comparé aux
            plateformes de courses qui prennent 20% à 30% par trajet.
          </Faq>
          <Faq q="Qu'est-ce que l'équipe d'experts IA incluse dans le plan Pro ?">
            Le plan Pro débloque une équipe de 6 assistants IA spécialisés dans le transport sanitaire :
            un Assistant général, un Expert Réglementaire, un Expert Facturation, un Conseiller Commercial,
            un Conseiller RH et un Conseiller Gestion. Ils répondent à vos questions métier (conventionnement
            CPAM, facturation SEFi/B2, tarifs, réglementation, marchés publics, paie…) en s&apos;appuyant sur
            une base documentaire de sources officielles (ameli.fr, Légifrance, service-public.fr, URSSAF…),
            avec citations cliquables et mémoire de vos conversations. Un quota mensuel de messages est inclus.
          </Faq>
          <Faq q="Comment fonctionnent les demandes de transport ?">
            Quand un patient, une famille ou un établissement remplit le formulaire de demande sur
            RoullePro, la demande est envoyée par email aux professionnels vérifiés (fiche réclamée et
            validée) du département de départ, selon le type de transport recherché (taxi conventionné,
            VSL ou ambulance). Vous recevez ainsi directement, sur l&apos;email de votre fiche, les
            demandes de votre département — sans commission et sans intermédiaire. Vous restez libre de
            recontacter le demandeur ou non.
          </Faq>
          <Faq q="Comment fonctionne le forum entre professionnels ?">
            Le forum est organisé en 7 catégories métier (conventionnement CPAM, facturation &amp; rejets,
            réglementation, matériel &amp; véhicules, emploi &amp; RH, entraide entre confrères, annonces &amp;
            divers). La lecture est ouverte à tous ; publier et répondre est réservé aux professionnels vérifiés
            (au moins une fiche réclamée et validée). C&apos;est un espace d&apos;entraide entre confrères,
            accessible dès la fiche gratuite une fois votre statut vérifié.
          </Faq>
          <Faq q="Puis-je résilier à tout moment ?">
            Oui, en un clic depuis votre espace pro. Aucune pénalité, aucun frais. Votre fiche reste visible en
            gratuit, vous gardez vos données.
          </Faq>
          <Faq q="Pourquoi pas de notation publique ?">
            Parce que le transport sanitaire ne fonctionne pas comme une course Uber. Un patient stressé, une
            famille dépassée, un délai serré : le contexte rend les avis injustes. Nous préférons un système de
            confiance basé sur la vérification SIRET, l&apos;ancienneté et l&apos;échange direct.
          </Faq>
          <Faq q="Ma fiche est déjà en ligne, dois-je faire quelque chose ?">
            Oui : la réclamer. Cela ne coûte rien et vous donne le contrôle (modification, photos, horaires,
            site web). Sans réclamation, votre fiche reste basée uniquement sur les données SIRENE publiques.
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
