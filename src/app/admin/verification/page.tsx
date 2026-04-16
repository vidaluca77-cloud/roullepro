'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import VerificationBadge from '@/components/VerificationBadge';
import { CheckCircle2, XCircle, FileText, ExternalLink } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  entreprise: string | null;
  siret: string | null;
  statut_verification: 'non_verifie' | 'en_attente' | 'verifie' | 'refuse';
  justificatif_url: string | null;
}

export default function AdminVerificationPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      router.push('/dashboard');
      return;
    }

    setIsAdmin(true);
    await loadPendingProfiles();
  };

  const loadPendingProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, entreprise, siret, statut_verification, justificatif_url')
      .eq('statut_verification', 'en_attente')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data as Profile[]);
    }
    setLoading(false);
  };

  const updateStatus = async (profileId: string, newStatus: 'verifie' | 'refuse') => {
    const { error } = await supabase
      .from('profiles')
      .update({ statut_verification: newStatus })
      .eq('id', profileId);

    if (!error) {
      await loadPendingProfiles();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Demandes de vérification</h1>
        
        {profiles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-600">
            Aucune demande en attente
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map(profile => (
              <div key={profile.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {profile.full_name || 'Nom non renseigné'}
                      </h3>
                      <VerificationBadge status={profile.statut_verification} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Email:</span> {profile.email}
                      </div>
                      <div>
                        <span className="font-medium">Entreprise:</span> {profile.entreprise || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">SIRET:</span> {profile.siret || 'N/A'}
                      </div>
                    </div>
                    {profile.justificatif_url && (
                      <a
                        href={profile.justificatif_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <FileText size={16} />
                        Voir le justificatif
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(profile.id, 'verifie')}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      <CheckCircle2 size={18} />
                      Valider
                    </button>
                    <button
                      onClick={() => updateStatus(profile.id, 'refuse')}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      <XCircle size={18} />
                      Refuser
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
