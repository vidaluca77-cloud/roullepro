/**
 * Données locales + générateur de contenu éditorial pour les pages hub
 * /transport-medical/[ville]/[categorie] (Chantier B — industrialisation SEO ville).
 *
 * Objectif : produire un contenu unique par page (PAS de doorway pages) pour
 * ~155 combinaisons ville×catégorie, à partir d'une table de données locales
 * réelles (département, hôpital de référence, communes voisines) et de plusieurs
 * gabarits de phrase alternés déterministiquement selon le slug de la ville.
 *
 * Le générateur `buildGeneratedCityContent` renvoie un objet CityCategoryContent
 * (même structure que les entrées écrites à la main dans seo-city-content.ts).
 * `getCityCategoryContent` (seo-city-content.ts) interroge d'abord les entrées
 * statiques puis, à défaut, ce générateur. Les villes/catégories absentes de la
 * table conservent le fallback générique de la page.
 */

import { slugifyVille } from "@/lib/sanitaire-data";
import type { CityCategoryContent } from "@/lib/seo-city-content";

type VilleData = {
  /** Nom d'affichage de la ville (accentué). */
  nom: string;
  /** Code département (ex. "37", "2A"). */
  depCode: string;
  /** Nom du département (accentué). */
  depNom: string;
  /** Catégories cibles pour cette ville (slug de route). */
  cats: string[];
  /** Communes voisines réelles (noms d'affichage ; slug dérivé via slugifyVille). */
  voisines: string[];
  /** Établissement de santé de référence, pour ancrage local (optionnel). */
  hopital?: string;
};

/**
 * Table des villes prioritaires (issue de top100_villes_final.json) résolues vers
 * une commune réelle. Les DOM non-communes (reunion, martinique) sont exclus.
 */
