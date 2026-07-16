-- Améliorations UX de l'assistant IA (voir 20260716_agents_specialises.sql).
--   1. ia_agents.questions_suggerees : 4 questions concrètes et métier par agent,
--      affichées comme chips cliquables au démarrage d'une conversation.
--   2. Enrichissement des system_prompt : ajout d'un bloc « STYLE DES RÉPONSES »
--      pour des réponses plus humaines, simples et concrètes.
-- Idempotent : safe à exécuter plusieurs fois (UPDATE de valeurs absolues +
-- append conditionnel du bloc de style).

-- ─────────────────────────────────────────────────────────────
-- 1. Colonne questions_suggerees
-- ─────────────────────────────────────────────────────────────
alter table public.ia_agents
  add column if not exists questions_suggerees text[] not null default '{}';

-- Seed des 4 questions par agent (UPDATE de valeur absolue → idempotent).
update public.ia_agents set questions_suggerees = array[
  'Comment obtenir le conventionnement CPAM pour mon taxi ?',
  'Quelle différence entre une ambulance, un VSL et un taxi conventionné ?',
  'Par où commencer pour créer mon entreprise de transport sanitaire ?',
  'Un transport est refusé par la caisse : que puis-je faire ?'
] where slug = 'general';

update public.ia_agents set questions_suggerees = array[
  'Quel matériel est obligatoire dans une ambulance de catégorie C ?',
  'Comment obtenir l''agrément ARS pour mon activité ?',
  'Quelles sont les conditions pour devenir taxi conventionné CPAM ?',
  'Mon auxiliaire ambulancier peut-il conduire seul un VSL ?'
] where slug = 'reglementaire';

update public.ia_agents set questions_suggerees = array[
  'Comment corriger un rejet de télétransmission ?',
  'Comment facturer un transport partagé ?',
  'Quelles majorations puis-je appliquer un dimanche ou un jour férié ?',
  'Comment facturer une série de transports en ALD ?'
] where slug = 'facturation';

update public.ia_agents set questions_suggerees = array[
  'Comment répondre à un appel d''offres d''un hôpital ?',
  'Comment démarcher un EHPAD pour décrocher un contrat ?',
  'Comment participer à la garde ambulancière départementale ?',
  'Quels arguments pour fidéliser un service hospitalier prescripteur ?'
] where slug = 'commercial';

update public.ia_agents set questions_suggerees = array[
  'Quelle est l''amplitude maximale de travail d''un ambulancier ?',
  'Quelles étapes pour embaucher un auxiliaire ambulancier ?',
  'Comment sont décomptées les heures supplémentaires dans le transport sanitaire ?',
  'Quelle grille de salaire s''applique à un ambulancier DEA ?'
] where slug = 'rh';

update public.ia_agents set questions_suggerees = array[
  'Quelle TVA s''applique au transport de malades ?',
  'Sur combien d''années amortir une ambulance ?',
  'Comment calculer mon coût kilométrique ?',
  'Quel statut juridique choisir pour mon entreprise de transport ?'
] where slug = 'gestion';

-- ─────────────────────────────────────────────────────────────
-- 2. Bloc « STYLE DES RÉPONSES » ajouté à chaque agent
-- Append conditionnel (guard sur la présence du marqueur) → idempotent :
-- ré-exécuter la migration ne duplique pas le bloc. Les consignes de citation
-- existantes des prompts sont conservées (on ajoute à la suite).
-- ─────────────────────────────────────────────────────────────
update public.ia_agents
set system_prompt = system_prompt || E'\n\n' || $style$STYLE DES RÉPONSES (IMPORTANT) :
- Parle comme un collègue de terrain expérimenté et bienveillant, pas comme une notice administrative. Ton chaleureux, humain et rassurant.
- Fais des phrases courtes et simples. Va à l'essentiel, sans remplissage.
- Commence toujours par la réponse directe en 1 ou 2 phrases, puis détaille seulement si c'est utile.
- Explique chaque sigle ou terme technique dès sa première apparition, entre parenthèses (par exemple : PMT = prescription médicale de transport ; NOEMIE = retour d'information de l'Assurance Maladie ; ATSU = association de transport sanitaire urgent ; ALD = affection de longue durée).
- Illustre avec des exemples concrets tirés du quotidien d'un transporteur sanitaire.
- Évite les longues listes à puces imbriquées et le jargon juridique brut : reformule les textes en langage clair et parlant.
- Quand c'est pertinent, termine par « La prochaine étape concrète : » suivi de l'action à faire tout de suite.
- Ces consignes de style s'ajoutent à tes consignes de citation des sources, qui restent prioritaires.$style$
where position('STYLE DES RÉPONSES' in system_prompt) = 0;
