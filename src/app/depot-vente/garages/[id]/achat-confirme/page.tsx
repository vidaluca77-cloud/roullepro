import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Achat confirme | RoullePro",
  robots: { index: false, follow: false },
};

export default function AchatConfirmePage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-4 py-16">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-sm border border-green-100 p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-600">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Paiement confirme</h1>
        <p className="text-slate-700 mb-6">
          Votre paiement a bien ete recu par RoullePro. Les fonds sont conserves en sequestre
          jusqu'a la remise physique du vehicule.
        </p>

        <div className="bg-slate-50 rounded-xl p-6 text-left space-y-3 mb-6">
          <h2 className="font-bold text-slate-900">Prochaines etapes</h2>
          <ol className="list-decimal list-inside text-sm text-slate-700 space-y-2">
            <li>Notre equipe vous contacte sous 24h ouvrees pour organiser la remise du vehicule.</li>
            <li>Le garage partenaire vous communique l'adresse exacte de retrait et un creneau de RDV.</li>
            <li>Lors de la remise, vous recevez les cles, la carte grise barree, et le certificat de cession.</li>
            <li>Une fois la remise confirmee, les fonds sont reverses au vendeur et au garage sous 7 jours ouvres.</li>
          </ol>
        </div>

        <div className="text-xs text-slate-500 mb-6">
          {searchParams.session_id && (
            <span className="font-mono">Reference : {searchParams.session_id.substring(0, 20)}...</span>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Nous contacter
          </Link>
          <Link
            href="/depot-vente"
            className="inline-flex items-center justify-center px-6 py-3 bg-white border border-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Retour
          </Link>
        </div>
      </div>
    </div>
  );
}
