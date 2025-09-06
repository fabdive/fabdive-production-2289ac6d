-- Drop the restrictive policy that prevents edge functions from inserting
DROP POLICY IF EXISTS "Users can create their own crushes" ON public.crushes;

-- Create a new policy that allows both users and service role to create crushes
CREATE POLICY "Allow crushes creation" 
ON public.crushes 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_user_id OR 
  auth.jwt() ->> 'role' = 'service_role'
);