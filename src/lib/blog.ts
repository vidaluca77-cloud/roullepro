/**
 * Index des articles de blog statiques.
 * Pour ajouter un article : créer un nouvel export et l'inclure dans POSTS.
 */

export interface BlogPost {
  slug: string;
  title: string;
  /** H1 éditorial affiché en tête de page (si absent, on utilise title). */
  h1?: string;
  excerpt: string;
  category: string;
  date: string; // ISO
  readingTime: number;
  /** Contenu Markdown-like — rendu via une fonction simple dans la page */
  content: string;
  keywords: string[];
  /** Chemin relatif depuis /public, ex: "/blog/taxi-conventionne-paris.jpg" */
  image?: string;
  /** Texte alternatif français descriptif de l'image */
  imageAlt?: string;
}

const POSTS: BlogPost[] = [
  {
    slug: "vendre-utilitaire-occasion-entre-professionnels",
    title: "Vendre un utilitaire d'occasion entre professionnels : le guide 2026",
    excerpt:
      "Prix, fiscalité, contrôle technique, mandat… tout ce qu'il faut savoir pour vendre rapidement et au bon prix votre fourgon ou votre camionnette à un autre pro.",
    category: "Guide vendeur",
    date: "2026-04-10",
    readingTime: 6,
    keywords: [
      "vendre utilitaire occasion",
      "vente fourgon entre pros",
      "prix camionnette occasion",
      "vente véhicule professionnel",
    ],
    content: `
## Pourquoi vendre entre professionnels ?

Vendre un véhicule utilitaire entre professionnels présente plusieurs avantages par rapport à la vente à un particulier : TVA récupérable par l'acheteur, transaction plus rapide, moins de risques de litige, et un paiement souvent comptant ou via financement pro.

## Préparer la vente : les 5 étapes clés

### 1. Fixer le bon prix
Consultez les annonces similaires sur RoullePro pour estimer la fourchette de prix de votre modèle. Prenez en compte l'année, le kilométrage, l'état, les options et l'historique d'entretien.

### 2. Réunir les documents
- Carte grise barrée
- Certificat de non-gage (gratuit sur histovec.interieur.gouv.fr)
- Contrôle technique de moins de 6 mois
- Factures d'entretien
- Livret de bord / carnet d'entretien

### 3. Préparer le véhicule
Un nettoyage intérieur/extérieur et des photos soignées (10 max sur RoullePro) augmentent la vitesse de vente de 30 %.

### 4. Rédiger une annonce efficace
Mentionnez : marque, modèle, année, kilométrage, énergie, boîte, PTAC, volume utile, charge utile, équipements spécifiques (hayon, attelage, GPS), historique.

### 5. Gérer les demandes
Avec RoullePro, la messagerie intégrée centralise tous les contacts acheteurs. Répondez sous 24h pour maximiser vos chances.

## Fiscalité : ce qu'il faut retenir
La vente d'un utilitaire entre professionnels est soumise à la TVA si vous êtes assujetti. L'acheteur pourra la récupérer, ce qui rend votre prix HT plus attractif que sur les plateformes grand public.

## Erreurs à éviter
- Surévaluer le prix → annonce qui stagne
- Photos de mauvaise qualité → moins de clics
- Description vague → acheteurs qui passent leur tour
- Délais de réponse longs → perte de confiance

## Passez Pro pour vendre plus vite
Le plan Pro (19 €/mois) vous donne 5 annonces simultanées, une mise en avant mensuelle et un badge vendeur Pro qui inspire confiance.

## Questions fréquentes

### Faut-il un contrôle technique pour vendre un utilitaire à un professionnel ?
Oui. La vente d'un véhicule utilitaire de plus de 4 ans exige un contrôle technique de moins de 6 mois au moment de la cession, même entre professionnels. Seul un acheteur qui revend sans immatriculer à son nom (marchand de biens) peut en être dispensé.

### La TVA s'applique-t-elle à la vente entre professionnels ?
Oui, si le vendeur est assujetti à la TVA. La vente se fait alors HT + TVA, et l'acheteur professionnel récupère cette TVA. C'est ce qui rend le prix HT plus attractif qu'une vente à un particulier.

### Combien de temps faut-il pour vendre un utilitaire entre pros ?
Entre professionnels, la vente est généralement plus rapide qu'auprès d'un particulier : quelques jours à deux semaines pour un modèle courant bien positionné en prix, contre plusieurs semaines sur les plateformes grand public.

### Quels documents remettre à l'acheteur ?
La carte grise barrée avec mention « vendu le [date] », le certificat de cession (Cerfa 15776), un certificat de non-gage de moins de 15 jours, le contrôle technique en cours de validité et, idéalement, les factures d'entretien.
`,
  },
  {
    slug: "acheter-camion-frigorifique-occasion",
    title: "Acheter un camion frigorifique d'occasion : check-list complète",
    excerpt:
      "Le camion frigo est un investissement lourd. Avant d'acheter, vérifiez le groupe froid, l'étanchéité, l'isolation et l'attestation ATP. Notre guide pratique.",
    category: "Guide acheteur",
    date: "2026-03-28",
    readingTime: 7,
    keywords: [
      "camion frigorifique occasion",
      "acheter fourgon frigo",
      "attestation ATP",
      "groupe froid Thermo King Carrier",
    ],
    content: `
## Pourquoi bien choisir son frigo d'occasion ?

Un camion frigorifique mal entretenu peut coûter plus cher en réparations qu'un neuf en leasing. Avant de signer, voici les points à contrôler.

## Les 8 points de contrôle essentiels

### 1. Le groupe froid
Marque (Thermo King, Carrier, Zanotti, Frigoblock), année, heures de fonctionnement, dernière révision. Un groupe froid a une durée de vie de 15 000 à 20 000 heures.

### 2. L'étanchéité de la caisse
Recherchez traces d'humidité, moisissures, joints abîmés. Un test d'étanchéité (test ATP K) est un bon indicateur.

### 3. L'isolation
La valeur K mesure l'isolation (W/m²·K). Plus elle est basse, mieux c'est. Pour du surgelé (classe F), K doit être ≤ 0,40.

### 4. L'attestation ATP
Document obligatoire pour le transport de denrées périssables. Vérifiez la date de validité (renouvellement tous les 6, 9 ou 12 ans selon classe).

### 5. Le châssis porteur
Kilométrage, état moteur, boîte, embrayage, historique entretien — les critères classiques d'un utilitaire.

### 6. Les équipements intérieurs
Rails, cloisons mobiles, crochets de suspension, éclairage LED, sol anti-dérapant.

### 7. Les options utiles
Hayon élévateur (500-1500 kg), GPS temps réel, enregistreur de température, porte latérale.

### 8. Le dossier administratif
Carte grise, contrôle technique, historique ATP, factures d'entretien du groupe froid.

## Fourchette de prix 2026
- Fourgon frigo 3,5t d'occasion : 18 000 € à 45 000 €
- Porteur 7,5t frigo : 35 000 € à 70 000 €
- Porteur 19t multitempérature : 60 000 € à 120 000 €

## Astuce RoullePro
Activez une alerte sur la catégorie "Utilitaire" avec filtre "Frigorifique" pour être notifié dès qu'une annonce correspond à votre budget.

## Questions fréquentes

### Qu'est-ce que l'attestation ATP et est-elle obligatoire ?
L'attestation ATP (Accord relatif aux Transports internationaux de denrées Périssables) certifie que la caisse frigorifique respecte les normes d'isolation et de froid. Elle est obligatoire pour transporter des denrées périssables sous température dirigée. Sa validité est de 6 ans à la première mise en service, puis renouvelable par périodes de 3 ans après contrôle.

### Combien d'heures dure un groupe froid d'occasion ?
Un groupe froid (Thermo King, Carrier, Zanotti, Frigoblock) a une durée de vie moyenne de 15 000 à 20 000 heures de fonctionnement. Avant d'acheter, demandez le compteur horaire et l'historique des révisions : au-delà de 15 000 heures, prévoyez un budget de remise en état.

### Quel est le prix d'un camion frigorifique d'occasion en 2026 ?
En 2026, un fourgon frigo 3,5 t d'occasion se négocie entre 18 000 € et 45 000 €, un porteur 7,5 t entre 35 000 € et 70 000 €, et un porteur 19 t multitempérature entre 60 000 € et 120 000 €, selon l'âge, le kilométrage et l'état du groupe froid.

### Que signifie la valeur K pour l'isolation ?
La valeur K mesure la performance d'isolation de la caisse en W/m²·K : plus elle est basse, meilleure est l'isolation. Pour transporter des produits surgelés (classe F), la valeur K doit être inférieure ou égale à 0,40.
`,
  },
  {
    slug: "fiscalite-utilitaire-professionnel-2026",
    title: "Fiscalité d'un utilitaire professionnel en 2026 : TVA, amortissement, TVS",
    excerpt:
      "Tout savoir sur la récupération de TVA, l'amortissement comptable et la taxe sur les véhicules de société (TVS/TAVS) pour votre utilitaire.",
    category: "Fiscalité",
    date: "2026-02-15",
    readingTime: 8,
    keywords: [
      "fiscalité utilitaire",
      "TVA récupérable fourgon",
      "amortissement véhicule professionnel",
      "TVS 2026",
      "TAVS",
    ],
    content: `
## Utilitaire : un régime fiscal avantageux

Contrairement aux véhicules de tourisme, les utilitaires (catégorie N1 "Camion" sur la carte grise) bénéficient d'un régime fiscal très favorable.

## 1. Récupération intégrale de la TVA
- TVA à l'achat : 100 % récupérable si le véhicule est affecté à l'activité professionnelle.
- TVA sur le carburant gazole : 80 % récupérable (100 % pour les VU exclusivement professionnels).
- TVA sur l'entretien, les pièces et les péages : 100 % récupérable.

## 2. Amortissement comptable
Durée classique : 5 ans en linéaire (20 %/an).
- Possibilité d'amortissement dégressif si l'entreprise y est éligible.
- Plafond déductible : aucun plafond pour les utilitaires (contrairement aux véhicules de tourisme plafonnés à 18 300 € ou 9 900 €).

## 3. TVS/TAVS (Taxe sur les véhicules de société)
Depuis 2023, la TVS a été remplacée par deux taxes distinctes :
- **TAVS** (taxe annuelle sur les émissions de CO₂)
- **TAVP** (taxe annuelle sur l'ancienneté des véhicules polluants)

**Bonne nouvelle** : les utilitaires (N1) sont exonérés de ces deux taxes. Elles ne concernent que les véhicules de tourisme (M1).

## 4. Bonus / Malus écologique
Les véhicules utilitaires électriques neufs bénéficient d'un bonus écologique de 4 000 € (entreprises) en 2026.

## 5. Cas particulier : véhicule à double usage
Si votre utilitaire dispose d'une banquette arrière, il peut être requalifié en VP (véhicule particulier) → perte des avantages TVA + soumis à TVS. Vérifiez la mention "CTTE" ou "CAMION" sur la carte grise.

## Exemple chiffré
Achat d'un fourgon 30 000 € HT :
- TVA récupérée : 6 000 €
- Amortissement annuel déductible : 6 000 €
- Économie d'impôt sur 5 ans (IS 25 %) : 7 500 €
- **Coût net réel sur 5 ans : ~16 500 €** vs 36 000 € TTC affichés.

## Avertissement
Cette page a une valeur informative. Consultez votre expert-comptable pour votre situation spécifique.

## Questions fréquentes

### Peut-on récupérer 100 % de la TVA sur un utilitaire ?
Oui. La TVA à l'achat d'un véhicule utilitaire (catégorie N1 "Camion" ou "CTTE" sur la carte grise) est récupérable à 100 % s'il est affecté à l'activité professionnelle. La TVA sur l'entretien, les pièces et les péages est également récupérable à 100 %, et celle sur le gazole à 80 % (100 % pour les VU exclusivement professionnels).

### Les utilitaires sont-ils soumis à la TVS en 2026 ?
Non. Les véhicules utilitaires de catégorie N1 sont exonérés des deux taxes qui ont remplacé la TVS depuis 2023 : la TAVS (taxe annuelle sur les émissions de CO₂) et la TAVP (taxe sur l'ancienneté des véhicules polluants). Ces taxes ne concernent que les véhicules de tourisme (M1).

### Sur combien d'années amortir un utilitaire professionnel ?
La durée classique d'amortissement d'un utilitaire est de 5 ans en linéaire (20 % par an). Contrairement aux véhicules de tourisme (plafonnés à 18 300 € ou 9 900 €), les utilitaires ne subissent aucun plafond de déduction sur l'amortissement.

### Un utilitaire avec banquette arrière perd-il ses avantages fiscaux ?
Oui, potentiellement. Si l'utilitaire dispose d'une banquette arrière, il peut être requalifié en véhicule particulier (VP), entraînant la perte des avantages TVA et l'assujettissement aux taxes. Vérifiez la mention "CTTE" ou "CAMION" sur la carte grise pour conserver le régime fiscal favorable.
`,
  },
];

