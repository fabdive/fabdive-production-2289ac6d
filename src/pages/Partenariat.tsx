import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronRight } from "lucide-react";
import Header from '../components/Header';

const Partenariat = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

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
                navigate("/partenariat");
              }}
            >
              Partenariat
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="min-h-screen" style={{ backgroundColor: '#4238b3' }}>
        {/* Header section */}
        <div className="px-6 pt-16 pb-8">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center" style={{ color: '#e7b95d' }}>
              <div className="w-12 h-12 rounded-full border-2 border-yellow-400 flex items-center justify-center mr-4">
                <div className="text-2xl">💛</div>
              </div>
              <h1 className="text-4xl font-bold">Fabdive</h1>
            </div>
          </div>

          <div className="border-2 border-yellow-400 rounded-2xl p-6 mb-8">
            <h2 className="text-white text-3xl font-bold text-center mb-6">
              Devenir Partenaire
            </h2>
            
            <p className="text-white text-xl mb-8 text-center">Vous êtes...</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/90 rounded-xl p-6">
                <h3 className="text-pink-600 text-2xl font-bold mb-4">
                  Créateur de contenu
                </h3>
                <p className="text-gray-700">
                  sensible aux valeurs humaines et aux relations authentiques ?
                </p>
              </div>
              
              <div className="bg-white/90 rounded-xl p-6">
                <h3 className="text-pink-600 text-2xl font-bold mb-4">
                  Organisateur d'événements
                </h3>
                <p className="text-gray-700">
                  ou gérant de lieux propices aux connexions humaines ?
                </p>
              </div>
              
              <div className="bg-white/90 rounded-xl p-6">
                <h3 className="text-pink-600 text-2xl font-bold mb-4">
                  Marque lifestyle
                </h3>
                <p className="text-gray-700">
                  qui croit à la magie des rencontres affinées ?
                </p>
              </div>
              
              <div className="bg-white/90 rounded-xl p-6">
                <h3 className="text-pink-600 text-2xl font-bold mb-4">
                  Coach ou thérapeute relationnel
                </h3>
                <p className="text-gray-700">
                  à la recherche d'un écosystème d'amour conscient ?
                </p>
              </div>
            </div>
            
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-2">Rejoignez l'univers</h3>
              <h3 className="text-2xl font-bold mb-4">Fabdive Affinity</h3>
              <p className="text-lg">
                Notre application redéfinit la rencontre amoureuse avec un{' '}
                <span className="font-bold">modèle affinitaire et intuitif</span>, centré sur les{' '}
                <span className="font-bold">goûts, les valeurs, l'imaginaire</span> et la{' '}
                <span className="font-bold">connexion subtile</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Philosophy section */}
        <div className="px-6 py-8">
          <h2 className="text-white text-2xl font-bold text-center mb-8">
            Participez à un mouvement
          </h2>
          
          <div className="space-y-6 mb-8">
            <div className="flex items-start text-white">
              <ChevronRight className="w-6 h-6 text-red-400 mr-4 flex-shrink-0 mt-1" />
              <div>
                <span className="text-xl font-bold">Moins de swipe</span>
                <ChevronRight className="w-5 h-5 text-red-400 inline mx-2" />
                <span className="text-xl font-bold">Plus de sens.</span>
              </div>
            </div>
            
            <div className="flex items-start text-white">
              <ChevronRight className="w-6 h-6 text-red-400 mr-4 flex-shrink-0 mt-1" />
              <div>
                <span className="text-xl font-bold">Moins de vitrine</span>
                <ChevronRight className="w-5 h-5 text-red-400 inline mx-2" />
                <span className="text-xl font-bold">Plus de vibration</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/30 pt-8">
            <h3 className="text-white text-2xl font-bold text-center mb-8">
              Nos formules Partenaires
            </h3>
            
            <div className="space-y-8">
              <div className="bg-white/10 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-4 h-4 bg-red-400 rounded-full mr-4"></div>
                  <h4 className="text-white text-xl font-bold">Influenceur Affinitaire</h4>
                </div>
                <p className="text-white">
                  Faites découvrir Fabdive Affinity à votre communauté et soyez récompensé(e)
                </p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-4 h-4 bg-red-400 rounded-full mr-4"></div>
                  <h4 className="text-white text-xl font-bold">Organisateur ou lieu</h4>
                </div>
                <p className="text-white">
                  Intégrez l'univers Fabdive dans vos soirées, lieux atypiques, festivals ou retraites
                </p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-4 h-4 bg-red-400 rounded-full mr-4"></div>
                  <h4 className="text-white text-xl font-bold">Marque lifestyle ou éthique</h4>
                </div>
                <p className="text-white">
                  Associez votre image à une application qui incarne : bienveillance, authenticité, esthétique et lien humain.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits section */}
        <div className="px-6 py-8">
          <h3 className="text-white text-2xl font-bold text-center mb-8">
            En rejoignant le réseau Fabdive
          </h3>
          
          <div className="space-y-6 mb-8">
            <div className="flex items-start text-white">
              <div className="w-4 h-4 bg-red-400 rounded-full mr-4 flex-shrink-0 mt-2"></div>
              <p className="text-lg">
                Vous touchez une audience engagée, en quête de relations vraies
              </p>
            </div>
            
            <div className="flex items-start text-white">
              <div className="w-4 h-4 bg-red-400 rounded-full mr-4 flex-shrink-0 mt-2"></div>
              <p className="text-lg">
                Vous bénéficiez d'un accompagnement sur-mesure
              </p>
            </div>
            
            <div className="flex items-start text-white">
              <div className="w-4 h-4 bg-red-400 rounded-full mr-4 flex-shrink-0 mt-2"></div>
              <p className="text-lg">
                Vous contribuez à faire rayonner une nouvelle culture de la rencontre
              </p>
            </div>
          </div>
          
          <div className="border-t border-white/30 pt-8 text-center">
            <p className="text-white text-xl mb-4">
              Prêt(e) à faire vibrer les affinités ?
            </p>
            
            <p className="text-white text-lg mb-6">
              contactez-nous directement :
            </p>
            
            <p className="text-yellow-400 text-xl font-bold">
              hello@fabdive.com
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Partenariat;