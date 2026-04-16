'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import VerificationBadge from '@/components/VerificationBadge';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

type VerificationStatus = 'non_verifie' | 'en_attente' | 'verifie' | 'refuse';

interface VerificationSectionProps {
  userId: string;
  currentStatus: VerificationStatus;
  justificatifUrl: string | null;
  onStatusChange: () => void;
}

export default function VerificationSection({
  userId,
  currentStatus,
  justificatifUrl,
  onStatusChange
}: VerificationSectionProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('justificatifs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('justificatifs')
        .getPublicUrl(fileName);

      await handleVerificationRequest(publicUrl);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleVerificationRequest = async (fileUrl: string) => {
    setRequesting(true);
    try {
      const res = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ justificatif_url: fileUrl })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setMessage('Demande de vérification envoyée avec succès !');
      onStatusChange();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la demande');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">État de vérification</h2>
        <VerificationBadge status={currentStatus} />
      </div>

      {currentStatus === 'non_verifie' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex gap-3 mb-4">
            <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-blue-900 font-medium mb-2">
                Obtenez un badge vérifié pour votre compte
              </p>
              <p className="text-sm text-blue-700">
                Uploadez un justificatif d'identité ou Kbis pour demander la vérification de votre profil professionnel.
              </p>
            </div>
          </div>
          <label className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition">
            <Upload size={18} />
            {uploading ? 'Upload en cours...' : 'Uploader un justificatif'}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {currentStatus === 'en_attente' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex gap-3">
            <FileText className="text-yellow-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-yellow-900 font-medium mb-2">
                Demande en cours de traitement
              </p>
              <p className="text-sm text-yellow-700">
                Notre équipe examine votre justificatif. Vous recevrez une réponse sous 48h.
              </p>
            </div>
          </div>
        </div>
      )}

      {currentStatus === 'verifie' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-green-900 font-medium mb-2">
                Profil vérifié
              </p>
              <p className="text-sm text-green-700">
                Votre compte est vérifié. Le badge apparait sur vos annonces et votre profil.
              </p>
            </div>
          </div>
        </div>
      )}

      {currentStatus === 'refuse' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex gap-3 mb-4">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-red-900 font-medium mb-2">
                Vérification refusée
              </p>
              <p className="text-sm text-red-700 mb-4">
                Le justificatif fourni n'a pas pu être validé. Vous pouvez soumettre un nouveau document.
              </p>
            </div>
          </div>
          <label className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg cursor-pointer transition">
            <Upload size={18} />
            {uploading ? 'Upload en cours...' : 'Uploader un nouveau justificatif'}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {message}
        </div>
      )}
    </div>
  );
}
