import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfileInterests = () => {
  const [userName, setUserName] = useState<string>("");
  const [userGender, setUserGender] = useState<string>("");
  const [userAge, setUserAge] = useState<number | null>(null);
  const [userDescription, setUserDescription] = useState<string>("");
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
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
        .select('display_name, gender, birth_date, personal_definition, attracted_to_types')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Profile data loaded:', profile); // Debug

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
      
      // Récupérer les autres informations du profil
      if (profile?.gender) {
        setUserGender(profile.gender);
      }
      
      if (profile?.birth_date) {
        const today = new Date();
        const birthDate = new Date(profile.birth_date);
        const age = today.getFullYear() - birthDate.getFullYear() - 
          (today.getMonth() < birthDate.getMonth() || 
           (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
        setUserAge(age);
        console.log('Age calculated:', age); // Debug
      } else {
        console.log('No birth_date found in profile'); // Debug
      }
      
      if (profile?.personal_definition && Array.isArray(profile.personal_definition)) {
        setUserDescription(profile.personal_definition.join(', '));
        console.log('Description set:', profile.personal_definition); // Debug
      } else {
        console.log('No personal_definition found in profile'); // Debug
      }
      
      if (profile?.attracted_to_types && profile.attracted_to_types.length > 0) {
        setSelectedGenders(profile.attracted_to_types);
      }

    } catch (error) {
      console.error('Erreur:', error);
      navigate('/login');
    }
  };

  const genderOptions = [
    { id: 'homme', image: '/s-homme.png', alt: 'Homme' },
    { id: 'femme', image: '/s-femme.png', alt: 'Femme' },
    { id: 'autre', image: '/s-autre.png', alt: 'Autre' },
  ];

  const handleGenderSelect = async (genderId: string) => {
    // Toggle selection (add/remove from array)
    const newSelection = selectedGenders.includes(genderId)
      ? selectedGenders.filter(id => id !== genderId)
      : [...selectedGenders, genderId];
    
    setSelectedGenders(newSelection);
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          attracted_to_types: newSelection,
          display_name: userName,
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
          {/* Profile summary */}
          <div className="mb-8 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-white/20">
              {/* User gender image */}
              {userGender && (
                <div className="mb-4">
                  <img
                    src={`/s-${userGender}.png`}
                    alt={userGender}
                    className="w-16 h-16 mx-auto object-contain"
                  />
                </div>
              )}
              
              {/* User info */}
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2" style={{ color: '#fffae6' }}>
                  {userName}
                </h2>
                {userAge ? (
                  <p className="text-sm opacity-90 mb-2" style={{ color: '#fffae6' }}>
                    {userAge} ans
                  </p>
                ) : (
                  <p className="text-xs opacity-70 mb-2" style={{ color: '#fffae6' }}>
                    Âge non renseigné
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Question */}
          <h1 className="text-2xl font-semibold mb-4 font-comfortaa animate-fade-in" style={{ color: '#fffae6' }}>
            {userName}, à qui t'adresses-tu ?
          </h1>
          
          {/* Multiple choice indication */}
          <p className="text-sm opacity-80 mb-8 animate-fade-in" style={{ color: '#fffae6' }}>
            (choix multiple possible)
          </p>

          {/* Gender selection */}
          <div className="flex justify-center items-center gap-8 mb-16 animate-fade-in-1">
            {genderOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleGenderSelect(option.id)}
                className="relative transition-all duration-300 hover:scale-105 focus:outline-none animate-fade-in"
                disabled={isLoading}
              >
                <img
                  src={option.image}
                  alt={option.alt}
                  className={`w-24 h-24 object-contain transition-all duration-300 ${
                    selectedGenders.includes(option.id) ? 'opacity-100 scale-110' : 'opacity-70 hover:opacity-90'
                  } ${isLoading ? 'opacity-50' : ''}`}
                />
                {/* Selection indicator */}
                {selectedGenders.includes(option.id) && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-fabdive-button rounded-full flex items-center justify-center">
                    <span className="text-fabdive-blue text-sm font-bold">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Status messages */}
          {isLoading && (
            <p className="text-lg font-medium animate-fade-in-2" style={{ color: '#fffae6' }}>
              Sauvegarde en cours...
            </p>
          )}

          {selectedGenders.length > 0 && !isLoading && (
            <div className="text-center animate-fade-in-2">
              <p className="text-lg font-medium mb-2" style={{ color: '#fffae6' }}>
                Préférences enregistrées !
              </p>
              <p className="text-sm opacity-80" style={{ color: '#fffae6' }}>
                {selectedGenders.length} choix sélectionné{selectedGenders.length > 1 ? 's' : ''}
              </p>
              <button
                onClick={() => navigate('/profile-target-age')}
                className="mt-4 px-6 py-2 bg-fabdive-button text-fabdive-blue rounded-full font-medium hover:bg-fabdive-button/90 transition-all"
              >
                Continuer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileInterests;