-- MIGRATION 008 — Alertes email par catégorie
-- Date: 2026-04-17 — déjà appliquée en production

CREATE TABLE IF NOT EXISTS public.alertes_categories (
  id           uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id  uuid REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  created_at   timestamptz DEFAULT now(),
  UNIQUE (user_id, category_id)
);

ALTER TABLE public.alertes_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alertes_select_own" ON public.alertes_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "alertes_insert_own" ON public.alertes_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "alertes_delete_own" ON public.alertes_categories
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_alertes_category_id ON public.alertes_categories(category_id);
