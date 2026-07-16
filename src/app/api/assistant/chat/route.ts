export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  getAdminClient,
  getProPayant,
  estPayant,
  mistralConfigured,
  construireSystemPrompt,
  majMemoire,
  estimerTokens,
  getAgent,
  rechercheDocuments,
  DEFAULT_AGENT_SLUG,
  QUOTA_MENSUEL,
  MISTRAL_API_URL,
  MISTRAL_MODEL,
  MEMOIRE_TOUS_LES_N,
  HISTORIQUE_MAX,
  type ChatMessage,
} from "@/lib/ia-assistant";

function moisCourant(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export async function POST(req: Request) {
  // 1. Authentification
  const supabaseUser = await createServerClient();
  const {
    data: { user },
  } = await supabaseUser.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // 2. Clé Mistral configurée ?
  if (!mistralConfigured()) {
    return NextResponse.json(
      {
        error:
          "L'assistant IA n'est pas configuré (clé MISTRAL_API_KEY manquante). Contactez le support RoullePro.",
      },
      { status: 503 }
    );
  }

  const admin = getAdminClient();

  // 3. Vérification du plan payant
  const pro = await getProPayant(admin, user.id);
  if (!estPayant(pro)) {
    return NextResponse.json(
      { error: "L'assistant IA est réservé aux abonnés Pro." },
      { status: 403 }
    );
  }

  // 4. Validation de l'entrée
  let body: { conversationId?: string; message?: string; agent_slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const agentSlugDemande =
    typeof body.agent_slug === "string" && body.agent_slug.trim()
      ? body.agent_slug.trim()
      : DEFAULT_AGENT_SLUG;
  const message = (body.message || "").trim();
  if (message.length < 2) {
    return NextResponse.json({ error: "Message vide" }, { status: 400 });
  }
  if (message.length > 8000) {
    return NextResponse.json({ error: "Message trop long (8000 caractères max)" }, { status: 400 });
  }

  // 5. Quota mensuel
  const { data: usageRow } = await admin
    .from("ia_usage")
    .select("nb_messages")
    .eq("user_id", user.id)
    .eq("mois", moisCourant())
    .maybeSingle();
  const usageActuel = usageRow?.nb_messages ?? 0;
  if (usageActuel >= QUOTA_MENSUEL) {
    return NextResponse.json(
      {
        error: `Quota mensuel atteint (${QUOTA_MENSUEL} messages). Il se réinitialise le 1er du mois prochain.`,
      },
      { status: 429 }
    );
  }

  // 6. Conversation (création ou vérification d'appartenance)
  let conversationId = body.conversationId;
  let agentSlug = agentSlugDemande;
  if (conversationId) {
    const { data: conv } = await admin
      .from("ia_conversations")
      .select("id, user_id, agent_slug")
      .eq("id", conversationId)
      .maybeSingle();
    if (!conv || conv.user_id !== user.id) {
      return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
    }
    // L'agent est fixé à la création : on conserve celui de la conversation.
    agentSlug = conv.agent_slug || DEFAULT_AGENT_SLUG;
  } else {
    const titre = message.length > 60 ? message.slice(0, 57) + "…" : message;
    const { data: nouvelleConv, error: convErr } = await admin
      .from("ia_conversations")
      .insert({ user_id: user.id, titre, agent_slug: agentSlug })
      .select("id")
      .single();
    if (convErr || !nouvelleConv) {
      return NextResponse.json({ error: "Impossible de créer la conversation" }, { status: 500 });
    }
    conversationId = nouvelleConv.id;
  }

  // 6bis. Agent spécialisé + recherche documentaire sourcée
  const agent = await getAgent(admin, agentSlug);
  const promptAgent = agent?.system_prompt ?? null;
  const documents = await rechercheDocuments(admin, agentSlug, message);

  // 7. Historique de la conversation
  const { data: historiqueRows } = await admin
    .from("ia_messages")
    .select("role, contenu")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  const historique = (historiqueRows || []) as { role: "user" | "assistant"; contenu: string }[];
  const nbEchangesUser = historique.filter((m) => m.role === "user").length;

  // 8. Fiche mémoire
  const { data: memoireRow } = await admin
    .from("ia_memoire")
    .select("contenu")
    .eq("user_id", user.id)
    .maybeSingle();
  const memoire = memoireRow?.contenu ?? "";

  // 9. Construction du prompt Mistral (prompt de l'agent + extraits sourcés)
  const systemPrompt = construireSystemPrompt(pro, memoire, promptAgent, documents);
  const messagesMistral: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...historique.slice(-HISTORIQUE_MAX).map((m) => ({ role: m.role, content: m.contenu })),
    { role: "user", content: message },
  ];

  // 10. Enregistrement immédiat du message utilisateur + incrément du quota
  await admin.from("ia_messages").insert({
    conversation_id: conversationId,
    role: "user",
    contenu: message,
    tokens_estimes: estimerTokens(message),
  });
  await admin.rpc("ia_incrementer_usage", { p_user_id: user.id });
  await admin
    .from("ia_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  // 11. Appel Mistral en streaming → relais SSE vers le client
  const apiKey = process.env.MISTRAL_API_KEY!;
  let mistralRes: Response;
  try {
    mistralRes = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: messagesMistral,
        stream: true,
        temperature: 0.4,
        max_tokens: 2000,
      }),
    });
  } catch {
    return NextResponse.json({ error: "Service IA momentanément indisponible" }, { status: 502 });
  }

  if (!mistralRes.ok || !mistralRes.body) {
    return NextResponse.json(
      { error: "Le service IA a renvoyé une erreur. Réessayez dans un instant." },
      { status: 502 }
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const finalConversationId = conversationId!;

  const stream = new ReadableStream({
    async start(controller) {
      // Prévenir le client de l'id de conversation utilisé
      controller.enqueue(
        encoder.encode(`event: meta\ndata: ${JSON.stringify({ conversationId: finalConversationId, agentSlug })}\n\n`)
      );

      let complet = "";
      const reader = mistralRes.body!.getReader();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lignes = buffer.split("\n");
          buffer = lignes.pop() || "";
          for (const ligne of lignes) {
            const trimmed = ligne.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const delta = json?.choices?.[0]?.delta?.content;
              if (delta) {
                complet += delta;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`)
                );
              }
            } catch {
              // fragment JSON incomplet — ignoré
            }
          }
        }
      } catch {
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ error: "Interruption du flux" })}\n\n`)
        );
      }

      // Sauvegarde de la réponse assistant
      if (complet.trim().length > 0) {
        await admin.from("ia_messages").insert({
          conversation_id: finalConversationId,
          role: "assistant",
          contenu: complet,
          tokens_estimes: estimerTokens(complet),
        });
        await admin
          .from("ia_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", finalConversationId);

        // Mise à jour de la fiche mémoire tous les N échanges (best-effort, non bloquant)
        if ((nbEchangesUser + 1) % MEMOIRE_TOUS_LES_N === 0) {
          await majMemoire(admin, user.id, memoire, { user: message, assistant: complet }).catch(
            () => undefined
          );
        }
      }

      controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
