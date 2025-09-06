-- Corriger l'alerte "Dating Profiles Exposed to All Users"
-- Supprimer complètement l'accès direct aux profils d'autres utilisateurs

-- 1. Supprimer la politique qui expose encore trop de données
DROP POLICY IF EXISTS "Limited profile discovery for matching" ON public.profiles;

-- 2. Les utilisateurs ne peuvent accéder aux autres profils QUE via les fonctions sécurisées
-- Aucune politique SELECT pour les autres profils = aucun accès direct

-- 3. Améliorer la fonction get_matching_profiles pour être encore plus restrictive
-- Limiter le nombre de profils retournés et masquer certaines données sensibles
CREATE OR REPLACE FUNCTION public.get_matching_profiles(max_distance_km numeric DEFAULT 50)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  gender text,
  age integer,
  height_cm integer,
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
  
  -- Vérifier que l'utilisateur a un profil complet
  IF current_user_lat IS NULL OR current_user_lon IS NULL THEN
    RETURN;
  END IF;
  
  -- Retourner SEULEMENT les données essentielles pour le matching
  -- Masquer les données sensibles comme skin_color, coordonnées exactes
  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    p.gender,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date))::INTEGER as age,
    p.height_cm,
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
  ORDER BY distance_km ASC
  LIMIT 50; -- Limiter à 50 profils maximum
END;
$$;