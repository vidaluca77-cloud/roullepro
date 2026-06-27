# Cahier des charges — Chantiers FINESS + Formulaires unifiés + Home conversion

Document de référence préparé le 17 juin 2026 pour le projet RoullePro.
Trois chantiers à mener dans l'ordre, sans casser l'architecture existante.

---

## Sommaire

1. Règles métier de routage des demandes (le coeur du système)
2. Chantier A — Import FINESS et pages établissements
3. Chantier B — Formulaire unifié à 3 boutons (taxi / VSL / ambulance)
4. Chantier C — Home avec formulaire de conversion
5. Modifications base de données (récapitulatif unique)
6. Sécurité, RGPD, anti-spam
7. Ordre d'exécution recommandé
8. Annexes — éléments existants à réutiliser

---

## 1. Règles métier de routage des demandes

Ces règles s'appliquent UNIQUEMENT aux nouveaux formulaires créés dans ces chantiers (home, pages FINESS, pages "transport vers"). Les anciens formulaires sur les fiches pros existantes continuent de fonctionner comme aujourd'hui sans modification.

### Matrice de routage — demandes adressées à une fiche pro précise

S'applique aux formulaires existants sur les fiches pros (sanitaire_messages, callback_requests) et au cas où une demande des nouveaux formulaires cible un pro_id_cible explicite.

| Type de transport demandé | Fiche pro RoullePro non claimed | Fiche pro RoullePro claimed |
|---|---|---|
| Taxi conventionné | Fan-out vers tcp.reservations (tous chauffeurs TCP du département avec is_conventionne_cpam=true ET page_publique_active=true) | Email Resend vers email_public du pro RoullePro UNIQUEMENT (exclusivité) |
| VSL | Fallback email vers contact@roullepro.com | Email Resend vers email_public du pro + BCC contact@roullepro.com |
| Ambulance | Fallback email vers contact@roullepro.com | Email Resend vers email_public du pro + BCC contact@roullepro.com |

### Matrice de routage — demandes ouvertes (home, FINESS, transport vers)

S'applique aux nouveaux formulaires sans pro_id_cible (saisie depuis home, page établissement ou page "transport vers"). La demande n'appartient à aucun pro précis → on fan-out par zone.

| Type de transport demandé | Comportement |
|---|---|
| Taxi conventionné | Fan-out tcp.reservations (chauffeurs TCP éligibles du département) + emails Resend top 5 pros taxi RoullePro avec email_public dans rayon 30 km |
| VSL | Emails Resend top 5 pros VSL avec email_public dans rayon 30 km, fallback contact@roullepro.com si aucun |
| Ambulance | Emails Resend top 5 pros ambulance avec email_public dans rayon 30 km, fallback contact@roullepro.com si aucun |

### Précisions importantes

- Pas de bridge TCP pour VSL et ambulance (jamais)
- Pro taxi claimed = exclusivité conservée : l'email Resend lui est envoyé seul, jamais doublé d'un fan-out TCP. C'est l'avantage commercial principal de l'abonnement Pro
- Pro taxi non claimed = fan-out TCP du département (comportement actuel conservé)
- Le bridge TCP actuel `bridge_roulepro_to_tcp()` doit être modifié uniquement pour exclure VSL et ambulance. Le filtre claimed reste en place.
- Sur les pages d'établissement et "transport vers" et la home, il n'y a pas de pro cible unique → matrice "demandes ouvertes" ci-dessus, exclusivité claimed non applicable

### Cas spéciaux

