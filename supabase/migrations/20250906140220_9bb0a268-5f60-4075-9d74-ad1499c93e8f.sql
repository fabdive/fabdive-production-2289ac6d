-- Clean up old policies that still exist
DROP POLICY IF EXISTS "Own profile only - others via functions" ON public.profiles;
DROP POLICY IF EXISTS "Allow viewing profiles for matching" ON public.profiles;

-- Drop the problematic safe_profiles table/view
DROP TABLE IF EXISTS public.safe_profiles CASCADE;

-- Ensure clean slate for profiles
CREATE POLICY "Simple profile access" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see their own complete profile
  auth.uid() = user_id OR 
  -- Or basic info of completed public profiles (coordinates excluded from app level)
  (profile_completed = true AND (profile_visibility IS NULL OR profile_visibility != 'hidden'))
);