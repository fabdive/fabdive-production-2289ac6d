-- Nettoyer toutes les tables et supprimer les utilisateurs
DELETE FROM public.crushes;
DELETE FROM public.crush_notifications;
DELETE FROM public.crush_rate_limits;
DELETE FROM public.matching_logs;
DELETE FROM public.user_preferences;
DELETE FROM public.profiles;
DELETE FROM public.security_audit_log;

-- Supprimer tous les utilisateurs de auth.users
DELETE FROM auth.users;