import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, ArrowRight, Clock, CheckCircle2, Eye, Send, Search, XCircle } from "lucide-react";
import { LIBELLE_TYPE_TRANSPORT, type TypeTransport } from "@/lib/transport-types";
import { construireStatutSuivi, type StatutSuivi } from "@/lib/suivi-demande";
import AnnulerDemandeButton from "./AnnulerDemandeButton";

export const dynamic = "force-dynamic";

// Page privee accessible uniquement via lien magique : jamais indexee.
export const metadata: Metadata = {
  title: "Suivi de ma demande de transport | RoullePro",
  robots: { index: false, follow: false },
};

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

type DemandeRow = {
  id: string;
  statut: string | null;
  type_transport: string | null;
  lieu_depart: string | null;
  lieu_arrivee: string | null;
  date_souhaitee: string | null;
  aller_retour: boolean | null;
  pros_notifies: number | null;
  accepte_par_pro_id: string | null;
};

function libelleType(type: string | null): string {
  if (type && type in LIBELLE_TYPE_TRANSPORT) {
    return LIBELLE_TYPE_TRANSPORT[type as TypeTransport];
  }
  return "Transport";
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ICONE_STATUT: Record<StatutSuivi, typeof CheckCircle2> = {
  annulee: XCircle,
  acceptee: CheckCircle2,
  vue: Eye,
  envoyee: Send,
  en_recherche: Search,
};

const COULEUR_STATUT: Record<StatutSuivi, string> = {
  annulee: "bg-gray-100 text-gray-600 border-gray-200",
  acceptee: "bg-emerald-50 text-emerald-800 border-emerald-200",
  vue: "bg-blue-50 text-blue-800 border-blue-200",
  envoyee: "bg-blue-50 text-blue-800 border-blue-200",
  en_recherche: "bg-amber-50 text-amber-800 border-amber-200",
};

export default async function SuiviDemandePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!token) notFound();

  const admin = getAdminClient();

  // Lecture par token non devinable. Tolerant a l'absence de la colonne
  // suivi_token (migration non appliquee) : on renvoie un 404 propre.
  let demande: DemandeRow | null = null;
  try {
    const { data } = await admin
      .from("demandes_transport")
      .select(
        "id, statut, type_transport, lieu_depart, lieu_arrivee, date_souhaitee, aller_retour, pros_notifies, accepte_par_pro_id"
      )
      .eq("suivi_token", token)
      .maybeSingle();
    demande = (data as DemandeRow | null) ?? null;
  } catch {
    demande = null;
  }

  if (!demande) notFound();

  // Compteur anonyme de pros ayant consulte la demande (vue_at non null).
  // Tolerant a l'absence de la colonne vue_at.
  let nbVues = 0;
  try {
    const { count } = await admin
      .from("demandes_transport_pros")
      .select("id", { count: "exact", head: true })
      .eq("demande_id", demande.id)
      .not("vue_at", "is", null);
    nbVues = count ?? 0;
  } catch {
    nbVues = 0;
  }

  // Seule identite autorisee a l'affichage : le pro AYANT ACCEPTE.
  let accepteur: { nom: string | null; telephone: string | null } | null = null;
  if (demande.accepte_par_pro_id) {
    const { data: pro } = await admin
      .from("pros_sanitaire")
      .select("nom_commercial, raison_sociale, telephone_public")
      .eq("id", demande.accepte_par_pro_id)
      .maybeSingle();
    if (pro) {
      accepteur = {
        nom: pro.nom_commercial || pro.raison_sociale || null,
        telephone: pro.telephone_public || null,
      };
    }
  }

  const affichage = construireStatutSuivi({
    statut: demande.statut,
    prosNotifies: demande.pros_notifies,
    nbVues,
    accepteur,
  });

  const Icone = ICONE_STATUT[affichage.statut];
  const dateLabel = formatDate(demande.date_souhaitee);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#0066CC]">
            RoullePro
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Suivi de ma demande</h1>
        </div>

        {/* Statut */}
        <div className={`border rounded-2xl p-5 mb-5 ${COULEUR_STATUT[affichage.statut]}`}>
          <div className="flex items-start gap-3">
            <Icone className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-lg leading-tight">{affichage.titre}</div>
              <p className="text-sm mt-1 opacity-90">{affichage.description}</p>
            </div>
          </div>
        </div>

        {/* Coordonnees du pro accepteur (seule identite exposee) */}
        {affichage.statut === "acceptee" && affichage.accepteur?.telephone && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Votre transporteur
            </div>
            <div className="font-semibold text-gray-900">{affichage.accepteur.nom}</div>
            <a
              href={`tel:${affichage.accepteur.telephone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1 text-[#0066CC] font-semibold hover:underline mt-1"
            >
              {affichage.accepteur.telephone}
            </a>
          </div>
        )}

        {/* Rappel du trajet */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Votre demande
          </div>
          <div className="space-y-2.5">
            <div className="font-semibold text-gray-900">{libelleType(demande.type_transport)}</div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" />
              <span>
                {demande.lieu_depart || "Départ non précisé"}
                <ArrowRight className="inline w-3.5 h-3.5 mx-1 text-gray-400" />
                {demande.lieu_arrivee || "Arrivée non précisée"}
                {demande.aller_retour ? " (aller-retour)" : ""}
              </span>
            </div>
            {dateLabel && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="capitalize">{dateLabel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Annulation */}
        {affichage.peutAnnuler && (
          <div className="mb-5">
            <AnnulerDemandeButton token={token} />
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">
          Ce lien de suivi vous est personnel. Ne le partagez pas.
        </p>
      </div>
    </main>
  );
}
