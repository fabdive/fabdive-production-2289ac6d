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
        background: `white`
      }}
    >
      {children}
    </div>
  );
};

export default SimpleBackground;