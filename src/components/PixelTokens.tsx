import React from 'react';
import { HeroClass, MonsterType } from '../types/heroquest';

interface TokenProps {
  size?: number;
  className?: string;
  isBoss?: boolean;
}

// 1. BARBARIAN: Muscular northern warrior with fur spaulders, red headband, and broadsword
export const BarbarianPixelSprite: React.FC<TokenProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
    {/* Base shadow */}
    <ellipse cx="16" cy="28" rx="10" ry="3" fill="#000000" opacity="0.4" />
    {/* Body / Muscle */}
    <rect x="11" y="14" width="10" height="9" fill="#d97706" />
    {/* Leather Harness & Belt */}
    <rect x="10" y="19" width="12" height="3" fill="#78350f" />
    <rect x="15" y="19" width="2" height="3" fill="#ca8a04" />
    {/* Fur spaulders */}
    <rect x="8" y="13" width="4" height="4" fill="#92400e" />
    <rect x="20" y="13" width="4" height="4" fill="#92400e" />
    {/* Head & Face */}
    <rect x="12" y="8" width="8" height="6" fill="#fcd34d" />
    {/* Hair (Wild Black/Brown) */}
    <rect x="11" y="6" width="10" height="3" fill="#451a03" />
    <rect x="10" y="8" width="2" height="5" fill="#451a03" />
    <rect x="20" y="8" width="2" height="5" fill="#451a03" />
    {/* Red War Bandana */}
    <rect x="11" y="8" width="10" height="2" fill="#dc2626" />
    {/* Eyes */}
    <rect x="13" y="10" width="2" height="1" fill="#1c1917" />
    <rect x="17" y="10" width="2" height="1" fill="#1c1917" />
    {/* Legs / Boots */}
    <rect x="11" y="23" width="4" height="5" fill="#78350f" />
    <rect x="17" y="23" width="4" height="5" fill="#78350f" />
    {/* Huge Broadsword */}
    <rect x="23" y="4" width="3" height="18" fill="#e2e8f0" />
    <rect x="24" y="2" width="1" height="2" fill="#f8fafc" />
    <rect x="21" y="18" width="7" height="2" fill="#ca8a04" />
    <rect x="23" y="20" width="3" height="3" fill="#78350f" />
  </svg>
);

// 2. DWARF: Armored dwarf with braided golden beard, iron winged helmet, and battleaxe
export const DwarfPixelSprite: React.FC<TokenProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
    <ellipse cx="16" cy="28" rx="10" ry="3" fill="#000000" opacity="0.4" />
    {/* Broad heavy body */}
    <rect x="9" y="15" width="14" height="8" fill="#475569" />
    {/* Iron winged Helmet */}
    <rect x="11" y="6" width="10" height="5" fill="#94a3b8" />
    <rect x="8" y="4" width="3" height="4" fill="#cbd5e1" />
    <rect x="21" y="4" width="3" height="4" fill="#cbd5e1" />
    <rect x="14" y="4" width="4" height="3" fill="#e2e8f0" />
    {/* Eyes through helmet slit */}
    <rect x="12" y="10" width="8" height="2" fill="#0f172a" />
    <rect x="13" y="10" width="2" height="1" fill="#38bdf8" />
    <rect x="17" y="10" width="2" height="1" fill="#38bdf8" />
    {/* Huge Braided Red/Orange Beard */}
    <path d="M10 12h12v6l-2 4h-8l-2-4v-6z" fill="#ea580c" />
    <rect x="14" y="20" width="4" height="3" fill="#c2410c" />
    {/* Dwarf boots */}
    <rect x="10" y="23" width="5" height="5" fill="#334155" />
    <rect x="17" y="23" width="5" height="5" fill="#334155" />
    {/* Heavy Battleaxe */}
    <rect x="4" y="8" width="5" height="7" fill="#cbd5e1" />
    <rect x="2" y="9" width="3" height="5" fill="#94a3b8" />
    <rect x="6" y="6" width="2" height="18" fill="#78350f" />
  </svg>
);