- Si aucun chauffeur TCP éligible dans le département (cas fréquent : 88 départements sur 96 n'ont actuellement aucun chauffeur TCP) → la demande taxi tombe dans le vide TCP. Solution : on continue d'envoyer vers les pros taxi RoullePro du département en parallèle.
- Si aucun pro RoullePro de la catégorie demandée dans le rayon : fallback unique vers contact@roullepro.com avec sujet `[Lead orphelin - aucune fiche zone]`
- Etienne PETIT (id `4275105a-4d45-46fd-9012-6701f1c9ea81`, dept 73) : règle absolue, jamais touché par aucun de ces flux

---

## 2. Chantier A — Import FINESS et pages établissements

### Objectif

Créer un référentiel SEO d'établissements de santé (hôpitaux, cliniques, EHPAD, centres de dialyse, etc.) avec pages dédiées, pour générer du trafic SEO long terme et amorcer les pages "transport vers [établissement]" qui sont les vraies pages de conversion.

### A1. Table `etablissements_sante` (nouvelle, schéma public)

```sql
CREATE TABLE public.etablissements_sante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finess_geo text UNIQUE NOT NULL,
  finess_juri text,
  raison_sociale text NOT NULL,
  nom_court text,
  slug text UNIQUE NOT NULL,
  categorie_finess_code text,
  categorie_finess_libelle text,
  categorie_simple text NOT NULL CHECK (categorie_simple IN ('hopital','clinique','ehpad','centre-sante','centre-dialyse','centre-oncologie','psychiatrie','rehabilitation','autre')),
  adresse text,
  code_postal text,
  ville text,
  ville_slug text,
  departement text,
  region text,
  latitude double precision,
  longitude double precision,
  telephone text,
  site_web text,
  capacite_lits int,
  source text NOT NULL DEFAULT 'finess',
  source_updated_at date,
  actif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_etab_ville_slug ON etablissements_sante (ville_slug) WHERE actif=true;
CREATE INDEX idx_etab_departement ON etablissements_sante (departement) WHERE actif=true;
CREATE INDEX idx_etab_categorie ON etablissements_sante (categorie_simple) WHERE actif=true;
CREATE INDEX idx_etab_slug ON etablissements_sante (slug) WHERE actif=true;
CREATE INDEX idx_etab_latlng ON etablissements_sante (latitude, longitude) WHERE actif=true;
```

### A2. RLS

```sql
ALTER TABLE etablissements_sante ENABLE ROW LEVEL SECURITY;

CREATE POLICY "etab_public_read" ON etablissements_sante
  FOR SELECT USING (actif = true);

-- Aucun write public, modifications uniquement via service_role
```

### A3. Vue publique (utilisée par les pages)

```sql
CREATE OR REPLACE VIEW etablissements_sante_public AS
SELECT
  id, finess_geo, raison_sociale, nom_court, slug,
  categorie_simple, categorie_finess_libelle,
  adresse, code_postal, ville, ville_slug, departement, region,
  latitude, longitude,
  telephone, site_web, capacite_lits,
  source_updated_at
FROM etablissements_sante
WHERE actif = true;
```

### A4. Script d'import FINESS

- Source : fichier CSV de [data.gouv.fr — Extraction FINESS](https://www.data.gouv.fr/datasets/finess-extraction-du-fichier-des-etablissements) (fichier `t-finess.csv`)
- Licence Ouverte 2.0
- Volume brut : ~102 000 établissements
- Volume après filtrage : ~15 000-20 000 lignes utiles

#### Filtres d'inclusion (codes catégorie agrégation FINESS)

À conserver :
- 1101 Centre Hospitalier Universitaire (CHU)
- 1102 Centre Hospitalier (CH)
- 365 Etablissement de Soins Pluridisciplinaire (clinique MCO privée)
- 355 Maison de Repos et Convalescence
- 500 EHPAD
- 502 Logement-foyer
- 354 Centre de Dialyse / Autodialyse
- 437 Centre Médico-Psychologique (CMP)
- 130 Etablissement de Lutte Contre le Cancer
- 158 Etablissement de Soins Longue Durée
- 156 Etablissement de Réadaptation Fonctionnelle

À exclure : pharmacies, laboratoires, cabinets individuels, services administratifs ARS, structures sans accueil patient ambulatoire.

#### Mapping `categorie_simple` (groupes SEO simplifiés)

```
hopital         = 1101, 1102
clinique        = 365
ehpad           = 500, 502, 355
centre-sante    = 437
centre-dialyse  = 354
centre-oncologie = 130
psychiatrie     = (codes psy à finaliser depuis FINESS lookup table)
rehabilitation  = 156, 158
autre           = tout le reste retenu
```

#### Script d'import

Fichier : `scripts/import-finess.ts`
Étapes :
1. Téléchargement du CSV depuis l'URL data.gouv.fr (cache local 7 jours)
2. Parsing avec `csv-parse` (déjà installé probablement, sinon ajouter)
3. Filtrage par codes catégorie
4. Génération du slug : `slugify(raison_sociale + '-' + departement)` avec déduplication par suffixe numérique si collision
5. Génération de `nom_court` : suppression "Centre Hospitalier Universitaire", "Clinique", etc. depuis la raison sociale pour avoir un libellé court (ex "Hôpital de Caen" plutôt que "Centre Hospitalier Universitaire de Caen")
6. UPSERT par `finess_geo` dans `etablissements_sante`
7. Marquage `actif=false` des fiches dont le `finess_geo` n'apparaît plus dans le nouveau dump (suppressions FINESS)

### A5. Cron de mise à jour

- Cadence : 1er du mois à 4h UTC
- Job pg_cron qui appelle l'edge function `etab-refresh-finess`
- Edge function télécharge le dernier CSV et relance le pipeline UPSERT
- Notifier Lucas in_app si erreur ou si > 5% de fiches passées en `actif=false`

### A6. Routes Next.js

Toutes en RSC + ISR.

#### `/etablissements` (index national)
- Liste les 10 catégories avec compteurs et 12 CHU/CH les plus connus
- revalidate = 86400

#### `/etablissements/[type]` (page catégorie)
- types acceptés : hopitaux, cliniques, ehpad, centres-sante, centres-dialyse, centres-oncologie, psychiatrie, rehabilitation
- 8 pages
- Liste des 100 plus grands établissements de la catégorie triés par capacite_lits puis ville alphabétique
- Lien vers chaque ville ayant >= 3 établissements de la catégorie
- generateStaticParams = les 8 types

#### `/etablissements/[type]/[ville]` (catégorie + ville)
- ~3 000 combinaisons utiles
- generateStaticParams limité aux top 500 (type, ville) par volume → static
- Les autres en ISR à la demande (`dynamicParams = true`, `revalidate = 86400`)

#### `/etablissements/[slug]` (fiche établissement)
- ~15 000-20 000 pages
- generateStaticParams = top 500 par capacité (CHU + grandes cliniques)
- Reste en ISR
- Affiche : nom, catégorie, adresse complète, téléphone, site web, capacité, source FINESS avec date
- Section "Transport médical vers [nom]" qui pointe vers `/transport-medical/vers/[slug]`
- Section "Établissements similaires dans la même ville"
- JSON-LD `Hospital` ou `MedicalClinic` ou `NursingHome` (différent de LocalBusiness des pros taxi → pas de conflit)

#### `/transport-medical/vers/[etablissement-slug]` (LA page de conversion)
- ~15 000-20 000 pages
- generateStaticParams = top 500
- Reste en ISR
- H1 : "Transport médical vers [nom court établissement]"
- Bloc principal : formulaire unifié à 3 boutons (Chantier B) pré-rempli avec :
  - lieu d'arrivée = adresse de l'établissement
  - sélecteur de type de transport par défaut sur "taxi"
- Bloc secondaire : liste des taxis/VSL/ambulances dans un rayon de 30 km autour de l'établissement, triés `plan DESC, claimed DESC, distance ASC` (top 12)
- Bloc FAQ : "Comment réserver un taxi pour aller à [nom] ?" + "Combien coûte une ambulance vers [nom] ?" + 4 autres questions générées via le pattern `sanitaire-seo.ts` existant
- Bloc CTA chauffeurs : "Vous êtes chauffeur dans le [département] ? Recevez les demandes patients vers [nom]" avec lien d'inscription TCP

### A7. Sitemap

Ajout dans `src/lib/sitemap-builders.ts` de 2 builders :
- `buildEtablissementsEntries(chunkIndex)` — fiches établissements paginées par 10 000
- `buildTransportVersEntries(chunkIndex)` — pages "transport vers" paginées par 10 000

Dans `src/app/sitemap.xml/route.ts` ajout dans `namedItems` :
```ts
`<sitemap><loc>${BASE_URL}/sitemaps/etablissements.xml</loc>...</sitemap>`,
`<sitemap><loc>${BASE_URL}/sitemaps/transport-vers.xml</loc>...</sitemap>`,
```

Aucun chunk numérique modifié (les 80 SANITAIRE_FICHES_CHUNKS restent intacts).

---

## 3. Chantier B — Formulaire unifié à 3 boutons

### Objectif

Composant unique réutilisable sur :
- Home page (Chantier C)
- Pages `/transport-medical/vers/[etablissement-slug]`
- Pages `/etablissements/[slug]` (en variante minimale)

Et qui applique la matrice de routage du chapitre 1.

### B1. Composant React `<DemandeTransportForm>`

Fichier : `src/components/sanitaire/DemandeTransportForm.tsx` (nouveau)

Props :
```ts
interface Props {
  variant: 'home' | 'etablissement' | 'fiche-pro';
  // Pré-remplissage selon contexte
  etablissementId?: string;       // si saisie depuis une page établissement
  etablissementNom?: string;
  etablissementAdresse?: string;  // pré-remplit le champ "arrivée"
  // Restriction de zone (utilisée pour le matching pros RoullePro)
  departementCible?: string;      // si page établissement → dept de l'étab
  villeCible?: string;
  // Si saisie depuis une fiche pro (pré-sélection de la catégorie)
  proIdCible?: string;
  categoriePreSelectionnee?: 'taxi' | 'vsl' | 'ambulance';
}
```

UI :
- 3 gros boutons en haut : `Taxi conventionné` / `VSL` / `Ambulance` (state interne `typeTransport`)
- Une fois cliqué, dépliage du formulaire avec :
  - Identité : nom, téléphone (requis), email (optionnel sauf taxi : si TCP fan-out, l'email reste optionnel)
  - Date et heure souhaitées
  - Lieu de départ (Google Places autocomplete, comme l'existant ContactProForm)
  - Lieu d'arrivée (pré-rempli si etablissementAdresse fourni)
  - Aller-retour (checkbox)
  - Mobilité (autonome / aide marche / fauteuil / brancard) — REQUIS sur ambulance, optionnel sur VSL et taxi
  - Précisions (textarea optionnelle)
  - Honeypot caché
  - Bouton de soumission "Envoyer ma demande"
- Affichage post-submit :
  - Message de confirmation
  - Nombre de pros notifiés (si dispo en retour API)
  - Si taxi : "X chauffeurs Taxi Connect Pro du département sont également notifiés"

### B2. Endpoint API `/api/demande-transport/route.ts` (nouveau)

```ts
POST /api/demande-transport

Body : {
  type_transport: 'taxi' | 'vsl' | 'ambulance',
  nom: string,
  telephone: string,
  email?: string,
  date_souhaitee: string (ISO),
  heure_souhaitee: string,
  lieu_depart: string,
  lieu_arrivee: string,
  aller_retour: boolean,
  mobilite: 'autonome' | 'aide_marche' | 'fauteuil' | 'brancard',
  precisions?: string,
  // Contexte
  etablissement_id?: string,
  pro_id_cible?: string,
  departement_cible?: string,
  ville_cible?: string,
  hp: string (honeypot)
}

Response : {
  ok: boolean,
  pros_notifies: number,
  tcp_notifies: number,
  warning?: string
}
```

#### Logique de l'endpoint

```
1. Validation des champs requis + honeypot + rate limit (5 req / 15 min par IP)
2. INSERT en BDD dans une nouvelle table `demandes_transport` (audit + analytics)
3. Détermination des destinataires :
   a. Si pro_id_cible fourni → tableau de 1 pro
   b. Sinon, requête PostGIS-like (Haversine SQL) :
      - SELECT pros_sanitaire WHERE actif=true AND suspendu IS NOT TRUE
        AND categorie = (mappé sur type_transport)
        AND distance(lat, lng, etab_lat, etab_lng) < 30 km
        ORDER BY plan DESC, claimed DESC, distance ASC
        LIMIT 5 (les top 5 dans le rayon)
4. Envoi des emails Resend (1 par pro destinataire avec email_public)
5. Si type_transport = 'taxi' ET pas de pro_id_cible (demande ouverte home/FINESS) → INSERT fan-out dans tcp.reservations
   (un INSERT par chauffeur TCP du dept avec is_conventionne_cpam=true ET page_publique_active=true)
   avec groupe_id partagé.
   Note : si pro_id_cible fourni ET pro claimed → exclusivité, PAS de fan-out TCP.
   Si pro_id_cible fourni ET pro non claimed → fan-out TCP (cohérent avec le bridge actuel).
6. Si type_transport in ('vsl','ambulance') ET aucun pro avec email_public → fallback email contact@roullepro.com
7. Toujours BCC contact@roullepro.com sur les envois Resend (traçabilité)
8. Retour avec compteurs
```

#### Pourquoi ne pas réutiliser le trigger SQL existant

Le trigger `bridge_roulepro_to_tcp()` actuel est attaché à `sanitaire_messages` et `callback_requests` qui sont des tables "messages adressés à un pro spécifique". Notre nouveau cas (demande de transport saisie depuis une page établissement ou la home) n'a pas de pro cible unique. Logique différente, table différente → on garde le trigger existant intact et on crée une nouvelle table + nouvelle logique applicative côté Node.

### B3. Table `demandes_transport` (nouvelle)

```sql
CREATE TABLE public.demandes_transport (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  type_transport text NOT NULL CHECK (type_transport IN ('taxi','vsl','ambulance')),
  -- Identité demandeur
  nom text NOT NULL,
  telephone text NOT NULL,
  email text,
  -- Demande
  date_souhaitee timestamptz,
  lieu_depart text,
  lieu_arrivee text,
  aller_retour boolean DEFAULT false,
  mobilite text,
  precisions text,
  -- Contexte
  source_page text,                  -- 'home', 'etablissement', 'fiche-pro'
  etablissement_id uuid REFERENCES etablissements_sante(id) ON DELETE SET NULL,
  pro_id_cible uuid REFERENCES pros_sanitaire(id) ON DELETE SET NULL,
  departement_cible text,
  ville_cible text,
  -- Tracking
  ip_hash text,
  user_agent text,
  pros_notifies int DEFAULT 0,
  tcp_notifies int DEFAULT 0,
  groupe_id_tcp uuid,                -- lien vers tcp.reservations si applicable
  statut text DEFAULT 'envoyee' CHECK (statut IN ('envoyee','traitee','sans_suite'))
);

CREATE INDEX idx_demandes_created ON demandes_transport (created_at DESC);
CREATE INDEX idx_demandes_type ON demandes_transport (type_transport);
CREATE INDEX idx_demandes_dept ON demandes_transport (departement_cible);
CREATE INDEX idx_demandes_etab ON demandes_transport (etablissement_id) WHERE etablissement_id IS NOT NULL;

ALTER TABLE demandes_transport ENABLE ROW LEVEL SECURITY;
-- Aucune policy public (lecture/écriture via service_role uniquement)
```

### B4. Fonction SQL helper `pros_proches_etablissement` (nouvelle)

Sans PostGIS, on utilise la formule de Haversine en SQL pur.

```sql
CREATE OR REPLACE FUNCTION public.pros_proches_etablissement(
  p_lat double precision,
  p_lng double precision,
  p_categorie text,
  p_rayon_km int DEFAULT 30,
  p_limit int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  raison_sociale text,
  nom_commercial text,
  slug text,
  ville text,
  email_public text,
  claimed boolean,
  plan text,
  distance_km double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id, p.raison_sociale, p.nom_commercial, p.slug, p.ville,
    p.email_public, p.claimed, p.plan,
    (
      6371 * acos(
        cos(radians(p_lat)) * cos(radians(p.latitude)) *
        cos(radians(p.longitude) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(p.latitude))
      )
    ) AS distance_km
  FROM pros_sanitaire p
  WHERE p.actif = true
    AND COALESCE(p.suspendu, false) = false
    AND p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND p.categorie = p_categorie
    AND (
      6371 * acos(
        cos(radians(p_lat)) * cos(radians(p.latitude)) *
        cos(radians(p.longitude) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(p.latitude))
      )
    ) < p_rayon_km
  ORDER BY
    CASE p.plan
      WHEN 'pro_plus' THEN 1
      WHEN 'premium' THEN 2
      WHEN 'essential' THEN 3
      ELSE 4
    END,
    p.claimed DESC NULLS LAST,
    distance_km ASC
  LIMIT p_limit;
$$;
```

Performance : 25 810 pros actifs, la fonction tourne en sub-100ms avec un index supplémentaire `(actif, suspendu, categorie, latitude, longitude)`. Pour scaler à 50k+ envisager PostGIS dans une V2.

### B5. Modification de `bridge_roulepro_to_tcp()` (minimal)

Le bridge actuel ignore les fiches claimed et fan-out toutes catégories. À modifier UNIQUEMENT pour exclure VSL et ambulance. Le filtre claimed est conservé tel quel pour préserver l'exclusivité commerciale des pros taxi claimed.

```sql
CREATE OR REPLACE FUNCTION public.bridge_roulepro_to_tcp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_pro RECORD;
  v_chauffeur RECORD;
  v_nom_passager TEXT;
  v_telephone TEXT;
  v_email TEXT;
  v_message TEXT;
  v_source TEXT;
  v_groupe_id UUID;
BEGIN
  SELECT departement, ville, claimed, raison_sociale, nom_commercial, categorie
  INTO v_pro
  FROM public.pros_sanitaire
  WHERE id = NEW.pro_id;

  -- Filtre 1 (NOUVEAU) : uniquement les taxis. VSL et ambulance ne déclenchent jamais le bridge.
  IF v_pro.categorie != 'taxi_conventionne' THEN
    RETURN NEW;
  END IF;

  -- Filtre 2 (CONSERVÉ) : si fiche claimed, on respecte l'exclusivité, pas de fan-out TCP.
  IF v_pro.claimed IS TRUE THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'sanitaire_messages' THEN
    v_nom_passager := NEW.sender_name;
    v_telephone    := COALESCE(NEW.sender_phone, '');
    v_email        := NEW.sender_email;
    v_message      := NEW.content;
    v_source       := 'roulepro';
  ELSIF TG_TABLE_NAME = 'callback_requests' THEN
    v_nom_passager := NEW.visitor_name;
    v_telephone    := NEW.visitor_phone;
    v_email        := NULL;
    v_message      := NEW.visitor_message;
    v_source       := 'roulepro';
  END IF;

  v_groupe_id := gen_random_uuid();

  FOR v_chauffeur IN
    SELECT id FROM tcp.chauffeurs
    WHERE departement = v_pro.departement
      AND is_conventionne_cpam = true
      AND page_publique_active = true
  LOOP
    INSERT INTO tcp.reservations (
      chauffeur_id, nom_passager, telephone_passager, email_passager,
      adresse_depart, adresse_arrivee, date_souhaitee, nb_passagers,
      message, statut, source, groupe_id
    ) VALUES (
      v_chauffeur.id, v_nom_passager, v_telephone, v_email,
      COALESCE(v_pro.ville, 'Non précisé'), 'À préciser',
      NOW() + INTERVAL '2 hours', 1,
      COALESCE(v_message, '') || E'\n[Fiche RoullePro : ' || COALESCE(v_pro.nom_commercial, v_pro.raison_sociale, 'Inconnu') || ']',
      'en_attente', v_source, v_groupe_id
    );
  END LOOP;

  RETURN NEW;
END;
$$;
```

Changements vs version actuelle :
- Ajout du filtre `IF v_pro.categorie != 'taxi_conventionne' THEN RETURN NEW;` → VSL et ambulance jamais bridged
- `categorie` ajouté au SELECT initial
- Le filtre claimed reste inchangé → exclusivité commerciale des pros taxi claimed préservée

Impact rétroactif : aucun, les anciennes données ne sont pas relues. Côté pros taxi claimed, aucun changement de comportement (ils gardent leur exclusivité). Côté pros VSL et ambulance non claimed, ils ne déclenchent plus le bridge (anomalie corrigée — ils ne devraient jamais l'avoir déclenché).

### B6. Templates emails Resend (3 templates)

À créer dans `src/lib/email-templates/` :

1. `demande-transport-pro.tsx` — envoyé aux pros RoullePro avec email_public
   - Sujet : `Nouvelle demande de [type] vers [destination]`
   - Corps : tous les détails du formulaire + CTA "Répondre à la demande" → `/transport-medical/pro/messages`
   - Footer : "Cette demande a été envoyée à X pros de votre zone"

2. `demande-transport-fallback.tsx` — envoyé à contact@roullepro.com en fallback
   - Sujet : `[Lead orphelin VSL/Ambulance] [ville]`
   - Corps : tous les détails + raison du fallback (aucun pro avec email_public)

3. `demande-transport-confirmation.tsx` — envoyé au demandeur (le patient)
   - Sujet : `Votre demande de transport a été envoyée`
   - Corps : récap + délais attendus + numéro service réclamation 06 15 47 28 13

---

## 4. Chantier C — Home avec formulaire de conversion

### Objectif

Transformer la home actuelle (annuaire orienté search) en double porte d'entrée : annuaire + plateforme de réservation. Le but est de capter les visiteurs avec une intention d'action directe.

### C1. Modification de `src/app/page.tsx`

**Ne pas remplacer** le `<SearchHero variant="hero" />` actuel. Ajouter une section juste en-dessous :

```tsx
<section className="bg-white border-b border-gray-100">
  <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
    <div className="text-center mb-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
        Ou réservez directement votre transport en 1 minute
      </h2>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Choisissez votre type de transport, indiquez le trajet et la date :
        nous transmettons votre demande aux professionnels disponibles dans votre zone.
      </p>
    </div>
    <DemandeTransportForm variant="home" />
  </div>
</section>
```

Position dans la home : entre le hero (avec SearchHero) et la section "Quel type de transport vous faut-il ?" → pas de cannibalisation entre les deux, intention différente.

### C2. Ajustements visuels

- La section "Quel type de transport vous faut-il" actuelle (3 CategorieCard) reste mais devient post-formulaire (rôle d'éducation / découverte)
- Le SearchHero conserve sa place pour les visiteurs qui veulent juste consulter l'annuaire
- Tracking GA4 : event `home_form_submit` avec param `type_transport`

### C3. Variantes A/B (optionnel mais recommandé)

Tester deux libellés H2 sur la section nouvelle :
- A : "Ou réservez directement votre transport en 1 minute"
- B : "Besoin d'un transport ? Faites-vous rappeler en moins d'une heure"

Plateforme : composant + cookie 50/50 + event GA4 distinct. Sortir le gagnant après 1 000 vues / variante.

### C4. Mention légale RGPD sous le formulaire

```
En envoyant cette demande, vous acceptez que vos coordonnées soient transmises
aux professionnels de transport sanitaire conventionnés CPAM de votre zone,
dans le seul but de traiter votre demande. Conservation 12 mois. Suppression
sur demande à contact@roullepro.com.
```

---

## 5. Modifications base de données (récapitulatif unique)

À exécuter dans cet ordre, dans une migration unique ou découpée par chantier.

### Nouvelles tables
- `etablissements_sante` + index + RLS + vue publique (Chantier A)
- `demandes_transport` + index + RLS (Chantier B)

### Nouvelles fonctions
- `pros_proches_etablissement(...)` (Chantier B, helper de matching géo)

### Fonctions modifiées
- `bridge_roulepro_to_tcp()` : suppression du filtre claimed + ajout du filtre categorie (Chantier B)

### Aucune migration sur tables existantes
- `pros_sanitaire`, `sanitaire_messages`, `callback_requests`, `pros_sanitaire_public` → intacts
- `tcp.*` → intact

---

## 6. Sécurité, RGPD, anti-spam

### Anti-spam (côté endpoint `/api/demande-transport`)
- Honeypot caché obligatoire
- Rate limit 5 requêtes / 15 min par IP (via Upstash Redis si dispo, sinon table SQL avec TTL)
- Validation Zod stricte de tous les champs
- Refus si `telephone.replace(/\D/g,'').length < 9`
- Refus si `nom.trim().length < 2`

### RGPD
- Mention légale obligatoire sous chaque formulaire (Chantier C4)
- `ip_hash` stocké en SHA-256 + sel (pas l'IP brute)
- Politique de rétention 12 mois sur `demandes_transport`, suppression auto via pg_cron
- Bouton de suppression depuis page `/mes-demandes` accessible par lien temporaire dans l'email de confirmation

### Données établissements FINESS
- Footer obligatoire sur chaque fiche : "Données issues du fichier FINESS (Ministère de la Santé) publiées sous Licence Ouverte 2.0. Dernière mise à jour : [date]"
- Pas de notation / avis utilisateur sur les fiches établissements (pas notre métier)
- Bouton "Signaler une erreur sur cette fiche" → email contact@roullepro.com

### Stripe et abonnements
- Aucune modification touchant Stripe dans ces chantiers
- Le bouton CTA chauffeur sur les pages "transport vers" pointe vers `/inscription` (parcours existant) → pas de risque

---

## 7. Ordre d'exécution recommandé

### Étape 0 — Préparation (1 jour)
- Validation finale de ce document avec Lucas
- Création d'une branche `feat/finess-formulaires` sur GitHub
- Sauvegarde Supabase complète avant migrations

### Sprint 1 — Chantier A.1 à A.5 (4 jours)
- Migration SQL : table `etablissements_sante`, RLS, vue
- Script `scripts/import-finess.ts`
- Import initial des ~15-20k établissements
- Cron de MAJ mensuel

### Sprint 2 — Chantier A.6 et A.7 (3 jours)
- Routes Next.js `/etablissements/*` (4 routes)
- Sitemap (2 nouveaux builders)
- Tests d'indexation Google sur 10 fiches

### Sprint 3 — Chantier B (5 jours)
- Migration SQL : `demandes_transport`, `pros_proches_etablissement`, modif `bridge_roulepro_to_tcp`
- Endpoint `/api/demande-transport`
- Composant `<DemandeTransportForm>`
- 3 templates Resend
- Tests E2E des 6 scénarios de routage (3 types × claimed/non-claimed)

### Sprint 4 — Chantier A.6 dernière route + Chantier C (3 jours)
- Route `/transport-medical/vers/[etablissement-slug]` (la page money)
- Intégration `<DemandeTransportForm variant="etablissement">`
- Modification home + intégration `<DemandeTransportForm variant="home">`
- Tracking GA4

### Sprint 5 — Polish (2 jours)
- Refonte FAQ et JSON-LD sur pages établissements
- Vérification des sitemaps en condition réelle (Google Search Console)
- Documentation interne dans `/docs/finess-import.md`

Total : ~18 jours de dev répartis sur 4 semaines calendaires.

---

## 8. Annexes — éléments existants à réutiliser

### Composants à réutiliser tel quel
- `<SearchHero>` (src/components/sanitaire/SearchHero.tsx) → conservé sur la home
- `<NearbyCities>` (à confirmer du chemin exact) → sur les pages établissement et "transport vers"
- `<OpenStatusBadge>` (idem)
- `<AmeliBadge>` → sur les pros mis en avant dans "transport vers"

### Patterns à réutiliser
- `sanitaire-seo.ts` (sanitaire-ville-seo.ts, sanitaire-departement-seo.ts) → générer les blocs FAQ et JSON-LD des pages établissement
- `getProStats()` (src/lib/stats.ts) → pour ajouter `etablissementsCount` au compteur home
- Patterns email Resend du fichier `src/app/api/sanitaire/message/route.ts` (Pro vs Free) → adaptés pour les 3 templates `demande-transport-*`

### Conventions de code à respecter
- Slug : `slugify(text, { lower: true, strict: true, locale: 'fr' })` (pareil que pros existants)
- Dates en `timestamptz`, pas `timestamp`
- ISR par défaut `revalidate = 86400`, hot pages à `3600`
- Pas de console.log en prod, utiliser le helper logger existant (à confirmer)

### Fichiers à ne PAS toucher (règles absolues)
- Fiche dpt 73 d'Etienne PETIT id `4275105a-4d45-46fd-9012-6701f1c9ea81`
- `src/lib/stripe.ts` et tout ce qui touche aux prix (price_id Pro `price_1TPTHrJQRPoIacwzO3PxAv8M`, TCP Solo `price_1ThR52JQRPoIacwzwqsXusLv`, RoullePro Pro Sanitaire `price_1TZFdwJQRPoIacwzQ4zPEYLF`)
- Sitemap chunks 0 à 81 (les 80 SANITAIRE_FICHES_CHUNKS) — on rajoute, on ne remplace pas
- Vue `pros_sanitaire_public` — ne pas modifier

---

## Validation finale attendue de Lucas avant lancement

1. OK matrice de routage (chapitre 1)
2. OK liste des catégories FINESS à inclure (chapitre A4)
3. OK rayon de 30 km autour de l'établissement pour le matching pros (Chantier B)
4. OK ordre des sprints (chapitre 7)
5. OK mention RGPD (Chantier C4)

Si une de ces validations est non, on ajuste ce document avant tout commit.
