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
export function buildProJsonLd(pro: ProSanitaire, ville: string, categorie: string, slug: string) {
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
