import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import DepotStatusBadge from '@/components/depot/DepotStatusBadge';

export const dynamic = 'force-dynamic';

function formatEuro(val: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
}

export default async function DashboardDepotsPage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/dashboard/depots');

  const { data: depots } = await sb
    .from('depots')
    .select('id, statut, marque, modele, annee, kilometrage, prix_affiche, prix_final_vente, garage_id, created_at, date_vente, garages_partenaires(raison_sociale, ville)')
    .eq('vendeur_id', user.id)
    .order('created_at', { ascending: false });

  const list = depots ?? [];

  const stats = {
    total: list.length,
    en_vente: list.filter((d) => ['en_vente', 'offre_en_cours'].includes(d.statut)).length,
    vendus: list.filter((d) => d.statut === 'vendu').length,
    ca: list
      .filter((d) => d.statut === 'vendu' && d.prix_final_vente)
      .reduce((sum, d) => sum + (Number(d.prix_final_vente) || 0), 0),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes dépôts-vente</h1>
          <p className="text-slate-500 text-sm mt-0.5">Suivez l'avancement de la vente de vos véhicules</p>
        </div>
        <Link
          href="/depot-vente/estimer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
        >
          Nouveau dépôt
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total déposés", value: stats.total },
          { label: "En vente", value: stats.en_vente },
          { label: "Vendus", value: stats.vendus },
          { label: "CA généré", value: stats.ca > 0 ? formatEuro(stats.ca) : '—' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
            <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Liste */}
      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <Package size={40} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-2">Vous n'avez pas encore de dépôt en cours.</p>
          <Link
            href="/depot-vente/estimer"
            className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm hover:underline"
          >
            Estimer mon premier véhicule
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Véhicule</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Garage</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Prix</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Statut</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {list.map((d) => {
                const garage = d.garages_partenaires as { raison_sociale?: string; ville?: string } | null;
                return (
                  <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {[d.marque, d.modele].filter(Boolean).join(' ') || 'Véhicule sans nom'}
                      </div>
                      {d.annee && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {d.annee}
                          {d.kilometrage ? ` · ${Number(d.kilometrage).toLocaleString('fr-FR')} km` : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {garage?.raison_sociale ?? <span className="text-slate-300">—</span>}
                      {garage?.ville && <div className="text-xs text-slate-400">{garage.ville}</div>}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {d.statut === 'vendu' && d.prix_final_vente
                        ? formatEuro(Number(d.prix_final_vente))
                        : d.prix_affiche
                        ? formatEuro(Number(d.prix_affiche))
                        : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <DepotStatusBadge statut={d.statut} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/depots/${d.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
