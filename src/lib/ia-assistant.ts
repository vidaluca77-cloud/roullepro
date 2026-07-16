/**
 * Assistant IA métier RoullePro (propulsé par Mistral).
 *
 * Réservé aux pros du transport sanitaire abonnés payants. La détermination du
 * plan réutilise EXACTEMENT la logique existante : une fiche pros_sanitaire
 * revendiquée (claimed_by = user.id) dont le plan est payant (isPaidPlan).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isPaidPlan } from "@/lib/sanitaire-plans";

// ── Configuration ────────────────────────────────────────────
export const QUOTA_MENSUEL = Number(process.env.ASSISTANT_QUOTA_MENSUEL) || 400;
export const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
export const MISTRAL_MODEL = process.env.MISTRAL_MODEL || "mistral-large-latest";
export const MISTRAL_MODEL_MEMOIRE = "mistral-small-latest";
// Fréquence de rafraîchissement de la fiche mémoire (tous les N échanges user).
export const MEMOIRE_TOUS_LES_N = 3;
// Nombre de messages d'historique injectés dans le prompt (paires user/assistant).
export const HISTORIQUE_MAX = 20;

// ── Client service_role (backend uniquement) ─────────────────
export function getAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export function mistralConfigured(): boolean {
  return !!process.env.MISTRAL_API_KEY;
}

// ── Contexte pro (fiche payante) ─────────────────────────────
export type ProContexte = {
  id: string;
  raison_sociale: string | null;
  nom_commercial: string | null;
  ville: string | null;
  code_postal: string | null;
  departement: string | null;
  categorie: string | null;
  plan: string | null;
};

const CATEGORIE_LABEL: Record<string, string> = {
  ambulance: "ambulance (transport sanitaire agréé)",
  vsl: "VSL (véhicule sanitaire léger)",
  taxi_conventionne: "taxi conventionné CPAM",
  taxi: "taxi conventionné CPAM",
};

/**
 * Renvoie la fiche pro payante de l'utilisateur, ou null s'il n'a pas de fiche
 * revendiquée sur un plan payant. Utilise un client admin (service_role).
 */
export async function getProPayant(
  admin: SupabaseClient,
  userId: string
): Promise<ProContexte | null> {
  const { data } = await admin
    .from("pros_sanitaire")
    .select(
      "id, raison_sociale, nom_commercial, ville, code_postal, departement, categorie, plan"
    )
    .eq("claimed_by", userId);

  const fiches = (data || []) as ProContexte[];
  const fichePayante = fiches.find((f) => isPaidPlan(f.plan));
  return fichePayante || fiches[0] || null;
}

export function estPayant(pro: ProContexte | null): boolean {
  return !!pro && isPaidPlan(pro.plan);
}

// ── Prompts ──────────────────────────────────────────────────
export const SYSTEM_PROMPT_BASE = `Tu es l'assistant métier de RoullePro, expert du transport sanitaire français. Tu accompagnes des professionnels (ambulanciers, taxis conventionnés CPAM, sociétés de VSL) dans la gestion quotidienne et réglementaire de leur activité.

DOMAINES D'EXPERTISE :
- Conventionnement CPAM et relations avec l'Assurance Maladie (conventions type, avenants, agréments préfectoraux, quotas de véhicules).
- Facturation SEFi / Scor, télétransmission B2/DRE, gestion des rejets et des retours NOEMIE, factures subrogatoires, tiers payant.
- Prescriptions médicales de transport (PMT), séries de transports, ALD, transports assis professionnalisés, urgences pré-hospitalières.
- Tarification : tarifs préfectoraux taxi, forfaits et suppléments ambulance/VSL, majorations (nuit, dimanche, jours fériés), abattement conventionnel, indemnité kilométrique.
- Réglementation : Code de la santé publique, Code des transports, agrément ARS, cartes professionnelles (DEA, CCA, auxiliaire ambulancier), équipement des véhicules, ADS (autorisation de stationnement) pour les taxis.
- Marchés publics de transport sanitaire (hôpitaux, EHPAD), appels d'offres, garde ambulancière départementale (ATSU).
- RH ambulancier : convention collective, temps de travail, amplitude, repos, rémunération.

TON ET STYLE :
- Professionnel, direct et concret. Réponses structurées, orientées action, en français.
- Donne des étapes précises, des ordres de grandeur chiffrés quand c'est utile, et cite les textes ou organismes de référence (CPAM, ARS, préfecture, URSSAF...).
- Sois honnête sur tes limites : tu n'as pas accès aux données individuelles du pro ni aux tarifs préfectoraux exacts de son département.

AVERTISSEMENT OBLIGATOIRE :
- Pour tout point réglementaire, tarifaire ou juridique sensible, rappelle systématiquement de vérifier auprès des sources officielles (ameli.fr, legifrance.gouv.fr, la CPAM ou la préfecture du département concerné), car la réglementation évolue et varie localement.
- N'invente jamais un montant, un article de loi ou une référence. En cas de doute, dis-le et oriente vers la source officielle.`;

