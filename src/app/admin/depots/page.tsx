import { createClient } from '@/lib/supabase/server';
import { createClient as createSbClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DepotStatusBadge from '@/components/depot/DepotStatusBadge';

export const dynamic = 'force-dynamic';

type DepotStatutFilter = string;

export default async function AdminDepotsPage({
  searchParams,
}: {
  searchParams: { statut?: string; garage_id?: string };
}) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/auth/login');

  const sbService = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await sbService
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if ((profile as { role?: string } | null)?.role !== 'admin') redirect('/');

  const statutFilter: DepotStatutFilter = searchParams.statut ?? 'tous';
  const garageFilter = searchParams.garage_id ?? '';

  let query = sbService
    .from('depots')
    .select('id, statut, marque, modele, annee, kilometrage, prix_affiche, prix_final_vente, created_at, vendeur_id, garages_partenaires(raison_sociale, ville)')
    .order('created_at', { ascending: false })
    .limit(200);

  if (statutFilter !== 'tous') {
    query = query.eq('statut', statutFilter);
  }
  if (garageFilter) {
    query = query.eq('garage_id', garageFilter);
  }

  const { data: depots } = await query;
  const list = depots ?? [];

  const STATUTS_DEPOT = ['estimation', 'rdv_pris', 'depose', 'en_vente', 'offre_en_cours', 'vendu', 'retire', 'annule', 'expire'];

  function formatEuro(val: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tous les dépôts</h1>
          <p className="text-slate-500 text-sm mt-0.5">{list.length} résultat(s)</p>
        </div>
        <Link href="/admin" className="text-sm text-slate-400 hover:text-slate-600">Retour admin</Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['tous', ...STATUTS_DEPOT] as string[]).map((s) => (
          <Link
            key={s}
            href={`/admin/depots?statut=${s}${garageFilter ? '&garage_id=' + garageFilter : ''}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              statutFilter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
            }`}
          >
            {s === 'tous' ? 'Tous' : s.replace('_', ' ')}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Véhicule</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Garage</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Prix</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Statut</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Créé le</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400">Aucun dépôt</td>
              </tr>
            ) : (
              list.map((d) => {
                const garage = d.garages_partenaires as { raison_sociale?: string; ville?: string } | null;
                return (
                  <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {[d.marque, d.modele].filter(Boolean).join(' ') || '—'}
                      </div>
                      {d.annee && <div className="text-xs text-slate-400">{d.annee} · {d.kilometrage ? Number(d.kilometrage).toLocaleString('fr-FR') + ' km' : ''}</div>}
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-sm">
                      {garage?.raison_sociale ?? '—'}
                      {garage?.ville && <div className="text-xs text-slate-400">{garage.ville}</div>}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {d.statut === 'vendu' && d.prix_final_vente
                        ? formatEuro(Number(d.prix_final_vente))
                        : d.prix_affiche
                        ? formatEuro(Number(d.prix_affiche))
                        : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <DepotStatusBadge statut={d.statut} />
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">
                      {new Date(d.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
