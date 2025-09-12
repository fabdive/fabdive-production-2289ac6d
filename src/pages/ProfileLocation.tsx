import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfileLocation = () => {
  const [userName, setUserName] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [country, setCountry] = useState<string>("");
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

      // Définir le nom d'affichage
      const displayName = profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Utilisateur';
      setUserName(displayName);

      // Charger les données de localisation depuis le profil
      if (profile) {
        if (profile.location_city) {
          setCity(profile.location_city);
        }
        if (profile.location_country) {
          setCountry(profile.location_country);
        }
      }

    } catch (error) {
      console.error('Erreur:', error);
      navigate('/login');
    }
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Erreur",
        description: "La géolocalisation n'est pas supportée par votre navigateur",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            navigate('/login');
            return;
          }

          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

      // Call geocoding function to get address from coordinates
          const { data, error } = await supabase.functions.invoke('geocode-address', {
            body: { 
              address: `${latitude},${longitude}`,
              userId: user.id,
              reverse: true
            }
          });

          if (error || !data.success) {
            throw new Error(data?.error || 'Failed to get location');
          }

          setCity(data.city || '');
          setCountry(data.country || '');
          

        } catch (error) {
          console.error('Erreur géolocalisation:', error);
          toast({
            title: "Erreur",
            description: "Impossible d'utiliser votre position actuelle",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'accéder à votre position",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );
  };

  const handleSaveLocation = async () => {
    if (!city.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre ville",
        variant: "destructive",
      });
      return;
    }

    if (!country.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre pays",
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

      // Use geocoding function to get coordinates from address
      const fullAddress = `${city.trim()}, ${country.trim()}`;
      const { data: geocodeData, error: geocodeError } = await supabase.functions.invoke('geocode-address', {
        body: { 
          address: fullAddress,
          userId: user.id
        }
      });

      if (geocodeError || !geocodeData.success) {
        console.error('Erreur géocodage:', geocodeError);
        toast({
          title: "Erreur",
          description: "Impossible de localiser cette adresse",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Save location in profile
      const { error } = await supabase
        .from('profiles')
        .update({
          location_city: city.trim(),
          location_country: country.trim(),
          latitude: geocodeData.latitude,
          longitude: geocodeData.longitude,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder votre localisation",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Navigation vers la prochaine page
      navigate('/profile-distance');
      
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
      <div className="min-h-screen relative" style={{ background: 'linear-gradient(180deg, #19019F, #C60D87, #FF41BE)' }}>
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-6 text-center pt-16">
          
          {/* Location question */}
          <h3 className="text-3xl font-semibold mb-2 font-comfortaa animate-fade-in" style={{ color: '#fffae6' }}>
            Ta localisation ?
          </h3>
          
          <p className="text-lg mb-8 font-comfortaa animate-fade-in-2" style={{ color: '#fffae6' }}>
            (ville, pays)
          </p>

          {/* Location inputs */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 w-full max-w-md animate-fade-in-3 space-y-4">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ville (ex: Paris)"
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-fabdive-button font-comfortaa"
            />
            
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Pays (ex: France)"
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-fabdive-button font-comfortaa"
            />
            
            <button
              onClick={handleGetCurrentLocation}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 text-white rounded-xl font-medium hover:bg-white/30 transition-all disabled:opacity-50 font-comfortaa"
            >
              📍 Utiliser ma position actuelle
            </button>
          </div>

          {/* Continue button */}
          <button
            onClick={handleSaveLocation}
            disabled={isLoading || !city.trim() || !country.trim()}
            className="px-8 py-3 bg-fabdive-button text-fabdive-blue rounded-full font-medium hover:bg-fabdive-button/90 transition-all animate-fade-in-3 disabled:opacity-50 font-comfortaa"
          >
            {isLoading ? 'Sauvegarde...' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileLocation;