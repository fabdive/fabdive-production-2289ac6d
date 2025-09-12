import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfileGender = () => {
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
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
        toast({
          title: "Authentification requise",
          description: "Vous devez être connecté pour accéder à cette page.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Charger le profil existant
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('display_name, gender')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erreur lors du chargement du profil:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil.",
          variant: "destructive",
        });
        return;
      }

      // Définir les valeurs par défaut
      const displayName = profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Utilisateur';
      setUserName(displayName);
      
      if (profile?.gender) {
        setSelectedGender(profile.gender);
      }

    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      navigate("/login");
    }
  };

  const genderOptions = [
    { id: "homme", image: "/s-homme.png", alt: "Homme" },
    { id: "femme", image: "/s-femme.png", alt: "Femme" },
    { id: "autre", image: "/s-autre.png", alt: "Autre" },
  ];

  const handleGenderSelect = async (genderId: string) => {
    if (isLoading) return;
    
    setSelectedGender(genderId);
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour sauvegarder votre profil.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          gender: genderId,
          display_name: userName,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast({
          title: "Erreur de sauvegarde",
          description: "Impossible de sauvegarder votre sélection. Veuillez réessayer.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Navigate to next step after successful save
      navigate("/profile-age");

    } catch (error) {
      console.error('Erreur lors de la sauvegarde du genre:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div 
        className="min-h-[calc(100vh-80px)] relative overflow-hidden"
        style={{
          backgroundImage: 'url(/lovable-uploads/79534e7d-2c05-4985-82c5-60b4b4fc78b4.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-6 text-center pt-16">
          {/* Question */}
          <h1 className="text-2xl font-semibold mb-16 font-comfortaa animate-fade-in" style={{ color: '#fffae6' }}>
            {userName}, tu es ?
          </h1>

          {/* Gender selection */}
          <div className="flex justify-center items-center gap-8 mb-16 animate-fade-in-1">
            {genderOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleGenderSelect(option.id)}
                disabled={isLoading}
                className={`
                  transition-all duration-300 transform hover:scale-110 
                  ${selectedGender === option.id ? 'scale-110 opacity-100' : 'opacity-80 hover:opacity-100'}
                  ${isLoading ? 'cursor-not-allowed opacity-50' : ''}
                  focus:outline-none focus:ring-4 focus:ring-white/30 rounded-full
                `}
              >
                <img
                  src={option.image}
                  alt={option.alt}
                  className="w-20 h-20 object-contain filter brightness-0 invert"
                />
              </button>
            ))}
          </div>

          {/* Status messages */}
          {selectedGender && (
            <div className="animate-fade-in-2">
              <p className="text-sm" style={{ color: '#fffae6', opacity: 0.8 }}>
                {isLoading ? 'Sauvegarde en cours...' : 'Sélection enregistrée !'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileGender;