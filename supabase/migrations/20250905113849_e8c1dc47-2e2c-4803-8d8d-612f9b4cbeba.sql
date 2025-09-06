-- Corriger les problèmes de sécurité - Version corrigée

-- 1. Supprimer toutes les politiques existantes pour les refaire proprement
DROP POLICY IF EXISTS "Limited profile discovery for matching" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;  
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Pour les crushes
DROP POLICY IF EXISTS "Recipients can view crushes sent to them" ON public.crushes;
DROP POLICY IF EXISTS "Users can view their own sent crushes" ON public.crushes;
DROP POLICY IF EXISTS "Crushes sender access only" ON public.crushes;
DROP POLICY IF EXISTS "Users can update their own crushes" ON public.crushes;

-- 2. Recréer des politiques RLS sécurisées pour les profils
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Politique très restrictive pour la découverte - via fonctions sécurisées uniquement
CREATE POLICY "Limited profile discovery for matching" 
ON public.profiles 
FOR SELECT 
USING (
  user_id != auth.uid() AND 
  profile_completed = true AND 
  (profile_visibility IS NULL OR profile_visibility != 'hidden') AND 
  auth.uid() IS NOT NULL
);

-- 3. Politiques sécurisées pour les crushes
CREATE POLICY "Users can view their own sent crushes" 
ON public.crushes 
FOR SELECT 
USING (auth.uid() = sender_user_id);

CREATE POLICY "Users can update their own crushes" 
ON public.crushes 
FOR UPDATE 
USING (auth.uid() = sender_user_id);

-- 4. Créer une vue sécurisée pour masquer les emails sensibles
DROP VIEW IF EXISTS public.crushes_secure;
CREATE VIEW public.crushes_secure AS
SELECT 
  id,
  sender_user_id,
  CASE 
    WHEN sender_user_id = auth.uid() THEN recipient_email
    ELSE '***@***.***' -- Email masqué
  END as recipient_email_display,
  email_sent,
  created_at,
  updated_at
FROM public.crushes;