
import React from 'react';

interface EtresLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const EtresLogo: React.FC<EtresLogoProps> = ({ size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} rounded-full gradient-bg flex items-center justify-center shadow-lg`}>
        <span className={`${textSizeClasses[size]} font-bold text-white`}>3</span>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-foreground">E.tres Agent</span>
          <span className="text-xs text-muted-foreground">Asistente Inteligente</span>
        </div>
      )}
    </div>
  );
};

export default EtresLogo;
