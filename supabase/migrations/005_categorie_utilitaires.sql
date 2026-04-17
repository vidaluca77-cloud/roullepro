-- MIGRATION 005 — Ajout catégorie Véhicules utilitaires
-- Date: 2026-04-17
-- Déjà appliquée en production via execute_sql

INSERT INTO public.categories (name, slug, sort_order)
VALUES ('Véhicules utilitaires', 'utilitaire', 7)
ON CONFLICT (slug) DO NOTHING;
