import React from 'react';

interface SimpleBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

const SimpleBackground: React.FC<SimpleBackgroundProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div 
      className={`${className}`}
      style={{
        background: `
          linear-gradient(135deg, 
            #4A1B3A 0%, 
            #5A2C5A 25%, 
            #6B3D6B 50%, 
            #5A4B8A 75%, 
            #4A5B9A 100%
          )
        `
      }}
    >
      {children}
    </div>
  );
};

export default SimpleBackground;