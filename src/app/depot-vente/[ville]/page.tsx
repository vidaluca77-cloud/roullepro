import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Shield,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-static";
export const revalidate = 86400;

type VilleData = {
  slug: string;
  nom: string;
  cp: string;
  region: string;
  departement: string;
  departementNum: string;
  intro: string;
  marche: string;
  villesDesservies: string[];
  typesVehiculesLocaux: string[];
  delaiVenteMoyen: string;
  exempleVehicule: { modele: string; prix: string; delai: string };
};

const VILLES: Record<string, VilleData> = {
  caen: {
    slug: "caen",
    nom: "Caen",
    cp: "14000",
    region: "Normandie",
    departement: "Calvados",
    departementNum: "14",
    intro:
      "Caen, préfecture du Calvados, est un pôle logistique majeur de Normandie avec une forte densité de professionnels du transport, de l'artisanat et des services. Le marché de l'utilitaire d'occasion y est très actif, porté par les besoins des artisans du bâtiment, des transporteurs régionaux et des professionnels de la santé.",
    marche:
      "Le bassin caennais concentre plusieurs milliers d'entreprises utilisatrices d'utilitaires : entreprises du BTP en pleine dynamique avec les grands projets de rénovation urbaine, flottes d'ambulances et VSL pour le CHU de Caen, entreprises de livraison du dernier kilomètre autour du port de Ouistreham. La demande en fourgons d'occasion reste supérieure à l'offre, ce qui tire les prix à la hausse.",
    villesDesservies: [
      "Caen (14000)",
      "Hérouville-Saint-Clair (14200)",
      "Mondeville (14120)",
      "Ifs (14123)",
      "Fleury-sur-Orne (14123)",
      "Bretteville-sur-Odon (14760)",
      "Louvigny (14111)",
      "Saint-Contest (14280)",
      "Carpiquet (14650)",
      "Colombelles (14460)",
    ],
    typesVehiculesLocaux: [
      "Fourgons d'artisans (Renault Master, Peugeot Boxer, Fiat Ducato)",
      "VSL et ambulances (Fiat Scudo, Peugeot Expert, Volkswagen Transporter)",
      "Utilitaires VTC (Mercedes Vito, Volkswagen Caddy)",
      "Pick-up BTP (Ford Ranger, Toyota Hilux)",
      "Fourgonnettes de livraison (Renault Kangoo, Citroën Berlingo)",
    ],
    delaiVenteMoyen: "32 jours",
    exempleVehicule: {
      modele: "Renault Master L2H2 2022 — 68 000 km",
      prix: "22 400 €",
      delai: "28 jours",
    },
  },
  chelles: {
    slug: "chelles",
    nom: "Chelles",
    cp: "77500",
    region: "Île-de-France",
    departement: "Seine-et-Marne",
    departementNum: "77",
    intro:
      "Chelles, troisième commune de Seine-et-Marne, se situe au cœur de l'est parisien, à la frontière du Val-de-Marne et de la Seine-Saint-Denis. Son positionnement stratégique en fait un hub logistique pour les professionnels opérant sur Paris, l'aéroport de Roissy-CDG et la grande couronne est.",
    marche:
      "Le bassin chellois et son aire urbaine comptent plusieurs centaines d'entreprises de transport, de VTC, de livraison e-commerce et d'artisans du BTP. La proximité avec les zones d'activité de Noisy-le-Grand, Villeparisis et Marne-la-Vallée crée une demande constante en utilitaires professionnels, avec un taux de rotation élevé des véhicules.",
    villesDesservies: [
      "Chelles (77500)",
      "Brou-sur-Chantereine (77177)",
      "Courtry (77181)",
      "Vaires-sur-Marne (77360)",
      "Noisiel (77186)",
      "Champs-sur-Marne (77420)",
      "Gagny (93220)",
      "Montfermeil (93370)",
      "Neuilly-sur-Marne (93330)",
      "Noisy-le-Grand (93160)",
    ],
    typesVehiculesLocaux: [
      "Utilitaires VTC haut de gamme (Mercedes Vito, Volkswagen Caravelle)",
      "Fourgonnettes de livraison e-commerce (Renault Kangoo, Peugeot Partner)",
      "Fourgons d'artisans BTP (Master, Boxer, Sprinter)",
      "Taxis parisiens (Toyota Prius, Peugeot 508, Mercedes Classe E)",
      "Véhicules de flotte reconditionnés",
    ],
    delaiVenteMoyen: "26 jours",
    exempleVehicule: {
      modele: "Mercedes Vito Tourer 2021 — 94 000 km",
      prix: "28 900 €",
      delai: "22 jours",
    },
  },
  marseille: {
    slug: "marseille",
    nom: "Marseille",
    cp: "13010",
    region: "Provence-Alpes-Côte d'Azur",
    departement: "Bouches-du-Rhône",
    departementNum: "13",
    intro:
      "Marseille, deuxième ville de France, abrite le premier port maritime français et un tissu économique professionnel extrêmement dense. Le marché de l'utilitaire d'occasion y est l'un des plus dynamiques du sud de la France, porté par les besoins logistiques du port, les flottes de taxis et VTC, et les artisans du BTP en plein essor avec les projets Euroméditerranée.",
    marche:
      "Le bassin marseillais concentre plusieurs dizaines de milliers d'entreprises utilisatrices d'utilitaires. La densité des chantiers du BTP, l'activité portuaire, les flottes de VTC et de taxis de l'aéroport Marseille-Provence, ainsi que les ambulances et VSL de l'AP-HM, génèrent un flux constant de véhicules professionnels à vendre et à acheter. Les prix sont tirés vers le haut par une demande locale soutenue.",
    villesDesservies: [
      "Marseille — 16 arrondissements (13001 à 13016)",
      "Aubagne (13400)",
      "Aix-en-Provence (13090)",
      "Vitrolles (13127)",
      "Marignane (13700)",
      "Martigues (13500)",
      "Istres (13800)",
      "Plan-de-Cuques (13380)",
      "Allauch (13190)",
      "La Ciotat (13600)",
    ],
    typesVehiculesLocaux: [
      "Taxis marseillais (Peugeot 508, Toyota Prius+, Mercedes Classe E)",
      "VTC aéroport Marignane (Mercedes Classe V, Vito, BMW Serie 2 Gran Tourer)",
      "Fourgons BTP grands chantiers (Sprinter, Master, Ducato)",
      "Ambulances et VSL AP-HM (Volkswagen Transporter, Renault Trafic)",
      "Utilitaires portuaires et logistique Fos (camions 3,5T, hayons)",
    ],
    delaiVenteMoyen: "29 jours",
    exempleVehicule: {
      modele: "Peugeot Boxer L3H2 2023 — 45 000 km",
      prix: "26 500 €",
      delai: "24 jours",
    },
  },
  paris: {
    slug: "paris",
    nom: "Paris",
    cp: "75000",
    region: "Île-de-France",
    departement: "Paris",
    departementNum: "75",
    intro:
      "Paris concentre le plus gros marché de véhicules professionnels de France. Taxis, VTC, artisans livreurs, ambulances et flottes utilitaires s'y renouvellent en permanence, avec un impératif fort de conformité ZFE Crit'Air.",
    marche:
      "Près de 20 000 licences de taxi, plus de 30 000 VTC actifs, des milliers d'ambulanciers privés et une des plus grosses concentrations d'artisans BTP d'Europe. Les utilitaires d'occasion Crit'Air 1 et 2 s'arrachent, et la ZFE pousse les pros à renouveler régulièrement leur flotte. RoullePro offre un canal direct entre vendeurs et acheteurs pros sans marge de revendeur.",
    villesDesservies: [
      "Paris 20 arrondissements (75001 à 75020)",
      "Boulogne-Billancourt (92100)",
      "Levallois-Perret (92300)",
      "Clichy (92110)",
      "Issy-les-Moulineaux (92130)",
      "Saint-Denis (93200)",
      "Pantin (93500)",
      "Montreuil (93100)",
      "Vincennes (94300)",
      "Ivry-sur-Seine (94200)",
    ],
    typesVehiculesLocaux: [
      "Taxis parisiens G7 et indépendants (Toyota Prius, Tesla Model 3, Peugeot 508, Mercedes Classe E)",
      "VTC haut de gamme (Mercedes Classe V, BMW Série 7, Audi A6)",
      "Utilitaires ZFE Crit'Air 1 et 2 (Renault Kangoo E-Tech, Peugeot e-Expert, Citroën ë-Jumpy)",
      "Fourgons d'artisans (Master, Boxer, Ducato, Transit, Sprinter)",
      "Ambulances et VSL AP-HP (Renault Trafic, Peugeot Traveller)",
    ],
    delaiVenteMoyen: "21 jours",
    exempleVehicule: {
      modele: "Mercedes Vito Tourer 2022 — 72 000 km",
      prix: "31 200 €",
      delai: "18 jours",
    },
  },
  lyon: {
    slug: "lyon",
    nom: "Lyon",
    cp: "69000",
    region: "Auvergne-Rhône-Alpes",
    departement: "Rhône",
    departementNum: "69",
    intro:
      "Deuxième métropole économique de France, Lyon est un carrefour logistique majeur entre Paris, la Suisse et la Méditerranée. Le marché utilitaire y est très actif, tiré par les chantiers Part-Dieu, la chimie de la Vallée du Rhône et la logistique e-commerce autour de Saint-Priest.",
    marche:
      "La métropole lyonnaise compte des milliers d'artisans BTP, de livreurs e-commerce, d'ambulanciers et de VTC. La ZFE lyonnaise accélère le renouvellement des fourgons d'occasion vers des modèles récents. Les taxis lyonnais et VTC de l'aéroport Saint-Exupéry représentent un flux constant de véhicules à vendre.",
    villesDesservies: [
      "Lyon 9 arrondissements (69001 à 69009)",
      "Villeurbanne (69100)",
      "Vénissieux (69200)",
      "Saint-Priest (69800)",
      "Bron (69500)",
      "Vaulx-en-Velin (69120)",
      "Caluire-et-Cuire (69300)",
      "Oullins (69600)",
      "Décines-Charpieu (69150)",
      "Meyzieu (69330)",
    ],
    typesVehiculesLocaux: [
      "Fourgons BTP grands projets métropolitains (Master, Ducato, Boxer)",
      "Utilitaires e-commerce et livraison dernier km (Kangoo, Partner, Berlingo)",
      "VTC aéroport Saint-Exupéry (Mercedes Classe V, Vito, Tesla Model 3)",
      "Taxis lyonnais (Peugeot 508, Toyota Prius+)",
      "Ambulances et VSL Hospices Civils de Lyon (Trafic, Expert, Scudo)",
    ],
    delaiVenteMoyen: "25 jours",
    exempleVehicule: {
      modele: "Renault Trafic L2H1 2022 — 58 000 km",
      prix: "21 900 €",
      delai: "23 jours",
    },
  },
  toulouse: {
    slug: "toulouse",
    nom: "Toulouse",
    cp: "31000",
    region: "Occitanie",
    departement: "Haute-Garonne",
    departementNum: "31",
    intro:
      "Toulouse, capitale aéronautique et quatrième ville de France, voit son marché utilitaire soutenu par Airbus et sa chaîne de sous-traitants, les chantiers du Grand Matabiau et un tissu d'artisans très dense.",
    marche:
      "La métropole toulousaine compte plus de 15 000 artisans du BTP et des services utilisant des fourgons au quotidien. Les flottes utilitaires des sous-traitants aéronautiques se renouvellent régulièrement. L'activité VTC/taxi autour de l'aéroport Blagnac et les ambulanciers privés de l'agglomération génèrent un flux d'annonces professionnelles.",
    villesDesservies: [
      "Toulouse (31000, 31100, 31200, 31300, 31400, 31500)",
      "Blagnac (31700)",
      "Colomiers (31770)",
      "Tournefeuille (31170)",
      "Balma (31130)",
      "Ramonville-Saint-Agne (31520)",
      "Saint-Orens-de-Gameville (31650)",
      "Cugnaux (31270)",
      "Muret (31600)",
      "L'Union (31240)",
    ],
    typesVehiculesLocaux: [
      "Fourgons sous-traitants aéronautiques (Master, Ducato, Sprinter)",
      "Utilitaires BTP grand chantier (Boxer, Transit, Jumper)",
      "VTC Blagnac aéroport (Mercedes Vito, Classe V, Tesla Model 3)",
      "Taxis toulousains (Peugeot 508, Toyota Prius)",
      "Fourgonnettes de livraison (Kangoo, Partner, Berlingo)",
    ],
    delaiVenteMoyen: "27 jours",
    exempleVehicule: {
      modele: "Citroën Jumper L3H2 2021 — 89 000 km",
      prix: "19 400 €",
      delai: "26 jours",
    },
  },
  bordeaux: {
    slug: "bordeaux",
    nom: "Bordeaux",
    cp: "33000",
    region: "Nouvelle-Aquitaine",
    departement: "Gironde",
    departementNum: "33",
    intro:
      "Bordeaux connaît une croissance démographique parmi les plus fortes de France, avec des chantiers majeurs (Euratlantique, Bassins à Flot) et un dynamisme logistique porté par le port et les vignobles.",
    marche:
      "Plus de 10 000 artisans du BTP exercent sur la métropole bordelaise, avec une demande constante de fourgons d'occasion. L'activité viticole et les flottes logistiques des négociants en vin sur le Médoc et le Libournais ajoutent une demande utilitaire atypique. Les VTC et taxis Bordeaux-Mérignac connaissent une activité soutenue.",
    villesDesservies: [
      "Bordeaux (33000, 33100, 33200, 33300, 33800)",
      "Mérignac (33700)",
      "Pessac (33600)",
      "Talence (33400)",
      "Bègles (33130)",
      "Cenon (33150)",
      "Floirac (33270)",
      "Villenave-d'Ornon (33140)",
      "Le Bouscat (33110)",
      "Bruges (33520)",
    ],
    typesVehiculesLocaux: [
      "Fourgons BTP chantiers métropolitains (Master, Boxer, Ducato)",
      "Utilitaires viticoles et négoce (Transit, Sprinter, Daily)",
      "VTC aéroport Mérignac (Mercedes Classe V, Vito)",
      "Taxis bordelais (Peugeot 508, Toyota Prius+)",
      "Fourgonnettes de livraison (Kangoo, Partner, Berlingo)",
    ],
    delaiVenteMoyen: "28 jours",
    exempleVehicule: {
      modele: "Ford Transit L3H2 2022 — 63 000 km",
      prix: "23 800 €",
      delai: "25 jours",
    },
  },
  lille: {
    slug: "lille",
    nom: "Lille",
    cp: "59000",
    region: "Hauts-de-France",
    departement: "Nord",
    departementNum: "59",
    intro:
      "Lille, capitale des Hauts-de-France et carrefour européen entre Paris, Bruxelles et Londres, concentre un marché utilitaire massif porté par la logistique transfrontalière et les grandes zones industrielles.",
    marche:
      "La métropole lilloise compte plusieurs dizaines de milliers d'utilisateurs professionnels d'utilitaires, notamment autour des plateformes logistiques Roubaix-Tourcoing et du port de Dunkerque. La proximité belge crée un flux particulier d'utilitaires entre les deux marchés. Taxis, VTC Lesquin aéroport et ambulances CHU-Lille sont très actifs.",
    villesDesservies: [
      "Lille (59000, 59160, 59260, 59777, 59800)",
      "Roubaix (59100)",
      "Tourcoing (59200)",
      "Villeneuve-d'Ascq (59650)",
      "Wattrelos (59150)",
      "Marcq-en-Barœul (59700)",
      "Mons-en-Barœul (59370)",
      "La Madeleine (59110)",
      "Lambersart (59130)",
      "Lomme (59160)",
    ],
    typesVehiculesLocaux: [
      "Utilitaires logistique transfrontalière (Sprinter, Ducato, Master)",
      "Fourgons plateformes e-commerce Roubaix (Kangoo, Partner, Berlingo)",
      "VTC Lesquin aéroport (Mercedes Vito, Classe V)",
      "Taxis lillois (Peugeot 508, Toyota Prius)",
      "Ambulances et VSL CHU-Lille (Renault Trafic, Peugeot Expert)",
    ],
    delaiVenteMoyen: "24 jours",
    exempleVehicule: {
      modele: "Renault Master L3H2 2021 — 91 000 km",
      prix: "20 600 €",
      delai: "22 jours",
    },
  },
  nantes: {
    slug: "nantes",
    nom: "Nantes",
    cp: "44000",
    region: "Pays de la Loire",
    departement: "Loire-Atlantique",
    departementNum: "44",
    intro:
      "Nantes, sixième ville de France, allie dynamisme industriel, activité portuaire (Nantes-Saint-Nazaire) et un écosystème d'artisans BTP en pleine expansion avec les chantiers de l'île de Nantes.",
    marche:
      "Le bassin nantais et son aire urbaine comptent plus de 12 000 artisans et professionnels utilisant un utilitaire. Les chantiers navals de Saint-Nazaire, l'activité aéronautique Airbus et la proximité du port créent une demande constante en fourgons et camionnettes d'occasion.",
    villesDesservies: [
      "Nantes (44000, 44100, 44200, 44300)",
      "Saint-Herblain (44800)",
      "Rezé (44400)",
      "Saint-Nazaire (44600)",
      "Orvault (44700)",
      "Vertou (44120)",
      "Bouguenais (44340)",
      "Carquefou (44470)",
      "La Chapelle-sur-Erdre (44240)",
      "Couëron (44220)",
    ],
    typesVehiculesLocaux: [
      "Fourgons artisans BTP (Master, Boxer, Ducato, Transit)",
      "Utilitaires chantiers navals STX (Sprinter, Daily, Jumper)",
      "VTC aéroport Nantes-Atlantique (Mercedes Vito, Classe V)",
      "Taxis nantais et Saint-Nazaire (Peugeot 508, Toyota Prius+)",
      "Fourgonnettes de livraison périurbaines (Kangoo, Partner)",
    ],
    delaiVenteMoyen: "27 jours",
    exempleVehicule: {
      modele: "Peugeot Expert L2H1 2022 — 51 000 km",
      prix: "18 900 €",
      delai: "24 jours",
    },
  },
  rennes: {
    slug: "rennes",
    nom: "Rennes",
    cp: "35000",
    region: "Bretagne",
    departement: "Ille-et-Vilaine",
    departementNum: "35",
    intro:
      "Rennes, capitale bretonne, est un pôle technologique et logistique majeur, avec un tissu d'artisans BTP dense et une forte activité d'ambulanciers privés en lien avec le CHU de Rennes.",
    marche:
      "La métropole rennaise concentre plusieurs milliers d'artisans, des flottes logistiques autour de la zone de Cesson-Sévigné et des ambulanciers privés actifs. Les utilitaires d'occasion se vendent rapidement sur Rennes grâce à une demande supérieure à l'offre locale.",
    villesDesservies: [
      "Rennes (35000, 35200, 35700)",
      "Saint-Jacques-de-la-Lande (35136)",
      "Cesson-Sévigné (35510)",
      "Chantepie (35135)",
      "Bruz (35170)",
      "Pacé (35740)",
      "Betton (35830)",
      "Chartres-de-Bretagne (35131)",
      "Vezin-le-Coquet (35132)",
      "Le Rheu (35650)",
    ],
    typesVehiculesLocaux: [
      "Fourgons artisans BTP (Master, Ducato, Boxer)",
      "Utilitaires logistique Cesson tech parc (Trafic, Expert, Jumpy)",
      "Ambulances et VSL CHU-Rennes (Renault Trafic, Peugeot Traveller)",
      "VTC aéroport Rennes-Saint-Jacques (Mercedes Vito)",
      "Fourgonnettes de livraison (Kangoo, Partner, Berlingo)",
    ],
    delaiVenteMoyen: "29 jours",
    exempleVehicule: {
      modele: "Renault Trafic Cabine Approfondie 2022 — 67 000 km",
      prix: "22 300 €",
      delai: "27 jours",
    },
  },
  strasbourg: {
    slug: "strasbourg",
    nom: "Strasbourg",
    cp: "67000",
    region: "Grand Est",
    departement: "Bas-Rhin",
    departementNum: "67",
    intro:
      "Strasbourg, eurométropole frontalière de l'Allemagne, combine un marché utilitaire franco-allemand unique et une densité d'artisans très élevée. Les utilitaires Crit'Air 1 et 2 y sont particulièrement recherchés.",
    marche:
      "L'eurométropole strasbourgeoise profite d'échanges transfrontaliers intensifs avec Kehl et l'Ortenau. Les flottes utilitaires franco-allemandes s'y échangent activement, et la ZFE de Strasbourg pousse au renouvellement rapide des véhicules diesel anciens vers des modèles récents ou électriques.",
    villesDesservies: [
      "Strasbourg (67000, 67100, 67200)",
      "Schiltigheim (67300)",
      "Bischheim (67800)",
      "Illkirch-Graffenstaden (67400)",
      "Hoenheim (67800)",
      "Ostwald (67540)",
      "Lingolsheim (67380)",
      "Eckbolsheim (67201)",
      "Geispolsheim (67118)",
      "Vendenheim (67550)",
    ],
    typesVehiculesLocaux: [
      "Utilitaires franco-allemands ZFE (Kangoo E-Tech, Vito, Sprinter)",
      "Fourgons artisans BTP (Master, Boxer, Ducato, Transit)",
      "Taxis strasbourgeois (Peugeot 508, Toyota Prius)",
      "VTC aéroport Entzheim (Mercedes Vito, Classe V)",
      "Ambulances et VSL CHU-Strasbourg (Renault Trafic)",
    ],
    delaiVenteMoyen: "26 jours",
    exempleVehicule: {
      modele: "Mercedes Sprinter L3H2 2022 — 74 000 km",
      prix: "29 500 €",
      delai: "24 jours",
    },
  },
  montpellier: {
    slug: "montpellier",
    nom: "Montpellier",
    cp: "34000",
    region: "Occitanie",
    departement: "Hérault",
    departementNum: "34",
    intro:
      "Montpellier, ville la plus dynamique du sud de la France démographiquement, voit son marché utilitaire porté par les chantiers métropolitains et la viticulture du Languedoc.",
    marche:
      "Plus de 8 000 artisans BTP opèrent sur la métropole montpelliéraine, avec une demande soutenue pour les fourgons d'occasion. Les flottes viticoles du Languedoc et l'activité touristique de la côte méditerranéenne créent une demande saisonnière en utilitaires et navettes.",
    villesDesservies: [
      "Montpellier (34000, 34070, 34080, 34090)",
      "Lattes (34970)",
      "Castelnau-le-Lez (34170)",
      "Juvignac (34990)",
      "Saint-Jean-de-Védas (34430)",
      "Pérols (34470)",
      "Grabels (34790)",
      "Mauguio (34130)",
      "Clapiers (34830)",
      "Le Crès (34920)",
    ],
    typesVehiculesLocaux: [
      "Fourgons BTP chantiers métropolitains (Boxer, Master, Ducato)",
      "Utilitaires viticoles (Transit, Jumper, Daily)",
      "VTC aéroport Montpellier-Méditerranée (Mercedes Vito, Classe V)",
      "Taxis montpelliérains (Peugeot 508, Toyota Prius+)",
      "Navettes touristiques littoral (Sprinter, Transit minibus, Traveller)",
    ],
    delaiVenteMoyen: "28 jours",
    exempleVehicule: {
      modele: "Fiat Ducato L3H2 2021 — 82 000 km",
      prix: "21 700 €",
      delai: "26 jours",
    },
  },
  nice: {
    slug: "nice",
    nom: "Nice",
    cp: "06000",
    region: "Provence-Alpes-Côte d'Azur",
    departement: "Alpes-Maritimes",
    departementNum: "06",
    intro:
      "Nice et la Côte d'Azur concentrent un marché premium de VTC haut de gamme (Mercedes Classe V, BMW Série 7) et une forte activité utilitaire liée aux chantiers du littoral.",
    marche:
      "L'aéroport Nice-Côte d'Azur, deuxième de France, génère une activité VTC exceptionnelle avec des véhicules haut de gamme renouvelés régulièrement. Les chantiers de rénovation hôtelière et la BTP azuréenne créent également une demande soutenue pour les fourgons d'occasion.",
    villesDesservies: [
      "Nice (06000, 06100, 06200, 06300)",
      "Cagnes-sur-Mer (06800)",
      "Saint-Laurent-du-Var (06700)",
      "Antibes (06600)",
      "Cannes (06400)",
      "Grasse (06130)",
      "La Trinité (06340)",
      "Drap (06340)",
      "Beaulieu-sur-Mer (06310)",
      "Villefranche-sur-Mer (06230)",
    ],
    typesVehiculesLocaux: [
      "VTC haut de gamme aéroport Nice (Mercedes Classe V, Classe S, BMW Série 7)",
      "Taxis niçois (Peugeot 508, Mercedes Classe E)",
      "Fourgons BTP littoral (Master, Ducato, Sprinter)",
      "Navettes hôtelières de luxe (Mercedes Sprinter Premium, Classe V)",
      "Fourgonnettes de livraison (Kangoo, Partner, Berlingo)",
    ],
    delaiVenteMoyen: "24 jours",
    exempleVehicule: {
      modele: "Mercedes Classe V Extra-Long 2022 — 56 000 km",
      prix: "48 900 €",
      delai: "21 jours",
    },
  },
  rouen: {
    slug: "rouen",
    nom: "Rouen",
    cp: "76000",
    region: "Normandie",
    departement: "Seine-Maritime",
    departementNum: "76",
    intro:
      "Rouen, capitale normande et important port fluvial de Seine, profite d'un tissu industriel dense (chimie, logistique, automobile) qui soutient le marché des utilitaires professionnels.",
    marche:
      "Le bassin rouennais compte des milliers d'artisans et d'entreprises logistiques utilisant un utilitaire. L'activité portuaire et le terminal pétrolier génèrent une demande constante en véhicules de chantier et en fourgons lourds. Proximité immédiate du Havre et de l'autoroute A13.",
    villesDesservies: [
      "Rouen (76000, 76100)",
      "Sotteville-lès-Rouen (76300)",
      "Le Grand-Quevilly (76120)",
      "Le Petit-Quevilly (76140)",
      "Saint-Étienne-du-Rouvray (76800)",
      "Bois-Guillaume (76230)",
      "Mont-Saint-Aignan (76130)",
      "Déville-lès-Rouen (76250)",
      "Maromme (76150)",
      "Oissel (76350)",
    ],
    typesVehiculesLocaux: [
      "Fourgons BTP et artisans (Master, Boxer, Ducato)",
      "Utilitaires logistique portuaire (Sprinter, Daily, Jumper)",
      "Ambulances CHU-Rouen (Renault Trafic, Peugeot Expert)",
      "VTC et taxis rouennais (Peugeot 508, Toyota Prius+)",
      "Fourgonnettes de livraison (Kangoo, Partner, Berlingo)",
    ],
    delaiVenteMoyen: "30 jours",
    exempleVehicule: {
      modele: "Opel Movano L3H2 2021 — 94 000 km",
      prix: "18 200 €",
      delai: "28 jours",
    },
  },
  grenoble: {
    slug: "grenoble",
    nom: "Grenoble",
    cp: "38000",
    region: "Auvergne-Rhône-Alpes",
    departement: "Isère",
    departementNum: "38",
    intro:
      "Grenoble, capitale des Alpes, combine un pôle technologique (CEA, minatec) et une forte activité utilitaire liée aux stations de ski alpines et au tourisme de montagne.",
    marche:
      "Le bassin grenoblois voit une rotation constante de véhicules utilitaires adaptés à la montagne : 4×4, fourgons 4 roues motrices, navettes de stations. La ZFE grenobloise pousse au renouvellement des flottes diesel anciennes vers des modèles récents.",
    villesDesservies: [
      "Grenoble (38000, 38100)",
      "Saint-Martin-d'Hères (38400)",
      "Échirolles (38130)",
      "Fontaine (38600)",
      "Meylan (38240)",
      "Saint-Égrève (38120)",
      "Eybens (38320)",
      "La Tronche (38700)",
      "Seyssinet-Pariset (38170)",
      "Voiron (38500)",
    ],
    typesVehiculesLocaux: [
      "Utilitaires montagne 4x4 (Ford Transit 4x4, Sprinter 4x4, Ducato 4x4)",
      "Fourgons BTP grenoblois (Master, Boxer, Ducato)",
      "Navettes stations de ski (Mercedes Sprinter, VW Crafter, Transit)",
      "Taxis grenoblois (Peugeot 508, Toyota Prius+)",
      "Ambulances et VSL CHU-Grenoble (Trafic, Expert)",
    ],
    delaiVenteMoyen: "28 jours",
    exempleVehicule: {
      modele: "Volkswagen Crafter L3H3 4Motion 2022 — 68 000 km",
      prix: "34 500 €",
      delai: "26 jours",
    },
  },
  reims: {
    slug: "reims",
    nom: "Reims",
    cp: "51100",
    region: "Grand Est",
    departement: "Marne",
    departementNum: "51",
    intro:
      "Reims, cité des sacres et capitale champenoise, abrite un tissu dense de maisons de champagne, d'artisans du BTP et de logisticiens qui génèrent un marché utilitaire actif.",
    marche:
      "Les maisons de champagne et les négociants du vignoble entretiennent des flottes utilitaires spécifiques (transport vendanges, livraison professionnelle). Les chantiers de la métropole rémoise et la proximité autoroutière A4 soutiennent la demande en fourgons d'occasion.",
    villesDesservies: [
      "Reims (51100)",
      "Tinqueux (51430)",
      "Bezannes (51430)",
      "Cormontreuil (51350)",
      "Bétheny (51450)",
      "Saint-Brice-Courcelles (51370)",
      "Cernay-lès-Reims (51420)",
      "Taissy (51500)",
      "Witry-lès-Reims (51420)",
      "Épernay (51200)",
    ],
    typesVehiculesLocaux: [
      "Utilitaires viticoles et négoce champagne (Transit, Sprinter, Master)",
      "Fourgons BTP rémois (Boxer, Ducato, Transit)",
      "Taxis rémois (Peugeot 508, Toyota Prius)",
      "Ambulances et VSL Marne (Renault Trafic, Peugeot Expert)",
      "Fourgonnettes de livraison (Kangoo, Partner, Berlingo)",
    ],
    delaiVenteMoyen: "31 jours",
    exempleVehicule: {
      modele: "Iveco Daily 35C L3H2 2022 — 72 000 km",
      prix: "25 400 €",
      delai: "29 jours",
    },
  },
  saint_etienne: {
    slug: "saint-etienne",
    nom: "Saint-Étienne",
    cp: "42000",
    region: "Auvergne-Rhône-Alpes",
    departement: "Loire",
    departementNum: "42",
    intro:
      "Saint-Étienne, berceau industriel français, conserve une forte identité d'artisanat et d'industrie qui soutient un marché utilitaire dense, à des prix plus accessibles qu'à Lyon.",
    marche:
      "Le bassin stéphanois compte des milliers d'artisans BTP et d'entreprises industrielles utilisant des utilitaires. Les prix des occasions y sont généralement inférieurs à ceux de Lyon, ce qui attire des acheteurs de l'ensemble de la région Auvergne-Rhône-Alpes.",
    villesDesservies: [
      "Saint-Étienne (42000, 42100)",
      "Saint-Chamond (42400)",
      "Firminy (42700)",
      "Saint-Priest-en-Jarez (42270)",
      "La Ricamarie (42150)",
      "Andrézieux-Bouthéon (42160)",
      "Villars (42390)",
      "Roche-la-Molière (42230)",
      "Sorbiers (42290)",
      "Saint-Jean-Bonnefonds (42650)",
    ],
    typesVehiculesLocaux: [
      "Fourgons industriels et BTP (Master, Boxer, Ducato, Daily)",
      "Utilitaires artisans Loire (Transit, Jumper, Sprinter)",
      "Taxis stéphanois (Peugeot 508, Toyota Prius)",
      "Ambulances et VSL CHU-Saint-Étienne (Trafic, Expert)",
      "Fourgonnettes de livraison (Kangoo, Partner, Berlingo)",
    ],
    delaiVenteMoyen: "32 jours",
    exempleVehicule: {
      modele: "Renault Master L3H2 2020 — 108 000 km",
      prix: "16 800 €",
      delai: "30 jours",
    },
  },
  le_havre: {
    slug: "le-havre",
    nom: "Le Havre",
    cp: "76600",
    region: "Normandie",
    departement: "Seine-Maritime",
    departementNum: "76",
    intro:
      "Le Havre, premier port français pour le conteneur, est un hub logistique incontournable. Le marché utilitaire y est intense, porté par les transporteurs, commissionnaires et artisans du BTP.",
    marche:
      "L'axe logistique Havre-Rouen-Paris génère un flux permanent de véhicules utilitaires. Les entreprises portuaires renouvellent régulièrement leurs flottes de fourgons et camionnettes. Les chantiers du centre reconstruit classé Unesco ajoutent une demande BTP continue.",
    villesDesservies: [
      "Le Havre (76600, 76610, 76620)",
      "Montivilliers (76290)",
      "Harfleur (76700)",
      "Gonfreville-l'Orcher (76700)",
      "Sainte-Adresse (76310)",
      "Octeville-sur-Mer (76930)",
      "Saint-Romain-de-Colbosc (76430)",
      "Bolbec (76210)",
      "Lillebonne (76170)",
      "Fécamp (76400)",
    ],
    typesVehiculesLocaux: [
      "Utilitaires logistique portuaire (Sprinter, Daily, Jumper, Master)",
      "Fourgons artisans BTP havrais (Boxer, Ducato, Transit)",
      "Taxis et VTC havrais (Peugeot 508, Mercedes Classe E)",
      "Ambulances et VSL Le Havre (Renault Trafic)",
      "Fourgonnettes commerciales (Kangoo, Partner, Berlingo)",
    ],
    delaiVenteMoyen: "31 jours",
    exempleVehicule: {
      modele: "Ford Transit L3H2 Trend 2021 — 89 000 km",
      prix: "19 700 €",
      delai: "29 jours",
    },
  },
};

