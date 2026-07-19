/**
 * Selection deterministe de liens internes contextuels pour le blog (chantier D
 * du maillage interne). A partir du titre, du slug et des mots-cles d'un article,
 * on renvoie 3 a 6 liens vers les pages qui doivent capter le jus SEO du blog :
 * piliers (/vsl, /taxi-conventionne, /bon-de-transport), simulateurs de tarif,
 * annuaire national ambulance et, si une ville cible est detectee, sa page
 * transport medical.
 *
 * Fonction pure, sans I/O ni dependance runtime : entierement testable en
 * isolation. Aucun chiffre tarifaire, aucune URL canonique modifiee : on ne fait
 * que pointer vers des routes existantes.
 */

export interface LienInterne {
  href: string;
  /** Ancre descriptive affichee a l'utilisateur. */
  label: string;
}

export interface ArticleContexte {
  titre: string;
  slug: string;
  /** Mots-cles / tags de l'article (le blog stocke ceux-ci dans `keywords`). */
  tags?: string[];
}

/* ------------------------------- LIENS CIBLES ------------------------------- */

const LIEN_PILIER_VSL: LienInterne = {
  href: "/vsl",
  label: "VSL : definition, prescription et remboursement",
};
const LIEN_SIMULATEUR_VSL: LienInterne = {
  href: "/tarif-vsl",
  label: "Tarif VSL 2026 : le simulateur",
};
const LIEN_PILIER_TAXI: LienInterne = {
  href: "/taxi-conventionne",
  label: "Taxi conventionne CPAM : le guide",
};
const LIEN_SIMULATEUR_TAXI: LienInterne = {
  href: "/simulateur-taxi-conventionne",
  label: "Simuler le prix d'une course en taxi conventionne",
};
const LIEN_PILIER_BON_TRANSPORT: LienInterne = {
  href: "/bon-de-transport",
  label: "Bon de transport CPAM : prescription et remboursement",
};
const LIEN_ANNUAIRE_AMBULANCE: LienInterne = {
  href: "/transport-medical/categorie/ambulance",
  label: "Ambulances agreees : l'annuaire national",
};
const LIEN_SIMULATEUR_AMBULANCE: LienInterne = {
  href: "/tarif-ambulance",
  label: "Tarif ambulance : le simulateur",
};

/** Repli lorsqu'aucune thematique n'est detectee : les 3 piliers nationaux. */
const LIENS_PILIERS: LienInterne[] = [
  LIEN_PILIER_VSL,
  LIEN_PILIER_TAXI,
  LIEN_PILIER_BON_TRANSPORT,
];

/* --------------------------------- VILLES ---------------------------------- */

/**
 * Villes cibles du chantier SEO disposant d'une page /transport-medical/[ville]
 * (pros revendiques ou grandes villes prioritaires). Le `nom` sert d'ancre,
 * le `slug` de destination (identique a slugifyVille cote annuaire).
 *
 * Liste ordonnee par priorite SEO : en cas de detection multiple, la premiere
 * ville rencontree l'emporte.
 */
const VILLES_CIBLES: { nom: string; slug: string }[] = [
  { nom: "Paris", slug: "paris" },
  { nom: "Marseille", slug: "marseille" },
  { nom: "Lyon", slug: "lyon" },
  { nom: "Nice", slug: "nice" },
  { nom: "Lille", slug: "lille" },
  { nom: "Caen", slug: "caen" },
  { nom: "Rouen", slug: "rouen" },
  { nom: "Cannes", slug: "cannes" },
  { nom: "Antibes", slug: "antibes" },
  { nom: "Grasse", slug: "grasse" },
  { nom: "Avignon", slug: "avignon" },
  { nom: "Perpignan", slug: "perpignan" },
  { nom: "Rennes", slug: "rennes" },
  { nom: "Brest", slug: "brest" },
  { nom: "Angers", slug: "angers" },
  { nom: "Nantes", slug: "nantes" },
  { nom: "Le Mans", slug: "le-mans" },
  { nom: "Bordeaux", slug: "bordeaux" },
  { nom: "Toulon", slug: "toulon" },
  { nom: "Draguignan", slug: "draguignan" },
  { nom: "Valence", slug: "valence" },
  { nom: "Montelimar", slug: "montelimar" },
  { nom: "Saint-Etienne", slug: "saint-etienne" },
  { nom: "Grenoble", slug: "grenoble" },
  { nom: "Annecy", slug: "annecy" },
  { nom: "Nancy", slug: "nancy" },
  { nom: "Metz", slug: "metz" },
  { nom: "Reims", slug: "reims" },
  { nom: "Amiens", slug: "amiens" },
  { nom: "Orleans", slug: "orleans" },
  { nom: "Evreux", slug: "evreux" },
];

