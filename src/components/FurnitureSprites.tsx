import React from 'react';

// 1. CHEST SPRITE (Cofre del Tesoro)
export const ChestSprite: React.FC<{ searched?: boolean }> = ({ searched = false }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      className="w-full h-full select-none"
      style={{ imageRendering: 'pixelated' }}
    >
      <defs>
        <radialGradient id="chestGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="16" cy="27" rx="13" ry="3.5" fill="#000000" opacity="0.65" />

      {searched ? (
        // OPENED / SEARCHED CHEST (Empty / Ransacked)
        <g>
          {/* Back interior wall */}
          <rect x="5" y="10" width="22" height="7" rx="1" fill="#1c1917" />
          {/* Open lid tilted backward */}
          <path d="M4 10 L7 3 L25 3 L28 10 Z" fill="#78350f" stroke="#451a03" strokeWidth="1" />
          <rect x="7" y="3" width="18" height="2" fill="#92400e" />
          <rect x="9" y="3" width="2" height="7" fill="#b45309" />
          <rect x="21" y="3" width="2" height="7" fill="#b45309" />
          {/* Inside chest floor with a few stray coin glints */}
          <rect x="6" y="15" width="20" height="4" fill="#0c0a09" />
          <circle cx="10" cy="17" r="1" fill="#facc15" />
          <circle cx="13" cy="18" r="0.8" fill="#eab308" />
          <circle cx="21" cy="17" r="1" fill="#ca8a04" />
          {/* Front box wall */}
          <rect x="5" y="18" width="22" height="9" rx="1" fill="#854d0e" stroke="#451a03" strokeWidth="1" />
          {/* Wood planks */}
          <line x1="5" y1="22" x2="27" y2="22" stroke="#451a03" strokeWidth="1" />
          {/* Iron straps */}
          <rect x="9" y="18" width="3" height="9" fill="#292524" />
          <rect x="20" y="18" width="3" height="9" fill="#292524" />
          {/* Corner brackets */}
          <rect x="5" y="18" width="2" height="9" fill="#ca8a04" />
          <rect x="25" y="18" width="2" height="9" fill="#ca8a04" />
          {/* Unlatched hanging lock plate */}
          <rect x="15" y="19" width="2" height="3" fill="#ca8a04" />
        </g>
      ) : (
        // CLOSED / UNOPENED TREASURE CHEST
        <g>
          {/* Main Chest Body */}
          <rect x="5" y="14" width="22" height="13" rx="1.5" fill="#854d0e" stroke="#291104" strokeWidth="1" />
          {/* Dark wooden plank seams */}
          <line x1="5" y1="18" x2="27" y2="18" stroke="#451a03" strokeWidth="1" />
          <line x1="5" y1="23" x2="27" y2="23" stroke="#451a03" strokeWidth="1" />

          {/* Arched Lid */}
          <path d="M5 14 Q16 6 27 14 Z" fill="#92400e" stroke="#291104" strokeWidth="1" />
          {/* Lid rim highlight */}
          <path d="M5 14 L27 14" stroke="#d97706" strokeWidth="1" />

          {/* Golden Corner Reinforcements */}
          <rect x="5" y="14" width="2.5" height="13" fill="#ca8a04" />
          <rect x="24.5" y="14" width="2.5" height="13" fill="#ca8a04" />
          <circle cx="6.25" cy="16" r="0.6" fill="#1c1917" />
          <circle cx="6.25" cy="25" r="0.6" fill="#1c1917" />
          <circle cx="25.75" cy="16" r="0.6" fill="#1c1917" />
          <circle cx="25.75" cy="25" r="0.6" fill="#1c1917" />

          {/* Heavy Iron Bands */}
          <rect x="9" y="9" width="3" height="18" fill="#1f2937" />
          <rect x="20" y="9" width="3" height="18" fill="#1f2937" />
          {/* Metal rivets */}
          <circle cx="10.5" cy="11" r="0.6" fill="#9ca3af" />
          <circle cx="10.5" cy="16" r="0.6" fill="#9ca3af" />
          <circle cx="10.5" cy="21" r="0.6" fill="#9ca3af" />
          <circle cx="21.5" cy="11" r="0.6" fill="#9ca3af" />
          <circle cx="21.5" cy="16" r="0.6" fill="#9ca3af" />
          <circle cx="21.5" cy="21" r="0.6" fill="#9ca3af" />

          {/* Ornate Gold Padlock & Escutcheon */}
          <rect x="14" y="14" width="4" height="6" rx="0.8" fill="#facc15" stroke="#854d0e" strokeWidth="0.8" />
          {/* Keyhole */}
          <circle cx="16" cy="16.5" r="0.9" fill="#451a03" />
          <rect x="15.5" y="16.5" width="1" height="2" fill="#451a03" />

          {/* Subtle Glimmer Star */}
          <circle cx="23" cy="8" r="1.5" fill="#fef08a" opacity="0.85" />
        </g>
      )}
    </svg>
  );
};

