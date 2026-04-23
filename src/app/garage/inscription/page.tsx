'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { trackInscriptionGarage } from '@/lib/google-ads-conversions';

const SPECIALITES_OPTIONS = [
  'Utilitaires',
  'Poids lourds',
  'VTC-Taxi',
  'Frigorifique',
  'Electrique',
  'Autre',
];

export default function GarageInscriptionPage() {
  const [form, setForm] = useState({
    raison_sociale: '',
    siret: '',
    contact_nom: '',
    contact_email: '',
    contact_telephone: '',
    adresse: '',
    code_postal: '',
    ville: '',
    site_web: '',
    nb_places_parking: '',
    specialites: [] as string[],
    message_candidature: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const toggleSpec = (s: string) => {
    setForm((prev) => ({
      ...prev,
      specialites: prev.specialites.includes(s)
        ? prev.specialites.filter((x) => x !== s)
        : [...prev.specialites, s],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/garage/candidature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          nb_places_parking: form.nb_places_parking ? Number(form.nb_places_parking) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue. Réessayez.");
        return;
      }

      setSuccess(true);
      trackInscriptionGarage();
    } catch {
      setError("Erreur de connexion. Vérifiez votre réseau et réessayez.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Candidature envoyée !</h1>
          <p className="text-slate-500 text-sm mb-6">
            Nous avons bien reçu votre dossier. Notre équipe vous contactera sous <strong>48 heures ouvrées</strong>.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition text-sm"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Building2 size={14} /> Partenariat garage
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Devenez garage partenaire RoullePro
          </h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto">
            Rejoignez notre réseau de garages certifiés et recevez un flux régulier de véhicules professionnels en dépôt-vente.
          </p>
        </div>
      </section>

      {/* Bénéfices */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              title: "Flux de véhicules garanti",
              desc: "Recevez en dépôt des véhicules professionnels (VTC, ambulances, utilitaires) sans avoir à les acheter.",
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              title: "0 investissement initial",
              desc: "Pas de stock, pas de trésorerie immobilisée. Vous percevez 7% commission à la vente uniquement.",
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              title: "Visibilité nationale",
              desc: "Votre garage affiché sur RoullePro devant des milliers d'acheteurs et vendeurs professionnels.",
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
          ].map((b) => (
            <div key={b.title} className={`${b.bg} rounded-2xl p-6 border border-opacity-50`}>
              <h3 className={`font-bold text-lg mb-2 ${b.color}`}>{b.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Formulaire de candidature</h2>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>

            {/* Identification */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="raison_sociale" className="block text-sm font-medium text-slate-700 mb-1">
                  Raison sociale <span className="text-red-500">*</span>
                </label>
                <input
                  id="raison_sociale"
                  name="raison_sociale"
                  type="text"
                  required
                  value={form.raison_sociale}
                  onChange={handleChange}
                  placeholder="Garage Dupont SAS"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="siret" className="block text-sm font-medium text-slate-700 mb-1">
                  SIRET <span className="text-red-500">*</span>
                </label>
                <input
                  id="siret"
                  name="siret"
                  type="text"
                  required
                  maxLength={14}
                  pattern="\d{14}"
                  value={form.siret}
                  onChange={handleChange}
                  placeholder="12345678901234"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 font-mono"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid sm:grid-cols-3 gap-5">
              <div>
                <label htmlFor="contact_nom" className="block text-sm font-medium text-slate-700 mb-1">
                  Nom du contact
                </label>
                <input
                  id="contact_nom"
                  name="contact_nom"
                  type="text"
                  value={form.contact_nom}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email professionnel <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  required
                  value={form.contact_email}
                  onChange={handleChange}
                  placeholder="contact@garage.fr"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="contact_telephone" className="block text-sm font-medium text-slate-700 mb-1">
                  Téléphone
                </label>
                <input
                  id="contact_telephone"
                  name="contact_telephone"
                  type="tel"
                  value={form.contact_telephone}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Adresse */}
            <div className="grid sm:grid-cols-3 gap-5">
              <div className="sm:col-span-3">
                <label htmlFor="adresse" className="block text-sm font-medium text-slate-700 mb-1">
                  Adresse
                </label>
                <input
                  id="adresse"
                  name="adresse"
                  type="text"
                  value={form.adresse}
                  onChange={handleChange}
                  placeholder="15 rue de la Mécanique"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="code_postal" className="block text-sm font-medium text-slate-700 mb-1">
                  Code postal
                </label>
                <input
                  id="code_postal"
                  name="code_postal"
                  type="text"
                  value={form.code_postal}
                  onChange={handleChange}
                  placeholder="75001"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="ville" className="block text-sm font-medium text-slate-700 mb-1">
                  Ville
                </label>
                <input
                  id="ville"
                  name="ville"
                  type="text"
                  value={form.ville}
                  onChange={handleChange}
                  placeholder="Paris"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="nb_places_parking" className="block text-sm font-medium text-slate-700 mb-1">
                  Nb places parking
                </label>
                <input
                  id="nb_places_parking"
                  name="nb_places_parking"
                  type="number"
                  min="1"
                  value={form.nb_places_parking}
                  onChange={handleChange}
                  placeholder="10"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Site web */}
            <div>
              <label htmlFor="site_web" className="block text-sm font-medium text-slate-700 mb-1">
                Site web
              </label>
              <input
                id="site_web"
                name="site_web"
                type="url"
                value={form.site_web}
                onChange={handleChange}
                placeholder="https://www.garage-dupont.fr"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              />
            </div>

            {/* Spécialités */}
            <div>
              <fieldset>
                <legend className="text-sm font-medium text-slate-700 mb-3">
                  Spécialités véhicules
                </legend>
                <div className="flex flex-wrap gap-2">
                  {SPECIALITES_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpec(s)}
                      aria-pressed={form.specialites.includes(s)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition ${
                        form.specialites.includes(s)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message_candidature" className="block text-sm font-medium text-slate-700 mb-1">
                Message (optionnel)
              </label>
              <textarea
                id="message_candidature"
                name="message_candidature"
                rows={4}
                value={form.message_candidature}
                onChange={handleChange}
                placeholder="Présentez brièvement votre garage, votre expérience avec les véhicules professionnels..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 resize-none"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Envoi en cours...
                </span>
              ) : (
                <>
                  Envoyer ma candidature
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
