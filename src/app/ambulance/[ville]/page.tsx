import type { Metadata } from "next";
import VilleCategorieHub, {
  buildVilleCategorieMetadata,
} from "@/components/sanitaire/VilleCategorieHub";
import { getVillesEligibles } from "@/lib/villes-eligibles";

export const revalidate = 3600;
// Les villes hors liste pre-generee restent servies en ISR a la demande.
export const dynamicParams = true;

const CATEGORIE = "ambulance";

type Props = {
  params: Promise<{ ville: string }>;
  searchParams: Promise<{ ameli?: string }>;
};

/**
 * Pre-genere les villes eligibles (>= 3 pros ou contenu editorial dedie).
 * Sans credentials Supabase, la liste est vide et tout bascule en ISR : le
 * build ne casse pas.
 */
export async function generateStaticParams() {
  const villes = await getVillesEligibles();
  return villes.map((ville) => ({ ville }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville } = await params;
  return buildVilleCategorieMetadata(ville, CATEGORIE);
}

export default async function AmbulanceVillePage({ params, searchParams }: Props) {
  const { ville } = await params;
  const { ameli } = await searchParams;
  return (
    <VilleCategorieHub villeSlug={ville} categorieSlug={CATEGORIE} ameliOnly={ameli === "1"} />
  );
}
