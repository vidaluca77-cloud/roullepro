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
} from "lucide-react";

type Conversation = {
  id: string;
  titre: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
};

type Message = {
  id?: string;
  role: "user" | "assistant";
  contenu: string;
  created_at?: string;
};

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [quota, setQuota] = useState<{ utilise: number; limite: number } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
    chargerConversations();
  }, [chargerConversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const ouvrirConversation = useCallback(async (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
    setErreur(null);
    try {
      const res = await fetch(`/api/assistant/conversations/${id}`);
      if (!res.ok) return;
      const data = await res.json();
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

  const nouvelleConversation = useCallback(() => {
    setActiveId(null);
    setMessages([]);
    setErreur(null);
    setSidebarOpen(false);
    textareaRef.current?.focus();
  }, []);

  const supprimerConversation = useCallback(
    async (id: string) => {
      if (!confirm("Supprimer cette conversation ?")) return;
      await fetch(`/api/assistant/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) nouvelleConversation();
    },
    [activeId, nouvelleConversation]
  );

  const validerRenommage = useCallback(async (id: string) => {
    const titre = renameValue.trim();
    setRenamingId(null);
    if (!titre) return;
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, titre } : c)));
    await fetch(`/api/assistant/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titre }),
    });
  }, [renameValue]);

  const envoyer = useCallback(
    async (texte: string) => {
      const contenu = texte.trim();
      if (!contenu || streaming) return;
      setErreur(null);
      setInput("");
      setStreaming(true);

      const userMsg: Message = { role: "user", contenu };
      setMessages((prev) => [...prev, userMsg, { role: "assistant", contenu: "" }]);

      try {
        const res = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: activeId, message: contenu }),
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Une erreur est survenue.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let convId = activeId;

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
            if (event === "meta" && typeof json.conversationId === "string") {
              convId = json.conversationId;
              setActiveId(convId);
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

        // Rafraîchir la liste (titre auto + quota) après l'échange
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
    [activeId, streaming, chargerConversations]
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

  return (
    <div className="max-w-6xl mx-auto flex h-[calc(100vh-4rem)] min-h-[520px]">
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
              onClick={nouvelleConversation}
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
              conversations.map((c) => (
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
                        onClick={() => ouvrirConversation(c.id)}
                        className="flex-1 min-w-0 text-left flex items-center gap-2"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{c.titre}</span>
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
              ))
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

      {/* Zone de conversation */}
      <section className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {/* En-tête */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0066CC] text-white flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 truncate">Assistant IA métier</h1>
              <p className="text-xs text-gray-400 truncate">{nomAffiche}</p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-5">
            {!configured && (
              <Banner
                tone="amber"
                icon={<AlertTriangle className="w-4 h-4" />}
                text="L'assistant IA n'est pas encore configuré côté serveur (clé Mistral manquante). Réessayez plus tard ou contactez le support."
              />
            )}

            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-[#0066CC]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Comment puis-je vous aider ?
                </h2>
                <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                  Posez une question sur le transport sanitaire : CPAM, facturation, tarifs,
                  réglementation…
                </p>
                <div className="grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  {SUGGESTIONS.map((s) => (
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
              <MessageBubble key={m.id || i} message={m} streaming={streaming && i === messages.length - 1} />
            ))}

            {erreur && (
              <Banner
                tone="red"
                icon={<AlertTriangle className="w-4 h-4" />}
                text={erreur}
              />
            )}

            <div ref={bottomRef} />
          </div>
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
                  placeholder="Écrivez votre question…"
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
      </section>
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

// Rendu markdown léger : titres, listes, gras, code inline, paragraphes.
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

// Gras (**texte**) et code inline (`code`).
function renderInline(texte: string): React.ReactNode {
  const parts = texte.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((p, i) => {
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
