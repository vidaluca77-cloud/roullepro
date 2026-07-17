"use client";

/**
 * Simulateur de tarif conventionné (taxi / VSL / ambulance) réutilisé par les
 * pages publiques /simulateur-taxi-conventionne, /tarif-ambulance, /tarif-vsl
 * et le hub /simulateur-transport-sanitaire.
 *
 * AUCUN chiffre tarifaire n'est codé ici : l'estimation vient exclusivement du
 * moteur vérifié `estimerPrixCourse` (grille CPAM taxi + avenant 11 sanitaire),
 * et la distance de `calculerDistanceCourse` (Haversine x facteur routier).
 *
 * Adresses via le loader Google Maps singleton (usePlacesAutocomplete), qui
 * bascule automatiquement sur l'API Adresse nationale (BAN) si la clé Google
 * est absente : le simulateur se dégrade proprement (autocomplete simple + note).
 */

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowRight, MapPin, Info, Car, Cross, Stethoscope } from "lucide-react";
import {
  usePlacesAutocomplete,
  type PlaceSelection,
} from "@/lib/use-places-autocomplete";
import {
  LIBELLE_TYPE_TRANSPORT,
  TYPES_TRANSPORT_DISPONIBLES,
  type TypeTransport,
} from "@/lib/transport-types";
import { calculerDistanceCourse } from "@/lib/distance-course";
import {
  estimerPrixCourse,
  type EstimationCourse,
} from "@/lib/tarif-transport-sanitaire";
import DateHeureCourse from "@/components/forms/DateHeureCourse";
import DemandeTransportForm from "@/components/sanitaire/DemandeTransportForm";

const ICONES: Record<TypeTransport, typeof Car> = {
  taxi: Car,
  vsl: Stethoscope,
  ambulance: Cross,
};

