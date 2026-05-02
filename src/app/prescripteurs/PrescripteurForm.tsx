"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

type FormState = {
  organisation: string;
  type_organisation: string;
  ville: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  volume_mensuel: string;
  prestataire_actuel: string;
  message: string;
  hp: string;
};

const INITIAL: FormState = {
  organisation: "",
  type_organisation: "",
  ville: "",
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  volume_mensuel: "",
  prestataire_actuel: "",
  message: "",
  hp: "",
};

export default function PrescripteurForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/prescripteur-demande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue. Réessayez.");
        setSubmitting(false);
        return;
      }

      const emailParam = encodeURIComponent(form.email);
      router.push(`/prescripteurs/merci?email=${emailParam}`);
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
      setSubmitting(false);
    }
  };

  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";
  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#0066CC] focus:outline-none focus:ring-1 focus:ring-[#0066CC] transition";

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5"
    >
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={form.hp}
        onChange={(e) => update("hp", e.target.value)}
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
        }}
      />

      <div>
        <label className={labelCls} htmlFor="organisation">
          Nom de l&apos;organisation <span className="text-red-500">*</span>
        </label>
        <input
          id="organisation"
          type="text"
          required
          value={form.organisation}
          onChange={(e) => update("organisation", e.target.value)}
          placeholder="Cabinet du Dr Martin, EHPAD Les Lilas, CH de Tours…"
          className={inputCls}
          maxLength={200}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="type_organisation">
            Type d&apos;organisation <span className="text-red-500">*</span>
          </label>
          <select
            id="type_organisation"
            required
            value={form.type_organisation}
            onChange={(e) => update("type_organisation", e.target.value)}
            className={inputCls}
          >
            <option value="">— Sélectionner —</option>
            <option value="cabinet_medical">Cabinet médical</option>
            <option value="hopital">Hôpital / clinique</option>
            <option value="ehpad">EHPAD</option>
            <option value="dialyse">Centre de dialyse</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="ville">
            Ville <span className="text-red-500">*</span>
          </label>
          <input
            id="ville"
            type="text"
            required
            value={form.ville}
            onChange={(e) => update("ville", e.target.value)}
            placeholder="Paris, Lyon, Tours…"
            className={inputCls}
            maxLength={100}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="prenom">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            id="prenom"
            type="text"
            required
            value={form.prenom}
            onChange={(e) => update("prenom", e.target.value)}
            className={inputCls}
            maxLength={80}
            autoComplete="given-name"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="nom">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            id="nom"
            type="text"
            required
            value={form.nom}
            onChange={(e) => update("nom", e.target.value)}
            className={inputCls}
            maxLength={80}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="email">
            Email professionnel <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="vous@cabinet.fr"
            className={inputCls}
            maxLength={200}
            autoComplete="email"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="telephone">
            Téléphone <span className="text-red-500">*</span>
          </label>
          <input
            id="telephone"
            type="tel"
            required
            value={form.telephone}
            onChange={(e) => update("telephone", e.target.value)}
            placeholder="01 23 45 67 89"
            className={inputCls}
            maxLength={30}
            autoComplete="tel"
          />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="volume_mensuel">
          Volume estimé de prescriptions transport / mois{" "}
          <span className="text-red-500">*</span>
        </label>
        <select
          id="volume_mensuel"
          required
          value={form.volume_mensuel}
          onChange={(e) => update("volume_mensuel", e.target.value)}
          className={inputCls}
        >
          <option value="">— Sélectionner —</option>
          <option value="moins_10">Moins de 10 / mois</option>
          <option value="10_50">10 à 50 / mois</option>
          <option value="50_200">50 à 200 / mois</option>
          <option value="plus_200">Plus de 200 / mois</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>
          Avez-vous déjà un prestataire transport attitré ?{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mt-1">
          {[
            { v: "oui", l: "Oui" },
            { v: "non", l: "Non" },
            { v: "parfois", l: "Parfois" },
          ].map((opt) => (
            <label
              key={opt.v}
              className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition ${
                form.prestataire_actuel === opt.v
                  ? "border-[#0066CC] bg-blue-50 text-[#0066CC]"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name="prestataire_actuel"
                value={opt.v}
                checked={form.prestataire_actuel === opt.v}
                onChange={(e) => update("prestataire_actuel", e.target.value)}
                className="sr-only"
                required
              />
              {opt.l}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="message">
          Message <span className="text-gray-400 font-normal">(optionnel)</span>
        </label>
        <textarea
          id="message"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Vos besoins spécifiques, contraintes territoriales, questions…"
          className={inputCls}
          rows={4}
          maxLength={2000}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Envoi en cours…
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Demander un accès pilote
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        En soumettant ce formulaire, vous acceptez notre{" "}
        <a href="/rgpd" className="text-[#0066CC] hover:underline">
          politique de confidentialité
        </a>
        . Vos données sont uniquement utilisées pour traiter votre demande.
      </p>
    </form>
  );
}
