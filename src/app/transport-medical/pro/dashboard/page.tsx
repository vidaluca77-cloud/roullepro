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
} from "lucide-react";
import { planDisplay, type ProSanitaire } from "@/lib/sanitaire-data";
import EditFicheForm from "@/components/sanitaire/EditFicheForm";

export const dynamic = "force-dynamic";

export default async function ProDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/signin?next=/transport-medical/pro/dashboard");
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
          <p className="text-gray-600 mb-6">Vous n'avez pas encore réclamé de fiche. Commencez par trouver votre entreprise.</p>
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
  const plan = planDisplay(fiche.plan);
  const isPremium = fiche.plan === "premium" || fiche.plan === "pro_plus";

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
                {isPremium && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3" /> {plan.label}
                  </span>
                )}
                {!isPremium && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-white/10 border border-white/20 px-2 py-0.5 rounded-full">
                    Plan gratuit
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">{fiche.nom_commercial || fiche.raison_sociale}</h1>
              <p className="text-blue-100 text-sm">{fiche.code_postal} {fiche.ville}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/transport-medical/${fiche.ville_slug}/${fiche.categorie === "taxi_conventionne" ? "taxi-conventionne" : fiche.categorie}/${fiche.slug}`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-4 py-2 rounded-xl transition text-sm"
              >
                <Eye className="w-4 h-4" /> Voir ma fiche publique
              </Link>
              {!isPremium && (
                <Link
                  href="/transport-medical/tarifs"
                  className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-semibold px-4 py-2 rounded-xl transition text-sm"
                >
                  Passer Premium
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatBox icon={<Eye className="w-5 h-5" />} label="Vues (30 j.)" value={vuesRecentes ?? 0} />
          <StatBox icon={<Phone className="w-5 h-5" />} label="Appels cliqués" value={fiche.appels_cliques} />
          <StatBox
            icon={<MessageCircle className="w-5 h-5" />}
            label="Messages (30 j.)"
            value={isPremium ? messagesCount ?? 0 : `${messagesCount ?? 0} 🔒`}
            accent={isPremium ? undefined : "amber"}
          />
          <StatBox
            icon={<BarChart3 className="w-5 h-5" />}
            label="Vues totales"
            value={fiche.vues_totales}
          />
        </div>

        {!isPremium && (messagesCount ?? 0) > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-5 mb-8 flex items-start gap-4">
            <Lock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="font-semibold text-amber-900 mb-1">
                {messagesCount} {messagesCount === 1 ? "patient a tenté" : "patients ont tenté"} de vous contacter
              </div>
              <p className="text-sm text-amber-800 mb-3">
                Passez en Premium pour lire leurs messages et leur répondre directement. 39 €/mois, sans engagement.
              </p>
              <Link
                href="/transport-medical/tarifs"
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-xl transition text-sm"
              >
                Débloquer les messages
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
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Messagerie</h3>
              {isPremium ? (
                <Link
                  href="/transport-medical/pro/messages"
                  className="flex items-center justify-between bg-blue-50 hover:bg-blue-100 rounded-xl p-3 transition"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {unreadCount && unreadCount > 0 ? `${unreadCount} non lu${unreadCount > 1 ? "s" : ""}` : "Tous les messages"}
                    </div>
                    <div className="text-xs text-gray-500">Voir la boîte de réception</div>
                  </div>
                  <MessageCircle className="w-5 h-5 text-[#0066CC]" />
                </Link>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Lock className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 mb-3">Messagerie réservée au plan Premium</p>
                  <Link
                    href="/transport-medical/tarifs"
                    className="inline-block bg-[#0066CC] hover:bg-[#0052a3] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    Débloquer
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Abonnement</h3>
              <div className="text-sm text-gray-600 mb-3">Plan actuel : <strong className="text-gray-900">{plan.label}</strong></div>
              <Link
                href="/transport-medical/tarifs"
                className="block text-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold px-4 py-2 rounded-xl transition"
              >
                {isPremium ? "Gérer mon abonnement" : "Voir les plans"}
              </Link>
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
    <div className={`bg-white border rounded-2xl p-4 ${accent === "amber" ? "border-amber-200" : "border-gray-200"}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${accent === "amber" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-[#0066CC]"}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