// 2. WEAPONS RACK SPRITE (Armero de Armas)
// Strictly self-contained wooden weapon stand with mounted swords and shield
export const WeaponsRackSprite: React.FC<{ searched?: boolean }> = ({ searched = false }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      className="w-full h-full select-none"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Ground Shadow */}
      <ellipse cx="16" cy="28" rx="12" ry="3" fill="#000000" opacity="0.6" />

      {/* Heavy Wooden Base Footer */}
      <rect x="4" y="24" width="24" height="4" rx="1" fill="#451a03" stroke="#1c1917" strokeWidth="0.8" />
      <rect x="5" y="24" width="22" height="1" fill="#78350f" />

      {/* Vertical Oak Frame Posts */}
      <rect x="6" y="6" width="3" height="19" fill="#78350f" stroke="#291104" strokeWidth="0.8" />
      <rect x="23" y="6" width="3" height="19" fill="#78350f" stroke="#291104" strokeWidth="0.8" />
      {/* Post Caps */}
      <rect x="5" y="5" width="5" height="2" rx="0.5" fill="#92400e" />
      <rect x="22" y="5" width="5" height="2" rx="0.5" fill="#92400e" />

      {/* Horizontal Crossbars with weapon notches */}
      <rect x="8" y="9" width="16" height="2.5" fill="#573010" stroke="#1c1917" strokeWidth="0.6" />
      <rect x="8" y="19" width="16" height="2.5" fill="#573010" stroke="#1c1917" strokeWidth="0.6" />

      {searched ? (
        // SEARCHED / LOOTED ARMERO: Empty pegs and broken blade remnants
        <g>
          {/* Empty weapon resting notches */}
          <circle cx="11" cy="9" r="1" fill="#1c1917" />
          <circle cx="16" cy="9" r="1" fill="#1c1917" />
          <circle cx="21" cy="9" r="1" fill="#1c1917" />
          {/* Empty iron mounting ring */}
          <circle cx="16" cy="14" r="2" stroke="#71717a" strokeWidth="0.8" fill="none" />
          {/* Label text */}
          <rect x="9" y="13" width="14" height="5" rx="1" fill="#18181b" opacity="0.85" />
          <text
            x="16"
            y="17"
            textAnchor="middle"
            fill="#a1a1aa"
            fontSize="3.8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            VACÍO
          </text>
        </g>
      ) : (
        // FULL ARMERO: Polished Steel Broadsword, Halberd, and Iron Crest Shield
        <g>
          {/* Left Weapon: Upright Broadsword */}
          {/* Blade */}
          <rect x="10.5" y="4" width="2" height="15" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.4" />
          <path d="M10.5 4 L11.5 2 L12.5 4 Z" fill="#f8fafc" />
          <line x1="11.5" y1="4" x2="11.5" y2="17" stroke="#94a3b8" strokeWidth="0.5" />
          {/* Guard */}
          <rect x="8.5" y="16" width="6" height="1.5" rx="0.4" fill="#d97706" />
          {/* Grip & Pommel */}
          <rect x="11" y="17.5" width="1" height="3" fill="#78350f" />
          <circle cx="11.5" cy="21" r="1" fill="#d97706" />

          {/* Right Weapon: Halberd / Battleaxe */}
          {/* Shaft */}
          <rect x="20" y="3" width="1.5" height="21" fill="#92400e" stroke="#451a03" strokeWidth="0.4" />
          {/* Axe head */}
          <path d="M17.5 4 C16 7 16 10 17.5 12 L20.5 10 L20.5 6 Z" fill="#94a3b8" stroke="#475569" strokeWidth="0.5" />
          <path d="M17 5 C15.5 7.5 15.5 9.5 17 11" stroke="#e2e8f0" strokeWidth="0.6" fill="none" />
          {/* Top spear tip */}
          <path d="M20 3 L20.75 1 L21.5 3 Z" fill="#cbd5e1" />

          {/* Center: Heroic Knight Shield mounted on crossbar */}
          <path
            d="M13 11 Q16 11 19 11 L19 16 Q16 20 16 20 Q13 16 13 16 Z"
            fill="#1e293b"
            stroke="#b45309"
            strokeWidth="0.8"
          />
          {/* Shield Emblem: Golden Cross & Center Boss */}
          <line x1="16" y1="11" x2="16" y2="19" stroke="#f59e0b" strokeWidth="0.8" />
          <line x1="13.5" y1="14" x2="18.5" y2="14" stroke="#f59e0b" strokeWidth="0.8" />
          <circle cx="16" cy="14" r="1.2" fill="#facc15" stroke="#78350f" strokeWidth="0.4" />
        </g>
      )}
    </svg>
  );
};

