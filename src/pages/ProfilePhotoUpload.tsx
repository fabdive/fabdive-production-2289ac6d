import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const ProfilePhotoUpload = () => {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
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
        .select('display_name')
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

    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      navigate("/login");
    }
  };

  const handlePhotoUpload = async () => {
    if (!profilePhoto) {
      toast({
        title: "Photo requise",
        description: "Veuillez sélectionner une photo de profil.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      // Upload photo to storage
      const fileExt = profilePhoto.name.split('.').pop();
      const fileName = `${user.id}/profile.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, profilePhoto, {
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Save photo URL to profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          profile_photo_url: publicUrl,
        })
        .eq('user_id', user.id);

      if (profileError) {
        throw profileError;
      }
      
      // Navigate to gender selection
      navigate("/profile-gender");

    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la photo:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'upload de la photo.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/profile-gender");
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
          {/* Title */}
          <h1 className="text-2xl font-semibold mb-4 font-comfortaa animate-fade-in" style={{ color: '#fffae6' }}>
            {userName}, ajoute ta photo !
          </h1>

          {/* Privacy notice */}
          <div className="mb-8 p-4 rounded-lg bg-black/20 border border-white/20">
            <p className="text-sm font-comfortaa text-white/90">
              Ta photo ne sera dévoilée qu'après un match mutuel. 
              Elle restera confidentielle jusqu'à ce moment.
            </p>
          </div>

          {/* Photo upload section */}
          <div className="mb-8 animate-fade-in-1">
            <label 
              htmlFor="photo-upload" 
              className="w-32 h-32 rounded-full border-4 border-white/30 flex items-center justify-center cursor-pointer hover:border-fabdive-button transition-colors relative overflow-hidden bg-white/10 mx-auto block"
            >
              {profilePhoto ? (
                <img 
                  src={URL.createObjectURL(profilePhoto)} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <Camera className="w-12 h-12" style={{ color: '#fffae6' }} />
              )}
            </label>
            
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setProfilePhoto(file);
                }
              }}
              className="hidden"
            />
            
            {profilePhoto && (
              <p className="text-xs text-white/70 mt-2 font-comfortaa">
                {profilePhoto.name}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-4 animate-fade-in-2">
            <Button
              onClick={handlePhotoUpload}
              disabled={isLoading || !profilePhoto}
              className="px-8 py-4 bg-fabdive-button text-fabdive-blue rounded-full font-medium hover:bg-fabdive-button/90 transition-all disabled:opacity-50 font-comfortaa"
            >
              {isLoading ? 'Sauvegarde...' : 'Continuer avec la photo'}
            </Button>

            <Button
              onClick={handleSkip}
              variant="ghost"
              className="px-8 py-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full font-medium transition-all font-comfortaa"
            >
              Passer cette étape
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePhotoUpload;