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
  activeActorTile?: { x: number; y: number } | null;
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
  activeActorTile = null,
}) => {
  const { mapWidth, mapHeight, rooms, doors, traps, furniture, exitPosition } = quest;

  // Auto-center map on active actor (moving/acting hero or monster)
  React.useEffect(() => {
    if (activeActorTile) {
      const tileElem = document.getElementById(`hq-tile-${activeActorTile.x}-${activeActorTile.y}`);
      if (tileElem) {
        tileElem.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }
  }, [activeActorTile?.x, activeActorTile?.y]);

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

  // Helper: Find a door that connects a room tile (fromX, fromY) across a specific wall edge to (toX, toY)
  const findDoorOnEdge = (fromX: number, fromY: number, toX: number, toY: number): Door | undefined => {
    return doors.find((d) => {
      if (d.tileA && d.tileB) {
        const match1 = isSamePoint(d.tileA, { x: fromX, y: fromY }) && isSamePoint(d.tileB, { x: toX, y: toY });
        const match2 = isSamePoint(d.tileB, { x: fromX, y: fromY }) && isSamePoint(d.tileA, { x: toX, y: toY });
        if (match1 || match2) return true;
      }
      if ((d.x === fromX && d.y === fromY) || (d.x === toX && d.y === toY)) {
        return true;
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

      const isTargetableMonster = monsterAtTile && targetableMonsters.includes(monsterAtTile.id);
      const isInteractiveFurniture = furnAtTile && !furnAtTile.searched && adjacentFurniture.some((f) => f.id === furnAtTile.id);

      // In HeroQuest, walls exist on room perimeters or where corridors touch rooms/map edges
      const isRoomNorthEdge = Boolean((room && y === room.y) || (!room && (y === 0 || getRoomAt(x, y - 1) !== undefined)));
      const isRoomSouthEdge = Boolean((room && y === room.y + room.h - 1) || (!room && (y === mapHeight - 1 || getRoomAt(x, y + 1) !== undefined)));
      const isRoomWestEdge = Boolean((room && x === room.x) || (!room && (x === 0 || getRoomAt(x - 1, y) !== undefined)));
      const isRoomEastEdge = Boolean((room && x === room.x + room.w - 1) || (!room && (x === mapWidth - 1 || getRoomAt(x + 1, y) !== undefined)));

      // Doors located on these perimeter edges
      const northDoor = isRoomNorthEdge ? findDoorOnEdge(x, y, x, y - 1) : undefined;
      const southDoor = isRoomSouthEdge ? findDoorOnEdge(x, y, x, y + 1) : undefined;
      const westDoor = isRoomWestEdge ? findDoorOnEdge(x, y, x - 1, y) : undefined;
      const eastDoor = isRoomEastEdge ? findDoorOnEdge(x, y, x + 1, y) : undefined;

      // Check if any closed door touches this tile and is interactive
      const touchingInteractiveDoor = [northDoor, southDoor, westDoor, eastDoor].find(
        (d) => d && !d.isOpen && adjacentDoors.some((ad) => ad.id === d.id)
      );

      const isActiveActor = Boolean(activeActorTile && activeActorTile.x === x && activeActorTile.y === y);

      gridCells.push(
        <div
          key={`${x}-${y}`}
          id={`hq-tile-${x}-${y}`}
          onClick={() => {
            if (isMoveTarget) {
              onTileClick(x, y);
            } else if (isInteractiveFurniture && furnAtTile) {
              onFurnitureClick(furnAtTile);
            } else if (monsterAtTile && visible) {
              onMonsterClick(monsterAtTile);
            }
          }}
          className={`relative w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 transition-all select-none flex items-center justify-center ${
            !visible
              ? 'bg-[#060504] cursor-default'
              : room
              ? 'bg-[#1c1814] hover:bg-[#25201a]'
              : 'bg-[#100e0c] hover:bg-[#161411]'
          } ${
            isActiveActor
              ? 'ring-4 ring-amber-400 bg-amber-950/40 shadow-[0_0_24px_rgba(245,158,11,0.95)] z-25 animate-pulse'
              : isMoveTarget
              ? 'ring-2 ring-emerald-400 bg-emerald-950/70 cursor-pointer shadow-[inset_0_0_12px_rgba(52,211,153,0.35)] z-20 animate-pulse'
              : ''
          } ${
            isTargetableMonster
              ? 'ring-4 ring-red-500 bg-red-950/60 cursor-pointer shadow-[0_0_16px_rgba(239,68,68,0.8)] z-20 animate-pulse'
              : monsterAtTile && visible
              ? 'cursor-pointer hover:ring-2 hover:ring-red-400'
              : ''
          } ${
            isInteractiveFurniture ? 'ring-2 ring-yellow-400 cursor-pointer z-20' : ''
          }`}
          style={{
            backgroundImage: visible
              ? room
                ? 'radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.07) 0%, rgba(18, 14, 11, 0.95) 100%)'
                : 'radial-gradient(circle at 50% 50%, rgba(148, 163, 184, 0.04) 0%, rgba(10, 9, 8, 0.95) 100%)'
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
              : `Casilla (${x}, ${y})`
          }
        >
          {/* Detailed Stone Floor Grid Texture */}
          {visible && (
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <div className="absolute inset-0 border border-stone-800/40" />
              <div className="absolute top-0 left-0 w-full h-[1px] bg-stone-700/30" />
              <div className="absolute top-0 left-0 w-[1px] h-full bg-stone-700/30" />
            </div>
          )}

          {/* Abyssal Fog of War Shroud */}
          {!visible && (
            <div className="absolute inset-0 bg-[#060504] flex items-center justify-center opacity-98">
              <span className="text-[10px] text-stone-900 font-pixel">·</span>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════════════
              CONSISTENT ARCHITECTURAL ROOM WALLS & INTEGRATED DOORS
              Walls exist strictly along room perimeters.
              Doors sit directly on the wall dividing room and corridor.
              ══════════════════════════════════════════════════════════════════════════════ */}
          {visible && (
            <>
              {/* ── NORTH WALL / DOOR ── */}
              {isRoomNorthEdge && (
                northDoor ? (
                  /* Door on North Wall */
                  <div
                    onClick={(e) => {
                      if (!northDoor.isOpen && adjacentDoors.some((ad) => ad.id === northDoor.id)) {
                        e.stopPropagation();
                        onDoorClick(northDoor);
                      }
                    }}
                    className={`absolute top-[-4px] left-0 right-0 h-[8px] z-30 flex items-center justify-center transition-all ${
                      northDoor.isOpen
                        ? 'pointer-events-none'
                        : adjacentDoors.some((ad) => ad.id === northDoor.id)
                        ? 'cursor-pointer ring-2 ring-yellow-400 animate-pulse'
                        : 'pointer-events-none'
                    }`}
                    title={northDoor.isOpen ? 'Puerta abierta' : 'Puerta de roble cerrada'}
                  >
                    {northDoor.isOpen ? (
                      /* Open Portal Threshold: Door swung perpendicular into room */
                      <div className="relative w-full h-full flex items-center justify-between px-1">
                        <div className="w-1.5 h-3 bg-[#78350f] border border-[#a16207] shadow" />
                        <div className="w-full h-1 bg-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                      </div>
                    ) : (
                      /* Closed Sturdy Oak Door Beam on Wall */
                      <div className="w-full h-full bg-gradient-to-r from-[#78350f] via-[#92400e] to-[#78350f] border-y border-[#ca8a04] shadow-[0_2px_4px_rgba(0,0,0,0.9)] rounded-xs flex items-center justify-center">
                        <div className="w-2 h-1 bg-amber-400 rounded-full shadow-[0_0_4px_#fde047]" />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Solid North Stone Wall */
                  <div className="absolute top-0 left-0 right-0 h-[5px] bg-[#3a342c] border-t border-[#665c4e] border-b border-[#1c1915] shadow-[0_2px_4px_rgba(0,0,0,0.9)] z-25 pointer-events-none" />
                )
              )}

              {/* ── SOUTH WALL / DOOR ── */}
              {isRoomSouthEdge && (
                southDoor ? (
                  /* Door on South Wall */
                  <div
                    onClick={(e) => {
                      if (!southDoor.isOpen && adjacentDoors.some((ad) => ad.id === southDoor.id)) {
                        e.stopPropagation();
                        onDoorClick(southDoor);
                      }
                    }}
                    className={`absolute bottom-[-4px] left-0 right-0 h-[8px] z-30 flex items-center justify-center transition-all ${
                      southDoor.isOpen
                        ? 'pointer-events-none'
                        : adjacentDoors.some((ad) => ad.id === southDoor.id)
                        ? 'cursor-pointer ring-2 ring-yellow-400 animate-pulse'
                        : 'pointer-events-none'
                    }`}
                    title={southDoor.isOpen ? 'Puerta abierta' : 'Puerta de roble cerrada'}
                  >
                    {southDoor.isOpen ? (
                      <div className="relative w-full h-full flex items-center justify-between px-1">
                        <div className="w-1.5 h-3 bg-[#78350f] border border-[#a16207] shadow" />
                        <div className="w-full h-1 bg-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-[#78350f] via-[#92400e] to-[#78350f] border-y border-[#ca8a04] shadow-[0_2px_4px_rgba(0,0,0,0.9)] rounded-xs flex items-center justify-center">
                        <div className="w-2 h-1 bg-amber-400 rounded-full shadow-[0_0_4px_#fde047]" />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Solid South Stone Wall */
                  <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-[#3a342c] border-b border-[#1c1915] border-t border-[#665c4e] shadow-[0_-2px_4px_rgba(0,0,0,0.9)] z-25 pointer-events-none" />
                )
              )}

              {/* ── WEST WALL / DOOR ── */}
              {isRoomWestEdge && (
                westDoor ? (
                  /* Door on West Wall */
                  <div
                    onClick={(e) => {
                      if (!westDoor.isOpen && adjacentDoors.some((ad) => ad.id === westDoor.id)) {
                        e.stopPropagation();
                        onDoorClick(westDoor);
                      }
                    }}
                    className={`absolute left-[-4px] top-0 bottom-0 w-[8px] z-30 flex items-center justify-center transition-all ${
                      westDoor.isOpen
                        ? 'pointer-events-none'
                        : adjacentDoors.some((ad) => ad.id === westDoor.id)
                        ? 'cursor-pointer ring-2 ring-yellow-400 animate-pulse'
                        : 'pointer-events-none'
                    }`}
                    title={westDoor.isOpen ? 'Puerta abierta' : 'Puerta de roble cerrada'}
                  >
                    {westDoor.isOpen ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-between py-1">
                        <div className="h-1.5 w-3 bg-[#78350f] border border-[#a16207] shadow" />
                        <div className="w-1 h-full bg-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-[#78350f] via-[#92400e] to-[#78350f] border-x border-[#ca8a04] shadow-[0_2px_4px_rgba(0,0,0,0.9)] rounded-xs flex items-center justify-center">
                        <div className="h-2 w-1 bg-amber-400 rounded-full shadow-[0_0_4px_#fde047]" />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Solid West Stone Wall */
                  <div className="absolute top-0 bottom-0 left-0 w-[5px] bg-[#3a342c] border-l border-[#665c4e] border-r border-[#1c1915] shadow-[2px_0_4px_rgba(0,0,0,0.9)] z-25 pointer-events-none" />
                )
              )}

              {/* ── EAST WALL / DOOR ── */}
              {isRoomEastEdge && (
                eastDoor ? (
                  /* Door on East Wall */
                  <div
                    onClick={(e) => {
                      if (!eastDoor.isOpen && adjacentDoors.some((ad) => ad.id === eastDoor.id)) {
                        e.stopPropagation();
                        onDoorClick(eastDoor);
                      }
                    }}
                    className={`absolute right-[-4px] top-0 bottom-0 w-[8px] z-30 flex items-center justify-center transition-all ${
                      eastDoor.isOpen
                        ? 'pointer-events-none'
                        : adjacentDoors.some((ad) => ad.id === eastDoor.id)
                        ? 'cursor-pointer ring-2 ring-yellow-400 animate-pulse'
                        : 'pointer-events-none'
                    }`}
                    title={eastDoor.isOpen ? 'Puerta abierta' : 'Puerta de roble cerrada'}
                  >
                    {eastDoor.isOpen ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-between py-1">
                        <div className="h-1.5 w-3 bg-[#78350f] border border-[#a16207] shadow" />
                        <div className="w-1 h-full bg-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-[#78350f] via-[#92400e] to-[#78350f] border-x border-[#ca8a04] shadow-[0_2px_4px_rgba(0,0,0,0.9)] rounded-xs flex items-center justify-center">
                        <div className="h-2 w-1 bg-amber-400 rounded-full shadow-[0_0_4px_#fde047]" />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Solid East Stone Wall */
                  <div className="absolute top-0 bottom-0 right-0 w-[5px] bg-[#3a342c] border-r border-[#1c1915] border-l border-[#665c4e] shadow-[-2px_0_4px_rgba(0,0,0,0.9)] z-25 pointer-events-none" />
                )
              )}

              {/* Solid Room Corner Masonry Blocks */}
              {isRoomNorthEdge && isRoomWestEdge && !northDoor && !westDoor && (
                <div className="absolute top-0 left-0 w-[6px] h-[6px] bg-[#4a4237] border-t border-l border-[#807462] z-26 pointer-events-none shadow" />
              )}
              {isRoomNorthEdge && isRoomEastEdge && !northDoor && !eastDoor && (
                <div className="absolute top-0 right-0 w-[6px] h-[6px] bg-[#4a4237] border-t border-r border-[#807462] z-26 pointer-events-none shadow" />
              )}
              {isRoomSouthEdge && isRoomWestEdge && !southDoor && !westDoor && (
                <div className="absolute bottom-0 left-0 w-[6px] h-[6px] bg-[#29241f] border-b border-l border-[#52493d] z-26 pointer-events-none shadow" />
              )}
              {isRoomSouthEdge && isRoomEastEdge && !southDoor && !eastDoor && (
                <div className="absolute bottom-0 right-0 w-[6px] h-[6px] bg-[#29241f] border-b border-r border-[#52493d] z-26 pointer-events-none shadow" />
              )}
            </>
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
    <div className="relative inline-block p-3 sm:p-5 bg-gradient-to-b from-[#181512] via-[#100e0c] to-[#0a0807] rounded-2xl border-4 border-[#3a3227] shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
      {/* Board Header with Dimensions & Ambiance */}
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

      {/* Grid container with uniform outer dungeon masonry border */}
      <div
        className="grid gap-[1px] bg-[#0c0a09] p-1 rounded-xl border-4 border-[#3a342c] shadow-inner overflow-hidden"
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
            <div className="w-4 h-1.5 bg-[#854d0e] border border-[#ca8a04] rounded-xs" />
            <span>Puerta en muro</span>
          </div>
        </div>

        <div className="text-stone-500 font-medieval italic">
          Haz clic en casillas verdes o usa flechas/WASD para mover
        </div>
      </div>
    </div>
  );
};
