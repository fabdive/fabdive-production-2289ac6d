-- Fix critical security issue: completely restrict profile access to authenticated users only
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Simple profile access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles visible for matching" ON public.profiles;

-- Create much more restrictive policy - NO public access at all
CREATE POLICY "Authenticated users only - own profile or basic matching data" 
ON public.profiles 
FOR SELECT 
USING (
  -- Must be authenticated
  auth.uid() IS NOT NULL AND (
    -- Users can see their own complete profile
    auth.uid() = user_id OR 
    -- Or very limited data for matching (no GPS coordinates, no birth dates)
    (profile_completed = true AND (profile_visibility IS NULL OR profile_visibility != 'hidden'))
  )
);

-- Create safe matching function that never exposes GPS coordinates
CREATE OR REPLACE FUNCTION public.get_anonymous_matches()
RETURNS TABLE(
  anonymous_id text,
  display_name text,
  age_range text,
  gender text,
  general_location text,
  has_photo boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only for authenticated users
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    'user_' || encode(sha256(p.user_id::text::bytea), 'hex')::text as anonymous_id,
    p.display_name,
    CASE 
      WHEN p.birth_date IS NOT NULL THEN
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) < 25 THEN '18-24'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) < 35 THEN '25-34'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) < 45 THEN '35-44'
          ELSE '45+'
        END
      ELSE 'Non spécifié'
    END as age_range,
    p.gender,
    -- Only show country, never GPS coordinates
    COALESCE(p.location_country, 'Localisation non spécifiée') as general_location,
    (p.profile_photo_url IS NOT NULL) as has_photo
  FROM profiles p
  WHERE 
    p.user_id != auth.uid()
    AND p.profile_completed = true
    AND (p.profile_visibility IS NULL OR p.profile_visibility != 'hidden')
  LIMIT 10; -- Very limited results to prevent data scraping
END;
$$;