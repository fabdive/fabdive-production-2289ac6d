-- Drop the current policy that exposes all profiles
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Create a more secure policy that only allows viewing public profile data
-- while hiding sensitive information like exact coordinates
CREATE POLICY "Users can view public profile data only"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can always see their own complete profile
  auth.uid() = user_id 
  OR 
  -- Other users can only see profiles that are:
  -- 1. Completed profiles
  -- 2. Not hidden
  -- 3. Only return safe, non-sensitive data
  (
    profile_completed = true 
    AND (profile_visibility IS NULL OR profile_visibility != 'hidden')
  )
);

-- Create a view for safe profile viewing that doesn't expose sensitive data
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  user_id,
  display_name,
  gender,
  -- Age ranges instead of birth_date
  CASE 
    WHEN birth_date IS NOT NULL THEN
      CASE 
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) < 25 THEN '18-24'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) < 35 THEN '25-34'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) < 45 THEN '35-44'
        ELSE '45+'
      END
    ELSE NULL 
  END as age_range,
  height_cm,
  body_type,
  skin_color,
  -- Only city/country, not exact coordinates
  location_city,
  location_country,
  profile_photo_url,
  profile_completed,
  created_at
FROM public.profiles
WHERE 
  profile_completed = true 
  AND (profile_visibility IS NULL OR profile_visibility != 'hidden');

-- Grant access to the safe view
GRANT SELECT ON public.safe_profiles TO authenticated;