const CLE_GOOGLE_PRESENTE = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function euros(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

type LigneDetail = { label: string; valeur: string };

/** Construit les lignes de détail du calcul à partir des `details` du moteur. */
function lignesDetail(est: EstimationCourse): LigneDetail[] {
  const d = est.details;
  const lignes: LigneDetail[] = [];

  if (d.type === "taxi") {
    lignes.push({ label: "Forfait de prise en charge (4 km inclus)", valeur: euros(d.forfait) });
    if (d.forfaitGrandeVille > 0) {
      lignes.push({ label: "Forfait grande ville", valeur: euros(d.forfaitGrandeVille) });
    }
    lignes.push({
      label: `Kilomètres facturés (${d.kmFactures} km × ${euros(d.tauxKm)}/km)`,
      valeur: euros(d.montantKm),
    });
    if (d.supplementDrom > 0) {
      lignes.push({ label: "Supplément outre-mer (DROM)", valeur: euros(d.supplementDrom) });
    }
    if (d.majorationNuitWeAppliquee) {
      lignes.push({ label: "Majoration nuit / week-end / jour férié (+50 %)", valeur: euros(d.majorationNuitWe) });
    }
  } else {
    lignes.push({ label: "Forfait départemental (3 km inclus)", valeur: euros(d.forfait) });
    lignes.push({
      label: `Kilomètres facturés (${d.kmFactures} km × ${euros(d.tauxKm)}/km)`,
      valeur: euros(d.montantKm),
    });
    if (d.valorisationTrajetCourt > 0) {
      lignes.push({ label: "Valorisation trajet court", valeur: euros(d.valorisationTrajetCourt) });
    }
    if (d.majoration) {
      const lib =
        d.majoration.libelle === "nuit"
          ? `Majoration nuit (+${Math.round(d.majoration.taux * 100)} %)`
          : `Majoration dimanche / jour férié (+${Math.round(d.majoration.taux * 100)} %)`;
      lignes.push({ label: lib, valeur: euros(d.majoration.montant) });
    }
  }

  if (d.allerRetour) {
    lignes.push({ label: "Aller-retour (× 2)", valeur: "inclus" });
  }
  return lignes;
}

export type SimulateurTarifProps = {
  typeParDefaut?: TypeTransport;
};

export default function SimulateurTarif({ typeParDefaut = "taxi" }: SimulateurTarifProps) {
  const [type, setType] = useState<TypeTransport>(typeParDefaut);
  const [lieuDepart, setLieuDepart] = useState("");
  const [lieuArrivee, setLieuArrivee] = useState("");
  const [departPlace, setDepartPlace] = useState<PlaceSelection | null>(null);
  const [arriveePlace, setArriveePlace] = useState<PlaceSelection | null>(null);
  const [dateSouhaitee, setDateSouhaitee] = useState("");
  const [allerRetour, setAllerRetour] = useState(false);
  const [showDemande, setShowDemande] = useState(false);

  const lieuDepartRef = useRef<HTMLInputElement>(null);
  const lieuArriveeRef = useRef<HTMLInputElement>(null);

  usePlacesAutocomplete([
    {
      ref: lieuDepartRef,
      onSelect: (p) => {
        setLieuDepart(p.formattedAddress);
        setDepartPlace(p);
        setShowDemande(false);
      },
    },
    {
      ref: lieuArriveeRef,
      onSelect: (p) => {
        setLieuArrivee(p.formattedAddress);
        setArriveePlace(p);
        setShowDemande(false);
      },
    },
  ]);

  const distance = useMemo(
    () =>
      calculerDistanceCourse(
        departPlace?.lat != null && departPlace?.lng != null
          ? { lat: departPlace.lat, lng: departPlace.lng }
          : null,
        arriveePlace?.lat != null && arriveePlace?.lng != null
          ? { lat: arriveePlace.lat, lng: arriveePlace.lng }
          : null
      ),
    [departPlace, arriveePlace]
  );

  const departementCible =
    arriveePlace?.departement || departPlace?.departement || "";

  const estimation = useMemo<EstimationCourse | null>(() => {
    if (!distance) return null;
    return estimerPrixCourse({
      typeTransport: type,
      distanceKm: distance.distanceKm,
      departementCible,
      villeDepart: departPlace?.ville ?? null,
      villeArrivee: arriveePlace?.ville ?? null,
      departementDepart: departPlace?.departement ?? null,
      departementArrivee: arriveePlace?.departement ?? null,
      dateSouhaitee: dateSouhaitee || null,
      allerRetour,
    });
  }, [distance, type, departementCible, departPlace, arriveePlace, dateSouhaitee, allerRetour]);

  // Taxi : le moteur a besoin du taux km départemental. Si l'adresse d'arrivée
  // ne permet pas de le déduire, on l'explique plutôt que d'afficher un faux prix.
  const manqueDepartementTaxi =
    type === "taxi" && !!distance && estimation === null;

  const inputCls =
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#0066CC] focus:ring-2 focus:ring-blue-100 outline-none transition text-gray-900";
  const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
      <div className="mb-4">
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
                onClick={() => {
                  setType(t);
                  setShowDemande(false);
                }}
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

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className={labelCls} htmlFor="sim-depart">Adresse de départ</label>
          <input
            id="sim-depart"
            ref={lieuDepartRef}
            type="text"
            placeholder="Adresse ou ville de départ"
            value={lieuDepart}
            onChange={(e) => {
              setLieuDepart(e.target.value);
              if (departPlace) setDepartPlace(null);
            }}
            autoComplete="off"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="sim-arrivee">Adresse d&apos;arrivée</label>
          <input
            id="sim-arrivee"
            ref={lieuArriveeRef}
            type="text"
            placeholder="Adresse, hôpital ou ville d'arrivée"
            value={lieuArrivee}
            onChange={(e) => {
              setLieuArrivee(e.target.value);
              if (arriveePlace) setArriveePlace(null);
            }}
            autoComplete="off"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 items-end mb-1">
        <DateHeureCourse
          value={dateSouhaitee}
          onChange={(v) => {
            setDateSouhaitee(v);
            setShowDemande(false);
          }}
          required={false}
          label="Date et heure (facultatif, pour les majorations)"
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

      {!CLE_GOOGLE_PRESENTE && (
        <p className="text-[11px] text-gray-500 mt-2 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          Saisie d&apos;adresse simplifiée : commencez à taper puis choisissez une suggestion pour lancer l&apos;estimation.
        </p>
      )}

      {/* Zone de résultat : hauteur réservée pour éviter tout décalage (CLS). */}
      <div className="mt-4 min-h-[128px]">
        {!distance && (
          <div className="h-full flex items-center justify-center text-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl px-4 py-6">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              Renseignez une adresse de départ et d&apos;arrivée (en choisissant une suggestion) pour estimer le tarif.
            </span>
          </div>
        )}

        {manqueDepartementTaxi && (
          <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            Nous n&apos;avons pas pu déterminer le département de la course pour appliquer le tarif kilométrique
            du taxi conventionné. Précisez l&apos;adresse d&apos;arrivée en sélectionnant une suggestion.
          </div>
        )}

        {estimation && distance && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-br from-[#0f1d3a] to-[#0066CC] text-white px-4 py-4">
              <div className="text-xs text-blue-100 mb-1">
                Estimation {LIBELLE_TYPE_TRANSPORT[type]} · {distance.distanceKm} km
                {allerRetour ? " (aller-retour)" : ""}
              </div>
              <div className="text-3xl font-bold">≈ {euros(estimation.total)}</div>
            </div>
            <div className="px-4 py-3">
              <table className="w-full text-sm">
                <tbody className="text-gray-700">
                  {lignesDetail(estimation).map((l, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="py-1.5 pr-3">{l.label}</td>
                      <td className="py-1.5 text-right font-medium whitespace-nowrap">{l.valeur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-gray-500 mt-3">{estimation.mention}</p>
            </div>
          </div>
        )}
      </div>

      {estimation && (
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setShowDemande((v) => !v)}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-3 rounded-xl transition"
          >
            Déposer une demande de transport
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            href={
              departementCible
                ? `/transport-medical/departement/${departementCible}`
                : "/transport-medical"
            }
            className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-[#0066CC] text-[#0066CC] hover:bg-blue-50 font-semibold px-5 py-3 rounded-xl transition text-center"
          >
            Voir l&apos;annuaire {departementCible ? `du ${departementCible}` : "des transporteurs"}
          </Link>
        </div>
      )}

      {showDemande && estimation && (
        <div className="mt-5 border-t border-gray-200 pt-5">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Déposer votre demande</h3>
          <p className="text-sm text-gray-600 mb-4">
            Vos coordonnées sont transmises gratuitement aux professionnels de votre secteur, qui vous
            rappellent directement. Sans engagement.
          </p>
          <DemandeTransportForm
            sourcePage="simulateur"
            typeParDefaut={type}
            departementCible={departementCible || null}
            villeCible={departPlace?.ville ?? arriveePlace?.ville ?? null}
            lieuDepartInitial={lieuDepart}
            lieuArriveeInitial={lieuArrivee}
            departPlaceInitial={departPlace}
            arriveePlaceInitial={arriveePlace}
            dateSouhaiteeInitial={dateSouhaitee}
            allerRetourInitial={allerRetour}
          />
        </div>
      )}
    </div>
  );
}
