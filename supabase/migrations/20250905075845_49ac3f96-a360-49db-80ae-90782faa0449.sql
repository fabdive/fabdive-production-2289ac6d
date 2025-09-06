-- Vider toutes les données de test
DELETE FROM public.crushes;
DELETE FROM public.user_preferences;
DELETE FROM public.profiles;

-- Supprimer les utilisateurs de auth.users (cela supprimera en cascade les profils liés)
DELETE FROM auth.users;