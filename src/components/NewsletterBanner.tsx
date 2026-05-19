"use client";

/**
 * Bandeau bas sticky proposant l'inscription à la newsletter + veille réglementaire.
 *
 * Comportement :
 *  - Affichage 3 secondes après le chargement de la page
 *  - Caché sur les routes admin / dashboard pro / compte / auth
 *  - Caché si déjà fermé dans les 30 derniers jours (localStorage)
 *  - Caché définitivement après soumission réussie
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "rp_newsletter_banner_dismissed_at";
const DISMISS_DAYS = 30;

const EXCLUDED_PATH_PREFIXES = [
  "/admin",
  "/dashboard",
  "/compte",
  "/login",
  "/auth",
  "/inscription",
  "/connexion",
  "/transport-medical/pro/reclamer",
  "/api/",
];

export default function NewsletterBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [regOptin, setRegOptin] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isExcludedRoute =
    !!pathname &&
    EXCLUDED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    if (isExcludedRoute) return;

    try {
      const dismissedAt = window.localStorage.getItem(STORAGE_KEY);
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt, 10);
        if (!Number.isNaN(dismissedTime)) {
          const elapsedDays =
            (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
          if (elapsedDays < DISMISS_DAYS) return;
        }
      }
    } catch {
      // localStorage inaccessible : on affiche quand même
    }

    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [isExcludedRoute, pathname]);

  const handleDismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email invalide");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "sticky_banner",
          reg_newsletter_optin: regOptin,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Une erreur est survenue");
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, Date.now().toString());
      } catch {
        // ignore
      }
      setTimeout(() => setVisible(false), 4000);
    } catch {
      setError("Erreur réseau, réessayez plus tard");
    } finally {
      setSubmitting(false);
    }
  };

  if (isExcludedRoute || !visible) return null;

  return (
    <div
      role="region"
      aria-label="Inscription newsletter"
      className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-2xl border-t border-slate-700"
      style={{ animation: "rpSlideUp 0.4s ease-out" }}
    >
      <style jsx>{`
        @keyframes rpSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        {success ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">✓</span>
              <div>
                <div className="font-semibold">Inscription confirmée</div>
                <div className="text-sm text-slate-300">
                  Vous recevrez nos prochains envois à {email}.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-2"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base leading-tight">
                Restez à jour sur la réglementation transport sanitaire
              </div>
              <div className="text-sm text-slate-300 mt-1">
                Nos derniers articles + la veille réglementaire hebdo. Gratuit, désinscription en 1 clic.
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-stretch">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.fr"
                className="px-3 py-2 rounded-md text-slate-900 bg-white text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={submitting}
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-md font-semibold text-sm whitespace-nowrap transition-colors"
              >
                {submitting ? "Envoi…" : "M'inscrire"}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white px-2 self-center text-2xl leading-none sm:ml-1"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
          </form>
        )}
        {error && !success && (
          <div className="mt-2 text-sm text-red-300" role="alert">
            {error}
          </div>
        )}
        {!success && (
          <label className="flex items-center gap-2 text-xs text-slate-400 mt-2">
            <input
              type="checkbox"
              checked={regOptin}
              onChange={(e) => setRegOptin(e.target.checked)}
              className="rounded"
            />
            Inclure la veille réglementaire hebdomadaire. Vos données ne sont pas partagées.
          </label>
        )}
      </div>
    </div>
  );
}
