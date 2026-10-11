import React from 'react';

interface HaileLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isThinking?: boolean;
  className?: string;
}

export const HaileLogo: React.FC<HaileLogoProps> = ({
  size = 'md',
  isThinking = false,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Outer ambient glow */}
      <div
        className={`absolute inset-0 rounded-xl bg-gradient-to-tr from-amber-500/30 via-orange-500/20 to-amber-300/30 blur-md transition-all duration-700 ${
          isThinking ? 'scale-125 opacity-100 animate-pulse' : 'scale-100 opacity-60'
        }`}
      />

      {/* Main core badge */}
      <div
        className={`relative ${sizeMap[size]} rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-amber-500/40 shadow-lg shadow-amber-950/40 flex items-center justify-center font-bold font-mono text-amber-300 tracking-wider overflow-hidden`}
      >
        {/* Subtle interior sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-white/10 pointer-events-none" />

        {/* Orbiting beam when thinking */}
        {isThinking && (
          <div className="absolute inset-0 border border-amber-400/60 rounded-xl animate-spin [animation-duration:3s]" />
        )}

        <span className="relative z-10 drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]">
          H
        </span>

        {/* Subtle accent dot */}
        <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-300 animate-ping opacity-75" />
      </div>
    </div>
  );
};
