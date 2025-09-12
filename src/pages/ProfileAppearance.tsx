import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfileAppearance = () => {
  const [userName, setUserName] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const sizeOptions = [
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
        .select('display_name, body_type')
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

      // Charger la morphologie existante du profil
      if (profile?.body_type) {
        setSelectedSize(profile.body_type);
      }

    } catch (error) {
      console.error('Erreur:', error);
      navigate('/login');
    }
  };

  const toggleSize = (sizeId: string) => {
    setSelectedSize(sizeId);
  };

  const handleSavePreferences = async () => {
    if (selectedSize === "") {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une morphologie",
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
          body_type: selectedSize,
        })
        .eq('user_id', user.id);

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
      navigate('/profile-morphology-preferences');
      
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
          <h1 className="text-3xl font-semibold mb-12 font-comfortaa animate-fade-in" style={{ color: '#fffae6' }}>
            Ta morphologie ?
          </h1>

          {/* Size options */}
          <div className="grid grid-cols-2 gap-6 mb-12 w-full max-w-sm animate-fade-in-2">
            {sizeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleSize(option.id)}
                className="flex flex-col items-center justify-center transition-all"
              >
                {/* Size image */}
                <div 
                  className={`mb-3 p-2 rounded-lg transition-all ${
                     selectedSize === option.id
                      ? 'border-2 border-fabdive-button' 
                      : 'hover:bg-white/10'
                  }`}
                  style={selectedSize === option.id ? { backgroundColor: '#14018d' } : {}}
                >
                  <img
                    src={option.image}
                    alt={option.label}
                    className="w-32 h-32 object-contain"
                  />
                </div>
                
                {/* Size label */}
                <span className="text-lg font-bold font-comfortaa" style={{ color: '#fffae6' }}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          {/* Continue button */}
          <button
            onClick={handleSavePreferences}
            disabled={isLoading || selectedSize === ""}
            className="px-8 py-3 bg-fabdive-button text-fabdive-blue rounded-full font-medium hover:bg-fabdive-button/90 transition-all animate-fade-in-3 disabled:opacity-50 mb-8"
          >
            {isLoading ? 'Sauvegarde...' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileAppearance;