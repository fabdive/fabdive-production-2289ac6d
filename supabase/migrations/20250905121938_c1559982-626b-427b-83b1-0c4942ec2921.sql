-- Nettoyer toutes les données des tables pour permettre un nouveau test
-- ATTENTION: Ceci supprime TOUTES les données utilisateur

-- 1. Supprimer toutes les interactions utilisateur
DELETE FROM public.user_interactions;

-- 2. Supprimer tous les crushes
DELETE FROM public.crushes;

-- 3. Supprimer toutes les préférences utilisateur
DELETE FROM public.user_preferences;

-- 4. Supprimer tous les profils
DELETE FROM public.profiles;

-- 5. Nettoyer le bucket de photos de profil
DELETE FROM storage.objects WHERE bucket_id = 'profile-photos';