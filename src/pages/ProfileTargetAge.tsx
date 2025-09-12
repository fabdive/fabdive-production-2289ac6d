import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProfileTargetAge = () => {
  const [userName, setUserName] = useState<string>("");
  const [userGender, setUserGender] = useState<string>("");
  const [userBirthDate, setUserBirthDate] = useState<string>("");
  const [attractedToTypes, setAttractedToTypes] = useState<string[]>([]);
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(50);
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
        .select('display_name, gender, birth_date, attracted_to_types')
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
      
      if (profile?.gender) {
        setUserGender(profile.gender);
      }
      
      if (profile?.birth_date) {
        setUserBirthDate(profile.birth_date);
      }
      
      if (profile?.attracted_to_types && profile.attracted_to_types.length > 0) {
        setAttractedToTypes(profile.attracted_to_types);
      }

      // Charger les préférences d'âge existantes s'il y en a
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('preferred_age_min, preferred_age_max')
        .eq('user_id', user.id)
        .maybeSingle();

      if (preferences) {
        if (preferences.preferred_age_min) setMinAge(preferences.preferred_age_min);
        if (preferences.preferred_age_max) setMaxAge(preferences.preferred_age_max);
      }

    } catch (error) {
      console.error('Erreur:', error);
      navigate('/login');
    }
  };

  const formatBirthDate = (birthDate: string) => {
    if (!birthDate) return "";
    const date = new Date(birthDate);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getAttractedToGender = () => {
    if (attractedToTypes.includes('homme')) return 'homme';
    if (attractedToTypes.includes('femme')) return 'femme';
    return 'autre';
  };

  const handleAgeChange = async (type: 'min' | 'max', value: number) => {
    if (type === 'min') {
      setMinAge(value);
      if (value > maxAge) {
        setMaxAge(value);
      }
    } else {
      setMaxAge(value);
      if (value < minAge) {
        setMinAge(value);
      }
    }

    // Sauvegarder immédiatement
    await saveAgePreferences(type === 'min' ? value : minAge, type === 'max' ? value : maxAge);
  };

  const saveAgePreferences = async (min: number, max: number) => {
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
          preferred_age_min: min,
          preferred_age_max: max,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder vos préférences d'âge",
          variant: "destructive",
        });
      }
      // Suppression du message de succès pour éviter le spam de notifications

      setIsLoading(false);
      
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

  const handleContinue = () => {
    navigate('/profile-location');
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Background image */}
      <div className="min-h-screen relative" style={{ background: 'linear-gradient(180deg, #19019F, #C60D87, #FF41BE)' }}>
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-6 text-center pt-16">
          
          {/* User profile summary */}
          <div className="mb-8 animate-fade-in">
            <h2 className="text-2xl font-semibold mb-4 font-comfortaa" style={{ color: '#fffae6' }}>
              {userName}
            </h2>
            
            {/* User gender icon */}
            {userGender && (
              <div className="mb-4">
                <img
                  src={`/s-${userGender}.png`}
                  alt={userGender}
                  className="w-16 h-16 mx-auto object-contain"
                />
              </div>
            )}
            
            {/* Birth date */}
            {userBirthDate && (
              <div className="mb-8">
                <div className="inline-block px-6 py-3 bg-transparent border-2 border-fabdive-button rounded-full">
                  <p className="text-lg font-medium" style={{ color: '#fffae6' }}>
                    Née le {formatBirthDate(userBirthDate)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Target selection */}
          <div className="mb-8 animate-fade-in-1">
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#fffae6' }}>
              Tu t'adresses à
            </h3>
            
            {/* Target gender icon */}
            {attractedToTypes.length > 0 && (
              <div className="mb-4">
                <img
                  src={`/s-${getAttractedToGender()}.png`}
                  alt={getAttractedToGender()}
                  className="w-16 h-16 mx-auto object-contain"
                />
              </div>
            )}
          </div>

          {/* Age question */}
          <h1 className="text-2xl font-semibold mb-8 font-comfortaa animate-fade-in-2" style={{ color: '#fffae6' }}>
            Son âge ?
          </h1>

          {/* Age selectors */}
          <div className="flex items-center gap-6 mb-12 animate-fade-in-3">
            {/* Min age */}
            <div className="text-center">
              <p className="text-fabdive-text mb-2 text-sm">De</p>
              <Select value={minAge.toString()} onValueChange={(value) => handleAgeChange('min', parseInt(value))}>
                <SelectTrigger className="w-20 h-20 rounded-full bg-fabdive-button border-none text-fabdive-blue font-bold hover:bg-fabdive-button/90">
                  <SelectValue className="text-lg">{minAge}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                  {Array.from({ length: 63 }, (_, i) => i + 18).map(age => (
                    <SelectItem key={age} value={age.toString()} className="text-gray-900 hover:bg-fabdive-button hover:text-fabdive-blue focus:bg-fabdive-button focus:text-fabdive-blue cursor-pointer px-3 py-2">
                      {age}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Max age */}
            <div className="text-center">
              <p className="text-fabdive-text mb-2 text-sm">à</p>
              <Select value={maxAge.toString()} onValueChange={(value) => handleAgeChange('max', parseInt(value))}>
                <SelectTrigger className="w-20 h-20 rounded-full bg-fabdive-button border-none text-fabdive-blue font-bold hover:bg-fabdive-button/90">
                  <SelectValue className="text-lg">{maxAge}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                  {Array.from({ length: 63 }, (_, i) => i + 18).map(age => (
                    <SelectItem key={age} value={age.toString()} className="text-gray-900 hover:bg-fabdive-button hover:text-fabdive-blue focus:bg-fabdive-button focus:text-fabdive-blue cursor-pointer px-3 py-2">
                      {age}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Continue button */}
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="px-8 py-3 bg-fabdive-button text-fabdive-blue rounded-full font-medium hover:bg-fabdive-button/90 transition-all animate-fade-in-3"
          >
            {isLoading ? 'Sauvegarde...' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileTargetAge;