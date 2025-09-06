-- Nettoyage complet des tables pour les tests
-- Supprimer d'abord les données des tables publiques (l'ordre est important à cause des foreign keys)

DELETE FROM user_interactions;
DELETE FROM crushes; 
DELETE FROM user_preferences;
DELETE FROM profiles;

-- Supprimer tous les utilisateurs de auth.users (cela supprimera automatiquement les profils liés grâce à CASCADE)
DELETE FROM auth.users;