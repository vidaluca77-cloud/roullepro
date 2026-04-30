export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limiting : max 10 signalements par IP par heure
    const ip = getClientIp(request);
    const { ok } = checkRateLimit(`signalements:${ip}`, 10, 3_600_000);
    if (!ok) {
      return NextResponse.json({ error: 'Trop de signalements. Veuillez réessayer plus tard.' }, { status: 429 });
    }

    // Client admin (bypass RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Client serveur pour identifier l'utilisateur si connecté
    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const {
      annonce_id,
      fiche_id,
      target_type: rawTargetType,
      raison,
      commentaire,
      reporter_email,
    } = body;

    // Détection auto du target_type si non fourni
    const target_type = rawTargetType || (fiche_id ? 'fiche_sanitaire' : 'annonce');

    if (!['annonce', 'fiche_sanitaire'].includes(target_type)) {
      return NextResponse.json({ error: 'target_type invalide' }, { status: 400 });
    }

    if (!raison || typeof raison !== 'string' || raison.trim().length < 3) {
      return NextResponse.json({ error: 'Raison manquante' }, { status: 400 });
    }

    // Annonce marketplace : auth obligatoire (comportement historique)
    if (target_type === 'annonce') {
      if (!user) {
        return NextResponse.json(
          { error: 'Vous devez être connecté pour signaler une annonce' },
          { status: 401 }
        );
      }
      if (!annonce_id) {
        return NextResponse.json({ error: 'annonce_id manquant' }, { status: 400 });
      }
    }

    // Fiche sanitaire : auth optionnelle (signalement public possible)
    if (target_type === 'fiche_sanitaire') {
      if (!fiche_id) {
        return NextResponse.json({ error: 'fiche_id manquant' }, { status: 400 });
      }
      // Verifier que la fiche existe
      const { data: fiche, error: ficheErr } = await supabaseAdmin
        .from('pros_sanitaire')
        .select('id')
        .eq('id', fiche_id)
        .maybeSingle();
      if (ficheErr || !fiche) {
        return NextResponse.json({ error: 'Fiche introuvable' }, { status: 404 });
      }
    }

    const insertPayload: Record<string, unknown> = {
      target_type,
      raison: raison.trim().slice(0, 200),
      commentaire: commentaire ? String(commentaire).trim().slice(0, 1000) : null,
      user_id: user?.id ?? null,
      reporter_ip: ip,
      statut: 'en_attente',
    };
    if (target_type === 'annonce') {
      insertPayload.annonce_id = annonce_id;
    } else {
      insertPayload.fiche_id = fiche_id;
      if (!user && reporter_email && typeof reporter_email === 'string') {
        // Validation simple email
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporter_email)) {
          insertPayload.reporter_email = reporter_email.trim().toLowerCase().slice(0, 200);
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('signalements')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('[api/signalements] insert error:', error.message);
      return NextResponse.json(
        { error: 'Erreur lors de la création du signalement' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Signalement enregistré avec succès', data },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('[api/signalements] unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
