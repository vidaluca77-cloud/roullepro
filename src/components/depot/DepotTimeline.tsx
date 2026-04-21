'use client';

interface DepotEvent {
  id: string;
  type: string;
  ancien_statut?: string | null;
  nouveau_statut?: string | null;
  acteur_id?: string | null;
  payload?: Record<string, unknown> | null;
  created_at: string;
}

const EVENT_LABELS: Record<string, string> = {
  rdv_pris: 'Rendez-vous pris',
  depose: "Véhicule déposé au garage",
  en_vente: 'Véhicule mis en vente',
  offre_recue: 'Offre reçue',
  offre_acceptee: 'Offre acceptée',
  offre_refusee: 'Offre refusée',
  vendu: 'Véhicule vendu',
  retire: 'Véhicule retiré',
  annule: 'Dépôt annulé',
  expire: 'Mandat expiré',
  photos_ajoutees: 'Photos ajoutées',
  expertise_saisie: 'Expertise 40 points saisie',
  prix_modifie: 'Prix modifié',
  estimation: 'Estimation créée',
};

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

interface Props {
  events: DepotEvent[];
}

export default function DepotTimeline({ events }: Props) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        Aucun événement enregistré.
      </div>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <ol className="relative border-l border-slate-200 space-y-6 pl-6">
      {sorted.map((event, idx) => (
        <li key={event.id} className="relative">
          <span
            className={`absolute -left-[1.45rem] flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white ${
              idx === 0 ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white" />
          </span>
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">
              {EVENT_LABELS[event.type] ?? event.type}
            </p>
            {(event.ancien_statut || event.nouveau_statut) && (
              <p className="text-xs text-slate-500 mt-0.5">
                {event.ancien_statut && (
                  <span className="text-slate-400">{event.ancien_statut}</span>
                )}
                {event.ancien_statut && event.nouveau_statut && (
                  <span className="mx-1.5 text-slate-300">→</span>
                )}
                {event.nouveau_statut && (
                  <span className="text-blue-600 font-medium">{event.nouveau_statut}</span>
                )}
              </p>
            )}
            {event.payload && Object.keys(event.payload).length > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                {JSON.stringify(event.payload)}
              </p>
            )}
            <time className="block text-xs text-slate-400 mt-2">
              {formatDate(event.created_at)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
