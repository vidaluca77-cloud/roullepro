import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import AnnonceCard from '@/components/AnnonceCard';
import StarRating from '@/components/StarRating';
import ProfilVendeurClient from './ProfilVendeurClient';
import {
  BadgeCheck,
  MapPin,
  Building,
  ArrowLeft,
  Package,
  Star,
  MessageSquare,
} from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://roullepro.com';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = getServiceClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company_name, city, is_verified')
    .eq('id', params.id)
    .single();

  if (!profile) {
    return { title: 'Vendeur introuvable | RoullePro' };
  }

  const nom = profile.company_name || profile.full_name || 'Vendeur professionnel';
  const description = `Profil vendeur de ${nom}${profile.city ? ` — ${profile.city}` : ''}${profile.is_verified ? ' — Compte vérifié RoullePro' : ''}.`;

  return {
    title: `${nom} | RoullePro`,
    description,
    openGraph: {
      title: `${nom} | RoullePro`,
      description,
      url: `${APP_URL}/profil/${params.id}`,
    },
  };
}

// ---------------------------------------------------------------------------
// Page (Server Component)
// ---------------------------------------------------------------------------

export default async function ProfilVendeurPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getServiceClient();

  // Parallel data fetching
  const [
    { data: profile },
    { data: annonces },
    notationsRes,
    currentUser,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, company_name, city, is_verified, statut_verification, created_at')
      .eq('id', params.id)
      .single(),
    supabase
      .from('annonces')
      .select('*, categories(id, name, slug)')
      .eq('user_id', params.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
    fetch(`${APP_URL}/api/notations?vendeur_id=${params.id}`, {
      next: { revalidate: 60 },
    }).then((r) => (r.ok ? r.json() : { stats: null, notations: [], maNotation: null })).catch(() => ({ stats: null, notations: [], maNotation: null })),
    getCurrentUser(),
  ]);

  if (!profile) notFound();

  const memberSince = new Date(profile.created_at).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const stats = notationsRes?.stats;
  const notations: Record<string, unknown>[] = notationsRes?.notations || [];
  const maNotation = notationsRes?.maNotation || null;
  const isOwn = currentUser?.id === params.id;
  const vendeurNom = profile.company_name || profile.full_name || 'ce vendeur';

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: profile.company_name || profile.full_name || 'Vendeur professionnel',
    url: `${APP_URL}/profil/${params.id}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.city || '',
      addressCountry: 'FR',
    },
    ...(stats && stats.nb_notations > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: stats.note_moyenne,
            reviewCount: stats.nb_notations,
          },
        }
      : {}),
    ...(annonces && annonces.length > 0
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: `Annonces de ${vendeurNom}`,
            itemListElement: annonces.map((a: Record<string, unknown>, idx: number) => ({
              '@type': 'ListItem',
              position: idx + 1,
              item: {
                '@type': 'Offer',
                name: a.title,
                url: `${APP_URL}/annonces/${a.id}`,
                price: a.price ?? undefined,
                priceCurrency: 'EUR',
              },
            })),
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <Link
              href="/annonces"
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 text-sm"
            >
              <ArrowLeft size={16} /> Retour aux annonces
            </Link>

            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {(profile.company_name || profile.full_name || '?')[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.company_name || profile.full_name || 'Vendeur professionnel'}
                  </h1>
                  {profile.is_verified && (
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      <BadgeCheck size={16} /> Compte vérifié
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                  {profile.company_name && profile.full_name && (
                    <span className="flex items-center gap-1">
                      <Building size={14} />
                      {profile.full_name}
                    </span>
                  )}
                  {profile.city && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {profile.city}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Package size={14} /> {annonces?.length ?? 0} annonce
                    {(annonces?.length ?? 0) > 1 ? 's' : ''} active
                    {(annonces?.length ?? 0) > 1 ? 's' : ''}
                  </span>
                  <span>Membre depuis {memberSince}</span>
                </div>

                {/* Note moyenne */}
                {stats && stats.nb_notations > 0 ? (
                  <div className="flex items-center gap-3 mt-3">
                    <StarRating note={parseFloat(String(stats.note_moyenne))} size={18} />
                    <span className="font-semibold text-gray-900">{stats.note_moyenne}</span>
                    <span className="text-sm text-gray-500">({stats.nb_notations} avis)</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mt-2 flex items-center gap-1.5">
                    <Star size={14} /> Aucun avis pour le moment
                  </p>
                )}

                {/* Bouton notation — Client Component */}
                <ProfilVendeurClient
                  vendeurId={params.id}
                  vendeurNom={vendeurNom}
                  notationExistante={maNotation}
                  currentUserId={currentUser?.id ?? null}
                  isOwn={isOwn}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
          {/* Annonces */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Annonces de {vendeurNom}
            </h2>
            {!annonces || annonces.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <Package size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Ce vendeur n&apos;a pas d&apos;annonces actives.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {annonces.map((a) => (
                  <AnnonceCard
                    key={a.id}
                    annonce={a}
                    isFavorite={false}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Avis */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-600" />
                Avis clients
                {stats?.nb_notations > 0 && (
                  <span className="text-sm font-normal text-gray-400">
                    ({stats.nb_notations})
                  </span>
                )}
              </h2>
            </div>

            {/* Répartition étoiles */}
            {stats && stats.nb_notations > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900">{stats.note_moyenne}</div>
                    <StarRating
                      note={parseFloat(String(stats.note_moyenne))}
                      size={16}
                      className="justify-center mt-1"
                    />
                    <p className="text-xs text-gray-400 mt-1">{stats.nb_notations} avis</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((n) => {
                      const count = stats[`nb_${n}_etoile${n > 1 ? 's' : ''}`] || 0;
                      const pct =
                        stats.nb_notations > 0
                          ? Math.round((count / stats.nb_notations) * 100)
                          : 0;
                      return (
                        <div key={n} className="flex items-center gap-2 text-xs">
                          <span className="w-4 text-gray-500 text-right">{n}</span>
                          <Star
                            size={11}
                            className="text-amber-400 fill-amber-400 flex-shrink-0"
                          />
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-gray-400 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Liste avis */}
            {notations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <Star size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">Aucun avis pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notations.map((n: any) => {
                  const nProfiles = n.profiles as Record<string, unknown> | null;
                  const auteur: string =
                    (nProfiles?.company_name as string) ||
                    (nProfiles?.full_name as string) ||
                    'Professionnel vérifié';
                  return (
                    <div
                      key={n.id as string}
                      className="bg-white rounded-2xl border border-gray-100 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">{String(auteur)}</span>
                          </div>
                          <StarRating note={n.note as number} size={14} />
                          {n.commentaire && (
                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                              {String(n.commentaire)}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {new Date(n.created_at as string).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