// 3. ELF: Agile warrior-mage with emerald hood, long composite bow, and quiver
export const ElfPixelSprite: React.FC<TokenProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
    <ellipse cx="16" cy="28" rx="9" ry="3" fill="#000000" opacity="0.4" />
    {/* Slender green tunic & cloak */}
    <rect x="11" y="14" width="10" height="9" fill="#15803d" />
    <rect x="9" y="15" width="2" height="8" fill="#166534" />
    <rect x="21" y="15" width="2" height="8" fill="#166534" />
    {/* Golden Hair and Pointed Hood */}
    <rect x="11" y="5" width="10" height="5" fill="#16a34a" />
    <rect x="10" y="8" width="2" height="7" fill="#facc15" />
    <rect x="20" y="8" width="2" height="7" fill="#facc15" />
    {/* Elven Face */}
    <rect x="12" y="9" width="8" height="5" fill="#fde68a" />
    {/* Emerald Eyes */}
    <rect x="13" y="11" width="2" height="1" fill="#059669" />
    <rect x="17" y="11" width="2" height="1" fill="#059669" />
    {/* Boots */}
    <rect x="12" y="23" width="3" height="5" fill="#854d0e" />
    <rect x="17" y="23" width="3" height="5" fill="#854d0e" />
    {/* Composite Bow */}
    <path d="M6 6c-3 6-3 12 0 18" stroke="#ca8a04" strokeWidth="2" fill="none" strokeLinecap="round" />
    <line x1="6" y1="6" x2="6" y2="24" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="1,1" />
  </svg>
);

// 4. WIZARD: Arcane master in starry robe with pointed cowl and glowing crystal staff
export const WizardPixelSprite: React.FC<TokenProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
    <ellipse cx="16" cy="28" rx="9" ry="3" fill="#000000" opacity="0.4" />
    {/* Deep Blue/Purple Mage Robe */}
    <path d="M10 14h12l3 13H7l3-13z" fill="#1e1b4b" />
    <rect x="12" y="14" width="8" height="13" fill="#312e81" />
    {/* Wizard Pointed Hat */}
    <path d="M16 2l6 9H10l6-9z" fill="#4338ca" />
    <rect x="8" y="10" width="16" height="2" fill="#6366f1" />
    {/* Wise face & White Beard */}
    <rect x="13" y="12" width="6" height="3" fill="#fde047" />
    <rect x="14" y="13" width="1" height="1" fill="#000" />
    <rect x="17" y="13" width="1" height="1" fill="#000" />
    <path d="M12 15h8l-2 5h-4l-2-5z" fill="#f8fafc" />
    {/* Glowing Arcane Staff */}
    <rect x="23" y="8" width="2" height="19" fill="#78350f" />
    <circle cx="24" cy="6" r="3" fill="#38bdf8" />
    <circle cx="24" cy="6" r="1.5" fill="#e0f2fe" />
  </svg>
);

// 5. GOBLIN: Sneaky green creature with pointed ears and curved dagger
export const GoblinPixelSprite: React.FC<TokenProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
    <ellipse cx="16" cy="27" rx="8" ry="3" fill="#000" opacity="0.4" />
    {/* Green Body */}
    <rect x="11" y="16" width="10" height="7" fill="#65a30d" />
    {/* Rags */}
    <rect x="10" y="19" width="12" height="4" fill="#78350f" />
    {/* Pointy Head & Ears */}
    <rect x="12" y="9" width="8" height="7" fill="#84cc16" />
    <rect x="7" y="10" width="5" height="3" fill="#84cc16" />
    <rect x="20" y="10" width="5" height="3" fill="#84cc16" />
    {/* Fiery Red Eyes */}
    <rect x="13" y="12" width="2" height="2" fill="#ef4444" />
    <rect x="17" y="12" width="2" height="2" fill="#ef4444" />
    {/* Sharp curved dagger */}
    <rect x="23" y="13" width="2" height="8" fill="#e2e8f0" />
    <rect x="21" y="17" width="4" height="2" fill="#78350f" />
  </svg>
);

// 6. ORC: Brutal green brute with tusks and studded leather
export const OrcPixelSprite: React.FC<TokenProps> = ({ size = 34, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
    <ellipse cx="16" cy="27" rx="9" ry="3" fill="#000" opacity="0.4" />
    {/* Muscular Body */}
    <rect x="10" y="14" width="12" height="8" fill="#15803d" />
    <rect x="9" y="16" width="14" height="6" fill="#78350f" />
    {/* Brutal Jaw and Tusks */}
    <rect x="11" y="8" width="10" height="7" fill="#22c55e" />
    <rect x="12" y="14" width="2" height="2" fill="#f8fafc" />
    <rect x="18" y="14" width="2" height="2" fill="#f8fafc" />
    {/* Pig-like Red Eyes */}
    <rect x="13" y="10" width="2" height="2" fill="#b91c1c" />
    <rect x="17" y="10" width="2" height="2" fill="#b91c1c" />
    {/* Iron Scimitar */}
    <path d="M23 7l2 2-3 11-2-1 3-12z" fill="#cbd5e1" />
    <rect x="20" y="18" width="3" height="3" fill="#451a03" />
  </svg>
);

// 7. FIMIR: Swamp cyclops reptile with horned tail and club
export const FimirPixelSprite: React.FC<TokenProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
    <ellipse cx="16" cy="28" rx="10" ry="3" fill="#000" opacity="0.4" />
    <rect x="9" y="13" width="14" height="10" fill="#0f766e" />
    <rect x="11" y="7" width="10" height="7" fill="#14b8a6" />
    {/* Single Glowing Yellow Cyclops Eye */}
    <rect x="14" y="9" width="4" height="4" fill="#eab308" />
    <rect x="15" y="10" width="2" height="2" fill="#000000" />
    {/* Snout & Horns */}
    <rect x="8" y="6" width="3" height="4" fill="#042f2e" />
    <rect x="21" y="6" width="3" height="4" fill="#042f2e" />
    {/* Spiked Club */}
    <rect x="23" y="10" width="4" height="14" fill="#713f12" />
    <rect x="22" y="12" width="6" height="3" fill="#78350f" />
  </svg>
);

