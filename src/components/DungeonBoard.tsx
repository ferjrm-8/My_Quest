import React from 'react';
import { Door, Furniture, Hero, Monster, Quest, Trap } from '../types/heroquest';
import { HeroTokenView, MonsterTokenView } from './PixelTokens';

interface DungeonBoardProps {
  quest: Quest;
  heroes: Hero[];
  activeHero: Hero;
  monsters: Monster[];
  validMoves: { x: number; y: number }[];
  targetableMonsters: string[]; // Monster IDs
  adjacentDoors: Door[];
  adjacentFurniture: Furniture[];
  onTileClick: (x: number, y: number) => void;
  onMonsterClick: (monster: Monster) => void;
  onDoorClick: (door: Door) => void;
  onFurnitureClick: (furniture: Furniture) => void;
  isMoving: boolean;
}

export const DungeonBoard: React.FC<DungeonBoardProps> = ({
  quest,
  heroes,
  activeHero,
  monsters,
  validMoves,
  targetableMonsters,
  adjacentDoors,
  adjacentFurniture,
  onTileClick,
  onMonsterClick,
  onDoorClick,
  onFurnitureClick,
  isMoving,
}) => {
  const { mapWidth, mapHeight, rooms, doors, traps, furniture, exitPosition } = quest;

  // Helper to determine which room a coordinate belongs to
  const getRoomAt = (x: number, y: number) => {
    return rooms.find((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
  };

  // Check if tile is visible (fog of war)
  const isTileVisible = (x: number, y: number) => {
    const room = getRoomAt(x, y);
    if (!room) {
      // Corridors visible if within 4.5 tiles of any living hero
      return heroes.some((h) => !h.isDead && Math.hypot(h.x - x, h.y - y) <= 4.5);
    }
    return room.revealed;
  };

  const isMoveValid = (x: number, y: number) => {
    return validMoves.some((m) => m.x === x && m.y === y);
  };

  // Render rows and columns
  const gridCells = [];
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const room = getRoomAt(x, y);
      const visible = isTileVisible(x, y);
      const isMoveTarget = isMoveValid(x, y);
      const isExit = exitPosition.x === x && exitPosition.y === y;

      const heroAtTile = heroes.find((h) => !h.isDead && h.x === x && h.y === y);
      const monsterAtTile = monsters.find((m) => !m.isDead && m.revealed && m.x === x && m.y === y);
      const furnAtTile = furniture.find((f) => x >= f.x && x < f.x + f.w && y >= f.y && y < f.y + f.h);
      const trapAtTile = traps.find((t) => t.x === x && t.y === y && (t.detected || t.sprung));
      const doorAtTile = doors.find((d) => d.x === x && d.y === y);

      const isTargetableMonster = monsterAtTile && targetableMonsters.includes(monsterAtTile.id);
      const isInteractiveDoor = doorAtTile && !doorAtTile.isOpen && adjacentDoors.some((d) => d.id === doorAtTile.id);
      const isInteractiveFurniture = furnAtTile && !furnAtTile.searched && adjacentFurniture.some((f) => f.id === furnAtTile.id);

      // Determine room perimeter wall borders
      const isTopWall = room && y === room.y;
      const isBottomWall = room && y === room.y + room.h - 1;
      const isLeftWall = room && x === room.x;
      const isRightWall = room && x === room.x + room.w - 1;

      // If there's an open door on this wall, don't draw solid border
      const hasDoorHere = doorAtTile !== undefined;

      const wallClasses = [
        isTopWall && !hasDoorHere ? 'border-t-4 border-t-[#52525b]' : '',
        isBottomWall && !hasDoorHere ? 'border-b-4 border-b-[#27272a]' : '',
        isLeftWall && !hasDoorHere ? 'border-l-4 border-l-[#52525b]' : '',
        isRightWall && !hasDoorHere ? 'border-r-4 border-r-[#27272a]' : '',
      ].filter(Boolean).join(' ');

      gridCells.push(
        <div
          key={`${x}-${y}`}
          onClick={() => {
            if (isInteractiveDoor && doorAtTile) {
              onDoorClick(doorAtTile);
            } else if (isInteractiveFurniture && furnAtTile) {
              onFurnitureClick(furnAtTile);
            } else if (monsterAtTile && isTargetableMonster) {
              onMonsterClick(monsterAtTile);
            } else if (isMoveTarget) {
              onTileClick(x, y);
            }
          }}
          className={`relative w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 border border-stone-800/80 transition-colors select-none flex items-center justify-center ${wallClasses} ${
            !visible
              ? 'bg-[#080706] cursor-default'
              : room
              ? 'bg-[#211d19] hover:bg-[#2b2621]'
              : 'bg-[#141210] hover:bg-[#1a1714]'
          } ${isMoveTarget ? 'ring-2 ring-emerald-400 bg-emerald-950/60 cursor-pointer animate-pulse z-20' : ''} ${
            isTargetableMonster ? 'ring-3 ring-red-500 bg-red-950/50 cursor-pointer animate-pulse z-20' : ''
          } ${isInteractiveDoor ? 'ring-2 ring-amber-400 cursor-pointer z-20' : ''} ${
            isInteractiveFurniture ? 'ring-2 ring-yellow-400 cursor-pointer z-20' : ''
          }`}
          style={{
            backgroundImage: visible
              ? room
                ? 'radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.04) 0%, transparent 80%)'
                : 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.02) 0%, transparent 80%)'
              : undefined,
          }}
          title={
            !visible
              ? 'Zona en penumbras'
              : monsterAtTile
              ? `${monsterAtTile.name} (${monsterAtTile.bodyPoints}/${monsterAtTile.maxBodyPoints} PV)${
                  monsterAtTile.isBoss ? ' ★ JEFE ★' : ''
                }`
              : heroAtTile
              ? `${heroAtTile.name} (${heroAtTile.bodyPoints}/${heroAtTile.maxBodyPoints} PV)`
              : isExit
              ? 'Escalera de Entrada / Salida'
              : furnAtTile
              ? `${furnAtTile.name} ${furnAtTile.searched ? '(Registrado)' : ''}`
              : `Casilla (${x}, ${y})`
          }
        >
          {/* Subtle Stone Masonry Texture */}
          {visible && (
            <div className="absolute inset-0 pointer-events-none opacity-25">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-stone-500" />
              <div className="absolute top-0 left-0 w-[1px] h-full bg-stone-500" />
            </div>
          )}

          {/* Fog of war shroud */}
          {!visible && (
            <div className="absolute inset-0 bg-[#060504] flex items-center justify-center opacity-95">
              <span className="text-[8px] text-stone-800 font-pixel">·</span>
            </div>
          )}

          {/* Stairs (Entrance / Exit) */}
          {visible && isExit && (
            <div className="absolute inset-1 rounded bg-amber-950/80 border-2 border-amber-500 flex flex-col items-center justify-center z-10 shadow-lg">
              <span className="text-sm sm:text-base leading-none">🪜</span>
              <span className="text-[7px] font-pixel text-amber-300 font-bold">SALIDA</span>
            </div>
          )}

          {/* Traps */}
          {visible && trapAtTile && (
            <div
              className={`absolute inset-1 rounded flex items-center justify-center z-10 shadow ${
                trapAtTile.sprung ? 'bg-red-950 border border-red-600' : 'bg-yellow-950 border border-yellow-500'
              }`}
            >
              <span className="text-xs">{trapAtTile.type === 'pit' ? '🕳️' : '⚠️'}</span>
            </div>
          )}

          {/* Furniture */}
          {visible && furnAtTile && (
            <div
              className={`absolute inset-1 rounded flex flex-col items-center justify-center z-10 transition ${
                furnAtTile.searched
                  ? 'opacity-40 bg-stone-900 border border-stone-700'
                  : 'bg-gradient-to-b from-amber-950/80 to-stone-900 border-2 border-amber-600 shadow-md'
              }`}
            >
              <span className="text-sm sm:text-base leading-none">
                {furnAtTile.type === 'chest'
                  ? '📦'
                  : furnAtTile.type === 'weapons_rack'
                  ? '🛡️'
                  : furnAtTile.type === 'tomb'
                  ? '⚰️'
                  : furnAtTile.type === 'throne'
                  ? '👑'
                  : '🪵'}
              </span>
            </div>
          )}

          {/* Doors */}
          {visible && doorAtTile && (
            <div
              className={`absolute inset-0.5 rounded flex items-center justify-center z-20 transition shadow-md ${
                doorAtTile.isOpen
                  ? 'bg-stone-900/60 border-2 border-dashed border-amber-700 text-stone-400'
                  : 'bg-gradient-to-b from-amber-800 to-amber-950 border-2 border-amber-400 text-amber-200'
              }`}
            >
              <span className="text-xs sm:text-sm">{doorAtTile.isOpen ? '🚪' : '🔒'}</span>
            </div>
          )}

          {/* Detailed Monster Token */}
          {visible && monsterAtTile && (
            <div
              className={`relative z-30 flex flex-col items-center justify-center transition-all ${
                monsterAtTile.isBoss
                  ? 'ring-4 ring-red-600 shadow-[0_0_16px_rgba(239,68,68,0.9)] scale-110'
                  : isTargetableMonster
                  ? 'ring-2 ring-red-400 animate-bounce'
                  : ''
              }`}
            >
              <MonsterTokenView
                type={monsterAtTile.type}
                size={monsterAtTile.isBoss ? 42 : 34}
                isBoss={monsterAtTile.isBoss}
              />

              {/* Monster HP Bar */}
              <div
                className={`absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-8 sm:w-10 h-1.5 rounded-full overflow-hidden border ${
                  monsterAtTile.isBoss ? 'bg-red-950 border-yellow-400' : 'bg-stone-950 border-stone-800'
                }`}
              >
                <div
                  className={`h-full transition-all ${
                    monsterAtTile.isBoss ? 'bg-gradient-to-r from-red-600 to-yellow-400' : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.max(0, (monsterAtTile.bodyPoints / monsterAtTile.maxBodyPoints) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Detailed Hero Token */}
          {visible && heroAtTile && (
            <div
              className={`relative z-30 flex flex-col items-center justify-center transition-all ${
                heroAtTile.id === activeHero.id
                  ? 'ring-3 ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] scale-105'
                  : 'opacity-95'
              }`}
            >
              <HeroTokenView
                heroClass={heroAtTile.heroClass}
                size={34}
                isActive={heroAtTile.id === activeHero.id}
              />

              {/* Hero HP Mini Bar */}
              <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-8 sm:w-10 h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-900">
                <div
                  className="h-full bg-emerald-400 transition-all"
                  style={{
                    width: `${Math.max(0, (heroAtTile.bodyPoints / heroAtTile.maxBodyPoints) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      );
    }
  }

  return (
    <div className="relative w-full overflow-auto bg-stone-950 border-4 border-amber-800 rounded-lg p-2 sm:p-4 shadow-2xl flex flex-col items-center">
      {/* Board Map Container */}
      <div
        className="grid gap-0 bg-[#0a0908] border-3 border-stone-700 rounded-lg shadow-2xl p-1"
        style={{
          gridTemplateColumns: `repeat(${mapWidth}, minmax(0, 1fr))`,
        }}
      >
        {gridCells}
      </div>

      {/* Legend & Instructions footer */}
      <div className="mt-3 w-full flex flex-wrap items-center justify-between text-xs text-stone-300 font-pixel gap-2 px-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow" /> Héroe Activo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow" /> Casilla Válida
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 shadow" /> Monstruo
          </span>
          <span className="flex items-center gap-1.5 text-yellow-400 font-bold">
            ★ JEFE ★ (Gárgola)
          </span>
          <span className="flex items-center gap-1">🔒 Puerta (Obligatoria)</span>
        </div>
        <div className="text-amber-200/90 font-medieval italic">
          {isMoving ? '🎲 Haz clic en una casilla verde o usa flechas de dirección' : '⚔️ Selecciona una acción en el panel inferior'}
        </div>
      </div>
    </div>
  );
};