// 3. TABLE SPRITE (Mesa de Alquimista / Guardia)
export const TableSprite: React.FC<{ searched?: boolean; w?: number }> = ({ searched = false, w = 1 }) => {
  const isMulti = w > 1;
  const viewBox = isMulti ? '0 0 64 32' : '0 0 32 32';

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-full select-none"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Ground Shadow */}
      <ellipse cx={isMulti ? 32 : 16} cy="27" rx={isMulti ? 28 : 13} ry="3.5" fill="#000000" opacity="0.6" />

      {/* Legs */}
      <rect x="4" y="16" width="3" height="11" fill="#451a03" stroke="#1c1917" strokeWidth="0.8" />
      <rect x="8" y="16" width="2.5" height="10" fill="#291104" />
      {isMulti ? (
        <>
          <rect x="57" y="16" width="3" height="11" fill="#451a03" stroke="#1c1917" strokeWidth="0.8" />
          <rect x="53.5" y="16" width="2.5" height="10" fill="#291104" />
          {/* Center stretcher bar */}
          <rect x="7" y="21" width="50" height="2" fill="#291104" />
        </>
      ) : (
        <>
          <rect x="25" y="16" width="3" height="11" fill="#451a03" stroke="#1c1917" strokeWidth="0.8" />
          <rect x="21.5" y="16" width="2.5" height="10" fill="#291104" />
        </>
      )}

      {/* Heavy Oak Tabletop */}
      <rect
        x="2"
        y="12"
        width={isMulti ? 60 : 28}
        height="5"
        rx="1"
        fill="#78350f"
        stroke="#291104"
        strokeWidth="1"
      />
      {/* Top plank bevel */}
      <rect x="3" y="12" width={isMulti ? 58 : 26} height="1.5" fill="#92400e" />
      {/* Wood plank horizontal lines */}
      <line x1="2" y1="15" x2={isMulti ? 62 : 30} y2="15" stroke="#451a03" strokeWidth="0.8" />

      {/* Tabletop Items */}
      {searched ? (
        // Open parchment, spent candle, emptied beaker
        <g>
          {/* Crumpled parchment */}
          <rect x={isMulti ? 26 : 10} y="8" width="12" height="4" rx="0.5" fill="#e2d6b5" stroke="#78716c" strokeWidth="0.5" />
          <line x1={isMulti ? 28 : 12} y1="9.5" x2={isMulti ? 36 : 20} y2="9.5" stroke="#78350f" strokeWidth="0.6" />
          {/* Blown out candle stub */}
          <rect x={isMulti ? 44 : 22} y="10" width="2" height="2" fill="#d6d3d1" />
          <line x1={isMulti ? 45 : 23} y1="9" x2={isMulti ? 45 : 23} y2="10" stroke="#44403c" strokeWidth="0.6" />
        </g>
      ) : (
        // Intact potion vial, dungeon map, lit candle
        <g>
          {/* Parchment Map */}
          <rect x={isMulti ? 12 : 6} y="8" width="14" height="4.5" rx="0.5" fill="#fef08a" stroke="#a16207" strokeWidth="0.5" />
          <line x1={isMulti ? 14 : 8} y1="9.5" x2={isMulti ? 24 : 18} y2="9.5" stroke="#b45309" strokeWidth="0.6" />
          <line x1={isMulti ? 14 : 8} y1="11" x2={isMulti ? 22 : 16} y2="11" stroke="#b45309" strokeWidth="0.6" />

          {/* Lit Candle */}
          <rect x={isMulti ? 48 : 23} y="7" width="2" height="5" fill="#f5f5f4" stroke="#a8a29e" strokeWidth="0.4" />
          {/* Flame */}
          <ellipse cx={isMulti ? 49 : 24} cy="5" rx="1.2" ry="2" fill="#f59e0b" />
          <ellipse cx={isMulti ? 49 : 24} cy="5.2" rx="0.6" ry="1" fill="#fef08a" />

          {/* Glowing Alchemy Flask */}
          {isMulti && (
            <g>
              <ellipse cx="34" cy="11" rx="3" ry="2.5" fill="#ef4444" stroke="#991b1b" strokeWidth="0.6" />
              <rect x="33" y="6" width="2" height="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.5" />
              <circle cx="34" cy="11" r="0.8" fill="#fca5a5" />
            </g>
          )}
        </g>
      )}
    </svg>
  );
};

