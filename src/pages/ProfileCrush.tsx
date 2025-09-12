import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { Menu, Send, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ProfileCrush = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return emailRegex.test(email) || phoneRegex.test(email);
  };

  const handleSend = async () => {
    if (!currentUserId) {
      toast.error("Vous devez être connecté pour envoyer un crush");
      return;
    }

    if (email.trim()) {
      if (!validateEmail(email.trim())) {
        toast.error("Adresse e-mail ou téléphone incorrecte");
        return;
      }
      
      try {
        // Call Supabase Edge Function to send email
        const { data, error } = await supabase.functions.invoke('send-crush-email', {
          body: {
            email: email.trim(),
            userId: currentUserId
          }
        });

        if (error) {
          console.error('Error sending crush email:', error);
          toast.error(`Erreur lors de l'envoi: ${error.message || 'Erreur inconnue'}`);
          return;
        }

        // Navigate to temporary message page after a short delay
        setTimeout(() => {
          navigate("/temporary-message");
        }, 1500);
        
      } catch (error) {
        console.error('Error:', error);
        toast.error("Une erreur s'est produite lors de l'envoi");
      }
    }
  };

  const handleSkip = () => {
    // Navigate to temporary message page
    navigate("/temporary-message");
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/fond-crush.png)' }}
    >
      {/* Header */}
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


      {/* Main content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-16">
        <div className="max-w-md w-full space-y-10">
          {/* Title */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-pink-600">
              OPTION CRUSH
            </h1>
            
            <h2 className="text-2xl font-semibold" style={{ color: '#14018d' }}>
              As-tu un crush secret ?
            </h2>
            
            <div className="space-y-4">
              <p className="text-lg font-medium leading-relaxed" style={{ color: '#14018d' }}>
                <span className="font-bold">Oui ?</span> Indique son e-mail ou son téléphone. Il recevra ce message :
              </p>
              
              <div className="rounded-lg p-6 shadow-lg" style={{ backgroundColor: '#e7b95d', color: '#14018d' }}>
                <p className="italic text-base leading-relaxed">
                  "Quelqu'un pense à toi, inscris-toi pour tenter de découvrir de qui il s'agit."
                </p>
              </div>
            </div>
          </div>

          {/* Input field */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Adresse e-mail ou téléphone"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-16 pl-12 pr-4 text-lg text-white placeholder:text-white/70 border-2 border-transparent rounded-full focus:ring-0 focus:outline-none"
              style={{ 
                backgroundColor: '#14018d'
              } as React.CSSProperties}
              onFocus={(e) => {
                e.target.style.borderColor = '#e7b95d';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'transparent';
              }}
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <span className="text-white text-xl">@</span>
            </div>
          </div>

          {/* Send button */}
          <div className="flex justify-center">
            <button
              onClick={handleSend}
              disabled={!email.trim()}
              className="w-16 h-16 rounded-full disabled:opacity-50 border-0 hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: '#e91e63', color: 'white' }}
            >
              <Send className="w-6 h-6 text-white mx-auto" />
            </button>
          </div>

          {/* Points reward */}
          <p className="text-xl font-semibold text-pink-600 py-2">
            Tu gagneras 100 points
          </p>

          {/* Skip option */}
          <div className="pt-6">
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-16 h-16 rounded-full text-white border-0"
              style={{ backgroundColor: '#14018d' }}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCrush;