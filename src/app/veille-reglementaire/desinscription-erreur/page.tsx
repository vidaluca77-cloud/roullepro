import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Token invalide — Veille RoullePro",
  description: "Le token de désinscription est invalide.",
  robots: { index: false, follow: false },
};

export default function DesinscriptionErreurPage() {
  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-700 mb-5">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Token invalide
          </h1>
          <p className="text-slate-700 text-lg mb-2">
            Le lien de désinscription n&apos;a pas pu être validé.
          </p>
          <p className="text-slate-600 mb-8">
            Si le problème persiste, contactez-nous et nous procéderons à votre désinscription manuellement.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            <Mail className="h-4 w-4" />
            Nous contacter
          </Link>
        </div>
      </div>
    </main>
  );
}
