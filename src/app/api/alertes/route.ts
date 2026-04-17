export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/alertes — liste des alertes de l'utilisateur connecté
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ alertes: [] });

  const { data } = await supabase
    .from('alertes_categories')
    .select('category_id')
    .eq('user_id', user.id);

  return NextResponse.json({ alertes: (data || []).map(a => a.category_id) });
}

// POST /api/alertes — s'abonner à une catégorie
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { category_id } = await request.json();
  if (!category_id) return NextResponse.json({ error: 'category_id requis' }, { status: 400 });

  const { error } = await supabase
    .from('alertes_categories')
    .insert({ user_id: user.id, category_id })
    .select()
    .single();

  // Ignorer l'erreur unique (déjà abonné)
  if (error && !error.message.includes('unique')) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, subscribed: true });
}

// DELETE /api/alertes?category_id=XXX — se désabonner
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category_id = searchParams.get('category_id');
  if (!category_id) return NextResponse.json({ error: 'category_id requis' }, { status: 400 });

  await supabase
    .from('alertes_categories')
    .delete()
    .eq('user_id', user.id)
    .eq('category_id', category_id);

  return NextResponse.json({ success: true, subscribed: false });
}
