import { createClient } from '@/lib/supabase/server';
import { createClient as createSbClient } from '@supabase/supabase-js';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import DepotStatusBadge from '@/components/depot/DepotStatusBadge';
import DepotTimeline from '@/components/depot/DepotTimeline';
import GarageDepotActions from './GarageDepotActions';

export const dynamic = 'force-dynamic';

function formatEuro(val: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
}

export default async function GarageDepotDetailPage({ params }: { params: { id: string } }) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/auth/login');

  const sbService = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Vérifier que l'utilisateur est un garage actif
  const { data: garage } = await sbService
    .from('garages_partenaires')
    .select('id, statut')
    .eq('user_id', user.id)
    .single();

  if (!garage || garage.statut !== 'actif') redirect('/garage/dashboard/attente');

  // Récupérer le dépôt (doit appartenir à ce garage)
  const { data: depot } = await sbService
    .from('depots')
    .select('*')
    .eq('id', params.id)
    .eq('garage_id', garage.id)
    .single();

  if (!depot) notFound();

  const { data: events } = await sbService
    .from('depot_events')
    .select('*')
    .eq('depot_id', params.id)
    .order('created_at', { ascending: false });

  const photos: string[] = Array.isArray(depot.photos_hd) ? depot.photos_hd : [];
  const expertise = depot.expertise_40pts as Record<string, unknown> | null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <Link href="/garage/dashboard" className="text-slate-400 hover:text-slate-600 transition mt-1">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">
              {[depot.marque, depot.modele].filter(Boolean).join(' ') || 'Véhicule'}
              {depot.annee ? ` (${depot.annee})` : ''}
            </h1>
            <DepotStatusBadge statut={depot.statut} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">

          {/* Infos */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Informations</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {[
                { label: 'Immatriculation', value: depot.immatriculation },
                { label: 'Kilométrage', value: depot.kilometrage ? `${Number(depot.kilometrage).toLocaleString('fr-FR')} km` : null },
                { label: 'État', value: depot.etat_general },
                { label: 'Prix affiché', value: depot.prix_affiche ? formatEuro(Number(depot.prix_affiche)) : null },
                { label: 'Prix net vendeur', value: depot.prix_vendeur_net ? formatEuro(Number(depot.prix_vendeur_net)) : null },
                { label: 'Commission garage', value: `${depot.commission_garage_pct ?? 7}%` },
              ].filter((r) => r.value != null).map((row) => (
                <div key={row.label}>
                  <dt className="text-slate-400">{row.label}</dt>
                  <dd className="font-medium text-slate-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Photos */}
          {photos.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-slate-900 mb-4">Photos HD</h2>
              <div className="grid grid-cols-3 gap-3">
                {photos.map((url, i) => (
                  <img key={i} src={url} alt={`Photo ${i + 1}`} className="rounded-xl w-full aspect-video object-cover" />
                ))}
              </div>
            </div>
          )}

          {/* Expertise */}
          {expertise && Object.keys(expertise).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-slate-900 mb-4">Expertise 40 points</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(expertise).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                    <span className="text-slate-600">{k}</span>
                    <span className={`font-medium ${v === 'OK' || v === true ? 'text-emerald-600' : 'text-red-500'}`}>
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions garage */}
          <GarageDepotActions
            depotId={params.id}
            statut={depot.statut}
            prixAffiche={depot.prix_affiche ?? null}
            prixProposeVendeur={depot.prix_propose_vendeur ?? null}
            messageVendeur={depot.message_vendeur ?? null}
            refusRaison={depot.refus_raison ?? null}
          />
        </div>

        {/* Timeline */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Historique</h2>
            <DepotTimeline events={(events ?? []) as Parameters<typeof DepotTimeline>[0]['events']} />
          </div>
        </div>
      </div>
    </div>
  );
}
