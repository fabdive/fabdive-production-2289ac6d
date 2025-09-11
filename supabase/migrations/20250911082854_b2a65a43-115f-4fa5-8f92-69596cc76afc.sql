-- Supprimer les colonnes liées à la couleur de peau
ALTER TABLE public.profiles DROP COLUMN IF EXISTS skin_color;
ALTER TABLE public.user_preferences DROP COLUMN IF EXISTS preferred_skin_colors;