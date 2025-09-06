-- Add RLS policy to the safe_matching_profiles view
CREATE POLICY "Safe matching profiles for authenticated users only" 
ON public.safe_matching_profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);