-- Corriger les paramètres de sécurité OTP
-- Réduire l'expiration OTP à 1 heure (3600 secondes) au lieu de la valeur par défaut

-- Note: Ces paramètres peuvent également nécessiter une configuration dans le dashboard Supabase
-- sous Authentication > Settings > Email auth settings

-- Configurer les paramètres d'expiration des tokens
INSERT INTO auth.config (parameter, value) 
VALUES ('EMAIL_OTP_EXP', '3600')
ON CONFLICT (parameter) 
DO UPDATE SET value = '3600';

-- Configurer l'expiration des magic links
INSERT INTO auth.config (parameter, value) 
VALUES ('MAGIC_LINK_EXP', '3600')
ON CONFLICT (parameter) 
DO UPDATE SET value = '3600';

-- Configurer l'expiration des tokens de récupération
INSERT INTO auth.config (parameter, value) 
VALUES ('RECOVERY_TOKEN_EXP', '3600')
ON CONFLICT (parameter) 
DO UPDATE SET value = '3600';