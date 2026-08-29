import React from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  animate?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = false,
  subtitle,
  className = '',
  animate = false,
}) => {
  const sizeMap = {
    xs: { icon: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]' },
    sm: { icon: 'w-9 h-9', text: 'text-base', sub: 'text-[10px]' },
    md: { icon: 'w-11 h-11', text: 'text-lg sm:text-xl', sub: 'text-xs' },
    lg: { icon: 'w-14 h-14', text: 'text-xl sm:text-2xl', sub: 'text-xs sm:text-sm' },
    xl: { icon: 'w-20 h-20', text: 'text-2xl sm:text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} dir="rtl">
      {/* Visual Emblem */}
      <div 
        className={`relative shrink-0 rounded-2xl p-0.5 transition-transform duration-300 ${currentSize.icon} ${
          animate ? 'hover:scale-105 active:scale-95' : ''
        }`}
      >
        <svg 
          viewBox="0 0 512 512" 
          className="w-full h-full drop-shadow-md select-none"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>

            <linearGradient id="logoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            <linearGradient id="logoAccentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>
          </defs>

          {/* Squircle Badge */}
          <rect x="24" y="24" width="464" height="464" rx="112" fill="url(#logoBgGrad)" />
          <rect x="24" y="24" width="464" height="464" rx="112" stroke="white" strokeWidth="10" strokeOpacity="0.25" />

          {/* Roof Arch Glow */}
          <path 
            d="M256 120 L386 222 C396 230 390 246 378 246 L356 246 L256 166 L156 246 L134 246 C122 246 116 230 126 222 L256 120 Z" 
            fill="url(#logoAccentGrad)" 
          />

          {/* Family House Base Pillar */}
          <path 
            d="M192 270 L192 344 C192 352 198 358 206 358 L306 358 C314 358 320 352 320 344 L320 270" 
            stroke="white" 
            strokeWidth="16" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeOpacity="0.3" 
          />

          {/* Golden Prosperity Coin */}
          <circle cx="256" cy="276" r="68" fill="url(#logoGoldGrad)" />
          <circle cx="256" cy="276" r="54" stroke="white" strokeWidth="4" strokeDasharray="8 6" strokeOpacity="0.6" fill="none" />
          
          {/* Growth / Currency Sign */}
          <path 
            d="M256 240 L256 312 M236 260 L276 260 M236 292 L276 292" 
            stroke="#78350f" 
            strokeWidth="10" 
            strokeLinecap="round" 
          />

          {/* Sparkles */}
          <path d="M370 140 Q382 140 382 128 Q382 140 394 140 Q382 140 382 152 Q382 140 370 140 Z" fill="#fef08a" />
          <path d="M125 315 Q133 315 133 307 Q133 315 141 315 Q133 315 133 323 Q133 315 125 315 Z" fill="#6ee7b7" />
        </svg>
      </div>

      {/* Typography / Branding */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-slate-900 ${currentSize.text}`}>
              مصاريف العائلة
            </span>
          </div>
          {subtitle && (
            <span className={`text-slate-500 font-medium ${currentSize.sub}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
