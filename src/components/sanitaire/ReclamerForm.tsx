"use client";

import { useState } from "react";
import { Mail, Phone, Loader2, CheckCircle2, LogIn } from "lucide-react";

type Props = {
  proId: string;
  proNom: string;
  telephonePublic: string | null;
  emailPublic: string | null;
};

// Masque une adresse email pour l'affichage public : jean.dupont@exemple.fr -> j***@exemple.fr
function maskEmail(email: string | null): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const head = local.slice(0, 1);
  return `${head}***@${domain}`;
}

export default function ReclamerForm({ proId, proNom, telephonePublic, emailPublic }: Props) {
  const [step, setStep] = useState<"choose" | "send" | "verify" | "done">("choose");
  const [method, setMethod] = useState<"email_domaine" | "sms">("email_domaine");
  const [code, setCode] = useState("");
  const [claimId, setClaimId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maskedEmail = maskEmail(emailPublic);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // SÉCURITÉ : on n'envoie plus d'adresse de destination. Le serveur envoie le code
      // exclusivement à l'email officiel de la fiche.
      const res = await fetch("/api/sanitaire/claim/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pro_id: proId, method }),
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
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="bg-white border border-green-200 rounded-2xl p-6 space-y-5">
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <div className="font-bold text-gray-900 mb-1">Réclamation enregistrée</div>
          <p className="text-sm text-gray-600">Votre demande est <strong>en attente de validation</strong> par notre équipe (sous 24h ouvrées).</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
          Un email contenant vos identifiants et un lien de connexion vient d&apos;être envoyé à l&apos;adresse officielle de la fiche
          {maskedEmail && <strong> ({maskedEmail})</strong>}. Ouvrez cet email pour accéder à votre espace pro. Si vous ne le recevez pas, utilisez &laquo; Mot de passe oublié &raquo; sur la page de connexion.
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

        <a
          href="/auth/login?next=/transport-medical/pro/dashboard?welcome=1"
          className="w-full inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-3 rounded-xl transition"
        >
          <LogIn className="w-4 h-4" />
          Aller à la page de connexion
        </a>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <form onSubmit={verifyCode} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Entrez le code reçu</h3>
          <p className="text-sm text-gray-600">
            Un code à 6 chiffres a été envoyé par {method === "email_domaine" ? "email" : "SMS"} à l&apos;adresse officielle de la fiche{maskedEmail ? ` (${maskedEmail})` : ""}.
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
          Valider ma réclamation
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
              Vérification par email
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Un code de vérification est envoyé à l&apos;adresse email officielle enregistrée sur la fiche. Vous devez avoir accès à cette boîte mail. Validation manuelle ensuite par notre équipe.
              {maskedEmail && <span className="block mt-1 text-xs text-gray-500">Email officiel de la fiche : {maskedEmail}</span>}
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 border-2 border-gray-100 bg-gray-50 rounded-xl cursor-not-allowed opacity-60">
          <input type="radio" name="method" disabled className="mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2 font-semibold text-gray-500">
              <Phone className="w-4 h-4" />
              SMS sur le numéro public
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">Bientôt</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Pour l'instant, utilisez l'email professionnel de votre entreprise.
              {telephonePublic && <span className="block mt-1 text-xs text-gray-400">Numéro enregistré : {telephonePublic}</span>}
            </p>
          </div>
        </label>
      </div>

      {maskedEmail ? (
        <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          Le code sera envoyé à l&apos;adresse officielle de la fiche : <strong>{maskedEmail}</strong>.
          Vous devez avoir accès à cette boîte mail pour réclamer la fiche.
        </div>
      ) : (
        <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Aucun email de contact n&apos;est enregistré sur cette fiche. Contactez le support à contact@roullepro.com pour la réclamer.
        </div>
      )}

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <button
        type="submit"
        disabled={loading || !emailPublic}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-xl transition"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Envoyer le code de vérification
      </button>
    </form>
  );
}
