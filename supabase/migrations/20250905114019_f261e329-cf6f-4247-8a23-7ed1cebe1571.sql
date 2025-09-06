-- Corriger les conflits de politiques pour les crushes

-- 1. Supprimer les politiques existantes en conflit
DROP POLICY IF EXISTS "Users can view their own sent crushes" ON public.crushes;
DROP POLICY IF EXISTS "Users can view their own sent crushes only" ON public.crushes;
DROP POLICY IF EXISTS "Allow crushes creation" ON public.crushes;
DROP POLICY IF EXISTS "Users can update their own crushes" ON public.crushes;

-- 2. Créer des politiques avec des noms uniques pour les crushes
CREATE POLICY "Crushes: users view own sent only" 
ON public.crushes 
FOR SELECT 
USING (auth.uid() = sender_user_id);

CREATE POLICY "Crushes: users create own only" 
ON public.crushes 
FOR INSERT 
WITH CHECK (auth.uid() = sender_user_id OR (auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Crushes: users update own only" 
ON public.crushes 
FOR UPDATE 
USING (auth.uid() = sender_user_id);

-- 3. Créer une fonction pour obtenir les crushes de l'utilisateur (sans SECURITY DEFINER pour éviter les problèmes)
CREATE OR REPLACE FUNCTION public.get_user_crushes()
RETURNS TABLE (
  id uuid,
  recipient_email text,
  email_sent boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) 
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.recipient_email,
    c.email_sent,
    c.created_at,
    c.updated_at
  FROM crushes c
  WHERE c.sender_user_id = auth.uid();
END;
$$;