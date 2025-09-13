import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Header from '../components/Header';
import { supabase } from "@/integrations/supabase/client";

const Cadeaux = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [hasSubscription, setHasSubscription] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserRewards = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Charger les points totaux
        const { data: points } = await supabase
          .from('points_gained')
          .select('points_amount')
          .eq('user_id', user.id);

        if (points) {
          const totalPoints = points.reduce((sum, point) => sum + point.points_amount, 0);
          setUserPoints(totalPoints);
        }

        // Vérifier l'abonnement premium
        const { data: subscription } = await supabase
          .from('subscription_offered')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        setHasSubscription(!!subscription);
      } catch (error) {
        console.error('Erreur lors du chargement des récompenses:', error);
      }
    };

    loadUserRewards();
  }, []);

  return (
    <>
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
              Mes matchs
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
              Mes crushs
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
              Mes cadeaux
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-white/10"
              style={{ color: '#14018d' }}
              onClick={() => {
                setShowMenu(false);
                navigate("/partenariat");
              }}
            >
              Partenariat
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="min-h-screen" style={{ backgroundColor: '#14018d' }}>
        <div className="px-6 pt-16 pb-8">
          {/* Header section with gifts */}
          <div className="border-2 rounded-2xl p-6 mb-8" style={{ borderColor: '#e7b95d' }}>
            <h2 className="text-4xl font-bold text-center mb-8" style={{ color: '#fff0b8' }}>
              CADEAUX
            </h2>
            
            <div className="space-y-6 mb-8">
              <div className="bg-white/90 rounded-xl p-6 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-pink-600 rounded-full mr-4"></div>
                  <span className="text-purple-800 text-xl font-bold">ABONNEMENT PREMIUM 1 MOIS</span>
                </div>
                {hasSubscription && <span className="text-green-600 text-2xl">✓</span>}
              </div>
              
              <div className="bg-white/90 rounded-xl p-6 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-pink-600 rounded-full mr-4"></div>
                  <span className="text-purple-800 text-xl font-bold">{userPoints} POINTS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Points earning section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#fff0b8' }}>
              GAGNE DES POINTS
            </h2>
            
            <div className="bg-white/90 rounded-xl p-4 mb-6">
              <p className="text-purple-800 text-center leading-relaxed">
                Les points fabdive sont une monnaie douce à l'intérieur de l'application.
                Ils te permettent de débloquer des fonctionnalités utiles ou ludiques sans avoir à payer à chaque fois.
                Gagne des points en étant actif. Utilise-les pour enrichir tes connexions.
              </p>
            </div>
            
            <div className="bg-white/90 rounded-xl p-6">
              <h3 className="text-purple-800 text-xl font-bold mb-4">
                COMMENT OBTENIR DES POINTS ?
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-800">Tirer ses cartes</span>
                  <span className="text-pink-600 font-bold">+50</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-800">Compléter 100% de son profil</span>
                  <span className="text-pink-600 font-bold">+100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-800">Envoyer un premier message à un match</span>
                  <span className="text-pink-600 font-bold">+20</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-800">Répondre à un quiz proposé</span>
                  <span className="text-pink-600 font-bold">+30</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-800">Inviter un ami</span>
                  <span className="text-pink-600 font-bold">+100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-800">Se connecter 5 jours consécutifs</span>
                  <span className="text-pink-600 font-bold">+50</span>
                </div>
              </div>
            </div>
          </div>

          {/* Points usage section */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#fff0b8' }}>
              À QUOI SERVENT LES POINTS ?
            </h2>
            
            <div className="bg-white/90 rounded-xl p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-800">Voir la photo d'un match</span>
                  <span className="text-pink-600 font-bold">150</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-800">Envoyer un second message</span>
                  <span className="text-pink-600 font-bold">50</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-800">Débloquer un quiz premium</span>
                  <span className="text-pink-600 font-bold">200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-800">Booster son profil pendant 4h</span>
                  <span className="text-pink-600 font-bold">300</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-800">Tirer une autre carte intuitive</span>
                  <span className="text-pink-600 font-bold">100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-800">Voir les 3 meilleurs matches</span>
                  <span className="text-pink-600 font-bold">40</span>
                </div>
              </div>
            </div>
          </div>

          {/* General rules section */}
          <div className="mt-8">
            <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#fff0b8' }}>
              RÈGLES GÉNÉRALES
            </h2>
            
            <div className="bg-white/90 rounded-xl p-6">
              <div className="space-y-3 text-purple-800">
                <p>Les points ne sont pas transférables entre utilisateurs.</p>
                <p>Ils ne peuvent pas être convertis en argent.</p>
                <p>Ils expirent uniquement si le compte reste inactif plus de 6 mois.</p>
                <p>Certains contenus ne sont accessibles qu'aux membres Premium ou VIP, même avec des points.</p>
                <p>Les points offerts ou bonus peuvent varier selon les promotions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cadeaux;