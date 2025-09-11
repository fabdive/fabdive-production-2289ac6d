import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfileMorphologyPreferences = () => {
  const [userName, setUserName] = useState<string>("");
  const [selectedMorphologies, setSelectedMorphologies] = useState<string[]>([]);
  const [indifferent, setIndifferent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const morphologyOptions = [
    { id: 'S', label: 'S', image: '/s.png' },
    { id: 'M', label: 'M', image: '/m.png' },
    { id: 'L', label: 'L', image: '/l.png' },
    { id: 'XL', label: 'XL', image: '/xl.png' }
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
        .select('preferred_body_types')
        .eq('user_id', user.id)
        .maybeSingle();

      if (preferences?.preferred_body_types) {
        if (preferences.preferred_body_types.includes('indifferent')) {
          setIndifferent(true);
          setSelectedMorphologies([]);
        } else {
          setSelectedMorphologies(preferences.preferred_body_types);
        }
      }

    } catch (error) {
      console.error('Erreur:', error);
      navigate('/login');
    }
  };

  const toggleMorphology = (morphologyId: string) => {
    if (indifferent) {
      setIndifferent(false);
    }
    
    setSelectedMorphologies(prev => {
      if (prev.includes(morphologyId)) {
        return prev.filter(id => id !== morphologyId);
      } else {
        return [...prev, morphologyId];
      }
    });
  };

  const toggleIndifferent = () => {
    setIndifferent(!indifferent);
    if (!indifferent) {
      setSelectedMorphologies([]);
    }
  };

  const handleSavePreferences = async () => {
    if (!indifferent && selectedMorphologies.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une morphologie ou cocher 'cela m'est égal'",
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

      const preferencesToSave = indifferent ? ['indifferent'] : selectedMorphologies;

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferred_body_types: preferencesToSave,
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
          
          {/* Question */}
          <h1 className="text-3xl font-semibold mb-2 font-comfortaa animate-fade-in" style={{ color: '#fffae6' }}>
            morphologie que tu préfères ?
          </h1>
          
          <p className="text-xl mb-8 font-comfortaa" style={{ color: '#fffae6' }}>
            (choix multiple)
          </p>

          {/* Indifferent option */}
          <div className="mb-8">
            <button
              onClick={toggleIndifferent}
              className="flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all"
              style={{
                borderColor: indifferent ? '#14018d' : '#fffae6',
                backgroundColor: indifferent ? '#14018d' : 'transparent'
              }}
            >
              <div 
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: '#fffae6' }}
              >
                {indifferent && (
                  <svg className="w-4 h-4" fill="#fffae6" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-lg font-comfortaa" style={{ color: '#fffae6' }}>
                cela m'est égal ou
              </span>
            </button>
          </div>

          {/* Morphology options */}
          <div className="grid grid-cols-2 gap-6 mb-12 w-full max-w-sm animate-fade-in-2">
            {morphologyOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleMorphology(option.id)}
                disabled={indifferent}
                className="flex flex-col items-center justify-center transition-all disabled:opacity-50"
              >
                {/* Morphology image */}
                <div 
                  className={`mb-3 p-2 rounded-lg transition-all ${
                    selectedMorphologies.includes(option.id) && !indifferent
                      ? 'border-2 border-fabdive-button' 
                      : 'hover:bg-white/10'
                  }`}
                  style={selectedMorphologies.includes(option.id) && !indifferent ? { backgroundColor: '#14018d' } : {}}
                >
                  <img
                    src={option.image}
                    alt={option.label}
                    className="w-32 h-32 object-contain"
                  />
                </div>
                
                {/* Morphology label */}
                <span className="text-lg font-bold font-comfortaa" style={{ color: '#fffae6' }}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          {/* Continue button */}
          <button
            onClick={handleSavePreferences}
            disabled={isLoading || (!indifferent && selectedMorphologies.length === 0)}
            className="px-8 py-3 bg-fabdive-button text-fabdive-blue rounded-full font-medium hover:bg-fabdive-button/90 transition-all animate-fade-in-3 disabled:opacity-50 mb-8"
          >
            {isLoading ? 'Sauvegarde...' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileMorphologyPreferences;