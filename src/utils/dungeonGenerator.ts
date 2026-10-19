import { Quest, RoomDef, Door, Furniture, Trap, Monster, HeroClass, Equipment } from '../types/heroquest';
import { createMonster } from '../data/monstersData';

interface GenerateOptions {
  floorLevel?: number;
  size?: 'standard' | 'epic';
}

const ROOM_NAMES = [
  'Cripta de los Condenados',
  'Puesto de Guardia Orco',
  'Armería de los Caídos',
  'Laboratorio de Nigromancia',
  'Cámara del Foso de Sangre',
  'Capilla Profanada',
  'Celdas de los Prisioneros',
  'Gran Salón de los Pilares',
  'Cámara de los Tesoros Ocultos',
  'Túmulo de los Reyes Caídos',
  'Guarida del Chamán Goblin',
  'Refugio de las Sombras',
  'Altar del Caos Primordial',
];

const BOSS_NAMES = [
  { name: 'Gárgola de Obsidiana', type: 'gargoyle' as const, bonusHp: 2 },
  { name: 'Kromgar el Señor Orco', type: 'orc' as const, bonusHp: 3 },
  { name: 'Malakar el Ungido del Caos', type: 'chaos_warrior' as const, bonusHp: 3 },
  { name: 'Karnath el Fimir Ancestral', type: 'fimir' as const, bonusHp: 3 },
  { name: 'Faraón Maldito Amenhotep', type: 'mummy' as const, bonusHp: 3 },
  { name: 'Verag el Destructor', type: 'gargoyle' as const, bonusHp: 4 },
];

