-- Ajustement de sécurité : limiter l'accès aux utilisateurs authentifiés seulement

-- Supprimer la politique trop permissive
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Créer une politique qui limite aux utilisateurs authentifiés
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);