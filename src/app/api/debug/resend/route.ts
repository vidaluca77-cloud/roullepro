/**
 * GET /api/debug/resend?token=XXX
 * Diagnostic temporaire — vérifie la config Resend.
 * Protégé par RESEND_DEBUG_TOKEN pour éviter tout abus public.
 *
 * À SUPPRIMER après debug.
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const expected = process.env.RESEND_DEBUG_TOKEN;

  if (!expected || token !== expected) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const adminEmail = process.env.ADMIN_EMAIL;
  const to = url.searchParams.get("to");

  const diag: Record<string, unknown> = {
    env: {
      RESEND_API_KEY_present: !!apiKey,
      RESEND_API_KEY_prefix: apiKey ? apiKey.slice(0, 6) + "..." : null,
      RESEND_API_KEY_length: apiKey ? apiKey.length : 0,
      RESEND_FROM_EMAIL: fromEmail || "(non défini, fallback onboarding@resend.dev)",
      ADMIN_EMAIL: adminEmail || "(non défini)",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "(non défini)",
    },
  };

  if (!apiKey) {
    diag.conclusion = "RESEND_API_KEY ABSENTE côté runtime — aucun email ne peut partir.";
    return NextResponse.json(diag);
  }

  if (!to) {
    diag.note =
      "Ajouter ?to=votre@email.com pour tester un envoi réel et voir l'erreur précise de Resend.";
    return NextResponse.json(diag);
  }

  // Test d'envoi réel
  try {
    const resend = new Resend(apiKey);
    const from = fromEmail || "RoullePro <onboarding@resend.dev>";
    const result = await resend.emails.send({
      from,
      to,
      subject: "[Diag RoullePro] Test d'envoi depuis prod",
      html: "<p>Si vous recevez ceci, Resend fonctionne en production.</p>",
    });

    diag.from_used = from;
    diag.resend_response = result;
    if (result.error) {
      diag.conclusion = `Resend a rejeté l'envoi : ${result.error.message}`;
    } else {
      diag.conclusion = "Envoi OK — vérifiez la boîte de réception.";
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    diag.exception = msg;
    diag.conclusion = `Exception JavaScript lors de l'envoi : ${msg}`;
  }

  return NextResponse.json(diag);
}
