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
  {
    slug: "taxi-conventionne-lyon-guide-2026",
    title:
      "Taxi conventionné Lyon : guide complet 2026 (tarifs CPAM, démarches)",
    excerpt:
      "Guide complet du taxi conventionné à Lyon en 2026 : conditions de prise en charge CPAM, tarifs, démarches, hôpitaux desservis (HCL, Léon Bérard, Lyon Sud) et conseils pour trouver un transporteur agréé.",
    category: "Transport sanitaire",
    date: "2026-05-14",
    readingTime: 11,
    image: "/blog/taxi-conventionne-lyon-guide-2026.jpg",
    imageAlt:
      "Taxi conventionné circulant dans une rue de Lyon avec la colline de Fourvière en arrière-plan",
    keywords: [
      "taxi conventionné lyon",
      "taxi cpam lyon",
      "tarif taxi conventionné",
      "transport médical lyon",
    ],
    content: `
**En résumé : à Lyon, le taxi conventionné transporte les patients vers leurs soins sur prescription médicale, avec une prise en charge de 65 % par la CPAM (100 % en ALD ou hospitalisation) et le tiers payant. Les Hospices Civils de Lyon, le centre Léon Bérard et l'hôpital Lyon Sud génèrent une forte demande de transports conventionnés.**

Lyon concentre une offre de soins majeure en Auvergne-Rhône-Alpes. Entre les Hospices Civils de Lyon (HCL), le centre de lutte contre le cancer Léon Bérard et les grands plateaux techniques de Lyon Sud, des milliers de patients ont besoin chaque semaine d'un transport vers leurs rendez-vous médicaux. Le taxi conventionné est l'une des réponses les plus courantes. Voici le guide complet pour 2026.

## Le taxi conventionné en bref

Un taxi conventionné est un taxi ayant signé une convention avec l'Assurance Maladie. Pour un transport prescrit médicalement, il applique une grille tarifaire négociée, pratique le tiers payant et transmet la facture à la CPAM. Le véhicule reste un taxi ordinaire ; c'est le cadre du trajet qui change.

Ce mode de transport relève du transport assis, comme le véhicule sanitaire léger (VSL). Il s'adresse aux patients autonomes n'ayant pas besoin d'être allongés ni surveillés. Les règles nationales sont décrites sur [Ameli.fr](https://www.ameli.fr/assure/remboursements/rembourse/transports).

## Qui peut en bénéficier à Lyon ?

La prise en charge nécessite une prescription médicale et l'une des situations prévues par l'Assurance Maladie :

- Affection de longue durée (ALD) avec transport lié à la pathologie.
- Hospitalisation complète, partielle ou ambulatoire.
- Soins en série de plus de 50 km ou plus de quatre transports de plus de 50 km sur deux mois.
- Accident du travail ou maladie professionnelle.
- État du patient justifiant un transport assis accompagné.

Le détail des conditions figure sur [Service-Public.fr](https://www.service-public.fr/particuliers/vosdroits/F165). Pour les patients suivis à Léon Bérard en oncologie, les séances de chimiothérapie ou de radiothérapie entrent fréquemment dans le cadre des soins en série.

## Tarifs du taxi conventionné à Lyon en 2026

Les tarifs résultent d'une convention locale propre au Rhône, signée entre les taxis et l'Assurance Maladie. Ils combinent une prise en charge au départ, un tarif kilométrique, un éventuel tarif d'attente et une remise conventionnelle obligatoire.

### Exemple chiffré

Un patient de Villeurbanne se rendant au centre Léon Bérard (Lyon 8e), soit environ 6 km, paiera une course calculée selon la grille du Rhône, à laquelle s'applique la remise conventionnelle. En cas d'ALD, la CPAM rembourse 100 % du montant et le patient n'avance rien. Hors ALD, la prise en charge est de 65 %, le solde relevant de la complémentaire santé.

Pour comprendre la logique de tarification au niveau national et la notion de zone, consultez notre article dédié à la [grille tarifaire du taxi conventionné 2026](/blog/tarif-taxi-conventionne-2026-grille-cpam).

## Les hôpitaux clés desservis à Lyon

Le taxi conventionné dessert l'ensemble des établissements lyonnais, parmi lesquels :

- Les Hospices Civils de Lyon (HCL), premier centre hospitalier universitaire de la région, avec notamment l'hôpital Édouard Herriot et l'hôpital de la Croix-Rousse.
- Le centre Léon Bérard, centre de lutte contre le cancer, très demandeur de transports en série.
- L'hôpital Lyon Sud à Pierre-Bénite, grand plateau technique du sud de l'agglomération.
- L'hôpital Femme Mère Enfant à Bron.

La diversité des sites et la circulation lyonnaise rendent la réservation anticipée particulièrement utile, surtout pour les rendez-vous matinaux.

## Démarches pas à pas

1. Obtenez la prescription médicale de transport (formulaire CERFA 11574) auprès de votre médecin. Notre guide [CERFA 11574 rempli pas-à-pas](/blog/cerfa-11574-bon-transport-medical-exemple-rempli) détaille chaque champ.
2. Choisissez un transporteur conventionné, en privilégiant la proximité de votre domicile.
3. Réservez en indiquant l'adresse, l'horaire et le motif (soins programmés, hospitalisation).
4. Le jour J, présentez votre carte Vitale et votre prescription. Le tiers payant s'applique.
5. Conservez les justificatifs en cas de soins en série.

## Comment trouver un taxi conventionné à Lyon

Plusieurs pistes existent : demander à l'établissement de soins, contacter la CPAM du Rhône, ou utiliser un annuaire spécialisé. RoullePro référence les transporteurs sanitaires par ville. Consultez les professionnels à [Lyon](/transport-medical/lyon) ou lancez une [recherche géolocalisée](/transport-medical/recherche?q=Lyon).

Pensez à vérifier l'agrément du transporteur avant le trajet. Notre article [Ambulance près de chez moi](/blog/ambulance-pres-de-chez-moi-trouver-2026) explique comment s'en assurer en quelques secondes.

## Questions fréquentes

### Combien coûte un taxi conventionné à Lyon ?

Le coût dépend de la distance, du temps d'attente et de la grille conventionnée du Rhône. Pour le patient en ALD ou hospitalisé, le reste à charge est nul grâce à la prise en charge à 100 % et au tiers payant. Hors ALD, la CPAM rembourse 65 % et la complémentaire couvre généralement le reste.

### Le taxi conventionné lyonnais accepte-t-il la carte Vitale ?

Oui. Le tiers payant est la règle : le transporteur facture directement l'Assurance Maladie à partir de la carte Vitale et de la prescription, sans avance de frais pour un transport pris en charge à 100 %.

### Faut-il une prescription pour aller à Léon Bérard en taxi conventionné ?

Oui. Comme pour tout transport conventionné, une prescription médicale (CERFA 11574) est nécessaire. En oncologie, les séances répétées relèvent souvent des soins en série, qui ouvrent droit à la prise en charge.

## En conclusion

À Lyon, le taxi conventionné offre une solution accessible pour rejoindre les grands hôpitaux et centres de soins de l'agglomération. Avec une prescription valable et le tiers payant, la plupart des patients n'avancent aucun frais. Pour identifier rapidement un transporteur agréé, lancez votre recherche sur [RoullePro à Lyon](/transport-medical/lyon).
`,
  },
  {
    slug: "taxi-conventionne-marseille-2026",
    title:
      "Taxi conventionné Marseille : trouver un transporteur agréé en 2026",
    excerpt:
      "Comment trouver un taxi conventionné à Marseille en 2026 : conditions de prise en charge CPAM, tarifs, hôpitaux de l'AP-HM (La Timone, Nord, Conception) et institut Paoli-Calmettes, démarches et conseils.",
    category: "Transport sanitaire",
    date: "2026-05-16",
    readingTime: 11,
    image: "/blog/taxi-conventionne-marseille-2026.jpg",
    imageAlt:
      "Taxi conventionné devant un hôpital de l'AP-HM à Marseille avec le ciel méditerranéen",
    keywords: [
      "taxi conventionné marseille",
      "taxi cpam marseille",
      "tarif taxi conventionné",
      "transport médical marseille",
    ],
    content: `
**En résumé : à Marseille, le taxi conventionné assure les trajets vers les soins sur prescription médicale, avec une prise en charge de 65 % par la CPAM (100 % en ALD ou hospitalisation) et le tiers payant. L'Assistance Publique-Hôpitaux de Marseille (AP-HM) et l'institut Paoli-Calmettes structurent l'essentiel de la demande.**

Deuxième ville de France, Marseille dispose d'un réseau hospitalier dense piloté par l'AP-HM, auquel s'ajoute l'institut Paoli-Calmettes, centre de référence en cancérologie. Pour des milliers de patients des Bouches-du-Rhône, le taxi conventionné est le moyen le plus pratique de rejoindre ces établissements. Ce guide explique comment trouver un transporteur agréé et obtenir la prise en charge en 2026.

## Comprendre le taxi conventionné

Un taxi conventionné est un taxi qui a signé une convention avec l'Assurance Maladie. Pour un transport prescrit, il applique la grille tarifaire négociée localement, pratique le tiers payant et facture directement la CPAM. Il s'agit d'un transport assis, au même titre que le VSL, destiné aux patients autonomes.

Le cadre national du remboursement des transports est présenté sur [Ameli.fr](https://www.ameli.fr/assure/remboursements/rembourse/transports). Pour distinguer transport assis et allongé, notre comparatif [VSL ou taxi conventionné](/blog/vsl-ou-taxi-conventionne-comparatif-2026) est un bon point de départ.

## Conditions de prise en charge à Marseille

Le transport en taxi conventionné est remboursé si une prescription médicale a été établie et si la situation correspond à l'un des cas prévus :

- Affection de longue durée (ALD) en lien avec le transport.
- Hospitalisation, sous toutes ses formes.
- Soins en série de plus de 50 km ou plus de quatre transports de plus de 50 km sur deux mois.
- Accident du travail ou maladie professionnelle.
- État du patient justifiant un transport assis professionnel.

Les conditions détaillées sont décrites sur [Service-Public.fr](https://www.service-public.fr/particuliers/vosdroits/F165). À l'institut Paoli-Calmettes, les patients en oncologie relèvent fréquemment de l'ALD et des soins en série.

## Les hôpitaux marseillais desservis

Le taxi conventionné dessert l'ensemble des grands sites marseillais :

- L'hôpital de la Timone, plus grand établissement de l'AP-HM, avec son plateau technique de référence.
- L'hôpital Nord, dans les quartiers nord de la ville.
- L'hôpital de la Conception, en centre-ville.
- L'institut Paoli-Calmettes, centre de lutte contre le cancer.

La topographie marseillaise et les distances entre quartiers nord et sud rendent la distance kilométrique parfois importante, ce qui souligne l'intérêt de la prise en charge pour les patients réguliers.

## Tarifs et exemple chiffré

Les tarifs découlent de la convention locale des Bouches-du-Rhône. Ils associent une prise en charge au départ, un tarif kilométrique, un tarif d'attente éventuel et la remise conventionnelle obligatoire.

Exemple : un patient du 8e arrondissement se rendant à la Timone (5e), soit environ 5 km, paie une course calculée selon la grille départementale, diminuée de la remise conventionnelle. En ALD, la CPAM rembourse 100 % et le patient n'avance rien. Hors ALD, la prise en charge est de 65 %, le reste relevant de la complémentaire. Pour le détail national, voir notre [grille tarifaire 2026](/blog/tarif-taxi-conventionne-2026-grille-cpam).

## Trouver un taxi conventionné à Marseille

Pour identifier un transporteur agréé, vous pouvez demander à l'établissement de soins, contacter la CPAM des Bouches-du-Rhône, ou consulter un annuaire spécialisé. RoullePro recense les transporteurs sanitaires à [Marseille](/transport-medical/marseille) et propose une [recherche géolocalisée](/transport-medical/recherche?q=Marseille) pour trouver un professionnel proche.

Pour les besoins urgents ou allongés, le taxi conventionné n'est pas adapté : reportez-vous à notre article [Ambulance à Marseille](/blog/ambulance-marseille-urgences-cpam-2026).

## Démarches à suivre

1. Faites établir la prescription médicale de transport (CERFA 11574) par votre médecin.
2. Sélectionnez un transporteur conventionné proche de votre domicile.
3. Réservez à l'avance, en précisant adresse, horaire et motif.
4. Présentez carte Vitale et prescription le jour du trajet ; le tiers payant s'applique.
5. Pour des soins répétés, conservez le même transporteur autant que possible.

## Questions fréquentes

### Combien coûte un taxi conventionné à Marseille ?

Le coût dépend de la distance, du temps d'attente et de la grille des Bouches-du-Rhône. Pour un patient en ALD ou hospitalisé, le reste à charge est nul grâce à la prise en charge à 100 % et au tiers payant. Hors ALD, la CPAM rembourse 65 % et la complémentaire santé couvre généralement le solde.

### Comment savoir si un taxi marseillais est conventionné ?

Le transporteur doit pouvoir justifier de sa convention avec l'Assurance Maladie et accepter le tiers payant pour un transport prescrit. En cas de doute, demandez confirmation avant de réserver, ou utilisez un annuaire spécialisé comme RoullePro.

### Quel transport pour aller à la Timone ?

Pour un patient autonome muni d'une prescription, le taxi conventionné ou le VSL conviennent. Pour un patient devant être allongé ou surveillé, une ambulance est nécessaire. Le mode de transport est indiqué par le médecin sur la prescription.

## En conclusion

À Marseille, le taxi conventionné facilite l'accès aux hôpitaux de l'AP-HM et à l'institut Paoli-Calmettes, avec une prise en charge avantageuse pour les patients prescrits. Pour trouver sans attendre un transporteur agréé, lancez une recherche sur [RoullePro à Marseille](/transport-medical/marseille).
`,
  },
];
