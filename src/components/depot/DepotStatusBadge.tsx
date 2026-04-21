'use client';

export type DepotStatut =
  | 'estimation'
  | 'demande_en_attente'
  | 'demande_refusee'
  | 'rdv_pris'
  | 'depose'
  | 'en_vente'
  | 'offre_en_cours'
  | 'vendu'
  | 'retire'
  | 'annule'
  | 'expire';

const STATUS_CONFIG: Record<DepotStatut, { label: string; className: string }> = {
  estimation: {
    label: 'Estimation',
    className: 'bg-slate-100 text-slate-700 border border-slate-200',
  },
  demande_en_attente: {
    label: 'Demande en attente',
    className: 'bg-purple-100 text-purple-700 border border-purple-200',
  },
  demande_refusee: {
    label: 'Demande refusée',
    className: 'bg-rose-100 text-rose-700 border border-rose-200',
  },
  rdv_pris: {
    label: 'RDV pris',
    className: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  depose: {
    label: "Deposé",
    className: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  },
  en_vente: {
    label: 'En vente',
    className: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  offre_en_cours: {
    label: 'Offre en cours',
    className: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  vendu: {
    label: 'Vendu',
    className: 'bg-green-100 text-green-700 border border-green-200',
  },
  retire: {
    label: 'Retiré',
    className: 'bg-orange-100 text-orange-700 border border-orange-200',
  },
  annule: {
    label: 'Annulé',
    className: 'bg-red-100 text-red-700 border border-red-200',
  },
  expire: {
    label: 'Expiré',
    className: 'bg-gray-100 text-gray-500 border border-gray-200',
  },
};

interface Props {
  statut: string;
  className?: string;
}

export default function DepotStatusBadge({ statut, className = '' }: Props) {
  const config = STATUS_CONFIG[statut as DepotStatut] ?? {
    label: statut,
    className: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
