-- Nettoyer toutes les tables de données utilisateur dans l'environnement de production
DELETE FROM public.user_preferences;
DELETE FROM public.profiles;