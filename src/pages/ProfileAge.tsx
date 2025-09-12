import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ProfileAge = () => {
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userGender, setUserGender] = useState<string>("");
  const [attractedToTypes, setAttractedToTypes] = useState<string[]>([]);
  const [preferredAgeMin, setPreferredAgeMin] = useState<string>("18");
  const [preferredAgeMax, setPreferredAgeMax] = useState<string>("35");
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
        .select('display_name, birth_date, gender, attracted_to_types')
        .eq('user_id', user.id)
        .single();

      // Charger les préférences d'âge existantes
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('preferred_age_min, preferred_age_max')
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
        setUserGender(profile.gender);
      }
      
      if (profile?.attracted_to_types) {
        setAttractedToTypes(profile.attracted_to_types);
      }
      
      if (profile?.birth_date) {
        const date = new Date(profile.birth_date);
        setDay(date.getDate().toString().padStart(2, '0'));
        setMonth((date.getMonth() + 1).toString().padStart(2, '0'));
        setYear(date.getFullYear().toString());
      }

      // Charger les préférences d'âge
      if (preferences?.preferred_age_min) {
        setPreferredAgeMin(preferences.preferred_age_min.toString());
      }
      if (preferences?.preferred_age_max) {
        setPreferredAgeMax(preferences.preferred_age_max.toString());
      }

    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      navigate("/login");
    }
  };

  const calculateAge = (day: string, month: string, year: string) => {
    if (!day || !month || !year) return null;
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const toggleAttractedToType = (type: string) => {
    setAttractedToTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleSave = async () => {
    if (!day || !month || !year) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner votre date de naissance complète.",
        variant: "destructive",
      });
      return;
    }

    if (attractedToTypes.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un type de personne qui vous attire.",
        variant: "destructive",
      });
      return;
    }

    const age = calculateAge(day, month, year);
    
    if (age && age < 18) {
      toast({
        title: "Âge insuffisant",
        description: "Vous devez avoir au moins 18 ans pour utiliser cette application.",
        variant: "destructive",
      });
      return;
    }
    
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

      const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      // Sauvegarder le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          birth_date: birthDate,
          display_name: userName,
          attracted_to_types: attractedToTypes,
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.error('Erreur lors de la sauvegarde du profil:', profileError);
        toast({
          title: "Erreur de sauvegarde",
          description: "Impossible de sauvegarder votre profil. Veuillez réessayer.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Sauvegarder les préférences d'âge
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferred_age_min: parseInt(preferredAgeMin),
          preferred_age_max: parseInt(preferredAgeMax),
        }, {
          onConflict: 'user_id'
        });

      if (preferencesError) {
        console.error('Erreur lors de la sauvegarde des préférences:', preferencesError);
        toast({
          title: "Erreur de sauvegarde",
          description: "Impossible de sauvegarder vos préférences. Veuillez réessayer.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      navigate("/profile-appearance");

    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
      });
      setIsLoading(false);
    }
  };

  const age = calculateAge(day, month, year);

  // Générer les options pour les jours
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  // Générer les options pour les mois
  const months = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  // Générer les options pour les années (de l'année actuelle - 100 à l'année actuelle - 18)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 82 }, (_, i) => (currentYear - 18 - i).toString());

  // Générer les options pour les âges (18 à 99)
  const ageOptions = Array.from({ length: 82 }, (_, i) => (18 + i).toString());

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-80px)] relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #19019F, #C60D87, #FF41BE)' }}>
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-6 text-center pt-16">
          {/* Profile Summary - Genre Image Only */}
          {userGender && (
            <div className="mb-8 animate-fade-in">
              <div className="flex justify-center">
                <img
                  src={`/s-${userGender}.png`}
                  alt={userGender}
                  className="w-16 h-16 object-contain filter brightness-0 invert opacity-80"
                />
              </div>
            </div>
          )}

          {/* Question */}
          <h1 className="text-2xl font-semibold mb-8 font-comfortaa animate-fade-in-1" style={{ color: '#fffae6' }}>
            {userName}, ta date de naissance ?
          </h1>

          {/* Sélecteurs de date */}
          <div className="w-full max-w-md mb-8 animate-fade-in-1">
            <div className="grid grid-cols-3 gap-3">
              {/* Jour */}
              <div>
                <Select value={day} onValueChange={setDay} disabled={isLoading}>
                  <SelectTrigger className="bg-fabdive-profile-input-bg border-fabdive-input-focus text-fabdive-text focus:ring-fabdive-input-focus rounded-full">
                    <SelectValue placeholder="Jour" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mois */}
              <div>
                <Select value={month} onValueChange={setMonth} disabled={isLoading}>
                  <SelectTrigger className="bg-fabdive-profile-input-bg border-fabdive-input-focus text-fabdive-text focus:ring-fabdive-input-focus rounded-full">
                    <SelectValue placeholder="Mois" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Année */}
              <div>
                <Select value={year} onValueChange={setYear} disabled={isLoading}>
                  <SelectTrigger className="bg-fabdive-profile-input-bg border-fabdive-input-focus text-fabdive-text focus:ring-fabdive-input-focus rounded-full">
                    <SelectValue placeholder="Année" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Age display */}
          {age && (
            <div className="mb-8 animate-fade-in-2">
              <p className="text-lg" style={{ color: '#fffae6' }}>
                Tu as {age} ans
              </p>
            </div>
          )}

          {/* Question À qui t'adresses-tu */}
          {age && age >= 18 && (
            <div className="mb-8 animate-fade-in-3">
              <h2 className="text-xl font-medium mb-6 font-comfortaa" style={{ color: '#fffae6' }}>
                Tu t'adresses à
              </h2>
              
              {/* Options de genre */}
              <div className="flex justify-center gap-6 mb-8">
                {/* Homme */}
                <Button
                  variant={attractedToTypes.includes('homme') ? 'fabdive' : 'outline'}
                  onClick={() => toggleAttractedToType('homme')}
                  className={`flex flex-col items-center p-4 w-20 h-24 ${
                    attractedToTypes.includes('homme') 
                      ? 'bg-fabdive-button text-white' 
                      : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                  }`}
                  disabled={isLoading}
                >
                  <img
                    src="/s-homme.png"
                    alt="Homme"
                    className={`w-8 h-8 object-contain mb-2 ${
                      attractedToTypes.includes('homme') 
                        ? 'filter brightness-0' 
                        : 'filter brightness-0 invert'
                    }`}
                  />
                  <span className="text-xs">Homme</span>
                </Button>

                {/* Femme */}
                <Button
                  variant={attractedToTypes.includes('femme') ? 'fabdive' : 'outline'}
                  onClick={() => toggleAttractedToType('femme')}
                  className={`flex flex-col items-center p-4 w-20 h-24 ${
                    attractedToTypes.includes('femme') 
                      ? 'bg-fabdive-button text-white' 
                      : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                  }`}
                  disabled={isLoading}
                >
                  <img
                    src="/s-femme.png"
                    alt="Femme"
                    className={`w-8 h-8 object-contain mb-2 ${
                      attractedToTypes.includes('femme') 
                        ? 'filter brightness-0' 
                        : 'filter brightness-0 invert'
                    }`}
                  />
                  <span className="text-xs">Femme</span>
                </Button>

                {/* Autre */}
                <Button
                  variant={attractedToTypes.includes('autre') ? 'fabdive' : 'outline'}
                  onClick={() => toggleAttractedToType('autre')}
                  className={`flex flex-col items-center p-4 w-20 h-24 ${
                    attractedToTypes.includes('autre') 
                      ? 'bg-fabdive-button text-white' 
                      : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                  }`}
                  disabled={isLoading}
                >
                  <img
                    src="/s-autre.png"
                    alt="Autre"
                    className={`w-8 h-8 object-contain mb-2 ${
                      attractedToTypes.includes('autre') 
                        ? 'filter brightness-0' 
                        : 'filter brightness-0 invert'
                    }`}
                  />
                  <span className="text-xs">Autre</span>
                </Button>
              </div>

              {/* Question Son âge */}
              {attractedToTypes.length > 0 && (
                <div className="animate-fade-in-4">
                  <h3 className="text-lg font-medium mb-6 font-comfortaa" style={{ color: '#fffae6' }}>
                    Son âge ?
                  </h3>
                  
                  {/* Sélecteurs d'âge */}
                  <div className="flex justify-center items-center gap-4">
                    <div className="flex flex-col items-center">
                      <Select value={preferredAgeMin} onValueChange={setPreferredAgeMin} disabled={isLoading}>
                        <SelectTrigger className="bg-fabdive-button text-fabdive-blue rounded-full w-16 h-16 border-none font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ageOptions.filter(age => parseInt(age) <= parseInt(preferredAgeMax)).map((ageOption) => (
                            <SelectItem key={ageOption} value={ageOption}>
                              {ageOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-sm mt-2" style={{ color: '#fffae6' }}>De</span>
                    </div>
                    
                    <span className="text-lg font-medium" style={{ color: '#fffae6' }}>à</span>
                    
                    <div className="flex flex-col items-center">
                      <Select value={preferredAgeMax} onValueChange={setPreferredAgeMax} disabled={isLoading}>
                        <SelectTrigger className="bg-fabdive-button text-fabdive-blue rounded-full w-16 h-16 border-none font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ageOptions.filter(age => parseInt(age) >= parseInt(preferredAgeMin)).map((ageOption) => (
                            <SelectItem key={ageOption} value={ageOption}>
                              {ageOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-sm mt-2" style={{ color: '#fffae6' }}>à</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warning for underage */}
          {age && age < 18 && (
            <div className="mb-8 animate-fade-in-4">
              <p className="text-sm text-red-300 bg-red-900/20 px-4 py-2 rounded-full">
                Vous devez avoir au moins 18 ans pour utiliser cette application
              </p>
            </div>
          )}

          {/* Save button */}
          {day && month && year && age && age >= 18 && attractedToTypes.length > 0 && (
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-8 py-3 bg-fabdive-button text-fabdive-blue rounded-full font-medium hover:bg-fabdive-button/90 transition-all animate-fade-in-4 disabled:opacity-50 font-comfortaa mb-8"
            >
              {isLoading ? 'Sauvegarde...' : 'Continuer'}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileAge;