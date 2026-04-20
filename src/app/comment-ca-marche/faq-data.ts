/**
 * Source unique pour la FAQ — consommée par FaqAccordion (UI)
 * et par le schema JSON-LD FAQPage (SEO).
 */
export const FAQ_ITEMS = [
  {
    question: "Est-ce gratuit pour les vendeurs ?",
    answer:
      "Oui, le depot d'annonce est 100% gratuit. Aucun abonnement ni commission n'est preleve sur vos ventes.",
  },
  {
    question: "Qui peut utiliser RoullePro ?",
    answer:
      "RoullePro est exclusivement reserve aux professionnels du transport routier. Un KBIS valide est requis pour creer un compte vendeur.",
  },
  {
    question: "Comment fonctionne la verification vendeur ?",
    answer:
      "Lors de votre inscription, vous uploadez votre extrait KBIS. Notre equipe verifie le document sous 24 heures. Une fois valide, votre profil affiche le badge Vendeur verifie.",
  },
  {
    question: "Combien de photos puis-je ajouter ?",
    answer:
      "Vous pouvez ajouter jusqu'a 10 photos par annonce. Nous recommandons des photos de bonne qualite sous differents angles pour maximiser vos chances de vente.",
  },
  {
    question: "Mes annonces sont-elles visibles immediatement ?",
    answer:
      "Non. Chaque annonce est soumise a une moderation sous 24 heures afin de garantir la qualite des offres publiees sur la plateforme.",
  },
  {
    question: "Comment contacter un vendeur ?",
    answer:
      "Via la messagerie integree RoullePro, directement depuis la fiche annonce. Vos coordonnees ne sont jamais partagees avec le vendeur.",
  },
  {
    question: "Puis-je modifier mon annonce apres publication ?",
    answer:
      "Oui, depuis votre dashboard dans l'onglet Mes annonces, un bouton Modifier est disponible pour chaque annonce.",
  },
  {
    question: "Comment signaler une annonce suspecte ?",
    answer:
      "Un bouton Signaler est present sur chaque fiche annonce. Nos moderateurs traitent chaque signalement sous 24 heures.",
  },
] as const;
