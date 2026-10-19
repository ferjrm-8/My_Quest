import { Hero, HeroClass } from '../types/heroquest';
import { ALL_SPELLS } from './spellsData';
import { INITIAL_SKILLS } from './skillsData';

export interface HeroLoreInfo {
  heroClass: HeroClass;
  name: string;
  title: string;
  origin: string;
  weapon: string;
  strengths: string[];
  weaknesses: string[];
  quote: string;
  history: string;
}

export const HEROES_LORE: Record<HeroClass, HeroLoreInfo> = {
  barbarian: {
    heroClass: 'barbarian',
    name: 'Grimjaw',
    title: 'El Bárbaro de las Tierras Fronterizas',
    origin: 'Páramos Gélidos del Norte',
    weapon: 'Espada Ancha de Acero Forjado',
    strengths: ['Mayor resistencia física (8 Puntos de Cuerpo)', '3 Dados de Ataque base con espada', 'Temible en combate cerrado'],
    weaknesses: ['Vulnerable a magia mental (solo 2 Puntos de Mente)', 'Sin acceso a hechizos'],
    quote: '«¡Por la sangre de mis antepasados, ningún siervo del Caos quedará en pie ante mi acero!»',
    history:
      'Nacido en los páramos inhóspitos del norte, Grimjaw fue curtido en las tempestades eternas y en las guerras tribales contra los invasores del Caos. Cuando su aldea fue consumida por las sombras de Morcar, juró viajar al sur al servicio del Emperador y de Mentor. Su formidable espada ancha y sus 8 Puntos de Cuerpo lo convierten en la punta de lanza insustituible de la partida.',
  },
  dwarf: {
    heroClass: 'dwarf',
    name: 'Thorin',
    title: 'El Enano de las Minas de Karak',
    origin: 'Fortaleza Subterránea de Karak-Varn',
    weapon: 'Hacha Corta y Escudo Forjarruna',
    strengths: ['Desactiva trampas sin herramientas', 'Sólida vitalidad (7 Cuerpo, 3 Mente)', 'Maestría en mazmorras y túneles'],
    weaknesses: ['Movimiento regular con armadura pesada', 'Sin acceso a hechizos arcanos'],
    quote: '«Una trampa de foso es solo piedra mal tallada. ¡Abrid paso que la desarmaré en un suspiro!»',
    history:
      'Descendiente del legendario clan de forjadores de Karak, Thorin conoce las entrañas de la tierra como la palma de su mano. Su oído entrenado detecta baldosas falsas y cables trampa antes de que se activen, permitiéndole desarmar trampas de fosos y rocas sin necesidad de herramientas especiales. Su odio eterno hacia los orcos y goblins alimenta cada golpe de su hacha.',
  },
  elf: {
    heroClass: 'elf',
    name: 'Aeloria',
    title: 'El Elfo de los Bosques de Loren',
    origin: 'Reino Silvano de Loren',
    weapon: 'Espada Corta y Conjuros Naturales',
    strengths: ['Equilibrio perfecto (6 Cuerpo, 4 Mente)', 'Capaz de empuñar magia y espada con igual maestría', 'Agilidad legendaria'],
    weaknesses: ['Menor resistencia que el Bárbaro o el Enano'],
    quote: '«La gracia de las hojas y el susurro del agua guiarán mi espada entre la oscuridad de estas criptas.»',
    history:
      'Proveniente de las frondas milenarias de Loren, Aeloria combina la destreza marcial con el conocimiento de los cuatro elementos ancestrales. A diferencia de los humanos, los elfos perciben las corrientes de magia que fluyen entre las paredes de piedra de las mazmorras. En las misiones, elige uno de los cuatro grupos elementales de hechizos, complementando al grupo con sanación o daño elemental.',
  },
  wizard: {
    heroClass: 'wizard',
    name: 'Vaelin',
    title: 'El Mago, Erudito de Mentor',
    origin: 'Torre de la Sabiduría de Altdorf',
    weapon: 'Daga Ceremonial y Grimorio Arcano',
    strengths: ['Dominio supremo de 3 grupos de hechizos (9 conjuros)', 'Máxima resistencia mental (6 Puntos de Mente)', 'Versatilidad táctica total'],
    weaknesses: ['Frágil cuerpo a cuerpo (solo 4 Puntos de Cuerpo y 1 Dado de Ataque)'],
    quote: '«La fuerza bruta es ciega; la magia elemental de Loretome doblega incluso al más colosal guerrero del Caos.»',
    history:
      'El alumno más aventajado del sabio Mentor. Vaelin ha dedicado su juventud a estudiar el Gran Libro de Loretome en la biblioteca imperial. Aunque físicamente vulnerable con solo 4 Puntos de Cuerpo y una modesta daga, posee la capacidad de doblegar los elementos: fuego destructor, sanación de agua, teletransportación de tierra y tempestad de aire. En sus manos descansa la supervivencia de la expedición.',
  },
};

export const MENTOR_LORE = {
  name: 'Mentor',
  title: 'Guardián del Libro de Loretome y Consejero del Emperador',
  quote: '«Las sombras de Morcar se extienden sobre el Imperio. Cuatro héroes deben levantarse para salvar el reino.»',
  description:
    'Mentor es un antiguo y poderoso hechicero que vela por la paz de las tierras del Imperio desde los tiempos de Rogar el Bárbaro. A través de las páginas arcanas del Loretome, observa los movimientos de las huestes oscuras y guía a los cuatro campeones con sabiduría, pergaminos de misión y bendiciones.',
};

