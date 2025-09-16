-- Supprimer le rôle admin de l'ancien utilisateur et l'attribuer au nouveau
DELETE FROM public.user_roles WHERE user_id = '5768d829-ed0d-4b28-a12e-197d757a1418' AND role = 'admin';

INSERT INTO public.user_roles (user_id, role) 
VALUES ('e6fb1fc8-463c-410c-9ae9-42987a8c9218', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;