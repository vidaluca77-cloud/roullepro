/**
 * Studio réseaux sociaux IA — cœur métier (Lot 1).
 *
 * Génération de posts localisés pour la présence Facebook / Instagram / Google
 * Business Profile des pros sanitaire payants. Réutilise le client LLM des experts
 * IA (Mistral, cf. src/lib/ia-assistant.ts) et le gating plan (sanitaire-plans.ts).
 *
 * Ce module ne contient QUE de la logique pure + l'appel de génération : quotas,
 * validation de la sortie IA, construction du prompt. Les accès DB et l'auth
 * vivent dans les routes API.
 */
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  MISTRAL_API_URL,
  MISTRAL_MODEL,
  mistralConfigured,
} from "@/lib/ia-assistant";
import { peutUtiliserStudioSocial } from "@/lib/sanitaire-plans";

// ── Providers & statuts ──────────────────────────────────────
export const PROVIDERS = ["facebook", "instagram", "google_business"] as const;
export type SocialProvider = (typeof PROVIDERS)[number];

export const PROVIDER_LABEL: Record<SocialProvider, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  google_business: "Google Business Profile",
};

export const POST_STATUTS = [
  "brouillon",
  "planifie",
  "publie",
  "echec",
  "annule",
] as const;
export type SocialPostStatut = (typeof POST_STATUTS)[number];

export function estProviderValide(v: string): v is SocialProvider {
  return (PROVIDERS as readonly string[]).includes(v);
}

// ── Quotas mensuels (mois calendaire Europe/Paris) ───────────
export const QUOTA_POSTS_MOIS = 8;
export const QUOTA_PUBLICATIONS_MOIS = 8;

/**
 * Renvoie le mois calendaire Europe/Paris au format 'YYYY-MM' pour l'instant
 * donné. Sert de clé de comptage des quotas (indépendant du fuseau serveur).
 */
