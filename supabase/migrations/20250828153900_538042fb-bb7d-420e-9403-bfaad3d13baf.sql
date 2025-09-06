-- Add appearance_importance column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN appearance_importance TEXT;