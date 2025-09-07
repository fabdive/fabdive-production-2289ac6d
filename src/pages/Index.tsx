import { useEffect, useState } from "react";
import { SignupForm } from "@/components/SignupForm";
import { CookieConsent } from "@/components/CookieConsent";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);

  useEffect(() => {
    // Vérifier s'il y a une erreur dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (errorParam || window.location.hash.includes('error')) {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: errorDescription || "Le lien magique a expiré ou est invalide."
      });
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsProcessingAuth(true);
          
          toast({
            title: "Connexion réussie !",
            description: "Tu es maintenant connecté."
          });

          // Rediriger vers la logique de profil
          await redirectUserBasedOnProfile(session.user.id);
        }
      }
    );

    // Vérifier aussi la session actuelle
    const checkCurrentSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsProcessingAuth(true);
        await redirectUserBasedOnProfile(session.user.id);
      }
    };

    checkCurrentSession();

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const redirectUserBasedOnProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Pour les nouveaux utilisateurs, commencer par la photo
      if (!profile) {
        navigate("/profile-photo-upload");
        return;
      }

      // Vérifier quelle étape du profil n'est pas complète
      if (!profile.gender) {
        navigate("/profile-gender");
      } else {
      // Vérifier si l'âge est rempli
      const { data: ageProfile } = await supabase
        .from('profiles')
        .select('birth_date, personal_definition, location_city, personality_traits')
        .eq('user_id', userId)
        .single();
        
      if (!ageProfile?.birth_date) {
        navigate("/profile-age");
      } else if (!ageProfile?.personal_definition || ageProfile.personal_definition.length === 0) {
        navigate("/profile-appearance");
      } else if (!ageProfile?.location_city) {
        navigate("/profile-location");
      } else if (!ageProfile?.personality_traits || ageProfile.personality_traits.length === 0) {
        navigate("/profile-archetype");
      } else {
        // Profil complet, aller au profil complete
        navigate("/profile-complete");
      }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du profil:', error);
      // En cas d'erreur, rediriger vers l'upload de photo
      navigate("/profile-photo-upload");
    }
  };

  if (isProcessingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fabdive-primary to-fabdive-secondary">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-fabdive-button border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-fabdive-text">Finalisation de la connexion...</p>
        </div>
      </div>
    );
  }

  const handleCookieAccept = () => {
    console.log("Cookies acceptés");
    // Ici vous pouvez activer les cookies d'analyse/marketing
  };

  const handleCookieDecline = () => {
    console.log("Cookies refusés");
    // Ici vous pouvez désactiver les cookies non-essentiels
  };

  const handleCookieClose = () => {
    console.log("Banner fermé");
  };

  return (
    <div className="min-h-screen">
      <SignupForm />
      <CookieConsent
        onAccept={handleCookieAccept}
        onDecline={handleCookieDecline}
        onClose={handleCookieClose}
      />
    </div>
  );
};

export default Index;
