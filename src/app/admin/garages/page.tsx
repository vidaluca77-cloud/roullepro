import { createClient } from '@/lib/supabase/server';
import { createClient as createSbClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminGarageActions from './AdminGarageActions';

export const dynamic = 'force-dynamic';

const STATUTS = ['candidature', 'pre_valide', 'actif', 'suspendu', 'refuse'] as const;

type StatutFilter = typeof STATUTS[number] | 'tous';

export default async function AdminGaragesPage({
  searchParams,
}: {
  searchParams: { statut?: string };
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

  const statutFilter = (searchParams.statut ?? 'tous') as StatutFilter;

  let query = sbService
    .from('garages_partenaires')
    .select('id, raison_sociale, contact_email, contact_nom, ville, code_postal, siret, statut, created_at, nb_ventes_total')
    .order('created_at', { ascending: false });

  if (statutFilter !== 'tous') {
    query = query.eq('statut', statutFilter);
  }

  const { data: garages } = await query;
  const list = garages ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Garages partenaires</h1>
          <p className="text-slate-500 text-sm mt-0.5">{list.length} résultat(s)</p>
        </div>
        <Link href="/admin" className="text-sm text-slate-400 hover:text-slate-600">Retour admin</Link>
      </div>

      {/* Filtres statut */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['tous', ...STATUTS] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/garages?statut=${s}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              statutFilter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Garage</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Contact</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">SIRET</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Statut</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Ventes</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  Aucun garage
                </td>
              </tr>
            ) : (
              list.map((g) => (
                <tr key={g.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">{g.raison_sociale}</div>
                    <div className="text-xs text-slate-400">{[g.code_postal, g.ville].filter(Boolean).join(' ')}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <div>{g.contact_nom}</div>
                    <div className="text-xs text-slate-400">{g.contact_email}</div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{g.siret}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      g.statut === 'actif' ? 'bg-green-100 text-green-700' :
                      g.statut === 'candidature' ? 'bg-amber-100 text-amber-700' :
                      g.statut === 'pre_valide' ? 'bg-blue-100 text-blue-700' :
                      g.statut === 'suspendu' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {g.statut}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{g.nb_ventes_total ?? 0}</td>
                  <td className="px-5 py-4">
                    <AdminGarageActions garageId={g.id} currentStatut={g.statut} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
