"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, Calendar, MapPin, Stethoscope, Accessibility } from "lucide-react";

type TypeTransport = "indifferent" | "ambulance" | "vsl" | "taxi_conventionne";
type Mobilite = "autonome" | "aide_marche" | "fauteuil" | "brancard";

export default function ContactProForm({ proId, proNom }: { proId: string; proNom: string }) {
  // Identité
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Transport (champs structurés)
  const [dateSouhaitee, setDateSouhaitee] = useState("");
  const [heureSouhaitee, setHeureSouhaitee] = useState("");
  const [lieuDepart, setLieuDepart] = useState("");
  const [lieuArrivee, setLieuArrivee] = useState("");
  const [typeTransport, setTypeTransport] = useState<TypeTransport>("indifferent");
  const [allerRetour, setAllerRetour] = useState(false);
  const [mobilite, setMobilite] = useState<Mobilite>("autonome");
  const [precisions, setPrecisions] = useState("");

  // État
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const labelTransport: Record<TypeTransport, string> = {
    indifferent: "Indifférent / à conseiller",
    ambulance: "Ambulance (allongé)",
    vsl: "VSL (assis, médicalisé)",
    taxi_conventionne: "Taxi conventionné CPAM",
  };
  const labelMobilite: Record<Mobilite, string> = {
    autonome: "Autonome",
    aide_marche: "Aide à la marche",
    fauteuil: "Fauteuil roulant",
    brancard: "Allongé / brancard",
  };

  const buildContent = () => {
    const lines: string[] = [];
    lines.push("Demande de transport sanitaire");
    lines.push("");
    if (dateSouhaitee) {
      lines.push(`Date souhaitée : ${dateSouhaitee}${heureSouhaitee ? ` à ${heureSouhaitee}` : ""}`);
    }
    if (lieuDepart) lines.push(`Départ : ${lieuDepart}`);
    if (lieuArrivee) lines.push(`Arrivée : ${lieuArrivee}`);
    lines.push(`Type de transport : ${labelTransport[typeTransport]}`);
    lines.push(`Trajet : ${allerRetour ? "Aller-retour" : "Aller simple"}`);
    lines.push(`Mobilité du bénéficiaire : ${labelMobilite[mobilite]}`);
    if (precisions.trim()) {
      lines.push("");
      lines.push("Précisions :");
      lines.push(precisions.trim());
    }
    return lines.join("\n");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!dateSouhaitee || !lieuDepart.trim() || !lieuArrivee.trim()) {
      setError("Merci de renseigner la date, le lieu de départ et le lieu d'arrivée.");
      return;
    }

    const content = buildContent();
    if (content.length < 20) {
      setError("Merci d'apporter quelques précisions sur la demande.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sanitaire/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pro_id: proId,
          sender_name: name.trim(),
          sender_email: email.trim(),
          sender_phone: phone.trim(),
          content,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }
      setSent(true);
      if (data.warning) setWarning(data.warning);
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
          {proNom} a été notifié. Une réponse vous parviendra par email ou téléphone.
        </p>
        {warning && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
            {warning}
          </p>
        )}
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
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Date souhaitée</label>
            <input
              type="date"
              value={dateSouhaitee}
              onChange={(e) => setDateSouhaitee(e.target.value)}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Heure (facultatif)</label>
            <input
              type="time"
              value={heureSouhaitee}
              onChange={(e) => setHeureSouhaitee(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
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
              type="text"
              placeholder="Ex : Domicile, 12 rue des Lilas, Caen"
              value={lieuDepart}
              onChange={(e) => setLieuDepart(e.target.value)}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Lieu d&apos;arrivée</label>
            <input
              type="text"
              placeholder="Ex : Centre hospitalier de Caen, service dialyse"
              value={lieuArrivee}
              onChange={(e) => setLieuArrivee(e.target.value)}
              required
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
          {(Object.keys(labelTransport) as TypeTransport[]).map((t) => (
            <label
              key={t}
              className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer transition text-sm ${
                typeTransport === t
                  ? "border-[#0066CC] bg-blue-50 text-[#0066CC] font-medium"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="typeTransport"
                value={t}
                checked={typeTransport === t}
                onChange={() => setTypeTransport(t)}
                className="sr-only"
              />
              {labelTransport[t]}
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
          {(Object.keys(labelMobilite) as Mobilite[]).map((m) => (
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
              {labelMobilite[m]}
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
        Vos coordonnées ne sont partagées qu&apos;avec {proNom}. Aucune publicité, jamais revendues.
      </p>
    </form>
  );
}