// ── Agents spécialisés ───────────────────────────────────────
export const DEFAULT_AGENT_SLUG = "general";

export type Agent = {
  slug: string;
  nom: string;
  description: string;
  icone: string;
  couleur: string;
  ordre: number;
  actif: boolean;
};

export type AgentAvecPrompt = Agent & { system_prompt: string };

/**
 * Liste des agents actifs, triés par `ordre`. Utilise le client fourni
 * (lecture publique authentifiée via RLS). Renvoie [] en cas d'échec.
 */
export async function listerAgents(client: SupabaseClient): Promise<Agent[]> {
  const { data } = await client
    .from("ia_agents")
    .select("slug, nom, description, icone, couleur, ordre, actif")
    .eq("actif", true)
    .order("ordre", { ascending: true });
  return (data || []) as Agent[];
}

/**
 * Charge un agent (avec son system_prompt) par slug. Renvoie null si introuvable
 * ou inactif. Utilise le client admin (service_role) pour lire le prompt.
 */
export async function getAgent(
  admin: SupabaseClient,
  slug: string
): Promise<AgentAvecPrompt | null> {
  const { data } = await admin
    .from("ia_agents")
    .select("slug, nom, description, icone, couleur, ordre, actif, system_prompt")
    .eq("slug", slug)
    .eq("actif", true)
    .maybeSingle();
  return (data as AgentAvecPrompt | null) || null;
}

// ── Recherche documentaire (base sourcée) ────────────────────
export type DocumentExtrait = {
  titre: string | null;
  contenu: string | null;
  source_nom: string | null;
  source_url: string | null;
};

export const DOC_RECHERCHE_LIMIT = 5;

/**
 * Full-text search classée (ts_rank) dans ia_documents pour l'agent donné (ou
 * tous les agents si agentSlug vaut 'general'). S'appuie sur la fonction SQL
 * ia_rechercher_documents (websearch_to_tsquery + fallback plainto_tsquery),
 * appelée en service_role : aucune lecture RLS. Renvoie [] en cas d'échec.
 */
export async function rechercheDocuments(
  admin: SupabaseClient,
  agentSlug: string,
  requete: string
): Promise<DocumentExtrait[]> {
  const q = (requete || "").trim().slice(0, 500);
  if (q.length < 2) return [];

  try {
    const { data, error } = await admin.rpc("ia_rechercher_documents", {
      p_agent_slug: agentSlug || DEFAULT_AGENT_SLUG,
      p_query: q,
      p_limite: DOC_RECHERCHE_LIMIT,
    });
    if (error) return [];
    return (data || []) as DocumentExtrait[];
  } catch {
    return [];
  }
}

/**
 * Formate les extraits documentaires en bloc système, avec consigne de citation.
 * Renvoie "" s'il n'y a aucun extrait (l'agent répond alors avec sa prudence).
 */