export const VILLE_DATA: Record<string, VilleData> = {
  paris: {
    nom: "Paris",
    depCode: "75",
    depNom: "Paris",
    cats: ["ambulance", "taxi-conventionne", "vsl"],
    voisines: ["Boulogne-Billancourt", "Saint-Denis", "Montreuil", "Neuilly-sur-Seine", "Vincennes", "Levallois-Perret"],
    hopital: "les hôpitaux de l'AP-HP (Pitié-Salpêtrière, Cochin, Bichat, Saint-Louis)",
  },
  tours: {
    nom: "Tours",
    depCode: "37",
    depNom: "Indre-et-Loire",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["Joué-lès-Tours", "Saint-Cyr-sur-Loire", "Saint-Avertin", "Chambray-lès-Tours", "Amboise"],
    hopital: "le CHRU de Tours (Bretonneau, Trousseau)",
  },
  "clermont-ferrand": {
    nom: "Clermont-Ferrand",
    depCode: "63",
    depNom: "Puy-de-Dôme",
    cats: ["vsl", "ambulance", "taxi-conventionne"],
    voisines: ["Aubière", "Chamalières", "Riom", "Cournon-d'Auvergne", "Beaumont"],
    hopital: "le CHU de Clermont-Ferrand (Gabriel-Montpied, Estaing)",
  },
  toulouse: {
    nom: "Toulouse",
    depCode: "31",
    depNom: "Haute-Garonne",
    cats: ["ambulance", "taxi-conventionne"],
    voisines: ["Blagnac", "Colomiers", "Balma", "Tournefeuille", "Ramonville-Saint-Agne"],
    hopital: "le CHU de Toulouse (Purpan, Rangueil)",
  },
  nancy: {
    nom: "Nancy",
    depCode: "54",
    depNom: "Meurthe-et-Moselle",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["Vandœuvre-lès-Nancy", "Laxou", "Maxéville", "Villers-lès-Nancy", "Tomblaine"],
    hopital: "le CHRU de Nancy (Brabois, Central)",
  },
  colmar: {
    nom: "Colmar",
    depCode: "68",
    depNom: "Haut-Rhin",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["Ingersheim", "Wintzenheim", "Turckheim", "Horbourg-Wihr", "Munster"],
    hopital: "les Hôpitaux Civils de Colmar (Pasteur)",
  },
  arras: {
    nom: "Arras",
    depCode: "62",
    depNom: "Pas-de-Calais",
    cats: ["ambulance", "taxi-conventionne", "vsl"],
    voisines: ["Lens", "Béthune", "Hénin-Beaumont", "Liévin", "Saint-Laurent-Blangy", "Achicourt"],
    hopital: "le Centre hospitalier d'Arras",
  },
  nice: {
    nom: "Nice",
    depCode: "06",
    depNom: "Alpes-Maritimes",
    cats: ["ambulance", "vsl"],
    voisines: ["Cagnes-sur-Mer", "Saint-Laurent-du-Var", "Antibes", "Cannes", "Menton"],
    hopital: "le CHU de Nice (Pasteur 2, l'Archet)",
  },
  barentin: {
    nom: "Barentin",
    depCode: "76",
    depNom: "Seine-Maritime",
    cats: ["ambulance"],
    voisines: ["Pavilly", "Villers-Écalles", "Duclair", "Yerville", "Malaunay"],
    hopital: "le CHU de Rouen et le Centre hospitalier de Barentin",
  },
  "saint-malo": {
    nom: "Saint-Malo",
    depCode: "35",
    depNom: "Ille-et-Vilaine",
    cats: ["taxi-conventionne"],
    voisines: ["Dinard", "Cancale", "Dol-de-Bretagne", "Saint-Jouan-des-Guérets", "Châteauneuf-d'Ille-et-Vilaine"],
    hopital: "le Centre hospitalier de Saint-Malo (Broussais)",
  },
  nantes: {
    nom: "Nantes",
    depCode: "44",
    depNom: "Loire-Atlantique",
    cats: ["ambulance", "taxi-conventionne", "vsl"],
    voisines: ["Saint-Herblain", "Rezé", "Orvault", "Vertou", "Saint-Sébastien-sur-Loire", "Carquefou"],
    hopital: "le CHU de Nantes (Hôtel-Dieu, Laennec)",
  },
  montpellier: {
    nom: "Montpellier",
    depCode: "34",
    depNom: "Hérault",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["Lattes", "Castelnau-le-Lez", "Juvignac", "Pérols", "Le Crès"],
    hopital: "le CHU de Montpellier (Lapeyronie, Gui de Chauliac, Arnaud de Villeneuve)",
  },
  mulhouse: {
    nom: "Mulhouse",
    depCode: "68",
    depNom: "Haut-Rhin",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["Illzach", "Rixheim", "Riedisheim", "Wittenheim", "Kingersheim"],
    hopital: "le GHR Mulhouse Sud-Alsace (Émile Muller)",
  },
  bordeaux: {
    nom: "Bordeaux",
    depCode: "33",
    depNom: "Gironde",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["Mérignac", "Pessac", "Talence", "Bègles", "Le Bouscat", "Bruges"],
    hopital: "le CHU de Bordeaux (Pellegrin, Saint-André, Haut-Lévêque)",
  },
  laval: {
    nom: "Laval",
    depCode: "53",
    depNom: "Mayenne",
    cats: ["ambulance"],
    voisines: ["Changé", "Saint-Berthevin", "Bonchamp-lès-Laval", "L'Huisserie", "Louverné"],
    hopital: "le Centre hospitalier de Laval",
  },
  caen: {
    nom: "Caen",
    depCode: "14",
    depNom: "Calvados",
    cats: ["ambulance", "taxi-conventionne", "vsl"],
    voisines: ["Hérouville-Saint-Clair", "Mondeville", "Ifs", "Bretteville-sur-Odon", "Fleury-sur-Orne"],
    hopital: "le CHU de Caen Normandie",
  },
  annecy: {
    nom: "Annecy",
    depCode: "74",
    depNom: "Haute-Savoie",
    cats: ["vsl", "ambulance"],
    voisines: ["Seynod", "Cran-Gevrier", "Meythet", "Épagny Metz-Tessy", "Rumilly"],
    hopital: "le Centre hospitalier Annecy Genevois (Metz-Tessy)",
  },
  marseille: {
    nom: "Marseille",
    depCode: "13",
    depNom: "Bouches-du-Rhône",
    cats: ["taxi-conventionne", "vsl"],
    voisines: ["Aubagne", "Allauch", "Plan-de-Cuques", "Marignane", "Vitrolles", "Aix-en-Provence"],
    hopital: "l'AP-HM (La Timone, Nord, la Conception)",
  },
  compiegne: {
    nom: "Compiègne",
    depCode: "60",
    depNom: "Oise",
    cats: ["ambulance"],
    voisines: ["Margny-lès-Compiègne", "Venette", "Clairoix", "Choisy-au-Bac", "Le Meux"],
    hopital: "le Centre hospitalier de Compiègne-Noyon",
  },
  troyes: {
    nom: "Troyes",
    depCode: "10",
    depNom: "Aube",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["Saint-André-les-Vergers", "La Chapelle-Saint-Luc", "Sainte-Savine", "Pont-Sainte-Marie", "Saint-Julien-les-Villas"],
    hopital: "les Hôpitaux Champagne Sud (CH de Troyes)",
  },
  strasbourg: {
    nom: "Strasbourg",
    depCode: "67",
    depNom: "Bas-Rhin",
    cats: ["vsl", "ambulance", "taxi-conventionne"],
    voisines: ["Schiltigheim", "Illkirch-Graffenstaden", "Haguenau", "Sélestat", "Obernai", "Bischheim"],
    hopital: "les Hôpitaux universitaires de Strasbourg (Nouvel Hôpital Civil, Hautepierre)",
  },
  saintes: {
    nom: "Saintes",
    depCode: "17",
    depNom: "Charente-Maritime",
    cats: ["vsl"],
    voisines: ["Saint-Georges-des-Coteaux", "Chaniers", "Fontcouverte", "Les Gonds", "Cognac"],
    hopital: "le Centre hospitalier de Saintonge",
  },
  rennes: {
    nom: "Rennes",
    depCode: "35",
    depNom: "Ille-et-Vilaine",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["Cesson-Sévigné", "Saint-Grégoire", "Bruz", "Chantepie", "Betton", "Pacé"],
    hopital: "le CHU de Rennes (Pontchaillou, Hôpital Sud)",
  },
  besancon: {
    nom: "Besançon",
    depCode: "25",
    depNom: "Doubs",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["École-Valentin", "Chalezeule", "Saône", "Pirey", "Beure"],
    hopital: "le CHU de Besançon (Jean Minjoz)",
  },
  limoges: {
    nom: "Limoges",
    depCode: "87",
    depNom: "Haute-Vienne",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["Saint-Junien", "Panazol", "Isle", "Couzeix", "Aixe-sur-Vienne", "Feytiat"],
    hopital: "le CHU de Limoges (Dupuytren)",
  },
  dijon: {
    nom: "Dijon",
    depCode: "21",
    depNom: "Côte-d'Or",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["Chenôve", "Talant", "Quetigny", "Longvic", "Fontaine-lès-Dijon"],
    hopital: "le CHU Dijon Bourgogne (Le Bocage)",
  },
  "saint-louis": {
    nom: "Saint-Louis",
    depCode: "68",
    depNom: "Haut-Rhin",
    cats: ["ambulance"],
    voisines: ["Huningue", "Village-Neuf", "Hégenheim", "Bartenheim", "Sierentz"],
    hopital: "le Centre hospitalier de Saint-Louis et le GHR Mulhouse Sud-Alsace",
  },
  metz: {
    nom: "Metz",
    depCode: "57",
    depNom: "Moselle",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["Montigny-lès-Metz", "Woippy", "Ars-sur-Moselle", "Marly", "Le Ban-Saint-Martin"],
    hopital: "le CHR Metz-Thionville (Hôpital de Mercy)",
  },
  "saint-avold": {
    nom: "Saint-Avold",
    depCode: "57",
    depNom: "Moselle",
    cats: ["ambulance"],
    voisines: ["Longeville-lès-Saint-Avold", "Valmont", "L'Hôpital", "Carling", "Freyming-Merlebach"],
    hopital: "l'hôpital de Saint-Avold (Hôpitaux Robert Pax)",
  },
  blois: {
    nom: "Blois",
    depCode: "41",
    depNom: "Loir-et-Cher",
    cats: ["ambulance"],
    voisines: ["Vineuil", "Saint-Gervais-la-Forêt", "La Chaussée-Saint-Victor", "Villebarou", "Vendôme"],
    hopital: "le Centre hospitalier de Blois (Simone Veil)",
  },
  bethune: {
    nom: "Béthune",
    depCode: "62",
    depNom: "Pas-de-Calais",
    cats: ["ambulance"],
    voisines: ["Beuvry", "Bruay-la-Buissière", "Lillers", "Auchel", "Nœux-les-Mines"],
    hopital: "le Centre hospitalier de Béthune-Beuvry (Germon et Gauthier)",
  },
  albi: {
    nom: "Albi",
    depCode: "81",
    depNom: "Tarn",
    cats: ["ambulance", "vsl"],
    voisines: ["Castres", "Gaillac", "Carmaux", "Graulhet", "Lavaur", "Saint-Juéry"],
    hopital: "le Centre hospitalier d'Albi (la Renaudié)",
  },
  nimes: {
    nom: "Nîmes",
    depCode: "30",
    depNom: "Gard",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["Alès", "Bagnols-sur-Cèze", "Vauvert", "Beaucaire", "Saint-Gilles", "Milhaud"],
    hopital: "le CHU de Nîmes (Carémeau)",
  },
  angouleme: {
    nom: "Angoulême",
    depCode: "16",
    depNom: "Charente",
    cats: ["ambulance"],
    voisines: ["Soyaux", "La Couronne", "Gond-Pontouvre", "Ruelle-sur-Touvre", "Saint-Yrieix-sur-Charente"],
    hopital: "le Centre hospitalier d'Angoulême (Girac)",
  },
  brest: {
    nom: "Brest",
    depCode: "29",
    depNom: "Finistère",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["Guipavas", "Le Relecq-Kerhuon", "Plougastel-Daoulas", "Gouesnou", "Bohars"],
    hopital: "le CHRU de Brest (La Cavale Blanche, Morvan)",
  },
  annemasse: {
    nom: "Annemasse",
    depCode: "74",
    depNom: "Haute-Savoie",
    cats: ["ambulance", "vsl"],
    voisines: ["Gaillard", "Ambilly", "Ville-la-Grand", "Vétraz-Monthoux", "Cranves-Sales", "Bonneville"],
    hopital: "le Centre hospitalier Alpes-Léman (Findrol)",
  },
  lyon: {
    nom: "Lyon",
    depCode: "69",
    depNom: "Rhône",
    cats: ["ambulance"],
    voisines: ["Villeurbanne", "Vénissieux", "Caluire-et-Cuire", "Bron", "Vaulx-en-Velin", "Oullins"],
    hopital: "les Hospices Civils de Lyon (Édouard Herriot, Lyon Sud, Croix-Rousse)",
  },
  amiens: {
    nom: "Amiens",
    depCode: "80",
    depNom: "Somme",
    cats: ["ambulance", "taxi-conventionne", "vsl"],
    voisines: ["Longueau", "Rivery", "Camon", "Salouël", "Dury"],
    hopital: "le CHU Amiens-Picardie",
  },
  poitiers: {
    nom: "Poitiers",
    depCode: "86",
    depNom: "Vienne",
    cats: ["ambulance", "vsl"],
    voisines: ["Buxerolles", "Chasseneuil-du-Poitou", "Migné-Auxances", "Saint-Benoît", "Biard"],
    hopital: "le CHU de Poitiers (La Milétrie)",
  },
  orleans: {
    nom: "Orléans",
    depCode: "45",
    depNom: "Loiret",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["Fleury-les-Aubrais", "Olivet", "Saint-Jean-de-Braye", "Saran", "Saint-Jean-de-la-Ruelle"],
    hopital: "le CHR d'Orléans (La Source)",
  },
  chartres: {
    nom: "Chartres",
    depCode: "28",
    depNom: "Eure-et-Loir",
    cats: ["ambulance", "taxi-conventionne", "vsl"],
    voisines: ["Lucé", "Lèves", "Mainvilliers", "Champhol", "Le Coudray"],
    hopital: "les Hôpitaux de Chartres (Louis Pasteur)",
  },
  tourcoing: {
    nom: "Tourcoing",
    depCode: "59",
    depNom: "Nord",
    cats: ["ambulance", "taxi-conventionne"],
    voisines: ["Roubaix", "Mouvaux", "Wattrelos", "Neuville-en-Ferrain", "Halluin", "Bondues"],
    hopital: "le Centre hospitalier de Tourcoing (Gustave Dron)",
  },
  valenciennes: {
    nom: "Valenciennes",
    depCode: "59",
    depNom: "Nord",
    cats: ["ambulance", "taxi-conventionne"],
    voisines: ["Anzin", "Marly", "Saint-Saulve", "La Sentinelle", "Aulnoy-lez-Valenciennes", "Denain"],
    hopital: "le Centre hospitalier de Valenciennes",
  },
  villeurbanne: {
    nom: "Villeurbanne",
    depCode: "69",
    depNom: "Rhône",
    cats: ["ambulance", "taxi-conventionne", "vsl"],
    voisines: ["Lyon", "Vaulx-en-Velin", "Bron", "Caluire-et-Cuire", "Vénissieux"],
    hopital: "les Hospices Civils de Lyon (Croix-Rousse, Édouard Herriot)",
  },
  dax: {
    nom: "Dax",
    depCode: "40",
    depNom: "Landes",
    cats: ["taxi-conventionne"],
    voisines: ["Saint-Paul-lès-Dax", "Narrosse", "Saint-Vincent-de-Paul", "Yzosse", "Mont-de-Marsan"],
    hopital: "le Centre hospitalier de Dax-Côte d'Argent",
  },
  avignon: {
    nom: "Avignon",
    depCode: "84",
    depNom: "Vaucluse",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["Le Pontet", "Villeneuve-lès-Avignon", "Morières-lès-Avignon", "Sorgues", "Vedène"],
    hopital: "le Centre hospitalier d'Avignon (Henri Duffaut)",
  },
  quimper: {
    nom: "Quimper",
    depCode: "29",
    depNom: "Finistère",
    cats: ["ambulance", "vsl"],
    voisines: ["Ergué-Gabéric", "Pluguffan", "Plomelin", "Quimperlé", "Concarneau", "Douarnenez"],
    hopital: "le Centre hospitalier de Cornouaille (Quimper)",
  },
  pau: {
    nom: "Pau",
    depCode: "64",
    depNom: "Pyrénées-Atlantiques",
    cats: ["ambulance", "vsl"],
    voisines: ["Billère", "Lons", "Jurançon", "Lescar", "Bizanos", "Gan"],
    hopital: "le Centre hospitalier de Pau (François Mitterrand)",
  },
  belfort: {
    nom: "Belfort",
    depCode: "90",
    depNom: "Territoire de Belfort",
    cats: ["ambulance", "vsl"],
    voisines: ["Valdoie", "Offemont", "Bavilliers", "Danjoutin", "Essert"],
    hopital: "l'Hôpital Nord Franche-Comté (Trévenans)",
  },
  "saint-nazaire": {
    nom: "Saint-Nazaire",
    depCode: "44",
    depNom: "Loire-Atlantique",
    cats: ["ambulance"],
    voisines: ["Trignac", "Montoir-de-Bretagne", "Saint-André-des-Eaux", "Pornichet", "La Baule-Escoublac", "Donges"],
    hopital: "le Centre hospitalier de Saint-Nazaire (Cité Sanitaire)",
  },
  carcassonne: {
    nom: "Carcassonne",
    depCode: "11",
    depNom: "Aude",
    cats: ["ambulance", "vsl"],
    voisines: ["Trèbes", "Villemoustaussou", "Berriac", "Palaja", "Pennautier"],
    hopital: "le Centre hospitalier de Carcassonne (Antoine Gayraud)",
  },
  melun: {
    nom: "Melun",
    depCode: "77",
    depNom: "Seine-et-Marne",
    cats: ["ambulance", "taxi-conventionne", "vsl"],
    voisines: ["Le Mée-sur-Seine", "Dammarie-les-Lys", "La Rochette", "Vaux-le-Pénil", "Livry-sur-Seine"],
    hopital: "le Grand Hôpital de l'Est Francilien (site Marc Jacquet)",
  },
  hazebrouck: {
    nom: "Hazebrouck",
    depCode: "59",
    depNom: "Nord",
    cats: ["ambulance"],
    voisines: ["Borre", "Morbecque", "Steenvoorde", "Merville", "Bailleul", "Aire-sur-la-Lys"],
    hopital: "le Centre hospitalier d'Hazebrouck",
  },
  montauban: {
    nom: "Montauban",
    depCode: "82",
    depNom: "Tarn-et-Garonne",
    cats: ["ambulance", "vsl", "taxi-conventionne"],
    voisines: ["Bressols", "Montbeton", "Albias", "Lacourt-Saint-Pierre", "Castelsarrasin"],
    hopital: "le Centre hospitalier de Montauban (Léon Cladel)",
  },
  rodez: {
    nom: "Rodez",
    depCode: "12",
    depNom: "Aveyron",
    cats: ["ambulance"],
    voisines: ["Onet-le-Château", "Olemps", "Le Monastère", "Sébazac-Concourès", "Druelle Balsac"],
    hopital: "le Centre hospitalier de Rodez (Jacques Puel)",
  },
  "porto-vecchio": {
    nom: "Porto-Vecchio",
    depCode: "2A",
    depNom: "Corse-du-Sud",
    cats: ["taxi-conventionne"],
    voisines: ["Lecci", "Zonza", "Sotta", "Bonifacio", "Sari-Solenzara"],
    hopital: "le Centre hospitalier d'Ajaccio et la clinique de Porto-Vecchio",
  },
  soyaux: {
    nom: "Soyaux",
    depCode: "16",
    depNom: "Charente",
    cats: ["ambulance"],
    voisines: ["Angoulême", "Ruelle-sur-Touvre", "Gond-Pontouvre", "Puymoyen", "Magnac-sur-Touvre"],
    hopital: "le Centre hospitalier d'Angoulême (Girac)",
  },
  poissy: {
    nom: "Poissy",
    depCode: "78",
    depNom: "Yvelines",
    cats: ["ambulance", "taxi-conventionne"],
    voisines: ["Achères", "Chambourcy", "Carrières-sous-Poissy", "Orgeval", "Saint-Germain-en-Laye"],
    hopital: "le Centre hospitalier intercommunal Poissy-Saint-Germain-en-Laye",
  },
  lunel: {
    nom: "Lunel",
    depCode: "34",
    depNom: "Hérault",
    cats: ["ambulance", "vsl"],
    voisines: ["Lunel-Viel", "Marsillargues", "Saturargues", "Boisseron", "Mauguio"],
    hopital: "le Centre hospitalier de Lunel et le CHU de Montpellier",
  },
  aurillac: {
    nom: "Aurillac",
    depCode: "15",
    depNom: "Cantal",
    cats: ["ambulance"],
    voisines: ["Arpajon-sur-Cère", "Ytrac", "Naucelles", "Sansac-de-Marmiesse", "Aurillac"],
    hopital: "le Centre hospitalier Henri Mondor d'Aurillac",
  },
  "noisy-le-grand": {
    nom: "Noisy-le-Grand",
    depCode: "93",
    depNom: "Seine-Saint-Denis",
    cats: ["ambulance", "taxi-conventionne"],
    voisines: ["Bry-sur-Marne", "Champs-sur-Marne", "Gournay-sur-Marne", "Neuilly-sur-Marne", "Villiers-sur-Marne"],
    hopital: "les hôpitaux de l'est parisien (GHI Le Raincy-Montfermeil, AP-HP)",
  },
  anglet: {
    nom: "Anglet",
    depCode: "64",
    depNom: "Pyrénées-Atlantiques",
    cats: ["ambulance", "vsl"],
    voisines: ["Bayonne", "Biarritz", "Bidart", "Boucau", "Saint-Pierre-d'Irube"],
    hopital: "le Centre hospitalier de la Côte Basque (Bayonne)",
  },
  montelimar: {
    nom: "Montélimar",
    depCode: "26",
    depNom: "Drôme",
    cats: ["ambulance"],
    voisines: ["Montboucher-sur-Jabron", "Ancône", "Sauzet", "Châteauneuf-du-Rhône", "Donzère"],
    hopital: "le Groupe hospitalier Portes de Provence (CH de Montélimar)",
  },
  beaune: {
    nom: "Beaune",
    depCode: "21",
    depNom: "Côte-d'Or",
    cats: ["taxi-conventionne"],
    voisines: ["Chorey-les-Beaune", "Savigny-lès-Beaune", "Meursault", "Nuits-Saint-Georges", "Chagny"],
    hopital: "le Centre hospitalier de Beaune (Philippe Le Bon)",
  },
  dieppe: {
    nom: "Dieppe",
    depCode: "76",
    depNom: "Seine-Maritime",
    cats: ["taxi-conventionne"],
    voisines: ["Saint-Aubin-sur-Scie", "Arques-la-Bataille", "Offranville", "Rouxmesnil-Bouteilles", "Martin-Église"],
    hopital: "le Centre hospitalier de Dieppe",
  },
  thionville: {
    nom: "Thionville",
    depCode: "57",
    depNom: "Moselle",
    cats: ["taxi-conventionne"],
    voisines: ["Yutz", "Terville", "Hayange", "Florange", "Uckange"],
    hopital: "le CHR Metz-Thionville (Hôpital Bel-Air)",
  },
  calvi: {
    nom: "Calvi",
    depCode: "2B",
    depNom: "Haute-Corse",
    cats: ["taxi-conventionne"],
    voisines: ["Calenzana", "Lumio", "L'Île-Rousse", "Montegrosso", "Sant'Antonino"],
    hopital: "le Centre hospitalier de Bastia (référence de la Haute-Corse)",
  },
  cavaillon: {
    nom: "Cavaillon",
    depCode: "84",
    depNom: "Vaucluse",
    cats: ["ambulance"],
    voisines: ["Cheval-Blanc", "Les Taillades", "Robion", "L'Isle-sur-la-Sorgue", "Cabannes"],
    hopital: "le Centre hospitalier de Cavaillon-Lauris",
  },
  orange: {
    nom: "Orange",
    depCode: "84",
    depNom: "Vaucluse",
    cats: ["ambulance"],
    voisines: ["Courthézon", "Camaret-sur-Aigues", "Jonquières", "Sérignan-du-Comtat", "Caderousse"],
    hopital: "le Centre hospitalier d'Orange (Louis Giorgi)",
  },
  clamart: {
    nom: "Clamart",
    depCode: "92",
    depNom: "Hauts-de-Seine",
    cats: ["ambulance", "taxi-conventionne"],
    voisines: ["Issy-les-Moulineaux", "Meudon", "Châtillon", "Le Plessis-Robinson", "Fontenay-aux-Roses", "Malakoff"],
    hopital: "l'hôpital Antoine-Béclère (AP-HP, Clamart)",
  },
  vesoul: {
    nom: "Vesoul",
    depCode: "70",
    depNom: "Haute-Saône",
    cats: ["vsl"],
    voisines: ["Luxeuil-les-Bains", "Lure", "Gray", "Héricourt", "Port-sur-Saône", "Saint-Rémy"],
    hopital: "le Groupe hospitalier de la Haute-Saône (hôpital de Vesoul)",
  },
  abbeville: {
    nom: "Abbeville",
    depCode: "80",
    depNom: "Somme",
    cats: ["taxi-conventionne"],
    voisines: ["Mareuil-Caubert", "Cambron", "Drucat", "Épagne-Épagnette", "Saint-Riquier"],
    hopital: "le Centre hospitalier d'Abbeville",
  },
  quimperle: {
    nom: "Quimperlé",
    depCode: "29",
    depNom: "Finistère",
    cats: ["taxi-conventionne"],
    voisines: ["Mellac", "Tréméven", "Scaër", "Bannalec", "Riec-sur-Bélon"],
    hopital: "le Centre hospitalier de Quimperlé",
  },
  "lons-le-saunier": {
    nom: "Lons-le-Saunier",
    depCode: "39",
    depNom: "Jura",
    cats: ["ambulance"],
    voisines: ["Montmorot", "Perrigny", "Macornay", "Courlaoux", "Messia-sur-Sorne"],
    hopital: "le Centre hospitalier de Lons-le-Saunier (Louis Pasteur)",
  },
  chateauroux: {
    nom: "Châteauroux",
    depCode: "36",
    depNom: "Indre",
    cats: ["taxi-conventionne"],
    voisines: ["Déols", "Le Poinçonnet", "Saint-Maur", "Montierchaume", "Ardentes"],
    hopital: "le Centre hospitalier de Châteauroux-Le Blanc (Les Grands Champs)",
  },
  chatellerault: {
    nom: "Châtellerault",
    depCode: "86",
    depNom: "Vienne",
    cats: ["ambulance"],
    voisines: ["Naintré", "Antran", "Cenon-sur-Vienne", "Availles-en-Châtellerault", "Thuré"],
    hopital: "le Centre hospitalier de Châtellerault (Camille Guérin)",
  },
  "juan-les-pins": {
    nom: "Juan-les-Pins",
    depCode: "06",
    depNom: "Alpes-Maritimes",
    cats: ["taxi-conventionne"],
    voisines: ["Antibes", "Vallauris", "Biot", "Le Cannet", "Cannes"],
    hopital: "le Centre hospitalier d'Antibes-Juan-les-Pins",
  },
  alencon: {
    nom: "Alençon",
    depCode: "61",
    depNom: "Orne",
    cats: ["taxi-conventionne"],
    voisines: ["Damigny", "Saint-Germain-du-Corbéis", "Cerisé", "Valframbert", "Condé-sur-Sarthe"],
    hopital: "le Centre hospitalier intercommunal Alençon-Mamers",
  },
  joigny: {
    nom: "Joigny",
    depCode: "89",
    depNom: "Yonne",
    cats: ["taxi-conventionne"],
    voisines: ["Migennes", "Saint-Julien-du-Sault", "Cézy", "Villevallier", "Brion"],
    hopital: "le Centre hospitalier de Joigny et le CH d'Auxerre",
  },
  bonifacio: {
    nom: "Bonifacio",
    depCode: "2A",
    depNom: "Corse-du-Sud",
    cats: ["taxi-conventionne"],
    voisines: ["Porto-Vecchio", "Sotta", "Figari", "Pianottoli-Caldarello", "Monacia-d'Aullène"],
    hopital: "l'hôpital de Bonifacio et le Centre hospitalier d'Ajaccio",
  },
};

