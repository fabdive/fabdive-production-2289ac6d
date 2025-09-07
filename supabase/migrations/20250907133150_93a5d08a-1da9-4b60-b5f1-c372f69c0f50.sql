-- Nettoyer les données orphelines après suppression d'utilisateurs
-- Supprimer les profils orphelins
DELETE FROM profiles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Supprimer les préférences orphelines
DELETE FROM user_preferences 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Supprimer les crushes orphelins
DELETE FROM crushes 
WHERE sender_user_id NOT IN (SELECT id FROM auth.users);

-- Supprimer les logs de matching orphelins
DELETE FROM matching_logs 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Supprimer les limites de taux orphelines
DELETE FROM crush_rate_limits 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Supprimer les rôles utilisateur orphelins
DELETE FROM user_roles 
WHERE user_id NOT IN (SELECT id FROM auth.users);