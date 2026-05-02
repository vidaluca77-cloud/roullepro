import { BadgeCheck, Shield, UserCheck } from "lucide-react";

interface Props {
  verified?: boolean | null;
  claimed?: boolean | null;
  updatedAt?: string | null;
  /** Style sombre (header bleu fiche) ou clair (listings) */
  variant?: "dark" | "light";
  /** Affiche aussi la date de mise à jour à côté */
  showDate?: boolean;
}

/**
 * Badge unique de statut de fiche, 3 états :
 *  - Vérifiée : verified=true (identité + SIRET contrôlés)
 *  - Réclamée : claimed=true mais pas encore vérifiée
 *  - Non vérifiée : ni l'un ni l'autre (fiche issue de SIRENE non revendiquée)
 *
 * Optionnellement affiche "Mise à jour le JJ/MM/AAAA" pour transparence RGPD.
 */
export default function FicheStatusBadge({
  verified,
  claimed,
  updatedAt,
  variant = "light",
  showDate = false,
}: Props) {
  let label: string;
  let icon: React.ReactNode;
  let cls: string;
  let title: string;

  if (verified) {
    label = "Vérifiée";
    icon = <BadgeCheck className="w-3 h-3" />;
    title = "Identité et SIRET vérifiés par RoullePro";
    cls =
      variant === "dark"
        ? "bg-white text-[#0066CC]"
        : "bg-emerald-50 text-emerald-700 border border-emerald-200";
  } else if (claimed) {
    label = "Réclamée";
    icon = <UserCheck className="w-3 h-3" />;
    title = "Le professionnel a réclamé cette fiche, vérification en cours";
    cls =
      variant === "dark"
        ? "bg-blue-400/30 text-blue-50 border border-white/20"
        : "bg-blue-50 text-blue-700 border border-blue-200";
  } else {
    label = "Non vérifiée";
    icon = <Shield className="w-3 h-3" />;
    title = "Fiche issue des données publiques SIRENE, non revendiquée par le professionnel";
    cls =
      variant === "dark"
        ? "bg-white/10 text-white border border-white/20"
        : "bg-gray-50 text-gray-600 border border-gray-200";
  }

  const dateStr =
    showDate && updatedAt
      ? new Date(updatedAt).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : null;

  return (
    <span className="inline-flex items-center gap-2 flex-wrap">
      <span
        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}
        title={title}
      >
        {icon}
        {label}
      </span>
      {dateStr && (
        <span
          className={`text-[11px] ${variant === "dark" ? "text-blue-100" : "text-gray-500"}`}
          title="Date de dernière mise à jour de la fiche"
        >
          Mise à jour le {dateStr}
        </span>
      )}
    </span>
  );
}
