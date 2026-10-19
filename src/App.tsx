import React, { useState, useEffect, useCallback } from 'react';
import { Hero, HeroClass, Quest, Monster, Door, Furniture, GameLog, CombatState, Spell } from './types/heroquest';
import { QUESTS } from './data/questsData';
import { createInitialHeroes } from './data/heroesData';
import { rollCombatDice, rollMovementDice } from './utils/dice';
import { audio } from './utils/audio';

import { TitleScreen } from './components/TitleScreen';
import { DungeonBoard } from './components/DungeonBoard';
import { HUD } from './components/HUD';
import { CombatModal } from './components/CombatModal';
import { SpellCastDialog } from './components/SpellCastDialog';
import { InstructionsModal } from './components/InstructionsModal';
import { HeroLoreModal } from './components/HeroLoreModal';
import { SkillsUpgradeModal } from './components/SkillsUpgradeModal';
import { QuestOutcomeModal } from './components/QuestOutcomeModal';

export default function App() {
  // Game Navigation & Phase
  const [gamePhase, setGamePhase] = useState<'title' | 'dungeon'>('title');

  // Party & Quests
  const [heroes, setHeroes] = useState<Hero[]>(() => createInitialHeroes());
  const [selectedQuest, setSelectedQuest] = useState<Quest>(QUESTS[0]);
  const [activeQuest, setActiveQuest] = useState<Quest>(QUESTS[0]);

  // Turn management
  const [activeHeroIndex, setActiveHeroIndex] = useState<number>(0);
  const [isMorcarTurn, setIsMorcarTurn] = useState<boolean>(false);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [movementRemaining, setMovementRemaining] = useState<number>(0);
  const [hasMoved, setHasMoved] = useState<boolean>(false);
  const [hasActed, setHasActed] = useState<boolean>(false);

  // Modals
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showLore, setShowLore] = useState<boolean>(false);
  const [initialLoreHero, setInitialLoreHero] = useState<HeroClass>('barbarian');
  const [showSkills, setShowSkills] = useState<boolean>(false);
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [showSpellDialog, setShowSpellDialog] = useState<boolean>(false);
  const [outcomeState, setOutcomeState] = useState<{ isOpen: boolean; isVictory: boolean }>({
    isOpen: false,
    isVictory: false,
  });

  // Game log
  const [logs, setLogs] = useState<GameLog[]>([
    {
      id: 'l1',
      text: '¡Bienvenidos a HeroQuest! Mentor os aguarda en las catacumbas.',
      type: 'info',
      timestamp: '00:00',
    },
  ]);

  const addLog = useCallback((text: string, type: GameLog['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('es-ES', { minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [...prev, { id: `${Date.now()}_${Math.random()}`, text, type, timestamp: time }]);
  }, []);

  const activeHero = heroes[activeHeroIndex] || heroes[0];

  // Initialize a quest
  const startQuest = (questToStart: Quest) => {
    const questCopy: Quest = JSON.parse(JSON.stringify(questToStart));

    // Place heroes at start positions
    const updatedHeroes = heroes.map((h, idx) => {
      const pos = questCopy.startPositions[idx] || questCopy.startPositions[0];
      return {
        ...h,
        x: pos.x,
        y: pos.y,
        isDead: false,
        bodyPoints: h.maxBodyPoints,
        mindPoints: h.maxMindPoints,
        spells: h.spells.map((s) => ({ ...s, isUsed: false })),
      };
    });

    setHeroes(updatedHeroes);
    setActiveQuest(questCopy);
    setActiveHeroIndex(0);
    setIsMorcarTurn(false);
    setRoundNumber(1);
    setMovementRemaining(0);
    setHasMoved(false);
    setHasActed(false);
    setGamePhase('dungeon');
    setOutcomeState({ isOpen: false, isVictory: false });

    addLog(`Comienza la misión: "${questCopy.title}". ${questCopy.intro}`, 'info');
  };

  // Find room for coordinates
  const getRoomAt = useCallback(
    (x: number, y: number) => {
      return activeQuest.rooms.find((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
    },
    [activeQuest.rooms]
  );

  // Check if tile is walkable
  const isTileWalkable = useCallback(
    (x: number, y: number) => {
      if (x < 0 || x >= activeQuest.mapWidth || y < 0 || y >= activeQuest.mapHeight) return false;

      // Cannot walk into closed door
      const closedDoor = activeQuest.doors.find((d) => d.x === x && d.y === y && !d.isOpen);
      if (closedDoor) return false;

      // Cannot walk through furniture
      const hasFurn = activeQuest.furniture.some(
        (f) => x >= f.x && x < f.x + f.w && y >= f.y && y < f.y + f.h
      );
      if (hasFurn) return false;

      // Cannot walk onto other living hero
      const hasHero = heroes.some((h) => !h.isDead && h.x === x && h.y === y);
      if (hasHero) return false;

      // Cannot walk onto living monster
      const hasMonster = activeQuest.monsters.some((m) => !m.isDead && m.revealed && m.x === x && m.y === y);
      if (hasMonster) return false;

      return true;
    },
    [activeQuest, heroes]
  );

  // Calculate valid movement tiles for active hero
  const validMoves = React.useMemo(() => {
    if (movementRemaining <= 0 || hasMoved || activeHero.isDead || isMorcarTurn) return [];

    const moves: { x: number; y: number }[] = [];
    const dirs = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];

    dirs.forEach(({ dx, dy }) => {
      const nx = activeHero.x + dx;
      const ny = activeHero.y + dy;
      if (isTileWalkable(nx, ny)) {
        moves.push({ x: nx, y: ny });
      }
    });

    return moves;
  }, [movementRemaining, hasMoved, activeHero, isMorcarTurn, isTileWalkable]);

  // Targetable monsters for attack
  const targetableMonsters = React.useMemo(() => {
    if (hasActed || activeHero.isDead || isMorcarTurn) return [];

    const hasCrossbow = activeHero.inventory.some((i) => i.rangedAttack);

    return activeQuest.monsters
      .filter((m) => {
        if (m.isDead || !m.revealed) return false;

        const dist = Math.abs(m.x - activeHero.x) + Math.abs(m.y - activeHero.y);
        if (hasCrossbow) {
          // Line of sight in same row or col or within 5 tiles
          return dist <= 5;
        }
        // Orthogonal melee attack: distance 1
        return dist === 1;
      })
      .map((m) => m.id);
  }, [hasActed, activeHero, isMorcarTurn, activeQuest.monsters]);

  // Adjacent closed doors
  const adjacentDoors = React.useMemo(() => {
    return activeQuest.doors.filter((d) => {
      if (d.isOpen) return false;
      const dist = Math.abs(d.x - activeHero.x) + Math.abs(d.y - activeHero.y);
      return dist === 1;
    });
  }, [activeQuest.doors, activeHero]);

  // Adjacent furniture
  const adjacentFurniture = React.useMemo(() => {
    return activeQuest.furniture.filter((f) => {
      if (f.searched) return false;
      const dist = Math.abs(f.x - activeHero.x) + Math.abs(f.y - activeHero.y);
      return dist <= 1;
    });
  }, [activeQuest.furniture, activeHero]);

  // Check if active hero is in a room that hasn't been searched
  const activeRoom = getRoomAt(activeHero.x, activeHero.y);
  const canSearchTreasure = Boolean(
    activeRoom &&
      !activeRoom.treasureSearched &&
      !activeQuest.monsters.some((m) => !m.isDead && m.revealed && m.roomId === activeRoom.id)
  );

  const canSearchTraps = Boolean(activeRoom ? !activeRoom.trapsSearched : true);

  const canDisarmTrap = activeQuest.traps.some(
    (t) => t.detected && !t.sprung && Math.abs(t.x - activeHero.x) + Math.abs(t.y - activeHero.y) === 1
  );

  const canAttack = targetableMonsters.length > 0;
  const canCastSpell =
    (activeHero.heroClass === 'elf' || activeHero.heroClass === 'wizard') &&
    activeHero.spells.some((s) => !s.isUsed);

  // ACTION: Roll Movement Dice (2d6)
  const handleRollMovement = () => {
    if (hasMoved || activeHero.isDead) return;

    audio.playDiceRoll();
    const { die1, die2, total } = rollMovementDice();
    const moveBonus = activeHero.activePerks.includes('elf_swift_step') ? 2 : 0;
    const finalSteps = total + moveBonus;

    setMovementRemaining(finalSteps);
    setHasMoved(true);
    addLog(
      `🎲 ${activeHero.name} lanza los dados de movimiento: [${die1}] + [${die2}] = ${finalSteps} casillas.`,
      'info'
    );
  };

  // ACTION: Move to adjacent tile
  const handleTileClick = (x: number, y: number) => {
    if (movementRemaining <= 0) return;

    audio.playStep();

    // Check if stepping on a trap
    const trap = activeQuest.traps.find((t) => t.x === x && t.y === y && !t.sprung);
    let hpDeduction = 0;

    if (trap) {
      audio.playTrap();
      trap.sprung = true;
      trap.detected = true;
      hpDeduction = trap.damage;
      addLog(`¡PELIGRO! ${activeHero.name} ha caído en una trampa de ${trap.type}! Sufre ${hpDeduction} daño.`, 'trap');
    }

    const updatedHero: Hero = {
      ...activeHero,
      x,
      y,
      bodyPoints: Math.max(0, activeHero.bodyPoints - hpDeduction),
      isDead: activeHero.bodyPoints - hpDeduction <= 0,
    };

    setHeroes((prev) => prev.map((h) => (h.id === updatedHero.id ? updatedHero : h)));
    setMovementRemaining((prev) => prev - 1);

    // If hero died from trap
    if (updatedHero.isDead) {
      addLog(`💀 ¡${updatedHero.name} ha muerto en las profundidades de la mazmorra!`, 'danger');
    }
  };

  // ACTION: Open Door
  const handleOpenDoor = (door: Door) => {
    audio.playDoor();

    // Reveal connected rooms
    const updatedRooms = activeQuest.rooms.map((r) => {
      if (door.connectsRooms.includes(r.id)) {
        return { ...r, revealed: true };
      }
      return r;
    });

    // Reveal monsters inside newly revealed rooms
    const updatedMonsters = activeQuest.monsters.map((m) => {
      if (m.roomId && door.connectsRooms.includes(m.roomId)) {
        return { ...m, revealed: true };
      }
      return m;
    });

    const updatedDoors = activeQuest.doors.map((d) => (d.id === door.id ? { ...d, isOpen: true } : d));

    setActiveQuest((prev) => ({
      ...prev,
      rooms: updatedRooms,
      monsters: updatedMonsters,
      doors: updatedDoors,
    }));

    addLog(`🚪 ${activeHero.name} abre la puerta con un chirrido de goznes. ¡La sala se ilumina!`, 'info');
  };

  // ACTION: Search Furniture (Chest, Rack, etc.)
  const handleFurnitureClick = (furn: Furniture) => {
    audio.playLoot();

    const goldFound = furn.goldLoot || 20;
    const bonusPct = activeHero.activePerks.includes('dwarf_gold_greed') ? 0.5 : 0;
    const finalGold = Math.round(goldFound * (1 + bonusPct));

    const updatedFurn = activeQuest.furniture.map((f) => (f.id === furn.id ? { ...f, searched: true } : f));

    const updatedHero: Hero = {
      ...activeHero,
      gold: activeHero.gold + finalGold,
    };

    setActiveQuest((prev) => ({ ...prev, furniture: updatedFurn }));
    setHeroes((prev) => prev.map((h) => (h.id === updatedHero.id ? updatedHero : h)));

    addLog(`📦 ${activeHero.name} registra el ${furn.name} y encuentra ${finalGold} monedas de oro.`, 'loot');
  };

  // ACTION: Attack Monster
  const handleMonsterClick = (monster: Monster) => {
    if (hasActed || activeHero.isDead) return;

    // Roll Combat Dice for Hero and Monster
    const attackerRoll = rollCombatDice(activeHero.attackDice);
    const defenderRoll = rollCombatDice(monster.defendDice);

    const hits = attackerRoll.skulls;
    // Monsters defend ONLY with Black Shields
    const blocks = defenderRoll.blackShields;
    const damage = Math.max(0, hits - blocks);

    setCombatState({
      attackerName: activeHero.name,
      attackerType: 'hero',
      attackerAttackDice: activeHero.attackDice,
      defenderName: monster.name,
      defenderType: 'monster',
      defenderDefendDice: monster.defendDice,
      defenderBodyPoints: monster.bodyPoints,
      attackerRoll,
      defenderRoll,
      damageDealt: damage,
      resolved: false,
      targetId: monster.id,
    });
  };

  // Resolve Combat Modal
  const handleConfirmCombat = () => {
    if (!combatState) return;

    const { targetId, damageDealt = 0, defenderName, attackerName, defenderType } = combatState;

    if (defenderType === 'monster') {
      const monster = activeQuest.monsters.find((m) => m.id === targetId);
      if (monster) {
        const remainingHp = monster.bodyPoints - damageDealt;
        const isDead = remainingHp <= 0;

        const updatedMonsters = activeQuest.monsters.map((m) =>
          m.id === targetId ? { ...m, bodyPoints: remainingHp, isDead } : m
        );

        setActiveQuest((prev) => ({ ...prev, monsters: updatedMonsters }));

        if (isDead) {
          audio.playFanfare();
          // Give bounty to active hero
          const updatedHero: Hero = {
            ...activeHero,
            gold: activeHero.gold + monster.bountyGold,
            skillPoints: activeHero.skillPoints + monster.bountyExp,
          };
          setHeroes((prev) => prev.map((h) => (h.id === updatedHero.id ? updatedHero : h)));

          addLog(
            `⚔️ ¡${attackerName} destruye a ${monster.name}! Gana +${monster.bountyGold}🪙 de botín y +${monster.bountyExp}💎 Punto de Habilidad.`,
            'combat'
          );

          // Check if Boss Verag was slain
          if (monster.type === 'gargoyle') {
            addLog(`🏆 ¡LA GÁRGOLA VERAG HA CAÍDO! Las catacumbas se estremecen con vuestra gloria.`, 'loot');
            setOutcomeState({ isOpen: true, isVictory: true });
          }
        } else {
          addLog(
            `⚔️ ${attackerName} asesta ${damageDealt} daño a ${monster.name}. (Le quedan ${remainingHp} PV)`,
            'combat'
          );
        }
      }
    } else {
      // Monster attacked Hero
      const hero = heroes.find((h) => h.id === targetId);
      if (hero) {
        const remainingHp = hero.bodyPoints - damageDealt;
        const isDead = remainingHp <= 0;

        const updatedHero: Hero = {
          ...hero,
          bodyPoints: remainingHp,
          isDead,
        };

        setHeroes((prev) => prev.map((h) => (h.id === updatedHero.id ? updatedHero : h)));

        if (isDead) {
          audio.playDamage();
          addLog(`💀 ¡${hero.name} ha caído en combate a manos de ${attackerName}!`, 'danger');

          // Check if all heroes are dead
          const allDead = heroes.every((h) => (h.id === hero.id ? true : h.isDead));
          if (allDead) {
            setOutcomeState({ isOpen: true, isVictory: false });
          }
        } else {
          addLog(`🛡️ ${attackerName} golpea a ${hero.name} causando ${damageDealt} de daño.`, 'combat');
        }
      }
    }

    setCombatState(null);
    setHasActed(true);
  };

  // ACTION: Search Room for Treasure
  const handleSearchTreasure = () => {
    if (!activeRoom || hasActed || activeHero.isDead) return;

    audio.playLoot();

    // Mark room as searched
    const updatedRooms = activeQuest.rooms.map((r) =>
      r.id === activeRoom.id ? { ...r, treasureSearched: true } : r
    );
    setActiveQuest((prev) => ({ ...prev, rooms: updatedRooms }));

    // Authentic HeroQuest treasure deck outcomes
    const rand = Math.random();
    if (rand < 0.4) {
      const gold = Math.floor(Math.random() * 40) + 20;
      const updatedHero: Hero = { ...activeHero, gold: activeHero.gold + gold };
      setHeroes((prev) => prev.map((h) => (h.id === updatedHero.id ? updatedHero : h)));
      addLog(`💰 ${activeHero.name} busca tesoro en la sala y encuentra una bolsa con ${gold} monedas de oro!`, 'loot');
    } else if (rand < 0.7) {
      const potion = {
        id: `potion_${Date.now()}`,
        name: 'Poción de Curación',
        type: 'potion' as const,
        description: 'Restaura hasta 4 Puntos de Cuerpo perdidos.',
        cost: 100,
        usableBy: ['barbarian', 'dwarf', 'elf', 'wizard'] as HeroClass[],
        icon: '🧪',
        consumable: true,
        effect: 'heal_4' as const,
      };
      const updatedHero: Hero = { ...activeHero, inventory: [...activeHero.inventory, potion] };
      setHeroes((prev) => prev.map((h) => (h.id === updatedHero.id ? updatedHero : h)));
      addLog(`🧪 ¡${activeHero.name} encuentra una Poción de Curación escondida entre los ladrillos!`, 'loot');
    } else {
      // Wandering monster ambush!
      audio.playTrap();
      addLog(`⚠️ ¡CUIDADO! Monstruo errante: Un Goblin surge de las sombras atacando a ${activeHero.name}!`, 'trap');
      const ambushMonster = {
        id: `ambush_${Date.now()}`,
        type: 'goblin' as const,
        name: 'Goblin Emboscado',
        bodyPoints: 1,
        maxBodyPoints: 1,
        mindPoints: 1,
        attackDice: 2,
        defendDice: 1,
        moveSpaces: 10,
        x: activeHero.x + 1,
        y: activeHero.y,
        roomId: activeRoom.id,
        revealed: true,
        isDead: false,
        bountyGold: 15,
        bountyExp: 1,
        icon: '👺',
        color: '#84cc16',
      };
      setActiveQuest((prev) => ({ ...prev, monsters: [...prev.monsters, ambushMonster] }));
    }

    setHasActed(true);
  };

  // ACTION: Search for Traps and Secret Doors
  const handleSearchTraps = () => {
    if (hasActed || activeHero.isDead) return;

    audio.playSpell();

    let foundCount = 0;
    const updatedTraps = activeQuest.traps.map((t) => {
      // Detect traps in current room or within 4 tiles in corridor
      const dist = Math.abs(t.x - activeHero.x) + Math.abs(t.y - activeHero.y);
      if (dist <= 4 && !t.detected) {
        foundCount++;
        return { ...t, detected: true };
      }
      return t;
    });

    if (activeRoom) {
      const updatedRooms = activeQuest.rooms.map((r) =>
        r.id === activeRoom.id ? { ...r, trapsSearched: true } : r
      );
      setActiveQuest((prev) => ({ ...prev, rooms: updatedRooms, traps: updatedTraps }));
    } else {
      setActiveQuest((prev) => ({ ...prev, traps: updatedTraps }));
    }

    if (foundCount > 0) {
      addLog(`⚠️ ¡${activeHero.name} detecta con éxito ${foundCount} trampa(s) oculta(s) en la zona!`, 'trap');
    } else {
      addLog(`🔍 ${activeHero.name} examina el suelo con atención: No hay trampas visibles a su alcance.`, 'info');
    }

    setHasActed(true);
  };

  // ACTION: Disarm Trap
  const handleDisarmTrap = () => {
    if (hasActed || activeHero.isDead) return;

    const nearbyTrap = activeQuest.traps.find(
      (t) => t.detected && !t.sprung && Math.abs(t.x - activeHero.x) + Math.abs(t.y - activeHero.y) === 1
    );
    if (!nearbyTrap) return;

    // Dwarf disarms automatically! Other heroes roll 1 combat die (skull = success, black shield = triggers)
    if (activeHero.heroClass === 'dwarf') {
      audio.playLoot();
      nearbyTrap.sprung = true; // safely neutralized
      const updatedHero: Hero = { ...activeHero, gold: activeHero.gold + 25, skillPoints: activeHero.skillPoints + 1 };
      setHeroes((prev) => prev.map((h) => (h.id === updatedHero.id ? updatedHero : h)));
      addLog(
        `⛏️ ¡${activeHero.name} (Enano) desarma la trampa con destreza inigualable y recupera 25🪙 de engranajes!`,
        'loot'
      );
    } else {
      const roll = rollCombatDice(1);
      if (roll.blackShields > 0) {
        audio.playTrap();
        nearbyTrap.sprung = true;
        const updatedHero: Hero = {
          ...activeHero,
          bodyPoints: Math.max(0, activeHero.bodyPoints - nearbyTrap.damage),
        };
        setHeroes((prev) => prev.map((h) => (h.id === updatedHero.id ? updatedHero : h)));
        addLog(`💥 ¡FALLO! La ganzúa resbaló y la trampa detonó hiriendo a ${activeHero.name}.`, 'trap');
      } else {
        audio.playLoot();
        nearbyTrap.sprung = true;
        addLog(`🛠️ ¡${activeHero.name} desarma con éxito la trampa peligrosa!`, 'loot');
      }
    }

    setHasActed(true);
  };

  // ACTION: Cast Elemental Spell
  const handleCastSpell = (spell: Spell, targetId: string, targetType: 'monster' | 'hero') => {
    const updatedSpells = activeHero.spells.map((s) => (s.id === spell.id ? { ...s, isUsed: true } : s));
    const updatedHero: Hero = { ...activeHero, spells: updatedSpells };
    setHeroes((prev) => prev.map((h) => (h.id === updatedHero.id ? updatedHero : h)));

    if (spell.effectType === 'heal') {
      const ally = heroes.find((h) => h.id === targetId);
      if (ally) {
        const healed = Math.min(ally.maxBodyPoints, ally.bodyPoints + spell.value);
        setHeroes((prev) => prev.map((h) => (h.id === targetId ? { ...h, bodyPoints: healed } : h)));
        addLog(`✨ ¡${activeHero.name} lanza ${spell.name} sanando ${spell.value} PV a ${ally.name}!`, 'spell');
      }
    } else if (spell.effectType === 'damage') {
      const monster = activeQuest.monsters.find((m) => m.id === targetId);
      if (monster) {
        const newHp = monster.bodyPoints - spell.value;
        const isDead = newHp <= 0;
        setActiveQuest((prev) => ({
          ...prev,
          monsters: prev.monsters.map((m) => (m.id === targetId ? { ...m, bodyPoints: newHp, isDead } : m)),
        }));
        if (isDead) {
          addLog(`🔥 ¡El conjuro ${spell.name} incinera y aniquila a ${monster.name}!`, 'spell');
          if (monster.type === 'gargoyle') {
            setOutcomeState({ isOpen: true, isVictory: true });
          }
        } else {
          addLog(`🔥 ${spell.name} golpea a ${monster.name} causando ${spell.value} puntos de daño!`, 'spell');
        }
      }
    } else if (spell.effectType === 'buff_defense') {
      const ally = heroes.find((h) => h.id === targetId);
      if (ally) {
        setHeroes((prev) =>
          prev.map((h) => (h.id === targetId ? { ...h, defendDice: h.defendDice + 1 } : h))
        );
        addLog(`🪨 ¡${activeHero.name} envuelve a ${ally.name} en ${spell.name} (+1 Dado de Defensa)!`, 'spell');
      }
    } else if (spell.effectType === 'sleep' || spell.effectType === 'tempest') {
      const monster = activeQuest.monsters.find((m) => m.id === targetId);
      if (monster) {
        addLog(`💤 ¡${monster.name} queda sumido en un letargo mágico por ${spell.name}!`, 'spell');
      }
    }

    setHasActed(true);
  };

  // Next Hero or switch to Morcar
  const handleEndTurn = useCallback(() => {
    setMovementRemaining(0);
    setHasMoved(false);
    setHasActed(false);

    let nextIndex = activeHeroIndex + 1;
    // Skip dead heroes
    while (nextIndex < heroes.length && heroes[nextIndex].isDead) {
      nextIndex++;
    }

    if (nextIndex >= heroes.length) {
      // All heroes have finished their turn: switch to Morcar's Turn!
      setIsMorcarTurn(true);
      addLog(`💀 TURNO DE MORCAR: El Señor del Caos mueve sus criaturas en las sombras...`, 'danger');
    } else {
      setActiveHeroIndex(nextIndex);
      addLog(`Turno de ${heroes[nextIndex].name} (${heroes[nextIndex].title}).`, 'turn');
    }
  }, [activeHeroIndex, heroes, addLog]);

  // Morcar's Turn Execution
  const handleMorcarStep = () => {
    audio.playDamage();

    const livingHeroes = heroes.filter((h) => !h.isDead);
    if (livingHeroes.length === 0) {
      setOutcomeState({ isOpen: true, isVictory: false });
      return;
    }

    const revealedMonsters = activeQuest.monsters.filter((m) => !m.isDead && m.revealed);

    // Each monster approaches closest hero or attacks if adjacent
    let attacksMade = 0;

    revealedMonsters.forEach((monster) => {
      // Find closest living hero
      let closestHero = livingHeroes[0];
      let minDistance = 999;

      livingHeroes.forEach((hero) => {
        const d = Math.abs(hero.x - monster.x) + Math.abs(hero.y - monster.y);
        if (d < minDistance) {
          minDistance = d;
          closestHero = hero;
        }
      });

      // If adjacent, attack!
      if (minDistance === 1) {
        attacksMade++;
        const atkRoll = rollCombatDice(monster.attackDice);
        const defRoll = rollCombatDice(closestHero.defendDice);

        const hits = atkRoll.skulls;
        // Heroes defend with White Shields
        const blocks = defRoll.whiteShields;
        const dmg = Math.max(0, hits - blocks);

        setCombatState({
          attackerName: monster.name,
          attackerType: 'monster',
          attackerAttackDice: monster.attackDice,
          defenderName: closestHero.name,
          defenderType: 'hero',
          defenderDefendDice: closestHero.defendDice,
          defenderBodyPoints: closestHero.bodyPoints,
          attackerRoll: atkRoll,
          defenderRoll: defRoll,
          damageDealt: dmg,
          resolved: false,
          targetId: closestHero.id,
        });
      }
    });

    if (attacksMade === 0) {
      addLog(`Los monstruos de Morcar vigilan los pasillos sin entablar combate en este asalto.`, 'info');
    }

    // End Morcar's turn: return to Hero 0 and increment round
    setIsMorcarTurn(false);
    setRoundNumber((prev) => prev + 1);

    // Find first living hero
    const firstLivingIndex = heroes.findIndex((h) => !h.isDead);
    setActiveHeroIndex(firstLivingIndex >= 0 ? firstLivingIndex : 0);
  };

  // Automated AI Hero behavior
  useEffect(() => {
    if (gamePhase !== 'dungeon' || isMorcarTurn || !activeHero.isAI || activeHero.isDead || combatState) {
      return;
    }

    const aiTimer = setTimeout(() => {
      // 1. If has not moved, roll movement dice
      if (!hasMoved) {
        handleRollMovement();
        return;
      }

      // 2. If targetable monster is present, attack!
      if (targetableMonsters.length > 0 && !hasActed) {
        const targetMonster = activeQuest.monsters.find((m) => m.id === targetableMonsters[0]);
        if (targetMonster) {
          handleMonsterClick(targetMonster);
          return;
        }
      }

      // 3. If closed door is adjacent, open it!
      if (adjacentDoors.length > 0) {
        handleOpenDoor(adjacentDoors[0]);
        return;
      }

      // 4. If can move and valid moves exist, pick step closest to nearest door or monster
      if (movementRemaining > 0 && validMoves.length > 0) {
        const nextStep = validMoves[0];
        handleTileClick(nextStep.x, nextStep.y);
        return;
      }

      // 5. If nothing else to do, end turn
      handleEndTurn();
    }, 900);

    return () => clearTimeout(aiTimer);
  }, [
    gamePhase,
    isMorcarTurn,
    activeHero,
    hasMoved,
    hasActed,
    movementRemaining,
    validMoves,
    targetableMonsters,
    adjacentDoors,
    combatState,
    handleEndTurn,
  ]);

  // Restart quest on victory/defeat
  const handleNextOrRetry = () => {
    startQuest(selectedQuest);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans select-none overflow-x-hidden">
      {gamePhase === 'title' ? (
        <TitleScreen
          heroes={heroes}
          quests={QUESTS}
          selectedQuest={selectedQuest}
          onSelectQuest={(q) => setSelectedQuest(q)}
          onUpdateHeroConfig={(updated) => setHeroes(updated)}
          onStartGame={() => startQuest(selectedQuest)}
          onOpenInstructions={() => setShowInstructions(true)}
          onOpenLore={(heroClass) => {
            if (heroClass) setInitialLoreHero(heroClass);
            setShowLore(true);
          }}
          onOpenSkills={() => setShowSkills(true)}
        />
      ) : (
        /* Dungeon Exploration & Board View */
        <div className="flex-1 flex flex-col p-3 sm:p-5 max-w-7xl mx-auto w-full space-y-4">
          {/* Top HUD with action console and status cards */}
          <HUD
            quest={activeQuest}
            heroes={heroes}
            activeHeroIndex={activeHeroIndex}
            isMorcarTurn={isMorcarTurn}
            roundNumber={roundNumber}
            movementRemaining={movementRemaining}
            hasMoved={hasMoved}
            hasActed={hasActed}
            canAttack={canAttack}
            canCastSpell={canCastSpell}
            canSearchTreasure={canSearchTreasure}
            canSearchTraps={canSearchTraps}
            canDisarmTrap={canDisarmTrap}
            logs={logs}
            onRollMovement={handleRollMovement}
            onInitiateAttack={() => {
              const firstTarget = activeQuest.monsters.find((m) => targetableMonsters.includes(m.id));
              if (firstTarget) handleMonsterClick(firstTarget);
            }}
            onOpenSpellCast={() => setShowSpellDialog(true)}
            onSearchTreasure={handleSearchTreasure}
            onSearchTraps={handleSearchTraps}
            onDisarmTrap={handleDisarmTrap}
            onEndTurn={handleEndTurn}
            onMorcarStep={handleMorcarStep}
            onOpenSkills={() => setShowSkills(true)}
            onOpenInstructions={() => setShowInstructions(true)}
            onOpenLore={() => setShowLore(true)}
            onReturnToTitle={() => setGamePhase('title')}
          />

          {/* Authentic 16-Bit Grid Board */}
          <DungeonBoard
            quest={activeQuest}
            heroes={heroes}
            activeHero={activeHero}
            monsters={activeQuest.monsters}
            validMoves={validMoves}
            targetableMonsters={targetableMonsters}
            adjacentDoors={adjacentDoors}
            adjacentFurniture={adjacentFurniture}
            onTileClick={handleTileClick}
            onMonsterClick={handleMonsterClick}
            onDoorClick={handleOpenDoor}
            onFurnitureClick={handleFurnitureClick}
            isMoving={movementRemaining > 0}
          />
        </div>
      )}

      {/* Combat Resolution Modal */}
      {combatState && (
        <CombatModal
          isOpen={Boolean(combatState)}
          attackerName={combatState.attackerName}
          attackerType={combatState.attackerType}
          attackerDiceCount={combatState.attackerAttackDice}
          defenderName={combatState.defenderName}
          defenderType={combatState.defenderType}
          defenderDiceCount={combatState.defenderDefendDice}
          defenderHp={combatState.defenderBodyPoints}
          defenderMaxHp={combatState.defenderBodyPoints}
          attackerRoll={combatState.attackerRoll}
          defenderRoll={combatState.defenderRoll}
          damageDealt={combatState.damageDealt}
          onConfirm={handleConfirmCombat}
        />
      )}

      {/* Spell Cast Picker */}
      <SpellCastDialog
        isOpen={showSpellDialog}
        caster={activeHero}
        spells={activeHero.spells}
        visibleMonsters={activeQuest.monsters.filter((m) => !m.isDead && m.revealed)}
        allies={heroes.filter((h) => !h.isDead)}
        onCastSpell={handleCastSpell}
        onClose={() => setShowSpellDialog(false)}
      />

      {/* Instructions & Rules Manual */}
      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      {/* Hero Lore Codex */}
      <HeroLoreModal
        isOpen={showLore}
        onClose={() => setShowLore(false)}
        initialClass={initialLoreHero}
      />

      {/* Skills & Armory Upgrade Tree (ALWAYS PRESENT) */}
      <SkillsUpgradeModal
        isOpen={showSkills}
        onClose={() => setShowSkills(false)}
        heroes={heroes}
        activeHeroId={activeHero.id}
        onUpdateHero={(updated) => {
          setHeroes((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
        }}
        onAddLog={addLog}
      />

      {/* Quest Victory / Defeat Modal */}
      <QuestOutcomeModal
        isOpen={outcomeState.isOpen}
        isVictory={outcomeState.isVictory}
        quest={activeQuest}
        onNextOrRetry={handleNextOrRetry}
        onOpenSkills={() => setShowSkills(true)}
      />
    </div>
  );
}
