'use client';
import { useState, FormEvent } from 'react';
import { Mail, Send } from 'lucide-react';

const SUBJECTS = [
  'Question générale',
  'Problème technique',
  'Signalement',
  'Partenariat',
  'Autre',
];

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const formData = new FormData(e.currentTarget);

    // Validation minimale côté client
    const message = formData.get('message') as string;
    if (message.trim().length < 20) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Mail className="text-green-600" size={24} />
          </div>
        </div>
        <p className="text-green-800 font-semibold text-lg mb-1">Message envoyé !</p>
        <p className="text-green-700 text-sm">
          Votre message a été envoyé. Nous vous répondrons sous 24h.
        </p>
      </div>
    );
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5"
    >
      {/* Champs cachés Netlify */}
      <input type="hidden" name="form-name" value="contact" />
      <input type="hidden" name="bot-field" className="hidden" />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          Une erreur est survenue. Vérifiez le formulaire et réessayez.
        </div>
      )}

      {/* Nom complet */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Nom complet <span className="text-red-500">*</span>
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          placeholder="Jean Dupont"
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* Email pro */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Email professionnel <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="jean.dupont@entreprise.fr"
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* Sujet */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
          Sujet
        </label>
        <select
          id="subject"
          name="subject"
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
          Message <span className="text-red-500">*</span>
          <span className="text-gray-400 font-normal ml-1">(min. 20 caractères)</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={20}
          rows={6}
          placeholder="Décrivez votre demande en détail..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
        />
      </div>

      {/* Bouton submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition text-sm"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Envoi en cours…
          </>
        ) : (
          <>
            <Send size={16} />
            Envoyer le message
          </>
        )}
      </button>
    </form>
  );
}