// 4. TOMB / SARCOPHAGUS SPRITE (Sarcófago de Piedra)
export const TombSprite: React.FC<{ searched?: boolean; h?: number }> = ({ searched = false, h = 1 }) => {
  const isMulti = h > 1;
  const viewBox = isMulti ? '0 0 32 64' : '0 0 32 32';

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-full select-none"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Shadow */}
      <rect x="3" y="4" width="26" height={isMulti ? 56 : 24} rx="2" fill="#000000" opacity="0.6" />

      {/* Main Stone Base */}
      <rect
        x="4"
        y="4"
        width="24"
        height={isMulti ? 54 : 22}
        rx="2"
        fill="#334155"
        stroke="#1e293b"
        strokeWidth="1.2"
      />
      <rect
        x="5.5"
        y="5.5"
        width="21"
        height={isMulti ? 51 : 19}
        rx="1"
        fill="#475569"
      />

      {searched ? (
        // SLID OPEN LID (Empty/Pillaged tomb)
        <g>
          {/* Dark open cavity */}
          <rect x="7" y="8" width="18" height={isMulti ? 46 : 14} rx="1" fill="#0f172a" />
          {/* Skeleton skull inside */}
          <circle cx="16" cy={isMulti ? 14 : 12} r="2.5" fill="#cbd5e1" />
          <circle cx="15" cy={isMulti ? 13.5 : 11.5} r="0.5" fill="#09090b" />
          <circle cx="17" cy={isMulti ? 13.5 : 11.5} r="0.5" fill="#09090b" />
          {/* Shifted stone lid on top-right */}
          <path
            d={`M9 6 L27 6 L29 ${isMulti ? 52 : 20} L11 ${isMulti ? 52 : 20} Z`}
            fill="#64748b"
            stroke="#1e293b"
            strokeWidth="0.8"
            opacity="0.85"
          />
        </g>
      ) : (
        // INTACT CARVED SARCOPHAGUS LID
        <g>
          {/* Inner Lid Panel */}
          <rect
            x="7"
            y="7"
            width="18"
            height={isMulti ? 48 : 16}
            rx="1"
            fill="#64748b"
            stroke="#334155"
            strokeWidth="0.8"
          />
          {/* Gothic Cross Relief Carving */}
          <line
            x1="16"
            y1={isMulti ? 12 : 9}
            x2="16"
            y2={isMulti ? 50 : 21}
            stroke="#1e293b"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="11"
            y1={isMulti ? 20 : 13}
            x2="21"
            y2={isMulti ? 20 : 13}
            stroke="#1e293b"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Highlight ridge */}
          <line
            x1="16"
            y1={isMulti ? 12 : 9}
            x2="16"
            y2={isMulti ? 50 : 21}
            stroke="#94a3b8"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          {/* Stone corner rosettes */}
          <circle cx="8.5" cy="8.5" r="1" fill="#94a3b8" />
          <circle cx="23.5" cy="8.5" r="1" fill="#94a3b8" />
          <circle cx="8.5" cy={isMulti ? 53.5 : 21.5} r="1" fill="#94a3b8" />
          <circle cx="23.5" cy={isMulti ? 53.5 : 21.5} r="1" fill="#94a3b8" />
        </g>
      )}
    </svg>
  );
};

