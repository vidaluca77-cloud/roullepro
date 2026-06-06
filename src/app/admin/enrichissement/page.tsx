'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Phone,
  MapPin,
  Building2,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react';

interface ReviewItem {
  id: string;
  pro_id: string;
  phone_candidate: string | null;
  google_title: string | null;
  google_address: string | null;
  google_zip: string | null;
  distance_km: number | null;
  name_score: number | null;
  flags: string[] | null;
  reviewed: boolean;
  approved: boolean | null;
  created_at: string;
}

interface ProInfo {
  id: string;
  nom_commercial: string | null;
  raison_sociale: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  departement: string | null;
  categorie: string | null;
  siret: string | null;
  ameli_conventionne: boolean | null;
}

interface Stats {
  queue_pending: number;
  queue_processing: number;
  queue_done: number;
  log_accept: number;
  log_review: number;
  log_reject: number;
  log_no_result: number;
  review_pending: number;
}

export default function AdminEnrichissementPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<(ReviewItem & { pro: ProInfo | null })[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [acting, setActing] = useState<Record<string, boolean>>({});

  const checkAdminAndLoad = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!profile || profile.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    await Promise.all([loadReviews(), loadStats()]);
    setLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    checkAdminAndLoad();
  }, [checkAdminAndLoad]);

  const loadReviews = async () => {
    const { data: revs, error } = await supabase
      .from('phone_enrichment_review')
      .select('*')
      .eq('reviewed', false)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error || !revs) {
      console.error('Erreur load reviews', error);
      setReviews([]);
      return;
    }

    const proIds = revs.map((r: ReviewItem) => r.pro_id);
    const { data: pros } = await supabase
      .from('pros_sanitaire')
      .select('id, nom_commercial, raison_sociale, adresse, code_postal, ville, departement, categorie, siret, ameli_conventionne')
      .in('id', proIds);

    const proMap = new Map<string, ProInfo>((pros ?? []).map((p: ProInfo) => [p.id, p]));
    setReviews(
      revs.map((r: ReviewItem) => ({ ...r, pro: proMap.get(r.pro_id) ?? null }))
    );
  };

  const loadStats = async () => {
    const queries = await Promise.all([
      supabase.from('phone_enrichment_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('phone_enrichment_queue').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
      supabase.from('phone_enrichment_queue').select('*', { count: 'exact', head: true }).eq('status', 'done'),
      supabase.from('phone_enrichment_log').select('*', { count: 'exact', head: true }).eq('status', 'accept'),
      supabase.from('phone_enrichment_log').select('*', { count: 'exact', head: true }).eq('status', 'review'),
      supabase.from('phone_enrichment_log').select('*', { count: 'exact', head: true }).eq('status', 'reject'),
      supabase.from('phone_enrichment_log').select('*', { count: 'exact', head: true }).eq('status', 'no_result'),
      supabase.from('phone_enrichment_review').select('*', { count: 'exact', head: true }).eq('reviewed', false),
    ]);
    setStats({
      queue_pending: queries[0].count ?? 0,
      queue_processing: queries[1].count ?? 0,
      queue_done: queries[2].count ?? 0,
      log_accept: queries[3].count ?? 0,
      log_review: queries[4].count ?? 0,
      log_reject: queries[5].count ?? 0,
      log_no_result: queries[6].count ?? 0,
      review_pending: queries[7].count ?? 0,
    });
  };

  const approve = async (item: ReviewItem & { pro: ProInfo | null }) => {
    if (!item.phone_candidate || !item.pro) return;
    setActing((s) => ({ ...s, [item.id]: true }));

    const { error: errUpd } = await supabase
      .from('pros_sanitaire')
      .update({
        telephone_public: item.phone_candidate,
        phone_e164: item.phone_candidate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.pro_id)
      .eq('claimed', false);

    if (errUpd) {
      console.error('UPDATE pros_sanitaire failed', errUpd);
      setActing((s) => ({ ...s, [item.id]: false }));
      return;
    }

    await supabase
      .from('phone_enrichment_review')
      .update({ reviewed: true, approved: true })
      .eq('id', item.id);

    setReviews((r) => r.filter((x) => x.id !== item.id));
    setActing((s) => ({ ...s, [item.id]: false }));
    loadStats();
  };

  const reject = async (item: ReviewItem) => {
    setActing((s) => ({ ...s, [item.id]: true }));
    await supabase
      .from('phone_enrichment_review')
      .update({ reviewed: true, approved: false })
      .eq('id', item.id);
    setReviews((r) => r.filter((x) => x.id !== item.id));
    setActing((s) => ({ ...s, [item.id]: false }));
    loadStats();
  };

  const refresh = async () => {
    setLoading(true);
    await Promise.all([loadReviews(), loadStats()]);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const total = (stats?.log_accept ?? 0) + (stats?.log_review ?? 0) + (stats?.log_reject ?? 0) + (stats?.log_no_result ?? 0);
  const progressTotal = total + (stats?.queue_pending ?? 0) + (stats?.queue_processing ?? 0);
  const progressPct = progressTotal > 0 ? Math.round((total / progressTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 mb-2">
              <ChevronLeft className="w-4 h-4" /> Retour admin
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Enrichissement téléphones</h1>
            <p className="text-gray-600 mt-1">Validation des matchs DataForSEO incertains</p>
          </div>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 uppercase">Progression</div>
              <div className="text-2xl font-bold text-blue-700">{progressPct}%</div>
              <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 uppercase">En attente</div>
              <div className="text-2xl font-bold text-amber-600">{stats.queue_pending.toLocaleString('fr-FR')}</div>
              <div className="text-xs text-gray-500 mt-1">+ {stats.queue_processing} en cours</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 uppercase">Téléphones ajoutés</div>
              <div className="text-2xl font-bold text-green-700">{stats.log_accept.toLocaleString('fr-FR')}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 uppercase">À valider</div>
              <div className="text-2xl font-bold text-orange-600">{stats.review_pending.toLocaleString('fr-FR')}</div>
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-8 text-sm">
            <div className="bg-white p-3 rounded border border-gray-200 flex justify-between">
              <span className="text-gray-600">Rejets stricts</span>
              <span className="font-medium text-red-600">{stats.log_reject.toLocaleString('fr-FR')}</span>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200 flex justify-between">
              <span className="text-gray-600">Non trouvés Google</span>
              <span className="font-medium text-gray-700">{stats.log_no_result.toLocaleString('fr-FR')}</span>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200 flex justify-between">
              <span className="text-gray-600">Total traité</span>
              <span className="font-medium text-gray-900">{total.toLocaleString('fr-FR')}</span>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Rien à valider</h3>
            <p className="text-gray-600 mt-1">
              Aucun cas en attente de revue. La tâche automatique continue d&apos;analyser les fiches.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              {reviews.length} cas à valider (50 max affichés)
            </div>
            {reviews.map((item) => {
              const proName = item.pro?.nom_commercial || item.pro?.raison_sociale || '—';
              const proAddr = `${item.pro?.adresse ?? ''} ${item.pro?.code_postal ?? ''} ${item.pro?.ville ?? ''}`.trim();
              const score = item.name_score ? (item.name_score * 100).toFixed(0) : '?';
              const dist = item.distance_km != null ? item.distance_km.toFixed(2) : '?';
              const isActing = acting[item.id];

              return (
                <div key={item.id} className="bg-white border border-orange-200 rounded-lg overflow-hidden">
                  <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center justify-between text-sm">
                    <span className="text-orange-800 font-medium inline-flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Match incertain — score nom {score}%, distance {dist} km
                    </span>
                    <span className="text-xs text-orange-600 uppercase tracking-wide">{item.pro?.categorie ?? '—'}</span>
                  </div>

                  <div className="grid md:grid-cols-2 divide-x divide-gray-200">
                    <div className="p-4">
                      <div className="text-xs text-gray-500 uppercase mb-2">Fiche RoullePro (SIRENE)</div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {proName}
                      </div>
                      <div className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{proAddr || '—'}</span>
                      </div>
                      {item.pro?.siret && (
                        <div className="text-xs text-gray-500 mt-2">
                          SIRET : <span className="font-mono">{item.pro.siret}</span>
                        </div>
                      )}
                      {item.pro?.ameli_conventionne && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          Conventionné CPAM
                        </span>
                      )}
                    </div>

                    <div className="p-4 bg-gray-50">
                      <div className="text-xs text-gray-500 uppercase mb-2">Résultat Google trouvé</div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {item.google_title || '—'}
                      </div>
                      <div className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>
                          {item.google_address || '—'}
                          {item.google_zip && ` (${item.google_zip})`}
                        </span>
                      </div>
                      {item.phone_candidate && (
                        <div className="mt-2 flex items-center gap-2 text-lg font-mono text-green-700">
                          <Phone className="w-4 h-4" />
                          {item.phone_candidate}
                        </div>
                      )}
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(
                          (item.google_title || proName) + ' ' + (item.pro?.ville ?? '')
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-2"
                      >
                        Voir sur Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {item.flags && item.flags.length > 0 && (
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                      Flags : <span className="font-mono">{item.flags.join(', ')}</span>
                    </div>
                  )}

                  <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
                    <button
                      onClick={() => reject(item)}
                      disabled={isActing}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Rejeter
                    </button>
                    <button
                      onClick={() => approve(item)}
                      disabled={isActing || !item.phone_candidate}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {isActing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Valider et enregistrer
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