type CatMeta = {
  nomSing: string;
  nomPlur: string;
  agr: string;
  autorite: string;
  artIndef: string;
  typeService: string;
};

const CAT_META: Record<string, CatMeta> = {
  ambulance: {
    nomSing: "ambulance",
    nomPlur: "ambulances",
    agr: "agréées",
    autorite: "l'Agence Régionale de Santé (ARS)",
    artIndef: "une",
    typeService: "transport en ambulance",
  },
  vsl: {
    nomSing: "VSL",
    nomPlur: "VSL",
    agr: "agréés",
    autorite: "l'Agence Régionale de Santé (ARS)",
    artIndef: "un",
    typeService: "transport en VSL",
  },
  "taxi-conventionne": {
    nomSing: "taxi conventionné",
    nomPlur: "taxis conventionnés",
    agr: "conventionnés",
    autorite: "la CPAM",
    artIndef: "un",
    typeService: "transport en taxi conventionné",
  },
};

/** Somme des codes de caractères — sélection déterministe d'un gabarit. */
function hashSlug(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i)) % 997;
  return h;
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function buildIntro(d: VilleData, cat: string, meta: CatMeta, seed: number): string[] {
  const hop = d.hopital;
  const p1Variants = [
    `À ${d.nom}, dans le département ${d.depCode} (${d.depNom}), l'annuaire RoullePro recense les ${meta.nomPlur} ${meta.agr} par ${meta.autorite}${hop ? `, qui desservent notamment ${hop}` : ` et intervenant sur le bassin de ${d.nom}`}.`,
    `Vous cherchez ${meta.artIndef} ${meta.nomSing} à ${d.nom} (${d.depCode}) ? RoullePro répertorie les ${meta.nomPlur} ${meta.agr} par ${meta.autorite} intervenant sur ${d.nom} et ses environs${hop ? `, notamment vers ${hop}` : ""}.`,
    `${d.nom} fait partie des communes du département ${d.depCode} (${d.depNom}) où RoullePro référence des ${meta.nomPlur} ${meta.agr} par ${meta.autorite}${hop ? `, pour les trajets vers ${hop} et les établissements de santé du secteur` : ""}.`,
  ];

  const p2ByCat: Record<string, string[]> = {
    ambulance: [
      `Les ambulances de ${d.nom} interviennent pour le transport allongé : sorties d'hospitalisation, transferts inter-établissements, hospitalisations programmées et interventions d'urgence régulées par le SAMU ${d.depCode} (Centre 15). L'équipage, composé d'un diplômé d'État ambulancier (DEA) et d'un auxiliaire, dispose du matériel réglementaire (oxygène, brancard, défibrillateur).`,
      `À ${d.nom}, les entreprises d'ambulances assurent les transports médicalisés allongés et participent à la garde ambulancière départementale, coordonnée par le SAMU ${d.depCode} (Centre 15) et l'ATSU du département, qui garantit une permanence des transports urgents la nuit, le week-end et les jours fériés.`,
    ],
    vsl: [
      `Le VSL (Véhicule Sanitaire Léger) transporte, en position assise, les patients dont l'état de santé est stable : séances de dialyse, cures de chimiothérapie ou de radiothérapie, consultations de suivi et examens d'imagerie. À ${d.nom}, les VSL conduits par un auxiliaire ambulancier accompagnent ces trajets itératifs${hop ? ` vers ${hop}` : ""}.`,
      `À ${d.nom}, le VSL convient aux patients assis autonomes qui n'ont pas besoin d'une surveillance médicalisée. Il se réserve sur prescription médicale et s'adapte particulièrement aux transports réguliers (dialyse, oncologie, rééducation) vers les établissements de soins du secteur.`,
    ],
    "taxi-conventionne": [
      `Le taxi conventionné de ${d.nom} est un taxi ayant signé une convention avec la CPAM ${d.depCode} : sur prescription médicale, il transporte les patients assis vers leurs soins et applique le tiers payant. Il est particulièrement adapté aux trajets itératifs (dialyse, chimiothérapie, consultations)${hop ? ` vers ${hop}` : ""}.`,
      `À ${d.nom}, les taxis conventionnés CPAM prennent en charge les patients assis sur prescription médicale, avec dispense d'avance des frais. À la différence du VSL, le taxi conventionné n'exige pas de qualification sanitaire, mais transporte lui aussi les patients remboursés par l'Assurance maladie.`,
    ],
  };

  const p3Variants = [
    `Sur prescription médicale (bon de transport CERFA 11574), le ${meta.typeService} est pris en charge par l'Assurance maladie : 100 % en cas d'ALD, d'accident du travail, de maternité ou d'hospitalisation liée, et 55 % dans les autres cas. Le tiers payant évite l'avance des frais. Comparez ci-dessous les ${meta.nomPlur} de ${d.nom} référencés, avec téléphone direct et statut de conventionnement CPAM.`,
    `Le remboursement par la Sécurité sociale s'effectue sur présentation de la prescription et de la carte Vitale : 100 % en ALD, accident du travail, maternité ou hospitalisation, 55 % dans les autres cas, avec tiers payant. Retrouvez ci-dessous les ${meta.nomPlur} de ${d.nom}, leurs coordonnées et leur conventionnement, et explorez les communes voisines du département ${d.depCode}.`,
  ];

  return [
    pick(p1Variants, seed),
    pick(p2ByCat[cat], seed + 1),
    pick(p3Variants, seed + 2),
  ];
}