// 8. SKELETON: Bony skull and ribcage with cracked sword
export const SkeletonPixelSprite: React.FC<TokenProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
    <ellipse cx="16" cy="27" rx="8" ry="3" fill="#000" opacity="0.4" />
    {/* Ribcage */}
    <rect x="13" y="15" width="6" height="8" fill="#e2e8f0" />
    <line x1="12" y1="17" x2="20" y2="17" stroke="#000" strokeWidth="1" />
    <line x1="12" y1="20" x2="20" y2="20" stroke="#000" strokeWidth="1" />
    {/* Skull */}
    <rect x="12" y="7" width="8" height="8" fill="#f8fafc" rx="1" />
    <rect x="13" y="10" width="2" height="2" fill="#09090b" />
    <rect x="17" y="10" width="2" height="2" fill="#09090b" />
    {/* Ancient rusted sword */}
    <rect x="22" y="8" width="2" height="15" fill="#94a3b8" />
    <rect x="20" y="19" width="6" height="2" fill="#713f12" />
  </svg>
);

// 9. ZOMBIE: Rotting flesh in shreds
export const ZombiePixelSprite: React.FC<TokenProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
    <ellipse cx="16" cy="27" rx="8" ry="3" fill="#000" opacity="0.4" />
    <rect x="11" y="15" width="10" height="9" fill="#475569" />
    <rect x="11" y="7" width="10" height="8" fill="#64748b" />
    {/* Sunken eyes */}
    <rect x="13" y="10" width="2" height="2" fill="#0f172a" />
    <rect x="17" y="10" width="2" height="2" fill="#0f172a" />
    {/* Open jaw */}
    <rect x="14" y="13" width="4" height="2" fill="#1e293b" />
  </svg>
);

// 10. MUMMY: Ancient linen wraps and gold amulet
export const MummyPixelSprite: React.FC<TokenProps> = ({ size = 34, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
    <ellipse cx="16" cy="27" rx="8" ry="3" fill="#000" opacity="0.4" />
    <rect x="11" y="14" width="10" height="10" fill="#d97706" />
    <rect x="11" y="7" width="10" height="8" fill="#f59e0b" />
    {/* Linen wrap bands */}
    <line x1="11" y1="9" x2="21" y2="9" stroke="#78350f" strokeWidth="1" />
    <line x1="11" y1="12" x2="21" y2="12" stroke="#78350f" strokeWidth="1" />
    <line x1="11" y1="17" x2="21" y2="17" stroke="#78350f" strokeWidth="1" />
    <line x1="11" y1="20" x2="21" y2="20" stroke="#78350f" strokeWidth="1" />
    {/* Glowing Ancient Curse Eyes */}
    <rect x="13" y="10" width="2" height="2" fill="#dc2626" />
    <rect x="17" y="10" width="2" height="2" fill="#dc2626" />
  </svg>
);

// 11. CHAOS WARRIOR: Spiked dark plate armor with horned helmet and red visor
export const ChaosWarriorPixelSprite: React.FC<TokenProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
    <ellipse cx="16" cy="28" rx="10" ry="3" fill="#000" opacity="0.4" />
    {/* Black plate armor */}
    <rect x="9" y="13" width="14" height="10" fill="#18181b" />
    <rect x="8" y="12" width="4" height="5" fill="#3f3f46" />
    <rect x="20" y="12" width="4" height="5" fill="#3f3f46" />
    {/* Horned Chaos Helmet */}
    <rect x="11" y="6" width="10" height="7" fill="#27272a" />
    <path d="M9 5l3 3M23 5l-3 3" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
    {/* Glowing Crimson Visor */}
    <rect x="12" y="10" width="8" height="2" fill="#f43f5e" />
    {/* Dark Chaos Blade */}
    <rect x="23" y="5" width="3" height="17" fill="#71717a" />
    <line x1="24" y1="5" x2="24" y2="20" stroke="#f43f5e" strokeWidth="1" />
  </svg>
);

