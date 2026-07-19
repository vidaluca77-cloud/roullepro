// Resolution des metadonnees SEO de la page /transport-medical/recherche.
//
// Cette page a facettes genere une infinite d'URLs a parametres (?q, ?categorie,
// ?lat/lng...). Google a fini par indexer certaines de ces URLs parametrees
// (ex. ?categorie=vsl positionne sur « vsl autour de moi », ?q=... issu du
// SearchAction JSON-LD). On veut transferer ces positions vers les pages dediees
// existantes via un canonical, et empecher l'indexation des recherches libres.
//
// Helper pur (aucune dependance serveur) pour rester testable unitairement.

const RECHERCHE_PATH = "/transport-medical/recherche";

const DEFAULT_TITLE = "Rechercher un transport sanitaire près de chez vous";
const DEFAULT_DESCRIPTION =
  "Trouvez une ambulance, un VSL ou un taxi conventionné CPAM près de chez vous : recherche par ville, code postal ou géolocalisation.";

type CategorieVariant = {
  canonicalPath: string;
  title: string;
  description: string;
};

// Le parametre ?categorie peut arriver en slug ("taxi-conventionne") ou en key
// ("taxi_conventionne") selon l'anciennete du lien. On normalise les deux vers
// la meme entree (voir normalizeCategorie).
const CATEGORIE_VARIANTS: Record<string, CategorieVariant> = {
  vsl: {
    canonicalPath: "/vsl-autour-de-moi",
    title: "VSL autour de moi — Véhicule Sanitaire Léger conventionné",
    description:
      "Trouvez un VSL (Véhicule Sanitaire Léger) conventionné près de chez vous : téléphone direct, tiers payant et remboursement CPAM sur prescription.",
  },
  ambulance: {
    canonicalPath: "/ambulance-autour-de-moi",
    title: "Ambulance autour de moi — trouver une ambulance proche",
    description:
      "Trouvez une ambulance près de chez vous : numéros directs, agréments, dispense d'avance des frais et disponibilité 24/7 partout en France.",
  },
  taxi_conventionne: {
    canonicalPath: "/taxi-vsl-autour-de-moi",
    title: "Taxi conventionné et VSL autour de moi — transport CPAM",
    description:
      "Trouvez un taxi conventionné CPAM ou un VSL près de chez vous : téléphone direct, tiers payant et remboursement Sécurité sociale sur prescription.",
  },
};

export type RechercheMeta = {
  title: string;
  description: string;
  canonicalPath: string;
  index: boolean;
};

function normalizeCategorie(categorie: string | undefined): string {
  return (categorie ?? "").trim().toLowerCase().replace(/-/g, "_");
}

/**
 * Determine les metadonnees SEO (title/description/canonical/robots) selon les
 * parametres de recherche.
 *
 * - Recherche libre (?q) ou geolocalisation (?lat/?lng) : noindex,follow +
 *   canonical vers la page de recherche elle-meme (contenu dynamique/duplique).
 * - Categorie seule connue (?categorie=vsl|ambulance|taxi_conventionne) :
 *   canonical vers la page dediee correspondante, indexable.
 * - Aucun parametre (ou categorie inconnue) : page de recherche canonique,
 *   indexable.
 */
export function resolveRechercheMetadata(input: {
  q?: string;
  categorie?: string;
  geo?: boolean;
}): RechercheMeta {
  const q = (input.q ?? "").trim();
  const geo = input.geo ?? false;

  if (q || geo) {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      canonicalPath: RECHERCHE_PATH,
      index: false,
    };
  }

  const variant = CATEGORIE_VARIANTS[normalizeCategorie(input.categorie)];
  if (variant) {
    return {
      title: variant.title,
      description: variant.description,
      canonicalPath: variant.canonicalPath,
      index: true,
    };
  }

  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    canonicalPath: RECHERCHE_PATH,
    index: true,
  };
}
