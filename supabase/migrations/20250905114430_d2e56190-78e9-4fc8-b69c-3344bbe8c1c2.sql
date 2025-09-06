-- Rétablir les fonctionnalités essentielles tout en gardant la sécurité

-- 1. Ajouter une politique très restreinte pour la découverte de profils
-- Seules les données essentielles pour le matching sont visibles
CREATE POLICY "Limited profile discovery for matching" 
ON public.profiles 
FOR SELECT 
USING (
  user_id != auth.uid() AND 
  profile_completed = true AND 
  (profile_visibility IS NULL OR profile_visibility != 'hidden') AND 
  auth.uid() IS NOT NULL
);

-- 2. Permettre aux destinataires de voir qu'ils ont reçu un crush
-- sans exposer les emails des autres
CREATE POLICY "Recipients can view crushes sent to them" 
ON public.crushes 
FOR SELECT 
USING (
  recipient_email IN (
    SELECT users.email FROM auth.users WHERE users.id = auth.uid()
  )
);

-- 3. Permettre aux expéditeurs de voir leurs propres crushes
CREATE POLICY "Users can view their own sent crushes" 
ON public.crushes 
FOR SELECT 
USING (auth.uid() = sender_user_id);

-- 4. Permettre la mise à jour des crushes par l'expéditeur
CREATE POLICY "Users can update their own crushes" 
ON public.crushes 
FOR UPDATE 
USING (auth.uid() = sender_user_id);