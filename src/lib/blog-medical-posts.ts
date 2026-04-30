import type { BlogPost } from "./blog";
import { ARTICLES as ARTICLES_A } from "./blog-medical-A"; // Articles 2, 3 (piliers)
import { ARTICLES as ARTICLES_B } from "./blog-medical-B"; // Articles 4, 5, 6, 7 (Comment faire)
import { ARTICLES as ARTICLES_C } from "./blog-medical-C"; // Articles 8, 9, 10, 11 (Reglementation)
import { ARTICLES as ARTICLES_D } from "./blog-medical-D"; // Articles 14, 15 (B2B)
import { ARTICLES as ARTICLES_E } from "./blog-medical-E"; // Articles 12, 13 x 10 villes

/**
 * Articles SEO transport sanitaire (cluster medical).
 * Cluster pilier + comment faire + reglementation + SEO local + B2B.
 * Total : 33 articles (1 pilier seed + 32 generes).
 * Mis a jour : avril 2026.
 */
const PILLAR_POSTS: BlogPost[] = [
  // ============================================================
  // ARTICLE 1 — PILIER : Difference ambulance / VSL / taxi conventionne (seed)
  // ============================================================
  {
    slug: "difference-ambulance-vsl-taxi-conventionne",
    title: "Ambulance, VSL ou taxi conventionne : quelles differences ?",
    excerpt:
      "Ambulance, VSL, taxi conventionne : on vous explique les 3 types de transport medical rembourse, leurs criteres et comment choisir. Trouvez un professionnel pres de chez vous.",
    category: "Transport sanitaire",
    date: "2026-04-29",
    readingTime: 12,
    keywords: [
      "difference ambulance VSL taxi conventionne",
      "ambulance VSL difference",
      "choisir transport medical",
      "quel transport medical choisir",
      "transport sanitaire rembourse",
      "prescription medicale de transport",
    ],
    content: `
Mis a jour le 29 avril 2026

Quand votre medecin vous prescrit un transport medical, il choisit entre trois modes precis : ambulance, vehicule sanitaire leger (VSL) ou taxi conventionne. Ce n'est jamais a vous de decider : la **difference ambulance VSL taxi conventionne** repose sur votre etat de sante, et chaque mode est strictement encadre par la Securite sociale. Cet article vous explique en detail ce qui distingue ces trois transports, comment ils sont rembourses et comment trouver un professionnel agree pres de chez vous.

## C'est quoi une ambulance ?

L'ambulance est le seul mode de transport sanitaire concu pour transporter un patient en position **allongee**, avec une prise en charge medicale pendant le trajet. C'est le niveau le plus medicalise des transports sanitaires non urgents.

### Quand est-elle prescrite ?

Le medecin prescrit une ambulance lorsque le patient ne peut pas se tenir assis pendant le trajet, lorsqu'il necessite une surveillance constante (oxygenotherapie, perfusion, monitoring), ou lorsqu'il sort d'une intervention chirurgicale lourde. Selon [Ameli.fr](https://www.ameli.fr/assure/remboursements/rembourse/transport-rembourse-deplacement/transport-rembourse-deplacement), l'ambulance est obligatoire des que le transport allonge est medicalement justifie.

### Ce qu'elle comprend

- Un brancard rigide ou roulant adapte au transport allonge
- Au minimum **deux ambulanciers diplomes d'Etat** (DEA) ou auxiliaires ambulanciers
- Du materiel medical embarque : bouteille d'oxygene, defibrillateur, aspirateur de mucosites, tensiometre
- Une cabine sanitaire pouvant etre desinfectee entre chaque patient

### Prix et remboursement d'une ambulance

Le tarif d'une ambulance est fixe par convention nationale CPAM : il combine un forfait de prise en charge (autour de 60 a 70 euros) et un tarif kilometrique (environ 2,30 euros/km en agglomeration). Le remboursement est de 65 % du tarif conventionne en regime general, et de 100 % pour les patients en affection de longue duree (ALD), maternite, accident du travail ou hospitalisation. La franchise medicale de 2 euros par trajet s'applique sauf cas d'exoneration.

## C'est quoi un VSL (Vehicule Sanitaire Leger) ?

Le VSL est un vehicule **non medicalise** mais agree pour le transport assis professionnalise de patients. Concretement, c'est une berline ou un break clairement identifiable (croix bleue a 6 branches, gyrophare bleu) conduit par un auxiliaire ambulancier forme.

### Difference entre VSL et ambulance

La distinction est nette : **un VSL transporte un patient assis**, tandis qu'une ambulance transporte un patient couche. Le VSL n'embarque pas de materiel de reanimation et le conducteur n'a pas pour mission d'effectuer des soins pendant le trajet. En revanche, il est forme aux gestes de premiers secours et peut transporter jusqu'a 3 patients simultanement (transport partage).

### Conditions medicales donnant droit a un VSL

Le VSL est prescrit lorsque le patient a besoin d'une **aide pour entrer ou sortir du vehicule** (deficience temporaire ou chronique), d'un transport "couche" allege, ou d'une assistance dans son deplacement sans necessiter une medicalisation. Exemples typiques : suite de chimiotherapie, retour de dialyse, suite de chute, patiente en grossesse pathologique.

### Comment fonctionne le remboursement du VSL ?

Le VSL est rembourse aux memes taux que l'ambulance (65 % regime general, 100 % en ALD). Le tiers payant integral est applique systematiquement : vous n'avancez pas les frais. Le transporteur facture directement la CPAM avec votre carte Vitale et le bon de transport.

## C'est quoi un taxi conventionne ?

Un taxi conventionne est un taxi classique qui a signe une **convention specifique avec la CPAM** lui permettant de transporter des patients sur prescription medicale, avec dispense d'avance de frais. Ce n'est pas un metier different : c'est le **meme chauffeur de taxi** qui propose ce service en complement de son activite normale.

### Taxi conventionne vs taxi classique

Trois differences fondamentales :

1. Le **vehicule reste un taxi standard** : pas de croix sanitaire, pas de gyrophare bleu, pas de brancard
2. Le chauffeur a suivi une **formation aux premiers secours** et signe la convention CPAM
3. Le tarif est plafonne par la convention departementale (different du tarif preferiel taxi classique)

Si vous prenez un taxi non conventionne pour vous rendre a un soin, **votre transport ne sera pas rembourse**, meme avec une prescription valide.

### Qui peut utiliser un taxi conventionne ?

Le taxi conventionne est prescrit aux patients qui **n'ont pas besoin d'aide particuliere** pour se deplacer mais dont l'etat justifie un transport medical (fatigue post-traitement, contre-indication a la conduite, eloignement du domicile par rapport au lieu de soin). C'est typiquement le cas pour les patients en ALD valides qui se rendent a leurs seances regulieres.

### Remboursement taxi conventionne par la CPAM

Le remboursement suit les memes regles : 65 % en regime general, 100 % en ALD ou exoneration. Le **tiers payant** est obligatoire : vous presentez votre carte Vitale, votre bon de transport (CERFA 11574), et vous ne payez rien sauf eventuellement la franchise et le ticket moderateur.

## Comment choisir entre ambulance, VSL et taxi conventionne ?

C'est votre **medecin** qui tranche, en fonction de votre etat. Voici un tableau comparatif synthetique pour comprendre la logique :

| Critere | Ambulance | VSL | Taxi conventionne |
|---|---|---|---|
| Etat du patient | Allonge obligatoire | Assis avec aide | Assis autonome |
| Personnel | 2 ambulanciers diplomes | 1 auxiliaire ambulancier | Chauffeur conventionne |
| Materiel medical | Oxygene, brancard, defibrillateur | Basique (premiers secours) | Aucun |
| Remboursement CPAM | 65 % / 100 % ALD | 65 % / 100 % ALD | 65 % / 100 % ALD |
| Prescription requise | Oui (CERFA 11574) | Oui (CERFA 11574) | Oui (CERFA 11574) |
| Disponibilite | 24h/24 | Horaires variables | Variable (selon chauffeur) |
| Transport partage | Non | Oui possible | Oui possible |
| Identification | Croix bleue + gyrophare | Croix bleue + gyrophare bleu | Lumineux taxi standard |

Concretement : plus votre etat necessite de surveillance, plus le mode prescrit est medicalise. Une grande majorite des transports sanitaires en France sont realises en VSL ou en taxi conventionne, l'ambulance etant reservee aux situations qui justifient vraiment l'allonge ou la medicalisation.

## C'est votre medecin qui decide, pas vous

Beaucoup de patients pensent pouvoir "demander" un type de transport precis. C'est inexact : la prescription engage le medecin, qui doit attester que l'etat du patient correspond aux criteres reglementaires d'un mode donne. Le code de la Securite sociale est strict : tout transport prescrit en dessus du besoin reel peut etre conteste par la CPAM.

### Le role de la prescription medicale de transport

Le formulaire CERFA 11574*05 ([disponible sur Service-public.fr](https://www.service-public.fr/particuliers/vosdroits/R45050)) coche obligatoirement l'un des trois modes : ambulance, VSL ou taxi conventionne. Le medecin justifie son choix par le motif medical et la situation du patient (etat allonge, deambulation, autonomie). Cette prescription est la condition prealable a tout remboursement.

### Que faire si vous n'etes pas d'accord avec la prescription ?

Si votre medecin prescrit un VSL alors que vous estimez avoir besoin d'une ambulance (ou inversement), vous pouvez :
- Lui demander d'expliquer son choix et reevaluer votre etat
- Solliciter un second avis aupres d'un autre medecin (medecin traitant, specialiste)
- Contacter le service medical de votre CPAM en cas de desaccord persistant

A l'inverse, **vous ne pouvez pas demander a un transporteur de modifier le mode prescrit** : il doit appliquer ce qui est inscrit sur le bon de transport sous peine de non-remboursement.

## Comment trouver un professionnel agree pres de chez vous ?

Pour beneficier du remboursement, vous devez choisir un **transporteur agree CPAM**. RoullePro recense les ambulanciers, societes de VSL et taxis conventionnes par ville et par departement, avec contacts directs et horaires.

Quelques liens utiles pour trouver un professionnel rapidement :

- [Trouver une ambulance, VSL ou taxi a Paris](https://roullepro.com/transport-medical/paris)
- [Trouver une ambulance, VSL ou taxi a Lyon](https://roullepro.com/transport-medical/lyon)
- [Trouver une ambulance, VSL ou taxi a Marseille](https://roullepro.com/transport-medical/marseille)
- [Acceder a l'annuaire complet par ville](https://roullepro.com/transport-medical)

Pour aller plus loin sur les aspects pratiques, consultez notre guide [Remboursement transport medical 2026](https://roullepro.com/blog/remboursement-transport-medical) et notre fiche pratique [Comment reserver un taxi conventionne ou un VSL](https://roullepro.com/blog/reserver-taxi-conventionne-vsl).

## Questions frequentes

### Quelle est la difference entre un VSL et une ambulance ?

Un VSL transporte un patient assis avec une legere assistance, sans materiel medical embarque. Une ambulance transporte un patient allonge avec deux ambulanciers diplomes et du materiel de reanimation. Les deux sont rembourses par la Securite sociale au meme taux mais ne s'appliquent pas aux memes situations medicales.

### Un taxi conventionne est-il rembourse par la Secu ?

Oui, a condition d'avoir une prescription medicale (bon CERFA 11574) et de choisir un taxi qui a signe la convention CPAM. Le remboursement est de 65 % du tarif conventionne (100 % en ALD), avec tiers payant : vous ne faites pas l'avance.

### Puis-je choisir mon type de transport medical ?

Non. C'est le medecin prescripteur qui choisit le mode adapte a votre etat de sante. Vous pouvez en revanche choisir librement le **transporteur** (l'entreprise) parmi ceux agrees CPAM dans votre zone.

### Mon medecin peut-il prescrire n'importe quel type de transport ?

Le medecin doit justifier le mode prescrit par l'etat du patient. Il ne peut pas prescrire une ambulance pour un trajet qui ne necessite pas d'allonge, ni un taxi conventionne pour un patient incapable de tenir assis. Une prescription inadaptee peut etre rejetee par le service medical de la CPAM.

### Combien coute un transport en ambulance sans prescription ?

Sans prescription, l'integralite des frais est a votre charge : le forfait de prise en charge (60-70 euros) plus le kilometrage (2-2,50 euros/km). Pour un trajet de 30 km en agglomeration, comptez environ 130 a 150 euros, sans aucun remboursement possible par la CPAM.

---

*Contenu verifie par l'equipe RoullePro — Annuaire de reference des transports sanitaires en France. Sources : [Ameli.fr](https://www.ameli.fr/assure/remboursements/rembourse/transport-rembourse-deplacement/transport-rembourse-deplacement), [Ministere de la Sante](https://sante.gouv.fr/professionnels/gerer-un-etablissement-de-sante-medico-social/transports-sanitaires), [Service-public.fr](https://www.service-public.fr/particuliers/vosdroits/F954).*
`,
  },
];


export const MEDICAL_POSTS: BlogPost[] = [
  ...PILLAR_POSTS,
  ...ARTICLES_A,
  ...ARTICLES_B,
  ...ARTICLES_C,
  ...ARTICLES_D,
  ...ARTICLES_E,
];

