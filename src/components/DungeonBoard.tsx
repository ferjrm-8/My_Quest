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
  allObjectivesComplete?: boolean;
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
  allObjectivesComplete = false,
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
      // Corridors visible if within 5.5 tiles of any living hero
      return heroes.some((h) => !h.isDead && Math.hypot(h.x - x, h.y - y) <= 5.5);
    }
    return room.revealed;
  };

  const isMoveValid = (x: number, y: number) => {
    return validMoves.some((m) => m.x === x && m.y === y);
  };

  const isSamePoint = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    return a.x === b.x && a.y === b.y;
  };

  // Find connecting door between two adjacent tiles
  const getDoorBetween = (x1: number, y1: number, x2: number, y2: number): Door | undefined => {
    return doors.find((d) => {
      if (d.tileA && d.tileB) {
        const match1 = isSamePoint(d.tileA, { x: x1, y: y1 }) && isSamePoint(d.tileB, { x: x2, y: y2 });
        const match2 = isSamePoint(d.tileB, { x: x1, y: y1 }) && isSamePoint(d.tileA, { x: x2, y: y2 });
        if (match1 || match2) return true;
      }
      return false;
    });
  };

  // Build grid
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

      // Boundaries with neighboring tiles (Physical Masonry Walls)
      const roomNorth = getRoomAt(x, y - 1);
      const roomSouth = getRoomAt(x, y + 1);
      const roomWest = getRoomAt(x - 1, y);
      const roomEast = getRoomAt(x + 1, y);

      const hasNorthWall = (room && y === room.y) || (y === 0) || (Boolean(room) !== Boolean(roomNorth));
      const hasSouthWall = (room && y === room.y + room.h - 1) || (y === mapHeight - 1) || (Boolean(room) !== Boolean(roomSouth));
      const hasWestWall = (room && x === room.x) || (x === 0) || (Boolean(room) !== Boolean(roomWest));
      const hasEastWall = (room && x === room.x + room.w - 1) || (x === mapWidth - 1) || (Boolean(room) !== Boolean(roomEast));

      const northDoor = getDoorBetween(x, y, x, y - 1);
      const southDoor = getDoorBetween(x, y, x, y + 1);
      const westDoor = getDoorBetween(x, y, x - 1, y);
      const eastDoor = getDoorBetween(x, y, x + 1, y);

      gridCells.push(
        <div
          key={`${x}-${y}`}
          onClick={() => {
            if (isInteractiveDoor && doorAtTile) {
              onDoorClick(doorAtTile);
            } else if (isInteractiveFurniture && furnAtTile) {
              onFurnitureClick(furnAtTile);
            } else if (monsterAtTile && visible) {
              onMonsterClick(monsterAtTile);
            } else if (isMoveTarget) {
              onTileClick(x, y);
            }
          }}
          className={`relative w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 transition-all select-none flex items-center justify-center ${
            !visible
              ? 'bg-[#060504] cursor-default'
              : room
              ? 'bg-[#1e1a16] hover:bg-[#28221c]'
              : 'bg-[#13110f] hover:bg-[#1a1714]'
          } ${
            isMoveTarget
              ? 'ring-2 ring-emerald-400 bg-emerald-950/70 cursor-pointer shadow-[inset_0_0_12px_rgba(52,211,153,0.4)] z-20 animate-pulse'
              : ''
          } ${
            isTargetableMonster
              ? 'ring-4 ring-red-500 bg-red-950/60 cursor-pointer shadow-[0_0_16px_rgba(239,68,68,0.8)] z-20 animate-pulse'
              : monsterAtTile && visible
              ? 'cursor-pointer hover:ring-2 hover:ring-red-400'
              : ''
          } ${isInteractiveDoor ? 'ring-2 ring-amber-400 cursor-pointer z-20' : ''} ${
            isInteractiveFurniture ? 'ring-2 ring-yellow-400 cursor-pointer z-20' : ''
          }`}
          style={{
            backgroundImage: visible
              ? room
                ? 'radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.08) 0%, rgba(20, 16, 12, 0.95) 100%)'
                : 'radial-gradient(circle at 50% 50%, rgba(148, 163, 184, 0.05) 0%, rgba(12, 10, 9, 0.95) 100%)'
              : undefined,
          }}
          title={
            !visible
              ? 'Zona oculta en las sombras'
              : monsterAtTile
              ? `${monsterAtTile.name} (${monsterAtTile.bodyPoints}/${monsterAtTile.maxBodyPoints} PV)${
                  monsterAtTile.isBoss ? ' ★ JEFE SUPREMO ★' : ''
                }`
              : heroAtTile
              ? `${heroAtTile.name} (${heroAtTile.bodyPoints}/${heroAtTile.maxBodyPoints} PV)`
              : isExit
              ? allObjectivesComplete
                ? 'Escalera de Salida (¡ABIERTA! Camina aquí para escapar con la victoria)'
                : 'Escalera de Salida (SELLADA: Debes aniquilar al Jefe y purgar todos los monstruos)'
              : furnAtTile
              ? `${furnAtTile.name} ${furnAtTile.searched ? '(Registrado)' : ''}`
              : doorAtTile
              ? `Puerta de Roble ${doorAtTile.isOpen ? '(Abierta)' : '(Cerrada)'}`
              : `Casilla (${x}, ${y})`
          }
        >
          {/* Detailed Stone Floor Grid Texture */}
          {visible && (
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute inset-0 border border-stone-800/60" />
              <div className="absolute top-0 left-0 w-full h-[1px] bg-stone-700/40" />
              <div className="absolute top-0 left-0 w-[1px] h-full bg-stone-700/40" />
              {/* Subtle stone flagstone diagonal chiseled notch */}
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-r border-b border-stone-700/30" />
            </div>
          )}

          {/* Abyssal Fog of War Shroud */}
          {!visible && (
            <div className="absolute inset-0 bg-[#070605] flex items-center justify-center opacity-98">
              <span className="text-[10px] text-stone-900 font-pixel">·</span>
            </div>
          )}

          {/* 3D ARCHITECTURAL STONE WALLS */}
          {visible && (
            <>
              {/* North Wall: Heavy chiseled stone block */}
              {hasNorthWall && !northDoor && (
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-[#645e54] via-[#3a352d] to-[#1e1b16] border-t border-[#8c8273] shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-10 pointer-events-none flex items-center justify-around px-1">
                  <div className="w-[1px] h-full bg-stone-900/80" />
                  <div className="w-[1px] h-full bg-stone-900/80" />
                </div>
              )}

              {/* South Wall */}
              {hasSouthWall && !southDoor && (
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-[#14120e] via-[#2c2822] to-[#484238] border-b border-[#14120e] shadow-[0_-2px_4px_rgba(0,0,0,0.8)] z-10 pointer-events-none flex items-center justify-around px-1">
                  <div className="w-[1px] h-full bg-stone-900/80" />
                  <div className="w-[1px] h-full bg-stone-900/80" />
                </div>
              )}

              {/* West Wall */}
              {hasWestWall && !westDoor && (
                <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-[#645e54] via-[#3a352d] to-[#1e1b16] border-l border-[#8c8273] shadow-[2px_0_4px_rgba(0,0,0,0.8)] z-10 pointer-events-none flex flex-col justify-around py-1">
                  <div className="h-[1px] w-full bg-stone-900/80" />
                  <div className="h-[1px] w-full bg-stone-900/80" />
                </div>
              )}

              {/* East Wall */}
              {hasEastWall && !eastDoor && (
                <div className="absolute top-0 bottom-0 right-0 w-2 bg-gradient-to-l from-[#14120e] via-[#2c2822] to-[#484238] border-r border-[#14120e] shadow-[-2px_0_4px_rgba(0,0,0,0.8)] z-10 pointer-events-none flex flex-col justify-around py-1">
                  <div className="h-[1px] w-full bg-stone-900/80" />
                  <div className="h-[1px] w-full bg-stone-900/80" />
                </div>
              )}

              {/* Corner Masonry Bosses */}
              {hasNorthWall && hasWestWall && !northDoor && !westDoor && (
                <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-[#787164] border-t border-l border-[#a89f8d] z-15 pointer-events-none shadow" />
              )}
              {hasNorthWall && hasEastWall && !northDoor && !eastDoor && (
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#4a4439] border-t border-r border-[#787164] z-15 pointer-events-none shadow" />
              )}
            </>
          )}

          {/* ARCHITECTURAL DOORS (Distinct Portal Masonry & Wooden Planks) */}
          {visible && doorAtTile && (
            <div
              className={`absolute inset-0.5 rounded flex items-center justify-center z-20 transition-all ${
                doorAtTile.isOpen
                  ? 'bg-gradient-to-b from-stone-900/80 to-stone-950/80 border-2 border-dashed border-amber-600/70 text-amber-400 shadow-[inset_0_0_10px_rgba(217,119,6,0.3)]'
                  : 'bg-gradient-to-b from-[#854d0e] via-[#713f12] to-[#451a03] border-2 border-[#ca8a04] shadow-[0_4px_8px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.4)] text-yellow-300'
              } ${isInteractiveDoor ? 'ring-2 ring-yellow-400 animate-pulse scale-105' : ''}`}
            >
              {doorAtTile.isOpen ? (
                /* Open Portal Arch with torchlight pouring through */
                <div className="flex flex-col items-center justify-center w-full h-full p-0.5">
                  <div className="w-full h-1 bg-amber-600/60 rounded-t" />
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">🚪</span>
                  </div>
                </div>
              ) : (
                /* Heavy Reinforced Oak Door with Iron Bands & Brass Handle */
                <div className="flex flex-col items-center justify-between w-full h-full p-1 relative overflow-hidden">
                  {/* Iron Crossbars */}
                  <div className="w-full h-[2px] bg-stone-900 shadow-[0_1px_0_rgba(255,255,255,0.2)]" />
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xs sm:text-sm drop-shadow">🔒</span>
                  </div>
                  <div className="w-full h-[2px] bg-stone-900 shadow-[0_1px_0_rgba(255,255,255,0.2)]" />
                </div>
              )}
            </div>
          )}

          {/* DUNGEON STAIRCASE (Entrance / Exit) */}
          {visible && isExit && (
            <div
              className={`absolute inset-0.5 rounded-lg flex flex-col items-center justify-center z-15 shadow-xl border-2 transition ${
                allObjectivesComplete
                  ? 'bg-gradient-to-b from-amber-900/90 via-yellow-900/90 to-stone-950 border-yellow-300 ring-4 ring-yellow-400/80 animate-pulse text-yellow-200'
                  : 'bg-gradient-to-b from-stone-900 to-stone-950 border-stone-600 text-stone-400'
              }`}
            >
              <span className="text-sm sm:text-base leading-none drop-shadow">
                {allObjectivesComplete ? '✨🪜' : '🪜🔒'}
              </span>
              <span
                className={`text-[6px] sm:text-[7px] font-pixel font-bold mt-0.5 tracking-tighter ${
                  allObjectivesComplete ? 'text-yellow-300' : 'text-stone-400'
                }`}
              >
                {allObjectivesComplete ? 'SALIDA LIBRE' : 'SELLADA'}
              </span>
            </div>
          )}

          {/* DETECTED / SPRUNG TRAPS */}
          {visible && trapAtTile && (
            <div
              className={`absolute inset-1 rounded-md flex items-center justify-center z-12 shadow-lg border-2 ${
                trapAtTile.sprung
                  ? 'bg-red-950/80 border-red-600 text-red-300'
                  : 'bg-yellow-950/90 border-yellow-500 text-yellow-200 animate-pulse'
              }`}
            >
              <span className="text-xs sm:text-sm">{trapAtTile.type === 'pit' ? '🕳️' : '⚠️'}</span>
            </div>
          )}

          {/* 3D FURNITURE (Chests, Sarcophagi, Thrones, Weapon Racks) */}
          {visible && furnAtTile && (
            <div
              className={`absolute inset-1 rounded-lg flex flex-col items-center justify-center z-12 transition shadow-lg ${
                furnAtTile.searched
                  ? 'opacity-40 bg-stone-900/90 border border-stone-700'
                  : 'bg-gradient-to-b from-[#78350f] to-[#451a03] border-2 border-amber-500 shadow-[0_4px_8px_rgba(0,0,0,0.8)]'
              }`}
            >
              <span className="text-sm sm:text-base leading-none drop-shadow-md">
                {furnAtTile.type === 'chest'
                  ? furnAtTile.searched ? '📦' : '🎁'
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

          {/* MONSTER FIGURE TOKEN */}
          {visible && monsterAtTile && (
            <div
              className={`relative z-30 flex flex-col items-center justify-center transition-all ${
                monsterAtTile.isBoss
                  ? 'ring-4 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.95)] scale-110 animate-pulse'
                  : isTargetableMonster
                  ? 'ring-3 ring-red-400 scale-105'
                  : ''
              }`}
            >
              <MonsterTokenView
                type={monsterAtTile.type}
                isBoss={Boolean(monsterAtTile.isBoss)}
              />
            </div>
          )}

          {/* HERO FIGURE TOKEN */}
          {visible && heroAtTile && (
            <div
              className={`relative z-30 flex flex-col items-center justify-center transition-all ${
                heroAtTile.id === activeHero.id
                  ? 'ring-4 ring-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.9)] scale-110 z-35'
                  : ''
              }`}
            >
              <HeroTokenView
                heroClass={heroAtTile.heroClass}
                isActive={heroAtTile.id === activeHero.id}
              />
            </div>
          )}

          {/* MOVEMENT DESTINATION RUNE */}
          {isMoveTarget && !heroAtTile && !monsterAtTile && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-22">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-ping" />
            </div>
          )}
        </div>
      );
    }
  }

  return (
    <div className="relative inline-block p-3 sm:p-5 bg-gradient-to-b from-[#181512] via-[#100e0c] to-[#0a0807] rounded-2xl border-4 border-[#44382c] shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
      {/* Ornate Board Header with Dimensions & Ambiance */}
      <div className="flex items-center justify-between mb-2 px-1 text-[10px] font-pixel text-stone-500 border-b border-stone-800/80 pb-1.5">
        <div className="flex items-center gap-2 text-amber-500 font-bold">
          <span>⚔️ TABLERO DE HEROQUEST</span>
          <span className="text-stone-600 font-normal">|</span>
          <span className="text-stone-400 font-normal">{mapWidth}x{mapHeight} Cuadrículas</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-stone-400">Salas: {rooms.length}</span>
          <span className="text-stone-400">Puertas: {doors.length}</span>
        </div>
      </div>

      {/* Grid container with proper masonry borders */}
      <div
        className="grid gap-[1px] bg-[#0c0a09] p-1.5 rounded-xl border-2 border-stone-800 shadow-inner overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${mapWidth}, minmax(0, 1fr))`,
        }}
      >
        {gridCells}
      </div>

      {/* Board Footnote / Legend */}
      <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-[10px] font-pixel text-stone-400">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-emerald-500 ring-1 ring-emerald-300" />
            <span>Casilla válida de movimiento</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-red-600 ring-1 ring-red-300" />
            <span>Monstruo atacable</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🚪</span>
            <span>Puerta interactiva</span>
          </div>
        </div>

        <div className="text-stone-500 font-medieval italic">
          Haz clic en casillas verdes o usa flechas/WASD para mover
        </div>
      </div>
    </div>
  );
};
