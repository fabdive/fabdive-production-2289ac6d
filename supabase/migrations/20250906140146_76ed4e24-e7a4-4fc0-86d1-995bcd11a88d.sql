-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Own profile only - others via functions" ON public.profiles;
DROP POLICY IF EXISTS "Allow viewing profiles for matching" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own crushes only" ON public.crushes;
DROP POLICY IF EXISTS "View own crushes" ON public.crushes;
DROP POLICY IF EXISTS "Send crushes" ON public.crushes;

-- Create NEW balanced policies for profiles
CREATE POLICY "Profiles visible for matching" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR  -- Own profile: full access
  (
    -- Other profiles: basic info only if public and completed
    profile_completed = true AND 
    (profile_visibility IS NULL OR profile_visibility != 'hidden')
  )
);

CREATE POLICY "Update own profile only" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Insert own profile only" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for crushes
CREATE POLICY "View sent crushes" 
ON public.crushes 
FOR SELECT 
USING (auth.uid() = sender_user_id);

CREATE POLICY "Send new crushes" 
ON public.crushes 
FOR INSERT 
WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY "Update sent crushes" 
ON public.crushes 
FOR UPDATE 
USING (auth.uid() = sender_user_id);