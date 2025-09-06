-- Élimination DÉFINITIVE de l'erreur pour permettre le déploiement
-- Supprimer complètement la découverte directe, utiliser SEULEMENT les fonctions sécurisées

-- 1. Supprimer la politique qui expose encore les profils
DROP POLICY IF EXISTS "Limited profile discovery for matching" ON public.profiles;

-- 2. Maintenir SEULEMENT l'accès personnel aux profils
-- La découverte se fera via les fonctions sécurisées uniquement

-- 3. Créer une fonction encore plus restrictive pour la découverte
DROP FUNCTION IF EXISTS public.get_anonymized_profiles();

CREATE OR REPLACE FUNCTION public.get_anonymized_profiles()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  gender text,
  age_range text,
  height_category text,
  body_type text,
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
    p.location_country, -- Seulement le pays, pas les coordonnées
    p.profile_photo_url
  FROM profiles p
  WHERE 
    p.user_id != auth.uid() AND
    p.profile_completed = true AND
    (p.profile_visibility IS NULL OR p.profile_visibility != 'hidden');
END;
$$;