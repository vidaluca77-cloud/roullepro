'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  FileText,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface AmeliRequest {
  id: string;
  pro_id: string;
  user_id: string | null;
  siret: string | null;
  numero_am: string | null;
  date_convention: string | null;
  proof_type: 'attestation_ameli' | 'contrat_conventionnement' | 'capture_compte_ameli' | 'autre';
  proof_file_url: string;
  proof_file_size_bytes: number | null;
  proof_mime: string | null;
  declaration_honneur: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'need_info' | 'spam';
  rejection_reason: string | null;
  admin_notes: string | null;
  created_at: string;
}

interface ProInfo {
  id: string;
  raison_sociale: string;
  nom_commercial: string | null;
  ville: string | null;
  ville_slug: string | null;
  categorie: string | null;
  slug: string | null;
  ameli_conventionne: boolean | null;
  ameli_source: string | null;
}

interface UserInfo {
  id: string;
  email: string | null;
  full_name: string | null;
}

interface RequestRow {
  request: AmeliRequest;
  pro: ProInfo | null;
  user: UserInfo | null;
}

const PROOF_TYPE_LABELS: Record<string, string> = {
  attestation_ameli: 'Attestation Ameli',
  contrat_conventionnement: 'Contrat de conventionnement',
  capture_compte_ameli: 'Capture compte ameli.fr',
  autre: 'Autre',
};

export default function AdminAmeliRequestsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loadingUrls, setLoadingUrls] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [reasonInputs, setReasonInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    void checkAdminAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdminAndLoad = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    await loadPending();
  };

  const loadPending = async () => {
    setLoading(true);

    const { data: reqs, error } = await supabase
      .from('ameli_badge_requests')
      .select('*')
      .in('status', ['pending', 'need_info'])
      .order('created_at', { ascending: true });

    if (error || !reqs) {
      setRows([]);
      setLoading(false);
      return;
    }

    const proIds = Array.from(new Set(reqs.map((r) => r.pro_id)));
    const userIds = Array.from(
      new Set(reqs.filter((r) => r.user_id).map((r) => r.user_id as string))
    );

    const [{ data: pros }, { data: users }] = await Promise.all([
      proIds.length
        ? supabase
            .from('pros_sanitaire')
            .select(
              'id, raison_sociale, nom_commercial, ville, ville_slug, categorie, slug, ameli_conventionne, ameli_source'
            )
            .in('id', proIds)
        : Promise.resolve({ data: [] as ProInfo[] }),
      userIds.length
        ? supabase
            .from('profiles')
            .select('id, email, full_name')
            .in('id', userIds)
        : Promise.resolve({ data: [] as UserInfo[] }),
    ]);

    const proMap = new Map<string, ProInfo>((pros || []).map((p) => [p.id, p as ProInfo]));
    const userMap = new Map<string, UserInfo>((users || []).map((u) => [u.id, u as UserInfo]));

    const enriched: RequestRow[] = (reqs as AmeliRequest[]).map((r) => ({
      request: r,
      pro: proMap.get(r.pro_id) || null,
      user: r.user_id ? userMap.get(r.user_id) || null : null,
    }));

    setRows(enriched);
    setLoading(false);
  };

  const openProof = async (req: AmeliRequest) => {
    if (!req.proof_file_url) return;
    setLoadingUrls((p) => ({ ...p, [req.id]: true }));
    try {
      const r = await fetch(
        `/api/admin/ameli-requests/signed-url?path=${encodeURIComponent(req.proof_file_url)}`
      );
      if (!r.ok) {
        const data = await r.json();
        alert(data.error || 'Impossible de générer le lien');
        return;
      }
      const { signedUrl } = await r.json();
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch {
      alert('Erreur réseau. Réessayez.');
    } finally {
      setLoadingUrls((p) => ({ ...p, [req.id]: false }));
    }
  };

  const decide = async (
    req: AmeliRequest,
    action: 'approve' | 'reject' | 'need_info' | 'spam'
  ) => {
    const needReason = action === 'reject' || action === 'need_info';
    const reason = (reasonInputs[req.id] || '').trim();
    if (needReason && !reason) {
      alert('Merci de saisir un motif.');
      return;
    }

    const confirmMsg =
      action === 'approve'
        ? 'Approuver cette demande et accorder le badge Ameli ?'
        : action === 'reject'
        ? 'Refuser cette demande ?'
        : action === 'need_info'
        ? 'Demander un complément d\'information ?'
        : 'Marquer cette demande comme spam (sans email) ?';

    if (!confirm(confirmMsg)) return;

    setActionLoading((p) => ({ ...p, [req.id]: true }));

    try {
      const r = await fetch(`/api/admin/ameli-requests/${req.id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reason: needReason ? reason : null,
          admin_notes: null,
        }),
      });

      if (!r.ok) {
        const data = await r.json();
        alert(data.error || 'Erreur lors de la décision');
        return;
      }

      await loadPending();
    } catch {
      alert('Erreur réseau. Réessayez.');
    } finally {
      setActionLoading((p) => ({ ...p, [req.id]: false }));
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
          <ShieldCheck className="text-emerald-600" size={28} />
          <h1 className="text-3xl font-bold text-gray-800">Demandes badge Ameli</h1>
          {rows.length > 0 && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {rows.length} à traiter
            </span>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-600">
            <CheckCircle2 size={48} className="mx-auto text-green-400 mb-3" />
            <p className="font-medium">Aucune demande en attente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map(({ request: req, pro, user }) => {
              const nomAffiche = pro?.nom_commercial || pro?.raison_sociale || '—';
              const isNeedInfo = req.status === 'need_info';
              return (
                <div key={req.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-800">{nomAffiche}</h3>
                        {isNeedInfo && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                            Réponse complémentaire
                          </span>
                        )}
                        {pro?.ameli_conventionne && (
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded border border-emerald-200">
                            Déjà conventionné ({pro.ameli_source})
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium text-gray-700">Ville : </span>
                          {pro?.ville || '—'}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Catégorie : </span>
                          {pro?.categorie || '—'}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">SIRET : </span>
                          {req.siret || '—'}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">N° AM : </span>
                          {req.numero_am || '—'}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Date convention : </span>
                          {req.date_convention
                            ? new Date(req.date_convention).toLocaleDateString('fr-FR')
                            : '—'}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Demandeur : </span>
                          {user?.email || user?.full_name || req.user_id?.slice(0, 8) || '—'}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Type preuve : </span>
                          {PROOF_TYPE_LABELS[req.proof_type] || req.proof_type}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Soumise le : </span>
                          {new Date(req.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Déclaration honneur : </span>
                          {req.declaration_honneur ? (
                            <span className="text-emerald-700 font-medium">Oui</span>
                          ) : (
                            <span className="text-red-700 font-medium">Non</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <button
                      onClick={() => openProof(req)}
                      disabled={loadingUrls[req.id]}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-60"
                    >
                      {loadingUrls[req.id] ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <FileText size={16} />
                      )}
                      Voir le justificatif
                      <ExternalLink size={14} />
                    </button>
                    {req.proof_file_size_bytes && (
                      <span className="text-xs text-gray-500">
                        {(req.proof_file_size_bytes / 1024).toFixed(0)} ko
                      </span>
                    )}
                    {pro && pro.ville_slug && pro.categorie && pro.slug && (
                      <a
                        href={`/transport-medical/${pro.ville_slug}/${
                          pro.categorie === 'taxi_conventionne' ? 'taxi-conventionne' : pro.categorie
                        }/${pro.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-gray-700 underline ml-auto"
                      >
                        Voir la fiche publique
                      </a>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Motif (obligatoire pour Refuser et Compléter)
                    </label>
                    <textarea
                      value={reasonInputs[req.id] || ''}
                      onChange={(e) =>
                        setReasonInputs((p) => ({ ...p, [req.id]: e.target.value }))
                      }
                      placeholder="Ex : numéro AM illisible, document expiré, justificatif non conforme…"
                      rows={2}
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => decide(req, 'approve')}
                      disabled={actionLoading[req.id]}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium disabled:opacity-60"
                    >
                      {actionLoading[req.id] ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      Approuver
                    </button>
                    <button
                      onClick={() => decide(req, 'reject')}
                      disabled={actionLoading[req.id]}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium disabled:opacity-60"
                    >
                      <XCircle size={16} />
                      Refuser
                    </button>
                    <button
                      onClick={() => decide(req, 'need_info')}
                      disabled={actionLoading[req.id]}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium disabled:opacity-60"
                    >
                      <AlertTriangle size={16} />
                      Compléter
                    </button>
                    <button
                      onClick={() => decide(req, 'spam')}
                      disabled={actionLoading[req.id]}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition text-sm font-medium disabled:opacity-60 ml-auto"
                    >
                      <Trash2 size={16} />
                      Spam
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
