"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Loader2, CheckCircle2, Copy, LogIn, Upload, FileCheck2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [accountEmail, setAccountEmail] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [autoConnecting, setAutoConnecting] = useState(false);
  const [justificatif, setJustificatif] = useState<File | null>(null);
  const [justificatifPath, setJustificatifPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const uploadJustificatif = async (file: File): Promise<string | null> => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("claim_id", claimId);
      const res = await fetch("/api/sanitaire/claim/upload-justificatif", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload impossible");
      return data.justificatif_path as string;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!justificatif && !justificatifPath) {
      setError("Ajoutez votre justificatif (KBIS ou agrément préfectoral) avant de valider.");
      return;
    }

    setLoading(true);
    try {
      // Upload du justificatif si pas encore fait
      let path = justificatifPath;
      if (!path && justificatif) {
        path = await uploadJustificatif(justificatif);
        if (!path) {
          setLoading(false);
          return;
        }
        setJustificatifPath(path);
      }

      const res = await fetch("/api/sanitaire/claim/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_id: claimId, code: code.trim(), justificatif_url: path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Code invalide");

      // Deconnecte toute session existante pour eviter les conflits de compte
      const supabase = createClient();
      try {
        await supabase.auth.signOut();
      } catch {}

      setAccountEmail(data.email || contact);
      setTempPassword(data.temp_password || null);
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const connectAuto = async () => {
    if (!accountEmail || !tempPassword) return;
    setAutoConnecting(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: accountEmail,
        password: tempPassword,
      });
      if (signErr) throw signErr;
      window.location.href = "/transport-medical/pro/dashboard?welcome=1";
    } catch (err) {
      setError((err as Error).message || "Connexion impossible");
      setAutoConnecting(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {}
  };

  if (step === "done") {
    return (
      <div className="bg-white border border-green-200 rounded-2xl p-6 space-y-5">
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <div className="font-bold text-gray-900 mb-1">Réclamation enregistrée</div>
          <p className="text-sm text-gray-600">Votre demande est <strong>en attente de validation</strong> par notre équipe (sous 24h ouvrées). En attendant, vous pouvez accéder à votre espace pro pour compléter votre fiche.</p>
        </div>

        {tempPassword ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Email</div>
              <div className="flex items-center justify-between gap-2 bg-white border border-blue-100 rounded-lg px-3 py-2">
                <span className="font-mono text-sm text-gray-900 break-all">{accountEmail}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(accountEmail, "email")}
                  className="shrink-0 text-blue-600 hover:text-blue-800 text-xs font-medium inline-flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedField === "email" ? "Copié" : "Copier"}
                </button>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Mot de passe temporaire</div>
              <div className="flex items-center justify-between gap-2 bg-white border border-blue-100 rounded-lg px-3 py-2">
                <span className="font-mono text-sm text-gray-900">{tempPassword}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(tempPassword, "pwd")}
                  className="shrink-0 text-blue-600 hover:text-blue-800 text-xs font-medium inline-flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedField === "pwd" ? "Copié" : "Copier"}
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              Ces identifiants vous sont aussi envoyés par email à {accountEmail}. Changez votre mot de passe après la première connexion.
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            Un email avec vos identifiants vient d&apos;être envoyé à {accountEmail}. Si vous ne le recevez pas, utilisez &laquo; Mot de passe oublié &raquo; sur la page de connexion.
          </div>
        )}

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

        {tempPassword ? (
          <button
            type="button"
            onClick={connectAuto}
            disabled={autoConnecting}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-xl transition"
          >
            {autoConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            Me connecter à mon espace pro
          </button>
        ) : (
          <a
            href={`/auth/login?next=/transport-medical/pro/dashboard?welcome=1&email=${encodeURIComponent(accountEmail)}`}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-3 rounded-xl transition"
          >
            <LogIn className="w-4 h-4" />
            Aller à la page de connexion
          </a>
        )}
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

        <div className="pt-2 border-t border-gray-100">
          <label className="block text-sm font-semibold text-gray-900 mb-1">Justificatif professionnel</label>
          <p className="text-xs text-gray-600 mb-3">
            Joignez votre <strong>KBIS</strong> (moins de 3 mois) ou votre <strong>agrément préfectoral de transport sanitaire</strong>. Le document doit mentionner votre nom et le SIRET de l&apos;entreprise. Il reste strictement confidentiel.
          </p>
          <label className={`flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition ${justificatif ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-[#0066CC] bg-gray-50"}`}>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                if (f && f.size > 10 * 1024 * 1024) {
                  setError("Fichier trop volumineux (max 10 Mo)");
                  return;
                }
                setError(null);
                setJustificatif(f);
                setJustificatifPath(null);
              }}
              className="hidden"
            />
            {justificatif ? (
              <>
                <FileCheck2 className="w-5 h-5 text-green-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{justificatif.name}</div>
                  <div className="text-xs text-gray-500">{(justificatif.size / 1024).toFixed(0)} Ko — Cliquer pour remplacer</div>
                </div>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">Choisir un fichier</div>
                  <div className="text-xs text-gray-500">PDF, JPG, PNG — 10 Mo max</div>
                </div>
              </>
            )}
          </label>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
        <button
          type="submit"
          disabled={loading || uploading || code.length !== 6 || !justificatif}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-xl transition"
        >
          {(loading || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
          {uploading ? "Envoi du justificatif…" : "Valider ma réclamation"}
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
