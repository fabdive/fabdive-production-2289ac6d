-- Nettoyer toutes les données orphelines dans les tables
DELETE FROM crush_notifications;
DELETE FROM crush_rate_limits;
DELETE FROM crushes;
DELETE FROM matching_logs;
DELETE FROM user_preferences;
DELETE FROM profiles;
DELETE FROM user_roles;