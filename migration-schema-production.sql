-- =============================================================================
-- SCRIPT DE MIGRATION FABDIVE - ENVIRONNEMENT DE PRODUCTION
-- =============================================================================
-- À exécuter dans le nouveau projet Supabase de production
-- =============================================================================

-- 1. CRÉATION DES TABLES
-- =============================================================================

-- Table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE,
    display_name text,
    gender text,
    birth_date date,
    height_cm integer,
    height integer,
    body_type text,
    skin_color text,
    location_city text,
    location_country text,
    latitude numeric,
    longitude numeric,
    max_distance text,
    profile_photo_url text,
    profile_visibility text,
    photo_visibility text,
    appearance_importance text,
    seeking_relationship_types text[],
    attracted_to_types text[],
    personality_traits text[],
    personal_definition text[],
    age_confirmed boolean DEFAULT false,
    auto_translation boolean DEFAULT false,
    profile_completed boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table user_preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    preferred_age_min integer,
    preferred_age_max integer,
    preferred_genders text[],
    preferred_heights text[],
    preferred_body_types text[],
    preferred_skin_colors text[],
    preferred_personality_types text[],
    preferred_distances text[],
    seeking_relationship_types text[],
    location text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table crushes
CREATE TABLE IF NOT EXISTS public.crushes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_user_id uuid NOT NULL,
    recipient_email text NOT NULL,
    email_sent boolean NOT NULL DEFAULT false,
    email_id text,
    error_message text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. ACTIVATION RLS SUR TOUTES LES TABLES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crushes ENABLE ROW LEVEL SECURITY;

-- 3. CRÉATION DES FONCTIONS
-- =============================================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fonction de calcul de distance
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  earth_radius DECIMAL := 6371; -- Earth radius in kilometers
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  -- Handle NULL values
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Convert latitude and longitude from degrees to radians
  dlat := RADIANS(lat2 - lat1);
  dlon := RADIANS(lon2 - lon1);
  
  -- Haversine formula
  a := SIN(dlat/2) * SIN(dlat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlon/2) * SIN(dlon/2);
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  
  RETURN earth_radius * c;
END;
$$;

-- Fonction de recherche de matches
CREATE OR REPLACE FUNCTION public.find_matches_by_distance(user_lat numeric, user_lon numeric, max_distance numeric, current_user_id uuid, preferred_age_min integer DEFAULT 18, preferred_age_max integer DEFAULT 99, preferred_genders text[] DEFAULT '{}'::text[])
RETURNS TABLE(user_id uuid, display_name text, age integer, gender text, distance_km numeric, latitude numeric, longitude numeric, skin_color text, body_type text, height_cm integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date))::INTEGER as age,
    p.gender,
    public.calculate_distance(user_lat, user_lon, p.latitude, p.longitude) as distance_km,
    p.latitude,
    p.longitude,
    p.skin_color,
    p.body_type,
    p.height_cm
  FROM profiles p
  WHERE 
    p.user_id != current_user_id
    AND p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND p.birth_date IS NOT NULL
    AND public.calculate_distance(user_lat, user_lon, p.latitude, p.longitude) <= max_distance
    AND (
      array_length(preferred_genders, 1) IS NULL 
      OR preferred_genders = '{}' 
      OR p.gender = ANY(preferred_genders)
    )
    AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) BETWEEN preferred_age_min AND preferred_age_max
  ORDER BY distance_km ASC;
END;
$$;

-- Fonction de gestion des nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insérer dans la table profiles en bypassant RLS
  INSERT INTO public.profiles (user_id, display_name, age_confirmed)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'display_name',
    COALESCE((NEW.raw_user_meta_data ->> 'age_confirmed')::boolean, false)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas bloquer l'inscription
    RAISE LOG 'Erreur lors de la création du profil: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 4. CRÉATION DES TRIGGERS
-- =============================================================================

-- Trigger pour updated_at sur profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour updated_at sur user_preferences
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour updated_at sur crushes
CREATE TRIGGER update_crushes_updated_at
    BEFORE UPDATE ON public.crushes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour les nouveaux users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. POLITIQUES RLS - TABLE PROFILES
-- =============================================================================

-- Policies pour profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 6. POLITIQUES RLS - TABLE USER_PREFERENCES
-- =============================================================================

CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (user_id IN (
  SELECT profiles.user_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT profiles.user_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (user_id IN (
  SELECT profiles.user_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own preferences" 
ON public.user_preferences 
FOR DELETE 
USING (user_id IN (
  SELECT profiles.user_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

-- 7. POLITIQUES RLS - TABLE CRUSHES
-- =============================================================================

CREATE POLICY "Users can view their own sent crushes" 
ON public.crushes 
FOR SELECT 
USING (auth.uid() = sender_user_id);

CREATE POLICY "Allow crushes creation" 
ON public.crushes 
FOR INSERT 
WITH CHECK ((auth.uid() = sender_user_id) OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text));

CREATE POLICY "Users can update their own crushes" 
ON public.crushes 
FOR UPDATE 
USING (auth.uid() = sender_user_id);

-- 8. CRÉATION DES BUCKETS DE STOCKAGE
-- =============================================================================

-- Bucket pour les photos de profil
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Politiques pour le bucket profile-photos
CREATE POLICY "Users can view their own photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================================================
-- FIN DU SCRIPT DE MIGRATION
-- =============================================================================

-- Instructions post-migration :
-- 1. Vérifier que toutes les tables sont créées
-- 2. Tester l'authentification
-- 3. Vérifier les politiques RLS
-- 4. Tester l'upload de photos
-- 5. Configurer les secrets dans Supabase (RESEND_API_KEY, etc.)