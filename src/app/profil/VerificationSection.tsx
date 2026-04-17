'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import VerificationBadge from '@/components/VerificationBadge';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface VerificationSectionProps {
  userId: string;
  isVerified: boolean;
  onStatusChange: () => void;
}

export default function VerificationSection({
  userId,
  isVerified,
  onStatusChange
}: VerificationSectionProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format non accepté. Utilisez PDF, JPG ou PNG.');
      return;
    }

    // Validation taille (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 5 MB).');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      // Chemin structuré : userId/timestamp.ext (bucket privé)
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      // Stocker le chemin relatif (pas d'URL publique — bucket privé)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          justificatif_url: filePath,
          statut_verification: 'en_attente',
          date_verification: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      setMessage('Document envoyé avec succès. Votre demande est en cours de vérification.');
      onStatusChange();
    } catch (err: any) {
      setError(err.message || 'Erreur lors du téléversement');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Vérification du compte</h2>
        <VerificationBadge status={isVerified ? 'verifie' : 'non_verifie'} />
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {!isVerified && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
            <FileText size={18} />
            Faites vérifier votre compte professionnel
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            Téléversez un justificatif (KBIS, extrait d'immatriculation) pour obtenir le badge vérifié.
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition">
            <Upload size={18} />
            {uploading ? 'Téléversement...' : 'Téléverser un document'}
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

      {isVerified && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-green-700 font-medium">
            ✓ Votre compte est vérifié
          </p>
        </div>
      )}
    </div>
  );
}
