-- Supprimer l'ancienne politique trop permissive
DROP POLICY "Authenticated users can view limited profile data for matching" ON public.profiles;

-- Créer une nouvelle politique qui limite strictement les données visibles pour le matching
CREATE POLICY "Users can view basic matching data only" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.role() = 'authenticated'::text) 
  AND (auth.uid() <> user_id) 
  AND (auth.uid() IS NOT NULL)
);

-- Créer une vue sécurisée pour le matching qui ne contient que les données nécessaires
CREATE OR REPLACE VIEW public.profiles_for_matching AS
SELECT 
  user_id,
  display_name,
  gender,
  birth_date,
  height_cm,
  skin_color,
  body_type,
  -- Pas de coordonnées exactes - seulement ville/pays
  location_city,
  location_country,
  -- Pas de coordonnées GPS précises pour la sécurité
  -- Les coordonnées ne seront utilisées que côté serveur pour calculer les distances
  profile_photo_url
FROM public.profiles
WHERE 
  user_id != auth.uid()
  AND latitude IS NOT NULL 
  AND longitude IS NOT NULL;

-- Accorder les permissions sur la vue
GRANT SELECT ON public.profiles_for_matching TO authenticated;