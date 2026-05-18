"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, Mail, Loader2 } from "lucide-react";

const METIERS = [
  { code: "ambulance", label: "Ambulance" },
  { code: "vsl", label: "VSL" },
  { code: "taxi_conventionne", label: "Taxi conventionné" },
];

type Status = "idle" | "loading" | "success" | "already" | "error";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [metiers, setMetiers] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  const toggleMetier = (code: string) => {
    setMetiers((prev) =>
      prev.includes(code) ? prev.filter((m) => m !== code) : [...prev, code]
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!email.trim()) {
      setStatus("error");
      setMessage("Adresse email requise");
      return;
    }
    if (metiers.length === 0) {
      setStatus("error");
      setMessage("Sélectionnez au moins un métier");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/veille/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), metiers }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setMessage(data?.error || "Inscription impossible. Réessayez plus tard.");
        return;
      }

      if (data?.alreadySubscribed) {
        setStatus("already");
        setMessage(data?.message || "Vous êtes déjà inscrit à la veille.");
        return;
      }

      setStatus("success");
      setMessage(data?.message || "Vérifiez votre boîte mail pour confirmer.");
    } catch (err) {
      setStatus("error");
      setMessage("Erreur réseau. Réessayez.");
    }
  };

  if (status === "success" || status === "already") {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="bg-green-100 text-green-700 p-2 rounded-lg flex-shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {status === "success" ? "Email de confirmation envoyé" : "Déjà inscrit"}
            </h3>
            <p className="text-sm text-slate-600 mt-1">{message}</p>
            {status === "success" && (
              <p className="text-xs text-slate-500 mt-2">
                Pensez à vérifier votre dossier spam si vous ne recevez rien dans les minutes qui viennent.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="bg-blue-100 text-blue-700 p-2 rounded-lg flex-shrink-0">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Recevez la veille par e-mail</h3>
          <p className="text-sm text-slate-600">
            Un email hebdomadaire (mardi matin), segmenté par métier. Sources officielles, langage clair.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="veille-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Adresse email professionnelle
          </label>
          <input
            id="veille-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@votre-entreprise.fr"
            disabled={status === "loading"}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-semibold text-slate-700 mb-1.5">
            Vos métiers (au moins un)
          </legend>
          <div className="flex flex-wrap gap-2">
            {METIERS.map((m) => {
              const active = metiers.includes(m.code);
              return (
                <label
                  key={m.code}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition ${
                    active
                      ? "bg-blue-50 border-blue-300 text-blue-800"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  } ${status === "loading" ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    disabled={status === "loading"}
                    onChange={() => toggleMetier(m.code)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{m.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {status === "error" && message && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi en cours…
            </>
          ) : (
            <>S&apos;inscrire à la veille</>
          )}
        </button>

        <p className="text-xs text-slate-500 leading-relaxed">
          En vous inscrivant, vous acceptez de recevoir un email hebdomadaire de veille réglementaire. Désinscription 1 clic à tout moment depuis n&apos;importe quel email reçu.
        </p>
      </div>
    </form>
  );
}
