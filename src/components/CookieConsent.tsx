import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

export const CookieConsent = ({ onAccept, onDecline, onClose }: CookieConsentProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fait un choix
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
    onDecline();
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="bg-transparent border-border shadow-lg relative overflow-hidden">
        {/* Overlay opaque à 50% pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm"></div>
        
        <CardContent className="p-3 relative z-10">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-foreground text-xs">
              Utilisation des cookies
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-5 w-5 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <p className="text-xs text-foreground mb-3 leading-relaxed">
            Nous utilisons des cookies essentiels pour le fonctionnement du site et des cookies d'analyse pour améliorer votre expérience.
          </p>
          
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleAccept}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              Accepter tout
            </Button>
            <Button
              onClick={handleDecline}
              className="flex-1 bg-transparent hover:bg-white/10 text-white border border-white/20"
              size="sm"
            >
              Refuser
            </Button>
          </div>
          
          <div className="mt-2">
            <Button
              variant="link"
              size="sm"
              className="text-xs text-muted-foreground h-auto p-0"
              onClick={() => {
                // Ici on pourrait ouvrir une modal avec plus de détails
                console.log("Ouvrir les paramètres des cookies");
              }}
            >
              Personnaliser les paramètres
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};