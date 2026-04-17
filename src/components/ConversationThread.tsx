'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, X, User, Store, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  content: string;
  sender_name: string;
  sender_email: string;
  is_seller_reply: boolean;
  created_at: string;
  annonce_id: string;
}

interface ConversationThreadProps {
  threadId: string;
  /** Nom affiché dans le header (interlocuteur) */
  buyerName: string;
  /** Email affiché dans le header (interlocuteur) */
  buyerEmail: string;
  annonceTitle: string;
  annonceId: string;
  /** ID de l'utilisateur connecté (pour orienter les bulles) */
  currentUserId?: string;
  /**
   * true  → mode acheteur : ses propres messages (is_seller_reply=false) à droite,
   *          réponses vendeur (is_seller_reply=true) à gauche
   * false → mode vendeur  : messages acheteur à gauche, ses propres réponses à droite
   */
  isBuyerView?: boolean;
  onClose: () => void;
  onReplySent?: () => void;
}

export default function ConversationThread({
  threadId,
  buyerName,
  buyerEmail,
  annonceTitle,
  annonceId,
  isBuyerView = false,
  onClose,
  onReplySent,
}: ConversationThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadThread = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/messages/thread?thread_id=${threadId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    setMessages([]);
    setReplyText('');
    setError(null);
    loadThread();
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/messages/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: threadId, content: replyText.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setReplyText('');
        await loadThread();
        onReplySent?.();
      } else {
        setError(data.error || "Erreur lors de l'envoi");
      }
    } catch {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (d: string) =>
    new Date(d).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  /**
   * Détermine si un message doit être aligné à droite (= "moi").
   * - Mode vendeur  : is_seller_reply=true → droite (c'est le vendeur qui parle)
   * - Mode acheteur : is_seller_reply=false → droite (c'est l'acheteur qui parle)
   */
  const isMyMessage = (msg: Message) =>
    isBuyerView ? !msg.is_seller_reply : msg.is_seller_reply;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              {isBuyerView
                ? <Store size={14} className="text-blue-600" />
                : <User size={14} className="text-blue-600" />
              }
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{buyerName}</p>
              {buyerEmail && (
                <a href={`mailto:${buyerEmail}`} className="text-xs text-blue-600 hover:underline truncate block">
                  {buyerEmail}
                </a>
              )}
            </div>
          </div>
          <Link
            href={`/annonces/${annonceId}`}
            className="text-xs text-gray-400 mt-1 hover:text-blue-600 transition block truncate ml-10"
            target="_blank"
          >
            {annonceTitle}
          </Link>
        </div>
        <button
          onClick={onClose}
          className="ml-3 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" style={{ maxHeight: '420px' }}>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">Aucun message</p>
        ) : (
          messages.map((msg) => {
            const mine = isMyMessage(msg);
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] flex flex-col gap-1 ${mine ? 'items-end' : 'items-start'}`}>
                  {/* Bulle */}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      mine
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {/* Méta */}
                  <div className={`flex items-center gap-1.5 px-1 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      mine ? 'bg-blue-100' : 'bg-gray-200'
                    }`}>
                      {mine
                        ? (isBuyerView ? <User size={10} className="text-blue-600" /> : <Store size={10} className="text-blue-600" />)
                        : (isBuyerView ? <Store size={10} className="text-gray-500" /> : <User size={10} className="text-gray-500" />)
                      }
                    </span>
                    <span className="text-[11px] text-gray-400">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Zone de réponse */}
      <div className="border-t p-4 bg-gray-50">
        {error && (
          <p className="text-xs text-red-600 mb-2 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
        <form onSubmit={handleSend} className="flex gap-2 items-end">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as any);
              }
            }}
            placeholder="Votre réponse… (Entrée pour envoyer, Maj+Entrée pour sauter une ligne)"
            rows={3}
            disabled={sending}
            className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 bg-white"
          />
          <button
            type="submit"
            disabled={!replyText.trim() || sending}
            className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition self-end"
          >
            {sending
              ? <Loader2 size={16} className="animate-spin" />
              : <Send size={16} />
            }
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-1.5">
          {isBuyerView
            ? 'Le vendeur sera notifié par email de votre message.'
            : "L'acheteur sera notifié par email de votre réponse."
          }
        </p>
      </div>
    </div>
  );
}
