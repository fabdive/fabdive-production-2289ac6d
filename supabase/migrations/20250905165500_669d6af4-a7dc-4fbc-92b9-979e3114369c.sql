-- Remove the overly permissive policy that exposes sensitive data
DROP POLICY IF EXISTS "Users can view completed profiles for matching" ON public.profiles;

-- Create secure matching function that only returns essential data
CREATE OR REPLACE FUNCTION public.get_safe_matching_profiles(max_distance_km numeric DEFAULT 50)
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
  distance_km numeric,
  profile_photo_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_lat numeric;
  current_user_lon numeric;
BEGIN
  -- Get current user's location
  SELECT latitude, longitude 
  INTO current_user_lat, current_user_lon
  FROM profiles 
  WHERE profiles.user_id = auth.uid();
  
  -- Return safe profile data without exposing precise coordinates
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
    public.calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) as distance_km,
    p.profile_photo_url
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