export function generateProceduralQuest(options: GenerateOptions = {}): Quest {
  const floor = options.floorLevel || 1;
  const isEpic = options.size === 'epic' || floor >= 2;

  const mapWidth = isEpic ? 24 : 18;
  const mapHeight = isEpic ? 18 : 15;
  const targetRoomCount = isEpic ? 10 : 7;

  const rooms: RoomDef[] = [];
  const doors: Door[] = [];
  const furniture: Furniture[] = [];
  const traps: Trap[] = [];
  const monsters: Monster[] = [];

  // Helper random int
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  // 1. Generate non-overlapping rooms
  let attempts = 0;
  while (rooms.length < targetRoomCount && attempts < 250) {
    attempts++;
    const w = randInt(4, 6);
    const h = randInt(4, 5);
    const x = randInt(1, mapWidth - w - 1);
    const y = randInt(1, mapHeight - h - 1);

    // Ensure 1-tile gap between all rooms so corridors can run between them
    const overlaps = rooms.some(
      (r) => !(x + w + 1 <= r.x || x >= r.x + r.w + 1 || y + h + 1 <= r.y || y >= r.y + r.h + 1)
    );

    if (!overlaps) {
      const roomIndex = rooms.length;
      const isStart = roomIndex === 0;
      const roomName = isStart
        ? 'Cámara del Descenso (Entrada)'
        : ROOM_NAMES[roomIndex % ROOM_NAMES.length];

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

  // Identify Start Room (index 0) and Boss Room (farthest from start room)
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

  bossRoom.name = `Santuario del Jefe: ${BOSS_NAMES[(floor - 1) % BOSS_NAMES.length].name}`;

  // 2. Start Positions inside Start Room
  const startPositions = [
    { x: startRoom.x + 1, y: startRoom.y + 1 },
    { x: startRoom.x + 2, y: startRoom.y + 1 },
    { x: startRoom.x + 1, y: startRoom.y + 2 },
    { x: startRoom.x + 2, y: startRoom.y + 2 },
  ];

  // Exit ladder inside Boss Room (for descending to next floor or winning)
  const exitPosition = {
    x: bossRoom.x + Math.floor(bossRoom.w / 2),
    y: bossRoom.y + Math.floor(bossRoom.h / 2),
  };

  // 3. Create Doors for each room
  rooms.forEach((r, idx) => {
    // Choose wall for door (e.g. South, North, East, or West)
    // Preference: south or north if space allows
    const doorX = r.x + Math.floor(r.w / 2);
    let doorY = r.y + r.h; // South wall
    let orientation: 'horizontal' | 'vertical' = 'horizontal';
    let tileA = { x: doorX, y: doorY - 1 };
    let tileB = { x: doorX, y: doorY };

    if (doorY >= mapHeight - 1) {
      // Use North wall instead
      doorY = r.y;
      tileA = { x: doorX, y: r.y };
      tileB = { x: doorX, y: r.y - 1 };
    }

    doors.push({
      id: `door_${idx}`,
      x: doorX,
      y: doorY,
      orientation,
      isOpen: false,
      connectsRooms: [r.id, 'corridor'],
      tileA,
      tileB,
    });
  });

  // 4. Place Furniture & Loot
  rooms.forEach((r, idx) => {
    if (idx === 0) {
      // Start room: weapon rack or small chest
      furniture.push({
        id: `furn_start_${idx}`,
        type: 'weapons_rack',
        name: 'Armero de Campaña',
        x: r.x + r.w - 2,
        y: r.y + 1,
        w: 1,
        h: 1,
        searched: false,
        goldLoot: 15 + floor * 5,
      });
      return;
    }

    if (r.id === bossRoom.id) {
      // Boss Room: Throne + Grand Chest
      furniture.push({
        id: `furn_throne_${idx}`,
        type: 'throne',
        name: 'Trono del Señor Oscuro',
        x: r.x + 1,
        y: r.y + 1,
        w: 1,
        h: 1,
        searched: false,
      });
      furniture.push({
        id: `furn_boss_chest_${idx}`,
        type: 'chest',
        name: 'Cofre del Tesoro Real',
        x: r.x + r.w - 2,
        y: r.y + r.h - 2,
        w: 1,
        h: 1,
        searched: false,
        goldLoot: 100 + floor * 40,
        itemLoot: {
          id: `potion_super_${Date.now()}`,
          name: 'Poción de Restauración Total',
          type: 'potion',
          description: 'Cura todos los Puntos de Cuerpo perdidos.',
          cost: 150,
          usableBy: ['barbarian', 'dwarf', 'elf', 'wizard'] as HeroClass[],
          icon: '🍷',
          consumable: true,
          effect: 'heal_4',
        },
      });
      return;
    }

    // Other rooms get random furniture
    const furnChoice = randInt(1, 4);
    if (furnChoice === 1) {
      furniture.push({
        id: `furn_chest_${idx}`,
        type: 'chest',
        name: 'Cofre de Madera Reforzado',
        x: r.x + 1,
        y: r.y + 1,
        w: 1,
        h: 1,
        searched: false,
        goldLoot: randInt(25, 60) + floor * 10,
      });
    } else if (furnChoice === 2) {
      furniture.push({
        id: `furn_tomb_${idx}`,
        type: 'tomb',
        name: 'Sarcófago de Piedra Rúnica',
        x: r.x + 1,
        y: r.y + 1,
        w: 1,
        h: 2,
        searched: false,
        goldLoot: randInt(40, 80) + floor * 10,
      });
    } else if (furnChoice === 3) {
      furniture.push({
        id: `furn_table_${idx}`,
        type: 'table',
        name: 'Mesa de Alquimia',
        x: r.x + 1,
        y: r.y + 1,
        w: 2,
        h: 1,
        searched: false,
        goldLoot: randInt(20, 40),
      });
    } else {
      furniture.push({
        id: `furn_rack_${idx}`,
        type: 'weapons_rack',
        name: 'Armero de Acero',
        x: r.x + r.w - 2,
        y: r.y + 1,
        w: 1,
        h: 1,
        searched: false,
        goldLoot: randInt(20, 50),
      });
    }
  });

  // 5. Place Traps
  const trapCount = isEpic ? randInt(5, 8) : randInt(3, 5);
  for (let t = 0; t < trapCount; t++) {
    const targetRoom = rooms[randInt(1, rooms.length - 1)];
    const tx = randInt(targetRoom.x, targetRoom.x + targetRoom.w - 1);
    const ty = randInt(targetRoom.y, targetRoom.y + targetRoom.h - 1);

    // Make sure not colliding with furniture or exit
    const hasFurn = furniture.some((f) => tx >= f.x && tx < f.x + f.w && ty >= f.y && ty < f.y + f.h);
    const isExitTile = tx === exitPosition.x && ty === exitPosition.y;

    if (!hasFurn && !isExitTile) {
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

  // 6. Spawn Monsters
  const bossTemplate = BOSS_NAMES[(floor - 1) % BOSS_NAMES.length];
  // Boss inside Boss Room
  monsters.push(
    createMonster(bossTemplate.type, bossRoom.x + bossRoom.w - 2, bossRoom.y + 1, {
      customName: bossTemplate.name,
      bonusHp: bossTemplate.bonusHp + (floor > 2 ? floor : 0),
      roomId: bossRoom.id,
      isBoss: true,
    })
  );

  // Minions in Boss Room
  monsters.push(
    createMonster(floor >= 2 ? 'chaos_warrior' : 'orc', bossRoom.x + 2, bossRoom.y + 2, {
      roomId: bossRoom.id,
    })
  );

  // Spawn monsters in other rooms
  rooms.forEach((r, idx) => {
    if (idx === 0 || r.id === bossRoom.id) return;

    // 1-3 monsters per room
    const count = randInt(1, isEpic ? 3 : 2);
    for (let m = 0; m < count; m++) {
      const mx = r.x + 1 + (m % 3);
      const my = r.y + 1 + Math.floor(m / 3);

      const hasFurn = furniture.some((f) => mx >= f.x && mx < f.x + f.w && my >= f.y && my < f.y + f.h);
      if (hasFurn) continue;

      // Pool of monster types scaling with floor level
      let mType: 'goblin' | 'orc' | 'skeleton' | 'zombie' | 'fimir' | 'mummy' | 'chaos_warrior' = 'goblin';
      const roll = Math.random();

      if (floor === 1) {
        if (roll < 0.35) mType = 'goblin';
        else if (roll < 0.65) mType = 'orc';
        else if (roll < 0.85) mType = 'skeleton';
        else mType = 'zombie';
      } else if (floor === 2) {
        if (roll < 0.25) mType = 'orc';
        else if (roll < 0.5) mType = 'fimir';
        else if (roll < 0.75) mType = 'mummy';
        else mType = 'chaos_warrior';
      } else {
        if (roll < 0.3) mType = 'fimir';
        else if (roll < 0.6) mType = 'mummy';
        else mType = 'chaos_warrior';
      }

      monsters.push(
        createMonster(mType, mx, my, {
          roomId: r.id,
        })
      );
    }
  });

  // Corridor roaming monster
  monsters.push(
    createMonster('goblin', startRoom.x + Math.floor(startRoom.w / 2), startRoom.y + startRoom.h + 1, {
      roomId: 'corridor',
    })
  );

  return {
    id: `procedural_floor_${floor}_${Date.now()}`,
    number: floor,
    title: `Nivel ${floor}: Mazmorras de ${bossTemplate.name}`,
    subtitle: isEpic
      ? `Partida Épica Extendida • ${rooms.length} Salas Explorables`
      : `Mazmorra Aleatoria Procedural • Piso ${floor}`,
    intro: `«Los arcanos de Loretome revelan una nueva catacumba nunca antes explorada», advierte Mentor. «En el Nivel ${floor}, el temible ${bossTemplate.name} lidera las huestes del Caos. Explorad cada sala, registrad los cofres y descended a través de las escaleras rúnicas hacia la victoria.»`,
    objective: `Derrota a ${bossTemplate.name} y sus secuaces, registra los cofres y escapa por la trampilla del Piso ${floor}.`,
    rewardGold: 120 + floor * 40,
    rewardSkillPoints: 2 + Math.floor(floor / 2),
    mapWidth,
    mapHeight,
    startPositions,
    exitPosition,
    rooms,
    doors,
    secretDoors: [],
    traps,
    furniture,
    monsters,
  };
}
