import type { Metadata } from "next";
import VilleCategorieHub, {
  buildVilleCategorieMetadata,
} from "@/components/sanitaire/VilleCategorieHub";

export const revalidate = 3600;

// Depuis la mise en place des URLs courtes, cette route ne sert plus que /vsl :
// /transport-medical/[ville]/ambulance et /transport-medical/[ville]/taxi-conventionne
// sont redirigees en 301 vers /ambulance/[ville] et /taxi-conventionne/[ville]
// (voir next.config.js). Le composant reste generique pour les trois categories.

type Props = {
  params: Promise<{ ville: string; categorie: string }>;
  searchParams: Promise<{ ameli?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville, categorie } = await params;
  return buildVilleCategorieMetadata(ville, categorie);
}

export default async function VilleCategoriePage({ params, searchParams }: Props) {
  const { ville, categorie } = await params;
  const { ameli } = await searchParams;
  return (
    <VilleCategorieHub villeSlug={ville} categorieSlug={categorie} ameliOnly={ameli === "1"} />
  );
}
