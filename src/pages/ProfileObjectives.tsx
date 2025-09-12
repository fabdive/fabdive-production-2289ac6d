import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfileObjectives = () => {
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const objectiveOptions = [
    { id: 'prefer-not-answer', label: 'Je préfère ne pas répondre' },
    { id: 'serious-relationship', label: 'Une relation sérieuse' },
    { id: 'beautiful-encounter', label: 'Une belle rencontre' },
    { id: 'unique-connection', label: 'Une connexion unique' },
    { id: 'not-sure', label: 'Je ne sais pas encore' }
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
        const seekingTypes = (preferences as any).seeking_relationship_types;
        if (seekingTypes && Array.isArray(seekingTypes) && seekingTypes.length > 0) {
          setSelectedObjectives(seekingTypes);
        }
      }

    } catch (error) {
      console.error('Erreur:', error);
      navigate('/login');
    }
  };

  const toggleObjective = (objectiveId: string) => {
    setSelectedObjectives(prev => {
      if (prev.includes(objectiveId)) {
        return prev.filter(id => id !== objectiveId);
      } else {
        return [...prev, objectiveId];
      }
    });
  };

  const handleSaveObjectives = async () => {
    if (selectedObjectives.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un objectif",
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
          seeking_relationship_types: selectedObjectives,
        } as any, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder vos objectifs",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Navigation vers la prochaine page
      navigate('/profile-personality');
      
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
          
          {/* Question */}
          <h1 className="text-4xl font-bold text-center text-white mb-4 font-comfortaa animate-fade-in">
            Que cherches-tu ici ?
          </h1>
          
          <p className="text-lg mb-12 font-comfortaa animate-fade-in-2 text-white/90">
            (choix multiple)
          </p>

          {/* Objective options */}
          <div className="space-y-4 w-full max-w-md mb-12 animate-fade-in-3">
            {objectiveOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleObjective(option.id)}
                className={`w-full px-6 py-4 rounded-2xl font-medium text-lg transition-all font-comfortaa ${
                  selectedObjectives.includes(option.id)
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
            onClick={handleSaveObjectives}
            disabled={isLoading || selectedObjectives.length === 0}
            className="px-8 py-3 bg-fabdive-button text-fabdive-blue rounded-full font-medium hover:bg-fabdive-button/90 transition-all animate-fade-in-3 disabled:opacity-50 font-comfortaa mb-8"
          >
            {isLoading ? 'Sauvegarde...' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileObjectives;