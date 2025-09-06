import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";  
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Mail, User } from "lucide-react";
import Header from "@/components/Header";

type FormState = 'idle' | 'loading' | 'success' | 'error';

export function SignupForm() {
  console.log('SignupForm component loaded');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [formState, setFormState] = useState<FormState>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Supprimer la redirection automatique pour éviter la boucle
      // L'utilisateur est déjà sur la page d'inscription, on le laisse là
    };
    checkUser();
  }, []);



  const handleMagicLinkSignIn = async () => {
    if (!email || !displayName) {
      setError('Saisis ton email et ton nom pour recevoir le lien magique');
      return;
    }

    if (!ageConfirmed) {
      setError('Tu dois confirmer avoir plus de 18 ans');
      return;
    }

    try {
      setFormState('loading');
      setError(null);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/home`,
          data: {
            display_name: displayName,
            age_confirmed: ageConfirmed
          }
        }
      });

      if (error) throw error;

      setFormState('idle');
      toast({
        title: "Lien magique envoyé !",
        description: "Vérifie ta boîte mail et clique sur le lien pour te connecter.",
        duration: 8000,
      });
    } catch (error: any) {
      console.error('Magic link error:', error);
      setError(error.message);
      setFormState('error');
      toast({
        title: "Erreur d'envoi",
        description: "Impossible d'envoyer le lien magique. Réessayez.",
        variant: "destructive",
      });
    }
  };


  return (
    <>
      <Header />
      <div 
        className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4"
        style={{
          backgroundImage: "url('/lovable-uploads/79534e7d-2c05-4985-82c5-60b4b4fc78b4.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-fabdive-text">Inscription</h1>
            <p className="text-fabdive-text/80">
              Crée ton compte Fabdive
            </p>
          </div>

          {/* Form Card */}
          <Card className="border-white/20 bg-card/10 backdrop-blur-sm shadow-elegant">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl text-fabdive-text">Rejoins Fabdive</CardTitle>
              <CardDescription className="text-fabdive-text/70">
                Choisis ta méthode d'inscription préférée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Magic Link Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-fabdive-text">Adresse email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fabdive-text/70" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ton@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-fabdive-text placeholder-fabdive-text/70 focus:ring-fabdive-input-focus focus:border-fabdive-input-focus"
                      required
                      disabled={formState === 'loading'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-fabdive-text">Nom d'affichage</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fabdive-text/70" />
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Ton prénom ou pseudo"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-fabdive-text placeholder-fabdive-text/70 focus:ring-fabdive-input-focus focus:border-fabdive-input-focus"
                      required
                      disabled={formState === 'loading'}
                    />
                  </div>
                  
                </div>


                {/* Age Confirmation */}
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="age-confirm"
                    checked={ageConfirmed}
                    onCheckedChange={(checked) => setAgeConfirmed(checked as boolean)}
                    className="h-5 w-5 border-2 border-white/60 bg-white/10 data-[state=checked]:bg-fabdive-button data-[state=checked]:border-fabdive-button data-[state=checked]:text-white shadow-lg"
                  />
                  <label 
                    htmlFor="age-confirm" 
                    className="text-sm text-fabdive-text cursor-pointer"
                  >
                    Je confirme avoir plus de 18 ans
                  </label>
                </div>

                <Button
                  type="button"
                  variant="fabdive"
                  className="w-full"
                  onClick={handleMagicLinkSignIn}
                  disabled={formState === 'loading' || !email || !displayName || !ageConfirmed}
                >
                  {formState === 'loading' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi en cours...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Recevoir un lien magique
                    </div>
                  )}
                </Button>
              </div>


              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
                  <AlertDescription className="text-fabdive-text">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-fabdive-text/70">
            <p>
              Déjà un compte ?{" "}
              <button
                onClick={() => navigate('/login')}
                className="text-fabdive-button hover:underline transition-colors"
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}