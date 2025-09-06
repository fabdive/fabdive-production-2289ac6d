-- Remove the problematic view completely to eliminate security risk
DROP VIEW IF EXISTS public.safe_matching_profiles CASCADE;

-- Ensure the secure function is the only way to access matching data
-- This function already has proper authentication and limits built in
CREATE OR REPLACE FUNCTION public.get_secure_match_suggestions()
RETURNS TABLE(
  suggestion_id text,
  display_name text,
  gender text,
  age_category text,
  general_location text,
  has_photo boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Strict authentication requirement
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Return very limited anonymous data
  RETURN QUERY
  SELECT 
    ('suggestion_' || substr(encode(digest(p.user_id::text, 'sha256'), 'hex'), 1, 8))::text as suggestion_id,
    p.display_name::text,
    p.gender::text,
    (CASE 
      WHEN p.birth_date IS NOT NULL THEN
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) < 30 THEN '18-29'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) < 40 THEN '30-39'
          ELSE '40+'
        END
      ELSE 'Non spécifié'
    END)::text as age_category,
    COALESCE(p.location_country, 'Localisation inconnue')::text as general_location,
    (p.profile_photo_url IS NOT NULL)::boolean as has_photo
  FROM public.profiles p
  WHERE 
    p.user_id != auth.uid()
    AND p.profile_completed = true 
    AND (p.profile_visibility IS NULL OR p.profile_visibility != 'hidden')
  ORDER BY p.created_at DESC
  LIMIT 2; -- Extremely limited to prevent data harvesting
END;
$$;