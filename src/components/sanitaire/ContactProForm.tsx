"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

export default function ContactProForm({ proId, proNom }: { proId: string; proNom: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
          content: content.trim(),
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
        <div className="font-semibold text-gray-900 mb-1">Message envoyé</div>
        <p className="text-sm text-gray-600">
          {proNom} a été notifié. Une réponse vous parviendra par email à l'adresse renseignée.
        </p>
        {warning && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
            {warning}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Votre nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#0066CC] focus:ring-2 focus:ring-blue-100 outline-none transition"
        />
        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#0066CC] focus:ring-2 focus:ring-blue-100 outline-none transition"
        />
      </div>
      <input
        type="tel"
        placeholder="Votre téléphone (facultatif)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#0066CC] focus:ring-2 focus:ring-blue-100 outline-none transition"
      />
      <textarea
        placeholder="Votre demande (date du transport souhaité, adresse de départ et d'arrivée, précisions médicales si utiles)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        minLength={20}
        rows={5}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#0066CC] focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
      />
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-xl transition"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Envoyer le message
      </button>
      <p className="text-xs text-gray-500 text-center">
        Vos coordonnées ne sont partagées qu'avec {proNom}. Aucune publicité, jamais revendues.
      </p>
    </form>
  );
}
