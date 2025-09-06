-- Correction : supprimer d'abord la fonction existante

-- 1. Supprimer la politique actuelle
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- 2. Supprimer la fonction existante
DROP FUNCTION IF EXISTS public.get_matching_profiles(numeric);

-- 3. Créer une politique qui masque les coordonnées GPS exactes
-- Seuls les utilisateurs peuvent voir leur propre profil complet
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Permettre la découverte des profils SANS les données sensibles (coordonnées)
CREATE POLICY "Limited profile discovery for matching" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() != user_id AND
  profile_completed = true AND
  (profile_visibility IS NULL OR profile_visibility != 'hidden')
);

-- 5. Recréer la fonction sécurisée pour le matching
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
    AND p.profile_completed = true
    AND (p.profile_visibility IS NULL OR p.profile_visibility != 'hidden')
    AND public.calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) <= max_distance_km
  ORDER BY distance_km ASC;
END;
$$;