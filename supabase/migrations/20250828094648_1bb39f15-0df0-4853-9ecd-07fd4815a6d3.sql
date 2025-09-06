-- Add unique constraint on user_id in user_preferences table
ALTER TABLE user_preferences 
ADD CONSTRAINT unique_user_id UNIQUE (user_id);