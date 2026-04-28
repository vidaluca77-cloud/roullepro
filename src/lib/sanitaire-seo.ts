/**
 * Helpers SEO pour les pages sanitaire.
 * Genere des JSON-LD enrichis : LocalBusiness, FAQPage, BreadcrumbList.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProSanitaire } from "./sanitaire-data";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

type CategorieKey = "ambulance" | "vsl" | "taxi_conventionne";

const CATEGORIE_TO_TYPE: Record<CategorieKey, string> = {
  ambulance: "EmergencyService",
  vsl: "LocalBusiness",
  taxi_conventionne: "TaxiService",
};

const CATEGORIE_LABEL: Record<CategorieKey, string> = {
  ambulance: "Ambulance",
  vsl: "VSL",
  taxi_conventionne: "Taxi conventionné",
};

/**
 * Genere le JSON-LD principal pour une fiche pro.
 * Inclut LocalBusiness enrichi avec openingHours, areaServed, priceRange, image.
 */
export function buildProJsonLd(
  pro: ProSanitaire,
  ville: string,
  categorie: string,
  slug: string,
  seoDescription?: string
) {
  const categorieKey = pro.categorie as CategorieKey;
  const url = `${BASE_URL}/transport-medical/${ville}/${categorie}/${slug}`;
  const nom = pro.nom_commercial || pro.raison_sociale;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": CATEGORIE_TO_TYPE[categorieKey] || "LocalBusiness",
    "@id": url,
    name: nom,
    legalName: pro.raison_sociale,
    url,
    telephone: pro.telephone_public || undefined,
    email: pro.email_public || undefined,
    description:
      seoDescription ||
      pro.description ||
      `${CATEGORIE_LABEL[categorieKey] || "Transport sanitaire"} à ${pro.ville} (${pro.code_postal}). Professionnel agréé par l'ARS, remboursé par la Sécurité sociale.`,
    address: {
      "@type": "PostalAddress",
      streetAddress: pro.adresse && !pro.adresse.includes("[ND]") && !pro.adresse.includes("NON-DIFFUSIBLE") ? pro.adresse : undefined,
      postalCode: pro.code_postal,
      addressLocality: pro.ville,
      addressRegion: pro.region || undefined,
      addressCountry: "FR",
    },
    geo: pro.latitude && pro.longitude
      ? { "@type": "GeoCoordinates", latitude: pro.latitude, longitude: pro.longitude }
      : undefined,
    areaServed: {
      "@type": "City",
      name: pro.ville,
    },
    priceRange: "€€",
    paymentAccepted: "Cash, Credit Card, Tiers payant Sécurité sociale",
    hasMap: pro.latitude && pro.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${pro.latitude},${pro.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pro.raison_sociale} ${pro.ville}`)}`,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59",
      },
    ],
  };

  // Supprime les undefined pour JSON propre
  return cleanUndefined(jsonLd);
}

/**
 * Genere un FAQ schema pour une fiche ou une page categorie.
 * Boost les rich snippets dans Google et favorise la citation par les LLM.
 */
