"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Send,
  Trash2,
  Pencil,
  Menu,
  X,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Check,
  ArrowLeft,
  ArrowDown,
  Scale,
  Receipt,
  Briefcase,
  Users,
  Calculator,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type Agent = {
  slug: string;
  nom: string;
  description: string;
  icone: string;
  couleur: string;
  ordre: number;
  actif: boolean;
  questions_suggerees?: string[];
};

type Conversation = {
  id: string;
  titre: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  agent_slug: string | null;
};

type Message = {
  id?: string;
  role: "user" | "assistant";
  contenu: string;
  created_at?: string;
};

// Correspondance nom d'icône (stocké en base) → composant lucide-react.
const ICONES: Record<string, LucideIcon> = {
  Sparkles,
  Scale,
  Receipt,
  Briefcase,
  Users,
  Calculator,
  ShieldCheck,
};

function iconePour(nom: string | null | undefined): LucideIcon {
  return (nom && ICONES[nom]) || Sparkles;
}

const AGENT_DEFAUT: Agent = {
  slug: "general",
  nom: "Assistant général",
  description: "Votre copilote métier polyvalent du transport sanitaire.",
  icone: "Sparkles",
  couleur: "#0066CC",
  ordre: 1,
  actif: true,
  questions_suggerees: [],
};

// Fallback statique si l'agent n'a pas de questions suggérées en base.
const SUGGESTIONS = [
  "Comment gérer un rejet de facturation B2 (code erreur) ?",
  "Quelles sont les conditions du conventionnement CPAM pour un VSL ?",
  "Comment facturer une série de transports en ALD ?",
  "Quelles majorations s'appliquent le dimanche pour un taxi conventionné ?",
];

