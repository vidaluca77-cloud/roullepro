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
  /**
   * Etablissements FINESS cites en toutes lettres dans `intro`, transformes en liens
   * vers /etablissements/[slug] au rendu. `nom` doit etre une sous-chaine exacte d'un
   * des paragraphes d'`intro` ; `slug` doit exister dans etablissements_sante_public.
   */
  etablissements?: { nom: string; slug: string }[];
};

/** Segment de paragraphe : texte brut, ou mention d'etablissement a lier. */
export type SegmentParagraphe = { texte: string; slug?: string };

/**
 * Decoupe un paragraphe en segments, en isolant la PREMIERE occurrence de chaque
 * etablissement pour eviter la sur-optimisation (un meme slug n'est lie qu'une fois
 * par paragraphe). Les noms les plus longs passent en premier afin qu'une mention
 * courte ("Hopital Renee Sabran") ne coupe pas la plus specifique
 * ("Hopital Renee Sabran de Giens").
 */
export function segmenterParagraphe(
  paragraphe: string,
  etablissements: { nom: string; slug: string }[] | undefined
): SegmentParagraphe[] {
  if (!etablissements || etablissements.length === 0) return [{ texte: paragraphe }];

  const tries = [...etablissements].sort((a, b) => b.nom.length - a.nom.length);
  let segments: SegmentParagraphe[] = [{ texte: paragraphe }];
  const slugsLies = new Set<string>();

  for (const { nom, slug } of tries) {
    if (!nom || slugsLies.has(slug)) continue;
    const suivants: SegmentParagraphe[] = [];
    let trouve = false;
    for (const seg of segments) {
      if (trouve || seg.slug) {
        suivants.push(seg);
        continue;
      }
      const i = seg.texte.indexOf(nom);
      if (i === -1) {
        suivants.push(seg);
        continue;
      }
      trouve = true;
      if (i > 0) suivants.push({ texte: seg.texte.slice(0, i) });
      suivants.push({ texte: nom, slug });
      const reste = seg.texte.slice(i + nom.length);
      if (reste) suivants.push({ texte: reste });
    }
    if (trouve) {
      slugsLies.add(slug);
      segments = suivants;
    }
  }

  return segments;
}

export const SEO_CITY_CONTENT: Record<string, CityCategoryContent> = {
  "nice/ambulance": {
    etablissements: [
      { nom: "hôpital Pasteur", slug: "chu-de-nice-hopital-pasteur-06" },
      { nom: "hôpital de l'Archet", slug: "chu-de-nice-hopital-de-l-archet-06" },
      { nom: "hôpital de Cimiez", slug: "chu-de-nice-hopital-de-cimiez-06" },
    ],
    intro: [
      "Le CHU de Nice se répartit sur trois implantations qui structurent l'activité de transport allongé des Alpes-Maritimes (06) : l'hôpital Pasteur, dont le bâtiment Pasteur 2 concentre les activités aiguës à l'est de la ville, l'hôpital de l'Archet (Archet 1 et 2) à l'ouest, et l'hôpital de Cimiez sur les hauteurs. Les entreprises d'ambulances agréées par l'ARS Provence-Alpes-Côte d'Azur assurent les liaisons entre ces sites ainsi que les trajets entre le domicile et l'hôpital, dans une ville dont l'étendue et le relief compliquent souvent les déplacements.",
      "L'ambulance est le seul mode permettant un transport en position allongée ou semi-assise : équipage de deux personnes dont un diplômé d'État ambulancier (DEA), brancard, oxygène et matériel de premiers secours à bord. Elle est prescrite pour les sorties de bloc ou de réanimation, les transferts d'un site du CHU vers un autre, les admissions programmées et les retours à domicile après une hospitalisation lourde. En dehors des heures ouvrables, les transports urgents relèvent de la garde ambulancière du département, régulée sous l'égide du SAMU 06 (Centre 15) ; en cas d'urgence vitale, c'est le 15 qu'il faut appeler.",
      "Le relief niçois est un paramètre concret du transport sanitaire : entre le bord de mer, les collines de Cimiez et les vallées de l'arrière-pays, la connaissance des accès pèse autant que la distance sur le délai réel. Sur prescription médicale, l'Assurance maladie rembourse 100 % du transport en affection longue durée, accident du travail ou hospitalisation liée, et 55 % pour les autres motifs, le tiers payant étant la règle chez la plupart des sociétés. Comparez ci-dessous les ambulances de Nice référencées, avec leur téléphone direct et leur conventionnement CPAM vérifié.",
    ],
    voisines: [
      { nom: "Cagnes-sur-Mer", slug: "cagnes-sur-mer" },
      { nom: "Saint-Laurent-du-Var", slug: "saint-laurent-du-var" },
      { nom: "Antibes", slug: "antibes" },
      { nom: "Villefranche-sur-Mer", slug: "villefranche-sur-mer" },
      { nom: "La Trinité", slug: "la-trinite" },
      { nom: "Saint-André-de-la-Roche", slug: "saint-andre-de-la-roche" },
    ],
    faq: [
      {
        question: "Quels hôpitaux les ambulances de Nice desservent-elles ?",
        answer:
          "Les trois sites du CHU de Nice : l'hôpital Pasteur (Pasteur 2), l'hôpital de l'Archet (Archet 1 et 2) et l'hôpital de Cimiez. Les ambulances y assurent les transferts inter-sites, les sorties d'hospitalisation, les admissions programmées et les retours à domicile en position allongée.",
      },
      {
        question: "Comment fonctionne la permanence des transports urgents à Nice ?",
        answer:
          "Elle repose sur la garde ambulancière du département, régulée sous l'égide du SAMU 06 (Centre 15), qui couvre la nuit, les week-ends et les jours fériés. En cas d'urgence vitale, composez le 15 ; pour un transport programmé, contactez directement une ambulance de l'annuaire.",
      },
      {
        question: "Une ambulance de Nice peut-elle intervenir à Cagnes-sur-Mer ou à Antibes ?",
        answer:
          "Oui. Les entreprises agréées des Alpes-Maritimes interviennent au-delà de leur commune d'implantation, notamment sur la métropole niçoise et l'ouest du département (Cagnes-sur-Mer, Saint-Laurent-du-Var, Antibes). Consultez les hubs des communes voisines pour comparer l'offre disponible localement.",
      },
    ],
  },

  "cagnes-sur-mer/ambulance": {
    etablissements: [
      { nom: "polyclinique Saint-Jean", slug: "polyclinique-saint-jean-06" },
      { nom: "hôpital de l'Archet", slug: "chu-de-nice-hopital-de-l-archet-06" },
      { nom: "hôpital Pasteur 2", slug: "chu-de-nice-hopital-pasteur-06" },
      { nom: "Institut Arnault Tzanck de Saint-Laurent-du-Var", slug: "institut-arnault-tzanck-06" },
    ],
    intro: [
      "Cagnes-sur-Mer, troisième commune des Alpes-Maritimes (06) après Nice et Antibes, dispose de plusieurs entreprises d'ambulances agréées par l'ARS. Idéalement située entre Nice et Antibes, la ville bénéficie d'un accès rapide aux grands plateaux techniques de la Côte d'Azur : le CHU de Nice (hôpital Pasteur 2 et hôpital de l'Archet), l'Institut Arnault Tzanck de Saint-Laurent-du-Var tout proche, et la polyclinique Saint-Jean à Cagnes-sur-Mer même, spécialisée notamment en chirurgie et en soins de suite.",
      "Les ambulances cagnoises assurent les transports allongés pour les sorties d'hospitalisation, les transferts entre établissements et les consultations. Elles participent, avec les autres sociétés du secteur, à la garde ambulancière départementale coordonnée sous l'égide du SAMU 06 (Centre 15). La proximité immédiate de Saint-Laurent-du-Var, Villeneuve-Loubet et Vence facilite la mutualisation des moyens sur ce bassin de population dense du littoral.",
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
          "Oui, les ambulances de Cagnes-sur-Mer participent à la garde ambulancière des Alpes-Maritimes régulée par le SAMU 06 (Centre 15). Pour une urgence vitale, composez le 15 ; pour un transport programmé, réservez directement auprès d'une entreprise de l'annuaire.",
      },
    ],
  },

  "albi/ambulance": {
    etablissements: [
      { nom: "Centre hospitalier d'Albi", slug: "centre-hospitalier-albi-81" },
      { nom: "Polyclinique du Sidobre", slug: "polyclinique-du-sidobre-81" },
    ],
    intro: [
      "Albi, préfecture du Tarn (81) inscrite au patrimoine mondial de l'UNESCO pour sa Cité épiscopale, s'appuie sur un réseau d'ambulances agréées par l'ARS Occitanie. Ces entreprises desservent en premier lieu le Centre hospitalier d'Albi (hôpital de la Renaudié), principal établissement public du nord du département, ainsi que la clinique Toulouse-Lautrec et la Polyclinique du Sidobre pour les prises en charge privées.",
      "Les ambulances albigeoises interviennent pour les transports allongés : sorties d'hospitalisation, transferts vers le CHU de Toulouse (Purpan, Rangueil) pour les plateaux techniques spécialisés, consultations et hospitalisations programmées. Elles assurent, avec les sociétés de Castres, Gaillac et Carmaux, la garde ambulancière du Tarn organisée sous l'égide du SAMU 81, garantissant une permanence des transports urgents en dehors des heures ouvrables.",
      "Prescrit par un médecin, le transport en ambulance ouvre droit à une prise en charge de l'Assurance maladie : 100 % du tarif conventionné en ALD, en accident du travail ou pour une hospitalisation liée, 55 % dans les autres situations, le plus souvent en tiers payant. Comparez ci-dessous les ambulances d'Albi référencées, avec leur téléphone direct et leur conventionnement CPAM, et explorez les communes voisines du Tarn.",
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
          "La garde ambulancière du Tarn est coordonnée par le SAMU 81 (Centre 15). Les ambulances d'Albi, Castres, Gaillac et Carmaux assurent à tour de rôle la permanence des transports urgents la nuit, le week-end et les jours fériés.",
      },
    ],
  },

  "nimes/ambulance": {
    etablissements: [
      { nom: "CHU de Nîmes", slug: "groupe-hopitalier-caremeau-chu-nimes-territoire-nimes-30" },
      { nom: "Institut de Cancérologie du Gard", slug: "kenval-institut-de-cancerologie-du-gard-30" },
    ],
    intro: [
      "Nîmes, préfecture du Gard (30), s'appuie sur un tissu dense d'entreprises d'ambulances agréées par l'ARS Occitanie. Elles convergent d'abord vers le CHU de Nîmes et son hôpital universitaire Carémeau, place du Professeur Robert-Debré, établissement de référence pour l'ensemble du département. L'Institut de Cancérologie du Gard complète cette offre pour les patients suivis en oncologie, dont les allers-retours répétés représentent une part notable de l'activité de transport allongé. Autour de la ville-centre, les communes de Marguerittes, Milhaud, Caissargues ou Rodilhan dépendent du même plateau technique, ce qui structure naturellement les tournées des équipages nîmois.",
      "Le recours à l'ambulance se justifie lorsque l'état du patient impose le transport allongé ou une surveillance pendant le trajet : sortie de bloc, retour à domicile après une hospitalisation lourde, transfert entre deux services. Le véhicule embarque brancard, oxygène et matériel de premiers secours, et son équipage comprend obligatoirement un diplômé d'État ambulancier. En dehors des heures ouvrables, les sociétés nîmoises prennent leur tour dans la garde ambulancière du département, régulée sous l'égide du SAMU 30 (Centre 15) : c'est le médecin régulateur qui engage l'ambulance de garde lorsqu'un transport urgent devient nécessaire la nuit, le week-end ou un jour férié.",
      "Étendu entre Costières, garrigues et vallée du Rhône, le bassin nîmois impose des trajets parfois longs depuis les communes périurbaines ; mieux vaut donc annoncer l'heure exacte de convocation dès la réservation. Sur prescription médicale, l'Assurance maladie rembourse le transport allongé à 100 % en cas d'affection de longue durée, d'accident du travail ou d'hospitalisation directement liée, et à 55 % pour les autres motifs. Le tiers payant est la règle chez la quasi-totalité des transporteurs : vous ne réglez rien sur présentation du bon de transport et de la carte Vitale. Comparez ci-dessous les ambulances de Nîmes référencées.",
    ],
    voisines: [
      { nom: "Marguerittes", slug: "marguerittes" },
      { nom: "Milhaud", slug: "milhaud" },
      { nom: "Rodilhan", slug: "rodilhan" },
      { nom: "Redessan", slug: "redessan" },
      { nom: "Caissargues", slug: "caissargues" },
      { nom: "Saint-Gervasy", slug: "saint-gervasy" },
    ],
    faq: [
      {
        question: "Quels établissements les ambulances de Nîmes desservent-elles ?",
        answer:
          "Elles desservent en priorité le CHU de Nîmes, dont l'hôpital universitaire Carémeau constitue le grand plateau technique du Gard, ainsi que l'Institut de Cancérologie du Gard pour les patients suivis en oncologie. Sorties d'hospitalisation, transferts entre services et hospitalisations programmées forment le cœur de leur activité.",
      },
      {
        question: "Comment est assurée la permanence des transports urgents dans le Gard ?",
        answer:
          "Hors heures ouvrables, les entreprises agréées assurent à tour de rôle la garde ambulancière du département, régulée sous l'égide du SAMU 30 (Centre 15). C'est le médecin régulateur qui déclenche l'ambulance de garde. En cas d'urgence vitale, composez le 15 ; pour un transport programmé, appelez directement une société de l'annuaire.",
      },
      {
        question: "Une ambulance de Nîmes peut-elle prendre en charge un patient dans une commune voisine ?",
        answer:
          "Oui. L'agrément couvre un secteur et non une seule commune : les ambulanciers nîmois interviennent couramment à Marguerittes, Milhaud, Caissargues, Rodilhan, Redessan ou Saint-Gervasy, dont les habitants relèvent du même bassin hospitalier. Consultez les hubs des communes voisines pour comparer l'offre locale.",
      },
    ],
  },

  "pamiers/ambulance": {
    intro: [
      "Pamiers, ville la plus peuplée de l'Ariège (09), constitue un pôle de santé majeur du département grâce à la proximité immédiate du Centre hospitalier intercommunal du Val d'Ariège (CHIVA), implanté à Saint-Jean-de-Verges entre Pamiers et Foix. Les entreprises d'ambulances de Pamiers, agréées par l'ARS Occitanie, y assurent une part importante de leur activité de transport allongé.",
      "Ces ambulances interviennent pour les sorties d'hospitalisation, les transferts inter-établissements et les transports programmés, aussi bien vers le CHIVA que vers le CHU de Toulouse (Purpan, Rangueil) pour les prises en charge spécialisées, l'Ariège étant un département rural où certains plateaux techniques ne sont disponibles qu'en dehors du territoire. Les sociétés de Pamiers participent, avec celles de Foix, Saverdun et Lavelanet, à la garde ambulancière départementale coordonnée par le SAMU 09 (Centre 15), essentielle sur ce territoire aux distances importantes et au relief pyrénéen marqué.",
      "Le remboursement suit la prescription : l'Assurance maladie couvre 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et 55 % pour les autres motifs, généralement sans avance de frais grâce au tiers payant. Comparez ci-dessous les ambulances de Pamiers référencées, avec leur téléphone direct et leur conventionnement CPAM, et explorez les communes voisines de l'Ariège.",
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
          "La garde ambulancière de l'Ariège est régulée par le SAMU 09 (Centre 15). Les ambulances de Pamiers, Foix, Saverdun et Lavelanet assurent à tour de rôle la permanence des transports urgents, indispensable sur ce territoire rural et montagneux.",
      },
    ],
  },

  "beauvais/ambulance": {
    etablissements: [
      { nom: "Centre hospitalier de Beauvais", slug: "ch-beauvais-60" },
      { nom: "CHU de Lille", slug: "centre-hospitalier-regional-universitaire-de-lille-59" },
    ],
    intro: [
      "Beauvais, préfecture de l'Oise (60), s'appuie sur plusieurs entreprises d'ambulances agréées par l'ARS Hauts-de-France. Elles desservent principalement le Centre hospitalier de Beauvais, établissement de référence du nord-ouest du département (urgences, maternité, chirurgie), ainsi que le Groupe hospitalier public du Sud de l'Oise et les cliniques privées de l'agglomération beauvaisienne.",
      "Les ambulances de Beauvais assurent les transports allongés : sorties d'hospitalisation, transferts inter-établissements et hospitalisations programmées, y compris vers les CHU de Lille et Amiens ou les hôpitaux d'Île-de-France pour les plateaux techniques spécialisés, Beauvais se trouvant à la charnière entre Picardie et région parisienne. Elles participent, avec les sociétés de Compiègne, Creil et Senlis, à la garde ambulancière de l'Oise organisée par le SAMU 60 (Centre 15), qui garantit une permanence des transports urgents la nuit et le week-end.",
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
          "La garde ambulancière de l'Oise est régulée par le SAMU 60 (Centre 15). Les ambulances de Beauvais, Compiègne, Creil et Senlis assurent la permanence des transports urgents la nuit, le week-end et les jours fériés. En cas d'urgence vitale, composez le 15.",
      },
    ],
  },

  "vesoul/ambulance": {
    etablissements: [
      { nom: "hôpital de Vesoul", slug: "gh-haute-saone-site-vesoul-70" },
      { nom: "CHU de Besançon", slug: "centre-hospitalier-universitaire-besancon-25" },
    ],
    intro: [
      "Vesoul, préfecture de la Haute-Saône (70), s'appuie sur des entreprises d'ambulances agréées par l'ARS Bourgogne-Franche-Comté. Elles desservent en premier lieu le Groupe hospitalier de la Haute-Saône (GH70), dont l'hôpital de Vesoul constitue le principal site (urgences, médecine, chirurgie, maternité), ainsi que les structures de soins de suite et les EHPAD du bassin vésulien.",
      "Les ambulances de Vesoul assurent les transports allongés : sorties d'hospitalisation, transferts inter-établissements et hospitalisations programmées, y compris vers le CHU de Besançon (Jean Minjoz) pour les plateaux techniques spécialisés comme la neurochirurgie, la cardiologie interventionnelle ou l'oncologie lourde. Elles participent, avec les sociétés de Luxeuil-les-Bains, Lure et Gray, à la garde ambulancière de la Haute-Saône coordonnée par le SAMU 70 (Centre 15), indispensable sur ce territoire rural aux distances importantes.",
      "Dès lors qu'un médecin l'a prescrit, le trajet en ambulance est pris en charge à 100 % en affection longue durée, en accident du travail ou lors d'une hospitalisation liée, et à 55 % dans les autres cas, avec tiers payant dans la plupart des entreprises. Comparez ci-dessous les ambulances de Vesoul référencées, avec leur téléphone direct et leur conventionnement CPAM, et explorez les communes voisines de la Haute-Saône.",
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
          "La garde ambulancière de la Haute-Saône est régulée par le SAMU 70 (Centre 15). Les ambulances de Vesoul, Luxeuil-les-Bains, Lure et Gray assurent la permanence des transports urgents la nuit et le week-end sur ce territoire rural étendu.",
      },
    ],
  },

  "limoges/ambulance": {
    etablissements: [
      { nom: "hôpital Dupuytren", slug: "centre-hospitalier-universitaire-dupuytren-limoges-87" },
      { nom: "CHU de Limoges", slug: "centre-hospitalier-universitaire-dupuytren-limoges-87" },
    ],
    intro: [
      "Limoges, préfecture de la Haute-Vienne (87) et principale ville de l'ex-Limousin, dispose d'un réseau étoffé d'entreprises d'ambulances agréées par l'ARS Nouvelle-Aquitaine. Elles desservent en priorité le CHU de Limoges, dont l'hôpital Dupuytren constitue le grand plateau technique régional (urgences, réanimation, oncologie, transplantation, maternité de niveau 3), ainsi que l'hôpital du Cluzeau, les cliniques Chénieux et François-Chénieux, et la Polyclinique de Limoges.",
      "Les ambulances limougeaudes assurent les transports allongés : sorties d'hospitalisation, transferts inter-établissements, consultations spécialisées et hospitalisations programmées. En tant que CHU de recours pour toute l'ex-région Limousin, Limoges génère un flux important de transports depuis la Creuse et la Corrèze voisines. Les sociétés locales participent à la garde ambulancière de la Haute-Vienne, coordonnée par le SAMU 87 (Centre 15), qui assure la permanence des transports urgents hors heures ouvrables.",
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
          "La garde ambulancière de la Haute-Vienne est régulée par le SAMU 87 (Centre 15). Les ambulances de Limoges et des communes voisines assurent la permanence des transports urgents la nuit, le week-end et les jours fériés. En cas d'urgence vitale, composez le 15.",
      },
    ],
  },

  "arras/ambulance": {
    etablissements: [
      { nom: "Centre hospitalier d'Arras", slug: "centre-hospitalier-d-arras-62" },
      { nom: "CHU de Lille", slug: "centre-hospitalier-regional-universitaire-de-lille-59" },
    ],
    intro: [
      "Arras, préfecture du Pas-de-Calais (62), s'appuie sur plusieurs entreprises d'ambulances agréées par l'ARS Hauts-de-France. Elles desservent principalement le Centre hospitalier d'Arras, établissement de référence du sud du département (urgences, maternité, chirurgie, cancérologie), ainsi que la Polyclinique du Bois et les cliniques privées de l'agglomération arrageoise.",
      "Les ambulances d'Arras assurent les transports allongés : sorties d'hospitalisation, transferts inter-établissements et hospitalisations programmées, y compris vers le CHU de Lille pour les plateaux techniques les plus spécialisés (neurochirurgie, chirurgie cardiaque, greffes). Elles participent, avec les sociétés de Lens, Béthune et Hénin-Beaumont, à la garde ambulancière du Pas-de-Calais organisée par le SAMU 62 (Centre 15), dans un bassin de population dense hérité de l'ancien bassin minier.",
      "Côté remboursement, l'Assurance maladie prend en charge le transport allongé prescrit à hauteur de 100 % en ALD, en accident du travail ou pour une hospitalisation liée, et de 55 % pour les autres motifs ; le tiers payant évite le plus souvent l'avance de frais. Comparez ci-dessous les ambulances d'Arras référencées, avec leur téléphone direct et leur conventionnement CPAM, et explorez les communes voisines du Pas-de-Calais.",
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
          "La garde ambulancière du Pas-de-Calais est régulée par le SAMU 62 (Centre 15). Les ambulances d'Arras, Lens, Béthune et Hénin-Beaumont assurent la permanence des transports urgents la nuit, le week-end et les jours fériés.",
      },
    ],
  },

  "strasbourg/taxi-conventionne": {
    etablissements: [
      { nom: "Hôpital Civil", slug: "hopital-civil-nouvel-hopital-civil-67" },
      { nom: "hôpital de Hautepierre", slug: "hopital-de-hautepierre-67" },
    ],
    intro: [
      "Strasbourg, préfecture du Bas-Rhin (67) et capitale de la région Grand Est, compte de nombreux taxis conventionnés par la CPAM du Bas-Rhin. Agréés pour le transport de patients assis autonomes sur prescription médicale, ils desservent en premier lieu les Hôpitaux universitaires de Strasbourg (HUS) : le Nouvel Hôpital Civil et l'Hôpital Civil au centre-ville, l'hôpital de Hautepierre, principal site d'urgences de l'agglomération, ainsi que la Clinique Rhéna pour les prises en charge du secteur privé.",
      "Le taxi conventionné est particulièrement adapté aux trajets itératifs : séances de dialyse, cures de chimiothérapie ou de radiothérapie, consultations de suivi et examens d'imagerie dans les services des HUS. Il applique un tarif conventionné avec la CPAM et pratique le tiers payant : sur présentation de la prescription médicale de transport et de la carte Vitale, le patient n'avance pas les frais. À la différence du VSL, il n'exige pas de qualification sanitaire de son chauffeur, mais transporte lui aussi les patients assis remboursés par l'Assurance maladie.",
      "La zone de prise en charge des taxis relève de l'autorisation de stationnement (ADS) communale et de la zone unique de prise en charge (ZUPC) de l'Eurométropole de Strasbourg. Sur prescription, le remboursement est de 100 % en affection longue durée, accident du travail ou hospitalisation liée, et de 65 % pour les autres motifs. Pour les transports urgents relevant de la garde ambulancière, c'est en revanche le SAMU 67 (Centre 15) qui régule les moyens. Retrouvez ci-dessous les taxis conventionnés de Strasbourg référencés, avec téléphone direct et statut de conventionnement CPAM.",
    ],
    voisines: [
      { nom: "Schiltigheim", slug: "schiltigheim" },
      { nom: "Illkirch-Graffenstaden", slug: "illkirch-graffenstaden" },
      { nom: "Bischheim", slug: "bischheim" },
      { nom: "Lingolsheim", slug: "lingolsheim" },
      { nom: "Ostwald", slug: "ostwald" },
      { nom: "Eckbolsheim", slug: "eckbolsheim" },
    ],
    faq: [
      {
        question: "Quels établissements les taxis conventionnés de Strasbourg desservent-ils ?",
        answer:
          "Les taxis conventionnés de Strasbourg desservent les Hôpitaux universitaires de Strasbourg — Nouvel Hôpital Civil, Hôpital Civil et hôpital de Hautepierre — ainsi que la Clinique Rhéna. Ils sont particulièrement adaptés aux trajets réguliers de dialyse, de chimiothérapie ou de consultations de suivi vers ces établissements de l'Eurométropole.",
      },
      {
        question: "Quelle différence entre un taxi conventionné et un VSL à Strasbourg ?",
        answer:
          "Le taxi conventionné de Strasbourg est un taxi agréé par la CPAM pour transporter des patients assis autonomes, sans qualification sanitaire. Le VSL est un véhicule sanitaire conduit par un auxiliaire ambulancier et agréé par l'ARS, susceptible de regrouper jusqu'à trois patients. Les deux sont remboursés à l'identique sur prescription ; le choix dépend de l'état du patient et de l'offre disponible.",
      },
      {
        question: "Le taxi conventionné de Strasbourg pratique-t-il le tiers payant ?",
        answer:
          "Oui. Les taxis conventionnés de Strasbourg pratiquent le tiers payant : sur présentation de la prescription médicale de transport et de la carte Vitale, le patient n'avance pas les frais sur la part prise en charge par l'Assurance maladie (100 % en ALD, 65 % pour les autres motifs).",
      },
    ],
  },

  "paris/ambulance": {
    etablissements: [
      { nom: "hôpital Saint-Louis", slug: "ghu-aphp-nord-universite-paris-cite-site-saint-louis-75" },
      { nom: "hôpital Cochin", slug: "ghu-aphp-centre-universite-paris-cite-site-cochin-port-royal-75" },
      { nom: "Hôtel-Dieu", slug: "ghu-aphp-centre-universite-paris-cite-site-hotel-dieu-75" },
    ],
    intro: [
      "Aucune autre ville française ne concentre autant de plateaux techniques que Paris (75) : l'AP-HP y aligne ses sites de référence, parmi lesquels l'hôpital Saint-Louis, l'Hôtel-Dieu et l'hôpital Cochin, auxquels s'ajoutent de nombreuses cliniques privées. Pour les entreprises d'ambulances agréées par l'ARS Île-de-France, cette densité se traduit par un enchaînement continu de courses : admissions programmées, sorties de chirurgie, transferts d'un site de l'AP-HP à un autre, retours à domicile après une hospitalisation lourde. Le transport allongé se pratique donc ici à grande échelle, dans un contexte de circulation et de stationnement plus contraint que partout ailleurs en France.",
      "Ce qui définit une ambulance n'est pas sa vitesse mais son armement et son équipage : deux personnes au minimum, dont un diplômé d'État ambulancier, un brancard, de l'oxygène et le matériel de premiers secours. Le médecin la prescrit lorsque la position assise est impossible ou qu'une surveillance s'impose pendant le trajet ; un patient autonome relève, lui, du transport assis. En dehors des heures ouvrables, les sociétés parisiennes peuvent être engagées au titre de la garde ambulancière du département, régulée sous l'égide du SAMU 75 (Centre 15), qui assure la permanence des transports urgents la nuit, le week-end et les jours fériés.",
      "À Paris, la connaissance du terrain pèse plus qu'ailleurs sur la ponctualité : un même trajet ne dure pas le même temps selon l'arrondissement, l'heure et l'accessibilité de l'adresse de départ. Précisez toujours le site exact de destination, l'étage et l'heure de convocation au moment de la réservation. Sur prescription médicale, l'Assurance maladie prend en charge le transport en ambulance à 100 % en affection longue durée, en accident du travail ou pour une hospitalisation directement liée, et à 55 % pour les autres motifs ; la plupart des transporteurs pratiquent le tiers payant. Comparez ci-dessous les ambulances parisiennes référencées, avec téléphone direct et conventionnement CPAM.",
    ],
    voisines: [
      { nom: "Boulogne-Billancourt", slug: "boulogne-billancourt" },
      { nom: "Saint-Denis", slug: "saint-denis" },
      { nom: "Montreuil", slug: "montreuil" },
      { nom: "Neuilly-sur-Seine", slug: "neuilly-sur-seine" },
      { nom: "Vincennes", slug: "vincennes" },
    ],
    faq: [
      {
        question: "Quels hôpitaux les ambulances de Paris desservent-elles ?",
        answer:
          "Elles desservent les établissements de l'AP-HP, dont l'hôpital Saint-Louis, l'Hôtel-Dieu et l'hôpital Cochin, ainsi que les cliniques privées de la capitale. Les transferts entre sites de l'AP-HP, les sorties d'hospitalisation et les entrées programmées constituent l'essentiel de leur activité quotidienne.",
      },
      {
        question: "Quand faut-il une ambulance plutôt qu'un taxi conventionné à Paris ?",
        answer:
          "L'ambulance s'impose lorsque le patient doit voyager allongé, nécessite une surveillance ou une aide au brancardage. Un patient autonome, capable de faire la route assis, relève du taxi conventionné ou du VSL. C'est le médecin prescripteur qui coche le mode de transport sur la prescription médicale, et ce choix conditionne le remboursement.",
      },
      {
        question: "Une ambulance parisienne est-elle remboursée par la CPAM ?",
        answer:
          "Oui, sur prescription médicale. La prise en charge est de 100 % en cas d'affection longue durée, d'accident du travail ou d'hospitalisation liée, et de 55 % pour les autres motifs. Grâce au tiers payant, pratiqué par la plupart des ambulances de Paris, vous n'avancez pas les frais sur la part remboursée.",
      },
    ],
  },

  "paris/taxi-conventionne": {
    etablissements: [
      { nom: "hôpital Saint-Louis", slug: "ghu-aphp-nord-universite-paris-cite-site-saint-louis-75" },
      { nom: "hôpital Cochin", slug: "ghu-aphp-centre-universite-paris-cite-site-cochin-port-royal-75" },
      { nom: "Hôtel-Dieu", slug: "ghu-aphp-centre-universite-paris-cite-site-hotel-dieu-75" },
    ],
    intro: [
      "Trois séances de dialyse par semaine, une série de rayons étalée sur plusieurs semaines, une cure de chimiothérapie tous les quinze jours : pour un patient parisien autonome, l'enjeu du transport sanitaire n'est pas l'urgence, c'est la régularité. Le taxi conventionné répond précisément à ce besoin, en position assise, sans brancard ni surveillance médicale, vers les sites de l'AP-HP comme l'hôpital Saint-Louis, l'Hôtel-Dieu ou l'hôpital Cochin, mais aussi vers les cabinets d'imagerie et les centres de rééducation de la capitale. C'est, à Paris (75), le mode de transport le plus fréquemment prescrit pour les traitements suivis au long cours.",
      "Un taxi conventionné parisien reste un taxi : autorisation de stationnement, compteur, plaque professionnelle. Ce qui change, c'est la convention signée avec l'Assurance maladie, qui lui impose un tarif dédié au transport de patients, distinct de la course commerciale, et l'autorise à accepter le bon de transport. Son chauffeur n'est soumis à aucune qualification sanitaire obligatoire, contrairement à l'auxiliaire ambulancier qui conduit un VSL ou au diplômé d'État ambulancier présent à bord d'une ambulance. Concrètement, le tiers payant s'applique : vous remettez la prescription médicale de transport et la carte Vitale, et vous ne réglez pas la part prise en charge.",
      "Le remboursement atteint 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et 65 % dans les autres situations, le solde relevant généralement de la mutuelle. Reste la contrainte proprement parisienne : les convocations groupées en début de matinée saturent vite les disponibilités, et dix minutes perdues dans le trafic peuvent décaler une séance entière. Réserver la veille en communiquant l'heure de convocation plutôt que l'heure de départ souhaitée, puis conserver le même transporteur sur toute une série de rendez-vous, reste la méthode la plus fiable. Les fiches ci-dessous précisent le conventionnement de chaque société.",
    ],
    voisines: [
      { nom: "Boulogne-Billancourt", slug: "boulogne-billancourt" },
      { nom: "Saint-Denis", slug: "saint-denis" },
      { nom: "Montreuil", slug: "montreuil" },
      { nom: "Neuilly-sur-Seine", slug: "neuilly-sur-seine" },
      { nom: "Vincennes", slug: "vincennes" },
    ],
    faq: [
      {
        question: "Combien coûte un taxi conventionné à Paris et que reste-t-il à ma charge ?",
        answer:
          "La course est facturée au tarif fixé par la convention CPAM, différent du tarif taxi commercial. Sur prescription, l'Assurance maladie rembourse 100 % en affection longue durée, accident du travail ou hospitalisation liée, et 65 % dans les autres cas. Avec le tiers payant, vous ne réglez rien sur la part remboursée : seules la participation forfaitaire retenue sur les transports et l'éventuel ticket modérateur non couvert par votre mutuelle restent à votre charge.",
      },
      {
        question: "Quelle différence entre un taxi conventionné et un taxi ordinaire à Paris ?",
        answer:
          "Un taxi ordinaire n'ouvre aucun droit au remboursement. Le taxi conventionné, lui, a signé une convention avec l'Assurance maladie : il applique un tarif encadré, accepte le bon de transport et pratique le tiers payant. Vérifiez systématiquement ce conventionnement avant la course ; chaque fiche de l'annuaire l'indique.",
      },
      {
        question: "Faut-il une prescription pour un taxi conventionné à Paris ?",
        answer:
          "Oui, et elle doit être établie avant le déplacement. La prescription médicale de transport, rédigée par votre médecin traitant ou hospitalier, mentionne le transport assis. Sans ce document, la course est facturée au tarif taxi ordinaire et n'est pas prise en charge par l'Assurance maladie, même si le chauffeur est conventionné.",
      },
    ],
  },

  "marseille/ambulance": {
    etablissements: [
      { nom: "hôpital de la Timone", slug: "aphm-hopital-la-timone-13" },
      { nom: "hôpital Nord", slug: "aphm-hopital-nord-13" },
      { nom: "hôpital de la Conception", slug: "aphm-hopital-de-la-conception-13" },
    ],
    intro: [
      "À Marseille (13), la carte des transports allongés se lit d'abord à travers l'AP-HM : l'hôpital de la Timone, qui abrite le SAMU 13 et son Centre 15, l'hôpital Nord, l'hôpital de la Conception et les Hôpitaux Sud, réunissant Sainte-Marguerite et Salvator. Quatre implantations, quatre bassins de recrutement, et donc un volume important de transferts d'un site à l'autre qui s'ajoute aux trajets entre le domicile et l'hôpital. Les entreprises d'ambulances agréées par l'ARS Provence-Alpes-Côte d'Azur travaillent au quotidien avec ces plateaux techniques, pour des patients dont l'état interdit la position assise.",
      "Le transport en ambulance suppose un véhicule armé — brancard, oxygène, matériel de premiers secours — et un équipage de deux personnes dont au moins un diplômé d'État ambulancier. Il couvre les sorties de réanimation ou de chirurgie, les hospitalisations programmées, les retours à domicile après un séjour lourd et les passages d'un site de l'AP-HM à un autre. Les sociétés marseillaises prennent également leur tour dans la garde ambulancière des Bouches-du-Rhône, régulée sous l'égide du SAMU 13 (Centre 15), qui garantit la disponibilité d'un moyen de transport urgent la nuit, le week-end et les jours fériés.",
      "L'étendue de la commune, de l'Estaque aux calanques, et le relief des quartiers nord pèsent réellement sur les délais annoncés : pour un transport programmé, mieux vaut retenir une société déjà implantée dans votre secteur et lui indiquer le site hospitalier précis de destination. Sur prescription médicale, l'Assurance maladie rembourse le transport allongé à 100 % en affection longue durée, en accident du travail ou pour une hospitalisation directement liée, et à 55 % pour les autres motifs, le plus souvent sans avance de frais grâce au tiers payant. Comparez ci-dessous les ambulances marseillaises référencées et leur conventionnement CPAM.",
    ],
    voisines: [
      { nom: "Aubagne", slug: "aubagne" },
      { nom: "La Ciotat", slug: "la-ciotat" },
      { nom: "Septèmes-les-Vallons", slug: "septemes-les-vallons" },
      { nom: "Allauch", slug: "allauch" },
      { nom: "Plan-de-Cuques", slug: "plan-de-cuques" },
      { nom: "Cassis", slug: "cassis" },
    ],
    faq: [
      {
        question: "Quels hôpitaux les ambulances de Marseille desservent-elles ?",
        answer:
          "Elles desservent les sites de l'AP-HM : l'hôpital de la Timone, l'hôpital Nord, l'hôpital de la Conception et les Hôpitaux Sud, qui regroupent Sainte-Marguerite et Salvator. La Timone accueille par ailleurs le SAMU 13 et son Centre 15. Les cliniques de l'agglomération sont également desservies.",
      },
      {
        question: "Comment est organisée la permanence des transports urgents à Marseille ?",
        answer:
          "La garde ambulancière des Bouches-du-Rhône est régulée sous l'égide du SAMU 13, dont le Centre 15 est installé à l'hôpital de la Timone. Les entreprises agréées assurent à tour de rôle la permanence la nuit, le week-end et les jours fériés. Pour une urgence vitale, composez le 15 ; pour un transport programmé, appelez directement une société de l'annuaire.",
      },
      {
        question: "Une ambulance marseillaise peut-elle prendre en charge un patient à Allauch ou Aubagne ?",
        answer:
          "Oui. L'agrément délivré par l'ARS ne limite pas une entreprise de transport sanitaire à sa commune d'implantation : les ambulances de Marseille interviennent couramment sur Allauch, Plan-de-Cuques, Septèmes-les-Vallons, Aubagne ou Cassis. Consultez aussi les pages de ces communes pour comparer l'offre locale et les délais annoncés.",
      },
    ],
  },

  "marseille/taxi-conventionne": {
    etablissements: [
      { nom: "hôpital Nord", slug: "aphm-hopital-nord-13" },
    ],
    intro: [
      "Le critère qui décide du mode de transport n'est pas la gravité de la maladie, mais l'autonomie du patient le jour du trajet. À Marseille (13), dès lors qu'une personne peut monter dans un véhicule ordinaire et rester assise sans surveillance, c'est le taxi conventionné que le médecin prescrit : séances de dialyse, radiothérapie, chimiothérapie, examens d'imagerie et consultations de suivi vers les sites de l'AP-HM — la Timone, l'hôpital Nord, la Conception, les Hôpitaux Sud — comme vers les cliniques de l'agglomération. Ce mode couvre ainsi la majeure partie des transports sanitaires remboursés dans la deuxième ville de France.",
      "Le conventionnement ne transforme pas un taxi en véhicule sanitaire. Le chauffeur n'a aucune qualification sanitaire obligatoire, à la différence de l'auxiliaire ambulancier qui conduit un VSL ; il aide à monter et à descendre, accompagne éventuellement jusqu'à l'accueil, mais n'assure aucun soin. Ce que la convention signée avec la CPAM des Bouches-du-Rhône apporte, c'est un tarif encadré par l'Assurance maladie, distinct du compteur habituel, l'acceptation du bon de transport et le tiers payant : sur présentation de la prescription médicale de transport et de la carte Vitale, vous n'avancez pas les frais couverts par l'Assurance maladie.",
      "Reste la question des distances. Entre un domicile des quartiers sud et l'hôpital Nord, ou l'inverse, le trajet traverse toute la ville aux heures de pointe : sur un traitement itératif, un départ mal calibré décale la séance et l'ensemble de la journée. Réserver plusieurs jours à l'avance, auprès du même transporteur, stabilise les horaires de prise en charge. La prise en charge s'élève à 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et à 65 % pour les autres motifs. Consultez ci-dessous les taxis conventionnés marseillais référencés, avec leur téléphone direct.",
    ],
    voisines: [
      { nom: "Aubagne", slug: "aubagne" },
      { nom: "La Ciotat", slug: "la-ciotat" },
      { nom: "Allauch", slug: "allauch" },
      { nom: "Plan-de-Cuques", slug: "plan-de-cuques" },
      { nom: "Septèmes-les-Vallons", slug: "septemes-les-vallons" },
      { nom: "Cassis", slug: "cassis" },
    ],
    faq: [
      {
        question: "Le taxi conventionné de Marseille pratique-t-il le tiers payant ?",
        answer:
          "Dans la très grande majorité des cas, oui. Sur présentation de la prescription médicale de transport et de la carte Vitale, vous n'avancez pas la part prise en charge par l'Assurance maladie : 100 % en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs. Vérifiez néanmoins ce point lors de la réservation.",
      },
      {
        question: "Puis-je utiliser un taxi conventionné pour des séances de dialyse à Marseille ?",
        answer:
          "Oui, c'est l'un de ses usages les plus fréquents. La dialyse relevant d'une affection longue durée, le transport est pris en charge à 100 % du tarif conventionné sur prescription médicale. Réserver l'ensemble de la série auprès de la même société facilite la régularité des horaires, séance après séance.",
      },
      {
        question: "Taxi conventionné ou VSL à Marseille : lequel choisir ?",
        answer:
          "Les deux transportent des patients assis et ouvrent les mêmes droits au remboursement. Le VSL est un véhicule agréé par l'ARS, conduit par un auxiliaire ambulancier, adapté lorsqu'un accompagnement léger est utile ; le taxi conventionné convient à un patient pleinement autonome. Le médecin prescripteur indique le mode correspondant à votre état.",
      },
    ],
  },

  "toulouse/ambulance": {
    etablissements: [
      { nom: "hôpital Purpan", slug: "hopital-purpan-chu-toulouse-31" },
      { nom: "hôpital Rangueil", slug: "hopital-de-rangueil-chu-toulouse-31" },
      { nom: "hôpital Larrey", slug: "hopital-larrey-chu-toulouse-31" },
      { nom: "Hôtel-Dieu Saint-Jacques", slug: "hotel-dieu-saint-jacques-chu-toulouse-31" },
    ],
    intro: [
      "Le CHU de Toulouse ne se visite pas d'une seule adresse : l'hôpital Purpan, l'hôpital Rangueil, l'hôpital Larrey et l'Hôtel-Dieu Saint-Jacques se répartissent les spécialités de part et d'autre de la Garonne. Pour un patient de Toulouse (31), un parcours de soins passe donc souvent par plusieurs sites, et chaque changement d'établissement peut se traduire par un transport. Les entreprises d'ambulances agréées par l'ARS Occitanie assurent ces mouvements pour les personnes qui ne peuvent pas voyager assises ou qui doivent rester sous surveillance, aux côtés des trajets domicile-hôpital et des retours après hospitalisation.",
      "Une ambulance se reconnaît à son équipage et à son armement : deux personnes au minimum, dont un diplômé d'État ambulancier, un brancard, de l'oxygène et le matériel de premiers secours. C'est le mode prescrit après une chirurgie lourde, à la sortie d'un service de soins critiques, pour un transfert entre Purpan et Rangueil ou pour une admission programmée nécessitant un brancardage. Ces mêmes sociétés toulousaines participent à la garde ambulancière de la Haute-Garonne, régulée sous l'égide du SAMU 31 (Centre 15), qui couvre les transports urgents la nuit, le week-end et les jours fériés.",
      "Établissement de recours pour tout l'ouest de l'Occitanie, le CHU attire des patients venus de départements voisins : une part notable des courses se joue donc sur des distances longues, avec des horaires de convocation à respecter au plus près. Annoncez le site exact, le service et l'heure de rendez-vous dès la réservation. Sur prescription médicale, l'Assurance maladie rembourse 100 % du transport en affection longue durée, en accident du travail ou pour une hospitalisation liée, et 55 % pour les autres motifs, généralement en tiers payant. Comparez ci-dessous les ambulances toulousaines référencées et leur conventionnement CPAM.",
    ],
    voisines: [
      { nom: "Blagnac", slug: "blagnac" },
      { nom: "Colomiers", slug: "colomiers" },
      { nom: "Balma", slug: "balma" },
      { nom: "L'Union", slug: "l-union" },
      { nom: "Tournefeuille", slug: "tournefeuille" },
      { nom: "Ramonville-Saint-Agne", slug: "ramonville-saint-agne" },
    ],
    faq: [
      {
        question: "Quels sites du CHU les ambulances de Toulouse desservent-elles ?",
        answer:
          "Elles desservent les sites du CHU de Toulouse — l'hôpital Purpan, l'hôpital Rangueil, l'hôpital Larrey et l'Hôtel-Dieu Saint-Jacques — ainsi que les cliniques de la métropole. Les transferts entre ces sites représentent une part importante de l'activité de transport allongé sur la ville.",
      },
      {
        question: "Qui compose l'équipage d'une ambulance à Toulouse ?",
        answer:
          "Une ambulance circule avec deux personnes à bord, dont au moins un diplômé d'État ambulancier. Le véhicule est agréé par l'ARS et équipé d'un brancard, d'oxygène et du matériel de premiers secours, ce qui le distingue nettement du VSL et du taxi conventionné, réservés au transport assis de patients autonomes.",
      },
      {
        question: "Une ambulance de Toulouse est-elle remboursée pour un transfert entre deux hôpitaux ?",
        answer:
          "Oui, dès lors qu'une prescription médicale de transport a été établie. Le remboursement atteint 100 % en affection longue durée, en accident du travail ou pour une hospitalisation liée, et 55 % dans les autres cas. Les transferts entre sites du CHU sont organisés par le service hospitalier, qui commande lui-même le transporteur.",
      },
    ],
  },

  "toulouse/taxi-conventionne": {
    etablissements: [
      { nom: "hôpital Purpan", slug: "hopital-purpan-chu-toulouse-31" },
      { nom: "hôpital Rangueil", slug: "hopital-de-rangueil-chu-toulouse-31" },
      { nom: "hôpital Larrey", slug: "hopital-larrey-chu-toulouse-31" },
      { nom: "Hôtel-Dieu Saint-Jacques", slug: "hotel-dieu-saint-jacques-chu-toulouse-31" },
    ],
    intro: [
      "L'agglomération toulousaine s'étire de Blagnac à Ramonville-Saint-Agne, et beaucoup de patients suivis au CHU habitent cette couronne plutôt que le centre de Toulouse (31). Pour eux, le taxi conventionné est la solution de transport assis remboursée par l'Assurance maladie : il conduit vers l'hôpital Purpan, l'hôpital Rangueil, l'hôpital Larrey ou l'Hôtel-Dieu Saint-Jacques, comme vers les centres de dialyse, d'oncologie et de rééducation de la métropole. Il s'adresse aux personnes autonomes, capables de faire le trajet assises, sans brancard, sans oxygène et sans surveillance médicale pendant le déplacement.",
      "Le mécanisme est simple à condition d'en comprendre la logique : ce n'est pas un agrément sanitaire qui rend la course remboursable, mais la convention signée avec la CPAM de la Haute-Garonne. Elle fixe un tarif dédié au transport de patients, distinct de la course libre, et autorise le chauffeur à accepter le bon de transport. Aucune qualification sanitaire n'est exigée de lui, à la différence de l'équipage d'une ambulance. En échange, le tiers payant s'applique : la prescription médicale de transport et la carte Vitale suffisent, vous n'avancez pas la part prise en charge.",
      "Sur les traitements répétés, la ponctualité vaut autant que le tarif. Un retard le matin se répercute sur toute la file d'attente d'un service de dialyse ou de radiothérapie, et la fatigue de fin de séance rend l'attente du retour particulièrement pénible : réservez à l'avance et, si possible, gardez le même transporteur du début à la fin du protocole. Le remboursement s'élève à 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et à 65 % pour les autres motifs. Retrouvez ci-dessous les taxis conventionnés toulousains référencés.",
    ],
    voisines: [
      { nom: "Blagnac", slug: "blagnac" },
      { nom: "Colomiers", slug: "colomiers" },
      { nom: "Tournefeuille", slug: "tournefeuille" },
      { nom: "Balma", slug: "balma" },
      { nom: "Ramonville-Saint-Agne", slug: "ramonville-saint-agne" },
      { nom: "L'Union", slug: "l-union" },
    ],
    faq: [
      {
        question: "Quels établissements les taxis conventionnés de Toulouse desservent-ils ?",
        answer:
          "Ils conduisent vers les sites du CHU de Toulouse — Purpan, Rangueil, Larrey, Hôtel-Dieu Saint-Jacques — ainsi que vers les centres de dialyse, d'oncologie et de rééducation de la métropole. Ils sont particulièrement adaptés aux trajets réguliers, aux examens d'imagerie et aux consultations de suivi.",
      },
      {
        question: "Le taxi conventionné est-il remboursé à 100 % à Toulouse ?",
        answer:
          "La prise en charge atteint 100 % du tarif conventionné en cas d'affection longue durée, d'accident du travail ou d'hospitalisation liée, et 65 % pour les autres motifs, la mutuelle couvrant généralement le complément. Dans tous les cas, la prescription médicale de transport est indispensable et doit précéder le déplacement.",
      },
      {
        question: "Un taxi conventionné peut-il venir me chercher à Colomiers ou à Balma ?",
        answer:
          "Oui. Les taxis conventionnés de la Haute-Garonne ne sont pas limités à leur commune de stationnement : ils desservent l'ensemble de la métropole, notamment depuis Colomiers, Balma, Blagnac, Tournefeuille ou L'Union. Indiquez le site hospitalier de destination et l'heure de convocation au moment de réserver.",
      },
    ],
  },

  "montpellier/ambulance": {
    etablissements: [
      { nom: "hôpital Lapeyronie", slug: "hopital-lapeyronie-chu-montpellier-34" },
      { nom: "hôpital Saint-Éloi", slug: "hopital-saint-eloi-chu-montpellier-34" },
      { nom: "hôpital Gui de Chauliac", slug: "hopital-gui-de-chauliac-chu-montpellier-34" },
      { nom: "hôpital Arnaud de Villeneuve", slug: "chu-montpellier-hopital-arnaud-de-villeneuve-34" },
    ],
    intro: [
      "Montpellier (34) s'organise autour d'un CHU réparti sur plusieurs sites aux vocations distinctes : l'hôpital Lapeyronie, où sont installées les urgences, l'hôpital Saint-Éloi, l'hôpital Gui de Chauliac et l'hôpital Arnaud de Villeneuve. Cette répartition a une conséquence directe sur le transport sanitaire : un même patient peut être adressé successivement à deux ou trois adresses, ce qui multiplie les transferts inter-sites. Les entreprises d'ambulances agréées par l'ARS Occitanie assurent ces liaisons ainsi que les trajets depuis le domicile, dès lors que le patient ne peut pas voyager assis ou doit rester surveillé.",
      "Le transport allongé répond à des situations précises : sortie de bloc opératoire, retour à domicile après une hospitalisation lourde, admission programmée avec brancardage, passage d'un site du CHU à un autre. Le véhicule embarque un brancard, de l'oxygène et le matériel de premiers secours, et son équipage comprend au moins un diplômé d'État ambulancier. En dehors des heures ouvrables, les sociétés montpelliéraines peuvent être appelées au titre de la garde ambulancière de l'Hérault, régulée sous l'égide du SAMU 34 (Centre 15), qui couvre la nuit, le week-end et les jours fériés.",
      "Ville-centre d'une métropole en croissance rapide, Montpellier attire les patients de tout l'est du département : les trajets ne se limitent pas à la commune et une réservation précise, avec le nom du site hospitalier et l'heure de convocation, évite bien des attentes. Sur prescription médicale, l'Assurance maladie rembourse le transport en ambulance à 100 % en affection longue durée, en accident du travail ou pour une hospitalisation directement liée, et à 55 % pour les autres motifs ; le tiers payant est la règle chez la plupart des transporteurs. Comparez ci-dessous les ambulances de Montpellier référencées.",
    ],
    voisines: [
      { nom: "Castelnau-le-Lez", slug: "castelnau-le-lez" },
      { nom: "Lattes", slug: "lattes" },
      { nom: "Pérols", slug: "perols" },
      { nom: "Juvignac", slug: "juvignac" },
      { nom: "Saint-Jean-de-Védas", slug: "saint-jean-de-vedas" },
      { nom: "Grabels", slug: "grabels" },
    ],
    faq: [
      {
        question: "Quels sites du CHU les ambulances de Montpellier desservent-elles ?",
        answer:
          "Elles desservent l'hôpital Lapeyronie, où se trouvent les urgences, l'hôpital Saint-Éloi, l'hôpital Gui de Chauliac et l'hôpital Arnaud de Villeneuve, ainsi que les cliniques de la métropole. Les transferts entre ces sites représentent une part importante de l'activité de transport allongé.",
      },
      {
        question: "Comment est assurée la permanence des transports urgents dans l'Hérault ?",
        answer:
          "La garde ambulancière de l'Hérault est régulée sous l'égide du SAMU 34 (Centre 15). Les entreprises agréées assurent à tour de rôle la permanence la nuit, le week-end et les jours fériés. En cas d'urgence vitale, composez le 15 ; pour un transport programmé, contactez directement une ambulance de l'annuaire.",
      },
      {
        question: "Faut-il une prescription pour une ambulance à Montpellier ?",
        answer:
          "Oui, sauf lorsque l'intervention est déclenchée par le Centre 15 dans un contexte d'urgence. Dans tous les autres cas, la prescription médicale de transport conditionne le remboursement : 100 % en affection longue durée, accident du travail ou hospitalisation liée, et 55 % pour les autres motifs, le plus souvent sans avance de frais.",
      },
    ],
  },

  "montpellier/taxi-conventionne": {
    intro: [
      "Pour la plupart des patients montpelliérains en traitement suivi, la question du transport se pose plusieurs fois par semaine et toujours dans les mêmes termes : arriver à l'heure, sans avance de frais. À Montpellier (34), le taxi conventionné assure ces trajets assis vers les sites du CHU — Lapeyronie, Saint-Éloi, Gui de Chauliac, Arnaud de Villeneuve — ainsi que vers les centres de dialyse, d'oncologie et de rééducation de la métropole. Il concerne les personnes autonomes, qui montent seules dans un véhicule ordinaire et n'ont besoin d'aucune surveillance médicale durant le déplacement.",
      "Un taxi conventionné est un taxi ayant passé convention avec la CPAM de l'Hérault. Cette convention encadre son tarif, différent de celui d'une course libre, et l'autorise à recevoir le bon de transport, ce qui déclenche le tiers payant sur présentation de la carte Vitale. Aucune qualification sanitaire n'est imposée à son chauffeur, contrairement au VSL confié à un auxiliaire ambulancier ou à l'ambulance dont l'équipage comprend un diplômé d'État ambulancier. Pour un transport assis, taxi conventionné et VSL ouvrent en revanche exactement les mêmes droits à la prise en charge.",
      "L'extension continue de l'agglomération vers Lattes, Pérols, Saint-Jean-de-Védas ou Juvignac a allongé les temps de trajet vers les hôpitaux du nord de la ville, et les créneaux du matin partent vite. Réserver la veille, en indiquant l'heure de convocation et le site précis, reste la meilleure protection contre un rendez-vous manqué. La prise en charge est de 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et de 65 % dans les autres cas, avec tiers payant. Retrouvez ci-dessous les taxis conventionnés montpelliérains référencés.",
    ],
    voisines: [
      { nom: "Castelnau-le-Lez", slug: "castelnau-le-lez" },
      { nom: "Lattes", slug: "lattes" },
      { nom: "Pérols", slug: "perols" },
      { nom: "Juvignac", slug: "juvignac" },
      { nom: "Saint-Jean-de-Védas", slug: "saint-jean-de-vedas" },
      { nom: "Grabels", slug: "grabels" },
    ],
    faq: [
      {
        question: "Comment réserver un taxi conventionné à Montpellier ?",
        answer:
          "Munissez-vous de votre prescription médicale de transport, puis appelez directement l'une des sociétés référencées dans l'annuaire. Pour les trajets réguliers comme la dialyse ou la radiothérapie, réservez le plus tôt possible et, si vous le pouvez, auprès du même transporteur, afin de stabiliser vos horaires de prise en charge.",
      },
      {
        question: "Quelle différence entre taxi conventionné et VSL à Montpellier ?",
        answer:
          "Le VSL est un véhicule sanitaire agréé par l'ARS, conduit par un auxiliaire ambulancier formé aux premiers secours. Le taxi conventionné est un taxi ayant signé une convention avec la CPAM, sans qualification sanitaire obligatoire pour son chauffeur. Les deux transportent des patients assis et sont remboursés dans les mêmes conditions ; le médecin indique le mode adapté à votre état.",
      },
      {
        question: "Quel est le taux de remboursement d'un taxi conventionné dans l'Hérault ?",
        answer:
          "Sur prescription médicale, l'Assurance maladie prend en charge 100 % du tarif conventionné en cas d'affection longue durée, d'accident du travail ou d'hospitalisation liée, et 65 % pour les autres motifs. Le complément est le plus souvent remboursé par la mutuelle, et le tiers payant vous dispense d'avancer les frais.",
      },
    ],
  },

  "caen/ambulance": {
    etablissements: [
      { nom: "CHU Caen Normandie", slug: "centre-hospitalier-universitaire-cote-de-nacre-14" },
    ],
    intro: [
      "Le CHU Caen Normandie, implanté avenue de la Côte de Nacre, structure à lui seul l'essentiel de l'activité de transport allongé du Calvados (14) : environ 1 516 lits, plus de 50 000 hospitalisations par an dont 20 000 passages aux urgences. Ces volumes se traduisent chaque jour par un flux continu de mouvements entre les domiciles, les services d'hospitalisation et les plateaux techniques. Les entreprises d'ambulances caennaises, agréées par l'ARS Normandie, prennent en charge ces trajets pour les patients dont l'état interdit la position assise ou impose une surveillance pendant le déplacement.",
      "Une ambulance se distingue du VSL et du taxi conventionné par son armement et son équipage : deux personnes au minimum, dont un diplômé d'État ambulancier (DEA), un brancard, de l'oxygène et le matériel de premiers secours. Elle est prescrite pour les sorties de chirurgie ou de réanimation, les admissions programmées, les transferts vers un établissement de suite et les retours à domicile après une hospitalisation lourde. Les sociétés du secteur participent par ailleurs à la garde ambulancière du département, régulée sous l'égide du SAMU 14 (Centre 15), qui couvre les transports urgents la nuit, le week-end et les jours fériés.",
      "Le CHU étant l'établissement de recours d'un large bassin normand, une part notable des courses part ou aboutit hors de la ville-centre, vers Hérouville-Saint-Clair, Ifs, Mondeville ou Fleury-sur-Orne. Sur prescription médicale, l'Assurance maladie prend en charge 100 % du transport en cas d'affection longue durée, d'accident du travail ou d'hospitalisation liée, et 55 % pour les autres motifs ; le tiers payant, pratiqué par la plupart des transporteurs, vous dispense d'avancer les frais. Comparez ci-dessous les ambulances de Caen référencées, avec leur téléphone direct et leur conventionnement CPAM vérifié.",
    ],
    voisines: [
      { nom: "Hérouville-Saint-Clair", slug: "herouville-saint-clair" },
      { nom: "Mondeville", slug: "mondeville" },
      { nom: "Ifs", slug: "ifs" },
      { nom: "Bretteville-sur-Odon", slug: "bretteville-sur-odon" },
      { nom: "Colombelles", slug: "colombelles" },
      { nom: "Fleury-sur-Orne", slug: "fleury-sur-orne" },
    ],
    faq: [
      {
        question: "Quel hôpital les ambulances de Caen desservent-elles principalement ?",
        answer:
          "Le CHU Caen Normandie, sur son site de la Côte de Nacre, concentre l'essentiel des destinations : environ 1 516 lits et plus de 50 000 hospitalisations par an, dont 20 000 passages aux urgences. Les ambulances y assurent les admissions programmées, les sorties d'hospitalisation et les transferts vers les établissements de suite.",
      },
      {
        question: "Qui assure les transports sanitaires urgents la nuit dans le Calvados ?",
        answer:
          "La permanence est assurée par la garde ambulancière du département, régulée sous l'égide du SAMU 14 (Centre 15). Les entreprises agréées se relaient la nuit, le week-end et les jours fériés. En cas d'urgence vitale, composez le 15 ; pour un transport programmé, contactez directement une société de l'annuaire.",
      },
      {
        question: "Une ambulance de Caen peut-elle venir chercher un patient à Hérouville-Saint-Clair ou à Ifs ?",
        answer:
          "Oui. Les entreprises agréées interviennent au-delà de leur commune d'implantation, sur l'ensemble de l'agglomération caennaise et du Calvados. Les communes de la première couronne comme Hérouville-Saint-Clair, Ifs, Mondeville ou Fleury-sur-Orne dépendent du même plateau technique ; consultez les hubs voisins pour comparer l'offre locale.",
      },
    ],
  },

  "caen/taxi-conventionne": {
    etablissements: [
      { nom: "hôpital Côte de Nacre", slug: "centre-hospitalier-universitaire-cote-de-nacre-14" },
      { nom: "CHU Caen Normandie", slug: "centre-hospitalier-universitaire-cote-de-nacre-14" },
    ],
    intro: [
      "Trois séances de dialyse par semaine, une radiothérapie quotidienne pendant plusieurs semaines, un suivi post-opératoire tous les quinze jours : pour ces trajets répétés vers le CHU Caen Normandie (hôpital Côte de Nacre), le taxi conventionné est le mode de transport le plus utilisé dans le Calvados (14). Il s'adresse au patient autonome, capable de monter dans le véhicule et d'effectuer le trajet assis, sans brancard ni surveillance médicale pendant la route. Un besoin d'accompagnement plus soutenu orienterait vers le VSL, et un transport allongé vers l'ambulance.",
      "Ce n'est pas un agrément sanitaire qui l'autorise à transporter des assurés, mais une convention signée avec la CPAM du Calvados. Le chauffeur n'est donc soumis à aucune qualification sanitaire obligatoire, contrairement à l'auxiliaire ambulancier qui conduit un VSL ; en contrepartie, il applique un tarif conventionné, distinct du tarif taxi habituel, et pratique le tiers payant. Sur présentation de la prescription médicale de transport et de la carte Vitale, vous ne réglez rien sur la part prise en charge par l'Assurance maladie.",
      "Le remboursement atteint 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs, le complément revenant généralement à la mutuelle. Sur l'agglomération caennaise, où les flux convergent vers le nord de la ville aux heures de consultation, réserver la veille — et si possible auprès du même chauffeur pour une série de séances — reste la meilleure garantie d'arriver à l'heure. Retrouvez ci-dessous les taxis conventionnés de Caen référencés, avec téléphone direct et statut de conventionnement.",
    ],
    voisines: [
      { nom: "Hérouville-Saint-Clair", slug: "herouville-saint-clair" },
      { nom: "Mondeville", slug: "mondeville" },
      { nom: "Ifs", slug: "ifs" },
      { nom: "Colombelles", slug: "colombelles" },
      { nom: "Bretteville-sur-Odon", slug: "bretteville-sur-odon" },
      { nom: "Fleury-sur-Orne", slug: "fleury-sur-orne" },
    ],
    faq: [
      {
        question: "Quel est le reste à charge d'un taxi conventionné à Caen ?",
        answer:
          "Le taxi conventionné applique le tarif de la convention CPAM, différent du tarif taxi classique. Sur prescription, l'Assurance maladie rembourse 100 % en affection longue durée, accident du travail ou hospitalisation liée, et 65 % dans les autres cas. Avec le tiers payant, vous ne réglez rien sur la part remboursée ; seule la participation forfaitaire par trajet et l'éventuel ticket modérateur non couvert par la mutuelle restent à votre charge.",
      },
      {
        question: "Taxi conventionné ou ambulance pour aller au CHU de Caen ?",
        answer:
          "Le taxi conventionné convient au patient autonome qui voyage assis. L'ambulance est prescrite lorsque le transport doit se faire allongé, avec brancardage ou surveillance : son remboursement suit alors un autre barème (100 % en ALD, accident du travail ou hospitalisation liée, 55 % sinon). C'est le médecin prescripteur qui coche le mode adapté à votre état.",
      },
      {
        question: "Faut-il une prescription pour un taxi conventionné à Caen ?",
        answer:
          "Oui, elle est obligatoire et doit mentionner le transport assis. Sans prescription médicale de transport, la course est facturée au tarif taxi ordinaire et n'ouvre aucun droit au remboursement. Vérifiez également le conventionnement CPAM du transporteur avant la course : l'annuaire l'indique sur chaque fiche.",
      },
    ],
  },

  "dijon/ambulance": {
    etablissements: [
      { nom: "Hôpital Privé Dijon Bourgogne", slug: "hopital-prive-dijon-bourgogne-21" },
    ],
    intro: [
      "Préfecture de la Côte-d'Or (21), Dijon dispose d'une offre hospitalière organisée autour de trois pôles distincts : le CHU Dijon Bourgogne et son hôpital François-Mitterrand, sur le site du Bocage, rue Paul Gaffarel ; le Centre Georges-François Leclerc, dédié à la cancérologie, rue du Professeur Marion ; et l'Hôpital Privé Dijon Bourgogne, à Fontaine-lès-Dijon. Les entreprises d'ambulances agréées par l'ARS Bourgogne-Franche-Comté assurent la desserte de ces trois adresses en transport allongé, pour les admissions comme pour les retours à domicile.",
      "Le CHU dijonnais réunit des urgences adultes et pédiatriques ouvertes 24 heures sur 24, une maternité de niveau 3 et un centre de traumatologie : autant d'activités qui génèrent des transferts délicats, souvent en position allongée. L'ambulance répond précisément à ce besoin, avec un équipage de deux personnes dont un diplômé d'État ambulancier (DEA), un brancard, de l'oxygène et le matériel de premiers secours à bord. La permanence des transports urgents en dehors des heures ouvrables relève de la garde ambulancière du département, régulée sous l'égide du SAMU 21 (Centre 15).",
      "Les communes de la première couronne — Chenôve, Talant, Longvic, Quetigny — n'ont pas d'établissement d'urgence propre et dépendent du plateau technique dijonnais : la connaissance des accès au site du Bocage et des zones de dépose fait gagner un temps réel avant un rendez-vous d'imagerie ou de bloc. Sur prescription médicale, le transport en ambulance est remboursé à 100 % en affection longue durée, accident du travail ou hospitalisation liée, et à 55 % pour les autres motifs, généralement en tiers payant. Comparez ci-dessous les ambulances de Dijon référencées et leur conventionnement CPAM.",
    ],
    voisines: [
      { nom: "Chenôve", slug: "chenove" },
      { nom: "Talant", slug: "talant" },
      { nom: "Fontaine-lès-Dijon", slug: "fontaine-les-dijon" },
      { nom: "Longvic", slug: "longvic" },
      { nom: "Quetigny", slug: "quetigny" },
      { nom: "Marsannay-la-Côte", slug: "marsannay-la-cote" },
    ],
    faq: [
      {
        question: "Quels établissements les ambulances de Dijon desservent-elles ?",
        answer:
          "Principalement le CHU Dijon Bourgogne (hôpital François-Mitterrand, site du Bocage), le Centre Georges-François Leclerc pour la cancérologie et l'Hôpital Privé Dijon Bourgogne à Fontaine-lès-Dijon. Les ambulances y assurent les admissions programmées, les sorties d'hospitalisation et les transferts entre établissements.",
      },
      {
        question: "Comment est organisée la permanence des transports urgents en Côte-d'Or ?",
        answer:
          "Elle repose sur la garde ambulancière du département, régulée sous l'égide du SAMU 21 (Centre 15) : les entreprises agréées se relaient la nuit, le week-end et les jours fériés. Pour une urgence vitale, appelez le 15. Pour un transport programmé, contactez directement une société de l'annuaire.",
      },
      {
        question: "Quand une ambulance est-elle nécessaire plutôt qu'un VSL à Dijon ?",
        answer:
          "L'ambulance s'impose dès que le patient doit voyager allongé ou semi-assis, être brancardé ou surveillé pendant le trajet. Un patient assis autonome ou nécessitant seulement un accompagnement léger relève du VSL ou du taxi conventionné. Le mode retenu est indiqué par le médecin sur la prescription de transport et conditionne le remboursement.",
      },
    ],
  },

  "dijon/taxi-conventionne": {
    etablissements: [
      { nom: "Hôpital Privé Dijon Bourgogne", slug: "hopital-prive-dijon-bourgogne-21" },
    ],
    intro: [
      "Tous les transports pris en charge par l'Assurance maladie ne se font pas allongé : à Dijon (21), une large part des trajets remboursés relève du transport assis, et donc du taxi conventionné. Séances de radiothérapie ou de chimiothérapie au Centre Georges-François Leclerc, consultations de suivi au CHU Dijon Bourgogne (hôpital François-Mitterrand, site du Bocage), examens à l'Hôpital Privé Dijon Bourgogne de Fontaine-lès-Dijon : le point commun de ces déplacements est un patient autonome, en état de voyager assis sans surveillance.",
      "Le taxi conventionné tire son droit au remboursement d'une convention passée avec la CPAM de la Côte-d'Or, et non d'un agrément ARS. Son chauffeur n'est pas tenu à une qualification sanitaire — c'est la différence principale avec le VSL, conduit par un auxiliaire ambulancier dans un véhicule agréé — mais il applique un tarif conventionné et accepte le bon de transport en tiers payant. Le barème de remboursement, lui, est identique pour les deux modes : 100 % en affection longue durée, accident du travail ou hospitalisation liée, 65 % dans les autres situations.",
      "Pour un protocole étalé sur plusieurs semaines, la régularité compte autant que le tarif : mieux vaut caler une série de courses avec un même transporteur que rappeler chaque matin. Les patients venus de Chenôve, Marsannay-la-Côte, Talant ou Quetigny gagnent aussi à préciser le service et le bâtiment de destination dès la réservation, le site du Bocage étant vaste. Retrouvez ci-dessous les taxis conventionnés de Dijon référencés, avec leur téléphone direct et leur statut de conventionnement CPAM vérifié.",
    ],
    voisines: [
      { nom: "Chenôve", slug: "chenove" },
      { nom: "Talant", slug: "talant" },
      { nom: "Fontaine-lès-Dijon", slug: "fontaine-les-dijon" },
      { nom: "Quetigny", slug: "quetigny" },
      { nom: "Longvic", slug: "longvic" },
      { nom: "Marsannay-la-Côte", slug: "marsannay-la-cote" },
    ],
    faq: [
      {
        question: "Le taxi conventionné de Dijon pratique-t-il le tiers payant ?",
        answer:
          "Oui. Sur présentation de la prescription médicale de transport et de la carte Vitale, vous n'avancez pas les frais sur la part prise en charge : 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs. Le complément relève généralement de votre mutuelle.",
      },
      {
        question: "Peut-on utiliser un taxi conventionné pour des séances de chimiothérapie à Dijon ?",
        answer:
          "Oui, c'est l'un de ses usages les plus fréquents, notamment vers le Centre Georges-François Leclerc. Le traitement relevant d'une affection longue durée, le transport assis est pris en charge à 100 % du tarif conventionné sur prescription. Réserver l'ensemble du protocole auprès du même transporteur stabilise les horaires.",
      },
      {
        question: "Quelle différence entre un taxi conventionné et un taxi ordinaire à Dijon ?",
        answer:
          "Un taxi ordinaire n'ouvre aucun droit au remboursement. Le taxi conventionné a signé une convention avec la CPAM de la Côte-d'Or : il applique un tarif encadré, accepte le bon de transport et pratique le tiers payant. Vérifiez toujours ce conventionnement avant la course, l'annuaire l'indique sur chaque fiche.",
      },
    ],
  },

  "amiens/ambulance": {
    intro: [
      "L'ouverture du nouveau site Sud du CHU Amiens-Picardie, rond-point Professeur Christian Cabrol, a redessiné la carte des transports sanitaires de la Somme (80) : les activités aiguës se sont regroupées au sud de la ville, tandis que le site Nord, place Victor Pauchet, et le centre Saint-Victor, orienté gériatrie et soins palliatifs, conservent leurs missions propres. Les ambulances amiénoises, agréées par l'ARS Hauts-de-France, circulent quotidiennement entre ces trois adresses pour les patients qui ne peuvent pas voyager assis.",
      "Le transport en ambulance est réservé aux situations où la position assise est impossible ou une surveillance nécessaire : sortie de bloc, transfert d'un site du CHU vers un autre, retour à domicile après une hospitalisation lourde, admission programmée. Le véhicule embarque brancard, oxygène et matériel de premiers secours, avec au moins un diplômé d'État ambulancier (DEA) dans l'équipage de deux personnes. En dehors des heures ouvrables, les transports urgents sont assurés par la garde ambulancière du département, régulée sous l'égide du SAMU 80 (Centre 15).",
      "Parce que le CHU Amiens-Picardie sert de recours à un large territoire picard, une partie des courses dépasse l'agglomération : Longueau, Camon, Rivery, Dury, Glisy ou Boves relèvent du même bassin, mais les transferts plus longs sont fréquents. Sur prescription médicale, l'Assurance maladie rembourse 100 % du transport en affection longue durée, accident du travail ou hospitalisation liée, et 55 % pour les autres motifs, la plupart des sociétés pratiquant le tiers payant. Comparez ci-dessous les ambulances d'Amiens référencées, avec téléphone direct et conventionnement vérifié.",
    ],
    voisines: [
      { nom: "Longueau", slug: "longueau" },
      { nom: "Salouël", slug: "salouel" },
      { nom: "Camon", slug: "camon" },
      { nom: "Rivery", slug: "rivery" },
      { nom: "Dury", slug: "dury" },
      { nom: "Glisy", slug: "glisy" },
      { nom: "Boves", slug: "boves" },
    ],
    faq: [
      {
        question: "Quels sites du CHU les ambulances d'Amiens desservent-elles ?",
        answer:
          "Les trois implantations du CHU Amiens-Picardie : le site Sud, rond-point Professeur Christian Cabrol, le site Nord, place Victor Pauchet, et le centre Saint-Victor, dédié à la gériatrie et aux soins palliatifs. Les transferts entre ces sites représentent une part significative de l'activité de transport allongé.",
      },
      {
        question: "Qui compose l'équipage d'une ambulance à Amiens ?",
        answer:
          "Une ambulance circule avec deux personnes à bord, dont au moins un diplômé d'État ambulancier (DEA). Le véhicule est agréé et équipé d'un brancard, d'oxygène et du matériel de premiers secours. C'est ce qui le distingue du VSL et du taxi conventionné, tous deux réservés au transport de patients assis.",
      },
      {
        question: "Comment sont assurés les transports urgents la nuit dans la Somme ?",
        answer:
          "Par la garde ambulancière du département, régulée sous l'égide du SAMU 80 (Centre 15) : les entreprises agréées se relaient la nuit, le week-end et les jours fériés. Pour une urgence vitale, composez le 15 ; pour un transport programmé, contactez directement une ambulance de l'annuaire.",
      },
    ],
  },

  "amiens/taxi-conventionne": {
    intro: [
      "À Amiens (80), un patient autonome qui doit se rendre régulièrement au CHU Amiens-Picardie n'a pas besoin d'une ambulance : le transport assis suffit, et le taxi conventionné en assure la majeure partie. Dialyse, séances de radiothérapie, bilans d'imagerie, consultations de suivi sur le site Sud comme sur le site Nord : dès lors que la prescription mentionne le transport assis, la course est prise en charge par l'Assurance maladie, sans que le patient ait à avancer les frais.",
      "Le conventionnement est le point à vérifier avant toute réservation. Un taxi ordinaire n'ouvre aucun droit au remboursement ; seul le taxi ayant signé une convention avec la CPAM de la Somme applique le tarif encadré et accepte le bon de transport. Aucune qualification sanitaire n'est exigée de son chauffeur, à la différence du VSL conduit par un auxiliaire ambulancier — la contrepartie étant que ce mode s'adresse uniquement à des patients n'ayant besoin d'aucune assistance pendant le trajet.",
      "La prise en charge s'élève à 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et à 65 % pour les autres motifs, avec tiers payant sur présentation de la carte Vitale. Depuis Salouël, Longueau, Boves ou Dury, prévoir une marge est prudent aux heures de pointe : le regroupement des activités aiguës sur le site Sud a modifié les itinéraires habituels. Consultez ci-dessous les taxis conventionnés d'Amiens référencés, avec leur téléphone direct.",
    ],
    voisines: [
      { nom: "Longueau", slug: "longueau" },
      { nom: "Salouël", slug: "salouel" },
      { nom: "Camon", slug: "camon" },
      { nom: "Rivery", slug: "rivery" },
      { nom: "Dury", slug: "dury" },
      { nom: "Glisy", slug: "glisy" },
      { nom: "Boves", slug: "boves" },
    ],
    faq: [
      {
        question: "Combien reste-t-il à ma charge pour un taxi conventionné à Amiens ?",
        answer:
          "Sur prescription, l'Assurance maladie rembourse 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % dans les autres cas. Avec le tiers payant, vous ne réglez rien sur la part remboursée ; restent la participation forfaitaire par trajet et l'éventuel ticket modérateur non couvert par votre mutuelle.",
      },
      {
        question: "Un taxi conventionné peut-il me conduire au site Nord et au site Sud du CHU ?",
        answer:
          "Oui, les deux sites du CHU Amiens-Picardie sont desservis, comme le centre Saint-Victor. Précisez le site et le service dès la réservation : les activités aiguës étant regroupées sur le site Sud, une confusion d'adresse peut coûter un rendez-vous.",
      },
    ],
  },

  "amiens/vsl": {
    intro: [
      "Le VSL — véhicule sanitaire léger — occupe une position intermédiaire dans l'offre de transport sanitaire amiénoise : comme le taxi conventionné, il transporte des patients assis ; comme l'ambulance, il relève d'un véhicule agréé par l'ARS Hauts-de-France et d'un personnel formé. À Amiens (80), il dessert les trois implantations du CHU Amiens-Picardie : le site Sud, rond-point Professeur Christian Cabrol, le site Nord, place Victor Pauchet, et le centre Saint-Victor, dédié à la gériatrie et aux soins palliatifs.",
      "Un VSL est conduit par un auxiliaire ambulancier, formé aux gestes d'urgence et à l'aide à la personne, dans un véhicule pouvant accueillir plusieurs patients assis. C'est le mode adapté lorsque le patient n'a pas besoin d'être allongé mais reste fragile : personne âgée, patient en convalescence, personne ayant besoin d'être accompagnée jusqu'au service. L'ambulance, elle, demeure réservée aux transports allongés ou nécessitant une surveillance ; le taxi conventionné, à l'inverse, suppose une autonomie complète du patient.",
      "Côté remboursement, le VSL suit exactement le même barème que le taxi conventionné : 100 % du tarif en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs, le tiers payant évitant l'avance de frais sur présentation de la prescription et de la carte Vitale. Les entreprises qui exploitent des VSL sont souvent celles qui exploitent aussi des ambulances, ce qui facilite un ajustement du mode de transport si l'état du patient évolue entre l'aller et le retour. Retrouvez ci-dessous les VSL d'Amiens référencés.",
    ],
    voisines: [
      { nom: "Longueau", slug: "longueau" },
      { nom: "Salouël", slug: "salouel" },
      { nom: "Camon", slug: "camon" },
      { nom: "Rivery", slug: "rivery" },
      { nom: "Dury", slug: "dury" },
      { nom: "Glisy", slug: "glisy" },
      { nom: "Boves", slug: "boves" },
    ],
    faq: [
      {
        question: "Quelle différence entre un VSL et une ambulance à Amiens ?",
        answer:
          "Le VSL transporte des patients assis, avec un auxiliaire ambulancier au volant d'un véhicule agréé. L'ambulance transporte des patients allongés ou semi-assis, avec un équipage de deux personnes dont un diplômé d'État ambulancier, un brancard et de l'oxygène. Le remboursement diffère aussi : 65 % hors ALD pour le VSL, 55 % hors ALD pour l'ambulance.",
      },
      {
        question: "Un VSL est-il remboursé comme un taxi conventionné ?",
        answer:
          "Oui, le barème est identique : 100 % du tarif en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs, avec tiers payant. La différence porte sur la nature du véhicule et la qualification du conducteur, non sur la prise en charge.",
      },
      {
        question: "Comment réserver un VSL à Amiens ?",
        answer:
          "Munissez-vous de la prescription médicale de transport mentionnant le transport assis, puis contactez directement l'une des sociétés référencées. Pour des séances répétées au CHU Amiens-Picardie, réservez à l'avance et auprès du même transporteur afin de stabiliser vos horaires.",
      },
    ],
  },

  "beziers/ambulance": {
    etablissements: [
      { nom: "Centre Hospitalier de Béziers", slug: "centre-hospitalier-de-beziers-34" },
    ],
    intro: [
      "Le Centre Hospitalier de Béziers, installé dans la ZAC de Montimaran, rue Valentin Haüy, est l'établissement de référence du territoire de santé Ouest-Hérault, qui dessert plus de 300 000 habitants. Cette fonction de pivot explique l'intensité de l'activité ambulancière locale : à Béziers (34), les transports allongés ne se limitent pas à la ville-centre, ils irriguent tout un secteur allant du littoral aux terres du Biterrois. Les sociétés agréées par l'ARS Occitanie en assurent la charge quotidienne.",
      "Le recours à l'ambulance suppose que l'état du patient interdise la position assise ou impose une surveillance en cours de route. Le véhicule est armé d'un brancard, d'oxygène et de matériel de premiers secours, et l'équipage compte au moins un diplômé d'État ambulancier (DEA). Sorties d'hospitalisation, transferts vers un établissement de suite ou vers un plateau technique plus spécialisé, admissions programmées : ces motifs constituent le quotidien des ambulances biterroises. La nuit, le week-end et les jours fériés, les transports urgents relèvent de la garde ambulancière du département, régulée sous l'égide du SAMU 34 (Centre 15).",
      "La géographie pèse ici plus qu'ailleurs : Villeneuve-lès-Béziers, Cers, Sauvian, Lignan-sur-Orb, Boujan-sur-Libron et Montblanc dépendent du même établissement, et la circulation estivale du littoral allonge les temps de parcours. Sur prescription médicale, le transport en ambulance est remboursé à 100 % en affection longue durée, accident du travail ou hospitalisation liée, et à 55 % dans les autres cas, la plupart des transporteurs pratiquant le tiers payant. Comparez ci-dessous les ambulances de Béziers référencées, avec leur téléphone direct et leur conventionnement CPAM.",
    ],
    voisines: [
      { nom: "Villeneuve-lès-Béziers", slug: "villeneuve-les-beziers" },
      { nom: "Boujan-sur-Libron", slug: "boujan-sur-libron" },
      { nom: "Lignan-sur-Orb", slug: "lignan-sur-orb" },
      { nom: "Cers", slug: "cers" },
      { nom: "Sauvian", slug: "sauvian" },
      { nom: "Montblanc", slug: "montblanc" },
    ],
    faq: [
      {
        question: "Quel hôpital les ambulances de Béziers desservent-elles ?",
        answer:
          "Le Centre Hospitalier de Béziers, dans la ZAC de Montimaran, rue Valentin Haüy, établissement de référence du territoire de santé Ouest-Hérault. Les ambulances y assurent les admissions programmées, les sorties d'hospitalisation et les transferts, y compris vers des plateaux techniques plus spécialisés lorsque le soin l'exige.",
      },
      {
        question: "Comment est assurée la garde ambulancière autour de Béziers ?",
        answer:
          "Par la garde ambulancière du département, régulée sous l'égide du SAMU 34 (Centre 15). Les entreprises agréées se relaient pour couvrir la nuit, le week-end et les jours fériés. Pour une urgence vitale, appelez le 15 ; pour un transport programmé, contactez directement une société de l'annuaire.",
      },
      {
        question: "Une ambulance de Béziers intervient-elle à Villeneuve-lès-Béziers ou à Sauvian ?",
        answer:
          "Oui. Les entreprises agréées desservent l'ensemble du bassin biterrois, dont Villeneuve-lès-Béziers, Sauvian, Cers, Montblanc, Boujan-sur-Libron et Lignan-sur-Orb, qui relèvent du même établissement de référence. Consultez les hubs des communes voisines pour comparer l'offre disponible localement.",
      },
    ],
  },

  "beziers/taxi-conventionne": {
    etablissements: [
      { nom: "Centre Hospitalier de Béziers", slug: "centre-hospitalier-de-beziers-34" },
    ],
    intro: [
      "Pour un traitement suivi au Centre Hospitalier de Béziers, la question n'est pas seulement de trouver un véhicule, mais de trouver un transport remboursé. À Béziers (34), le taxi conventionné répond à ce besoin pour les patients assis autonomes : il a signé une convention avec la CPAM de l'Hérault, applique un tarif encadré et accepte le bon de transport. C'est le mode le plus courant pour les séances répétées, les examens et les consultations de contrôle.",
      "Contrairement au VSL, véhicule agréé par l'ARS et conduit par un auxiliaire ambulancier, le taxi conventionné n'exige aucune qualification sanitaire de son chauffeur. Il ne remplace donc ni l'ambulance, réservée au transport allongé, ni un accompagnement médicalisé. Le remboursement, en revanche, est le même que pour un VSL : 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs, avec tiers payant sur présentation de la prescription et de la carte Vitale.",
      "Béziers étant l'hôpital de recours de tout l'Ouest-Hérault, beaucoup de courses partent des communes alentour — Villeneuve-lès-Béziers, Sauvian, Cers, Montblanc, Boujan-sur-Libron, Lignan-sur-Orb — voire de plus loin dans le département. Sur ces distances, la ponctualité dépend surtout de l'anticipation : réservez la veille, indiquez le service de destination et, pour une série de séances, confiez l'ensemble du protocole au même transporteur. Retrouvez ci-dessous les taxis conventionnés de Béziers référencés, avec téléphone direct et statut de conventionnement.",
    ],
    voisines: [
      { nom: "Villeneuve-lès-Béziers", slug: "villeneuve-les-beziers" },
      { nom: "Sauvian", slug: "sauvian" },
      { nom: "Cers", slug: "cers" },
      { nom: "Boujan-sur-Libron", slug: "boujan-sur-libron" },
      { nom: "Lignan-sur-Orb", slug: "lignan-sur-orb" },
      { nom: "Montblanc", slug: "montblanc" },
    ],
    faq: [
      {
        question: "Le taxi conventionné de Béziers pratique-t-il le tiers payant ?",
        answer:
          "Oui. Sur présentation de la prescription médicale de transport et de la carte Vitale, vous n'avancez pas les frais sur la part prise en charge : 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs.",
      },
      {
        question: "Puis-je prendre un taxi conventionné pour mes séances de dialyse à Béziers ?",
        answer:
          "Oui, à condition d'être autonome et de pouvoir effectuer le trajet assis. La dialyse relevant d'une affection longue durée, le transport est pris en charge à 100 % du tarif conventionné sur prescription. Pour une série de séances, réservez auprès du même transporteur afin de fixer des horaires réguliers.",
      },
    ],
  },

  "antibes/ambulance": {
    etablissements: [
      { nom: "Centre Hospitalier d'Antibes Juan-les-Pins", slug: "centre-hospitalier-d-antibes-juan-les-pins-06" },
    ],
    intro: [
      "Antibes (06) s'appuie sur le Centre Hospitalier d'Antibes Juan-les-Pins, avenue de Nice, membre du Groupe Hospitalier Sophia Antipolis – Vallée du Var. Cet établissement dessert un bassin qui dépasse largement la commune et englobe notamment Biot, Vallauris, Villeneuve-Loubet et Valbonne. Les entreprises d'ambulances agréées par l'ARS Provence-Alpes-Côte d'Azur assurent l'ensemble des transports allongés vers et depuis ce plateau technique, ainsi que les transferts vers un établissement plus spécialisé lorsque le soin l'exige. Leur activité suit de près le rythme des hospitalisations et des consultations programmées.",
      "Ce qui définit une ambulance, c'est son armement et son équipage : brancard, oxygène, matériel de premiers secours, deux personnes à bord dont un diplômé d'État ambulancier (DEA). Elle est prescrite quand le patient ne peut pas être transporté assis ou doit rester surveillé pendant le trajet — sortie de chirurgie, transfert inter-établissements, admission programmée, retour à domicile après une hospitalisation lourde. Hors heures ouvrables, la continuité des transports urgents est assurée par la garde ambulancière du département, régulée sous l'égide du SAMU 06 (Centre 15).",
      "Sur le littoral antibois, les délais dépendent moins de la distance que de la circulation : entre le Cap d'Antibes, Juan-les-Pins et les axes vers Cagnes-sur-Mer, un transport programmé se prépare à l'avance. Le remboursement, sur prescription médicale, atteint 100 % en affection longue durée, accident du travail ou hospitalisation liée, et 55 % pour les autres motifs ; le tiers payant dispense d'avancer les frais sur la part prise en charge. Comparez ci-dessous les ambulances d'Antibes référencées, avec leur téléphone direct et leur conventionnement CPAM vérifié.",
    ],
    voisines: [
      { nom: "Biot", slug: "biot" },
      { nom: "Vallauris", slug: "vallauris" },
      { nom: "Villeneuve-Loubet", slug: "villeneuve-loubet" },
      { nom: "Cagnes-sur-Mer", slug: "cagnes-sur-mer" },
      { nom: "Valbonne", slug: "valbonne" },
    ],
    faq: [
      {
        question: "Quel hôpital les ambulances d'Antibes desservent-elles ?",
        answer:
          "Le Centre Hospitalier d'Antibes Juan-les-Pins, avenue de Nice, membre du Groupe Hospitalier Sophia Antipolis – Vallée du Var. Il dessert également Biot, Vallauris, Villeneuve-Loubet et Valbonne, ce qui explique la part importante de courses effectuées hors de la commune d'Antibes elle-même.",
      },
      {
        question: "Qui organise les transports sanitaires urgents la nuit à Antibes ?",
        answer:
          "La garde ambulancière du département assure la permanence, régulée sous l'égide du SAMU 06 (Centre 15), la nuit, le week-end et les jours fériés. En cas d'urgence vitale, composez le 15. Pour un transport programmé, contactez directement une entreprise de l'annuaire.",
      },
      {
        question: "Ambulance ou taxi conventionné à Antibes : comment choisir ?",
        answer:
          "L'ambulance est nécessaire si le patient doit voyager allongé, être brancardé ou surveillé : elle est remboursée à 100 % en ALD, accident du travail ou hospitalisation liée, et 55 % sinon. Un patient autonome capable de voyager assis relève du taxi conventionné ou du VSL, remboursés à 100 % en ALD et 65 % sinon. Le médecin prescripteur tranche sur la prescription de transport.",
      },
    ],
  },

  "antibes/taxi-conventionne": {
    etablissements: [
      { nom: "Centre Hospitalier d'Antibes Juan-les-Pins", slug: "centre-hospitalier-d-antibes-juan-les-pins-06" },
    ],
    intro: [
      "Le taxi conventionné antibois transporte des patients assis, autonomes, sur prescription médicale — et rien d'autre. C'est cette définition simple qui en fait le mode dominant pour les trajets répétés vers le Centre Hospitalier d'Antibes Juan-les-Pins : séances de dialyse, radiothérapie, rééducation, consultations de suivi et examens d'imagerie. Le patient monte et descend seul du véhicule, éventuellement avec une aide légère ; dès qu'un brancardage ou une surveillance devient nécessaire, c'est une ambulance que le médecin prescrira.",
      "Le droit au remboursement vient d'une convention signée avec la CPAM des Alpes-Maritimes, non d'un agrément sanitaire : le chauffeur d'un taxi conventionné n'a aucune obligation de qualification sanitaire, contrairement à l'auxiliaire ambulancier qui conduit un VSL. Il applique en revanche un tarif conventionné, distinct du compteur habituel, et pratique le tiers payant. La prise en charge atteint 100 % en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs, la mutuelle couvrant le plus souvent le complément.",
      "Antibes, Biot, Vallauris, Villeneuve-Loubet et Valbonne partagent le même établissement de référence, et les demandes se concentrent sur les créneaux du matin. Réserver la veille, préciser le service de destination et regrouper les courses d'un même protocole chez un seul transporteur sont les trois réflexes qui limitent les retards. N'oubliez pas la prescription médicale de transport mentionnant le transport assis : sans elle, la course est facturée au tarif taxi ordinaire et n'est pas remboursée. Retrouvez ci-dessous les taxis conventionnés d'Antibes référencés.",
    ],
    voisines: [
      { nom: "Biot", slug: "biot" },
      { nom: "Vallauris", slug: "vallauris" },
      { nom: "Villeneuve-Loubet", slug: "villeneuve-loubet" },
      { nom: "Valbonne", slug: "valbonne" },
      { nom: "Cagnes-sur-Mer", slug: "cagnes-sur-mer" },
    ],
    faq: [
      {
        question: "Quelle différence entre taxi conventionné et VSL à Antibes ?",
        answer:
          "Le VSL est un véhicule sanitaire agréé par l'ARS, conduit par un auxiliaire ambulancier formé aux premiers secours et à l'aide à la personne. Le taxi conventionné est un taxi agréé par la CPAM, sans qualification sanitaire obligatoire. Tous deux transportent des patients assis et sont remboursés à l'identique : 100 % en ALD, 65 % pour les autres motifs.",
      },
      {
        question: "Comment réserver un taxi conventionné à Antibes ?",
        answer:
          "Munissez-vous de votre prescription médicale de transport, puis appelez directement l'une des sociétés référencées. Précisez le service du Centre Hospitalier d'Antibes Juan-les-Pins où vous êtes attendu et l'heure du rendez-vous. Pour un protocole récurrent, réservez la série complète auprès du même transporteur.",
      },
    ],
  },

  "nice/taxi-conventionne": {
    etablissements: [
      { nom: "hôpital Pasteur", slug: "chu-de-nice-hopital-pasteur-06" },
      { nom: "hôpital de l'Archet", slug: "chu-de-nice-hopital-de-l-archet-06" },
      { nom: "hôpital de Cimiez", slug: "chu-de-nice-hopital-de-cimiez-06" },
    ],
    intro: [
      "Cinquième ville de France, Nice (06) génère un volume considérable de transports assis remboursés vers les trois sites de son CHU : l'hôpital Pasteur (Pasteur 2), l'hôpital de l'Archet (Archet 1 et 2) et l'hôpital de Cimiez. Dialyse, chimiothérapie, radiothérapie, rééducation, consultations de suivi : ces rendez-vous reviennent souvent plusieurs fois par semaine, et c'est précisément là que le taxi conventionné trouve son utilité. Il s'adresse aux patients capables d'effectuer le trajet assis, sans surveillance médicale.",
      "Un taxi conventionné niçois est un taxi titulaire d'une autorisation de stationnement qui a en outre signé une convention avec la CPAM des Alpes-Maritimes. Cette convention, et non un agrément ARS, ouvre le droit au remboursement : le chauffeur n'est soumis à aucune qualification sanitaire obligatoire, à la différence de l'auxiliaire ambulancier qui conduit un VSL. Le tarif appliqué est celui de la convention et non celui du compteur ordinaire, et le tiers payant joue sur présentation du bon de transport et de la carte Vitale.",
      "Entre Pasteur, à l'est de la ville, et l'Archet, à l'ouest, les temps de parcours varient fortement selon l'heure : indiquer le site exact et le service dès la réservation évite bien des malentendus, d'autant que Cimiez se situe sur les hauteurs. Le remboursement s'élève à 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et à 65 % pour les autres motifs. Une prescription médicale mentionnant le transport assis reste indispensable. Consultez ci-dessous les taxis conventionnés de Nice référencés.",
    ],
    voisines: [
      { nom: "Cagnes-sur-Mer", slug: "cagnes-sur-mer" },
      { nom: "Saint-Laurent-du-Var", slug: "saint-laurent-du-var" },
      { nom: "Antibes", slug: "antibes" },
      { nom: "Villefranche-sur-Mer", slug: "villefranche-sur-mer" },
      { nom: "La Trinité", slug: "la-trinite" },
      { nom: "Saint-André-de-la-Roche", slug: "saint-andre-de-la-roche" },
    ],
    faq: [
      {
        question: "Quels établissements les taxis conventionnés de Nice desservent-ils ?",
        answer:
          "Principalement les trois sites du CHU de Nice : l'hôpital Pasteur (Pasteur 2), l'hôpital de l'Archet (Archet 1 et 2) et l'hôpital de Cimiez. Ils sont particulièrement adaptés aux trajets réguliers de dialyse, de chimiothérapie ou de radiothérapie et aux consultations de suivi.",
      },
      {
        question: "Le taxi conventionné est-il remboursé à 100 % à Nice ?",
        answer:
          "À 100 % du tarif conventionné en cas d'affection longue durée, d'accident du travail ou d'hospitalisation liée, et à 65 % pour les autres motifs, le complément relevant généralement de la mutuelle. Le tiers payant vous évite d'avancer les frais sur la part prise en charge.",
      },
      {
        question: "Puis-je réserver un taxi conventionné niçois depuis Cagnes-sur-Mer ou Saint-Laurent-du-Var ?",
        answer:
          "Oui. Les transporteurs de la métropole desservent les communes voisines comme Cagnes-sur-Mer, Saint-Laurent-du-Var, La Trinité ou Saint-André-de-la-Roche, dont les patients se rendent aux mêmes sites hospitaliers. Consultez également les hubs de ces communes pour comparer l'offre locale.",
      },
    ],
  },

  "reims/ambulance": {
    etablissements: [
      { nom: "hôpital Maison Blanche", slug: "hopital-maison-blanche-chu-reims-51" },
      { nom: "hôpital Robert-Debré", slug: "hopital-robert-debre-chu-reims-51" },
    ],
    intro: [
      "Le CHU de Reims ne tient pas sur une seule adresse : l'hôpital Robert-Debré, rue du Général Koenig, concentre l'essentiel des lits avec 575 places, l'hôpital Maison Blanche, rue Cognacq-Jay, réunit 465 places et les urgences adultes, tandis que le site Sébastopol complète l'ensemble. S'y ajoutent l'American Memorial Hospital pour la pédiatrie et l'Institut Godinot pour la cancérologie. Cette dispersion des plateaux techniques sur le territoire rémois génère un flux quotidien de transferts que les entreprises d'ambulances de la Marne, agréées par l'ARS Grand Est, assurent en position allongée ou semi-assise.",
      "Une ambulance rémoise se distingue du transport assis par son équipage et son armement : deux personnes au minimum, dont un diplômé d'État ambulancier, un brancard, de l'oxygène et le matériel de premiers secours. C'est le mode prescrit lorsque l'état du patient interdit la position assise ou impose une surveillance pendant le trajet — sortie de réanimation, retour à domicile après une chirurgie lourde, passage d'un site du CHU à un autre. En dehors des heures ouvrables, ces mêmes sociétés peuvent être engagées au titre de la garde ambulancière du département, régulée sous l'égide du SAMU 51 (Centre 15).",
      "Reims joue un rôle de recours pour un large bassin de population du Grand Est, ce qui allonge certains trajets bien au-delà de la couronne rémoise. Mieux vaut donc annoncer précisément le site de destination et l'heure de convocation lors de la réservation. Sur prescription médicale, l'Assurance maladie prend en charge le transport allongé à 100 % en affection longue durée, accident du travail ou hospitalisation directement liée, et à 55 % pour les autres motifs, la plupart des transporteurs pratiquant le tiers payant. Les fiches ci-dessous indiquent, pour chaque société rémoise recensée, un téléphone joignable directement et l'état du conventionnement CPAM.",
    ],
    voisines: [
      { nom: "Tinqueux", slug: "tinqueux" },
      { nom: "Bezannes", slug: "bezannes" },
      { nom: "Cormontreuil", slug: "cormontreuil" },
      { nom: "Bétheny", slug: "betheny" },
      { nom: "Cernay-lès-Reims", slug: "cernay-les-reims" },
      { nom: "Saint-Brice-Courcelles", slug: "saint-brice-courcelles" },
    ],
    faq: [
      {
        question: "Quels établissements de santé les ambulances de Reims desservent-elles ?",
        answer:
          "Elles desservent les sites du CHU de Reims — l'hôpital Robert-Debré, l'hôpital Maison Blanche où se trouvent les urgences adultes, et le site Sébastopol — ainsi que l'American Memorial Hospital pour la pédiatrie et l'Institut Godinot pour la cancérologie. Les transferts entre ces sites représentent une part notable de l'activité de transport allongé sur la ville.",
      },
      {
        question: "Comment obtenir une ambulance à Reims la nuit ou le week-end ?",
        answer:
          "Pour une urgence vitale, composez toujours le 15 : le SAMU 51 régule les moyens et engage, si nécessaire, une ambulance de la garde ambulancière du département assurée à tour de rôle par les sociétés agréées. Pour un transport programmé, y compris un retour à domicile un samedi, contactez directement l'un des transporteurs de l'annuaire, en réservant si possible la veille.",
      },
      {
        question: "Une ambulance de Reims peut-elle intervenir à Tinqueux ou Cormontreuil ?",
        answer:
          "Oui. L'agrément ARS d'une entreprise de transport sanitaire n'est pas limité à sa commune d'implantation : les ambulances rémoises interviennent couramment sur Tinqueux, Bezannes, Cormontreuil, Bétheny ou Saint-Brice-Courcelles. Consultez également les pages des communes voisines pour comparer l'offre locale et les délais annoncés.",
      },
    ],
  },

  "reims/taxi-conventionne": {
    intro: [
      "Beaucoup de patients rémois n'ont pas besoin d'un brancard, mais d'un trajet fiable, répété plusieurs fois par semaine : dialyse, séances de radiothérapie, chimiothérapie à l'Institut Godinot, consultations de suivi ou examens d'imagerie au CHU de Reims. C'est exactement le terrain du taxi conventionné, réservé aux personnes autonomes capables de faire la route assises, sans surveillance médicale. Le chauffeur les aide à monter et à descendre du véhicule, accompagne éventuellement jusqu'à l'accueil, mais n'exerce pas de mission de soins.",
      "Ce qui rend un taxi rémois remboursable n'est pas un agrément sanitaire, mais la convention signée avec la CPAM de la Marne. Le tarif appliqué découle de cette convention et diffère de la course libre au compteur ; en contrepartie, le tiers payant s'applique. Sur présentation de la prescription médicale de transport mentionnant le transport assis et de la carte Vitale, vous ne réglez pas la part prise en charge par l'Assurance maladie : 100 % en affection longue durée, accident du travail ou hospitalisation liée, 65 % dans les autres situations, le solde relevant le plus souvent de la mutuelle.",
      "Sur un traitement itératif, la régularité compte autant que le prix. Travailler avec le même transporteur d'une séance à l'autre stabilise les horaires de prise en charge et évite les attentes en fin de traitement, quand la fatigue est la plus forte. Les convocations matinales au CHU, groupées aux mêmes créneaux, saturent vite les disponibilités : réserver plusieurs jours à l'avance reste la meilleure protection. Vous trouverez sous cette introduction les taxis conventionnés recensés à Reims, avec leur numéro d'appel direct et leur statut de conventionnement, ainsi qu'un accès aux communes voisines de la Marne.",
    ],
    voisines: [
      { nom: "Tinqueux", slug: "tinqueux" },
      { nom: "Bezannes", slug: "bezannes" },
      { nom: "Cormontreuil", slug: "cormontreuil" },
      { nom: "Bétheny", slug: "betheny" },
      { nom: "Cernay-lès-Reims", slug: "cernay-les-reims" },
      { nom: "Saint-Brice-Courcelles", slug: "saint-brice-courcelles" },
    ],
    faq: [
      {
        question: "Quelle différence entre un taxi conventionné et un taxi ordinaire à Reims ?",
        answer:
          "Un taxi ordinaire facture sa course au compteur et n'ouvre aucun droit au remboursement. Un taxi conventionné a signé une convention avec la CPAM de la Marne : il applique un tarif encadré, accepte la prescription médicale de transport et pratique le tiers payant. Vérifiez toujours le conventionnement avant la course, chaque fiche de l'annuaire l'indique.",
      },
      {
        question: "Combien reste-t-il à ma charge pour un taxi conventionné à Reims ?",
        answer:
          "Avec le tiers payant, vous n'avancez rien sur la part remboursée par l'Assurance maladie, soit 100 % du tarif conventionné en ALD, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs. Restent éventuellement à votre charge la participation forfaitaire de 2 € par trajet, dans la limite du plafond légal, et le ticket modérateur si votre mutuelle ne le couvre pas.",
      },
      {
        question: "Faut-il une prescription pour un taxi conventionné vers le CHU de Reims ?",
        answer:
          "Oui, systématiquement. La prescription médicale de transport, établie par votre médecin traitant ou par le praticien hospitalier, est obligatoire et doit préciser le transport assis. Sans ce document, le trajet est facturé au tarif taxi habituel et n'est pas pris en charge, même si la société est conventionnée.",
      },
    ],
  },

  "reims/vsl": {
    etablissements: [
      { nom: "hôpital Maison Blanche", slug: "hopital-maison-blanche-chu-reims-51" },
      { nom: "hôpital Robert-Debré", slug: "hopital-robert-debre-chu-reims-51" },
    ],
    intro: [
      "Le véhicule sanitaire léger occupe une place précise entre l'ambulance et le taxi : c'est une voiture agréée par l'ARS Grand Est, identifiée comme véhicule de transport sanitaire, conduite par un auxiliaire ambulancier formé aux gestes d'urgence et à l'aide aux personnes. À Reims, les VSL assurent les trajets assis vers l'hôpital Robert-Debré, l'hôpital Maison Blanche, le site Sébastopol ou l'Institut Godinot pour des patients qui n'ont pas besoin d'être allongés, mais dont l'état justifie une prise en charge par un professionnel du transport sanitaire.",
      "Deux particularités distinguent nettement le VSL du taxi conventionné rémois. D'abord la qualification : l'auxiliaire ambulancier relève d'une formation réglementée, ce qui n'est pas exigé d'un chauffeur de taxi conventionné. Ensuite le partage : un VSL peut transporter jusqu'à trois patients assis sur un même trajet, ce qui explique des horaires parfois calés sur le groupe plutôt que sur un seul rendez-vous. Le nombre de véhicules agréés est par ailleurs encadré par un quota départemental fixé par l'ARS, ce qui rend l'offre de VSL plus rare et plus tendue que celle des taxis.",
      "Côté remboursement, aucune différence avec le transport assis en taxi conventionné : sur prescription médicale précisant le transport assis, l'Assurance maladie couvre 100 % du tarif en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs, avec tiers payant chez la plupart des sociétés. Les entreprises rémoises qui exploitent des VSL disposent généralement aussi d'ambulances, ce qui facilite un changement de mode de transport si l'état du patient évolue. Comparez ci-dessous les sociétés de VSL recensées à Reims et leurs coordonnées directes.",
    ],
    voisines: [
      { nom: "Tinqueux", slug: "tinqueux" },
      { nom: "Bezannes", slug: "bezannes" },
      { nom: "Cormontreuil", slug: "cormontreuil" },
      { nom: "Bétheny", slug: "betheny" },
      { nom: "Cernay-lès-Reims", slug: "cernay-les-reims" },
      { nom: "Saint-Brice-Courcelles", slug: "saint-brice-courcelles" },
    ],
    faq: [
      {
        question: "VSL ou taxi conventionné à Reims : lequel choisir ?",
        answer:
          "Le VSL est un véhicule sanitaire agréé par l'ARS, conduit par un auxiliaire ambulancier formé, et il peut regrouper jusqu'à trois patients assis. Le taxi conventionné est un taxi agréé par la CPAM, sans qualification sanitaire obligatoire, et transporte généralement un seul patient. Le remboursement est identique dans les deux cas ; c'est le médecin prescripteur qui indique le mode adapté à votre état sur la prescription de transport.",
      },
      {
        question: "Un VSL peut-il me conduire seul à mon rendez-vous au CHU de Reims ?",
        answer:
          "Oui, mais le transport partagé fait partie du fonctionnement normal du VSL : la société peut regrouper plusieurs patients ayant des rendez-vous proches dans le même établissement. Signalez à la réservation votre heure de convocation exacte et toute contrainte particulière, notamment un examen à jeun ou une séance de dialyse, afin que le planning en tienne compte.",
      },
    ],
  },

  "thionville/ambulance": {
    etablissements: [
      { nom: "hôpital Bel-Air", slug: "chr-metz-thionville-hopital-bel-air-thionville-57" },
    ],
    intro: [
      "À Thionville, l'activité de transport sanitaire s'organise autour de l'hôpital Bel-Air, 1-3 rue du Friscaty, site nord du CHR Metz-Thionville. L'établissement a bénéficié d'un vaste programme de rénovation d'environ 210 millions d'euros, qui a modernisé ses plateaux techniques et conforté son rôle de référence pour le nord de la Moselle. Les entreprises d'ambulances agréées par l'ARS Grand Est y acheminent chaque jour des patients en position allongée, et assurent les liaisons avec les sites messins du CHR lorsqu'une prise en charge relève d'un autre pôle du groupe.",
      "Le recours à l'ambulance répond à un critère médical, pas à un critère de confort : elle s'impose quand le patient doit voyager allongé, requiert une surveillance ou une aide au brancardage. L'équipage compte au moins un diplômé d'État ambulancier et le véhicule embarque brancard, oxygène et matériel de premiers secours. Les sociétés thionvilloises interviennent pour les sorties d'hospitalisation, les transferts inter-établissements et les entrées programmées, et prennent part, avec celles du reste du département, à la garde ambulancière régulée sous l'égide du SAMU 57 (Centre 15) la nuit, le week-end et les jours fériés.",
      "Le bassin thionvillois vit largement au rythme du travail frontalier, ce qui décale les besoins de transport vers les créneaux très matinaux et la fin de journée. Annoncer l'heure de convocation et l'entrée précise de Bel-Air lors de la réservation évite bien des attentes. Sur prescription, la prise en charge est de 100 % en affection longue durée, accident du travail ou hospitalisation liée, et de 55 % pour les autres motifs, avec tiers payant chez la majorité des transporteurs. Les fiches ci-dessous donnent le téléphone direct et le conventionnement de chaque société recensée.",
    ],
    voisines: [
      { nom: "Yutz", slug: "yutz" },
      { nom: "Terville", slug: "terville" },
      { nom: "Florange", slug: "florange" },
      { nom: "Manom", slug: "manom" },
      { nom: "Guénange", slug: "guenange" },
    ],
    faq: [
      {
        question: "Vers quel hôpital les ambulances de Thionville transportent-elles les patients ?",
        answer:
          "L'établissement de référence est l'hôpital Bel-Air, rue du Friscaty, site thionvillois du CHR Metz-Thionville. Les ambulances y assurent les entrées programmées, les sorties d'hospitalisation et les retours à domicile, ainsi que les transferts vers les autres sites du CHR quand la prise en charge relève d'un plateau technique différent.",
      },
      {
        question: "Qui organise la permanence des transports urgents autour de Thionville ?",
        answer:
          "La garde ambulancière est organisée à l'échelle de la Moselle et régulée sous l'égide du SAMU 57 (Centre 15) : les entreprises agréées assurent à tour de rôle la permanence en dehors des heures ouvrables. En cas d'urgence vitale, appelez le 15, qui déclenche le moyen adapté. Pour un transport programmé, contactez directement une société de l'annuaire.",
      },
      {
        question: "Le transport en ambulance depuis Thionville est-il remboursé ?",
        answer:
          "Oui, dès lors qu'il est prescrit par un médecin. L'Assurance maladie rembourse 100 % du tarif en cas d'affection longue durée, d'accident du travail ou d'hospitalisation directement liée, et 55 % pour les autres motifs. La plupart des ambulances thionvilloises pratiquent le tiers payant : sur présentation de la prescription et de la carte Vitale, vous n'avancez pas la part prise en charge.",
      },
    ],
  },

  "thionville/taxi-conventionne": {
    etablissements: [
      { nom: "hôpital Bel-Air", slug: "chr-metz-thionville-hopital-bel-air-thionville-57" },
    ],
    intro: [
      "Un rendez-vous à l'hôpital Bel-Air, une séance de dialyse, un contrôle après chirurgie : dès que le patient tient assis et se déplace seul, le taxi conventionné est le mode de transport que le médecin coche le plus souvent sur la prescription. À Thionville, ces sociétés couvrent aussi bien les trajets courts vers le site du Friscaty que les déplacements plus longs vers les autres établissements du CHR Metz-Thionville, quand le suivi impose de changer de site.",
      "Le taxi conventionné thionvillois tire son droit au remboursement d'une convention passée avec la CPAM de la Moselle, et non d'un agrément sanitaire : son chauffeur n'est soumis à aucune obligation de qualification en transport sanitaire, contrairement à l'auxiliaire ambulancier qui conduit un VSL. En échange du conventionnement, la course est facturée selon un tarif encadré, distinct du tarif taxi libre, et le tiers payant s'applique. Muni de la prescription mentionnant le transport assis et de votre carte Vitale, vous ne réglez pas la part remboursée.",
      "Cette part atteint 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % dans les autres cas, le reliquat étant généralement pris en charge par la mutuelle. Le nombre de véhicules autorisés à stationner dépendant de l'autorisation communale, les disponibilités sont vite consommées aux heures de forte affluence hospitalière : pour un traitement répété, fixez un créneau récurrent avec le même transporteur. Parcourez la liste ci-dessous pour comparer les taxis conventionnés recensés à Thionville et les joindre sans intermédiaire.",
    ],
    voisines: [
      { nom: "Yutz", slug: "yutz" },
      { nom: "Terville", slug: "terville" },
      { nom: "Florange", slug: "florange" },
      { nom: "Manom", slug: "manom" },
      { nom: "Guénange", slug: "guenange" },
    ],
    faq: [
      {
        question: "Comment réserver un taxi conventionné à Thionville ?",
        answer:
          "Récupérez d'abord votre prescription médicale de transport indiquant le transport assis, puis appelez directement l'une des sociétés référencées. Précisez l'adresse de départ, l'établissement et l'heure de convocation, ainsi que le besoin d'un retour. Pour des séances régulières, demandez un créneau fixe : cela sécurise vos horaires sur toute la durée du traitement.",
      },
      {
        question: "Un taxi conventionné de Thionville peut-il desservir Yutz ou Florange ?",
        answer:
          "Oui. La prise en charge des patients relève de la zone couverte par l'autorisation de stationnement du taxi, mais la destination du trajet, elle, n'est pas limitée : un taxi conventionné thionvillois conduit couramment des patients depuis ou vers Yutz, Terville, Florange, Manom et Guénange. Les pages de ces communes permettent de comparer l'offre disponible sur place.",
      },
    ],
  },

  "thionville/vsl": {
    etablissements: [
      { nom: "hôpital Bel-Air", slug: "chr-metz-thionville-hopital-bel-air-thionville-57" },
    ],
    intro: [
      "Entre l'ambulance, réservée au transport allongé, et le taxi conventionné, qui reste un taxi, le VSL constitue la solution intermédiaire du transport sanitaire assis. Le véhicule est agréé par l'ARS Grand Est, signalé comme véhicule sanitaire léger, et son conducteur est un auxiliaire ambulancier titulaire d'une formation réglementée aux premiers secours et à la manutention des personnes. À Thionville, les VSL conduisent notamment les patients vers l'hôpital Bel-Air, site du CHR Metz-Thionville, pour des consultations, des examens ou des séances de traitement.",
      "Ce statut sanitaire a des conséquences concrètes. L'auxiliaire ambulancier sait installer un patient fragile, l'accompagner dans l'établissement et réagir à un malaise pendant le trajet. Le VSL peut par ailleurs regrouper jusqu'à trois patients assis, ce qui optimise les moyens mais impose parfois un horaire de groupe plutôt qu'un horaire individuel. Enfin, le parc de VSL agréés est plafonné par un quota départemental fixé par l'ARS : sur le nord mosellan, cette contrainte réglementaire explique que les disponibilités soient plus limitées que celles des taxis conventionnés, en particulier le matin.",
      "Le barème de remboursement, en revanche, ne fait aucune différence entre VSL et taxi conventionné : 100 % du tarif sur prescription en affection longue durée, accident du travail ou hospitalisation liée, 65 % pour les autres motifs, avec tiers payant sur présentation de la prescription et de la carte Vitale. Les sociétés thionvilloises qui exploitent des VSL disposent souvent aussi d'ambulances, ce qui permet de basculer sur un transport allongé si l'état de santé se dégrade. Retrouvez ci-dessous les prestataires de VSL recensés à Thionville, avec leurs coordonnées.",
    ],
    voisines: [
      { nom: "Yutz", slug: "yutz" },
      { nom: "Terville", slug: "terville" },
      { nom: "Florange", slug: "florange" },
      { nom: "Manom", slug: "manom" },
      { nom: "Guénange", slug: "guenange" },
    ],
    faq: [
      {
        question: "Qu'est-ce qui distingue un VSL d'un taxi conventionné à Thionville ?",
        answer:
          "Le VSL est un véhicule de transport sanitaire agréé par l'ARS, dont le conducteur est un auxiliaire ambulancier formé aux premiers secours et à l'aide aux personnes ; il peut transporter jusqu'à trois patients assis. Le taxi conventionné est un taxi ayant signé une convention avec la CPAM, sans qualification sanitaire obligatoire. Les deux relèvent du transport assis et sont remboursés dans les mêmes conditions.",
      },
      {
        question: "Puis-je demander un VSL plutôt qu'une ambulance pour aller à Bel-Air ?",
        answer:
          "Le choix appartient au médecin, qui indique le mode de transport sur la prescription en fonction de votre autonomie. Si vous pouvez effectuer le trajet assis sans surveillance médicale continue, le VSL suffit et coûte moins cher à la collectivité qu'une ambulance. En revanche, si la position allongée ou un brancardage sont nécessaires, seule l'ambulance est adaptée et remboursée.",
      },
      {
        question: "Y a-t-il beaucoup de VSL disponibles autour de Thionville ?",
        answer:
          "Le nombre de VSL agréés est encadré par un quota fixé par l'ARS à l'échelle du département, ce qui limite structurellement l'offre. Les créneaux du matin, très demandés pour les consultations et les séances de traitement, partent rapidement. Réserver plusieurs jours à l'avance, et si possible auprès du même transporteur, augmente nettement vos chances d'obtenir l'horaire souhaité.",
      },
    ],
  },

  "saint-denis/ambulance": {
    etablissements: [
      { nom: "hôpital Delafontaine", slug: "centre-hospitalier-de-st-denis-hopital-delafontaine-93" },
      { nom: "Centre hospitalier de Saint-Denis", slug: "centre-hospitalier-de-st-denis-hopital-delafontaine-93" },
      { nom: "hôpital Avicenne de l'AP-HP", slug: "ghu-ap-hp-hu-paris-seine-saint-denis-site-avicenne-93" },
    ],
    intro: [
      "Saint-Denis (93), en Seine-Saint-Denis, s'appuie sur le Centre hospitalier de Saint-Denis, seul établissement public de santé de Plaine Commune, territoire d'environ 435 000 habitants. Ses deux sites — l'hôpital Delafontaine, 2 rue du Docteur Delafontaine, et le site Casanova — totalisent 845 lits. À proximité immédiate, l'hôpital Avicenne de l'AP-HP, à Bobigny, complète l'offre de recours du département. Les entreprises d'ambulances dionysiennes, agréées par l'ARS Île-de-France, assurent les transports allongés vers ces établissements comme les liaisons avec les hôpitaux parisiens.",
      "L'ambulance intervient lorsque la position assise est impossible ou que le trajet nécessite une surveillance : sortie de service de médecine ou de chirurgie, transfert entre Delafontaine et un plateau technique spécialisé, hospitalisation programmée. Le véhicule comporte brancard, oxygène et matériel de premiers secours, et l'équipage compte au moins un diplômé d'État ambulancier. Les sociétés du secteur participent également à la garde ambulancière du département, régulée sous l'égide du SAMU 93 (Centre 15), qui assure la permanence des transports urgents la nuit, le week-end et les jours fériés.",
      "Dans un tissu urbain aussi dense, où les chantiers et les axes saturés modifient les temps de parcours d'une heure à l'autre, la connaissance du terrain fait une différence réelle sur les délais annoncés. Sur prescription médicale, la prise en charge s'élève à 100 % en affection longue durée, accident du travail ou hospitalisation liée, et à 55 % pour les autres motifs, le tiers payant étant pratiqué par la plupart des transporteurs. Comparez ci-dessous les ambulances recensées à Saint-Denis, leur téléphone direct et leur statut de conventionnement CPAM.",
    ],
    voisines: [
      { nom: "Aubervilliers", slug: "aubervilliers" },
      { nom: "Épinay-sur-Seine", slug: "epinay-sur-seine" },
      { nom: "Saint-Ouen-sur-Seine", slug: "saint-ouen-sur-seine" },
      { nom: "Pierrefitte-sur-Seine", slug: "pierrefitte-sur-seine" },
      { nom: "L'Île-Saint-Denis", slug: "l-ile-saint-denis" },
    ],
    faq: [
      {
        question: "Quels hôpitaux les ambulances de Saint-Denis desservent-elles ?",
        answer:
          "En premier lieu le Centre hospitalier de Saint-Denis, sur ses deux sites : l'hôpital Delafontaine, rue du Docteur Delafontaine, et le site Casanova. Elles assurent aussi les transports vers l'hôpital Avicenne de l'AP-HP, à Bobigny, situé à proximité. Le Centre hospitalier de Saint-Denis est le seul établissement public de santé du territoire de Plaine Commune.",
      },
      {
        question: "Comment est assurée la permanence des transports urgents en Seine-Saint-Denis ?",
        answer:
          "La garde ambulancière est organisée à l'échelle du département et régulée sous l'égide du SAMU 93 (Centre 15) : les entreprises agréées assurent à tour de rôle la permanence des transports urgents en dehors des heures ouvrables. En cas d'urgence vitale, composez le 15. Pour un transport programmé ou un retour à domicile, appelez directement une société de l'annuaire.",
      },
      {
        question: "Une ambulance de Saint-Denis intervient-elle à Aubervilliers ou Saint-Ouen-sur-Seine ?",
        answer:
          "Oui. Les entreprises agréées ne sont pas cantonnées à leur commune d'implantation et couvrent l'ensemble du nord de la Seine-Saint-Denis : Aubervilliers, Saint-Ouen-sur-Seine, Épinay-sur-Seine, Pierrefitte-sur-Seine ou L'Île-Saint-Denis. Les pages de ces communes vous permettent de comparer les transporteurs présents à proximité de votre adresse.",
      },
    ],
  },

  "saint-denis/taxi-conventionne": {
    etablissements: [
      { nom: "hôpital Delafontaine", slug: "centre-hospitalier-de-st-denis-hopital-delafontaine-93" },
      { nom: "Centre hospitalier de Saint-Denis", slug: "centre-hospitalier-de-st-denis-hopital-delafontaine-93" },
      { nom: "hôpital Avicenne de l'AP-HP", slug: "ghu-ap-hp-hu-paris-seine-saint-denis-site-avicenne-93" },
    ],
    intro: [
      "Ne pas confondre : il s'agit ici de Saint-Denis en Seine-Saint-Denis (93), la commune de l'hôpital Delafontaine et de Plaine Commune. Sur ce territoire très peuplé, le taxi conventionné assure la majeure partie des transports assis remboursés : séances de dialyse, cures de chimiothérapie, rééducation, consultations de suivi et examens d'imagerie, vers le Centre hospitalier de Saint-Denis, son site Casanova, l'hôpital Avicenne de l'AP-HP à Bobigny ou les établissements parisiens. Il concerne les patients autonomes, capables de faire le trajet assis sans surveillance.",
      "Le conventionnement, signé avec la CPAM de la Seine-Saint-Denis, est ce qui ouvre droit au remboursement : ce n'est pas un agrément sanitaire, et aucune qualification en transport de malades n'est imposée au chauffeur, contrairement au VSL. Concrètement, la course est facturée selon le tarif de la convention, et non au compteur du taxi classique, et le tiers payant s'applique sur présentation de la prescription médicale de transport mentionnant le transport assis, accompagnée de la carte Vitale. Vous ne réglez alors pas la part remboursée par l'Assurance maladie.",
      "Celle-ci couvre 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs. Sur les trajets vers Paris ou Bobigny, la congestion des accès et les contrôles de circulation pèsent lourdement sur les horaires : anticiper d'une demi-heure la prise en charge évite l'annulation d'un rendez-vous. Pour un traitement itératif, un créneau fixe négocié avec le même transporteur reste la solution la plus sûre. Les fiches ci-dessous listent les taxis conventionnés recensés à Saint-Denis, avec leur téléphone direct.",
    ],
    voisines: [
      { nom: "Aubervilliers", slug: "aubervilliers" },
      { nom: "Épinay-sur-Seine", slug: "epinay-sur-seine" },
      { nom: "Saint-Ouen-sur-Seine", slug: "saint-ouen-sur-seine" },
      { nom: "Pierrefitte-sur-Seine", slug: "pierrefitte-sur-seine" },
      { nom: "L'Île-Saint-Denis", slug: "l-ile-saint-denis" },
    ],
    faq: [
      {
        question: "Un taxi conventionné de Saint-Denis peut-il me conduire à un hôpital parisien ?",
        answer:
          "Oui. La prescription médicale de transport détermine la destination, pas la commune du transporteur : un taxi conventionné dionysien conduit couramment des patients vers les hôpitaux de Paris ou vers l'hôpital Avicenne de l'AP-HP à Bobigny. Le remboursement s'applique dans les mêmes conditions, sur la base du trajet vers l'établissement approprié le plus proche indiqué par votre médecin.",
      },
      {
        question: "Quel reste à charge pour un taxi conventionné à Saint-Denis ?",
        answer:
          "Avec le tiers payant, vous n'avancez rien sur la part prise en charge : 100 % du tarif conventionné en ALD, accident du travail ou hospitalisation liée, et 65 % dans les autres cas. Peuvent rester à votre charge la participation forfaitaire de 2 € par trajet, plafonnée annuellement, et le ticket modérateur si votre mutuelle ne le rembourse pas.",
      },
      {
        question: "Taxi conventionné ou VSL pour aller à l'hôpital Delafontaine ?",
        answer:
          "Les deux relèvent du transport assis et ouvrent les mêmes droits au remboursement. Le taxi conventionné est un taxi agréé par la CPAM, sans qualification sanitaire obligatoire. Le VSL est un véhicule sanitaire agréé par l'ARS, conduit par un auxiliaire ambulancier formé, susceptible de regrouper plusieurs patients. Le médecin coche sur la prescription le mode correspondant à votre degré d'autonomie.",
      },
    ],
  },

  "saint-denis/vsl": {
    etablissements: [
      { nom: "hôpital Delafontaine", slug: "centre-hospitalier-de-st-denis-hopital-delafontaine-93" },
      { nom: "Centre hospitalier de Saint-Denis", slug: "centre-hospitalier-de-st-denis-hopital-delafontaine-93" },
      { nom: "hôpital Avicenne de l'AP-HP", slug: "ghu-ap-hp-hu-paris-seine-saint-denis-site-avicenne-93" },
    ],
    intro: [
      "En Seine-Saint-Denis, le véhicule sanitaire léger répond à une situation précise : le patient tient assis, mais son état ou son âge justifie l'intervention d'un professionnel du transport sanitaire plutôt que d'un chauffeur de taxi. Le VSL est un véhicule agréé par l'ARS Île-de-France, identifié comme tel, conduit par un auxiliaire ambulancier dont la formation aux premiers secours et à l'aide à la mobilité est réglementée. À Saint-Denis, ces véhicules desservent l'hôpital Delafontaine, le site Casanova du Centre hospitalier de Saint-Denis et l'hôpital Avicenne de l'AP-HP à Bobigny.",
      "Trois traits séparent le VSL du taxi conventionné dionysien. La qualification du conducteur, d'abord, qui relève du champ sanitaire et non du transport de personnes. Le transport partagé, ensuite : un VSL peut prendre en charge jusqu'à trois patients assis lors d'un même trajet, ce qui explique des horaires calés sur un groupe de rendez-vous. Le régime d'autorisation, enfin : le parc de VSL agréés est plafonné par un quota départemental arrêté par l'ARS, si bien que l'offre reste plus contrainte que celle des taxis conventionnés, notamment sur les créneaux matinaux.",
      "Le remboursement, lui, suit exactement le même barème que le transport assis en taxi conventionné : sur prescription médicale, 100 % du tarif en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs, avec tiers payant sur présentation de la carte Vitale et du bon de transport. Beaucoup de sociétés du secteur exploitent VSL et ambulances au sein d'un même parc, ce qui simplifie le passage d'un mode à l'autre. Consultez ci-dessous les prestataires de VSL recensés à Saint-Denis.",
    ],
    voisines: [
      { nom: "Aubervilliers", slug: "aubervilliers" },
      { nom: "Épinay-sur-Seine", slug: "epinay-sur-seine" },
      { nom: "Saint-Ouen-sur-Seine", slug: "saint-ouen-sur-seine" },
      { nom: "Pierrefitte-sur-Seine", slug: "pierrefitte-sur-seine" },
      { nom: "L'Île-Saint-Denis", slug: "l-ile-saint-denis" },
    ],
    faq: [
      {
        question: "Le VSL est-il remboursé comme un taxi conventionné en Seine-Saint-Denis ?",
        answer:
          "Oui, le barème est identique : sur prescription médicale mentionnant le transport assis, l'Assurance maladie rembourse 100 % du tarif en cas d'affection longue durée, d'accident du travail ou d'hospitalisation directement liée, et 65 % pour les autres motifs. Le tiers payant est pratiqué par la plupart des sociétés, sur présentation de la prescription et de la carte Vitale.",
      },
      {
        question: "Pourquoi un VSL transporte-t-il parfois plusieurs patients à la fois ?",
        answer:
          "Le transport partagé est prévu par la réglementation : un VSL peut acheminer jusqu'à trois patients assis sur un même trajet, ce qui optimise un parc dont le nombre de véhicules agréés est limité par un quota fixé par l'ARS. En pratique, cela signifie que votre horaire de prise en charge peut être avancé pour tenir compte des autres rendez-vous du même circuit.",
      },
    ],
  },

  "saint-louis/ambulance": {
    intro: [
      "Saint-Louis, dans le Haut-Rhin (68), n'est pas la commune réunionnaise du même nom : c'est la ville frontalière de l'extrême sud de l'Alsace, limitrophe de la Suisse et de l'agglomération bâloise ainsi que de l'Allemagne. Le Pôle Public Saint-Louis, 8 rue Saint-Damien, y assure une mission d'établissement de premier recours et relève du Groupe hospitalier de la région Mulhouse et Sud Alsace (GHRMSA). Les entreprises d'ambulances locales, agréées par l'ARS Grand Est, y acheminent les patients en position allongée et assurent les transferts vers les autres sites du groupe.",
      "Cette organisation en premier recours implique un volume important de transports secondaires : lorsqu'une prise en charge dépasse le plateau technique ludovicien, le patient est orienté vers un autre établissement du GHRMSA, ce qui suppose un transport allongé sur plusieurs dizaines de kilomètres. L'équipage compte au moins un diplômé d'État ambulancier, et le véhicule est armé d'un brancard, d'oxygène et du matériel de premiers secours. Les sociétés du secteur prennent part à la garde ambulancière du département, régulée sous l'égide du SAMU 68 (Centre 15), qui couvre la nuit, le week-end et les jours fériés.",
      "La position frontalière de la commune se lit dans les habitudes de circulation : les axes vers la frontière suisse et allemande connaissent des pointes marquées matin et soir, dont il faut tenir compte pour un rendez-vous hospitalier. Sur prescription médicale, le transport en ambulance est pris en charge à 100 % en affection longue durée, accident du travail ou hospitalisation liée, et à 55 % pour les autres motifs, la plupart des transporteurs appliquant le tiers payant. Les fiches ci-dessous précisent le téléphone direct et le conventionnement de chaque ambulance recensée à Saint-Louis.",
    ],
    voisines: [
      { nom: "Huningue", slug: "huningue" },
      { nom: "Village-Neuf", slug: "village-neuf" },
      { nom: "Blotzheim", slug: "blotzheim" },
      { nom: "Hésingue", slug: "hesingue" },
    ],
    faq: [
      {
        question: "Quel hôpital dessert Saint-Louis dans le Haut-Rhin ?",
        answer:
          "Le Pôle Public Saint-Louis, 8 rue Saint-Damien, assure la mission d'établissement de premier recours sur la commune et relève du Groupe hospitalier de la région Mulhouse et Sud Alsace (GHRMSA). Les prises en charge qui excèdent son plateau technique sont orientées vers d'autres sites du groupe, ce qui génère un volume notable de transferts en ambulance.",
      },
      {
        question: "S'agit-il bien de Saint-Louis en Alsace et non de La Réunion ?",
        answer:
          "Oui. Cette page concerne Saint-Louis dans le Haut-Rhin (68), commune frontalière de la Suisse et de l'Allemagne, à proximité immédiate de l'agglomération bâloise, dont les voisines sont Huningue, Village-Neuf, Blotzheim et Hésingue. Elle ne concerne pas la commune de Saint-Louis à La Réunion (974).",
      },
      {
        question: "Comment est organisée la garde ambulancière autour de Saint-Louis ?",
        answer:
          "La permanence des transports sanitaires urgents est organisée à l'échelle du Haut-Rhin et régulée sous l'égide du SAMU 68 (Centre 15). Les entreprises agréées assurent à tour de rôle la garde la nuit, le week-end et les jours fériés. En cas d'urgence vitale, composez le 15 ; pour un transport programmé, contactez directement un transporteur de l'annuaire.",
      },
    ],
  },

  "saint-louis/taxi-conventionne": {
    intro: [
      "Dans cette commune frontalière du Haut-Rhin (68), voisine de Bâle et de l'Allemagne, le taxi conventionné prend en charge les patients autonomes qui doivent se rendre régulièrement à l'hôpital sans nécessiter de position allongée. Les trajets classiques mènent au Pôle Public Saint-Louis, rue Saint-Damien, établissement de premier recours de la ville, ou vers les autres sites du Groupe hospitalier de la région Mulhouse et Sud Alsace lorsque le suivi — dialyse, oncologie, rééducation — relève d'un plateau plus spécialisé.",
      "Ce qui rend la course remboursable, ici comme ailleurs, c'est la convention conclue avec la CPAM du Haut-Rhin. Il ne s'agit pas d'un agrément sanitaire : aucune qualification en transport de malades n'est exigée du chauffeur, à la différence de l'auxiliaire ambulancier qui conduit un VSL. En contrepartie du conventionnement, le tarif appliqué est encadré, distinct de la course libre, et le tiers payant joue : avec la prescription médicale de transport mentionnant le transport assis et votre carte Vitale, vous n'avancez pas la part prise en charge.",
      "Cette part correspond à 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et à 65 % pour les autres motifs, le complément relevant en général de la mutuelle. Attention à un point pratique : les trajets vers un plateau technique du Sud Alsace supposent souvent une immobilisation longue du véhicule, donc une réservation anticipée, d'autant que les axes frontaliers sont chargés aux heures de pointe. Comparez ci-dessous les taxis conventionnés recensés à Saint-Louis et joignez-les sans intermédiaire.",
    ],
    voisines: [
      { nom: "Huningue", slug: "huningue" },
      { nom: "Village-Neuf", slug: "village-neuf" },
      { nom: "Blotzheim", slug: "blotzheim" },
      { nom: "Hésingue", slug: "hesingue" },
    ],
    faq: [
      {
        question: "Le taxi conventionné de Saint-Louis pratique-t-il le tiers payant ?",
        answer:
          "Oui. Sur présentation de la prescription médicale de transport mentionnant le transport assis et de votre carte Vitale, vous ne réglez pas la part prise en charge par l'Assurance maladie, soit 100 % du tarif conventionné en ALD, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs. Le reste éventuel relève de votre mutuelle.",
      },
      {
        question: "Faut-il une prescription pour être remboursé au départ de Saint-Louis ?",
        answer:
          "Oui, la prescription médicale de transport est indispensable et doit préciser le transport assis. Établie par votre médecin traitant ou par le praticien hospitalier, elle conditionne le remboursement et l'application du tarif conventionné. Sans elle, la course est facturée au tarif taxi habituel, même auprès d'une société conventionnée.",
      },
    ],
  },

  "saint-louis/vsl": {
    intro: [
      "Le VSL n'est ni une ambulance ni un taxi : c'est un véhicule sanitaire léger agréé par l'ARS Grand Est, conduit par un auxiliaire ambulancier dont la formation aux premiers secours et à l'aide à la mobilité est encadrée par la réglementation. À Saint-Louis, ville frontalière du Haut-Rhin (68) située aux portes de la Suisse et de l'Allemagne, il convient aux patients qui tiennent assis mais que l'on ne peut pas laisser voyager seuls : trajets vers le Pôle Public Saint-Louis, rue Saint-Damien, ou vers un autre site du GHRMSA.",
      "La distinction avec le taxi conventionné ludovicien est nette sur trois plans. Le véhicule est agréé au titre du transport sanitaire, et non simplement titulaire d'une autorisation de stationnement. Le conducteur détient une qualification sanitaire, ce que la réglementation n'impose pas à un chauffeur de taxi conventionné. Et le trajet peut être mutualisé : jusqu'à trois patients assis dans le même véhicule, une pratique fréquente sur les liaisons vers les plateaux techniques du Sud Alsace, où les distances rendent le regroupement pertinent pour l'ensemble des patients concernés.",
      "Le parc de VSL agréés est plafonné par un quota départemental fixé par l'ARS, ce qui explique que les créneaux se réservent tôt, en particulier pour les rendez-vous matinaux. Le remboursement, en revanche, ne diffère pas de celui du taxi conventionné : sur prescription, 100 % du tarif en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs, avec tiers payant. Les entreprises ludoviciennes exploitant des VSL disposent souvent aussi d'ambulances : la liste ci-dessous précise leurs coordonnées et leur conventionnement.",
    ],
    voisines: [
      { nom: "Huningue", slug: "huningue" },
      { nom: "Village-Neuf", slug: "village-neuf" },
      { nom: "Blotzheim", slug: "blotzheim" },
      { nom: "Hésingue", slug: "hesingue" },
    ],
    faq: [
      {
        question: "Quelle différence entre un VSL et un taxi conventionné à Saint-Louis ?",
        answer:
          "Le VSL est un véhicule sanitaire agréé par l'ARS, conduit par un auxiliaire ambulancier formé aux premiers secours et à la manutention des personnes, et il peut regrouper jusqu'à trois patients assis. Le taxi conventionné est un taxi ayant signé une convention avec la CPAM du Haut-Rhin, sans qualification sanitaire obligatoire. Le remboursement est le même dans les deux cas.",
      },
      {
        question: "Un VSL peut-il assurer un trajet long depuis Saint-Louis ?",
        answer:
          "Oui. Le VSL est fréquemment utilisé pour les trajets vers les autres sites du Groupe hospitalier de la région Mulhouse et Sud Alsace lorsque la prise en charge dépasse le plateau technique local. Sur ces distances, le transport partagé est courant : signalez votre heure de convocation exacte à la réservation pour que le circuit en tienne compte.",
      },
      {
        question: "Pourquoi les VSL sont-ils parfois difficiles à obtenir ?",
        answer:
          "Parce que le nombre de véhicules sanitaires légers agréés est encadré par un quota départemental arrêté par l'ARS : l'offre ne peut pas s'ajuster librement à la demande. Les créneaux du matin, très sollicités pour les consultations et les séances de traitement, se remplissent vite. Réserver plusieurs jours à l'avance auprès du même transporteur reste la meilleure méthode.",
      },
    ],
  },

  "strasbourg/ambulance": {
    etablissements: [
      { nom: "Hôpital Civil", slug: "hopital-civil-nouvel-hopital-civil-67" },
      { nom: "hôpital de Hautepierre", slug: "hopital-de-hautepierre-67" },
    ],
    intro: [
      "Les Hôpitaux universitaires de Strasbourg (HUS) comptent parmi les plus grands ensembles hospitalo-universitaires de France, et leur organisation multi-sites structure l'ensemble du transport sanitaire du Bas-Rhin (67). L'hôpital de Hautepierre, principal site d'urgences avec 1 021 lits, le Nouvel Hôpital Civil et l'Hôpital Civil se répartissent les spécialités, tandis que la Clinique Rhéna représente l'offre privée de l'Eurométropole. Les entreprises d'ambulances strasbourgeoises, agréées par l'ARS Grand Est, assurent entre ces établissements un flux continu de transports allongés.",
      "L'ambulance se prescrit lorsque le patient ne peut pas voyager assis, doit être brancardé ou surveillé pendant le trajet. Le véhicule embarque brancard, oxygène et matériel de premiers secours, et l'équipage comprend au moins un diplômé d'État ambulancier. Sorties de réanimation ou de bloc, transferts de Hautepierre vers le Nouvel Hôpital Civil, entrées programmées, retours à domicile après une hospitalisation lourde : ces missions constituent le quotidien des sociétés locales, qui participent en outre à la garde ambulancière du département, régulée sous l'égide du SAMU 67 (Centre 15), la nuit, le week-end et les jours fériés.",
      "La géographie hospitalière strasbourgeoise, partagée entre le centre-ville et le nord-ouest de l'agglomération, rend indispensable de préciser le site et le service de destination au moment de la réservation : une erreur d'adresse peut coûter une heure. Sur prescription médicale, le transport allongé est remboursé à 100 % en affection longue durée, accident du travail ou hospitalisation directement liée, et à 55 % pour les autres motifs, avec tiers payant chez la majorité des transporteurs. Retrouvez ci-dessous les ambulances strasbourgeoises référencées, leur téléphone direct et leur conventionnement CPAM.",
    ],
    voisines: [
      { nom: "Schiltigheim", slug: "schiltigheim" },
      { nom: "Illkirch-Graffenstaden", slug: "illkirch-graffenstaden" },
      { nom: "Bischheim", slug: "bischheim" },
      { nom: "Lingolsheim", slug: "lingolsheim" },
      { nom: "Ostwald", slug: "ostwald" },
      { nom: "Eckbolsheim", slug: "eckbolsheim" },
    ],
    faq: [
      {
        question: "Quels établissements les ambulances de Strasbourg desservent-elles ?",
        answer:
          "Elles desservent les sites des Hôpitaux universitaires de Strasbourg — l'hôpital de Hautepierre, principal site d'urgences, le Nouvel Hôpital Civil et l'Hôpital Civil — ainsi que la Clinique Rhéna pour le secteur privé. Les transferts entre ces sites représentent une part importante de l'activité de transport allongé de l'Eurométropole.",
      },
      {
        question: "Comment obtenir une ambulance à Strasbourg la nuit ou un jour férié ?",
        answer:
          "En cas d'urgence vitale, appelez le 15 : le SAMU 67 régule les moyens et engage au besoin une ambulance de la garde ambulancière du département, assurée à tour de rôle par les entreprises agréées. Pour un transport programmé, une entrée ou une sortie d'hospitalisation, contactez directement une société de l'annuaire, de préférence la veille.",
      },
      {
        question: "Ambulance ou transport assis pour un rendez-vous aux HUS ?",
        answer:
          "L'ambulance est réservée aux patients qui doivent être transportés allongés, brancardés ou surveillés. Si vous pouvez effectuer le trajet assis, le médecin prescrira un VSL ou un taxi conventionné, remboursés selon un barème plus favorable pour les motifs courants. C'est le prescripteur qui coche le mode de transport, et ce choix conditionne la prise en charge.",
      },
    ],
  },

  "strasbourg/vsl": {
    etablissements: [
      { nom: "Hôpital Civil", slug: "hopital-civil-nouvel-hopital-civil-67" },
      { nom: "hôpital de Hautepierre", slug: "hopital-de-hautepierre-67" },
    ],
    intro: [
      "À Strasbourg, le véhicule sanitaire léger comble l'écart entre l'ambulance et le taxi conventionné. Agréé par l'ARS Grand Est au titre du transport sanitaire, il est conduit par un auxiliaire ambulancier titulaire d'une formation réglementée aux premiers secours et à l'aide à la mobilité. Les VSL strasbourgeois acheminent, assis, les patients vers l'hôpital de Hautepierre, le Nouvel Hôpital Civil, l'Hôpital Civil ou la Clinique Rhéna, pour des consultations de suivi, des examens ou des séances de traitement répétées.",
      "Le contraste avec le taxi conventionné mérite d'être posé clairement. Le VSL est un véhicule sanitaire immatriculé comme tel et soumis à un agrément ARS, alors que le taxi conventionné reste un taxi titulaire d'une autorisation de stationnement, conventionné par la CPAM. Son conducteur possède une qualification sanitaire, ce que la réglementation n'impose pas au chauffeur de taxi. Enfin, un VSL peut transporter jusqu'à trois patients assis simultanément, et le nombre de véhicules agréés dans le Bas-Rhin est encadré par un quota fixé par l'ARS, ce qui rend cette offre plus rare.",
      "Sur le plan financier, aucune différence avec le taxi conventionné : sur prescription médicale précisant le transport assis, l'Assurance maladie rembourse 100 % du tarif en affection longue durée, accident du travail ou hospitalisation liée, et 65 % dans les autres cas, le tiers payant dispensant d'avancer les frais sur cette part. La plupart des sociétés strasbourgeoises de VSL exploitent également des ambulances, ce qui permet d'adapter le mode de transport si l'état du patient change. Consultez ci-dessous les prestataires de VSL référencés à Strasbourg.",
    ],
    voisines: [
      { nom: "Schiltigheim", slug: "schiltigheim" },
      { nom: "Illkirch-Graffenstaden", slug: "illkirch-graffenstaden" },
      { nom: "Bischheim", slug: "bischheim" },
      { nom: "Lingolsheim", slug: "lingolsheim" },
      { nom: "Ostwald", slug: "ostwald" },
      { nom: "Eckbolsheim", slug: "eckbolsheim" },
    ],
    faq: [
      {
        question: "Qu'est-ce qui différencie un VSL d'un taxi conventionné à Strasbourg ?",
        answer:
          "Le VSL est un véhicule de transport sanitaire agréé par l'ARS Grand Est, conduit par un auxiliaire ambulancier formé, et il peut regrouper jusqu'à trois patients assis sur un même trajet. Le taxi conventionné est un taxi agréé par la CPAM du Bas-Rhin, sans qualification sanitaire obligatoire, généralement dédié à un seul patient. Les deux modes sont remboursés à l'identique.",
      },
      {
        question: "Le VSL est-il remboursé pour un trajet vers Hautepierre ?",
        answer:
          "Oui, sur prescription médicale mentionnant le transport assis : l'Assurance maladie prend en charge 100 % du tarif en cas d'affection longue durée, d'accident du travail ou d'hospitalisation directement liée, et 65 % pour les autres motifs. Avec le tiers payant, vous n'avancez pas cette part sur présentation de la prescription et de la carte Vitale.",
      },
      {
        question: "Pourquoi est-il parfois difficile de trouver un VSL à Strasbourg ?",
        answer:
          "Le nombre de véhicules sanitaires légers agréés est plafonné par un quota départemental fixé par l'ARS : l'offre ne s'ajuste pas librement à la demande, contrairement à celle des taxis conventionnés. Les créneaux du matin, correspondant aux convocations hospitalières les plus fréquentes, partent très vite. Réservez plusieurs jours à l'avance, et si possible auprès du même transporteur pour un traitement régulier.",
      },
    ],
  },

  "nimes/taxi-conventionne": {
    etablissements: [
      { nom: "CHU de Nîmes", slug: "groupe-hopitalier-caremeau-chu-nimes-territoire-nimes-30" },
      { nom: "Institut de Cancérologie du Gard", slug: "kenval-institut-de-cancerologie-du-gard-30" },
    ],
    intro: [
      "Le taxi conventionné occupe à Nîmes une place centrale dans le parcours de soins des patients qui se déplacent assis. Chaque jour, ces véhicules acheminent vers l'hôpital universitaire Carémeau, siège du CHU de Nîmes, les personnes convoquées en consultation, en séance de dialyse ou en bilan préopératoire. Ils desservent également l'Institut de Cancérologie du Gard, où les protocoles de radiothérapie imposent des venues rapprochées sur plusieurs semaines. Pour ces trajets répétés, la ponctualité et la stabilité du chauffeur comptent souvent autant que le tarif.",
      "Un taxi conventionné n'est pas un véhicule sanitaire : c'est un taxi dont l'exploitant a signé une convention avec la CPAM du Gard. Il applique de ce fait une tarification encadrée, distincte de la course libre, et accepte le bon de transport. Aucune qualification sanitaire n'est exigée de son conducteur, contrairement au VSL confié à un auxiliaire ambulancier ou à l'ambulance dont l'équipage comporte un diplômé d'État. Ce mode de transport suppose donc un patient autonome, capable de monter et de descendre seul du véhicule et de rester assis durant tout le trajet.",
      "La prise en charge atteint 100 % lorsque le transport est lié à une affection de longue durée, à un accident du travail ou à une hospitalisation, et 65 % dans les autres situations, la mutuelle complétant fréquemment le reliquat. Le tiers payant vous dispense d'avance de frais sur présentation de la prescription et de la carte Vitale. Depuis Marguerittes, Redessan ou Saint-Gervasy, les délais d'approche s'allongent aux heures de pointe : réserver la veille demeure la meilleure garantie d'arriver à l'heure. Retrouvez ci-dessous les taxis conventionnés nîmois référencés.",
    ],
    voisines: [
      { nom: "Marguerittes", slug: "marguerittes" },
      { nom: "Milhaud", slug: "milhaud" },
      { nom: "Rodilhan", slug: "rodilhan" },
      { nom: "Redessan", slug: "redessan" },
      { nom: "Caissargues", slug: "caissargues" },
      { nom: "Saint-Gervasy", slug: "saint-gervasy" },
    ],
    faq: [
      {
        question: "Un taxi conventionné peut-il m'emmener au CHU de Nîmes ?",
        answer:
          "Oui, c'est même le motif de course le plus fréquent : consultations, examens d'imagerie, séances de dialyse et bilans préopératoires à l'hôpital universitaire Carémeau, ainsi que les venues à l'Institut de Cancérologie du Gard. Il faut simplement disposer d'une prescription médicale de transport mentionnant le transport assis.",
      },
      {
        question: "Quelle différence entre un taxi conventionné et un VSL à Nîmes ?",
        answer:
          "Le VSL est un véhicule sanitaire agréé par l'ARS, conduit par un auxiliaire ambulancier formé aux premiers secours. Le taxi conventionné est un taxi ayant signé une convention avec la CPAM, sans qualification sanitaire obligatoire du chauffeur. Les deux transportent des patients assis et ouvrent les mêmes droits au remboursement ; c'est le médecin qui indique le mode adapté.",
      },
      {
        question: "Devrai-je avancer les frais de la course ?",
        answer:
          "Dans la très grande majorité des cas, non : les taxis conventionnés du Gard pratiquent le tiers payant. Vous présentez votre bon de transport et votre carte Vitale, et le transporteur facture directement l'Assurance maladie. Le remboursement est de 100 % en ALD, accident du travail ou hospitalisation liée, et de 65 % sinon.",
      },
    ],
  },

  "narbonne/ambulance": {
    intro: [
      "Narbonne, commune la plus peuplée de l'Aude (11), dispose d'une offre de transport sanitaire structurée autour de son Centre Hospitalier, boulevard Docteur Lacroix. Avec 302 lits et places, un service d'urgences et un SMUR ouverts 24 heures sur 24, cet établissement surnommé l'hôpital cœur de ville constitue le point d'appui principal des entreprises d'ambulances locales agréées par l'ARS Occitanie. S'y ajoutent deux structures privées implantées sur la commune, la Polyclinique de Narbonne et la Clinique Sainte-Thérèse, qui génèrent leur propre flux de transferts, de sorties d'hospitalisation et d'entrées programmées.",
      "Transporter un patient allongé suppose un véhicule équipé d'un brancard, d'oxygène et de matériel de premiers secours, avec un équipage dont un membre au moins est diplômé d'État ambulancier. Les entreprises narbonnaises interviennent ainsi sur les retours à domicile après chirurgie, les transferts vers un plateau technique plus spécialisé et les hospitalisations programmées. La nuit, le week-end et les jours fériés, elles assurent à tour de rôle la garde ambulancière du département, régulée sous l'égide du SAMU 11 (Centre 15) : c'est le médecin régulateur qui engage l'ambulance de garde pour un transport urgent.",
      "Le territoire narbonnais mêle littoral, étangs et villages viticoles ; les prises en charge à Coursan, Bizanet, Moussan ou Bages allongent sensiblement les temps d'approche, surtout en période estivale lorsque la fréquentation touristique sature les axes du bord de mer. Sur prescription médicale, l'Assurance maladie couvre le transport allongé à 100 % en affection de longue durée, accident du travail ou hospitalisation liée, et à 55 % pour les autres motifs, presque toujours en tiers payant. Comparez ci-dessous les ambulances de Narbonne référencées, avec leur téléphone direct et leur statut de conventionnement CPAM.",
    ],
    voisines: [
      { nom: "Coursan", slug: "coursan" },
      { nom: "Vinassan", slug: "vinassan" },
      { nom: "Armissan", slug: "armissan" },
      { nom: "Bages", slug: "bages" },
      { nom: "Bizanet", slug: "bizanet" },
      { nom: "Moussan", slug: "moussan" },
    ],
    faq: [
      {
        question: "Quels établissements de santé les ambulances de Narbonne desservent-elles ?",
        answer:
          "En premier lieu le Centre Hospitalier de Narbonne, boulevard Docteur Lacroix, qui compte 302 lits et places et dispose d'un service d'urgences ainsi que d'un SMUR ouverts 24 heures sur 24. Elles desservent aussi les deux établissements privés de la ville, la Polyclinique de Narbonne et la Clinique Sainte-Thérèse.",
      },
      {
        question: "Faut-il appeler une ambulance ou le 15 en cas d'urgence à Narbonne ?",
        answer:
          "En cas d'urgence vitale, composez toujours le 15 : le médecin régulateur du SAMU 11 décide des moyens à engager, y compris l'ambulance de garde du secteur. Pour un transport programmé ou une sortie d'hospitalisation, contactez directement une entreprise de l'annuaire avec votre prescription médicale.",
      },
      {
        question: "Combien coûte un transport en ambulance à Narbonne ?",
        answer:
          "Sur prescription médicale, l'Assurance maladie prend en charge 100 % du tarif conventionnel en cas d'affection de longue durée, d'accident du travail ou d'hospitalisation liée, et 55 % pour les autres motifs. Avec le tiers payant, pratiqué par la plupart des transporteurs, vous n'avancez pas les frais.",
      },
    ],
  },

  "narbonne/taxi-conventionne": {
    etablissements: [
      { nom: "Centre Hospitalier de Narbonne", slug: "centre-hospitalier-de-narbonne-hotel-dieu-11" },
    ],
    intro: [
      "À Narbonne, le transport assis conventionné répond à une demande constante : dialyse, séances de rééducation, consultations de suivi et examens d'imagerie au Centre Hospitalier de Narbonne, boulevard Docteur Lacroix, mais aussi rendez-vous à la Polyclinique de Narbonne ou à la Clinique Sainte-Thérèse. Le taxi conventionné s'adresse au patient qui marche, s'installe seul dans le véhicule et supporte sans difficulté la position assise pendant tout le trajet. Dès que l'état de santé impose le brancard ou une surveillance en cours de route, la prescription doit au contraire orienter vers l'ambulance.",
      "Le conventionnement n'est pas un simple argument commercial : il résulte d'une convention signée entre l'exploitant du taxi et la CPAM de l'Aude, qui fixe une tarification spécifique au transport de malades et autorise la facturation directe à l'Assurance maladie. Le chauffeur d'un taxi conventionné n'a en revanche aucune obligation de qualification sanitaire, à la différence de l'auxiliaire ambulancier qui conduit un VSL, et à plus forte raison de l'équipage d'ambulance dont un membre est diplômé d'État. Les deux véhicules de transport assis ouvrent pourtant exactement les mêmes droits au remboursement : c'est le prescripteur qui tranche selon votre état de santé et votre degré d'autonomie.",
      "Le remboursement s'élève à 100 % pour un transport rattaché à une affection de longue durée, à un accident du travail ou à une hospitalisation, et à 65 % dans les autres cas ; le tiers payant vous évite toute avance de frais. Pour les habitants de Vinassan, Armissan ou Moussan, la réservation anticipée est vivement conseillée, le nombre de véhicules conventionnés du bassin restant limité au regard des besoins, notamment en fin de matinée. Consultez ci-dessous les taxis conventionnés narbonnais référencés et leurs coordonnées directes.",
    ],
    voisines: [
      { nom: "Coursan", slug: "coursan" },
      { nom: "Vinassan", slug: "vinassan" },
      { nom: "Armissan", slug: "armissan" },
      { nom: "Bages", slug: "bages" },
      { nom: "Bizanet", slug: "bizanet" },
      { nom: "Moussan", slug: "moussan" },
    ],
    faq: [
      {
        question: "Comment réserver un taxi conventionné à Narbonne ?",
        answer:
          "Munissez-vous de votre prescription médicale de transport, puis appelez directement l'une des sociétés référencées dans l'annuaire. Pour une série de séances (dialyse, radiothérapie, rééducation), réservez à l'avance et si possible auprès du même transporteur : vos horaires de prise en charge seront beaucoup plus stables.",
      },
      {
        question: "Le taxi conventionné convient-il à un patient qui ne peut pas rester assis ?",
        answer:
          "Non. Le taxi conventionné est réservé au transport assis d'un patient autonome, capable de monter et descendre du véhicule sans aide. Si votre état impose la position allongée, l'usage d'un brancard ou une surveillance pendant le trajet, votre médecin prescrira une ambulance, dont l'équipage comprend un diplômé d'État ambulancier.",
      },
    ],
  },

  "lunel/ambulance": {
    etablissements: [
      { nom: "CHU de Montpellier", slug: "chu-montpellier-34" },
    ],
    intro: [
      "Lunel, à l'est de l'Hérault (34), possède son propre établissement public : le Centre Hospitalier de Lunel, place de la République, fort de 234 lits mais orienté pour l'essentiel vers la médecine et l'hébergement des personnes âgées en EHPAD. Les pathologies lourdes et les urgences ne sont pas traitées sur place : elles relèvent du CHU de Montpellier, avec lequel l'hôpital lunellois travaille en lien étroit. Cette organisation explique le volume important de transports allongés au départ de Lunel vers la métropole montpelliéraine.",
      "L'ambulance intervient dès que le patient ne peut voyager assis ou nécessite une surveillance : transfert du service de médecine lunellois vers un plateau technique montpelliérain, retour d'hospitalisation, entrée programmée en établissement. Le véhicule dispose d'un brancard, d'oxygène et de matériel de premiers secours, et l'équipage comprend un diplômé d'État ambulancier. Hors heures ouvrables, les sociétés du secteur participent à la garde ambulancière de l'Hérault, régulée sous l'égide du SAMU 34 (Centre 15), seul décideur de l'engagement d'un véhicule pour un transport urgent.",
      "Entre Petite Camargue et vignoble, le bassin lunellois compte de nombreuses communes peu denses — Marsillargues, Saturargues, Villetelle — où la desserte suppose des trajets d'approche significatifs ; indiquer clairement l'adresse et l'heure de convocation évite bien des retards. La prise en charge par l'Assurance maladie atteint 100 % en affection de longue durée, accident du travail ou hospitalisation liée, et 55 % pour les autres motifs, sur prescription médicale et généralement en tiers payant. Comparez ci-dessous les ambulances de Lunel référencées, avec téléphone direct et conventionnement CPAM.",
    ],
    voisines: [
      { nom: "Lunel-Viel", slug: "lunel-viel" },
      { nom: "Marsillargues", slug: "marsillargues" },
      { nom: "Saint-Just", slug: "saint-just" },
      { nom: "Saint-Nazaire-de-Pézan", slug: "saint-nazaire-de-pezan" },
      { nom: "Saturargues", slug: "saturargues" },
      { nom: "Villetelle", slug: "villetelle" },
    ],
    faq: [
      {
        question: "L'hôpital de Lunel dispose-t-il d'un service d'urgences ?",
        answer:
          "Le Centre Hospitalier de Lunel, place de la République, compte 234 lits mais son activité porte principalement sur la médecine et l'EHPAD. Les urgences et les pathologies lourdes sont orientées vers le CHU de Montpellier, avec lequel l'établissement travaille en lien étroit. C'est ce qui explique la fréquence des transports allongés entre Lunel et Montpellier.",
      },
      {
        question: "Qui décide de l'engagement d'une ambulance la nuit à Lunel ?",
        answer:
          "En dehors des heures ouvrables, la garde ambulancière de l'Hérault est régulée sous l'égide du SAMU 34 (Centre 15) : c'est le médecin régulateur qui déclenche l'ambulance de garde. Pour un transport programmé, en revanche, vous contactez directement l'entreprise de votre choix avec votre prescription médicale.",
      },
      {
        question: "Une ambulance de Lunel peut-elle me conduire jusqu'au CHU de Montpellier ?",
        answer:
          "Oui, et c'est un trajet très courant : les transferts vers les plateaux techniques montpelliérains constituent une part importante de l'activité des ambulanciers du secteur. Le transport allongé prescrit par un médecin est remboursé à 100 % en ALD, accident du travail ou hospitalisation liée, et à 55 % dans les autres cas.",
      },
    ],
  },

  "lunel/taxi-conventionne": {
    intro: [
      "Beaucoup de patients lunellois se rendent régulièrement à Montpellier pour des soins que le Centre Hospitalier de Lunel n'assure pas : oncologie, dialyse, chirurgie, consultations spécialisées. Quand la personne est autonome et peut rester assise, le taxi conventionné est le véhicule adapté à ces trajets d'une trentaine de kilomètres, souvent répétés plusieurs fois par semaine. Sur place, il dessert aussi l'hôpital de Lunel lui-même, dont l'activité se concentre sur la médecine et l'accompagnement des personnes âgées, pour les consultations et le suivi des résidents.",
      "Le taxi conventionné est un taxi ordinaire dont l'exploitant a conclu une convention avec la CPAM de l'Hérault : il applique une tarification encadrée et prend en charge le bon de transport, sans que son chauffeur soit tenu à une quelconque qualification sanitaire. C'est ce qui le distingue du VSL, conduit par un auxiliaire ambulancier, et bien sûr de l'ambulance, réservée au transport allongé ou médicalisé. Le mode de transport ne se choisit jamais librement : il figure sur la prescription établie par votre médecin, en fonction de votre autonomie réelle.",
      "Côté remboursement, comptez 100 % lorsque le déplacement se rattache à une affection de longue durée, à un accident du travail ou à une hospitalisation, et 65 % dans les autres cas, la part restante étant fréquemment couverte par la mutuelle. Le tiers payant s'applique sur présentation de la prescription et de la carte Vitale. Sur un secteur aussi étendu que celui de Lunel-Viel, Saint-Just ou Saint-Nazaire-de-Pézan, réserver la veille et fidéliser un même transporteur stabilise durablement les horaires. Retrouvez ci-dessous les taxis conventionnés du secteur lunellois.",
    ],
    voisines: [
      { nom: "Lunel-Viel", slug: "lunel-viel" },
      { nom: "Marsillargues", slug: "marsillargues" },
      { nom: "Saint-Just", slug: "saint-just" },
      { nom: "Saint-Nazaire-de-Pézan", slug: "saint-nazaire-de-pezan" },
      { nom: "Saturargues", slug: "saturargues" },
      { nom: "Villetelle", slug: "villetelle" },
    ],
    faq: [
      {
        question: "Un taxi conventionné de Lunel peut-il m'emmener à Montpellier ?",
        answer:
          "Oui. Comme le Centre Hospitalier de Lunel n'assure pas les prises en charge lourdes, les trajets vers les hôpitaux montpelliérains sont fréquents et parfaitement pris en charge dès lors que votre prescription mentionne un transport assis. Pour des séances répétées, réservez à l'avance auprès du même transporteur.",
      },
      {
        question: "Quel est le taux de remboursement d'un taxi conventionné dans l'Hérault ?",
        answer:
          "Il est de 100 % du tarif conventionnel si le transport est lié à une affection de longue durée, à un accident du travail ou à une hospitalisation, et de 65 % dans les autres cas, avec un complément fréquent de la mutuelle. Le tiers payant vous dispense d'avancer les frais sur présentation de la carte Vitale.",
      },
    ],
  },

  "le-vigan/ambulance": {
    intro: [
      "Le Vigan, sous-préfecture nichée dans les Cévennes gardoises (30), dispose d'un hôpital de proximité : le Centre Hospitalier du Vigan, avenue Emmanuel d'Alzon, qui regroupe 202 lits et places de médecine, de soins de suite et de réadaptation et d'EHPAD. Aucun service d'urgences lourdes n'y est confirmé : les urgences vitales sont orientées vers Nîmes ou Montpellier, à 69 à 81 kilomètres de routes de montagne. Sur ce territoire rural, le transport sanitaire dépasse donc largement la question du confort.",
      "L'ambulance ne se limite pas ici aux transferts de proximité : elle assure des évacuations longues, sur des routes sinueuses où le temps de trajet ne se déduit pas du kilométrage. L'équipage, dont un diplômé d'État ambulancier, dispose d'un brancard, d'oxygène et de matériel de premiers secours pour surveiller le patient pendant toute la durée du transport. La permanence de nuit, de week-end et des jours fériés est assurée par la garde ambulancière du département, régulée sous l'égide du SAMU 30 (Centre 15), qui déclenche le véhicule de garde selon la nature du besoin.",
      "Les communes environnantes — Aulas, Avèze, Molières-Cavaillac, Mandagout — comptent peu d'habitants et se répartissent sur un relief marqué ; réserver tôt, en précisant le hameau et les conditions d'accès, évite bien des difficultés. Le transport allongé prescrit par un médecin est remboursé à 100 % en affection de longue durée, accident du travail ou hospitalisation liée, et à 55 % pour les autres motifs, généralement sans avance de frais grâce au tiers payant. Comparez ci-dessous les ambulances intervenant sur Le Vigan et la vallée.",
    ],
    voisines: [
      { nom: "Aulas", slug: "aulas" },
      { nom: "Avèze", slug: "aveze" },
      { nom: "Molières-Cavaillac", slug: "molieres-cavaillac" },
      { nom: "Arphy", slug: "arphy" },
      { nom: "Mandagout", slug: "mandagout" },
      { nom: "Pommiers", slug: "pommiers" },
    ],
    faq: [
      {
        question: "Y a-t-il un service d'urgences à l'hôpital du Vigan ?",
        answer:
          "Le Centre Hospitalier du Vigan est un hôpital de proximité de 202 lits et places, dédié à la médecine, aux soins de suite et de réadaptation et à l'EHPAD ; aucun service d'urgences lourdes n'y est confirmé. Les urgences vitales sont orientées vers Nîmes ou Montpellier, à 69 à 81 kilomètres.",
      },
      {
        question: "Comment fonctionne la garde ambulancière autour du Vigan la nuit ?",
        answer:
          "Elle relève de la garde ambulancière du Gard, régulée sous l'égide du SAMU 30 (Centre 15). Le médecin régulateur engage l'ambulance de garde du secteur en fonction de la situation. En cas d'urgence vitale, composez le 15 ; pour un transport programmé, appelez directement une entreprise de l'annuaire.",
      },
      {
        question: "Faut-il prévoir plus de temps pour un transport en ambulance en Cévennes ?",
        answer:
          "Oui. Les routes de montagne de la vallée allongent la durée réelle du trajet bien au-delà de ce que suggère la distance, et les prises en charge dans les hameaux d'Arphy, Mandagout ou Pommiers demandent une approche soignée. Réservez tôt et précisez l'adresse exacte ainsi que les conditions d'accès au domicile.",
      },
    ],
  },

  "le-vigan/taxi-conventionne": {
    intro: [
      "Dans les Cévennes gardoises, le taxi conventionné n'est pas un service d'appoint : il constitue souvent le seul moyen réaliste de rejoindre un rendez-vous médical. Depuis Le Vigan, les patients autonomes l'utilisent pour les consultations et les séances programmées à Nîmes ou à Montpellier, distantes de 69 à 81 kilomètres, ainsi que pour les venues au Centre Hospitalier du Vigan, dont l'activité se concentre sur la médecine, les soins de suite et l'hébergement des personnes âgées. L'absence de service d'urgences lourdes sur place rend ces descentes vers la plaine particulièrement fréquentes.",
      "Concrètement, un taxi conventionné est un taxi dont l'exploitant a signé une convention avec la CPAM du Gard : tarification encadrée, acceptation du bon de transport, facturation directe à l'Assurance maladie. Son chauffeur n'est soumis à aucune obligation de formation sanitaire, ce qui le différencie de l'auxiliaire ambulancier au volant d'un VSL. Le transport se fait assis et suppose un patient capable de se déplacer seul ; en cas de fatigue importante ou de nécessité de surveillance, votre médecin prescrira un autre mode de transport.",
      "Sur un long trajet vers la plaine, le remboursement fait toute la différence : 100 % en affection de longue durée, accident du travail ou hospitalisation liée, 65 % dans les autres cas, avec tiers payant sur présentation de la prescription et de la carte Vitale. Les véhicules conventionnés du canton étant peu nombreux, il est prudent de réserver plusieurs jours à l'avance, en particulier pour les séries de séances et pour les prises en charge à Arphy, Pommiers ou Molières-Cavaillac. Retrouvez ci-dessous les taxis conventionnés du secteur.",
    ],
    voisines: [
      { nom: "Aulas", slug: "aulas" },
      { nom: "Avèze", slug: "aveze" },
      { nom: "Molières-Cavaillac", slug: "molieres-cavaillac" },
      { nom: "Arphy", slug: "arphy" },
      { nom: "Mandagout", slug: "mandagout" },
      { nom: "Pommiers", slug: "pommiers" },
    ],
    faq: [
      {
        question: "Un taxi conventionné du Vigan peut-il m'emmener à Nîmes ou à Montpellier ?",
        answer:
          "Oui, et c'est un usage courant : les urgences vitales et de nombreuses spécialités absentes de l'hôpital de proximité sont assurées à Nîmes ou à Montpellier, à 69 à 81 kilomètres. Dès lors que votre prescription mentionne un transport assis, la course est prise en charge dans les conditions habituelles.",
      },
      {
        question: "Combien de temps à l'avance faut-il réserver depuis Le Vigan ?",
        answer:
          "Le nombre de véhicules conventionnés du canton est limité et les trajets vers la plaine immobilisent un chauffeur plusieurs heures. Prévoyez donc plusieurs jours d'avance, surtout pour une série de séances, et regroupez si possible vos rendez-vous auprès du même transporteur.",
      },
    ],
  },

  "hyeres/ambulance": {
    etablissements: [
      { nom: "Centre Hospitalier Marie-José Treffot", slug: "centre-hospitalier-de-hyeres-marie-josee-treffot-83" },
      { nom: "Hôpital Renée Sabran", slug: "hopital-renee-sabran-hyeres-83" },
    ],
    intro: [
      "Hyères (83) présente une configuration sanitaire peu banale, répartie entre la ville, la presqu'île de Giens et les îles d'Or. Trois établissements structurent l'activité des ambulances locales : le Centre Hospitalier Marie-José Treffot, avenue Maréchal Juin, l'Hôpital Renée Sabran installé à Giens et géré par les Hospices Civils de Lyon, et l'Hôpital Privé Toulon Hyères-Sainte Marguerite. Cette dispersion géographique, doublée d'une circulation littorale très chargée en saison, fait de la maîtrise des itinéraires un véritable savoir-faire chez les équipages locaux agréés par l'ARS Provence-Alpes-Côte d'Azur.",
      "Le transport en ambulance concerne les patients qui doivent voyager allongés ou sous surveillance : sortie de bloc, retour à domicile après une hospitalisation lourde, transfert d'un établissement à un autre, entrée programmée en service de soins. Brancard, oxygène et matériel de premiers secours équipent le véhicule, et l'équipage comprend obligatoirement un diplômé d'État ambulancier. Hors heures ouvrables, les entreprises hyéroises prennent leur tour dans la garde ambulancière du Var, régulée sous l'égide du SAMU 83 (Centre 15) : l'engagement d'un véhicule pour un transport urgent relève alors de la seule décision du médecin régulateur.",
      "La desserte de la presqu'île et des communes voisines — La Crau, Carqueiranne, Le Pradet, La Londe-les-Maures — impose de prévoir des marges généreuses entre juin et septembre, lorsque le trafic sature les axes littoraux. Sur prescription médicale, l'Assurance maladie rembourse le transport allongé à 100 % en cas d'affection de longue durée, d'accident du travail ou d'hospitalisation liée, et à 55 % pour les autres motifs ; le tiers payant dispense d'avancer les frais. Comparez ci-dessous les ambulances d'Hyères référencées.",
    ],
    voisines: [
      { nom: "La Crau", slug: "la-crau" },
      { nom: "Carqueiranne", slug: "carqueiranne" },
      { nom: "La Londe-les-Maures", slug: "la-londe-les-maures" },
      { nom: "Le Pradet", slug: "le-pradet" },
      { nom: "La Garde", slug: "la-garde" },
    ],
    faq: [
      {
        question: "Quels établissements les ambulances d'Hyères desservent-elles ?",
        answer:
          "Le Centre Hospitalier Marie-José Treffot, avenue Maréchal Juin, l'Hôpital Renée Sabran à Giens, géré par les Hospices Civils de Lyon, et l'Hôpital Privé Toulon Hyères-Sainte Marguerite. Transferts entre ces sites, sorties d'hospitalisation et entrées programmées constituent l'essentiel de leur activité de transport allongé.",
      },
      {
        question: "Le trafic estival allonge-t-il les délais d'intervention à Hyères ?",
        answer:
          "Nettement, oui. Entre juin et septembre, les axes littoraux et la desserte de la presqu'île de Giens se saturent, ce qui peut doubler certains temps de parcours. Pour un transport programmé, réservez la veille et communiquez l'heure exacte de votre convocation afin que le transporteur ajuste son horaire de prise en charge.",
      },
      {
        question: "Qui organise la permanence des transports urgents dans le Var ?",
        answer:
          "La garde ambulancière du département est régulée sous l'égide du SAMU 83 (Centre 15). Les entreprises agréées assurent à tour de rôle la permanence la nuit, le week-end et les jours fériés, et c'est le médecin régulateur qui déclenche l'ambulance de garde. En cas d'urgence vitale, composez le 15.",
      },
    ],
  },

  "hyeres/taxi-conventionne": {
    etablissements: [
      { nom: "Centre Hospitalier Marie-José Treffot", slug: "centre-hospitalier-de-hyeres-marie-josee-treffot-83" },
      { nom: "Hôpital Renée Sabran de Giens", slug: "hopital-renee-sabran-hyeres-83" },
      { nom: "Hôpital Renée Sabran", slug: "hopital-renee-sabran-hyeres-83" },
    ],
    intro: [
      "Le taxi conventionné assure à Hyères l'essentiel des transports assis prescrits : consultations et examens au Centre Hospitalier Marie-José Treffot, séjours et suivis à l'Hôpital Renée Sabran de Giens, interventions et bilans à l'Hôpital Privé Toulon Hyères-Sainte Marguerite. Il s'adresse aux patients autonomes, capables de monter dans un véhicule de tourisme et de rester assis durant le trajet, soit la grande majorité des personnes suivies en dialyse, en radiothérapie ou en rééducation fonctionnelle sur le bassin hyérois. Les autres relèvent d'un transport allongé ou surveillé, donc de l'ambulance.",
      "Ce que recouvre le mot conventionné mérite une précision : il s'agit d'un taxi dont l'exploitant a signé une convention avec la CPAM du Var, ce qui l'engage sur une tarification encadrée et l'autorise à facturer directement l'Assurance maladie. Aucun diplôme sanitaire n'est requis du chauffeur, contrairement au VSL confié à un auxiliaire ambulancier et, a fortiori, à l'ambulance dont l'équipage comporte un diplômé d'État. Les droits au remboursement sont en revanche strictement identiques pour le taxi conventionné et le VSL : seule votre prescription détermine le véhicule qui viendra vous chercher.",
      "Le taux de prise en charge s'établit à 100 % pour un transport lié à une affection de longue durée, à un accident du travail ou à une hospitalisation, et à 65 % dans les autres cas, avec tiers payant sur présentation du bon de transport et de la carte Vitale. En haute saison, les temps de parcours entre Giens, le centre-ville et La Garde peuvent doubler : réservez la veille et indiquez l'heure précise de votre convocation. Retrouvez ci-dessous les taxis conventionnés hyérois référencés.",
    ],
    voisines: [
      { nom: "La Crau", slug: "la-crau" },
      { nom: "Carqueiranne", slug: "carqueiranne" },
      { nom: "La Londe-les-Maures", slug: "la-londe-les-maures" },
      { nom: "Le Pradet", slug: "le-pradet" },
      { nom: "La Garde", slug: "la-garde" },
    ],
    faq: [
      {
        question: "Un taxi conventionné peut-il desservir la presqu'île de Giens ?",
        answer:
          "Oui, notamment pour les venues à l'Hôpital Renée Sabran, géré par les Hospices Civils de Lyon. Il faut simplement anticiper : en période estivale, l'accès à la presqu'île est très ralenti, et le transporteur doit intégrer cette contrainte dans son horaire de prise en charge.",
      },
      {
        question: "Quelle est la différence entre taxi conventionné et VSL à Hyères ?",
        answer:
          "Le VSL est un véhicule sanitaire agréé par l'ARS, conduit par un auxiliaire ambulancier formé aux premiers secours ; le taxi conventionné est un taxi ayant signé une convention avec la CPAM du Var, sans qualification sanitaire obligatoire du chauffeur. Les deux transportent des patients assis et sont remboursés dans les mêmes conditions.",
      },
    ],
  },

  "la-seyne-sur-mer/ambulance": {
    etablissements: [
      { nom: "Clinique du Cap d'Or", slug: "clinique-du-cap-d-or-83" },
      { nom: "Hôpital George Sand", slug: "chits-ch-george-sand-83" },
    ],
    intro: [
      "La Seyne-sur-Mer (83) est desservie par l'Hôpital George Sand, avenue Jules Renard, hôpital de proximité de 319 lits rattaché au Centre Hospitalier Intercommunal Toulon-La Seyne-sur-Mer (CHITS) et positionné comme recours pour l'Ouest Var. Le plateau technique lourd du groupement se trouve toutefois à Toulon, sur le site Sainte-Musse (798 lits), qui abrite également le SAMU-SMUR et le Centre 15 du Var. La Clinique du Cap d'Or, avenue des Anciens Combattants d'Indochine, complète l'offre seynoise du côté privé, avec ses propres flux d'entrées programmées et de sorties d'hospitalisation.",
      "Cette répartition de part et d'autre de la rade génère un flux constant de transports allongés : passage de George Sand à Sainte-Musse pour un examen ou une intervention, retour à La Seyne en soins de suite, sortie d'hospitalisation vers le domicile. L'ambulance embarque brancard, oxygène et matériel de premiers secours, sous la responsabilité d'un équipage comprenant un diplômé d'État ambulancier. La nuit, le week-end et les jours fériés, les sociétés locales assurent la garde ambulancière du département, régulée sous l'égide du SAMU 83 (Centre 15).",
      "Six-Fours-les-Plages, Ollioules, Saint-Mandrier-sur-Mer et Le Revest-les-Eaux appartiennent au même bassin de prise en charge, où les ambulanciers seynois interviennent couramment, en tenant compte de la contrainte permanente du contournement de la rade et de la saturation des accès en fin de journée. Sur prescription médicale, le transport allongé est remboursé à 100 % en affection de longue durée, accident du travail ou hospitalisation liée, et à 55 % pour les autres motifs, le plus souvent sans avance de frais. Comparez ci-dessous les ambulances de La Seyne-sur-Mer référencées.",
    ],
    voisines: [
      { nom: "Six-Fours-les-Plages", slug: "six-fours-les-plages" },
      { nom: "Toulon", slug: "toulon" },
      { nom: "Ollioules", slug: "ollioules" },
      { nom: "Le Revest-les-Eaux", slug: "le-revest-les-eaux" },
      { nom: "Saint-Mandrier-sur-Mer", slug: "saint-mandrier-sur-mer" },
    ],
    faq: [
      {
        question: "L'Hôpital George Sand accueille-t-il les urgences de La Seyne-sur-Mer ?",
        answer:
          "L'Hôpital George Sand est un hôpital de proximité de 319 lits pour l'Ouest Var, rattaché au CHITS. Le plateau technique lourd du groupement, le SAMU-SMUR et le Centre 15 du Var se trouvent à Toulon, sur le site Sainte-Musse (798 lits). Beaucoup de transports allongés relient donc les deux sites.",
      },
      {
        question: "Comment sont organisés les transferts entre La Seyne et Toulon ?",
        answer:
          "Ils constituent une part importante de l'activité des ambulanciers seynois : examen ou intervention à Sainte-Musse, puis retour en soins de suite à George Sand ou au domicile. La distance est courte mais le contournement de la rade peut allonger fortement le trajet, ce qui justifie de réserver en indiquant l'heure de convocation.",
      },
      {
        question: "Qui déclenche une ambulance la nuit dans le Var ?",
        answer:
          "Le médecin régulateur du SAMU 83 (Centre 15), installé sur le site Sainte-Musse à Toulon, engage l'ambulance de garde dans le cadre de la garde ambulancière du département. En cas d'urgence vitale, composez le 15 ; pour un transport programmé, contactez directement une entreprise de l'annuaire.",
      },
    ],
  },

  "la-seyne-sur-mer/taxi-conventionne": {
    etablissements: [
      { nom: "Clinique du Cap d'Or", slug: "clinique-du-cap-d-or-83" },
      { nom: "Hôpital George Sand", slug: "chits-ch-george-sand-83" },
    ],
    intro: [
      "Pour un patient seynois autonome, le taxi conventionné couvre la plupart des déplacements prescrits : consultations à l'Hôpital George Sand, examens et interventions sur le site Sainte-Musse du CHITS à Toulon, prises en charge à la Clinique du Cap d'Or. Le trajet vers Toulon, court en distance mais souvent long en durée aux heures de pointe, revient plusieurs fois par semaine dans les protocoles de dialyse ou de radiothérapie. D'où l'intérêt de travailler avec un transporteur qui connaît le contournement de la rade.",
      "Un taxi conventionné reste un taxi : son exploitant a simplement signé une convention avec la CPAM du Var, laquelle encadre les tarifs applicables au transport de malades et permet la facturation directe à l'Assurance maladie. Le chauffeur n'a pas d'obligation de qualification sanitaire, et c'est la différence essentielle avec le VSL, conduit par un auxiliaire ambulancier, comme avec l'ambulance dont l'équipage comporte un diplômé d'État. Le transport se fait assis et suppose que vous puissiez vous installer puis sortir du véhicule sans aide.",
      "Le remboursement atteint 100 % si le transport se rattache à une affection de longue durée, à un accident du travail ou à une hospitalisation, et 65 % dans les autres situations ; le tiers payant évite toute avance de frais sur présentation de la prescription et de la carte Vitale. Les patients de Six-Fours-les-Plages, Ollioules ou Saint-Mandrier-sur-Mer partagent le même vivier de véhicules : réserver à l'avance, surtout pour des séances répétées, reste la meilleure façon de sécuriser ses horaires. Retrouvez ci-dessous les taxis conventionnés référencés.",
    ],
    voisines: [
      { nom: "Six-Fours-les-Plages", slug: "six-fours-les-plages" },
      { nom: "Toulon", slug: "toulon" },
      { nom: "Ollioules", slug: "ollioules" },
      { nom: "Le Revest-les-Eaux", slug: "le-revest-les-eaux" },
      { nom: "Saint-Mandrier-sur-Mer", slug: "saint-mandrier-sur-mer" },
    ],
    faq: [
      {
        question: "Un taxi conventionné de La Seyne peut-il m'emmener à Sainte-Musse ?",
        answer:
          "Oui. Le site Sainte-Musse du CHITS, à Toulon, concentre le plateau technique lourd du groupement : consultations spécialisées, examens et interventions y sont fréquents pour les patients seynois. Dès lors que votre prescription mentionne un transport assis, la course est prise en charge dans les conditions habituelles.",
      },
      {
        question: "Faut-il réserver longtemps à l'avance à La Seyne-sur-Mer ?",
        answer:
          "C'est vivement conseillé, car les véhicules conventionnés desservent aussi Six-Fours-les-Plages, Ollioules et Saint-Mandrier-sur-Mer, et le contournement de la rade allonge les rotations. Pour une série de séances, réservez à l'avance auprès du même transporteur afin de fixer des horaires stables.",
      },
    ],
  },

  "saint-raphael/ambulance": {
    etablissements: [
      { nom: "Centre Hospitalier Intercommunal Fréjus", slug: "centre-hospitalier-inter-communal-de-frejus-saint-raphael-83" },
    ],
    intro: [
      "Saint-Raphaël (83) forme avec Fréjus une même agglomération sanitaire, articulée autour du Centre Hospitalier Intercommunal Fréjus/Saint-Raphaël, dit CHI Bonnet. Un point mérite d'être connu des patients : le site principal, qui porte le gros du plateau technique, se situe à Fréjus, avenue de Saint-Lambert, tandis que Saint-Raphaël accueille le site de gérontologie et de soins de suite et de réadaptation, boulevard Georges Clemenceau. La Clinique Notre-Dame de la Merci, avenue du Maréchal Lyautey, complète l'offre raphaëloise du côté privé et alimente elle aussi la demande de transport sanitaire sur la commune.",
      "Cette organisation bi-site explique la place du transport allongé sur la commune : navettes entre les deux sites du CHI, entrées en soins de suite après une hospitalisation aiguë, retours à domicile en fin de séjour. L'ambulance, armée d'un brancard, d'oxygène et de matériel de premiers secours et servie par un équipage comprenant un diplômé d'État ambulancier, s'impose dès que le patient ne peut voyager assis. La permanence hors heures ouvrables est assurée par la garde ambulancière du Var, régulée sous l'égide du SAMU 83 (Centre 15).",
      "L'Estérel et la basse vallée de l'Argens dessinent un secteur d'intervention étendu, de Roquebrune-sur-Argens et Puget-sur-Argens jusqu'aux Adrets-de-l'Estérel, où l'affluence touristique estivale allonge fortement les temps de parcours. Sur prescription médicale, l'Assurance maladie rembourse le transport en ambulance à 100 % en cas d'affection de longue durée, d'accident du travail ou d'hospitalisation liée, et à 55 % pour les autres motifs, généralement en tiers payant : vous ne réglez alors rien sur présentation du bon de transport et de la carte Vitale. Comparez ci-dessous les ambulances de Saint-Raphaël référencées, avec leur téléphone direct et leur statut de conventionnement.",
    ],
    voisines: [
      { nom: "Fréjus", slug: "frejus" },
      { nom: "Roquebrune-sur-Argens", slug: "roquebrune-sur-argens" },
      { nom: "Puget-sur-Argens", slug: "puget-sur-argens" },
      { nom: "Les Adrets-de-l'Estérel", slug: "les-adrets-de-l-esterel" },
    ],
    faq: [
      {
        question: "Où se trouve le plateau technique du CHI Fréjus/Saint-Raphaël ?",
        answer:
          "Le site principal du CHI Bonnet est implanté à Fréjus, avenue de Saint-Lambert. Saint-Raphaël accueille pour sa part le site de gérontologie et de soins de suite et de réadaptation, boulevard Georges Clemenceau. Les navettes entre ces deux sites représentent une part significative des transports allongés du secteur.",
      },
      {
        question: "Une ambulance de Saint-Raphaël intervient-elle à Fréjus ou Roquebrune-sur-Argens ?",
        answer:
          "Oui, l'agrément couvre un secteur d'intervention et non une seule commune. Les ambulanciers raphaëlois desservent couramment Fréjus, Roquebrune-sur-Argens, Puget-sur-Argens et Les Adrets-de-l'Estérel, qui relèvent du même bassin hospitalier intercommunal.",
      },
      {
        question: "Comment est régulée la garde ambulancière dans le Var ?",
        answer:
          "Hors heures ouvrables, les entreprises agréées assurent à tour de rôle la garde ambulancière du département, régulée sous l'égide du SAMU 83 (Centre 15). C'est le médecin régulateur qui engage l'ambulance de garde. Pour une urgence vitale, composez le 15 ; pour un transport programmé, appelez directement un transporteur de l'annuaire.",
      },
    ],
  },

  "saint-raphael/taxi-conventionne": {
    intro: [
      "À Saint-Raphaël, une bonne part des transports assis prescrits ne s'arrête pas dans la commune : le site principal du CHI Bonnet, où se concentrent les consultations et les examens, se trouve à Fréjus, avenue de Saint-Lambert. Le site raphaëlois du boulevard Georges Clemenceau est dédié à la gérontologie et aux soins de suite et de réadaptation, tandis que la Clinique Notre-Dame de la Merci accueille les patients du secteur privé. Le taxi conventionné assure quotidiennement ces liaisons courtes mais très répétitives, notamment pour les patients en protocole suivi.",
      "Le conventionnement désigne une convention signée entre l'exploitant du taxi et la CPAM du Var : elle fixe une tarification propre au transport de malades assis et autorise la facturation directe à l'Assurance maladie. À la différence du VSL, conduit par un auxiliaire ambulancier, le chauffeur d'un taxi conventionné n'est soumis à aucune obligation de qualification sanitaire. Ce mode suppose donc un patient valide et autonome ; l'ambulance reste réservée aux transports allongés ou nécessitant une surveillance pendant le trajet.",
      "Vous serez remboursé à 100 % si le transport découle d'une affection de longue durée, d'un accident du travail ou d'une hospitalisation, et à 65 % dans les autres cas, sans avance de frais grâce au tiers payant appliqué sur présentation du bon de transport et de la carte Vitale. Entre juin et septembre, les axes de l'Estérel et le front de mer se saturent : prévoyez une marge confortable et réservez la veille, en particulier depuis Roquebrune-sur-Argens, Puget-sur-Argens ou Les Adrets-de-l'Estérel. Retrouvez ci-dessous les taxis conventionnés de Saint-Raphaël référencés, avec leurs coordonnées directes.",
    ],
    voisines: [
      { nom: "Fréjus", slug: "frejus" },
      { nom: "Roquebrune-sur-Argens", slug: "roquebrune-sur-argens" },
      { nom: "Puget-sur-Argens", slug: "puget-sur-argens" },
      { nom: "Les Adrets-de-l'Estérel", slug: "les-adrets-de-l-esterel" },
    ],
    faq: [
      {
        question: "Mon rendez-vous est à Fréjus : le taxi conventionné est-il pris en charge ?",
        answer:
          "Oui. Le remboursement ne dépend pas de la commune de destination mais de votre prescription et de votre situation : 100 % en affection de longue durée, accident du travail ou hospitalisation liée, 65 % sinon. Les trajets vers le site principal du CHI Bonnet, à Fréjus, sont parmi les plus fréquents du secteur.",
      },
      {
        question: "Comment éviter un retard en saison à Saint-Raphaël ?",
        answer:
          "Réservez la veille, communiquez l'heure exacte de votre convocation et acceptez une prise en charge un peu plus tôt que d'habitude. Entre juin et septembre, la corniche de l'Estérel et les accès au front de mer ralentissent fortement la circulation, ce qui pèse sur les rotations des véhicules conventionnés.",
      },
    ],
  },

  "brest/ambulance": {
    etablissements: [
      { nom: "hôpital de la Cavale Blanche", slug: "chru-brest-site-hopital-la-cavale-blanche-29" },
      { nom: "hôpital Augustin-Morvan", slug: "chru-brest-site-hopital-morvan-29" },
    ],
    intro: [
      "Le CHRU de Brest fonctionne sur deux pôles bien distincts : l'hôpital Augustin-Morvan, siège du CHU, installé en centre-ville avenue Foch, et l'hôpital de la Cavale Blanche, à l'ouest de l'agglomération, qui regroupe la majorité des services et les urgences. Cette dualité structure le quotidien des entreprises d'ambulances agréées par l'ARS Bretagne implantées à Brest (29) : une part notable de leur activité consiste à convoyer des patients allongés d'un site à l'autre, ou vers les autres implantations du CHRU, qui en compte neuf au total, dont Bohars pour la psychiatrie et Carhaix.",
      "L'ambulance n'est pas un simple véhicule de transport : elle est prescrite lorsque l'état du patient impose la position allongée ou une surveillance pendant le trajet. L'équipage comprend au moins un diplômé d'État ambulancier (DEA) et le véhicule embarque brancard, oxygène et matériel de premiers secours. Sortie de bloc, retour à domicile après une hospitalisation lourde, entrée programmée, transfert vers un plateau technique : les motifs varient, mais tous reposent sur une prescription médicale de transport. Les sociétés brestoises participent par ailleurs à la garde ambulancière du Finistère, régulée sous l'égide du SAMU 29 (Centre 15) en dehors des heures ouvrables.",
      "Brest exerce une fonction de recours pour toute la pointe bretonne, du Léon à la presqu'île de Crozon, ce qui allonge sensiblement certains trajets et rend la réservation anticipée d'autant plus utile. Côté prise en charge, l'Assurance maladie rembourse le transport en ambulance à 100 % en cas d'affection longue durée, d'accident du travail ou d'hospitalisation liée, et à 55 % pour les autres motifs ; la plupart des transporteurs pratiquent le tiers payant sur présentation du bon de transport et de la carte Vitale. Comparez ci-dessous les ambulances brestoises référencées, avec téléphone direct et conventionnement CPAM vérifié.",
    ],
    voisines: [
      { nom: "Guipavas", slug: "guipavas" },
      { nom: "Plouzané", slug: "plouzane" },
      { nom: "Le Relecq-Kerhuon", slug: "le-relecq-kerhuon" },
      { nom: "Guilers", slug: "guilers" },
      { nom: "Bohars", slug: "bohars" },
      { nom: "Gouesnou", slug: "gouesnou" },
    ],
    faq: [
      {
        question: "Quels sites hospitaliers les ambulances de Brest desservent-elles ?",
        answer:
          "Elles desservent les deux grands sites du CHRU de Brest : l'hôpital Augustin-Morvan, siège du CHU en centre-ville, et l'hôpital de la Cavale Blanche, qui concentre la majorité des services et les urgences. Le CHRU compte neuf sites au total, dont Bohars pour la psychiatrie et Carhaix, ce qui génère de nombreux transferts inter-établissements.",
      },
      {
        question: "Ambulance ou taxi conventionné : comment choisir à Brest ?",
        answer:
          "Le choix ne vous appartient pas : il est porté par le médecin sur la prescription médicale de transport. L'ambulance s'impose si vous devez voyager allongé ou rester sous surveillance, avec un équipage comprenant un diplômé d'État ambulancier. Si vous pouvez faire le trajet assis et sans assistance, c'est le transport assis, en taxi conventionné ou en VSL, qui sera prescrit.",
      },
      {
        question: "Qui contacter la nuit ou le week-end à Brest pour un transport sanitaire ?",
        answer:
          "En cas d'urgence vitale, composez le 15 : le SAMU 29 régule et engage les moyens nécessaires. Pour les transports urgents non vitaux en dehors des heures ouvrables, la garde ambulancière du Finistère, organisée sous l'égide du SAMU 29, assure une permanence. Un transport programmé se réserve, lui, directement auprès d'une entreprise de l'annuaire.",
      },
    ],
  },

  "brest/taxi-conventionne": {
    etablissements: [
      { nom: "hôpital de la Cavale Blanche", slug: "chru-brest-site-hopital-la-cavale-blanche-29" },
      { nom: "hôpital Augustin-Morvan", slug: "chru-brest-site-hopital-morvan-29" },
    ],
    intro: [
      "À Brest (29), le taxi conventionné prend en charge les transports assis remboursés par l'Assurance maladie : consultations de suivi, séances de soins répétées, examens d'imagerie, entrées et sorties d'hospitalisation lorsque l'état de santé le permet. Il s'adresse aux patients autonomes, capables de monter dans un véhicule ordinaire et de rester assis pendant le trajet, sans brancard ni surveillance. C'est le mode de transport le plus couramment prescrit vers les deux grands sites du CHRU, l'hôpital Augustin-Morvan en centre-ville et l'hôpital de la Cavale Blanche à l'ouest de l'agglomération brestoise.",
      "Un taxi conventionné est un taxi qui a signé une convention avec la CPAM du Finistère. Cette convention fixe le tarif applicable au transport de patients, distinct de la course commerciale ordinaire, et ouvre droit au tiers payant : vous ne réglez rien au chauffeur dès lors que vous lui remettez votre prescription médicale de transport et votre carte Vitale. À la différence de l'ambulancier, le chauffeur n'est soumis à aucune qualification sanitaire obligatoire — c'est précisément ce qui sépare ce service de l'ambulance, réservée aux patients allongés ou placés sous surveillance.",
      "La géographie locale compte : les patients venus de Guipavas, de Plouzané ou du Relecq-Kerhuon traversent une agglomération étalée, et les rendez-vous du matin imposent souvent un départ très tôt. Réserver la veille, et si possible auprès du même transporteur lorsqu'une série de séances est prescrite, reste la meilleure façon de stabiliser ses horaires. Le remboursement atteint 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et 65 % dans les autres cas, la mutuelle prenant généralement le complément. Retrouvez ci-dessous les taxis conventionnés brestois référencés.",
    ],
    voisines: [
      { nom: "Guipavas", slug: "guipavas" },
      { nom: "Le Relecq-Kerhuon", slug: "le-relecq-kerhuon" },
      { nom: "Plouzané", slug: "plouzane" },
      { nom: "Gouesnou", slug: "gouesnou" },
      { nom: "Guilers", slug: "guilers" },
      { nom: "Bohars", slug: "bohars" },
    ],
    faq: [
      {
        question: "Faut-il avancer les frais d'un taxi conventionné à Brest ?",
        answer:
          "Non, dans la très grande majorité des cas. Les taxis conventionnés avec la CPAM du Finistère pratiquent le tiers payant : vous présentez votre prescription médicale de transport et votre carte Vitale, le chauffeur se fait régler directement par l'Assurance maladie. Seule la part non remboursée peut rester due, et elle est le plus souvent couverte par la mutuelle.",
      },
      {
        question: "Un taxi conventionné brestois peut-il me conduire à la Cavale Blanche depuis une commune voisine ?",
        answer:
          "Oui. Les taxis conventionnés du Finistère ne sont pas limités à leur commune de stationnement et desservent l'ensemble du bassin brestois, notamment depuis Guipavas, Le Relecq-Kerhuon, Gouesnou ou Plouzané, vers l'hôpital de la Cavale Blanche comme vers l'hôpital Augustin-Morvan. Précisez le site exact et l'heure de convocation lors de la réservation.",
      },
    ],
  },

  "clermont-ferrand/ambulance": {
    etablissements: [
      { nom: "hôpital Gabriel-Montpied", slug: "hopital-gabriel-montpied-chu-clermont-ferrand-63" },
      { nom: "hôpital Estaing", slug: "hopital-estaing-chu-clermont-ferrand-63" },
      { nom: "hôpital Louise-Michel", slug: "hopital-louise-michel-chu-clermont-ferrand-63" },
    ],
    intro: [
      "Le CHU de Clermont-Ferrand se déploie sur trois implantations aux vocations nettement séparées : l'hôpital Gabriel-Montpied, rue Montalembert, qui abrite les urgences adultes ainsi que le SAMU et le SMUR du Puy-de-Dôme ; l'hôpital Estaing, place Lucie et Raymond Aubrac, dédié à la femme et à l'enfant ; l'hôpital Louise-Michel, à Cébazat, orienté vers la gériatrie. Les entreprises d'ambulances agréées par l'ARS Auvergne-Rhône-Alpes et installées à Clermont-Ferrand (63) organisent leur activité autour de ce triangle, établissement de référence pour toute l'Auvergne.",
      "Une ambulance est prescrite dans deux situations : le patient ne peut voyager qu'allongé, ou son état exige une surveillance durant le trajet. Le véhicule, agréé par l'ARS, embarque un brancard, de l'oxygène et le matériel de premiers secours, et circule avec un équipage de deux personnes dont au moins un diplômé d'État ambulancier. Il faut distinguer ce transport sanitaire du SMUR basé à Gabriel-Montpied, qui relève de l'urgence médicalisée : les sociétés privées assurent, elles, les transferts, les sorties d'hospitalisation et les entrées programmées, et prennent leur tour dans la garde ambulancière du département, régulée sous l'égide du SAMU 63 (Centre 15).",
      "La topographie du Puy-de-Dôme pèse sur les délais : entre le plateau clermontois, les communes d'altitude et les vallées, un même kilométrage ne se parcourt pas au même rythme selon la saison, et l'hiver impose une marge supplémentaire. Sur prescription médicale, l'Assurance maladie rembourse le transport en ambulance à 100 % en affection longue durée, en accident du travail ou pour une hospitalisation liée, et à 55 % dans les autres cas ; le tiers payant est la règle chez la plupart des transporteurs. Comparez ci-dessous les ambulances clermontoises référencées.",
    ],
    voisines: [
      { nom: "Chamalières", slug: "chamalieres" },
      { nom: "Aubière", slug: "aubiere" },
      { nom: "Beaumont", slug: "beaumont" },
      { nom: "Cébazat", slug: "cebazat" },
      { nom: "Royat", slug: "royat" },
      { nom: "Cournon-d'Auvergne", slug: "cournon-d-auvergne" },
    ],
    faq: [
      {
        question: "Vers quels sites du CHU les ambulances de Clermont-Ferrand transportent-elles ?",
        answer:
          "Vers l'hôpital Gabriel-Montpied, qui accueille les urgences adultes, vers l'hôpital Estaing pour les prises en charge de la femme et de l'enfant, et vers l'hôpital Louise-Michel à Cébazat pour la gériatrie. Les transferts entre ces trois sites représentent une part importante de l'activité de transport allongé de l'agglomération.",
      },
      {
        question: "Une ambulance privée et le SMUR, est-ce la même chose à Clermont-Ferrand ?",
        answer:
          "Non. Le SMUR, basé à l'hôpital Gabriel-Montpied avec le SAMU 63, intervient sur décision du Centre 15 pour des urgences nécessitant une équipe médicale. Une entreprise d'ambulances privée agréée assure les transports sanitaires prescrits : transferts, sorties d'hospitalisation, entrées programmées, et participe à la garde ambulancière départementale pour les transports urgents hors heures ouvrables.",
      },
      {
        question: "Combien coûte une ambulance à Clermont-Ferrand pour le patient ?",
        answer:
          "Avec une prescription médicale de transport, l'Assurance maladie prend en charge 100 % du tarif conventionné en cas d'affection longue durée, d'accident du travail ou d'hospitalisation liée, et 55 % pour les autres motifs. Le tiers payant, pratiqué par la plupart des ambulances du Puy-de-Dôme, vous évite d'avancer les frais.",
      },
    ],
  },

  "clermont-ferrand/taxi-conventionne": {
    intro: [
      "Ce sont les traitements qui reviennent plusieurs fois par semaine — dialyse, radiothérapie, séances de rééducation — qui remplissent l'essentiel des carnets de courses des taxis conventionnés de Clermont-Ferrand (63). Le principe est simple : lorsque le patient peut faire le trajet assis, sans brancard ni surveillance, le médecin prescrit un transport assis, et le taxi conventionné en est le vecteur le plus répandu. S'y ajoutent les consultations de suivi, les bilans et les examens d'imagerie, qui représentent l'autre grande part de l'activité.",
      "Le conventionnement est ce qui change tout : un taxi conventionné a signé une convention avec la CPAM du Puy-de-Dôme, qui encadre son tarif de transport de patients et l'autorise à pratiquer le tiers payant. Le chauffeur n'a en revanche aucune qualification sanitaire obligatoire, contrairement à l'auxiliaire ambulancier qui conduit un VSL ou au diplômé d'État ambulancier d'une ambulance. Les deux formules de transport assis, taxi conventionné et VSL, ouvrent exactement les mêmes droits ; c'est la prescription qui tranche.",
      "Les destinations les plus fréquentes restent les sites du CHU : Gabriel-Montpied pour la plupart des consultations adultes, Estaing pour la mère et l'enfant, Louise-Michel à Cébazat pour la gériatrie. Depuis Chamalières, Aubière, Beaumont ou Cournon-d'Auvergne, les créneaux de circulation du matin sont chargés, ce qui plaide pour une réservation la veille et, sur une série de séances, pour la fidélité à un même transporteur. Le remboursement est de 100 % en affection longue durée, en accident du travail ou pour une hospitalisation liée, et de 65 % sinon. Retrouvez ci-dessous les taxis conventionnés référencés.",
    ],
    voisines: [
      { nom: "Chamalières", slug: "chamalieres" },
      { nom: "Aubière", slug: "aubiere" },
      { nom: "Cébazat", slug: "cebazat" },
      { nom: "Beaumont", slug: "beaumont" },
      { nom: "Cournon-d'Auvergne", slug: "cournon-d-auvergne" },
      { nom: "Royat", slug: "royat" },
    ],
    faq: [
      {
        question: "Quelle différence entre taxi conventionné et VSL à Clermont-Ferrand ?",
        answer:
          "Le VSL est un véhicule sanitaire léger agréé par l'ARS, conduit par un auxiliaire ambulancier formé aux premiers secours. Le taxi conventionné est un taxi ayant signé une convention avec la CPAM, sans qualification sanitaire obligatoire pour son chauffeur. Les deux transportent des patients assis et sont remboursés dans les mêmes conditions : le médecin indique sur la prescription le mode adapté à votre état.",
      },
      {
        question: "Un taxi conventionné peut-il assurer mes séances de dialyse à Clermont-Ferrand ?",
        answer:
          "Oui, c'est même l'un de ses usages les plus fréquents dès lors que le transport assis est prescrit. Pour un traitement répété, réservez à l'avance et privilégiez le même transporteur sur toute la série : vos horaires s'en trouvent stabilisés et le circuit est mieux anticipé. Le remboursement atteint 100 % du tarif conventionné dans le cadre d'une affection longue durée.",
      },
    ],
  },

  "boulogne-sur-mer/ambulance": {
    etablissements: [
      { nom: "Centre Hospitalier Duchenne", slug: "centre-hospitalier-duchenne-de-boulogne-sur-mer-62" },
    ],
    intro: [
      "Premier port de pêche français, Boulogne-sur-Mer (62) dispose d'un établissement au poids inhabituel pour une ville de cette taille : le Centre Hospitalier Duchenne, allée Jacques Monod, qui compte environ 1 060 à 1 080 lits. Il abrite un SMUR et assure également une mission de secours médicalisé en mer, particularité directement liée à l'activité maritime du littoral. À proximité, le CMCO Côte d'Opale, établissement privé implanté à Saint-Martin-Boulogne, complète l'offre du secteur. Les entreprises d'ambulances agréées par l'ARS Hauts-de-France desservent l'un comme l'autre.",
      "Le transport en ambulance répond à un critère précis : l'impossibilité de voyager assis, ou la nécessité d'une surveillance pendant le trajet. Brancard, oxygène et matériel de premiers secours équipent le véhicule, et l'équipage comprend au moins un diplômé d'État ambulancier. Concrètement, cela couvre les sorties de bloc, les retours à domicile après une hospitalisation lourde, les entrées programmées et les transferts entre établissements. En dehors des heures ouvrables, la garde ambulancière du département prend le relais pour les transports urgents, régulée sous l'égide du SAMU 62 (Centre 15).",
      "Le bassin boulonnais s'étire le long de la côte, d'Outreau et Le Portel au sud jusqu'à Wimille et Wimereux au nord, avec une topographie de falaises et de vallons qui rallonge les liaisons. Sur prescription médicale, l'Assurance maladie rembourse 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et 55 % pour les autres motifs ; le tiers payant vous dispense d'avancer les frais. Comparez ci-dessous les ambulances de Boulogne-sur-Mer référencées, avec téléphone direct et conventionnement vérifié.",
    ],
    voisines: [
      { nom: "Saint-Martin-Boulogne", slug: "saint-martin-boulogne" },
      { nom: "Outreau", slug: "outreau" },
      { nom: "Le Portel", slug: "le-portel" },
      { nom: "Wimille", slug: "wimille" },
      { nom: "Saint-Léonard", slug: "saint-leonard" },
      { nom: "Wimereux", slug: "wimereux" },
    ],
    faq: [
      {
        question: "Quels établissements les ambulances de Boulogne-sur-Mer desservent-elles ?",
        answer:
          "Principalement le Centre Hospitalier Duchenne, allée Jacques Monod, qui constitue le grand plateau technique du secteur avec son SMUR, ainsi que le CMCO Côte d'Opale, établissement privé situé à Saint-Martin-Boulogne. Sorties d'hospitalisation, entrées programmées et transferts inter-établissements forment le cœur de leur activité.",
      },
      {
        question: "Le Centre Hospitalier Duchenne assure-t-il des secours en mer ?",
        answer:
          "Oui, le Centre Hospitalier Duchenne dispose d'un SMUR et d'une mission de secours médicalisé en mer, en cohérence avec l'activité du premier port de pêche français. Cette mission relève de l'urgence régulée par le Centre 15 et non du transport sanitaire prescrit assuré par les entreprises d'ambulances de l'annuaire.",
      },
      {
        question: "Comment est organisée la permanence des transports la nuit à Boulogne-sur-Mer ?",
        answer:
          "Les entreprises agréées du secteur prennent leur tour dans la garde ambulancière du département, régulée sous l'égide du SAMU 62 (Centre 15), qui couvre la nuit, les week-ends et les jours fériés. Pour une urgence vitale, composez le 15 ; pour un transport programmé, réservez directement auprès d'un transporteur référencé.",
      },
    ],
  },

  "boulogne-sur-mer/taxi-conventionne": {
    etablissements: [
      { nom: "Centre Hospitalier Duchenne", slug: "centre-hospitalier-duchenne-de-boulogne-sur-mer-62" },
    ],
    intro: [
      "Un taxi conventionné n'est pas un taxi ordinaire qui accepterait les patients : c'est un taxi ayant signé une convention avec l'Assurance maladie, laquelle fixe le tarif applicable aux transports prescrits et autorise le tiers payant. À Boulogne-sur-Mer (62), ce service assure les trajets assis vers le Centre Hospitalier Duchenne, allée Jacques Monod, et vers le CMCO Côte d'Opale à Saint-Martin-Boulogne : consultations, examens, séances de soins répétées, entrées et sorties d'hospitalisation quand l'état du patient le permet.",
      "La condition est l'autonomie : monter dans un véhicule ordinaire, rester assis pendant le trajet, se passer de surveillance. Si l'un de ces trois points n'est pas rempli, c'est une ambulance qui sera prescrite, avec brancard, oxygène et diplômé d'État ambulancier à bord. Le chauffeur de taxi conventionné, lui, n'est soumis à aucune qualification sanitaire obligatoire : son rôle est le transport, encadré par la convention et par la prescription médicale que vous lui remettez avec votre carte Vitale.",
      "Sur le littoral boulonnais, les patients d'Outreau, du Portel, de Wimille ou de Wimereux composent avec une desserte qui suit le relief côtier ; une réservation la veille sécurise les convocations matinales, et solliciter le même transporteur pour une série de séances évite de réexpliquer chaque fois le circuit. La prise en charge s'élève à 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et à 65 % dans les autres cas. Retrouvez ci-dessous les taxis conventionnés boulonnais référencés.",
    ],
    voisines: [
      { nom: "Saint-Martin-Boulogne", slug: "saint-martin-boulogne" },
      { nom: "Outreau", slug: "outreau" },
      { nom: "Wimereux", slug: "wimereux" },
      { nom: "Le Portel", slug: "le-portel" },
      { nom: "Saint-Léonard", slug: "saint-leonard" },
      { nom: "Wimille", slug: "wimille" },
    ],
    faq: [
      {
        question: "Quels établissements dessert un taxi conventionné à Boulogne-sur-Mer ?",
        answer:
          "Le Centre Hospitalier Duchenne, principal plateau technique du secteur, et le CMCO Côte d'Opale, établissement privé de Saint-Martin-Boulogne, sont les destinations les plus fréquentes. Le taxi conventionné convient aux consultations de suivi, aux examens et aux séances de soins répétées, dès lors que le transport assis figure sur la prescription.",
      },
      {
        question: "Quel est le taux de remboursement d'un taxi conventionné dans le Pas-de-Calais ?",
        answer:
          "Le remboursement atteint 100 % du tarif conventionné en cas d'affection longue durée, d'accident du travail ou d'hospitalisation liée, et 65 % pour les autres motifs, la mutuelle complétant généralement la part restante. Une prescription médicale de transport est indispensable, et le tiers payant évite d'avancer les frais.",
      },
    ],
  },

  "bayeux/ambulance": {
    intro: [
      "À Bayeux (14), le Centre Hospitalier installé 13 rue de Nesmond ne fonctionne pas seul : il forme un groupement avec le site d'Aunay-sur-Odon, organisation qui génère des liaisons régulières entre les deux implantations. Les entreprises d'ambulances agréées par l'ARS Normandie et implantées dans le Bessin assurent ces transports allongés, aux côtés des sorties d'hospitalisation, des entrées programmées et des transferts vers les plateaux techniques de recours lorsque la prise en charge dépasse les capacités locales.",
      "Ce qui définit l'ambulance, c'est l'état du patient : dès qu'il ne peut plus voyager assis, ou qu'une surveillance s'impose pendant le trajet, le médecin coche l'ambulance sur la prescription médicale de transport. Le véhicule agréé embarque brancard, oxygène et matériel de premiers secours, et l'équipage compte au moins un diplômé d'État ambulancier. Les sociétés du secteur prennent également leur tour dans la garde ambulancière du Calvados, régulée sous l'égide du SAMU 14 (Centre 15), qui couvre les transports urgents la nuit, les week-ends et les jours fériés.",
      "Le Bessin est un territoire de bourgs et de villages : les patients de Saint-Vigor-le-Grand, Saint-Loup-Hors, Vaux-sur-Aure ou Sully appellent souvent depuis des adresses rurales où chaque minute de trajet compte, d'où l'intérêt de transporteurs connaissant réellement le maillage local. Sur prescription, l'Assurance maladie rembourse 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et 55 % pour les autres motifs, généralement en tiers payant. Comparez ci-dessous les ambulances de Bayeux référencées.",
    ],
    voisines: [
      { nom: "Saint-Vigor-le-Grand", slug: "saint-vigor-le-grand" },
      { nom: "Saint-Loup-Hors", slug: "saint-loup-hors" },
      { nom: "Vaucelles", slug: "vaucelles" },
      { nom: "Sully", slug: "sully" },
      { nom: "Vaux-sur-Aure", slug: "vaux-sur-aure" },
    ],
    faq: [
      {
        question: "Le Centre Hospitalier de Bayeux fonctionne-t-il avec un autre site ?",
        answer:
          "Oui. Le Centre Hospitalier de Bayeux, situé 13 rue de Nesmond, est organisé en groupement avec le site d'Aunay-sur-Odon. Cette configuration à deux implantations explique une partie des transports sanitaires du secteur, notamment les liaisons entre les deux sites et les retours vers le domicile des patients du Bessin.",
      },
      {
        question: "Quand une ambulance est-elle nécessaire plutôt qu'un transport assis à Bayeux ?",
        answer:
          "Lorsque le patient doit rester allongé ou faire l'objet d'une surveillance durant le trajet. L'ambulance dispose alors d'un brancard, d'oxygène et d'un équipage comprenant un diplômé d'État ambulancier. Si le patient est autonome et peut rester assis, la prescription orientera vers un taxi conventionné ou un VSL, moins coûteux pour la collectivité.",
      },
    ],
  },

  "bayeux/taxi-conventionne": {
    etablissements: [
      { nom: "Centre Hospitalier de Bayeux", slug: "centre-hospitalier-aunay-bayeux-14" },
    ],
    intro: [
      "Dans le Bessin, un rendez-vous médical se traduit souvent par une vingtaine de kilomètres de route et un aller-retour à organiser dans la journée. Le taxi conventionné répond précisément à ce besoin : il transporte, sur prescription médicale, les patients de Bayeux (14) qui peuvent effectuer le trajet assis, sans brancard ni surveillance. Consultations de suivi, examens, séances de soins répétées, sorties d'hospitalisation : les motifs sont les mêmes qu'en ville, mais la distance et la faible densité de transports en commun rendent le service plus déterminant encore.",
      "Le conventionnement est un accord passé avec la CPAM du Calvados. Il encadre le tarif du transport de patients, distinct de la course commerciale, et permet le tiers payant : vous remettez votre prescription de transport et votre carte Vitale au chauffeur, qui se fait régler directement par l'Assurance maladie. Aucune qualification sanitaire n'est exigée de ce chauffeur, contrairement à l'équipage d'une ambulance ; la contrepartie est que ce mode de transport est strictement réservé aux patients autonomes.",
      "Les destinations habituelles sont le Centre Hospitalier de Bayeux, rue de Nesmond, et le site d'Aunay-sur-Odon avec lequel il est en groupement. Pour un traitement qui se répète, mieux vaut caler la série avec un même transporteur dès le début : sur un territoire rural, les tournées se construisent à l'avance et les créneaux du matin partent vite. Le remboursement s'élève à 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et à 65 % sinon. Retrouvez ci-dessous les taxis conventionnés référencés.",
    ],
    voisines: [
      { nom: "Saint-Vigor-le-Grand", slug: "saint-vigor-le-grand" },
      { nom: "Saint-Loup-Hors", slug: "saint-loup-hors" },
      { nom: "Vaux-sur-Aure", slug: "vaux-sur-aure" },
      { nom: "Vaucelles", slug: "vaucelles" },
      { nom: "Sully", slug: "sully" },
    ],
    faq: [
      {
        question: "Comment réserver un taxi conventionné à Bayeux ?",
        answer:
          "Munissez-vous de votre prescription médicale de transport, puis appelez directement l'une des sociétés référencées ci-dessous. Indiquez l'établissement de destination, l'heure de convocation et la nécessité éventuelle d'un retour. En zone rurale, une réservation la veille au plus tard est vivement conseillée, et davantage encore pour les rendez-vous en début de matinée.",
      },
      {
        question: "Un taxi conventionné de Bayeux peut-il me conduire hors du Bessin ?",
        answer:
          "Oui. Le transport prescrit vous conduit à l'établissement indiqué par le médecin, y compris s'il se trouve en dehors du secteur, par exemple sur le site d'Aunay-sur-Odon en groupement avec le Centre Hospitalier de Bayeux. Le remboursement suit les mêmes règles : 100 % en affection longue durée, 65 % pour les autres motifs.",
      },
    ],
  },

  "guerande/ambulance": {
    etablissements: [
      { nom: "Centre Hospitalier de Saint-Nazaire", slug: "centre-hospitalier-de-saint-nazaire-44" },
    ],
    intro: [
      "Il faut le dire clairement : Guérande (44) ne compte pas d'établissement hospitalier sur son territoire. La cité médiévale et ses marais salants sont rattachés au secteur du Centre Hospitalier de Saint-Nazaire, situé à environ 16,6 km à l'est. Cette configuration donne au transport sanitaire un rôle structurant : chaque hospitalisation, chaque consultation spécialisée, chaque sortie de service suppose un déplacement hors de la commune, assuré par les entreprises d'ambulances agréées par l'ARS Pays de la Loire implantées sur la presqu'île.",
      "L'ambulance intervient quand le patient doit voyager allongé ou rester sous surveillance : retour à domicile après une intervention, entrée programmée, transfert entre services. Le véhicule est agréé, équipé d'un brancard, d'oxygène et du matériel de premiers secours, et l'équipage comprend au moins un diplômé d'État ambulancier. En dehors des heures ouvrables, les transports urgents relèvent de la garde ambulancière du département, régulée sous l'égide du SAMU 44 (Centre 15) : en cas d'urgence vitale, c'est le 15 qu'il faut composer, jamais directement une société de transport.",
      "La presqu'île guérandaise a ses contraintes propres : un axe principal vers Saint-Nazaire, une fréquentation qui gonfle fortement en saison, et des communes littorales voisines comme La Baule-Escoublac qui partagent le même corridor routier. Prévoir de la marge sur les horaires n'est donc pas un luxe. Côté remboursement, l'Assurance maladie prend en charge 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et 55 % pour les autres motifs, le plus souvent en tiers payant. Comparez ci-dessous les ambulances référencées.",
    ],
    voisines: [
      { nom: "La Baule-Escoublac", slug: "la-baule-escoublac" },
      { nom: "Saint-Molf", slug: "saint-molf" },
      { nom: "Herbignac", slug: "herbignac" },
      { nom: "Pénestin", slug: "penestin" },
    ],
    faq: [
      {
        question: "Y a-t-il un hôpital à Guérande ?",
        answer:
          "Non, la commune de Guérande n'accueille pas d'établissement hospitalier. Elle est rattachée au secteur du Centre Hospitalier de Saint-Nazaire, à environ 16,6 km à l'est. Tous les transports sanitaires prescrits aux Guérandais impliquent donc un trajet hors de la commune, en ambulance pour un transport allongé, en taxi conventionné ou en VSL pour un transport assis.",
      },
      {
        question: "Qui appeler en cas d'urgence à Guérande ?",
        answer:
          "Le 15. Le SAMU 44 régule les appels et engage les moyens adaptés, y compris, pour les transports urgents en dehors des heures ouvrables, les ambulances de la garde ambulancière du département. N'appelez pas directement une entreprise de transport sanitaire pour une urgence vitale : seul le Centre 15 peut déclencher la réponse appropriée.",
      },
      {
        question: "Une ambulance de Guérande peut-elle me transporter jusqu'à Saint-Nazaire ?",
        answer:
          "Oui, c'est même le trajet le plus courant, puisque Guérande relève du secteur du Centre Hospitalier de Saint-Nazaire, à environ 16,6 km. Le transport doit être prescrit par un médecin ; il est remboursé à 100 % en affection longue durée, en accident du travail ou pour une hospitalisation liée, et à 55 % dans les autres cas.",
      },
    ],
  },

  "guerande/taxi-conventionne": {
    etablissements: [
      { nom: "Centre Hospitalier de Saint-Nazaire", slug: "centre-hospitalier-de-saint-nazaire-44" },
    ],
    intro: [
      "Sans établissement hospitalier sur la commune, Guérande (44) fonctionne en lien avec le secteur du Centre Hospitalier de Saint-Nazaire, à environ 16,6 km : le moindre rendez-vous se traduit par un aller-retour d'une trentaine de kilomètres. Le taxi conventionné est le mode de transport le plus adapté à ces déplacements quand le patient est autonome, capable de monter dans un véhicule ordinaire et de rester assis pendant le trajet. Consultations de suivi, examens, séances de soins répétées et sorties d'hospitalisation en constituent l'essentiel.",
      "Pour être remboursé, le trajet doit remplir deux conditions cumulatives : une prescription médicale de transport établie par un médecin, et un taxi effectivement conventionné avec la CPAM de Loire-Atlantique. Cette convention encadre le tarif appliqué aux transports de patients et permet le tiers payant, sur simple présentation du bon de transport et de la carte Vitale. Le chauffeur n'a pas de qualification sanitaire obligatoire, ce qui différencie nettement ce service de l'ambulance ou du VSL et le réserve aux patients n'ayant besoin d'aucune assistance médicale.",
      "Sur la presqu'île, la question des horaires est centrale. Le corridor routier vers Saint-Nazaire est unique et se charge nettement en période estivale, quand la population de La Baule-Escoublac et de Guérande gonfle. Réserver la veille, indiquer précisément l'heure de convocation et, pour une série de séances, fidéliser un même transporteur : trois réflexes qui évitent bien des rendez-vous manqués. Le remboursement atteint 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et 65 % sinon. Retrouvez ci-dessous les taxis conventionnés référencés.",
    ],
    voisines: [
      { nom: "La Baule-Escoublac", slug: "la-baule-escoublac" },
      { nom: "Herbignac", slug: "herbignac" },
      { nom: "Saint-Molf", slug: "saint-molf" },
      { nom: "Pénestin", slug: "penestin" },
    ],
    faq: [
      {
        question: "Le trajet Guérande - Saint-Nazaire est-il pris en charge en taxi conventionné ?",
        answer:
          "Oui, dès lors qu'un médecin a établi une prescription médicale de transport et que le taxi est conventionné avec la CPAM de Loire-Atlantique. Guérande étant rattachée au secteur du Centre Hospitalier de Saint-Nazaire, à environ 16,6 km, ce trajet fait partie des courses les plus fréquentes. Le tiers payant vous dispense d'avancer les frais.",
      },
      {
        question: "Faut-il réserver longtemps à l'avance à Guérande ?",
        answer:
          "La veille au minimum, et plus tôt encore en saison estivale : la presqu'île guérandaise voit sa circulation s'intensifier fortement l'été, sur un axe unique vers Saint-Nazaire. Pour un traitement répété, calez l'ensemble de la série avec le même transporteur dès la première course afin de stabiliser vos horaires.",
      },
    ],
  },

  "gennevilliers/ambulance": {
    etablissements: [
      { nom: "Hôpital Louis-Mourier AP-HP", slug: "ghu-aphp-nord-universite-paris-cite-site-louis-mourier-92" },
    ],
    intro: [
      "Le paysage sanitaire de Gennevilliers (92) mérite d'être décrit avec précision, car il prête à confusion. La commune accueille l'Hôpital Saint-Jean, dit des Grésillons, 89 avenue des Grésillons : un établissement de santé privé d'intérêt collectif spécialisé en soins de suite et de réadaptation, et non un hôpital de soins aigus généraliste. S'y ajoute le Centre Hospitalier Spécialisé Roger-Prévot, dédié à la psychiatrie. Les urgences des habitants de Gennevilliers sont, elles, notamment prises en charge à l'Hôpital Louis-Mourier AP-HP, à Colombes.",
      "Cette répartition explique la physionomie de l'activité des entreprises d'ambulances agréées par l'ARS Île-de-France : beaucoup d'admissions et de sorties en soins de suite et de réadaptation à Saint-Jean, des transferts vers ou depuis les établissements de soins aigus du secteur, et des retours à domicile. L'ambulance est prescrite lorsque le patient ne peut voyager qu'allongé ou doit rester sous surveillance ; brancard, oxygène et matériel de premiers secours équipent le véhicule, avec un diplômé d'État ambulancier dans l'équipage. Hors heures ouvrables, la garde ambulancière du département est régulée sous l'égide du SAMU 92 (Centre 15).",
      "Dans la boucle nord de la Seine, la circulation est le premier facteur d'aléa : les franchissements de fleuve vers Colombes, Asnières-sur-Seine, L'Île-Saint-Denis ou Argenteuil se saturent aux heures de pointe, et un transfert de quelques kilomètres peut demander bien plus de temps que la distance ne le suggère. Sur prescription médicale, l'Assurance maladie rembourse 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et 55 % dans les autres cas, en tiers payant chez la plupart des transporteurs. Comparez ci-dessous les ambulances référencées.",
    ],
    voisines: [
      { nom: "Asnières-sur-Seine", slug: "asnieres-sur-seine" },
      { nom: "Colombes", slug: "colombes" },
      { nom: "Villeneuve-la-Garenne", slug: "villeneuve-la-garenne" },
      { nom: "Argenteuil", slug: "argenteuil" },
      { nom: "L'Île-Saint-Denis", slug: "l-ile-saint-denis" },
    ],
    faq: [
      {
        question: "Y a-t-il un service d'urgences à Gennevilliers ?",
        answer:
          "Non. L'Hôpital Saint-Jean des Grésillons, présent sur la commune, est un établissement de santé privé d'intérêt collectif spécialisé en soins de suite et de réadaptation, et le Centre Hospitalier Spécialisé Roger-Prévot est dédié à la psychiatrie. Les urgences des habitants de Gennevilliers sont notamment prises en charge à l'Hôpital Louis-Mourier AP-HP, à Colombes. En cas d'urgence vitale, composez le 15.",
      },
      {
        question: "Quels établissements les ambulances de Gennevilliers desservent-elles ?",
        answer:
          "L'Hôpital Saint-Jean des Grésillons pour les admissions et sorties en soins de suite et de réadaptation, le Centre Hospitalier Spécialisé Roger-Prévot pour la psychiatrie, et l'Hôpital Louis-Mourier AP-HP à Colombes, qui accueille notamment les urgences des Gennevillois. S'y ajoutent les transferts vers les autres établissements du nord des Hauts-de-Seine.",
      },
      {
        question: "Combien de temps prévoir pour un transport en ambulance à Gennevilliers ?",
        answer:
          "Plus que la distance ne le laisse penser. Dans la boucle nord de la Seine, les franchissements vers Colombes, Asnières-sur-Seine ou Argenteuil se saturent aux heures de pointe. Signalez votre heure de convocation dès la réservation : le transporteur calera le départ en conséquence, en intégrant une marge sur le trajet.",
      },
    ],
  },

  "gennevilliers/taxi-conventionne": {
    etablissements: [
      { nom: "Hôpital Louis-Mourier AP-HP", slug: "ghu-aphp-nord-universite-paris-cite-site-louis-mourier-92" },
    ],
    intro: [
      "À Gennevilliers (92), le transport assis remboursé occupe une place particulière : l'Hôpital Saint-Jean des Grésillons, établissement de santé privé d'intérêt collectif spécialisé en soins de suite et de réadaptation, génère par nature des venues répétées, et la rééducation se prête au transport assis dès lors que le patient est autonome. Les taxis conventionnés assurent aussi les trajets vers l'Hôpital Louis-Mourier AP-HP de Colombes, où sont notamment prises en charge les urgences des Gennevillois, ainsi que les consultations de suivi et les examens hors commune.",
      "Le mécanisme est identique partout : le médecin établit une prescription médicale de transport mentionnant le transport assis, et le taxi doit avoir signé une convention avec la CPAM des Hauts-de-Seine. Cette convention fixe un tarif propre au transport de patients et rend possible le tiers payant, carte Vitale et bon de transport à l'appui. Le chauffeur n'est astreint à aucune qualification sanitaire obligatoire : c'est ce qui distingue le taxi conventionné du VSL, conduit par un auxiliaire ambulancier, et de l'ambulance, réservée aux transports allongés ou sous surveillance.",
      "En petite couronne, l'obstacle n'est pas la distance mais la circulation. Depuis Gennevilliers, gagner Colombes, Asnières-sur-Seine, Villeneuve-la-Garenne ou Argenteuil suppose de franchir la Seine ou de traverser des axes très chargés aux heures de pointe. Anticiper la réservation, communiquer l'heure exacte de convocation et, sur une série de séances, garder le même transporteur : ces précautions valent autant qu'un kilomètre gagné. Le remboursement s'élève à 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et à 65 % sinon. Retrouvez ci-dessous les taxis conventionnés référencés.",
    ],
    voisines: [
      { nom: "Colombes", slug: "colombes" },
      { nom: "Asnières-sur-Seine", slug: "asnieres-sur-seine" },
      { nom: "Villeneuve-la-Garenne", slug: "villeneuve-la-garenne" },
      { nom: "L'Île-Saint-Denis", slug: "l-ile-saint-denis" },
      { nom: "Argenteuil", slug: "argenteuil" },
    ],
    faq: [
      {
        question: "Un taxi conventionné peut-il assurer mes séances de rééducation à Gennevilliers ?",
        answer:
          "Oui, si le médecin a prescrit un transport assis et que vous êtes autonome. L'Hôpital Saint-Jean des Grésillons, sur la commune, est spécialisé en soins de suite et de réadaptation : les venues y sont souvent répétées, et le taxi conventionné est le mode de transport le plus courant pour ce type de suivi.",
      },
      {
        question: "Où vont les patients de Gennevilliers pour une consultation hospitalière ?",
        answer:
          "Cela dépend du service. La commune dispose de l'Hôpital Saint-Jean des Grésillons pour les soins de suite et de réadaptation et du Centre Hospitalier Spécialisé Roger-Prévot pour la psychiatrie ; les urgences et une partie des prises en charge aiguës relèvent notamment de l'Hôpital Louis-Mourier AP-HP, à Colombes. Votre prescription indique l'établissement de destination.",
      },
    ],
  },

  "mehun-sur-yevre/ambulance": {
    intro: [
      "Située entre Bourges et Vierzon, Méhun-sur-Yèvre (18) n'accueille aucun établissement hospitalier sur son territoire : la commune est rattachée au secteur du Centre Hospitalier de Bourges. Toute hospitalisation, tout examen spécialisé et toute sortie de service impliquent donc un déplacement, ce qui place les entreprises d'ambulances agréées par l'ARS Centre-Val de Loire au cœur du parcours de soins local. Elles assurent les transports allongés depuis et vers Bourges, ainsi que les transferts entre établissements lorsque la prise en charge l'exige.",
      "Le recours à l'ambulance suppose un motif médical précis, indiqué par le médecin sur la prescription de transport : impossibilité de voyager assis, ou nécessité d'une surveillance durant le trajet. Le véhicule agréé embarque brancard, oxygène et matériel de premiers secours ; l'équipage comprend au moins un diplômé d'État ambulancier. Pour les transports urgents en dehors des heures ouvrables, la garde ambulancière du département prend le relais, régulée sous l'égide du SAMU 18 (Centre 15). Une urgence vitale se signale toujours au 15, et non directement à un transporteur.",
      "Le Cher est un département étendu et peu dense : depuis Allouis, Foëcy, Quincy ou Marmagne, les temps de route pèsent plus que dans une agglomération, et la disponibilité des équipages se joue à l'échelle du secteur plutôt que de la commune. Sur prescription médicale, l'Assurance maladie rembourse 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et 55 % pour les autres motifs ; le tiers payant, pratiqué par la plupart des transporteurs, évite toute avance de frais. Comparez ci-dessous les ambulances référencées.",
    ],
    voisines: [
      { nom: "Allouis", slug: "allouis" },
      { nom: "Quincy", slug: "quincy" },
      { nom: "Foëcy", slug: "foecy" },
      { nom: "Preuilly", slug: "preuilly" },
      { nom: "Berry-Bouy", slug: "berry-bouy" },
      { nom: "Marmagne", slug: "marmagne" },
    ],
    faq: [
      {
        question: "Méhun-sur-Yèvre possède-t-elle un hôpital ?",
        answer:
          "Non. La commune, située entre Bourges et Vierzon, n'accueille pas d'établissement hospitalier : elle est rattachée au secteur du Centre Hospitalier de Bourges. Les transports sanitaires prescrits aux habitants impliquent donc systématiquement un trajet hors commune, en ambulance pour un transport allongé, en taxi conventionné ou en VSL pour un transport assis.",
      },
      {
        question: "Comment sont assurés les transports urgents la nuit à Méhun-sur-Yèvre ?",
        answer:
          "Par la garde ambulancière du département, régulée sous l'égide du SAMU 18 (Centre 15), qui organise une permanence la nuit, les week-ends et les jours fériés. En cas d'urgence vitale, composez le 15 : le Centre 15 évalue la situation et engage le moyen adapté. Les transports programmés se réservent directement auprès d'une entreprise de l'annuaire.",
      },
    ],
  },

  "mehun-sur-yevre/taxi-conventionne": {
    intro: [
      "Aucun établissement hospitalier n'est implanté à Méhun-sur-Yèvre (18) : la commune, posée entre Bourges et Vierzon, relève du secteur du Centre Hospitalier de Bourges. Pour les patients autonomes, capables de faire le trajet assis et sans surveillance, le taxi conventionné constitue la solution la plus employée : consultations de suivi, examens, séances de soins répétées, entrées et sorties d'hospitalisation. Il évite d'immobiliser un proche une demi-journée et, surtout, il est pris en charge par l'Assurance maladie sur prescription médicale de transport.",
      "Deux conditions sont indispensables. D'abord la prescription, qui mentionne le mode de transport retenu par le médecin. Ensuite le conventionnement : le taxi doit avoir signé une convention avec la CPAM du Cher, qui fixe le tarif applicable aux transports de patients et autorise le tiers payant, sur remise du bon de transport et de la carte Vitale. Le chauffeur n'est soumis à aucune qualification sanitaire obligatoire, ce qui réserve ce service aux patients n'ayant besoin ni de brancard ni d'assistance médicale pendant le trajet.",
      "En Berry, la réservation anticipée n'est pas une simple recommandation de confort : les transporteurs construisent leurs tournées à l'échelle du secteur, en regroupant les patients d'Allouis, Foëcy, Quincy, Berry-Bouy ou Marmagne, et les créneaux du début de matinée sont les premiers pris. Annoncez l'heure de convocation dès l'appel et, pour un traitement répété, calez l'ensemble de la série avec le même transporteur. Le remboursement est de 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et de 65 % dans les autres cas. Retrouvez ci-dessous les taxis conventionnés référencés.",
    ],
    voisines: [
      { nom: "Foëcy", slug: "foecy" },
      { nom: "Allouis", slug: "allouis" },
      { nom: "Marmagne", slug: "marmagne" },
      { nom: "Berry-Bouy", slug: "berry-bouy" },
      { nom: "Quincy", slug: "quincy" },
      { nom: "Preuilly", slug: "preuilly" },
    ],
    faq: [
      {
        question: "Le trajet vers le Centre Hospitalier de Bourges est-il remboursé depuis Méhun-sur-Yèvre ?",
        answer:
          "Oui, sur prescription médicale de transport et avec un taxi conventionné par la CPAM du Cher. Méhun-sur-Yèvre étant rattachée au secteur du Centre Hospitalier de Bourges, ce trajet est le plus fréquent. La prise en charge atteint 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et 65 % pour les autres motifs.",
      },
      {
        question: "Quelle différence entre taxi conventionné et ambulance à Méhun-sur-Yèvre ?",
        answer:
          "Le taxi conventionné transporte des patients assis et autonomes, sans qualification sanitaire requise pour le chauffeur, avec un remboursement de 100 % en affection longue durée et de 65 % sinon. L'ambulance est réservée aux transports allongés ou sous surveillance : équipage comprenant un diplômé d'État ambulancier, brancard et oxygène à bord, remboursement de 100 % en affection longue durée et de 55 % pour les autres motifs.",
      },
    ],
  },

  "ambres/taxi-conventionne": {
    etablissements: [
      { nom: "Centre Hospitalier d'Albi", slug: "centre-hospitalier-albi-81" },
    ],
    intro: [
      "Ambrès ne dispose pas d'établissement de santé sur son territoire : cette petite commune rurale du Tarn (81) est rattachée au secteur du Centre Hospitalier d'Albi, qui appartient au groupement hospitalier Tarn-Nord. Concrètement, tout rendez-vous de spécialiste, toute séance de rééducation et toute entrée programmée supposent un déplacement. Pour les patients capables de voyager assis, le taxi conventionné est le mode de transport que les médecins prescrivent le plus souvent, parce qu'il évite d'immobiliser une ambulance pour un trajet qui ne demande ni brancard ni oxygène.",
      "Un taxi conventionné est un artisan taxi qui a signé une convention avec la CPAM du Tarn. Cette signature n'est pas un diplôme de santé : le chauffeur n'est soumis à aucune qualification sanitaire obligatoire, contrairement à l'équipage d'une ambulance. Ce qu'apporte le conventionnement, c'est un tarif encadré par l'Assurance maladie et l'acceptation du bon de transport, donc la possibilité de ne rien avancer. Le tiers payant s'applique sur présentation de la prescription médicale de transport et de la carte Vitale.",
      "Sur un territoire rural comme celui d'Ambrès, où les tournées desservent aussi Giroussens, Fiac ou Labastide-Saint-Georges, la réservation anticipée change tout : un chauffeur qui connaît déjà votre adresse et votre horaire de dialyse ou de radiothérapie sécurise la série entière de rendez-vous. Le remboursement atteint 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et 65 % pour les autres motifs. Comparez ci-dessous les taxis conventionnés référencés sur le secteur.",
    ],
    voisines: [
      { nom: "Giroussens", slug: "giroussens" },
      { nom: "Saint-Gauzens", slug: "saint-gauzens" },
      { nom: "Fiac", slug: "fiac" },
      { nom: "Labastide-Saint-Georges", slug: "labastide-saint-georges" },
      { nom: "Lavaur", slug: "lavaur" },
      { nom: "Saint-Jean-de-Rives", slug: "saint-jean-de-rives" },
    ],
    faq: [
      {
        question: "Y a-t-il un hôpital à Ambrès ?",
        answer:
          "Non. Ambrès n'accueille aucun établissement de santé sur son territoire : la commune relève du secteur du Centre Hospitalier d'Albi, rattaché au groupement hospitalier Tarn-Nord. Les taxis conventionnés du secteur assurent donc essentiellement des trajets vers Albi et vers les structures de soins des communes voisines.",
      },
      {
        question: "Le chauffeur d'un taxi conventionné a-t-il une formation médicale ?",
        answer:
          "Non, et ce n'est pas ce qui lui est demandé. Le taxi conventionné transporte des patients autonomes, assis, sans surveillance pendant le trajet ; son chauffeur n'a pas de qualification sanitaire obligatoire. Si votre état exige un brancard, de l'oxygène ou une surveillance, votre médecin prescrit une ambulance, dont l'équipage comprend un diplômé d'État ambulancier.",
      },
      {
        question: "Comment se faire rembourser un trajet depuis Ambrès ?",
        answer:
          "Il faut une prescription médicale de transport établie avant le déplacement. Avec ce document et votre carte Vitale, la plupart des taxis conventionnés du Tarn appliquent le tiers payant : vous ne réglez rien, la CPAM verse directement 100 % du tarif conventionné en ALD, accident du travail ou hospitalisation liée, et 65 % dans les autres situations.",
      },
    ],
  },

  "borderes-sur-lechez/taxi-conventionne": {
    etablissements: [
      { nom: "Centre Hospitalier Tarbes-Lourdes", slug: "ch-tarbes-lourdes-gespe-site-tarbes-65" },
    ],
    intro: [
      "À Bordères-sur-l'Échez, dans les Hautes-Pyrénées (65), le taxi conventionné répond à un besoin très concret : la commune se trouve à 4 à 6 kilomètres du centre de Tarbes et ne possède pas d'établissement hospitalier propre. Elle est rattachée au Centre Hospitalier de Bigorre, également désigné sous le nom de Centre Hospitalier Tarbes-Lourdes, dont le site tarbais du boulevard du Maréchal de Lattre de Tassigny concentre les consultations et les plateaux techniques du bassin.",
      "Ce transport s'adresse aux patients autonomes, qui montent et descendent seuls et n'ont besoin d'aucune assistance pendant le trajet. Le véhicule est un taxi ordinaire, mais son exploitant a signé une convention avec la CPAM des Hautes-Pyrénées : il applique un tarif négocié, différent d'une course libre, et accepte le bon de transport. Aucune qualification sanitaire n'est exigée du chauffeur ; l'ambulance, elle, reste réservée aux trajets allongés ou surveillés, avec brancard et oxygène à bord.",
      "Dans une commune intégrée à l'agglomération Tarbes-Lourdes-Pyrénées, les distances sont courtes mais les créneaux hospitaliers, eux, sont serrés : mieux vaut réserver la veille, surtout pour les traitements répétés où l'horaire conditionne toute la journée. Sur prescription médicale, la prise en charge s'élève à 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et à 65 % pour les autres motifs, avec tiers payant. Retrouvez ci-dessous les sociétés référencées sur la commune, avec leur téléphone direct et leur conventionnement vérifié.",
    ],
    voisines: [
      { nom: "Oursbelille", slug: "oursbelille" },
      { nom: "Tarbes", slug: "tarbes" },
      { nom: "Bours", slug: "bours" },
      { nom: "Bazet", slug: "bazet" },
      { nom: "Aureilhan", slug: "aureilhan" },
      { nom: "Ibos", slug: "ibos" },
    ],
    faq: [
      {
        question: "Vers quel hôpital les taxis conventionnés de Bordères-sur-l'Échez transportent-ils ?",
        answer:
          "Principalement vers le Centre Hospitalier de Bigorre, à Tarbes, hôpital de rattachement de la commune : Bordères-sur-l'Échez n'accueille pas d'établissement hospitalier sur son territoire. Le trajet est court, de l'ordre de 4 à 6 kilomètres jusqu'au centre de Tarbes, ce qui en fait un transport assis typique.",
      },
      {
        question: "Faut-il une ordonnance pour un taxi conventionné ?",
        answer:
          "Oui. Le remboursement suppose une prescription médicale de transport rédigée par votre médecin, qui atteste que votre état justifie un transport et précise le mode adapté. Sans ce document, la course est facturée comme un taxi classique et reste entièrement à votre charge, même si l'exploitant est conventionné avec la CPAM.",
      },
    ],
  },

  "estrablin/taxi-conventionne": {
    etablissements: [
      { nom: "Centre Hospitalier Lucien-Hussel de Vienne", slug: "centre-hospitalier-lucien-hussel-de-vienne-38" },
    ],
    intro: [
      "Sept à huit kilomètres seulement séparent Estrablin de Vienne, et une trentaine de Lyon. Cette position, sur les coteaux à l'est de la ville, explique l'essentiel de l'organisation des transports sanitaires dans cette commune iséroise (38) d'environ 3 600 habitants : Estrablin n'a pas d'établissement hospitalier sur son territoire et relève du secteur du Centre Hospitalier Lucien-Hussel de Vienne, situé montée du Docteur Chapuis, où sont assurées la majorité des consultations et des hospitalisations du bassin.",
      "Le taxi conventionné couvre les trajets assis de patients autonomes : consultation de contrôle, séance de kinésithérapie, cure de chimiothérapie ambulatoire, examen d'imagerie. Il ne s'agit pas d'un véhicule sanitaire ; le chauffeur n'a aucune qualification médicale obligatoire, mais son entreprise a passé convention avec la CPAM de l'Isère, ce qui fixe le tarif applicable et autorise le tiers payant. Le transport allongé, avec brancard, oxygène et équipage diplômé, relève au contraire de l'ambulance.",
      "Quand le rendez-vous a lieu non pas à Vienne mais dans la métropole lyonnaise, le trajet change d'échelle et le facteur circulation devient déterminant : réserver la veille, en indiquant l'heure exacte de convocation plutôt que l'heure souhaitée de départ, évite bien des rendez-vous manqués. Le remboursement est de 100 % du tarif conventionné en ALD, accident du travail ou hospitalisation liée, et de 65 % sinon. Comparez ci-dessous les taxis conventionnés d'Estrablin et des communes voisines.",
    ],
    voisines: [
      { nom: "Pont-Évêque", slug: "pont-eveque" },
      { nom: "Vienne", slug: "vienne" },
      { nom: "Septème", slug: "septeme" },
      { nom: "Moidieu-Détourbe", slug: "moidieu-detourbe" },
      { nom: "Jardin", slug: "jardin" },
      { nom: "Eyzin-Pinet", slug: "eyzin-pinet" },
    ],
    faq: [
      {
        question: "Estrablin dispose-t-elle d'un hôpital ?",
        answer:
          "Non, aucun établissement de santé n'est implanté sur la commune. Estrablin est rattachée au secteur du Centre Hospitalier Lucien-Hussel de Vienne, à 7 ou 8 kilomètres. Pour certaines prises en charge spécialisées, les patients sont orientés vers l'agglomération lyonnaise, à une trentaine de kilomètres.",
      },
      {
        question: "Un taxi conventionné peut-il m'emmener d'Estrablin jusqu'à Lyon ?",
        answer:
          "Oui, dès lors que la prescription médicale mentionne l'établissement de destination. La règle générale de l'Assurance maladie est celle de l'établissement approprié le plus proche, mais un trajet plus long est pris en charge lorsque le soin n'est pas disponible localement, ce qui est fréquent pour les plateaux techniques spécialisés lyonnais.",
      },
      {
        question: "Quelle différence de remboursement entre taxi conventionné et ambulance ?",
        answer:
          "Pour un transport assis en taxi conventionné, l'Assurance maladie rembourse 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % dans les autres cas. Pour une ambulance, transport allongé ou médicalisé, le taux est de 100 % dans les mêmes situations et de 55 % sinon.",
      },
    ],
  },

  "maze-milon/taxi-conventionne": {
    etablissements: [
      { nom: "CHU d'Angers", slug: "centre-hospitalier-universitaire-d-angers-49" },
    ],
    intro: [
      "Née en 2016 de la fusion de Mazé et de Milon, la commune de Mazé-Milon appartient au Maine-et-Loire (49) et n'accueille pas d'établissement de santé sur son territoire : les prises en charge hospitalières relèvent du CHU d'Angers, hôpital de rattachement du secteur. Cette configuration, commune aux villages des Basses Vallées angevines, fait du transport assis conventionné un maillon quotidien du parcours de soins, notamment pour les suivis longs qui imposent des allers-retours réguliers vers Angers.",
      "Le taxi conventionné se distingue nettement de l'ambulance. Il transporte des patients assis et autonomes, sans surveillance ni matériel médical à bord, et son chauffeur n'est astreint à aucune qualification sanitaire ; l'ambulance, elle, embarque brancard et oxygène avec un équipage comprenant un diplômé d'État ambulancier. Ce qui rend le taxi remboursable, c'est la convention passée avec la CPAM du Maine-et-Loire : elle fixe le tarif, encadre la facturation et permet la dispense d'avance de frais.",
      "Dans un secteur rural où les communes de Corzé, Seiches-sur-le-Loir ou Jarzé Villages partagent les mêmes transporteurs, il est fréquent qu'une même voiture regroupe plusieurs patients sur un trajet vers Angers : ce transport partagé, prévu par la réglementation, ne réduit pas vos droits. Le remboursement s'établit à 100 % du tarif conventionné en ALD, accident du travail ou hospitalisation liée, et à 65 % pour les autres motifs, sur prescription médicale. Consultez ci-dessous les transporteurs référencés.",
    ],
    voisines: [
      { nom: "Cornillé-les-Caves", slug: "cornille-les-caves" },
      { nom: "Corzé", slug: "corze" },
      { nom: "Jarzé Villages", slug: "jarze-villages" },
      { nom: "Seiches-sur-le-Loir", slug: "seiches-sur-le-loir" },
      { nom: "Villevêque", slug: "villeveque" },
      { nom: "Soucelles", slug: "soucelles" },
    ],
    faq: [
      {
        question: "Quel hôpital dessert Mazé-Milon ?",
        answer:
          "Mazé-Milon ne compte aucun établissement hospitalier sur son territoire. La commune est rattachée au CHU d'Angers, qui constitue l'établissement de référence du secteur pour les consultations spécialisées, les hospitalisations programmées et les urgences.",
      },
      {
        question: "Puis-je partager mon taxi conventionné avec un autre patient ?",
        answer:
          "Oui. Le transport partagé est prévu par l'Assurance maladie et il est courant en zone rurale, où plusieurs patients d'un même secteur se rendent au même hôpital. Il n'a aucune incidence sur votre remboursement ni sur le tiers payant, mais il peut décaler légèrement votre heure de départ : prévenez le transporteur si votre convocation est impérative.",
      },
    ],
  },

  "peille/taxi-conventionne": {
    intro: [
      "Peille est un village perché de l'arrière-pays des Alpes-Maritimes (06), sans aucun établissement de santé sur son territoire ; les prises en charge hospitalières relèvent principalement du secteur niçois. Cette situation d'altitude, à l'écart des axes du littoral, donne au transport assis conventionné une importance particulière : la route sinueuse qui rejoint la vallée allonge sensiblement les temps de parcours, et un rendez-vous matinal en ville suppose souvent un départ très tôt du village.",
      "Le taxi conventionné accueille les patients autonomes, assis, qui n'ont besoin ni de brancard ni de surveillance. Son chauffeur ne possède pas de qualification sanitaire obligatoire : c'est la convention signée avec la CPAM des Alpes-Maritimes qui encadre le tarif et rend la course remboursable sur présentation du bon de transport. Le tiers payant dispense de toute avance de frais avec la carte Vitale. Dès que l'état du patient impose la position allongée ou de l'oxygène, l'ambulance devient le mode prescrit.",
      "Pour les habitants de Peille comme pour ceux de Peillon, de L'Escarène ou de Sainte-Agnès, la réservation anticipée n'est pas une précaution mais une nécessité : le nombre de véhicules disponibles dans l'arrière-pays est limité, et les créneaux du matin partent vite. La prise en charge atteint 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs. Comparez ci-dessous les taxis conventionnés référencés sur ce secteur.",
    ],
    voisines: [
      { nom: "Peillon", slug: "peillon" },
      { nom: "La Turbie", slug: "la-turbie" },
      { nom: "Sospel", slug: "sospel" },
      { nom: "Roquebrune-Cap-Martin", slug: "roquebrune-cap-martin" },
      { nom: "L'Escarène", slug: "l-escarene" },
      { nom: "Sainte-Agnès", slug: "sainte-agnes" },
    ],
    faq: [
      {
        question: "Y a-t-il un établissement de santé à Peille ?",
        answer:
          "Non, aucun établissement hospitalier n'est implanté sur la commune. Les prises en charge hospitalières des habitants relèvent principalement du secteur niçois, ce qui implique un déplacement pour les consultations spécialisées, les examens et les hospitalisations programmées.",
      },
      {
        question: "Combien de temps à l'avance réserver un taxi conventionné à Peille ?",
        answer:
          "Dans l'arrière-pays, réservez si possible dès que vous connaissez la date du rendez-vous, et au minimum la veille. Les véhicules conventionnés sont peu nombreux sur les communes de montagne et les créneaux du matin sont les plus demandés ; pour une série de séances, réservez l'ensemble des trajets auprès du même transporteur.",
      },
      {
        question: "Le taxi conventionné remplace-t-il une ambulance ?",
        answer:
          "Non, les deux modes répondent à des situations différentes. Le taxi conventionné est réservé aux patients autonomes voyageant assis, sans surveillance. L'ambulance, avec brancard, oxygène et équipage comprenant un diplômé d'État ambulancier, s'impose pour les transports allongés ou médicalisés. C'est le médecin qui détermine le mode adapté sur la prescription.",
      },
    ],
  },

  "savouges/taxi-conventionne": {
    intro: [
      "Une vingtaine de kilomètres séparent Savouges du CHU de Dijon. Cette très petite commune rurale de Côte-d'Or (21) n'abrite aucun établissement de santé : elle est rattachée au CHU Dijon Bourgogne, dont l'hôpital François-Mitterrand, sur le site du Bocage, concentre les urgences et les grands plateaux techniques du département. Pour les patients autonomes de Savouges, chaque consultation, chaque examen et chaque séance de traitement se traduit donc par un aller-retour vers l'agglomération dijonnaise.",
      "Le taxi conventionné est le mode de transport prescrit lorsque le patient peut voyager assis, sans aide ni surveillance pendant le trajet. C'est un taxi ordinaire dont l'exploitant a signé une convention avec la CPAM de Côte-d'Or : le tarif est encadré, le bon de transport accepté, et le tiers payant évite toute avance de frais. Aucune qualification sanitaire n'est requise du chauffeur, à la différence de l'équipage d'une ambulance, qui comprend un diplômé d'État ambulancier et dispose de brancard et d'oxygène.",
      "Sur ce secteur de la plaine dijonnaise, où les transporteurs desservent aussi Noiron-sous-Gevrey, Broindon ou Corcelles-lès-Cîteaux, la vingtaine de kilomètres à parcourir invite à anticiper : un départ mal calé se paie en attente à l'hôpital ou en rendez-vous manqué. Sur prescription médicale, l'Assurance maladie rembourse 100 % du tarif conventionné en ALD, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs. Retrouvez ci-dessous les taxis conventionnés de Savouges et de son secteur, avec leur numéro direct.",
    ],
    voisines: [
      { nom: "Noiron-sous-Gevrey", slug: "noiron-sous-gevrey" },
      { nom: "Corcelles-lès-Cîteaux", slug: "corcelles-les-citeaux" },
      { nom: "Broindon", slug: "broindon" },
      { nom: "Épernay-sous-Gevrey", slug: "epernay-sous-gevrey" },
      { nom: "Saint-Nicolas-lès-Cîteaux", slug: "saint-nicolas-les-citeaux" },
    ],
    faq: [
      {
        question: "À quelle distance se trouve l'hôpital le plus proche de Savouges ?",
        answer:
          "Savouges n'a pas d'établissement de santé sur son territoire. La commune est rattachée au CHU Dijon Bourgogne, dont l'hôpital François-Mitterrand (site du Bocage) se situe à environ 20 kilomètres. C'est vers cet établissement que sont orientées la plupart des consultations spécialisées et des hospitalisations.",
      },
      {
        question: "Le taxi conventionné est-il moins cher qu'un taxi classique depuis Savouges ?",
        answer:
          "Ce n'est pas une question de prix mais de prise en charge. Le taxi conventionné applique un tarif négocié avec l'Assurance maladie et accepte le bon de transport : avec une prescription médicale et le tiers payant, vous ne réglez rien. Une course de taxi non conventionnée, même identique, reste intégralement à votre charge.",
      },
    ],
  },

  "vignot/taxi-conventionne": {
    etablissements: [
      { nom: "Centre Hospitalier Saint-Charles de Commercy", slug: "centre-hospitalier-saint-charles-de-commercy-55" },
    ],
    intro: [
      "Vignot vit à deux kilomètres de Commercy, dans la Meuse (55), et cette proximité structure toute l'organisation des transports sanitaires de cette commune d'environ 1 300 habitants. Vignot n'accueille pas d'établissement de santé : elle est rattachée au Centre Hospitalier Saint-Charles de Commercy, établissement public de proximité du Haut Val de Meuse, rue Henri Garnier. Pour les patients autonomes, le taxi conventionné couvre l'essentiel de ces trajets courts mais répétés, souvent hebdomadaires lorsqu'un suivi est en cours.",
      "Le principe est simple : un artisan taxi signe une convention avec la CPAM de la Meuse, applique le tarif fixé par l'Assurance maladie et accepte le bon de transport, ce qui permet la dispense d'avance de frais. Son chauffeur n'a pas de qualification sanitaire obligatoire, car le service rendu est un transport assis pour un patient qui se déplace seul. Un besoin de brancard, d'oxygène ou de surveillance fait basculer la prescription vers l'ambulance et son équipage diplômé.",
      "Deux kilomètres, ce n'est presque rien sur une carte, mais c'est déjà trop pour une personne convalescente ou en traitement lourd, et un trajet vers un plateau technique plus éloigné se prépare autrement. Réservez dès la réception de votre convocation, en précisant l'heure de rendez-vous. Le remboursement s'élève à 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et à 65 % dans les autres cas. Comparez ci-dessous les transporteurs référencés.",
    ],
    voisines: [
      { nom: "Commercy", slug: "commercy" },
      { nom: "Euville", slug: "euville" },
      { nom: "Girauvoisin", slug: "girauvoisin" },
      { nom: "Boncourt-sur-Meuse", slug: "boncourt-sur-meuse" },
      { nom: "Lérouville", slug: "lerouville" },
    ],
    faq: [
      {
        question: "Quel est l'hôpital de rattachement de Vignot ?",
        answer:
          "Vignot ne dispose pas d'établissement de santé sur son territoire. La commune est rattachée au Centre Hospitalier Saint-Charles, à Commercy, situé à environ 2 kilomètres : c'est l'établissement public de santé de proximité du Haut Val de Meuse.",
      },
      {
        question: "Un trajet très court est-il quand même remboursé ?",
        answer:
          "Oui. Le remboursement ne dépend pas de la distance mais de l'existence d'une prescription médicale de transport et du motif du déplacement. Un trajet de quelques kilomètres entre Vignot et Commercy est pris en charge dans les mêmes conditions qu'un trajet long : 100 % du tarif conventionné en ALD, accident du travail ou hospitalisation liée, 65 % sinon.",
      },
    ],
  },

  "rohrbach-les-bitche/ambulance": {
    etablissements: [
      { nom: "Hôpital Robert-Pax", slug: "hopital-robert-pax-de-sarreguemines-57" },
      { nom: "Hôpital Saint-Joseph de Bitche", slug: "hopital-st-joseph-bitche-ch-robert-pax-57" },
    ],
    intro: [
      "Au cœur du Pays de Bitche, dans le nord-est de la Moselle (57) et à quelques kilomètres de la frontière allemande, Rohrbach-lès-Bitche n'accueille pas d'établissement hospitalier sur son territoire. Les patients relèvent des Hôpitaux de Sarreguemines, dont l'Hôpital Robert-Pax se trouve à environ 16 kilomètres, et de l'Hôpital Saint-Joseph de Bitche, plus proche. Cette double orientation explique une part importante de l'activité des ambulances locales : transferts entre les deux sites, retours à domicile et entrées programmées.",
      "L'ambulance est le seul mode de transport sanitaire adapté aux patients qui doivent voyager allongés ou sous surveillance. Le véhicule, agréé par l'ARS Grand Est, embarque un brancard, de l'oxygène et le matériel de premiers secours, avec un équipage de deux personnes dont au moins un diplômé d'État ambulancier. Rien de tel dans un taxi conventionné, réservé aux patients autonomes voyageant assis, dont le chauffeur n'a aucune qualification sanitaire obligatoire.",
      "Les entreprises du secteur participent à la garde ambulancière du département, régulée sous l'égide du SAMU 57 (Centre 15), qui assure la permanence des transports urgents la nuit, le week-end et les jours fériés — un point sensible dans un territoire rural où les distances jusqu'aux services d'urgence sont réelles. Sur prescription médicale, l'Assurance maladie rembourse 100 % en ALD, accident du travail ou hospitalisation liée, et 55 % pour les autres motifs, généralement en tiers payant. Comparez ci-dessous les ambulances référencées.",
    ],
    voisines: [
      { nom: "Bining", slug: "bining" },
      { nom: "Petit-Réderching", slug: "petit-rederching" },
      { nom: "Gros-Réderching", slug: "gros-rederching" },
      { nom: "Bettviller", slug: "bettviller" },
      { nom: "Rimling", slug: "rimling" },
      { nom: "Enchenberg", slug: "enchenberg" },
    ],
    faq: [
      {
        question: "Vers quels hôpitaux les ambulances de Rohrbach-lès-Bitche transportent-elles ?",
        answer:
          "Rohrbach-lès-Bitche n'a pas d'hôpital sur son territoire. Les transports se font vers les Hôpitaux de Sarreguemines, dont l'Hôpital Robert-Pax situé à environ 16 kilomètres, ainsi que vers l'Hôpital Saint-Joseph de Bitche, plus proche de la commune. Les transferts entre ces établissements sont fréquents.",
      },
      {
        question: "Qui peut m'emmener en urgence la nuit dans le Pays de Bitche ?",
        answer:
          "En cas d'urgence vitale, composez le 15. Le SAMU 57 régule la garde ambulancière du département, qui assure la permanence des transports urgents la nuit, le week-end et les jours fériés : c'est le Centre 15 qui engage alors l'ambulance de garde. Pour un transport programmé, contactez directement une entreprise de l'annuaire.",
      },
      {
        question: "Quand faut-il une ambulance plutôt qu'un taxi conventionné ?",
        answer:
          "L'ambulance s'impose lorsque le transport doit se faire en position allongée, sous surveillance, ou avec de l'oxygène : sortie de bloc, hospitalisation lourde, transfert entre établissements. Son équipage comprend un diplômé d'État ambulancier. Si vous pouvez voyager assis sans aide, le médecin prescrit un transport assis, moins coûteux pour la collectivité et souvent plus rapide à obtenir.",
      },
    ],
  },

  "longvic/ambulance": {
    intro: [
      "Longvic est une commune de l'agglomération dijonnaise (21) qui ne possède pas d'établissement hospitalier propre : ses habitants relèvent du CHU Dijon Bourgogne, dont l'hôpital François-Mitterrand, sur le site du Bocage, réunit les urgences adultes et pédiatriques, la réanimation et les grands plateaux techniques de la Côte-d'Or. Les ambulances qui desservent Longvic travaillent donc en lien étroit avec ce site, pour les entrées programmées comme pour les retours à domicile après hospitalisation.",
      "Choisir une ambulance n'est jamais un choix de confort : c'est le mode prescrit quand le patient doit être transporté allongé ou surveillé. Le véhicule, agréé par l'ARS Bourgogne-Franche-Comté, dispose d'un brancard, d'oxygène et du matériel de premiers secours, et circule avec un équipage de deux personnes dont au moins un diplômé d'État ambulancier. Le transport assis d'un patient autonome relève au contraire du taxi conventionné, dont le chauffeur n'a pas de qualification sanitaire obligatoire.",
      "Les sociétés implantées à Longvic et dans les communes contiguës — Ouges, Chenôve, Sennecey-lès-Dijon, Quetigny — prennent part à la garde ambulancière du département, régulée sous l'égide du SAMU 21 (Centre 15) pour la nuit, les week-ends et les jours fériés. Sur prescription médicale, le remboursement atteint 100 % en affection longue durée, accident du travail ou hospitalisation liée, et 55 % pour les autres motifs, le plus souvent en tiers payant. Comparez ci-dessous les ambulances référencées.",
    ],
    voisines: [
      { nom: "Ouges", slug: "ouges" },
      { nom: "Sennecey-lès-Dijon", slug: "sennecey-les-dijon" },
      { nom: "Dijon", slug: "dijon" },
      { nom: "Chenôve", slug: "chenove" },
      { nom: "Quetigny", slug: "quetigny" },
      { nom: "Fénay", slug: "fenay" },
    ],
    faq: [
      {
        question: "Y a-t-il un hôpital à Longvic ?",
        answer:
          "Non. Longvic n'accueille pas d'établissement hospitalier sur son territoire : la commune est rattachée au CHU Dijon Bourgogne et à son hôpital François-Mitterrand, sur le site du Bocage, où se trouvent les urgences et les principaux services spécialisés du département.",
      },
      {
        question: "Comment est assurée la permanence des transports urgents en Côte-d'Or ?",
        answer:
          "La garde ambulancière du département est régulée sous l'égide du SAMU 21 (Centre 15) : les entreprises agréées assurent à tour de rôle la permanence la nuit, le week-end et les jours fériés. En cas d'urgence vitale, appelez le 15. Pour un transport programmé, réservez directement auprès d'une ambulance de l'annuaire.",
      },
      {
        question: "Qui compose l'équipage d'une ambulance ?",
        answer:
          "Deux personnes, dont au moins un diplômé d'État ambulancier (DEA). Le véhicule est agréé par l'ARS et équipé d'un brancard, d'oxygène et de matériel de premiers secours. C'est précisément ce qui distingue l'ambulance du taxi conventionné, qui transporte des patients assis et autonomes sans exigence de qualification sanitaire.",
      },
    ],
  },

  "longvic/taxi-conventionne": {
    intro: [
      "Le taxi conventionné constitue, à Longvic (21), le mode de transport sanitaire le plus utilisé au quotidien, tout simplement parce que la majorité des trajets consiste à rejoindre le CHU Dijon Bourgogne — hôpital François-Mitterrand, site du Bocage — pour une consultation, une séance de dialyse ou une cure de radiothérapie. La commune ne possède pas d'établissement hospitalier propre, mais son appartenance à l'agglomération dijonnaise place ces destinations à quelques minutes de route.",
      "Ce transport concerne les patients assis et autonomes, qui n'ont besoin d'aucune assistance pendant le trajet. Le véhicule est un taxi classique ; ce qui le rend remboursable, c'est la convention signée avec la CPAM de Côte-d'Or, qui fixe un tarif encadré et autorise l'acceptation du bon de transport. Le chauffeur n'est soumis à aucune qualification sanitaire obligatoire, contrairement à l'équipage d'une ambulance. Le tiers payant vous dispense d'avancer les frais avec votre carte Vitale.",
      "Pour les traitements en série, l'anticipation compte plus que la proximité : un même transporteur qui connaît vos horaires de dialyse ou de séance stabilise l'ensemble du protocole, alors qu'une réservation au dernier moment expose à un décalage sur toute la journée. Sur prescription médicale, la prise en charge est de 100 % du tarif conventionné en ALD, accident du travail ou hospitalisation liée, et de 65 % dans les autres situations. Comparez ci-dessous les taxis conventionnés desservant Longvic, avec leur téléphone et leur conventionnement CPAM vérifié.",
    ],
    voisines: [
      { nom: "Ouges", slug: "ouges" },
      { nom: "Sennecey-lès-Dijon", slug: "sennecey-les-dijon" },
      { nom: "Dijon", slug: "dijon" },
      { nom: "Chenôve", slug: "chenove" },
      { nom: "Quetigny", slug: "quetigny" },
      { nom: "Fénay", slug: "fenay" },
    ],
    faq: [
      {
        question: "Vers quels établissements les taxis conventionnés de Longvic transportent-ils ?",
        answer:
          "Essentiellement vers le CHU Dijon Bourgogne et son hôpital François-Mitterrand (site du Bocage), hôpital de rattachement de la commune, ainsi que vers les structures de soins de l'agglomération dijonnaise. Longvic n'accueillant pas d'établissement hospitalier, la quasi-totalité des trajets sortent de la commune.",
      },
      {
        question: "Quelle différence entre taxi conventionné et VSL ?",
        answer:
          "Le VSL est un véhicule sanitaire léger agréé par l'ARS, conduit par un auxiliaire ambulancier formé aux premiers secours. Le taxi conventionné est un taxi agréé par la CPAM, dont le chauffeur n'a pas de qualification sanitaire obligatoire. Les deux transportent des patients assis et ouvrent les mêmes droits au remboursement ; le médecin indique le mode adapté à votre état.",
      },
    ],
  },

  "aureilhan/ambulance": {
    etablissements: [
      { nom: "Centre Hospitalier Tarbes-Lourdes", slug: "ch-tarbes-lourdes-gespe-site-tarbes-65" },
    ],
    intro: [
      "Troisième commune la plus peuplée des Hautes-Pyrénées (65) et pleinement intégrée à l'agglomération Tarbes-Lourdes-Pyrénées, Aureilhan n'accueille pourtant aucun établissement hospitalier sur son territoire. Ses habitants sont rattachés au Centre Hospitalier de Bigorre, également appelé Centre Hospitalier Tarbes-Lourdes, dont le site tarbais du boulevard du Maréchal de Lattre de Tassigny concentre les urgences et les plateaux techniques du département. C'est vers lui que convergent la plupart des transports allongés au départ d'Aureilhan.",
      "L'ambulance intervient lorsque l'état du patient interdit le transport assis : sortie de bloc opératoire, retour à domicile après une hospitalisation lourde, transfert entre établissements, prise en charge nécessitant de l'oxygène ou une surveillance continue. Le véhicule est agréé par l'ARS Occitanie, équipé d'un brancard et du matériel de premiers secours, et l'équipage comprend au moins un diplômé d'État ambulancier. Un taxi conventionné, à l'inverse, ne transporte que des patients autonomes, assis, sans exigence de qualification sanitaire pour son chauffeur.",
      "Les entreprises d'Aureilhan et des communes voisines — Séméac, Soues, Bordères-sur-l'Échez, Barbazan-Debat — participent à la garde ambulancière du département, régulée sous l'égide du SAMU 65 (Centre 15), qui garantit la continuité des transports urgents en dehors des heures ouvrables. Sur prescription médicale, l'Assurance maladie prend en charge 100 % du tarif en ALD, accident du travail ou hospitalisation liée, et 55 % pour les autres motifs, avec tiers payant chez la plupart des transporteurs.",
    ],
    voisines: [
      { nom: "Tarbes", slug: "tarbes" },
      { nom: "Bordères-sur-l'Échez", slug: "borderes-sur-lechez" },
      { nom: "Séméac", slug: "semeac" },
      { nom: "Soues", slug: "soues" },
      { nom: "Barbazan-Debat", slug: "barbazan-debat" },
      { nom: "Bours", slug: "bours" },
    ],
    faq: [
      {
        question: "Quel hôpital dessert les ambulances d'Aureilhan ?",
        answer:
          "Aureilhan ne dispose pas d'établissement hospitalier sur son territoire. Les ambulances de la commune transportent principalement vers le Centre Hospitalier de Bigorre, à Tarbes, aussi désigné sous le nom de Centre Hospitalier Tarbes-Lourdes, hôpital de rattachement du secteur.",
      },
      {
        question: "Une ambulance d'Aureilhan peut-elle intervenir à Tarbes ou à Séméac ?",
        answer:
          "Oui. Les entreprises agréées des Hautes-Pyrénées interviennent au-delà de leur commune d'implantation, en particulier sur l'ensemble de l'agglomération Tarbes-Lourdes-Pyrénées. Vous pouvez donc faire appel à un transporteur d'Aureilhan pour un trajet au départ d'une commune voisine, et inversement.",
      },
      {
        question: "Comment fonctionne la garde ambulancière dans les Hautes-Pyrénées ?",
        answer:
          "Les entreprises agréées du département assurent à tour de rôle la permanence des transports sanitaires urgents la nuit, le week-end et les jours fériés, dans le cadre de la garde ambulancière régulée sous l'égide du SAMU 65 (Centre 15). En cas d'urgence vitale, composez le 15 : c'est le Centre 15 qui engage les moyens.",
      },
    ],
  },

  "aureilhan/taxi-conventionne": {
    etablissements: [
      { nom: "Centre Hospitalier Tarbes-Lourdes", slug: "ch-tarbes-lourdes-gespe-site-tarbes-65" },
    ],
    intro: [
      "Troisième commune des Hautes-Pyrénées par sa population, Aureilhan (65) n'accueille pourtant aucun établissement hospitalier sur son territoire : elle relève du Centre Hospitalier de Bigorre, à Tarbes, également connu sous le nom de Centre Hospitalier Tarbes-Lourdes. Pour ses habitants, l'essentiel des rendez-vous médicaux implique donc un déplacement vers la ville voisine, à l'intérieur de l'agglomération Tarbes-Lourdes-Pyrénées. Le taxi conventionné couvre naturellement ces trajets courts mais répétés : consultation de spécialiste, examen d'imagerie, série de séances de rééducation ou de dialyse, entrée programmée en hospitalisation de jour.",
      "Le principe du conventionnement est souvent mal compris : il ne transforme pas le taxi en véhicule sanitaire. Le chauffeur n'a aucune qualification sanitaire obligatoire, et le service se limite à un transport assis pour un patient autonome. Ce que la convention signée avec la CPAM des Hautes-Pyrénées apporte, c'est un tarif encadré par l'Assurance maladie, l'acceptation du bon de transport et le tiers payant, qui vous évite toute avance de frais sur présentation de la carte Vitale. Si votre état exige un brancard, de l'oxygène ou une surveillance, le médecin prescrit une ambulance.",
      "Dans une agglomération où les flux convergent vers le même établissement aux mêmes heures, réserver la veille reste le meilleur moyen d'obtenir un créneau compatible avec l'heure de convocation, en particulier pour la dialyse ou la radiothérapie dont le protocole ne se décale pas. Sur prescription médicale, la prise en charge s'établit à 100 % du tarif conventionné en affection longue durée, en accident du travail ou pour une hospitalisation liée, et à 65 % pour les autres motifs, la mutuelle couvrant généralement le reste. Comparez ci-dessous les transporteurs référencés sur le secteur.",
    ],
    voisines: [
      { nom: "Tarbes", slug: "tarbes" },
      { nom: "Bordères-sur-l'Échez", slug: "borderes-sur-lechez" },
      { nom: "Séméac", slug: "semeac" },
      { nom: "Soues", slug: "soues" },
      { nom: "Barbazan-Debat", slug: "barbazan-debat" },
      { nom: "Bours", slug: "bours" },
    ],
    faq: [
      {
        question: "Aureilhan a-t-elle un hôpital sur son territoire ?",
        answer:
          "Non. Malgré sa taille, Aureilhan n'accueille pas d'établissement hospitalier : la commune est rattachée au Centre Hospitalier de Bigorre, à Tarbes. Les taxis conventionnés du secteur assurent donc principalement des trajets vers cet établissement et vers les structures de soins de l'agglomération.",
      },
      {
        question: "Le tiers payant s'applique-t-il systématiquement ?",
        answer:
          "La plupart des taxis conventionnés le pratiquent, mais ce n'est pas une obligation : vérifiez-le lors de la réservation. Avec le tiers payant, vous présentez votre prescription médicale de transport et votre carte Vitale et ne réglez rien. Sans lui, vous avancez la course et demandez ensuite le remboursement à votre CPAM.",
      },
    ],
  },

  "saint-jean-le-blanc/ambulance": {
    etablissements: [
      { nom: "Hôpital de la Source", slug: "chru-d-orleans-hopital-de-la-source-45" },
      { nom: "CHU d'Orléans", slug: "chru-d-orleans-hopital-de-la-source-45" },
    ],
    intro: [
      "Commune de la rive gauche de la Loire intégrée à Orléans Métropole, Saint-Jean-le-Blanc (45) n'accueille pas d'établissement hospitalier sur son territoire : elle relève du CHU d'Orléans et de son Hôpital de la Source, avenue de l'Hôpital, devenu centre hospitalier universitaire en octobre 2023 après avoir longtemps porté le statut de centre hospitalier régional. Franchir la Loire pour rejoindre les plateaux techniques fait donc partie du quotidien des transports sanitaires du secteur, qu'il s'agisse d'une entrée programmée, d'un retour à domicile après hospitalisation ou d'un transfert vers un établissement de suite.",
      "L'ambulance est prescrite lorsque le patient doit voyager allongé ou sous surveillance médicale. Son véhicule, agréé par l'ARS Centre-Val de Loire, embarque un brancard, de l'oxygène et le matériel de premiers secours ; l'équipage compte deux personnes, dont au moins un diplômé d'État ambulancier. Cette exigence de qualification distingue clairement l'ambulance du taxi conventionné, réservé aux patients autonomes voyageant assis et dont le chauffeur n'est tenu à aucune formation sanitaire. C'est le médecin prescripteur qui tranche entre les deux, en fonction de l'état du patient le jour du trajet.",
      "Les sociétés qui couvrent Saint-Jean-le-Blanc, Saint-Denis-en-Val ou Saint-Cyr-en-Val participent à la garde ambulancière du Loiret, régulée sous l'égide du SAMU 45 (Centre 15), qui assure la permanence des transports urgents la nuit, le week-end et les jours fériés. Sur prescription médicale, l'Assurance maladie rembourse le transport allongé à 100 % en affection longue durée, en accident du travail ou pour une hospitalisation directement liée, et à 55 % pour les autres motifs, généralement en tiers payant. Comparez ci-dessous les ambulances référencées sur le secteur, avec leur téléphone direct.",
    ],
    voisines: [
      { nom: "Orléans", slug: "orleans" },
      { nom: "Saint-Denis-en-Val", slug: "saint-denis-en-val" },
      { nom: "Saint-Jean-de-Braye", slug: "saint-jean-de-braye" },
      { nom: "Saint-Cyr-en-Val", slug: "saint-cyr-en-val" },
    ],
    faq: [
      {
        question: "Vers quel hôpital les ambulances de Saint-Jean-le-Blanc transportent-elles ?",
        answer:
          "Saint-Jean-le-Blanc n'a pas d'établissement hospitalier sur son territoire. Les transports se font vers le CHU d'Orléans, principalement l'Hôpital de la Source, hôpital de rattachement de la commune. L'établissement a obtenu le statut de centre hospitalier universitaire en octobre 2023.",
      },
      {
        question: "Qui prévenir pour un transport urgent la nuit dans le Loiret ?",
        answer:
          "En cas d'urgence vitale, appelez le 15. Le SAMU 45 régule la garde ambulancière départementale, qui garantit la disponibilité d'une ambulance la nuit, le week-end et les jours fériés, et engage les moyens adaptés. Pour un transport programmé, contactez directement l'une des entreprises référencées dans l'annuaire.",
      },
      {
        question: "Faut-il une prescription pour une ambulance ?",
        answer:
          "Oui, sauf intervention déclenchée par le Centre 15 dans un contexte d'urgence. Dans tous les autres cas, une prescription médicale de transport est nécessaire pour obtenir le remboursement : 100 % en affection longue durée, accident du travail ou hospitalisation liée, et 55 % pour les autres motifs, le plus souvent sans avance de frais grâce au tiers payant.",
      },
    ],
  },

  "saint-jean-le-blanc/taxi-conventionne": {
    etablissements: [
      { nom: "Hôpital de la Source", slug: "chru-d-orleans-hopital-de-la-source-45" },
      { nom: "CHU d'Orléans", slug: "chru-d-orleans-hopital-de-la-source-45" },
    ],
    intro: [
      "À Saint-Jean-le-Blanc (45), le taxi conventionné sert avant tout à franchir la Loire : la commune, membre d'Orléans Métropole, ne dispose pas d'établissement hospitalier propre et dépend du CHU d'Orléans, dont l'Hôpital de la Source rassemble consultations, examens et hospitalisations programmées. Devenu centre hospitalier universitaire en octobre 2023, l'établissement orléanais a vu croître le volume de consultations spécialisées drainées depuis les communes de la rive gauche. Pour un patient autonome, ce trajet de quelques kilomètres n'exige ni brancard ni surveillance : c'est exactement la situation pour laquelle le transport assis conventionné a été conçu.",
      "Le conventionnement, ici, est un accord passé avec la CPAM du Loiret. Le taxi applique un tarif encadré, distinct d'une course libre, et accepte le bon de transport, ce qui déclenche le tiers payant : vous ne réglez rien sur présentation de votre carte Vitale. Le chauffeur n'a pas de qualification sanitaire obligatoire, à la différence de l'auxiliaire ambulancier qui conduit un VSL ou du diplômé d'État ambulancier présent à bord d'une ambulance.",
      "Les ponts orléanais et les créneaux de rendez-vous groupés en début de matinée sont les deux vraies contraintes de ce secteur : réserver la veille, en communiquant l'heure de convocation plutôt que l'heure de départ souhaitée, évite l'essentiel des mauvaises surprises. Sur prescription médicale, le remboursement atteint 100 % du tarif conventionné en ALD, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs. Retrouvez ci-dessous les taxis conventionnés référencés autour de Saint-Jean-le-Blanc.",
    ],
    voisines: [
      { nom: "Orléans", slug: "orleans" },
      { nom: "Saint-Denis-en-Val", slug: "saint-denis-en-val" },
      { nom: "Saint-Jean-de-Braye", slug: "saint-jean-de-braye" },
      { nom: "Saint-Cyr-en-Val", slug: "saint-cyr-en-val" },
    ],
    faq: [
      {
        question: "Quels établissements desservent les taxis conventionnés de Saint-Jean-le-Blanc ?",
        answer:
          "Principalement le CHU d'Orléans et son Hôpital de la Source, hôpital de rattachement de la commune, ainsi que les cabinets et centres de soins de la métropole orléanaise. Saint-Jean-le-Blanc n'accueillant pas d'établissement hospitalier, les trajets remboursés sortent presque toujours de la commune.",
      },
      {
        question: "Le taxi conventionné convient-il après une opération ?",
        answer:
          "Cela dépend de votre autonomie à la sortie. S'il vous est possible de vous asseoir et de vous déplacer seul, le médecin prescrira un transport assis. Si vous devez rester allongé, recevoir de l'oxygène ou être surveillé, il prescrira une ambulance, dont l'équipage comprend un diplômé d'État ambulancier et qui dispose d'un brancard.",
      },
    ],
  },

  "le-chambon-feugerolles/ambulance": {
    etablissements: [
      { nom: "Centre Hospitalier Georges Claudinon", slug: "ch-georges-claudinon-42" },
    ],
    intro: [
      "Le Chambon-Feugerolles fait partie des rares communes de sa taille à héberger son propre établissement public de santé : le Centre Hospitalier Georges Claudinon, rue Paul Langevin, implanté sur son territoire dans la vallée de l'Ondaine (42). Membre du Groupement Hospitalier de Territoire de la Loire, il travaille en lien avec le CHU de Saint-Étienne, situé à environ 7 kilomètres, et avec l'Institut de Cancérologie Lucien Neuwirth pour les prises en charge oncologiques.",
      "Cette organisation en réseau nourrit une activité de transport allongé spécifique : les ambulances du secteur assurent de nombreux transferts entre le Centre Hospitalier Georges Claudinon et les plateaux techniques stéphanois, en plus des sorties d'hospitalisation et des entrées programmées. Le véhicule, agréé par l'ARS Auvergne-Rhône-Alpes, est équipé d'un brancard, d'oxygène et de matériel de premiers secours, et son équipage de deux personnes comprend au moins un diplômé d'État ambulancier.",
      "Les entreprises implantées dans l'Ondaine, du Chambon-Feugerolles à Firminy, La Ricamarie ou Unieux, prennent part à la garde ambulancière du département, régulée sous l'égide du SAMU 42 (Centre 15), qui couvre la nuit, les week-ends et les jours fériés. Sur prescription médicale, l'Assurance maladie rembourse 100 % en affection longue durée, accident du travail ou hospitalisation liée, et 55 % pour les autres motifs, le tiers payant étant la règle chez la plupart des transporteurs. Comparez ci-dessous les ambulances référencées.",
    ],
    voisines: [
      { nom: "Firminy", slug: "firminy" },
      { nom: "La Ricamarie", slug: "la-ricamarie" },
      { nom: "Roche-la-Molière", slug: "roche-la-moliere" },
      { nom: "Fraisses", slug: "fraisses" },
      { nom: "Unieux", slug: "unieux" },
      { nom: "Saint-Genest-Lerpt", slug: "saint-genest-lerpt" },
    ],
    faq: [
      {
        question: "Y a-t-il un hôpital au Chambon-Feugerolles ?",
        answer:
          "Oui. Le Centre Hospitalier Georges Claudinon est implanté rue Paul Langevin, sur la commune. Il est membre du Groupement Hospitalier de Territoire de la Loire et travaille en lien avec le CHU de Saint-Étienne, à environ 7 kilomètres, ainsi qu'avec l'Institut de Cancérologie Lucien Neuwirth.",
      },
      {
        question: "Les ambulances assurent-elles les transferts vers le CHU de Saint-Étienne ?",
        answer:
          "Oui, et cela représente une part importante de leur activité. Le Centre Hospitalier Georges Claudinon fonctionne en réseau avec le CHU de Saint-Étienne, distant d'environ 7 kilomètres, et avec l'Institut de Cancérologie Lucien Neuwirth : les transferts de patients allongés ou surveillés entre ces établissements sont réguliers.",
      },
      {
        question: "Comment est organisée la permanence des transports urgents dans la Loire ?",
        answer:
          "La garde ambulancière du département est régulée sous l'égide du SAMU 42 (Centre 15). Les entreprises agréées assurent à tour de rôle la permanence des transports sanitaires urgents la nuit, le week-end et les jours fériés. En cas d'urgence vitale, composez le 15 ; pour un transport programmé, appelez directement une ambulance de l'annuaire.",
      },
    ],
  },

  "le-chambon-feugerolles/taxi-conventionne": {
    etablissements: [
      { nom: "Centre Hospitalier Georges Claudinon", slug: "ch-georges-claudinon-42" },
    ],
    intro: [
      "Avoir un hôpital sur place ne dispense pas de se déplacer. Au Chambon-Feugerolles (42), le Centre Hospitalier Georges Claudinon couvre une partie des besoins de la vallée de l'Ondaine, mais de nombreux soins spécialisés relèvent du CHU de Saint-Étienne, à environ 7 kilomètres, ou de l'Institut de Cancérologie Lucien Neuwirth. Pour les patients autonomes, ces allers-retours se font en taxi conventionné, mode de transport assis pris en charge par l'Assurance maladie.",
      "Le conventionnement est un accord passé avec la CPAM de la Loire : il fixe le tarif applicable et permet au chauffeur d'accepter votre bon de transport, donc de pratiquer le tiers payant. Il n'implique en revanche aucune formation sanitaire : le taxi conventionné s'adresse à des patients qui montent, s'assoient et descendent seuls. Dès qu'un brancard, de l'oxygène ou une surveillance sont nécessaires, la prescription bascule vers l'ambulance et son équipage comprenant un diplômé d'État ambulancier.",
      "La topographie de l'Ondaine, avec ses versants et ses liaisons contraintes vers Saint-Étienne, plaide pour une réservation la veille, surtout lorsqu'un protocole de radiothérapie ou de dialyse impose des horaires fixes plusieurs fois par semaine. Sur prescription médicale, l'Assurance maladie prend en charge 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs. Retrouvez ci-dessous les taxis conventionnés du secteur, avec leur téléphone direct.",
    ],
    voisines: [
      { nom: "Firminy", slug: "firminy" },
      { nom: "La Ricamarie", slug: "la-ricamarie" },
      { nom: "Roche-la-Molière", slug: "roche-la-moliere" },
      { nom: "Fraisses", slug: "fraisses" },
      { nom: "Unieux", slug: "unieux" },
      { nom: "Saint-Genest-Lerpt", slug: "saint-genest-lerpt" },
    ],
    faq: [
      {
        question: "Quels établissements les taxis conventionnés du Chambon-Feugerolles desservent-ils ?",
        answer:
          "Le Centre Hospitalier Georges Claudinon, implanté sur la commune, ainsi que le CHU de Saint-Étienne, à environ 7 kilomètres, et l'Institut de Cancérologie Lucien Neuwirth pour les soins oncologiques. Les trajets vers l'agglomération stéphanoise représentent une part importante des courses conventionnées du secteur.",
      },
      {
        question: "Puis-je choisir mon taxi conventionné pour des séances régulières ?",
        answer:
          "Oui, vous êtes libre de choisir votre transporteur parmi ceux qui sont conventionnés. Pour une série de séances, il est même conseillé de rester avec le même : il connaîtra votre adresse, vos horaires et les contraintes de l'établissement, ce qui limite les retards. Réservez l'ensemble des trajets dès la remise de votre planning.",
      },
    ],
  },

  "abymes/ambulance": {
    etablissements: [
      { nom: "CHU de Pointe-à-Pitre", slug: "centre-hospitalier-universitaire-de-pointe-a-pitre-9a" },
      { nom: "CHU de Guadeloupe", slug: "centre-hospitalier-universitaire-de-pointe-a-pitre-9a" },
      { nom: "Polyclinique de la Guadeloupe", slug: "polyclinique-de-guadeloupe-9a" },
    ],
    intro: [
      "Aux Abymes (971), commune la plus peuplée de Guadeloupe avec 51 760 habitants en 2022, le transport allongé s'organise autour d'un établissement que la commune héberge directement : le CHU de Guadeloupe, route de Chauvel, également désigné comme CHU de Pointe-à-Pitre/Les Abymes. La Polyclinique de la Guadeloupe, rue Raphaël Jolivière au Morne Jolivière, complète cette offre pour les prises en charge privées. Les entreprises d'ambulances agréées par l'ARS interviennent donc à quelques minutes du plateau technique de référence de l'archipel, une configuration peu fréquente dans les territoires ultramarins.",
      "L'ambulance est prescrite lorsque le patient doit voyager allongé ou rester sous surveillance pendant le trajet : sortie de bloc, retour à domicile après une hospitalisation lourde, transfert entre le CHU et la polyclinique, entrée programmée dans un service. L'équipage comprend au moins un diplômé d'État ambulancier (DEA) et le véhicule embarque brancard, oxygène et matériel de premiers secours. Les sociétés abymiennes contribuent à la garde ambulancière du département, régulée sous l'égide du SAMU 971 (Centre 15), qui assure la permanence des transports urgents la nuit, les week-ends et les jours fériés.",
      "Parce que le CHU de Guadeloupe concentre l'essentiel du plateau technique de l'archipel, les ambulanciers implantés aux Abymes prennent aussi en charge des patients venus de Baie-Mahault, du Gosier, du Moule ou de Morne-à-l'Eau : les tournées s'allongent et la réservation anticipée reste la meilleure garantie de ponctualité pour une admission programmée. Sur prescription médicale, l'Assurance maladie rembourse 100 % du trajet en cas d'affection longue durée, d'accident du travail ou d'hospitalisation liée, et 55 % pour les autres motifs, généralement en tiers payant. Comparez ci-dessous les ambulances des Abymes référencées, téléphone direct et conventionnement CPAM à l'appui.",
    ],
    voisines: [
      { nom: "Pointe-à-Pitre", slug: "pointe-a-pitre" },
      { nom: "Baie-Mahault", slug: "baie-mahault" },
      { nom: "Le Gosier", slug: "le-gosier" },
      { nom: "Morne-à-l'Eau", slug: "morne-a-l-eau" },
      { nom: "Le Moule", slug: "le-moule" },
      { nom: "Sainte-Anne", slug: "sainte-anne" },
    ],
    faq: [
      {
        question: "Quels établissements de santé les ambulances des Abymes desservent-elles ?",
        answer:
          "Elles desservent en premier lieu le CHU de Guadeloupe, implanté route de Chauvel sur la commune même, ainsi que la Polyclinique de la Guadeloupe au Morne Jolivière. Sorties d'hospitalisation, entrées programmées et transferts entre ces deux établissements constituent l'essentiel de leur activité de transport allongé.",
      },
      {
        question: "Faut-il une ambulance ou un taxi conventionné pour aller au CHU depuis Les Abymes ?",
        answer:
          "L'ambulance s'impose si vous devez être transporté allongé, brancardé ou surveillé : elle circule avec un diplômé d'État ambulancier, un brancard et de l'oxygène. Si vous êtes autonome et pouvez voyager assis, le taxi conventionné suffit. C'est le médecin prescripteur qui détermine le mode de transport sur la prescription médicale.",
      },
      {
        question: "Comment sont assurés les transports sanitaires urgents la nuit aux Abymes ?",
        answer:
          "Par la garde ambulancière du département, régulée sous l'égide du SAMU 971 (Centre 15) : les entreprises agréées assurent à tour de rôle la permanence en dehors des heures ouvrables. En cas d'urgence vitale, composez le 15 ; pour un transport programmé, contactez directement une société de l'annuaire.",
      },
    ],
  },

  "les-abymes/taxi-conventionne": {
    etablissements: [
      { nom: "CHU de Guadeloupe", slug: "centre-hospitalier-universitaire-de-pointe-a-pitre-9a" },
      { nom: "Polyclinique de la Guadeloupe", slug: "polyclinique-de-guadeloupe-9a" },
    ],
    intro: [
      "Aux Abymes (971), commune la plus peuplée de Guadeloupe, le taxi conventionné est le mode de transport remboursé le plus utilisé pour les patients autonomes. Il dessert le CHU de Guadeloupe, route de Chauvel, implanté sur la commune même, ainsi que la Polyclinique de la Guadeloupe au Morne Jolivière : consultations de suivi, séances de dialyse ou de chimiothérapie, examens d'imagerie, bilans préopératoires. Cette proximité avec le plateau technique de référence de l'archipel simplifie les trajets réguliers de nombreux patients abymiens.",
      "Un taxi conventionné a signé une convention avec la CPAM de Guadeloupe : ce conventionnement, et non le compteur habituel, fixe le tarif remboursable du trajet. Le chauffeur n'a pas d'obligation de qualification sanitaire, car ce transport s'adresse à un patient capable de monter et descendre seul du véhicule. Dès qu'un brancardage, une position allongée ou une surveillance médicale s'imposent, c'est l'ambulance, avec son équipage DEA, qui doit être prescrite à la place.",
      "L'Assurance maladie rembourse 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs, la mutuelle couvrant en général le reste. Le tiers payant évite d'avancer les frais sur présentation de la prescription médicale de transport et de la carte Vitale. Pour un traitement itératif au CHU, réserver auprès du même chauffeur limite les temps d'attente et stabilise les horaires de rendez-vous. Comparez ci-dessous les taxis conventionnés des Abymes, avec leur téléphone direct.",
    ],
    voisines: [
      { nom: "Pointe-à-Pitre", slug: "pointe-a-pitre" },
      { nom: "Baie-Mahault", slug: "baie-mahault" },
      { nom: "Le Gosier", slug: "le-gosier" },
      { nom: "Morne-à-l'Eau", slug: "morne-a-l-eau" },
      { nom: "Le Moule", slug: "le-moule" },
      { nom: "Sainte-Anne", slug: "sainte-anne" },
    ],
    faq: [
      {
        question: "Quelle différence entre un taxi conventionné et un taxi ordinaire aux Abymes ?",
        answer:
          "Le taxi conventionné a signé un accord avec la CPAM de Guadeloupe qui fixe un tarif remboursable pour les trajets médicaux prescrits, contrairement à un taxi classique facturé au compteur. Il transporte un patient valide, assis, sans besoin de surveillance médicale pendant le trajet vers le CHU de Guadeloupe ou la Polyclinique.",
      },
      {
        question: "Le taxi conventionné est-il remboursé à 100 % aux Abymes ?",
        answer:
          "Le remboursement atteint 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, sur prescription médicale. Pour les autres motifs de transport, le taux est de 65 %, la mutuelle prenant en charge le complément dans la plupart des contrats.",
      },
      {
        question: "Comment réserver un taxi conventionné pour un rendez-vous au CHU de Guadeloupe ?",
        answer:
          "Contactez directement l'un des taxis conventionnés référencés ci-dessous en indiquant l'heure du rendez-vous, le service concerné et votre lieu de prise en charge. Munissez-vous de la prescription médicale de transport et de votre carte Vitale pour bénéficier du tiers payant.",
      },
    ],
  },

  "ducos/ambulance": {
    intro: [
      "Ducos ne compte aucun établissement hospitalier sur son territoire. Les quelque 17 000 habitants de ce carrefour du centre de la Martinique (972) sont rattachés au CHU de Martinique, à Fort-de-France, situé à environ 11 kilomètres. C'est donc autour de cette liaison que les entreprises d'ambulances agréées par l'ARS bâtissent leur activité, le CHU regroupant sept hôpitaux dont Pierre Zobda-Quitman. Dire les choses clairement évite les mauvaises surprises : à Ducos, tout transport allongé suppose un déplacement vers le chef-lieu ou vers un autre site du groupe hospitalier.",
      "Le recours à l'ambulance répond à une situation précise : le patient ne peut pas voyager assis, doit être brancardé, ou nécessite une surveillance et un apport d'oxygène pendant le trajet. Le véhicule est agréé, équipé en conséquence, et l'équipage compte un diplômé d'État ambulancier. Sorties de chirurgie, retours à domicile après hospitalisation, transferts entre sites du CHU et entrées programmées forment le quotidien des transporteurs du secteur, qui participent par ailleurs à la garde ambulancière du département sous la régulation du SAMU 972 (Centre 15).",
      "La distance jusqu'à Fort-de-France reste modeste, mais les créneaux d'admission et de sortie se concentrent sur les mêmes plages horaires : réserver la veille, en indiquant l'heure exacte du rendez-vous et l'étage du service, fait gagner un temps réel. La prise en charge par l'Assurance maladie s'élève à 100 % en affection longue durée, accident du travail ou hospitalisation liée, et à 55 % dans les autres cas, sur prescription médicale et le plus souvent sans avance de frais. Retrouvez ci-dessous les ambulances intervenant à Ducos, avec leur téléphone direct.",
    ],
    voisines: [
      { nom: "Le Lamentin", slug: "le-lamentin" },
      { nom: "Rivière-Salée", slug: "riviere-salee" },
      { nom: "Le François", slug: "le-francois" },
      { nom: "Saint-Esprit", slug: "saint-esprit" },
    ],
    faq: [
      {
        question: "Y a-t-il un hôpital à Ducos ?",
        answer:
          "Non, aucun établissement hospitalier n'est implanté sur la commune. Ducos est rattachée au CHU de Martinique, à Fort-de-France, à environ 11 kilomètres, qui regroupe sept hôpitaux dont Pierre Zobda-Quitman. Les transports allongés au départ de Ducos ont donc presque toujours pour destination un site de ce groupe hospitalier.",
      },
      {
        question: "Le transport en ambulance depuis Ducos est-il remboursé ?",
        answer:
          "Oui, dès lors qu'il fait l'objet d'une prescription médicale de transport. L'Assurance maladie rembourse 100 % du tarif en cas d'affection longue durée, d'accident du travail ou d'hospitalisation liée, et 55 % pour les autres motifs. La plupart des transporteurs pratiquent le tiers payant sur présentation du bon de transport et de la carte Vitale.",
      },
    ],
  },

  "ducos/taxi-conventionne": {
    intro: [
      "Pour les patients de Ducos (972) capables de voyager assis, le taxi conventionné est le mode de transport remboursé le plus courant. Il couvre les allers-retours vers le CHU de Martinique, à Fort-de-France, à environ 11 kilomètres de la commune : consultations de suivi, examens d'imagerie, séances itératives et bilans préopératoires. Aucun établissement de santé n'étant implanté à Ducos, ces trajets réguliers structurent le parcours de soins de nombreux habitants du centre de l'île.",
      "Un taxi conventionné est un taxi ayant signé une convention avec la CPAM de la Martinique. Ce conventionnement, et non le compteur habituel, détermine le tarif appliqué et ouvre droit au remboursement du trajet. Point important souvent mal compris : le chauffeur n'est soumis à aucune qualification sanitaire obligatoire, car ce transport s'adresse à un patient autonome, qui monte et descend du véhicule sans aide. Dès qu'une position allongée, un brancardage ou une surveillance sont nécessaires, c'est l'ambulance qui doit être prescrite.",
      "Le remboursement atteint 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs, la mutuelle prenant généralement en charge le complément. Le tiers payant vous dispense d'avancer les frais sur présentation de la prescription médicale de transport et de la carte Vitale. Pour un traitement répété, réserver auprès du même chauffeur stabilise les horaires et limite les attentes en fin de séance. Consultez ci-dessous les taxis conventionnés desservant Ducos.",
    ],
    voisines: [
      { nom: "Le Lamentin", slug: "le-lamentin" },
      { nom: "Rivière-Salée", slug: "riviere-salee" },
      { nom: "Le François", slug: "le-francois" },
      { nom: "Saint-Esprit", slug: "saint-esprit" },
    ],
    faq: [
      {
        question: "Quelle différence entre un taxi conventionné et un taxi ordinaire à Ducos ?",
        answer:
          "Le taxi conventionné a signé une convention avec la CPAM de la Martinique : il applique un tarif encadré, accepte la prescription médicale de transport et pratique le tiers payant. Un taxi ordinaire facture sa course au compteur, sans prise en charge par l'Assurance maladie. Vérifiez toujours le conventionnement lors de la réservation.",
      },
      {
        question: "Puis-je aller au CHU de Martinique en taxi conventionné depuis Ducos ?",
        answer:
          "Oui, c'est l'usage principal de ce transport à Ducos : le CHU de Martinique, à Fort-de-France, se trouve à environ 11 kilomètres. La condition est d'être autonome, c'est-à-dire de pouvoir effectuer le trajet assis sans assistance médicale, et de disposer d'une prescription médicale de transport.",
      },
      {
        question: "Les trajets répétés sont-ils pris en charge à 100 % ?",
        answer:
          "Lorsque les séances relèvent d'une affection longue durée, le transport est remboursé à 100 % du tarif conventionné, sans avance de frais grâce au tiers payant. Pour les autres motifs, la prise en charge est de 65 %. Dans tous les cas, la prescription médicale de transport reste indispensable.",
      },
    ],
  },

  "kourou/ambulance": {
    etablissements: [
      { nom: "Centre Hospitalier de Kourou", slug: "centre-hospitalier-intercom-de-kourou-9c" },
      { nom: "CHU de Guyane", slug: "chu-de-guyane-9c" },
      { nom: "Centre Hospitalier Andrée-Rosemon de Cayenne", slug: "chu-de-guyane-9c" },
    ],
    intro: [
      "Kourou (973) dispose d'un atout que peu de communes guyanaises partagent : un hôpital sur place. Le Centre Hospitalier de Kourou (CHK), avenue Léopold Héder, devenu site du CHU de Guyane, totalise 112 lits et constitue le point d'appui des transports sanitaires du secteur. Autour de lui, les entreprises d'ambulances agréées assurent les sorties d'hospitalisation, les entrées programmées et les transferts vers les autres établissements du territoire, dans une ville également connue pour héberger le Centre Spatial Guyanais.",
      "L'échelle guyanaise transforme la nature du métier. Le Centre Hospitalier Andrée-Rosemon de Cayenne se trouve à environ 60 kilomètres, et le CHOG de Saint-Laurent-du-Maroni à quelque 200 kilomètres : un transfert entre plateaux techniques n'est pas une course urbaine mais un trajet longue distance, qui mobilise un véhicule et son équipage pour une large part de la journée. Toute ambulance embarque brancard et oxygène et circule avec au moins un diplômé d'État ambulancier, condition d'un transport allongé ou surveillé.",
      "Les sociétés de Kourou participent à la garde ambulancière du département, régulée sous l'égide du SAMU 973 (Centre 15), qui organise la permanence des transports urgents en dehors des heures ouvrables. Sur prescription médicale, l'Assurance maladie rembourse 100 % en affection longue durée, accident du travail ou hospitalisation liée, et 55 % pour les autres motifs, le tiers payant étant la règle chez la plupart des transporteurs. Compte tenu des distances, annoncez dès la réservation la destination exacte et l'heure de convocation. Comparez ci-dessous les ambulances de Kourou référencées.",
    ],
    voisines: [
      { nom: "Sinnamary", slug: "sinnamary" },
      { nom: "Macouria", slug: "macouria" },
      { nom: "Iracoubo", slug: "iracoubo" },
    ],
    faq: [
      {
        question: "Quel hôpital dessert Kourou ?",
        answer:
          "Le Centre Hospitalier de Kourou (CHK), avenue Léopold Héder, devenu site du CHU de Guyane, avec 112 lits. C'est l'établissement de proximité de la commune : la majorité des transports allongés locaux s'effectuent à son départ ou à sa destination, avant d'éventuels transferts vers un autre plateau technique du territoire.",
      },
      {
        question: "Une ambulance de Kourou peut-elle transporter un patient jusqu'à Cayenne ?",
        answer:
          "Oui. Le Centre Hospitalier Andrée-Rosemon de Cayenne est à environ 60 kilomètres de Kourou, et le CHOG de Saint-Laurent-du-Maroni à environ 200 kilomètres. Ces transferts longue distance immobilisent un véhicule et son équipage plusieurs heures : prévenez le transporteur le plus tôt possible pour qu'il puisse planifier la mission.",
      },
      {
        question: "Comment fonctionne la permanence des transports urgents en Guyane ?",
        answer:
          "La garde ambulancière du département est régulée sous l'égide du SAMU 973 (Centre 15), qui engage les entreprises agréées pour les transports urgents la nuit, le week-end et les jours fériés. Pour une urgence vitale, composez le 15 ; pour un transport programmé, appelez directement une ambulance de l'annuaire.",
      },
    ],
  },

  "kourou/taxi-conventionne": {
    etablissements: [
      { nom: "Centre Hospitalier de Kourou", slug: "centre-hospitalier-intercom-de-kourou-9c" },
      { nom: "CHU de Guyane", slug: "chu-de-guyane-9c" },
      { nom: "Centre Hospitalier Andrée-Rosemon de Cayenne", slug: "chu-de-guyane-9c" },
    ],
    intro: [
      "À Kourou (973), le taxi conventionné répond à un besoin très concret : effectuer, en position assise et sans avancer de frais, les trajets de suivi médical que la géographie guyanaise rend longs. Consultations, examens et séances itératives se déroulent au Centre Hospitalier de Kourou, site du CHU de Guyane avenue Léopold Héder, mais aussi au Centre Hospitalier Andrée-Rosemon de Cayenne, à environ 60 kilomètres, voire au CHOG de Saint-Laurent-du-Maroni, à quelque 200 kilomètres de la commune.",
      "Ce mode de transport s'adresse exclusivement au patient autonome : celui qui monte et descend du véhicule sans aide et n'a besoin ni de brancard ni de surveillance. Le chauffeur d'un taxi conventionné n'est pas tenu à une qualification sanitaire ; ce qui compte, c'est la convention signée avec la CPAM de la Guyane, qui fixe un tarif encadré et permet la prise en charge du trajet. Si l'état de santé impose la position allongée, la prescription doit mentionner une ambulance.",
      "Sur les longues liaisons littorales, une réservation la veille et une heure de départ confirmée valent mieux qu'un appel du matin : un créneau manqué se rattrape difficilement quand le rendez-vous se situe à une heure de route. L'Assurance maladie rembourse 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs, avec tiers payant sur présentation du bon de transport et de la carte Vitale. Retrouvez ci-dessous les taxis conventionnés de Kourou référencés.",
    ],
    voisines: [
      { nom: "Sinnamary", slug: "sinnamary" },
      { nom: "Macouria", slug: "macouria" },
      { nom: "Iracoubo", slug: "iracoubo" },
    ],
    faq: [
      {
        question: "Un taxi conventionné peut-il m'emmener de Kourou à Cayenne ?",
        answer:
          "Oui. Le Centre Hospitalier Andrée-Rosemon de Cayenne est situé à environ 60 kilomètres de Kourou, et ce trajet est pris en charge dès lors qu'il est prescrit et que vous pouvez voyager assis de façon autonome. Réservez à l'avance en précisant l'heure de convocation, la durée du trajet étant significative.",
      },
      {
        question: "Quel est le montant remboursé pour un taxi conventionné à Kourou ?",
        answer:
          "L'Assurance maladie prend en charge 100 % du tarif conventionné en cas d'affection longue durée, d'accident du travail ou d'hospitalisation liée, et 65 % pour les autres motifs. Le tiers payant s'applique sur présentation de la prescription médicale de transport et de la carte Vitale : vous n'avancez pas la part remboursée.",
      },
    ],
  },

  "saint-pierre/ambulance": {
    intro: [
      "Saint-Pierre (974) est le point d'ancrage du transport sanitaire du sud de La Réunion. La commune abrite le GHSR, Groupe Hospitalier Sud Réunion, avenue François Mitterrand, siège des Sites Sud du CHU de La Réunion. Cet ensemble couvre Saint-Pierre mais aussi Saint-Joseph, Le Tampon, Saint-Louis et Cilaos : autant de communes dont les patients convergent vers le plateau technique saint-pierrois. Les entreprises d'ambulances agréées par l'ARS y assurent un flux continu de transports allongés.",
      "L'ambulance intervient quand la position assise est exclue ou quand une surveillance est nécessaire durant le trajet : sortie de bloc opératoire, retour à domicile après une hospitalisation lourde, transfert entre services, admission programmée. Le véhicule est armé d'un brancard, d'oxygène et du matériel de premiers secours, et l'équipage comprend au moins un diplômé d'État ambulancier. Les sociétés locales prennent part à la garde ambulancière du département, régulée sous l'égide du SAMU 974 (Centre 15), qui couvre les transports urgents la nuit, les week-ends et les jours fériés.",
      "Cette fonction de recours a une conséquence pratique : une partie notable des missions consiste à ramener des patients vers les Hauts ou vers l'est de la zone sud après une prise en charge à Saint-Pierre, sur des itinéraires sinueux où le temps de trajet dépasse largement la distance kilométrique. Sur prescription médicale, le remboursement est de 100 % en affection longue durée, accident du travail ou hospitalisation liée, et de 55 % pour les autres motifs, en tiers payant chez la plupart des transporteurs. Comparez ci-dessous les ambulances de Saint-Pierre référencées.",
    ],
    voisines: [
      { nom: "Le Tampon", slug: "le-tampon" },
      { nom: "Saint-Louis", slug: "saint-louis" },
      { nom: "Saint-Joseph", slug: "saint-joseph" },
      { nom: "Petite-Île", slug: "petite-ile" },
    ],
    faq: [
      {
        question: "Quel hôpital les ambulances de Saint-Pierre desservent-elles ?",
        answer:
          "Le GHSR (Groupe Hospitalier Sud Réunion), avenue François Mitterrand à Saint-Pierre, qui constitue le siège des Sites Sud du CHU de La Réunion. Ce groupe hospitalier couvre Saint-Pierre, Saint-Joseph, Le Tampon, Saint-Louis et Cilaos, ce qui explique le volume de transferts et de sorties d'hospitalisation au départ de la commune.",
      },
      {
        question: "Qui compose l'équipage d'une ambulance à Saint-Pierre ?",
        answer:
          "Deux personnes, dont au moins un diplômé d'État ambulancier (DEA). Le véhicule, agréé, embarque un brancard, de l'oxygène et du matériel de premiers secours. C'est ce qui le distingue du taxi conventionné, réservé aux patients autonomes transportés en position assise, sans qualification sanitaire exigée du chauffeur.",
      },
      {
        question: "Comment est organisée la permanence des transports urgents à La Réunion ?",
        answer:
          "Par la garde ambulancière du département, régulée sous l'égide du SAMU 974 (Centre 15) : les entreprises agréées assurent à tour de rôle les transports urgents en dehors des heures ouvrables. En cas d'urgence vitale, appelez le 15 ; pour un transport programmé, contactez directement une société de l'annuaire.",
      },
    ],
  },

  "saint-pierre/taxi-conventionne": {
    intro: [
      "Chaque jour, des dizaines de patients du sud de La Réunion rejoignent Saint-Pierre (974) en position assise pour une séance de dialyse, une radiothérapie, une consultation de suivi ou un examen d'imagerie au GHSR, siège des Sites Sud du CHU de La Réunion. Le taxi conventionné est le véhicule de ces trajets réguliers, et son rôle est d'autant plus structurant que le groupe hospitalier couvre également Saint-Joseph, Le Tampon, Saint-Louis et Cilaos.",
      "Le principe est simple : un taxi ayant signé une convention avec la CPAM de La Réunion applique un tarif encadré, accepte la prescription médicale de transport et pratique le tiers payant. Il transporte des patients autonomes, capables de monter et descendre seuls du véhicule ; aucune qualification sanitaire n'est requise de son chauffeur, à la différence de l'auxiliaire ambulancier qui conduit un VSL. Dès qu'un brancardage ou une surveillance sont nécessaires, l'ambulance devient obligatoire.",
      "Sur les liaisons entre le littoral et les Hauts, le temps de trajet varie fortement selon l'heure : pour un traitement itératif, mieux vaut fixer un créneau stable avec le même chauffeur que renégocier chaque semaine. L'Assurance maladie rembourse 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % dans les autres cas, la mutuelle complétant le plus souvent la différence. Consultez ci-dessous les taxis conventionnés de Saint-Pierre référencés, avec téléphone direct.",
    ],
    voisines: [
      { nom: "Le Tampon", slug: "le-tampon" },
      { nom: "Saint-Louis", slug: "saint-louis" },
      { nom: "Saint-Joseph", slug: "saint-joseph" },
      { nom: "Petite-Île", slug: "petite-ile" },
    ],
    faq: [
      {
        question: "Le taxi conventionné de Saint-Pierre pratique-t-il le tiers payant ?",
        answer:
          "Oui. Sur présentation de la prescription médicale de transport et de la carte Vitale, vous n'avancez pas la part prise en charge par l'Assurance maladie : 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs.",
      },
      {
        question: "Puis-je venir en taxi conventionné du Tampon ou de Saint-Louis vers Saint-Pierre ?",
        answer:
          "Oui, ces trajets sont fréquents : le GHSR de Saint-Pierre, siège des Sites Sud du CHU de La Réunion, couvre notamment Le Tampon, Saint-Louis, Saint-Joseph et Cilaos. Le transport est pris en charge sur prescription, à condition que vous puissiez effectuer le trajet assis sans assistance médicale.",
      },
      {
        question: "Taxi conventionné ou VSL à Saint-Pierre : quelle différence ?",
        answer:
          "Les deux transportent des patients assis et ouvrent les mêmes droits au remboursement. Le VSL est un véhicule sanitaire agréé par l'ARS, conduit par un auxiliaire ambulancier, adapté lorsqu'un accompagnement léger est utile ; le taxi conventionné convient à un patient pleinement autonome. Le médecin prescripteur indique le mode approprié.",
      },
    ],
  },

  "le-tampon/ambulance": {
    intro: [
      "Autant l'écrire sans détour : Le Tampon (974) n'a pas d'hôpital d'urgence sur son territoire. Deuxième commune la plus peuplée de La Réunion, elle est desservie par le GHSR, à Saint-Pierre, qui constitue les Sites Sud du CHU de La Réunion. Toute prise en charge hospitalière lourde suppose donc un déplacement, et les entreprises d'ambulances agréées par l'ARS organisent leur activité autour de cette liaison : admissions programmées, sorties d'hospitalisation, retours à domicile après une intervention.",
      "Le transport en ambulance répond à un critère médical, pas à un critère de confort. Il est prescrit lorsque le patient doit rester allongé, être brancardé, ou faire l'objet d'une surveillance et éventuellement d'un apport d'oxygène pendant le trajet. Le véhicule agréé embarque ce matériel et l'équipage compte au moins un diplômé d'État ambulancier. Les sociétés tamponnaises participent à la garde ambulancière du département, régulée sous l'égide du SAMU 974 (Centre 15), qui assure la permanence des transports urgents hors heures ouvrables.",
      "L'étendue de la commune, qui s'élève vers les Hauts, allonge sensiblement les temps de trajet : un retour à domicile depuis Saint-Pierre en fin de journée n'a pas la même durée selon le quartier de destination, ce qui justifie de communiquer une adresse précise dès la réservation. Sur prescription médicale, l'Assurance maladie rembourse 100 % en affection longue durée, accident du travail ou hospitalisation liée, et 55 % pour les autres motifs, généralement sans avance de frais. Comparez ci-dessous les ambulances intervenant au Tampon.",
    ],
    voisines: [
      { nom: "Saint-Pierre", slug: "saint-pierre" },
      { nom: "Entre-Deux", slug: "entre-deux" },
      { nom: "Saint-Joseph", slug: "saint-joseph" },
      { nom: "La Plaine-des-Palmistes", slug: "la-plaine-des-palmistes" },
      { nom: "Saint-Benoît", slug: "saint-benoit" },
      { nom: "Sainte-Rose", slug: "sainte-rose" },
    ],
    faq: [
      {
        question: "Y a-t-il un hôpital d'urgence au Tampon ?",
        answer:
          "Non. Il n'existe pas d'hôpital d'urgence sur la commune du Tampon : le territoire est desservi par le GHSR, à Saint-Pierre, qui constitue les Sites Sud du CHU de La Réunion. Les transports allongés au départ du Tampon ont donc le plus souvent Saint-Pierre pour destination.",
      },
      {
        question: "Quand une ambulance est-elle nécessaire plutôt qu'un transport assis ?",
        answer:
          "Lorsque votre état impose la position allongée, un brancardage ou une surveillance pendant le trajet, éventuellement avec oxygène. Dans ce cas, le véhicule agréé et l'équipage comprenant un diplômé d'État ambulancier sont indispensables. Si vous êtes autonome et pouvez voyager assis, le taxi conventionné est le mode adapté.",
      },
      {
        question: "Le trajet du Tampon vers Saint-Pierre est-il remboursé ?",
        answer:
          "Oui, sur prescription médicale de transport : 100 % du tarif en cas d'affection longue durée, d'accident du travail ou d'hospitalisation liée, et 55 % pour les autres motifs. La plupart des ambulances pratiquent le tiers payant, vous n'avancez alors pas la part prise en charge par l'Assurance maladie.",
      },
    ],
  },

  "le-tampon/taxi-conventionne": {
    intro: [
      "Comme la commune du Tampon (974) n'accueille pas d'hôpital d'urgence, ses habitants effectuent l'essentiel de leur suivi médical hospitalier à Saint-Pierre, auprès du GHSR qui constitue les Sites Sud du CHU de La Réunion. Deuxième commune la plus peuplée de l'île, Le Tampon génère de ce fait un flux quotidien important vers le littoral sud. Pour les patients autonomes, le taxi conventionné est la réponse adaptée à ces déplacements répétés : consultations de contrôle, examens d'imagerie, séances de dialyse ou de radiothérapie, bilans avant intervention, puis retour au domicile une fois l'examen terminé.",
      "Il ne s'agit pas d'un simple taxi : le conventionnement signé avec la CPAM de La Réunion fixe un tarif encadré, distinct de la course classique, et autorise la prise en charge du trajet par l'Assurance maladie. Le chauffeur n'a pas d'obligation de qualification sanitaire, puisque le transport concerne un patient capable de monter et descendre seul du véhicule. Dès que l'état de santé exige un brancard ou une surveillance, c'est une ambulance qui doit être prescrite, et non un transport assis.",
      "La commune s'étage vers les Hauts et les temps de descente vers le littoral varient selon l'heure et le quartier : pour des séances régulières, fixer un horaire récurrent avec le même transporteur évite les décalages en cascade. La prise en charge s'élève à 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et à 65 % pour les autres motifs, avec tiers payant sur présentation du bon de transport et de la carte Vitale. Retrouvez ci-dessous les taxis conventionnés du Tampon référencés.",
    ],
    voisines: [
      { nom: "Saint-Pierre", slug: "saint-pierre" },
      { nom: "Entre-Deux", slug: "entre-deux" },
      { nom: "Saint-Joseph", slug: "saint-joseph" },
      { nom: "La Plaine-des-Palmistes", slug: "la-plaine-des-palmistes" },
      { nom: "Saint-Benoît", slug: "saint-benoit" },
      { nom: "Sainte-Rose", slug: "sainte-rose" },
    ],
    faq: [
      {
        question: "Où vont principalement les taxis conventionnés du Tampon ?",
        answer:
          "Vers Saint-Pierre, où le GHSR constitue les Sites Sud du CHU de La Réunion et concentre les consultations, examens et séances de traitement du secteur. Aucun hôpital d'urgence n'étant implanté au Tampon, ces trajets représentent la majeure partie des transports assis prescrits sur la commune.",
      },
      {
        question: "Un taxi conventionné peut-il transporter un patient qui ne peut pas rester assis ?",
        answer:
          "Non. Le taxi conventionné est réservé aux patients autonomes, transportés en position assise, sans assistance médicale ni brancardage. Si votre état impose la position allongée ou une surveillance durant le trajet, le médecin doit prescrire une ambulance, dont l'équipage comprend un diplômé d'État ambulancier.",
      },
    ],
  },

  "saint-joseph/ambulance": {
    intro: [
      "À Saint-Joseph (974), la présence d'un site hospitalier ne doit pas induire en erreur. Le site de Saint-Joseph du CHU de La Réunion, rue Mère-Thérésa, rattaché aux Sites Sud, assure de la médecine polyvalente et gériatrique ainsi qu'un centre périnatal de proximité. Il ne comporte pas de service d'urgences lourdes : les urgences vitales sont orientées vers l'hôpital de Saint-Pierre. Cette répartition détermine l'activité des entreprises d'ambulances agréées par l'ARS implantées dans le secteur.",
      "Concrètement, les transports allongés au départ de Saint-Joseph se partagent entre deux logiques : les mouvements de proximité, liés aux entrées et sorties du site local en médecine et en gériatrie, et les liaisons vers Saint-Pierre, où se trouve le plateau technique de recours du sud de l'île. Dans les deux cas, l'ambulance suppose un véhicule agréé équipé d'un brancard et d'oxygène, et un équipage comprenant au moins un diplômé d'État ambulancier, seul cadre permettant un transport surveillé.",
      "Les transporteurs du secteur contribuent à la garde ambulancière du département, régulée sous l'égide du SAMU 974 (Centre 15), qui organise la permanence des transports urgents la nuit, le week-end et les jours fériés. Sur prescription médicale, la prise en charge est de 100 % en affection longue durée, accident du travail ou hospitalisation liée, et de 55 % pour les autres motifs, le tiers payant dispensant généralement d'avancer les frais. Comparez ci-dessous les ambulances de Saint-Joseph référencées, avec leur téléphone direct.",
    ],
    voisines: [
      { nom: "Petite-Île", slug: "petite-ile" },
      { nom: "Saint-Pierre", slug: "saint-pierre" },
      { nom: "Le Tampon", slug: "le-tampon" },
      { nom: "Saint-Philippe", slug: "saint-philippe" },
      { nom: "Sainte-Rose", slug: "sainte-rose" },
    ],
    faq: [
      {
        question: "Quelles prises en charge assure l'hôpital de Saint-Joseph ?",
        answer:
          "Le site de Saint-Joseph du CHU de La Réunion, rattaché aux Sites Sud, assure de la médecine polyvalente et gériatrique et dispose d'un centre périnatal de proximité. Il n'a pas de service d'urgences lourdes : les urgences vitales sont orientées vers l'hôpital de Saint-Pierre, où se situe le plateau technique de recours du sud de l'île.",
      },
      {
        question: "Les ambulances de Saint-Joseph assurent-elles les transferts vers Saint-Pierre ?",
        answer:
          "Oui, c'est une part importante de leur activité. Les patients nécessitant un plateau technique lourd sont pris en charge à Saint-Pierre : les transferts, admissions programmées et retours à domicile après hospitalisation constituent l'essentiel des missions de transport allongé au départ de la commune.",
      },
      {
        question: "Qui appeler la nuit pour un transport sanitaire urgent à Saint-Joseph ?",
        answer:
          "En cas d'urgence vitale, composez le 15 : le SAMU 974 régule la garde ambulancière du département, qui assure la permanence des transports urgents hors heures ouvrables. Pour un transport programmé, sortie d'hospitalisation ou consultation, contactez directement une entreprise d'ambulances de l'annuaire.",
      },
    ],
  },

  "saint-joseph/taxi-conventionne": {
    intro: [
      "Le taxi conventionné occupe une place particulière à Saint-Joseph (974), car le parcours de soins y est partagé entre deux niveaux. Le site local du CHU de La Réunion, rue Mère-Thérésa, rattaché aux Sites Sud, accueille la médecine polyvalente et gériatrique et un centre périnatal de proximité ; en revanche, il n'a pas d'urgences lourdes, et les prises en charge techniques se déroulent à Saint-Pierre. Beaucoup de trajets assis remboursés correspondent donc à ces allers-retours vers le sud-ouest de l'île.",
      "Le conventionnement avec la CPAM de La Réunion est ce qui distingue ce taxi d'un taxi ordinaire : tarif encadré, acceptation de la prescription médicale de transport, tiers payant. Il n'impose en revanche aucune qualification sanitaire au chauffeur, car le service s'adresse à un patient autonome, apte à monter et descendre seul du véhicule et à voyager assis. Un patient devant être allongé, brancardé ou surveillé relève de l'ambulance, avec un équipage comprenant un diplômé d'État ambulancier.",
      "Pour les traitements itératifs, la régularité compte autant que le prix : réserver un créneau fixe auprès du même transporteur limite les attentes après une séance et sécurise les horaires de consultation. Le remboursement atteint 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % dans les autres situations, la mutuelle complétant habituellement le reste. Consultez ci-dessous les taxis conventionnés desservant Saint-Joseph, avec téléphone direct et conventionnement vérifié.",
    ],
    voisines: [
      { nom: "Petite-Île", slug: "petite-ile" },
      { nom: "Saint-Pierre", slug: "saint-pierre" },
      { nom: "Le Tampon", slug: "le-tampon" },
      { nom: "Saint-Philippe", slug: "saint-philippe" },
      { nom: "Sainte-Rose", slug: "sainte-rose" },
    ],
    faq: [
      {
        question: "Vers quels établissements les taxis conventionnés de Saint-Joseph transportent-ils ?",
        answer:
          "Vers le site de Saint-Joseph du CHU de La Réunion, qui assure la médecine polyvalente et gériatrique ainsi qu'un centre périnatal de proximité, et vers l'hôpital de Saint-Pierre pour les prises en charge nécessitant un plateau technique plus lourd, les urgences vitales y étant orientées.",
      },
      {
        question: "Quel remboursement pour un taxi conventionné à Saint-Joseph ?",
        answer:
          "100 % du tarif conventionné en cas d'affection longue durée, d'accident du travail ou d'hospitalisation liée, et 65 % pour les autres motifs. Le tiers payant vous évite d'avancer la part remboursée, sur présentation de la prescription médicale de transport et de la carte Vitale.",
      },
    ],
  },

  "saint-paul/ambulance": {
    etablissements: [
      { nom: "Centre Hospitalier Ouest Réunion", slug: "centre-hospitalier-ouest-reunion-9d" },
    ],
    intro: [
      "L'hôpital opérationnel du secteur de Saint-Paul (974) est le Centre Hospitalier Ouest Réunion, le CHOR, anciennement Hôpital Gabriel Martin, installé impasse Plaine Chabrier, au Grand Pourpier Sud. Une précision utile s'impose : le siège administratif et juridique du CHU de La Réunion est lui aussi localisé à Saint-Paul, mais il ne s'agit pas de l'établissement de soins du territoire. Les entreprises d'ambulances agréées par l'ARS travaillent donc au quotidien avec le CHOR.",
      "Leurs missions relèvent du transport allongé ou surveillé : sorties de chirurgie, retours à domicile après hospitalisation, admissions programmées, transferts entre services ou vers un autre établissement lorsque la spécialité requise n'est pas disponible sur place. Le véhicule est agréé et armé d'un brancard, d'oxygène et du matériel de premiers secours, avec un équipage comprenant au moins un diplômé d'État ambulancier. Les sociétés saint-pauloises participent à la garde ambulancière du département, régulée sous l'égide du SAMU 974 (Centre 15).",
      "Le territoire desservi est vaste et contrasté, du Port et de Saint-Leu jusqu'aux Trois-Bassins et aux hauteurs de l'ouest, avec des itinéraires où la durée réelle du trajet dépend beaucoup de l'heure et du dénivelé : indiquer une adresse détaillée et une heure de convocation précise reste le meilleur moyen d'éviter un retard. Sur prescription médicale, le remboursement est de 100 % en affection longue durée, accident du travail ou hospitalisation liée, et de 55 % pour les autres motifs, le plus souvent en tiers payant. Comparez ci-dessous les ambulances de Saint-Paul référencées.",
    ],
    voisines: [
      { nom: "Le Port", slug: "le-port" },
      { nom: "Trois-Bassins", slug: "trois-bassins" },
      { nom: "Saint-Leu", slug: "saint-leu" },
    ],
    faq: [
      {
        question: "Quel est l'hôpital de référence à Saint-Paul ?",
        answer:
          "Le Centre Hospitalier Ouest Réunion (CHOR), ex Hôpital Gabriel Martin, impasse Plaine Chabrier au Grand Pourpier Sud. À noter : le siège administratif et juridique du CHU de La Réunion se trouve également à Saint-Paul, mais l'établissement de soins opérationnel du secteur est bien le CHOR.",
      },
      {
        question: "Quelle est la différence entre une ambulance et un taxi conventionné à Saint-Paul ?",
        answer:
          "L'ambulance est un véhicule agréé équipé d'un brancard et d'oxygène, avec un équipage comprenant un diplômé d'État ambulancier : elle permet le transport allongé et surveillé. Le taxi conventionné transporte un patient autonome en position assise, sans qualification sanitaire obligatoire du chauffeur. Le médecin prescripteur tranche selon votre état.",
      },
      {
        question: "Comment sont assurés les transports urgents la nuit à Saint-Paul ?",
        answer:
          "Par la garde ambulancière du département, régulée sous l'égide du SAMU 974 (Centre 15), qui engage les entreprises agréées la nuit, le week-end et les jours fériés. Pour une urgence vitale, composez le 15 ; pour un transport programmé, appelez directement une société de l'annuaire.",
      },
    ],
  },

  "saint-paul/taxi-conventionne": {
    etablissements: [
      { nom: "Centre Hospitalier Ouest Réunion", slug: "centre-hospitalier-ouest-reunion-9d" },
    ],
    intro: [
      "Dans l'ouest de La Réunion, les trajets assis remboursés convergent vers le Centre Hospitalier Ouest Réunion (CHOR), ex Hôpital Gabriel Martin, implanté à Saint-Paul (974) impasse Plaine Chabrier. Consultations de suivi, examens d'imagerie, séances itératives et bilans préopératoires justifient chaque semaine de nombreux déplacements que le taxi conventionné prend en charge pour les patients autonomes, sur simple prescription médicale de transport. À noter pour éviter toute confusion : le siège administratif du CHU de La Réunion est lui aussi domicilié à Saint-Paul, mais c'est bien le CHOR qui assure la prise en charge hospitalière du secteur.",
      "Ce qui rend le remboursement possible n'est pas le véhicule mais la convention signée avec la CPAM de La Réunion : elle encadre le tarif, remplace la facturation au compteur et permet le tiers payant. Le chauffeur n'est pas soumis à une qualification sanitaire, contrairement à l'auxiliaire ambulancier qui conduit un VSL ; le taxi conventionné et le VSL ouvrent en revanche des droits identiques pour un transport assis. L'ambulance, elle, reste réservée aux patients devant voyager allongés ou sous surveillance.",
      "Une remarque locale a son importance : le siège administratif du CHU de La Réunion étant lui aussi à Saint-Paul, mieux vaut confirmer au chauffeur le nom exact du site de rendez-vous pour éviter toute confusion de destination. Côté prise en charge, comptez 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs, sans avance de frais sur présentation de la carte Vitale. Retrouvez ci-dessous les taxis conventionnés de Saint-Paul référencés.",
    ],
    voisines: [
      { nom: "Le Port", slug: "le-port" },
      { nom: "Trois-Bassins", slug: "trois-bassins" },
      { nom: "Saint-Leu", slug: "saint-leu" },
    ],
    faq: [
      {
        question: "Vers quel hôpital réserver un taxi conventionné à Saint-Paul ?",
        answer:
          "Vers le Centre Hospitalier Ouest Réunion (CHOR), ex Hôpital Gabriel Martin, impasse Plaine Chabrier au Grand Pourpier Sud : c'est l'établissement de soins du secteur. Précisez bien ce nom au chauffeur, le siège administratif du CHU de La Réunion étant également situé sur la commune.",
      },
      {
        question: "Faut-il une prescription pour un taxi conventionné à Saint-Paul ?",
        answer:
          "Oui, une prescription médicale de transport est indispensable. Elle conditionne la prise en charge par l'Assurance maladie : 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs, avec tiers payant sur présentation de la carte Vitale.",
      },
    ],
  },

  "saint-andre/ambulance": {
    intro: [
      "À Saint-André (974), la lecture de l'offre hospitalière demande un peu de précision. Le site de Saint-André du GHER, Groupement Hospitalier Est Réunion, chemin Lagourgue, est orienté soins de suite et de réadaptation, unités de soins de longue durée et gériatrie. Le site principal de médecine, chirurgie et obstétrique du GHER se trouve à Saint-Benoît, route nationale 3. Les entreprises d'ambulances agréées par l'ARS travaillent donc entre ces deux pôles, à quelques kilomètres l'un de l'autre.",
      "Cette organisation génère un type de mission bien identifié : les transferts d'un patient stabilisé depuis le plateau aigu de Saint-Benoît vers la rééducation ou le long séjour à Saint-André, et les mouvements inverses lorsqu'un avis spécialisé s'impose. S'y ajoutent les sorties d'hospitalisation, les retours à domicile et les entrées programmées. Le véhicule agréé embarque brancard, oxygène et matériel de premiers secours, et l'équipage compte au moins un diplômé d'État ambulancier : c'est la condition d'un transport allongé ou surveillé.",
      "Né en 2010 de la fusion du centre hospitalier intercommunal Saint-André/Saint-Benoît et de la Clinique Saint-Benoît, le GHER est en direction commune avec le CHU de La Réunion depuis 2014, ce qui structure les orientations de patients dans l'est de l'île. Les transporteurs locaux participent à la garde ambulancière du département, régulée sous l'égide du SAMU 974 (Centre 15). Sur prescription, le remboursement est de 100 % en affection longue durée, accident du travail ou hospitalisation liée, et de 55 % sinon. Comparez ci-dessous les ambulances de Saint-André.",
    ],
    voisines: [
      { nom: "Bras-Panon", slug: "bras-panon" },
      { nom: "Saint-Benoît", slug: "saint-benoit" },
      { nom: "Sainte-Marie", slug: "sainte-marie" },
      { nom: "Salazie", slug: "salazie" },
    ],
    faq: [
      {
        question: "Quels sites du GHER les ambulances de Saint-André desservent-elles ?",
        answer:
          "Le site de Saint-André du GHER, chemin Lagourgue, dédié aux soins de suite et de réadaptation, aux unités de soins de longue durée et à la gériatrie, ainsi que le site principal de médecine, chirurgie et obstétrique du groupement, situé à Saint-Benoît, route nationale 3. Les transferts entre les deux sites sont fréquents.",
      },
      {
        question: "Le GHER est-il rattaché au CHU de La Réunion ?",
        answer:
          "Le Groupement Hospitalier Est Réunion est né en 2010 de la fusion du centre hospitalier intercommunal Saint-André/Saint-Benoît et de la Clinique Saint-Benoît, et il est en direction commune avec le CHU de La Réunion depuis 2014. Cette coopération structure les orientations de patients dans l'est de l'île.",
      },
      {
        question: "Comment est assurée la permanence des transports urgents à Saint-André ?",
        answer:
          "Par la garde ambulancière du département, régulée sous l'égide du SAMU 974 (Centre 15), qui organise les transports urgents la nuit, le week-end et les jours fériés. Pour une urgence vitale, composez le 15 ; pour un transport programmé, contactez directement une ambulance de l'annuaire.",
      },
    ],
  },

  "saint-andre/taxi-conventionne": {
    intro: [
      "Les patients de Saint-André (974) qui peuvent voyager assis relèvent du taxi conventionné pour leurs déplacements médicaux remboursés. Sur la commune, le site du GHER, chemin Lagourgue, est tourné vers les soins de suite et de réadaptation, les unités de soins de longue durée et la gériatrie ; le site principal de médecine, chirurgie et obstétrique du groupement est à Saint-Benoît. Beaucoup de trajets prescrits suivent donc cet axe est-réunionnais, entre visites de suivi, consultations et examens.",
      "Le conventionnement avec la CPAM de La Réunion est la clé du dispositif : il fixe un tarif encadré, distinct de la course au compteur, et autorise le tiers payant sur présentation du bon de transport et de la carte Vitale. Aucune qualification sanitaire n'est exigée du chauffeur, car ce transport concerne un patient autonome, capable de monter et descendre seul du véhicule. Toute situation nécessitant un brancard, de l'oxygène ou une surveillance appelle en revanche une ambulance et son équipage diplômé.",
      "Pour les prises en charge répétées en rééducation ou en gériatrie, la ponctualité conditionne l'organisation des séances : réserver à l'avance, et si possible auprès du même transporteur, évite les décalages successifs sur la journée. L'Assurance maladie rembourse 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs, la mutuelle complétant généralement la part restante. Consultez ci-dessous les taxis conventionnés de Saint-André référencés, avec téléphone direct.",
    ],
    voisines: [
      { nom: "Bras-Panon", slug: "bras-panon" },
      { nom: "Saint-Benoît", slug: "saint-benoit" },
      { nom: "Sainte-Marie", slug: "sainte-marie" },
      { nom: "Salazie", slug: "salazie" },
    ],
    faq: [
      {
        question: "Quels trajets un taxi conventionné assure-t-il depuis Saint-André ?",
        answer:
          "Les trajets vers le site de Saint-André du GHER, chemin Lagourgue, orienté soins de suite, longue durée et gériatrie, et vers le site principal de médecine, chirurgie et obstétrique du groupement, à Saint-Benoît. Consultations de suivi, examens et séances de rééducation constituent les motifs les plus fréquents.",
      },
      {
        question: "Le tiers payant s'applique-t-il aux taxis conventionnés de Saint-André ?",
        answer:
          "Oui. Sur présentation de la prescription médicale de transport et de la carte Vitale, vous n'avancez pas la part prise en charge : 100 % du tarif conventionné en affection longue durée, accident du travail ou hospitalisation liée, et 65 % pour les autres motifs, le complément relevant le plus souvent de la mutuelle.",
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
