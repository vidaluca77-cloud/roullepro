export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await request.json();
    const sub = body?.subscription;
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return NextResponse.json({ error: "Subscription invalide" }, { status: 400 });
    }

    const admin = getAdmin();
    const userAgent = request.headers.get("user-agent") || null;

    const { error } = await admin
      .from("push_subscriptions")
      .upsert(
        {
          user_id: user.id,
          endpoint: sub.endpoint,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
          user_agent: userAgent,
        },
        { onConflict: "endpoint" }
      );

    if (error) {
      console.error("[push/subscribe]", error.message);
      return NextResponse.json({ error: "Erreur enregistrement" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[push/subscribe]", e?.message);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await request.json();
    const endpoint = body?.endpoint;
    if (!endpoint) return NextResponse.json({ error: "Endpoint manquant" }, { status: 400 });

    const admin = getAdmin();
    await admin.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", endpoint);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[push/subscribe DELETE]", e?.message);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
