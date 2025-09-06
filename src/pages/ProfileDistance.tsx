import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfileDistance = () => {
  const [userName, setUserName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [locationCity, setLocationCity] = useState<string>("");
  const [locationCountry, setLocationCountry] = useState<string>("");
  const [selectedDistances, setSelectedDistances] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const distanceOptions = [
    { id: '0-50', label: '0-50 km' },
    { id: '50-200', label: '50-200 km' },
    { id: '200+', label: '+200 km' },
    { id: 'peu-importe', label: 'Peu importe' }
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
        .select('display_name, location_city, location_country')
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

      // Définir le nom d'affichage et la localisation
      const displayName = profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Utilisateur';
      setUserName(displayName);
      
      if (profile?.location_city) {
        setLocationCity(profile.location_city);
      }
      
      if (profile?.location_country) {
        setLocationCountry(profile.location_country);
      }

      // Charger les préférences existantes
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('location, preferred_distances')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!prefError && preferences) {
        if (preferences.location) {
          setLocation(preferences.location);
        }
        if (preferences.preferred_distances && Array.isArray(preferences.preferred_distances) && preferences.preferred_distances.length > 0) {
          setSelectedDistances(preferences.preferred_distances);
        }
      }

    } catch (error) {
      console.error('Erreur:', error);
      navigate('/login');
    }
  };

  const toggleDistance = (distanceId: string) => {
    setSelectedDistances(prev => {
      if (prev.includes(distanceId)) {
        return prev.filter(id => id !== distanceId);
      } else {
        return [...prev, distanceId];
      }
    });
  };

  const handleSaveDistances = async () => {
    if (selectedDistances.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une distance",
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
          preferred_distances: selectedDistances,
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
      navigate('/profile-objectives');
      
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
          
          {/* Location display */}
          <h1 className="text-3xl font-semibold mb-8 font-comfortaa animate-fade-in" style={{ color: '#fffae6' }}>
            Ta localisation
          </h1>
          
          <div className="mb-12 animate-fade-in space-y-3">
            {locationCity && locationCountry ? (
              <div className="space-y-2">
                <div className="bg-fabdive-button text-fabdive-blue px-8 py-3 rounded-full font-medium text-lg">
                  📍 {locationCity}
                </div>
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-3 rounded-full font-medium text-lg">
                  🌍 {locationCountry}
                </div>
              </div>
            ) : location ? (
              <div className="bg-fabdive-button text-fabdive-blue px-8 py-4 rounded-full font-medium text-lg">
                {location}
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-full font-medium text-lg">
                Localisation non définie
              </div>
            )}
          </div>

          {/* Distance question */}
          <h2 className="text-2xl font-semibold mb-2 font-comfortaa animate-fade-in-2" style={{ color: '#fffae6' }}>
            Distance maximum pour rencontrer
          </h2>
          <h2 className="text-2xl font-semibold mb-2 font-comfortaa animate-fade-in-2" style={{ color: '#fffae6' }}>
            quelqu'un ?
          </h2>
          
          <p className="text-lg mb-8 font-comfortaa animate-fade-in-2" style={{ color: '#fffae6' }}>
            (choix multiple)
          </p>

          {/* Distance options */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-12 animate-fade-in-3">
            {distanceOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleDistance(option.id)}
                className={`px-6 py-4 rounded-2xl font-medium text-lg transition-all ${
                  selectedDistances.includes(option.id)
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
            onClick={handleSaveDistances}
            disabled={isLoading || selectedDistances.length === 0}
            className="px-8 py-3 bg-fabdive-button text-fabdive-blue rounded-full font-medium hover:bg-fabdive-button/90 transition-all animate-fade-in-3 disabled:opacity-50 mb-8"
          >
            {isLoading ? 'Sauvegarde...' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDistance;