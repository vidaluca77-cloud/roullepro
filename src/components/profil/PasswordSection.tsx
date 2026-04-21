"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function PasswordSection() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (newPwd.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caracteres.");
      return;
    }
    if (newPwd !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: newPwd });
      if (err) {
        setError(err.message);
      } else {
        setSuccess(true);
        setNewPwd("");
        setConfirm("");
        setTimeout(() => {
          setSuccess(false);
          setOpen(false);
        }, 2500);
      }
    } catch {
      setError("Erreur. Reessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-200">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock size={18} /> Mot de passe
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Modifiez votre mot de passe de connexion à tout moment.
          </p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition"
          >
            Modifier
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="space-y-3 bg-slate-50 rounded-xl p-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} /> Mot de passe mis à jour
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                required
                minLength={8}
                className="w-full border rounded-lg px-3 py-2 pr-10 text-sm bg-white"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={show ? "Masquer" : "Afficher"}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer</label>
            <input
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50"
            >
              {loading ? "Mise à jour..." : "Valider"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError("");
                setNewPwd("");
                setConfirm("");
              }}
              className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 text-sm hover:bg-white"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
