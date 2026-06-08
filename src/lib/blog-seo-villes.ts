/**
 * Cluster SEO « transport sanitaire » — articles villes & CPAM, Q2 2026.
 * 10 articles long-format (taxi conventionne, ambulance, ALD, CERFA, VSL).
 * Chaque article fournit image + imageAlt ; le fallback categorie reste actif.
 */

import type { BlogPost } from "./blog";

export const SEO_VILLES_POSTS: BlogPost[] = [
  {
    slug: "taxi-conventionne-paris-tarifs-cpam-2026",
    title:
      "Taxi conventionné Paris : tarifs, prise en charge CPAM et liste 2026",
    excerpt:
      "Tout sur le taxi conventionné à Paris en 2026 : conditions de prise en charge par l'Assurance Maladie, tarifs officiels, différence avec un taxi classique et comment trouver un transporteur agréé.",
    category: "Transport sanitaire",
    date: "2026-05-12",
    readingTime: 11,
    image: "/blog/taxi-conventionne-paris-tarifs-cpam-2026.jpg",
    imageAlt:
      "Taxi conventionné stationné devant un hôpital parisien sous un ciel clair",
    keywords: [
      "taxi conventionné paris",
      "taxi cpam paris",
      "taxi médical paris",
      "tarif taxi conventionné",
      "transport médical paris",
    ],
    content: `
**En résumé : un taxi conventionné à Paris est un taxi ayant signé une convention avec l'Assurance Maladie. Sur prescription médicale, il transporte les patients vers leurs soins et le coût est pris en charge à 65 % par la CPAM (100 % en cas d'ALD ou d'hospitalisation), le reste relevant de la complémentaire santé. Le patient n'avance généralement rien grâce au tiers payant.**

À Paris, des centaines de milliers de trajets vers les hôpitaux, centres de dialyse et cabinets de radiothérapie sont effectués chaque année en taxi conventionné. Pourtant, beaucoup de patients ignorent les conditions exactes de prise en charge, les tarifs applicables et la manière de trouver un transporteur agréé près de chez eux. Ce guide fait le point pour 2026.

## Qu'est-ce qu'un taxi conventionné ?

Un taxi conventionné est un taxi classique, titulaire d'une autorisation de stationnement, qui a en plus signé une convention avec la caisse primaire d'assurance maladie (CPAM) de son département. Cette convention l'engage à respecter une grille tarifaire négociée et à pratiquer le tiers payant pour les transports prescrits médicalement.

Concrètement, le véhicule et le chauffeur sont identiques à ceux d'un taxi ordinaire. La différence se situe au niveau administratif : le transport doit être prescrit par un médecin, et la facture est transmise directement à l'Assurance Maladie. Les règles générales du transport de patients sont détaillées sur le site officiel [Ameli.fr](https://www.ameli.fr/assure/remboursements/rembourse/transports).

### Taxi conventionné, VSL ou ambulance : ne pas confondre

Le transport sanitaire prescrit se décline en plusieurs modes selon l'état du patient :

- Le taxi conventionné et le véhicule sanitaire léger (VSL) sont des transports assis, destinés aux patients autonomes qui n'ont pas besoin d'être allongés ni surveillés.
- L'ambulance est réservée aux patients devant être transportés allongés ou nécessitant une surveillance médicale.

Pour bien arbitrer entre transport assis et allongé, consultez notre comparatif [VSL ou taxi conventionné](/blog/vsl-ou-taxi-conventionne-comparatif-2026).

## Qui peut bénéficier d'un taxi conventionné à Paris ?

La prise en charge n'est pas automatique. Elle suppose une prescription médicale de transport, établie par un médecin, et le respect de l'une des situations prévues par l'Assurance Maladie :

- Affection de longue durée (ALD) avec un transport en lien avec la pathologie.
- Hospitalisation, qu'elle soit complète, partielle ou ambulatoire.
- Soins en série de plus de 50 km ou plus de quatre transports de plus de 50 km sur deux mois (radiothérapie, chimiothérapie, dialyse).
- Transport lié à un accident du travail ou une maladie professionnelle.
- État du patient justifiant un transport allongé ou sous surveillance, sur appréciation médicale.

Les conditions précises figurent sur la fiche [Service-Public.fr consacrée au remboursement des frais de transport](https://www.service-public.fr/particuliers/vosdroits/F165). À Paris, où l'offre de soins hospitaliers est dense (AP-HP, Institut Curie, hôpitaux universitaires), ces situations concernent un grand nombre de patients chroniques.

### La prescription médicale de transport

Le document clé est le bon de transport, formellement le formulaire CERFA 11574. Le médecin y indique le mode de transport prescrit et le motif médical. Sans ce document, aucun remboursement n'est possible. Pour savoir comment il se remplit, lisez notre guide pas-à-pas du [CERFA 11574](/blog/cerfa-11574-bon-transport-medical-exemple-rempli).

## Tarifs du taxi conventionné à Paris en 2026

Les tarifs des taxis conventionnés résultent d'une convention locale signée entre les organisations de taxis et l'Assurance Maladie. Ils combinent plusieurs éléments.

### La structure tarifaire

- Une prise en charge forfaitaire au départ.
- Un tarif kilométrique appliqué à la distance parcourue.
- Un éventuel tarif d'attente lorsque le chauffeur patiente pendant les soins.
- Une remise conventionnelle obligatoire, qui distingue le taxi conventionné du taxi classique.

La remise conventionnelle est un pourcentage de réduction appliqué sur le montant total, négocié dans le cadre de la convention départementale. C'est cette remise qui garantit à l'Assurance Maladie un tarif maîtrisé.

### Exemple chiffré pour un trajet parisien

Prenons un patient résidant dans le 15e arrondissement et se rendant à l'hôpital Pitié-Salpêtrière (13e) pour une séance de soins, soit environ 7 km aller.

- Prise en charge au départ et course calculée selon la grille parisienne : de l'ordre de 20 à 30 euros pour l'aller simple selon les conditions de circulation.
- Après application de la remise conventionnelle, le montant facturé à l'Assurance Maladie est réduit.
- En cas d'ALD, la CPAM rembourse 100 % de ce montant : le patient ne paie rien grâce au tiers payant.
- Hors ALD, la CPAM prend en charge 65 % et la complémentaire santé couvre généralement les 35 % restants.

Ces ordres de grandeur sont indicatifs : le tarif réel dépend de la grille en vigueur et du temps d'attente. Pour une vue d'ensemble nationale, consultez notre article sur la [grille tarifaire du taxi conventionné 2026](/blog/tarif-taxi-conventionne-2026-grille-cpam).

## Différence avec un taxi classique

Un taxi classique facture la course au compteur, intégralement à la charge du client. Un taxi conventionné, pour un transport prescrit, applique la grille conventionnée, pratique le tiers payant et transmet la facture à l'Assurance Maladie.

Autrement dit, un même chauffeur peut effectuer une course classique le matin et un transport conventionné l'après-midi. Ce qui change, c'est le cadre juridique et tarifaire du trajet, déclenché par la présence d'une prescription médicale.

## Comment trouver un taxi conventionné à Paris

Plusieurs méthodes permettent d'identifier un transporteur agréé :

- Demander à l'établissement de soins, qui dispose souvent d'une liste de partenaires.
- Contacter sa CPAM, qui peut orienter vers les transporteurs conventionnés du secteur.
- Utiliser un annuaire spécialisé du transport sanitaire couvrant Paris et sa proche couronne.

RoullePro recense les transporteurs sanitaires par ville. Vous pouvez consulter directement les professionnels référencés à [Paris](/transport-medical/paris) ou lancer une recherche géolocalisée sur la [page de recherche transport médical](/transport-medical/recherche?q=Paris).

### Vérifier l'agrément

Tout transporteur conventionné doit pouvoir justifier de sa convention avec l'Assurance Maladie. En cas de doute, demandez confirmation avant le trajet. Notre article [Ambulance près de chez moi](/blog/ambulance-pres-de-chez-moi-trouver-2026) détaille la méthode de vérification.

## Conseils pratiques pour vos trajets

- Anticipez la réservation, surtout pour les transports programmés du matin où la demande est forte.
- Conservez votre prescription et votre carte Vitale lors de chaque trajet.
- Pour des soins en série, le même transporteur peut souvent assurer la régularité, ce qui simplifie l'organisation.
- Signalez tout changement d'adresse ou d'horaire à l'avance.

## Questions fréquentes

### Combien coûte un taxi conventionné à Paris ?

Le coût dépend de la distance, du temps d'attente et de la grille conventionnée parisienne. Pour le patient, le reste à charge est nul lorsqu'il bénéficie d'une prise en charge à 100 % (ALD, hospitalisation) avec tiers payant. Hors ALD, l'Assurance Maladie rembourse 65 % et la complémentaire santé prend en général le solde.

### Le taxi conventionné prend-il la carte Vitale ?

Oui. Le taxi conventionné pratique le tiers payant : il transmet la facture à l'Assurance Maladie à partir de votre carte Vitale et de la prescription. Vous n'avez généralement aucune somme à avancer pour un transport pris en charge à 100 %.

### Faut-il une prescription pour un taxi conventionné ?

Oui, dans la quasi-totalité des cas. Le transport doit être prescrit par un médecin sur le formulaire CERFA 11574 et correspondre à l'une des situations prévues (ALD, hospitalisation, soins en série, accident du travail). Sans prescription, le trajet n'est pas remboursé et relève du tarif taxi classique.

## En conclusion

Le taxi conventionné est une solution simple et économique pour se rendre à ses soins à Paris, à condition de disposer d'une prescription médicale valable. La prise en charge par l'Assurance Maladie, couplée au tiers payant, évite la plupart du temps toute avance de frais. Pour trouver rapidement un transporteur agréé près de chez vous, lancez une recherche sur [RoullePro à Paris](/transport-medical/paris).
`,
  },
];
