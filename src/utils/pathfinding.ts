import { Door, Hero, Monster, Quest, RoomDef } from '../types/heroquest';

interface Point {
  x: number;
  y: number;
}

// Find which room a point belongs to (or undefined if corridor)
export function getRoomAtCoord(x: number, y: number, rooms: RoomDef[]): RoomDef | undefined {
  return rooms.find((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
}

// Check if two points are the exact same tile
export function isSamePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

// Strict wall collision check:
// Moving from (fromX, fromY) to (toX, toY) must obey room walls.
// In HeroQuest, every room is surrounded by solid stone walls.
// Transitioning between room & corridor (or room & room) is ONLY permitted through an OPEN door!
export function canCrossBoundary(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  rooms: RoomDef[],
  doors: Door[]
): boolean {
  const roomA = getRoomAtCoord(fromX, fromY, rooms);
  const roomB = getRoomAtCoord(toX, toY, rooms);

  // Both tiles are in the same room, or both are in the corridor:
  // No room boundary separates them.
  if (roomA === roomB) {
    return true;
  }

  // They are in different areas (room vs corridor, or room A vs room B).
  // A solid stone wall stands between them unless an OPEN door connects these two exact tiles!
  const connectingDoor = doors.find((d) => {
    if (!d.isOpen) return false;

    // Check explicit tileA and tileB
    if (d.tileA && d.tileB) {
      const match1 = isSamePoint(d.tileA, { x: fromX, y: fromY }) && isSamePoint(d.tileB, { x: toX, y: toY });
      const match2 = isSamePoint(d.tileB, { x: fromX, y: fromY }) && isSamePoint(d.tileA, { x: toX, y: toY });
      if (match1 || match2) return true;
    }

    return false;
  });

  return Boolean(connectingDoor && connectingDoor.isOpen);
}

// General walkability check for a unit
export function isTileWalkableGeneral(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  quest: Quest,
  occupants: Point[] // other heroes or monsters occupying tiles
): boolean {
  const { mapWidth, mapHeight, rooms, doors, furniture } = quest;

  // 1. Map boundaries
  if (toX < 0 || toX >= mapWidth || toY < 0 || toY >= mapHeight) {
    return false;
  }

  // 2. Strict room wall collision
  if (!canCrossBoundary(fromX, fromY, toX, toY, rooms, doors)) {
    return false;
  }

  // 3. Closed door blocks tile
  const closedDoor = doors.find((d) => d.x === toX && d.y === toY && !d.isOpen);
  if (closedDoor) {
    return false;
  }

  // 4. Furniture blocks tile
  const hitFurniture = furniture.some(
    (f) => toX >= f.x && toX < f.x + f.w && toY >= f.y && toY < f.y + f.h
  );
  if (hitFurniture) {
    return false;
  }

  // 5. Occupied by another living figure
  if (occupants.some((p) => p.x === toX && p.y === toY)) {
    return false;
  }

  // 6. Cannot step into an unrevealed room through an open door until room is triggered
  const targetRoom = getRoomAtCoord(toX, toY, rooms);
  if (targetRoom && !targetRoom.revealed) {
    // Only allowed if there's a door connecting into it that is open
    const door = doors.find(
      (d) =>
        d.isOpen &&
        ((d.x === toX && d.y === toY) ||
          (d.tileA && isSamePoint(d.tileA, { x: toX, y: toY })) ||
          (d.tileB && isSamePoint(d.tileB, { x: toX, y: toY })))
    );
    if (!door) return false;
  }

  return true;
}

// BFS shortest path finder from start to any of the target goal tiles
export function findBFSPath(
  start: Point,
  isGoal: (pt: Point) => boolean,
  quest: Quest,
  occupants: Point[],
  maxDepth = 25
): Point[] {
  if (isGoal(start)) return [];

  const queue: { pt: Point; path: Point[] }[] = [{ pt: start, path: [] }];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  const dirs = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  while (queue.length > 0) {
    const { pt, path } = queue.shift()!;
    if (path.length >= maxDepth) continue;

    for (const { dx, dy } of dirs) {
      const nx = pt.x + dx;
      const ny = pt.y + dy;
      const nextPt = { x: nx, y: ny };
      const key = `${nx},${ny}`;

      if (visited.has(key)) continue;

      // Check walkability from pt to nextPt
      if (isTileWalkableGeneral(pt.x, pt.y, nx, ny, quest, occupants)) {
        visited.add(key);
        const newPath = [...path, nextPt];

        if (isGoal(nextPt)) {
          return newPath;
        }

        queue.push({ pt: nextPt, path: newPath });
      }
    }
  }

  return [];
}

// AI Companion decision engine:
// Generates intelligent, non-oscillating moves towards monsters, doors, or party leader
export function getSmartAIMove(
  hero: Hero,
  quest: Quest,
  allHeroes: Hero[],
  monsters: Monster[],
  visitedThisTurn: Set<string>
): Point | null {
  const otherOccupants: Point[] = [
    ...allHeroes.filter((h) => !h.isDead && h.id !== hero.id).map((h) => ({ x: h.x, y: h.y })),
    ...monsters.filter((m) => !m.isDead && m.revealed).map((m) => ({ x: m.x, y: m.y })),
  ];

  const revealedMonsters = monsters.filter((m) => !m.isDead && m.revealed);
  const closedDoors = quest.doors.filter((d) => !d.isOpen);

  // Goal 1: If monsters are revealed, pathfind to get adjacent to the closest monster!
  if (revealedMonsters.length > 0) {
    const isAdjacentToMonster = (pt: Point) => {
      return revealedMonsters.some(
        (m) => Math.abs(m.x - pt.x) + Math.abs(m.y - pt.y) === 1
      );
    };

    // If already adjacent to a monster, don't move; attack!
    if (isAdjacentToMonster({ x: hero.x, y: hero.y })) {
      return null;
    }

    const path = findBFSPath({ x: hero.x, y: hero.y }, isAdjacentToMonster, quest, otherOccupants);
    if (path.length > 0) {
      const nextStep = path[0];
      const key = `${nextStep.x},${nextStep.y}`;
      if (!visitedThisTurn.has(key)) {
        return nextStep;
      }
    }
  }

  // Goal 2: If no monsters, pathfind towards the closest closed door to explore!
  if (closedDoors.length > 0) {
    const isAdjacentToClosedDoor = (pt: Point) => {
      return closedDoors.some(
        (d) =>
          Math.abs(d.x - pt.x) + Math.abs(d.y - pt.y) === 1 ||
          (d.tileA && isSamePoint(d.tileA, pt)) ||
          (d.tileB && isSamePoint(d.tileB, pt))
      );
    };

    if (!isAdjacentToClosedDoor({ x: hero.x, y: hero.y })) {
      const path = findBFSPath({ x: hero.x, y: hero.y }, isAdjacentToClosedDoor, quest, otherOccupants);
      if (path.length > 0) {
        const nextStep = path[0];
        const key = `${nextStep.x},${nextStep.y}`;
        if (!visitedThisTurn.has(key)) {
          return nextStep;
        }
      }
    }
  }

  // Goal 3: Follow the human player or party leader (Hero 0)
  const leader = allHeroes.find((h) => !h.isDead && !h.isAI) || allHeroes[0];
  if (leader && leader.id !== hero.id) {
    const isNearLeader = (pt: Point) => {
      const dist = Math.abs(leader.x - pt.x) + Math.abs(leader.y - pt.y);
      return dist <= 2;
    };

    if (!isNearLeader({ x: hero.x, y: hero.y })) {
      const path = findBFSPath({ x: hero.x, y: hero.y }, isNearLeader, quest, otherOccupants);
      if (path.length > 0) {
        const nextStep = path[0];
        const key = `${nextStep.x},${nextStep.y}`;
        if (!visitedThisTurn.has(key)) {
          return nextStep;
        }
      }
    }
  }

  // Fallback: any valid non-visited step
  const dirs = [
    { dx: 0, dy: 1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: -1, dy: 0 },
  ];

  for (const { dx, dy } of dirs) {
    const nx = hero.x + dx;
    const ny = hero.y + dy;
    const key = `${nx},${ny}`;
    if (!visitedThisTurn.has(key) && isTileWalkableGeneral(hero.x, hero.y, nx, ny, quest, otherOccupants)) {
      return { x: nx, y: ny };
    }
  }

  return null;
}

// Monster Movement in Morcar's Turn:
// Pathfinds towards the closest living hero up to moveSpaces, stopping adjacent to attack!
export function getMonsterMovePath(
  monster: Monster,
  quest: Quest,
  livingHeroes: Hero[],
  allMonsters: Monster[]
): Point[] {
  if (livingHeroes.length === 0) return [];

  // Occupants: other living monsters
  const otherOccupants: Point[] = allMonsters
    .filter((m) => !m.isDead && m.id !== monster.id)
    .map((m) => ({ x: m.x, y: m.y }));

  // Already adjacent AND directly reachable without a solid wall separating them!
  const isAlreadyAdjacentAndReachable = livingHeroes.some((h) => {
    const dx = Math.abs(h.x - monster.x);
    const dy = Math.abs(h.y - monster.y);
    const isAdj = dx <= 1 && dy <= 1 && (dx + dy > 0);
    return isAdj && canCrossBoundary(monster.x, monster.y, h.x, h.y, quest.rooms, quest.doors);
  });

  if (isAlreadyAdjacentAndReachable) {
    return [];
  }

  // Target: any walkable tile adjacent to a living hero that can physically strike the hero
  const isAdjacentToHero = (pt: Point) => {
    return livingHeroes.some((h) => {
      const dx = Math.abs(h.x - pt.x);
      const dy = Math.abs(h.y - pt.y);
      const isAdj = dx <= 1 && dy <= 1 && (dx + dy > 0);
      return isAdj && canCrossBoundary(pt.x, pt.y, h.x, h.y, quest.rooms, quest.doors);
    });
  };

  const path = findBFSPath(
    { x: monster.x, y: monster.y },
    isAdjacentToHero,
    quest,
    otherOccupants,
    monster.moveSpaces + 4
  );

  // Return at most monster.moveSpaces steps
  return path.slice(0, monster.moveSpaces);
}

export interface HeroMoveDestination {
  x: number;
  y: number;
  cost: number;
  alliesPassed: Hero[];
}

/**
 * Calculates all valid step destinations for the active hero based on HeroQuest rules:
 * 1. An adjacent empty walkable tile costs 1 movement.
 * 2. Friendly living heroes can be passed through (traversed) if the hero has sufficient movement,
 *    allowing the hero to land on empty walkable tiles beyond them (costing 2 or more movement points).
 * 3. Heroes CANNOT end their movement on any occupied tile (neither friendly hero nor monster).
 * 4. Monsters CANNOT be passed through or landed on under any circumstances.
 * 5. Closed doors, walls, and furniture block movement and cannot be traversed.
 */
export function getValidHeroMoves(
  activeHero: Hero,
  quest: Quest,
  allHeroes: Hero[],
  movementRemaining: number
): HeroMoveDestination[] {
  if (movementRemaining <= 0 || activeHero.isDead) return [];

  const { mapWidth, mapHeight, rooms, doors, furniture, monsters } = quest;
  const startPt: Point = { x: activeHero.x, y: activeHero.y };

  const livingAllies = allHeroes.filter((h) => !h.isDead && h.id !== activeHero.id);
  const blockingMonsters = monsters.filter((m) => !m.isDead && m.revealed);

  const dirs = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  interface SearchNode {
    x: number;
    y: number;
    cost: number;
    allies: Hero[];
  }

  const minCostMap = new Map<string, number>();
  minCostMap.set(`${startPt.x},${startPt.y}`, 0);

  const destinationsMap = new Map<string, HeroMoveDestination>();
  const queue: SearchNode[] = [{ x: startPt.x, y: startPt.y, cost: 0, allies: [] }];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.cost >= movementRemaining) continue;

    for (const { dx, dy } of dirs) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      const nextKey = `${nx},${ny}`;
      const nextCost = current.cost + 1;

      // 1. Map bounds
      if (nx < 0 || nx >= mapWidth || ny < 0 || ny >= mapHeight) continue;

      // 2. Strict room wall collision
      if (!canCrossBoundary(current.x, current.y, nx, ny, rooms, doors)) continue;

      // 3. Closed door blocks
      if (doors.some((d) => d.x === nx && d.y === ny && !d.isOpen)) continue;

      // 4. Furniture blocks
      if (furniture.some((f) => nx >= f.x && nx < f.x + f.w && ny >= f.y && ny < f.y + f.h)) continue;

      // 5. Unrevealed room check (must enter via open door)
      const targetRoom = getRoomAtCoord(nx, ny, rooms);
      if (targetRoom && !targetRoom.revealed) {
        const hasOpenDoor = doors.some(
          (d) =>
            d.isOpen &&
            ((d.x === nx && d.y === ny) ||
              (d.tileA && isSamePoint(d.tileA, { x: nx, y: ny })) ||
              (d.tileB && isSamePoint(d.tileB, { x: nx, y: ny })))
        );
        if (!hasOpenDoor) continue;
      }

      // 6. Living monster blocks tile completely (cannot pass through, cannot land)
      if (blockingMonsters.some((m) => m.x === nx && m.y === ny)) continue;

      // 7. Check if occupied by a living friendly hero
      const allyAtTile = livingAllies.find((h) => h.x === nx && h.y === ny);

      if (allyAtTile) {
        // HeroQuest rule: Heroes CANNOT end movement on an ally's square,
        // but CAN pass through if sufficient movement remains!
        const existingCost = minCostMap.get(nextKey) ?? Infinity;
        if (nextCost < existingCost) {
          minCostMap.set(nextKey, nextCost);
          queue.push({
            x: nx,
            y: ny,
            cost: nextCost,
            allies: [...current.allies, allyAtTile],
          });
        }
      } else {
        // Empty walkable square!
        // Valid destination if it's an adjacent single step OR reachable by passing through allies
        const isAdjacentStep = current.cost === 0;
        const isPassingAlly = current.allies.length > 0;

        if (isAdjacentStep || isPassingAlly) {
          const existingDest = destinationsMap.get(nextKey);
          if (!existingDest || nextCost < existingDest.cost) {
            destinationsMap.set(nextKey, {
              x: nx,
              y: ny,
              cost: nextCost,
              alliesPassed: current.allies,
            });
          }
        }

        // If we passed an ally, we can continue searching through any further consecutive allies
        const existingCost = minCostMap.get(nextKey) ?? Infinity;
        if (nextCost < existingCost) {
          minCostMap.set(nextKey, nextCost);
          if (current.allies.length > 0) {
            queue.push({
              x: nx,
              y: ny,
              cost: nextCost,
              allies: current.allies,
            });
          }
        }
      }
    }
  }

  return Array.from(destinationsMap.values());
}

