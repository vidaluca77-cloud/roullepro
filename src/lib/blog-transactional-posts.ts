/**
 * Articles transactionnels à forte intention (vague juin 2026).
 * Cibles SEO issues de la Search Console (requêtes striking-distance, fort volume,
 * sans article dédié à ce jour) :
 *   - "tarif vsl 2026"        → aucun article tarif VSL dédié
 *   - "vsl autour de moi"     → volume ~880, position ~12 (page 2)
 *   - "ambulance autour de moi" → ~524 impressions, 0 clic, position ~11.6
 *
 * Aucune duplication avec les articles existants (remboursement, agrément CPAM,
 * tarif taxi, ALD…). Ces articles couvrent un angle nouveau et maillent vers
 * l'existant.
 */
import type { BlogPost } from "./blog";

export const TRANSACTIONAL_POSTS: BlogPost[] = [
  {
    slug: "tarif-vsl-2026-prix-prise-en-charge",
    title: "Tarif VSL 2026 : prix, prise en charge et reste à charge",
    h1: "Tarif d'un VSL en 2026 : prix, remboursement et reste à charge",
    excerpt:
      "Combien coûte un VSL (véhicule sanitaire léger) en 2026 ? Structure de la tarification conventionnée, prise en charge par l'Assurance Maladie, exemples chiffrés et reste à charge réel du patient.",
    category: "Transport sanitaire",
    date: "2026-06-24",
    readingTime: 8,
    image: "/blog/tarif-taxi-conventionne-2026-grille-cpam.jpg",
    imageAlt:
      "Véhicule sanitaire léger VSL stationné devant un établissement de soins avec document de prise en charge",
    keywords: [
      "tarif vsl",
      "tarif vsl 2026",
      "prix vsl",
      "prix vsl cpam",
      "remboursement vsl",
      "vsl prise en charge",
    ],
    content: `
**En résumé : le tarif d'un VSL (véhicule sanitaire léger) repose sur une grille conventionnée signée entre les transporteurs sanitaires et l'Assurance Maladie. Il combine un forfait de prise en charge, un tarif kilométrique et, le cas échéant, un abattement pour transport partagé. Sur prescription médicale, le VSL est remboursé à 65 % par l'Assurance Maladie (100 % en ALD, hospitalisation ou accident du travail), généralement sans avance de frais grâce au tiers payant. Le reste à charge se limite donc le plus souvent au ticket modérateur et à la franchise médicale.**

Le VSL, ou véhicule sanitaire léger, est un transport assis professionnalisé destiné aux patients autonomes mais nécessitant l'aide d'un personnel formé au transport sanitaire. Beaucoup de patients se demandent combien coûte réellement un trajet en VSL et ce qui reste à leur charge. Ce guide détaille la tarification 2026 et donne des ordres de grandeur concrets.

## Qu'est-ce qu'un VSL et qui peut en bénéficier ?

Le VSL est un véhicule agréé pour le transport assis de patients dont l'état nécessite une aide ou une surveillance, mais pas un transport allongé. Il se distingue du taxi conventionné par le statut de transporteur sanitaire et la formation du conducteur, et de l'ambulance par l'absence de transport allongé. Pour bien situer ces trois modes, consultez notre comparatif [VSL ou taxi conventionné](/blog/vsl-ou-taxi-conventionne-comparatif-2026) et notre guide [Ambulance, VSL ou taxi conventionné : quelles différences ?](/blog/difference-ambulance-vsl-taxi-conventionne).

Le recours au VSL est décidé par le médecin prescripteur, qui indique le mode de transport adapté à l'état du patient sur la prescription médicale de transport. C'est cette prescription qui conditionne la prise en charge.

## Comment se construit le tarif d'un VSL

### Les composantes de la tarification conventionnée

Le prix d'un VSL conventionné s'appuie sur plusieurs éléments encadrés par la convention nationale des transporteurs sanitaires :

- Un forfait de prise en charge au départ de la course.
- Un tarif kilométrique appliqué à la distance parcourue.
- Des majorations possibles (nuit, dimanche et jours fériés) selon les règles en vigueur.
- Un abattement obligatoire en cas de transport partagé (plusieurs patients transportés ensemble).

Le cadre général du remboursement des transports figure sur [Ameli.fr](https://www.ameli.fr/assure/remboursements/rembourse/transports). Contrairement au taxi conventionné dont la grille est négociée au niveau départemental, le VSL relève d'une tarification conventionnelle nationale, avec des forfaits d'agglomération qui peuvent varier selon la zone géographique.

### L'abattement pour transport partagé

Lorsque plusieurs patients sont transportés simultanément vers des soins (par exemple en dialyse), un abattement est appliqué au tarif. Ce mécanisme, encouragé par l'Assurance Maladie, réduit le coût global. Les règles du transport partagé sont détaillées dans notre article [Transport médical partagé : les nouvelles règles 2025-2026](/blog/transport-medical-partage-regles).

## Combien coûte un VSL en 2026 : ordres de grandeur

Le tableau ci-dessous présente des fourchettes indicatives pour un aller simple, avant prise en charge par l'Assurance Maladie. Ces valeurs illustrent la logique de tarification et ne constituent pas des tarifs officiels figés.

| Type de trajet | Fourchette indicative (aller) | Remarque |
| --- | --- | --- |
| Trajet urbain court (5 à 7 km) | 20 à 35 euros | Forfait de prise en charge déterminant |
| Trajet moyen (15 à 25 km) | 35 à 60 euros | Tarif kilométrique prépondérant |
| Trajet longue distance | Variable selon distance | Kilométrage déterminant |
| Transport partagé | Tarif réduit par abattement | Plusieurs patients ensemble |

Dans la grande majorité des cas, le patient prescrit ne paie pas ce montant directement : le tiers payant permet au transporteur de facturer l'Assurance Maladie.

## Quel remboursement pour un VSL en 2026 ?

Sur prescription médicale, le VSL est pris en charge selon les règles nationales :

- 65 % du tarif conventionné dans le cas général, le solde de 35 % étant le plus souvent couvert par la complémentaire santé.
- 100 % en affection de longue durée (ALD), en cas d'hospitalisation ou d'accident du travail.

Les conditions précises de prise en charge sont décrites sur [Service-Public.fr](https://www.service-public.fr/particuliers/vosdroits/F165). Pour connaître vos droits en ALD, consultez notre guide [Transport médical ALD 2026 : droits, prise en charge 100 % et démarches](/blog/transport-medical-ald-droits).

## Exemple détaillé de calcul

Prenons un patient en ALD effectuant un aller-retour de 12 km en VSL vers son centre de dialyse :

- Forfait de prise en charge appliqué au départ.
- Tarif kilométrique calculé sur la distance aller-retour.
- En ALD, l'Assurance Maladie rembourse 100 % du montant conventionné.
- Grâce au tiers payant, le patient n'avance rien.

Hors ALD, ce même trajet serait pris en charge à 65 %, le reste relevant de la complémentaire santé.

## Reste à charge réel : ce que paie vraiment le patient

Pour un transport prescrit et conventionné, le reste à charge est généralement très limité :

- En ALD ou hospitalisation : 0 euro grâce au 100 % et au tiers payant, hors franchise médicale.
- Hors ALD : le ticket modérateur de 35 %, le plus souvent remboursé par la complémentaire santé.

À cela s'ajoute la franchise médicale sur les transports, plafonnée annuellement, dont sont exonérées certaines personnes (bénéficiaires de la complémentaire santé solidaire, femmes enceintes dans certaines conditions, enfants mineurs). Les règles de cette franchise sont précisées sur [Ameli.fr](https://www.ameli.fr/assure/remboursements/reste-charge/franchise-medicale). Pour aller plus loin, notre article [Franchise médicale sur le transport sanitaire](/blog/franchise-medicale-transport-sanitaire) détaille son fonctionnement.

## VSL ou taxi conventionné : lequel coûte le moins cher ?

Le coût n'est pas le seul critère : c'est le médecin qui détermine le mode adapté à l'état du patient. À distance équivalente, les deux modes sont remboursés selon les mêmes taux (65 % ou 100 %). Le choix dépend donc surtout du besoin d'accompagnement : le VSL est conduit par un personnel formé au transport sanitaire, tandis que le taxi conventionné assure le transport sans dispenser de soins. Notre comparatif [VSL ou taxi conventionné](/blog/vsl-ou-taxi-conventionne-comparatif-2026) détaille ces critères.

## Trouver un VSL conventionné près de chez vous

Pour organiser un transport en VSL, vous pouvez rechercher un transporteur sanitaire agréé sur [RoullePro](/vsl). Notre annuaire recense les VSL, ambulances et taxis conventionnés par ville et par département, avec leurs coordonnées. Voir aussi notre guide [VSL autour de moi : trouver un VSL conventionné près de chez vous](/blog/vsl-autour-de-moi-trouver-vsl-conventionne).

## Questions fréquentes

### Quel est le tarif d'un VSL en 2026 ?

Le tarif d'un VSL repose sur une grille conventionnée nationale combinant un forfait de prise en charge et un tarif kilométrique. Pour un trajet urbain court, l'ordre de grandeur se situe entre 20 et 35 euros avant remboursement, mais le patient prescrit ne paie généralement rien grâce au tiers payant.

### Le VSL est-il remboursé par la Sécurité sociale ?

Oui. Sur prescription médicale, le VSL est remboursé à 65 % dans le cas général et à 100 % en ALD, hospitalisation ou accident du travail. Le complément est le plus souvent pris en charge par la complémentaire santé.

### Faut-il avancer les frais pour un VSL ?

Non, dans la plupart des cas. Le tiers payant permet au transporteur sanitaire de facturer directement l'Assurance Maladie. Le patient prescrit n'avance donc pas les frais.

### Quelle différence de prix entre un VSL et un taxi conventionné ?

À distance équivalente, VSL et taxi conventionné sont remboursés selon les mêmes taux. Les grilles diffèrent (nationale pour le VSL, départementale pour le taxi), mais le choix repose surtout sur le besoin d'accompagnement du patient, déterminé par le médecin.

### Le transport partagé en VSL coûte-t-il moins cher ?

Oui pour l'Assurance Maladie : un abattement est appliqué lorsque plusieurs patients sont transportés ensemble. Pour le patient prescrit, le remboursement reste calculé selon son taux habituel (65 % ou 100 %).
`,
  },
  {
    slug: "vsl-autour-de-moi-trouver-vsl-conventionne",
    title: "VSL autour de moi : trouver un VSL conventionné près de chez vous",
    h1: "VSL autour de moi : comment trouver un VSL conventionné rapidement",
    excerpt:
      "Vous cherchez un VSL conventionné près de chez vous pour un rendez-vous médical ? Méthode pour trouver un véhicule sanitaire léger disponible dans votre ville, vérifier l'agrément CPAM et organiser un transport remboursé.",
    category: "Transport sanitaire",
    date: "2026-06-25",
    readingTime: 7,
    image: "/blog/ambulance-pres-de-chez-moi-trouver-2026.jpg",
    imageAlt:
      "Patient cherchant un VSL conventionné autour de lui sur un smartphone devant son domicile",
    keywords: [
      "vsl autour de moi",
      "vsl pres de chez moi",
      "trouver un vsl",
      "vsl conventionne",
      "vsl disponible",
      "reserver vsl",
    ],
    content: `
**En résumé : pour trouver un VSL (véhicule sanitaire léger) autour de vous, le plus efficace est de rechercher un transporteur sanitaire agréé dans votre ville ou votre département, de vérifier son conventionnement CPAM, puis de réserver à l'avance en précisant la date, l'horaire et le motif médical. Sur RoullePro, vous pouvez localiser les VSL conventionnés près de chez vous et accéder directement à leurs coordonnées.**

Quand un médecin prescrit un transport en VSL, il faut trouver rapidement un véhicule disponible à proximité. La recherche « VSL autour de moi » est l'un des réflexes les plus courants. Voici comment procéder efficacement pour obtenir un transport assis professionnalisé, conventionné et remboursé.

## Qu'est-ce qu'un VSL et quand y avoir recours

Le VSL est un véhicule sanitaire léger destiné au transport assis de patients autonomes mais nécessitant l'aide d'un personnel formé. Il est prescrit par le médecin lorsque l'état du patient ne justifie ni un transport allongé en ambulance, ni un simple taxi. Pour comprendre les différences entre ces modes, consultez notre guide [Ambulance, VSL ou taxi conventionné : quelles différences ?](/blog/difference-ambulance-vsl-taxi-conventionne).

## Comment trouver un VSL conventionné près de chez vous

### 1. Rechercher par ville ou département

La méthode la plus directe est d'utiliser un annuaire géolocalisé des transporteurs sanitaires. Sur [RoullePro](/vsl), vous pouvez filtrer les VSL conventionnés par ville et accéder à leurs coordonnées en quelques clics. L'annuaire couvre l'ensemble du territoire, des grandes métropoles aux zones moins denses.

### 2. Vérifier le conventionnement CPAM

Pour que votre transport soit remboursé, le VSL doit être conventionné par l'Assurance Maladie. Cette information est indiquée sur la fiche du transporteur. Vous pouvez aussi recouper avec les guides locaux, par exemple [Ambulances agréées CPAM à Montpellier](/blog/ambulance-agreee-cpam-montpellier) ou les équivalents pour [Lyon](/blog/ambulance-agreee-cpam-lyon), [Marseille](/blog/ambulance-agreee-cpam-marseille) et [Paris](/blog/ambulance-agreee-cpam-paris).

### 3. Réserver à l'avance

Pour un transport programmé (consultation, dialyse, chimiothérapie, séance de soins), réservez idéalement plusieurs jours à l'avance. Précisez la date, l'horaire, l'adresse de départ et de destination, ainsi que le motif médical. Notre guide [Comment réserver un taxi conventionné ou un VSL pour un rendez-vous médical ?](/blog/reserver-taxi-conventionne-vsl) détaille la marche à suivre.

## Ce qu'il faut préparer avant d'appeler un VSL

Pour faciliter la prise en charge et le remboursement, munissez-vous des éléments suivants :

- La prescription médicale de transport établie par votre médecin.
- Votre carte Vitale et votre attestation de droits.
- Le cas échéant, votre notification d'ALD pour bénéficier du 100 %.
- Les adresses précises de départ et d'arrivée, ainsi que l'horaire du rendez-vous.

## Combien coûte un VSL et quel remboursement ?

Sur prescription, le VSL est remboursé à 65 % (100 % en ALD), généralement sans avance de frais grâce au tiers payant. Pour comprendre la tarification et le reste à charge, consultez notre guide dédié [Tarif VSL 2026 : prix, prise en charge et reste à charge](/blog/tarif-vsl-2026-prix-prise-en-charge). Le cadre national du remboursement est présenté sur [Ameli.fr](https://www.ameli.fr/assure/remboursements/rembourse/transports).

## VSL indisponible : quelles alternatives ?

Si aucun VSL n'est disponible à l'horaire souhaité, plusieurs solutions existent :

- Élargir la recherche aux communes voisines de votre département.
- Envisager un taxi conventionné, si votre prescription le permet, via notre comparatif [VSL ou taxi conventionné](/blog/vsl-ou-taxi-conventionne-comparatif-2026).
- Anticiper davantage pour les trajets récurrents (dialyse, cures), en fixant un transporteur attitré.

Si votre transporteur habituel ne répond pas, notre article [Votre ambulance ou transport médical ne répond pas ? Que faire ?](/blog/ambulance-ne-repond-pas-que-faire) propose une marche à suivre.

## Trouver votre VSL maintenant

Pour localiser un VSL conventionné autour de vous, lancez votre recherche sur [RoullePro](/vsl) en indiquant votre ville. Vous accédez immédiatement aux transporteurs sanitaires de votre secteur et à leurs coordonnées.

## Questions fréquentes

### Comment trouver un VSL près de chez moi ?

Recherchez un transporteur sanitaire agréé dans votre ville via un annuaire géolocalisé comme RoullePro, vérifiez son conventionnement CPAM, puis réservez en précisant la date, l'horaire et le motif médical de votre transport.

### Faut-il une prescription pour réserver un VSL ?

Oui. La prise en charge d'un VSL par l'Assurance Maladie nécessite une prescription médicale de transport établie par votre médecin, qui indique le mode de transport adapté à votre état.

### Combien de temps à l'avance réserver un VSL ?

Pour un transport programmé, réservez idéalement plusieurs jours à l'avance, surtout pour les trajets récurrents comme la dialyse ou la chimiothérapie. Cela augmente vos chances d'obtenir un véhicule à l'horaire souhaité.

### Un VSL est-il remboursé ?

Oui, sur prescription médicale : 65 % dans le cas général et 100 % en ALD, hospitalisation ou accident du travail. Le tiers payant évite le plus souvent toute avance de frais.

### Que faire si aucun VSL n'est disponible ?

Élargissez la recherche aux communes voisines, envisagez un taxi conventionné si votre prescription le permet, et anticipez vos trajets récurrents en fixant un transporteur attitré.
`,
  },
  {
    slug: "ambulance-autour-de-moi-trouver-rapidement",
    title: "Ambulance autour de moi : trouver une ambulance rapidement en 2026",
    h1: "Ambulance autour de moi : comment trouver une ambulance rapidement",
    excerpt:
      "Comment trouver une ambulance autour de vous en 2026 : distinguer l'urgence vitale du transport programmé, localiser une ambulance conventionnée près de chez vous et organiser un transport sanitaire remboursé.",
    category: "Transport sanitaire",
    date: "2026-06-26",
    readingTime: 7,
    image: "/blog/ambulance-pres-de-chez-moi-trouver-2026.jpg",
    imageAlt:
      "Ambulance conventionnée stationnée dans une rue avec une personne consultant son téléphone à proximité",
    keywords: [
      "ambulance autour de moi",
      "ambulance pres de chez moi",
      "trouver une ambulance",
      "ambulance conventionnee",
      "ambulance disponible",
      "transport ambulance",
    ],
    content: `
**En résumé : pour une urgence vitale, composez le 15 (SAMU) ou le 112 — ne cherchez jamais une ambulance par annuaire dans ce cas. Pour un transport sanitaire programmé sur prescription (hospitalisation, examen, retour à domicile), recherchez une ambulance conventionnée près de chez vous, vérifiez son agrément CPAM et réservez à l'avance. Sur RoullePro, vous pouvez localiser les ambulances conventionnées de votre secteur et accéder à leurs coordonnées.**

La recherche « ambulance autour de moi » correspond à deux situations très différentes : l'urgence vitale et le transport sanitaire programmé. Les bons réflexes ne sont pas les mêmes. Ce guide vous aide à réagir correctement dans chaque cas.

## Urgence vitale : le bon réflexe

En cas de détresse vitale (malaise grave, difficulté respiratoire, douleur thoracique, perte de connaissance, accident), n'utilisez pas un annuaire d'ambulances. Appelez immédiatement :

- Le 15 (SAMU) pour une urgence médicale.
- Le 112 (numéro d'urgence européen).
- Le 18 (pompiers).

Le médecin régulateur évalue la situation et déclenche le moyen adapté (SMUR, ambulance, pompiers). C'est la voie la plus rapide et la plus sûre. Pour comprendre la différence entre transport d'urgence et transport programmé, consultez notre guide [Ambulance privée vs publique 2026](/blog/ambulance-privee-vs-publique-2026).

## Transport programmé : trouver une ambulance conventionnée

Pour un transport sanitaire allongé prescrit par un médecin (hospitalisation, sortie d'hôpital, examen, soins), vous pouvez organiser vous-même le transport avec une ambulance conventionnée.

### 1. Rechercher par ville ou département

Utilisez un annuaire géolocalisé pour localiser les ambulances de votre secteur. Sur [RoullePro](/transport-medical/recherche?q=ambulance), vous filtrez les ambulances conventionnées par ville et accédez à leurs coordonnées. Voir aussi notre guide [Comment trouver une ambulance près de chez moi ?](/blog/trouver-ambulance-pres-de-chez-moi).

### 2. Vérifier l'agrément CPAM

Pour un remboursement, l'ambulance doit être agréée par l'Assurance Maladie. Cette information figure sur la fiche du transporteur. Des guides locaux existent pour les grandes villes, par exemple [Ambulances agréées CPAM à Montpellier](/blog/ambulance-agreee-cpam-montpellier), [Lyon](/blog/ambulance-agreee-cpam-lyon), [Marseille](/blog/ambulance-agreee-cpam-marseille) et [Paris](/blog/ambulance-agreee-cpam-paris).

### 3. Réserver et préparer les documents

Réservez à l'avance pour un transport programmé et munissez-vous de la prescription médicale de transport, de votre carte Vitale et, le cas échéant, de votre notification d'ALD.

## Ambulance, VSL ou taxi conventionné : que prescrit le médecin ?

L'ambulance est réservée au transport allongé ou nécessitant une surveillance. Pour un patient autonome capable de voyager assis, le médecin prescrit un VSL ou un taxi conventionné, moins coûteux et tout aussi bien remboursés. Notre guide [Ambulance, VSL ou taxi conventionné : quelles différences ?](/blog/difference-ambulance-vsl-taxi-conventionne) et notre comparatif [VSL ou taxi conventionné](/blog/vsl-ou-taxi-conventionne-comparatif-2026) détaillent ces critères. Si vous cherchez un transport assis, voir [VSL autour de moi](/blog/vsl-autour-de-moi-trouver-vsl-conventionne).

## Quel remboursement pour une ambulance ?

Sur prescription, le transport en ambulance est remboursé à 65 % (100 % en ALD, hospitalisation ou accident du travail), généralement sans avance de frais grâce au tiers payant. Le cadre national figure sur [Ameli.fr](https://www.ameli.fr/assure/remboursements/rembourse/transports). Pour les démarches, consultez notre guide [Remboursement transport médical CPAM 2026](/blog/remboursement-transport-medical).

## Si l'ambulance ne répond pas

En cas de difficulté à joindre un transporteur pour un transport programmé, élargissez votre recherche aux communes voisines ou contactez plusieurs sociétés. Notre article [Votre ambulance ou transport médical ne répond pas ? Que faire ?](/blog/ambulance-ne-repond-pas-que-faire) propose une marche à suivre. Rappel : pour une urgence vitale, seul le 15 ou le 112 doit être appelé.

## Trouver une ambulance maintenant

Pour un transport programmé, localisez une ambulance conventionnée autour de vous sur [RoullePro](/transport-medical/recherche?q=ambulance) en indiquant votre ville.

## Questions fréquentes

### Comment trouver une ambulance près de chez moi ?

Pour un transport programmé, recherchez une ambulance conventionnée dans votre ville via un annuaire géolocalisé comme RoullePro, vérifiez son agrément CPAM et réservez à l'avance. Pour une urgence vitale, appelez le 15 ou le 112.

### Que faire en cas d'urgence vitale ?

Appelez immédiatement le 15 (SAMU), le 112 (urgence européenne) ou le 18 (pompiers). N'utilisez jamais un annuaire d'ambulances pour une urgence : le médecin régulateur déclenche le moyen adapté.

### Une ambulance est-elle remboursée ?

Oui, sur prescription médicale : 65 % dans le cas général et 100 % en ALD, hospitalisation ou accident du travail. Le tiers payant évite le plus souvent toute avance de frais.

### Quand faut-il une ambulance plutôt qu'un VSL ou un taxi conventionné ?

L'ambulance est prescrite pour un transport allongé ou nécessitant une surveillance. Un patient autonome capable de voyager assis relève d'un VSL ou d'un taxi conventionné, sur décision du médecin.

### Faut-il une prescription pour une ambulance ?

Pour un transport programmé remboursé, oui : une prescription médicale de transport est nécessaire. En cas d'urgence vitale prise en charge par le SAMU, la régulation médicale s'en charge directement.
`,
  },
];
