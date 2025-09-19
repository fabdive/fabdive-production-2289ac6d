import React from 'react';
import { Button } from '../components/ui/button';
import { Heart, Check, X } from 'lucide-react';

const CadeauAbonnement = () => {
  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)'
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header avec logo */}
        <div className="bg-white rounded-lg p-6 mb-6 text-center">
          <img 
            src="/logo-fabdive-email.png" 
            alt="Fabdive affinity" 
            className="h-20 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-fabdive-primary mb-2">
            Ton histoire d'amour pourrait commencer ici
          </h1>
        </div>

        {/* Section principale avec texte et image des oiseaux */}
        <div className="bg-white rounded-lg p-8 mb-6">
          <div className="text-center mb-6">
            <p className="text-lg text-fabdive-primary leading-relaxed">
              Imagine <strong>construire ton futur</strong> avec une personne qui partage tes <strong>valeurs</strong>, tes{' '}
              <strong>rêves</strong>, et tes <strong>quirks</strong> — bien au-delà d'un simple <em>swipe</em> ou d'une photo. Chez{' '}
              <strong>Fabdive Affinity</strong>, on est convaincue les <strong>plus belles histoires d'amour</strong>{' '}
              naissent des <strong>affinités profondes</strong>, pas des apparences.
            </p>
          </div>
          
          <div className="flex justify-center mb-6">
            <img 
              src="/offert-birds.png" 
              alt="Offert en première" 
              className="w-full max-w-2xl rounded-lg"
            />
          </div>

          <p className="text-center text-lg text-fabdive-primary">
            Fini les rencontres qui ne mènent nulle part. Avec Fabdive, tu <strong>matches par affinité</strong> avant même de voir une photo. 
            Parce que l'amour, ça se construit sur ce qui nous unit, pas sur ce qu'on voit en deux secondes.
          </p>
        </div>

        {/* Section Pourquoi Fabdive est différent */}
        <div className="bg-white rounded-lg p-8 mb-6">
          <h2 className="text-3xl font-bold text-fabdive-primary text-center mb-8">
            Pourquoi Fabdive est différent ?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Les autres apps */}
            <div>
              <div className="mb-4">
                <img 
                  src="/candy-hearts.png" 
                  alt="Candy hearts" 
                  className="w-32 h-20 object-cover rounded-lg"
                />
              </div>
              <h3 className="text-xl font-semibold text-fabdive-primary mb-4">
                Les autres apps :
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <X className="text-red-500 mt-1 flex-shrink-0" size={20} />
                  <span>Des <em>swipes</em> basés sur des photos.</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="text-red-500 mt-1 flex-shrink-0" size={20} />
                  <span>Des conversations qui s'éteignent aussi vite qu'elles ont commencé.</span>
                </div>
              </div>
            </div>

            {/* Fabdive Affinity */}
            <div>
              <div className="mb-4">
                <img 
                  src="/couple-silhouette.png" 
                  alt="Couple silhouette" 
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
              <h3 className="text-xl font-semibold text-fabdive-primary mb-4">
                Fabdive Affinity :
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                  <span><strong>Un profil affinitaire</strong> (à décrire à l'inscription).</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                  <span><strong>Des quiz et des questions profondes</strong> pour découvrir vos compatibilités.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                  <span><strong>Les photos se dévoilent après avoir établi une connexion</strong>, car l'essentiel est invisible pour les yeux.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                  <span><strong>Des événements IRL exclusifs</strong> (soirées, ateliers) pour rencontrer vos matches dans un cadre magique.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Offre exclusive */}
        <div className="bg-white rounded-lg p-8 mb-6">
          <h2 className="text-4xl font-bold text-center mb-2" style={{ color: '#E879F9' }}>
            Ton offre exclusive (et limitée !)
          </h2>
          
          <p className="text-center text-fabdive-primary text-lg mb-6">
            En t'inscrivant <strong>dès maintenant</strong>, tu bénéficies de :
          </p>

          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎁</span>
              <span className="text-lg"><strong>3 mois d'abonnement premium gratuit</strong></span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">👑</span>
              <span className="text-lg"><strong>Des points bonus</strong> pour débloquer des fonctionnalités exclusives dès le lancement officiel.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💝</span>
              <span className="text-lg"><strong>Un accès prioritaire aux événements IRL</strong> (réservés aux pionnier·ères).</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <span className="text-lg"><strong>Offre valable seulement jusqu'au 28 septembre.</strong> Ne laisse pas ton histoire d'amour attendre !</span>
            </div>
          </div>
        </div>

        {/* Section Test avec coeur au néon */}
        <div className="bg-white rounded-lg p-8 mb-6">
          <div className="mb-6 flex justify-center">
            <img 
              src="/heart-neon.png" 
              alt="Heart neon ECG" 
              className="w-full max-w-2xl rounded-lg"
            />
          </div>
          
          <h2 className="text-4xl font-bold text-center mb-4" style={{ color: '#E879F9' }}>
            Teste-toi avec ces 2 quizzes
          </h2>
          
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold text-fabdive-primary">
              Es-tu prêt(e) pour une histoire d'amour ?
            </p>
            <p className="text-lg text-fabdive-primary">
              Découvre où tu en es sentimentalement
            </p>
          </div>
          
          <div className="mt-8 text-center">
            <div className="mb-6 flex justify-center">
              <img 
                src="/love-sand.png" 
                alt="Love written in sand with Fabdive logo" 
                className="w-full max-w-2xl rounded-lg"
              />
            </div>
            
            <Button 
              className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-semibold px-8 py-3 text-lg"
            >
              Je construis mon futur avec Fabdive
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-fabdive-primary mb-4">
            Tu as des questions ? Réponds simplement à cet email, on se fera un plaisir de t'aider.
          </p>
          
          <div className="mb-6">
            <div className="text-red-400 text-4xl mb-2">✉</div>
            <div className="text-xl font-semibold text-fabdive-primary mb-2">Email</div>
            <a 
              href="mailto:hello@fabdive.com" 
              className="text-blue-600 hover:text-blue-800 text-lg font-medium"
            >
              hello@fabdive.com
            </a>
          </div>

          <div className="text-center">
            <a href="#" className="text-blue-600 hover:text-blue-800">
              • Pour te désabonner, clique ici
            </a>
          </div>
          
          <div className="mt-6 text-sm text-gray-600">
            © 2025 Fabdive Affinity. Tous droits réservés.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadeauAbonnement;