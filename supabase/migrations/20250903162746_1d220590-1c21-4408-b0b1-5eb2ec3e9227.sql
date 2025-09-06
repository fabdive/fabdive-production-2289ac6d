-- Ajouter une politique pour permettre aux destinataires de voir les crushes qui leur sont envoyés
CREATE POLICY "Recipients can view crushes sent to them" 
ON public.crushes 
FOR SELECT 
USING (
  -- Permettre au destinataire de voir les crushes envoyés à son email
  recipient_email IN (
    SELECT email 
    FROM auth.users 
    WHERE id = auth.uid()
  )
);