import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { CheckCircle, Menu, X } from "lucide-react";
import Iridescence from "../components/Iridescence";

const TemporaryMessage = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/matches");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Iridescence Background */}
      <div className="absolute inset-0">
        <Iridescence
          color={[1, 0.3, 1]}
          mouseReact={false}
          amplitude={0.1}
          speed={1.0}
        />
      </div>
      
      {/* Header */}
      <div className="relative z-10">
        <Header />
      </div>
      
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
      
      {/* Main content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-16">
        <div className="max-w-md w-full space-y-8">
          {/* Success icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e7b95d' }}>
              <CheckCircle className="w-12 h-12" style={{ color: '#14018d' }} />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">
              Merci !
            </h1>
            
            <div className="rounded-lg p-6 shadow-lg space-y-4 bg-white/10 backdrop-blur-sm border border-white/20">
              <p className="text-lg font-medium leading-relaxed text-white">
                Tu es l'un des premiers utilisateurs, l'application n'est pas encore tout-à-fait prête.
              </p>
              
              <p className="text-lg font-medium leading-relaxed text-white">
                Pour te remercier de ta patience, <span className="font-extrabold text-yellow-300">tu gagnes un mois d'abonnement</span>.
              </p>
              
              <p className="text-lg font-medium leading-relaxed text-white">
                Tu recevras un email pour le lancement officiel, très bientôt.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TemporaryMessage;