import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIPulseIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  sublabel?: string;
  className?: string;
}

export const AIPulseIndicator: React.FC<AIPulseIndicatorProps> = ({
  size = 'md',
  label = 'Gemini AI Core',
  sublabel,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const containerSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Expanding Ring 1 */}
        <div className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ai-ring pointer-events-none" />
        {/* Expanding Ring 2 (Offset) */}
        <div
          className="absolute inset-0 rounded-full bg-blue-500/20 animate-ai-ring pointer-events-none"
          style={{ animationDelay: '1.2s' }}
        />

        {/* Central Glowing Orb */}
        <div
          className={`relative rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg animate-ai-pulse ${containerSizes[size]}`}
        >
          <Sparkles className={`${iconSizes[size]} text-cyan-200`} />
        </div>
      </div>

      {(label || sublabel) && (
        <div className="flex flex-col text-left">
          {label && (
            <span className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
              <span>{label}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </span>
          )}
          {sublabel && (
            <span className="text-[10px] text-cyan-300/80 font-medium">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
