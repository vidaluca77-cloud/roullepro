"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Truck, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function MotDePasseOubliePage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/reinitialiser`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (err) {
        setError(err.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Erreur de connexion. Reessayez.");
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
          <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
          <p className="text-sm text-slate-500 mt-2">
            Renseignez votre email, nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Email envoyé</h2>
            <p className="text-sm text-slate-600 mb-5">
              Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de
              réinitialisation dans quelques minutes. Pensez à vérifier vos spams.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:underline"
            >
              <ArrowLeft size={16} /> Retour à la connexion
            </Link>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.fr"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline"
              >
                <ArrowLeft size={14} /> Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
