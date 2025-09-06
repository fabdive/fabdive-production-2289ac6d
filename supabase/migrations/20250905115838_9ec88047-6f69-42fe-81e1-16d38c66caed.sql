-- Suppression DÉFINITIVE de l'exposition des profils
-- Seules les fonctions sécurisées permettront l'accès aux autres profils

-- 1. Supprimer complètement la politique qui expose encore les profils
DROP POLICY IF EXISTS "Minimal profile discovery for matching" ON public.profiles;

-- 2. Ajouter les politiques manquantes pour les crushes
CREATE POLICY "Users can delete their own crushes" 
ON public.crushes 
FOR DELETE 
USING (auth.uid() = sender_user_id);

-- 3. Créer une fonction ultra-sécurisée pour le matching qui ne retourne que le strict minimum
CREATE OR REPLACE FUNCTION public.get_nearby_matches(max_distance_km numeric DEFAULT 50)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  age_range text,
  distance_range text,
  has_photo boolean
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
  
  -- Retourner SEULEMENT des données très générales
  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    -- Âge par tranche large
    CASE 
      WHEN p.birth_date IS NOT NULL THEN
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) < 30 THEN '18-30'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) < 40 THEN '30-40'
          ELSE '40+'
        END
      ELSE 'Non spécifié' 
    END as age_range,
    -- Distance par tranche
    CASE 
      WHEN public.calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) < 10 THEN 'Proche (< 10km)'
      WHEN public.calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) < 50 THEN 'Modéré (< 50km)'
      ELSE 'Loin (> 50km)'
    END as distance_range,
    -- Simple indicateur photo
    CASE WHEN p.profile_photo_url IS NOT NULL THEN true ELSE false END as has_photo
  FROM profiles p
  WHERE 
    p.user_id != auth.uid()
    AND p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND p.birth_date IS NOT NULL
    AND p.profile_completed = true
    AND (p.profile_visibility IS NULL OR p.profile_visibility != 'hidden')
    AND public.calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) <= max_distance_km
  ORDER BY public.calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) ASC
  LIMIT 20;
END;
$$;