const VILLES_SLUGS = Object.keys(VILLES);

export function generateStaticParams() {
  return VILLES_SLUGS.map((ville) => ({ ville }));
}

export async function generateMetadata({
  params,
}: {
  params: { ville: string };
}): Promise<Metadata> {
  const data = VILLES[params.ville];
  if (!data) return {};
  const title = `Dépôt-vente véhicule professionnel à ${data.nom} (${data.cp}) — RoullePro`;
  const description = `Vendez votre utilitaire, VSL, taxi ou VTC via le dépôt-vente RoullePro à ${data.nom}. Garage partenaire certifié, 88% du prix reversé, délai moyen ${data.delaiVenteMoyen}. Reprise garantie si pas vendu sous 90 jours.`;
  return {
    title,
    description,
    alternates: { canonical: `https://roullepro.com/depot-vente/${data.slug}` },
    openGraph: {
      title,
      description,
      url: `https://roullepro.com/depot-vente/${data.slug}`,
      siteName: "RoullePro",
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default function VilleDepotVentePage({
  params,
}: {
  params: { ville: string };
}) {
  const data = VILLES[params.ville];
  if (!data) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Dépôt-vente de véhicules professionnels",
    provider: {
      "@type": "Organization",
      name: "RoullePro",
      url: "https://roullepro.com",
    },
    areaServed: {
      "@type": "City",
      name: data.nom,
      address: {
        "@type": "PostalAddress",
        addressLocality: data.nom,
        postalCode: data.cp,
        addressRegion: data.region,
        addressCountry: "FR",
      },
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      description: `Dépôt-vente de véhicule professionnel à ${data.nom}. 88% du prix de vente reversé au vendeur.`,
    },
    url: `https://roullepro.com/depot-vente/${data.slug}`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: "https://roullepro.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Dépôt-vente",
        item: "https://roullepro.com/depot-vente",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Dépôt-vente ${data.nom}`,
        item: `https://roullepro.com/depot-vente/${data.slug}`,
      },
    ],
  };

  const autresVilles = VILLES_SLUGS.filter((s) => s !== data.slug).map(
    (s) => VILLES[s],
  );

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <MapPin size={14} />
              {data.nom} — {data.departement} ({data.departementNum})
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              Dépôt-vente véhicule <br className="hidden sm:block" />
              professionnel à{" "}
              <span className="text-blue-400">{data.nom}</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
              {data.intro}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/depot-vente/estimer"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-xl transition text-base"
              >
                Estimer mon véhicule gratuitement
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/depot-vente/garages"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition text-base backdrop-blur-sm"
              >
                Voir le garage partenaire {data.nom}
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
              {[
                `Délai de vente moyen : ${data.delaiVenteMoyen}`,
                "88% du prix reversé au vendeur",
                "Reprise garantie à 90 jours",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-blue-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARCHE LOCAL */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Le marché de l&apos;utilitaire d&apos;occasion à {data.nom}
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">{data.marche}</p>
            <p className="text-slate-600 leading-relaxed">
              RoullePro couvre l&apos;ensemble du bassin de{" "}
              {data.nom} via son garage partenaire certifié. Nous prenons en
              charge toutes les démarches de vente de votre véhicule
              professionnel : expertise technique 40 points, photos HD, annonce
              optimisée, gestion des visites et des offres, sécurisation du
              paiement.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
            <h3 className="font-bold text-lg mb-6">
              Exemple récent de vente à {data.nom}
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-blue-200 text-xs uppercase tracking-wide mb-1">
                  Véhicule
                </div>
                <div className="font-semibold">
                  {data.exempleVehicule.modele}
                </div>
              </div>
              <div>
                <div className="text-blue-200 text-xs uppercase tracking-wide mb-1">
                  Prix de vente
                </div>
                <div className="text-2xl font-extrabold">
                  {data.exempleVehicule.prix}
                </div>
              </div>
              <div>
                <div className="text-blue-200 text-xs uppercase tracking-wide mb-1">
                  Délai de vente
                </div>
                <div className="font-semibold">
                  {data.exempleVehicule.delai}
                </div>
              </div>
            </div>
            <p className="text-blue-200 text-xs mt-6">
              Exemple représentatif. Les délais réels varient selon le modèle,
              l&apos;état et le prix fixé.
            </p>
          </div>
        </div>
      </section>

      {/* TYPES DE VEHICULES LOCAUX */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Les véhicules les plus demandés à {data.nom}
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Le tissu économique local oriente la demande vers des profils
              spécifiques de véhicules utilitaires.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.typesVehiculesLocaux.map((type) => (
              <div
                key={type}
                className="bg-white rounded-xl p-5 border border-slate-100 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={16} className="text-blue-600" />
                </div>
                <span className="text-slate-700 text-sm leading-relaxed">
                  {type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ZONE COUVERTE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Zone couverte autour de {data.nom}
          </h2>
          <p className="text-slate-500 text-lg">
            Le garage partenaire RoullePro {data.nom} peut récupérer votre
            véhicule à domicile dans un rayon de 50 km (79 € forfait).
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {data.villesDesservies.map((ville) => (
            <div
              key={ville}
              className="bg-white border border-slate-100 rounded-lg px-4 py-3 text-sm text-slate-700 flex items-center gap-2"
            >
              <MapPin size={14} className="text-blue-500 flex-shrink-0" />
              {ville}
            </div>
          ))}
        </div>
      </section>

      {/* POURQUOI ROULLEPRO A [VILLE] */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Pourquoi choisir RoullePro à {data.nom}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: `Délai moyen ${data.delaiVenteMoyen}`,
                desc: `Le bassin de ${data.nom} bénéficie d'une demande soutenue en utilitaires professionnels. Nos véhicules partent en moyenne en ${data.delaiVenteMoyen}.`,
              },
              {
                icon: Shield,
                title: "Reprise garantie 90 jours",
                desc: "Si votre véhicule n'est pas vendu dans les 90 jours, vous le récupérez sans frais et sans pénalité. Zéro risque.",
              },
              {
                icon: TrendingUp,
                title: "88% du prix reversé",
                desc: "Notre commission reste parmi les plus basses du marché : 7% garage, 4% RoullePro, 250 € de préparation. Le reste vous revient.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-6 border border-slate-100"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-14 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Vendez votre véhicule à {data.nom}
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Estimation gratuite en 2 minutes. Sans engagement. Notre équipe vous
            rappelle dans la journée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/depot-vente/estimer"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-base transition"
            >
              Estimer mon véhicule
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-base transition backdrop-blur-sm"
            >
              <Phone size={16} /> Être rappelé
            </Link>
          </div>
        </div>
      </section>

      {/* MAILLAGE AUTRES VILLES */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          Dépôt-vente RoullePro dans d&apos;autres villes
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {autresVilles.map((v) => (
            <Link
              key={v.slug}
              href={`/depot-vente/${v.slug}`}
              className="bg-white border border-slate-100 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-semibold text-slate-900">
                  Dépôt-vente {v.nom}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {v.cp} — {v.region}
                </div>
              </div>
              <ArrowRight
                size={18}
                className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition"
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
