"use client";

import { useRef, useState } from "react";
import { Send, Loader2, CheckCircle2, Car, Cross, Stethoscope } from "lucide-react";
import {
  TYPES_TRANSPORT_DISPONIBLES,
  LIBELLE_TYPE_TRANSPORT,
  type TypeTransport,
  type SourcePage,
} from "@/lib/transport-types";
import {
  usePlacesAutocomplete,
  type PlaceSelection,
} from "@/lib/use-places-autocomplete";
import DateHeureCourse, { toISODateSouhaitee } from "@/components/forms/DateHeureCourse";

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

// Mapping de la source-page (analytics) vers le source_form attendu cote API.
const SOURCE_PAGE_TO_FORM: Partial<Record<SourcePage, string>> = {
  home: "home",
  etablissement: "etablissement",
  fiche_etablissement: "etablissement",
  "transport-vers": "transport_vers",
  "fiche-pro": "fiche_pro",
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
  /** Pré-remplissage (ex. depuis un simulateur de tarif). */
  lieuDepartInitial?: string;
  lieuArriveeInitial?: string;
  departPlaceInitial?: PlaceSelection | null;
  arriveePlaceInitial?: PlaceSelection | null;
  dateSouhaiteeInitial?: string;
  allerRetourInitial?: boolean;
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
  lieuDepartInitial = "",
  lieuArriveeInitial = "",
  departPlaceInitial = null,
  arriveePlaceInitial = null,
  dateSouhaiteeInitial = "",
  allerRetourInitial = false,
}: DemandeTransportFormProps) {
  const [type, setType] = useState<TypeTransport>(typeParDefaut);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [dateSouhaitee, setDateSouhaitee] = useState(dateSouhaiteeInitial);
  const [lieuDepart, setLieuDepart] = useState(lieuDepartInitial);
  const [lieuArrivee, setLieuArrivee] = useState(lieuArriveeInitial);
  const [allerRetour, setAllerRetour] = useState(allerRetourInitial);
  const [mobilite, setMobilite] = useState<Mobilite>("autonome");
  const [precisions, setPrecisions] = useState("");
  const [tauxPriseEnCharge, setTauxPriseEnCharge] = useState<"" | "100" | "65" | "autre">("");
  const [tauxAutre, setTauxAutre] = useState("");
  const [bonTransport, setBonTransport] = useState(false);
  // Honeypot anti-bot : doit rester vide.
  const [website, setWebsite] = useState("");

  // Place selections (Google Places Autocomplete) — utilises pour deriver
  // le departement et la ville cible cote front, et ainsi permettre au trigger
  // dispatch_demande_transport() de fan-outer la demande au bon pro.
  const [departPlace, setDepartPlace] = useState<PlaceSelection | null>(departPlaceInitial);
  const [arriveePlace, setArriveePlace] = useState<PlaceSelection | null>(arriveePlaceInitial);

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

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [nbPros, setNbPros] = useState(0);
  const [doublon, setDoublon] = useState(false);
  const [suiviToken, setSuiviToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nom.trim() || !telephone.trim()) {
      setError("Merci d'indiquer votre nom et votre téléphone.");
      return;
    }
    if (!email.trim()) {
      setError("Merci d'indiquer votre email pour recevoir une confirmation.");
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

    // Departement / ville cibles : on privilegie ce qui vient du parent
    // (fiche etablissement, page pro deja localisee), sinon on derive du
    // place Google de depart. L'API completera en fallback via API Adresse FR.
    const departementResolved =
      departementCible || departPlace?.departement || arriveePlace?.departement || null;
    const villeResolved = villeCible || departPlace?.ville || arriveePlace?.ville || null;

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
          taux_prise_en_charge: tauxPriseEnCharge || null,
          taux_prise_en_charge_autre: tauxPriseEnCharge === "autre" ? tauxAutre.trim() || null : null,
          bon_transport_medical: bonTransport,
          source_page: sourcePage,
          source_form: SOURCE_PAGE_TO_FORM[sourcePage] ?? null,
          website,
          etablissement_id: etablissementId,
          pro_id_cible: proIdCible,
          departement_cible: departementResolved,
          ville_cible: villeResolved,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi");
      setNbPros(data.pros_notifies ?? 0);
      setDoublon(data.doublon === true);
      setSuiviToken(typeof data.suivi_token === "string" ? data.suivi_token : null);
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
            ? `${nbPros > 0 ? `${nbPros} professionnel${nbPros > 1 ? "s" : ""} ${nbPros > 1 ? "ont" : "a"} été prévenu${nbPros > 1 ? "s" : ""}` : "Les professionnels de votre secteur ont été prévenus"}. Inutile de la redéposer, ils vous rappelleront directement.`
            : nbPros > 0
              ? `${nbPros} professionnel${nbPros > 1 ? "s" : ""} proche${nbPros > 1 ? "s" : ""} de vous ${nbPros > 1 ? "ont" : "a"} été notifié${nbPros > 1 ? "s" : ""}. Ils vous rappelleront directement.`
              : "Nous recherchons un professionnel disponible dans votre secteur et reviendrons vers vous rapidement."}
        </p>
        {suiviToken && (
          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="text-sm text-gray-600 mb-2">
              Suivez l&apos;avancement de votre demande et annulez-la si besoin :
            </p>
            <a
              href={`/suivi-demande/${suiviToken}`}
              className="inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-4 py-2 rounded-xl transition text-sm"
            >
              Suivre ma demande
            </a>
          </div>
        )}
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
        placeholder="Votre email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={inputCls}
      />

      {/* Trajet : depart + arrivee obligatoires partout (meme en mode compact) */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Lieu de départ</label>
          <input
            ref={lieuDepartRef}
            type="text"
            placeholder="Adresse ou ville"
            value={lieuDepart}
            onChange={(e) => {
              setLieuDepart(e.target.value);
              // Si l'utilisateur retape, on invalide le place pour eviter
              // un mismatch entre l'input et le departement deduit.
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
            placeholder="Adresse, hôpital ou ville"
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
      </div>

      {/* Date obligatoire partout (meme en mode compact) */}
      <div className="grid sm:grid-cols-2 gap-3">
        <DateHeureCourse
          value={dateSouhaitee}
          onChange={setDateSouhaitee}
          inputClassName={inputCls}
          labelClassName={labelCls}
        />
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

      {!compact && (
        <>
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
            <label className={labelCls}>Taux de prise en charge (facultatif)</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                ["100", "100 %"],
                ["65", "65 %"],
                ["autre", "Autre"],
              ] as const).map(([val, lib]) => (
                <label
                  key={val}
                  className={`flex items-center justify-center px-2 py-2 border rounded-xl cursor-pointer transition text-sm text-center ${
                    tauxPriseEnCharge === val
                      ? "border-[#0066CC] bg-blue-50 text-[#0066CC] font-medium"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="taux"
                    value={val}
                    checked={tauxPriseEnCharge === val}
                    onChange={() => setTauxPriseEnCharge(val)}
                    className="sr-only"
                  />
                  {lib}
                </label>
              ))}
            </div>
            {tauxPriseEnCharge === "autre" && (
              <input
                type="number"
                min={0}
                max={100}
                placeholder="Taux en % (0 à 100)"
                value={tauxAutre}
                onChange={(e) => setTauxAutre(e.target.value)}
                className={`${inputCls} mt-2`}
              />
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={bonTransport}
                onChange={(e) => setBonTransport(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#0066CC] focus:ring-[#0066CC]"
              />
              Je dispose d&apos;un bon de transport médical
            </label>
            {!bonTransport && (
              <p className="text-xs text-gray-500 mt-1.5">
                Sans bon de transport, certains pros peuvent ne pas pouvoir prendre votre course.
              </p>
            )}
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

      {/* Honeypot anti-bot : invisible, ne doit jamais etre rempli par un humain. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        style={{ display: "none" }}
      />

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
        Vos données sont transmises uniquement aux professionnels susceptibles de répondre à votre demande.
        Évitez d&apos;indiquer des données de santé dans les précisions.
      </p>
    </form>
  );
}
