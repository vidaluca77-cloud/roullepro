"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Loader2, CheckCircle2 } from "lucide-react";

type Props = {
  proId: string;
  proNom: string;
  telephonePublic: string | null;
  emailPublic: string | null;
};

export default function ReclamerForm({ proId, proNom, telephonePublic, emailPublic }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"choose" | "send" | "verify" | "done">("choose");
  const [method, setMethod] = useState<"email_domaine" | "sms">("email_domaine");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [claimId, setClaimId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/sanitaire/claim/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pro_id: proId, method, contact: contact.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setClaimId(data.claim_id);
      setStep("verify");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/sanitaire/claim/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_id: claimId, code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Code invalide");
      setStep("done");
      setTimeout(() => {
        router.push("/transport-medical/pro/dashboard");
      }, 1500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <div className="font-bold text-gray-900 mb-2">Fiche réclamée avec succès</div>
        <p className="text-sm text-gray-600">Redirection vers votre espace pro…</p>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <form onSubmit={verifyCode} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Entrez le code reçu</h3>
          <p className="text-sm text-gray-600">
            Un code à 6 chiffres vous a été envoyé par {method === "email_domaine" ? "email" : "SMS"} à {contact}.
          </p>
        </div>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:border-[#0066CC] focus:ring-2 focus:ring-blue-100 outline-none"
          required
        />
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-xl transition"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Vérifier le code
        </button>
        <button
          type="button"
          onClick={() => setStep("choose")}
          className="w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Utiliser une autre méthode
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
      <h3 className="font-semibold text-gray-900 mb-2">Comment souhaitez-vous prouver que vous êtes le gérant ?</h3>

      <div className="space-y-3">
        <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${method === "email_domaine" ? "border-[#0066CC] bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
          <input
            type="radio"
            name="method"
            checked={method === "email_domaine"}
            onChange={() => setMethod("email_domaine")}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              <Mail className="w-4 h-4" />
              Email professionnel
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Recevez un code à l'adresse email de votre entreprise.
              {emailPublic && <span className="block mt-1 text-xs text-gray-500">Email enregistré : {emailPublic}</span>}
            </p>
          </div>
        </label>

        <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${method === "sms" ? "border-[#0066CC] bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
          <input
            type="radio"
            name="method"
            checked={method === "sms"}
            onChange={() => setMethod("sms")}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              <Phone className="w-4 h-4" />
              SMS sur le numéro public
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Recevez un code au numéro public de l'entreprise.
              {telephonePublic && <span className="block mt-1 text-xs text-gray-500">Numéro enregistré : {telephonePublic}</span>}
            </p>
          </div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {method === "email_domaine" ? "Votre email professionnel" : "Votre numéro de téléphone (avec indicatif)"}
        </label>
        <input
          type={method === "email_domaine" ? "email" : "tel"}
          placeholder={method === "email_domaine" ? "contact@votre-entreprise.fr" : "+33 6 12 34 56 78"}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#0066CC] focus:ring-2 focus:ring-blue-100 outline-none transition"
          required
        />
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-xl transition"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Envoyer le code de vérification
      </button>
    </form>
  );
}
