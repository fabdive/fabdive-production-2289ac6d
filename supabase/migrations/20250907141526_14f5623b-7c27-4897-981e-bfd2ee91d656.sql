-- Nettoyer toutes les tables des données utilisateurs
DELETE FROM public.crushes;
DELETE FROM public.crush_notifications;
DELETE FROM public.crush_rate_limits;
DELETE FROM public.matching_logs;
DELETE FROM public.user_preferences;
DELETE FROM public.profiles;
DELETE FROM public.security_audit_log;