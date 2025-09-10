import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Iridescence from "../components/Iridescence";

const MIN_SPLASH_MS = 4500;

const SplashScreen = () => {
  const [showContent, setShowContent] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    const startAt = performance.now();
    console.log('[SPLASH] Component mounted at:', startAt);

    const handleRedirection = async () => {
      console.log('[SPLASH] Starting redirection check...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        console.log('[SPLASH] Session check completed, session exists:', !!session);

        const go = (path: string) => {
          console.log('[SPLASH] Redirecting to:', path);
          navigate(path, { replace: true });
        };

        if (session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          const { data: preferences } = await supabase
            .from("user_preferences")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          if (!profile) go("/profile-photo-upload");
          else if (!profile.gender) go("/profile-gender");
          else if (!profile.birth_date) go("/profile-age");
          else if (!profile.personal_definition || profile.personal_definition.length === 0) go("/profile-appearance");
          else if (!profile.appearance_importance) go("/profile-appearance-importance");
          else if (!profile.location_city) go("/profile-location");
          else if (!profile.personality_traits || profile.personality_traits.length === 0) go("/profile-archetype");
          else if (!preferences?.preferred_personality_types || preferences.preferred_personality_types.length === 0) go("/profile-archetype-preferences");
          else if (!preferences?.seeking_relationship_types || preferences.seeking_relationship_types.length === 0) go("/profile-objectives");
          else if (!preferences?.preferred_age_min || !preferences?.preferred_age_max) go("/profile-target-age");
          else if (!preferences?.preferred_distances || preferences.preferred_distances.length === 0) go("/profile-distance");
          else if (!preferences?.preferred_body_types || preferences.preferred_body_types.length === 0) go("/profile-morphology-preferences");
          else if (!profile.skin_color) go("/profile-skin-color");
          else if (!preferences?.preferred_skin_colors || preferences.preferred_skin_colors.length === 0) go("/profile-skin-color-preferences");
          else if (!profile.height_cm) go("/profile-height");
          else if (!profile.age_confirmed) go("/profile-height-confirmation");
          else if (!preferences?.preferred_heights || preferences.preferred_heights.length === 0) go("/profile-height-preferences");
          else if (!profile.profile_visibility) go("/profile-visibility");
          else if (!profile.profile_completed) go("/profile-complete");
          else go("/my-matches");
        } else {
          go(`/home${location.search}`);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error);
        if (mounted) navigate("/login", { replace: true });
      }
    };

    // Garantir 4.5s minimum d'affichage SANS provoquer de reflow
    const timer = setTimeout(() => { handleRedirection(); }, Math.max(0, MIN_SPLASH_MS - (performance.now() - startAt)));

    return () => { mounted = false; clearTimeout(timer); };
  }, [navigate, location.search]);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      {/* Iridescence Background (fixé plein écran pour éviter le reflow) */}
      <div className="fixed inset-0">
        <Iridescence color={[1, 0.3, 1]} mouseReact={false} amplitude={0.1} speed={1.0} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-6 text-center">
        <div className="mb-8">
          <img
            src="/2logo-fabdive.png"
            alt="Fabdive Logo"
            width={256}
            height={96}
            decoding="async"
            fetchPriority="high"
            className="w-64 h-auto mx-auto mb-4"
          />
        </div>

        {showContent && (
          <div className="max-w-md space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Rencontres par affinités</h1>
            <div className="space-y-3 text-white/90 text-lg">
              <p>Choisis tes cartes</p>
              <p>Laisse parler tes affinités</p>
              <p>Révèle toi à ton rythme</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;