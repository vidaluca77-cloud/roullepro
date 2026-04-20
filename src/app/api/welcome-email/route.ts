/**
 * POST /api/welcome-email
 * Envoie un email de bienvenue lors de l'inscription d'un nouvel utilisateur.
 * Non-bloquant : en cas d'échec, l'inscription réussit tout de même.
 *
 * Body : { email: string, full_name?: string }
 */

import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { apiError } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    // Limite : 5 envois par IP par heure (éviter le spam d'inscriptions)
    const { ok } = checkRateLimit(`welcome:${ip}`, 5, 60 * 60 * 1000);
    if (!ok) {
      return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
    }

    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const full_name = typeof body?.full_name === 'string' ? body.full_name.trim() : '';

    // Validation basique de l'email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    await sendWelcomeEmail({
      userEmail: email,
      userName: full_name || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError('api/welcome-email', err);
  }
}
