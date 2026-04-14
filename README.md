# RoullePro

Plateforme d'annonces professionnelles pour le transport (VTC, Taxi, Ambulance, TPMR, Navette)

## Stack Technique

- **Frontend** : Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **Deploy** : Netlify

## Fonctionnalites

- Catalogue d'annonces avec filtres par categorie
- Fiche detail vehicule avec photos
- Inscription / Connexion vendeur
- Dashboard vendeur : gestion des annonces
- Depot d'annonce avec upload photos
- Page admin : moderation annonces + gestion utilisateurs
- Systeme de messages entre acheteurs et vendeurs
- Favoris

## Structure du projet

```
roullepro/
  src/
    app/
      page.tsx              # Page d'accueil
      layout.tsx            # Layout principal
      globals.css           # Styles globaux
      annonces/
        page.tsx            # Catalogue
        [id]/page.tsx       # Fiche detail
      auth/
        login/page.tsx      # Connexion
        register/page.tsx   # Inscription
      dashboard/
        page.tsx            # Espace vendeur
      deposer-annonce/
        page.tsx            # Formulaire depot
      admin/
        page.tsx            # Administration
    components/
      layout/
        Navbar.tsx
        Footer.tsx
    lib/
      supabase/
        client.ts           # Client Supabase
  supabase/
    migrations/
      001_schema.sql        # Schema base de donnees
  netlify.toml              # Config Netlify
  tailwind.config.ts
  tsconfig.json
  package.json
```

## Installation locale

### 1. Cloner le repo

```bash
git clone https://github.com/vidaluca77-cloud/roullepro.git
cd roullepro
npm install
```

### 2. Configurer Supabase

1. Creer un projet sur [supabase.com](https://supabase.com)
2. Dans l'editeur SQL, executer le contenu de `supabase/migrations/001_schema.sql`
3. Recuperer les cles dans Settings > API

### 3. Variables d'environnement

Copier `.env.local.example` en `.env.local` et remplir :

```env
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

### 4. Lancer en developpement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Deploiement sur Netlify

1. Connecter le repo GitHub a Netlify
2. Build command : `npm run build`
3. Publish directory : `.next`
4. Ajouter les variables d'environnement Supabase dans Netlify
5. Installer le plugin `@netlify/plugin-nextjs` (deja dans netlify.toml)

## Configuration Supabase Auth

Dans votre dashboard Supabase :
- Authentication > URL Configuration
- Site URL : `https://votre-site.netlify.app`
- Redirect URLs : `https://votre-site.netlify.app/auth/callback`

## Premier admin

Apres inscription du premier utilisateur, mettre a jour son role en SQL :

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'votre@email.com';
```

## Licence

MIT - RoullePro 2024
