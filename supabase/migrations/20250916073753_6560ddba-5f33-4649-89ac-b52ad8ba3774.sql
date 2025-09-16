-- Attribuer le rôle admin au propriétaire du projet
INSERT INTO public.user_roles (user_id, role) 
VALUES ('5768d829-ed0d-4b28-a12e-197d757a1418', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;