-- Supprimer la politique redondante pour nettoyer les accès aux profils
DROP POLICY IF EXISTS "No direct profile access for others" ON profiles;

-- La politique "Users can view their own profile" suffit déjà pour sécuriser l'accès