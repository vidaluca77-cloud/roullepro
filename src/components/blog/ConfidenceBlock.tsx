/**
 * ConfidenceBlock — Bloc E-A-T (Expertise, Authoritativeness, Trustworthiness)
 * affiche sources officielles, auteur, date de derniere mise a jour et badges
 * pour renforcer la credibilite SEO sur les articles strategiques.
 *
 * Affiche en haut d'article (apres le hero) sur les pages SEO_BOOST_SLUGS.
 */

import { ShieldCheck, BookOpen, Calendar, ExternalLink } from "lucide-react";

export interface ConfidenceSource {
  label: string;
  url: string;
  organization: string;
}

interface ConfidenceBlockProps {
  /** Date ISO de la derniere mise a jour. Si absente, utilise post.date. */
  updatedAt: string;
  /** Minutes de lecture estimees. */
  readingMinutes: number;
  /** Sources officielles citees dans l'article. */
  sources: ConfidenceSource[];
}

/**
 * Sources officielles par defaut, communes aux articles transport sanitaire.
 * Chaque slug peut surcharger en passant une liste personnalisee.
 */
export const DEFAULT_SOURCES_CPAM: ConfidenceSource[] = [
  {
    label: "Service-Public.fr — Transport sanitaire",
    organization: "Service-Public.fr",
    url: "https://www.service-public.fr/particuliers/vosdroits/F12992",
  },
  {
    label: "Ameli.fr — Frais de transport pris en charge",
    organization: "Assurance Maladie",
    url: "https://www.ameli.fr/assure/remboursements/rembourse/transport/transport",
  },
  {
    label: "Legifrance — Code de la securite sociale R322-10",
    organization: "Legifrance",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000031929059/",
  },
];

export const SOURCES_AGREMENT: ConfidenceSource[] = [
  {
    label: "Ameli.fr — Convention nationale taxi 2024",
    organization: "Assurance Maladie",
    url: "https://www.ameli.fr/transporteur-sanitaire/exercice-professionnel/taxis-conventionnes",
  },
  {
    label: "Legifrance — Article L322-5 CSS",
    organization: "Legifrance",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033712544",
  },
  {
    label: "Service-Public.fr — Taxi conventionne",
    organization: "Service-Public.fr",
    url: "https://www.service-public.fr/particuliers/vosdroits/F12992",
  },
];

export const SOURCES_ALD_ONCO: ConfidenceSource[] = [
  {
    label: "Ameli.fr — Affection de longue duree (ALD)",
    organization: "Assurance Maladie",
    url: "https://www.ameli.fr/assure/droits-demarches/maladie-accident-hospitalisation/affection-longue-duree-ald",
  },
  {
    label: "INCa — Transports lies aux traitements",
    organization: "Institut National du Cancer",
    url: "https://www.e-cancer.fr/Patients-et-proches/Qualite-de-vie/Aides-et-organisation",
  },
  {
    label: "Legifrance — Decret 2011-258 transport ALD",
    organization: "Legifrance",
    url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000023711572/",
  },
];

export function ConfidenceBlock({
  updatedAt,
  readingMinutes,
  sources,
}: ConfidenceBlockProps) {
  const dateStr = new Date(updatedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  });

  return (
    <aside
      className="not-prose mb-10 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-5 md:p-6"
      aria-label="Sources et informations de confiance"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
          <ShieldCheck size={14} aria-hidden />
          Article verifie
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs text-gray-600">
          <Calendar size={13} aria-hidden />
          Mis a jour le {dateStr}
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs text-gray-600">
          <BookOpen size={13} aria-hidden />
          {readingMinutes} min de lecture
        </div>
      </div>

      <div className="mb-3">
        <div className="text-sm font-semibold text-gray-900 mb-1">
          Redige par l&apos;equipe editoriale RoullePro
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Notre equipe couvre le transport sanitaire conventionne CPAM
          depuis 2024 (taxis, VSL, ambulances). Contenu verifie au regard
          des textes officiels et des conventions en vigueur.
        </p>
      </div>

      {sources.length > 0 && (
        <div className="pt-3 border-t border-blue-100">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Sources officielles consultees
          </div>
          <ul className="space-y-1.5">
            {sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-start gap-1.5 text-sm text-blue-700 hover:text-blue-900 hover:underline leading-snug"
                >
                  <ExternalLink
                    size={13}
                    className="mt-0.5 flex-shrink-0"
                    aria-hidden
                  />
                  <span>
                    <span className="font-medium">{s.organization}</span>
                    <span className="text-gray-600"> — {s.label.replace(s.organization + " — ", "")}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
