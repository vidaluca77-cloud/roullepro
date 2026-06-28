/**
 * Bloc Sources — affiché en bas des fiches pros, guides et pages ville/catégorie.
 * Indique les sources des données affichées pour la transparence éditoriale et
 * les signaux d'autorité pour les LLM / moteurs IA.
 */

type SourceItem = {
  label: string;
  description: string;
  href: string;
};

type Props = {
  /** Variante d'affichage selon le type de page */
  variant: "pro" | "guide" | "ville";
  /** Date de vérification (ISO) pour les fiches pros */
  dateVerification?: string | null;
  /** Sources supplémentaires (décrets/arrêtés pour les guides) */
  extraSources?: SourceItem[];
};

const BASE_SOURCES: SourceItem[] = [
  {
    label: "Registre INSEE SIRENE",
    description: "Raison sociale, SIRET, adresse",
    href: "https://www.sirene.fr",
  },
  {
    label: "Référentiel FINESS (ATIH)",
    description: "Numéro FINESS, catégorie d'activité",
    href: "https://finess.esante.gouv.fr",
  },
  {
    label: "Convention CPAM départementale",
    description: "Statut de conventionnement",
    href: "https://www.ameli.fr",
  },
];

const GUIDE_SOURCES: SourceItem[] = [
  {
    label: "Legifrance",
    description: "Décrets, arrêtés, textes officiels",
    href: "https://www.legifrance.gouv.fr",
  },
  {
    label: "Assurance Maladie (ameli.fr)",
    description: "Conventions, tarifs, remboursements",
    href: "https://www.ameli.fr",
  },
  {
    label: "Agences Régionales de Santé",
    description: "Agréments et autorisations",
    href: "https://www.ars.sante.fr",
  },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function SourcesBlock({ variant, dateVerification, extraSources }: Props) {
  let sources: SourceItem[] = [];

  if (variant === "pro" || variant === "ville") {
    sources = BASE_SOURCES;
  } else if (variant === "guide") {
    sources = GUIDE_SOURCES;
  }

  if (extraSources && extraSources.length > 0) {
    sources = sources.concat(extraSources);
  }

  return (
    <aside
      aria-label="Sources des données"
      className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mt-6"
    >
      <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
        Sources
      </h2>
      <ul className="space-y-2">
        {sources.map((src) => (
          <li key={src.href} className="flex items-start gap-2 text-sm">
            <span className="text-gray-400 mt-0.5" aria-hidden="true">—</span>
            <span>
              <a
                href={src.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#0066CC] hover:underline"
              >
                {src.label}
              </a>
              {" "}
              <span className="text-gray-600">: {src.description}</span>
            </span>
          </li>
        ))}
      </ul>
      {variant === "pro" && dateVerification && (
        <p className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          Fiche professionnelle vérifiée le {formatDate(dateVerification)}
        </p>
      )}
    </aside>
  );
}
