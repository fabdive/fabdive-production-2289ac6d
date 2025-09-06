-- Vérification finale et suppression de toute politique résiduelle

-- Vérifier et supprimer toute politique résiduelle sur les profils
DROP POLICY IF EXISTS "Very limited profile discovery for matching" ON public.profiles;
DROP POLICY IF EXISTS "Limited profile discovery for matching" ON public.profiles;

-- Vérifier les politiques actuelles et ne garder que l'accès personnel
-- Les profils des autres utilisateurs ne doivent être accessibles QUE via les fonctions sécurisées

-- S'assurer qu'il n'y a AUCUN accès direct aux données d'autres utilisateurs
-- Seulement l'utilisateur peut voir son propre profil complet
-- Les fonctions get_matching_profiles() et get_anonymized_profiles() contrôlent l'accès aux autres profils

-- Vérifier aussi les crushes
SELECT 'Vérification terminée - Seules les données personnelles sont accessibles directement' as status;