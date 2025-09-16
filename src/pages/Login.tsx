import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

type FormState = "idle" | "loading" | "error";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Force clear fields on component mount
  useEffect(() => {
    setEmail("");
    setPassword("");
    setState("idle");
    setMessage("");
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Pas de redirection automatique
      }
    };
    checkAuth();
  }, [navigate]);

  // Fonction pour traduire les erreurs d'authentification
  const translateAuthError = (error: any) => {
    const errorMessage = error.message || error.error_description || "";
    
    if (errorMessage.includes("Invalid login credentials") || 
        errorMessage.includes("invalid_credentials") ||
        errorMessage.includes("Email not confirmed")) {
      return "Identifiants incorrects. Vérifie ton email et mot de passe.";
    }
    
    if (errorMessage.includes("Email not found")) {
      return "Aucun compte trouvé avec cette adresse email.";
    }
    
    if (errorMessage.includes("Too many requests")) {
      return "Trop de tentatives. Réessaie dans quelques minutes.";
    }
    
    if (errorMessage.includes("Password should be at least")) {
      return "Le mot de passe doit contenir au moins 6 caractères.";
    }
    
    if (errorMessage.includes("Invalid email")) {
      return "Format d'email invalide.";
    }
    
    // Message par défaut en français
    return "Une erreur est survenue lors de la connexion. Vérifie tes identifiants.";
  };

  const redirectUserBasedOnProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', user.id)
        .single();

      // Si pas de profil du tout, commencer par la photo
      if (!profile) {
        navigate("/profile-photo-upload");
        return;
      }

      // Vérifier quelle étape du profil n'est pas complète
      if (!profile.gender) {
        navigate("/profile-gender");
      } else {
      // Vérifier si l'âge est rempli
      const { data: ageProfile } = await supabase
        .from('profiles')
        .select('birth_date, personal_definition, location_city, personality_traits')
        .eq('user_id', user.id)
        .single();
        
      if (!ageProfile?.birth_date) {
        navigate("/profile-age");
      } else if (!ageProfile?.personal_definition || ageProfile.personal_definition.length === 0) {
        navigate("/profile-appearance");
      } else if (!ageProfile?.location_city) {
        navigate("/profile-location");
      } else if (!ageProfile?.personality_traits || ageProfile.personality_traits.length === 0) {
        navigate("/profile-archetype");
      } else {
        // Profil complet, aller au profil complete
        navigate("/profile-complete");
      }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du profil:', error);
      // En cas d'erreur, rediriger vers l'upload de photo
      navigate("/profile-photo-upload");
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Saisis ton email d'abord."
      });
      return;
    }

    setState("loading");
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/home`
        }
      });

      if (error) throw error;

      toast({
        title: "Magic link envoyé",
        description: "Vérifie ta boîte mail pour te connecter.",
        duration: 8000,
      });
      
      setState("idle");
    } catch (error: any) {
      setState("error");
      setMessage(translateAuthError(error));
    }
  };

  const handlePasswordLogin = async () => {
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Saisis ton email et ton mot de passe."
      });
      return;
    }

    setState("loading");
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Connexion réussie",
        description: "Tu vas être redirigé.",
      });

      // Rediriger après connexion réussie
      await redirectUserBasedOnProfile();
      
    } catch (error: any) {
      setState("error");
      setMessage(translateAuthError(error));
    }
  };


  const handleForceLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
      toast({
        title: "Déconnexion forcée",
        description: "Toutes les données d'authentification ont été effacées."
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion forcée:', error);
    }
  };

  const isLoading = state === "loading";

  return (
    <>
      <Header />
      <div 
        className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-fabdive-text">Connexion</h1>
            <p className="text-fabdive-text/80">
              Connecte-toi à ton compte
            </p>
          </div>

          {/* Form Card */}
          <Card className="border-white/20 bg-card/10 backdrop-blur-sm shadow-elegant">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl text-fabdive-text">Se connecter</CardTitle>
              <CardDescription className="text-fabdive-text/70">
                Choisis ta méthode de connexion préférée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email/Password Form */}
              <form onSubmit={(e) => { e.preventDefault(); handlePasswordLogin(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-fabdive-text">Adresse email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fabdive-text/70" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-fabdive-text placeholder-fabdive-text/70"
                      required
                      disabled={isLoading}
                      autoComplete="email"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-fabdive-text">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fabdive-text/70" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-fabdive-text placeholder-fabdive-text/70"
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-fabdive-text/70 hover:text-fabdive-text transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="fabdive"
                  className="w-full"
                  disabled={isLoading || !email || !password}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connexion en cours...
                    </div>
                  ) : (
                     <div className="flex items-center gap-2">
                       <Lock className="w-4 h-4" />
                       Se connecter
                     </div>
                  )}
                </Button>
              </form>

              <Separator className="bg-white/20" />

              {/* Magic Link Option */}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-white/5 border-white/20 text-fabdive-text hover:bg-white/10"
                  onClick={handleMagicLink}
                  disabled={isLoading || !email}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Envoyer un lien de connexion par email
                  </div>
                </Button>
                <p className="text-xs text-fabdive-text/60 text-center">
                  Alternative : reçois un lien de connexion par email
                </p>
              </div>

              {/* Error Message */}
              {message && state === "error" && (
                <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
                  <AlertDescription className="text-fabdive-text">{message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <div className="text-center text-xs text-fabdive-text/60 bg-card/5 border border-white/10 rounded-lg p-3">
            <p>
              Tu dévoiles ta photo quand tu le veux pour les matchs. Toutes tes informations sont confidentielles.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-fabdive-text/70 space-y-2">
            <p>
              Pas encore de compte ?{" "}
              <a href="/" className="text-fabdive-button hover:underline transition-colors">
                S'inscrire
              </a>
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleForceLogout}
              className="text-xs border-destructive/20 text-destructive hover:bg-destructive/10"
            >
              Déconnexion forcée
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}