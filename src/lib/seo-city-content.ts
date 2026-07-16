/**
 * Contenu editorial enrichi pour les pages hub [ville]/[categorie] prioritaires
 * (mots-cles en striking distance, positions Google 11-20).
 *
 * Chaque entree apporte :
 * - une intro editoriale unique (250-400 mots) avec contexte local (hopitaux desservis,
 *   garde departementale, communes voisines) ;
 * - un bloc "villes voisines" pour le maillage interne vers les autres hubs du departement ;
 * - 2-3 questions FAQ locales injectees dans le JSON-LD FAQPage de la page.
 *
 * La cle est `${villeSlug}/${categorieSlug}` (categorieSlug : "ambulance", "vsl",
 * "taxi-conventionne"), soit le meme couple de params que la route
 * /transport-medical/[ville]/[categorie].
 */

import { buildGeneratedCityContent } from "@/lib/seo-city-data";

export type CityCategoryContent = {
  /** Paragraphes d'introduction editoriale (rendu <p>). */
  intro: string[];
  /** Communes voisines du meme departement pour le maillage interne (meme categorie). */
  voisines: { nom: string; slug: string }[];
  /** Questions/reponses locales ajoutees au FAQPage JSON-LD et affichees. */
  faq: { question: string; answer: string }[];
};

