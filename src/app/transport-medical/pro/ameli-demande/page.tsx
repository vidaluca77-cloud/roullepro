import { createClient as createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, MapPin, ArrowLeft } from "lucide-react";
import AmeliDemandeForm from "@/components/sanitaire/AmeliDemandeForm";

export const dynamic = "force-dynamic";

export default async function AmeliDemandePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/transport-medical/pro/ameli-demande");
  }

  // Charger la fiche pro réclamée par cet utilisateur
  const { data: pro } = await supabase
    .from("pros_sanitaire")
    .select(
      "id, raison_sociale, nom_commercial, ville, code_postal, siret, categorie, ameli_conventionne, ameli_last_seen, ameli_source"
    )
    .eq("claimed_by", user.id)
    .eq("claim_status", "approved")
    .maybeSingle();

  if (!pro) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-blue-50/40">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Link
            href="/transport-medical/pro/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[#0066CC] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
          </Link>
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Aucune fiche réclamée
            </h1>
            <p className="text-gray-600 mb-6">
              Vous devez d'abord réclamer et faire valider une fiche professionnelle pour
              demander le badge Ameli.
            </p>
            <Link
              href="/transport-medical/pro"
              className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0055aa] text-white px-5 py-2.5 rounded-lg font-medium"
            >
              Réclamer ma fiche
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Si déjà conventionné CNAM (cnam_annuaire), pas besoin de demande
  if (pro.ameli_conventionne && pro.ameli_source === "cnam_annuaire") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Link
            href="/transport-medical/pro/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[#0066CC] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
          </Link>
          <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center">
            <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Vous êtes déjà conventionné Ameli
            </h1>
            <p className="text-gray-600">
              Votre fiche figure déjà dans l'annuaire officiel CNAM. Le badge vert est actif
              sur votre fiche publique.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Vérifier si demande pending/need_info existante
  const { data: existing } = await supabase
    .from("ameli_badge_requests")
    .select("id, status, created_at, rejection_reason")
    .eq("pro_id", pro.id)
    .in("status", ["pending", "need_info"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing && existing.status === "pending") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-blue-50/40">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Link
            href="/transport-medical/pro/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[#0066CC] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
          </Link>
          <div className="bg-white border border-blue-200 rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Demande déjà en cours
            </h1>
            <p className="text-gray-600">
              Votre demande de badge Ameli est en cours d'examen. Vous recevrez un email sous
              5 jours ouvrés.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const nomAffiche = pro.nom_commercial || pro.raison_sociale;
  const isResubmit = !!existing && existing.status === "need_info";

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/transport-medical/pro/dashboard"
          className="inline-flex items-center gap-1 text-sm text-[#0066CC] hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">Demander le badge Ameli</h1>
        </div>
        <p className="text-gray-600 mb-8">
          Faites valider votre conventionnement Ameli pour afficher le badge vert sur votre
          fiche publique.
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{nomAffiche}</div>
              <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {pro.code_postal} {pro.ville}
              </div>
              {pro.siret && (
                <div className="text-xs text-gray-500 mt-1">SIRET : {pro.siret}</div>
              )}
            </div>
          </div>
        </div>

        {isResubmit && existing.rejection_reason && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="text-xs font-semibold text-amber-900 mb-1">
              PRÉCISION DEMANDÉE PAR L'ÉQUIPE
            </div>
            <div className="text-sm text-amber-900">{existing.rejection_reason}</div>
          </div>
        )}

        <AmeliDemandeForm
          proId={pro.id}
          defaultSiret={pro.siret || ""}
          existingRequestId={existing?.id || null}
        />
      </div>
    </main>
  );
}