export const MORCAR_LORE = {
  name: 'Morcar (Zargon)',
  title: 'El Señor de las Tinieblas y Soberano del Caos',
  quote: '«Entrad en mis mazmorras, si os atrevéis... vuestros huesos adornarán mi sala del trono.»',
  description:
    'Antaño discípulo corrupto de las artes místicas, Morcar traicionó a sus hermanos y se entregó a los poderes ruinosos del Caos. Gobierna desde las profundidades subterráneas con legiones de goblins, orcos brutales, fimirs abominables, no-muertos y guerreros del Caos revestidos de hierro negro.',
};

export function createInitialHeroes(): Hero[] {
  return [
    {
      id: 'barbarian',
      heroClass: 'barbarian',
      name: 'Grimjaw',
      title: 'El Bárbaro',
      bodyPoints: 8,
      maxBodyPoints: 8,
      mindPoints: 2,
      maxMindPoints: 2,
      attackDice: 3,
      defendDice: 2,
      gold: 50,
      skillPoints: 1,
      inventory: [
        {
          id: 'broadsword',
          name: 'Espada Ancha',
          type: 'weapon',
          description: 'Espada ancha a dos filos. Permite atacar con 3 dados de combate.',
          cost: 250,
          attackDice: 3,
          usableBy: ['barbarian'],
          icon: '🗡️',
        },
      ],
      spells: [],
      skills: JSON.parse(JSON.stringify(INITIAL_SKILLS.barbarian)),
      activePerks: [],
      x: 1,
      y: 1,
      isDead: false,
      isAI: false,
      playerIndex: 0,
      color: '#dc2626',
      portrait: 'barbarian',
      lore: HEROES_LORE.barbarian.history,
    },
    {
      id: 'dwarf',
      heroClass: 'dwarf',
      name: 'Thorin',
      title: 'El Enano',
      bodyPoints: 7,
      maxBodyPoints: 7,
      mindPoints: 3,
      maxMindPoints: 3,
      attackDice: 2,
      defendDice: 2,
      gold: 50,
      skillPoints: 1,
      inventory: [
        {
          id: 'shortsword',
          name: 'Espada Corta',
          type: 'weapon',
          description: 'Espada corta de acero forjado. Ataca con 2 dados de combate.',
          cost: 150,
          attackDice: 2,
          usableBy: ['dwarf'],
          icon: '⚔️',
        },
      ],
      spells: [],
      skills: JSON.parse(JSON.stringify(INITIAL_SKILLS.dwarf)),
      activePerks: ['dwarf_trap_affinity'],
      x: 1,
      y: 2,
      isDead: false,
      isAI: false,
      playerIndex: 1,
      color: '#d97706',
      portrait: 'dwarf',
      lore: HEROES_LORE.dwarf.history,
    },
    {
      id: 'elf',
      heroClass: 'elf',
      name: 'Aeloria',
      title: 'El Elfo',
      bodyPoints: 6,
      maxBodyPoints: 6,
      mindPoints: 4,
      maxMindPoints: 4,
      attackDice: 2,
      defendDice: 2,
      gold: 50,
      skillPoints: 1,
      inventory: [
        {
          id: 'shortsword',
          name: 'Espada Corta',
          type: 'weapon',
          description: 'Espada ágil y equilibrada. Ataca con 2 dados de combate.',
          cost: 150,
          attackDice: 2,
          usableBy: ['elf'],
          icon: '⚔️',
        },
      ],
      // The Elf chooses 1 spell element (Water spells by default)
      spells: [
        { ...ALL_SPELLS.water_of_healing },
        { ...ALL_SPELLS.sleep },
        { ...ALL_SPELLS.veil_of_mist },
      ],
      skills: JSON.parse(JSON.stringify(INITIAL_SKILLS.elf)),
      activePerks: [],
      x: 2,
      y: 1,
      isDead: false,
      isAI: false,
      playerIndex: 2,
      color: '#16a34a',
      portrait: 'elf',
      lore: HEROES_LORE.elf.history,
    },
    {
      id: 'wizard',
      heroClass: 'wizard',
      name: 'Vaelin',
      title: 'El Mago',
      bodyPoints: 4,
      maxBodyPoints: 4,
      mindPoints: 6,
      maxMindPoints: 6,
      attackDice: 1,
      defendDice: 2,
      gold: 50,
      skillPoints: 1,
      inventory: [
        {
          id: 'dagger',
          name: 'Daga de Iniciado',
          type: 'weapon',
          description: 'Daga pequeña pero afilada. Ataca con 1 dado de combate.',
          cost: 25,
          attackDice: 1,
          usableBy: ['wizard'],
          icon: '🗡️',
        },
      ],
      // The Wizard gets the remaining 3 spell elements (Fire, Earth, Air)
      spells: [
        { ...ALL_SPELLS.fire_of_wrath },
        { ...ALL_SPELLS.ball_of_flame },
        { ...ALL_SPELLS.courage },
        { ...ALL_SPELLS.rock_skin },
        { ...ALL_SPELLS.heal_body },
        { ...ALL_SPELLS.pass_through_rock },
        { ...ALL_SPELLS.tempest },
        { ...ALL_SPELLS.swift_wind },
        { ...ALL_SPELLS.genie },
      ],
      skills: JSON.parse(JSON.stringify(INITIAL_SKILLS.wizard)),
      activePerks: [],
      x: 2,
      y: 2,
      isDead: false,
      isAI: false,
      playerIndex: 3,
      color: '#2563eb',
      portrait: 'wizard',
      lore: HEROES_LORE.wizard.history,
    },
  ];
}
