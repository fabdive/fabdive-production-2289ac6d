import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfileHeightConfirmation = () => {
  const [userName, setUserName] = useState<string>("");
  const [userHeight, setUserHeight] = useState<number | null>(null);
  const [heightPreferences, setHeightPreferences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Charger le profil existant
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('display_name, height_cm')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Erreur lors du chargement du profil:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil",
          variant: "destructive",
        });
        return;
      }

      // Définir le nom d'affichage
      const displayName = profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Utilisateur';
      setUserName(displayName);
      
      console.log('Profile data:', profile);
      console.log('Height from profile:', profile?.height_cm);
      if (profile?.height_cm) {
        setUserHeight(profile.height_cm);
        console.log('Height set to:', profile.height_cm);
      } else {
        console.log('No height found in profile');
      }

      // Charger les préférences de taille
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('preferred_heights')
        .eq('user_id', user.id)
        .maybeSingle();

      if (preferences?.preferred_heights) {
        setHeightPreferences(preferences.preferred_heights);
      }

    } catch (error) {
      console.error('Erreur:', error);
      navigate('/login');
    }
  };

  const formatHeight = (height: number) => {
    return `${(height / 100).toFixed(2)} m`;
  };

  const getPreferenceText = () => {
    if (heightPreferences.length === 0) return "Aucune préférence sélectionnée";
    
    const preferenceLabels: { [key: string]: string } = {
      'smaller': 'Plus petit(e)',
      'same': 'Même taille',
      'taller': 'Plus grand(e)',
      'no_preference': 'Peu importe'
    };

    if (heightPreferences.length === 1) {
      return preferenceLabels[heightPreferences[0]];
    }

    if (heightPreferences.length === 2 && 
        heightPreferences.includes('same') && heightPreferences.includes('taller')) {
      return "Même taille à plus grand";
    }

    if (heightPreferences.length === 2 && 
        heightPreferences.includes('smaller') && heightPreferences.includes('same')) {
      return "Plus petit(e) à même taille";
    }

    // Pour d'autres combinaisons
    const labels = heightPreferences.map(pref => preferenceLabels[pref]).join(', ');
    return labels;
  };

  const handleContinue = async () => {
    setIsLoading(true);
    // Navigation vers la prochaine page
    navigate('/profile-appearance');
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Background image */}
      <div className="min-h-screen relative bg-background">
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-6 text-center pt-16">
          
          {/* User height display */}
          <div className="mb-16 animate-fade-in">
            <h2 className="text-xl font-semibold mb-6 font-comfortaa" style={{ color: '#fffae6' }}>
              Ta taille
            </h2>
            
            {userHeight && (
              <div className="inline-block px-6 py-3 bg-fabdive-button rounded-full border-2 border-fabdive-blue">
                <p className="text-xl font-bold text-fabdive-blue">
                  {formatHeight(userHeight)}
                </p>
              </div>
            )}
          </div>

          {/* Height preferences confirmation */}
          <div className="mb-16 animate-fade-in-1">
            <h2 className="text-xl font-semibold mb-6 font-comfortaa" style={{ color: '#fffae6' }}>
              Taille recherchée chez l'autre
            </h2>
            
            <div 
              className="inline-block px-8 py-4 rounded-full border-2"
              style={{ 
                backgroundColor: '#14018d',
                borderColor: '#ffd700'
              }}
            >
              <p className="text-xl font-medium font-comfortaa" style={{ color: '#fffae6' }}>
                {getPreferenceText()}
              </p>
            </div>
          </div>

          {/* Continue button */}
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="px-8 py-3 bg-fabdive-button text-fabdive-blue rounded-full font-medium hover:bg-fabdive-button/90 transition-all animate-fade-in-3 disabled:opacity-50"
          >
            {isLoading ? 'Chargement...' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeightConfirmation;