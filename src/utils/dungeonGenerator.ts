import { Quest, RoomDef, Door, Furniture, Trap, Monster, HeroClass, Equipment, SecretDoor } from '../types/heroquest';
import { createMonster } from '../data/monstersData';

interface GenerateOptions {
  floorLevel?: number;
  dungeonSize?: 'standard' | 'epic';
}

const THEMATIC_ROOM_NAMES = [
  'Cripta de las Ánimas Perdidas',
  'Puesto de Guardia Orco',
  'Armería Imperial Profanada',
  'Laboratorio de Alquimia Oscura',
  'Cámara del Foso de Sangre',
  'Capilla del Caos Primordial',
  'Celdas de los Prisioneros de Morcar',
  'Gran Salón de los Pilares Negros',
  'Bóveda de los Tesoros Malditos',
  'Túmulo de los Reyes Ancestrales',
  'Guarida del Chamán Goblin',
  'Forja de los Enanos Renegados',
  'Santuario de las Gárgolas Pétreas',
  'Refugio de los Asesinos Silenciosos',
  'Galería de los Estandartes Rasgados',
  'Biblioteca Arcana Prohibida',
  'Foso de los Sacrificios Arcanos',
  'Cámara de Tortura Imperial',
  'Sepulcro de los Caballeros Olvidados',
  'Vestíbulo de las Sombras Eternas',
];

const SUPREME_BOSS_TEMPLATES = [
  { name: 'Gárgola de Obsidiana Verag', type: 'gargoyle' as const, bonusHp: 4, attackBonus: 1, title: 'Señor Pétreo del Caos' },
  { name: 'Kromgar el Destructor Orco', type: 'orc' as const, bonusHp: 5, attackBonus: 1, title: 'Caudillo de la Horda de Sangre' },
  { name: 'Malakor el Ungido del Caos', type: 'chaos_warrior' as const, bonusHp: 5, attackBonus: 1, title: 'Campeón Negro de Morcar' },
  { name: 'Karnath el Fimir Primigenio', type: 'fimir' as const, bonusHp: 4, attackBonus: 1, title: 'Monstruo de las Profundidades' },
  { name: 'Faraón Maldito Tut-Amon', type: 'mummy' as const, bonusHp: 5, attackBonus: 1, title: 'Señor de las Criptas Eternas' },
  { name: 'Gorgoroth el Señor de la Guerra', type: 'chaos_warrior' as const, bonusHp: 6, attackBonus: 2, title: 'Comandante Supremo de las Tinieblas' },
];

/**
 * Procedural Dungeon Generator
 * Generates an expansive, completely unique dungeon layout for a ~30 minute session.
 * Features 14-18 rooms, winding corridors, 24-32 monsters, supreme boss,
 * traps, secret doors, and rich loot.
 */
export function generateProceduralQuest(options: GenerateOptions = {}): Quest {
  const floor = options.floorLevel || 1;
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Dungeon board dimensions for a substantial tactical crawler session
  const mapWidth = 28;
  const mapHeight = 22;
  const targetRoomCount = randInt(13, 16);

  const rooms: RoomDef[] = [];
  const doors: Door[] = [];
  const secretDoors: SecretDoor[] = [];
  const furniture: Furniture[] = [];
  const traps: Trap[] = [];
  const monsters: Monster[] = [];

  // Shuffle room themes
  const shuffledNames = [...THEMATIC_ROOM_NAMES].sort(() => Math.random() - 0.5);

  // 1. Generate Non-Overlapping Rooms with at least 1 corridor tile gap
  let attempts = 0;
  while (rooms.length < targetRoomCount && attempts < 500) {
    attempts++;
    const w = randInt(4, 7);
    const h = randInt(4, 6);
    const x = randInt(1, mapWidth - w - 2);
    const y = randInt(1, mapHeight - h - 2);

    // Ensure 1-tile gap between all rooms so corridors can run between them
    const overlaps = rooms.some(
      (r) => !(x + w + 1 <= r.x || x >= r.x + r.w + 1 || y + h + 1 <= r.y || y >= r.y + r.h + 1)
    );

    if (!overlaps) {
      const roomIndex = rooms.length;
      const isStart = roomIndex === 0;
      const roomName = isStart
        ? 'Cámara del Descenso (Entrada)'
        : shuffledNames[roomIndex % shuffledNames.length];

      rooms.push({
        id: `room_${roomIndex}`,
        name: roomName,
        x,
        y,
        w,
        h,
        revealed: isStart,
        treasureSearched: false,
        trapsSearched: false,
      });
    }
  }

  // Identify Start Room (Room 0) and Boss Sanctuary (farthest room from Start)
  const startRoom = rooms[0];
  let bossRoom = rooms[rooms.length - 1];
  let maxDist = 0;

  rooms.forEach((r, idx) => {
    if (idx === 0) return;
    const dist = Math.hypot(r.x - startRoom.x, r.y - startRoom.y);
    if (dist > maxDist) {
      maxDist = dist;
      bossRoom = r;
    }
  });

  const bossIndex = (floor - 1 + randInt(0, SUPREME_BOSS_TEMPLATES.length - 1)) % SUPREME_BOSS_TEMPLATES.length;
  const bossTemplate = SUPREME_BOSS_TEMPLATES[bossIndex];
  bossRoom.name = `Santuario del Caos: Trono de ${bossTemplate.name}`;

  // 2. Start Positions inside Start Room
  const startPositions = [
    { x: startRoom.x + 1, y: startRoom.y + 1 },
    { x: startRoom.x + 2, y: startRoom.y + 1 },
    { x: startRoom.x + 1, y: startRoom.y + 2 },
    { x: startRoom.x + 2, y: startRoom.y + 2 },
  ];

  // Exit Stairs placed in start room (classic HeroQuest: heroes enter through stairs and must return to escape)
  // or at the end of the dungeon. Placing the stairs in startRoom ensures the team must purge the dungeon
  // and make a triumphant return with their loot!
  const exitPosition = {
    x: startRoom.x + 1,
    y: startRoom.y + 1,
  };

  // 3. Create Doors for each room leading into corridors or adjacent chambers
  let doorIdCounter = 1;
  rooms.forEach((r, idx) => {
    // Determine wall sides for doors
    const possibleDoors: {
      orientation: 'horizontal' | 'vertical';
      tileA: { x: number; y: number };
      tileB: { x: number; y: number };
      doorX: number;
      doorY: number;
    }[] = [];

    // South wall door
    const midX = r.x + Math.floor(r.w / 2);
    if (r.y + r.h < mapHeight) {
      possibleDoors.push({
        orientation: 'horizontal',
        tileA: { x: midX, y: r.y + r.h - 1 },
        tileB: { x: midX, y: r.y + r.h },
        doorX: midX,
        doorY: r.y + r.h,
      });
    }

    // North wall door
    if (r.y - 1 >= 0) {
      possibleDoors.push({
        orientation: 'horizontal',
        tileA: { x: midX, y: r.y },
        tileB: { x: midX, y: r.y - 1 },
        doorX: midX,
        doorY: r.y,
      });
    }

    // East wall door
    const midY = r.y + Math.floor(r.h / 2);
    if (r.x + r.w < mapWidth) {
      possibleDoors.push({
        orientation: 'vertical',
        tileA: { x: r.x + r.w - 1, y: midY },
        tileB: { x: r.x + r.w, y: midY },
        doorX: r.x + r.w,
        doorY: midY,
      });
    }

    // West wall door
    if (r.x - 1 >= 0) {
      possibleDoors.push({
        orientation: 'vertical',
        tileA: { x: r.x, y: midY },
        tileB: { x: r.x - 1, y: midY },
        doorX: r.x,
        doorY: midY,
      });
    }

    // Filter doors whose tileB is not inside another room (opens into corridor)
    const validDoors = possibleDoors.filter(
      (pd) => !rooms.some((other) => pd.tileB.x >= other.x && pd.tileB.x < other.x + other.w && pd.tileB.y >= other.y && pd.tileB.y < other.y + other.h)
    );

    const chosen = validDoors.length > 0 ? validDoors : possibleDoors;
    if (chosen.length > 0) {
      const primaryDoor = chosen[0];
      doors.push({
        id: `door_${doorIdCounter++}`,
        x: primaryDoor.doorX,
        y: primaryDoor.doorY,
        orientation: primaryDoor.orientation,
        isOpen: false,
        connectsRooms: [r.id, 'corridor'],
        tileA: primaryDoor.tileA,
        tileB: primaryDoor.tileB,
      });

      // Extra secondary door for larger rooms (>= 6 width or >= 5 height) for multiple tactical routes
      if ((r.w >= 6 || r.h >= 5) && chosen.length > 1 && idx !== 0) {
        const secondaryDoor = chosen[1];
        doors.push({
          id: `door_${doorIdCounter++}`,
          x: secondaryDoor.doorX,
          y: secondaryDoor.doorY,
          orientation: secondaryDoor.orientation,
          isOpen: false,
          connectsRooms: [r.id, 'corridor'],
          tileA: secondaryDoor.tileA,
          tileB: secondaryDoor.tileB,
        });
      }
    }
  });

  // Secret Door in one of the middle rooms hiding a treasure chamber
  if (rooms.length > 5) {
    const secretRoom = rooms[3];
    secretDoors.push({
      id: 'sd_secret_1',
      x: secretRoom.x,
      y: secretRoom.y + 1,
      orientation: 'vertical',
      revealed: false,
      isOpen: false,
    });
  }

  // 4. Place Interactive Furniture & Varied Loot across rooms
  rooms.forEach((r, idx) => {
    if (idx === 0) {
      // Start room: weapon rack with basic supplies
      furniture.push({
        id: `furn_start_${idx}`,
        type: 'weapons_rack',
        name: 'Armero de Entrada',
        x: r.x + r.w - 2,
        y: r.y + 1,
        w: 1,
        h: 1,
        searched: false,
        goldLoot: 25,
      });
      return;
    }

    if (r.id === bossRoom.id) {
      // Boss Sanctuary: Throne + Grand Chest with epic loot
      furniture.push({
        id: `furn_throne_${idx}`,
        type: 'throne',
        name: `Trono de ${bossTemplate.name}`,
        x: r.x + 1,
        y: r.y + 1,
        w: 1,
        h: 1,
        searched: false,
      });
      furniture.push({
        id: `furn_boss_chest_${idx}`,
        type: 'chest',
        name: 'Cofre del Tesoro Arcano',
        x: r.x + r.w - 2,
        y: r.y + r.h - 2,
        w: 1,
        h: 1,
        searched: false,
        goldLoot: randInt(120, 200),
        itemLoot: {
          id: `potion_heal_${Date.now()}`,
          name: 'Elixir de Curación Imperial',
          type: 'potion',
          description: 'Restaura 4 Puntos de Cuerpo de inmediato.',
          cost: 150,
          usableBy: ['barbarian', 'dwarf', 'elf', 'wizard'] as HeroClass[],
          icon: '🍷',
          consumable: true,
          effect: 'heal_4',
        },
      });
      return;
    }

    // Varied furniture in other rooms
    const furnRoll = randInt(1, 5);
    if (furnRoll === 1) {
      furniture.push({
        id: `furn_chest_${idx}`,
        type: 'chest',
        name: 'Cofre de Hierro Forjado',
        x: r.x + 1,
        y: r.y + 1,
        w: 1,
        h: 1,
        searched: false,
        goldLoot: randInt(35, 75),
        itemLoot: Math.random() < 0.4 ? {
          id: `potion_heal_room_${idx}`,
          name: 'Poción de Curación',
          type: 'potion',
          description: 'Restaura 4 Puntos de Cuerpo.',
          cost: 100,
          usableBy: ['barbarian', 'dwarf', 'elf', 'wizard'] as HeroClass[],
          icon: '🍷',
          consumable: true,
          effect: 'heal_4',
        } : undefined,
      });
    } else if (furnRoll === 2) {
      furniture.push({
        id: `furn_tomb_${idx}`,
        type: 'tomb',
        name: 'Sarcófago de Piedra Rúnica',
        x: r.x + 1,
        y: r.y + 1,
        w: 1,
        h: 2,
        searched: false,
        goldLoot: randInt(40, 90),
      });
    } else if (furnRoll === 3) {
      furniture.push({
        id: `furn_table_${idx}`,
        type: 'table',
        name: 'Mesa de Alquimia Oscura',
        x: r.x + 1,
        y: r.y + 1,
        w: 2,
        h: 1,
        searched: false,
        goldLoot: randInt(25, 50),
      });
    } else if (furnRoll === 4) {
      furniture.push({
        id: `furn_rack_${idx}`,
        type: 'weapons_rack',
        name: 'Armero de Campaña',
        x: r.x + r.w - 2,
        y: r.y + 1,
        w: 1,
        h: 1,
        searched: false,
        goldLoot: randInt(20, 45),
      });
    }
  });

  // 5. Place Traps (Pits, Falling Rocks, Spears) in rooms & corridors
  const trapCount = randInt(7, 11);
  for (let t = 0; t < trapCount; t++) {
    const targetRoom = rooms[randInt(1, rooms.length - 1)];
    const tx = randInt(targetRoom.x, targetRoom.x + targetRoom.w - 1);
    const ty = randInt(targetRoom.y, targetRoom.y + targetRoom.h - 1);

    const hitFurniture = furniture.some((f) => tx >= f.x && tx < f.x + f.w && ty >= f.y && ty < f.y + f.h);
    const isExitTile = tx === exitPosition.x && ty === exitPosition.y;

    if (!hitFurniture && !isExitTile) {
      const trapTypes: ('pit' | 'spear' | 'falling_rock')[] = ['pit', 'spear', 'falling_rock'];
      traps.push({
        id: `trap_${t}`,
        x: tx,
        y: ty,
        type: trapTypes[t % trapTypes.length],
        detected: false,
        sprung: false,
        damage: randInt(1, 2),
      });
    }
  }

  // 6. Spawn Monsters: 24 to 32 monsters total for deep ~30 min tactical crawl
  // Spawn the Supreme Boss in the deepest chamber
  monsters.push(
    createMonster(bossTemplate.type, bossRoom.x + bossRoom.w - 2, bossRoom.y + 2, {
      customName: bossTemplate.name,
      bonusHp: bossTemplate.bonusHp + (floor > 1 ? floor : 0),
      roomId: bossRoom.id,
      isBoss: true,
    })
  );

  // Supreme Boss Bodyguards
  monsters.push(
    createMonster('chaos_warrior', bossRoom.x + 2, bossRoom.y + 1, {
      roomId: bossRoom.id,
    })
  );
  monsters.push(
    createMonster('fimir', bossRoom.x + 2, bossRoom.y + bossRoom.h - 2, {
      roomId: bossRoom.id,
    })
  );

  // Spawn monsters in remaining rooms (1-3 monsters per room)
  rooms.forEach((r, idx) => {
    if (idx === 0 || r.id === bossRoom.id) return;

    const monsterCount = randInt(1, 3);
    for (let m = 0; m < monsterCount; m++) {
      const mx = r.x + 1 + (m % (r.w - 2));
      const my = r.y + 1 + Math.floor(m / (r.w - 2));

      const hitFurn = furniture.some((f) => mx >= f.x && mx < f.x + f.w && my >= f.y && my < f.y + f.h);
      if (hitFurn) continue;

      const roll = Math.random();
      let mType: 'goblin' | 'orc' | 'skeleton' | 'zombie' | 'fimir' | 'mummy' | 'chaos_warrior' = 'goblin';

      if (roll < 0.25) mType = 'goblin';
      else if (roll < 0.50) mType = 'orc';
      else if (roll < 0.65) mType = 'skeleton';
      else if (roll < 0.78) mType = 'zombie';
      else if (roll < 0.88) mType = 'fimir';
      else if (roll < 0.95) mType = 'mummy';
      else mType = 'chaos_warrior';

      monsters.push(
        createMonster(mType, mx, my, {
          roomId: r.id,
        })
      );
    }
  });

  // Add 4-6 Roaming Patrol Monsters in the Corridors (classic wandering monsters)
  for (let p = 0; p < randInt(4, 6); p++) {
    const rx = randInt(2, mapWidth - 3);
    const ry = randInt(2, mapHeight - 3);
    // Ensure in corridor (outside of any room)
    const inRoom = rooms.some((r) => rx >= r.x && rx < r.x + r.w && ry >= r.y && ry < r.y + r.h);
    if (!inRoom) {
      const patrolType = Math.random() < 0.5 ? 'goblin' : 'orc';
      monsters.push(
        createMonster(patrolType, rx, ry, {
          roomId: 'corridor',
        })
      );
    }
  }

  const uniqueId = `procedural_${Date.now()}_${randInt(1000, 9999)}`;

  return {
    id: uniqueId,
    number: floor,
    title: `Mazmorra Aleatoria: Las Catacumbas de ${bossTemplate.name}`,
    subtitle: `Partida Táctica Épica (~30 Min) • ${rooms.length} Salas • ${monsters.length} Monstruos`,
    intro: `«Los arcanos de Loretome revelan una catacumba cambiante en las entrañas de la tierra», advierte Mentor. «En esta expedición, el laberinto de salas, trampas y criaturas es completamente nuevo y desconocido. Deberéis purgar a todas las criaturas del Caos y derrotar al temible ${bossTemplate.name} antes de poder regresar a la superficie por las escaleras de salida.»`,
    objective: `1) Derrotar a ${bossTemplate.name}. 2) Purgar el escenario de todos los monstruos. 3) Escapar por la escalera.`,
    rewardGold: 150 + floor * 50,
    rewardSkillPoints: 3 + Math.floor(floor / 2),
    mapWidth,
    mapHeight,
    startPositions,
    exitPosition,
    rooms,
    doors,
    secretDoors,
    traps,
    furniture,
    monsters,
  };
}
