"use client";

/**
 * Module admin — detail d'une demande de transport.
 * Charge GET /api/admin/demandes-transport/[id] (demande + timeline pros) et
 * expose les actions admin : relancer les pros, annuler (motif obligatoire),
 * notes admin en autosave (debounce 1s).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  XCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { LIBELLE_TYPE_TRANSPORT, type TypeTransport } from "@/lib/transport-types";

type Demande = {
  id: string;
  created_at: string;
  type_transport: TypeTransport;
  nom: string | null;
  telephone: string | null;
  email: string | null;
  date_souhaitee: string | null;
  lieu_depart: string | null;
  lieu_arrivee: string | null;
  aller_retour: boolean | null;
  mobilite: string | null;
  precisions: string | null;
  taux_prise_en_charge: string | null;
  taux_prise_en_charge_autre: string | null;
  bon_transport_medical: boolean | null;
  departement_cible: string | null;
  ville_cible: string | null;
  source_form: string | null;
  source_page: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  statut: string;
  annulee_at: string | null;
  annulee_motif: string | null;
  admin_notes: string | null;
  accepte_par_pro_id: string | null;
  acceptee_at: string | null;
  total_pros_notifies: number;
};

type ProRow = {
  id: string;
  pro_id: string;
  statut: string;
  proposee_at: string | null;
  vue_at: string | null;
  acceptee_at: string | null;
  declinee_at: string | null;
  email_status: string | null;
  email_sent_at: string | null;
  email_resend_id: string | null;
  pros_sanitaire: {
    raison_sociale: string | null;
    nom_commercial: string | null;
    telephone_public: string | null;
    email_public: string | null;
    ville: string | null;
    plan: string | null;
    claimed: boolean | null;
  } | null;
};

function fmt(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function tauxLibelle(d: Demande): string {
  if (!d.taux_prise_en_charge) return "—";
  if (d.taux_prise_en_charge === "autre") return `${d.taux_prise_en_charge_autre || "?"} %`;
  return `${d.taux_prise_en_charge} %`;
}

function proStatutBadge(statut: string): string {
  switch (statut) {
    case "acceptee":
      return "bg-green-100 text-green-800";
    case "declinee":
      return "bg-red-100 text-red-800";
    case "autre_acceptee":
      return "bg-blue-100 text-blue-800";
    case "expiree":
      return "bg-gray-800 text-white";
    case "terminee":
      return "bg-emerald-100 text-emerald-900";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function planBadge(plan: string | null): string {
  switch (plan) {
    case "premium":
      return "bg-amber-100 text-amber-800";
    case "essential":
      return "bg-blue-100 text-blue-800";
    case "essai":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

const SECTION = "bg-white border border-gray-200 rounded-2xl p-5";
const TITLE = "text-sm font-bold text-gray-900 uppercase tracking-wide mb-3";

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 mt-0.5">{children}</dd>
    </div>
  );
}

export default function DemandeDetailClient({ id }: { id: string }) {
  const [demande, setDemande] = useState<Demande | null>(null);
  const [pros, setPros] = useState<ProRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState<"idle" | "saving" | "saved">("idle");

  const [relancing, setRelancing] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [showAnnuler, setShowAnnuler] = useState(false);
  const [motif, setMotif] = useState("");
  const [annulant, setAnnulant] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/demandes-transport/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur de chargement");
        return;
      }
      setDemande(data.demande);
      setPros(data.pros || []);
      setNotes(data.demande?.admin_notes || "");
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Autosave admin_notes (debounce 1s), uniquement apres edition manuelle.
  const notesDirty = useRef(false);
  useEffect(() => {
    if (!notesDirty.current) return;
    setNotesSaved("saving");
    const t = setTimeout(async () => {
      try {
        await fetch(`/api/admin/demandes-transport/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ admin_notes: notes }),
        });
        setNotesSaved("saved");
      } catch {
        setNotesSaved("idle");
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [notes, id]);

  const relancer = async () => {
    setRelancing(true);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/admin/demandes-transport/${id}/relancer`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setActionMsg(data.error || "Échec de la relance");
      } else {
        setActionMsg(`Relance envoyée à ${data.relances} pro(s).`);
        await reload();
      }
    } catch {
      setActionMsg("Erreur réseau");
    } finally {
      setRelancing(false);
    }
  };

  const annuler = async () => {
    if (!motif.trim()) return;
    setAnnulant(true);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/admin/demandes-transport/${id}/annuler`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motif: motif.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMsg(data.error || "Échec de l'annulation");
      } else {
        setShowAnnuler(false);
        setMotif("");
        await reload();
      }
    } catch {
      setActionMsg("Erreur réseau");
    } finally {
      setAnnulant(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Chargement…
      </div>
    );
  }

  if (error || !demande) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
        {error || "Demande introuvable"}
      </div>
    );
  }

  const d = demande;
  const mapsUrl =
    d.lieu_arrivee || d.ville_cible
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          d.lieu_arrivee || `${d.ville_cible || ""} ${d.departement_cible || ""}`
        )}`
      : null;
  const dejaAcceptee = !!d.accepte_par_pro_id;

  return (
    <div className="space-y-6">
      {actionMsg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg p-3">
          {actionMsg}
        </div>
      )}

      {d.statut === "annulee" && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg p-3 flex items-start gap-2">
          <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Demande annulée le {fmt(d.annulee_at)}
            {d.annulee_motif ? ` — motif : ${d.annulee_motif}` : ""}
          </span>
        </div>
      )}

      {/* A. Coordonnées client */}
      <section className={SECTION}>
        <h2 className={TITLE}>Coordonnées client</h2>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Info label="Nom">{d.nom || "—"}</Info>
          <Info label="Téléphone">
            {d.telephone ? (
              <a href={`tel:${d.telephone}`} className="text-[#0066CC] hover:underline inline-flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {d.telephone}
              </a>
            ) : (
              "—"
            )}
          </Info>
          <Info label="Email">
            {d.email ? (
              <a href={`mailto:${d.email}`} className="text-[#0066CC] hover:underline inline-flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {d.email}
              </a>
            ) : (
              "—"
            )}
          </Info>
          <Info label="Type">{LIBELLE_TYPE_TRANSPORT[d.type_transport] || d.type_transport}</Info>
          <Info label="Date souhaitée">{fmt(d.date_souhaitee)}</Info>
          <Info label="Taux PEC">{tauxLibelle(d)}</Info>
          <Info label="Bon de transport">{d.bon_transport_medical ? "Oui" : "Non"}</Info>
          <Info label="Aller-retour">{d.aller_retour ? "Oui" : "Non"}</Info>
          <Info label="Mobilité / PMR">{d.mobilite || "—"}</Info>
        </dl>
        {d.precisions && (
          <div className="mt-4">
            <dt className="text-xs text-gray-500">Précisions</dt>
            <dd className="text-sm text-gray-900 mt-0.5 whitespace-pre-wrap">{d.precisions}</dd>
          </div>
        )}
      </section>

      {/* B + C. Trajet et localisation */}
      <section className={SECTION}>
        <h2 className={TITLE}>Trajet et localisation</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Info label="Lieu de départ">{d.lieu_depart || "—"}</Info>
          <Info label="Lieu d'arrivée">{d.lieu_arrivee || "—"}</Info>
          <Info label="Département cible">{d.departement_cible || "—"}</Info>
          <Info label="Ville cible">{d.ville_cible || "—"}</Info>
        </dl>
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#0066CC] hover:underline"
          >
            <MapPin className="w-4 h-4" />
            Ouvrir dans Google Maps
          </a>
        )}
      </section>

      {/* D. Timeline pros */}
      <section className={SECTION}>
        <h2 className={TITLE}>Pros notifiés ({pros.length})</h2>
        {pros.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun pro notifié pour cette demande.</p>
        ) : (
          <div className="space-y-3">
            {pros.map((p) => {
              const ps = p.pros_sanitaire;
              return (
                <div key={p.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="font-medium text-gray-900">
                      {ps?.nom_commercial || ps?.raison_sociale || "Pro inconnu"}
                      {ps?.ville ? <span className="text-gray-500 font-normal"> — {ps.ville}</span> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      {ps?.plan && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${planBadge(ps.plan)}`}>
                          {ps.plan}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${proStatutBadge(p.statut)}`}>
                        {p.statut}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {ps?.telephone_public && (
                      <a href={`tel:${ps.telephone_public}`} className="text-[#0066CC] hover:underline">
                        {ps.telephone_public}
                      </a>
                    )}
                    {ps?.email_public && (
                      <a href={`mailto:${ps.email_public}`} className="text-[#0066CC] hover:underline">
                        {ps.email_public}
                      </a>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500 mt-2">
                    <span>Proposée : {fmt(p.proposee_at)}</span>
                    <span>Vue : {fmt(p.vue_at)}</span>
                    <span>Acceptée : {fmt(p.acceptee_at)}</span>
                    <span>Déclinée : {fmt(p.declinee_at)}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Email : {p.email_status || "—"}
                    {p.email_sent_at ? ` (${fmt(p.email_sent_at)})` : ""}
                    {p.email_resend_id ? ` · ${p.email_resend_id}` : ""}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* E. Actions admin */}
      <section className={SECTION}>
        <h2 className={TITLE}>Actions admin</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            type="button"
            onClick={relancer}
            disabled={relancing || dejaAcceptee || d.statut === "annulee"}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg text-sm font-medium hover:bg-[#0055AA] disabled:opacity-50"
          >
            {relancing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Relancer les pros en attente
          </button>
          <button
            type="button"
            onClick={() => setShowAnnuler(true)}
            disabled={d.statut === "annulee"}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Annuler la demande
          </button>
        </div>
        {dejaAcceptee && (
          <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            Demande déjà acceptée — relance désactivée.
          </p>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-2">
            Notes admin
            {notesSaved === "saving" && <span className="text-gray-400 normal-case font-normal">enregistrement…</span>}
            {notesSaved === "saved" && (
              <span className="text-green-600 normal-case font-normal inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> enregistré
              </span>
            )}
          </label>
          <textarea
            value={notes}
            onChange={(e) => {
              notesDirty.current = true;
              setNotes(e.target.value);
            }}
            rows={4}
            placeholder="Notes internes (visibles uniquement par les admins)…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30"
          />
        </div>
      </section>

      {/* F. Métadonnées techniques */}
      <section className={SECTION}>
        <h2 className={TITLE}>Métadonnées techniques</h2>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Info label="ID">
            <span className="font-mono text-xs break-all">{d.id}</span>
          </Info>
          <Info label="Créée le">{fmt(d.created_at)}</Info>
          <Info label="Acceptée le">{fmt(d.acceptee_at)}</Info>
          <Info label="Pros notifiés (total)">{d.total_pros_notifies ?? 0}</Info>
          <Info label="Source form">{d.source_form || "—"}</Info>
          <Info label="Source page">{d.source_page || "—"}</Info>
          <Info label="IP (hash)">
            <span className="font-mono text-xs">{d.ip_hash || "—"}</span>
          </Info>
          <Info label="User agent">
            <span className="text-xs break-all">{d.user_agent || "—"}</span>
          </Info>
        </dl>
      </section>

      {/* Modale annulation */}
      {showAnnuler && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Annuler la demande
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Cette action passe la demande en « annulée » et expire les propositions encore en attente. Un motif est obligatoire.
            </p>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={3}
              placeholder="Motif de l'annulation…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAnnuler(false);
                  setMotif("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={annuler}
                disabled={annulant || !motif.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {annulant ? <Clock className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Confirmer l'annulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
