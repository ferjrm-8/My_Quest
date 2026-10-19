export type HeroClass = 'barbarian' | 'dwarf' | 'elf' | 'wizard';

export type MonsterType =
  | 'goblin'
  | 'orc'
  | 'fimir'
  | 'skeleton'
  | 'zombie'
  | 'mummy'
  | 'chaos_warrior'
  | 'gargoyle';

export interface CombatDiceRoll {
  skulls: number;
  whiteShields: number;
  blackShields: number;
  dice: ('skull' | 'white_shield' | 'black_shield')[];
}

export interface Spell {
  id: string;
  name: string;
  element: 'fire' | 'earth' | 'water' | 'air';
  description: string;
  effectType: 'heal' | 'damage' | 'buff_defense' | 'sleep' | 'tempest' | 'pass_rock' | 'genie';
  value: number;
  icon: string;
  isUsed?: boolean;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  costGold: number;
  costSkillPoints: number;
  category: 'combat' | 'defense' | 'magic' | 'utility';
  tier: 1 | 2 | 3;
  icon: string;
  passiveBonus?: {
    attackDice?: number;
    defendDice?: number;
    maxBodyPoints?: number;
    maxMindPoints?: number;
    moveBonus?: number;
    goldBonusPct?: number;
  };
  activeEffect?: string;
  unlocked: boolean;
  reqSkillId?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'shield' | 'potion' | 'accessory';
  description: string;
  cost: number;
  attackDice?: number;
  defendDiceBonus?: number;
  usableBy: HeroClass[];
  icon: string;
  twoHanded?: boolean;
  diagonalAttack?: boolean;
  rangedAttack?: boolean;
  consumable?: boolean;
  effect?: 'heal_4' | 'strength_buff' | 'trap_tool' | 'defense_potion';
}

export interface Hero {
  id: string;
  heroClass: HeroClass;
  name: string;
  title: string;
  bodyPoints: number;
  maxBodyPoints: number;
  mindPoints: number;
  maxMindPoints: number;
  attackDice: number;
  defendDice: number;
  gold: number;
  skillPoints: number;
  inventory: Equipment[];
  spells: Spell[];
  skills: SkillNode[];
  activePerks: string[];
  x: number;
  y: number;
  isDead: boolean;
  isAI: boolean;
  playerIndex: number; // 0..3 (player 1, player 2, etc.)
  color: string;
  portrait: string;
  lore: string;
}

export interface Monster {
  id: string;
  type: MonsterType;
  name: string;
  bodyPoints: number;
  maxBodyPoints: number;
  mindPoints: number;
  attackDice: number;
  defendDice: number;
  moveSpaces: number;
  x: number;
  y: number;
  roomId?: string;
  revealed: boolean;
  isDead: boolean;
  bountyGold: number;
  bountyExp: number;
  icon: string;
  color: string;
  isBoss?: boolean;
}

export type TileType = 'floor' | 'wall' | 'corridor' | 'empty';

export interface Furniture {
  id: string;
  type: 'chest' | 'table' | 'tomb' | 'throne' | 'weapons_rack' | 'bookshelf';
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  searched: boolean;
  trapped?: boolean;
  goldLoot?: number;
  itemLoot?: Equipment;
}

export interface Door {
  id: string;
  x: number;
  y: number;
  orientation: 'horizontal' | 'vertical';
  isOpen: boolean;
  connectsRooms: [string, string]; // room IDs or corridor
  tileA: { x: number; y: number };
  tileB: { x: number; y: number };
}

export interface Trap {
  id: string;
  x: number;
  y: number;
  type: 'pit' | 'spear' | 'falling_rock';
  detected: boolean;
  sprung: boolean;
  damage: number;
}

export interface SecretDoor {
  id: string;
  x: number;
  y: number;
  orientation: 'horizontal' | 'vertical';
  revealed: boolean;
  isOpen: boolean;
}

export interface RoomDef {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  revealed: boolean;
  treasureSearched: boolean;
  trapsSearched: boolean;
}

export interface Quest {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  intro: string;
  objective: string;
  rewardGold: number;
  rewardSkillPoints: number;
  mapWidth: number;
  mapHeight: number;
  startPositions: { x: number; y: number }[];
  exitPosition: { x: number; y: number };
  rooms: RoomDef[];
  doors: Door[];
  secretDoors: SecretDoor[];
  traps: Trap[];
  furniture: Furniture[];
  monsters: Monster[];
}

export type GamePhase =
  | 'title'
  | 'character_select'
  | 'lore'
  | 'rules'
  | 'quest_intro'
  | 'hero_turn'
  | 'rolling_move'
  | 'action_select'
  | 'combat'
  | 'spell_cast'
  | 'morcar_turn'
  | 'quest_complete'
  | 'game_over';

export interface CombatState {
  attackerName: string;
  attackerType: 'hero' | 'monster';
  attackerAttackDice: number;
  defenderName: string;
  defenderType: 'hero' | 'monster';
  defenderDefendDice: number;
  defenderBodyPoints: number;
  attackerRoll?: CombatDiceRoll;
  defenderRoll?: CombatDiceRoll;
  damageDealt?: number;
  resolved: boolean;
  targetId: string;
  isBoss?: boolean;
}

export interface GameLog {
  id: string;
  text: string;
  type: 'info' | 'combat' | 'spell' | 'loot' | 'trap' | 'danger' | 'turn';
  timestamp: string;
}
