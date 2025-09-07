-- Nettoyage complet de toutes les tables pour repartir à zéro
DELETE FROM public.crush_notifications;
DELETE FROM public.crush_rate_limits;
DELETE FROM public.crushes;
DELETE FROM public.matching_logs;
DELETE FROM public.user_preferences;
DELETE FROM public.profiles;
DELETE FROM public.user_roles;
DELETE FROM public.security_audit_log;