export function moisParis(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(d);
  const an = parts.find((p) => p.type === "year")?.value ?? "1970";
  const mois = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${an}-${mois}`;
}

/**
 * Bornes ISO (UTC) du mois calendaire Europe/Paris contenant `d`. Utilisé pour
 * filtrer social_posts.created_at (posts générés) ou published_at (publications)
 * sur le mois courant.
 */
export function bornesMoisParis(d: Date = new Date()): { debut: string; fin: string } {
  const mois = moisParis(d); // 'YYYY-MM'
  const [an, m] = mois.split("-").map(Number);
  // Décalage Paris : +1h (hiver) ou +2h (été). On calcule l'offset réel du 1er du mois.
  const offsetMinutes = offsetParisMinutes(new Date(Date.UTC(an, m - 1, 1, 12)));
  const debut = new Date(Date.UTC(an, m - 1, 1, 0, -offsetMinutes));
  const finOffset = offsetParisMinutes(new Date(Date.UTC(an, m, 1, 12)));
  const fin = new Date(Date.UTC(an, m, 1, 0, -finOffset));
  return { debut: debut.toISOString(), fin: fin.toISOString() };
}

/** Offset (minutes) d'Europe/Paris par rapport à UTC pour l'instant donné. */
function offsetParisMinutes(d: Date): number {
  const s = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    timeZoneName: "shortOffset",
  })
    .formatToParts(d)
    .find((p) => p.type === "timeZoneName")?.value;
  const m = s?.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
  if (!m) return 60;
  return Number(m[1]) * 60 + (m[1].startsWith("-") ? -1 : 1) * Number(m[2] || 0);
}

export type QuotaEtat = {
  postsGeneres: number;
  postsRestants: number;
  publicationsUtilisees: number;
  publicationsRestantes: number;
};

export function construireQuotaEtat(
  postsGeneresCeMois: number,
  publicationsCeMois: number
): QuotaEtat {
  return {
    postsGeneres: postsGeneresCeMois,
    postsRestants: Math.max(0, QUOTA_POSTS_MOIS - postsGeneresCeMois),
    publicationsUtilisees: publicationsCeMois,
    publicationsRestantes: Math.max(0, QUOTA_PUBLICATIONS_MOIS - publicationsCeMois),
  };
}

/**
 * Nombre de posts qu'on peut effectivement générer maintenant, borné par le quota
 * mensuel restant et par la demande. Renvoie 0 si le quota est épuisé.
 */
export function nombrePostsGenerables(
  demande: number,
  postsGeneresCeMois: number
): number {
  const restant = Math.max(0, QUOTA_POSTS_MOIS - postsGeneresCeMois);
  return Math.max(0, Math.min(demande, restant));
}

/**
 * Quotas basés sur des compteurs monotones (table studio_social_usage) : on réserve
 * d'abord `reserve` unités par un incrément atomique, puis on interprète le total
 * renvoyé. Cela supprime la course lecture-puis-écriture entre deux requêtes
 * concurrentes, au prix d'un remboursement de la part non consommée.
 *
 * `autorise` = ce qu'on peut réellement faire, `rembourser` = le delta négatif à
 * repasser au compteur.
 */
export function ajustementReservation(
  totalApresReservation: number,
  reserve: number,
  quota: number
): { autorise: number; rembourser: number } {
  const totalAvant = Math.max(0, totalApresReservation - reserve);
  const autorise = Math.max(0, Math.min(reserve, quota - totalAvant));
  return { autorise, rembourser: reserve - autorise };
}

export type UsageMois = { posts_generes: number; publications: number };

/** Lit les compteurs de quota du mois (0 si aucune ligne). Backend uniquement. */
export async function lireUsageMois(
  admin: SupabaseClient,
  proId: string,
  mois: string = moisParis()
): Promise<UsageMois> {
  const { data } = await admin
    .from("studio_social_usage")
    .select("posts_generes, publications")
    .eq("pro_id", proId)
    .eq("mois", mois)
    .maybeSingle();
  return {
    posts_generes: (data?.posts_generes as number | undefined) ?? 0,
    publications: (data?.publications as number | undefined) ?? 0,
  };
}

/**
 * Incrémente atomiquement les compteurs du mois et renvoie les nouveaux totaux.
 * Les deltas peuvent être négatifs pour rembourser une réservation non consommée.
 */
export async function incrementerUsageMois(
  admin: SupabaseClient,
  proId: string,
  deltas: { generes?: number; publications?: number },
  mois: string = moisParis()
): Promise<UsageMois | null> {
  const { data, error } = await admin.rpc("studio_social_incrementer", {
    p_pro_id: proId,
    p_mois: mois,
    p_generes: deltas.generes ?? 0,
    p_publications: deltas.publications ?? 0,
  });
  if (error) return null;
  const ligne = Array.isArray(data) ? data[0] : data;
  if (!ligne) return null;
  return {
    posts_generes: Number(ligne.posts_generes ?? 0),
    publications: Number(ligne.publications ?? 0),
  };
}

// ── Piliers éditoriaux ───────────────────────────────────────
export const PILIERS = [
  "conseils_patients",
  "zone_dispo",
  "coulisses",
  "reassurance",
  "actualite_locale",
] as const;
export type Pilier = (typeof PILIERS)[number];

export const PILIER_LABEL: Record<Pilier, string> = {
  conseils_patients: "Conseils patients / bons de transport CPAM",
  zone_dispo: "Zone desservie & disponibilité",
  coulisses: "Coulisses du métier",
  reassurance: "Avis & réassurance",
  actualite_locale: "Actualité locale santé",
};

// ── Fiche pro (personnalisation) ─────────────────────────────
export type ProStudioContexte = {
  id: string;
  raison_sociale: string | null;
  nom_commercial: string | null;
  ville: string | null;
  departement: string | null;
  categorie: string | null;
  description: string | null;
};

const CATEGORIE_LABEL: Record<string, string> = {
  ambulance: "ambulance (transport sanitaire agréé)",
  vsl: "VSL (véhicule sanitaire léger)",
  taxi_conventionne: "taxi conventionné CPAM",
  taxi: "taxi conventionné CPAM",
};

export function nomAffichePro(pro: ProStudioContexte): string {
  return (pro.nom_commercial?.trim() || pro.raison_sociale?.trim() || "votre entreprise").slice(0, 120);
}

/**
 * Renvoie la fiche pro de l'utilisateur éligible au Studio (plan payant actif,
 * essai inclus), ou null. Utilise un client admin (service_role). Réservé au
 * backend : ne jamais exposer les tokens ni le plan au client.
 */
export async function getProStudioActif(
  admin: SupabaseClient,
  userId: string
): Promise<ProStudioContexte | null> {
  const { data } = await admin
    .from("pros_sanitaire")
    .select(
      "id, raison_sociale, nom_commercial, ville, departement, categorie, description, plan, plan_expires_at, stripe_subscription_id"
    )
    .eq("claimed_by", userId);

  const fiches = (data || []) as Array<
    ProStudioContexte & {
      plan: string | null;
      plan_expires_at: string | null;
      stripe_subscription_id: string | null;
    }
  >;
  const active = fiches.find((f) => peutUtiliserStudioSocial(f));
  if (!active) return null;
  return {
    id: active.id,
    raison_sociale: active.raison_sociale,
    nom_commercial: active.nom_commercial,
    ville: active.ville,
    departement: active.departement,
    categorie: active.categorie,
    description: active.description,
  };
}

// ── Validation de la sortie IA (zod) ─────────────────────────
export const postGenereSchema = z.object({
  sujet: z.string().trim().min(2).max(140),
  pilier: z.string().trim().max(40).optional(),
  contenu: z.string().trim().min(20).max(2200),
  hashtags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
});
export type PostGenere = z.infer<typeof postGenereSchema>;

const reponseSchema = z.object({
  posts: z.array(postGenereSchema).min(1),
});

/** Normalise un hashtag : préfixe #, retire espaces et caractères indésirables. */
export function normaliserHashtag(raw: string): string {
  // Conserve lettres (y compris accentuées latines), chiffres et underscore.
  const nettoye = raw.replace(/[^0-9A-Za-zÀ-ÖØ-öø-ÿ_]/g, "");
  if (!nettoye) return "";
  return `#${nettoye}`;
}