// Tentative d'import des nouveaux articles (fichier optionnel)
// Si blog-new-posts.ts n'existe pas encore, on fallback sur POSTS seul.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NEW_POSTS: BlogPost[] = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("./blog-new-posts");
    return Array.isArray(mod?.NEW_POSTS) ? (mod.NEW_POSTS as BlogPost[]) : [];
  } catch {
    return [];
  }
})();

// Fichier additionnel pour les articles SEO long-format
const SEO_POSTS: BlogPost[] = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("./blog-seo-posts");
    return Array.isArray(mod?.SEO_POSTS) ? (mod.SEO_POSTS as BlogPost[]) : [];
  } catch {
    return [];
  }
})();

// Cluster transport sanitaire (15 articles SEO medical)
const MEDICAL_POSTS: BlogPost[] = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("./blog-medical-posts");
    return Array.isArray(mod?.MEDICAL_POSTS) ? (mod.MEDICAL_POSTS as BlogPost[]) : [];
  } catch {
    return [];
  }
})();

// Cluster transport sanitaire — articles villes/CPAM Q2 2026 (10 articles SEO)
const SEO_VILLES_POSTS: BlogPost[] = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("./blog-seo-villes");
    return Array.isArray(mod?.SEO_VILLES_POSTS)
      ? (mod.SEO_VILLES_POSTS as BlogPost[])
      : [];
  } catch {
    return [];
  }
})();

