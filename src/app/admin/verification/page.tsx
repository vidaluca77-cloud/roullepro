'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import VerificationBadge from '@/components/VerificationBadge';
import { CheckCircle2, XCircle, FileText, ExternalLink, Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  company_name: string | null;
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
  const [loadingUrls, setLoadingUrls] = useState<Record<string, boolean>>({});

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Vérification correcte : colonne role, pas is_admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    await loadPendingProfiles();
  };

  const loadPendingProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, company_name, entreprise, siret, statut_verification, justificatif_url')
      .eq('statut_verification', 'en_attente')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data as Profile[]);
    }
    setLoading(false);
  };

  const updateStatus = async (profileId: string, newStatus: 'verifie' | 'refuse') => {
    const updates: Record<string, unknown> = { statut_verification: newStatus };
    // Si validé, mettre is_verified à true aussi
    if (newStatus === 'verifie') {
      updates.is_verified = true;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profileId);

    if (!error) {
      await loadPendingProfiles();
    }
  };

  /**
   * Génère une signed URL temporaire via l'API admin (bucket privé)
   * puis ouvre dans un nouvel onglet
   */
  const openJustificatif = async (profile: Profile) => {
    if (!profile.justificatif_url) return;

    setLoadingUrls(prev => ({ ...prev, [profile.id]: true }));

    try {
      const response = await fetch(
        `/api/admin/signed-url?path=${encodeURIComponent(profile.justificatif_url)}`
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Impossible de générer le lien');
        return;
      }

      const { signedUrl } = await response.json();
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch {
      alert('Erreur réseau. Réessayez.');
    } finally {
      setLoadingUrls(prev => ({ ...prev, [profile.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Demandes de vérification</h1>
          {profiles.length > 0 && (
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
              {profiles.length} en attente
            </span>
          )}
        </div>

        {profiles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-600">
            <CheckCircle2 size={48} className="mx-auto text-green-400 mb-3" />
            <p className="font-medium">Aucune demande en attente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map(profile => (
              <div key={profile.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {profile.full_name || 'Nom non renseigné'}
                      </h3>
                      <VerificationBadge status={profile.statut_verification} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium text-gray-700">Email : </span>
                        {profile.email}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Entreprise : </span>
                        {profile.company_name || profile.entreprise || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">SIRET : </span>
                        {profile.siret || 'N/A'}
                      </div>
                    </div>

                    {profile.justificatif_url ? (
                      <button
                        onClick={() => openJustificatif(profile)}
                        disabled={loadingUrls[profile.id]}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-60"
                      >
                        {loadingUrls[profile.id] ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <FileText size={16} />
                        )}
                        Voir le justificatif
                        <ExternalLink size={14} />
                      </button>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Aucun justificatif joint</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateStatus(profile.id, 'verifie')}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                    >
                      <CheckCircle2 size={16} />
                      Valider
                    </button>
                    <button
                      onClick={() => updateStatus(profile.id, 'refuse')}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                    >
                      <XCircle size={16} />
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
