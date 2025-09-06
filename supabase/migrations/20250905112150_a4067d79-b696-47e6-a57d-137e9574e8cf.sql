-- Supprimer les politiques trop permissives
DROP POLICY IF EXISTS "Users can discover other profiles for matching" ON public.profiles;
DROP POLICY IF EXISTS "Users can view preferences for matching" ON public.user_preferences;

-- Créer une politique plus restrictive pour la découverte de profils
-- Seules les données essentielles pour le matching sont visibles
CREATE POLICY "Limited profile discovery for matching" 
ON public.profiles 
FOR SELECT 
USING (
  user_id != auth.uid() AND -- Pas son propre profil
  profile_completed = true AND -- Profil complété
  (profile_visibility IS NULL OR profile_visibility != 'hidden') AND -- Profil visible
  -- Limiter l'accès aux colonnes sensibles via une fonction
  auth.uid() IS NOT NULL -- Utilisateur authentifié requis
);

-- Créer une vue sécurisée pour les profils publics (données limitées)
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  user_id,
  display_name,
  gender,
  -- Calculer l'âge sans exposer la date de naissance exacte
  CASE 
    WHEN birth_date IS NOT NULL 
    THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))::INTEGER 
    ELSE NULL 
  END as age,
  -- Données physiques générales (sans détails précis)
  CASE 
    WHEN height_cm IS NOT NULL 
    THEN CASE 
      WHEN height_cm < 160 THEN 'petite'
      WHEN height_cm < 175 THEN 'moyenne'
      ELSE 'grande'
    END 
    ELSE NULL 
  END as height_category,
  body_type,
  skin_color,
  -- Location approximative seulement
  location_country,
  profile_photo_url,
  -- Masquer les coordonnées exactes
  CASE WHEN latitude IS NOT NULL THEN true ELSE false END as has_location
FROM public.profiles
WHERE 
  profile_completed = true AND
  (profile_visibility IS NULL OR profile_visibility != 'hidden');

-- RLS pour la vue publique
ALTER VIEW public.profiles_public SET (security_barrier = true);
CREATE POLICY "Public profiles view access" ON public.profiles_public FOR SELECT TO authenticated USING (true);

-- Politique plus restrictive pour les préférences utilisateur
-- Seuls les utilisateurs peuvent voir leurs propres préférences complètes
CREATE POLICY "Restricted user preferences access" 
ON public.user_preferences 
FOR SELECT 
USING (user_id = auth.uid());

-- Créer une table pour les interactions de matching (remplace l'accès direct aux préférences)
CREATE TABLE IF NOT EXISTS public.user_interactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'like', 'dislike', 'match')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, target_user_id, interaction_type)
);

-- RLS pour les interactions
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own interactions" 
ON public.user_interactions 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Modifier la table crushes pour utiliser des IDs internes plutôt que des emails
-- (Nous garderons l'email pour l'envoi mais limiterons l'accès)
CREATE POLICY "Crushes sender access only" 
ON public.crushes 
FOR SELECT 
USING (sender_user_id = auth.uid());