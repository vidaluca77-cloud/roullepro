import { createClient as createSbClient } from '@supabase/supabase-js';
import GaragesClient from './GaragesClient';

export const dynamic = 'force-dynamic';

async function getGarages() {
  try {
    const sb = createSbClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await sb
      .from('garages_partenaires')
      .select(
        'id, raison_sociale, adresse, code_postal, ville, contact_telephone, specialites, note_moyenne, nb_ventes_total, site_web'
      )
      .eq('statut', 'actif')
      .order('note_moyenne', { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function GaragesPage({
  searchParams,
}: {
  searchParams: { estimation?: string };
}) {
  const garages = await getGarages();
  const estimationId = searchParams.estimation ?? null;

  return <GaragesClient garages={garages} estimationId={estimationId} />;
}