// 12. BOSS: GARGOYLE / VERAG — MASSIVE, DEMONIC, STONE WINGS, HORNS & GOLDEN BOSS CROWN
export const BossGargoylePixelSprite: React.FC<TokenProps> = ({ size = 44, className = '' }) => (
  <div className="relative flex items-center justify-center">
    {/* Boss Skull Crown Banner */}
    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-40 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 px-1.5 py-0.2 rounded-full border border-yellow-200 shadow-lg flex items-center gap-0.5">
      <span className="text-[8px] font-pixel text-yellow-100 font-extrabold tracking-wider">
        ★ JEFE ★
      </span>
    </div>

    <svg width={size} height={size} viewBox="0 0 40 40" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Heavy Demonic Shadow */}
      <ellipse cx="20" cy="35" rx="14" ry="4" fill="#000000" opacity="0.6" />

      {/* Massive Unfurled Stone Wings with Crimson Veins */}
      <path
        d="M6 10c0 0 6-8 14-2c8-6 14 2 14 2s-2 10-6 15c-3-5-6-3-8-1c-2-2-5-4-8 1C8 20 6 10 6 10z"
        fill="#3f3f46"
        stroke="#71717a"
        strokeWidth="1.5"
      />
      <path d="M12 11l4 8M28 11l-4 8" stroke="#dc2626" strokeWidth="1.2" />

      {/* Colossal Stone Muscular Torso */}
      <rect x="13" y="17" width="14" height="12" fill="#52525b" />
      <rect x="15" y="19" width="10" height="4" fill="#71717a" />

      {/* Demonic Horned Gargoyle Head */}
      <rect x="14" y="9" width="12" height="9" fill="#71717a" />
      {/* Curved Horns */}
      <path d="M13 9L9 3M27 9l4-6" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />

      {/* Blazing Red Fiery Eyes */}
      <rect x="16" y="12" width="3" height="3" fill="#ef4444" />
      <rect x="21" y="12" width="3" height="3" fill="#ef4444" />
      <circle cx="17.5" cy="13.5" r="0.8" fill="#fef08a" />
      <circle cx="22.5" cy="13.5" r="0.8" fill="#fef08a" />

      {/* Stone Fangs */}
      <polygon points="17,17 18,19 19,17" fill="#ffffff" />
      <polygon points="21,17 22,19 23,17" fill="#ffffff" />

      {/* Spiked Claws */}
      <rect x="9" y="24" width="4" height="6" fill="#3f3f46" />
      <rect x="27" y="24" width="4" height="6" fill="#3f3f46" />
    </svg>
  </div>
);

// Master Component for any Hero Token
export const HeroTokenView: React.FC<{
  heroClass: HeroClass;
  size?: number;
  isActive?: boolean;
}> = ({ heroClass, size = 36, isActive = false }) => {
  return (
    <div
      className={`relative rounded-md flex items-center justify-center transition-all ${
        isActive ? 'ring-2 ring-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' : ''
      }`}
      style={{ width: size, height: size }}
    >
      {heroClass === 'barbarian' && <BarbarianPixelSprite size={size} />}
      {heroClass === 'dwarf' && <DwarfPixelSprite size={size} />}
      {heroClass === 'elf' && <ElfPixelSprite size={size} />}
      {heroClass === 'wizard' && <WizardPixelSprite size={size} />}
    </div>
  );
};

// Master Component for any Monster Token
export const MonsterTokenView: React.FC<{
  type: MonsterType;
  size?: number;
  isBoss?: boolean;
}> = ({ type, size = 34, isBoss = false }) => {
  if (isBoss || type === 'gargoyle') {
    return <BossGargoylePixelSprite size={size + 6} />;
  }

  switch (type) {
    case 'goblin':
      return <GoblinPixelSprite size={size} />;
    case 'orc':
      return <OrcPixelSprite size={size} />;
    case 'fimir':
      return <FimirPixelSprite size={size} />;
    case 'skeleton':
      return <SkeletonPixelSprite size={size} />;
    case 'zombie':
      return <ZombiePixelSprite size={size} />;
    case 'mummy':
      return <MummyPixelSprite size={size} />;
    case 'chaos_warrior':
      return <ChaosWarriorPixelSprite size={size} />;
    default:
      return <OrcPixelSprite size={size} />;
  }
};
