import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://roullepro.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  // Valeurs par défaut (OG homepage)
  let title = 'RoullePro';
  let subtitle = 'Marketplace B2B du transport routier';
  let price = '';
  let city = '';
  let category = '';
  let imageUrl = '';

  if (id) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: annonce } = await supabase
        .from('annonces')
        .select('title, price, city, images, categories(name)')
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (annonce) {
        title = annonce.title || 'Annonce RoullePro';
        category = (annonce.categories as any)?.name || '';
        price = annonce.price
          ? `${Number(annonce.price).toLocaleString('fr-FR')} €`
          : 'Prix sur demande';
        city = annonce.city || '';
        const imgs = (annonce.images as string[]) || [];
        imageUrl = imgs[0] || '';
        subtitle = [category, city].filter(Boolean).join(' · ') || 'Transport professionnel';
      }
    } catch {
      // Fallback silencieux
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#f8fafc',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Image de fond si disponible */}
        {imageUrl && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
            }}
          >
            <img
              src={imageUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.15,
              }}
            />
          </div>
        )}

        {/* Dégradé gauche bleu */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '420px',
            height: '100%',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            display: 'flex',
          }}
        />

        {/* Contenu gauche (logo + brand) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '420px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '48px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'white',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#1d4ed8', fontWeight: 'bold', fontSize: '20px' }}>R</span>
            </div>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '28px' }}>RoullePro</span>
          </div>

          {/* Tag catégorie */}
          {category && (
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                borderRadius: '20px',
                padding: '6px 16px',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '12px',
              }}
            >
              {category}
            </div>
          )}

          {/* Baseline */}
          <p
            style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: '18px',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Marketplace B2B
            <br />
            transport routier
          </p>
        </div>

        {/* Contenu droite (titre annonce + infos) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '420px',
            right: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '48px 56px',
          }}
        >
          <h1
            style={{
              color: '#0f172a',
              fontSize: title.length > 50 ? '32px' : title.length > 30 ? '38px' : '44px',
              fontWeight: 'bold',
              margin: '0 0 20px 0',
              lineHeight: 1.2,
              maxWidth: '640px',
            }}
          >
            {title}
          </h1>

          {/* Prix */}
          {price && (
            <div
              style={{
                color: '#1d4ed8',
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '16px',
              }}
            >
              {price}
            </div>
          )}

          {/* Ville */}
          {city && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#64748b',
                fontSize: '20px',
              }}
            >
              <span>📍</span>
              <span>{city}</span>
            </div>
          )}

          {/* URL */}
          <div
            style={{
              position: 'absolute',
              bottom: '32px',
              right: '56px',
              color: '#94a3b8',
              fontSize: '16px',
            }}
          >
            roullepro.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
