import Header from "@/components/Header";

const QuizSentiment = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary-dark to-primary-darker">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Titre principal */}
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
          Où en es-tu sentimentalement ?
        </h1>
        
        {/* Quiz intégré */}
        <div className="rounded-lg shadow-lg mb-8">
          <iframe
            src="https://tally.so/embed/wLrM1p?alignLeft=1&hideTitle=1&dynamicHeight=1"
            width="100%"
            height="600"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="Quiz Sentiment Fabdive"
            className="rounded-lg"
          />
        </div>
        
        {/* Section Parrainage */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Parrainage Fabdive : Invite tes amis, débloque des récompenses
          </h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between bg-white/20 rounded-lg p-3">
              <span className="font-medium">1 parrainage</span>
              <span>1 mois d'abonnement Premium</span>
            </div>
            
            <div className="flex items-center justify-between bg-white/20 rounded-lg p-3">
              <span className="font-medium">2 parrainages</span>
              <span>1 mois VIP + 1 jour Play Room</span>
            </div>
            
            <div className="flex items-center justify-between bg-white/20 rounded-lg p-3">
              <span className="font-medium">3 parrainages</span>
              <span>1 mois VIP + 1 mois Play Room</span>
            </div>
            
            <div className="flex items-center justify-between bg-white/20 rounded-lg p-3">
              <span className="font-medium">5 parrainages</span>
              <span>3 mois VIP + 3 mois Play Room</span>
            </div>
            
            <div className="flex items-center justify-between bg-white/20 rounded-lg p-3">
              <span className="font-medium">10 parrainages</span>
              <span>1 an VIP + 1 an Play Room</span>
            </div>
          </div>
          
          <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-4 text-sm">
            <p className="mb-2">
              ⚠️ Les récompenses sont associées à une seule adresse email et ne peuvent être transférées.
            </p>
            <p>
              Les abonnements démarrent automatiquement à l'ouverture officielle du site ou de l'application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSentiment;