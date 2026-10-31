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
// Generates intelligent, non-oscillating moves towards monsters, doors, or party leader (supporting ally pass-through!)
export function getSmartAIMove(
  hero: Hero,
  quest: Quest,
  allHeroes: Hero[],
  monsters: Monster[],
  visitedThisTurn: Set<string>,
  movementRemaining = 6
): Point | null {
  const stepsAvailable = movementRemaining <= 0 ? 6 : movementRemaining;
  const immediateValidMoves = getValidHeroMoves(hero, quest, allHeroes, stepsAvailable);
  if (immediateValidMoves.length === 0) return null;

  const unvisitedMoves = immediateValidMoves.filter(
    (m) => !visitedThisTurn.has(`${m.x},${m.y}`)
  );
  const candidates = unvisitedMoves.length > 0 ? unvisitedMoves : immediateValidMoves;

  const revealedMonsters = monsters.filter((m) => !m.isDead && m.revealed);
  const closedDoors = quest.doors.filter((d) => !d.isOpen);

  // Goal 1: Target monster adjacency
  if (revealedMonsters.length > 0) {
    const isAdjacentToMonster = revealedMonsters.some(
      (m) => Math.abs(m.x - hero.x) + Math.abs(m.y - hero.y) === 1
    );
    if (isAdjacentToMonster) return null; // Already adjacent, attack!

    const otherOccupants: Point[] = [
      ...allHeroes.filter((h) => !h.isDead && h.id !== hero.id).map((h) => ({ x: h.x, y: h.y })),
      ...monsters.filter((m) => !m.isDead && m.revealed).map((m) => ({ x: m.x, y: m.y })),
    ];

    const isGoal = (pt: Point) =>
      revealedMonsters.some((m) => Math.abs(m.x - pt.x) + Math.abs(m.y - pt.y) === 1);

    const fullPath = findBFSPath({ x: hero.x, y: hero.y }, isGoal, quest, otherOccupants);
    if (fullPath.length > 0) {
      const nextStepInPath = fullPath[0];
      const matchingCandidate = candidates.find(
        (c) => c.x === nextStepInPath.x && c.y === nextStepInPath.y
      );
      if (matchingCandidate) return { x: matchingCandidate.x, y: matchingCandidate.y };
    }

    candidates.sort((a, b) => {
      const minA = Math.min(...revealedMonsters.map((m) => Math.abs(m.x - a.x) + Math.abs(m.y - a.y)));
      const minB = Math.min(...revealedMonsters.map((m) => Math.abs(m.x - b.x) + Math.abs(m.y - b.y)));
      return minA - minB;
    });

    return { x: candidates[0].x, y: candidates[0].y };
  }

  // Goal 2: Target closed door adjacency
  if (closedDoors.length > 0) {
    const isAdjacentToDoor = closedDoors.some(
      (d) => Math.abs(d.x - hero.x) + Math.abs(d.y - hero.y) <= 1
    );
    if (!isAdjacentToDoor) {
      const otherOccupants: Point[] = [
        ...allHeroes.filter((h) => !h.isDead && h.id !== hero.id).map((h) => ({ x: h.x, y: h.y })),
        ...monsters.filter((m) => !m.isDead && m.revealed).map((m) => ({ x: m.x, y: m.y })),
      ];

      const isDoorGoal = (pt: Point) =>
        closedDoors.some((d) => Math.abs(d.x - pt.x) + Math.abs(d.y - pt.y) <= 1);

      const doorPath = findBFSPath({ x: hero.x, y: hero.y }, isDoorGoal, quest, otherOccupants);
      if (doorPath.length > 0) {
        const nextDoorStep = doorPath[0];
        const matchingCandidate = candidates.find(
          (c) => c.x === nextDoorStep.x && c.y === nextDoorStep.y
        );
        if (matchingCandidate) return { x: matchingCandidate.x, y: matchingCandidate.y };
      }

      candidates.sort((a, b) => {
        const minA = Math.min(...closedDoors.map((d) => Math.abs(d.x - a.x) + Math.abs(d.y - a.y)));
        const minB = Math.min(...closedDoors.map((d) => Math.abs(d.x - b.x) + Math.abs(d.y - b.y)));
        return minA - minB;
      });
      return { x: candidates[0].x, y: candidates[0].y };
    }
  }

  // Goal 3: Follow party leader or human player
  const leader = allHeroes.find((h) => !h.isDead && !h.isAI) || allHeroes[0];
  if (leader && leader.id !== hero.id) {
    const otherOccupants: Point[] = [
      ...allHeroes.filter((h) => !h.isDead && h.id !== hero.id).map((h) => ({ x: h.x, y: h.y })),
      ...monsters.filter((m) => !m.isDead && m.revealed).map((m) => ({ x: m.x, y: m.y })),
    ];

    const isLeaderGoal = (pt: Point) => Math.abs(leader.x - pt.x) + Math.abs(leader.y - pt.y) <= 2;

    const leaderPath = findBFSPath({ x: hero.x, y: hero.y }, isLeaderGoal, quest, otherOccupants);
    if (leaderPath.length > 0) {
      const nextLeaderStep = leaderPath[0];
      const matchingCandidate = candidates.find(
        (c) => c.x === nextLeaderStep.x && c.y === nextLeaderStep.y
      );
      if (matchingCandidate) return { x: matchingCandidate.x, y: matchingCandidate.y };
    }

    candidates.sort((a, b) => {
      const distA = Math.abs(leader.x - a.x) + Math.abs(leader.y - a.y);
      const distB = Math.abs(leader.x - b.x) + Math.abs(leader.y - b.y);
      return distA - distB;
    });
    return { x: candidates[0].x, y: candidates[0].y };
  }

  return { x: candidates[0].x, y: candidates[0].y };
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

  // Occupants: other living monsters AND living heroes (neither can be passed through or occupied!)
  const otherOccupants: Point[] = [
    ...allMonsters.filter((m) => !m.isDead && m.id !== monster.id).map((m) => ({ x: m.x, y: m.y })),
    ...livingHeroes.filter((h) => !h.isDead).map((h) => ({ x: h.x, y: h.y })),
  ];

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
 * Calculates ONLY immediate step destinations for the active hero based on HeroQuest rules:
 * 1. An adjacent empty walkable tile costs 1 movement.
 * 2. Friendly living heroes can be passed through (traversed) if the hero has sufficient movement,
 *    allowing the hero to land on the immediate empty walkable tile beyond them (costing 2 or more movement points).
 * 3. Heroes CANNOT end their movement on any occupied tile (neither friendly hero nor monster).
 * 4. Monsters CANNOT be passed through or landed on under any circumstances.
 * 5. Closed doors, walls, and furniture block movement completely.
 */
export function getValidHeroMoves(
  activeHero: Hero,
  quest: Quest,
  allHeroes: Hero[],
  movementRemaining: number
): HeroMoveDestination[] {
  if (movementRemaining <= 0 || activeHero.isDead) return [];

  const { mapWidth, mapHeight, rooms, doors, furniture, monsters } = quest;

  const livingAllies = allHeroes.filter((h) => !h.isDead && h.id !== activeHero.id);
  const blockingMonsters = monsters.filter((m) => !m.isDead && m.revealed);

  const dirs = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  const results: HeroMoveDestination[] = [];

  for (const { dx, dy } of dirs) {
    let currX = activeHero.x;
    let currY = activeHero.y;
    let stepsNeeded = 0;
    const alliesPassedInDir: Hero[] = [];

    while (stepsNeeded < movementRemaining) {
      const nextX = currX + dx;
      const nextY = currY + dy;
      stepsNeeded++;

      // 1. Bounds check
      if (nextX < 0 || nextX >= mapWidth || nextY < 0 || nextY >= mapHeight) break;

      // 2. Strict room wall collision
      if (!canCrossBoundary(currX, currY, nextX, nextY, rooms, doors)) break;

      // 3. Closed door check
      if (doors.some((d) => d.x === nextX && d.y === nextY && !d.isOpen)) break;

      // 4. Furniture check
      if (furniture.some((f) => nextX >= f.x && nextX < f.x + f.w && nextY >= f.y && nextY < f.y + f.h)) break;

      // 5. Monster check (Monsters block completely)
      if (blockingMonsters.some((m) => m.x === nextX && m.y === nextY)) break;

      // 6. Unrevealed room check
      const targetRoom = getRoomAtCoord(nextX, nextY, rooms);
      if (targetRoom && !targetRoom.revealed) {
        const hasOpenDoor = doors.some(
          (d) =>
            d.isOpen &&
            ((d.x === nextX && d.y === nextY) ||
              (d.tileA && isSamePoint(d.tileA, { x: nextX, y: nextY })) ||
              (d.tileB && isSamePoint(d.tileB, { x: nextX, y: nextY })))
        );
        if (!hasOpenDoor) break;
      }

      // 7. Check if occupied by a living friendly hero
      const allyAtTile = livingAllies.find((h) => h.x === nextX && h.y === nextY);
      if (allyAtTile) {
        // Cannot stop on ally tile; traverse over ally to next tile in this direction
        alliesPassedInDir.push(allyAtTile);
        currX = nextX;
        currY = nextY;
        continue;
      }

      // Empty walkable tile! This is the immediate step destination in this direction.
      results.push({
        x: nextX,
        y: nextY,
        cost: stepsNeeded,
        alliesPassed: [...alliesPassedInDir],
      });

      // Stop searching in this direction once the immediate empty tile is found
      break;
    }
  }

  return results;
}

