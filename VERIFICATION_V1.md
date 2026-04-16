# Système de Vérification RoullePro v1.0

## Vue d'ensemble
Système de vérification des vendeurs professionnels permettant de valider l'identité et la légitimité des entreprises sur la plateforme.

## Statuts disponibles
- `non_verifie` : Statut par défaut, aucune demande envoyée
- `en_attente` : Demande de vérification envoyée, en cours de traitement
- `verifie` : Compte vérifié par l'équipe admin
- `refuse` : Vérification refusée

## Infrastructure mise en place

### Base de données (Supabase)
- **Table `profiles`** :
  - Colonne `statut_verification` (text, default: 'non_verifie')
  - Colonne `justificatif_url` (text, nullable)

### Storage (Supabase)
- **Bucket `justificatifs`** :
  - Privé (non public)
  - Limite de taille : 5 MB par fichier
  - Types MIME autorisés : application/pdf, image/jpeg, image/png, image/jpg
  - Politiques RLS :
    - SELECT : Utilisateurs peuvent lire leurs propres fichiers
    - INSERT : Utilisateurs peuvent uploader dans leur propre dossier (par user ID)

## Composants créés

### `/src/components/VerificationBadge.tsx`
Badge visuel affichant le statut de vérification avec icônes et couleurs appropriées.

### `/src/app/api/verification/route.ts`
API Route POST pour soumettre une demande de vérification:
- Vérifie l'authentification
- Met à jour le profil avec l'URL du justificatif
- Change le statut en `en_attente`

### `/src/app/admin/verification/page.tsx`
Page d'administration pour gérer les demandes:
- Liste des profils en attente de vérification
- Affichage des informations du vendeur
- Accès au justificatif uploadé
- Boutons Valider/Refuser
- Réservé aux admins (vérifie `is_admin` dans le profil)

## À compléter pour la v1 finale

### Page `/profil` 
- [ ] Ajouter section "Demande de vérification"
- [ ] Implémenter upload de fichier vers Storage Supabase
- [ ] Bouton "Demander la vérification" qui appelle l'API
- [ ] Afficher le statut actuel avec VerificationBadge

### Affichage des badges
- [ ] Ajouter VerificationBadge dans les cartes d'annonces
- [ ] Afficher le badge sur les pages de détail
- [ ] Montrer le statut dans le dashboard

## Sécurité
- Storage policies empêchent l'accès aux fichiers d'autres utilisateurs
- API vérifie l'authentification avant toute action
- Page admin protégée par vérification `is_admin`
- Fichiers uploadés limités en taille et type MIME

## Prochaines étapes
1. Compléter l'interface upload dans `/profil/page.tsx`
2. Intégrer les badges dans toutes les vues pertinentes
3. Tester le workflow complet : upload → validation admin → affichage badge
4. Ajouter notifications email (optionnel v1.1)
