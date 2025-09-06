-- Supprimer toutes les vues avec SECURITY DEFINER pour corriger le problème de sécurité

-- Lister et supprimer toutes les vues problématiques
DROP VIEW IF EXISTS public.crushes_secure CASCADE;
DROP VIEW IF EXISTS public.profiles_public CASCADE;

-- S'assurer qu'aucune vue n'utilise SECURITY DEFINER
-- (Cette commande va lister les vues existantes pour diagnostic)
-- Nous allons recréer des solutions plus sûres sans SECURITY DEFINER

-- Vérifier qu'il n'y a plus de vues problématiques
-- Les vues sans SECURITY DEFINER sont sûres et utilisent les politiques RLS normalement