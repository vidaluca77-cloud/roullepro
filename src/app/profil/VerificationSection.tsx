'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import VerificationBadge from '@/components/VerificationBadge';
import {
  Upload, FileText, AlertCircle, CheckCircle2,
  Loader2, Search, Building2, MapPin, ShieldCheck
} from 'lucide-react';

interface VerificationSectionProps {
  userId: string;
  isVerified: boolean;
  statut: string;
  siret: string;
  companyName: string;
  onStatusChange: () => void;
}

interface SiretResult {
  valid: boolean;
  active?: boolean | null;
  nom?: string | null;
  adresse?: string | null;
  error?: string;
  fallback?: boolean;
}

export default function VerificationSection({
  userId,
  isVerified,
  statut,
  siret: initialSiret,
  companyName: initialCompanyName,
  onStatusChange,
}: VerificationSectionProps) {
  const supabase = createClient();

  // Champs SIRET
  const [siret, setSiret] = useState(initialSiret || '');
  const [siretChecking, setSiretChecking] = useState(false);
  const [siretResult, setSiretResult] = useState<SiretResult | null>(null);

  // Upload
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const formatSiret = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    // Format : XXX XXX XXX XXXXX
    return digits
      .replace(/(\d{3})(\d{3})(\d{3})(\d{0,5})/, (_, a, b, c, d) =>
        [a, b, c, d].filter(Boolean).join(' ')
      )
      .trim();
  };

  const handleSiretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSiret(formatSiret(e.target.value));
    setSiretResult(null);
  };

  const verifySiret = async () => {
    const cleaned = siret.replace(/\s/g, '');
    if (cleaned.length !== 14) {
      setSiretResult({ valid: false, error: 'Le SIRET doit contenir 14 chiffres' });
      return;
    }
    setSiretChecking(true);
    setSiretResult(null);
    try {
      const res = await fetch(`/api/siret?numero=${cleaned}`);
      const data: SiretResult = await res.json();
      setSiretResult(data);

      // Sauvegarde le SIRET en DB si valide
      if (data.valid) {
        await supabase
          .from('profiles')
          .update({
            siret: cleaned,
            ...(data.nom && !initialCompanyName ? { company_name: data.nom } : {}),
          })
          .eq('id', userId);
        onStatusChange();
      }
    } catch {
      setSiretResult({ valid: false, error: 'Erreur réseau, veuillez réessayer' });
    } finally {
      setSiretChecking(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format non accepté. Utilisez PDF, JPG ou PNG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 5 MB).');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          justificatif_url: filePath,
          statut_verification: 'en_attente',
          date_verification: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      setMessage('Document envoyé. Votre demande est en cours de traitement (24-48h).');
      onStatusChange();
    } catch (err: any) {
      setError(err.message || 'Erreur lors du téléversement');
    } finally {
      setUploading(false);
    }
  };

  const currentStatut = (statut as any) || 'non_verifie';

  return (
    <div className="mt-8 border-t pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <ShieldCheck size={20} className="text-blue-600" />
          Vérification professionnelle
        </h2>
        <VerificationBadge status={currentStatut} />
      </div>

      {/* Statut : déjà vérifié */}
      {isVerified && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
          <CheckCircle2 size={22} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">Compte professionnel vérifié</p>
            <p className="text-sm text-green-700 mt-1">
              Votre badge vérifié est visible sur vos annonces et votre profil public.
            </p>
          </div>
        </div>
      )}

      {/* Statut : en attente */}
      {!isVerified && currentStatut === 'en_attente' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
          <Loader2 size={20} className="text-amber-600 flex-shrink-0 mt-0.5 animate-spin" />
          <div>
            <p className="font-medium text-amber-800">Demande en cours de traitement</p>
            <p className="text-sm text-amber-700 mt-1">
              Notre équipe examine votre dossier sous 24-48h. Vous recevrez un email de confirmation.
            </p>
          </div>
        </div>
      )}

      {/* Statut : refusé */}
      {!isVerified && currentStatut === 'refuse' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Demande refusée</p>
            <p className="text-sm text-red-700 mt-1">
              Votre document n'a pas pu être validé. Vous pouvez soumettre un nouveau justificatif ci-dessous.
            </p>
          </div>
        </div>
      )}

      {/* Étape 1 : SIRET */}
      {!isVerified && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-medium text-gray-800 mb-1 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Vérifier votre numéro SIRET
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Renseignez votre SIRET pour vérification automatique dans le registre national des entreprises.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={siret}
              onChange={handleSiretChange}
              placeholder="XXX XXX XXX XXXXX"
              maxLength={17}
              className="flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-mono tracking-wider"
            />
            <button
              onClick={verifySiret}
              disabled={siretChecking || siret.replace(/\s/g, '').length !== 14}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {siretChecking ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              Vérifier
            </button>
          </div>

          {/* Résultat SIRET */}
          {siretResult && (
            <div className={`mt-3 rounded-lg p-4 text-sm ${
              siretResult.valid
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              {siretResult.valid ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium text-green-800">
                    <CheckCircle2 size={16} />
                    SIRET valide
                    {siretResult.active === false && (
                      <span className="text-amber-600 font-normal">(établissement fermé)</span>
                    )}
                    {siretResult.fallback && (
                      <span className="text-gray-500 font-normal text-xs">(registre indisponible)</span>
                    )}
                  </div>
                  {siretResult.nom && (
                    <div className="flex items-center gap-2 text-green-700">
                      <Building2 size={14} />
                      {siretResult.nom}
                    </div>
                  )}
                  {siretResult.adresse && (
                    <div className="flex items-center gap-2 text-green-700">
                      <MapPin size={14} />
                      {siretResult.adresse}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-2 text-red-700">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  {siretResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Étape 2 : Document justificatif */}
      {!isVerified && currentStatut !== 'en_attente' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-medium text-gray-800 mb-1 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            Joindre un justificatif
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Téléversez un extrait KBIS, une attestation d'immatriculation ou tout document officiel
            prouvant votre activité professionnelle. <span className="font-medium">PDF, JPG ou PNG · Max 5 MB</span>
          </p>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <label className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg cursor-pointer transition font-medium text-sm ${
            uploading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}>
            {uploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}
            {uploading ? 'Téléversement en cours...' : 'Téléverser un document'}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