// 5. THRONE SPRITE (Trono de Morcar)
export const ThroneSprite: React.FC<{ searched?: boolean }> = () => {
  return (
    <svg
      viewBox="0 0 32 32"
      className="w-full h-full select-none"
      style={{ imageRendering: 'pixelated' }}
    >
      <ellipse cx="16" cy="27" rx="12" ry="3" fill="#000000" opacity="0.65" />

      {/* Stone High Backrest */}
      <path
        d="M6 26 L6 7 L10 3 L16 6 L22 3 L26 7 L26 26 Z"
        fill="#1c1917"
        stroke="#44403c"
        strokeWidth="1"
      />
      {/* Stone Gargoyle Horns Crest */}
      <path d="M10 3 L16 7 L22 3" stroke="#a8a29e" strokeWidth="1" fill="none" />

      {/* Royal Red Velvet Padding */}
      <path
        d="M9 10 L23 10 L23 20 L9 20 Z"
        fill="#991b1b"
        stroke="#7f1d1d"
        strokeWidth="0.8"
      />
      {/* Gold Tufting Studs */}
      <circle cx="12" cy="13" r="0.6" fill="#facc15" />
      <circle cx="16" cy="13" r="0.6" fill="#facc15" />
      <circle cx="20" cy="13" r="0.6" fill="#facc15" />
      <circle cx="14" cy="17" r="0.6" fill="#facc15" />
      <circle cx="18" cy="17" r="0.6" fill="#facc15" />

      {/* Velvet Seat Cushion */}
      <rect x="7" y="20" width="18" height="5" rx="1" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="0.8" />
      {/* Carved Stone Armrests */}
      <rect x="5" y="15" width="3" height="10" rx="0.5" fill="#292524" stroke="#44403c" strokeWidth="0.8" />
      <rect x="24" y="15" width="3" height="10" rx="0.5" fill="#292524" stroke="#44403c" strokeWidth="0.8" />
      {/* Armrest Golden Lion/Skull finials */}
      <circle cx="6.5" cy="15" r="1.2" fill="#ca8a04" />
      <circle cx="25.5" cy="15" r="1.2" fill="#ca8a04" />

      {/* Throne Base Dais */}
      <rect x="5" y="25" width="22" height="3" fill="#0c0a09" />
    </svg>
  );
};

