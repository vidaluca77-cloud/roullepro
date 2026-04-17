-- Migration 004 : Modération annonces
-- 1. Passer le DEFAULT status à 'pending' pour les nouvelles annonces
-- 2. Ajouter policy RLS permettant à un admin de voir TOUTES les annonces
-- 3. Ajouter policy permettant au propriétaire de voir SES annonces (même pending)

-- 1. Default status = pending
ALTER TABLE annonces ALTER COLUMN status SET DEFAULT 'pending';

-- 2. Policy admin : peut voir toutes les annonces (y compris pending/rejected)
DROP POLICY IF EXISTS annonces_select_admin ON annonces;
CREATE POLICY annonces_select_admin ON annonces
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 3. Policy propriétaire : peut voir ses propres annonces quel que soit le statut
DROP POLICY IF EXISTS annonces_select_owner ON annonces;
CREATE POLICY annonces_select_owner ON annonces
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Policy mise à jour admin : peut changer le status
DROP POLICY IF EXISTS annonces_update_admin ON annonces;
CREATE POLICY annonces_update_admin ON annonces
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 5. Policy suppression admin
DROP POLICY IF EXISTS annonces_delete_admin ON annonces;
CREATE POLICY annonces_delete_admin ON annonces
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
