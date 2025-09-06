-- Supprimer les politiques trop permissives (si elles existent encore)
DROP POLICY IF EXISTS "Users can discover other profiles for matching" ON public.profiles;
DROP POLICY IF EXISTS "Users can view preferences for matching" ON public.user_preferences;

-- Créer une politique plus restrictive pour la découverte de profils
CREATE POLICY "Limited profile discovery for matching" 
ON public.profiles 
FOR SELECT 
USING (
  user_id != auth.uid() AND -- Pas son propre profil
  profile_completed = true AND -- Profil complété
  (profile_visibility IS NULL OR profile_visibility != 'hidden') AND -- Profil visible
  auth.uid() IS NOT NULL -- Utilisateur authentifié requis
);

-- Politique restrictive pour les préférences utilisateur
-- Seuls les utilisateurs peuvent voir leurs propres préférences complètes
CREATE POLICY "Restricted user preferences access" 
ON public.user_preferences 
FOR SELECT 
USING (user_id = auth.uid());

-- Créer une table pour les interactions de matching
CREATE TABLE IF NOT EXISTS public.user_interactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'like', 'dislike', 'match')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, target_user_id, interaction_type)
);

-- RLS pour les interactions
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own interactions" 
ON public.user_interactions 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Politique restrictive pour les crushes - seul l'expéditeur peut voir ses crushes
CREATE POLICY "Crushes sender access only" 
ON public.crushes 
FOR SELECT 
USING (sender_user_id = auth.uid());

-- Créer une fonction sécurisée pour obtenir des profils anonymisés
CREATE OR REPLACE FUNCTION public.get_anonymized_profiles()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  gender text,
  age_range text,
  height_category text,
  body_type text,
  skin_color text,
  location_country text,
  profile_photo_url text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    p.gender,
    -- Âge par tranche pour protéger la vie privée
    CASE 
      WHEN p.birth_date IS NOT NULL THEN
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) < 25 THEN '18-24'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) < 35 THEN '25-34'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) < 45 THEN '35-44'
          ELSE '45+'
        END
      ELSE NULL 
    END as age_range,
    -- Taille par catégorie
    CASE 
      WHEN p.height_cm IS NOT NULL THEN
        CASE 
          WHEN p.height_cm < 160 THEN 'petite'
          WHEN p.height_cm < 175 THEN 'moyenne'
          ELSE 'grande'
        END 
      ELSE NULL 
    END as height_category,
    p.body_type,
    p.skin_color,
    p.location_country,
    p.profile_photo_url
  FROM profiles p
  WHERE 
    p.user_id != auth.uid() AND
    p.profile_completed = true AND
    (p.profile_visibility IS NULL OR p.profile_visibility != 'hidden');
END;
$$;