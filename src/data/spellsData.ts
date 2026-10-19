import { Spell } from '../types/heroquest';

export const ALL_SPELLS: Record<string, Spell> = {
  // Hechizos de Fuego (Fire Spells)
  fire_of_wrath: {
    id: 'fire_of_wrath',
    name: 'Fuego de la Ira',
    element: 'fire',
    description: 'Invoca llamas furiosas que causan 1 Punto de Daño a cualquier monstruo visible. Puede ser defendido sacando un escudo negro.',
    effectType: 'damage',
    value: 1,
    icon: '🔥',
  },
  ball_of_flame: {
    id: 'ball_of_flame',
    name: 'Balas de Fuego',
    element: 'fire',
    description: 'Lanza 2 esferas de fuego abrasador. Causa 2 Puntos de Daño que la víctima sólo puede defender sacando escudos negros.',
    effectType: 'damage',
    value: 2,
    icon: '☄️',
  },
  courage: {
    id: 'courage',
    name: 'Valor',
    element: 'fire',
    description: 'Insufla coraje sobrehumano en un héroe. Otorga +2 Dados de Ataque adicionales en su siguiente turno.',
    effectType: 'damage',
    value: 2,
    icon: '🦁',
  },

  // Hechizos de Tierra (Earth Spells)
  rock_skin: {
    id: 'rock_skin',
    name: 'Piel de Roca',
    element: 'earth',
    description: 'La piel del héroe se endurece como granito. Otorga +1 Dado de Defensa adicional de forma permanente hasta que reciba una herida.',
    effectType: 'buff_defense',
    value: 1,
    icon: '🪨',
  },
  heal_body: {
    id: 'heal_body',
    name: 'Fuerza Sanadora',
    element: 'earth',
    description: 'La energía telúrica regenera los tejidos. Recupera hasta 4 Puntos de Cuerpo a cualquier héroe visible.',
    effectType: 'heal',
    value: 4,
    icon: '🌿',
  },
  pass_through_rock: {
    id: 'pass_through_rock',
    name: 'Atravesar la Roca',
    element: 'earth',
    description: 'Permite al héroe atravesar una pared sólida durante su siguiente movimiento de casillas.',
    effectType: 'pass_rock',
    value: 1,
    icon: '🚪',
  },

  // Hechizos de Agua (Water Spells)
  water_of_healing: {
    id: 'water_of_healing',
    name: 'Agua Curativa',
    element: 'water',
    description: 'Aguas sagradas de manantial restauran hasta 4 Puntos de Cuerpo de un héroe.',
    effectType: 'heal',
    value: 4,
    icon: '💧',
  },
  sleep: {
    id: 'sleep',
    name: 'Sueño Mágico',
    element: 'water',
    description: 'Sume a un monstruo en un letargo profundo. No puede moverse ni defenderse en su siguiente turno.',
    effectType: 'sleep',
    value: 1,
    icon: '💤',
  },
  veil_of_mist: {
    id: 'veil_of_mist',
    name: 'Velo de Niebla',
    element: 'water',
    description: 'Envuelve al héroe en una bruma etérea, permitiéndole atravesar casillas ocupadas por monstruos sin ser atacado.',
    effectType: 'buff_defense',
    value: 1,
    icon: '🌫️',
  },

  // Hechizos de Aire (Air Spells)
  tempest: {
    id: 'tempest',
    name: 'Tempestad',
    element: 'air',
    description: 'Un torbellino furioso aturde a un monstruo, impidiéndole realizar acciones durante su turno.',
    effectType: 'tempest',
    value: 1,
    icon: '🌪️',
  },
  swift_wind: {
    id: 'swift_wind',
    name: 'Viento Veloz',
    element: 'air',
    description: 'Los vientos bendicen los pasos del héroe: duplica la tirada de movimiento en este turno.',
    effectType: 'buff_defense',
    value: 6,
    icon: '💨',
  },
  genie: {
    id: 'genie',
    name: 'El Genio',
    element: 'air',
    description: 'Invoca un poderoso genio celestial que ataca a cualquier monstruo visible con 5 Dados de Combate.',
    effectType: 'genie',
    value: 5,
    icon: '🧞',
  },
};
