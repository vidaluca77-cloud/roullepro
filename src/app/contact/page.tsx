import { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Clock, AlertTriangle, UserCheck, MessageCircle } from 'lucide-react';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact — RoullePro',
  description:
    'Contactez l\'équipe RoullePro pour toute question, signalement ou demande de partenariat. Réponse sous 24h.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">

        {/* En-tête */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-4">
            <Mail className="text-blue-600" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Contactez-nous</h1>
          <p className="text-gray-500 text-base">
            Une question, un problème ou une suggestion ? Notre équipe est là pour vous aider.
          </p>
        </div>

        {/* Tri préalable : la plupart des demandes ont une réponse plus rapide via les pages dédiées */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8">
          <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
            Avant d'envoyer un message
          </h2>
          <p className="text-sm text-gray-700 mb-4">
            La plupart des demandes ont une réponse plus rapide via nos pages dédiées :
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href="/signaler"
              className="flex items-start gap-3 bg-white rounded-xl border border-blue-200 p-3 hover:border-[#0066CC] transition"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Erreur sur une fiche, demande de suppression
                </div>
                <div className="text-xs text-gray-600">Page de signalement → traité sous 72 h</div>
              </div>
            </Link>
            <Link
              href="/transport-medical/pro/reclamer"
              className="flex items-start gap-3 bg-white rounded-xl border border-blue-200 p-3 hover:border-[#0066CC] transition"
            >
              <UserCheck className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Vous êtes le professionnel concerné
                </div>
                <div className="text-xs text-gray-600">Réclamez votre fiche pour la modifier</div>
              </div>
            </Link>
          </div>
          <div className="flex items-start gap-2 mt-4 pt-4 border-t border-blue-200 text-xs text-gray-600">
            <MessageCircle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
            <span>
              Pour le reste, utilisez le formulaire ci-dessous. <strong>Délai standard : 72 heures ouvrées.</strong>{" "}
              Les messages concernant une fiche précise sont automatiquement réorientés vers la page{" "}
              <Link href="/signaler" className="underline hover:no-underline">signaler</Link>.
            </span>
          </div>
        </div>

        {/* Infos pratiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="text-blue-600" size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Email support</p>
              <p className="text-sm font-semibold text-gray-900">contact@roullepro.com</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="text-green-600" size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Temps de réponse</p>
              <p className="text-sm font-semibold text-gray-900">Sous 72h ouvrées</p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <ContactForm />

      </div>
    </div>
  );
}