/* -------------------------------- HELPERS ---------------------------------- */

/**
 * Normalise une chaine pour la detection : minuscules, accents retires, tout
 * caractere non alphanumerique remplace par une espace, espaces compresses.
 * Le resultat est encadre d'espaces pour permettre des recherches par mot
 * entier (" caen " ne matche pas "caennais").
 */
function normaliser(s: string): string {
  const noyau = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return ` ${noyau} `;
}

function contientMot(texteNorm: string, motif: string): boolean {
  return texteNorm.includes(` ${motif} `);
}

function ajouter(liste: LienInterne[], lien: LienInterne): void {
  if (!liste.some((l) => l.href === lien.href)) {
    liste.push(lien);
  }
}

/* ------------------------------ API PUBLIQUE ------------------------------- */

/**
 * Detecte la premiere ville cible presente dans le texte normalise, ou null.
 * Exposee pour les tests.
 */
export function detecterVille(
  contexte: ArticleContexte
): { nom: string; slug: string } | null {
  const texte = normaliser(
    [contexte.titre, contexte.slug, ...(contexte.tags || [])].join(" ")
  );
  for (const ville of VILLES_CIBLES) {
    if (contientMot(texte, normaliser(ville.nom).trim())) {
      return ville;
    }
  }
  return null;
}

/**
 * Renvoie 3 a 6 liens internes contextuels pour un article de blog.
 *
 * Detection deterministe par mots-cles dans titre + slug + tags :
 *  - "vsl" -> pilier VSL + simulateur VSL
 *  - "taxi" / "cpam" / "conventionne" -> pilier taxi + simulateur taxi
 *  - "bon de transport" / "prescription" / "remboursement" / "cerfa" / "prise
 *    en charge" -> pilier bon de transport
 *  - "ambulance" -> annuaire ambulance + simulateur ambulance
 *  - ville cible detectee -> page /transport-medical/[ville]
 *
 * Repli si aucun match : les 3 piliers. Le resultat est dedoublonne par href,
 * complete par les piliers pour atteindre 3 liens minimum, et plafonne a 6.
 */
export function selectionnerLiensInternes(
  contexte: ArticleContexte
): LienInterne[] {
  const texte = normaliser(
    [contexte.titre, contexte.slug, ...(contexte.tags || [])].join(" ")
  );

  const liens: LienInterne[] = [];

  const estVsl = contientMot(texte, "vsl") || texte.includes("sanitaire leger");
  const estTaxi =
    contientMot(texte, "taxi") ||
    contientMot(texte, "cpam") ||
    texte.includes("conventionne");
  const estBonTransport =
    texte.includes("bon de transport") ||
    contientMot(texte, "prescription") ||
    contientMot(texte, "remboursement") ||
    contientMot(texte, "cerfa") ||
    texte.includes("prise en charge") ||
    contientMot(texte, "ald");
  const estAmbulance = contientMot(texte, "ambulance");

  if (estVsl) {
    ajouter(liens, LIEN_PILIER_VSL);
    ajouter(liens, LIEN_SIMULATEUR_VSL);
  }
  if (estTaxi) {
    ajouter(liens, LIEN_PILIER_TAXI);
    ajouter(liens, LIEN_SIMULATEUR_TAXI);
  }
  if (estBonTransport) {
    ajouter(liens, LIEN_PILIER_BON_TRANSPORT);
  }
  if (estAmbulance) {
    ajouter(liens, LIEN_ANNUAIRE_AMBULANCE);
    ajouter(liens, LIEN_SIMULATEUR_AMBULANCE);
  }

  const ville = detecterVille(contexte);
  if (ville) {
    ajouter(liens, {
      href: `/transport-medical/${ville.slug}`,
      label: `Transport medical a ${ville.nom}`,
    });
  }

  // Repli / complement : garantir au moins 3 liens avec les piliers nationaux.
  if (liens.length === 0) {
    return [...LIENS_PILIERS];
  }
  for (const pilier of LIENS_PILIERS) {
    if (liens.length >= 3) break;
    ajouter(liens, pilier);
  }

  return liens.slice(0, 6);
}
