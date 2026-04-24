import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, CheckCircle2, XCircle, Clock, ArrowLeft } from "lucide-react";
import ReclamationRow from "@/components/sanitaire/admin/ReclamationRow";

export const dynamic = "force-dynamic";

type ReclamationItem = {
  id: string;
  raison_sociale: string;
  nom_commercial: string | null;
  ville: string;
  ville_slug: string;
  categorie: string;
  slug: string;
  siret: string;
  claimed_at: string | null;
  claim_status: string | null;
  justificatif_url: string | null;
  email_public: string | null;
  rejection_reason: string | null;
  validated_at: string | null;
  claimer_email: string | null;
  source: string | null;
};

async function fetchReclamations(filter: "pending" | "approved" | "rejected"): Promise<ReclamationItem[]> {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const status = filter === "pending" ? "en_attente_validation" : filter;
  const { data } = await supabase
    .from("pros_sanitaire")
    .select(
      "id, raison_sociale, nom_commercial, ville, ville_slug, categorie, slug, siret, claimed_at, claim_status, justificatif_url, email_public, rejection_reason, validated_at, claimed_by, source"
    )
    .eq("claim_status", status)
    .order("claimed_at", { ascending: filter === "pending" });

  const items = (data || []) as (ReclamationItem & { claimed_by: string | null })[];

  // Enrichit avec l'email du claimer
  const claimerIds = items.map((i) => i.claimed_by).filter(Boolean) as string[];
  const profilesMap = new Map<string, string>();
  if (claimerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", claimerIds);
    (profiles || []).forEach((p: { id: string; email: string | null }) => {
      if (p.email) profilesMap.set(p.id, p.email);
    });
  }

  return items.map((i) => ({
    ...i,
    claimer_email: i.claimed_by ? profilesMap.get(i.claimed_by) || null : null,
  }));
}

export default async function AdminReclamationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = (params.tab === "approved" || params.tab === "rejected" ? params.tab : "pending") as
    | "pending"
    | "approved"
    | "rejected";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin/sanitaire/reclamations");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white border border-gray-200 rounded-2xl p-8">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-4">Cette page est réservée aux administrateurs.</p>
          <Link href="/" className="text-[#0066CC] hover:underline text-sm">Retour à l&apos;accueil</Link>
        </div>
      </main>
    );
  }

  const reclamations = await fetchReclamations(tab);
  const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
    fetchReclamations("pending").then((r) => r.length),
    fetchReclamations("approved").then((r) => r.length),
    fetchReclamations("rejected").then((r) => r.length),
  ]);

  const tabs = [
    { key: "pending", label: "En attente", count: pendingCount, icon: <Clock className="w-4 h-4" />, color: "amber" },
    { key: "approved", label: "Approuvées", count: approvedCount, icon: <CheckCircle2 className="w-4 h-4" />, color: "green" },
    { key: "rejected", label: "Refusées", count: rejectedCount, icon: <XCircle className="w-4 h-4" />, color: "red" },
  ] as const;

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/admin/garages" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Admin
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#0066CC]" />
            Réclamations de fiches transport sanitaire
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Vérifiez le justificatif, approuvez ou refusez chaque réclamation. Un email est envoyé automatiquement au pro après validation.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map((t) => {
            const active = t.key === tab;
            return (
              <Link
                key={t.key}
                href={`/admin/sanitaire/reclamations?tab=${t.key}`}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-medium transition ${
                  active ? "border-[#0066CC] text-[#0066CC]" : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.icon}
                {t.label}
                <span
                  className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                    t.color === "amber"
                      ? "bg-amber-100 text-amber-800"
                      : t.color === "green"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {t.count}
                </span>
              </Link>
            );
          })}
        </div>

        {reclamations.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="text-gray-400 mb-2">
              {tab === "pending" ? (
                <Clock className="w-10 h-10 mx-auto" />
              ) : tab === "approved" ? (
                <CheckCircle2 className="w-10 h-10 mx-auto" />
              ) : (
                <XCircle className="w-10 h-10 mx-auto" />
              )}
            </div>
            <p className="text-gray-600">
              {tab === "pending"
                ? "Aucune réclamation en attente. Tout est à jour."
                : tab === "approved"
                ? "Aucune réclamation approuvée pour l'instant."
                : "Aucune réclamation refusée."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reclamations.map((r) => (
              <ReclamationRow key={r.id} item={r} mode={tab} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
