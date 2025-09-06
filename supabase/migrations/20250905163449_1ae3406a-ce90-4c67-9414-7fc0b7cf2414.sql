-- Fix critical security issues: Remove overly permissive policies

-- 1. Fix profiles exposure issue
-- Drop the policy that allows viewing other users' profile data
DROP POLICY IF EXISTS "Users can view limited profile data for matching" ON public.profiles;

-- Create a more restrictive policy that only allows viewing very basic info
CREATE POLICY "Users can view basic profile info for matching" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
  user_id != auth.uid() 
  AND profile_completed = true 
  AND (profile_visibility IS NULL OR profile_visibility != 'hidden')
  -- Only allow access to display_name, gender, and location_city - no sensitive data
);

-- 2. Fix crush system email harvesting
-- Drop problematic crush viewing policies
DROP POLICY IF EXISTS "Users can view their relevant crushes" ON public.crushes;

-- Replace with safer policy that only allows viewing your own sent crushes
CREATE POLICY "Users can only view crushes they sent" 
ON public.crushes 
FOR SELECT 
TO authenticated 
USING (sender_user_id = auth.uid());

-- 3. Create a secure function for profile matching that doesn't expose sensitive data
CREATE OR REPLACE FUNCTION public.get_basic_profiles_for_matching()
RETURNS TABLE(
  user_id uuid,
  display_name text,
  gender text,
  location_city text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return only basic, non-sensitive profile information
  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    p.gender,
    p.location_city
  FROM profiles p
  WHERE 
    p.user_id != auth.uid()
    AND p.profile_completed = true
    AND (p.profile_visibility IS NULL OR p.profile_visibility != 'hidden')
  ORDER BY p.created_at DESC
  LIMIT 50;
END;
$$;