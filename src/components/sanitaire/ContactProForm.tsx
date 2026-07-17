"use client";

import { useState, useRef } from "react";
import { Send, Loader2, CheckCircle2, Calendar, MapPin, Stethoscope, Accessibility } from "lucide-react";
import {
  usePlacesAutocomplete,
  type PlaceSelection,
} from "@/lib/use-places-autocomplete";
import DateHeureCourse, { toISODateSouhaitee } from "@/components/forms/DateHeureCourse";
import {
  CATEGORIE_TO_TYPE_TRANSPORT,
  type CategoriePro,
  type TypeTransport,
} from "@/lib/transport-types";

// Choix affiche a l'utilisateur : "indifferent" laisse le pro (categorie de la
// fiche) determiner le type reel envoye a l'API.
type ChoixTransport = "indifferent" | "ambulance" | "vsl" | "taxi_conventionne";
type Mobilite = "autonome" | "aide_marche" | "fauteuil" | "brancard";

const LABEL_TRANSPORT: Record<ChoixTransport, string> = {
  indifferent: "Indifférent / à conseiller",
  ambulance: "Ambulance (allongé)",
  vsl: "VSL (assis, médicalisé)",
  taxi_conventionne: "Taxi conventionné CPAM",
};
const LABEL_MOBILITE: Record<Mobilite, string> = {
  autonome: "Autonome",
  aide_marche: "Aide à la marche",
  fauteuil: "Fauteuil roulant",
  brancard: "Allongé / brancard",
};

/**
 * Resout le type de transport (taxi/vsl/ambulance) attendu par l'API a partir
 * du choix utilisateur et, pour "indifferent", de la categorie de la fiche pro.
 */
function resoudreType(choix: ChoixTransport, proCategorie?: string | null): TypeTransport {
  if (choix === "taxi_conventionne") return "taxi";
  if (choix === "vsl") return "vsl";
  if (choix === "ambulance") return "ambulance";
  return CATEGORIE_TO_TYPE_TRANSPORT[(proCategorie as CategoriePro) ?? "taxi_conventionne"] || "taxi";
}

