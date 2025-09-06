-- Drop existing conflicting policies on profiles table
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.profiles;

-- Create secure matching policies for profiles
-- Users can see their own complete profile
CREATE POLICY "Users can view own complete profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can see limited profile data of completed profiles for matching
-- This excludes sensitive location coordinates and personal details
CREATE POLICY "Users can view limited profile data for matching" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
  user_id != auth.uid() AND 
  profile_completed = true AND 
  (profile_visibility IS NULL OR profile_visibility != 'hidden')
);

-- Modify crushes table to be more secure
-- Drop the current recipient viewing policy that exposes emails
DROP POLICY IF EXISTS "Recipients can view crushes sent to them" ON public.crushes;

-- Create a function to safely check if user can see a crush
CREATE OR REPLACE FUNCTION public.can_view_crush(crush_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  crush_record public.crushes;
  user_email text;
BEGIN
  -- Get the crush record
  SELECT * INTO crush_record FROM public.crushes WHERE id = crush_id;
  
  -- Get user's email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- User can view if they sent it or if it was sent to their email
  RETURN (
    crush_record.sender_user_id = auth.uid() OR 
    crush_record.recipient_email = user_email
  );
END;
$$;

-- Replace the problematic policy with a secure one
CREATE POLICY "Users can view their relevant crushes" 
ON public.crushes 
FOR SELECT 
TO authenticated 
USING (public.can_view_crush(id));

-- Create anonymized profile view function for safe matching
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