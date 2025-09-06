-- Complete cleanup and rebuild of all security policies

-- 1. Clean up ALL existing policies on crushes
DROP POLICY IF EXISTS "View own crushes without recipient emails" ON public.crushes;
DROP POLICY IF EXISTS "Send new crushes" ON public.crushes;
DROP POLICY IF EXISTS "Update sent crushes" ON public.crushes;
DROP POLICY IF EXISTS "Users can manage their own interactions" ON public.crushes;

-- 2. Clean up ALL existing policies on profiles  
DROP POLICY IF EXISTS "Own profile full access only" ON public.profiles;
DROP POLICY IF EXISTS "Update own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Insert own profile only" ON public.profiles;

-- 3. Create minimal secure policies for crushes
CREATE POLICY "Users can only see their own crush records" 
ON public.crushes 
FOR SELECT 
USING (auth.uid() = sender_user_id);

CREATE POLICY "Users can create their own crushes" 
ON public.crushes 
FOR INSERT 
WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY "Users can update their own crushes" 
ON public.crushes 
FOR UPDATE 
USING (auth.uid() = sender_user_id);

-- 4. Create minimal secure policies for profiles
CREATE POLICY "Users can only see their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. Create the secure matching view (drop first if exists)
DROP VIEW IF EXISTS public.safe_matching_profiles CASCADE;

CREATE VIEW public.safe_matching_profiles AS
SELECT 
  'match_' || substr(encode(digest(user_id::text, 'sha256'), 'hex'), 1, 12) as match_id,
  display_name,
  gender,
  CASE 
    WHEN birth_date IS NOT NULL THEN
      CASE 
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) < 30 THEN 'Jeune adulte'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) < 40 THEN 'Adulte'
        ELSE 'Mature'
      END
    ELSE 'Âge non spécifié'
  END as age_category,
  -- Only show country, no city or coordinates  
  COALESCE(location_country, 'Localisation non spécifiée') as region,
  (profile_photo_url IS NOT NULL) as has_photo
FROM public.profiles
WHERE 
  profile_completed = true 
  AND (profile_visibility IS NULL OR profile_visibility != 'hidden');

-- 6. Secure matching function
CREATE OR REPLACE FUNCTION public.get_anonymous_match_previews()
RETURNS TABLE(
  match_id text,
  display_name text,
  gender text,
  age_category text,
  region text,
  has_photo boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only for authenticated users
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    smp.match_id,
    smp.display_name,
    smp.gender,
    smp.age_category,
    smp.region,
    smp.has_photo
  FROM public.safe_matching_profiles smp
  LIMIT 3; -- Very limited results
END;
$$;