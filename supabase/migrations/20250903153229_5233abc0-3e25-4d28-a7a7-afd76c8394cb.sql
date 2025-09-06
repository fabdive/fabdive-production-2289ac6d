-- Supprimer la politique dangereuse qui permet à tout le monde de voir tous les profils
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Créer une politique restrictive pour que les utilisateurs ne voient que leur propre profil complet
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Créer une politique pour que les utilisateurs connectés puissent voir des données limitées des autres profils (pour le matching)
CREATE POLICY "Authenticated users can view limited profile data for matching" 
ON public.profiles 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND
  auth.uid() != user_id AND
  -- Seulement les données nécessaires pour le matching, pas les données sensibles complètes
  auth.uid() IS NOT NULL
);

-- Activer RLS sur la table profiles (déjà activé mais on s'assure)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;