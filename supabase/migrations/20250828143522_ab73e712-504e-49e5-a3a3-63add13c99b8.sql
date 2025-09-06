-- Add preferred_distances column to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN preferred_distances TEXT[];