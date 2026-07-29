import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  CheckCircle2,
  Sparkles,
  XCircle,
  ArrowRight,
  MessageCircle,
  Search,
  Share2,
  Bot,
  Users,
  Building2,
  Inbox,
} from "lucide-react";
import CheckoutButton from "@/components/sanitaire/CheckoutButton";
import { createClient } from "@/lib/supabase/server";
import AllopointsProtectEncart from "@/components/partenaires/AllopointsProtectEncart";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "La plateforme du transport sanitaire au service des professionnels. Pour 19,90€/mois : référencement sur Google et sur les IA, demandes de transport, une IA qui rédige et programme vos publications sur les réseaux sociaux, 6 assistants IA spécialisés métier et un forum entre pros. Fiche gratuite à vie, sans engagement.",
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
    ? new Date(planExpiresAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" })
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50/40">
      {abonnementRequis && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              Votre période d&apos;essai est terminée. Passez au plan Pro (19,90 €/mois TTC)
              pour accepter les demandes de transport qui vous sont proposées. Vous continuez à
              recevoir toutes les demandes par email et SMS.
            </p>
          </div>
        </div>
      )}
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-300/30 text-xs font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            La plateforme du transport sanitaire au service des professionnels
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
            Tout pour développer votre activité
            <br />
            pour 19,90€ par mois
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Vous êtes référencé sur Google et sur les IA, vous recevez des demandes de transport
            par email et SMS, une IA rédige et programme vos publications sur les réseaux sociaux,
            vous accédez à 6 assistants IA spécialisés métier et à un forum entre pros. Sans engagement.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={ficheId ? "/transport-medical/pro/dashboard" : "/transport-medical/pro/reclamer"}
              className="inline-flex items-center gap-2 bg-white text-[#0B1120] hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition"
            >
              {ficheId ? "Aller à mon espace pro" : "Réclamer ma fiche gratuitement"}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#plans"
              className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition"
            >
              Voir les tarifs
            </a>
          </div>
        </div>
      </section>

      {/* Ce que RoullePro fait pour vous */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
          Ce que RoullePro fait pour votre entreprise
        </h2>
        <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
          Un annuaire de 26 000 professionnels du transport sanitaire, des outils métier et une
          communauté de confrères vérifiés. Le tout depuis un seul espace pro.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              Icon: Search,
              t: "Référencé sur Google et sur les IA",
              d: "Votre fiche est optimisée pour la recherche locale et lisible par les IA génératives (ChatGPT, Perplexity) via nos fichiers llms.txt.",
            },
            {
              Icon: Inbox,
              t: "Des demandes de transport",
              d: "Patients, familles et établissements remplissent un formulaire structuré : date, lieux, type de transport. Vous les recevez par email et SMS.",
            },
            {
              Icon: Share2,
              t: "Une IA sur vos réseaux sociaux",
              d: "Vous connectez vos comptes Facebook, Instagram et Google Business ; une IA métier rédige et programme vos publications à votre place.",
            },
            {
              Icon: Bot,
              t: "6 assistants IA spécialisés",
              d: "Réglementation, facturation, commercial, RH, gestion : des réponses métier sourcées sur ameli.fr, Légifrance ou service-public.fr.",
            },
            {
              Icon: Users,
              t: "Un forum entre pros",
              d: "Déjà en ligne : conventionnement, rejets de facturation, matériel, recrutement. Réservé en écriture aux professionnels vérifiés.",
            },
            {
              Icon: CheckCircle2,
              t: "La conformité suivie",
              d: "Veille réglementaire par email, tableau de bord des obligations légales et statistiques détaillées de votre fiche.",
            },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-[#0066CC]" />
              </div>
              <div className="font-semibold text-gray-900 mb-1.5">{t}</div>
              <p className="text-sm text-gray-600 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Les plans */}
      <section id="plans" className="max-w-6xl mx-auto px-4 pb-14 scroll-mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
          Nos tarifs
        </h2>
        <p className="text-gray-600 text-center mb-10">
          Une fiche gratuite à vie, une option Pro à 19,90€. Pas de commission, pas d&apos;engagement.
        </p>
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
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
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-xs font-semibold bg-emerald-600 text-white px-3 py-1 rounded-full whitespace-nowrap">
              <Sparkles className="w-3 h-3" />
              Recommandé
            </div>
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-5 h-5 text-[#0066CC]" />
              <div className="text-xs font-semibold uppercase tracking-wide text-[#0066CC]">
                Pour développer votre activité
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
                "Studio réseaux sociaux IA : une IA rédige et programme vos publications",
                "6 assistants IA spécialisés métier, réponses sourcées (ameli.fr, Légifrance…)",
                "Demandes de transport de votre département par email et SMS",
                "Messagerie patients et demandes structurées (date, lieux, type)",
                "Meilleure visibilité dans votre ville",
                "Veille réglementaire métier incluse (alertes par email)",
                "Tableau de bord conformité (checklist obligations légales)",
                "Statistiques détaillées (vues, appels, messages)",
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
                  Vous êtes en essai gratuit{trialEndsAtLabel ? ` jusqu'au ${trialEndsAtLabel}` : ""}. Activez votre abonnement dès maintenant : votre carte ne sera débitée qu&apos;à la fin de l&apos;essai.
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

          {/* Plan Établissements — phase pilote */}
          <div className="bg-white border border-gray-200 rounded-3xl p-7 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-gray-500" />
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                EHPAD, cabinets, hôpitaux
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">Plan Établissements</div>
            <div className="flex items-baseline gap-1 mb-2">
              <div className="text-4xl font-bold text-gray-700">49 €</div>
              <div className="text-sm text-gray-500">/mois, tarif indicatif</div>
            </div>
            <div className="inline-flex self-start items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full mb-5">
              Phase pilote — courant 2026
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {[
                "Recherche d'un transport disponible pour un patient",
                "Numéros directs des professionnels, sans centrale d'appels",
                "Demandes de transport envoyées aux pros du département",
                "Suivi des demandes passées",
                "Accès pilote gratuit pendant 3 mois",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/prescripteurs"
              className="block text-center border border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold px-5 py-3 rounded-xl transition"
            >
              Demander un accès pilote
            </Link>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-6">
          Le plan Établissements est encore en phase pilote : le périmètre et le tarif définitifs
          seront confirmés courant 2026. Il n&apos;est pas encore ouvert à la souscription directe.
        </p>
      </section>

      {/* Détail des fonctionnalités du plan Pro */}
      <section className="max-w-5xl mx-auto px-4 pb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
          Ce que contient le plan Pro, en détail
        </h2>
        <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
          Chaque fonctionnalité est en ligne aujourd&apos;hui et accessible depuis votre espace pro.
        </p>

        <div className="space-y-6">
          {/* Studio réseaux sociaux IA */}
          <div className="bg-white border border-gray-200 rounded-3xl p-7">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Share2 className="w-5 h-5 text-[#0066CC]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Studio réseaux sociaux IA
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  Vous connectez vous-même vos comptes Facebook, Instagram et Google Business
                  Profile en quelques clics (autorisation OAuth officielle). Ensuite, une IA
                  spécialisée dans le transport sanitaire rédige et programme vos publications à
                  votre place : conseils aux patients, zone desservie, réassurance sur le
                  conventionnement, coulisses de l&apos;entreprise. Chaque post est personnalisé
                  avec le nom, la ville et le département de votre entreprise.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Ce n&apos;est pas une agence ni une équipe humaine qui publie pour vous : vous
                  gardez la main sur chaque publication, vous pouvez la modifier, la reprogrammer
                  ou simplement la copier. Le quota inclus est de 8 posts générés et 8 publications
                  par mois.
                </p>
                <Link
                  href="/transport-medical/pro/studio-social"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066CC] hover:underline"
                >
                  Découvrir le Studio réseaux sociaux
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* 6 assistants IA */}
          <div className="bg-white border border-gray-200 rounded-3xl p-7">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-[#0066CC]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  6 assistants IA spécialisés dans le transport sanitaire
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  Le plan Pro débloque six assistants distincts, chacun entraîné sur son domaine.
                  Leurs réponses s&apos;appuient sur une base documentaire de sources officielles
                  (ameli.fr, Légifrance, service-public.fr, URSSAF) avec citations cliquables, et
                  ils gardent la mémoire de vos conversations.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  {[
                    { t: "Assistant général", d: "Vos questions du quotidien sur l'activité et la plateforme." },
                    { t: "Expert Réglementaire", d: "Agrément ARS, autorisations, obligations légales, textes applicables." },
                    { t: "Expert Facturation", d: "Conventionnement CPAM, SEFi/B2, rejets, tarifs et remboursements." },
                    { t: "Conseiller Commercial", d: "Relation prescripteurs, marchés publics, développement local." },
                    { t: "Conseiller RH", d: "Contrats, paie, convention collective, recrutement d'ambulanciers." },
                    { t: "Conseiller Gestion", d: "Rentabilité, coût kilométrique, trésorerie, pilotage de flotte." },
                  ].map((a) => (
                    <div key={a.t} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <div className="font-semibold text-sm text-gray-900 mb-1">{a.t}</div>
                      <p className="text-xs text-gray-600 leading-relaxed">{a.d}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Un quota mensuel de messages est inclus dans le plan Pro. Les assistants sont
                  accessibles depuis votre espace pro, onglet Assistant IA.
                </p>
              </div>
            </div>
          </div>

          {/* Référencement Google + IA */}
          <div className="bg-white border border-gray-200 rounded-3xl p-7">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-[#0066CC]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Référencé sur Google et sur les IA
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  L&apos;annuaire RoullePro référence 26 000 professionnels du transport sanitaire
                  (ambulances, VSL, taxis conventionnés) sur des pages par ville, par département
                  et par catégorie, avec le travail de référencement naturel qui va avec. Votre
                  fiche bénéficie de cette structure : elle est trouvable quand un patient cherche
                  un transport dans votre secteur.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Le site expose également des fichiers{" "}
                  <a href="/llms.txt" className="text-[#0066CC] hover:underline">
                    llms.txt
                  </a>{" "}
                  et{" "}
                  <a href="/llms-full.txt" className="text-[#0066CC] hover:underline">
                    llms-full.txt
                  </a>
                  , un format standard destiné aux IA génératives. Concrètement, l&apos;annuaire est
                  lisible par ChatGPT, Perplexity et les autres assistants que vos patients
                  utilisent de plus en plus pour trouver un transporteur. Le plan Pro renforce
                  cette visibilité en plaçant votre fiche en tête des résultats de votre ville.
                </p>
              </div>
            </div>
          </div>

          {/* Demandes de transport */}
          <div className="bg-white border border-gray-200 rounded-3xl p-7">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Inbox className="w-5 h-5 text-[#0066CC]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Demandes de transport et messagerie patients
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Quand un patient, une famille ou un établissement remplit le formulaire de
                  demande, celle-ci arrive structurée : date et heure souhaitées, adresse de départ
                  et d&apos;arrivée, type de transport, présence d&apos;un bon de transport. Vous la
                  recevez par email et, si vous le souhaitez, par SMS, puis vous l&apos;acceptez ou
                  la refusez depuis votre espace pro. Aucune commission n&apos;est prélevée et
                  personne ne s&apos;interpose entre vous et le demandeur.
                </p>
              </div>
            </div>
          </div>

          {/* Forum */}
          <div className="bg-white border border-gray-200 rounded-3xl p-7">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#0066CC]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Le forum entre professionnels
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  Le forum est déjà en ligne et organisé en catégories métier : conventionnement
                  CPAM, facturation et rejets, réglementation, matériel et véhicules, emploi et RH,
                  entraide entre confrères, annonces et divers. La lecture est ouverte à tous ;
                  publier et répondre est réservé aux professionnels vérifiés, c&apos;est-à-dire
                  ayant au moins une fiche réclamée et validée. C&apos;est un espace d&apos;entraide
                  entre transporteurs sanitaires, sans anonymat ni démarchage.
                </p>
                <Link
                  href="/forum"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066CC] hover:underline"
                >
                  Voir le forum
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ce qu'on ne fera jamais */}
      <section className="max-w-5xl mx-auto px-4 py-14">
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
              d: "Le patient ou l'EHPAD vous choisit directement. Personne ne décide à votre place qui prend en charge le transport.",
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
            Parce que l&apos;ensemble a un coût technique réel : la messagerie structurée, les six
            assistants IA, la génération et la programmation de vos publications sur les réseaux
            sociaux, la veille réglementaire et le travail de référencement. 19,90€/mois c&apos;est
            ce qu&apos;il faut pour faire vivre le service correctement, sans pub ni revente de
            données. C&apos;est aussi un prix juste comparé aux plateformes de courses qui prennent
            20% à 30% par trajet.
          </Faq>
          <Faq q="Qu'est-ce que le Studio réseaux sociaux IA ?">
            C&apos;est un outil en libre-service : vous connectez vous-même vos comptes Facebook,
            Instagram et Google Business Profile via l&apos;autorisation officielle de chaque
            plateforme, et une IA spécialisée dans le transport sanitaire rédige et programme vos
            publications à votre place. Ce n&apos;est pas une agence ni une équipe humaine qui
            publie pour vous : vous relisez, modifiez ou reprogrammez chaque post depuis votre
            espace pro. Le quota inclus est de 8 posts générés et 8 publications par mois.
          </Faq>
          <Faq q="Faut-il des compétences techniques pour utiliser le Studio réseaux sociaux ?">
            Non. La connexion de vos comptes se fait en quelques clics, comme lorsque vous
            autorisez une application à accéder à votre page Facebook. Vous pouvez révoquer cette
            autorisation à tout moment depuis vos réseaux sociaux ou depuis votre espace pro. Si
            vous préférez publier vous-même, l&apos;IA génère le texte et vous le copiez en un clic.
          </Faq>
          <Faq q="Que valent les réponses des 6 assistants IA ?">
            Chaque assistant est spécialisé (général, réglementaire, facturation, commercial, RH,
            gestion) et répond en s&apos;appuyant sur une base documentaire de sources officielles :
            ameli.fr, Légifrance, service-public.fr, URSSAF. Les citations sont cliquables, vous
            pouvez donc vérifier la source de chaque réponse. Ils font gagner du temps sur les
            questions courantes, mais ne remplacent pas votre expert-comptable ni votre avocat sur
            un dossier complexe. Un quota mensuel de messages est inclus dans le plan Pro. Pour
            préparer l&apos;échéance 2027, consultez notre dossier{" "}
            <Link href="/transport-medical/sefi-2027" className="text-[#0066CC] hover:underline">
              SEFi et géolocalisation 2027
            </Link>
            .
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
          <Faq q="Qu'est-ce que le référencement « sur les IA » ?">
            En plus du travail de référencement naturel sur Google, le site expose deux fichiers
            standards, /llms.txt et /llms-full.txt, conçus pour être lus par les IA génératives.
            Quand un patient demande à ChatGPT ou Perplexity de lui trouver un transport sanitaire
            dans sa ville, l&apos;annuaire RoullePro et ses fiches font partie des contenus
            exploitables. C&apos;est un canal encore jeune, mais qui progresse vite et sur lequel
            nous investissons dès maintenant.
          </Faq>
          <Faq q="Le plan Établissements est-il disponible ?">
            Pas encore. Il est en phase pilote et son ouverture est prévue courant 2026, avec un
            tarif indicatif de 49€/mois. Les EHPAD, cabinets et hôpitaux qui souhaitent le tester
            peuvent demander un accès pilote gratuit de 3 mois depuis la page{" "}
            <Link href="/prescripteurs" className="text-[#0066CC] hover:underline">
              prescripteurs
            </Link>
            . Le périmètre et le tarif définitifs seront confirmés à l&apos;ouverture.
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

      <section className="max-w-4xl mx-auto px-4 pb-16">
        <AllopointsProtectEncart />
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
