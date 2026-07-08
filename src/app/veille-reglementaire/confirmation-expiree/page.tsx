import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Lien expiré",
  description: "Le lien de confirmation est expiré ou invalide.",
  robots: { index: false, follow: false },
};

export default function ConfirmationExpireePage() {
  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-700 mb-5">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Lien expiré ou invalide
          </h1>
          <p className="text-slate-700 text-lg mb-2">
            Ce lien de confirmation n&apos;est plus valable.
          </p>
          <p className="text-slate-600 mb-8">
            Les liens de confirmation expirent au bout de 72 heures pour des raisons de sécurité. Réinscrivez-vous pour en recevoir un nouveau.
          </p>
          <Link
            href="/veille-reglementaire"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Recommencer l&apos;inscription
          </Link>
        </div>
      </div>
    </main>
  );
}
