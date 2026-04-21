import { createClient } from '@/lib/supabase/server';
import { createClient as createSbClient } from '@supabase/supabase-js';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import DepotStatusBadge from '@/components/depot/DepotStatusBadge';
import DepotTimeline from '@/components/depot/DepotTimeline';
import DepotDetailActions from './DepotDetailActions';

export const dynamic = 'force-dynamic';

function formatEuro(val: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
}

export default async function DepotDetailPage({ params }: { params: { id: string } }) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/auth/login');

  const sbService = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: depot } = await sbService
    .from('depots')
    .select('*, garages_partenaires(ville)')
    .eq('id', params.id)
    .eq('vendeur_id', user.id)
    .single();

  if (!depot) notFound();

  const { data: events } = await sbService
    .from('depot_events')
    .select('*')
    .eq('depot_id', params.id)
    .order('created_at', { ascending: false });

  const { data: offres } = await sbService
    .from('offres')
    .select('id, montant, message, statut, acheteur_email, acheteur_telephone, created_at, expire_at')
    .eq('depot_id', params.id)
    .order('created_at', { ascending: false });

  const garage = depot.garages_partenaires as {
    ville?: string;
  } | null;

  const photos: string[] = Array.isArray(depot.photos_hd) ? depot.photos_hd : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <Link href="/dashboard/depots" className="text-slate-400 hover:text-slate-600 transition mt-1">
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
          {depot.immatriculation && (
            <p className="text-slate-400 text-sm mt-0.5 font-mono">{depot.immatriculation}</p>
          )}
        </div>
        {!['demande_en_attente', 'demande_refusee'].includes(depot.statut) && (
          <a
            href={`/api/depot-vente/${params.id}/contrat`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
          >
            Telecharger le contrat PDF
          </a>
        )}
      </div>

      {/* Banniere statut demande */}
      {depot.statut === 'demande_en_attente' && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-purple-900 mb-1">Demande en cours d’examen par le garage</p>
          <p className="text-sm text-purple-800">
            Le garage partenaire{garage?.ville ? ` de ${garage.ville}` : ''} va examiner votre demande et valider le prix de vente sous 48 h. Vous serez notifié par email dès qu’il aura répondu.
          </p>
          {depot.prix_propose_vendeur && (
            <p className="text-sm text-purple-900 mt-2">
              Prix que vous souhaitez obtenir : <strong>{formatEuro(Number(depot.prix_propose_vendeur))}</strong>
            </p>
          )}
        </div>
      )}

      {depot.statut === 'demande_refusee' && (
        <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-rose-900 mb-1">Demande non retenue par le garage</p>
          {depot.refus_raison && (
            <p className="text-sm text-rose-800 mt-1">{depot.refus_raison}</p>
          )}
          <p className="text-sm text-rose-800 mt-3">
            Vous pouvez contacter un autre garage partenaire RoullePro ou mettre votre véhicule en vente directement.
          </p>
          <Link href="/depot-vente/garages" className="inline-flex items-center gap-1.5 mt-3 text-sm text-rose-900 font-semibold hover:underline">
            Voir les autres garages →
          </Link>
        </div>
      )}

      {depot.statut === 'rdv_pris' && depot.prix_valide_garage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-1">Demande validée — prochaine étape : dépôt du véhicule</p>
          <p className="text-sm text-emerald-800">
            Prix de vente validé : <strong>{formatEuro(Number(depot.prix_valide_garage))}</strong>
            {depot.prix_vendeur_net && (
              <> — vous toucherez net <strong>{formatEuro(Number(depot.prix_vendeur_net))}</strong></>
            )}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="md:col-span-2 space-y-6">

          {/* Infos véhicule */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Informations du véhicule</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {[
                { label: 'Kilométrage', value: depot.kilometrage ? `${Number(depot.kilometrage).toLocaleString('fr-FR')} km` : null },
                { label: 'État général', value: depot.etat_general },
                { label: 'Prix net vendeur', value: depot.prix_vendeur_net ? formatEuro(Number(depot.prix_vendeur_net)) : null },
                { label: 'Prix affiché', value: depot.prix_affiche ? formatEuro(Number(depot.prix_affiche)) : null },
                { label: 'Estimation min', value: depot.estimation_min ? formatEuro(Number(depot.estimation_min)) : null },
                { label: 'Estimation max', value: depot.estimation_max ? formatEuro(Number(depot.estimation_max)) : null },
                { label: 'Date de dépôt', value: depot.date_depot_effectif ? new Date(depot.date_depot_effectif).toLocaleDateString('fr-FR') : null },
                { label: 'Date limite', value: depot.date_limite ? new Date(depot.date_limite).toLocaleDateString('fr-FR') : null },
              ].filter((row) => row.value != null).map((row) => (
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
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="rounded-xl w-full aspect-video object-cover hover:opacity-90 transition"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Offres reçues */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">
              Offres reçues{offres && offres.length > 0 ? ` (${offres.length})` : ''}
            </h2>
            {!offres || offres.length === 0 ? (
              <p className="text-slate-400 text-sm">Aucune offre reçue pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {offres.map((o) => (
                  <div key={o.id} className="border border-slate-100 rounded-xl p-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-blue-600">{formatEuro(Number(o.montant))}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          o.statut === 'acceptee' ? 'bg-green-100 text-green-700' :
                          o.statut === 'refusee' ? 'bg-red-100 text-red-700' :
                          o.statut === 'en_cours' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {o.statut}
                        </span>
                      </div>
                      {o.message && <p className="text-sm text-slate-600 mt-1">{o.message}</p>}
                      <p className="text-xs text-slate-400 mt-1">{o.acheteur_email}</p>
                    </div>
                    {o.statut === 'en_cours' && (
                      <DepotDetailActions offre_id={o.id} depot_id={params.id} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Partenaire (anonymise) */}
          {garage?.ville && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-slate-900 mb-3">Partenaire RoullePro</h2>
              <p className="font-semibold text-slate-800">Partenaire RoullePro — {garage.ville}</p>
              <p className="text-xs text-slate-400 mt-2">
                Pour contacter le partenaire qui détient votre véhicule, passez par la messagerie RoullePro ou contactez notre support.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-3 text-sm text-blue-600 hover:underline font-medium"
              >
                Contacter le support RoullePro
              </Link>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Historique</h2>
            <DepotTimeline events={(events ?? []) as Parameters<typeof DepotTimeline>[0]['events']} />
          </div>
        </div>
      </div>
    </div>
  );
}
