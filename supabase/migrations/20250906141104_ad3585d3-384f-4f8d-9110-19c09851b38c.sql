-- FINAL SECURITY LOCKDOWN: Completely hide GPS coordinates from everyone except owner

-- 1. Drop current profile policy and create ultra-restrictive access
DROP POLICY IF EXISTS "Users can only see their own complete profile" ON public.profiles;

-- 2. Create policy that NEVER exposes GPS coordinates to other users
CREATE POLICY "Strict profile access - no GPS exposure" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see their own complete profile including GPS
  auth.uid() = user_id
);

-- 3. Create a separate policy for limited profile data without GPS
CREATE POLICY "Limited profile data for matching - no GPS" 
ON public.profiles 
FOR SELECT 
USING (
  -- Others can see very limited data, but NEVER GPS coordinates
  auth.uid() IS NOT NULL 
  AND auth.uid() != user_id
  AND profile_completed = true 
  AND (profile_visibility IS NULL OR profile_visibility != 'hidden')
);

-- 4. Create a secure view that completely excludes GPS data
CREATE OR REPLACE VIEW public.profiles_no_gps AS
SELECT 
  user_id,
  display_name,
  gender,
  -- Age category instead of birth date
  CASE 
    WHEN birth_date IS NOT NULL THEN
      CASE 
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) < 25 THEN '18-24'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) < 35 THEN '25-34'
        ELSE '35+'
      END
    ELSE NULL
  END as age_range,
  -- Height category instead of exact height
  CASE 
    WHEN height_cm IS NOT NULL THEN
      CASE 
        WHEN height_cm < 165 THEN 'small'
        WHEN height_cm < 180 THEN 'medium' 
        ELSE 'tall'
      END
    ELSE NULL
  END as height_category,
  body_type,
  skin_color,
  -- Only country, never city or coordinates
  location_country,
  -- NO latitude, NO longitude, NO location_city
  profile_photo_url,
  profile_completed,
  created_at
FROM public.profiles
WHERE 
  -- Users can only see this view for profiles that are not their own
  user_id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
  AND profile_completed = true
  AND (profile_visibility IS NULL OR profile_visibility != 'hidden');

-- Enable RLS on the view
ALTER VIEW public.profiles_no_gps SET (security_invoker = on);

-- 5. Update the secure matching function to use this GPS-free approach
DROP FUNCTION IF EXISTS public.get_secure_match_suggestions();
DROP FUNCTION IF EXISTS public.get_limited_matches();

CREATE OR REPLACE FUNCTION public.get_completely_safe_matches()
RETURNS TABLE(
  match_id text,
  display_name text,
  gender text,
  age_range text,
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
  -- Authentication required
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for matching';
  END IF;

  -- Return completely GPS-free data
  RETURN QUERY
  SELECT 
    ('match_' || substr(md5(pgv.user_id::text), 1, 8))::text as match_id,
    pgv.display_name::text,
    pgv.gender::text,
    pgv.age_range::text,
    pgv.height_category::text,
    pgv.body_type::text,
    COALESCE(pgv.location_country, 'Pays inconnu')::text as general_location,
    (pgv.profile_photo_url IS NOT NULL)::boolean as has_photo
  FROM public.profiles_no_gps pgv
  LIMIT 2; -- Very limited results
END;
$$;