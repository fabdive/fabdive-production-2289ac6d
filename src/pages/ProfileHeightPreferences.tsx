import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfileHeightPreferences = () => {
  const [userName, setUserName] = useState<string>("");
  const [userHeight, setUserHeight] = useState<number | null>(null);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const heightOptions = [
    { id: 'smaller', label: 'Plus petit(e)' },
    { id: 'same', label: 'Même taille' },
    { id: 'taller', label: 'Plus grand(e)' },
    { id: 'no_preference', label: 'Peu importe' }
  ];

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

      // Charger les préférences existantes
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('preferred_heights')
        .eq('user_id', user.id)
        .maybeSingle();

      if (preferences?.preferred_heights) {
        setSelectedPreferences(preferences.preferred_heights);
      }

    } catch (error) {
      console.error('Erreur:', error);
      navigate('/login');
    }
  };

  const formatHeight = (height: number) => {
    return `${(height / 100).toFixed(2)} m`;
  };

  const togglePreference = (preferenceId: string) => {
    setSelectedPreferences(prev => {
      if (prev.includes(preferenceId)) {
        return prev.filter(id => id !== preferenceId);
      } else {
        return [...prev, preferenceId];
      }
    });
  };

  const handleSavePreferences = async () => {
    if (selectedPreferences.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une préférence",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferred_heights: selectedPreferences,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder vos préférences",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Navigation vers la prochaine page
      navigate('/profile-height-confirmation');
      
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Background image */}
      <div className="min-h-screen relative bg-background">
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-6 text-center pt-16">
          
          {/* User height display */}
          <div className="mb-8 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 font-comfortaa" style={{ color: '#fffae6' }}>
              Ta taille
            </h2>
            
            {userHeight && (
              <div className="inline-block px-8 py-4 bg-fabdive-button rounded-full border-4 border-fabdive-blue">
                <p className="text-2xl font-bold text-fabdive-blue">
                  {formatHeight(userHeight)}
                </p>
              </div>
            )}
          </div>

          {/* Height preferences question */}
          <h1 className="text-2xl font-semibold mb-2 font-comfortaa animate-fade-in-1" style={{ color: '#fffae6' }}>
            Taille recherchée chez l'autre ?
          </h1>
          
          <p className="text-lg mb-12 font-comfortaa animate-fade-in-1" style={{ color: '#fffae6' }}>
            (choix multiple)
          </p>

          {/* Height preference options */}
          <div className="grid grid-cols-2 gap-6 mb-12 w-full max-w-md animate-fade-in-2">
            {heightOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => togglePreference(option.id)}
                className={`flex items-center justify-start p-4 rounded-lg transition-all ${
                  selectedPreferences.includes(option.id)
                    ? 'border border-fabdive-button' 
                    : 'bg-white/10 border border-transparent hover:bg-white/20'
                }`}
                style={selectedPreferences.includes(option.id) ? { backgroundColor: '#14018d' } : {}}
              >
                <div
                  className={`w-6 h-6 rounded-full border-3 mr-4 flex items-center justify-center transition-all ${
                    selectedPreferences.includes(option.id)
                      ? 'bg-fabdive-button border-fabdive-button'
                      : 'border-fabdive-button bg-transparent'
                  }`}
                >
                  {selectedPreferences.includes(option.id) && (
                    <div className="w-3 h-3 rounded-full bg-fabdive-blue"></div>
                  )}
                </div>
                <span className="text-lg font-medium font-comfortaa" style={{ color: '#fffae6' }}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          {/* Continue button */}
          <button
            onClick={handleSavePreferences}
            disabled={isLoading || selectedPreferences.length === 0}
            className="px-8 py-3 bg-fabdive-button text-fabdive-blue rounded-full font-medium hover:bg-fabdive-button/90 transition-all animate-fade-in-3 disabled:opacity-50"
          >
            {isLoading ? 'Sauvegarde...' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeightPreferences;