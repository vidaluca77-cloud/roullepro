import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AnnonceCard from "@/components/AnnonceCard";
import { ArrowRight, CheckCircle, TrendingUp, Info } from "lucide-react";

export const revalidate = 3600;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

type ModeleData = {
  slug: string;
  nom: string;
  marque: string;
  modele: string;
  categoriePrincipale: "utilitaire" | "vtc" | "taxi" | "ambulance" | "tpmr" | "navette";
  categorieSlug: string;
  usagesTypiques: string[];
  prixOccasionFourchette: string;
  avantages: string[];
  inconvenients: string[];
  versionsPopulaires: string[];
  concurrentsDirects: string[];
  intro: string;
  pourquoiRoullepro: string;
  searchKeywords: string[];
};

const MODELES: Record<string, ModeleData> = {
  "renault-trafic": {
    slug: "renault-trafic",
    nom: "Renault Trafic",
    marque: "Renault",
    modele: "Trafic",
    categoriePrincipale: "utilitaire",
    categorieSlug: "utilitaire",
    intro:
      "Le Renault Trafic est l'un des fourgons utilitaires les plus vendus en France depuis plus de 40 ans. Réputé pour sa polyvalence, sa fiabilité et son réseau de pièces détachées, il s'adresse aussi bien aux artisans BTP qu'aux livreurs, ambulanciers et professionnels du transport de personnes.",
    usagesTypiques: [
      "Fourgon artisan BTP (version L1H1 et L2H1)",
      "Cabine approfondie 6 places équipage chantier",
      "Base ambulance / VSL (Trafic SpaceClass)",
      "Navette 9 places (Trafic Combi / Passenger)",
      "Fourgon de livraison urbaine et interurbaine",
    ],
    prixOccasionFourchette: "8 000 € à 35 000 €",
    avantages: [
      "Coût d'entretien parmi les plus bas du segment",
      "Grande disponibilité des pièces détachées sur le marché français",
      "Polyvalence (utilitaire, 9 places, ambulance, VTC)",
      "Bon rapport volume de chargement / encombrement extérieur",
      "Consommation modérée sur les motorisations dCi 2.0",
    ],
    inconvenients: [
      "Versions antérieures à 2019 classées Crit'Air 2 voire 3 selon motorisation",
      "Train roulant sollicité sur usage intensif chantier",
      "Boîte robotisée EDC parfois capricieuse sur fortes kilométrages",
    ],
    versionsPopulaires: [
      "Trafic III dCi 120 L2H1 (2014-2019) — fourgon artisan",
      "Trafic III Blue dCi 150 EDC L2H1 (2019-2024) — livraison premium",
      "Trafic SpaceClass 170 ch (2019-2024) — VTC et transport personnes",
      "Trafic Combi 9 places dCi 150 (toutes années) — navette",
    ],
    concurrentsDirects: [
      "Peugeot Expert",
      "Citroën Jumpy",
      "Opel Vivaro",
      "Ford Transit Custom",
      "Toyota Proace",
    ],
    pourquoiRoullepro:
      "RoullePro met en relation directe les vendeurs professionnels de Trafic d'occasion avec des acheteurs pros qualifiés. Pas de reprise au prix Argus cassé, pas d'intermédiaire qui marge : vous fixez votre prix et récupérez 88 % du prix de vente via notre système de dépôt-vente sécurisé Stripe Connect.",
    searchKeywords: [
      "renault trafic occasion professionnel",
      "trafic fourgon pro",
      "trafic 9 places occasion",
      "trafic combi occasion",
      "trafic ambulance occasion",
    ],
  },
  "renault-master": {
    slug: "renault-master",
    nom: "Renault Master",
    marque: "Renault",
    modele: "Master",
    categoriePrincipale: "utilitaire",
    categorieSlug: "utilitaire",
    intro:
      "Le Renault Master est le leader français du grand fourgon utilitaire. Avec des charges utiles jusqu'à 2,2 tonnes et des volumes jusqu'à 22 m³, il domine les métiers du BTP lourd, du déménagement, de la livraison grand volume et de la carrosserie industrielle.",
    usagesTypiques: [
      "Fourgon L3H2 / L4H3 pour artisan plombier, électricien, maçon",
      "Plancher cabine pour carrossier (benne, caisse atelier, frigorifique)",
      "Minibus 17 places (Master Microbus / School)",
      "Fourgon aménagé déménagement grand volume",
      "Véhicule blindé transport de fonds",
    ],
    prixOccasionFourchette: "10 000 € à 45 000 €",
    avantages: [
      "Plus gros volume utile de sa catégorie",
      "Traction ou propulsion selon besoin (double essieu arrière)",
      "Robustesse éprouvée sur parcs importants (La Poste, Chronopost)",
      "Réseau après-vente national dense",
      "Versions électriques Master E-Tech disponibles sur occasion récente",
    ],
    inconvenients: [
      "Consommation élevée en version essence",
      "Motorisations dCi 135 anciennes avec risque EGR / FAP après 150 000 km",
      "Gabarit peu adapté aux centres-villes",
    ],
    versionsPopulaires: [
      "Master III dCi 135 L3H2 (2014-2019) — artisan BTP",
      "Master III Blue dCi 165 L3H2 (2019-2024) — Crit'Air 1",
      "Master E-Tech 57 kWh L2H2 (2022+) — livraison urbaine ZFE",
      "Master Minibus School 17 places (2018+) — transport scolaire",
    ],
    concurrentsDirects: [
      "Peugeot Boxer",
      "Citroën Jumper",
      "Fiat Ducato",
      "Mercedes Sprinter",
      "Iveco Daily",
    ],
    pourquoiRoullepro:
      "Vendre un Master d'occasion via un concessionnaire signifie perdre 20 à 30 % du prix en marge. Sur RoullePro, vous êtes directement visible par les acheteurs pros qui cherchent votre modèle — sans intermédiaire, sans annonce noyée parmi des véhicules particuliers.",
    searchKeywords: [
      "renault master occasion",
      "master fourgon pro",
      "master L3H2 occasion",
      "master benne occasion",
      "master frigorifique occasion",
    ],
  },
  "mercedes-vito": {
    slug: "mercedes-vito",
    nom: "Mercedes Vito",
    marque: "Mercedes-Benz",
    modele: "Vito",
    categoriePrincipale: "vtc",
    categorieSlug: "vtc",
    intro:
      "Le Mercedes Vito est la référence absolue du VTC haut de gamme et des navettes d'affaires en France. Décliné en utilitaire fourgon, en Tourer 8 places et en Mixto, il allie prestige allemand, fiabilité légendaire et valeur résiduelle élevée.",
    usagesTypiques: [
      "VTC Tourer 8 places (transferts aéroport, événementiel)",
      "Navette hôtelière de luxe",
      "Fourgon d'artisan premium",
      "Mixto 6 places avec zone utilitaire",
      "Base ambulance haut de gamme",
    ],
    prixOccasionFourchette: "15 000 € à 55 000 €",
    avantages: [
      "Valeur de revente la plus élevée du segment",
      "Finition premium adaptée à la clientèle VTC exigeante",
      "Motorisations OM651 / OM654 fiables",
      "Boîte automatique 9G-TRONIC disponible dès 2019",
      "Image de marque qui justifie un tarif VTC supérieur",
    ],
    inconvenients: [
      "Coût d'entretien supérieur au segment généraliste",
      "Pièces détachées plus chères qu'un Trafic ou un Transit",
      "Disponibilité réseau limitée hors grandes villes",
    ],
    versionsPopulaires: [
      "Vito 114 CDI Tourer Select 8 places (2016-2020) — VTC entrée de gamme",
      "Vito 119 CDI Tourer Pro 8 places (2020-2024) — VTC milieu de gamme",
      "Vito 124 CDI Tourer Select Extra-Long (2020+) — VTC premium",
      "Vito Fourgon 114 CDI L2H1 (2015+) — utilitaire premium",
    ],
    concurrentsDirects: [
      "Volkswagen Caravelle / Transporter",
      "Ford Tourneo Custom",
      "Renault Trafic SpaceClass",
      "Peugeot Traveller",
      "Opel Zafira Life",
    ],
    pourquoiRoullepro:
      "Les chauffeurs VTC qui cherchent un Vito d'occasion en France sont nombreux, mais l'offre est dispersée entre concessionnaires Mercedes, leasers et particuliers. RoullePro concentre l'offre Vito professionnelle sur une seule plateforme B2B, avec contrôle histovec et garantie dépôt-vente.",
    searchKeywords: [
      "mercedes vito occasion vtc",
      "vito tourer 8 places occasion",
      "vito taxi occasion",
      "vito professionnel",
      "vito 119 cdi tourer",
    ],
  },
  "peugeot-expert": {
    slug: "peugeot-expert",
    nom: "Peugeot Expert",
    marque: "Peugeot",
    modele: "Expert",
    categoriePrincipale: "utilitaire",
    categorieSlug: "utilitaire",
    intro:
      "Le Peugeot Expert est le fourgon compact 3e génération (issu de la plateforme commune PSA/Toyota/Opel) qui s'impose chez les artisans urbains, les ambulanciers et les livreurs e-commerce grâce à son compromis gabarit/volume/conduite.",
    usagesTypiques: [
      "Fourgon artisan urbain compact (Standard et Long)",
      "Véhicule d'intervention SAV / plombier / électricien",
      "Base ambulance et VSL (Expert Traveller PMR)",
      "Fourgon e-commerce dernier kilomètre",
      "VTC 9 places (version Traveller)",
    ],
    prixOccasionFourchette: "9 000 € à 32 000 €",
    avantages: [
      "Conduite confortable et très routière",
      "Accès aux ZFE en motorisation BlueHDi 120 / 180 récent (Crit'Air 1)",
      "Version électrique e-Expert 75 kWh en occasion",
      "Plateforme partagée = pièces détachées abondantes",
      "Hauteur inférieure à 1,90 m en version Standard (parkings bas)",
    ],
    inconvenients: [
      "Charge utile inférieure aux gros fourgons",
      "Habitacle plus juste que Master/Boxer pour équipage 3 personnes",
      "BVA EAT8 parfois rude à froid sur motorisations BlueHDi",
    ],
    versionsPopulaires: [
      "Expert L2 BlueHDi 120 Premium (2018-2024) — artisan",
      "Expert L3 BlueHDi 180 EAT8 Asphalt (2020-2024) — livraison premium",
      "e-Expert L2 75 kWh (2022+) — ZFE urbain",
      "Expert Cabine Approfondie 6 places BlueHDi 145 (2021+) — équipage chantier",
    ],
    concurrentsDirects: [
      "Citroën Jumpy",
      "Opel Vivaro",
      "Toyota Proace",
      "Renault Trafic",
      "Ford Transit Custom",
    ],
    pourquoiRoullepro:
      "L'Expert occupe la place du fourgon compact idéal en ville. Sur RoullePro, les acheteurs pros peuvent comparer directement entre eux les Expert, Jumpy, Vivaro, Proace et Trafic pour choisir le meilleur rapport qualité/prix — sans naviguer sur 5 sites de petites annonces différents.",
    searchKeywords: [
      "peugeot expert occasion pro",
      "expert BlueHDi 120 occasion",
      "e-expert occasion",
      "expert L3 occasion",
      "expert cabine approfondie",
    ],
  },
  "citroen-jumpy": {
    slug: "citroen-jumpy",
    nom: "Citroën Jumpy",
    marque: "Citroën",
    modele: "Jumpy",
    categoriePrincipale: "utilitaire",
    categorieSlug: "utilitaire",
    intro:
      "Le Citroën Jumpy partage sa plateforme avec le Peugeot Expert et l'Opel Vivaro. C'est le choix des pros qui privilégient un tarif occasion légèrement inférieur à équivalence technique, tout en bénéficiant d'un réseau Citroën Pro très dense.",
    usagesTypiques: [
      "Fourgon artisan urbain (XS / M / XL)",
      "Base aménagée utilitaire électricien / plombier",
      "Fourgon de livraison PME",
      "Traveller 9 places pour transport de personnes",
      "ë-Jumpy électrique pour ZFE",
    ],
    prixOccasionFourchette: "8 500 € à 30 000 €",
    avantages: [
      "Souvent le moins cher du trio PSA à kilométrage équivalent",
      "Réseau Citroën Pro reconnu chez les artisans",
      "Hauteur totale compatible parkings souterrains en version XS",
      "Version électrique ë-Jumpy 75 kWh performante",
      "Finition Club M équipée et bon rapport qualité/prix",
    ],
    inconvenients: [
      "Valeur résiduelle inférieure à Vito ou Transit Custom",
      "Différenciation esthétique faible avec Expert / Vivaro",
      "Selles des sièges qui vieillissent moyennement",
    ],
    versionsPopulaires: [
      "Jumpy M BlueHDi 120 Club (2018-2024) — artisan moyen",
      "Jumpy XL BlueHDi 180 EAT8 Driver (2020-2024) — artisan premium",
      "ë-Jumpy XL 75 kWh (2022+) — livraison ZFE",
      "Jumpy M Cabine Approfondie BlueHDi 145 (2021+) — équipage",
    ],
    concurrentsDirects: [
      "Peugeot Expert",
      "Opel Vivaro",
      "Toyota Proace",
      "Renault Trafic",
    ],
    pourquoiRoullepro:
      "Pour un même véhicule technique que l'Expert ou le Vivaro, le Jumpy se négocie souvent 1 000 à 2 000 € moins cher en occasion. Sur RoullePro, comparez directement les annonces du trio PSA en un seul clic.",
    searchKeywords: [
      "citroen jumpy occasion pro",
      "jumpy BlueHDi occasion",
      "e-jumpy occasion",
      "jumpy XL occasion",
      "jumpy artisan",
    ],
  },
  "fiat-ducato": {
    slug: "fiat-ducato",
    nom: "Fiat Ducato",
    marque: "Fiat",
    modele: "Ducato",
    categoriePrincipale: "utilitaire",
    categorieSlug: "utilitaire",
    intro:
      "Le Fiat Ducato est le fourgon grand volume qui domine le marché européen du camping-car et de la carrosserie spécifique. Il est également très présent chez les artisans BTP et les livreurs grands volumes, avec une gamme L2H1 à L4H3 et une motorisation MultiJet réputée.",
    usagesTypiques: [
      "Fourgon artisan BTP grand volume (L3H2 / L4H3)",
      "Plateforme camping-car professionnel",
      "Fourgon frigorifique et isotherme",
      "Véhicule atelier équipé",
      "Fourgon de livraison déménagement",
    ],
    prixOccasionFourchette: "9 000 € à 42 000 €",
    avantages: [
      "Excellent rapport volume utile / prix",
      "Motorisations MultiJet 2.3 et 3.0 éprouvées",
      "Boîte 9-Speed automatique disponible depuis 2021",
      "Carrosserie largement industrialisée (frigorifique, benne, atelier)",
      "Cote occasion soutenue par la demande camping-car",
    ],
    inconvenients: [
      "Finition intérieure moins soignée que Vito ou Sprinter",
      "Consommation réelle supérieure à l'annoncé sur usage chargé",
      "Fiabilité pompe haute pression à surveiller au-delà de 180 000 km",
    ],
    versionsPopulaires: [
      "Ducato MY2014 2.3 MultiJet 130 L3H2 (2014-2019) — BTP",
      "Ducato MY2021 2.2 MultiJet 140 L3H2 9-Speed (2021-2024) — artisan premium",
      "Ducato Benne L2 MultiJet 160 (2020+) — BTP spécialisé",
      "Ducato Maxi L4H3 MultiJet 180 (2019+) — déménagement / grand volume",
    ],
    concurrentsDirects: [
      "Peugeot Boxer",
      "Citroën Jumper",
      "Renault Master",
      "Ford Transit",
      "Mercedes Sprinter",
    ],
    pourquoiRoullepro:
      "Le marché de l'occasion Ducato professionnel est très actif mais fragmenté. Sur RoullePro, les pros trouvent en un coup d'œil les Ducato L3H2, L4H3, benne, frigorifique, atelier — avec tous les justificatifs d'entretien et le contrôle HistoVec intégré.",
    searchKeywords: [
      "fiat ducato occasion pro",
      "ducato L3H2 occasion",
      "ducato frigorifique occasion",
      "ducato benne occasion",
      "ducato 9-speed occasion",
    ],
  },
  "ford-transit": {
    slug: "ford-transit",
    nom: "Ford Transit",
    marque: "Ford",
    modele: "Transit",
    categoriePrincipale: "utilitaire",
    categorieSlug: "utilitaire",
    intro:
      "Le Ford Transit est le fourgon grand volume historique, réputé pour sa robustesse outre-Manche. Disponible en traction et en propulsion, avec boîte automatique SelectShift et même en version 4x4, il s'adresse aux pros qui cherchent un fourgon polyvalent et endurant.",
    usagesTypiques: [
      "Fourgon artisan BTP grand volume",
      "Fourgon 4x4 chantiers difficiles et montagne",
      "Minibus 17 places (Transit Kombi / Tourneo)",
      "Version plancher cabine pour carrossier",
      "Fourgon frigorifique",
    ],
    prixOccasionFourchette: "9 500 € à 40 000 €",
    avantages: [
      "Robustesse mécanique éprouvée sur parcs intensifs",
      "Version 4x4 AWD disponible (rare sur ce segment)",
      "Boîte automatique SelectShift fiable",
      "Propulsion pour charges lourdes",
      "Tarif occasion souvent plus abordable qu'un Master équivalent",
    ],
    inconvenients: [
      "Réseau SAV Ford moins dense que Renault ou PSA en zone rurale",
      "Pièces détachées parfois plus longues à obtenir",
      "Finition intérieure sobre",
    ],
    versionsPopulaires: [
      "Transit L3H2 TDCi 130 Trend (2015-2019) — BTP",
      "Transit L3H2 EcoBlue 170 Trend (2019-2024) — Crit'Air 1",
      "Transit 4x4 AWD EcoBlue 170 (2019+) — montagne / chantier",
      "Transit Custom L2H1 EcoBlue 130 (segment compact 2.8T)",
    ],
    concurrentsDirects: [
      "Renault Master",
      "Peugeot Boxer",
      "Fiat Ducato",
      "Mercedes Sprinter",
      "Iveco Daily",
    ],
    pourquoiRoullepro:
      "Le Transit a la particularité d'avoir une communauté pro fidèle (BTP, forains, associations) qui cherche spécifiquement ce modèle. Sur RoullePro, votre annonce Transit est immédiatement visible par ces acheteurs ciblés.",
    searchKeywords: [
      "ford transit occasion pro",
      "transit L3H2 occasion",
      "transit 4x4 occasion",
      "transit custom occasion",
      "transit trend occasion",
    ],
  },
  "mercedes-sprinter": {
    slug: "mercedes-sprinter",
    nom: "Mercedes Sprinter",
    marque: "Mercedes-Benz",
    modele: "Sprinter",
    categoriePrincipale: "utilitaire",
    categorieSlug: "utilitaire",
    intro:
      "Le Mercedes Sprinter est la référence premium du grand fourgon utilitaire. Choisi par les pros qui cherchent longévité et image de marque, il équipe les grandes flottes de messagerie express, d'ambulanciers haut de gamme, de transporteurs VIP et de camping-caristes premium.",
    usagesTypiques: [
      "Fourgon express messagerie (Chronopost, DHL, UPS)",
      "Ambulance et véhicule médicalisé haut de gamme",
      "Minibus 17-22 places VIP",
      "Plateforme camping-car premium",
      "Fourgon isotherme et frigorifique longue durée",
    ],
    prixOccasionFourchette: "15 000 € à 60 000 €",
    avantages: [
      "Durée de vie moteur souvent > 500 000 km",
      "Valeur résiduelle la plus élevée du segment",
      "Finition et confort de conduite supérieurs",
      "Boîte 9G-TRONIC disponible dès 2019",
      "Version 4x4 AWD officielle Mercedes",
    ],
    inconvenients: [
      "Coût d'entretien significativement plus élevé",
      "Pièces détachées premium (filtres, embrayage, injecteurs)",
      "Investissement initial plus conséquent",
    ],
    versionsPopulaires: [
      "Sprinter 314 CDI L2H2 (2018-2024) — utilitaire artisan premium",
      "Sprinter 319 CDI L3H2 9G-TRONIC (2019-2024) — messagerie express",
      "Sprinter 4x4 319 CDI (2019+) — montagne / chantier premium",
      "Sprinter Tourer 519 CDI 22 places (2020+) — transport VIP",
    ],
    concurrentsDirects: [
      "Iveco Daily",
      "Volkswagen Crafter",
      "Renault Master",
      "Fiat Ducato (Premium)",
    ],
    pourquoiRoullepro:
      "Les Sprinter d'occasion de flottes de messagerie sont particulièrement recherchés par les pros qui veulent un véhicule fiable sans payer le neuf. RoullePro concentre ces annonces flotte et permet aux acheteurs pros d'accéder directement aux cessions de grands groupes.",
    searchKeywords: [
      "mercedes sprinter occasion pro",
      "sprinter L3H2 occasion",
      "sprinter 4x4 occasion",
      "sprinter ambulance occasion",
      "sprinter 9G-tronic occasion",
    ],
  },
  "renault-kangoo": {
    slug: "renault-kangoo",
    nom: "Renault Kangoo",
    marque: "Renault",
    modele: "Kangoo",
    categoriePrincipale: "utilitaire",
    categorieSlug: "utilitaire",
    intro:
      "La Renault Kangoo est la fourgonnette utilitaire la plus vendue de France. Compacte, fiable, économique, et désormais disponible en version 100 % électrique E-Tech, elle équipe les artisans urbains, les services de maintenance et les livreurs du dernier kilomètre dans toutes les ZFE françaises.",
    usagesTypiques: [
      "Fourgonnette artisan urbain (plombier, électricien, peintre)",
      "Véhicule de service SAV / maintenance",
      "Livraison e-commerce dernier kilomètre",
      "Fourgonnette ZFE électrique E-Tech",
      "Version Maxi 2 places avec cloison longue caisse",
    ],
    prixOccasionFourchette: "6 000 € à 28 000 €",
    avantages: [
      "Coût total d'usage (TCO) très bas",
      "Version E-Tech 100 % électrique avec autonomie 285 km WLTP",
      "Accès ZFE Crit'Air 1 garanti sur modèles récents",
      "Fiabilité mécanique éprouvée",
      "Volume utile supérieur à la moyenne des fourgonnettes",
    ],
    inconvenients: [
      "Charge utile limitée (environ 600-800 kg)",
      "Insonorisation moyenne sur générations antérieures à 2021",
      "Habitacle étroit pour équipage 3 personnes",
    ],
    versionsPopulaires: [
      "Kangoo Van 1.5 dCi 95 Grand Confort (2015-2021) — artisan",
      "Kangoo Van 3 Blue dCi 115 Extra (2021-2024) — artisan Crit'Air 1",
      "Kangoo E-Tech Electric 45 kWh (2022+) — livraison ZFE",
      "Kangoo Maxi Van 1.5 dCi 95 (2015-2021) — grand volume fourgonnette",
    ],
    concurrentsDirects: [
      "Citroën Berlingo",
      "Peugeot Partner",
      "Opel Combo",
      "Volkswagen Caddy",
      "Ford Transit Connect",
    ],
    pourquoiRoullepro:
      "Le marché des Kangoo d'occasion pro est immense (plus de 40 000 unités sur le marché français). Sur RoullePro, votre Kangoo ne se noie pas parmi les annonces particulier : vous êtes visible auprès d'acheteurs pros qui cherchent un véhicule utilitaire commercial avec facture et TVA récupérable.",
    searchKeywords: [
      "renault kangoo occasion pro",
      "kangoo E-Tech occasion",
      "kangoo maxi occasion",
      "kangoo fourgonnette occasion",
      "kangoo van occasion",
    ],
  },
  "citroen-berlingo": {
    slug: "citroen-berlingo",
    nom: "Citroën Berlingo",
    marque: "Citroën",
    modele: "Berlingo",
    categoriePrincipale: "utilitaire",
    categorieSlug: "utilitaire",
    intro:
      "Le Citroën Berlingo, décliné également en Peugeot Partner et Opel Combo, est la fourgonnette compacte de référence pour les artisans urbains français. La génération actuelle (K9) propose même une version 100 % électrique ë-Berlingo adaptée aux ZFE.",
    usagesTypiques: [
      "Fourgonnette artisan urbain",
      "Véhicule SAV maintenance électroménager / télécom",
      "Fourgonnette e-commerce dernier kilomètre",
      "Version ë-Berlingo électrique ZFE",
      "Version Multispace pour usage mixte (plombier + famille)",
    ],
    prixOccasionFourchette: "6 500 € à 27 000 €",
    avantages: [
      "Tarif d'occasion souvent inférieur au Kangoo équivalent",
      "Version ë-Berlingo 50 kWh pour ZFE",
      "Charge utile jusqu'à 1 000 kg en version XL",
      "Pièces détachées communes avec Partner et Combo",
      "Confort de conduite supérieur au Kangoo",
    ],
    inconvenients: [
      "Fiabilité moteur BlueHDi 75 sur anciennes versions à vérifier",
      "Valeur résiduelle un peu inférieure à Kangoo",
      "Finition intérieure moyenne sur bas de gamme",
    ],
    versionsPopulaires: [
      "Berlingo Van M BlueHDi 100 Club (2018-2024) — artisan",
      "Berlingo Van XL BlueHDi 130 Driver (2020-2024) — livraison grand volume",
      "ë-Berlingo Van M 50 kWh (2022+) — ZFE",
      "Berlingo Van M BlueHDi 75 (2018-2021) — flotte entry level",
    ],
    concurrentsDirects: [
      "Peugeot Partner",
      "Opel Combo",
      "Renault Kangoo",
      "Volkswagen Caddy",
      "Ford Transit Connect",
    ],
    pourquoiRoullepro:
      "Le Berlingo partage 95 % de sa mécanique avec le Partner et le Combo. Sur RoullePro, comparez les trois d'un coup pour identifier la meilleure affaire du trio PSA.",
    searchKeywords: [
      "citroen berlingo occasion pro",
      "e-berlingo occasion",
      "berlingo van occasion",
      "berlingo XL occasion",
      "berlingo fourgonnette pro",
    ],
  },
  "peugeot-boxer": {
    slug: "peugeot-boxer",
    nom: "Peugeot Boxer",
    marque: "Peugeot",
    modele: "Boxer",
    categoriePrincipale: "utilitaire",
    categorieSlug: "utilitaire",
    intro:
      "Le Peugeot Boxer est le frère technique du Citroën Jumper et du Fiat Ducato. Grand fourgon incontournable dans le BTP français, il combine un excellent rapport volume utile / prix avec un réseau Peugeot Pro dense.",
    usagesTypiques: [
      "Fourgon artisan BTP grand volume L3H2 / L4H3",
      "Plateforme benne / atelier pour carrossier",
      "Fourgon frigorifique professionnel",
      "Véhicule de déménagement",
      "Minibus 17 places",
    ],
    prixOccasionFourchette: "9 000 € à 38 000 €",
    avantages: [
      "Volume utile équivalent Master / Ducato, parfois moins cher",
      "Réseau Peugeot Pro très maillé sur territoire français",
      "Motorisations BlueHDi 120 / 140 / 165 polyvalentes",
      "Disponibilité carrosseries spéciales (benne, frigo, atelier)",
      "Version e-Boxer électrique disponible en occasion récente",
    ],
    inconvenients: [
      "Finition intérieure modeste sur versions Access / Premium",
      "Consommation réelle supérieure à l'annoncé en charge",
      "Fiabilité injection BlueHDi 165 à surveiller",
    ],
    versionsPopulaires: [
      "Boxer L3H2 BlueHDi 140 Premium (2018-2024) — artisan",
      "Boxer Benne BlueHDi 160 (2020+) — BTP",
      "Boxer Frigo L2H1 BlueHDi 120 (2019+) — livraison froid",
      "e-Boxer 75 kWh L3H2 (2022+) — ZFE",
    ],
    concurrentsDirects: [
      "Citroën Jumper",
      "Fiat Ducato",
      "Renault Master",
      "Ford Transit",
    ],
    pourquoiRoullepro:
      "Le Boxer est souvent le meilleur compromis qualité-prix du segment. Sur RoullePro, vous accédez directement aux cessions de flottes pros et aux artisans qui renouvellent leur véhicule.",
    searchKeywords: [
      "peugeot boxer occasion pro",
      "boxer L3H2 occasion",
      "boxer benne occasion",
      "boxer frigorifique occasion",
      "e-boxer occasion",
    ],
  },
  "iveco-daily": {
    slug: "iveco-daily",
    nom: "Iveco Daily",
    marque: "Iveco",
    modele: "Daily",
    categoriePrincipale: "utilitaire",
    categorieSlug: "utilitaire",
    intro:
      "L'Iveco Daily est le fourgon professionnel hors-catégorie, capable d'atteindre 7,2 tonnes de PTAC. Incontournable chez les pros qui ont besoin d'une grosse charge utile (BTP lourd, matériel de chantier, transport de conteneur, travaux publics).",
    usagesTypiques: [
      "Fourgon BTP lourd jusqu'à 7,2T PTAC",
      "Plateforme benne et grue",
      "Transport de conteneur et caisse mobile",
      "Fourgon blindé transport de fonds",
      "Châssis cabine pour carrossier spécialisé",
    ],
    prixOccasionFourchette: "12 000 € à 55 000 €",
    avantages: [
      "Seul du segment à proposer jusqu'à 7,2T PTAC",
      "Propulsion avec double essieu arrière disponible",
      "Moteur F1C 3.0L très robuste",
      "Châssis séparé idéal pour carrosserie lourde",
      "Boîte automatique HI-MATIC 8 rapports fluide",
    ],
    inconvenients: [
      "Réseau SAV Iveco moins dense que généralistes",
      "Consommation élevée en usage peu chargé",
      "Confort de conduite inférieur aux concurrents premium",
      "Permis C requis au-delà de 3,5T",
    ],
    versionsPopulaires: [
      "Daily 35S14 L3H2 (2015-2019) — fourgon pro standard",
      "Daily 35C18 HI-MATIC Blue Power (2020-2024) — artisan premium",
      "Daily 70C18 châssis cabine (2018+) — BTP lourd",
      "Daily 4x4 35S17W (2019+) — chantier difficile",
    ],
    concurrentsDirects: [
      "Mercedes Sprinter (haut de gamme)",
      "Fiat Ducato Maxi",
      "Renault Master double essieu",
      "Ford Transit L4H3",
    ],
    pourquoiRoullepro:
      "Le Daily est un véhicule très spécifique. Sur RoullePro, vous êtes visible auprès des pros qui cherchent exactement ce gabarit — sans perdre votre annonce au milieu de fourgons 3,5T génériques.",
    searchKeywords: [
      "iveco daily occasion pro",
      "daily 7T2 occasion",
      "daily benne occasion",
      "daily hi-matic occasion",
      "daily chassis cabine occasion",
    ],
  },
};

