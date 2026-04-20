/**
 * GET /api/admin/stats
 * Retourne des statistiques globales pour le dashboard admin.
 * Accès protégé : admin uniquement.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { apiError } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    // Vérif role admin
    const ssr = await createServerClient();
    const { data: { user } } = await ssr.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { data: profile } = await ssr
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const db = admin();
    const now = new Date();
    const d7  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Requêtes en parallèle avec count: 'exact', head: true pour éviter de ramener les lignes
    const [
      annoncesByStatus,
      usersCount, users7d, users30d,
      messagesCount, messages7d,
      notationsCount,
      signalementsPending,
      alertesCount,
      topCategories,
    ] = await Promise.all([
      db.from('annonces').select('status', { count: 'exact', head: false }),
      db.from('profiles').select('id', { count: 'exact', head: true }),
      db.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', d7),
      db.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', d30),
      db.from('messages').select('id', { count: 'exact', head: true }),
      db.from('messages').select('id', { count: 'exact', head: true }).gte('created_at', d7),
      db.from('notations').select('id', { count: 'exact', head: true }),
      db.from('signalements').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      db.from('alertes_categories').select('id', { count: 'exact', head: true }),
      db.from('annonces')
        .select('category_id, categories(name)')
        .eq('status', 'active'),
    ]);

    // Stats par status
    const statusMap: Record<string, number> = {};
    (annoncesByStatus.data || []).forEach((a: any) => {
      statusMap[a.status] = (statusMap[a.status] || 0) + 1;
    });

    // Top catégories
    const catMap: Record<string, number> = {};
    (topCategories.data || []).forEach((a: any) => {
      const name = a.categories?.name || 'Sans catégorie';
      catMap[name] = (catMap[name] || 0) + 1;
    });
    const topCats = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      annonces: {
        total: (annoncesByStatus.data || []).length,
        active: statusMap.active || 0,
        pending: statusMap.pending || 0,
        rejected: statusMap.rejected || 0,
        expired: statusMap.expired || 0,
        suspended: statusMap.suspended || 0,
      },
      users: {
        total: usersCount.count || 0,
        last_7d: users7d.count || 0,
        last_30d: users30d.count || 0,
      },
      messages: {
        total: messagesCount.count || 0,
        last_7d: messages7d.count || 0,
      },
      notations: notationsCount.count || 0,
      signalements_pending: signalementsPending.count || 0,
      alertes: alertesCount.count || 0,
      top_categories: topCats,
      generated_at: now.toISOString(),
    });
  } catch (err) {
    return apiError('api/admin/stats', err);
  }
}