export function normaliserHashtags(tags: string[]): string[] {
  const vus = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    const h = normaliserHashtag(t);
    const clef = h.toLowerCase();
    if (h && !vus.has(clef)) {
      vus.add(clef);
      out.push(h);
    }
  }
  return out.slice(0, 12);
}

/**
 * Parse et valide la réponse brute du modèle. Tolère un objet {posts:[...]}, un
 * tableau nu, ou du JSON entouré de balises markdown ```json. Renvoie [] si rien
 * d'exploitable. Ne lève jamais.
 */
export function parserPostsGeneres(raw: string | null | undefined): PostGenere[] {
  if (!raw) return [];
  let texte = raw.trim();
  const fence = texte.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) texte = fence[1].trim();

  let data: unknown;
  try {
    data = JSON.parse(texte);
  } catch {
    return [];
  }

  const objet = Array.isArray(data) ? { posts: data } : data;
  const parsed = reponseSchema.safeParse(objet);
  if (!parsed.success) {
    // Tentative de sauvetage : filtrer les entrées individuellement valides.
    const brut = (objet as { posts?: unknown })?.posts;
    if (!Array.isArray(brut)) return [];
    const posts = brut
      .map((p) => postGenereSchema.safeParse(p))
      .filter((r): r is { success: true; data: PostGenere } => r.success)
      .map((r) => r.data);
    return posts.map((p) => ({ ...p, hashtags: normaliserHashtags(p.hashtags) }));
  }
  return parsed.data.posts.map((p) => ({
    ...p,
    hashtags: normaliserHashtags(p.hashtags),
  }));
}

