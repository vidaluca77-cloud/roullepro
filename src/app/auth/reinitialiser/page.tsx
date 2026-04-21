"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Truck, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function ReinitialiserPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [noSession, setNoSession] = useState(false);

  useEffect(() => {
    // Au chargement de la page depuis le lien email, Supabase cree automatiquement
    // une session de recuperation (via le hash #access_token). On attend qu'elle soit prete.
    let cancelled = false;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        setSessionReady(true);
      } else {
        // Laisse une chance au listener onAuthStateChange de mettre la session en place
        setTimeout(async () => {
          if (cancelled) return;
          const { data: d2 } = await supabase.auth.getSession();
          if (d2.session) setSessionReady(true);
          else setNoSession(true);
        }, 1500);
      }
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !cancelled) setSessionReady(true);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 2500);
      }
    } catch {
      setError("Erreur lors de la mise a jour. Reessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center gap-2 mb-2">
            <Truck className="text-blue-600" size={32} />
            <span className="text-2xl font-bold text-blue-600">RoullePro</span>
          </div>
          <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
          <p className="text-sm text-slate-500 mt-2">
            Choisissez un mot de passe sécurisé (8 caractères minimum).
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Mot de passe mis à jour</h2>
            <p className="text-sm text-slate-600 mb-5">
              Redirection vers votre tableau de bord...
            </p>
          </div>
        ) : noSession ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Lien invalide ou expiré</h2>
            <p className="text-sm text-slate-600 mb-5">
              Le lien de réinitialisation n'est plus valide. Demandez un nouveau lien.
            </p>
            <Link
              href="/auth/mot-de-passe-oublie"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm"
            >
              Demander un nouveau lien
            </Link>
          </div>
        ) : !sessionReady ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-slate-500 text-sm">
            Vérification du lien...
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex gap-2 items-center">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl shadow-sm p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full border rounded-lg px-3 py-2 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPwd ? "Masquer" : "Afficher"}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  type={showPwd ? "text" : "password"}
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  required
                  minLength={8}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Mise à jour..." : "Valider le nouveau mot de passe"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
