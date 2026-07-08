import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Inscription confirmée",
  description: "Votre inscription à la veille réglementaire RoullePro est confirmée.",
  robots: { index: false, follow: false },
};

export default function ConfirmationOkPage() {
  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-700 mb-5">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Inscription confirmée
          </h1>
          <p className="text-slate-700 text-lg mb-6">
            Vous recevrez la veille réglementaire tous les mardis matin.
          </p>
          <p className="text-sm text-slate-500 mb-8">
            Pas de spam, pas de pub. Désinscription en 1 clic à tout moment depuis n&apos;importe quel email reçu.
          </p>
          <Link
            href="/veille-reglementaire"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la veille
          </Link>
        </div>
      </div>
    </main>
  );
}
