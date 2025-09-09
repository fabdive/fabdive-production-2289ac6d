import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const ProfileComplete = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Erreur lors du chargement du profil:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les données du profil",
            variant: "destructive",
          });
          return;
        }

        setProfileData(profile);
        
        // Marquer le profil comme complet
        await supabase
          .from('profiles')
          .update({ profile_completed: true })
          .eq('user_id', user.id);

      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [navigate, toast]);

  const getGenderLabel = (gender: string) => {
    const genderMap: { [key: string]: string } = {
      'man': 'Homme',
      'woman': 'Femme',
      'other': 'Autre'
    };
    return genderMap[gender] || gender;
  };

  const getAppearanceLabel = (importance: string) => {
    const importanceMap: { [key: string]: string } = {
      'not-important': 'Pas important',
      'somewhat-important': 'Assez important', 
      'very-important': 'Très important',
      'Not Important': 'Pas important',
      'Somewhat Important': 'Assez important',
      'Very Important': 'Très important'
    };
    return importanceMap[importance] || importance;
  };

  const getVisibilityLabel = (visibility: string) => {
    const visibilityMap: { [key: string]: string } = {
      'everyone': 'Tous',
      'high-match': 'Profils >50% d\'affinité',
      'very-high-match': 'Profils >70% d\'affinité'
    };
    return visibilityMap[visibility] || visibility;
  };

  const getPhotoVisibilityLabel = (photoVisibility: string) => {
    const photoMap: { [key: string]: string } = {
      'immediate': 'Tout de suite',
      'after-match': 'Après affinité confirmée'
    };
    return photoMap[photoVisibility] || photoVisibility;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fabdive-blue to-fabdive-purple flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/lovable-uploads/bd7d757f-0516-4b67-8c49-131b65dceeea.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Header />
      
      {/* Menu button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMenu(!showMenu)}
          className="bg-yellow-400 hover:bg-yellow-500"
          style={{ backgroundColor: '#e7b95d' }}
        >
          <Menu className="w-6 h-6" style={{ color: '#14018d' }} />
        </Button>
      </div>

      {/* Menu overlay */}
      {showMenu && (
        <div className="absolute top-0 right-0 w-64 h-full shadow-lg z-30 p-4" style={{ backgroundColor: '#e7b95d' }}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-semibold" style={{ color: '#14018d' }}>Menu</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(false)}
            >
              <X className="w-5 h-5" style={{ color: '#14018d' }} />
            </Button>
          </div>
          <div className="space-y-6">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-white/10"
              style={{ color: '#14018d' }}
              onClick={() => {
                setShowMenu(false);
                navigate("/matches");
              }}
            >
              Mes matches
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-white/10"
              style={{ color: '#14018d' }}
              onClick={() => {
                setShowMenu(false);
                navigate("/profile-complete");
              }}
            >
              Mon profil
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-white/10"
              style={{ color: '#14018d' }}
              onClick={() => {
                setShowMenu(false);
                navigate("/profile-crush");
              }}
            >
              Crush
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-white/10"
              style={{ color: '#14018d' }}
              onClick={() => {
                setShowMenu(false);
                navigate("/cadeaux");
              }}
            >
              Cadeaux
            </Button>
            <a
              href="mailto:hello@fabdive.com"
              className="block w-full text-left px-4 py-2 rounded-md hover:bg-white/10"
              style={{ color: '#14018d' }}
              onClick={() => setShowMenu(false)}
            >
              Partenariat
            </a>
          </div>
        </div>
      )}
      
      <div className="flex flex-col items-center justify-center p-6 pt-0 relative z-10">
        <div className="w-full max-w-md text-center space-y-8">
          
          {/* Success message */}
          <div className="animate-fade-in">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-white mb-4 font-comfortaa">
              Félicitations !
            </h1>
            <p className="text-xl text-white mb-2 font-comfortaa">
              Ton profil est complet
            </p>
            <div className="bg-fabdive-button text-fabdive-blue rounded-full px-6 py-3 font-bold text-lg mb-8 inline-block">
              +100 points gagnés ! 🏆
            </div>
          </div>

          {/* Profile summary */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 animate-fade-in-2">
            <h2 className="text-xl font-bold text-white mb-4 font-comfortaa">
              Récapitulatif de ton profil
            </h2>
            
            <div className="space-y-3 text-left">
              {profileData?.gender && (
                <div className="flex justify-between">
                  <span className="text-white/70">Genre :</span>
                  <span className="text-white font-medium">{getGenderLabel(profileData.gender)}</span>
                </div>
              )}
              
              {profileData?.birth_date && (
                <div className="flex justify-between">
                  <span className="text-white/70">Age :</span>
                  <span className="text-white font-medium">
                    {new Date().getFullYear() - new Date(profileData.birth_date).getFullYear()} ans
                  </span>
                </div>
              )}
              
              {profileData?.height_cm && (
                <div className="flex justify-between">
                  <span className="text-white/70">Taille :</span>
                  <span className="text-white font-medium">{profileData.height_cm} cm</span>
                </div>
              )}
              
              {profileData?.body_type && (
                <div className="flex justify-between">
                  <span className="text-white/70">Morphologie :</span>
                  <span className="text-white font-medium">{profileData.body_type}</span>
                </div>
              )}
              
              {profileData?.skin_color && (
                <div className="flex justify-between">
                  <span className="text-white/70">Couleur de peau :</span>
                  <span className="text-white font-medium">{profileData.skin_color}</span>
                </div>
              )}
              
              {profileData?.location_city && (
                <div className="flex justify-between">
                  <span className="text-white/70">Localisation :</span>
                  <span className="text-white font-medium">{profileData.location_city}</span>
                </div>
              )}
              
              {profileData?.appearance_importance && (
                <div className="flex justify-between">
                  <span className="text-white/70">Importance apparence :</span>
                  <span className="text-white font-medium">{getAppearanceLabel(profileData.appearance_importance)}</span>
                </div>
              )}
              
              {profileData?.profile_visibility && (
                <div className="flex justify-between">
                  <span className="text-white/70">Visibilité profil :</span>
                  <span className="text-white font-medium">{getVisibilityLabel(profileData.profile_visibility)}</span>
                </div>
              )}
              
              {profileData?.photo_visibility && (
                <div className="flex justify-between">
                  <span className="text-white/70">Visibilité photo :</span>
                  <span className="text-white font-medium">{getPhotoVisibilityLabel(profileData.photo_visibility)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Modification info */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 animate-fade-in-3">
            <p className="text-white/80 text-sm mb-2 font-comfortaa">
              💡 Tu peux modifier ton profil à tout moment depuis la page profil
            </p>
          </div>

          {/* Continue button */}
          <button
            onClick={() => navigate('/profile-crush')}
            className="w-full px-8 py-4 bg-fabdive-button text-fabdive-blue rounded-full font-bold text-lg hover:bg-fabdive-button/90 transition-all animate-fade-in-3 font-comfortaa"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileComplete;