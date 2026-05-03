import { ShieldCheck } from "lucide-react";

// Badge "Conventionne Ameli" - signal de confiance base sur l'annuaire sante.
// Source : annuaire CNAM (Caisse Nationale d'Assurance Maladie), specialite 55
// (taxis et ambulances conventionnes). La date affichee correspond a la
// derniere fois ou la fiche a ete vue dans un import Ameli (ameli_last_seen).
//
// Regle d'affichage : on affiche UNIQUEMENT si la fiche a ete confirmee par
// un import Ameli, c'est-a-dire si `ameli_conventionne = true` ET
// `ameli_last_seen IS NOT NULL`. Cette double exigence empeche tout faux
// positif sur d'eventuelles fiches dont le booleen serait vrai sans preuve
// (ex: donnee migree manuellement ou heritee).
//
// Rendu sobre : vert emeraude, format pill, jamais clignotant.
// La page /transport-medical/recherche?ameli=1 permet de filtrer.

type Variant = "sm" | "md" | "lg";
type Tone = "light" | "dark";

interface AmeliBadgeProps {
  conventionne: boolean | null | undefined;
  lastSeen?: string | null;
  variant?: Variant;
  tone?: Tone;
  className?: string;
  showLabel?: boolean;
}

function formatDateFr(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function AmeliBadge({
  conventionne,
  lastSeen,
  variant = "md",
  tone = "light",
  className = "",
  showLabel = true,
}: AmeliBadgeProps) {
  // Garde-fou strict : pas de badge sans preuve de passage dans Ameli
  if (!conventionne) return null;
  if (!lastSeen) return null;

  const dateFr = formatDateFr(lastSeen);
  const tooltip = dateFr
    ? `Cette societe est conventionnee par l'Assurance Maladie selon l'annuaire sante Ameli (mise a jour ${dateFr}).`
    : `Cette societe est conventionnee par l'Assurance Maladie selon l'annuaire sante Ameli.`;

  const sizes: Record<Variant, { wrapper: string; icon: number }> = {
    sm: { wrapper: "px-2 py-0.5 text-[11px] gap-1", icon: 12 },
    md: { wrapper: "px-2.5 py-1 text-xs gap-1.5", icon: 14 },
    lg: { wrapper: "px-3 py-1.5 text-sm gap-1.5", icon: 16 },
  };

  const tones: Record<Tone, string> = {
    light: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dark: "bg-emerald-400/15 text-emerald-100 border border-emerald-300/30",
  };

  const sz = sizes[variant];
  const tn = tones[tone];

  return (
    <span
      title={tooltip}
      aria-label={tooltip}
      className={`inline-flex items-center rounded-full font-medium ${sz.wrapper} ${tn} ${className}`}
    >
      <ShieldCheck size={sz.icon} aria-hidden="true" className="flex-shrink-0" />
      {showLabel && <span>Conventionne Ameli</span>}
    </span>
  );
}
