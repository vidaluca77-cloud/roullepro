export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toRow(fields: any[]): string {
  return fields.map(escapeCsv).join(',');
}

// GET /api/admin/export?type=annonces|users|notations
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'annonces';

  let csvContent = '';
  let filename = '';

  if (type === 'annonces') {
    const { data } = await supabase
      .from('annonces')
      .select('id, title, status, price, city, marque, modele, annee, kilometrage, carburant, views_count, created_at, profiles(full_name, email, company_name), categories(name)')
      .order('created_at', { ascending: false });

    const headers = ['ID','Titre','Statut','Prix (€)','Ville','Marque','Modèle','Année','Km','Énergie','Vues','Vendeur','Email','Entreprise','Catégorie','Date création'];
    const rows = (data || []).map((a: any) => toRow([
      a.id, a.title, a.status, a.price, a.city, a.marque, a.modele, a.annee, a.kilometrage, a.carburant,
      a.views_count, a.profiles?.full_name, a.profiles?.email, a.profiles?.company_name,
      a.categories?.name, new Date(a.created_at).toLocaleDateString('fr-FR'),
    ]));
    csvContent = [toRow(headers), ...rows].join('\n');
    filename = `roullepro-annonces-${new Date().toISOString().slice(0,10)}.csv`;

  } else if (type === 'users') {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, company_name, siret, city, phone, role, is_verified, statut_verification, created_at')
      .order('created_at', { ascending: false });

    const headers = ['ID','Nom','Email','Entreprise','SIRET','Ville','Téléphone','Rôle','Vérifié','Statut vérif.','Date inscription'];
    const rows = (data || []).map((u: any) => toRow([
      u.id, u.full_name, u.email, u.company_name, u.siret, u.city, u.phone,
      u.role, u.is_verified ? 'Oui' : 'Non', u.statut_verification,
      new Date(u.created_at).toLocaleDateString('fr-FR'),
    ]));
    csvContent = [toRow(headers), ...rows].join('\n');
    filename = `roullepro-utilisateurs-${new Date().toISOString().slice(0,10)}.csv`;

  } else if (type === 'notations') {
    const { data } = await supabase
      .from('notations')
      .select('id, note, commentaire, created_at, profiles!notations_vendeur_id_fkey(full_name, email, company_name), profiles!notations_acheteur_id_fkey(full_name, email)')
      .order('created_at', { ascending: false });

    const headers = ['ID','Note','Commentaire','Vendeur','Email vendeur','Acheteur','Date'];
    const rows = (data || []).map((n: any) => toRow([
      n.id, n.note, n.commentaire,
      (n as any)['profiles_notations_vendeur_id_fkey']?.full_name || (n as any).profiles?.full_name,
      (n as any)['profiles_notations_vendeur_id_fkey']?.email || (n as any).profiles?.email,
      (n as any)['profiles_notations_acheteur_id_fkey']?.full_name,
      new Date(n.created_at).toLocaleDateString('fr-FR'),
    ]));
    csvContent = [toRow(headers), ...rows].join('\n');
    filename = `roullepro-notations-${new Date().toISOString().slice(0,10)}.csv`;
  }

  // BOM UTF-8 pour Excel
  const bom = '\uFEFF';
  return new NextResponse(bom + csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
