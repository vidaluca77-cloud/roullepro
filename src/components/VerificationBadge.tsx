import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

type VerificationStatus = 'non_verifie' | 'en_attente' | 'verifie' | 'refuse';

interface VerificationBadgeProps {
  status: VerificationStatus;
  className?: string;
  showLabel?: boolean;
}

export default function VerificationBadge({ status, className = '', showLabel = true }: VerificationBadgeProps) {
  const configs = {
    non_verifie: {
      icon: AlertCircle,
      label: 'Non vérifié',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      iconColor: 'text-gray-500'
    },
    en_attente: {
      icon: Clock,
      label: 'En attente',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-600'
    },
    verifie: {
      icon: CheckCircle2,
      label: 'Vérifié',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      iconColor: 'text-green-600'
    },
    refuse: {
      icon: XCircle,
      label: 'Refusé',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      iconColor: 'text-red-600'
    }
  };

  const config = configs[status] || configs.non_verifie;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}>
      <Icon size={14} className={config.iconColor} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}
