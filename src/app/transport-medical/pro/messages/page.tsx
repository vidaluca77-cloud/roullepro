import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock, MessageCircle, Mail, Phone, CheckCircle2 } from "lucide-react";
import { isPaidPlan } from "@/lib/sanitaire-plans";
import ReplyForm from "./ReplyForm";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/transport-medical/pro/messages");

  const { data: pro } = await supabase
    .from("pros_sanitaire")
    .select("id, plan, nom_commercial, raison_sociale")
    .eq("claimed_by", user.id)
    .maybeSingle();

  if (!pro) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-600">Aucune fiche associée.</p>
          <Link href="/transport-medical/pro" className="text-[#0066CC] underline">Réclamer ma fiche</Link>
        </div>
      </main>
    );
  }

  const isPaid = isPaidPlan(pro.plan);

  if (!isPaid) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Messagerie réservée au plan Pro</h1>
          <p className="text-gray-600 mb-6">Activez le plan Pro à 19,90 €/mois pour lire et répondre aux messages des patients.</p>
          <Link
            href="/transport-medical/tarifs"
            className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-3 rounded-xl transition"
          >
            Voir les tarifs
          </Link>
        </div>
      </main>
    );
  }

  const { data: messages } = await supabase
    .from("sanitaire_messages")
    .select("*")
    .eq("pro_id", pro.id)
    .order("created_at", { ascending: false })
    .limit(100);

  // Réponses déjà envoyées (pour afficher l'historique sous chaque message)
  const messageIds = (messages || []).map((m) => m.id);
  const { data: replies } = messageIds.length
    ? await supabase
        .from("sanitaire_replies")
        .select("id, message_id, content, created_at")
        .in("message_id", messageIds)
        .order("created_at", { ascending: true })
    : { data: [] as { id: string; message_id: string; content: string; created_at: string }[] };

  const repliesByMessage = new Map<string, typeof replies>();
  for (const r of replies || []) {
    const list = repliesByMessage.get(r.message_id) || [];
    list.push(r);
    repliesByMessage.set(r.message_id, list);
  }

  // Mark as read
  if (messages && messages.length > 0) {
    await supabase
      .from("sanitaire_messages")
      .update({ read_by_pro: true })
      .eq("pro_id", pro.id)
      .eq("read_by_pro", false);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/transport-medical/pro/dashboard" className="text-sm text-[#0066CC] hover:underline">
            ← Retour au dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Messages reçus</h1>
          <p className="text-gray-600 text-sm">{messages?.length || 0} message{(messages?.length || 0) > 1 ? "s" : ""} au total</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        {!messages || messages.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <MessageCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Aucun message pour l'instant. Les demandes patientes apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{m.sender_name}</div>
                    <div className="text-xs text-gray-500 flex flex-wrap gap-3 mt-1">
                      <a href={`mailto:${m.sender_email}`} className="inline-flex items-center gap-1 hover:text-[#0066CC]">
                        <Mail className="w-3 h-3" />
                        {m.sender_email}
                      </a>
                      {m.sender_phone && (
                        <a href={`tel:${m.sender_phone}`} className="inline-flex items-center gap-1 hover:text-[#0066CC]">
                          <Phone className="w-3 h-3" />
                          {m.sender_phone}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(m.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{m.content}</p>

                {m.replied && (
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Répondu
                  </div>
                )}

                {(repliesByMessage.get(m.id) || []).map((r) => (
                  <div key={r.id} className="mt-3 ml-4 border-l-2 border-[#0066CC] bg-[#f0f6ff] rounded-r-lg p-3">
                    <div className="text-xs font-semibold text-[#0066CC] mb-1">Votre réponse</div>
                    <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">{r.content}</p>
                    <div className="text-[11px] text-gray-400 mt-1">
                      {new Date(r.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                    </div>
                  </div>
                ))}

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <ReplyForm messageId={m.id} alreadyReplied={!!m.replied} />
                  <div className="flex gap-2 mt-2">
                    <a
                      href={`mailto:${m.sender_email}?subject=Re : demande de transport`}
                      className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Répondre par email
                    </a>
                    {m.sender_phone && (
                      <a
                        href={`tel:${m.sender_phone}`}
                        className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Appeler
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