// ── Prompt de génération ─────────────────────────────────────
export const SYSTEM_PROMPT_STUDIO = `Tu es le rédacteur réseaux sociaux d'une entreprise française de transport sanitaire (ambulance, VSL, taxi conventionné CPAM). Tu écris des posts prêts à publier sur Facebook, Instagram et Google Business Profile.

RÈGLES :
- Français uniquement. Ton professionnel, chaleureux, humain, rassurant. Jamais racoleur, jamais de fausses promesses médicales.
- Personnalise avec le nom de l'entreprise, la ville et le département fournis. Ne mentionne aucune donnée patient.
- Chaque post doit être auto-suffisant, concret et engageant, adapté à une lecture mobile.
- Termine les posts orientés prise de contact par un appel à l'action clair (appeler, prendre rendez-vous, demander un transport).
- N'invente jamais de chiffres, d'agréments, de tarifs ni d'avis. Reste factuel.
- Varie les angles (piliers éditoriaux imposés) pour un calendrier équilibré.

SORTIE : réponds UNIQUEMENT par un objet JSON valide, sans texte autour, de la forme :
{"posts":[{"sujet":"...","pilier":"...","contenu":"...","hashtags":["#..."]}]}
- "contenu" : le texte du post (jusqu'à ~600 caractères), adapté aux réseaux, avec 1 à 3 emojis maximum si pertinent.
- "hashtags" : 3 à 6 hashtags pertinents et localisés (ville, département, métier), sans espaces.`;

export function construirePromptGeneration(
  pro: ProStudioContexte,
  nombre: number
): { system: string; user: string } {
  const nom = nomAffichePro(pro);
  const cat = pro.categorie
    ? CATEGORIE_LABEL[pro.categorie] || pro.categorie
    : "transport sanitaire";
  const ville = pro.ville?.trim() || "sa ville";
  const dep = pro.departement?.trim() || "son département";
  const desc = pro.description?.trim()
    ? `\nDescription de l'entreprise : ${pro.description.trim().slice(0, 500)}`
    : "";

  const piliers = PILIERS.map((p) => `- ${PILIER_LABEL[p]}`).join("\n");

  const user = `Génère ${nombre} posts variés et prêts à publier pour cette entreprise :
- Nom : ${nom}
- Activité : ${cat}
- Ville : ${ville}
- Département : ${dep}${desc}

Répartis les posts sur ces piliers éditoriaux (au moins un par pilier tant que le nombre le permet) :
${piliers}

Adapte le style aux réseaux sociaux (Facebook engageant, Instagram court avec hashtags, Google Business Profile factuel avec appel à contacter). Renvoie exactement ${nombre} posts dans le JSON.`;

  return { system: SYSTEM_PROMPT_STUDIO, user };
}

/**
 * Appelle Mistral en mode JSON pour générer `nombre` posts. Renvoie les posts
 * validés (peut être vide en cas d'échec ou de clé manquante). Ne lève jamais.
 */
export async function genererPosts(
  pro: ProStudioContexte,
  nombre: number
): Promise<PostGenere[]> {
  if (!mistralConfigured()) return [];
  const { system, user } = construirePromptGeneration(pro, nombre);
  const apiKey = process.env.MISTRAL_API_KEY;
  try {
    const res = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: 3000,
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const contenu: string | null = data?.choices?.[0]?.message?.content ?? null;
    return parserPostsGeneres(contenu).slice(0, nombre);
  } catch {
    return [];
  }
}

// ── Adaptation par plateforme (utilisée à la publication, Lot 3) ─────────────
/**
 * Construit le texte final adapté à un provider à partir du contenu édité et des
 * hashtags. GBP : factuel, pas de hashtags. Instagram : contenu + hashtags.
 * Facebook : contenu + hashtags éventuels.
 */
export function textePourProvider(
  provider: SocialProvider,
  contenu: string,
  hashtags: string[]
): string {
  const base = (contenu || "").trim();
  const tags = normaliserHashtags(hashtags || []);
  if (provider === "google_business") return base;
  if (tags.length === 0) return base;
  return `${base}\n\n${tags.join(" ")}`;
}
