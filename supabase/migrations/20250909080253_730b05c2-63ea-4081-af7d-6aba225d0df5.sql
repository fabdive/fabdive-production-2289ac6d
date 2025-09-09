-- Créer les tables pour le système de points et d'abonnements

-- Table pour les points gagnés par les utilisateurs
CREATE TABLE public.points_gained (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points_amount INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les abonnements offerts
CREATE TABLE public.subscription_offered (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subscription_type TEXT NOT NULL DEFAULT 'premium',
  duration_months INTEGER NOT NULL DEFAULT 1,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 month'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.points_gained ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_offered ENABLE ROW LEVEL SECURITY;

-- Policies pour points_gained
CREATE POLICY "Users can view their own points" 
ON public.points_gained 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points" 
ON public.points_gained 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policies pour subscription_offered
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscription_offered 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" 
ON public.subscription_offered 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_points_gained_updated_at
BEFORE UPDATE ON public.points_gained
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_offered_updated_at
BEFORE UPDATE ON public.subscription_offered
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour attribuer automatiquement des points et un abonnement à l'inscription
CREATE OR REPLACE FUNCTION public.grant_welcome_rewards()
RETURNS TRIGGER AS $$
BEGIN
  -- Attribuer 100 points de bienvenue
  INSERT INTO public.points_gained (user_id, points_amount, reason)
  VALUES (NEW.user_id, 100, 'Inscription et profil complété');
  
  -- Attribuer 1 mois d'abonnement premium
  INSERT INTO public.subscription_offered (user_id, subscription_type, duration_months)
  VALUES (NEW.user_id, 'premium', 1);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger qui se déclenche quand profile_completed passe à true
CREATE TRIGGER grant_welcome_rewards_trigger
AFTER UPDATE OF profile_completed ON public.profiles
FOR EACH ROW
WHEN (OLD.profile_completed IS DISTINCT FROM NEW.profile_completed AND NEW.profile_completed = true)
EXECUTE FUNCTION public.grant_welcome_rewards();