export default function AssistantChat({
  nomAffiche,
  configured,
}: {
  nomAffiche: string;
  configured: boolean;
}) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeAgentSlug, setActiveAgentSlug] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [quota, setQuota] = useState<{ utilise: number; limite: number } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [afficherBoutonBas, setAfficherBoutonBas] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Suivi auto du bas activé tant que l'utilisateur ne remonte pas manuellement.
  const suivreBasRef = useRef(true);

  const agentPour = useCallback(
    (slug: string | null | undefined): Agent =>
      agents.find((a) => a.slug === slug) ||
      (slug === "general" ? AGENT_DEFAUT : AGENT_DEFAUT),
    [agents]
  );

  const activeAgent = activeAgentSlug ? agentPour(activeAgentSlug) : null;

  // Questions suggérées de l'agent actif ; fallback statique si la base est vide.
  const suggestions =
    activeAgent?.questions_suggerees && activeAgent.questions_suggerees.length > 0
      ? activeAgent.questions_suggerees
      : SUGGESTIONS;

  const estProcheDuBas = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }, []);

  const scrollVersBas = useCallback((smooth: boolean) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  // Réactive le suivi et redescend en bas (bouton flottant ou nouvel envoi).
  const reprendreSuivi = useCallback(() => {
    suivreBasRef.current = true;
    setAfficherBoutonBas(false);
    scrollVersBas(true);
  }, [scrollVersBas]);

  // L'utilisateur remonte manuellement → on coupe le suivi auto.
  const onIntentionScroll = useCallback(() => {
    if (!estProcheDuBas()) {
      suivreBasRef.current = false;
      setAfficherBoutonBas(true);
    }
  }, [estProcheDuBas]);

  // Scroll du conteneur : recalcule la proximité du bas.
  const onScrollMessages = useCallback(() => {
    const proche = estProcheDuBas();
    suivreBasRef.current = proche;
    setAfficherBoutonBas(!proche);
  }, [estProcheDuBas]);

  const chargerAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/assistant/agents");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.agents) && data.agents.length > 0) {
        setAgents(data.agents);
      }
    } catch {
      // silencieux
    }
  }, []);

  const chargerConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/assistant/conversations");
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations || []);
      setQuota(data.quota || null);
    } catch {
      // silencieux
    }
  }, []);

  useEffect(() => {
    chargerAgents();
    chargerConversations();
  }, [chargerAgents, chargerConversations]);

  useEffect(() => {
    if (!suivreBasRef.current) return;
    const id = requestAnimationFrame(() => scrollVersBas(false));
    return () => cancelAnimationFrame(id);
  }, [messages, scrollVersBas]);

  const ouvrirConversation = useCallback(async (c: Conversation) => {
    setActiveId(c.id);
    setActiveAgentSlug(c.agent_slug || "general");
    setSidebarOpen(false);
    setErreur(null);
    suivreBasRef.current = true;
    setAfficherBoutonBas(false);
    try {
      const res = await fetch(`/api/assistant/conversations/${c.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.conversation?.agent_slug) {
        setActiveAgentSlug(data.conversation.agent_slug);
      }
      setMessages(
        (data.messages || []).map((m: Message) => ({
          id: m.id,
          role: m.role,
          contenu: m.contenu,
          created_at: m.created_at,
        }))
      );
    } catch {
      // silencieux
    }
  }, []);

  // Retour à l'écran « équipe » (choix d'un agent).
  const retourEquipe = useCallback(() => {
    setActiveId(null);
    setActiveAgentSlug(null);
    setMessages([]);
    setErreur(null);
    setSidebarOpen(false);
  }, []);

  // Sélection d'un agent → nouvelle conversation (créée à l'envoi du 1er message).
  const choisirAgent = useCallback((slug: string) => {
    setActiveId(null);
    setActiveAgentSlug(slug);
    setMessages([]);
    setErreur(null);
    setSidebarOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, []);

  const supprimerConversation = useCallback(
    async (id: string) => {
      if (!confirm("Supprimer cette conversation ?")) return;
      await fetch(`/api/assistant/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) retourEquipe();
    },
    [activeId, retourEquipe]
  );

  const validerRenommage = useCallback(
    async (id: string) => {
      const titre = renameValue.trim();
      setRenamingId(null);
      if (!titre) return;
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, titre } : c)));
      await fetch(`/api/assistant/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre }),
      });
    },
    [renameValue]
  );

  const envoyer = useCallback(
    async (texte: string) => {
      const contenu = texte.trim();
      if (!contenu || streaming) return;
      const slug = activeAgentSlug || "general";
      setErreur(null);
      setInput("");
      setStreaming(true);

      // À chaque envoi, on suit de nouveau la génération jusqu'en bas.
      suivreBasRef.current = true;
      setAfficherBoutonBas(false);

      const userMsg: Message = { role: "user", contenu };
      setMessages((prev) => [...prev, userMsg, { role: "assistant", contenu: "" }]);

      try {
        const res = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: activeId, message: contenu, agent_slug: slug }),
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Une erreur est survenue.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const blocs = buffer.split("\n\n");
          buffer = blocs.pop() || "";
          for (const bloc of blocs) {
            const lignes = bloc.split("\n");
            let event = "message";
            let dataStr = "";
            for (const l of lignes) {
              if (l.startsWith("event:")) event = l.slice(6).trim();
              else if (l.startsWith("data:")) dataStr += l.slice(5).trim();
            }
            if (!dataStr) continue;
            let json: Record<string, unknown> = {};
            try {
              json = JSON.parse(dataStr);
            } catch {
              continue;
            }
            if (event === "meta") {
              if (typeof json.conversationId === "string") setActiveId(json.conversationId);
              if (typeof json.agentSlug === "string") setActiveAgentSlug(json.agentSlug);
            } else if (event === "error") {
              throw new Error((json.error as string) || "Interruption du flux.");
            } else if (event === "message" && typeof json.delta === "string") {
              setMessages((prev) => {
                const copie = [...prev];
                const dernier = copie[copie.length - 1];
                if (dernier && dernier.role === "assistant") {
                  copie[copie.length - 1] = {
                    ...dernier,
                    contenu: dernier.contenu + json.delta,
                  };
                }
                return copie;
              });
            }
          }
        }

        // Rafraîchir la liste (titre auto + quota + badge agent) après l'échange
        await chargerConversations();
      } catch (e) {
        setErreur((e as Error).message || "Une erreur est survenue.");
        setMessages((prev) => {
          const copie = [...prev];
          const dernier = copie[copie.length - 1];
          if (dernier && dernier.role === "assistant" && dernier.contenu === "") {
            copie.pop();
          }
          return copie;
        });
      } finally {
        setStreaming(false);
      }
    },
    [activeId, activeAgentSlug, streaming, chargerConversations]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    envoyer(input);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      envoyer(input);
    }
  };

  const quotaAtteint = quota ? quota.utilise >= quota.limite : false;
  // Vue « équipe » tant qu'aucun agent n'est sélectionné.
  const vueEquipe = !activeAgentSlug;

  // Hauteur : plein écran moins le header global (4rem) et, sur mobile, la barre
  // d'onglets du dashboard (~4.5rem + zone sûre iOS).
  return (
    <div className="max-w-6xl mx-auto flex h-[calc(100vh-4rem-4.5rem-env(safe-area-inset-bottom))] min-h-[480px] lg:h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "fixed inset-0 z-40 flex" : "hidden"
        } lg:relative lg:flex lg:z-auto`}
      >
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="relative w-72 bg-white border-r border-gray-200 flex flex-col h-full">
          <div className="p-3 border-b border-gray-100">
            <button
              onClick={retourEquipe}
              className="w-full flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm"
            >
              <Plus className="w-4 h-4" /> Nouvelle conversation
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6 px-2">
                Aucune conversation pour le moment.
              </p>
            ) : (
              conversations.map((c) => {
                const ag = agentPour(c.agent_slug);
                const Icone = iconePour(ag.icone);
                return (
                  <div
                    key={c.id}
                    className={`group flex items-center gap-1 rounded-lg px-2 py-2 cursor-pointer transition ${
                      activeId === c.id ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    {renamingId === c.id ? (
                      <form
                        className="flex-1 flex items-center gap-1"
                        onSubmit={(e) => {
                          e.preventDefault();
                          validerRenommage(c.id);
                        }}
                      >
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => validerRenommage(c.id)}
                          className="flex-1 min-w-0 text-sm border border-blue-300 rounded px-1.5 py-1 outline-none"
                        />
                        <button type="submit" className="text-emerald-600 p-1">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <button
                          onClick={() => ouvrirConversation(c)}
                          className="flex-1 min-w-0 text-left flex items-center gap-2"
                        >
                          <span
                            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${ag.couleur}1a`, color: ag.couleur }}
                            title={ag.nom}
                          >
                            <Icone className="w-3.5 h-3.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm text-gray-700 truncate">{c.titre}</span>
                            <span
                              className="block text-[11px] truncate"
                              style={{ color: ag.couleur }}
                            >
                              {ag.nom}
                            </span>
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            setRenamingId(c.id);
                            setRenameValue(c.titre);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 p-1 transition"
                          title="Renommer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => supprimerConversation(c.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1 transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
          {quota && (
            <div className="p-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Messages ce mois</span>
                <span className="font-medium text-gray-700">
                  {quota.utilise} / {quota.limite}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    quotaAtteint ? "bg-red-500" : "bg-[#0066CC]"
                  }`}
                  style={{
                    width: `${Math.min(100, (quota.utilise / quota.limite) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Zone principale */}
      <section className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {/* En-tête */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
            aria-label="Ouvrir les conversations"
          >
            <Menu className="w-5 h-5" />
          </button>
          {vueEquipe ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#0066CC] text-white flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-gray-900 truncate">Votre équipe d&apos;experts</h1>
                <p className="text-xs text-gray-400 truncate">{nomAffiche}</p>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={retourEquipe}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#0066CC] transition flex-shrink-0"
                title="Changer d'expert"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Équipe</span>
              </button>
              <div className="flex items-center gap-2 min-w-0">
                {(() => {
                  const Icone = iconePour(activeAgent?.icone);
                  const couleur = activeAgent?.couleur || "#0066CC";
                  return (
                    <div
                      className="w-8 h-8 rounded-lg text-white flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: couleur }}
                    >
                      <Icone className="w-4 h-4" />
                    </div>
                  );
                })()}
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-gray-900 truncate">
                    {activeAgent?.nom || "Assistant IA métier"}
                  </h1>
                  <p className="text-xs text-gray-400 truncate">{nomAffiche}</p>
                </div>
              </div>
            </>
          )}
        </header>

        {/* Corps */}
        {vueEquipe ? (
          <EquipeEcran
            agents={agents.length > 0 ? agents : [AGENT_DEFAUT]}
            configured={configured}
            onChoisir={choisirAgent}
          />
        ) : (
          <>
            {/* Messages */}
            <div className="relative flex-1 min-h-0">
              <div
                ref={scrollRef}
                onScroll={onScrollMessages}
                onWheel={onIntentionScroll}
                onTouchMove={onIntentionScroll}
                className="h-full overflow-y-auto px-4 py-6"
              >
              <div className="max-w-3xl mx-auto space-y-5">
                {!configured && (
                  <Banner
                    tone="amber"
                    icon={<AlertTriangle className="w-4 h-4" />}
                    text="L'assistant IA n'est pas encore configuré côté serveur (clé Mistral manquante). Réessayez plus tard ou contactez le support."
                  />
                )}

                {messages.length === 0 && activeAgent && (
                  <div className="text-center py-8">
                    {(() => {
                      const Icone = iconePour(activeAgent.icone);
                      return (
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                          style={{
                            backgroundColor: `${activeAgent.couleur}1a`,
                            color: activeAgent.couleur,
                          }}
                        >
                          <Icone className="w-7 h-7" />
                        </div>
                      );
                    })()}
                    <h2 className="text-lg font-bold text-gray-900 mb-1">{activeAgent.nom}</h2>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                      {activeAgent.description}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => envoyer(s)}
                          disabled={!configured}
                          className="text-left text-sm text-gray-700 bg-white border border-gray-200 hover:border-[#0066CC] hover:bg-blue-50 rounded-xl px-4 py-3 transition disabled:opacity-50"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <MessageBubble
                    key={m.id || i}
                    message={m}
                    streaming={streaming && i === messages.length - 1}
                  />
                ))}

                {erreur && (
                  <Banner tone="red" icon={<AlertTriangle className="w-4 h-4" />} text={erreur} />
                )}
              </div>
              </div>

              {afficherBoutonBas && (
                <button
                  onClick={reprendreSuivi}
                  aria-label="Revenir en bas"
                  className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center text-gray-600 hover:text-[#0066CC] hover:border-[#0066CC] transition"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Saisie */}
            <div className="bg-white border-t border-gray-200 px-4 py-3">
              <div className="max-w-3xl mx-auto">
                {quotaAtteint ? (
                  <div className="text-center text-sm text-gray-600 py-3">
                    Quota mensuel atteint ({quota?.limite} messages). Il se réinitialise le 1er du mois
                    prochain.{" "}
                    <Link href="/transport-medical/tarifs" className="text-[#0066CC] underline">
                      Voir les offres
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder={
                        activeAgent
                          ? `Écrivez à ${activeAgent.nom}…`
                          : "Écrivez votre question…"
                      }
                      rows={1}
                      disabled={streaming || !configured}
                      className="flex-1 resize-none max-h-40 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] disabled:bg-gray-50"
                    />
                    <button
                      type="submit"
                      disabled={streaming || !input.trim() || !configured}
                      className="bg-[#0066CC] hover:bg-[#0052a3] text-white rounded-xl p-3 transition disabled:opacity-40 flex-shrink-0"
                    >
                      {streaming ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                )}
                <p className="text-[11px] text-gray-400 text-center mt-2">
                  L&apos;assistant peut se tromper — vérifiez les points réglementaires auprès des
                  sources officielles (ameli.fr, legifrance.gouv.fr).
                </p>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

// Écran d'accueil « Votre équipe d'experts » : grille de cartes d'agents.
function EquipeEcran({
  agents,
  configured,
  onChoisir,
}: {
  agents: Agent[];
  configured: boolean;
  onChoisir: (slug: string) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Votre équipe d&apos;experts</h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Choisissez l&apos;expert le mieux placé pour votre question. Chaque agent s&apos;appuie sur
            une base documentaire sourcée et cite ses références.
          </p>
        </div>

        {!configured && (
          <div className="mb-4">
            <Banner
              tone="amber"
              icon={<AlertTriangle className="w-4 h-4" />}
              text="L'assistant IA n'est pas encore configuré côté serveur (clé Mistral manquante). Vous pouvez explorer l'équipe, mais l'envoi de messages est momentanément indisponible."
            />
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          {agents.map((a) => {
            const Icone = iconePour(a.icone);
            return (
              <button
                key={a.slug}
                onClick={() => onChoisir(a.slug)}
                className="group text-left bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition flex gap-3"
                style={{ borderTopColor: a.couleur, borderTopWidth: 3 }}
              >
                <span
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${a.couleur}1a`, color: a.couleur }}
                >
                  <Icone className="w-5 h-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-gray-900">{a.nom}</span>
                  <span className="block text-xs text-gray-500 mt-0.5 leading-snug">
                    {a.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Banner({
  tone,
  icon,
  text,
}: {
  tone: "amber" | "red";
  icon: React.ReactNode;
  text: string;
}) {
  const cls =
    tone === "amber"
      ? "bg-amber-50 border-amber-200 text-amber-800"
      : "bg-red-50 border-red-200 text-red-800";
  return (
    <div className={`flex items-start gap-2 border rounded-xl px-4 py-3 text-sm ${cls}`}>
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function MessageBubble({ message, streaming }: { message: Message; streaming: boolean }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? "bg-[#0066CC] text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.contenu}</p>
        ) : message.contenu ? (
          <SimpleMarkdown texte={message.contenu} />
        ) : (
          <span className="inline-flex items-center gap-1.5 text-gray-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Réflexion…
          </span>
        )}
        {!isUser && streaming && message.contenu && (
          <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}

// Rendu markdown léger : titres, listes, gras, code inline, liens, paragraphes.
function SimpleMarkdown({ texte }: { texte: string }) {
  const lignes = texte.split("\n");
  const blocs: React.ReactNode[] = [];
  let liste: { ordered: boolean; items: string[] } | null = null;

  const flushListe = (key: number) => {
    if (!liste) return;
    const Tag = liste.ordered ? "ol" : "ul";
    blocs.push(
      <Tag
        key={`l-${key}`}
        className={`my-1.5 ml-4 space-y-0.5 ${liste.ordered ? "list-decimal" : "list-disc"}`}
      >
        {liste.items.map((it, i) => (
          <li key={i}>{renderInline(it)}</li>
        ))}
      </Tag>
    );
    liste = null;
  };

  lignes.forEach((ligne, idx) => {
    const t = ligne.trimEnd();
    const bullet = t.match(/^\s*[-*]\s+(.*)$/);
    const ordered = t.match(/^\s*\d+\.\s+(.*)$/);
    const heading = t.match(/^(#{1,3})\s+(.*)$/);

    if (heading) {
      flushListe(idx);
      const niveau = heading[1].length;
      const cls =
        niveau === 1
          ? "text-base font-bold mt-2 mb-1"
          : niveau === 2
          ? "text-sm font-bold mt-2 mb-1"
          : "text-sm font-semibold mt-1.5 mb-0.5";
      blocs.push(
        <p key={`h-${idx}`} className={cls}>
          {renderInline(heading[2])}
        </p>
      );
    } else if (bullet) {
      if (!liste || liste.ordered) {
        flushListe(idx);
        liste = { ordered: false, items: [] };
      }
      liste.items.push(bullet[1]);
    } else if (ordered) {
      if (!liste || !liste.ordered) {
        flushListe(idx);
        liste = { ordered: true, items: [] };
      }
      liste.items.push(ordered[1]);
    } else if (t.trim() === "") {
      flushListe(idx);
    } else {
      flushListe(idx);
      blocs.push(
        <p key={`p-${idx}`} className="my-1 leading-relaxed">
          {renderInline(t)}
        </p>
      );
    }
  });
  flushListe(lignes.length);

  return <div className="space-y-0.5">{blocs}</div>;
}

// Gras (**texte**), code inline (`code`) et liens markdown [texte](url).
function renderInline(texte: string): React.ReactNode {
  const parts = texte
    .split(/(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean);
  return parts.map((p, i) => {
    const lien = p.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (lien) {
      const href = lien[2];
      const externe = /^https?:\/\//i.test(href);
      return (
        <a
          key={i}
          href={href}
          target={externe ? "_blank" : undefined}
          rel={externe ? "noopener noreferrer" : undefined}
          className="text-[#0066CC] underline underline-offset-2 hover:text-[#0052a3] break-words"
        >
          {lien[1]}
        </a>
      );
    }
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith("`") && p.endsWith("`")) {
      return (
        <code key={i} className="bg-gray-100 text-gray-800 rounded px-1 py-0.5 text-[0.85em]">
          {p.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{p}</span>;
  });
}
