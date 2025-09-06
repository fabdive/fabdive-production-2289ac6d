-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view public profile data only" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Create much more restrictive policy for profiles
-- Users can only see their own complete profile
-- Others can only see very limited, anonymized data through specific functions
CREATE POLICY "Own profile only - others via functions"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Update the crushes table to better protect email addresses
-- Drop existing policies
DROP POLICY IF EXISTS "Users can only view crushes they sent" ON public.crushes;
DROP POLICY IF EXISTS "Crushes: own data only" ON public.crushes;

-- Create new restrictive policies for crushes
CREATE POLICY "Users can manage their own crushes only"
ON public.crushes
FOR ALL
TO authenticated
USING (sender_user_id = auth.uid())
WITH CHECK (sender_user_id = auth.uid());

-- Create a completely anonymized view for safe profile browsing
DROP VIEW IF EXISTS public.safe_profiles;
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  -- Generate a random identifier instead of real user_id for privacy
  md5(user_id::text || 'salt_2024')::uuid as anonymous_id,
  display_name,
  gender,
  -- Only show age ranges, never exact age or birth_date
  CASE 
    WHEN birth_date IS NOT NULL THEN
      CASE 
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) BETWEEN 18 AND 24 THEN '18-24'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) BETWEEN 25 AND 29 THEN '25-29'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) BETWEEN 30 AND 34 THEN '30-34'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) BETWEEN 35 AND 39 THEN '35-39'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) BETWEEN 40 AND 44 THEN '40-44'
        ELSE '45+'
      END
    ELSE 'Non spécifié' 
  END as age_range,
  -- Height categories instead of exact measurements
  CASE 
    WHEN height_cm IS NOT NULL THEN
      CASE 
        WHEN height_cm < 155 THEN 'Petite'
        WHEN height_cm < 165 THEN 'Petite-Moyenne'
        WHEN height_cm < 175 THEN 'Moyenne'
        WHEN height_cm < 185 THEN 'Grande'
        ELSE 'Très Grande'
      END 
    ELSE 'Non spécifié' 
  END as height_category,
  body_type,
  skin_color,
  -- Only country, never city or coordinates
  location_country,
  -- Distance ranges instead of exact distances
  'À déterminer' as distance_range,
  -- Simple photo indicator
  CASE WHEN profile_photo_url IS NOT NULL THEN true ELSE false END as has_photo,
  created_at
FROM public.profiles
WHERE 
  profile_completed = true 
  AND (profile_visibility IS NULL OR profile_visibility != 'hidden');

-- Grant very limited access to the safe view
REVOKE ALL ON public.safe_profiles FROM authenticated;
GRANT SELECT ON public.safe_profiles TO authenticated;

-- Create a function that returns even more limited match suggestions
CREATE OR REPLACE FUNCTION public.get_match_suggestions()
RETURNS TABLE(
  suggestion_id text,
  has_photo boolean,
  age_category text,
  location_category text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return only very basic, anonymized suggestions
  RETURN QUERY
  SELECT 
    'match_' || generate_random_uuid()::text as suggestion_id,
    (profile_photo_url IS NOT NULL) as has_photo,
    CASE 
      WHEN birth_date IS NOT NULL THEN
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) < 30 THEN 'Jeune'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) < 45 THEN 'Adulte'
          ELSE 'Mature'
        END
      ELSE 'Non spécifié' 
    END as age_category,
    COALESCE(location_country, 'Inconnu') as location_category
  FROM profiles p
  WHERE 
    p.user_id != auth.uid()
    AND p.profile_completed = true
    AND (p.profile_visibility IS NULL OR p.profile_visibility != 'hidden')
  LIMIT 5; -- Very limited results
END;
$$;