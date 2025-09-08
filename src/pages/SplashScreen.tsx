import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Iridescence from "../components/Iridescence";

const SplashScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    
    const checkSessionAndRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session) {
          // Vérifier l'état du profil et rediriger vers la bonne étape
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          const { data: preferences } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          console.log('Profile data:', profile);
          console.log('Preferences data:', preferences);

          if (!profile) {
            console.log('Redirecting to profile-photo-upload: no profile');
            navigate("/profile-photo-upload", { replace: true });
          } else if (!profile.gender) {
            console.log('Redirecting to profile-gender: no gender');
            navigate("/profile-gender", { replace: true });
          } else if (!profile.birth_date) {
            console.log('Redirecting to profile-age: no birth_date');
            navigate("/profile-age", { replace: true });
          } else if (!profile.personal_definition || profile.personal_definition.length === 0) {
            console.log('Redirecting to profile-appearance: no personal_definition');
            navigate("/profile-appearance", { replace: true });
          } else if (!profile.appearance_importance) {
            console.log('Redirecting to profile-appearance-importance: no appearance_importance');
            navigate("/profile-appearance-importance", { replace: true });
          } else if (!profile.location_city) {
            console.log('Redirecting to profile-location: no location_city');
            navigate("/profile-location", { replace: true });
          } else if (!profile.personality_traits || profile.personality_traits.length === 0) {
            console.log('Redirecting to profile-archetype: no personality_traits');
            navigate("/profile-archetype", { replace: true });
          } else if (!preferences?.preferred_personality_types || preferences.preferred_personality_types.length === 0) {
            console.log('Redirecting to profile-archetype-preferences: no preferred_personality_types');
            navigate("/profile-archetype-preferences", { replace: true });
          } else if (!preferences?.seeking_relationship_types || preferences.seeking_relationship_types.length === 0) {
            console.log('Redirecting to profile-objectives: no seeking_relationship_types in preferences');
            navigate("/profile-objectives", { replace: true });
          } else if (!preferences?.preferred_age_min || !preferences?.preferred_age_max) {
            console.log('Redirecting to profile-target-age: no age preferences');
            navigate("/profile-target-age", { replace: true });
          } else if (!preferences?.preferred_distances || preferences.preferred_distances.length === 0) {
            console.log('Redirecting to profile-distance: no preferred_distances');
            navigate("/profile-distance", { replace: true });
          } else if (!preferences?.preferred_body_types || preferences.preferred_body_types.length === 0) {
            console.log('Redirecting to profile-morphology-preferences: no preferred_body_types');
            navigate("/profile-morphology-preferences", { replace: true });
          } else if (!profile.skin_color) {
            console.log('Redirecting to profile-skin-color: no skin_color');
            navigate("/profile-skin-color", { replace: true });
          } else if (!preferences?.preferred_skin_colors || preferences.preferred_skin_colors.length === 0) {
            console.log('Redirecting to profile-skin-color-preferences: no preferred_skin_colors');
            navigate("/profile-skin-color-preferences", { replace: true });
          } else if (!profile.height_cm) {
            console.log('Redirecting to profile-height: no height_cm');
            navigate("/profile-height", { replace: true });
          } else if (!profile.age_confirmed) {
            console.log('Redirecting to profile-height-confirmation: no age_confirmed');
            navigate("/profile-height-confirmation", { replace: true });
          } else if (!preferences?.preferred_heights || preferences.preferred_heights.length === 0) {
            console.log('Redirecting to profile-height-preferences: no preferred_heights');
            navigate("/profile-height-preferences", { replace: true });
          } else if (!profile.profile_visibility) {
            console.log('Redirecting to profile-visibility: no profile_visibility');
            navigate("/profile-visibility", { replace: true });
          } else if (!profile.profile_completed) {
            console.log('Profile not marked as completed, redirecting to profile-complete');
            navigate("/profile-complete", { replace: true });
          } else {
            // Toutes les étapes sont complètes - rediriger vers les matches ou dashboard
            console.log('Profile fully completed, redirecting to my-matches');
            navigate("/my-matches", { replace: true });
          }
        } else {
          navigate(`/home${location.search}`, { replace: true });
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
            src="/2logo-fabdive.png" 
            alt="Fabdive Logo" 
            className="w-64 h-auto mx-auto mb-4"
          />
        </div>

        {/* Tagline - Force cache refresh */}
        <div className="max-w-md space-y-4" key={`splash-${Date.now()}`}>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6" key="title-aggressive">
            Rencontres par affinités
          </h1>
          <div className="space-y-3 text-white/90 text-lg" key="phrases-aggressive">
            <p key="p1-aggressive">Choisis tes cartes</p>
            <p key="p2-aggressive">Laisse parler tes affinités</p>
            <p key="p3-aggressive">Révèle toi à ton rythme</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;