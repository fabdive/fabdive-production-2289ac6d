import React from 'react';

interface MatchCardProps {
  match: {
    user_id: string;
    display_name: string;
    age: number;
    gender: string;
    distance_km: number;
    skin_color: string;
    body_type: string;
    height_cm: number;
  };
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const getSkinColorImage = (skinColor: string) => {
    const skinColorMap: { [key: string]: string } = {
      'clair': '/couleur-clair.png',
      'beige': '/couleur-beige.png',
      'brun': '/couleur-brun.png',
      'cafe': '/couleur-cafe.png'
    };
    return skinColorMap[skinColor] || '/couleur-clair.png';
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  };

  const formatHeight = (heightCm: number) => {
    if (!heightCm) return '';
    const feet = Math.floor(heightCm / 30.48);
    const inches = Math.round((heightCm % 30.48) / 2.54);
    return `${heightCm}cm (${feet}'${inches}")`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4 animate-fade-in">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <img
            src={getSkinColorImage(match.skin_color)}
            alt="Skin color"
            className="w-12 h-12 rounded-full"
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg font-comfortaa">
              {match.display_name}
            </h3>
            <span className="text-fabdive-button font-medium">
              📍 {formatDistance(match.distance_km)}
            </span>
          </div>
          
          <div className="text-white/80 text-sm mt-1 space-y-1">
            <p>{match.age} ans • {match.gender}</p>
            {match.height_cm && <p>{formatHeight(match.height_cm)}</p>}
            {match.body_type && <p>Morphologie: {match.body_type}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;