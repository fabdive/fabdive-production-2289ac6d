-- Version corrigée - supprimer d'abord les politiques existantes

-- 1. Supprimer TOUTES les politiques existantes pour les crushes
DROP POLICY IF EXISTS "Allow crushes creation" ON public.crushes;
DROP POLICY IF EXISTS "Users can view their own sent crushes" ON public.crushes;
DROP POLICY IF EXISTS "Users can update their own crushes" ON public.crushes;

-- 2. Supprimer la politique trop permissive pour les profils
DROP POLICY IF EXISTS "Limited profile discovery for matching" ON public.profiles;

-- 3. Recréer SEULEMENT la politique pour créer des crushes
CREATE POLICY "Allow crushes creation" 
ON public.crushes 
FOR INSERT 
WITH CHECK (auth.uid() = sender_user_id OR (auth.jwt() ->> 'role') = 'service_role');

-- Les crushes ne peuvent être lus que via la fonction get_user_crushes
-- Aucune politique SELECT directe

-- 4. Assurer qu'aucun accès direct aux autres profils n'est possible
-- Seuls les fonctions sécurisées permettent l'accès aux données de matching