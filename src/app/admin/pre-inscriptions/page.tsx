'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, Check, Clock, Loader2, UserCheck, X, Briefcase } from 'lucide-react';

type PreInscription = {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  telephone: string | null;
  raison_sociale: string | null;
  siret: string | null;
  ville: string | null;
  code_postal: string | null;
  categorie: 'taxi_conventionne' | 'ambulance' | 'vsl' | null;
  statut: 'en_attente' | 'fiche_creee' | 'rejete';
  fiche_id: string | null;
  created_at: string;
};

const CATEGORIE_LABEL: Record<string, string> = {
  taxi_conventionne: 'Taxi conventionné',
  ambulance: 'Ambulance',
  vsl: 'VSL',
};

const STATUT_LABEL: Record<string, { label: string; cls: string }> = {
  en_attente: { label: 'En attente', cls: 'bg-amber-100 text-amber-800' },
  fiche_creee: { label: 'Fiche créée', cls: 'bg-green-100 text-green-700' },
  rejete: { label: 'Rejeté', cls: 'bg-gray-100 text-gray-700' },
};

export default function AdminPreInscriptionsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [items, setItems] = useState<PreInscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'en_attente' | 'tous'>('en_attente');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => { void load(); }, [filter]);

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') { router.push('/'); return; }

    const r = await fetch(`/api/admin/pre-inscriptions?statut=${filter}`);
    if (r.ok) {
      const j = await r.json();
      setItems(j.items || []);
    }
    setLoading(false);
  };

  const traiter = async (id: string, action: 'creer_fiche' | 'rejeter') => {
    const item = items.find(x => x.id === id);
    if (!item) return;
    const msg = action === 'creer_fiche'
      ? `Créer la fiche "${item.raison_sociale || 'sans nom'}" pour ${item.email} ?`
      : `Rejeter cette pré-inscription ?`;
    if (!confirm(msg)) return;

    setBusyId(id);
    const r = await fetch('/api/admin/pre-inscriptions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pre_id: id, action }),
    });
    setBusyId(null);
    if (!r.ok) {
      const e = await r.json().catch(() => ({ error: 'Erreur' }));
      alert(`Erreur : ${e.error || 'Action impossible'}`);
      return;
    }
    void load();
  };

  const enAttente = items.filter(s => s.statut === 'en_attente').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft size={16} />
          Retour à l&apos;admin
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pré-inscriptions Pro</h1>
            <p className="text-sm text-gray-500">
              Demandes d&apos;inscription comme professionnel — créez la fiche en 1 clic.
            </p>
          </div>
        </div>

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
            <p className="text-gray-500 font-medium">Aucune pré-inscription {filter === 'en_attente' ? 'en attente' : ''}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[280px]">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_LABEL[it.statut]?.cls || 'bg-gray-100'}`}>
                        {STATUT_LABEL[it.statut]?.label || it.statut}
                      </span>
                      {it.categorie && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {CATEGORIE_LABEL[it.categorie] || it.categorie}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(it.created_at).toLocaleString('fr-FR')}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1">
                      {it.raison_sociale || it.full_name || 'Sans nom'}
                    </h3>

                    <div className="text-sm text-gray-600 space-y-0.5">
                      <p><span className="text-gray-500">Email :</span> {it.email}</p>
                      {it.telephone && <p><span className="text-gray-500">Tél :</span> {it.telephone}</p>}
                      {it.siret && <p><span className="text-gray-500">SIRET :</span> {it.siret}</p>}
                      {(it.ville || it.code_postal) && (
                        <p>
                          <span className="text-gray-500">Ville :</span> {it.ville}{it.code_postal && ` (${it.code_postal})`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[180px]">
                    {it.statut === 'en_attente' && (
                      <>
                        <button
                          onClick={() => traiter(it.id, 'creer_fiche')}
                          disabled={busyId === it.id}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50 font-medium"
                        >
                          {busyId === it.id ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                          Créer la fiche
                        </button>
                        <button
                          onClick={() => traiter(it.id, 'rejeter')}
                          disabled={busyId === it.id}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm disabled:opacity-50"
                        >
                          <X size={14} />
                          Rejeter
                        </button>
                      </>
                    )}
                    {it.fiche_id && (
                      <Link
                        href={`/admin/sanitaire`}
                        className="text-xs text-blue-600 hover:underline text-center"
                      >
                        Voir la fiche créée
                      </Link>
                    )}
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
