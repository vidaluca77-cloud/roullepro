# Enrichissement téléphones — Worker autonome

Pipeline automatisé qui enrichit les numéros de téléphone manquants des fiches
`pros_sanitaire` (taxis conventionnés, ambulances, VSL) via l'API DataForSEO
Google My Business.

## Architecture

- **`enrich.py`** : worker Python qui lit `phone_enrichment_queue`, interroge
  DataForSEO, applique le matcher strict, met à jour `pros_sanitaire` ou
  enregistre un cas de review.
- **`matcher.py`** : logique de matching (catégorie, CP, score nom, distance).
- **`.github/workflows/phone-enrichment.yml`** : GitHub Action qui lance le
  worker toutes les heures (cron natif).
- **`claim_phone_enrichment_batch`** : fonction PostgreSQL côté Supabase qui
  réclame des fiches de façon atomique (FOR UPDATE SKIP LOCKED).

## Setup initial (à faire une seule fois)

### 1. Secrets GitHub Actions

Dans `Settings → Secrets and variables → Actions → New repository secret`,
ajouter :

| Nom | Valeur | Où la trouver |
|---|---|---|
| `DATAFORSEO_LOGIN` | Ton login DataForSEO | dashboard.dataforseo.com |
| `DATAFORSEO_PASSWORD` | Ton mot de passe API DataForSEO | dashboard.dataforseo.com |
| `SUPABASE_URL` | `https://ypgolzcibtjljfydxcun.supabase.co` | URL du projet |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service_role | Supabase → Settings → API |

### 2. Activation du workflow

Le workflow démarre automatiquement après le premier push si tous les secrets
sont configurés. Premier run à HH:05 de l'heure suivante.

## Lancement manuel

Onglet `Actions → Enrichissement téléphones RoullePro → Run workflow`.
Paramètres optionnels : `max_minutes` (défaut 50) et `batch_size` (défaut 100).

## Suivi en temps réel

- **Page admin** : https://roullepro.com/admin/enrichissement
- **Logs GitHub** : onglet Actions du repo
- **Stats SQL** :
  ```sql
  SELECT status, COUNT(*) FROM phone_enrichment_queue GROUP BY status;
  SELECT status, COUNT(*) FROM phone_enrichment_log GROUP BY status;
  ```

## Coûts

- DataForSEO : ~$0.0054 par fiche (~$84 pour 15 567 fiches)
- GitHub Actions : gratuit (2000 min/mois sur le plan gratuit)
- Supabase : inclus dans l'abonnement existant
- Crédits Perplexity : **0**

## Garde-fous

- Jamais d'UPDATE sur `pros_sanitaire` si `claimed=true`
- Exclusion permanente de l'ID `4275105a-4d45-46fd-9012-6701f1c9ea81`
  (Etienne PETIT, dept 73)
- Téléphone obligatoirement au format E.164 `+33[1-9]XXXXXXXX`
- Priorisation : VSL (1) → Taxis (2) → Ambulances (3)
- Lock atomique `FOR UPDATE SKIP LOCKED` empêche les collisions entre workers
