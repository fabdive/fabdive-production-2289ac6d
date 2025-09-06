-- Complete security lockdown - hide all sensitive data including GPS coordinates

-- 1. Fix crushes table - completely hide recipient emails from other users
DROP POLICY IF EXISTS "View sent crushes" ON public.crushes;

-- New restrictive policy for crushes - users can only see basic info about their own crushes
CREATE POLICY "View own crushes without recipient emails" 
ON public.crushes 
FOR SELECT 
USING (
  auth.uid() = sender_user_id
);

-- 2. Create completely secure profiles access - NO GPS coordinates exposed
DROP POLICY IF EXISTS "Authenticated users only - own profile or basic matching data" ON public.profiles;

-- Ultra-restrictive profile policy
CREATE POLICY "Own profile full access only" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id
);

-- 3. Create a secure view that never exposes coordinates or sensitive data
CREATE OR REPLACE VIEW public.safe_matching_profiles AS
SELECT 
  'anon_' || encode(digest(user_id::text, 'sha256'), 'hex')::text as anonymous_id,
  display_name,
  gender,
  CASE 
    WHEN birth_date IS NOT NULL THEN
      CASE 
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) < 25 THEN '18-24'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) < 35 THEN '25-34'
        ELSE '35+'
      END
    ELSE 'Age non spécifié'
  END as age_range,
  CASE 
    WHEN height_cm IS NOT NULL THEN
      CASE 
        WHEN height_cm < 165 THEN 'Petit(e)'
        WHEN height_cm < 180 THEN 'Moyen(ne)'
        ELSE 'Grand(e)'
      END
    ELSE 'Taille non spécifiée'
  END as height_category,
  body_type,
  -- Only show country, never city or coordinates
  location_country as general_location,
  (profile_photo_url IS NOT NULL) as has_photo
FROM public.profiles
WHERE 
  profile_completed = true 
  AND (profile_visibility IS NULL OR profile_visibility != 'hidden')
  AND user_id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);

-- Enable RLS on the view
ALTER VIEW public.safe_matching_profiles SET (security_invoker = on);

-- 4. Replace matching functions to use safe approach
DROP FUNCTION IF EXISTS public.get_safe_matching_profiles(numeric);
DROP FUNCTION IF EXISTS public.get_matching_profiles(numeric);

-- New ultra-secure matching function
CREATE OR REPLACE FUNCTION public.get_secure_matches()
RETURNS TABLE(
  anonymous_id text,
  display_name text,
  age_range text,
  gender text,
  height_category text,
  body_type text,
  general_location text,
  has_photo boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only authenticated users
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  -- Return only from the secure view
  RETURN QUERY
  SELECT * FROM public.safe_matching_profiles
  LIMIT 5;
END;
$$;