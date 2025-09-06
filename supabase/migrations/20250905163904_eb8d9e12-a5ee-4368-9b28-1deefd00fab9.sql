-- CRITICAL: Remove all policies that expose user profile data
-- This fixes the "Dating App User Profiles Exposed" security issue

-- Remove the problematic policy that allows viewing other users' profile data
DROP POLICY IF EXISTS "Users can view basic profile info for matching" ON public.profiles;

-- Ensure only the owner can view their own profile
-- This policy already exists but let's make sure it's the ONLY SELECT policy
-- The existing policy "Users can view own complete profile" should be the only one

-- Create a ultra-secure function for safe matching without exposing profile data directly
DROP FUNCTION IF EXISTS public.get_basic_profiles_for_matching();

-- Create a function that returns only the absolute minimum for matching
CREATE OR REPLACE FUNCTION public.get_minimal_match_data()
RETURNS TABLE(
  match_id uuid,
  has_photo boolean,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return only anonymized match indicators, no personal data
  RETURN QUERY
  SELECT 
    p.user_id as match_id,
    (p.profile_photo_url IS NOT NULL) as has_photo,
    (p.profile_completed = true) as is_active
  FROM profiles p
  WHERE 
    p.user_id != auth.uid()
    AND p.profile_completed = true
    AND (p.profile_visibility IS NULL OR p.profile_visibility != 'hidden')
  LIMIT 10; -- Limit to prevent data scraping
END;
$$;

-- Ensure no other policies allow profile data access
-- Verify only these policies should exist on profiles table:
-- 1. "Users can insert their own profile" (INSERT)
-- 2. "Users can update their own profile" (UPDATE) 
-- 3. "Users can view own complete profile" (SELECT - own data only)

-- Clean up any duplicate/conflicting crush policies
DROP POLICY IF EXISTS "Crushes: users view own sent only" ON public.crushes;
DROP POLICY IF EXISTS "Users can view their own sent crushes" ON public.crushes;
DROP POLICY IF EXISTS "Crushes: users create own only" ON public.crushes;
DROP POLICY IF EXISTS "Crushes: users update own only" ON public.crushes;
DROP POLICY IF EXISTS "Allow crushes creation" ON public.crushes;
DROP POLICY IF EXISTS "Users can update their own crushes" ON public.crushes;

-- Create single, clear policies for crushes
CREATE POLICY "Crushes: own data only" 
ON public.crushes 
FOR ALL
TO authenticated 
USING (sender_user_id = auth.uid())
WITH CHECK (sender_user_id = auth.uid());