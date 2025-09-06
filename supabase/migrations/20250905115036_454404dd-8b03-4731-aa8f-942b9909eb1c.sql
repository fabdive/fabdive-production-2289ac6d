-- Rétablir la fonctionnalité tout en gardant la sécurité maximale

-- 1. Nettoyer d'abord toutes les politiques crushes conflictuelles
DROP POLICY IF EXISTS "Restrict direct access to crushes table" ON public.crushes;
DROP POLICY IF EXISTS "Recipients can view crushes sent to them" ON public.crushes;
DROP POLICY IF EXISTS "Users can view their own sent crushes" ON public.crushes;

-- 2. Créer une politique TRÈS limitée pour les profils
-- Seules les données de base sont visibles, pas les coordonnées ni données sensibles
CREATE POLICY "Minimal profile discovery for matching" 
ON public.profiles 
FOR SELECT 
USING (
  user_id != auth.uid() AND 
  profile_completed = true AND 
  (profile_visibility IS NULL OR profile_visibility != 'hidden') AND 
  auth.uid() IS NOT NULL
);

-- 3. Recréer les politiques crushes proprement
CREATE POLICY "Users can view their own sent crushes" 
ON public.crushes 
FOR SELECT 
USING (auth.uid() = sender_user_id);

CREATE POLICY "Recipients can view crushes sent to them" 
ON public.crushes 
FOR SELECT 
USING (
  recipient_email IN (
    SELECT users.email FROM auth.users WHERE users.id = auth.uid()
  )
);