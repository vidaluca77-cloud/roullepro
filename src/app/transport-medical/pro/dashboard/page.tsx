import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  MapPin,
  Eye,
  MessageCircle,
  Shield,
  Star,
  CheckCircle2,
  Lock,
  BarChart3,
  Pencil,
  Building2,
  Sparkles,
  PhoneCall,
  Clock,
} from "lucide-react";
import { type ProSanitaire } from "@/lib/sanitaire-data";
import EditFicheForm from "@/components/sanitaire/EditFicheForm";
import AmeliBadge from "@/components/sanitaire/AmeliBadge";
import AmeliStatusSection from "@/components/sanitaire/AmeliStatusSection";
import WelcomeBanner from "@/components/sanitaire/WelcomeBanner";
import PromoBanner from "@/components/sanitaire/PromoBanner";
import {
  fetchMatchedAlerts,
  getProgressByAlert,
  computeComplianceScore,
  scoreBand,
  isPaidPlan as isPaidComplPlan,
  type ComplianceProfile,
} from "@/lib/compliance";
import {
  ShieldCheck,
  ArrowRight,
  Crown,
  FileWarning,
  CalendarDays,
  Download,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProDashboard({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; upgraded?: string }>;
}) {
  const params = await searchParams;
  const showWelcome = params.welcome === "1";
  const showUpgraded = params.upgraded === "1";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/transport-medical/pro/dashboard&claimed=1");
  }

  const { data: pros } = await supabase
    .from("pros_sanitaire")
    .select("*")
    .eq("claimed_by", user.id);

  const fiches = (pros || []) as ProSanitaire[];

  if (fiches.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Aucune fiche associée</h1>
          <p className="text-gray-600 mb-6">
            Vous n&apos;avez pas encore réclamé de fiche. Commencez par trouver votre entreprise.
          </p>
          <Link
            href="/transport-medical/pro"
            className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-3 rounded-xl transition"
          >
            Trouver ma fiche
          </Link>
        </div>
      </main>
    );
  }

  const fiche = fiches[0];
  // Plan unique « Pro » (19,90 €/mois) — toute valeur autre que 'gratuit' débloque la messagerie
  const isPro =
    fiche.plan === "essential" || fiche.plan === "premium" || fiche.plan === "pro_plus";
  // Distingue un VRAI abonné payant (Stripe actif) d'un Pro en essai gratuit (auto_trial_2months ou offert)
  const isOnFreeTrial =
    isPro && !fiche.stripe_subscription_id && !!fiche.plan_offer_source;
  const trialEndsAt = fiche.plan_expires_at ? new Date(fiche.plan_expires_at) : null;
  const daysUntilTrialEnd = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // Conformité (Phase 3) : 1 profil possible par fiche.
  const ficheIds = fiches.map((f) => f.id);
  const { data: complianceRows } = await supabase
    .from("pro_compliance_profiles")
    .select("*")
    .in("pro_id", ficheIds);
  const profilesByFiche = new Map<string, ComplianceProfile>();
  for (const row of (complianceRows || []) as ComplianceProfile[]) {
    profilesByFiche.set(row.pro_id, row);
  }
  const complianceCards = await Promise.all(
    fiches.map(async (f) => {
      const profile = profilesByFiche.get(f.id) || null;
      let matchedCount = 0;
      let score: number | null = null;
      let checkedTotal = 0;
      let itemsTotal = 0;
      if (profile && isPaidComplPlan(f.plan)) {
        const matched = await fetchMatchedAlerts(supabase, profile);
        matchedCount = matched.length;
        const progress = await getProgressByAlert(supabase, f.id);
        for (const a of matched) {
          const p = progress.get(a.id);
          if (p) {
            checkedTotal += p.checked;
            itemsTotal += p.total;
          }
        }
        score = computeComplianceScore(
          profile,
          matched.map((a) => ({ id: a.id, urgency: a.urgency })),
          progress
        );
      }
      return {
        ficheId: f.id,
        ficheName:
          f.nom_commercial || f.raison_sociale || "Mon entreprise",
        categorie: f.categorie,
        isPaid: isPaidComplPlan(f.plan),
        hasProfile: !!profile,
        matchedCount,
        score,
        checkedTotal,
        itemsTotal,
      };
    })
  );

  // Stats 30 derniers jours
  const { count: messagesCount } = await supabase
    .from("sanitaire_messages")
    .select("*", { count: "exact", head: true })
    .eq("pro_id", fiche.id)
    .gte("created_at", new Date(Date.now() - 30 * 86400_000).toISOString());
  const { count: unreadCount } = await supabase
    .from("sanitaire_messages")
    .select("*", { count: "exact", head: true })
    .eq("pro_id", fiche.id)
    .eq("read_by_pro", false);
  const { count: vuesRecentes } = await supabase
    .from("sanitaire_vues")
    .select("*", { count: "exact", head: true })
    .eq("pro_id", fiche.id)
    .gte("created_at", new Date(Date.now() - 30 * 86400_000).toISOString());

  // Phone reveals (intentions d'appel) — 7j et 30j
  const since7d = new Date(Date.now() - 7 * 86400_000).toISOString();
  const since30d = new Date(Date.now() - 30 * 86400_000).toISOString();
  const { count: reveals7d } = await supabase
    .from("phone_reveals")
    .select("*", { count: "exact", head: true })
    .eq("pro_id", fiche.id)
    .gte("created_at", since7d);
  const { count: reveals30d } = await supabase
    .from("phone_reveals")
    .select("*", { count: "exact", head: true })
    .eq("pro_id", fiche.id)
    .gte("created_at", since30d);

  // Vues 7j en plus
  const { count: vues7d } = await supabase
    .from("sanitaire_vues")
    .select("*", { count: "exact", head: true })
    .eq("pro_id", fiche.id)
    .gte("created_at", since7d);

  // Demandes de rappel récentes (10 dernières)
  const { data: callbacks } = await supabase
    .from("callback_requests")
    .select("id, visitor_name, visitor_phone, visitor_message, preferred_slot, status, created_at")
    .eq("pro_id", fiche.id)
    .order("created_at", { ascending: false })
    .limit(10);
  const { count: callbacksNouveaux } = await supabase
    .from("callback_requests")
    .select("*", { count: "exact", head: true })
    .eq("pro_id", fiche.id)
    .eq("status", "nouveau");

  // Derniere demande de badge Ameli (workflow C5b) - on prend la plus recente
  // pour afficher le bon etat dans AmeliStatusSection (pending / need_info / rejected / aucune)
  const { data: dernAmeliRequest } = await supabase
    .from("ameli_badge_requests")
    .select("status, created_at, rejection_reason")
    .eq("pro_id", fiche.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {fiche.verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-white text-[#0066CC] px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Pro vérifié
                  </span>
                )}
                <AmeliBadge
                  conventionne={fiche.ameli_conventionne}
                  lastSeen={fiche.ameli_last_seen}
                  variant="md"
                  tone="dark"
                />
                {isPro ? (
                  isOnFreeTrial ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3" /> Essai Pro {daysUntilTrialEnd !== null ? `— ${daysUntilTrialEnd} j restants` : ""}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3" /> Plan Pro
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-white/10 border border-white/20 px-2 py-0.5 rounded-full">
                    Plan gratuit
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                {fiche.nom_commercial || fiche.raison_sociale}
              </h1>
              <p className="text-blue-100 text-sm">
                {fiche.code_postal} {fiche.ville}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/transport-medical/${fiche.ville_slug}/${fiche.categorie === "taxi_conventionne" ? "taxi-conventionne" : fiche.categorie}/${fiche.slug}`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-4 py-2 rounded-xl transition text-sm"
              >
                <Eye className="w-4 h-4" /> Voir ma fiche publique
              </Link>
              {(!isPro || isOnFreeTrial) && (
                <Link
                  href="/transport-medical/tarifs"
                  className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-semibold px-4 py-2 rounded-xl transition text-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" /> {isOnFreeTrial ? "Activer mon abonnement" : "Activer le plan Pro"}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        {fiche.claim_status === "en_attente_validation" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-amber-900 mb-1">
                Votre réclamation est en attente de validation
              </div>
              <p className="text-sm text-amber-800">
                Notre équipe vérifie votre justificatif (sous 24h ouvrées). Votre fiche affichera le badge{" "}
                <strong>« Pro vérifié »</strong> dès validation. En attendant, vous pouvez déjà compléter vos
                informations.
              </p>
            </div>
          </div>
        )}
        {fiche.claim_status === "rejected" && fiche.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
            <div className="font-semibold text-red-900 mb-2">Réclamation refusée</div>
            <p className="text-sm text-red-800 mb-2">Motif : {fiche.rejection_reason}</p>
            <p className="text-xs text-red-700">
              Vous pouvez soumettre une nouvelle réclamation avec un justificatif conforme.
            </p>
          </div>
        )}
        {(() => {
          // Pour les pros gratuits, les photos ne sont pas à leur portée — on ne les inclut
          // dans la jauge que si l'utilisateur est sur le plan Pro.
          const completude: {
            telephone: boolean;
            email: boolean;
            description: boolean;
            horaires: boolean;
            photos?: boolean;
          } = {
            telephone: !!fiche.telephone_public,
            email: !!fiche.email_public,
            description: !!fiche.description && fiche.description.length > 50,
            horaires:
              !!fiche.horaires && Object.keys(fiche.horaires || {}).length > 0,
          };
          if (isPro) {
            completude.photos = !!fiche.photos && fiche.photos.length > 0;
          }
          const allDone = Object.values(completude).every(Boolean);
          // Afficher si: welcome/upgraded explicite, OU profil incomplet (rappel permanent jusqu'à 100 %).
          if (!showWelcome && !showUpgraded && allDone) return null;
          return (
            <WelcomeBanner
              upgraded={showUpgraded}
              nomAffiche={fiche.nom_commercial || fiche.raison_sociale}
              completude={completude}
            />
          );
        })()}
        {/* Bandeau preuve de valeur RoullePro */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0066CC] text-white flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">
                Ce que RoullePro vous a apporté
              </div>
              <p className="text-sm text-gray-700">
                <strong>{(reveals30d ?? 0) + (callbacksNouveaux ?? 0) + (messagesCount ?? 0)}</strong>{" "}
                intentions de contact ces 30 derniers jours
                {(reveals7d ?? 0) > 0 && (
                  <> dont <strong>{reveals7d}</strong> sur les 7 derniers</>
                )}
                .
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatBox
            icon={<Eye className="w-5 h-5" />}
            label="Vues (30 j.)"
            value={vuesRecentes ?? 0}
            sub={vues7d != null ? `${vues7d} sur 7 j.` : undefined}
          />
          <StatBox
            icon={<Phone className="w-5 h-5" />}
            label="Numéro dévoilé (30 j.)"
            value={reveals30d ?? 0}
            sub={reveals7d != null ? `${reveals7d} sur 7 j.` : undefined}
          />
          <StatBox
            icon={<PhoneCall className="w-5 h-5" />}
            label="Demandes de rappel"
            value={callbacksNouveaux ?? 0}
            sub={(callbacksNouveaux ?? 0) > 0 ? "à rappeler" : "aucune en attente"}
            accent={(callbacksNouveaux ?? 0) > 0 ? "amber" : undefined}
          />
          <StatBox
            icon={<MessageCircle className="w-5 h-5" />}
            label="Messages (30 j.)"
            value={isPro ? messagesCount ?? 0 : `${messagesCount ?? 0} 🔒`}
            accent={isPro ? undefined : "amber"}
          />
        </div>

        {!isPro && (messagesCount ?? 0) > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-5 mb-8 flex items-start gap-4">
            <Lock className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="font-semibold text-emerald-900 mb-1">
                {messagesCount} {messagesCount === 1 ? "patient a tenté" : "patients ont tenté"} de vous
                contacter
              </div>
              <p className="text-sm text-emerald-900/80 mb-3">
                Activez le plan Pro à 19,90 €/mois pour lire leurs messages, leur répondre directement et
                bénéficier d&apos;une meilleure visibilité dans votre ville. Sans engagement, résiliable en un clic.
              </p>
              <Link
                href="/transport-medical/tarifs"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl transition text-sm"
              >
                Activer le plan Pro
              </Link>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#0066CC]" />
              Modifier ma fiche
            </h2>
            <EditFicheForm fiche={fiche} />
          </div>

          <aside className="space-y-4">
            {/* Statut Ameli (C5b) : badge verifie ou bouton de demande */}
            <AmeliStatusSection
              conventionne={fiche.ameli_conventionne}
              lastSeen={fiche.ameli_last_seen}
              source={(fiche as { ameli_source?: "cnam_annuaire" | "manual_verified" | null }).ameli_source ?? null}
              pendingRequest={
                dernAmeliRequest
                  ? {
                      status: dernAmeliRequest.status as "pending" | "approved" | "rejected" | "need_info" | "spam",
                      createdAt: dernAmeliRequest.created_at,
                      rejectionReason: dernAmeliRequest.rejection_reason,
                    }
                  : null
              }
              proId={fiche.id}
            />

            {/* Demandes de rappel */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#0066CC]" />
                  Demandes de rappel
                </h3>
                {(callbacksNouveaux ?? 0) > 0 && (
                  <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {callbacksNouveaux} nouvelle{(callbacksNouveaux ?? 0) > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {!callbacks || callbacks.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Aucune demande pour le moment. Les visiteurs peuvent vous demander un rappel
                  directement depuis votre fiche.
                </p>
              ) : (
                <ul className="space-y-3">
                  {callbacks.slice(0, 5).map((c) => {
                    const SLOT_LABELS: Record<string, string> = {
                      asap: "Dès que possible",
                      matin: "Matin",
                      "apres-midi": "Après-midi",
                      soir: "Soir",
                    };
                    const isNew = c.status === "nouveau";
                    return (
                      <li
                        key={c.id}
                        className={`p-3 rounded-xl border ${isNew ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-semibold text-sm text-gray-900">{c.visitor_name}</div>
                          {isNew && (
                            <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                              Nouveau
                            </span>
                          )}
                        </div>
                        <a
                          href={`tel:${c.visitor_phone.replace(/\s/g, "")}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066CC] hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {c.visitor_phone}
                        </a>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          {SLOT_LABELS[c.preferred_slot || "asap"] || c.preferred_slot}
                          {" · "}
                          {new Date(c.created_at).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        {c.visitor_message && (
                          <p className="text-xs text-gray-700 mt-2 whitespace-pre-line">
                            {c.visitor_message}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Messagerie */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Messagerie</h3>
              {isPro ? (
                <Link
                  href="/transport-medical/pro/messages"
                  className="flex items-center justify-between bg-blue-50 hover:bg-blue-100 rounded-xl p-3 transition"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {unreadCount && unreadCount > 0
                        ? `${unreadCount} non lu${unreadCount > 1 ? "s" : ""}`
                        : "Tous les messages"}
                    </div>
                    <div className="text-xs text-gray-500">Voir la boîte de réception</div>
                  </div>
                  <MessageCircle className="w-5 h-5 text-[#0066CC]" />
                </Link>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Lock className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 mb-3">
                    Messagerie incluse dans le plan Pro
                  </p>
                  <Link
                    href="/transport-medical/tarifs"
                    className="inline-block bg-[#0066CC] hover:bg-[#0052a3] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    Activer
                  </Link>
                </div>
              )}
            </div>

            {/* Plan Pro disponible */}
            {!isPro && (
              <div className="bg-white border-2 border-emerald-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900">Plan Pro</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <div className="text-2xl font-bold text-gray-900">19,90 €</div>
                  <div className="text-xs text-gray-500">/mois TTC</div>
                </div>
                <PromoBanner variant="inline" />
                <ul className="space-y-1.5 text-xs text-gray-700 mb-4">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    Messagerie patients activée
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    Meilleure visibilité dans votre ville
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    Statistiques détaillées
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    Sans engagement, résiliable en 1 clic
                  </li>
                </ul>
                <Link
                  href="/transport-medical/tarifs"
                  className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                >
                  Activer le plan Pro
                </Link>
              </div>
            )}

            {isPro && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Mon abonnement</h3>
                <div className="text-sm text-gray-600 mb-3">
                  Plan actuel : <strong className="text-gray-900">Pro — 19,90 €/mois</strong>
                </div>
                <Link
                  href="/transport-medical/tarifs"
                  className="block text-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold px-4 py-2 rounded-xl transition"
                >
                  Gérer mon abonnement
                </Link>
              </div>
            )}

            {/* Partenaire Giva — Assurance pro */}
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <h3 className="font-semibold text-gray-900">Bonus partenaire — Assurance pro Giva</h3>
              </div>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Obtenez un devis en ligne d&apos;assurance professionnelle adapté au transport sanitaire (ambulance, VSL, taxi conventionné) via notre courtier partenaire.
              </p>
              <Link
                href="/partenaires/assurance-pro"
                className="inline-flex items-center gap-1 text-sm bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl transition"
              >
                Découvrir l&apos;offre
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <p className="text-[11px] text-gray-500 mt-2">
                Lien partenaire — voir mentions légales.
              </p>
            </div>

            {/* Plan Établissements à venir */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-[#0066CC]" />
                <h3 className="font-semibold text-gray-900">Plan Établissements</h3>
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-[#0066CC] px-2 py-0.5 rounded-full">
                  À venir
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <div className="text-xl font-bold text-gray-900">~49 €</div>
                <div className="text-xs text-gray-500">/mois TTC</div>
              </div>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                Pour recevoir les demandes de transport des EHPAD, cabinets médicaux et hôpitaux partenaires.
                Multi-utilisateurs flotte, support dédié.
              </p>
              <div className="text-xs text-gray-500 italic">
                Lancement prévu en 2026. Aucune action requise pour le moment.
              </div>
            </div>
          </aside>
        </div>

        {/* Conformité réglementaire — Phase 3 */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-bold text-gray-900">Conformité réglementaire</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Configurez un profil par fiche pour recevoir uniquement les alertes qui concernent votre activité.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceCards.map((c) => (
              <div
                key={c.ficheId}
                className="bg-white border border-gray-200 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{c.ficheName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">
                      {c.categorie?.replace("_", " ")}
                    </p>
                  </div>
                  {!c.isPaid && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wide">
                      <Crown className="w-3 h-3" />
                      Pro
                    </span>
                  )}
                </div>

                {!c.isPaid ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Réservé aux abonnés Pro. Recevez uniquement les alertes réglementaires qui concernent vraiment votre entreprise.
                    </p>
                    <Link
                      href="/transport-medical/tarifs"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition"
                    >
                      Découvrir Pro à 19,90 €/mois
                    </Link>
                  </div>
                ) : c.hasProfile ? (
                  <div>
                    {c.score !== null && (() => {
                      const band = scoreBand(c.score);
                      return (
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`inline-flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 ${band.bg} ${band.fg} ${band.border}`}
                          >
                            <span className="text-2xl font-bold leading-none">{c.score}</span>
                            <span className="text-[10px] font-semibold uppercase tracking-wide mt-0.5">/100</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${band.fg}`}>
                              {band.label}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              <strong>{c.matchedCount}</strong>{" "}
                              {c.matchedCount > 1 ? "alertes pertinentes" : "alerte pertinente"}
                            </p>
                            {c.itemsTotal > 0 && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {c.checkedTotal} / {c.itemsTotal} items cochés
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/transport-medical/pro/dashboard/conformite/${c.ficheId}/alertes`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-lg transition"
                      >
                        Voir mes alertes
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/transport-medical/pro/dashboard/conformite/${c.ficheId}/calendrier`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-lg transition"
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        Calendrier
                      </Link>
                      <Link
                        href={`/transport-medical/pro/dashboard/conformite/${c.ficheId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-lg transition"
                      >
                        Profil
                      </Link>
                      <a
                        href={`/api/conformite/${c.ficheId}/export`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-lg transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Renseignez votre profil pour recevoir des alertes ciblées par métier, activité et région.
                    </p>
                    <Link
                      href={`/transport-medical/pro/dashboard/conformite/${c.ficheId}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition"
                    >
                      Renseigner mon profil
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatBox({
  icon,
  label,
  value,
  accent,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent?: "amber";
  sub?: string;
}) {
  return (
    <div
      className={`bg-white border rounded-2xl p-4 ${accent === "amber" ? "border-amber-200" : "border-gray-200"}`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${accent === "amber" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-[#0066CC]"}`}
      >
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}
