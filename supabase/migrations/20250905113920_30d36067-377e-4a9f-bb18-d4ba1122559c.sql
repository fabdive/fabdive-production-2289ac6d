-- Corriger le problème de sécurité avec la vue SECURITY DEFINER

-- 1. Supprimer la vue sécurisée problématique
DROP VIEW IF EXISTS public.crushes_secure;

-- 2. Supprimer la politique qui bloque tout accès aux crushes
DROP POLICY IF EXISTS "Restrict direct access to crushes table" ON public.crushes;

-- 3. Créer une politique plus sûre pour les crushes qui limite les données exposées
-- Permettre aux utilisateurs de voir seulement leurs propres crushes envoyés
CREATE POLICY "Users can view their own sent crushes" 
ON public.crushes 
FOR SELECT 
USING (auth.uid() = sender_user_id);

-- 4. Créer une fonction sécurisée pour obtenir les crushes de l'utilisateur actuel
-- Cette fonction ne retournera que les crushes de l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.get_user_crushes()
RETURNS TABLE (
  id uuid,
  recipient_email text,
  email_sent boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 5. Créer une politique pour empêcher l'accès aux crushes d'autres utilisateurs
CREATE POLICY "Allow crushes creation" 
ON public.crushes 
FOR INSERT 
WITH CHECK (auth.uid() = sender_user_id OR (auth.jwt() ->> 'role') = 'service_role');

-- 6. Politique pour les mises à jour des crushes
CREATE POLICY "Users can update their own crushes" 
ON public.crushes 
FOR UPDATE 
USING (auth.uid() = sender_user_id);