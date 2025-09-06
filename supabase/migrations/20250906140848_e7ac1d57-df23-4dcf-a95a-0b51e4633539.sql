-- Fix the security definer view issue
DROP VIEW IF EXISTS public.safe_matching_profiles CASCADE;

-- Create a simple view without security definer
CREATE VIEW public.safe_matching_profiles AS
SELECT 
  'match_' || substr(encode(digest(user_id::text, 'sha256'), 'hex'), 1, 12) as match_id,
  display_name,
  gender,
  CASE 
    WHEN birth_date IS NOT NULL THEN
      CASE 
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) < 30 THEN 'Jeune adulte'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) < 40 THEN 'Adulte'
        ELSE 'Mature'
      END
    ELSE 'Âge non spécifié'
  END as age_category,
  -- Only show country, no city or coordinates  
  COALESCE(location_country, 'Localisation non spécifiée') as region,
  (profile_photo_url IS NOT NULL) as has_photo
FROM public.profiles
WHERE 
  profile_completed = true 
  AND (profile_visibility IS NULL OR profile_visibility != 'hidden');

-- Enable RLS on the view using the standard method
ALTER VIEW public.safe_matching_profiles SET (security_invoker = on);

-- Drop and recreate the function without relying on the problematic view
DROP FUNCTION IF EXISTS public.get_anonymous_match_previews();

CREATE OR REPLACE FUNCTION public.get_limited_matches()
RETURNS TABLE(
  match_id text,
  display_name text,
  gender text,
  age_category text,
  region text,
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

  -- Direct query without view to avoid security definer view issues
  RETURN QUERY
  SELECT 
    ('match_' || substr(encode(digest(p.user_id::text, 'sha256'), 'hex'), 1, 12))::text as match_id,
    p.display_name::text,
    p.gender::text,
    (CASE 
      WHEN p.birth_date IS NOT NULL THEN
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) < 30 THEN 'Jeune adulte'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) < 40 THEN 'Adulte'
          ELSE 'Mature'
        END
      ELSE 'Âge non spécifié'
    END)::text as age_category,
    COALESCE(p.location_country, 'Localisation non spécifiée')::text as region,
    (p.profile_photo_url IS NOT NULL)::boolean as has_photo
  FROM public.profiles p
  WHERE 
    p.user_id != auth.uid()
    AND p.profile_completed = true 
    AND (p.profile_visibility IS NULL OR p.profile_visibility != 'hidden')
  LIMIT 3;
END;
$$;