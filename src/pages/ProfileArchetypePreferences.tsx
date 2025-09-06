import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfileArchetypePreferences = () => {
  const [selectedArchetypes, setSelectedArchetypes] = useState<string[]>([]);
  const [preferredGenders, setPreferredGenders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const femaleArchetypes = [
    { id: 'reveuse', label: 'Rêveuse', image: '/f-reveuse.png' },
    { id: 'leader', label: 'Leader', image: '/f-leader.png' },
    { id: 'naturelle', label: 'Naturelle', image: '/f-naturelle.png' },
    { id: 'sophistiquee', label: 'Sophistiquée', image: '/f-sophis.png' },
    { id: 'rebelle', label: 'Rebelle', image: '/f-rebelle.png' },
    { id: 'epicurienne', label: 'Épicurienne', image: '/f-epicure.png' }
  ];

  const maleArchetypes = [
    { id: 'creatif', label: 'Créatif', image: '/h-creatif.png' },
    { id: 'nomade', label: 'Nomade', image: '/h-nomade.png' },
    { id: 'protecteur', label: 'Protecteur', image: '/h-protecteur.png' },
    { id: 'solitaire', label: 'Solitaire', image: '/h-solitaire.png' },
    { id: 'sportif', label: 'Sportif', image: '/h-sportif.png' },
    { id: 'stratege', label: 'Stratège', image: '/h-stratege.png' }
  ];

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Charger les préférences de genre depuis user_preferences

      // Charger les préférences existantes
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!prefError && preferences) {
        // Récupérer les préférences de genre
        const prefGenders = (preferences as any).preferred_genders;
        if (prefGenders && Array.isArray(prefGenders)) {
          setPreferredGenders(prefGenders);
        }
        
        // Récupérer les archétypes déjà sélectionnés
        const personalityTypes = (preferences as any).preferred_personality_types;
        if (personalityTypes && Array.isArray(personalityTypes)) {
          setSelectedArchetypes(personalityTypes);
        }
      }

    } catch (error) {
      console.error('Erreur:', error);
      navigate('/login');
    }
  };

  const toggleArchetype = (archetypeId: string) => {
    setSelectedArchetypes(prev => {
      if (prev.includes(archetypeId)) {
        return prev.filter(id => id !== archetypeId);
      } else {
        return [...prev, archetypeId];
      }
    });
  };

  const handleSaveArchetypes = async () => {
    if (selectedArchetypes.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un archétype",
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
          preferred_personality_types: selectedArchetypes,
        } as any, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder vos préférences d'archétypes",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Succès",
        description: "Préférences d'archétypes sauvegardées avec succès",
      });

      // Navigation vers la prochaine page
      navigate('/profile-appearance-importance');
      
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

  // Afficher les archétypes selon les préférences de genre
  let archetypes = [];
  let genderLabel = '';
  
  if (preferredGenders.includes('homme') && preferredGenders.includes('femme')) {
    // Si les deux genres sont sélectionnés, afficher tous les archétypes
    archetypes = [...maleArchetypes, ...femaleArchetypes];
    genderLabel = 'qui t\'attirent';
  } else if (preferredGenders.includes('homme')) {
    archetypes = maleArchetypes;
    genderLabel = 'masculins';
  } else if (preferredGenders.includes('femme')) {
    archetypes = femaleArchetypes;
    genderLabel = 'féminins';
  } else {
    // Par défaut, afficher tous les archétypes
    archetypes = [...maleArchetypes, ...femaleArchetypes];
    genderLabel = 'qui t\'attirent';
  }

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
          <h1 className="text-3xl font-bold text-center text-white mb-2 font-comfortaa animate-fade-in">
            {genderLabel === 'qui t\'attirent' ? 'Quels archétypes' : `Quels archétypes ${genderLabel}`}
          </h1>
          <h1 className="text-3xl font-bold text-center text-white mb-4 font-comfortaa animate-fade-in">
            {genderLabel === 'qui t\'attirent' ? genderLabel : 't\'attirent ?'}
          </h1>
          
          <p className="text-lg mb-8 font-comfortaa animate-fade-in-2 text-white/90">
            (choix multiple)
          </p>

          {/* Archetype options in grid */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-12 animate-fade-in-3 place-items-center">
            {archetypes.map((archetype) => (
              <button
                key={archetype.id}
                onClick={() => toggleArchetype(archetype.id)}
                className={`relative rounded-2xl overflow-hidden transition-all w-40 h-40 ${
                  selectedArchetypes.includes(archetype.id)
                    ? 'ring-4 ring-fabdive-button shadow-lg scale-105'
                    : 'hover:scale-102'
                }`}
              >
                <div className="relative bg-gray-200 w-full h-full">
                  <img
                    src={archetype.image}
                    alt={archetype.label}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  
                  {selectedArchetypes.includes(archetype.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-fabdive-button rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-fabdive-blue" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Label overlaid at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <h3 className="text-white font-bold text-sm font-comfortaa text-center drop-shadow-lg">
                      {archetype.label}
                    </h3>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Continue button */}
          <button
            onClick={handleSaveArchetypes}
            disabled={isLoading || selectedArchetypes.length === 0}
            className="px-8 py-4 bg-fabdive-button text-fabdive-blue rounded-full font-medium hover:bg-fabdive-button/90 transition-all animate-fade-in-3 disabled:opacity-50 font-comfortaa"
          >
            {isLoading ? 'Sauvegarde...' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileArchetypePreferences;