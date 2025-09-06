-- Suppression de la vue qui pose problème

DROP VIEW IF EXISTS public.profiles_discovery;

-- Solution finale simple : juste masquer les coordonnées GPS exactes dans l'accès direct
-- Les coordonnées sont les données les plus sensibles selon les alertes de sécurité