export const SEO_CITY_CONTENT: Record<string, CityCategoryContent> = {
  "nice/ambulance": {
    intro: [
      "Nice, préfecture des Alpes-Maritimes (06) et cinquième ville de France, concentre une offre dense d'entreprises d'ambulances agréées par l'ARS Provence-Alpes-Côte d'Azur. Ces sociétés assurent les transports allongés au départ et à destination des grands établissements niçois : le CHU de Nice réparti sur l'hôpital Pasteur 2 (est de la ville), l'hôpital de l'Archet 1 et 2 (ouest, maternité et oncologie), l'hôpital Saint-Roch, ainsi que les cliniques privées comme Saint-George, Les Sources ou l'Institut Arnault Tzanck à Saint-Laurent-du-Var voisin.",
      "Les ambulances niçoises interviennent pour les sorties d'hospitalisation, les transferts inter-établissements, les consultations spécialisées et les hospitalisations programmées. Elles peuvent également être engagées par le SAMU 06 (Centre 15) dans le cadre de la garde ambulancière départementale organisée par l'ATSU des Alpes-Maritimes, qui assure une permanence des transports urgents la nuit, le week-end et les jours fériés. Le relief de l'arrière-pays niçois et la densité du littoral rendent la connaissance locale des équipages particulièrement utile pour respecter les délais de prise en charge.",
      "Sur prescription médicale, le transport en ambulance est remboursé par l'Assurance maladie : 100 % en cas d'ALD, d'accident du travail ou d'hospitalisation liée, et 55 % pour les autres motifs. La plupart des ambulances de Nice pratiquent le tiers payant : vous n'avancez pas les frais sur présentation du bon de transport et de la carte Vitale. Comparez ci-dessous les entreprises référencées, avec leur téléphone direct et leur statut de conventionnement CPAM vérifié.",
    ],
    voisines: [
      { nom: "Cagnes-sur-Mer", slug: "cagnes-sur-mer" },
      { nom: "Saint-Laurent-du-Var", slug: "saint-laurent-du-var" },
      { nom: "Antibes", slug: "antibes" },
      { nom: "Cannes", slug: "cannes" },
      { nom: "Grasse", slug: "grasse" },
      { nom: "Menton", slug: "menton" },
      { nom: "Pégomas", slug: "pegomas" },
    ],
    faq: [
      {
        question: "Quels hôpitaux les ambulances de Nice desservent-elles ?",
        answer:
          "Les ambulances de Nice desservent principalement le CHU de Nice (hôpital Pasteur 2, hôpital de l'Archet 1 et 2, hôpital Saint-Roch) ainsi que les cliniques privées de l'agglomération comme Saint-George, Les Sources ou l'Institut Arnault Tzanck. Elles assurent les transferts, les sorties d'hospitalisation et les hospitalisations programmées vers ces établissements.",
      },
      {
        question: "Comment fonctionne la garde ambulancière à Nice et dans les Alpes-Maritimes ?",
        answer:
          "La garde ambulancière des Alpes-Maritimes est organisée par l'ATSU 06 sous l'autorité du SAMU 06 (Centre 15). Elle garantit une permanence des transports sanitaires urgents la nuit, les week-ends et les jours fériés. En cas d'urgence vitale, composez le 15 ; pour un transport programmé, contactez directement une ambulance de l'annuaire.",
      },
      {
        question: "Une ambulance de Nice peut-elle intervenir à Cagnes-sur-Mer ou Antibes ?",
        answer:
          "Oui. Les entreprises d'ambulances des Alpes-Maritimes interviennent au-delà de leur commune d'implantation, notamment sur l'ensemble de la métropole Nice Côte d'Azur et de l'ouest du département (Cagnes-sur-Mer, Saint-Laurent-du-Var, Antibes, Cannes). Consultez les hubs des communes voisines pour comparer l'offre locale.",
      },
    ],
  },

  "cagnes-sur-mer/ambulance": {
    intro: [
      "Cagnes-sur-Mer, troisième commune des Alpes-Maritimes (06) après Nice et Antibes, dispose de plusieurs entreprises d'ambulances agréées par l'ARS. Idéalement située entre Nice et Antibes, la ville bénéficie d'un accès rapide aux grands plateaux techniques de la Côte d'Azur : le CHU de Nice (hôpital Pasteur 2 et hôpital de l'Archet), l'Institut Arnault Tzanck de Saint-Laurent-du-Var tout proche, et la polyclinique Saint-Jean à Cagnes-sur-Mer même, spécialisée notamment en chirurgie et en soins de suite.",
      "Les ambulances cagnoises assurent les transports allongés pour les sorties d'hospitalisation, les transferts entre établissements et les consultations. Elles participent, avec les autres sociétés du secteur, à la garde ambulancière départementale coordonnée par l'ATSU des Alpes-Maritimes et le SAMU 06. La proximité immédiate de Saint-Laurent-du-Var, Villeneuve-Loubet et Vence facilite la mutualisation des moyens sur ce bassin de population dense du littoral.",
      "Le transport en ambulance prescrit par un médecin est pris en charge par la Sécurité sociale (100 % en ALD, accident du travail ou hospitalisation liée, 55 % sinon), le plus souvent en tiers payant. Retrouvez ci-dessous les ambulances de Cagnes-sur-Mer référencées, avec téléphone direct et statut de conventionnement CPAM, et comparez avec les communes voisines du département.",
    ],
    voisines: [
      { nom: "Nice", slug: "nice" },
      { nom: "Saint-Laurent-du-Var", slug: "saint-laurent-du-var" },
      { nom: "Villeneuve-Loubet", slug: "villeneuve-loubet" },
      { nom: "Antibes", slug: "antibes" },
      { nom: "Vence", slug: "vence" },
      { nom: "Cannes", slug: "cannes" },
    ],
    faq: [
      {
        question: "Quels établissements de santé desservent les ambulances de Cagnes-sur-Mer ?",
        answer:
          "Les ambulances de Cagnes-sur-Mer desservent la polyclinique Saint-Jean sur la commune, l'Institut Arnault Tzanck de Saint-Laurent-du-Var et le CHU de Nice (Pasteur 2, Archet). Elles assurent les transferts et sorties d'hospitalisation vers ces établissements du littoral azuréen.",
      },
      {
        question: "Y a-t-il une garde ambulancière à Cagnes-sur-Mer la nuit et le week-end ?",
        answer:
          "Oui, les ambulances de Cagnes-sur-Mer participent à la garde ambulancière des Alpes-Maritimes organisée par l'ATSU 06 et régulée par le SAMU 06 (Centre 15). Pour une urgence vitale, composez le 15 ; pour un transport programmé, réservez directement auprès d'une entreprise de l'annuaire.",
      },
    ],
  },

  "albi/ambulance": {
    intro: [
      "Albi, préfecture du Tarn (81) inscrite au patrimoine mondial de l'UNESCO pour sa Cité épiscopale, s'appuie sur un réseau d'ambulances agréées par l'ARS Occitanie. Ces entreprises desservent en premier lieu le Centre hospitalier d'Albi (hôpital de la Renaudié), principal établissement public du nord du département, ainsi que la clinique Toulouse-Lautrec et la Polyclinique du Sidobre pour les prises en charge privées.",
      "Les ambulances albigeoises interviennent pour les transports allongés : sorties d'hospitalisation, transferts vers le CHU de Toulouse (Purpan, Rangueil) pour les plateaux techniques spécialisés, consultations et hospitalisations programmées. Elles assurent, avec les sociétés de Castres, Gaillac et Carmaux, la garde ambulancière du Tarn organisée sous l'égide du SAMU 81 et de l'ATSU départementale, garantissant une permanence des transports urgents en dehors des heures ouvrables.",
      "Sur prescription médicale, le transport en ambulance est remboursé par l'Assurance maladie (100 % en ALD, accident du travail ou hospitalisation liée, 55 % pour les autres motifs), généralement en tiers payant. Comparez ci-dessous les ambulances d'Albi référencées, avec leur téléphone direct et leur conventionnement CPAM, et explorez les communes voisines du Tarn.",
    ],
    voisines: [
      { nom: "Castres", slug: "castres" },
      { nom: "Gaillac", slug: "gaillac" },
      { nom: "Carmaux", slug: "carmaux" },
      { nom: "Graulhet", slug: "graulhet" },
      { nom: "Lavaur", slug: "lavaur" },
      { nom: "Saint-Juéry", slug: "saint-juery" },
    ],
    faq: [
      {
        question: "Quels hôpitaux les ambulances d'Albi desservent-elles ?",
        answer:
          "Les ambulances d'Albi desservent le Centre hospitalier d'Albi (hôpital de la Renaudié), la clinique Toulouse-Lautrec et la Polyclinique du Sidobre. Elles assurent aussi les transferts vers le CHU de Toulouse (Purpan, Rangueil) pour les soins spécialisés non disponibles localement.",
      },
      {
        question: "Comment est organisée la garde ambulancière dans le Tarn ?",
        answer:
          "La garde ambulancière du Tarn est coordonnée par le SAMU 81 (Centre 15) et l'ATSU départementale. Les ambulances d'Albi, Castres, Gaillac et Carmaux assurent à tour de rôle la permanence des transports urgents la nuit, le week-end et les jours fériés.",
      },
    ],
  },

  "nimes/ambulance": {
    intro: [
      "Nîmes, préfecture du Gard (30), s'appuie sur un tissu dense d'entreprises d'ambulances agréées par l'ARS Occitanie. Elles desservent principalement le CHU de Nîmes, dont l'hôpital universitaire Carémeau constitue le grand plateau technique du département (urgences, réanimation, oncologie, maternité de niveau 3), ainsi que les cliniques privées comme la Polyclinique Kennedy, la clinique Valdegour ou la clinique du Grand Sud.",
      "Les ambulances nîmoises assurent les transports allongés : sorties d'hospitalisation, transferts inter-établissements, consultations et hospitalisations programmées. Elles peuvent être engagées par le SAMU 30 (Centre 15) dans le cadre de la garde ambulancière départementale organisée par l'ATSU du Gard, qui couvre la permanence des transports urgents hors heures ouvrables. Le bassin nîmois, très étendu entre Costières, garrigues et vallée du Rhône, rend précieuse la connaissance locale des équipages, notamment vers Alès, Bagnols-sur-Cèze ou Vauvert.",
      "Sur prescription médicale, le transport en ambulance est remboursé par l'Assurance maladie (100 % en ALD, accident du travail ou hospitalisation liée, 55 % sinon), le plus souvent en tiers payant. Retrouvez ci-dessous les ambulances de Nîmes référencées, avec téléphone direct et statut de conventionnement CPAM, et comparez avec les communes voisines du Gard.",
    ],
    voisines: [
      { nom: "Alès", slug: "ales" },
      { nom: "Bagnols-sur-Cèze", slug: "bagnols-sur-ceze" },
      { nom: "Vauvert", slug: "vauvert" },
      { nom: "Beaucaire", slug: "beaucaire" },
      { nom: "Saint-Gilles", slug: "saint-gilles" },
      { nom: "Milhaud", slug: "milhaud" },
    ],
    faq: [
      {
        question: "Quels établissements les ambulances de Nîmes desservent-elles ?",
        answer:
          "Les ambulances de Nîmes desservent en priorité le CHU de Nîmes (hôpital universitaire Carémeau) ainsi que les cliniques privées de l'agglomération : Polyclinique Kennedy, clinique Valdegour, clinique du Grand Sud. Elles assurent les transferts, sorties d'hospitalisation et consultations vers ces établissements.",
      },
      {
        question: "Comment fonctionne la garde ambulancière dans le Gard ?",
        answer:
          "La garde ambulancière du Gard est organisée par l'ATSU 30 et régulée par le SAMU 30 (Centre 15). Elle assure une permanence des transports sanitaires urgents la nuit, le week-end et les jours fériés. En cas d'urgence vitale, composez le 15 ; pour un transport programmé, contactez directement une ambulance de l'annuaire.",
      },
    ],
  },

  "pamiers/ambulance": {
    intro: [
      "Pamiers, ville la plus peuplée de l'Ariège (09), constitue un pôle de santé majeur du département grâce à la proximité immédiate du Centre hospitalier intercommunal du Val d'Ariège (CHIVA), implanté à Saint-Jean-de-Verges entre Pamiers et Foix. Les entreprises d'ambulances de Pamiers, agréées par l'ARS Occitanie, y assurent une part importante de leur activité de transport allongé.",
      "Ces ambulances interviennent pour les sorties d'hospitalisation, les transferts inter-établissements et les transports programmés, aussi bien vers le CHIVA que vers le CHU de Toulouse (Purpan, Rangueil) pour les prises en charge spécialisées, l'Ariège étant un département rural où certains plateaux techniques ne sont disponibles qu'en dehors du territoire. Les sociétés de Pamiers participent, avec celles de Foix, Saverdun et Lavelanet, à la garde ambulancière départementale coordonnée par le SAMU 09 (Centre 15) et l'ATSU de l'Ariège, essentielle sur ce territoire aux distances importantes et au relief pyrénéen marqué.",
      "Sur prescription médicale, le transport en ambulance est remboursé par l'Assurance maladie (100 % en ALD, accident du travail ou hospitalisation liée, 55 % pour les autres motifs), généralement en tiers payant. Comparez ci-dessous les ambulances de Pamiers référencées, avec leur téléphone direct et leur conventionnement CPAM, et explorez les communes voisines de l'Ariège.",
    ],
    voisines: [
      { nom: "Foix", slug: "foix" },
      { nom: "Saverdun", slug: "saverdun" },
      { nom: "Mazères", slug: "mazeres" },
      { nom: "Varilhes", slug: "varilhes" },
      { nom: "Lavelanet", slug: "lavelanet" },
      { nom: "Saint-Jean-de-Verges", slug: "saint-jean-de-verges" },
    ],
    faq: [
      {
        question: "Quel hôpital les ambulances de Pamiers desservent-elles principalement ?",
        answer:
          "Les ambulances de Pamiers desservent principalement le Centre hospitalier intercommunal du Val d'Ariège (CHIVA), situé à Saint-Jean-de-Verges entre Pamiers et Foix. Elles assurent aussi les transferts vers le CHU de Toulouse pour les soins spécialisés non disponibles dans le département.",
      },
      {
        question: "Comment est assurée la garde ambulancière en Ariège ?",
        answer:
          "La garde ambulancière de l'Ariège est régulée par le SAMU 09 (Centre 15) et organisée par l'ATSU départementale. Les ambulances de Pamiers, Foix, Saverdun et Lavelanet assurent à tour de rôle la permanence des transports urgents, indispensable sur ce territoire rural et montagneux.",
      },
    ],
  },

  "beauvais/ambulance": {
    intro: [
      "Beauvais, préfecture de l'Oise (60), s'appuie sur plusieurs entreprises d'ambulances agréées par l'ARS Hauts-de-France. Elles desservent principalement le Centre hospitalier de Beauvais, établissement de référence du nord-ouest du département (urgences, maternité, chirurgie), ainsi que le Groupe hospitalier public du Sud de l'Oise et les cliniques privées de l'agglomération beauvaisienne.",
      "Les ambulances de Beauvais assurent les transports allongés : sorties d'hospitalisation, transferts inter-établissements et hospitalisations programmées, y compris vers les CHU de Lille et Amiens ou les hôpitaux d'Île-de-France pour les plateaux techniques spécialisés, Beauvais se trouvant à la charnière entre Picardie et région parisienne. Elles participent, avec les sociétés de Compiègne, Creil et Senlis, à la garde ambulancière de l'Oise organisée par le SAMU 60 (Centre 15) et l'ATSU départementale, qui garantit une permanence des transports urgents la nuit et le week-end.",
      "Sur prescription médicale, le transport en ambulance est remboursé par l'Assurance maladie (100 % en ALD, accident du travail ou hospitalisation liée, 55 % sinon), le plus souvent en tiers payant. Retrouvez ci-dessous les ambulances de Beauvais référencées, avec téléphone direct et statut de conventionnement CPAM, et comparez avec les communes voisines de l'Oise.",
    ],
    voisines: [
      { nom: "Compiègne", slug: "compiegne" },
      { nom: "Creil", slug: "creil" },
      { nom: "Senlis", slug: "senlis" },
      { nom: "Clermont", slug: "clermont" },
      { nom: "Méru", slug: "meru" },
      { nom: "Chantilly", slug: "chantilly" },
    ],
    faq: [
      {
        question: "Quel hôpital les ambulances de Beauvais desservent-elles ?",
        answer:
          "Les ambulances de Beauvais desservent principalement le Centre hospitalier de Beauvais et les cliniques privées de l'agglomération. Elles assurent aussi les transferts vers les CHU de Lille et Amiens, ainsi que vers les hôpitaux d'Île-de-France pour les soins spécialisés.",
      },
      {
        question: "Comment fonctionne la garde ambulancière dans l'Oise ?",
        answer:
          "La garde ambulancière de l'Oise est organisée par l'ATSU 60 et régulée par le SAMU 60 (Centre 15). Les ambulances de Beauvais, Compiègne, Creil et Senlis assurent la permanence des transports urgents la nuit, le week-end et les jours fériés. En cas d'urgence vitale, composez le 15.",
      },
    ],
  },

  "vesoul/ambulance": {
    intro: [
      "Vesoul, préfecture de la Haute-Saône (70), s'appuie sur des entreprises d'ambulances agréées par l'ARS Bourgogne-Franche-Comté. Elles desservent en premier lieu le Groupe hospitalier de la Haute-Saône (GH70), dont l'hôpital de Vesoul constitue le principal site (urgences, médecine, chirurgie, maternité), ainsi que les structures de soins de suite et les EHPAD du bassin vésulien.",
      "Les ambulances de Vesoul assurent les transports allongés : sorties d'hospitalisation, transferts inter-établissements et hospitalisations programmées, y compris vers le CHU de Besançon (Jean Minjoz) pour les plateaux techniques spécialisés comme la neurochirurgie, la cardiologie interventionnelle ou l'oncologie lourde. Elles participent, avec les sociétés de Luxeuil-les-Bains, Lure et Gray, à la garde ambulancière de la Haute-Saône coordonnée par le SAMU 70 (Centre 15) et l'ATSU départementale, indispensable sur ce territoire rural aux distances importantes.",
      "Sur prescription médicale, le transport en ambulance est remboursé par l'Assurance maladie (100 % en ALD, accident du travail ou hospitalisation liée, 55 % pour les autres motifs), généralement en tiers payant. Comparez ci-dessous les ambulances de Vesoul référencées, avec leur téléphone direct et leur conventionnement CPAM, et explorez les communes voisines de la Haute-Saône.",
    ],
    voisines: [
      { nom: "Luxeuil-les-Bains", slug: "luxeuil-les-bains" },
      { nom: "Lure", slug: "lure" },
      { nom: "Gray", slug: "gray" },
      { nom: "Héricourt", slug: "hericourt" },
      { nom: "Port-sur-Saône", slug: "port-sur-saone" },
      { nom: "Saint-Rémy", slug: "saint-remy" },
    ],
    faq: [
      {
        question: "Quel hôpital les ambulances de Vesoul desservent-elles ?",
        answer:
          "Les ambulances de Vesoul desservent principalement l'hôpital de Vesoul, site majeur du Groupe hospitalier de la Haute-Saône (GH70). Elles assurent aussi les transferts vers le CHU de Besançon (Jean Minjoz) pour les soins spécialisés non disponibles dans le département.",
      },
      {
        question: "Comment est organisée la garde ambulancière en Haute-Saône ?",
        answer:
          "La garde ambulancière de la Haute-Saône est régulée par le SAMU 70 (Centre 15) et organisée par l'ATSU départementale. Les ambulances de Vesoul, Luxeuil-les-Bains, Lure et Gray assurent la permanence des transports urgents la nuit et le week-end sur ce territoire rural étendu.",
      },
    ],
  },

  "limoges/ambulance": {
    intro: [
      "Limoges, préfecture de la Haute-Vienne (87) et principale ville de l'ex-Limousin, dispose d'un réseau étoffé d'entreprises d'ambulances agréées par l'ARS Nouvelle-Aquitaine. Elles desservent en priorité le CHU de Limoges, dont l'hôpital Dupuytren constitue le grand plateau technique régional (urgences, réanimation, oncologie, transplantation, maternité de niveau 3), ainsi que l'hôpital du Cluzeau, les cliniques Chénieux et François-Chénieux, et la Polyclinique de Limoges.",
      "Les ambulances limougeaudes assurent les transports allongés : sorties d'hospitalisation, transferts inter-établissements, consultations spécialisées et hospitalisations programmées. En tant que CHU de recours pour toute l'ex-région Limousin, Limoges génère un flux important de transports depuis la Creuse et la Corrèze voisines. Les sociétés locales participent à la garde ambulancière de la Haute-Vienne, coordonnée par le SAMU 87 (Centre 15) et l'ATSU départementale, qui assure la permanence des transports urgents hors heures ouvrables.",
      "Sur prescription médicale, le transport en ambulance est remboursé par l'Assurance maladie (100 % en ALD, accident du travail ou hospitalisation liée, 55 % sinon), le plus souvent en tiers payant. Retrouvez ci-dessous les ambulances de Limoges référencées, avec téléphone direct et statut de conventionnement CPAM, et comparez avec les communes voisines de la Haute-Vienne.",
    ],
    voisines: [
      { nom: "Saint-Junien", slug: "saint-junien" },
      { nom: "Panazol", slug: "panazol" },
      { nom: "Isle", slug: "isle" },
      { nom: "Couzeix", slug: "couzeix" },
      { nom: "Aixe-sur-Vienne", slug: "aixe-sur-vienne" },
      { nom: "Feytiat", slug: "feytiat" },
    ],
    faq: [
      {
        question: "Quels établissements les ambulances de Limoges desservent-elles ?",
        answer:
          "Les ambulances de Limoges desservent principalement le CHU de Limoges (hôpital Dupuytren, hôpital du Cluzeau) ainsi que les cliniques Chénieux, François-Chénieux et la Polyclinique de Limoges. Le CHU étant l'établissement de recours de l'ex-Limousin, elles assurent aussi des transferts depuis la Creuse et la Corrèze.",
      },
      {
        question: "Comment fonctionne la garde ambulancière en Haute-Vienne ?",
        answer:
          "La garde ambulancière de la Haute-Vienne est organisée par l'ATSU 87 et régulée par le SAMU 87 (Centre 15). Les ambulances de Limoges et des communes voisines assurent la permanence des transports urgents la nuit, le week-end et les jours fériés. En cas d'urgence vitale, composez le 15.",
      },
    ],
  },

  "arras/ambulance": {
    intro: [
      "Arras, préfecture du Pas-de-Calais (62), s'appuie sur plusieurs entreprises d'ambulances agréées par l'ARS Hauts-de-France. Elles desservent principalement le Centre hospitalier d'Arras, établissement de référence du sud du département (urgences, maternité, chirurgie, cancérologie), ainsi que la Polyclinique du Bois et les cliniques privées de l'agglomération arrageoise.",
      "Les ambulances d'Arras assurent les transports allongés : sorties d'hospitalisation, transferts inter-établissements et hospitalisations programmées, y compris vers le CHU de Lille pour les plateaux techniques les plus spécialisés (neurochirurgie, chirurgie cardiaque, greffes). Elles participent, avec les sociétés de Lens, Béthune et Hénin-Beaumont, à la garde ambulancière du Pas-de-Calais organisée par le SAMU 62 (Centre 15) et l'ATSU départementale, dans un bassin de population dense hérité de l'ancien bassin minier.",
      "Sur prescription médicale, le transport en ambulance est remboursé par l'Assurance maladie (100 % en ALD, accident du travail ou hospitalisation liée, 55 % pour les autres motifs), généralement en tiers payant. Comparez ci-dessous les ambulances d'Arras référencées, avec leur téléphone direct et leur conventionnement CPAM, et explorez les communes voisines du Pas-de-Calais.",
    ],
    voisines: [
      { nom: "Lens", slug: "lens" },
      { nom: "Béthune", slug: "bethune" },
      { nom: "Hénin-Beaumont", slug: "henin-beaumont" },
      { nom: "Liévin", slug: "lievin" },
      { nom: "Saint-Laurent-Blangy", slug: "saint-laurent-blangy" },
      { nom: "Achicourt", slug: "achicourt" },
    ],
    faq: [
      {
        question: "Quel hôpital les ambulances d'Arras desservent-elles ?",
        answer:
          "Les ambulances d'Arras desservent principalement le Centre hospitalier d'Arras et la Polyclinique du Bois. Elles assurent aussi les transferts vers le CHU de Lille pour les soins les plus spécialisés (neurochirurgie, chirurgie cardiaque, greffes) non disponibles localement.",
      },
      {
        question: "Comment est organisée la garde ambulancière dans le Pas-de-Calais ?",
        answer:
          "La garde ambulancière du Pas-de-Calais est régulée par le SAMU 62 (Centre 15) et organisée par l'ATSU départementale. Les ambulances d'Arras, Lens, Béthune et Hénin-Beaumont assurent la permanence des transports urgents la nuit, le week-end et les jours fériés.",
      },
    ],
  },

  "strasbourg/taxi-conventionne": {
    intro: [
      "Strasbourg, préfecture du Bas-Rhin (67) et capitale de la région Grand Est, compte de nombreux taxis conventionnés par la CPAM du Bas-Rhin. Agréés pour le transport de patients assis autonomes sur prescription médicale, ils desservent en premier lieu les Hôpitaux universitaires de Strasbourg (HUS) : le Nouvel Hôpital Civil au centre-ville, l'hôpital de Hautepierre (urgences, oncologie, pédiatrie), ainsi que les cliniques et centres de dialyse de l'Eurométropole.",
      "Le taxi conventionné est particulièrement adapté aux trajets itératifs : séances de dialyse à l'AURAL ou au centre de néphrologie des HUS, cures de chimiothérapie ou de radiothérapie au Centre Paul Strauss, consultations de suivi et examens d'imagerie. Il applique un tarif conventionné avec la CPAM et pratique le tiers payant : sur présentation de la prescription médicale de transport et de la carte Vitale, le patient n'avance pas les frais. À la différence du VSL, le taxi conventionné n'exige pas de qualification sanitaire, mais transporte lui aussi les patients assis remboursés par l'Assurance maladie.",
      "La zone de prise en charge des taxis relève de l'autorisation de stationnement (ADS) communale et de la zone unique de prise en charge (ZUPC) de l'Eurométropole de Strasbourg. Sur prescription, le remboursement est de 100 % en ALD, accident du travail ou hospitalisation liée, et de 65 % pour les autres motifs. Retrouvez ci-dessous les taxis conventionnés de Strasbourg référencés, avec téléphone direct et statut de conventionnement CPAM, et comparez avec les communes voisines du Bas-Rhin.",
    ],
    voisines: [
      { nom: "Schiltigheim", slug: "schiltigheim" },
      { nom: "Illkirch-Graffenstaden", slug: "illkirch-graffenstaden" },
      { nom: "Haguenau", slug: "haguenau" },
      { nom: "Sélestat", slug: "selestat" },
      { nom: "Obernai", slug: "obernai" },
      { nom: "Bischheim", slug: "bischheim" },
    ],
    faq: [
      {
        question: "Quels établissements les taxis conventionnés de Strasbourg desservent-ils ?",
        answer:
          "Les taxis conventionnés de Strasbourg desservent les Hôpitaux universitaires de Strasbourg (Nouvel Hôpital Civil, hôpital de Hautepierre), le Centre Paul Strauss pour l'oncologie, ainsi que les centres de dialyse et cliniques de l'Eurométropole. Ils sont particulièrement adaptés aux trajets réguliers de dialyse, chimiothérapie ou consultations de suivi.",
      },
      {
        question: "Quelle différence entre un taxi conventionné et un VSL à Strasbourg ?",
        answer:
          "Le taxi conventionné de Strasbourg est un taxi agréé par la CPAM pour transporter des patients assis autonomes, sans qualification sanitaire. Le VSL est un véhicule sanitaire conduit par un auxiliaire ambulancier et agréé par l'ARS. Les deux sont remboursés à l'identique sur prescription ; le choix dépend de l'état du patient et de l'offre disponible.",
      },
      {
        question: "Le taxi conventionné de Strasbourg pratique-t-il le tiers payant ?",
        answer:
          "Oui. Les taxis conventionnés de Strasbourg pratiquent le tiers payant : sur présentation de la prescription médicale de transport et de la carte Vitale, le patient n'avance pas les frais sur la part prise en charge par l'Assurance maladie (100 % en ALD, 65 % pour les autres motifs).",
      },
    ],
  },
};

/**
 * Recupere le contenu editorial enrichi pour un couple ville/categorie, s'il existe.
 *
 * Priorite aux entrees redactionnelles statiques (SEO_CITY_CONTENT), puis fallback
 * sur le generateur industrialise (VILLE_DATA / buildGeneratedCityContent) qui couvre
 * les ~155 combinaisons ville×categorie prioritaires. Renvoie null si aucune des deux
 * sources ne couvre le couple demande (la page utilise alors son fallback generique).
 *
 * @param villeSlug slug de la ville (param `ville` de la route)
 * @param categorieSlug slug de la categorie (param `categorie` : "ambulance", "vsl", "taxi-conventionne")
 */
export function getCityCategoryContent(
  villeSlug: string,
  categorieSlug: string
): CityCategoryContent | null {
  return (
    SEO_CITY_CONTENT[`${villeSlug}/${categorieSlug}`] ??
    buildGeneratedCityContent(villeSlug, categorieSlug)
  );
}
