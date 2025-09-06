-- Corriger le problème de sécurité avec les vues
-- Supprimer la vue problématique SECURITY DEFINER
DROP VIEW IF EXISTS public.crushes_secure;

-- Au lieu d'une vue, utiliser des politiques RLS plus strictes
-- Supprimer les anciennes politiques pour les recréer plus strictement
DROP POLICY IF EXISTS "Users can view their own sent crushes only" ON public.crushes;
DROP POLICY IF EXISTS "Restrict direct access to crushes table" ON public.crushes;

-- Créer des politiques restrictives qui masquent les données sensibles
-- Seul l'expéditeur peut voir ses propres crushes (politique existante à garder)
CREATE POLICY "Users can view their own sent crushes only" 
ON public.crushes 
FOR SELECT 
USING (auth.uid() = sender_user_id);

-- Créer une fonction sécurisée pour obtenir les crushes sans exposer les emails
CREATE OR REPLACE FUNCTION public.get_user_crushes()
RETURNS TABLE (
  id uuid,
  recipient_masked text,
  email_sent boolean,
  created_at timestamp with time zone,
  error_occurred boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    -- Masquer une partie de l'email pour la vie privée
    CASE 
      WHEN c.recipient_email LIKE '%@%' THEN 
        LEFT(SPLIT_PART(c.recipient_email, '@', 1), 2) || '***@' || SPLIT_PART(c.recipient_email, '@', 2)
      ELSE '***'
    END as recipient_masked,
    c.email_sent,
    c.created_at,
    (c.error_message IS NOT NULL) as error_occurred
  FROM crushes c
  WHERE c.sender_user_id = auth.uid()
  ORDER BY c.created_at DESC;
END;
$$;