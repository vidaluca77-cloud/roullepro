/**
 * Composant serveur — affiche jusqu'à 4 annonces similaires
 * (même catégorie, prix ±30%, status active, hors annonce courante).
 */
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

interface Props {
  currentId: string;
  categoryId: string | null;
  price: number | null;
}

async function getSimilar(currentId: string, categoryId: string | null, price: number | null) {
  if (!categoryId) return [];
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let q = supabase
    .from('annonces')
    .select('id, title, price, city, images')
    .eq('status', 'active')
    .eq('category_id', categoryId)
    .neq('id', currentId)
    .limit(4);

  // Fourchette de prix ±30 % si on a un prix
  if (price && price > 0) {
    q = q.gte('price', Math.floor(price * 0.7)).lte('price', Math.ceil(price * 1.3));
  }

  const { data } = await q.order('created_at', { ascending: false });

  // Si pas assez de résultats avec la fourchette, élargir
  if ((data?.length || 0) < 4 && price && price > 0) {
    const { data: fallback } = await supabase
      .from('annonces')
      .select('id, title, price, city, images')
      .eq('status', 'active')
      .eq('category_id', categoryId)
      .neq('id', currentId)
      .order('created_at', { ascending: false })
      .limit(4);
    return fallback || [];
  }

  return data || [];
}

export default async function SimilarAnnonces({ currentId, categoryId, price }: Props) {
  const similar = await getSimilar(currentId, categoryId, price);
  if (similar.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 border-t border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Annonces similaires</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {similar.map((a: any) => {
          const img = Array.isArray(a.images) && a.images.length > 0 ? a.images[0] : null;
          return (
            <Link
              key={a.id}
              href={`/annonces/${a.id}`}
              className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
            >
              <div className="relative w-full aspect-[4/3] bg-gray-100">
                {img ? (
                  <Image
                    src={img}
                    alt={a.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                    Sans photo
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 min-h-[2.5rem]">
                  {a.title}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  {a.price ? (
                    <span className="font-bold text-blue-600">
                      {Number(a.price).toLocaleString('fr-FR')} €
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">Prix sur demande</span>
                  )}
                  {a.city && (
                    <span className="text-xs text-gray-500">{a.city}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