// 6. BOOKSHELF SPRITE (Librería Arcana)
export const BookshelfSprite: React.FC<{ searched?: boolean }> = ({ searched = false }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      className="w-full h-full select-none"
      style={{ imageRendering: 'pixelated' }}
    >
      <ellipse cx="16" cy="28" rx="12" ry="3" fill="#000000" opacity="0.6" />

      {/* Oak Bookcase Outer Shell */}
      <rect x="5" y="4" width="22" height="23" rx="1" fill="#451a03" stroke="#1c1917" strokeWidth="1" />
      {/* Dark back panel */}
      <rect x="7" y="6" width="18" height="19" fill="#1c1917" />

      {/* Top Header Cornice */}
      <rect x="4" y="3" width="24" height="2" rx="0.5" fill="#78350f" />

      {/* Shelf Divider 1 */}
      <rect x="6" y="12" width="20" height="2" fill="#78350f" />
      {/* Shelf Divider 2 */}
      <rect x="6" y="19" width="20" height="2" fill="#78350f" />

      {/* Books on Top Shelf */}
      <rect x="8" y="7" width="2.5" height="5" fill="#dc2626" />
      <rect x="11" y="8" width="2" height="4" fill="#2563eb" />
      <rect x="13.5" y="7" width="3" height="5" fill="#ca8a04" />
      <rect x="17" y="8.5" width="2.5" height="3.5" fill="#16a34a" />
      {/* Tilted book */}
      <path d="M20.5 8.5 L23.5 7 L24.5 12 L21.5 12 Z" fill="#9333ea" />

      {/* Books on Middle Shelf */}
      <rect x="8" y="14" width="3" height="5" fill="#b45309" />
      <rect x="11.5" y="14.5" width="2.5" height="4.5" fill="#0284c7" />
      <rect x="14.5" y="14" width="2" height="5" fill="#dc2626" />
      {/* Arcane scroll on middle shelf */}
      <rect x="17.5" y="16.5" width="6" height="2.5" rx="0.8" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.4" />

      {/* Bottom Shelf */}
      {searched ? (
        // Empty disordered lower shelf
        <g>
          <rect x="8" y="22" width="2.5" height="3" fill="#52525b" />
          <rect x="11" y="24" width="4" height="1" fill="#71717a" />
        </g>
      ) : (
        // Heavy grimoires on bottom shelf
        <g>
          <rect x="8" y="21" width="3.5" height="4" fill="#1e293b" />
          <rect x="12" y="21" width="3" height="4" fill="#7f1d1d" />
          <rect x="15.5" y="21" width="3" height="4" fill="#065f46" />
          <rect x="19" y="21.5" width="4.5" height="3.5" fill="#312e81" />
        </g>
      )}
    </svg>
  );
};

// 7. TRAP SPRITES
export const PitTrapSprite: React.FC<{ sprung?: boolean }> = ({ sprung = false }) => (
  <svg viewBox="0 0 32 32" className="w-full h-full select-none" style={{ imageRendering: 'pixelated' }}>
    <rect x="2" y="2" width="28" height="28" rx="2" fill="#09090b" stroke={sprung ? '#ef4444' : '#eab308'} strokeWidth="1.5" />
    {/* Broken flagstone edges */}
    <path d="M2 8 L6 10 L10 6 L14 11 L18 7 L22 11 L26 8 L30 11 L30 2 L2 2 Z" fill="#27272a" />
    <path d="M2 24 L7 22 L11 26 L16 21 L20 25 L25 21 L30 24 L30 30 L2 30 Z" fill="#27272a" />
    {/* Spikes rising from pit */}
    <path d="M8 25 L9 13 L10 25 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="0.4" />
    <path d="M13 26 L14 10 L15 26 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="0.4" />
    <path d="M18 25 L19 12 L20 25 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="0.4" />
    <path d="M23 26 L24 14 L25 26 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="0.4" />
  </svg>
);

export const SpearTrapSprite: React.FC<{ sprung?: boolean }> = ({ sprung = false }) => (
  <svg viewBox="0 0 32 32" className="w-full h-full select-none" style={{ imageRendering: 'pixelated' }}>
    <rect x="2" y="2" width="28" height="28" rx="2" fill="#18181b" stroke={sprung ? '#ef4444' : '#eab308'} strokeWidth="1.5" />
    {/* 4 Spear Ejection Holes */}
    <circle cx="9" cy="9" r="2.5" fill="#09090b" />
    <circle cx="23" cy="9" r="2.5" fill="#09090b" />
    <circle cx="9" cy="23" r="2.5" fill="#09090b" />
    <circle cx="23" cy="23" r="2.5" fill="#09090b" />
    {/* Protruding Spearheads */}
    <path d="M9 13 L6 5 L12 5 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.4" />
    <path d="M23 13 L20 5 L26 5 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.4" />
    <path d="M9 27 L6 19 L12 19 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.4" />
    <path d="M23 27 L20 19 L26 19 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.4" />
  </svg>
);

