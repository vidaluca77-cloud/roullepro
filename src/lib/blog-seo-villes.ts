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
    readingTime: 9,
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

## Cas concrets à Paris

Pour rendre les choses plus tangibles, voici trois situations fréquentes dans la capitale.

### Dialyse trois fois par semaine

Un patient en insuffisance rénale chronique terminale, reconnu en ALD, se rend en centre de dialyse trois fois par semaine. Son néphrologue prescrit un transport assis en série sur le formulaire CERFA 11574. Il choisit un taxi conventionné proche de son domicile, qui assure les trajets aller-retour aux mêmes horaires. La prise en charge est de 100 % et le tiers payant lui évite toute avance. Sur une année, cela représente plus de 150 trajets aller-retour entièrement couverts.

### Radiothérapie quotidienne à l'Institut Curie

Une patiente suivie pour un cancer du sein effectue une série de séances de radiothérapie quotidiennes sur plusieurs semaines. Le médecin coche le motif soins en lien avec l'ALD et le caractère répété du transport. Le taxi conventionné l'emmène chaque jour à l'Institut Curie et attend la fin de la séance pour le retour. Le tarif d'attente est intégré à la facturation conventionnée et pris en charge à 100 %.

### Sortie d'hospitalisation

Un patient sort d'une hospitalisation à l'hôpital Cochin et doit rentrer chez lui, dans un état autonome ne nécessitant pas d'être allongé. Le service hospitalier établit la prescription de transport. Le retour en taxi conventionné est pris en charge à 100 % au titre de l'hospitalisation, sans avance de frais.

## Et si le transport est refusé ou contesté ?

Il peut arriver qu'une prise en charge soit refusée : prescription incomplète, mode de transport non justifié, absence d'accord préalable pour un transport de longue distance. Dans ce cas, plusieurs recours existent :

- Demander au médecin de compléter ou de corriger la prescription.
- Vérifier auprès de la CPAM si un accord préalable était requis.
- Conserver tous les justificatifs et factures pour appuyer une éventuelle demande de remboursement a posteriori.

La règle d'or reste l'anticipation : une prescription correctement remplie en amont évite la grande majorité des litiges.

## Accompagnement et besoins particuliers

Certains patients, notamment âgés ou fragiles, ont besoin d'aide pour se déplacer du domicile au véhicule. Le chauffeur d'un taxi conventionné assure le transport mais n'a pas vocation à dispenser des soins. Si un accompagnement spécifique est requis, le médecin peut orienter vers un VSL, conduit par un personnel formé au transport sanitaire. Cette nuance est développée dans notre comparatif [VSL ou taxi conventionné](/blog/vsl-ou-taxi-conventionne-comparatif-2026).

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
    readingTime: 8,
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

## Cas concrets à Lyon

### Chimiothérapie au centre Léon Bérard

Un patient lyonnais suivi en oncologie reçoit une série de cures de chimiothérapie au centre Léon Bérard. Son oncologue prescrit un transport assis en série sur le CERFA 11574, en cochant le motif soins en lien avec l'ALD. Le taxi conventionné assure chaque trajet et l'attente pendant la cure. La prise en charge est de 100 % et le patient n'avance rien.

### Suivi régulier aux Hospices Civils de Lyon

Une patiente atteinte d'une maladie chronique consulte régulièrement à l'hôpital Édouard Herriot. Lorsque son état le justifie médicalement, le médecin prescrit le transport. Hors ALD, la prise en charge est de 65 % et la complémentaire santé couvre le solde, ce qui réduit nettement le reste à charge.

### Hospitalisation à Lyon Sud

Après une intervention programmée à l'hôpital Lyon Sud, un patient autonome rentre à Villeurbanne en taxi conventionné. Le service rédige la prescription de transport au titre de l'hospitalisation, ce qui ouvre une prise en charge à 100 %.

## Spécificités de l'agglomération lyonnaise

L'agglomération lyonnaise se caractérise par une dispersion des sites hospitaliers entre la Presqu'île, l'est lyonnais (Bron) et le sud (Pierre-Bénite). Cette géographie a deux conséquences pratiques :

- Les distances domicile-hôpital varient fortement, ce qui se répercute sur le tarif kilométrique. Un trajet vers Lyon Sud depuis le nord de l'agglomération sera plus long qu'une course intra-muros.
- La circulation aux heures de pointe, notamment sur le périphérique et les tunnels, allonge les temps de trajet et donc l'attente facturable.

Pour ces raisons, réserver la veille et choisir un transporteur du secteur reste la meilleure stratégie.

## Accompagnement et patients fragiles

Le chauffeur d'un taxi conventionné assure le transport sans dispenser de soins. Pour un patient nécessitant une aide à la marche ou un accompagnement par un personnel formé, le médecin peut prescrire un VSL plutôt qu'un taxi. Le choix entre ces deux transports assis est détaillé dans notre comparatif [VSL ou taxi conventionné](/blog/vsl-ou-taxi-conventionne-comparatif-2026).

## Se déplacer vers les grands pôles de soins lyonnais

L'agglomération lyonnaise concentre de nombreux établissements de santé majeurs, vers lesquels convergent les transports conventionnés : les Hospices Civils de Lyon, le centre Léon Bérard pour l'oncologie, ou encore les hôpitaux de la périphérie comme Lyon Sud à Pierre-Bénite. Les patients de l'ensemble du Rhône, voire des départements limitrophes, s'y rendent régulièrement pour des soins spécialisés. Pour ces trajets parfois longs, le mode de transport prescrit et la distance déterminent le montant facturé, intégralement pris en charge dès lors que le transport est justifié et conventionné.

La circulation dense aux heures de pointe sur le périphérique et dans le centre influe sur les délais. Pour un rendez-vous matinal en imagerie ou en consultation spécialisée, il est prudent de prévoir une marge et de réserver son transporteur la veille. Les patients suivis pour des soins réguliers, comme la dialyse ou des cures espacées, ont intérêt à fidéliser un transporteur du secteur capable d'assurer l'ensemble de leurs trajets aux mêmes horaires. Cette régularité limite les imprévus et fluidifie la prise en charge sur la durée du traitement.

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
    readingTime: 8,
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

## Cas concrets à Marseille

### Radiothérapie à l'institut Paoli-Calmettes

Une patiente marseillaise suit une série de séances de radiothérapie à l'institut Paoli-Calmettes. Reconnue en ALD, elle bénéficie d'une prescription de transport assis en série. Le taxi conventionné l'emmène chaque jour et la prise en charge est de 100 %, sans avance de frais.

### Consultation à l'hôpital Nord

Un patient résidant dans les quartiers nord doit consulter régulièrement à l'hôpital Nord. La proximité réduit la distance kilométrique et donc le coût. Lorsque son état le justifie médicalement, le transport est prescrit et pris en charge selon les règles habituelles (65 %, ou 100 % en ALD).

### Sortie d'hospitalisation depuis la Conception

Après un séjour à l'hôpital de la Conception, un patient autonome rentre chez lui en taxi conventionné. La prescription établie par le service au titre de l'hospitalisation ouvre une prise en charge à 100 %.

## Les spécificités marseillaises

Marseille présente une géographie particulière qui influe sur les transports sanitaires :

- L'étendue de la ville et le contraste entre quartiers nord et sud génèrent des distances parfois importantes, ce qui pèse sur le tarif kilométrique.
- La densité du trafic en centre-ville et autour du Vieux-Port allonge les temps de trajet.
- La répartition des sites de l'AP-HM (Timone, Nord, Conception) impose souvent de traverser la ville.

Anticiper la réservation et privilégier un transporteur du secteur permet de limiter les délais et de fluidifier les trajets réguliers.

## Accompagnement des patients

Le taxi conventionné assure le transport mais ne dispense pas de soins. Pour un patient nécessitant un accompagnement par un personnel formé au transport sanitaire, le médecin peut prescrire un VSL. La distinction entre ces deux transports assis est expliquée dans notre comparatif [VSL ou taxi conventionné](/blog/vsl-ou-taxi-conventionne-comparatif-2026). Pour les transports allongés ou urgents, c'est l'ambulance qui s'impose, comme détaillé dans [Ambulance à Marseille](/blog/ambulance-marseille-urgences-cpam-2026).

## Réserver son transport vers les hôpitaux de l'AP-HM

L'Assistance Publique-Hôpitaux de Marseille répartit ses activités sur plusieurs sites majeurs, dont la Timone, l'hôpital Nord et la Conception. À cela s'ajoute l'institut Paoli-Calmettes, centre de référence en cancérologie qui draine des patients de toute la région. Selon le quartier de résidence, rejoindre l'un de ces établissements peut impliquer de traverser la ville, avec des temps de trajet variables aux heures de pointe. Pour un patient suivi en oncologie ou en dialyse, qui multiplie les déplacements, la régularité du transporteur devient un critère décisif.

Quelques bonnes pratiques facilitent ces trajets marseillais. Réservez la veille pour les rendez-vous du matin, particulièrement nombreux en imagerie et en consultation spécialisée. Indiquez précisément l'adresse de départ et le site hospitalier visé, car les différents pôles de l'AP-HM sont éloignés les uns des autres. Pour des soins en série, communiquez l'ensemble du calendrier au transporteur afin qu'il bloque les créneaux à l'avance. Enfin, conservez systématiquement la prescription et la carte Vitale, indispensables au tiers payant le jour du transport.

## Trouver un taxi conventionné agréé à Marseille

Tous les taxis marseillais ne sont pas conventionnés : seuls ceux ayant signé une convention avec l'Assurance Maladie appliquent la grille des Bouches-du-Rhône et pratiquent le tiers payant pour un transport prescrit. Avant de réserver, il est donc prudent de confirmer ce conventionnement auprès du chauffeur ou de l'entreprise. En cas de doute, la CPAM des Bouches-du-Rhône peut renseigner sur les transporteurs agréés, et un annuaire spécialisé permet de filtrer directement les professionnels conventionnés du secteur.

