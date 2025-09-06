-- Corriger les problèmes de sécurité restants (version corrigée)

-- 1. Supprimer la politique trop permissive pour les profils si elle existe
DROP POLICY IF EXISTS "Limited profile discovery for matching" ON public.profiles;

-- 2. Sécuriser les crushes - masquer les emails sauf pour certains cas
-- Supprimer les politiques existantes qui exposent trop de données
DROP POLICY IF EXISTS "Recipients can view crushes sent to them" ON public.crushes;
DROP POLICY IF EXISTS "Crushes sender access only" ON public.crushes;

-- Recréer la politique pour les crushes avec un nouveau nom
CREATE POLICY "Users can view their own sent crushes only" 
ON public.crushes 
FOR SELECT 
USING (auth.uid() = sender_user_id);

-- 3. Créer une vue sécurisée pour les crushes qui masque les emails sensibles
CREATE OR REPLACE VIEW public.crushes_secure AS
SELECT 
  id,
  sender_user_id,
  CASE 
    WHEN sender_user_id = auth.uid() THEN recipient_email
    ELSE '***@***.**' -- Email masqué pour les autres
  END as recipient_email,
  email_sent,
  created_at,
  updated_at,
  -- Masquer email_id et error_message pour la sécurité
  NULL as email_id,
  CASE 
    WHEN sender_user_id = auth.uid() THEN error_message
    ELSE NULL
  END as error_message
FROM public.crushes;

-- 4. Ajouter des politiques pour empêcher l'accès direct à la table crushes
-- Forcer l'utilisation de la vue sécurisée
CREATE POLICY "Restrict direct access to crushes table" 
ON public.crushes 
FOR SELECT 
USING (false); -- Interdire l'accès direct

-- 5. Recréer une politique plus restrictive pour la découverte de profils
CREATE POLICY "Very limited profile discovery for matching" 
ON public.profiles 
FOR SELECT 
USING (
  user_id != auth.uid() AND 
  profile_completed = true AND 
  (profile_visibility IS NULL OR profile_visibility != 'hidden') AND 
  auth.uid() IS NOT NULL
);