export default function ContactProForm({
  proId,
  proNom,
  proCategorie,
}: {
  proId: string;
  proNom: string;
  proCategorie?: string | null;
}) {
  // Identité
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Transport (champs structurés)
  const [dateSouhaitee, setDateSouhaitee] = useState("");
  const [lieuDepart, setLieuDepart] = useState("");
  const [lieuArrivee, setLieuArrivee] = useState("");
  const [choixTransport, setChoixTransport] = useState<ChoixTransport>("indifferent");
  const [allerRetour, setAllerRetour] = useState(false);
  const [mobilite, setMobilite] = useState<Mobilite>("autonome");
  const [precisions, setPrecisions] = useState("");

  // Places (Google Autocomplete) — coordonnees + departement + ville des 2 bouts.
  const [departPlace, setDepartPlace] = useState<PlaceSelection | null>(null);
  const [arriveePlace, setArriveePlace] = useState<PlaceSelection | null>(null);

  // État
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [nbPros, setNbPros] = useState(0);
  const [doublon, setDoublon] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lieuDepartRef = useRef<HTMLInputElement>(null);
  const lieuArriveeRef = useRef<HTMLInputElement>(null);

  usePlacesAutocomplete([
    {
      ref: lieuDepartRef,
      onSelect: (p) => {
        setLieuDepart(p.formattedAddress);
        setDepartPlace(p);
      },
    },
    {
      ref: lieuArriveeRef,
      onSelect: (p) => {
        setLieuArrivee(p.formattedAddress);
        setArriveePlace(p);
      },
    },
  ]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("Merci d'indiquer votre nom et votre email.");
      return;
    }
    if (!dateSouhaitee) {
      setError("Merci d'indiquer la date et l'heure souhaitées du transport.");
      return;
    }
    if (!lieuDepart.trim() || !lieuArrivee.trim()) {
      setError("Merci de renseigner le lieu de départ et le lieu d'arrivée.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/demande-transport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type_transport: resoudreType(choixTransport, proCategorie),
          nom: name.trim(),
          telephone: phone.trim(),
          email: email.trim() || null,
          date_souhaitee: toISODateSouhaitee(dateSouhaitee),
          lieu_depart: lieuDepart.trim(),
          lieu_arrivee: lieuArrivee.trim(),
          lieu_depart_lat: departPlace?.lat ?? null,
          lieu_depart_lng: departPlace?.lng ?? null,
          lieu_arrivee_lat: arriveePlace?.lat ?? null,
          lieu_arrivee_lng: arriveePlace?.lng ?? null,
          ville_depart: departPlace?.ville ?? null,
          ville_arrivee: arriveePlace?.ville ?? null,
          departement_depart: departPlace?.departement ?? null,
          departement_arrivee: arriveePlace?.departement ?? null,
          aller_retour: allerRetour,
          mobilite,
          precisions: precisions.trim() || null,
          source_page: "fiche-pro",
          source_form: "fiche_pro",
          pro_id_cible: proId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi");
      setNbPros(data.pros_notifies ?? 0);
      setDoublon(data.doublon === true);
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
        <div className="font-semibold text-gray-900 mb-1">
          {doublon ? "Votre demande est déjà en cours" : "Demande envoyée"}
        </div>
        <p className="text-sm text-gray-600">
          {doublon
            ? `${nbPros > 0 ? `${nbPros} professionnel${nbPros > 1 ? "s" : ""} ${nbPros > 1 ? "ont" : "a"} été prévenu${nbPros > 1 ? "s" : ""}` : "Les professionnels de votre secteur ont été prévenus"}. Inutile de la redéposer, une réponse vous parviendra rapidement.`
            : nbPros > 0
              ? `${proNom} et ${nbPros} professionnel${nbPros > 1 ? "s" : ""} de votre secteur ${nbPros > 1 ? "ont" : "a"} été notifié${nbPros > 1 ? "s" : ""}. Une réponse vous parviendra par email ou téléphone.`
              : `${proNom} a été notifié. Une réponse vous parviendra par email ou téléphone.`}
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#0066CC] focus:ring-2 focus:ring-blue-100 outline-none transition";
  const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Identité */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Vos coordonnées</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Votre nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            className={inputCls}
          />
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <input
          type="tel"
          placeholder="Votre téléphone (recommandé pour un rappel rapide)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={`${inputCls} mt-3`}
        />
      </div>

      {/* Date & heure */}
      <div className="border-t border-gray-100 pt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> Date du transport
        </div>
        <DateHeureCourse
          value={dateSouhaitee}
          onChange={setDateSouhaitee}
          label="Date et heure souhaitées"
          inputClassName={inputCls}
          labelClassName={labelCls}
        />
      </div>

      {/* Trajet */}
      <div className="border-t border-gray-100 pt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> Trajet
        </div>
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Lieu de départ</label>
            <input
              ref={lieuDepartRef}
              type="text"
              placeholder="Ex : Domicile, 12 rue des Lilas, Caen"
              value={lieuDepart}
              onChange={(e) => {
                setLieuDepart(e.target.value);
                if (departPlace) setDepartPlace(null);
              }}
              required
              autoComplete="off"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Lieu d&apos;arrivée</label>
            <input
              ref={lieuArriveeRef}
              type="text"
              placeholder="Ex : Centre hospitalier de Caen, service dialyse"
              value={lieuArrivee}
              onChange={(e) => {
                setLieuArrivee(e.target.value);
                if (arriveePlace) setArriveePlace(null);
              }}
              required
              autoComplete="off"
              className={inputCls}
            />
          </div>
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

      {/* Type de transport */}
      <div className="border-t border-gray-100 pt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5" /> Type de transport
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {(Object.keys(LABEL_TRANSPORT) as ChoixTransport[]).map((t) => (
            <label
              key={t}
              className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer transition text-sm ${
                choixTransport === t
                  ? "border-[#0066CC] bg-blue-50 text-[#0066CC] font-medium"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="typeTransport"
                value={t}
                checked={choixTransport === t}
                onChange={() => setChoixTransport(t)}
                className="sr-only"
              />
              {LABEL_TRANSPORT[t]}
            </label>
          ))}
        </div>
      </div>

      {/* Mobilité */}
      <div className="border-t border-gray-100 pt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1.5">
          <Accessibility className="w-3.5 h-3.5" /> Mobilité du bénéficiaire
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(LABEL_MOBILITE) as Mobilite[]).map((m) => (
            <label
              key={m}
              className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer transition text-sm ${
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

      {/* Précisions libres */}
      <div className="border-t border-gray-100 pt-4">
        <label className={labelCls}>Précisions (facultatif)</label>
        <textarea
          placeholder="Toute information utile pour le professionnel (sans données médicales sensibles)"
          value={precisions}
          onChange={(e) => setPrecisions(e.target.value)}
          rows={3}
          className={`${inputCls} resize-none`}
        />
        <p className="text-[11px] text-gray-500 mt-1">
          Ne mentionnez pas de motif médical, diagnostic ou nom de médecin. RoullePro ne stocke aucune donnée de santé.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-xl transition"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Envoyer la demande
      </button>
      <p className="text-xs text-gray-500 text-center">
        Vos coordonnées ne sont partagées qu&apos;avec {proNom} et les professionnels de votre secteur. Aucune publicité, jamais revendues.
      </p>
    </form>
  );
}