La géolocalisation simplifie nettement cette recherche dans une ville aussi étendue que Marseille. Plutôt que d'appeler plusieurs compagnies, une recherche par quartier ou par position affiche les transporteurs les plus proches, avec leurs coordonnées et leur statut. Pour un patient résidant dans les quartiers nord et devant se rendre régulièrement à la Timone ou à Paoli-Calmettes, identifier un transporteur du secteur capable d'assurer tous les trajets représente un gain de temps et de sérénité considérable. RoullePro permet précisément cette recherche géolocalisée des transporteurs conventionnés [à Marseille](/transport-medical/marseille).

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
  {
    slug: "ambulance-privee-vs-publique-2026",
    title:
      "Ambulance privée : différences avec l'ambulance publique (coût, délais, prise en charge)",
    excerpt:
      "Ambulance privée ou publique : statuts juridiques, qui appeler selon la situation, tarifs réels, délais, remboursement CPAM et conventionnement. Le guide clair pour comprendre en 2026.",
    category: "Transport sanitaire",
    date: "2026-05-18",
    readingTime: 8,
    image: "/blog/ambulance-privee-vs-publique-2026.jpg",
    imageAlt:
      "Ambulance privée et véhicule de secours public stationnés côte à côte devant un hôpital",
    keywords: [
      "ambulance privée",
      "ambulance publique",
      "ambulance différence",
      "transport sanitaire privé",
      "coût ambulance privée",
    ],
    content: `
**En résumé : l'ambulance privée est exploitée par une entreprise de transport sanitaire agréée, sur prescription ou régulation médicale, et son coût est pris en charge par l'Assurance Maladie. L'ambulance publique relève des structures hospitalières et du service d'aide médicale urgente (SAMU) pour les urgences. Pour une urgence vitale, on appelle le 15 ; pour un transport programmé, on contacte une entreprise privée conventionnée.**

La distinction entre ambulance privée et ambulance publique prête souvent à confusion. Les deux assurent des transports allongés et médicalisés, mais leurs statuts, leurs missions et les circuits d'appel diffèrent. Comprendre ces différences permet de réagir correctement, que l'on soit face à une urgence ou que l'on organise un transport programmé. Ce guide fait le point pour 2026.

## Deux statuts juridiques distincts

### L'ambulance privée

L'ambulance privée est exploitée par une entreprise de transport sanitaire titulaire d'un agrément délivré par l'agence régionale de santé (ARS). Ces entreprises emploient des ambulanciers diplômés et disposent de véhicules homologués. Elles interviennent sur prescription médicale pour les transports programmés et peuvent être réquisitionnées par le SAMU pour des urgences via la régulation.

La grande majorité des entreprises privées sont conventionnées avec l'Assurance Maladie, ce qui permet le tiers payant et la prise en charge décrite sur [Ameli.fr](https://www.ameli.fr/assure/remboursements/rembourse/transports).

### L'ambulance publique

Les ambulances publiques sont rattachées à des structures hospitalières ou aux services départementaux d'incendie et de secours (SDIS) pour les sapeurs-pompiers. Le SAMU, via le centre de régulation du 15, coordonne les moyens publics et privés en cas d'urgence. Les SMUR (structures mobiles d'urgence et de réanimation) interviennent pour les urgences vitales avec une équipe médicale à bord.

## Qui appelle quoi ?

Le bon réflexe dépend de la situation :

- Urgence vitale (détresse respiratoire, malaise grave, accident) : appeler le 15 (SAMU) ou le 112 (numéro d'urgence européen). La régulation médicale décide du moyen le plus adapté.
- Incendie, accident sur la voie publique : le 18 (sapeurs-pompiers).
- Transport programmé (hospitalisation prévue, retour à domicile, soins en série) : contacter directement une entreprise d'ambulance privée conventionnée, sur prescription médicale.

Pour un transport assis sans surveillance, l'ambulance n'est pas nécessaire : un VSL ou un taxi conventionné suffit. Notre comparatif [VSL ou taxi conventionné](/blog/vsl-ou-taxi-conventionne-comparatif-2026) aide à choisir.

## Coût et prise en charge

### Le principe du remboursement

Qu'elle soit privée ou publique, l'ambulance prescrite est prise en charge par l'Assurance Maladie selon les mêmes règles que les autres transports sanitaires :

- 65 % du tarif conventionné dans le cas général.
- 100 % en cas d'ALD en lien avec le transport, d'hospitalisation, d'accident du travail ou pour certaines situations spécifiques.

Le complément est généralement couvert par la complémentaire santé. Avec le tiers payant, le patient n'avance le plus souvent rien. Les conditions sont détaillées sur [Service-Public.fr](https://www.service-public.fr/particuliers/vosdroits/F165).

### Les tarifs réels

Le tarif d'une ambulance privée comprend un forfait de prise en charge, un tarif kilométrique et d'éventuels suppléments (forfait agglomération, dimanche et jours fériés, urgence). Ces tarifs sont encadrés par la convention nationale des transporteurs sanitaires. Un transport allongé coûte logiquement plus cher qu'un transport assis, ce qui justifie que la prescription précise le mode adapté à l'état du patient.

### Qui paye au final ?

Pour un transport prescrit et conventionné, c'est l'Assurance Maladie qui règle la part obligatoire et la complémentaire qui couvre le reste. Le patient ne paie que l'éventuel reste à charge non couvert. En l'absence de prescription valable, le transport peut rester intégralement à la charge du patient.

## Urgence ou programmé : deux logiques

Le transport d'urgence est déclenché par la régulation médicale du 15, qui mobilise le moyen disponible le plus proche, public ou privé. Le transport programmé, lui, s'anticipe : il fait l'objet d'une prescription et d'une réservation auprès d'une entreprise privée. Cette distinction est essentielle, car elle conditionne à la fois le circuit d'appel et les modalités de prise en charge.

## Comment choisir une ambulance privée

Pour un transport programmé, il est conseillé de choisir une entreprise conventionnée, proche du domicile ou de l'établissement, et de réserver à l'avance. Vérifiez l'agrément et le conventionnement avant de confirmer. RoullePro recense les transporteurs sanitaires par ville : lancez une [recherche d'ambulance](/transport-medical/recherche?q=ambulance) ou consultez la méthode décrite dans [Ambulance près de chez moi](/blog/ambulance-pres-de-chez-moi-trouver-2026).

## Le métier d'ambulancier et l'équipement du véhicule

Une ambulance privée n'est pas un simple véhicule : c'est un dispositif réglementé. L'équipage comprend au minimum un ambulancier diplômé d'État et, selon les transports, un auxiliaire ambulancier. Le véhicule est homologué pour le transport allongé : brancard, matériel d'oxygénothérapie, dispositifs de première urgence et signalétique réglementaire.

Cette professionnalisation explique la différence de tarif avec un transport assis : l'ambulance mobilise plus de personnel et d'équipement. Elle n'est donc prescrite que lorsque l'état du patient le justifie réellement, ce qui garantit une utilisation pertinente des ressources et une prise en charge cohérente par l'Assurance Maladie.

## Trois situations pour bien comprendre

### Une douleur thoracique brutale

Une personne ressent une douleur thoracique intense. Le bon réflexe est d'appeler le 15. La régulation médicale évalue la gravité et envoie le moyen adapté, qui peut être un SMUR pour une urgence vitale. Ici, aucune démarche de recherche de transporteur : tout passe par la régulation.

### Un retour d'hospitalisation allongé

Un patient opéré doit rentrer chez lui allongé, sans urgence. Le service hospitalier prescrit un transport en ambulance. La famille contacte une entreprise privée conventionnée, qui organise le retour. La prise en charge suit les règles habituelles (100 % au titre de l'hospitalisation).

### Des séances de soins en position assise

Un patient autonome se rend à des séances de kinésithérapie en série. L'ambulance n'est pas justifiée : un VSL ou un taxi conventionné suffit, pour un coût moindre et une prise en charge identique.

## Idées reçues à corriger

- Croire que l'ambulance est toujours gratuite : elle est prise en charge sur prescription et conventionnement, mais un transport non prescrit peut rester à la charge du patient.
- Penser qu'il faut appeler les pompiers (18) pour tout transport : le 18 concerne les incendies et secours sur la voie publique, le 15 la régulation médicale.
- Confondre rapidité et mode de transport : pour un transport programmé, l'enjeu est l'organisation, pas l'urgence.

## L'organisation des secours en France

Comprendre l'articulation entre acteurs publics et privés aide à saisir qui intervient et quand. En cas d'urgence, le SAMU (Service d'Aide Médicale Urgente), joignable au 15, assure la régulation médicale : un médecin régulateur évalue l'appel et déclenche le moyen adapté. Selon la situation, il peut s'agir d'un SMUR (équipe médicalisée hospitalière), des sapeurs-pompiers, ou d'une ambulance privée mobilisée dans le cadre de la garde ambulancière départementale. Les transporteurs privés participent ainsi pleinement au dispositif d'urgence, en plus de leur activité de transport programmé.

Pour le transport programmé, à l'inverse, ce sont les entreprises privées de transport sanitaire qui interviennent quasi exclusivement, sur prescription. Elles assurent les retours d'hospitalisation, les transferts entre établissements et les déplacements vers des soins réguliers. Cette répartition explique pourquoi le patient ne contacte jamais directement le SAMU pour un transport prévu à l'avance : la régulation du 15 est réservée aux situations où l'état de santé impose une réponse médicale immédiate. Connaître cette distinction évite les erreurs d'orientation et accélère la prise en charge dans chaque cas.

## Questions fréquentes

### Une ambulance privée est-elle remboursée ?

Oui, dès lors que le transport est prescrit médicalement et que l'entreprise est conventionnée. L'Assurance Maladie rembourse 65 % du tarif conventionné dans le cas général, et 100 % en ALD, hospitalisation ou accident du travail. La complémentaire santé couvre généralement le reste, et le tiers payant évite l'avance de frais.

### Comment choisir entre ambulance privée et publique ?

Vous ne choisissez pas vous-même en cas d'urgence : la régulation du 15 décide du moyen le plus adapté, public ou privé. Pour un transport programmé, vous contactez directement une entreprise d'ambulance privée conventionnée, sur prescription de votre médecin.

### Qui paye l'ambulance ?

Pour un transport prescrit et conventionné, l'Assurance Maladie règle la part obligatoire et la complémentaire santé couvre le solde. Le patient ne supporte que l'éventuel reste à charge non couvert. Sans prescription valable, le coût peut rester entièrement à la charge du patient.

## En conclusion

Ambulance privée et ambulance publique répondent à des logiques différentes : l'une au transport programmé sur prescription, l'autre à l'urgence coordonnée par le SAMU. Dans les deux cas, le transport prescrit et conventionné est pris en charge par l'Assurance Maladie. Pour organiser un transport programmé, trouvez un transporteur agréé sur [RoullePro](/transport-medical/recherche?q=ambulance).
`,
  },
  {
    slug: "tarif-taxi-conventionne-2026-grille-cpam",
    title: "Tarif taxi conventionné 2026 : grille officielle CPAM par zone",
    excerpt:
      "Comprendre la tarification du taxi conventionné en 2026 : structure de la grille CPAM, notion de zone tarifaire, remise conventionnelle, exemples chiffrés par grande ville et reste à charge du patient.",
    category: "Transport sanitaire",
    date: "2026-05-20",
    readingTime: 8,
    image: "/blog/tarif-taxi-conventionne-2026-grille-cpam.jpg",
    imageAlt:
      "Compteur de taxi conventionné et document de prescription médicale posés sur un tableau de bord",
    keywords: [
      "tarif taxi conventionné",
      "prix taxi cpam",
      "grille tarifaire transport sanitaire",
      "convention taxi cpam",
    ],
    content: `
**En résumé : le tarif d'un taxi conventionné repose sur une grille négociée localement entre les taxis et l'Assurance Maladie. Elle combine une prise en charge au départ, un tarif kilométrique, un tarif d'attente et une remise conventionnelle obligatoire. Le tarif n'est donc pas uniforme en France : il varie selon le département et la zone. Le patient prescrit est remboursé à 65 % (100 % en ALD), sans avance de frais grâce au tiers payant.**

Beaucoup de patients s'interrogent sur le prix d'un trajet en taxi conventionné et sur les écarts qu'ils constatent d'une ville à l'autre. La tarification obéit pourtant à une logique précise, encadrée par les conventions locales signées avec l'Assurance Maladie. Ce guide décrypte la grille 2026 et fournit des ordres de grandeur par zone.

## Comment se construit le tarif d'un taxi conventionné

### Les composantes de la grille

Le montant d'une course conventionnée s'appuie sur plusieurs éléments :

- Une prise en charge forfaitaire au départ de la course.
- Un tarif kilométrique appliqué à la distance réellement parcourue.
- Un tarif d'attente, lorsque le chauffeur patiente pendant les soins du patient.
- Des majorations possibles (nuit, dimanche et jours fériés) selon les conventions.
- Une remise conventionnelle obligatoire, déduite du total.

La remise conventionnelle est la spécificité du taxi conventionné : c'est un pourcentage de réduction négocié dans la convention départementale, qui garantit à l'Assurance Maladie un tarif maîtrisé par rapport à une course classique au compteur. Le cadre général figure sur [Ameli.fr](https://www.ameli.fr/assure/remboursements/rembourse/transports).

### La notion de zone tarifaire

Les conventions sont signées au niveau départemental, entre les organisations de taxis et la CPAM locale. C'est pourquoi le tarif varie d'un département à l'autre : densité urbaine, distances moyennes, conditions de circulation et accord local influent sur la grille. Une même distance peut donc ne pas coûter exactement le même montant à Paris, à Lyon ou en zone rurale.

## Le tarif est-il identique partout en France ?

Non. Il n'existe pas de tarif national unique du taxi conventionné. Chaque convention départementale fixe ses propres paramètres dans le cadre réglementaire général. Les règles de remboursement, en revanche, sont nationales : 65 % de prise en charge dans le cas général, 100 % en ALD, hospitalisation ou accident du travail. Les conditions sont décrites sur [Service-Public.fr](https://www.service-public.fr/particuliers/vosdroits/F165).

## Ordres de grandeur par grande ville en 2026

Le tableau ci-dessous présente des fourchettes indicatives pour un aller simple urbain court (environ 5 à 7 km), avant prise en charge par l'Assurance Maladie. Ces valeurs sont des ordres de grandeur destinés à illustrer la logique de zone, et non des tarifs officiels figés.

| Ville | Trajet urbain court (aller) | Particularité de zone |
| --- | --- | --- |
| Paris | 20 à 30 euros | Forte densité, circulation dense, temps d'attente fréquent |
| Lyon | 18 à 28 euros | Agglomération étendue, sites hospitaliers dispersés |
| Marseille | 18 à 28 euros | Distances nord-sud importantes |
| Ville moyenne | 15 à 25 euros | Distances plus courtes, attente réduite |
| Zone rurale | Variable selon distance | Tarif kilométrique déterminant sur longue distance |

Pour un éclairage local, consultez nos guides dédiés au [taxi conventionné à Paris](/blog/taxi-conventionne-paris-tarifs-cpam-2026), [à Lyon](/blog/taxi-conventionne-lyon-guide-2026) et [à Marseille](/blog/taxi-conventionne-marseille-2026).

## Exemple détaillé de calcul

Prenons un patient en ALD effectuant un aller-retour de 6 km vers son centre de soins, avec 45 minutes d'attente sur place :

- Prise en charge au départ et kilométrage aller-retour calculés selon la grille départementale.
- Tarif d'attente appliqué pour la durée des soins.
- Remise conventionnelle déduite du total.
- En ALD, l'Assurance Maladie rembourse 100 % du montant : le patient ne paie rien grâce au tiers payant.

Hors ALD, le même trajet serait pris en charge à 65 %, le solde de 35 % étant généralement couvert par la complémentaire santé.

## Pourquoi mon taxi conventionné facture-t-il parfois plus cher ?

Plusieurs facteurs expliquent les écarts perçus :

- Une distance plus longue, notamment vers un établissement éloigné.
- Un temps d'attente important pendant les soins.
- Des majorations de nuit, de dimanche ou de jour férié.
- Une zone départementale dont la grille est plus élevée.

Ces éléments sont normaux dès lors qu'ils respectent la convention. En cas de doute sur une facture, vous pouvez demander le détail au transporteur ou vous rapprocher de votre CPAM.

## Reste à charge et tiers payant

Le tiers payant est la règle pour les transports conventionnés prescrits : le transporteur facture directement l'Assurance Maladie et, le cas échéant, la complémentaire. Le patient n'avance rien pour un transport pris en charge à 100 %. Hors ALD, le reste à charge correspond à la part non couverte par la complémentaire santé.

## La franchise médicale sur les transports

Au-delà du ticket modérateur, l'Assurance Maladie applique une franchise médicale sur les transports sanitaires, à l'exception des transports d'urgence. Cette franchise est plafonnée annuellement et certaines personnes en sont exonérées (par exemple les bénéficiaires de la complémentaire santé solidaire, les femmes enceintes dans certaines conditions, les enfants mineurs). Le montant et les règles de la franchise sont précisés sur [Ameli.fr](https://www.ameli.fr/assure/remboursements/reste-charge/franchise-medicale). Cette franchise explique parfois un petit écart entre le tarif affiché et le montant effectivement remboursé.

## Comprendre sa facture de transport

Pour décrypter une facture de taxi conventionné, repérez les éléments suivants :

- La prise en charge au départ, montant fixe quel que soit le trajet.
- Le nombre de kilomètres et le tarif kilométrique appliqué.
- Le temps d'attente facturé, le cas échéant.
- Les éventuelles majorations (nuit, dimanche, jour férié).
- La remise conventionnelle, déduite du total.
- Le taux de prise en charge (65 % ou 100 %) et la part éventuelle restant à charge.

Si un poste vous semble incohérent, vous pouvez demander des explications au transporteur, qui doit pouvoir justifier chaque ligne au regard de la convention départementale.

## Évolution des tarifs dans le temps

Les conventions départementales sont périodiquement renégociées, ce qui peut entraîner des révisions de tarifs. Les paramètres (prise en charge au départ, tarif kilométrique, remise conventionnelle) peuvent évoluer d'une année à l'autre. Pour 2026, la logique reste celle décrite ci-dessus, mais il est toujours utile de se référer à la convention en vigueur dans son département via sa CPAM. Pour une vision locale concrète, consultez nos guides dédiés à [Paris](/blog/taxi-conventionne-paris-tarifs-cpam-2026), [Lyon](/blog/taxi-conventionne-lyon-guide-2026) et [Marseille](/blog/taxi-conventionne-marseille-2026).

## Comment lire sa facture de transport

Même lorsque le tiers payant s'applique et que le patient ne paie rien, il est utile de savoir lire le détail d'une facture de transport. Plusieurs lignes y figurent généralement : la prise en charge forfaitaire au départ, le montant kilométrique calculé sur la distance parcourue, le temps d'attente éventuel pendant les soins, et les majorations applicables (nuit, dimanche, jour férié). La remise conventionnelle négociée avec l'Assurance Maladie est ensuite appliquée pour aboutir au tarif conventionné servant de base au remboursement.

Vérifier ces éléments permet de s'assurer de la cohérence du montant facturé avec le trajet réellement effectué. Une distance surévaluée ou une majoration appliquée à tort peut être signalée au transporteur ou à la CPAM. Pour les patients réalisant de nombreux trajets, suivre ces factures via le compte Ameli en ligne aide à contrôler que le bon taux de prise en charge a été appliqué, en particulier le 100 % en ALD. En cas de doute persistant sur un montant, la CPAM reste l'interlocuteur de référence pour obtenir une explication détaillée.

## Questions fréquentes

### Le tarif est-il identique partout en France ?

Non. La grille tarifaire du taxi conventionné est négociée au niveau départemental, ce qui entraîne des écarts d'une zone à l'autre. Seules les règles de remboursement (65 % en général, 100 % en ALD) sont nationales et identiques partout.

### Pourquoi mon taxi conventionné facture plus cher ?

Le montant dépend de la distance, du temps d'attente, des éventuelles majorations (nuit, dimanche, jour férié) et de la grille départementale. Un trajet plus long ou une attente prolongée pendant les soins augmentent logiquement le montant, dans le respect de la convention.

### Y a-t-il un supplément la nuit ?

Selon les conventions départementales, des majorations peuvent s'appliquer la nuit, le dimanche et les jours fériés. Ces majorations sont encadrées par la convention locale. Le transporteur doit pouvoir vous en justifier le détail.

## En conclusion

Le tarif du taxi conventionné suit une grille départementale qui explique les écarts d'une ville à l'autre, tout en garantissant au patient un remboursement national stable et, le plus souvent, l'absence d'avance de frais. Pour trouver un transporteur conventionné dans votre secteur, lancez une recherche sur [RoullePro](/transport-medical/recherche?q=taxi%20conventionn%C3%A9).
`,
  },
  {
    slug: "ambulance-marseille-urgences-cpam-2026",
    title:
      "Ambulance à Marseille : urgences, transports programmés, conventionnés CPAM",
    excerpt:
      "Tout sur l'ambulance à Marseille en 2026 : numéros d'urgence (15, 18, 112), différence entre urgence et transport programmé, prise en charge CPAM, hôpitaux de l'AP-HM et conseils pour trouver une ambulance conventionnée.",
    category: "Transport sanitaire",
    date: "2026-05-22",
    readingTime: 8,
    image: "/blog/ambulance-marseille-urgences-cpam-2026.jpg",
    imageAlt:
      "Ambulance privée conventionnée circulant dans Marseille avec le Vieux-Port en arrière-plan",
    keywords: [
      "ambulance marseille",
      "ambulance privée marseille",
      "transport sanitaire marseille",
      "ambulance cpam marseille",
    ],
    content: `
**En résumé : à Marseille, en cas d'urgence vitale, on appelle le 15 (SAMU) ou le 112 ; pour un incendie ou un accident sur la voie publique, le 18 (pompiers). Pour un transport allongé programmé, on contacte une entreprise d'ambulance privée conventionnée, sur prescription. Le transport prescrit et conventionné est pris en charge par l'Assurance Maladie, avec tiers payant.**

Marseille, avec son réseau de l'AP-HM et sa densité de population, génère un volume important de transports sanitaires. Entre urgences régulées par le SAMU et transports programmés vers les hôpitaux, il est essentiel de savoir quel numéro appeler et comment obtenir la prise en charge. Ce guide récapitule l'essentiel pour 2026.

## Les numéros utiles à connaître

- 15 : SAMU, pour toute urgence médicale (malaise grave, détresse respiratoire, douleur thoracique). La régulation médicale décide du moyen à envoyer.
- 18 : sapeurs-pompiers, pour un incendie, un accident sur la voie publique ou un secours à personne.
- 112 : numéro d'urgence européen, accessible depuis tout téléphone, qui redirige vers le service compétent.
- 114 : numéro d'urgence par message pour les personnes sourdes ou malentendantes.

En cas de doute sur la gravité, le 15 oriente et conseille. Ces numéros sont gratuits et joignables 24 heures sur 24.

## Urgence ou transport programmé : deux circuits

### L'urgence

En situation d'urgence, c'est la régulation médicale du SAMU (15) qui mobilise le moyen le plus adapté : ambulance privée réquisitionnée, véhicule des pompiers ou SMUR pour les urgences vitales. Le patient n'a pas à choisir lui-même le transporteur ; tout est coordonné par le centre de régulation.

### Le transport programmé

Pour une hospitalisation prévue, un retour à domicile ou des soins en série, le transport s'anticipe. Il fait l'objet d'une prescription médicale (formulaire CERFA 11574) et d'une réservation auprès d'une entreprise d'ambulance privée conventionnée. Notre guide [CERFA 11574 pas-à-pas](/blog/cerfa-11574-bon-transport-medical-exemple-rempli) détaille la marche à suivre.

Si le patient est autonome et n'a pas besoin d'être allongé, l'ambulance n'est pas nécessaire : un VSL ou un [taxi conventionné à Marseille](/blog/taxi-conventionne-marseille-2026) suffit.

## Prise en charge par l'Assurance Maladie

Le transport en ambulance, lorsqu'il est prescrit et réalisé par une entreprise conventionnée, est remboursé selon les règles nationales :

- 65 % du tarif conventionné dans le cas général.
- 100 % en cas d'ALD en lien avec le transport, d'hospitalisation, d'accident du travail ou de maladie professionnelle.

La complémentaire santé couvre généralement le reste. Avec le tiers payant, le patient n'avance le plus souvent rien. Le détail figure sur [Ameli.fr](https://www.ameli.fr/assure/remboursements/rembourse/transports) et [Service-Public.fr](https://www.service-public.fr/particuliers/vosdroits/F165).

## Les hôpitaux marseillais concernés

Les transports en ambulance à Marseille desservent notamment :

- L'hôpital de la Timone (5e), site majeur de l'AP-HM avec ses urgences et son plateau technique.
- L'hôpital Nord (15e), pour les quartiers nord de la ville.
- L'hôpital de la Conception (5e), en centre-ville.
- L'institut Paoli-Calmettes, centre de lutte contre le cancer.

Pour les patients en oncologie à Paoli-Calmettes, les transports répétés relèvent souvent des soins en série ouvrant droit à une prise en charge renforcée.

## Combien coûte une ambulance à Marseille ?

Le tarif d'une ambulance privée comprend un forfait de prise en charge, un tarif kilométrique et d'éventuels suppléments (agglomération, dimanche et jours fériés, urgence), dans le cadre de la convention nationale des transporteurs sanitaires. Pour un transport prescrit et conventionné, ce montant est pris en charge par l'Assurance Maladie et la complémentaire. Le patient ne supporte que l'éventuel reste à charge non couvert. Notre article [Ambulance privée vs publique](/blog/ambulance-privee-vs-publique-2026) détaille la structure de ces tarifs.

## Trouver une ambulance conventionnée à Marseille

Pour un transport programmé, choisissez une entreprise conventionnée, proche du domicile ou de l'hôpital, et réservez à l'avance. RoullePro recense les transporteurs sanitaires à [Marseille](/transport-medical/marseille) et permet une [recherche géolocalisée](/transport-medical/recherche?q=Marseille). La méthode de vérification de l'agrément est expliquée dans [Ambulance près de chez moi](/blog/ambulance-pres-de-chez-moi-trouver-2026).

## Bien préparer un transport en ambulance

Pour un transport programmé en ambulance, quelques préparatifs facilitent le jour J :

- Avoir la prescription médicale (CERFA 11574) à portée de main, ainsi que la carte Vitale et la carte de complémentaire santé.
- Préparer les documents médicaux utiles (compte rendu, ordonnances) pour le rendez-vous.
- Indiquer précisément l'adresse de départ, l'étage et les éventuelles difficultés d'accès (ascenseur en panne, rue étroite).
- Confirmer l'horaire la veille, surtout pour un rendez-vous matinal.

Ces précautions évitent les retards et les incompréhensions, particulièrement utiles dans une ville aussi étendue que Marseille.

## Le rôle de la régulation du SAMU

Le centre 15 ne se contente pas d'envoyer des secours : il évalue, conseille et oriente. Un appel au 15 permet à un médecin régulateur de déterminer si la situation relève d'une urgence vitale, d'un transport sanitaire simple ou d'un conseil médical. C'est ce filtrage qui garantit l'envoi du moyen adapté et évite la mobilisation inutile de ressources d'urgence pour un besoin programmé.

Pour les besoins non urgents, solliciter directement une entreprise privée conventionnée est la bonne démarche : cela libère la régulation pour les véritables urgences et permet d'organiser sereinement le transport.

## Distinguer ambulance et transport assis à Marseille

Tous les transports vers les hôpitaux marseillais ne nécessitent pas une ambulance. Un patient autonome, capable de voyager assis, relève d'un VSL ou d'un taxi conventionné, pour un coût moindre et une prise en charge identique. C'est le médecin qui tranche en fonction de l'état du patient. Notre comparatif [VSL ou taxi conventionné](/blog/vsl-ou-taxi-conventionne-comparatif-2026) détaille ces critères, et notre guide [Ambulance privée vs publique](/blog/ambulance-privee-vs-publique-2026) explique la différence de statut entre transporteurs.

## Anticiper un transport programmé à Marseille

Pour un retour d'hospitalisation ou des soins planifiés, l'anticipation reste la meilleure alliée. À Marseille, où les sites de l'AP-HM sont dispersés et le trafic souvent dense, réserver son ambulance ou son transport assis la veille évite les difficultés de dernière minute. Munissez-vous de la prescription médicale, précisez l'adresse exacte et le site hospitalier concerné, et signalez tout besoin particulier (étage sans ascenseur, aide au transfert). Ces informations permettent au transporteur d'envoyer l'équipage et le véhicule adaptés.

Pour les patients suivis en série, notamment vers l'institut Paoli-Calmettes ou les services de dialyse, fidéliser un transporteur du secteur simplifie l'organisation sur la durée. Un même prestataire connaissant le domicile, les horaires habituels et les contraintes du patient assure une régularité précieuse. La géolocalisation d'un annuaire spécialisé aide à identifier rapidement les entreprises agréées proches de chez soi, sans multiplier les appels. Cette préparation, conjuguée à une prescription correctement remplie, garantit une prise en charge fluide et un reste à charge maîtrisé.

## Remboursement et reste à charge à Marseille

Comme partout en France, le remboursement d'un transport en ambulance à Marseille obéit à des règles nationales. Pour un transport prescrit et réalisé par une entreprise conventionnée, l'Assurance Maladie prend en charge 65 % du tarif conventionné dans le cas général, et 100 % en cas d'ALD, d'hospitalisation ou d'accident du travail. Le tiers payant évite au patient toute avance de frais, et la complémentaire santé couvre le plus souvent le solde éventuel. Le cadre détaillé figure sur [Ameli.fr](https://www.ameli.fr/assure/remboursements/rembourse/transports).

Le montant facturé associe un forfait de prise en charge, un coût kilométrique et d'éventuelles majorations. À Marseille, l'étendue de la ville et la dispersion des sites de l'AP-HM peuvent allonger les distances, et donc le montant brut du transport ; mais ce montant reste pris en charge dès lors que le transport est justifié et conventionné. Un patient sans prescription, en revanche, s'expose à régler l'intégralité du trajet. La règle est donc claire : pour bénéficier de la prise en charge, le transport doit être prescrit, le mode adapté à l'état du patient, et le transporteur conventionné.

## Questions fréquentes

### Quel numéro appeler ?

Pour une urgence médicale, appelez le 15 (SAMU). Pour un incendie ou un accident sur la voie publique, le 18 (pompiers). Le 112 est le numéro d'urgence européen, joignable depuis tout téléphone. Pour un transport programmé, contactez directement une entreprise d'ambulance privée conventionnée sur prescription.

### Combien coûte une ambulance à Marseille ?

Le tarif associe un forfait, un kilométrage et d'éventuels suppléments, encadrés par la convention nationale. Pour un transport prescrit et conventionné, l'Assurance Maladie et la complémentaire prennent en charge le coût, le patient ne réglant que l'éventuel reste à charge. Sans prescription, le transport peut rester à sa charge.

### Quelle ambulance pour la Timone ?

Pour un transport programmé vers la Timone, contactez une entreprise d'ambulance privée conventionnée si le patient doit être allongé ou surveillé. Pour un patient autonome, un VSL ou un taxi conventionné convient. En cas d'urgence, c'est le 15 qui organise le transport.

## En conclusion

À Marseille, distinguer l'urgence (15, 18, 112) du transport programmé (ambulance privée conventionnée sur prescription) est la clé d'une prise en charge fluide. Pour organiser un transport sanitaire vers les hôpitaux de l'AP-HM, trouvez un transporteur agréé sur [RoullePro à Marseille](/transport-medical/marseille).
`,
  },
  {
    slug: "transport-medical-ald-remboursement-100-2026",
    title:
      "Transport médical en ALD : démarches, formulaires et remboursement 100%",
    excerpt:
      "Transport médical en ALD : conditions du remboursement à 100 %, ALD éligibles, prescription, formulaire CERFA, articulation avec la mutuelle et démarches concrètes. Le guide complet 2026.",
    category: "Transport sanitaire",
    date: "2026-05-24",
    readingTime: 8,
    image: "/blog/transport-medical-ald-remboursement-100-2026.jpg",
    imageAlt:
      "Patient en affection de longue durée montant dans un véhicule de transport sanitaire conventionné",
    keywords: [
      "transport ald",
      "transport médical ald",
      "ald remboursement transport",
      "ald 100 transport",
    ],
    content: `
**En résumé : un patient en affection de longue durée (ALD) peut bénéficier d'une prise en charge à 100 % de ses transports liés à sa pathologie, sur prescription médicale et sous conditions. Le médecin établit le protocole de soins et la prescription de transport (CERFA 11574). Le tiers payant évite l'avance de frais. La mutuelle intervient pour les éventuels restes à charge hors champ ALD.**

Les patients atteints d'une affection de longue durée effectuent souvent de nombreux trajets vers leurs soins : consultations spécialisées, examens, séances de dialyse, chimiothérapie ou radiothérapie. Le dispositif ALD permet, sous conditions, une prise en charge à 100 % de ces transports. Encore faut-il connaître les démarches et les formulaires. Ce guide les détaille pour 2026.

## Qu'est-ce qu'une ALD ?

L'affection de longue durée est une maladie nécessitant un suivi prolongé et des soins coûteux, reconnue par l'Assurance Maladie. Cette reconnaissance ouvre droit à une exonération du ticket modérateur pour les soins en lien avec la pathologie, c'est-à-dire une prise en charge à 100 % du tarif de base de l'Assurance Maladie.

Il existe une liste d'ALD dites exonérantes (par exemple certains cancers, le diabète, l'insuffisance rénale chronique terminale, certaines maladies cardiovasculaires). La liste et les critères sont présentés sur [Ameli.fr](https://www.ameli.fr/assure/remboursements/rembourse/affections-longue-duree-et-situations-particulieres). C'est le médecin traitant qui demande la reconnaissance de l'ALD via un protocole de soins, validé par le médecin-conseil de l'Assurance Maladie.

## Transport en ALD : quelles conditions pour le 100 % ?

La prise en charge à 100 % du transport suppose deux conditions cumulatives :

- Le patient est reconnu en ALD.
- Le transport est en lien direct avec la pathologie reconnue au titre de l'ALD et le patient présente une incapacité ou une déficience justifiant un transport (état médical le nécessitant).

Autrement dit, tous les transports d'un patient en ALD ne sont pas automatiquement pris en charge à 100 % : seul le transport lié aux soins de la pathologie exonérante l'est, lorsque l'état du patient le justifie. Les règles sont précisées sur [Service-Public.fr](https://www.service-public.fr/particuliers/vosdroits/F165).

## Quel mode de transport selon l'état du patient ?

Le médecin prescrit le mode adapté à l'état de santé :

- Transport assis (taxi conventionné ou VSL) pour un patient autonome.
- Ambulance pour un patient devant être transporté allongé ou sous surveillance.

Pour arbitrer entre transport assis et allongé, notre comparatif [VSL ou taxi conventionné](/blog/vsl-ou-taxi-conventionne-comparatif-2026) est utile. Le respect du mode prescrit est important : un mode plus coûteux que nécessaire peut ne pas être intégralement pris en charge.

## Les démarches pas à pas

1. Faire reconnaître l'ALD : le médecin traitant établit le protocole de soins, transmis au médecin-conseil pour validation.
2. Obtenir la prescription de transport : à chaque besoin, le médecin remplit le formulaire CERFA 11574 en précisant le mode et le motif. Voir notre guide [CERFA 11574 rempli](/blog/cerfa-11574-bon-transport-medical-exemple-rempli).
3. Choisir un transporteur conventionné, proche du domicile.
4. Présenter carte Vitale et prescription le jour du trajet ; le tiers payant s'applique.
5. Conserver les justificatifs, notamment pour les soins en série.

## Le formulaire CERFA et la prescription

Le document central est la prescription médicale de transport, formellement le CERFA 11574. Le médecin y indique le motif médical, le mode de transport et, le cas échéant, le caractère répété des trajets. Pour certaines situations (transport de longue distance, transport en série), une demande d'accord préalable auprès de l'Assurance Maladie peut être requise. Mieux vaut vérifier ce point avec son médecin ou sa CPAM.

## Combien d'aller-retours sont pris en charge ?

Il n'existe pas de plafond forfaitaire universel : la prise en charge couvre les transports médicalement justifiés en lien avec l'ALD. Pour les soins répétés (dialyse trois fois par semaine, séances de radiothérapie quotidiennes), les trajets correspondants sont pris en charge dès lors qu'ils sont prescrits. Certaines situations de transport en série ou de longue distance peuvent nécessiter un accord préalable.

## Articulation avec la mutuelle

La prise en charge à 100 % en ALD s'applique au tarif de base de l'Assurance Maladie pour les soins liés à la pathologie. La complémentaire santé (mutuelle) intervient pour :

- Les éventuels dépassements ou restes à charge non couverts.
- Les transports hors champ ALD, pris en charge à 65 % par l'Assurance Maladie, dont la mutuelle peut couvrir le solde.

Il est donc utile de vérifier les garanties transport de son contrat de complémentaire santé.

## Cas concrets de transports en ALD

Quelques situations fréquentes permettent de mieux comprendre le dispositif.

### Dialyse trois fois par semaine

Un patient en insuffisance rénale chronique terminale se rend en centre de dialyse trois fois par semaine, soit environ 156 trajets aller-retour par an. Sur prescription médicale, ces transports répétés vers le centre le plus proche adapté sont pris en charge à 100 % au titre de l'ALD. Le mode est généralement le transport assis (VSL ou taxi conventionné), sauf état médical particulier justifiant l'ambulance. Le tiers payant évite au patient toute avance de frais sur l'année.

### Chimiothérapie et radiothérapie

Un patient suivi pour un cancer reconnu en ALD effectue des cures de chimiothérapie espacées ou des séances de radiothérapie quotidiennes pendant plusieurs semaines. Ces trajets vers l'établissement de soins sont pris en charge dès lors qu'ils sont prescrits. Pour les séries de transports, le médecin peut établir une prescription couvrant l'ensemble du cycle ; un accord préalable de l'Assurance Maladie est parfois requis selon la nature et la distance des trajets.

### Consultation de suivi spécialisée

Un patient diabétique en ALD consulte régulièrement un endocrinologue. Si son état de santé justifie un transport (incapacité ou déficience), le trajet vers cette consultation liée à la pathologie peut être pris en charge à 100 %. En revanche, un trajet sans lien avec le diabète, par exemple pour une affection bénigne sans rapport, relève du régime de droit commun (65 %).

## Exemple chiffré d'un trajet

Prenons un trajet en taxi conventionné facturé 60 euros pour une consultation liée à l'ALD. La prise en charge à 100 % au titre de l'ALD couvre l'intégralité du tarif conventionné applicable, et le tiers payant fait que le patient ne paie rien au transporteur. À l'inverse, pour un trajet hors champ ALD facturé 60 euros, l'Assurance Maladie rembourse 65 %, soit 39 euros, et la mutuelle peut couvrir tout ou partie des 21 euros restants selon le contrat. La différence de reste à charge illustre l'intérêt de bien préciser le motif sur la prescription.

## Conserver et organiser ses justificatifs

Pour les patients réalisant de nombreux trajets, il est recommandé de conserver une copie des prescriptions et des justificatifs de transport, notamment en cas de soins en série. En cas de difficulté de prise en charge ou de contestation, ces documents facilitent les échanges avec la CPAM. Le compte Ameli en ligne permet par ailleurs de suivre les remboursements de transport effectués et de vérifier l'application correcte du taux à 100 %.

## Que faire en cas de refus de prise en charge ?

Il arrive qu'un transport en ALD ne soit pas pris en charge à 100 % comme attendu. Plusieurs causes sont possibles : un motif mal renseigné sur la prescription, un transport sans lien direct avec la pathologie exonérante, l'absence d'accord préalable pour un transport en série ou de longue distance, ou encore un mode de transport non conforme à l'état du patient. Identifier la cause est la première étape pour régulariser la situation.

En cas de difficulté, le bon réflexe est de se rapprocher de sa CPAM, muni de la prescription et des justificatifs de transport. Le médecin prescripteur peut, si nécessaire, préciser ou corriger le motif médical. Pour les situations nécessitant un accord préalable, mieux vaut anticiper cette formalité avant le transport plutôt que de la régulariser après coup. Enfin, la complémentaire santé peut intervenir sur les restes à charge qui ne relèveraient pas du champ ALD. Une prescription claire, un transporteur conventionné et un mode de transport adapté restent la meilleure protection contre les mauvaises surprises de remboursement.

## Questions fréquentes

### Qui décide de l'ALD ?

La reconnaissance de l'ALD est demandée par le médecin traitant, qui établit un protocole de soins. Ce protocole est validé par le médecin-conseil de l'Assurance Maladie. C'est cette validation qui ouvre droit à l'exonération du ticket modérateur pour les soins liés à la pathologie.

### Quel formulaire pour un transport ALD ?

Le formulaire est la prescription médicale de transport, le CERFA 11574, rempli par le médecin. Il précise le mode de transport et le motif médical. Selon la situation (longue distance, série), un accord préalable de l'Assurance Maladie peut être nécessaire.

### Combien d'aller-retours par an sont remboursés ?

Il n'y a pas de plafond forfaitaire universel : sont pris en charge les transports médicalement justifiés et prescrits en lien avec l'ALD. Pour les soins répétés comme la dialyse ou la radiothérapie, les trajets correspondants sont couverts dès lors qu'ils sont prescrits.

## En conclusion

Le transport médical en ALD peut être pris en charge à 100 %, à condition d'être prescrit et lié à la pathologie reconnue. La clé réside dans le protocole de soins, la prescription CERFA 11574 et le choix d'un transporteur conventionné. Pour trouver un professionnel agréé près de chez vous, lancez une recherche sur [RoullePro](/transport-medical/recherche).
`,
  },
  {
    slug: "cerfa-11574-bon-transport-medical-exemple-rempli",
    title:
      "Bon de transport médical CERFA 11574 : exemple rempli pas-à-pas",
    excerpt:
      "Le CERFA 11574 expliqué champ par champ : qui le remplit, exemple rempli pas-à-pas, erreurs fréquentes à éviter, cas particuliers (urgence, transport en série) et durée de validité. Guide pratique 2026.",
    category: "Transport sanitaire",
    date: "2026-05-26",
    readingTime: 8,
    image: "/blog/cerfa-11574-bon-transport-medical-exemple-rempli.jpg",
    imageAlt:
      "Formulaire CERFA 11574 de prescription médicale de transport rempli posé sur un bureau",
    keywords: [
      "cerfa 11574",
      "bon de transport médical",
      "formulaire transport sanitaire",
      "prescription transport médical",
    ],
    content: `
**En résumé : le CERFA 11574 est la prescription médicale de transport. Il est rempli par le médecin (ou le praticien hospitalier) et conditionne le remboursement du transport sanitaire. Il précise l'identité du patient, le motif médical, le mode de transport prescrit et son caractère éventuel en série. Sans ce document correctement rempli, aucun remboursement n'est possible.**

Le bon de transport médical, officiellement le formulaire CERFA 11574, est la pièce maîtresse de tout transport sanitaire remboursé. Mal rempli ou absent, il bloque la prise en charge. Ce guide le décortique champ par champ, propose un exemple rempli et liste les erreurs à éviter, pour 2026.

## À quoi sert le CERFA 11574 ?

Le CERFA 11574 est la prescription médicale de transport. Il atteste que le déplacement du patient vers ses soins est médicalement justifié et indique le mode de transport adapté à son état. C'est ce document que le transporteur joint à sa facturation pour obtenir le paiement par l'Assurance Maladie. Le cadre général est décrit sur [Ameli.fr](https://www.ameli.fr/assure/remboursements/rembourse/transports).

## Qui remplit le formulaire ?

Le formulaire est rempli par un médecin : médecin traitant, médecin spécialiste ou praticien hospitalier. Dans certains cas, une sage-femme ou un chirurgien-dentiste peut prescrire un transport dans le cadre de ses compétences. Le patient ne remplit pas lui-même la partie médicale ; il fournit simplement ses informations administratives et sa carte Vitale au transporteur.

## Le formulaire champ par champ

Voici les principales rubriques du CERFA 11574 et comment elles sont renseignées.

### Identification du patient

Nom, prénom, date de naissance et numéro de sécurité sociale (NIR) du patient. Ces informations doivent être exactes pour permettre le rapprochement avec le dossier de l'Assurance Maladie.

### Motif et nature du transport

Le médecin coche le motif médical : hospitalisation, soins ou traitement en lien avec une ALD, transport lié à un accident du travail, soins en série, etc. Cette case détermine le taux de prise en charge (65 % ou 100 %). Pour comprendre le lien avec l'ALD, voir notre guide [Transport médical en ALD](/blog/transport-medical-ald-remboursement-100-2026).

### Mode de transport prescrit

Le médecin indique le mode adapté à l'état du patient : transport assis (taxi conventionné ou VSL) ou ambulance (transport allongé ou surveillé). Le choix doit être médicalement justifié. Notre comparatif [VSL ou taxi conventionné](/blog/vsl-ou-taxi-conventionne-comparatif-2026) explique les critères.

### Caractère répété (transport en série)

Pour des soins répétés (dialyse, radiothérapie), le médecin peut prescrire un transport en série, ce qui évite de refaire une prescription à chaque trajet sur la période concernée.

### Date, signature et cachet

Le formulaire doit être daté, signé et porter le cachet du prescripteur. Une prescription non signée est invalide.

## Exemple rempli pas-à-pas

Prenons une patiente reconnue en ALD pour une insuffisance rénale, devant se rendre trois fois par semaine en centre de dialyse, en transport assis.

1. Identification : nom, prénom, date de naissance et NIR de la patiente.
2. Motif : case soins en lien avec l'ALD cochée.
3. Mode de transport : transport assis prescrit (la patiente est autonome).
4. Caractère répété : transport en série coché, avec la période couverte.
5. Date, signature et cachet du néphrologue.

Munie de ce formulaire, la patiente choisit un transporteur conventionné, qui assure les trajets et facture l'Assurance Maladie en tiers payant. En ALD, la prise en charge est de 100 %.

## Erreurs fréquentes à éviter

- Oublier la signature ou le cachet du prescripteur : la prescription est alors invalide.
- Renseigner un NIR ou une date de naissance erronés, ce qui bloque le rapprochement.
- Choisir un mode de transport non conforme à l'état du patient.
- Ne pas cocher le caractère répété alors que les soins sont en série, obligeant à multiplier les prescriptions.
- Perdre l'original : conservez toujours le document jusqu'au remboursement.

## Cas particuliers

### Urgence

En cas d'urgence, le transport peut être réalisé avant l'établissement de la prescription, qui est alors régularisée a posteriori. La régulation médicale du 15 organise le transport ; voir notre article [Ambulance privée vs publique](/blog/ambulance-privee-vs-publique-2026).

### Transport de longue distance ou en série

Certains transports (longue distance, série) peuvent nécessiter un accord préalable de l'Assurance Maladie. Le médecin et la CPAM peuvent indiquer si cette formalité s'applique.

## Durée de validité et perte

La prescription doit être utilisée dans un délai raisonnable en lien avec les soins prescrits. Pour un transport en série, elle couvre la période indiquée. En cas de perte, rapprochez-vous du prescripteur pour obtenir un duplicata avant le trajet, faute de quoi le remboursement peut être compromis.

## Version papier et prescription dématérialisée

Le CERFA 11574 existe historiquement en version papier, remise au patient qui la transmet au transporteur. L'Assurance Maladie développe par ailleurs la prescription électronique de transport, qui permet au médecin de transmettre directement la prescription de façon dématérialisée. Cette évolution vise à réduire les erreurs de saisie, les pertes de documents et les retards de remboursement. Selon les établissements et les éditeurs de logiciels médicaux, la bascule vers le format électronique se fait progressivement. Dans les deux cas, le contenu reste identique : identité du patient, motif médical, mode de transport et caractère éventuellement répété.

## Lien avec la facturation du transporteur

Une fois le trajet réalisé, le transporteur conventionné s'appuie sur le CERFA 11574 pour facturer l'Assurance Maladie. C'est pourquoi la cohérence entre le mode prescrit et le mode réellement utilisé est essentielle : un transport en ambulance facturé alors qu'un transport assis était prescrit peut entraîner un rejet ou un remboursement partiel. De même, la zone géographique et la distance facturées doivent correspondre au trajet réel entre le domicile et le lieu de soins. Le patient n'a normalement aucune démarche de facturation à effectuer lorsque le tiers payant s'applique.

## Conseils pratiques pour les patients

Quelques réflexes simplifient le parcours. Demandez la prescription suffisamment tôt, idéalement lors de la consultation où les soins sont programmés. Vérifiez avec le médecin que le motif coché correspond bien à votre situation, notamment si vous êtes en ALD. Conservez une copie du document avant de le remettre au transporteur. Enfin, pour les soins en série, assurez-vous que la période couverte englobe l'ensemble des séances prévues, afin d'éviter une rupture de prise en charge en cours de traitement.

## Et après la prescription : choisir son transporteur

Une fois le CERFA 11574 en main, le patient est libre de choisir son transporteur, à condition qu'il soit conventionné avec l'Assurance Maladie et qu'il pratique le mode de transport prescrit. Ce choix n'a rien d'anodin : un transporteur proche du domicile réduit les délais et, pour certains trajets, le coût kilométrique. Pour des soins répétés, un même prestataire assurant l'ensemble des trajets simplifie nettement l'organisation et instaure une relation de confiance.

Concrètement, plusieurs options existent pour identifier un professionnel adapté : le bouche-à-oreille, les recommandations de l'établissement de soins, ou un annuaire spécialisé permettant une recherche géolocalisée. Cette dernière approche est souvent la plus rapide : elle affiche les transporteurs agréés les plus proches et leurs coordonnées en quelques secondes. Pour aller plus loin sur cette étape, consultez notre guide [Ambulance près de chez moi](/blog/ambulance-pres-de-chez-moi-trouver-2026), qui détaille la méthode de recherche et les critères de sélection. La prescription reste la pièce maîtresse, mais le choix du bon transporteur conditionne la qualité concrète du transport.

## Questions fréquentes

### Qui remplit le CERFA 11574 ?

Le formulaire est rempli par un médecin (traitant, spécialiste ou hospitalier), et dans certains cas par une sage-femme ou un chirurgien-dentiste dans leur champ de compétence. Le patient fournit ses informations administratives et sa carte Vitale, mais ne remplit pas la partie médicale.

### Quelle est la validité du bon de transport ?

La prescription doit être utilisée en cohérence avec les soins prescrits. Pour un transport en série, elle couvre la période indiquée par le médecin. Une prescription trop ancienne ou sans lien avec un soin en cours peut ne pas être prise en charge.

### Que faire si on a perdu le bon de transport ?

Contactez le médecin prescripteur pour obtenir un duplicata avant d'effectuer le trajet. Sans prescription valable présentée au transporteur, le transport risque de ne pas être remboursé et de rester à votre charge.

## En conclusion

Le CERFA 11574 est la clé de voûte du remboursement du transport sanitaire : bien rempli, signé et conforme à l'état du patient, il garantit une prise en charge fluide. Une fois la prescription en main, trouvez un transporteur conventionné près de chez vous sur [RoullePro](/transport-medical/recherche).
`,
  },
  {
    slug: "vsl-ou-taxi-conventionne-comparatif-2026",
    title:
      "VSL ou taxi conventionné : lequel choisir selon votre situation (avec arbre de décision)",
    excerpt:
      "VSL ou taxi conventionné : tableau comparatif, arbre de décision, critères médicaux (autonomie, accompagnement), coûts et remboursement. Le guide clair pour savoir lequel choisir en 2026.",
    category: "Transport sanitaire",
    date: "2026-05-28",
    readingTime: 8,
    image: "/blog/vsl-ou-taxi-conventionne-comparatif-2026.jpg",
    imageAlt:
      "Véhicule sanitaire léger et taxi conventionné stationnés côte à côte devant un centre de soins",
    keywords: [
      "vsl ou taxi conventionné",
      "différence vsl taxi",
      "transport médical assis",
      "vsl véhicule sanitaire léger",
    ],
    content: `
**En résumé : le VSL (véhicule sanitaire léger) et le taxi conventionné sont deux modes de transport assis pour patients autonomes, tous deux pris en charge par l'Assurance Maladie sur prescription. Le VSL est conduit par un personnel formé au transport sanitaire et peut transporter plusieurs patients ; le taxi conventionné offre souvent plus de souplesse. Le choix dépend de l'état du patient, du besoin d'accompagnement et de l'offre locale, mais c'est le médecin qui prescrit le mode adapté.**

Quand un patient doit se rendre à ses soins sans avoir besoin d'être allongé, deux options de transport assis s'offrent à lui : le VSL ou le taxi conventionné. Les deux sont remboursés dans les mêmes conditions, mais présentent des différences pratiques. Ce guide propose un comparatif clair et un arbre de décision pour 2026.

## Deux transports assis, un même cadre de remboursement

Le VSL et le taxi conventionné relèvent tous deux du transport assis professionnalisé, destiné aux patients autonomes ne nécessitant ni position allongée ni surveillance médicale. Leur prise en charge par l'Assurance Maladie est identique : 65 % du tarif conventionné dans le cas général, 100 % en ALD, hospitalisation ou accident du travail, avec tiers payant. Les règles figurent sur [Ameli.fr](https://www.ameli.fr/assure/remboursements/rembourse/transports).

La différence avec l'ambulance est nette : l'ambulance est réservée aux transports allongés ou surveillés. Pour cette distinction, voir [Ambulance privée vs publique](/blog/ambulance-privee-vs-publique-2026).

## Qu'est-ce qu'un VSL ?

Le véhicule sanitaire léger est un véhicule agréé pour le transport sanitaire assis, conduit par un personnel formé (auxiliaire ambulancier ou ambulancier). Il peut transporter jusqu'à trois patients simultanément et est équipé pour le transport sanitaire (signalétique, matériel de première nécessité). Il est exploité par une entreprise de transport sanitaire agréée par l'ARS.

## Qu'est-ce qu'un taxi conventionné ?

Le taxi conventionné est un taxi ordinaire ayant signé une convention avec l'Assurance Maladie. Pour un transport prescrit, il applique la grille conventionnée et pratique le tiers payant. Il offre généralement une grande souplesse de réservation et une bonne couverture territoriale, y compris en zone peu dense. Nos guides villes détaillent son fonctionnement, par exemple à [Paris](/blog/taxi-conventionne-paris-tarifs-cpam-2026) ou à [Lyon](/blog/taxi-conventionne-lyon-guide-2026).

## Tableau comparatif

| Critère | VSL | Taxi conventionné |
| --- | --- | --- |
| Type de transport | Assis, sanitaire | Assis, conventionné |
| Conducteur | Personnel formé au transport sanitaire | Chauffeur de taxi |
| Patients transportés | Jusqu'à trois | En général un (ou covoiturage selon organisation) |
| Souplesse de réservation | Selon disponibilité de l'entreprise | Souvent élevée |
| Couverture territoriale | Bonne en zone urbaine | Très bonne, y compris zones rurales |
| Prise en charge CPAM | 65 % (100 % en ALD) | 65 % (100 % en ALD) |
| Tiers payant | Oui | Oui |

## Arbre de décision

Voici une logique simple pour s'orienter. C'est néanmoins toujours le médecin qui prescrit le mode adapté.

1. Le patient doit-il être transporté allongé ou surveillé ? Si oui, ce n'est ni un VSL ni un taxi : il faut une ambulance.
2. Si le patient est autonome et assis : un transport assis convient (VSL ou taxi conventionné).
3. Le patient a-t-il besoin d'un accompagnement par un personnel formé au transport sanitaire (aide à la marche, fragilité particulière) ? Si oui, le VSL est souvent privilégié.
4. La priorité est-elle la souplesse horaire ou la couverture en zone peu dense ? Le taxi conventionné est souvent plus disponible.
5. Dans tous les cas : suivre le mode prescrit par le médecin sur le CERFA 11574. Voir notre guide [CERFA 11574](/blog/cerfa-11574-bon-transport-medical-exemple-rempli).

## Critères médicaux à considérer

- Autonomie : capacité à se déplacer et à monter seul dans le véhicule.
- Besoin d'aide : assistance à la marche, fragilité, désorientation.
- Position : assise possible sans difficulté, sinon transport allongé requis.
- Fauteuil roulant : un patient en fauteuil pliable autonome peut souvent voyager en transport assis ; un transport adapté peut être nécessaire selon la situation, à apprécier médicalement.

## Coûts et reste à charge

Le coût brut diffère selon la grille (VSL relevant des tarifs sanitaires, taxi relevant de la convention taxi départementale), mais la logique de remboursement est la même. Pour le patient en ALD ou hospitalisé, le reste à charge est nul grâce à la prise en charge à 100 % et au tiers payant. Hors ALD, le solde de 35 % est généralement couvert par la complémentaire santé. Pour la logique de tarif, voir notre [grille tarifaire 2026](/blog/tarif-taxi-conventionne-2026-grille-cpam).

## Disponibilité et délais selon les territoires

Le choix entre VSL et taxi conventionné dépend souvent de l'offre réellement disponible autour du patient. En zone urbaine dense, les entreprises de transport sanitaire disposent de flottes de VSL importantes et les délais sont généralement courts. En zone rurale ou périurbaine, le taxi conventionné assure souvent une meilleure couverture, car il maille le territoire plus finement et reste disponible aux heures creuses. Pour les rendez-vous très matinaux, fréquents en dialyse ou en imagerie, la réservation anticipée est dans tous les cas conseillée. Lorsque les deux modes sont disponibles, il est pertinent de privilégier celui qui assure la régularité sur l'ensemble d'un cycle de soins.

## Confort et expérience du patient

Au-delà du remboursement identique, l'expérience peut différer. Le VSL est conçu pour le transport sanitaire : le personnel est formé à l'aide à la personne, à la prise en charge de patients fragiles et au respect des règles d'hygiène. Le taxi conventionné, plus polyvalent, offre un cadre proche d'un trajet classique, ce qui convient bien aux patients pleinement autonomes. Pour une personne âgée nécessitant une aide à la marche ou rassurée par la présence d'un personnel formé, le VSL apporte un confort supplémentaire. Pour un patient autonome attaché à la souplesse horaire, le taxi conventionné est souvent préféré.

## Le rôle central de la prescription

Quel que soit le mode envisagé, la prescription médicale prime. Le médecin évalue l'état du patient et coche le mode adapté sur le CERFA 11574. Choisir de sa propre initiative un mode différent de celui prescrit expose à un défaut de prise en charge. Si l'état de santé évolue, il convient de demander une nouvelle prescription plutôt que de modifier seul le mode de transport. Cette logique protège le patient : elle garantit que le mode utilisé correspond à un besoin médical reconnu et donc remboursable.

## Cas du covoiturage sanitaire

Pour optimiser les coûts, le transport assis peut être organisé en transport partagé, plusieurs patients se rendant au même type de soins voyageant ensemble. Cette pratique, plus fréquente en VSL du fait de la capacité du véhicule, n'altère pas le remboursement du patient. Elle peut en revanche allonger légèrement la durée du trajet en raison des prises en charge successives. Le patient en est généralement informé lors de la réservation et peut en discuter avec le transporteur selon ses contraintes horaires.

## Démarches communes aux deux modes

Que le choix se porte sur un VSL ou un taxi conventionné, les démarches du patient sont identiques. Tout part de la prescription médicale (CERFA 11574), sur laquelle le médecin indique le mode de transport assis adapté à l'état de santé. Le patient choisit ensuite un transporteur conventionné, présente sa carte Vitale et sa prescription le jour du trajet, et bénéficie du tiers payant sans avance de frais. Pour les soins en série, comme la dialyse ou la rééducation, la prescription peut couvrir l'ensemble de la période, ce qui évite de renouveler la formalité à chaque séance.

Cette unité de procédure simplifie la vie du patient : il n'a pas à maîtriser les subtilités administratives propres à chaque mode. Son seul réflexe utile est de vérifier que le transporteur retenu est bien conventionné et qu'il pratique le mode prescrit. En cas d'évolution de son état de santé, une nouvelle prescription permet d'ajuster le mode de transport, voire de basculer vers une ambulance si une position allongée ou une surveillance devient nécessaire. La prescription reste ainsi le fil conducteur, quel que soit le véhicule choisi.

## Questions fréquentes

### Le VSL est-il plus cher que le taxi conventionné ?

Les tarifs de base relèvent de grilles différentes, mais la prise en charge par l'Assurance Maladie est identique (65 %, ou 100 % en ALD) avec tiers payant. Pour le patient, le reste à charge est donc le même dans la plupart des cas. Le choix se fait surtout sur des critères pratiques et médicaux.

### Qui décide entre VSL et taxi conventionné ?

Le médecin prescrit le mode de transport adapté à l'état du patient sur le CERFA 11574. Entre deux modes assis équivalents, le patient peut tenir compte de la disponibilité locale et de son besoin d'accompagnement, dans le respect de la prescription.

### Peut-on prendre un VSL si l'on est en fauteuil roulant ?

Un patient en fauteuil roulant pliable et suffisamment autonome peut souvent voyager en transport assis. Selon la situation, un véhicule adapté peut être nécessaire. C'est le médecin qui apprécie le mode de transport approprié et l'indique sur la prescription.

## En conclusion

VSL et taxi conventionné sont deux solutions de transport assis remboursées de la même façon ; le choix dépend de l'état du patient, du besoin d'accompagnement et de l'offre locale, toujours dans le cadre de la prescription médicale. Pour comparer les transporteurs disponibles près de chez vous, lancez une recherche sur [RoullePro](/transport-medical/recherche).
`,
  },
  {
    slug: "ambulance-pres-de-chez-moi-trouver-2026",
    title:
      "Ambulance près de chez moi : comment trouver le bon transporteur en 30 secondes",
    excerpt:
      "Trouver une ambulance ou un transporteur sanitaire près de chez soi en 2026 : méthode pas à pas, critères de choix, vérification de l'agrément CPAM, géolocalisation RoullePro et distinction urgence / programmé.",
    category: "Transport sanitaire",
    date: "2026-05-30",
    readingTime: 8,
    image: "/blog/ambulance-pres-de-chez-moi-trouver-2026.jpg",
    imageAlt:
      "Carte de géolocalisation affichant des ambulances disponibles à proximité sur un smartphone",
    keywords: [
      "ambulance près de chez moi",
      "trouver ambulance",
      "ambulance proche",
      "transport sanitaire local",
    ],
    content: `
**En résumé : pour un transport programmé, on trouve une ambulance ou un transporteur sanitaire près de chez soi en utilisant un annuaire géolocalisé, en vérifiant l'agrément et le conventionnement, puis en réservant à l'avance avec sa prescription. Pour une urgence vitale, on n'effectue aucune recherche : on appelle immédiatement le 15.**

Quand survient un besoin de transport sanitaire, la première question est souvent : comment trouver rapidement une ambulance fiable à proximité ? La réponse dépend de la situation. Pour une urgence, le réflexe est immédiat. Pour un transport programmé, une méthode simple permet de choisir le bon transporteur en quelques secondes. Ce guide la détaille pour 2026.

## D'abord : urgence ou transport programmé ?

La distinction est fondamentale et conditionne toute la démarche.

- Urgence vitale (malaise grave, détresse, accident) : ne cherchez pas d'ambulance, appelez le 15 (SAMU) ou le 112. La régulation médicale envoie le moyen le plus adapté. Voir [Ambulance privée vs publique](/blog/ambulance-privee-vs-publique-2026).
- Transport programmé (hospitalisation prévue, retour à domicile, soins en série) : c'est là qu'une recherche de transporteur a du sens, sur prescription médicale.

Le reste de ce guide concerne le transport programmé.

## La méthode en 30 secondes

1. Munissez-vous de votre prescription médicale de transport (CERFA 11574). Voir notre guide [CERFA 11574](/blog/cerfa-11574-bon-transport-medical-exemple-rempli).
2. Lancez une recherche géolocalisée sur un annuaire spécialisé, en indiquant votre ville ou en activant la localisation.
3. Vérifiez que le transporteur est agréé et conventionné.
4. Comparez la proximité, la disponibilité et les avis éventuels.
5. Réservez en précisant adresse, horaire, motif et mode de transport prescrit.

RoullePro permet précisément cette recherche : utilisez la [recherche transport médical](/transport-medical/recherche) avec l'option de géolocalisation pour afficher les professionnels proches, ou parcourez les transporteurs de votre ville, par exemple à [Paris](/transport-medical/paris), [Lyon](/transport-medical/lyon) ou [Marseille](/transport-medical/marseille).

## Les critères pour bien choisir

- Proximité : un transporteur proche réduit les délais et, pour certains trajets, le coût kilométrique.
- Agrément et conventionnement : indispensables pour la prise en charge et le tiers payant.
- Disponibilité : capacité à assurer le créneau souhaité, surtout pour les transports matinaux.
- Mode de transport adapté : assis (VSL, taxi conventionné) ou allongé (ambulance), selon la prescription. Voir [VSL ou taxi conventionné](/blog/vsl-ou-taxi-conventionne-comparatif-2026).
- Régularité : pour des soins en série, un transporteur capable d'assurer tous les trajets simplifie l'organisation.

## Vérifier l'agrément CPAM

Un transporteur sanitaire doit disposer d'un agrément de l'ARS et, pour bénéficier du tiers payant, d'une convention avec l'Assurance Maladie. Pour vous en assurer :

- Demandez directement au transporteur de confirmer son conventionnement.
- Vérifiez la mention sur ses supports ou son profil dans un annuaire spécialisé.
- En cas de doute, rapprochez-vous de votre CPAM. Le cadre du remboursement figure sur [Ameli.fr](https://www.ameli.fr/assure/remboursements/rembourse/transports) et [Service-Public.fr](https://www.service-public.fr/particuliers/vosdroits/F165).

## Pourquoi la géolocalisation change tout

Chercher manuellement parmi des dizaines de transporteurs prend du temps. Une recherche géolocalisée affiche directement les professionnels les plus proches de votre position ou de l'adresse saisie, avec leurs coordonnées. C'est l'approche la plus rapide pour un transport programmé, et elle évite les allers-retours téléphoniques. RoullePro propose cette fonction sur sa [page de recherche](/transport-medical/recherche).

## Anticiper pour éviter les déconvenues

- Réservez la veille pour les rendez-vous matinaux.
- Communiquez précisément l'adresse de départ et de destination.
- Préparez carte Vitale et prescription pour le jour du trajet.
- Pour des soins répétés, calez à l'avance l'ensemble des créneaux.

## Quels professionnels trouver près de chez soi ?

Le terme ambulance est souvent employé de façon générique, mais plusieurs métiers du transport sanitaire peuvent répondre au besoin selon la prescription.

### Entreprises d'ambulance

Elles assurent les transports allongés ou nécessitant une surveillance, avec un équipage formé (ambulancier diplômé d'État et auxiliaire ambulancier). Elles disposent également souvent de VSL pour le transport assis. Ce sont les interlocuteurs naturels pour un retour d'hospitalisation après une intervention.

### Taxis conventionnés

Pour un transport assis prescrit, le taxi conventionné est souvent le plus disponible et le mieux réparti sur le territoire, y compris en zone peu dense. Il applique la grille conventionnée et le tiers payant. Nos guides détaillent son fonctionnement, par exemple à [Paris](/blog/taxi-conventionne-paris-tarifs-cpam-2026).

### Sociétés de VSL

Le véhicule sanitaire léger, conduit par un personnel formé, convient aux patients autonomes ayant besoin d'un accompagnement. Pour arbitrer entre les modes assis, voir notre [comparatif VSL ou taxi conventionné](/blog/vsl-ou-taxi-conventionne-comparatif-2026).

## Erreurs fréquentes à éviter

Plusieurs réflexes erronés font perdre du temps ou compromettent la prise en charge.

- Chercher une ambulance soi-même en situation d'urgence vitale au lieu d'appeler le 15 : c'est une perte de temps dangereuse.
- Réserver sans prescription : sans CERFA 11574 valable, le transport risque de rester à votre charge.
- Choisir un transporteur non conventionné : le tiers payant ne s'applique pas et l'avance de frais devient nécessaire.
- Prévenir trop tard : pour un rendez-vous matinal, une réservation de dernière minute peut ne pas trouver de créneau.
- Donner une adresse imprécise : cela rallonge la prise en charge et peut générer des frais d'attente.

## Combien coûte le transport et qui paie ?

Pour un transport prescrit et réalisé par un transporteur conventionné, le patient n'avance en principe rien grâce au tiers payant. L'Assurance Maladie prend en charge 65 % du tarif conventionné dans le cas général, et 100 % en ALD, hospitalisation ou accident du travail. Le solde éventuel est généralement couvert par la complémentaire santé. Le coût total dépend du mode de transport, de la distance et de la grille applicable ; pour comprendre la logique tarifaire, consultez notre [grille tarifaire 2026](/blog/tarif-taxi-conventionne-2026-grille-cpam). L'essentiel à retenir : un transport correctement prescrit et confié à un professionnel conventionné laisse, dans la grande majorité des cas, un reste à charge nul ou minime.

## Préparer son appel ou sa réservation

Pour gagner du temps lors de la réservation, rassemblez au préalable quelques informations : l'adresse exacte de départ et de destination, l'horaire du rendez-vous de soins, le mode de transport prescrit, ainsi que votre numéro de sécurité sociale. Indiquez tout besoin particulier (aide à la marche, étage sans ascenseur, fauteuil roulant). Ces précisions permettent au transporteur d'envoyer le véhicule et l'équipage adaptés, et d'éviter les mauvaises surprises le jour J. Pour des soins en série, fournir l'ensemble du calendrier dès la première réservation simplifie considérablement l'organisation.

## En zone rurale ou mal desservie

Trouver un transporteur près de chez soi est généralement simple en ville, où l'offre est dense. En zone rurale ou mal desservie, la démarche demande davantage d'anticipation. Le taxi conventionné y joue souvent un rôle clé, car il maille le territoire plus finement que les entreprises d'ambulance, parfois concentrées dans les pôles urbains. Réserver plusieurs jours à l'avance, surtout pour les rendez-vous matinaux ou les soins réguliers, devient alors une nécessité plutôt qu'un confort.

Dans ces territoires, la distance vers l'établissement de soins peut être importante, ce qui rend d'autant plus utile le choix d'un transporteur conventionné pratiquant le tiers payant : le patient n'a pas à avancer des sommes parfois élevées. Un annuaire géolocalisé reste précieux pour repérer les rares professionnels du secteur et comparer leurs disponibilités. Enfin, pour des soins en série dans une zone peu pourvue, fidéliser un transporteur capable d'assurer l'ensemble des trajets sécurise la continuité de la prise en charge, là où improviser à chaque séance serait risqué. L'anticipation et la connaissance de l'offre locale font, plus encore qu'en ville, toute la différence.

## Questions fréquentes

### Comment vérifier qu'une ambulance est agréée CPAM ?

Demandez au transporteur de confirmer son agrément ARS et sa convention avec l'Assurance Maladie, condition du tiers payant. Vous pouvez aussi vérifier la mention sur son profil dans un annuaire spécialisé ou contacter votre CPAM en cas de doute.

### Combien de temps faut-il attendre une ambulance ?

Pour un transport programmé, le délai dépend de la disponibilité du transporteur et du créneau réservé : mieux vaut réserver à l'avance. Pour une urgence, vous n'attendez pas un transport que vous auriez recherché : la régulation du 15 mobilise le moyen le plus proche.

### Puis-je choisir mon transporteur ?

Pour un transport programmé, oui : vous pouvez choisir un transporteur conventionné, idéalement proche de chez vous, dans le respect du mode prescrit. En cas d'urgence, c'est la régulation médicale qui décide du moyen envoyé.

## En conclusion

Trouver une ambulance près de chez soi est simple pour un transport programmé : une recherche géolocalisée, une vérification de l'agrément et une réservation anticipée suffisent. Pour une urgence, le seul bon réflexe reste le 15. Pour identifier en quelques secondes un transporteur conventionné autour de vous, utilisez la [recherche géolocalisée de RoullePro](/transport-medical/recherche).
`,
  },
];
