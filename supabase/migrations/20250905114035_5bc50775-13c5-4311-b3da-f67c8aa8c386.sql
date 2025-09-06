-- Corriger uniquement les emails exposés dans les crushes

-- Créer une vue sécurisée pour les crushes qui masque les emails sensibles
DROP VIEW IF EXISTS public.crushes_secure;

CREATE VIEW public.crushes_secure AS
SELECT 
  id,
  sender_user_id,
  CASE 
    WHEN sender_user_id = auth.uid() THEN recipient_email
    ELSE '***@***.**' -- Email masqué pour les autres
  END as recipient_email,
  email_sent,
  created_at,
  updated_at,
  -- Masquer email_id et error_message pour la sécurité
  NULL as email_id,
  CASE 
    WHEN sender_user_id = auth.uid() THEN error_message
    ELSE NULL
  END as error_message
FROM public.crushes
WHERE sender_user_id = auth.uid(); -- Seuls les crushes de l'utilisateur courant