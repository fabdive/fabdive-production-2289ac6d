-- Étendre la table profiles pour le questionnaire complet Fabdive
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS height_cm INTEGER,
ADD COLUMN IF NOT EXISTS body_type TEXT,
ADD COLUMN IF NOT EXISTS skin_color TEXT,
ADD COLUMN IF NOT EXISTS location_city TEXT,
ADD COLUMN IF NOT EXISTS location_country TEXT,
ADD COLUMN IF NOT EXISTS max_distance TEXT,
ADD COLUMN IF NOT EXISTS seeking_relationship_types TEXT[],
ADD COLUMN IF NOT EXISTS personality_traits TEXT[],
ADD COLUMN IF NOT EXISTS personal_definition TEXT[],
ADD COLUMN IF NOT EXISTS attracted_to_types TEXT[],
ADD COLUMN IF NOT EXISTS appearance_importance TEXT,
ADD COLUMN IF NOT EXISTS profile_visibility TEXT,
ADD COLUMN IF NOT EXISTS photo_visibility TEXT,
ADD COLUMN IF NOT EXISTS auto_translation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Table pour les préférences de recherche
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  preferred_genders TEXT[],
  preferred_age_min INTEGER,
  preferred_age_max INTEGER,
  preferred_heights TEXT[],
  preferred_body_types TEXT[],
  preferred_skin_colors TEXT[],
  preferred_personality_types TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS sur la nouvelle table
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies pour user_preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (user_id IN (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (user_id IN (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (user_id IN (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own preferences" 
ON public.user_preferences 
FOR DELETE 
USING (user_id IN (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location_city, location_country);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON public.profiles(birth_date);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);