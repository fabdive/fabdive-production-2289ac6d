-- Ajouter une politique pour permettre la découverte des profils entre utilisateurs
-- Les utilisateurs peuvent voir les profils des autres utilisateurs actifs et visibles
CREATE POLICY "Users can discover other profiles for matching" 
ON public.profiles 
FOR SELECT 
USING (
  -- L'utilisateur peut voir les profils des autres si :
  user_id != auth.uid() AND -- Ce n'est pas son propre profil
  profile_completed = true AND -- Le profil est complété
  (profile_visibility IS NULL OR profile_visibility != 'hidden') -- Le profil n'est pas caché
);

-- Ajouter une politique pour permettre la découverte des préférences des autres utilisateurs
-- (nécessaire pour l'algorithme de matching)
CREATE POLICY "Users can view preferences for matching" 
ON public.user_preferences 
FOR SELECT 
USING (
  user_id IN (
    SELECT p.user_id 
    FROM profiles p 
    WHERE p.user_id != auth.uid() 
    AND p.profile_completed = true 
    AND (p.profile_visibility IS NULL OR p.profile_visibility != 'hidden')
  )
);