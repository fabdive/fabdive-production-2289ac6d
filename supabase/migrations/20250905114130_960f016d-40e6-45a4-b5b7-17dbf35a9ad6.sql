-- Corrections de sécurité radicales - éliminer complètement l'accès direct aux données sensibles

-- 1. Supprimer la politique trop permissive qui expose encore les données
DROP POLICY IF EXISTS "Limited profile discovery for matching" ON public.profiles;

-- 2. Ne garder que les politiques pour l'accès à son propre profil
-- Les autres profils ne seront accessibles QUE via les fonctions sécurisées

-- 3. Supprimer complètement l'accès direct aux crushes
DROP POLICY IF EXISTS "Users can view their own sent crushes" ON public.crushes;
DROP POLICY IF EXISTS "Users can update their own crushes" ON public.crushes;

-- Créer des politiques crushes qui ne permettent que les opérations essentielles
CREATE POLICY "Allow crushes creation" 
ON public.crushes 
FOR INSERT 
WITH CHECK (auth.uid() = sender_user_id OR (auth.jwt() ->> 'role') = 'service_role');

-- Aucune lecture directe des crushes - seulement via la fonction get_user_crushes

-- 4. Modifier get_anonymized_profiles pour être encore plus restrictif
CREATE OR REPLACE FUNCTION public.get_anonymized_profiles()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  gender text,
  age_range text,
  height_category text,
  body_type text,
  skin_color text,
  location_country text, -- Seulement le pays, pas la ville
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
    p.location_country, -- Pas de ville ni coordonnées
    p.profile_photo_url
  FROM profiles p
  WHERE 
    p.user_id != auth.uid() AND
    p.profile_completed = true AND
    (p.profile_visibility IS NULL OR p.profile_visibility != 'hidden');
END;
$$;

-- 5. Modifier get_matching_profiles pour masquer les coordonnées exactes
CREATE OR REPLACE FUNCTION public.get_matching_profiles(max_distance_km numeric DEFAULT 50)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  gender text,
  age integer,
  height_cm integer,
  skin_color text,
  body_type text,
  location_city text,
  location_country text,
  distance_km numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_lat numeric;
  current_user_lon numeric;
BEGIN
  -- Récupérer les coordonnées de l'utilisateur courant
  SELECT latitude, longitude 
  INTO current_user_lat, current_user_lon
  FROM profiles 
  WHERE profiles.user_id = auth.uid();
  
  -- Retourner les profils de matching sans exposer les coordonnées exactes
  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    p.gender,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date))::INTEGER as age,
    p.height_cm,
    p.skin_color,
    p.body_type,
    p.location_city,
    p.location_country,
    public.calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) as distance_km
  FROM profiles p
  WHERE 
    p.user_id != auth.uid()
    AND p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND p.birth_date IS NOT NULL
    AND public.calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) <= max_distance_km
  ORDER BY distance_km ASC;
END;
$$;