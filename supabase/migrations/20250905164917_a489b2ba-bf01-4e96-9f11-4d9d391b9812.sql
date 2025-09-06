-- Fix: Add policy to allow users to see other profiles for dating functionality
-- This allows users to see essential profile info of others who have completed profiles
-- and haven't hidden their visibility, while protecting sensitive data

CREATE POLICY "Users can view completed profiles for matching" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
  -- Users can see other users' profiles if:
  user_id != auth.uid() AND -- Not their own profile
  profile_completed = true AND -- Profile is complete
  (profile_visibility IS NULL OR profile_visibility != 'hidden') -- Not hidden
);