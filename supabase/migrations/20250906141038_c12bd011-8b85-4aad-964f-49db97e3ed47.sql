-- COMPLETE ELIMINATION of problematic views - function-only approach

-- 1. Remove the problematic view entirely
DROP VIEW IF EXISTS public.profiles_no_gps CASCADE;

-- 2. Remove the second problematic policy that still allows access to other profiles
DROP POLICY IF EXISTS "Limited profile data for matching - no GPS" ON public.profiles;

-- 3. Keep ONLY the strictest policy - users can ONLY see their own profile
-- This means NO other user can see ANY data from profiles table directly
CREATE POLICY "Own profile access only - nothing else" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Create the ultimate secure function that handles all matching internally
-- This is the ONLY way to access other users' data in a controlled manner
DROP FUNCTION IF EXISTS public.get_completely_safe_matches();

CREATE OR REPLACE FUNCTION public.get_ultra_secure_matches()
RETURNS TABLE(
  anonymous_ref text,
  public_name text,
  basic_info text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Strict authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized access attempt';
  END IF;

  -- Return extremely limited data with no direct profile access
  RETURN QUERY
  SELECT 
    ('ref_' || substr(encode(digest(p.user_id::text, 'sha256'), 'hex'), 1, 6))::text as anonymous_ref,
    COALESCE(p.display_name, 'Utilisateur')::text as public_name,
    (COALESCE(p.gender, '') || ' • ' || 
     COALESCE(p.location_country, 'Localisation inconnue'))::text as basic_info
  FROM public.profiles p
  WHERE 
    p.user_id != auth.uid()
    AND p.profile_completed = true 
    AND (p.profile_visibility IS NULL OR p.profile_visibility != 'hidden')
    AND p.display_name IS NOT NULL
  ORDER BY p.created_at DESC
  LIMIT 1; -- Extremely restricted - only 1 result
END;
$$;

-- 5. Create a separate function for user's own profile data
CREATE OR REPLACE FUNCTION public.get_own_profile()
RETURNS TABLE(
  user_id uuid,
  display_name text,
  gender text,
  birth_date date,
  height_cm integer,
  latitude numeric,
  longitude numeric,
  location_city text,
  location_country text,
  profile_photo_url text,
  profile_completed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return current user's own profile
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    p.gender,
    p.birth_date,
    p.height_cm,
    p.latitude,
    p.longitude,
    p.location_city,
    p.location_country,
    p.profile_photo_url,
    p.profile_completed
  FROM public.profiles p
  WHERE p.user_id = auth.uid();
END;
$$;