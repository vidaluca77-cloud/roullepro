import { Metadata } from 'next';
import { Mail, Clock } from 'lucide-react';
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
              <p className="text-sm font-semibold text-gray-900">Sous 24h ouvrées</p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <ContactForm />

      </div>
    </div>
  );
}
