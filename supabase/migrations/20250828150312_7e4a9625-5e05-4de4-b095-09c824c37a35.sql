-- Create SQL function for finding matches by distance
CREATE OR REPLACE FUNCTION public.find_matches_by_distance(
  user_lat DECIMAL,
  user_lon DECIMAL,
  max_distance DECIMAL,
  current_user_id UUID,
  preferred_age_min INTEGER DEFAULT 18,
  preferred_age_max INTEGER DEFAULT 99,
  preferred_genders TEXT[] DEFAULT '{}'
) RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  age INTEGER,
  gender TEXT,
  distance_km DECIMAL,
  latitude DECIMAL,
  longitude DECIMAL,
  skin_color TEXT,
  body_type TEXT,
  height_cm INTEGER
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
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date))::INTEGER as age,
    p.gender,
    public.calculate_distance(user_lat, user_lon, p.latitude, p.longitude) as distance_km,
    p.latitude,
    p.longitude,
    p.skin_color,
    p.body_type,
    p.height_cm
  FROM profiles p
  WHERE 
    p.user_id != current_user_id
    AND p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND p.birth_date IS NOT NULL
    AND public.calculate_distance(user_lat, user_lon, p.latitude, p.longitude) <= max_distance
    AND (
      array_length(preferred_genders, 1) IS NULL 
      OR preferred_genders = '{}' 
      OR p.gender = ANY(preferred_genders)
    )
    AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) BETWEEN preferred_age_min AND preferred_age_max
  ORDER BY distance_km ASC;
END;
$$;