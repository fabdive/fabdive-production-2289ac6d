-- SOLUTION DÉFINITIVE : Supprimer l'accès direct, utiliser SEULEMENT les fonctions sécurisées

-- 1. Supprimer la politique qui expose encore trop de données
DROP POLICY IF EXISTS "Profile discovery without sensitive data" ON public.profiles;

-- 2. Permettre SEULEMENT l'accès à son propre profil complet
-- La découverte des autres profils se fera EXCLUSIVEMENT via les fonctions sécurisées
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Modifier la politique des interactions pour être plus restrictive  
DROP POLICY IF EXISTS "Users can see interactions targeting them" ON public.user_interactions;

-- Seules les interactions mutuelles ou envoyées sont visibles
CREATE POLICY "Users can only see their own interactions and mutual matches" 
ON public.user_interactions 
FOR SELECT 
USING (user_id = auth.uid());

-- 4. Les fonctions sécurisées get_matching_profiles() et get_anonymized_profiles() 
-- restent disponibles pour la découverte contrôlée des profils