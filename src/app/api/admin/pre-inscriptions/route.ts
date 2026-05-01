export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

async function requireAdmin() {
  const { createClient: createServerClient } = await import('@/lib/supabase/server');
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié', status: 401 as const };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'admin') return { error: 'Accès refusé', status: 403 as const };
  return { user, status: 200 as const };
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const FR_REGIONS_BY_DEPT: Record<string, string> = {
  '01':'Auvergne-Rhône-Alpes','03':'Auvergne-Rhône-Alpes','07':'Auvergne-Rhône-Alpes','15':'Auvergne-Rhône-Alpes','26':'Auvergne-Rhône-Alpes','38':'Auvergne-Rhône-Alpes','42':'Auvergne-Rhône-Alpes','43':'Auvergne-Rhône-Alpes','63':'Auvergne-Rhône-Alpes','69':'Auvergne-Rhône-Alpes','73':'Auvergne-Rhône-Alpes','74':'Auvergne-Rhône-Alpes',
  '21':'Bourgogne-Franche-Comté','25':'Bourgogne-Franche-Comté','39':'Bourgogne-Franche-Comté','58':'Bourgogne-Franche-Comté','70':'Bourgogne-Franche-Comté','71':'Bourgogne-Franche-Comté','89':'Bourgogne-Franche-Comté','90':'Bourgogne-Franche-Comté',
  '22':'Bretagne','29':'Bretagne','35':'Bretagne','56':'Bretagne',
  '18':'Centre-Val de Loire','28':'Centre-Val de Loire','36':'Centre-Val de Loire','37':'Centre-Val de Loire','41':'Centre-Val de Loire','45':'Centre-Val de Loire',
  '2A':'Corse','2B':'Corse',
  '08':'Grand Est','10':'Grand Est','51':'Grand Est','52':'Grand Est','54':'Grand Est','55':'Grand Est','57':'Grand Est','67':'Grand Est','68':'Grand Est','88':'Grand Est',
  '02':'Hauts-de-France','59':'Hauts-de-France','60':'Hauts-de-France','62':'Hauts-de-France','80':'Hauts-de-France',
  '75':'Île-de-France','77':'Île-de-France','78':'Île-de-France','91':'Île-de-France','92':'Île-de-France','93':'Île-de-France','94':'Île-de-France','95':'Île-de-France',
  '14':'Normandie','27':'Normandie','50':'Normandie','61':'Normandie','76':'Normandie',
  '16':'Nouvelle-Aquitaine','17':'Nouvelle-Aquitaine','19':'Nouvelle-Aquitaine','23':'Nouvelle-Aquitaine','24':'Nouvelle-Aquitaine','33':'Nouvelle-Aquitaine','40':'Nouvelle-Aquitaine','47':'Nouvelle-Aquitaine','64':'Nouvelle-Aquitaine','79':'Nouvelle-Aquitaine','86':'Nouvelle-Aquitaine','87':'Nouvelle-Aquitaine',
  '09':'Occitanie','11':'Occitanie','12':'Occitanie','30':'Occitanie','31':'Occitanie','32':'Occitanie','34':'Occitanie','46':'Occitanie','48':'Occitanie','65':'Occitanie','66':'Occitanie','81':'Occitanie','82':'Occitanie',
  '44':'Pays de la Loire','49':'Pays de la Loire','53':'Pays de la Loire','72':'Pays de la Loire','85':'Pays de la Loire',
  '04':'Provence-Alpes-Côte d\'Azur','05':'Provence-Alpes-Côte d\'Azur','06':'Provence-Alpes-Côte d\'Azur','13':'Provence-Alpes-Côte d\'Azur','83':'Provence-Alpes-Côte d\'Azur','84':'Provence-Alpes-Côte d\'Azur',
  '971':'Guadeloupe','972':'Martinique','973':'Guyane','974':'La Réunion','976':'Mayotte',
};

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// GET : liste des pre-inscriptions
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(request.url);
  const statut = url.searchParams.get('statut') || 'en_attente';

  const supa = adminClient();
  let q = supa
    .from('pros_pre_inscription')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (statut !== 'tous') q = q.eq('statut', statut);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

// PATCH : creer la fiche depuis une pre-inscription, ou rejeter
export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const { pre_id, action, override } = body as {
    pre_id?: string;
    action?: 'creer_fiche' | 'rejeter';
    override?: { ville?: string; code_postal?: string; categorie?: string; raison_sociale?: string; telephone?: string; siret?: string };
  };
  if (!pre_id || !action) return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });

  const supa = adminClient();
  const { data: pre, error: preErr } = await supa.from('pros_pre_inscription').select('*').eq('id', pre_id).single();
  if (preErr || !pre) return NextResponse.json({ error: 'Pré-inscription introuvable' }, { status: 404 });

  if (action === 'rejeter') {
    await supa.from('pros_pre_inscription').update({
      statut: 'rejete',
      traite_par: auth.user.id,
      traite_le: new Date().toISOString(),
    }).eq('id', pre_id);
    return NextResponse.json({ ok: true });
  }

  // creer_fiche
  const merged = {
    siret: (override?.siret || pre.siret || '').replace(/\s/g, ''),
    raison_sociale: override?.raison_sociale || pre.raison_sociale || pre.full_name || 'Entreprise sans nom',
    telephone: override?.telephone || pre.telephone || null,
    ville: (override?.ville || pre.ville || '').toUpperCase(),
    code_postal: override?.code_postal || pre.code_postal || null,
    categorie: override?.categorie || pre.categorie,
  };

  if (merged.siret.length !== 14) return NextResponse.json({ error: 'SIRET invalide' }, { status: 400 });
  if (!merged.categorie) return NextResponse.json({ error: 'Catégorie manquante' }, { status: 400 });
  if (!merged.ville) return NextResponse.json({ error: 'Ville manquante' }, { status: 400 });
  if (!merged.code_postal || merged.code_postal.length < 4) return NextResponse.json({ error: 'Code postal manquant' }, { status: 400 });

  const departement = merged.code_postal.startsWith('97') ? merged.code_postal.slice(0, 3) : merged.code_postal.slice(0, 2);
  const region = FR_REGIONS_BY_DEPT[departement] || 'France';
  const ville_slug = slugify(merged.ville);
  const slug = `${slugify(merged.raison_sociale)}-${merged.siret}`.slice(0, 200);

  // Verifie doublon SIRET
  const { data: existing } = await supa.from('pros_sanitaire').select('id').eq('siret', merged.siret).maybeSingle();
  if (existing) {
    // Lier la fiche existante au compte plutot que de creer un doublon
    await supa.from('pros_sanitaire').update({
      claimed: true,
      claimed_by: pre.user_id,
      claimed_at: new Date().toISOString(),
      claim_status: 'approved',
      validated_at: new Date().toISOString(),
    }).eq('id', existing.id);
    await supa.from('profiles').update({
      role: 'pro',
      statut_verification: 'verifie',
      is_verified: true,
      vendeur_verifie: true,
      city: merged.ville,
      region,
      plan: 'free',
    }).eq('id', pre.user_id);
    await supa.from('pros_pre_inscription').update({
      statut: 'fiche_creee',
      fiche_id: existing.id,
      traite_par: auth.user.id,
      traite_le: new Date().toISOString(),
      notes_admin: 'Fiche existante reliée (SIRET déjà connu)',
    }).eq('id', pre_id);
    return NextResponse.json({ ok: true, fiche_id: existing.id, action: 'liee' });
  }

  const { data: created, error: insErr } = await supa.from('pros_sanitaire').insert({
    siret: merged.siret,
    siren: merged.siret.slice(0, 9),
    raison_sociale: merged.raison_sociale,
    nom_commercial: pre.raison_sociale || null,
    slug,
    categorie: merged.categorie,
    code_postal: merged.code_postal,
    ville: merged.ville,
    ville_slug,
    departement,
    region,
    telephone_public: merged.telephone,
    email_public: pre.email,
    actif: true,
    suspendu: false,
    source: 'self_registration',
    claimed: true,
    claimed_by: pre.user_id,
    claimed_at: new Date().toISOString(),
    claim_status: 'approved',
    validated_at: new Date().toISOString(),
  }).select('id').single();

  if (insErr || !created) return NextResponse.json({ error: insErr?.message || 'Création fiche impossible' }, { status: 500 });

  await supa.from('profiles').update({
    role: 'pro',
    statut_verification: 'verifie',
    is_verified: true,
    vendeur_verifie: true,
    city: merged.ville,
    region,
    plan: 'free',
  }).eq('id', pre.user_id);

  await supa.from('pros_pre_inscription').update({
    statut: 'fiche_creee',
    fiche_id: created.id,
    traite_par: auth.user.id,
    traite_le: new Date().toISOString(),
  }).eq('id', pre_id);

  return NextResponse.json({ ok: true, fiche_id: created.id, action: 'creee' });
}
