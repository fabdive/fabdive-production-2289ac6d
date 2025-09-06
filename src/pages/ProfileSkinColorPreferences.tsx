import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfileSkinColorPreferences = () => {
  const [userName, setUserName] = useState<string>("");
  const [selectedSkinColors, setSelectedSkinColors] = useState<string[]>([]);
  const [preferNotToAnswer, setPreferNotToAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const skinColorOptions = [
    { id: 'clair', label: 'Clair', image: '/couleur-clair.png' },
    { id: 'beige', label: 'Beige', image: '/couleur-beige.png' },
    { id: 'brun', label: 'Brun', image: '/couleur-brun.png' },
    { id: 'cafe', label: 'Café', image: '/couleur-cafe.png' }
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
        .select('display_name')
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

      // Charger les préférences existantes
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('preferred_skin_colors')
        .eq('user_id', user.id)
        .maybeSingle();

      if (preferences?.preferred_skin_colors && preferences.preferred_skin_colors.length > 0) {
        if (preferences.preferred_skin_colors.includes('prefer_not_to_answer')) {
          setPreferNotToAnswer(true);
          setSelectedSkinColors([]);
        } else {
          setSelectedSkinColors(preferences.preferred_skin_colors);
        }
      }

    } catch (error) {
      console.error('Erreur:', error);
      navigate('/login');
    }
  };

  const toggleSkinColor = (colorId: string) => {
    if (preferNotToAnswer) {
      setPreferNotToAnswer(false);
    }
    
    setSelectedSkinColors(prev => {
      if (prev.includes(colorId)) {
        return prev.filter(id => id !== colorId);
      } else {
        return [...prev, colorId];
      }
    });
  };

  const togglePreferNotToAnswer = () => {
    setPreferNotToAnswer(!preferNotToAnswer);
    if (!preferNotToAnswer) {
      setSelectedSkinColors([]);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferNotToAnswer && selectedSkinColors.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une couleur de peau ou cocher 'je préfère ne pas répondre'",
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

      const preferencesToSave = preferNotToAnswer ? ['prefer_not_to_answer'] : selectedSkinColors;

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferred_skin_colors: preferencesToSave,
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
      navigate('/profile-location');
      
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
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-6 text-center pt-16">
          
          {/* Personal skin color display */}
          <h1 className="text-3xl font-semibold mb-4 font-comfortaa animate-fade-in" style={{ color: '#fffae6' }}>
            Ta couleur de peau
          </h1>
          
          <div className="mb-8">
            <div className="w-20 h-20 rounded-full mx-auto bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <img
                src="/couleur-clair.png"
                alt="Ta couleur de peau"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
          </div>

          {/* Question for preferences */}
          <h2 className="text-2xl font-semibold mb-2 font-comfortaa animate-fade-in" style={{ color: '#fffae6' }}>
            Couleur(s) de peau recherchée(s) ?
          </h2>
          
          <p className="text-lg mb-8 font-comfortaa animate-fade-in" style={{ color: '#fffae6' }}>
            (choix multiple)
          </p>

          {/* Skin color options */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 animate-fade-in-2">
            <div className="flex justify-center gap-4 w-full max-w-lg mx-auto">
              {skinColorOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => toggleSkinColor(option.id)}
                  disabled={preferNotToAnswer}
                  className="flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {/* Color circle */}
                  <div 
                    className={`p-2 rounded-full transition-all ${
                      selectedSkinColors.includes(option.id) && !preferNotToAnswer
                        ? 'ring-4 ring-fabdive-button' 
                        : 'hover:bg-white/10'
                    }`}
                    style={selectedSkinColors.includes(option.id) && !preferNotToAnswer ? { backgroundColor: '#14018d' } : {}}
                  >
                    <img
                      src={option.image}
                      alt={option.label}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                  {/* Label */}
                  <span className="text-sm font-comfortaa" style={{ color: '#fffae6' }}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Prefer not to answer text */}
          <div className="mb-8">
            <button
              onClick={togglePreferNotToAnswer}
              className="flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all"
              style={{
                borderColor: preferNotToAnswer ? '#14018d' : '#fffae6',
                backgroundColor: preferNotToAnswer ? '#14018d' : 'transparent'
              }}
            >
              <div 
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: '#fffae6' }}
              >
                {preferNotToAnswer && (
                  <svg className="w-4 h-4" fill="#fffae6" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-lg font-comfortaa" style={{ color: '#fffae6' }}>
                Je préfère ne pas répondre
              </span>
            </button>
          </div>

          {/* Continue button */}
          <button
            onClick={handleSavePreferences}
            disabled={isLoading || (!preferNotToAnswer && selectedSkinColors.length === 0)}
            className="px-8 py-3 bg-fabdive-button text-fabdive-blue rounded-full font-medium hover:bg-fabdive-button/90 transition-all animate-fade-in-3 disabled:opacity-50 mb-8"
          >
            {isLoading ? 'Sauvegarde...' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkinColorPreferences;