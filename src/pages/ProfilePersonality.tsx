import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfilePersonality = () => {
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const personalityOptions = [
    { id: 'curious', label: 'Curieux(se)' },
    { id: 'intuitive', label: 'Intuitif(ve)' },
    { id: 'reserved', label: 'Réservé(e)' },
    { id: 'sunny', label: 'Solaire' },
    { id: 'listener', label: 'À l\'écoute' },
    { id: 'bit-of-everything', label: 'Un peu tout ça' }
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
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!prefError && preferences) {
        // Charger les objectifs sélectionnés précédemment
        const seekingTypes = (preferences as any).seeking_relationship_types;
        if (seekingTypes && Array.isArray(seekingTypes)) {
          setSelectedObjectives(seekingTypes);
        }

        // Charger les traits de personnalité existants
        const personalityTypes = (preferences as any).preferred_personality_types;
        if (personalityTypes && Array.isArray(personalityTypes) && personalityTypes.length > 0) {
          setSelectedPersonalities(personalityTypes);
        }
      }

    } catch (error) {
      console.error('Erreur:', error);
      navigate('/login');
    }
  };

  const togglePersonality = (personalityId: string) => {
    setSelectedPersonalities(prev => {
      if (prev.includes(personalityId)) {
        return prev.filter(id => id !== personalityId);
      } else {
        return [...prev, personalityId];
      }
    });
  };

  const handleSavePersonality = async () => {
    if (selectedPersonalities.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un trait de personnalité",
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
          preferred_personality_types: selectedPersonalities,
        } as any, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder vos traits de personnalité",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Navigation vers la prochaine page
      navigate('/profile-archetype');
      
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

  const getObjectiveLabel = (id: string) => {
    const labels: { [key: string]: string } = {
      'prefer-not-answer': 'Je préfère ne pas répondre',
      'serious-relationship': 'Une relation sérieuse',
      'beautiful-encounter': 'Une belle rencontre',
      'unique-connection': 'Une connexion unique',
      'not-sure': 'Je ne sais pas encore'
    };
    return labels[id] || id;
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Background image */}
      <div className="min-h-screen relative bg-background">
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-6 text-center pt-16">
          
          {/* Selected objectives display */}
          <h2 className="text-2xl font-semibold text-center text-white mb-6 font-comfortaa animate-fade-in">
            Tu souhaites
          </h2>
          
          <div className="space-y-3 mb-12 animate-fade-in-2">
            {selectedObjectives.map((objectiveId) => (
              <div
                key={objectiveId}
                className="bg-fabdive-button text-fabdive-blue px-8 py-3 rounded-full font-medium text-lg"
              >
                {getObjectiveLabel(objectiveId)}
              </div>
            ))}
          </div>

          {/* Personality question */}
          <h1 className="text-3xl font-bold text-center text-white mb-4 font-comfortaa animate-fade-in-2">
            Tu es plutôt
          </h1>
          
          <p className="text-lg mb-8 font-comfortaa animate-fade-in-2 text-white/90">
            (choix multiple)
          </p>

          {/* Personality options */}
          <div className="space-y-4 w-full max-w-md mb-12 animate-fade-in-3">
            {personalityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => togglePersonality(option.id)}
                className={`w-full px-6 py-4 rounded-2xl font-medium text-lg transition-all font-comfortaa ${
                  selectedPersonalities.includes(option.id)
                    ? 'bg-fabdive-button text-fabdive-blue'
                    : 'bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Continue button */}
          <button
            onClick={handleSavePersonality}
            disabled={isLoading || selectedPersonalities.length === 0}
            className="px-8 py-3 bg-fabdive-button text-fabdive-blue rounded-full font-medium hover:bg-fabdive-button/90 transition-all animate-fade-in-3 disabled:opacity-50 font-comfortaa mb-8"
          >
            {isLoading ? 'Sauvegarde...' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePersonality;