-- Add location column to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN location TEXT;