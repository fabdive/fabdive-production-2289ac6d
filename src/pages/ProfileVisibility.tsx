import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfileVisibility = () => {
  const [selectedVisibility, setSelectedVisibility] = useState<string>('');
  const [selectedPhotoVisibility, setSelectedPhotoVisibility] = useState<string>('');
  const [previousChoice, setPreviousChoice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const visibilityOptions = [
    { 
      id: 'all', 
      label: 'Tous'
    },
    { 
      id: 'high-match', 
      label: 'Uniquement les profils >50% d\'affinité'
    },
    { 
      id: 'very-high-match', 
      label: 'Uniquement les profils >70% d\'affinité'
    }
  ];

  const photoVisibilityOptions = [
    { 
      id: 'immediate', 
      label: 'Tout de suite'
    },
    { 
      id: 'after-match', 
      label: 'Après affinité confirmée'
    }
  ];

  const getAppearanceImportanceLabel = (importance: string) => {
    switch (importance) {
      case 'appearance-first':
        return 'Je remarque d\'abord l\'apparence';
      case 'body-mind-balance':
        return 'J\'aime un équilibre corps / esprit';
      case 'inner-energy':
        return 'Je connecte avant tout à l\'énergie intérieure';
      default:
        return '';
    }
  };

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

      // Charger les préférences existantes
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('profile_visibility, photo_visibility, appearance_importance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profileError && profile) {
        if (profile.profile_visibility) {
          setSelectedVisibility(profile.profile_visibility);
        }
        if (profile.photo_visibility) {
          setSelectedPhotoVisibility(profile.photo_visibility);
        }
        if (profile.appearance_importance) {
          setPreviousChoice(getAppearanceImportanceLabel(profile.appearance_importance));
        }
      }

    } catch (error) {
      console.error('Erreur:', error);
      navigate('/login');
    }
  };

  const handleSelectVisibility = (visibilityId: string) => {
    setSelectedVisibility(visibilityId);
  };

  const handleSelectPhotoVisibility = (photoVisibilityId: string) => {
    setSelectedPhotoVisibility(photoVisibilityId);
  };

  const handleSaveVisibility = async () => {
    if (!selectedVisibility || !selectedPhotoVisibility) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner toutes les options",
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
        .from('profiles')
        .update({
          profile_visibility: selectedVisibility,
          photo_visibility: selectedPhotoVisibility,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder votre choix",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Succès",
        description: "Préférences sauvegardées avec succès",
      });

      // Navigation vers la page de profil complet
      navigate('/profile-complete');
      
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
      <div 
        className="min-h-screen bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(/lovable-uploads/79534e7d-2c05-4985-82c5-60b4b4fc78b4.png)'
        }}
      >
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-6 text-center pt-16 pb-8">
          
          {/* Previous choice reminder */}
          {previousChoice && (
            <div className="mb-8 animate-fade-in">
              <p className="text-white/80 text-lg mb-4 font-comfortaa">Ton choix</p>
              <div className="flex items-center justify-center space-x-4 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img 
                    src="/equilibre.png" 
                    alt="Équilibre"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <span className="text-white font-comfortaa">{previousChoice}</span>
              </div>
            </div>
          )}

          {/* Question */}
          <h1 className="text-3xl font-bold text-center text-white mb-12 font-comfortaa animate-fade-in leading-tight">
            Préfères-tu que ton profil soit visible à ?
          </h1>

          {/* Visibility options */}
          <div className="space-y-6 w-full max-w-md mb-12 animate-fade-in-3">
            {visibilityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectVisibility(option.id)}
                className={`w-full flex items-center justify-center px-6 py-6 rounded-2xl font-medium text-lg transition-all font-comfortaa ${
                  selectedVisibility === option.id
                    ? 'bg-fabdive-button text-fabdive-blue'
                    : 'bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20'
                }`}
              >
                <div className="text-center">
                  {option.label}
                </div>
              </button>
            ))}
          </div>

          {/* Photo visibility question */}
          <h2 className="text-2xl font-bold text-center text-white mb-8 font-comfortaa animate-fade-in leading-tight">
            Souhaites-tu que ta photo soit visible ?
          </h2>

          {/* Photo visibility options */}
          <div className="space-y-6 w-full max-w-md mb-12 animate-fade-in-3">
            {photoVisibilityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectPhotoVisibility(option.id)}
                className={`w-full flex items-center justify-center px-6 py-6 rounded-2xl font-medium text-lg transition-all font-comfortaa ${
                  selectedPhotoVisibility === option.id
                    ? 'bg-fabdive-button text-fabdive-blue'
                    : 'bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20'
                }`}
              >
                <div className="text-center">
                  {option.label}
                </div>
              </button>
            ))}
          </div>

          {/* Continue button */}
          <button
            onClick={handleSaveVisibility}
            disabled={isLoading || !selectedVisibility || !selectedPhotoVisibility}
            className="px-8 py-3 bg-fabdive-button text-fabdive-blue rounded-full font-medium hover:bg-fabdive-button/90 transition-all animate-fade-in-3 disabled:opacity-50 font-comfortaa"
          >
            {isLoading ? 'Sauvegarde...' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileVisibility;