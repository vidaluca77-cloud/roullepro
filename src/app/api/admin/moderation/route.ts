export const dynamic = 'force-dynamic';
/**
 * PATCH /api/admin/moderation
 * Approuve ou refuse une annonce pending.
 * Si approbation : envoie les alertes aux abonnés de la catégorie.
 */
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import {
  sendVendeurAnnonceApprouvee,
  sendVendeurAnnonceRefusee,
  sendAlerteNouvelleAnnonce,
} from '@/lib/email';
import { notifyUser } from '@/lib/notify';

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const admin = getAdminClient();
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const { annonce_id, action } = await request.json();
    if (!annonce_id || !['approve', 'reject', 'suspend', 'reactivate'].includes(action)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    const newStatus =
      action === 'approve' ? 'active' :
      action === 'reject' ? 'rejected' :
      action === 'suspend' ? 'suspended' :
      action === 'reactivate' ? 'active' :
      'active';

    // Récupérer l'annonce complète + vendeur + catégorie
    const { data: annonce, error: fetchErr } = await admin
      .from('annonces')
      .select('id, title, price, city, images, category_id, user_id, profiles(full_name, email), categories(id, name)')
      .eq('id', annonce_id)
      .single();

    if (fetchErr || !annonce) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });

    // Mettre à jour le statut
    const { error: updateErr } = await admin.from('annonces').update({ status: newStatus }).eq('id', annonce_id);
    if (updateErr) return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });

    const vendeur = annonce.profiles as any;
    const categorie = annonce.categories as any;

    // Email vendeur (non bloquant)
    if (vendeur?.email) {
      if (action === 'approve') {
        sendVendeurAnnonceApprouvee({
          vendeurEmail: vendeur.email,
          vendeurName: vendeur.full_name || '',
          annonceTitle: annonce.title,
          annonceId: annonce.id,
        });
      } else {
        sendVendeurAnnonceRefusee({
          vendeurEmail: vendeur.email,
          vendeurName: vendeur.full_name || '',
          annonceTitle: annonce.title,
        });
      }
    }

    // Alertes abonnés — uniquement si approbation
    if (action === 'approve' && annonce.category_id) {
      // Récupérer tous les abonnés à cette catégorie (sauf le vendeur lui-même)
      const { data: abonnes } = await admin
        .from('alertes_categories')
        .select('user_id, profiles(full_name, email)')
        .eq('category_id', annonce.category_id)
        .neq('user_id', annonce.user_id); // pas de notif au vendeur

      if (abonnes && abonnes.length > 0) {
        const images = (annonce.images as string[]) || [];
        // Envoi emails en parallèle (non bloquant)
        Promise.allSettled(
          abonnes.map((ab: any) => {
            const p = ab.profiles;
            if (!p?.email) return Promise.resolve();
            return sendAlerteNouvelleAnnonce({
              abonneEmail: p.email,
              abonneName: p.full_name || '',
              categorieName: categorie?.name || '',
              annonceTitle: annonce.title,
              annonceId: annonce.id,
              annoncePrice: annonce.price,
              annonceCity: annonce.city || '',
              annonceImageUrl: images[0] || '',
            });
          })
        );
        // Push aux abonnés (non bloquant)
        Promise.allSettled(
          abonnes.map((ab: any) =>
            notifyUser(ab.user_id, {
              title: `Nouvelle annonce : ${categorie?.name || 'véhicule'}`,
              body: `${annonce.title}${annonce.price ? ' — ' + Number(annonce.price).toLocaleString('fr-FR') + ' €' : ''}`,
              url: `/annonces/${annonce.id}`,
              tag: `alerte-${annonce.id}`,
            })
          )
        );
      }
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err: any) {
    console.error('[api/admin/moderation] error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/moderation?id=<annonce_id>
 * Suppression definitive d'une annonce (admin uniquement).
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const admin = getAdminClient();
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id manquant' }, { status: 400 });

    const { error } = await admin.from('annonces').delete().eq('id', id);
    if (error) {
      console.error('[api/admin/moderation DELETE] error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[api/admin/moderation DELETE] error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
