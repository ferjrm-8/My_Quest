import React from 'react';
import { Door, Furniture, Hero, Monster, Quest, Trap } from '../types/heroquest';
import { HeroPortrait } from './PixelIcons';

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

  // Check if tile is in a revealed room or in a corridor
  const isTileVisible = (x: number, y: number) => {
    const room = getRoomAt(x, y);
    if (!room) {
      // In corridor: corridors are visible if any hero has explored nearby (within 3 tiles distance from any living hero)
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

      // Find hero at this tile
      const heroAtTile = heroes.find((h) => !h.isDead && h.x === x && h.y === y);

      // Find monster at this tile
      const monsterAtTile = monsters.find((m) => !m.isDead && m.revealed && m.x === x && m.y === y);

      // Find furniture at this tile
      const furnAtTile = furniture.find(
        (f) => x >= f.x && x < f.x + f.w && y >= f.y && y < f.y + f.h
      );

      // Find trap at this tile
      const trapAtTile = traps.find((t) => t.x === x && t.y === y && (t.detected || t.sprung));

      // Find door at this tile
      const doorAtTile = doors.find((d) => d.x === x && d.y === y);

      const isTargetableMonster = monsterAtTile && targetableMonsters.includes(monsterAtTile.id);
      const isInteractiveDoor = doorAtTile && !doorAtTile.isOpen && adjacentDoors.some((d) => d.id === doorAtTile.id);
      const isInteractiveFurniture = furnAtTile && !furnAtTile.searched && adjacentFurniture.some((f) => f.id === furnAtTile.id);

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
          className={`relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 border border-stone-800/80 transition-colors select-none flex items-center justify-center ${
            !visible
              ? 'bg-stone-950/95 cursor-default'
              : room
              ? 'bg-[#1e1b18] hover:bg-[#292524]'
              : 'bg-[#151311] hover:bg-[#1c1917]'
          } ${isMoveTarget ? 'ring-2 ring-emerald-400 bg-emerald-950/50 cursor-pointer animate-pulse' : ''} ${
            isTargetableMonster ? 'ring-2 ring-red-500 bg-red-950/40 cursor-pointer animate-pulse' : ''
          } ${isInteractiveDoor ? 'ring-2 ring-amber-400 cursor-pointer' : ''} ${
            isInteractiveFurniture ? 'ring-2 ring-yellow-400 cursor-pointer' : ''
          }`}
          style={{
            backgroundImage: visible
              ? 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 80%)'
              : undefined,
          }}
          title={
            !visible
              ? 'Zona en penumbras'
              : heroAtTile
              ? `${heroAtTile.name} (${heroAtTile.bodyPoints} PV)`
              : monsterAtTile
              ? `${monsterAtTile.name} (${monsterAtTile.bodyPoints} PV)`
              : isExit
              ? 'Escalera de Entrada / Salida'
              : furnAtTile
              ? `${furnAtTile.name} ${furnAtTile.searched ? '(Registrado)' : ''}`
              : `Casilla (${x}, ${y})`
          }
        >
          {/* Subtle Grid Flagstone texture details */}
          {visible && (
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-stone-500" />
              <div className="absolute top-0 left-0 w-[1px] h-full bg-stone-500" />
            </div>
          )}

          {/* Fog of war shroud */}
          {!visible && (
            <div className="absolute inset-0 bg-stone-950 flex items-center justify-center">
              <span className="text-[9px] text-stone-800 font-pixel">·</span>
            </div>
          )}

          {/* Stairs (Entrance / Exit) */}
          {visible && isExit && (
            <div className="absolute inset-1 rounded bg-amber-950/60 border border-amber-600/70 flex items-center justify-center z-10">
              <span className="text-sm" title="Escaleras de Piedra">
                🪜
              </span>
            </div>
          )}

          {/* Traps (revealed or sprung) */}
          {visible && trapAtTile && (
            <div
              className={`absolute inset-1 rounded flex items-center justify-center z-10 ${
                trapAtTile.sprung ? 'bg-red-950 border border-red-600' : 'bg-yellow-950 border border-yellow-500'
              }`}
              title={trapAtTile.sprung ? 'Trampa Activada' : '¡Trampa Detectada!'}
            >
              <span className="text-xs">⚠️</span>
            </div>
          )}

          {/* Furniture */}
          {visible && furnAtTile && (
            <div
              className={`absolute inset-1 rounded flex flex-col items-center justify-center z-10 transition ${
                furnAtTile.searched
                  ? 'opacity-40 bg-stone-900 border border-stone-700'
                  : 'bg-amber-950/40 border border-amber-700'
              }`}
            >
              <span className="text-xs sm:text-sm">
                {furnAtTile.type === 'chest'
                  ? '📦'
                  : furnAtTile.type === 'weapons_rack'
                  ? '🛡️'
                  : furnAtTile.type === 'tomb'
                  ? '⚰️'
                  : furnAtTile.type === 'table'
                  ? '🪵'
                  : '🪑'}
              </span>
            </div>
          )}

          {/* Door */}
          {visible && doorAtTile && (
            <div
              className={`absolute inset-0.5 rounded flex items-center justify-center z-20 transition ${
                doorAtTile.isOpen
                  ? 'bg-stone-900/60 border border-dashed border-amber-700 text-stone-500'
                  : 'bg-amber-900 border-2 border-amber-500 text-amber-200 shadow-md font-bold'
              }`}
            >
              <span className="text-[11px]">{doorAtTile.isOpen ? '🚪' : '🔒'}</span>
            </div>
          )}

          {/* Monster Token */}
          {visible && monsterAtTile && (
            <div
              className={`relative z-30 w-7 h-7 sm:w-9 sm:h-9 rounded-md flex flex-col items-center justify-center shadow-lg transition transform hover:scale-110 ${
                isTargetableMonster ? 'ring-2 ring-red-400 bg-red-950/80 animate-bounce' : 'bg-stone-900/90'
              }`}
              style={{ border: `2px solid ${monsterAtTile.color}` }}
            >
              <span className="text-sm sm:text-base leading-none">{monsterAtTile.icon}</span>

              {/* Monster HP Mini Bar */}
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-stone-950 rounded-full overflow-hidden mx-0.5 border border-stone-800">
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{
                    width: `${Math.max(0, (monsterAtTile.bodyPoints / monsterAtTile.maxBodyPoints) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Hero Token */}
          {visible && heroAtTile && (
            <div
              className={`relative z-30 w-7 h-7 sm:w-9 sm:h-9 rounded-md flex flex-col items-center justify-center shadow-lg transition transform ${
                heroAtTile.id === activeHero.id
                  ? 'ring-3 ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)] scale-105'
                  : 'opacity-90'
              }`}
              style={{
                backgroundColor: heroAtTile.color,
                border: '2px solid #fef08a',
              }}
            >
              <HeroPortrait heroClass={heroAtTile.heroClass} size={28} className="rounded" />

              {/* Mini HP bar */}
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-stone-950 rounded-full overflow-hidden mx-0.5 border border-stone-900">
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
    <div className="relative w-full overflow-auto bg-stone-950/90 border-4 border-amber-800 rounded-lg p-2 sm:p-4 shadow-2xl flex flex-col items-center">
      {/* Board Map Container */}
      <div
        className="grid gap-0 bg-[#090807] border-2 border-stone-700 rounded shadow-inner"
        style={{
          gridTemplateColumns: `repeat(${mapWidth}, minmax(0, 1fr))`,
        }}
      >
        {gridCells}
      </div>

      {/* Legend & Instructions footer */}
      <div className="mt-3 w-full flex flex-wrap items-center justify-between text-[11px] text-stone-400 font-pixel gap-2 px-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Héroe Activo
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Movimiento
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Objetivo Atacable
          </span>
          <span className="flex items-center gap-1">🔒 Puerta / Cofre</span>
        </div>
        <div className="text-stone-400 italic font-medieval">
          {isMoving ? '🎲 Haz clic en una casilla verde para moverte' : '⚔️ Selecciona una acción en el panel inferior'}
        </div>
      </div>
    </div>
  );
};
