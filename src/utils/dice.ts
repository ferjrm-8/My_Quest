import { CombatDiceRoll } from '../types/heroquest';

export type CombatDieFace = 'skull' | 'white_shield' | 'black_shield';

export function rollCombatDie(): CombatDieFace {
  const rand = Math.floor(Math.random() * 6);
  // Faces 0, 1, 2 = Skull
  // Faces 3, 4 = White Shield
  // Face 5 = Black Shield
  if (rand < 3) return 'skull';
  if (rand < 5) return 'white_shield';
  return 'black_shield';
}

export function rollCombatDice(count: number): CombatDiceRoll {
  const dice: CombatDieFace[] = [];
  let skulls = 0;
  let whiteShields = 0;
  let blackShields = 0;

  for (let i = 0; i < count; i++) {
    const face = rollCombatDie();
    dice.push(face);
    if (face === 'skull') skulls++;
    else if (face === 'white_shield') whiteShields++;
    else if (face === 'black_shield') blackShields++;
  }

  return { skulls, whiteShields, blackShields, dice };
}

export function rollMovementDice(): { die1: number; die2: number; total: number } {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  return { die1, die2, total: die1 + die2 };
}
