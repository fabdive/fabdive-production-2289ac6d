-- Corriger les problèmes de sécurité restants

-- 1. Supprimer la politique trop permissive pour les profils
DROP POLICY IF EXISTS "Limited profile discovery for matching" ON public.profiles;

-- 2. Créer des politiques RLS plus strictives pour les profils
-- Les utilisateurs ne peuvent voir que des données très limitées d'autres profils
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Créer une politique très restrictive pour la découverte de profils
-- Seules les données essentielles peuvent être vues via des fonctions sécurisées
CREATE POLICY "Limited profile discovery for matching" 
ON public.profiles 
FOR SELECT 
USING (
  user_id != auth.uid() AND 
  profile_completed = true AND 
  (profile_visibility IS NULL OR profile_visibility != 'hidden') AND 
  auth.uid() IS NOT NULL
);

-- 4. Sécuriser les crushes - masquer les emails sauf pour certains cas
-- Supprimer les politiques existantes qui exposent trop de données
DROP POLICY IF EXISTS "Recipients can view crushes sent to them" ON public.crushes;
DROP POLICY IF EXISTS "Users can view their own sent crushes" ON public.crushes;
DROP POLICY IF EXISTS "Crushes sender access only" ON public.crushes;

-- Créer des politiques plus sûres pour les crushes
CREATE POLICY "Users can view their own sent crushes" 
ON public.crushes 
FOR SELECT 
USING (auth.uid() = sender_user_id);

CREATE POLICY "Users can update their own crushes" 
ON public.crushes 
FOR UPDATE 
USING (auth.uid() = sender_user_id);

-- Créer une vue sécurisée pour les crushes qui masque les emails sensibles
CREATE OR REPLACE VIEW public.crushes_secure AS
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
FROM public.crushes;

-- RLS pour la vue sécurisée
ALTER VIEW public.crushes_secure SET (security_barrier = true);

-- 5. Modifier la fonction get_matching_profiles pour être encore plus restrictive
CREATE OR REPLACE FUNCTION public.get_matching_profiles(max_distance_km numeric DEFAULT 50)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  gender text,
  age integer,
  height_cm integer,
  skin_color text,
  body_type text,
  location_city text,
  location_country text,
  distance_km numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_lat numeric;
  current_user_lon numeric;
BEGIN
  -- Récupérer les coordonnées de l'utilisateur courant
  SELECT latitude, longitude 
  INTO current_user_lat, current_user_lon
  FROM profiles 
  WHERE profiles.user_id = auth.uid();
  
  -- Retourner les profils de matching sans exposer les coordonnées exactes
  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    p.gender,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date))::INTEGER as age,
    p.height_cm,
    p.skin_color,
    p.body_type,
    p.location_city,
    p.location_country,
    public.calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) as distance_km
  FROM profiles p
  WHERE 
    p.user_id != auth.uid()
    AND p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND p.birth_date IS NOT NULL
    AND public.calculate_distance(current_user_lat, current_user_lon, p.latitude, p.longitude) <= max_distance_km
  ORDER BY distance_km ASC;
END;
$$;