export function buildFaqJsonLd(questions: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

/**
 * Genere un BreadcrumbList pour le fil d'Ariane enrichi Google.
 */
export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

/**
 * Detecte l'arrondissement parisien, lyonnais ou marseillais a partir du code postal.
 * Retourne un libelle utilisable dans les phrases SEO ("18e arrondissement").
 */
function getArrondissement(codePostal: string | null | undefined, ville: string | null | undefined): string | null {
  if (!codePostal || !ville) return null;
  const cp = codePostal.replace(/\s/g, "");
  const v = ville.toUpperCase();
  if (v === "PARIS" && cp.startsWith("75") && cp.length === 5) {
    const arr = parseInt(cp.slice(3), 10);
    if (arr >= 1 && arr <= 20) return arr === 1 ? "1er arrondissement" : `${arr}e arrondissement`;
  }
  if (v === "LYON" && cp.startsWith("6900") && cp.length === 5) {
    const arr = parseInt(cp.slice(4), 10);
    if (arr >= 1 && arr <= 9) return arr === 1 ? "1er arrondissement" : `${arr}e arrondissement`;
  }
  if (v === "MARSEILLE" && cp.startsWith("130") && cp.length === 5) {
    const arr = parseInt(cp.slice(3), 10);
    if (arr >= 1 && arr <= 16) return arr === 1 ? "1er arrondissement" : `${arr}e arrondissement`;
  }
  return null;
}

/**
 * Hash deterministe stable pour selectionner une variante de phrase a partir d'un identifiant.
 * Permet de varier le contenu entre fiches sans LLM.
 */
function stableIndex(seed: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % modulo;
}

/**
 * Nettoie l'adresse SIRENE pour retirer le code postal et la ville (souvent dupliques).
 */
function cleanAdresseRue(adresse: string | null | undefined, codePostal: string, ville: string): string {
  if (!adresse) return "";
  if (adresse.includes("[ND]") || adresse.toUpperCase().includes("NON-DIFFUSIBLE")) return "";
  let s = adresse;
  // retire CP + ville en fin de chaine
  if (codePostal) s = s.replace(new RegExp(`\\s*${codePostal}\\b.*$`, "i"), "");
  if (ville) s = s.replace(new RegExp(`\\s*${ville}\\s*$`, "i"), "");
  return s.trim();
}

function titleCaseVille(ville: string): string {
  if (!ville) return "";
  return ville
    .toLowerCase()
    .split(/(\s|-|')/)
    .map((part) => (part.length > 0 && /[a-z]/.test(part[0]) ? part[0].toUpperCase() + part.slice(1) : part))
    .join("");
}

function titleCaseRaison(raison: string): string {
  if (!raison) return "";
  return raison
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/**
 * Genere un texte SEO unique de 250-400 mots pour une fiche pro.
 * Utilise un template variable selon le SIRET pour eviter le contenu dupplique
 * tout en restant 100 % factuel (pas de LLM, pas d'hallucination).
 *
 * Sortie : tableau de paragraphes pour rendu HTML semantique.
 */
export function buildFicheSeoText(
  pro: ProSanitaire,
  villesVoisines: { ville: string; nb: number }[] = []
): { titre: string; paragraphes: string[] } {
  const cat = pro.categorie as CategorieKey;
  const nom = titleCaseRaison(pro.nom_commercial || pro.raison_sociale);
  const villePretty = titleCaseVille(pro.ville);
  const dep = pro.departement || "";
  const region = pro.region || "";
  const cp = pro.code_postal || "";
  const arr = getArrondissement(cp, pro.ville);
  const adresseRue = cleanAdresseRue(pro.adresse, cp, pro.ville);
  const localisation = arr ? `${villePretty} (${arr})` : `${villePretty}${cp ? " (" + cp + ")" : ""}`;
  const seed = pro.id || pro.raison_sociale;

  // ---- 1. Phrase d'ouverture (4 variantes) ----
  const opensA: Record<CategorieKey, string[]> = {
    ambulance: [
      `${nom} est une societe d'ambulances agreee, etablie a ${localisation}.`,
      `Implantee a ${localisation}, ${nom} est une entreprise specialisee dans le transport sanitaire en ambulance.`,
      `${nom} exerce comme societe d'ambulance a ${localisation}, en region ${region}.`,
      `Basee a ${localisation}${dep ? " dans le departement " + dep : ""}, ${nom} assure des transports sanitaires en ambulance.`,
    ],
    vsl: [
      `${nom} est une societe de transport sanitaire en VSL (Vehicule Sanitaire Leger), etablie a ${localisation}.`,
      `Implantee a ${localisation}, ${nom} exploite des Vehicules Sanitaires Legers (VSL) pour les transports medicaux assis.`,
      `${nom} assure le transport en VSL a ${localisation}, sur prescription medicale.`,
      `Basee a ${localisation}${dep ? " (" + dep + ")" : ""}, ${nom} est specialisee dans le transport sanitaire en Vehicule Sanitaire Leger.`,
    ],
    taxi_conventionne: [
      `${nom} est un taxi conventionne CPAM, etabli a ${localisation}.`,
      `Implante a ${localisation}, ${nom} est un taxi agree par la Caisse Primaire d'Assurance Maladie pour le transport de patients sur prescription.`,
      `${nom} exerce comme taxi conventionne a ${localisation}, en region ${region}.`,
      `Base a ${localisation}${dep ? " (" + dep + ")" : ""}, ${nom} assure le transport medical assis en taxi conventionne.`,
    ],
  };

  // ---- 2. Coordonnees ----
  const coordParts: string[] = [];
  if (adresseRue) coordParts.push(`L'adresse exacte est ${adresseRue}, ${cp || ""} ${villePretty}`.trim().replace(/\s+/g, " "));
  if (pro.telephone_public) coordParts.push(`Telephone : ${pro.telephone_public}`);
  if (pro.email_public) coordParts.push(`Email : ${pro.email_public}`);
  if (pro.site_web) coordParts.push(`Site web : ${pro.site_web}`);
  if (pro.siret) coordParts.push(`SIRET : ${pro.siret}`);

  // ---- 3. Description du service (specifique categorie) ----
  const services: Record<CategorieKey, string> = {
    ambulance: `Une ambulance est un transport sanitaire medicalise pour les patients allonges ou dont l'etat necessite une surveillance pendant le trajet. Le vehicule est equipe d'oxygene, d'un brancard, d'un matelas a depression, d'un defibrillateur et de materiel de premiers secours. L'equipage comprend au minimum un Diplome d'Etat d'Ambulancier (DEA) accompagne d'un auxiliaire ambulancier. Les motifs de transport sont varies : entree ou sortie d'hospitalisation, consultation specialisee, examen complementaire (IRM, scanner, dialyse, radiotherapie, chimiotherapie), retour a domicile, transfert inter-hospitalier ou prise en charge a la suite d'un appel du SAMU lorsque la situation ne necessite pas de SMUR.`,
    vsl: `Le VSL (Vehicule Sanitaire Leger) est un vehicule banalise de type berline ou monospace destine au transport assis de patients en etat stable. Il transporte jusqu'a trois patients simultanement, sur prescription medicale. Les motifs courants sont les seances de dialyse, de chimiotherapie, de radiotherapie, les consultations de specialistes, les examens d'imagerie ou les sorties d'hospitalisation. Le chauffeur detient le diplome d'auxiliaire ambulancier ou un titre equivalent et a suivi une formation aux gestes de premiers secours. Le VSL ne transporte pas de patients allonges et n'intervient pas en urgence.`,
    taxi_conventionne: `Le taxi conventionne est un taxi titulaire d'une convention signee avec la Caisse Primaire d'Assurance Maladie (CPAM). Il transporte les patients autonomes en position assise dans le cadre de soins programmes : consultations, dialyses, kinesitherapie, examens, suivis post-hospitalisation. Le conventionnement permet la dispense d'avance de frais grace au tiers payant, sur presentation d'une prescription medicale de transport et de la carte Vitale du patient. Le chauffeur n'a pas de formation medicale specifique, ce qui le distingue du VSL ou de l'ambulance.`,
  };

  // ---- 4. Cadre legal et remboursement ----
  const remboursement: Record<CategorieKey, string> = {
    ambulance: `Le transport en ambulance prescrit par un medecin est pris en charge par la Securite sociale a hauteur de 65 % du tarif conventionne, et a 100 % en cas d'Affection Longue Duree (ALD), de maternite, d'accident du travail ou de soins lies a une hospitalisation. Le tiers payant est generalement applique : le patient n'avance pas les frais. La franchise medicale de 4 euros par trajet (plafonnee a 8 euros par jour et 50 euros par an) s'applique. Les ambulances doivent obtenir un agrement de l'Agence Regionale de Sante (ARS) pour exercer.`,
    vsl: `Le transport en VSL prescrit par un medecin est rembourse par la Securite sociale dans les memes conditions que l'ambulance : 65 % du tarif conventionne en regime general, 100 % en ALD, maternite, accident du travail ou hospitalisation. Le tiers payant est applique. La franchise de 4 euros par trajet s'applique. Les VSL sont, comme les ambulances, soumis a l'agrement de l'Agence Regionale de Sante (ARS).`,
    taxi_conventionne: `Le transport en taxi conventionne est rembourse par la Securite sociale a 65 % du tarif conventionne, et a 100 % en cas d'ALD, maternite, accident du travail ou hospitalisation, sur presentation d'une prescription medicale de transport. Le tiers payant permet de ne pas avancer les frais. La franchise medicale de 4 euros par trajet (plafonnee a 8 euros par jour et 50 euros par an) reste a la charge du patient. Le conventionnement est delivre par la CPAM departementale.`,
  };

  // ---- 5. Zone d'intervention ----
  let zone = `${nom} intervient principalement a ${villePretty}${dep ? " et dans le departement " + dep : ""}${region ? " en region " + region : ""}.`;
  if (villesVoisines && villesVoisines.length > 0) {
    const noms = villesVoisines.slice(0, 6).map((v) => titleCaseVille(v.ville)).join(", ");
    zone += ` Les communes proches couvertes par les professionnels du secteur incluent ${noms}.`;
  }

  // ---- 6. CTA / pratique ----
  const ctaVariants = [
    `Pour reserver un transport ou obtenir un devis, contactez ${nom} directement par telephone. Pour les transports programmes (dialyse, consultation, examen), il est recommande de prendre rendez-vous au moins 24 heures a l'avance.`,
    `${nom} traite les demandes de transport sur rendez-vous. Munissez-vous de votre prescription medicale de transport et de votre carte Vitale lors de la prise en charge.`,
    `Pour organiser un transport, prevoyez votre prescription medicale de transport (cerfa 11574*04) et appelez ${nom}. Le tiers payant evite l'avance de frais.`,
  ];

  // ---- Assemblage avec selection deterministe par hash SIRET/id ----
  const idxOpen = stableIndex(seed + "o", opensA[cat]?.length || 1);
  const idxCta = stableIndex(seed + "c", ctaVariants.length);

  const titre = `A propos de ${nom}`;
  const paragraphes: string[] = [];

  paragraphes.push(opensA[cat]?.[idxOpen] || `${nom} est une entreprise de transport sanitaire a ${localisation}.`);

  if (coordParts.length > 0) paragraphes.push(coordParts.join(". ") + ".");

  if (services[cat]) paragraphes.push(services[cat]);

  if (remboursement[cat]) paragraphes.push(remboursement[cat]);

  paragraphes.push(zone);

  paragraphes.push(ctaVariants[idxCta]);

  return { titre, paragraphes };
}

/**
 * FAQ generique pour une fiche selon sa categorie.
 */
export function getFicheFaq(pro: ProSanitaire): { question: string; answer: string }[] {
  const nom = pro.nom_commercial || pro.raison_sociale;
  const cat = pro.categorie;

  const common = [
    {
      question: `Comment contacter ${nom} ?`,
      answer: pro.telephone_public
        ? `${nom} est joignable au ${pro.telephone_public}. L'entreprise est située ${pro.adresse && !pro.adresse.includes("[ND]") ? pro.adresse + " à " : "à "}${pro.ville} (${pro.code_postal}).`
        : `${nom} est située à ${pro.ville} (${pro.code_postal}). Consultez sa fiche pour obtenir ses coordonnées.`,
    },
    {
      question: `Le transport est-il remboursé par la Sécurité sociale ?`,
      answer: cat === "ambulance"
        ? "Oui, le transport en ambulance est pris en charge par la Sécurité sociale sur prescription médicale. Le tiers payant est généralement appliqué : vous n'avancez pas les frais."
        : cat === "vsl"
        ? "Oui, le transport en VSL est pris en charge par la Sécurité sociale à 100% sur prescription médicale. Le tiers payant est appliqué."
        : "Oui, le transport en taxi conventionné est pris en charge par la Sécurité sociale sur prescription médicale. Le conventionnement permet le tiers payant.",
    },
    {
      question: `Quelle est la différence entre ambulance, VSL et taxi conventionné ?`,
      answer: "L'ambulance est un transport médicalisé avec équipage diplômé (DEA) et matériel médical, pour urgences ou patients allongés. Le VSL transporte les patients assis en situation stable sur prescription. Le taxi conventionné est un taxi agréé par la CPAM pour les patients autonomes sur prescription.",
    },
  ];

  return common;
}

/**
 * FAQ generique pour une page ville.
 */
export function getVilleFaq(ville: string, nbPros: number): { question: string; answer: string }[] {
  return [
    {
      question: `Combien y a-t-il d'ambulances et VSL à ${ville} ?`,
      answer: `L'annuaire RoullePro recense ${nbPros} professionnels du transport sanitaire à ${ville} : ambulances, VSL et taxis conventionnés. Tous les établissements sont identifiés par leur numéro SIRET officiel.`,
    },
    {
      question: `Comment réserver un transport sanitaire à ${ville} ?`,
      answer: `Vous pouvez contacter directement les professionnels référencés à ${ville} via les numéros de téléphone affichés sur leurs fiches. Pour un transport remboursé, une prescription médicale est requise.`,
    },
    {
      question: `Le transport sanitaire à ${ville} est-il disponible 24h/24 ?`,
      answer: `Oui, plusieurs ambulances à ${ville} assurent des permanences de garde 24h/24 pour les transports urgents. Pour les transports programmés (VSL, taxi conventionné), il est recommandé de réserver à l'avance.`,
    },
    {
      question: `Qu'est-ce qu'un transport agréé par l'ARS ?`,
      answer: `Les ambulances et VSL doivent obtenir un agrément de l'Agence Régionale de Santé (ARS) pour exercer. Cet agrément garantit le respect des normes de sécurité, la qualification des équipages et la conformité du matériel médical. Les taxis conventionnés sont eux agréés par la CPAM.`,
    },
  ];
}

/**
 * Recupere les villes voisines avec au moins 1 pro actif, ordonnees par distance.
 * Filtre prealable par bounding box geographique (~25 km) pour eviter de charger
 * 5000 fiches a chaque hit, et borne le perimetre au departement courant pour
 * eviter les voisinages absurdes (ex: Paris -> Gisors).
 */
export async function getVillesVoisines(
  supabase: SupabaseClient,
  lat: number | null,
  lng: number | null,
  villeActuelleSlug: string,
  limit = 6,
  departement?: string | null
): Promise<{ ville: string; ville_slug: string; nb: number }[]> {
  if (!lat || !lng) return [];

  // Bounding box ~25 km autour de la ville (1 deg lat ~= 111 km, 1 deg lng ~= 73 km a 45 deg N)
  const RAYON_KM = 25;
  const dLat = RAYON_KM / 111;
  const dLng = RAYON_KM / 73;

  let query = supabase
    .from("pros_sanitaire")
    .select("ville, ville_slug, latitude, longitude")
    .eq("actif", true)
    .not("latitude", "is", null)
    .gte("latitude", lat - dLat)
    .lte("latitude", lat + dLat)
    .gte("longitude", lng - dLng)
    .lte("longitude", lng + dLng)
    .limit(2000);

  // Restreint au meme departement si dispo (evite les debordements regionaux pour les villes frontieres)
  if (departement) {
    query = query.eq("departement", departement);
  }

  const { data } = await query;
  const rows = (data || []) as { ville: string; ville_slug: string; latitude: number; longitude: number }[];
  const byVille = new Map<string, { ville: string; ville_slug: string; lat: number; lng: number; nb: number }>();
  for (const r of rows) {
    if (!r.ville_slug || r.ville_slug === villeActuelleSlug) continue;
    const existing = byVille.get(r.ville_slug);
    if (existing) {
      existing.nb += 1;
    } else {
      byVille.set(r.ville_slug, { ville: r.ville, ville_slug: r.ville_slug, lat: r.latitude, lng: r.longitude, nb: 1 });
    }
  }
  const withDist = Array.from(byVille.values())
    .map((v) => ({ ...v, distance: haversineKm(lat, lng, v.lat, v.lng) }))
    .filter((v) => v.distance > 0 && v.distance <= RAYON_KM)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
  return withDist.map((v) => ({ ville: v.ville, ville_slug: v.ville_slug, nb: v.nb }));
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function cleanUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      cleaned[key] = cleanUndefined(value as Record<string, unknown>);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Recupere d'autres pros de la meme categorie + meme ville (concurrents directs).
 * Sert a creer du maillage interne fort et permettre a Google de decouvrir les fiches voisines.
 */
export async function getAutresProsMemeVille(
  supabase: SupabaseClient,
  villeSlug: string,
  categorie: string,
  excludeProId: string,
  limit = 8
): Promise<{ id: string; nom: string; slug: string; categorie: string; claimed: boolean }[]> {
  if (!villeSlug) return [];
  const { data } = await supabase
    .from("pros_sanitaire")
    .select("id, raison_sociale, nom_commercial, slug, categorie, claimed")
    .eq("actif", true)
    .eq("ville_slug", villeSlug)
    .eq("categorie", categorie)
    .neq("id", excludeProId)
    .order("claimed", { ascending: false })
    .limit(limit);
  return ((data ?? []) as Array<{
    id: string;
    raison_sociale: string;
    nom_commercial: string | null;
    slug: string;
    categorie: string;
    claimed: boolean;
  }>).map((p) => ({
    id: p.id,
    nom: p.nom_commercial || p.raison_sociale,
    slug: p.slug,
    categorie: p.categorie,
    claimed: p.claimed === true,
  }));
}

/**
 * Compte le nombre de pros par categorie pour une ville. Sert a alimenter
 * un bloc "toutes les categories a [Ville]" dans la fiche pro.
 */
export async function getCategoriesByVille(
  supabase: SupabaseClient,
  villeSlug: string
): Promise<{ categorie: string; nb: number }[]> {
  if (!villeSlug) return [];
  const { data } = await supabase
    .from("pros_sanitaire")
    .select("categorie")
    .eq("actif", true)
    .eq("ville_slug", villeSlug);
  if (!data) return [];
  const counts: Record<string, number> = {};
  for (const row of data as Array<{ categorie: string }>) {
    counts[row.categorie] = (counts[row.categorie] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([categorie, nb]) => ({ categorie, nb }))
    .sort((a, b) => b.nb - a.nb);
}
