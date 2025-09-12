import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";


const ProfileHeight = () => {
  const [userName, setUserName] = useState<string>("");
  const [userGender, setUserGender] = useState<string>("");
  const [userBirthDate, setUserBirthDate] = useState<string>("");
  const [height, setHeight] = useState<string>("");
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
        .select('display_name, gender, birth_date, height_cm')
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

      if (profile?.height_cm) {
        setHeight(profile.height_cm.toString());
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

  const handleHeightChange = (value: string) => {
    // Permettre la saisie normale avec validation simple
    if (value === '' || /^\d{1,3}(\.\d{0,1})?$/.test(value)) {
      setHeight(value);
    }
  };

  const handleSaveHeight = async () => {
    if (!height.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez indiquer votre taille",
        variant: "destructive",
      });
      return;
    }

    const heightValue = parseFloat(height);
    if (isNaN(heightValue) || heightValue < 100 || heightValue > 250) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une taille valide entre 100 et 250 cm",
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
          height_cm: heightValue,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder votre taille",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      navigate('/profile-height-preferences');
      
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

          {/* Height question */}
          <h1 className="text-3xl font-semibold mb-8 font-comfortaa animate-fade-in-1" style={{ color: '#fffae6' }}>
            Ta taille ?
          </h1>

          {/* Height icon */}
          <div className="mb-8 animate-fade-in-2">
            <img
              src="/taille.png"
              alt="Taille"
              className="w-24 h-24 mx-auto object-contain"
            />
          </div>

          {/* Height input */}
          <div className="mb-8 animate-fade-in-3">
            <div className="relative">
              <Input
                type="text"
                value={height}
                onChange={(e) => handleHeightChange(e.target.value)}
                placeholder="175"
                className="w-32 h-16 text-center text-2xl font-bold bg-fabdive-button border-none text-fabdive-blue rounded-full focus:ring-2 focus:ring-fabdive-button/50"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-fabdive-blue font-medium">
                cm
              </span>
            </div>
          </div>


          {/* Continue button */}
          <button
            onClick={handleSaveHeight}
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

export default ProfileHeight;