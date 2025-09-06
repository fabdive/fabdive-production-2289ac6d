-- RESTORATION DE LA CONFIGURATION DE PRODUCTION QUI FONCTIONNAIT

-- 1. Supprimer TOUTES les politiques actuelles pour recommencer proprement
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Minimal profile discovery for matching" ON public.profiles;
DROP POLICY IF EXISTS "Limited profile discovery for matching" ON public.profiles;

DROP POLICY IF EXISTS "Restricted user preferences access" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.user_preferences;

DROP POLICY IF EXISTS "Users can view their own sent crushes" ON public.crushes;
DROP POLICY IF EXISTS "Allow crushes creation" ON public.crushes;
DROP POLICY IF EXISTS "Users can update their own crushes" ON public.crushes;
DROP POLICY IF EXISTS "Users can delete their own crushes" ON public.crushes;

-- 2. RESTAURER LES POLITIQUES DE PRODUCTION QUI FONCTIONNAIENT

-- PROFILES - Configuration de production
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- USER_PREFERENCES - Configuration de production
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (user_id IN (
  SELECT profiles.user_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT profiles.user_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (user_id IN (
  SELECT profiles.user_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own preferences" 
ON public.user_preferences 
FOR DELETE 
USING (user_id IN (
  SELECT profiles.user_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

-- CRUSHES - Configuration de production
CREATE POLICY "Users can view their own sent crushes" 
ON public.crushes 
FOR SELECT 
USING (auth.uid() = sender_user_id);

CREATE POLICY "Allow crushes creation" 
ON public.crushes 
FOR INSERT 
WITH CHECK ((auth.uid() = sender_user_id) OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text));

CREATE POLICY "Users can update their own crushes" 
ON public.crushes 
FOR UPDATE 
USING (auth.uid() = sender_user_id);

-- 3. S'assurer que les tables user_interactions ont les bonnes politiques
-- (Cette table n'était pas dans la prod mais était créée par mes modifications)
DROP POLICY IF EXISTS "Users can manage their own interactions" ON public.user_interactions;

CREATE POLICY "Users can manage their own interactions" 
ON public.user_interactions 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());