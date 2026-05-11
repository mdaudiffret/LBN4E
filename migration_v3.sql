-- ── Migration v3 : last_seen + RLS permissif pour dashboard ─────────

-- Colonne last_seen sur users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;

-- Permettre à tout le monde de lire tous les utilisateurs (leaderboard + dashboard)
DROP POLICY IF EXISTS "Allow read all users" ON public.users;
CREATE POLICY "Allow read all users" ON public.users
  FOR SELECT USING (true);

-- Permettre à tout le monde de lire tous les user_codes (dashboard)
DROP POLICY IF EXISTS "Allow read all user_codes" ON public.user_codes;
CREATE POLICY "Allow read all user_codes" ON public.user_codes
  FOR SELECT USING (true);

-- Permettre la mise à jour de last_seen (et autres champs) sur users
DROP POLICY IF EXISTS "Allow update own user" ON public.users;
CREATE POLICY "Allow update own user" ON public.users
  FOR UPDATE USING (true);

-- Permettre l'insertion d'un nouvel utilisateur
DROP POLICY IF EXISTS "Allow insert user" ON public.users;
CREATE POLICY "Allow insert user" ON public.users
  FOR INSERT WITH CHECK (true);
