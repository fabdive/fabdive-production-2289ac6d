import React from 'react';

interface IridescenceBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

const IridescenceBackground: React.FC<IridescenceBackgroundProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <>
      <style>
        {`
          @keyframes iridescence-flow {
            0%, 100% {
              transform: translate(0%, 0%) scale(1);
              opacity: 0.6;
            }
            33% {
              transform: translate(-10%, 10%) scale(1.1);
              opacity: 0.8;
            }
            66% {
              transform: translate(10%, -10%) scale(0.9);
              opacity: 0.7;
            }
          }
          
          @keyframes iridescence-rotate {
            0% {
              transform: rotate(0deg) scale(1);
            }
            50% {
              transform: rotate(180deg) scale(1.1);
            }
            100% {
              transform: rotate(360deg) scale(1);
            }
          }
          
          .iridescence-flow {
            animation: iridescence-flow 8s ease-in-out infinite;
          }
          
          .iridescence-rotate {
            animation: iridescence-rotate 12s linear infinite;
          }
        `}
      </style>
      <div 
        className={`relative overflow-hidden ${className}`}
        style={{
          background: `
            radial-gradient(ellipse 80% 80% at 50% -20%, rgba(255, 0, 110, 0.4), transparent),
            radial-gradient(ellipse 80% 80% at 80% 50%, rgba(131, 56, 236, 0.4), transparent),
            radial-gradient(ellipse 80% 80% at 40% 80%, rgba(58, 134, 255, 0.4), transparent),
            radial-gradient(ellipse 80% 80% at 0% 50%, rgba(6, 255, 165, 0.4), transparent),
            radial-gradient(ellipse 80% 80% at 80% 10%, rgba(255, 190, 11, 0.4), transparent),
            linear-gradient(135deg, #1a0033 0%, #000319 50%, #001433 100%)
          `
        }}
      >
        {/* Animated overlay */}
        <div 
          className="absolute inset-0 opacity-60 iridescence-flow"
          style={{
            background: `
              linear-gradient(45deg, 
                transparent 30%, 
                rgba(255, 0, 110, 0.1) 50%, 
                transparent 70%
              ),
              linear-gradient(-45deg, 
                transparent 30%, 
                rgba(58, 134, 255, 0.1) 50%, 
                transparent 70%
              )
            `
          }}
        />
        
        {/* Shimmer effect */}
        <div 
          className="absolute inset-0 opacity-30 iridescence-rotate"
          style={{
            background: `
              conic-gradient(from 0deg at 50% 50%, 
                rgba(255, 0, 110, 0.2) 0deg, 
                transparent 60deg, 
                rgba(131, 56, 236, 0.2) 120deg, 
                transparent 180deg, 
                rgba(58, 134, 255, 0.2) 240deg, 
                transparent 300deg, 
                rgba(255, 0, 110, 0.2) 360deg
              )
            `
          }}
        />
        
        {children}
      </div>
    </>
  );
};

export default IridescenceBackground;