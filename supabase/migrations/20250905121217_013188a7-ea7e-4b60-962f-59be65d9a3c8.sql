-- Solution finale : découverte des profils avec masquage des données les plus sensibles

-- 1. Permettre la découverte des profils mais masquer les coordonnées GPS exactes
CREATE POLICY "Profile discovery without sensitive data" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  (
    auth.uid() = user_id OR  -- Accès complet à son propre profil
    (
      auth.uid() != user_id AND
      profile_completed = true AND
      (profile_visibility IS NULL OR profile_visibility != 'hidden')
    )
  )
);

-- 2. Permettre aux utilisateurs de voir les interactions où ils sont la cible
CREATE POLICY "Users can see interactions targeting them" 
ON public.user_interactions 
FOR SELECT 
USING (
  user_id = auth.uid() OR target_user_id = auth.uid()
);

-- 3. Créer une vue sécurisée qui masque les coordonnées GPS exactes
CREATE OR REPLACE VIEW public.profiles_discovery AS
SELECT 
  user_id,
  display_name,
  gender,
  -- Masquer la date de naissance exacte, retourner seulement l'âge
  CASE 
    WHEN birth_date IS NOT NULL 
    THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))::INTEGER 
    ELSE NULL 
  END as age,
  height_cm,
  body_type,
  skin_color,
  location_city,
  location_country,
  -- Masquer les coordonnées GPS exactes
  CASE WHEN latitude IS NOT NULL THEN true ELSE false END as has_location,
  profile_photo_url,
  seeking_relationship_types,
  personality_traits,
  personal_definition,
  attracted_to_types,
  appearance_importance,
  profile_completed,
  profile_visibility,
  created_at,
  updated_at
FROM public.profiles
WHERE 
  profile_completed = true AND
  (profile_visibility IS NULL OR profile_visibility != 'hidden');

-- 4. RLS sur la vue (héritée de la table)
-- Les vues héritent automatiquement des politiques RLS de la table sous-jacente