// Cluster transactionnel — vague juin 2026 (tarif VSL, VSL/ambulance autour de moi)
const TRANSACTIONAL_POSTS: BlogPost[] = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("./blog-transactional-posts");
    return Array.isArray(mod?.TRANSACTIONAL_POSTS)
      ? (mod.TRANSACTIONAL_POSTS as BlogPost[])
      : [];
  } catch {
    return [];
  }
})();

const ALL_POSTS: BlogPost[] = [
  ...POSTS,
  ...NEW_POSTS,
  ...SEO_POSTS,
  ...MEDICAL_POSTS,
  ...SEO_VILLES_POSTS,
  ...TRANSACTIONAL_POSTS,
];

/* ----------------------------- CATÉGORIES ----------------------------- */

export interface BlogCategory {
  slug: string;
  label: string;
  description: string;
  color: string; // classe tailwind bg/text
}

export const CATEGORIES: BlogCategory[] = [
  {
    slug: "transport-sanitaire",
    label: "Transport sanitaire",
    description:
      "Ambulance, VSL, taxi conventionne : guide complet du transport medical en France, prescription, remboursement et demarches.",
    color: "from-sky-500 to-cyan-600",
  },
  {
    slug: "guide-vendeur",
    label: "Guide vendeur",
    description:
      "Toutes les clés pour vendre un véhicule professionnel rapidement et au juste prix.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    slug: "guide-acheteur",
    label: "Guide acheteur",
    description:
      "Bien choisir, inspecter et négocier un utilitaire, un taxi ou un VTC d'occasion.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    slug: "fiscalite",
    label: "Fiscalité",
    description:
      "TVA, amortissements, taxes sur les véhicules de société, bonus écologique.",
    color: "from-amber-500 to-orange-600",
  },
  {
    slug: "financement",
    label: "Financement",
    description:
      "Crédit, leasing, LOA, LLD : comparatifs et stratégies pour optimiser votre trésorerie.",
    color: "from-violet-500 to-purple-600",
  },
  {
    slug: "metier",
    label: "Métier",
    description:
      "Guides spécifiques taxi, VTC, ambulance, transport sanitaire, artisan BTP.",
    color: "from-rose-500 to-pink-600",
  },
  {
    slug: "ecologie",
    label: "Écologie",
    description:
      "Véhicules électriques, ZFE, transition énergétique pour les pros du transport.",
    color: "from-green-500 to-lime-600",
  },
  {
    slug: "actualites",
    label: "Actualités",
    description:
      "L'actualité réglementaire et économique du transport professionnel.",
    color: "from-slate-500 to-gray-700",
  },
];

