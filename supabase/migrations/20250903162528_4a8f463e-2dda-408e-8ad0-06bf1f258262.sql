-- D'abord, vérifier et supprimer toutes les politiques existantes sur profiles
DROP POLICY IF EXISTS "Restricted profile data for matching" ON public.profiles;
DROP POLICY IF EXISTS "Users can view basic matching data only" ON public.profiles;

-- Créer une politique très restrictive qui bloque l'accès direct aux données sensibles
CREATE POLICY "No direct profile access for others" 
ON public.profiles 
FOR SELECT 
USING (
  -- Seul le propriétaire peut voir son propre profil complet
  auth.uid() = user_id
);

-- La fonction get_matching_profiles sera le seul moyen sécurisé d'accéder aux données de matching
-- Elle existe déjà et utilise SECURITY DEFINER pour contourner RLS de manière contrôlée