function buildFaq(
  d: VilleData,
  cat: string,
  meta: CatMeta,
): { question: string; answer: string }[] {
  const voisinesNoms = d.voisines.slice(0, 3).join(", ");

  const catSpecific: Record<string, { question: string; answer: string }> = {
    ambulance: {
      question: `Comment fonctionne la garde ambulancière à ${d.nom} ?`,
      answer: `La garde ambulancière du département ${d.depCode} (${d.depNom}) est régulée par le SAMU ${d.depCode} (Centre 15) et organisée par l'ATSU départementale. Les ambulances de ${d.nom} et des communes voisines assurent à tour de rôle la permanence des transports urgents la nuit, le week-end et les jours fériés. En cas d'urgence vitale, composez le 15.`,
    },
    vsl: {
      question: `Le VSL est-il remboursé à ${d.nom} ?`,
      answer: `Oui. À ${d.nom}, le transport en VSL prescrit par un médecin est remboursé par la CPAM ${d.depCode} à 55 % du tarif conventionné, ou 100 % en cas d'ALD, maternité, accident du travail ou hospitalisation. La plupart des VSL pratiquent le tiers payant : sur présentation de la prescription et de la carte Vitale, vous n'avancez pas les frais.`,
    },
    "taxi-conventionne": {
      question: `Comment savoir si un taxi de ${d.nom} est conventionné CPAM ?`,
      answer: `Un taxi conventionné de ${d.nom} affiche un autocollant « conventionné Assurance Maladie » et figure sur la liste des taxis conventionnés de la CPAM ${d.depCode} (${d.depNom}). Sur RoullePro, chaque fiche indique le statut de conventionnement. En cas de doute, demandez au chauffeur son numéro de convention avant la course.`,
    },
  };

  const remboursement = {
    question: `Le ${meta.typeService} est-il pris en charge à ${d.nom} ?`,
    answer: `Sur prescription médicale, le ${meta.typeService} à ${d.nom} est pris en charge par l'Assurance maladie à 55 % du tarif conventionné, et à 100 % en cas d'ALD, d'accident du travail, de maternité ou d'hospitalisation. Le tiers payant s'applique aux ${meta.nomPlur} conventionnés : vous n'avancez pas la part remboursée.`,
  };

  const voisines = {
    question: `${meta.artIndef === "une" ? "Une" : "Un"} ${meta.nomSing} de ${d.nom} peut-${meta.artIndef === "une" ? "elle" : "il"} intervenir dans les communes voisines ?`,
    answer: `Oui. Les ${meta.nomPlur} de ${d.nom} interviennent au-delà de la commune, notamment vers ${voisinesNoms} et les autres communes du département ${d.depCode}. Consultez les pages des villes voisines pour comparer l'offre locale de ${meta.nomPlur}.`,
  };

  return [catSpecific[cat], remboursement, voisines];
}

/**
 * Génère le contenu éditorial d'un couple ville/catégorie à partir de VILLE_DATA.
 * Renvoie null si la ville n'est pas dans la table ou si la catégorie n'est pas
 * une catégorie cible de cette ville (pour ne cibler que les combinaisons voulues).
 */
export function buildGeneratedCityContent(
  villeSlug: string,
  categorieSlug: string,
): CityCategoryContent | null {
  const d = VILLE_DATA[villeSlug];
  if (!d) return null;
  if (!d.cats.includes(categorieSlug)) return null;
  const meta = CAT_META[categorieSlug];
  if (!meta) return null;

  const seed = hashSlug(villeSlug);
  return {
    intro: buildIntro(d, categorieSlug, meta, seed),
    voisines: d.voisines.map((nom) => ({ nom, slug: slugifyVille(nom) })),
    faq: buildFaq(d, categorieSlug, meta),
  };
}