/** Convertit un libellé de catégorie ("Guide acheteur") en slug URL ("guide-acheteur") */
export function categoryLabelToSlug(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getCategoryBySlug(slug: string): BlogCategory | null {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}

export function getPostsByCategorySlug(slug: string): BlogPost[] {
  return ALL_POSTS.filter((p) => categoryLabelToSlug(p.category) === slug).sort(
    (a, b) => (a.date < b.date ? 1 : -1)
  );
}

/* ----------------------------- API PUBLIQUE ----------------------------- */

export function getAllPosts(): BlogPost[] {
  return [...ALL_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  return ALL_POSTS.find((p) => p.slug === slug) || null;
}

export function getAllSlugs(): string[] {
  return ALL_POSTS.map((p) => p.slug);
}

/** Articles similaires : même catégorie, excluant l'article courant, limit 3 */
export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return ALL_POSTS.filter(
    (p) => p.category === post.category && p.slug !== post.slug
  )
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);
}

/** Les N derniers articles toutes catégories confondues */
export function getLatestPosts(limit = 3): BlogPost[] {
  return getAllPosts().slice(0, limit);
}

function normaliserTexte(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Articles dont le titre, le slug ou les mots-clés contiennent l'un des termes
 * fournis (recherche insensible aux accents et à la casse). Utilisé pour le
 * maillage bidirectionnel pilier -> blog. Triés du plus récent au plus ancien.
 */
export function getPostsByKeywords(needles: string[], limit = 3): BlogPost[] {
  const termes = needles.map(normaliserTexte).filter(Boolean);
  if (termes.length === 0) return [];
  return getAllPosts()
    .filter((p) => {
      const haystack = normaliserTexte(
        [p.title, p.slug, ...p.keywords].join(" ")
      );
      return termes.some((t) => haystack.includes(t));
    })
    .slice(0, limit);
}

/* ----------------------------- IMAGES ----------------------------- */

/** Slugs de catégorie disposant d'un visuel placeholder dédié dans /public/blog/categories. */
const CATEGORY_IMAGE_SLUGS = new Set(CATEGORIES.map((c) => c.slug));

/**
 * Détermine l'image et le texte alternatif à afficher pour un article.
 * Ordre de priorité :
 *   1. Image propre à l'article (post.image), avec alt = post.imageAlt ou, à défaut, post.title.
 *   2. Visuel générique de la catégorie : /blog/categories/<slug-categorie>.svg.
 *   3. Fallback ultime si la catégorie est inconnue : /blog/categories/default.svg.
 */
export function getPostImage(post: BlogPost): { src: string; alt: string } {
  if (post.image) {
    return { src: post.image, alt: post.imageAlt || post.title };
  }
  const categorySlug = categoryLabelToSlug(post.category);
  const slug = CATEGORY_IMAGE_SLUGS.has(categorySlug) ? categorySlug : "default";
  return {
    src: `/blog/categories/${slug}.svg`,
    alt: `Illustration de la catégorie ${post.category}`,
  };
}
