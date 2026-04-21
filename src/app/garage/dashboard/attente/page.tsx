import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';

export default function GarageDashboardAttentePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-16">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock size={32} className="text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Candidature en cours d'examen</h1>
        <p className="text-slate-500 text-sm mb-8">
          Votre dossier est en cours d'examen par notre équipe. Vous recevrez un email de confirmation
          dès que votre compte sera activé, sous <strong>48 heures ouvrées</strong>.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition text-sm"
        >
          Retour à l'accueil
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
