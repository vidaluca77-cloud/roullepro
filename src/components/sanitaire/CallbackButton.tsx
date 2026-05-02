"use client";

import { useState } from "react";
import { PhoneCall, X, Check } from "lucide-react";

interface Props {
  proId: string;
  proNom: string;
}

type Slot = "asap" | "matin" | "apres-midi" | "soir";

export default function CallbackButton({ proId, proNom }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [slot, setSlot] = useState<Slot>("asap");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Honeypot
  const [hp, setHp] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (hp) return; // bot
    if (!name.trim() || !phone.trim()) {
      setError("Nom et téléphone requis.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/callback-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pro_id: proId,
          visitor_name: name.trim(),
          visitor_phone: phone.trim(),
          visitor_message: message.trim() || null,
          preferred_slot: slot,
          hp,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || "Une erreur est survenue.");
      } else {
        try {
          window.gtag?.("event", "callback_request", { pro_id: proId });
        } catch {}
        setDone(true);
      }
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setOpen(false);
    setTimeout(() => {
      setDone(false);
      setName("");
      setPhone("");
      setMessage("");
      setSlot("asap");
      setError(null);
    }, 300);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border-2 border-[#0066CC] text-[#0066CC] font-semibold px-5 py-3 rounded-xl transition w-full justify-center mb-5"
      >
        <PhoneCall className="w-4 h-4" />
        Être rappelé
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={reset}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={reset}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            {done ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Demande envoyée
                </h3>
                <p className="text-sm text-gray-600 mb-5">
                  {proNom} sera prévenu et vous rappellera dès que possible au numéro indiqué.
                </p>
                <button
                  onClick={reset}
                  className="bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-2 rounded-xl transition"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Être rappelé par {proNom}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Laissez vos coordonnées, le professionnel vous rappellera.
                </p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Honeypot anti-bot */}
                  <input
                    type="text"
                    name="company"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    style={{
                      position: "absolute",
                      left: "-9999px",
                      width: 1,
                      height: 1,
                    }}
                    aria-hidden="true"
                  />
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Votre nom
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={20}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quand voulez-vous être rappelé ?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { v: "asap", l: "Dès que possible" },
                          { v: "matin", l: "Matin" },
                          { v: "apres-midi", l: "Après-midi" },
                          { v: "soir", l: "Soir" },
                        ] as { v: Slot; l: string }[]
                      ).map((opt) => (
                        <label
                          key={opt.v}
                          className={`text-sm px-3 py-2 rounded-lg border cursor-pointer transition ${
                            slot === opt.v
                              ? "bg-[#0066CC] text-white border-[#0066CC]"
                              : "bg-white text-gray-700 border-gray-300 hover:border-[#0066CC]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="slot"
                            value={opt.v}
                            checked={slot === opt.v}
                            onChange={() => setSlot(opt.v)}
                            className="sr-only"
                          />
                          {opt.l}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Message (optionnel)
                    </label>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Trajet, horaire, type de transport…"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066CC] focus:border-transparent resize-none"
                    />
                  </div>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition"
                  >
                    {submitting ? "Envoi…" : "Demander à être rappelé"}
                  </button>
                  <p className="text-[11px] text-gray-500 text-center">
                    Vos coordonnées sont transmises uniquement au professionnel.
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
