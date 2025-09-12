import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfileAppearanceImportance = () => {
  const [selectedImportance, setSelectedImportance] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const importanceOptions = [
    { 
      id: 'appearance-first', 
      label: 'Je remarque d\'abord l\'apparence',
      image: '/apparence.png'
    },
    { 
      id: 'body-mind-balance', 
      label: 'J\'aime un équilibre corps / esprit',
      image: '/equilibre.png'
    },
    { 
      id: 'inner-energy', 
      label: 'Je connecte avant tout à l\'énergie intérieure',
      image: '/interieure.png'
    }
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

      // Charger les préférences existantes
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('appearance_importance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profileError && profile?.appearance_importance) {
        setSelectedImportance(profile.appearance_importance);
      }

    } catch (error) {
      console.error('Erreur:', error);
      navigate('/login');
    }
  };

  const handleSelectImportance = (importanceId: string) => {
    setSelectedImportance(importanceId);
  };

  const handleSaveImportance = async () => {
    if (!selectedImportance) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une option",
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
          appearance_importance: selectedImportance,
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

      // Navigation vers la prochaine page
      navigate('/profile-visibility');
      
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
          
          {/* Question */}
          <h1 className="text-3xl font-bold text-center text-white mb-2 font-comfortaa animate-fade-in leading-tight">
            Quelle importance accordes-tu à
          </h1>
          <h1 className="text-3xl font-bold text-center text-white mb-12 font-comfortaa animate-fade-in leading-tight">
            l'apparence physique ?
          </h1>

          {/* Importance options */}
          <div className="space-y-6 w-full max-w-md mb-12 animate-fade-in-3">
            {importanceOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectImportance(option.id)}
                className={`w-full flex items-center space-x-4 px-6 py-6 rounded-2xl font-medium text-lg transition-all font-comfortaa ${
                  selectedImportance === option.id
                    ? 'bg-fabdive-button text-fabdive-blue'
                    : 'bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20'
                }`}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <img 
                    src={option.image} 
                    alt={option.label}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="flex-1 text-left">
                  {option.label}
                </div>
              </button>
            ))}
          </div>

          {/* Continue button */}
          <button
            onClick={handleSaveImportance}
            disabled={isLoading || !selectedImportance}
            className="px-8 py-3 bg-fabdive-button text-fabdive-blue rounded-full font-medium hover:bg-fabdive-button/90 transition-all animate-fade-in-3 disabled:opacity-50 font-comfortaa"
          >
            {isLoading ? 'Sauvegarde...' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileAppearanceImportance;