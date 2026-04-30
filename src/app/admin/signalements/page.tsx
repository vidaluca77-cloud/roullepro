'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  AlertTriangle,
  ChevronLeft,
  ExternalLink,
  Trash2,
  ShieldOff,
  Check,
  Clock,
  Loader2,
} from 'lucide-react';

type Signalement = {
  id: string;
  created_at: string;
  target_type: 'annonce' | 'fiche_sanitaire';
  raison: string;
  commentaire: string | null;
  statut: string;
  reporter_email: string | null;
  reporter_ip: string | null;
  fiche_id: string | null;
  annonce_id: string | null;
  fiche?: {
    id: string;
    nom_commercial: string | null;
    raison_sociale: string | null;
    ville: string;
    ville_slug: string;
    categorie: string;
    slug: string;
    telephone: string | null;
    email: string | null;
    claim_status: string | null;
  } | null;
  annonce?: { id: string; title: string; status: string } | null;
  reporter?: { id: string; full_name: string | null; email: string | null } | null;
};

const STATUT_LABEL: Record<string, { label: string; cls: string }> = {
  en_attente: { label: 'En attente', cls: 'bg-amber-100 text-amber-800' },
  traite_supprime: { label: 'Fiche suspendue', cls: 'bg-red-100 text-red-700' },
  traite_rejete: { label: 'Rejeté', cls: 'bg-gray-100 text-gray-700' },
  traite_modifie: { label: 'Modifié', cls: 'bg-blue-100 text-blue-700' },
};

function categorieLabel(cat: string): string {
  if (cat === 'taxi_conventionne') return 'Taxi conventionné';
  if (cat === 'ambulance') return 'Ambulance';
  if (cat === 'vsl') return 'VSL';
  return cat;
}

function categorieSlug(cat: string): string {
  return cat === 'taxi_conventionne' ? 'taxi-conventionne' : cat;
}

export default function AdminSignalementsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [items, setItems] = useState<Signalement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'en_attente' | 'tous'>('en_attente');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => { void init(); }, [filter]);

  const init = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!profile || profile.role !== 'admin') { router.push('/'); return; }

    const r = await fetch(`/api/admin/signalements?statut=${filter}`);
    if (r.ok) {
      const j = await r.json();
      setItems(j.signalements || []);
    }
    setLoading(false);
  };

  const traiter = async (id: string, action: 'supprimer' | 'rejeter') => {
    const sig = items.find(s => s.id === id);
    if (!sig) return;
    const ficheNomAffiche = sig.fiche?.nom_commercial || sig.fiche?.raison_sociale || 'cette fiche';
    const confirmMsg =
      action === 'supprimer'
        ? `Suspendre la fiche "${ficheNomAffiche}" ? Elle ne sera plus visible publiquement.`
        : 'Rejeter ce signalement (sans agir sur la fiche) ?';
    if (!confirm(confirmMsg)) return;

    setBusyId(id);
    const r = await fetch('/api/admin/signalements', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signalement_id: id, action }),
    });
    setBusyId(null);
    if (!r.ok) {
      const e = await r.json().catch(() => ({ error: 'Erreur' }));
      alert(`Erreur : ${e.error || 'Action impossible'}`);
      return;
    }
    void init();
  };

  const enAttente = items.filter(s => s.statut === 'en_attente').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <ChevronLeft size={16} />
            Retour à l&apos;admin
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Signalements</h1>
            <p className="text-sm text-gray-500">
              Fiches taxis/ambulances/VSL et annonces marketplace signalées par les utilisateurs.
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('en_attente')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${
              filter === 'en_attente' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <Clock size={14} />
            En attente
            {enAttente > 0 && filter === 'en_attente' && (
              <span className="bg-white text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {enAttente}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('tous')}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === 'tous' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Tous
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm py-16 text-center">
            <Check size={40} className="mx-auto text-green-400 mb-3" />
            <p className="text-gray-500 font-medium">Aucun signalement {filter === 'en_attente' ? 'en attente' : ''}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((s) => {
              const isFiche = s.target_type === 'fiche_sanitaire';
              const url = isFiche && s.fiche
                ? `/transport-medical/${s.fiche.ville_slug}/${categorieSlug(s.fiche.categorie)}/${s.fiche.slug}`
                : null;

              const reporterInfo =
                s.reporter?.full_name || s.reporter?.email || s.reporter_email || `IP ${s.reporter_ip || 'inconnue'}`;

              return (
                <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[280px]">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          isFiche ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isFiche ? 'Fiche annuaire' : 'Annonce marketplace'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_LABEL[s.statut]?.cls || 'bg-gray-100'}`}>
                          {STATUT_LABEL[s.statut]?.label || s.statut}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(s.created_at).toLocaleString('fr-FR')}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-1">
                        {isFiche
                          ? (s.fiche?.nom_commercial || s.fiche?.raison_sociale || 'Fiche supprimée')
                          : (s.annonce?.title || 'Annonce supprimée')}
                      </h3>

                      {isFiche && s.fiche && (
                        <p className="text-sm text-gray-600 mb-2">
                          {categorieLabel(s.fiche.categorie)} · {s.fiche.ville}
                          {s.fiche.telephone && <> · {s.fiche.telephone}</>}
                          {s.fiche.claim_status === 'approved' && (
                            <span className="ml-2 inline-flex px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                              Réclamée
                            </span>
                          )}
                        </p>
                      )}

                      <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-2">
                        <p className="text-sm font-medium text-red-900">{s.raison}</p>
                        {s.commentaire && (
                          <p className="text-sm text-red-800 mt-1 whitespace-pre-wrap">{s.commentaire}</p>
                        )}
                      </div>

                      <p className="text-xs text-gray-500">
                        Signalé par : <span className="font-medium text-gray-700">{reporterInfo}</span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[180px]">
                      {url && (
                        <Link
                          href={url}
                          target="_blank"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                        >
                          <ExternalLink size={14} />
                          Voir la fiche
                        </Link>
                      )}
                      {s.statut === 'en_attente' && isFiche && (
                        <>
                          <button
                            onClick={() => traiter(s.id, 'supprimer')}
                            disabled={busyId === s.id}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50"
                          >
                            {busyId === s.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            Suspendre la fiche
                          </button>
                          <button
                            onClick={() => traiter(s.id, 'rejeter')}
                            disabled={busyId === s.id}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm disabled:opacity-50"
                          >
                            <ShieldOff size={14} />
                            Rejeter
                          </button>
                        </>
                      )}
                    </div>
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
