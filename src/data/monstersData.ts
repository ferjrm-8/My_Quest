import { Monster, MonsterType } from '../types/heroquest';

export interface MonsterTemplate {
  type: MonsterType;
  name: string;
  bodyPoints: number;
  mindPoints: number;
  attackDice: number;
  defendDice: number;
  moveSpaces: number;
  bountyGold: number;
  bountyExp: number;
  icon: string;
  color: string;
  description: string;
}

export const MONSTER_TEMPLATES: Record<MonsterType, MonsterTemplate> = {
  goblin: {
    type: 'goblin',
    name: 'Goblin',
    bodyPoints: 1,
    mindPoints: 1,
    attackDice: 2,
    defendDice: 1,
    moveSpaces: 10,
    bountyGold: 15,
    bountyExp: 1,
    icon: '👺',
    color: '#84cc16',
    description: 'Criatura rápida y cobarde que ataca en manadas empuñando lanzas curvas o espadas melladas.',
  },
  orc: {
    type: 'orc',
    name: 'Orco',
    bodyPoints: 1,
    mindPoints: 2,
    attackDice: 3,
    defendDice: 2,
    moveSpaces: 8,
    bountyGold: 25,
    bountyExp: 1,
    icon: '👹',
    color: '#15803d',
    description: 'Guerrero brutal y sediento de sangre con cimitarras oxidadas y una agresividad implacable.',
  },
  fimir: {
    type: 'fimir',
    name: 'Fimir',
    bodyPoints: 2,
    mindPoints: 3,
    attackDice: 3,
    defendDice: 3,
    moveSpaces: 6,
    bountyGold: 45,
    bountyExp: 2,
    icon: '🦎',
    color: '#0d9488',
    description: 'Abominación anfibia de las ciénagas dotada de una cola con púas y fuerza sobrenatural.',
  },
  skeleton: {
    type: 'skeleton',
    name: 'Esqueleto',
    bodyPoints: 1,
    mindPoints: 0,
    attackDice: 2,
    defendDice: 2,
    moveSpaces: 6,
    bountyGold: 20,
    bountyExp: 1,
    icon: '💀',
    color: '#e2e8f0',
    description: 'Restos óseos reanimados por la nigromancia de Morcar empuñando una espada quebrada.',
  },
  zombie: {
    type: 'zombie',
    name: 'Zombi',
    bodyPoints: 1,
    mindPoints: 0,
    attackDice: 2,
    defendDice: 3,
    moveSpaces: 4,
    bountyGold: 20,
    bountyExp: 1,
    icon: '🧟',
    color: '#64748b',
    description: 'Cadáver putrefacto y lento que no siente dolor. Requiere golpes certeros para ser destruido.',
  },
  mummy: {
    type: 'mummy',
    name: 'Momia',
    bodyPoints: 2,
    mindPoints: 0,
    attackDice: 3,
    defendDice: 4,
    moveSpaces: 4,
    bountyGold: 50,
    bountyExp: 2,
    icon: '🩹',
    color: '#d97706',
    description: 'Antiguo faraón maldito vendado. Extremadamente resistente a las armas gracias a sus 4 dados de defensa.',
  },
  chaos_warrior: {
    type: 'chaos_warrior',
    name: 'Guerrero del Caos',
    bodyPoints: 3,
    mindPoints: 3,
    attackDice: 4,
    defendDice: 4,
    moveSpaces: 6,
    bountyGold: 85,
    bountyExp: 3,
    icon: '🦹',
    color: '#475569',
    description: 'Campeón corrompido blindado con armadura pesada y una espada maldita de 4 dados de impacto.',
  },
  gargoyle: {
    type: 'gargoyle',
    name: 'Gárgola / Verag',
    bodyPoints: 3,
    mindPoints: 4,
    attackDice: 4,
    defendDice: 4,
    moveSpaces: 6,
    bountyGold: 130,
    bountyExp: 4,
    icon: '🗿',
    color: '#71717a',
    description: 'Estatua monstruosa de piedra petrificada animada por pura magia maligna. El terror de las catacumbas.',
  },
};

let monsterCount = 0;
export function createMonster(
  type: MonsterType,
  x: number,
  y: number,
  options?: { customName?: string; bonusHp?: number; roomId?: string; isBoss?: boolean }
): Monster {
  const template = MONSTER_TEMPLATES[type];
  monsterCount++;
  const maxHp = template.bodyPoints + (options?.bonusHp || 0);
  const isBoss = options?.isBoss ?? (type === 'gargoyle');

  return {
    id: `m_${type}_${monsterCount}_${Date.now()}`,
    type,
    name: options?.customName || template.name,
    bodyPoints: maxHp,
    maxBodyPoints: maxHp,
    mindPoints: template.mindPoints,
    attackDice: template.attackDice,
    defendDice: template.defendDice,
    moveSpaces: template.moveSpaces,
    x,
    y,
    roomId: options?.roomId,
    revealed: false,
    isDead: false,
    bountyGold: isBoss ? template.bountyGold * 2 : template.bountyGold,
    bountyExp: isBoss ? template.bountyExp + 2 : template.bountyExp,
    icon: template.icon,
    color: template.color,
    isBoss,
  };
}
