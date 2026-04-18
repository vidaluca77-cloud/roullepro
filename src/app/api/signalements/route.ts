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

    // Créer un client Supabase avec le service role key pour bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Créer un client normal pour vérifier l'authentification
    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    const supabase = await createServerClient();

    // Vérifier l'authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour signaler une annonce' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { annonce_id, raison } = body;

    // Validation
    if (!annonce_id || !raison) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Insérer le signalement avec le client admin (bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('signalements')
      .insert({
        annonce_id,
        user_id: user.id,
        raison,
      })
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
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
