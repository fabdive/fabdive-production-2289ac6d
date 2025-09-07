-- Vider toutes les tables de données utilisateur
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.crushes CASCADE;
TRUNCATE TABLE public.crush_notifications CASCADE;
TRUNCATE TABLE public.user_preferences CASCADE;
TRUNCATE TABLE public.matching_logs CASCADE;
TRUNCATE TABLE public.security_audit_log CASCADE;
TRUNCATE TABLE public.crush_rate_limits CASCADE;