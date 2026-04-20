/**
 * Index des articles de blog statiques.
 * Pour ajouter un article : créer un nouvel export et l'inclure dans POSTS.
 */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // ISO
  readingTime: number;
  /** Contenu Markdown-like — rendu via une fonction simple dans la page */
  content: string;
  keywords: string[];
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
`,
  },
];

export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  return POSTS.find((p) => p.slug === slug) || null;
}

export function getAllSlugs(): string[] {
  return POSTS.map((p) => p.slug);
}
