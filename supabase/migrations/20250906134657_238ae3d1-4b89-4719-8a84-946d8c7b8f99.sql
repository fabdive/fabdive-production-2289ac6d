-- Drop the restrictive policy that only allows users to see their own profile
DROP POLICY IF EXISTS "Users can view own complete profile" ON public.profiles;

-- Create a new policy that allows authenticated users to view all profiles
-- This is necessary for a dating app to function properly
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Keep the policy that allows users to update only their own profile
-- This ensures data security while allowing profile visibility