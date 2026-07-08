import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Désinscription confirmée",
  description: "Vous êtes désinscrit de la veille réglementaire RoullePro.",
  robots: { index: false, follow: false },
};

export default function DesinscriptionOkPage() {
  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-700 mb-5">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Vous êtes désinscrit
          </h1>
          <p className="text-slate-700 text-lg mb-2">
            Aucun email de veille ne vous sera plus envoyé.
          </p>
          <p className="text-slate-500 mb-8">
            Si vous changez d&apos;avis, vous pourrez vous réinscrire à tout moment depuis la page veille.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 transition"
          >
            <Home className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
