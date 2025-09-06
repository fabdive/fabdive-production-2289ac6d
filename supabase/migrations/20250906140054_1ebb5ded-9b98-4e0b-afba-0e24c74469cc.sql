-- Drop all existing policies first
DROP POLICY IF EXISTS "Allow viewing profiles for matching" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own crushes" ON public.crushes;
DROP POLICY IF EXISTS "Users can send crushes" ON public.crushes;

-- Create balanced policies that allow matching while protecting sensitive data
CREATE POLICY "Allow viewing profiles for matching" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR  -- Users can see their own profile completely
  (
    profile_completed = true AND 
    (profile_visibility IS NULL OR profile_visibility != 'hidden')
  )
);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "View own crushes" 
ON public.crushes 
FOR SELECT 
USING (auth.uid() = sender_user_id);

CREATE POLICY "Send crushes" 
ON public.crushes 
FOR INSERT 
WITH CHECK (auth.uid() = sender_user_id);

-- Create safe matching function
CREATE OR REPLACE FUNCTION public.get_safe_matches(max_distance_km numeric DEFAULT 50)
RETURNS TABLE(
  user_id uuid,
  display_name text,
  age integer,
  gender text,
  skin_color text,
  body_type text,
  height_cm integer,
  location_city text,
  location_country text,
  distance_range text,
  profile_photo_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
As $function$
DECLARE
  current_user_lat numeric;
  current_user_lon numeric;
BEGIN
  -- Get current user's location
  SELECT latitude, longitude 
  INTO current_user_lat, current_user_lon
  FROM profiles 
  WHERE profiles.user_id = auth.uid();
  
  -- Return profiles with distance ranges instead of exact distances
  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date))::INTEGER as age,
    p.gender,
    p.skin_color,
    p.body_type,
    p.height_cm,
    p.location_city,
    p.location_country,
    -- Return distance ranges for privacy
    CASE 
      WHEN calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) < 5 THEN 'Très proche (< 5km)'
      WHEN calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) < 15 THEN 'Proche (< 15km)'
      WHEN calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) < 50 THEN 'Modéré (< 50km)'
      ELSE 'Loin (> 50km)'
    END as distance_range,
    p.profile_photo_url
  FROM profiles p
  WHERE 
    p.user_id != auth.uid()
    AND p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND p.birth_date IS NOT NULL
    AND p.profile_completed = true
    AND (p.profile_visibility IS NULL OR p.profile_visibility != 'hidden')
    AND calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) <= max_distance_km
  ORDER BY calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) ASC
  LIMIT 20;
END;
$function$;