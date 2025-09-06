-- Add seeking_relationship_types column to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN seeking_relationship_types TEXT[];