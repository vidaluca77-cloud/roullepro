import { createClient } from '@/lib/supabase/server';
import { createClient as createSbClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import DepotStatusBadge from '@/components/depot/DepotStatusBadge';

export const dynamic = 'force-dynamic';

function formatEuro(val: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
}

const TABS = [
  { key: 'demande_en_attente', label: 'Demandes à traiter' },
  { key: 'rdv_pris', label: 'A recevoir' },
  { key: 'depose', label: 'En préparation' },
  { key: 'en_vente', label: 'En vente' },
  { key: 'vendu', label: 'Vendus' },
] as const;

type TabKey = typeof TABS[number]['key'];

export default async function GarageDashboardPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/auth/login');

  const sbService = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Vérifier que le user a un garage actif
  const { data: garage } = await sbService
    .from('garages_partenaires')
    .select('id, raison_sociale, statut, note_moyenne, nb_ventes_total')
    .eq('user_id', user.id)
    .single();

  if (!garage) {
    redirect('/garage/inscription');
  }

  if (garage.statut !== 'actif') {
    redirect('/garage/dashboard/attente');
  }

  // Récupérer les dépôts confiés (inclut les demandes en attente)
  const { data: depots } = await sbService
    .from('depots')
    .select('id, statut, marque, modele, annee, kilometrage, prix_affiche, prix_final_vente, prix_propose_vendeur, commission_garage_pct, created_at, vendeur_id')
    .eq('garage_id', garage.id)
    .order('created_at', { ascending: false });

  const list = depots ?? [];

  // Stats
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const vendusMois = list.filter(
    (d) => d.statut === 'vendu' && d.prix_final_vente
  );
  const caCommissionMois = vendusMois.reduce((sum, d) => {
    const commission = (Number(d.prix_final_vente) * (Number(d.commission_garage_pct) || 7)) / 100;
    return sum + commission;
  }, 0);

  const stats = {
    demandes: list.filter((d) => d.statut === 'demande_en_attente').length,
    en_cours: list.filter((d) => ['rdv_pris', 'depose', 'en_vente', 'offre_en_cours'].includes(d.statut)).length,
    vendus_mois: vendusMois.length,
    ca_commission: caCommissionMois,
    note: garage.note_moyenne ?? null,
  };

  const hasDemandes = stats.demandes > 0;
  const activeTab = (searchParams.tab ?? (hasDemandes ? 'demande_en_attente' : 'rdv_pris')) as TabKey;
  const filtered = activeTab === 'en_vente'
    ? list.filter((d) => ['en_vente', 'offre_en_cours'].includes(d.statut))
    : list.filter((d) => d.statut === activeTab);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{garage.raison_sociale}</h1>
        <p className="text-slate-500 text-sm mt-0.5">Tableau de bord garage partenaire RoullePro</p>
      </div>

      {/* Alerte demandes en attente */}
      {hasDemandes && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-purple-900">
              {stats.demandes} demande{stats.demandes > 1 ? 's' : ''} en attente de validation
            </p>
            <p className="text-xs text-purple-700 mt-0.5">
              Validez le prix de vente pour lancer le dépôt, ou refusez la demande.
            </p>
          </div>
          <Link
            href="/garage/dashboard?tab=demande_en_attente"
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-lg whitespace-nowrap"
          >
            Traiter
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Demandes à traiter", value: stats.demandes },
          { label: "Dépôts en cours", value: stats.en_cours },
          { label: "Ventes ce mois", value: stats.vendus_mois },
          { label: "Commission ce mois", value: stats.ca_commission > 0 ? formatEuro(stats.ca_commission) : '—' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
            <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const count = tab.key === 'en_vente'
            ? list.filter((d) => ['en_vente', 'offre_en_cours'].includes(d.statut)).length
            : list.filter((d) => d.statut === tab.key).length;
          return (
            <Link
              key={tab.key}
              href={`/garage/dashboard?tab=${tab.key}`}
              className={`flex-1 text-center text-sm font-medium py-2 px-3 rounded-lg transition whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <p className="text-slate-400">Aucun dépôt dans cet état.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Véhicule</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">{activeTab === 'demande_en_attente' ? 'Prix souhaité' : 'Prix affiché'}</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Statut</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">
                      {[d.marque, d.modele].filter(Boolean).join(' ') || 'Véhicule'}
                    </div>
                    {d.annee && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        {d.annee}
                        {d.kilometrage ? ` · ${Number(d.kilometrage).toLocaleString('fr-FR')} km` : ''}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {d.statut === 'demande_en_attente'
                      ? (d.prix_propose_vendeur ? formatEuro(Number(d.prix_propose_vendeur)) : <span className="text-slate-400 font-normal text-xs">non précisé</span>)
                      : (d.prix_affiche ? formatEuro(Number(d.prix_affiche)) : '—')}
                  </td>
                  <td className="px-5 py-4">
                    <DepotStatusBadge statut={d.statut} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/garage/dashboard/depots/${d.id}`}
                      className={`inline-flex items-center gap-1.5 font-medium text-xs ${d.statut === 'demande_en_attente' ? 'text-purple-600 hover:text-purple-700' : 'text-blue-600 hover:text-blue-700'}`}
                    >
                      {d.statut === 'demande_en_attente' ? 'Traiter' : 'Gérer'} <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