export function construireBlocDocuments(docs: DocumentExtrait[]): string {
  if (!docs || docs.length === 0) return "";
  const extraits = docs
    .map((d, i) => {
      const source = d.source_nom
        ? `${d.source_nom}${d.source_url ? ` (${d.source_url})` : ""}`
        : "Source non précisée";
      return `[Extrait ${i + 1}] ${d.titre || "Sans titre"}\n${(d.contenu || "").trim()}\nSource : ${source}`;
    })
    .join("\n\n");
  return `\nEXTRAITS DOCUMENTAIRES DE RÉFÉRENCE (base documentaire RoullePro, à privilégier) :\n${extraits}\n\nCONSIGNE : appuie-toi en priorité sur ces extraits pour répondre et CITE la source concernée au format markdown [Nom de la source](url). Si la réponse n'est pas couverte par ces extraits, ne l'invente pas : indique-le et renvoie vers la source officielle.`;
}

export function construireSystemPrompt(
  pro: ProContexte | null,
  memoire: string | null,
  promptAgent?: string | null,
  docs?: DocumentExtrait[]
): string {
  const parts = [promptAgent?.trim() || SYSTEM_PROMPT_BASE];

  const blocDocs = construireBlocDocuments(docs || []);
  if (blocDocs) parts.push(blocDocs);

  if (pro) {
    const nom = pro.nom_commercial || pro.raison_sociale || "Non précisé";
    const cat = pro.categorie
      ? CATEGORIE_LABEL[pro.categorie] || pro.categorie
      : "Non précisé";
    const lieu = [pro.code_postal, pro.ville].filter(Boolean).join(" ") || "Non précisé";
    parts.push(
      `\nCONTEXTE DE L'ENTREPRISE (à utiliser pour personnaliser tes réponses) :\n- Raison sociale : ${nom}\n- Activité : ${cat}\n- Ville : ${lieu}\n- Département : ${pro.departement || "Non précisé"}`
    );
  }

  if (memoire && memoire.trim().length > 0) {
    parts.push(
      `\nFICHE MÉMOIRE (informations durables déjà connues sur ce professionnel, issues des échanges précédents) :\n${memoire.trim()}`
    );
  }

  return parts.join("\n");
}

export const PROMPT_MEMOIRE = `Tu es un module de mémoire pour un assistant métier du transport sanitaire. À partir de la fiche mémoire existante et du dernier échange, produis une fiche mémoire factuelle et concise (moins de 1500 caractères) sur ce professionnel.

Ne conserve QUE des informations durables et utiles pour personnaliser les futures réponses : type et nombre de véhicules, secteur géographique, CPAM/ARS de rattachement, problématiques récurrentes, logiciel de facturation utilisé, statut juridique, effectif, spécificités d'activité.

N'invente rien. N'inclus pas d'informations ponctuelles ou datées. Réponds UNIQUEMENT par le texte de la fiche mémoire mise à jour, sans commentaire ni préambule.`;

// ── Types Mistral ────────────────────────────────────────────
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export function estimerTokens(texte: string): number {
  return Math.ceil((texte || "").length / 4);
}

/**
 * Appel Mistral non-streamé (utilisé pour la mise à jour mémoire).
 * Renvoie le contenu texte, ou null en cas d'échec.
 */
export async function appelMistral(
  messages: ChatMessage[],
  model: string,
  maxTokens = 800
): Promise<string | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.3 }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

/**
 * Met à jour la fiche mémoire du pro via un appel Mistral léger.
 * Best-effort : silencieux en cas d'échec.
 */
export async function majMemoire(
  admin: SupabaseClient,
  userId: string,
  memoireActuelle: string,
  dernierEchange: { user: string; assistant: string }
): Promise<void> {
  const contenu = await appelMistral(
    [
      { role: "system", content: PROMPT_MEMOIRE },
      {
        role: "user",
        content: `FICHE MÉMOIRE ACTUELLE :\n${memoireActuelle || "(vide)"}\n\nDERNIER ÉCHANGE :\nProfessionnel : ${dernierEchange.user}\n\nAssistant : ${dernierEchange.assistant}`,
      },
    ],
    MISTRAL_MODEL_MEMOIRE,
    600
  );

  if (!contenu) return;
  const propre = contenu.trim().slice(0, 1500);
  await admin
    .from("ia_memoire")
    .upsert(
      { user_id: userId, contenu: propre, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
}
