"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, Car, Cross, Stethoscope } from "lucide-react";
import {
  TYPES_TRANSPORT_DISPONIBLES,
  LIBELLE_TYPE_TRANSPORT,
  type TypeTransport,
  type SourcePage,
} from "@/lib/transport-types";

type Mobilite = "autonome" | "aide_marche" | "fauteuil" | "brancard";

const LABEL_MOBILITE: Record<Mobilite, string> = {
  autonome: "Autonome",
  aide_marche: "Aide à la marche",
  fauteuil: "Fauteuil roulant",
  brancard: "Allongé / brancard",
};

const ICONES: Record<TypeTransport, typeof Car> = {
  taxi: Car,
  vsl: Stethoscope,
  ambulance: Cross,
};

export type DemandeTransportFormProps = {
  sourcePage: SourcePage;
  etablissementId?: string | null;
  proIdCible?: string | null;
  departementCible?: string | null;
  villeCible?: string | null;
  typeParDefaut?: TypeTransport;
  titre?: string;
  compact?: boolean;
};

export default function DemandeTransportForm({
  sourcePage,
  etablissementId = null,
  proIdCible = null,
  departementCible = null,
  villeCible = null,
  typeParDefaut = "taxi",
  titre,
  compact = false,
}: DemandeTransportFormProps) {
  const [type, setType] = useState<TypeTransport>(typeParDefaut);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [dateSouhaitee, setDateSouhaitee] = useState("");
  const [lieuDepart, setLieuDepart] = useState("");
  const [lieuArrivee, setLieuArrivee] = useState("");
  const [allerRetour, setAllerRetour] = useState(false);
  const [mobilite, setMobilite] = useState<Mobilite>("autonome");
  const [precisions, setPrecisions] = useState("");

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [nbPros, setNbPros] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nom.trim() || !telephone.trim()) {
      setError("Merci d'indiquer votre nom et votre téléphone.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/demande-transport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type_transport: type,
          nom: nom.trim(),
          telephone: telephone.trim(),
          email: email.trim() || null,
          date_souhaitee: dateSouhaitee || null,
          lieu_depart: lieuDepart.trim() || null,
          lieu_arrivee: lieuArrivee.trim() || null,
          aller_retour: allerRetour,
          mobilite,
          precisions: precisions.trim() || null,
          source_page: sourcePage,
          etablissement_id: etablissementId,
          pro_id_cible: proIdCible,
          departement_cible: departementCible,
          ville_cible: villeCible,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi");
      setNbPros(data.pros_notifies ?? 0);
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
        <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2" />
        <div className="font-semibold text-gray-900 mb-1">Demande envoyée</div>
        <p className="text-sm text-gray-600">
          {nbPros > 0
            ? `${nbPros} professionnel${nbPros > 1 ? "s" : ""} proche${nbPros > 1 ? "s" : ""} de vous ${nbPros > 1 ? "ont" : "a"} été notifié${nbPros > 1 ? "s" : ""}. Ils vous rappelleront directement.`
            : "Nous recherchons un professionnel disponible dans votre secteur et reviendrons vers vous rapidement."}
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#0066CC] focus:ring-2 focus:ring-blue-100 outline-none transition";
  const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {titre && <h3 className="text-lg font-bold text-gray-900">{titre}</h3>}

      {/* Sélecteur de type : 3 boutons taxi / VSL / ambulance */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Type de transport
        </div>
        <div className="grid grid-cols-3 gap-2">
          {TYPES_TRANSPORT_DISPONIBLES.map((t) => {
            const Icone = ICONES[t];
            const actif = type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={actif}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 border rounded-xl transition text-sm ${
                  actif
                    ? "border-[#0066CC] bg-blue-50 text-[#0066CC] font-semibold"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icone className="w-5 h-5" />
                {LIBELLE_TYPE_TRANSPORT[t]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Coordonnées */}
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Votre nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          minLength={2}
          className={inputCls}
        />
        <input
          type="tel"
          placeholder="Votre téléphone"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          required
          className={inputCls}
        />
      </div>
      <input
        type="email"
        placeholder="Votre email (facultatif, pour recevoir une confirmation)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputCls}
      />

      {!compact && (
        <>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Date souhaitée (facultatif)</label>
              <input
                type="datetime-local"
                value={dateSouhaitee}
                onChange={(e) => setDateSouhaitee(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allerRetour}
                  onChange={(e) => setAllerRetour(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0066CC] focus:ring-[#0066CC]"
                />
                Aller-retour
              </label>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Lieu de départ (facultatif)</label>
              <input
                type="text"
                placeholder="Ex : Domicile, ville"
                value={lieuDepart}
                onChange={(e) => setLieuDepart(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Lieu d&apos;arrivée (facultatif)</label>
              <input
                type="text"
                placeholder="Ex : Hôpital, centre de soins"
                value={lieuArrivee}
                onChange={(e) => setLieuArrivee(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Mobilité du bénéficiaire</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(LABEL_MOBILITE) as Mobilite[]).map((m) => (
                <label
                  key={m}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2 border rounded-xl cursor-pointer transition text-xs text-center ${
                    mobilite === m
                      ? "border-[#0066CC] bg-blue-50 text-[#0066CC] font-medium"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="mobilite"
                    value={m}
                    checked={mobilite === m}
                    onChange={() => setMobilite(m)}
                    className="sr-only"
                  />
                  {LABEL_MOBILITE[m]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Précisions (facultatif)</label>
            <textarea
              placeholder="Toute information utile pour le professionnel (sans données médicales sensibles)"
              value={precisions}
              onChange={(e) => setPrecisions(e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
        </>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-xl transition"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Trouver un transport
      </button>
      <p className="text-[11px] text-gray-500 text-center">
        Ne mentionnez pas de motif médical ou diagnostic. RoullePro ne stocke aucune donnée de santé.
        Vos coordonnées ne sont transmises qu&apos;aux transporteurs proches de vous.
      </p>
    </form>
  );
}
