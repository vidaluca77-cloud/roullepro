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
} from "lucide-react";
import { type ProSanitaire } from "@/lib/sanitaire-data";
import EditFicheForm from "@/components/sanitaire/EditFicheForm";
import WelcomeBanner from "@/components/sanitaire/WelcomeBanner";

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
                {isPro ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3" /> Plan Pro
                  </span>
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
              {!isPro && (
                <Link
                  href="/transport-medical/tarifs"
                  className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-semibold px-4 py-2 rounded-xl transition text-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Activer le plan Pro
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
        {(showWelcome || showUpgraded) && (
          <WelcomeBanner
            upgraded={showUpgraded}
            nomAffiche={fiche.nom_commercial || fiche.raison_sociale}
            completude={{
              telephone: !!fiche.telephone_public,
              email: !!fiche.email_public,
              description: !!fiche.description && fiche.description.length > 50,
              horaires: !!fiche.horaires && Object.keys(fiche.horaires || {}).length > 0,
              photos: !!fiche.photos && fiche.photos.length > 0,
            }}
          />
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatBox icon={<Eye className="w-5 h-5" />} label="Vues (30 j.)" value={vuesRecentes ?? 0} />
          <StatBox icon={<Phone className="w-5 h-5" />} label="Appels cliqués" value={fiche.appels_cliques} />
          <StatBox
            icon={<MessageCircle className="w-5 h-5" />}
            label="Messages (30 j.)"
            value={isPro ? messagesCount ?? 0 : `${messagesCount ?? 0} 🔒`}
            accent={isPro ? undefined : "amber"}
          />
          <StatBox
            icon={<BarChart3 className="w-5 h-5" />}
            label="Vues totales"
            value={fiche.vues_totales}
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
                  <div className="text-xs text-gray-500">/mois HT</div>
                </div>
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
                <div className="text-xs text-gray-500">/mois HT</div>
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
      </section>
    </main>
  );
}

function StatBox({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent?: "amber";
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
    </div>
  );
}
