-- Nettoyer toutes les données des tables utilisateur pour les tests
DELETE FROM public.crush_notifications;
DELETE FROM public.crush_rate_limits;
DELETE FROM public.crushes;
DELETE FROM public.matching_logs;
DELETE FROM public.points_gained;
DELETE FROM public.subscription_offered;
DELETE FROM public.user_preferences;
DELETE FROM public.user_roles;
DELETE FROM public.security_audit_log;
DELETE FROM public.profiles;