const MODELES_SLUGS = Object.keys(MODELES);

export function generateStaticParams() {
  return MODELES_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = MODELES[params.slug];
  if (!data) return {};
  const title = `${data.nom} d'occasion professionnel — Annonces RoullePro`;
  const description = `Achetez ou vendez votre ${data.nom} d'occasion entre professionnels. Prix constatés ${data.prixOccasionFourchette}. Marketplace B2B avec contrôle HistoVec, paiement sécurisé Stripe, dépôt-vente 88% reversé.`;
  return {
    title,
    description,
    alternates: { canonical: `${APP_URL}/annonces/modele/${data.slug}` },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/annonces/modele/${data.slug}`,
      siteName: "RoullePro",
      locale: "fr_FR",
      type: "website",
    },
  };
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getAnnoncesForModele(marque: string, modele: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("annonces")
    .select("*, categories(id, name, slug)")
    .eq("status", "active")
    .or(`marque.ilike.%${marque}%,modele.ilike.%${modele}%`)
    .order("created_at", { ascending: false })
    .limit(12);
  return data || [];
}

export default async function ModelePage({
  params,
}: {
  params: { slug: string };
}) {
  const data = MODELES[params.slug];
  if (!data) notFound();

  const annonces = await getAnnoncesForModele(data.marque, data.modele);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${data.nom} d'occasion professionnel`,
    description: data.intro,
    brand: { "@type": "Brand", name: data.marque },
    model: data.modele,
    category: "Véhicule professionnel d'occasion",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: data.prixOccasionFourchette.split(" à ")[0].replace(/[^\d]/g, ""),
      highPrice: data.prixOccasionFourchette.split(" à ")[1]?.replace(/[^\d]/g, "") || "50000",
      offerCount: String(annonces.length),
      availability: "https://schema.org/InStock",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "Annonces", item: `${APP_URL}/annonces` },
      {
        "@type": "ListItem",
        position: 3,
        name: data.nom,
        item: `${APP_URL}/annonces/modele/${data.slug}`,
      },
    ],
  };

  const autresModeles = MODELES_SLUGS.filter((s) => s !== data.slug)
    .map((s) => MODELES[s])
    .slice(0, 6);

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* HERO */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              {data.marque} · Occasion professionnel
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              {data.nom} d'occasion <br className="hidden sm:block" />
              entre professionnels
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {data.intro}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/annonces/categorie/${data.categorieSlug}`}
                className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-xl transition text-base"
              >
                Voir toutes les annonces {data.nom}
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/deposer-annonce"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition text-base backdrop-blur-sm"
              >
                Vendre mon {data.nom}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Annonces actives */}
      {annonces.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">
            {annonces.length} {data.nom} actuellement disponible{annonces.length > 1 ? "s" : ""}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {annonces.map((a: any) => (
              <AnnonceCard key={a.id} annonce={a} />
            ))}
          </div>
        </section>
      )}

      {/* Fiche modèle */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
              Usages professionnels du {data.nom}
            </h2>
            <ul className="space-y-3 mb-8">
              {data.usagesTypiques.map((u) => (
                <li key={u} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{u}</span>
                </li>
              ))}
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp size={20} className="text-blue-600" />
                <h3 className="font-bold text-slate-900">Prix occasion pro constatés</h3>
              </div>
              <p className="text-2xl font-extrabold text-blue-700">
                {data.prixOccasionFourchette}
              </p>
              <p className="text-sm text-slate-600 mt-2">
                Fourchette observée sur le marché français selon année, kilométrage, motorisation et options.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Versions populaires</h2>
            <ul className="space-y-3 mb-8">
              {data.versionsPopulaires.map((v) => (
                <li key={v} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="text-slate-700 font-medium">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Avantages / Inconvénients */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Points forts</h2>
            <ul className="space-y-3">
              {data.avantages.map((a) => (
                <li key={a} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Points d'attention</h2>
            <ul className="space-y-3">
              {data.inconvenients.map((i) => (
                <li key={i} className="flex items-start gap-3">
                  <Info size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{i}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Concurrents */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-200">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
          Alternatives au {data.nom}
        </h2>
        <div className="flex flex-wrap gap-3">
          {data.concurrentsDirects.map((c) => (
            <span
              key={c}
              className="bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* Pourquoi RoullePro */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6">
            Pourquoi vendre votre {data.nom} sur RoullePro
          </h2>
          <p className="text-slate-700 text-lg leading-relaxed max-w-3xl mb-8">
            {data.pourquoiRoullepro}
          </p>
          <Link
            href="/deposer-annonce"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition"
          >
            Déposer mon annonce {data.nom}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Autres modèles */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-200">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-8">
          Autres modèles populaires
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {autresModeles.map((m) => (
            <Link
              key={m.slug}
              href={`/annonces/modele/${m.slug}`}
              className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl p-5 transition"
            >
              <div className="text-xs text-slate-500 mb-1">{m.marque}</div>
              <div className="font-bold text-slate-900 mb-2">{m.nom}</div>
              <div className="text-sm text-blue-600">
                Voir les annonces →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
