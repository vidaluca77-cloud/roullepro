"use client";

import { useRef, useState } from "react";
import { Car, X, Loader2, CheckCircle2 } from "lucide-react";
import {
  usePlacesAutocomplete,
  extractDepartementFromComponents,
  extractVilleFromComponents,
  type PlaceSelection,
} from "@/lib/use-places-autocomplete";

type Taux = "" | "100" | "65" | "autre";

// Téléphone fixe ou mobile français, tolérant aux espaces, points et tirets.
const PHONE_FR_RE = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.\-]?\d{2}){4}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FloatingReserveTaxi() {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [dateSouhaitee, setDateSouhaitee] = useState("");
  const [lieuDepart, setLieuDepart] = useState("");
  const [lieuArrivee, setLieuArrivee] = useState("");
  const [taux, setTaux] = useState<Taux>("");
  const [tauxAutre, setTauxAutre] = useState("");
  const [precisionsMobilite, setPrecisionsMobilite] = useState("");
  const [bonTransport, setBonTransport] = useState(false);
  const [rgpd, setRgpd] = useState(false);
  // Honeypot anti-bot : doit rester vide.
  const [website, setWebsite] = useState("");

  // Places Autocomplete : on stocke les selections pour deriver le departement.
  const [departPlace, setDepartPlace] = useState<PlaceSelection | null>(null);
  const [arriveePlace, setArriveePlace] = useState<PlaceSelection | null>(null);
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
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nom.trim() || !telephone.trim()) {
      setError("Merci d'indiquer ton nom et ton téléphone.");
      return;
    }
    if (!PHONE_FR_RE.test(telephone.trim())) {
      setError("Ton numéro de téléphone ne semble pas valide.");
      return;
    }
    if (!email.trim()) {
      setError("Merci d'indiquer ton email pour recevoir une confirmation.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Ton adresse email ne semble pas valide.");
      return;
    }
    if (!dateSouhaitee) {
      setError("Merci d'indiquer la date souhaitée du transport.");
      return;
    }
    if (!lieuDepart.trim() || !lieuArrivee.trim()) {
      setError("Merci d'indiquer ton lieu de départ et ton lieu d'arrivée.");
      return;
    }
    if (!taux) {
      setError("Merci d'indiquer ton taux de prise en charge.");
      return;
    }
    if (taux === "autre") {
      const n = Number(tauxAutre);
      if (!tauxAutre.trim() || Number.isNaN(n) || n < 0 || n > 100) {
        setError("Indique un taux de prise en charge entre 0 et 100.");
        return;
      }
    }
    if (!rgpd) {
      setError("Merci d'accepter la transmission de tes coordonnées pour être recontacté.");
      return;
    }

    // Departement / ville cibles derivees du place Google de depart (puis arrivee
    // en fallback). L'API completera via API Adresse FR si rien n'est resolu cote front.
    const depFromDepart = departPlace
      ? extractDepartementFromComponents(departPlace.components)
      : null;
    const villeFromDepart = departPlace
      ? extractVilleFromComponents(departPlace.components)
      : null;
    const depFromArrivee = arriveePlace
      ? extractDepartementFromComponents(arriveePlace.components)
      : null;
    const villeFromArrivee = arriveePlace
      ? extractVilleFromComponents(arriveePlace.components)
      : null;

    setLoading(true);
    try {
      const res = await fetch("/api/demande-transport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type_transport: "taxi",
          nom: nom.trim(),
          telephone: telephone.trim(),
          email: email.trim() || null,
          date_souhaitee: dateSouhaitee || null,
          lieu_depart: lieuDepart.trim(),
          lieu_arrivee: lieuArrivee.trim(),
          lieu_depart_lat: departPlace?.lat ?? null,
          lieu_depart_lng: departPlace?.lng ?? null,
          mobilite: precisionsMobilite.trim() || null,
          taux_prise_en_charge: taux,
          taux_prise_en_charge_autre: taux === "autre" ? tauxAutre.trim() : null,
          bon_transport_medical: bonTransport,
          source_page: "widget",
          source_form: "widget",
          website,
          departement_cible: depFromDepart || depFromArrivee,
          ville_cible: villeFromDepart || villeFromArrivee,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi");
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setSent(false);
      setError(null);
    }, 300);
  };

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#0066CC] focus:ring-2 focus:ring-blue-100 outline-none transition text-sm";
  const labelCls = "block text-xs font-semibold text-gray-700 mb-1";
  const pill = (actif: boolean) =>
    `flex items-center justify-center px-2 py-2 rounded-xl border cursor-pointer transition text-xs text-center ${
      actif
        ? "bg-[#0066CC] text-white border-[#0066CC] font-semibold"
        : "bg-white text-gray-700 border-gray-300 hover:border-[#0066CC]"
    }`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Réserver un taxi"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-3 rounded-full shadow-lg transition"
      >
        <Car className="w-5 h-5" />
        Réserver un taxi
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={close}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            {sent ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Ta demande est bien reçue.
                </h3>
                <p className="text-sm text-gray-600 mb-5">
                  Un professionnel va te rappeler rapidement.
                </p>
                <button
                  onClick={close}
                  className="bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-2 rounded-xl transition"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-gray-900 mb-4">
                  <Car className="w-5 h-5 text-[#0066CC]" />
                  <h3 className="text-lg font-bold">Réserver un taxi conventionné</h3>
                </div>

                <form onSubmit={onSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Ton nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                    minLength={2}
                    aria-label="Ton nom"
                    className={inputCls}
                  />
                  <input
                    type="tel"
                    placeholder="Ton téléphone"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    required
                    aria-label="Ton téléphone"
                    className={inputCls}
                  />
                  <input
                    type="email"
                    placeholder="Ton email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-label="Ton email"
                    className={inputCls}
                  />
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
                          if (departPlace) setDepartPlace(null);
                        }}
                        required
                        autoComplete="off"
                        aria-label="Lieu de départ"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Lieu d&apos;arrivée</label>
                      <input
                        ref={lieuArriveeRef}
                        type="text"
                        placeholder="Adresse ou ville"
                        value={lieuArrivee}
                        onChange={(e) => {
                          setLieuArrivee(e.target.value);
                          if (arriveePlace) setArriveePlace(null);
                        }}
                        required
                        autoComplete="off"
                        aria-label="Lieu d'arrivée"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Date souhaitée</label>
                    <input
                      type="date"
                      value={dateSouhaitee}
                      onChange={(e) => setDateSouhaitee(e.target.value)}
                      required
                      aria-label="Date souhaitée"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <span className={labelCls}>Taux de prise en charge</span>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        ["100", "100 %"],
                        ["65", "65 %"],
                        ["autre", "Autre"],
                      ] as const).map(([val, lib]) => (
                        <label key={val} className={pill(taux === val)}>
                          <input
                            type="radio"
                            name="taux"
                            value={val}
                            checked={taux === val}
                            onChange={() => setTaux(val)}
                            className="sr-only"
                          />
                          {lib}
                        </label>
                      ))}
                    </div>
                    {taux === "autre" && (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Taux en % (0 à 100)"
                        value={tauxAutre}
                        onChange={(e) => setTauxAutre(e.target.value)}
                        aria-label="Taux de prise en charge personnalisé"
                        className={`${inputCls} mt-2`}
                      />
                    )}
                  </div>

                  <div>
                    <label className={labelCls}>Précisions sur la mobilité (facultatif)</label>
                    <textarea
                      placeholder="Mobilité réduite, fauteuil roulant, oxygène…"
                      value={precisionsMobilite}
                      onChange={(e) => setPrecisionsMobilite(e.target.value)}
                      rows={2}
                      aria-label="Précisions sur la mobilité"
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  <label className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bonTransport}
                      onChange={(e) => setBonTransport(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300"
                    />
                    J&apos;ai un bon de transport médical signé par mon médecin
                  </label>

                  <label className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rgpd}
                      onChange={(e) => setRgpd(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300"
                    />
                    <span>
                      J&apos;accepte que mes coordonnées soient transmises aux transporteurs
                      proches pour être recontacté.{" "}
                      <a href="/rgpd" target="_blank" rel="noopener" className="underline text-[#0066CC]">
                        Politique de confidentialité
                      </a>
                    </span>
                  </label>

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
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-xl transition"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Réserver un taxi
                  </button>
                  <p className="text-[11px] text-gray-500 text-center">
                    Sans engagement. Ne mentionne aucune donnée médicale.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
