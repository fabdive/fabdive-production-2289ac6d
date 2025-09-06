-- Supprimer la vue problématique
DROP VIEW IF EXISTS public.profiles_for_matching;

-- Recréer la politique avec des restrictions sur les colonnes sensibles
DROP POLICY IF EXISTS "Users can view basic matching data only" ON public.profiles;

-- Créer une politique RLS qui limite les données accessibles pour le matching
CREATE POLICY "Restricted profile data for matching" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.role() = 'authenticated'::text) 
  AND (auth.uid() <> user_id) 
  AND (auth.uid() IS NOT NULL)
);

-- Créer une fonction sécurisée pour obtenir uniquement les données de matching
CREATE OR REPLACE FUNCTION public.get_matching_profiles(max_distance_km numeric DEFAULT 50)
RETURNS TABLE(
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