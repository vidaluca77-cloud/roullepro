'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: "Est-ce gratuit pour les vendeurs ?",
    answer: "Oui, le depot d'annonce est 100% gratuit. Aucun abonnement ni commission n'est preleve sur vos ventes.",
  },
  {
    question: "Qui peut utiliser RoullePro ?",
    answer: "RoullePro est exclusivement reserve aux professionnels du transport routier. Un KBIS valide est requis pour creer un compte vendeur.",
  },
  {
    question: "Comment fonctionne la verification vendeur ?",
    answer: "Lors de votre inscription, vous uploadez votre extrait KBIS. Notre equipe verifie le document sous 24 heures. Une fois valide, votre profil affiche le badge Vendeur verifie.",
  },
  {
    question: "Combien de photos puis-je ajouter ?",
    answer: "Vous pouvez ajouter jusqu'a 10 photos par annonce. Nous recommandons des photos de bonne qualite sous differents angles pour maximiser vos chances de vente.",
  },
  {
    question: "Mes annonces sont-elles visibles immediatement ?",
    answer: "Non. Chaque annonce est soumise a une moderation sous 24 heures afin de garantir la qualite des offres publiees sur la plateforme.",
  },
  {
    question: "Comment contacter un vendeur ?",
    answer: "Via la messagerie integree RoullePro, directement depuis la fiche annonce. Vos coordonnees ne sont jamais partagees avec le vendeur.",
  },
  {
    question: "Puis-je modifier mon annonce apres publication ?",
    answer: "Oui, depuis votre dashboard dans l'onglet Mes annonces, un bouton Modifier est disponible pour chaque annonce.",
  },
  {
    question: "Comment signaler une annonce suspecte ?",
    answer: "Un bouton Signaler est present sur chaque fiche annonce. Nos moderateurs traitent chaque signalement sous 24 heures.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition"
          >
            <span>{item.question}</span>
            {openIndex === i ? (
              <ChevronUp size={18} className="text-blue-600 flex-shrink-0" />
            ) : (
              <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
            )}
          </button>
          {openIndex === i && (
            <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
