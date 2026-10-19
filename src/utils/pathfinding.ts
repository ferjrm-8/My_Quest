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

    // Check door placed on one of the tiles
    const onFrom = d.x === fromX && d.y === fromY;
    const onTo = d.x === toX && d.y === toY;
    if (onFrom || onTo) return true;

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

  // Find closest hero
  let closestHero = livingHeroes[0];
  let minD = 999;
  for (const h of livingHeroes) {
    const d = Math.abs(h.x - monster.x) + Math.abs(h.y - monster.y);
    if (d < minD) {
      minD = d;
      closestHero = h;
    }
  }

  // Already adjacent!
  if (minD === 1) {
    return [];
  }

  // Target: any walkable tile adjacent to closestHero
  const isAdjacentToHero = (pt: Point) => {
    return Math.abs(closestHero.x - pt.x) + Math.abs(closestHero.y - pt.y) === 1;
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
