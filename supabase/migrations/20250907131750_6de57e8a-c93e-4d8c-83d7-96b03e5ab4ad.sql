-- Nettoyer les profils orphelins (sans utilisateurs correspondants)
DELETE FROM profiles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Nettoyer les préférences orphelines (si il y en a)
DELETE FROM user_preferences 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Nettoyer les crushes orphelins (si il y en a)
DELETE FROM crushes 
WHERE sender_user_id NOT IN (SELECT id FROM auth.users);

-- Nettoyer les logs de matching orphelins (si il y en a)
DELETE FROM matching_logs 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Nettoyer les rate limits orphelins (si il y en a)
DELETE FROM crush_rate_limits 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Nettoyer les rôles utilisateur orphelins (si il y en a)
DELETE FROM user_roles 
WHERE user_id NOT IN (SELECT id FROM auth.users);