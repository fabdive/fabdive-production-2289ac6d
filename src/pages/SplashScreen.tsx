import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Iridescence from "../components/Iridescence";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const checkSessionAndRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session) {
          // Rediriger directement vers la bonne étape du profil
          const { data: profile } = await supabase
            .from('profiles')
            .select('gender, birth_date, personal_definition, location_city')
            .eq('user_id', session.user.id)
            .single();

          if (!profile) {
            navigate("/profile-photo-upload", { replace: true });
          } else if (!profile.gender) {
            navigate("/profile-gender", { replace: true });
          } else if (!profile.birth_date) {
            navigate("/profile-age", { replace: true });
          } else if (!profile.personal_definition || profile.personal_definition.length === 0) {
            navigate("/profile-appearance", { replace: true });
          } else if (!profile.location_city) {
            navigate("/profile-location", { replace: true });
          } else {
            navigate("/profile-complete", { replace: true });
          }
        } else {
          navigate("/home", { replace: true });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de session:', error);
        if (mounted) {
          navigate("/login", { replace: true });
        }
      }
    };

    // Précharger l'image fond-profil pour éviter le flash
    const preloadImage = new Image();
    preloadImage.src = '/fond-temp.png';
    
    // Délai de 4.5 secondes pour afficher le splash, puis redirection
    const timer = setTimeout(() => {
      checkSessionAndRedirect();
    }, 4500);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Iridescence Background */}
      <div className="absolute inset-0">
        <Iridescence
          color={[1, 0.3, 1]}
          mouseReact={false}
          amplitude={0.1}
          speed={1.0}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/logo-fabdive.png" 
            alt="Fabdive Logo" 
            className="w-64 h-auto mx-auto mb-4"
          />
        </div>

        {/* Tagline */}
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Game of Love
          </h1>
          <div className="space-y-3 text-white/90 text-lg">
            <p>Choisis tes cartes</p>
            <p>Laisse parler tes affinités</p>
            <p>Révèle-toi à ton rythme</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;