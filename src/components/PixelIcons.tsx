import React from 'react';

interface PixelIconProps {
  className?: string;
  size?: number;
}

// Custom HeroQuest Combat Die Face Icon
export const SkullFaceIcon: React.FC<PixelIconProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <rect width="32" height="32" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="2" />
    {/* Stylized HeroQuest Skull */}
    <path
      d="M10 8h12v4h2v8h-3v4h-2v2h-2v-2h-2v2h-2v-2h-2v-4H8v-8h2V8z"
      fill="#f4f4f5"
    />
    <rect x="11" y="12" width="3" height="4" fill="#09090b" />
    <rect x="18" y="12" width="3" height="4" fill="#09090b" />
    <rect x="15" y="17" width="2" height="2" fill="#09090b" />
    <rect x="12" y="21" width="1" height="2" fill="#09090b" />
    <rect x="15" y="21" width="2" height="2" fill="#09090b" />
    <rect x="19" y="21" width="1" height="2" fill="#09090b" />
  </svg>
);

export const WhiteShieldFaceIcon: React.FC<PixelIconProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <rect width="32" height="32" rx="4" fill="#18181b" stroke="#ca8a04" strokeWidth="2" />
    {/* Hero White Shield */}
    <path
      d="M9 8h14v8c0 5-7 9-7 9s-7-4-7-9V8z"
      fill="#f8fafc"
      stroke="#38bdf8"
      strokeWidth="1.5"
    />
    {/* Lion/Cross emblem on shield */}
    <path d="M16 11v9M12 14h8" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const BlackShieldFaceIcon: React.FC<PixelIconProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <rect width="32" height="32" rx="4" fill="#18181b" stroke="#dc2626" strokeWidth="2" />
    {/* Monster Black Shield */}
    <path
      d="M9 8h14v8c0 5-7 9-7 9s-7-4-7-9V8z"
      fill="#27272a"
      stroke="#ef4444"
      strokeWidth="1.5"
    />
    {/* Chaos star / horned insignia */}
    <path
      d="M16 11l2 3h3l-2.5 2 1 3-3.5-2-3.5 2 1-3-2.5-2h3z"
      fill="#dc2626"
    />
  </svg>
);

// Hero Portraits / Sprites
export const HeroPortrait: React.FC<{ heroClass: string; size?: number; className?: string }> = ({
  heroClass,
  size = 48,
  className = '',
}) => {
  switch (heroClass) {
    case 'barbarian':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-md overflow-hidden bg-gradient-to-b from-amber-700 to-red-950 flex items-center justify-center border-2 border-amber-500 shadow-md ${className}`}
        >
          <span style={{ fontSize: size * 0.55 }} role="img" aria-label="Bárbaro">
            ⚔️
          </span>
          <span className="absolute bottom-0 right-0 text-[10px] bg-red-900/90 text-amber-200 px-1 font-pixel uppercase font-bold">
            BAR
          </span>
        </div>
      );
    case 'dwarf':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-md overflow-hidden bg-gradient-to-b from-amber-800 to-stone-900 flex items-center justify-center border-2 border-yellow-500 shadow-md ${className}`}
        >
          <span style={{ fontSize: size * 0.55 }} role="img" aria-label="Enano">
            🪓
          </span>
          <span className="absolute bottom-0 right-0 text-[10px] bg-amber-950/90 text-yellow-300 px-1 font-pixel uppercase font-bold">
            ENA
          </span>
        </div>
      );
    case 'elf':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-md overflow-hidden bg-gradient-to-b from-emerald-700 to-teal-950 flex items-center justify-center border-2 border-emerald-400 shadow-md ${className}`}
        >
          <span style={{ fontSize: size * 0.55 }} role="img" aria-label="Elfo">
            🏹
          </span>
          <span className="absolute bottom-0 right-0 text-[10px] bg-emerald-950/90 text-emerald-200 px-1 font-pixel uppercase font-bold">
            ELF
          </span>
        </div>
      );
    case 'wizard':
      return (
        <div
          style={{ width: size, height: size }}
          className={`relative rounded-md overflow-hidden bg-gradient-to-b from-blue-700 to-indigo-950 flex items-center justify-center border-2 border-blue-400 shadow-md ${className}`}
        >
          <span style={{ fontSize: size * 0.55 }} role="img" aria-label="Mago">
            🔮
          </span>
          <span className="absolute bottom-0 right-0 text-[10px] bg-indigo-950/90 text-blue-200 px-1 font-pixel uppercase font-bold">
            MAG
          </span>
        </div>
      );
    default:
      return null;
  }
};
