-- Corriger les problèmes de sécurité de la vue

-- Supprimer la vue problématique
DROP VIEW IF EXISTS public.crushes_secure;

-- Au lieu d'une vue, créer une fonction sécurisée pour accéder aux crushes
CREATE OR REPLACE FUNCTION public.get_user_crushes()
RETURNS TABLE (
  id uuid,
  sender_user_id uuid,
  recipient_email_display text,
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
    c.sender_user_id,
    CASE 
      WHEN c.sender_user_id = auth.uid() THEN c.recipient_email
      ELSE '***@***.***' -- Email masqué pour les non-propriétaires
    END as recipient_email_display,
    c.email_sent,
    c.created_at,
    c.updated_at
  FROM crushes c
  WHERE c.sender_user_id = auth.uid(); -- Seuls les crushes de l'utilisateur connecté
END;
$$;