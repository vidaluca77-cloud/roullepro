"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Car, Cross, Stethoscope } from "lucide-react";
import {
  TYPES_TRANSPORT_DISPONIBLES,
  LIBELLE_TYPE_TRANSPORT,
  type TypeTransport,
} from "@/lib/transport-types";

const ICONES: Record<TypeTransport, typeof Car> = {
  taxi: Car,
  vsl: Stethoscope,
  ambulance: Cross,
};

type Taux = "" | "100" | "65" | "autre";

// Téléphone fixe ou mobile français, tolérant aux espaces, points et tirets.
const PHONE_FR_RE = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.\-]?\d{2}){4}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MiniFormulaireReservation({
  etablissementId,
  lieuArrivee,
  departementCible = null,
  villeCible = null,
}: {
  etablissementId: string;
  lieuArrivee: string;
  departementCible?: string | null;
  villeCible?: string | null;
}) {
  const [type, setType] = useState<TypeTransport>("taxi");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [dateSouhaitee, setDateSouhaitee] = useState("");
  const [lieuDepart, setLieuDepart] = useState("");
  const [taux, setTaux] = useState<Taux>("");
  const [tauxAutre, setTauxAutre] = useState("");
  const [precisionsMobilite, setPrecisionsMobilite] = useState("");
  const [bonTransport, setBonTransport] = useState(false);
  const [rgpd, setRgpd] = useState(false);
  // Honeypot anti-bot : doit rester vide.
  const [website, setWebsite] = useState("");

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
    if (!lieuDepart.trim()) {
      setError("Merci d'indiquer ton lieu de départ.");
      return;
    }
    if (email.trim() && !EMAIL_RE.test(email.trim())) {
      setError("Ton adresse email ne semble pas valide.");
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
          lieu_depart: lieuDepart.trim(),
          lieu_arrivee: lieuArrivee,
          mobilite: precisionsMobilite.trim() || null,
          taux_prise_en_charge: taux,
          taux_prise_en_charge_autre: taux === "autre" ? tauxAutre.trim() : null,
          bon_transport_medical: bonTransport,
          source_page: "fiche_etablissement",
          source_form: "etablissement",
          etablissement_id: etablissementId,
          departement_cible: departementCible,
          ville_cible: villeCible,
          website,
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

  if (sent) {
    return (
      <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
        <CheckCircle2 className="w-8 h-8 text-white mx-auto mb-2" />
        <div className="font-semibold text-white">Ta demande est bien reçue.</div>
        <p className="text-sm text-blue-100 mt-1">
          Un professionnel va te rappeler rapidement.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-white/20 bg-white text-gray-900 placeholder-gray-400 focus:border-white focus:ring-2 focus:ring-white/40 outline-none transition text-sm";
  const labelCls = "block text-xs font-semibold text-white mb-1";
  const pill = (actif: boolean) =>
    `flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border cursor-pointer transition text-xs text-center ${
      actif
        ? "bg-white text-[#0066CC] border-white font-semibold"
        : "bg-white/10 text-white border-white/30 hover:border-white/60"
    }`;

  return (
    <form onSubmit={onSubmit} className="space-y-3" aria-label="Réserver un transport">
      <div className="flex items-center gap-2 text-white mb-1">
        <Car className="w-5 h-5" />
        <span className="font-bold">Réserver un transport</span>
      </div>

      <div>
        <span className={labelCls}>Type de transport</span>
        <div className="grid grid-cols-3 gap-2">
          {TYPES_TRANSPORT_DISPONIBLES.map((t) => {
            const Icone = ICONES[t];
            return (
              <label key={t} className={pill(type === t)}>
                <input
                  type="radio"
                  name="type_transport"
                  value={t}
                  checked={type === t}
                  onChange={() => setType(t)}
                  className="sr-only"
                />
                <Icone className="w-4 h-4" />
                {LIBELLE_TYPE_TRANSPORT[t]}
              </label>
            );
          })}
        </div>
      </div>

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
        placeholder="Ton email (facultatif)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Ton email (facultatif)"
        className={inputCls}
      />
      <div>
        <label className={labelCls}>Lieu de départ</label>
        <input
          type="text"
          placeholder="Adresse complète ou ville"
          value={lieuDepart}
          onChange={(e) => setLieuDepart(e.target.value)}
          required
          aria-label="Lieu de départ"
          className={inputCls}
        />
        <p className="text-[11px] text-blue-100 mt-1">Arrivée : {lieuArrivee}</p>
      </div>
      <div>
        <label className={labelCls}>Date souhaitée (facultatif)</label>
        <input
          type="date"
          value={dateSouhaitee}
          onChange={(e) => setDateSouhaitee(e.target.value)}
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

      <label className="flex items-start gap-2 text-xs text-white cursor-pointer">
        <input
          type="checkbox"
          checked={bonTransport}
          onChange={(e) => setBonTransport(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-white/40"
        />
        J&apos;ai un bon de transport médical signé par mon médecin
      </label>

      <label className="flex items-start gap-2 text-xs text-white cursor-pointer">
        <input
          type="checkbox"
          checked={rgpd}
          onChange={(e) => setRgpd(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-white/40"
        />
        <span>
          J&apos;accepte que mes coordonnées soient transmises aux transporteurs proches
          pour être recontacté.{" "}
          <a href="/rgpd" target="_blank" rel="noopener" className="underline">
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
        <div className="text-xs text-white bg-red-500/30 border border-red-300/40 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#0066CC] font-semibold px-4 py-2.5 rounded-xl transition hover:bg-blue-50 disabled:opacity-60"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Réserver un transport
      </button>
      <p className="text-[11px] text-blue-100 text-center">
        Sans engagement. Ne mentionne aucune donnée médicale.
      </p>
    </form>
  );
}