export const RockTrapSprite: React.FC<{ sprung?: boolean }> = ({ sprung = false }) => (
  <svg viewBox="0 0 32 32" className="w-full h-full select-none" style={{ imageRendering: 'pixelated' }}>
    <rect x="2" y="2" width="28" height="28" rx="2" fill="#1c1917" stroke={sprung ? '#ef4444' : '#f59e0b'} strokeWidth="1.5" />
    {/* Fallen Boulders */}
    <circle cx="14" cy="18" r="6" fill="#57534e" stroke="#292524" strokeWidth="0.8" />
    <circle cx="21" cy="14" r="5" fill="#78716c" stroke="#292524" strokeWidth="0.8" />
    <circle cx="10" cy="12" r="4" fill="#44403c" stroke="#1c1917" strokeWidth="0.8" />
    {/* Cracks */}
    <line x1="12" y1="16" x2="16" y2="20" stroke="#1c1917" strokeWidth="0.8" />
    <line x1="20" y1="12" x2="22" y2="16" stroke="#292524" strokeWidth="0.8" />
  </svg>
);

// 8. EXIT STAIRCASE SPRITE (Escaleras de Salida de la Mazmorra)
export const ExitStaircaseSprite: React.FC<{ isOpen?: boolean }> = ({ isOpen = false }) => (
  <svg viewBox="0 0 32 32" className="w-full h-full select-none" style={{ imageRendering: 'pixelated' }}>
    {/* Stone pit well */}
    <rect x="2" y="2" width="28" height="28" rx="2" fill="#09090b" stroke={isOpen ? '#facc15' : '#71717a'} strokeWidth="1.5" />

    {/* Descending Stone Steps */}
    {/* Step 1 */}
    <rect x="4" y="4" width="24" height="4" fill={isOpen ? '#d97706' : '#52525b'} stroke="#27272a" strokeWidth="0.6" />
    {/* Step 2 */}
    <rect x="6" y="8" width="20" height="4" fill={isOpen ? '#b45309' : '#3f3f46'} stroke="#27272a" strokeWidth="0.6" />
    {/* Step 3 */}
    <rect x="8" y="12" width="16" height="4" fill={isOpen ? '#92400e' : '#27272a'} stroke="#18181b" strokeWidth="0.6" />
    {/* Step 4 */}
    <rect x="10" y="16" width="12" height="4" fill={isOpen ? '#78350f' : '#18181b'} />
    {/* Deep abyss portal */}
    <rect x="12" y="20" width="8" height="8" fill="#030202" />

    {isOpen ? (
      // OPEN: Radiating golden light and open gate
      <g>
        <circle cx="16" cy="24" r="5" fill="#facc15" opacity="0.4" />
        {/* Open Gate swung back */}
        <line x1="4" y1="4" x2="10" y2="10" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="28" y1="4" x2="22" y2="10" stroke="#f59e0b" strokeWidth="1.5" />
        {/* Exit arrow */}
        <path d="M16 19 L13 23 L15 23 L15 27 L17 27 L17 23 L19 23 Z" fill="#fef08a" />
      </g>
    ) : (
      // SEALED: Heavy Iron Grate & Chain
      <g>
        {/* Iron Grate Bars */}
        <line x1="4" y1="10" x2="28" y2="10" stroke="#71717a" strokeWidth="1.5" />
        <line x1="4" y1="18" x2="28" y2="18" stroke="#71717a" strokeWidth="1.5" />
        <line x1="10" y1="4" x2="10" y2="26" stroke="#71717a" strokeWidth="1.5" />
        <line x1="16" y1="4" x2="16" y2="26" stroke="#71717a" strokeWidth="1.5" />
        <line x1="22" y1="4" x2="22" y2="26" stroke="#71717a" strokeWidth="1.5" />
        {/* Heavy Chain & Red Padlock */}
        <rect x="14" y="13" width="4" height="5" rx="0.8" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.8" />
        <circle cx="16" cy="15" r="0.6" fill="#fca5a5" />
      </g>
    )}
  </svg>
);
