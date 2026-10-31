import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Hero, HeroClass, Quest, Monster, Door, Furniture, GameLog, CombatState, Spell } from './types/heroquest';
import { QUESTS } from './data/questsData';
import { createInitialHeroes } from './data/heroesData';
import { rollCombatDice, rollMovementDice } from './utils/dice';
import { audio } from './utils/audio';
import { canCrossBoundary, getSmartAIMove, getMonsterMovePath, getValidHeroMoves, HeroMoveDestination } from './utils/pathfinding';
import { generateProceduralQuest } from './utils/dungeonGenerator';

import { TitleScreen } from './components/TitleScreen';
import { DungeonBoard } from './components/DungeonBoard';
import { HUD } from './components/HUD';
import { CombatModal } from './components/CombatModal';
import { SpellCastDialog } from './components/SpellCastDialog';
import { InstructionsModal } from './components/InstructionsModal';
import { HeroLoreModal } from './components/HeroLoreModal';
import { SkillsUpgradeModal } from './components/SkillsUpgradeModal';
import { QuestOutcomeModal } from './components/QuestOutcomeModal';
import { PartyOverviewModal } from './components/PartyOverviewModal';
import { QuestBriefingModal } from './components/QuestBriefingModal';
import { GameLogModal } from './components/GameLogModal';

export default function App() {
  // Game Navigation & Phase
  const [gamePhase, setGamePhase] = useState<'title' | 'dungeon'>('title');

  // Party & Quests
  const [heroes, setHeroes] = useState<Hero[]>(() => createInitialHeroes());
  const [selectedQuest, setSelectedQuest] = useState<Quest>(QUESTS[0]);
  const [activeQuest, setActiveQuest] = useState<Quest>(QUESTS[0]);
  const [currentFloor, setCurrentFloor] = useState<number>(1);

  // Turn management
  const [activeHeroIndex, setActiveHeroIndex] = useState<number>(0);
  const [isMorcarTurn, setIsMorcarTurn] = useState<boolean>(false);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [movementRemaining, setMovementRemaining] = useState<number>(0);
  const [hasRolledMovement, setHasRolledMovement] = useState<boolean>(false);
  const [hasActed, setHasActed] = useState<boolean>(false);

  // AI companion visited tiles tracking (prevents oscillation)
  const aiVisitedThisTurn = useRef<Set<string>>(new Set());

  // Modals
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showLore, setShowLore] = useState<boolean>(false);
  const [initialLoreHero, setInitialLoreHero] = useState<HeroClass>('barbarian');
  const [showSkills, setShowSkills] = useState<boolean>(false);
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [pendingMonsterQueue, setPendingMonsterQueue] = useState<Monster[]>([]);
  const isMorcarProcessing = useRef<boolean>(false);
  const [activeActorOverride, setActiveActorOverride] = useState<{ x: number; y: number } | null>(null);
  const pendingMorcarCallbackRef = useRef<(() => void) | null>(null);
  const [showSpellDialog, setShowSpellDialog] = useState<boolean>(false);
  const [showPartyModal, setShowPartyModal] = useState<boolean>(false);
  const [showQuestBriefing, setShowQuestBriefing] = useState<boolean>(false);
  const [showLogsModal, setShowLogsModal] = useState<boolean>(false);
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
  const activeActorTile = activeActorOverride || (activeHero ? { x: activeHero.x, y: activeHero.y } : null);

  // Initialize a quest
  const startQuest = useCallback((questToStart: Quest) => {
    const questCopy: Quest = JSON.parse(JSON.stringify(questToStart));

    // Place heroes at start positions
    setHeroes((prevHeroes) =>
      prevHeroes.map((h, idx) => {
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
      })
    );

    setActiveQuest(questCopy);
    setActiveHeroIndex(0);
    setIsMorcarTurn(false);
    setRoundNumber(1);
    setMovementRemaining(0);
    setHasRolledMovement(false);
    setHasActed(false);
    aiVisitedThisTurn.current.clear();
    setGamePhase('dungeon');
    setOutcomeState({ isOpen: false, isVictory: false });

    addLog(`Comienza la misión: "${questCopy.title}". ${questCopy.intro}`, 'info');
  }, [addLog]);

  // Generate a brand new, completely randomized dungeon on demand
  const startRandomQuest = useCallback(() => {
    const freshQuest = generateProceduralQuest({ floorLevel: currentFloor, dungeonSize: 'epic' });
    setSelectedQuest(freshQuest);
    startQuest(freshQuest);
    addLog(
      `🎲 ¡Se ha generado una nueva mazmorra 100% aleatoria con ${freshQuest.rooms.length} salas y ${freshQuest.monsters.length} criaturas del Caos!`,
      'loot'
    );
  }, [currentFloor, startQuest, addLog]);

  // Find room for coordinates
  const getRoomAt = useCallback(
    (x: number, y: number) => {
      return activeQuest.rooms.find((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
    },
    [activeQuest.rooms]
  );

  // Check if tile is walkable for the active hero
  const isTileWalkable = useCallback(
    (x: number, y: number) => {
      if (x < 0 || x >= activeQuest.mapWidth || y < 0 || y >= activeQuest.mapHeight) return false;

      // 1. Strict room wall collision: you CANNOT cross between room and corridor (or between rooms) without an OPEN door!
      if (!canCrossBoundary(activeHero.x, activeHero.y, x, y, activeQuest.rooms, activeQuest.doors)) {
        return false;
      }

      // 2. Closed doors block movement
      const closedDoor = activeQuest.doors.find((d) => d.x === x && d.y === y && !d.isOpen);
      if (closedDoor) return false;

      // 3. Furniture blocks movement
      const hasFurn = activeQuest.furniture.some(
        (f) => x >= f.x && x < f.x + f.w && y >= f.y && y < f.y + f.h
      );
      if (hasFurn) return false;

      // 4. Other heroes block tile
      const hasHero = heroes.some((h) => !h.isDead && h.x === x && h.y === y);
      if (hasHero) return false;

      // 5. Living monsters block tile
      const hasMonster = activeQuest.monsters.some((m) => !m.isDead && m.revealed && m.x === x && m.y === y);
      if (hasMonster) return false;

      // 6. Cannot walk into an unrevealed room through solid walls
      const targetRoom = getRoomAt(x, y);
      if (targetRoom && !targetRoom.revealed) {
        // Can only enter if an open door connects to this room
        const hasOpenDoor = activeQuest.doors.some(
          (d) => d.isOpen && ((d.x === x && d.y === y) || (d.tileA && d.tileA.x === x && d.tileA.y === y))
        );
        if (!hasOpenDoor) return false;
      }

      return true;
    },
    [activeQuest, heroes, activeHero, getRoomAt]
  );

  // Calculate valid movement destinations for active hero (supports passing through allies!)
  const validHeroMoveDestinations = React.useMemo(() => {
    if (movementRemaining <= 0 || activeHero.isDead || isMorcarTurn) return [];
    return getValidHeroMoves(activeHero, activeQuest, heroes, movementRemaining);
  }, [movementRemaining, activeHero, isMorcarTurn, activeQuest, heroes]);

  const validMoves = React.useMemo(() => {
    return validHeroMoveDestinations.map((d) => ({ x: d.x, y: d.y }));
  }, [validHeroMoveDestinations]);

  // Targetable monsters for attack (Supports 8-directional melee: orthogonal + diagonal!)
  const targetableMonsters = React.useMemo(() => {
    if (hasActed || activeHero.isDead || isMorcarTurn) return [];

    const hasCrossbow = activeHero.inventory.some((i) => i.rangedAttack);

    return activeQuest.monsters
      .filter((m) => {
        if (m.isDead || !m.revealed) return false;

        const dx = Math.abs(m.x - activeHero.x);
        const dy = Math.abs(m.y - activeHero.y);

        if (hasCrossbow) {
          return dx + dy <= 5;
        }

        // 8-directional melee adjacency: touches hero tile in any of the 8 directions!
        const isAdjacent = dx <= 1 && dy <= 1 && (dx + dy > 0);
        if (!isAdjacent) return false;

        // Ensure not separated by a solid stone wall without a door
        if (!canCrossBoundary(activeHero.x, activeHero.y, m.x, m.y, activeQuest.rooms, activeQuest.doors)) {
          return false;
        }

        return true;
      })
      .map((m) => m.id);
  }, [hasActed, activeHero, isMorcarTurn, activeQuest.monsters, activeQuest.rooms, activeQuest.doors]);

  // Adjacent closed doors
  const adjacentDoors = React.useMemo(() => {
    return activeQuest.doors.filter((d) => {
      if (d.isOpen) return false;
      const dist = Math.abs(d.x - activeHero.x) + Math.abs(d.y - activeHero.y);
      return dist <= 1;
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

  // Check room status
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

  // Two mandatory quest objectives
  const livingBoss = React.useMemo(
    () => activeQuest.monsters.find((m) => m.isBoss && !m.isDead),
    [activeQuest.monsters]
  );
  const bossName = React.useMemo(() => {
    const boss = activeQuest.monsters.find((m) => m.isBoss);
    return boss ? boss.name : 'Jefe Supremo';
  }, [activeQuest.monsters]);

  const isBossDefeated = !livingBoss;
  const livingMonstersCount = React.useMemo(
    () => activeQuest.monsters.filter((m) => !m.isDead).length,
    [activeQuest.monsters]
  );
  const isDungeonCleared = livingMonstersCount === 0;
  const areAllObjectivesComplete = isBossDefeated && isDungeonCleared;

  // Active skill node if unlocked for active hero
  const unlockedActiveSkill = React.useMemo(() => {
    const activeSkillNode = activeHero.skills.find((s) => s.unlocked && s.activeEffect);
    if (!activeSkillNode) return null;
    return {
      name: activeSkillNode.name,
      icon: activeSkillNode.icon,
      description: activeSkillNode.description,
      effect: activeSkillNode.activeEffect!,
    };
  }, [activeHero.skills]);

  // ACTION: Roll Movement Dice (2d6)
  const handleRollMovement = () => {
    if (hasRolledMovement || activeHero.isDead) return;

    audio.playDiceRoll();
    const { die1, die2, total } = rollMovementDice();
    const moveBonus = activeHero.activePerks.includes('elf_swift_step') ? 2 : 0;
    const finalSteps = total + moveBonus;

    setMovementRemaining(finalSteps);
    setHasRolledMovement(true);
    addLog(
      `🎲 ${activeHero.name} lanza los dados de movimiento: [${die1}] + [${die2}] = ${finalSteps} casillas.`,
      'info'
    );
  };

  // ACTION: Move to destination tile (supporting passing through allies!)
  const handleTileClick = useCallback(
    (x: number, y: number) => {
      if (movementRemaining <= 0) return;

      audio.playStep();

      // Look up destination metadata (movement cost & allies traversed)
      const moveDest = validHeroMoveDestinations.find((d) => d.x === x && d.y === y);
      const stepCost = moveDest ? moveDest.cost : 1;

      if (moveDest && moveDest.alliesPassed.length > 0) {
        const allyNames = moveDest.alliesPassed.map((a) => a.name).join(' y ');
        addLog(
          `👣 ¡${activeHero.name} pasa por encima de ${allyNames} y avanza! (Gasta ${stepCost} movimientos)`,
          'info'
        );
      }

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
      setMovementRemaining((prev) => Math.max(0, prev - stepCost));

      if (updatedHero.isDead) {
        addLog(`💀 ¡${updatedHero.name} ha muerto en las profundidades de la mazmorra!`, 'danger');
      } else if (x === activeQuest.exitPosition.x && y === activeQuest.exitPosition.y) {
        const currentLivingBoss = activeQuest.monsters.find((m) => m.isBoss && !m.isDead);
        const currentRemainingMonsters = activeQuest.monsters.filter((m) => !m.isDead);

        if (!currentLivingBoss && currentRemainingMonsters.length === 0) {
          audio.playFanfare();
          addLog(`🏆 ¡VICTORIA TOTAL! ¡${updatedHero.name} y los héroes escapan triunfantes por las escaleras habiendo aniquilado al Jefe y purgado todos los monstruos de la mazmorra!`, 'loot');
          setHeroes((prev) =>
            prev.map((h) =>
              h.isDead
                ? h
                : {
                    ...h,
                    gold: h.gold + activeQuest.rewardGold,
                    skillPoints: h.skillPoints + activeQuest.rewardSkillPoints,
                  }
            )
          );
          setOutcomeState({ isOpen: true, isVictory: true });
        } else {
          audio.playBlock();
          if (currentLivingBoss && currentRemainingMonsters.length > 1) {
            addLog(
              `⚠️ Las escaleras de salida están selladas por la magia de Morcar. Objetivos obligatorios: 1) Derrotar al Jefe (${currentLivingBoss.name}) [Pendiente], 2) Limpiar la mazmorra (${currentRemainingMonsters.length} monstruos restantes).`,
              'danger'
            );
          } else if (currentLivingBoss) {
            addLog(
              `⚠️ Las escaleras de salida están bloqueadas. ¡Debes encontrar y destruir al Jefe (${currentLivingBoss.name}) antes de poder escapar!`,
              'danger'
            );
          } else {
            addLog(
              `⚠️ Las escaleras están selladas. Has derrotado al Jefe, pero aún quedan ${currentRemainingMonsters.length} monstruo(s) acechando en la mazmorra. ¡Debéis purgar el escenario por completo!`,
              'danger'
            );
          }
        }
      }
    },
    [movementRemaining, validHeroMoveDestinations, activeQuest, activeHero, addLog]
  );

  // Directional move (for Arrow keys, WASD, and D-Pad with ally pass-through!)
  const handleDirectionalMove = useCallback(
    (dir: 'up' | 'down' | 'left' | 'right') => {
      if (movementRemaining <= 0 || activeHero.isDead || isMorcarTurn) return;

      let dx = 0;
      let dy = 0;
      if (dir === 'up') dy = -1;
      else if (dir === 'down') dy = 1;
      else if (dir === 'left') dx = -1;
      else if (dir === 'right') dx = 1;

      const targetX = activeHero.x + dx;
      const targetY = activeHero.y + dy;

      // 1. Direct 1-step move to adjacent empty tile
      if (validHeroMoveDestinations.some((d) => d.x === targetX && d.y === targetY)) {
        handleTileClick(targetX, targetY);
        return;
      }

      // 2. Check if an ally is occupying the immediate adjacent square
      const allyInPath = heroes.find(
        (h) => !h.isDead && h.id !== activeHero.id && h.x === targetX && h.y === targetY
      );

      if (allyInPath) {
        // Look ahead 2, 3, or 4 steps in this direction for an empty valid destination
        let leapDest: { x: number; y: number } | null = null;
        for (let step = 2; step <= 4; step++) {
          const testX = activeHero.x + step * dx;
          const testY = activeHero.y + step * dy;
          if (validHeroMoveDestinations.some((d) => d.x === testX && d.y === testY)) {
            leapDest = { x: testX, y: testY };
            break;
          }
        }

        if (leapDest) {
          handleTileClick(leapDest.x, leapDest.y);
          return;
        } else {
          if (movementRemaining < 2) {
            addLog(
              `⚠️ Te faltan puntos de movimiento (${movementRemaining} restante) para rebasar a ${allyInPath.name}. ¡No puedes detenerte en su casilla!`,
              'danger'
            );
          } else {
            addLog(
              `⚠️ El paso tras ${allyInPath.name} está bloqueado por un muro, puerta cerrada o monstruo.`,
              'danger'
            );
          }
          audio.playBlock();
          return;
        }
      }

      // 3. Check if blocked by a monster (HeroQuest: monsters CANNOT be passed through!)
      const monsterAtTile = activeQuest.monsters.find(
        (m) => !m.isDead && m.revealed && m.x === targetX && m.y === targetY
      );
      if (monsterAtTile) {
        addLog(`⚠️ No puedes atravesar a ${monsterAtTile.name} ni ocupar su casilla.`, 'danger');
        audio.playBlock();
        return;
      }

      // 4. Other solid obstacles (walls, closed doors)
      audio.playBlock();
    },
    [movementRemaining, activeHero, isMorcarTurn, validHeroMoveDestinations, heroes, activeQuest.monsters, handleTileClick, addLog]
  );

  // Keyboard navigation listener (Arrow keys and WASD)
  useEffect(() => {
    if (gamePhase !== 'dungeon' || isMorcarTurn || activeHero.isAI || activeHero.isDead) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (combatState || showSpellDialog || showInstructions || showLore || showSkills || outcomeState.isOpen) {
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleDirectionalMove('up');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleDirectionalMove('down');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleDirectionalMove('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleDirectionalMove('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gamePhase,
    isMorcarTurn,
    activeHero,
    combatState,
    showSpellDialog,
    showInstructions,
    showLore,
    showSkills,
    outcomeState,
    handleDirectionalMove,
  ]);

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

    addLog(`🚪 ${activeHero.name} abre la puerta de roble. ¡La sala se revela con sus peligros!`, 'info');
  };

  // ACTION: Open Adjacent Door from button
  const handleOpenAdjacentDoor = () => {
    if (adjacentDoors.length > 0) {
      handleOpenDoor(adjacentDoors[0]);
    }
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

    addLog(`📦 ${activeHero.name} abre el ${furn.name} y encuentra ${finalGold} monedas de oro!`, 'loot');
  };

  // ACTION: Search Adjacent Furniture from button
  const handleSearchAdjacentFurniture = () => {
    if (adjacentFurniture.length > 0) {
      handleFurnitureClick(adjacentFurniture[0]);
    }
  };

  // ACTION: Trigger Unlocked Active Special Skill
  const handleUseActiveSkill = () => {
    if (hasActed || activeHero.isDead || !unlockedActiveSkill) return;

    if (unlockedActiveSkill.effect === 'whirlwind_attack') {
      // Barbarian: strikes all adjacent monsters
      const adjacentMonsters = activeQuest.monsters.filter((m) => {
        if (m.isDead || !m.revealed) return false;
        const dx = Math.abs(m.x - activeHero.x);
        const dy = Math.abs(m.y - activeHero.y);
        return Math.max(dx, dy) === 1;
      });

      if (adjacentMonsters.length === 0) {
        audio.playBlock();
        addLog(`⚠️ Torbellino requiere al menos un monstruo adyacente para ser ejecutado.`, 'combat');
        return;
      }

      audio.playFanfare();
      setHasActed(true);
      addLog(`🌪️ ¡${activeHero.name} desata el Golpe Circular Torbellino barriendo con su acero!`, 'combat');

      const updatedMonsters = activeQuest.monsters.map((m) => {
        if (adjacentMonsters.some((adj) => adj.id === m.id)) {
          const newHp = Math.max(0, m.bodyPoints - 2);
          return { ...m, bodyPoints: newHp, isDead: newHp <= 0 };
        }
        return m;
      });
      setActiveQuest((prev) => ({ ...prev, monsters: updatedMonsters }));
      addLog(`⚔️ ¡El Torbellino hiere a ${adjacentMonsters.length} enemigos infligiendo 2 de daño a cada uno!`, 'combat');
    } else if (unlockedActiveSkill.effect === 'shatter_blow') {
      // Dwarf: Impacto demoledor
      const adjacentMonsters = activeQuest.monsters.filter((m) => {
        if (m.isDead || !m.revealed) return false;
        const dx = Math.abs(m.x - activeHero.x);
        const dy = Math.abs(m.y - activeHero.y);
        return Math.max(dx, dy) === 1;
      });

      if (adjacentMonsters.length === 0) {
        audio.playBlock();
        addLog(`⚠️ Impacto Demoledor requiere un enemigo adyacente.`, 'combat');
        return;
      }

      const target = adjacentMonsters[0];
      audio.playFanfare();
      setHasActed(true);
      const newHp = Math.max(0, target.bodyPoints - 3);
      const updatedMonsters = activeQuest.monsters.map((m) =>
        m.id === target.id ? { ...m, bodyPoints: newHp, isDead: newHp <= 0 } : m
      );
      setActiveQuest((prev) => ({ ...prev, monsters: updatedMonsters }));
      addLog(`🔨 ¡${activeHero.name} aplasta a ${target.name} con un Impacto Demoledor sin posibilidad de defensa! (-3 PV)`, 'combat');
    } else if (unlockedActiveSkill.effect === 'recharge_spell') {
      // Elf: Armonía Silvana
      const spentSpell = activeHero.spells.find((s) => s.isUsed);
      if (!spentSpell) {
        audio.playBlock();
        addLog(`⚠️ Todos tus hechizos elementales están listos para ser invocados.`, 'info');
        return;
      }
      audio.playSpell();
      setHasActed(true);
      const updatedSpells = activeHero.spells.map((s) => (s.id === spentSpell.id ? { ...s, isUsed: false } : s));
      const updatedHero = { ...activeHero, spells: updatedSpells };
      setHeroes((prev) => prev.map((h) => (h.id === updatedHero.id ? updatedHero : h)));
      addLog(`🍃 ¡${activeHero.name} canaliza la Armonía Silvana y recarga el hechizo: ${spentSpell.name}!`, 'spell');
    } else if (unlockedActiveSkill.effect === 'arcane_nova') {
      // Wizard: Nova Cósmica
      const currentRoom = getRoomAt(activeHero.x, activeHero.y);
      if (!currentRoom) {
        audio.playBlock();
        addLog(`⚠️ Nova Cósmica debe ser canalizada en el interior de una sala de la mazmorra.`, 'info');
        return;
      }
      const roomMonsters = activeQuest.monsters.filter((m) => m.roomId === currentRoom.id && !m.isDead);
      if (roomMonsters.length === 0) {
        audio.playBlock();
        addLog(`⚠️ No hay criaturas del Caos en esta sala para purificar.`, 'info');
        return;
      }
      audio.playSpell();
      setHasActed(true);
      const updatedMonsters = activeQuest.monsters.map((m) => {
        if (m.roomId === currentRoom.id && !m.isDead) {
          const newHp = Math.max(0, m.bodyPoints - 2);
          return { ...m, bodyPoints: newHp, isDead: newHp <= 0 };
        }
        return m;
      });
      setActiveQuest((prev) => ({ ...prev, monsters: updatedMonsters }));
      addLog(`💥 ¡${activeHero.name} desata la Nova Cósmica de Loretome dañando a todas las criaturas de la sala!`, 'spell');
    }
  };

  // ACTION: Attack Monster
  const handleMonsterClick = (monster: Monster) => {
    if (activeHero.isDead || combatState) return;

    if (hasActed) {
      audio.playBlock();
      addLog(
        `⚠️ ${activeHero.name} ya realizó su acción este asalto. En HeroQuest solo se permite 1 acción por turno. Pulsa "FIN DEL TURNO" para avanzar la ronda.`,
        'info'
      );
      return;
    }

    const hasCrossbow = activeHero.inventory.some((i) => i.rangedAttack);
    const dx = Math.abs(monster.x - activeHero.x);
    const dy = Math.abs(monster.y - activeHero.y);
    const isAdjacent = dx <= 1 && dy <= 1 && (dx + dy > 0);
    const inRange = hasCrossbow ? dx + dy <= 5 : isAdjacent;

    if (!inRange) {
      audio.playBlock();
      if (activeHero.heroClass === 'wizard') {
        const readySpells = activeHero.spells.filter((s) => !s.isUsed).length;
        addLog(
          `🧙‍♂️ ${activeHero.name} (Mago) no puede alcanzar a ${monster.name} cuerpo a cuerpo. ¡Haz clic en el botón azul "HECHIZO" (${readySpells} disponibles) para dañarlo a distancia con tus conjuros!`,
          'info'
        );
      } else {
        addLog(
          `⚔️ ${monster.name} está fuera de alcance para ${activeHero.name}. Para atacar cuerpo a cuerpo debes desplazarte hasta una casilla contigua al enemigo (1 casilla).`,
          'info'
        );
      }
      return;
    }

    if (monster.isBoss) {
      addLog(`⚡ ¡COMBATE CONTRA EL JEFE! ${activeHero.name} ataca a ${monster.name}!`, 'danger');
    }

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
      isBoss: Boolean(monster.isBoss),
    });
  };

  // ACTION: Initiate Attack from Action Console Button
  const handleInitiateAttack = () => {
    if (activeHero.isDead || combatState) return;

    if (hasActed) {
      audio.playBlock();
      addLog(
        `⚠️ ${activeHero.name} ya realizó su acción este turno (buscar tesoros, trampas o atacar). En HeroQuest solo se permite 1 acción por ronda. Pulsa "FIN DEL TURNO".`,
        'info'
      );
      return;
    }

    if (targetableMonsters.length > 0) {
      const firstTarget = activeQuest.monsters.find((m) => targetableMonsters.includes(m.id));
      if (firstTarget) handleMonsterClick(firstTarget);
    } else {
      audio.playBlock();
      if (activeHero.heroClass === 'wizard') {
        const readySpells = activeHero.spells.filter((s) => !s.isUsed).length;
        addLog(
          `🧙‍♂️ ${activeHero.name} (Mago) porta una Daga corta y no tiene monstruos adyacentes a 1 casilla. ¡Usa el botón "HECHIZO" (${readySpells} disponibles) para atacar a distancia con magia!`,
          'info'
        );
      } else {
        addLog(
          `⚔️ No hay criaturas a 1 casilla de ${activeHero.name}. Para atacar cuerpo a cuerpo debes desplazarte hasta quedar pegado a un enemigo.`,
          'info'
        );
      }
    }
  };

  // ACTION: Toggle Hero AI / Manual mode on the fly
  const handleToggleHeroAI = (heroId: string) => {
    audio.playStep();
    setHeroes((prev) =>
      prev.map((h) => {
        if (h.id === heroId) {
          const nextState = !h.isAI;
          addLog(
            `${nextState ? '🤖' : '👤'} ${h.name} ahora está en modo ${nextState ? 'CONTROL POR IA' : 'CONTROL MANUAL (JUGADOR)'}.`,
            'info'
          );
          return { ...h, isAI: nextState };
        }
        return h;
      })
    );
  };

  // Finish Morcar's turn cleanly and advance to the first living hero with fresh action & move state
  const finishMorcarTurn = useCallback(() => {
    isMorcarProcessing.current = false;
    setActiveActorOverride(null);
    setPendingMonsterQueue([]);
    setIsMorcarTurn(false);
    setRoundNumber((prev) => prev + 1);

    const firstLivingIndex = heroes.findIndex((h) => !h.isDead && h.bodyPoints > 0);
    const targetIndex = firstLivingIndex >= 0 ? firstLivingIndex : 0;
    setActiveHeroIndex(targetIndex);
    setMovementRemaining(0);
    setHasRolledMovement(false);
    setHasActed(false);
    aiVisitedThisTurn.current.clear();
    addLog(`✨ NUEVA RONDA: Comienza el turno de ${heroes[targetIndex].name}.`, 'turn');
  }, [heroes, addLog]);

  // Execute next monster attack in Morcar's sequence:
  const executeNextMonsterAttack = useCallback(
    (
      queue: Monster[],
      currentHeroes: Hero[],
      currentMonsters: Monster[]
    ) => {
      let nextMonster: Monster | null = null;
      let targetHero: Hero | null = null;
      let remainingQueue: Monster[] = [];

      for (let i = 0; i < queue.length; i++) {
        const candidate = queue[i];
        const freshMonster = currentMonsters.find((m) => m.id === candidate.id && !m.isDead);
        if (!freshMonster) continue;

        // Find LIVING adjacent heroes (strictly excluding any dead heroes!)
        const livingAdjacent = currentHeroes.filter((h) => {
          if (h.isDead || h.bodyPoints <= 0) return false;
          const dx = Math.abs(h.x - freshMonster.x);
          const dy = Math.abs(h.y - freshMonster.y);
          const isAdj = dx <= 1 && dy <= 1 && (dx + dy > 0);
          if (!isAdj) return false;
          return canCrossBoundary(freshMonster.x, freshMonster.y, h.x, h.y, activeQuest.rooms, activeQuest.doors);
        });

        if (livingAdjacent.length > 0) {
          nextMonster = freshMonster;
          targetHero = livingAdjacent[0];
          remainingQueue = queue.slice(i + 1);
          break;
        }
      }

      if (!nextMonster || !targetHero) {
        // No further monster attacks possible in this turn
        isMorcarProcessing.current = false;
        setActiveActorOverride(null);
        finishMorcarTurn();
        return;
      }

      // Roll fresh combat dice at attack execution time with targetHero's current HP!
      const atkRoll = rollCombatDice(nextMonster.attackDice);
      const defRoll = rollCombatDice(targetHero.defendDice);
      const hits = atkRoll.skulls;
      const blocks = defRoll.whiteShields;
      const dmg = Math.max(0, hits - blocks);

      setPendingMonsterQueue(remainingQueue);
      setActiveActorOverride({ x: nextMonster.x, y: nextMonster.y });

      setCombatState({
        attackerName: nextMonster.name,
        attackerType: 'monster',
        attackerAttackDice: nextMonster.attackDice,
        defenderName: targetHero.name,
        defenderType: 'hero',
        defenderDefendDice: targetHero.defendDice,
        defenderBodyPoints: targetHero.bodyPoints,
        attackerRoll: atkRoll,
        defenderRoll: defRoll,
        damageDealt: dmg,
        resolved: false,
        targetId: targetHero.id,
        isBoss: Boolean(nextMonster.isBoss),
      });
    },
    [activeQuest.rooms, activeQuest.doors, finishMorcarTurn]
  );

  // Resolve Combat Modal
  const handleConfirmCombat = () => {
    if (!combatState) return;

    const { targetId, damageDealt = 0, defenderName, attackerName, defenderType, isBoss } = combatState;

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
          const updatedHero: Hero = {
            ...activeHero,
            gold: activeHero.gold + monster.bountyGold,
            skillPoints: activeHero.skillPoints + monster.bountyExp,
          };
          setHeroes((prev) => prev.map((h) => (h.id === updatedHero.id ? updatedHero : h)));

          const otherMonstersRemaining = updatedMonsters.filter((m) => !m.isDead).length;
          const isBossAlive = updatedMonsters.some((m) => m.isBoss && !m.isDead);

          if (isBoss) {
            if (otherMonstersRemaining === 0) {
              addLog(
                `🏆 ¡EL JEFE SUPREMO ${monster.name.toUpperCase()} HA SIDO ANIQUILADO Y LA MAZMORRA ESTÁ PURGADA! Gana +${monster.bountyGold}🪙 y +${monster.bountyExp}💎 PH. ¡Dirigíos a las escaleras de salida para escapar con la victoria!`,
                'loot'
              );
            } else {
              addLog(
                `⚡ ¡EL JEFE SUPREMO ${monster.name.toUpperCase()} HA CAÍDO! Gana +${monster.bountyGold}🪙 y +${monster.bountyExp}💎 PH. Aún quedan ${otherMonstersRemaining} monstruos acechando. ¡Debéis eliminarlos a todos para desbloquear la salida!`,
                'combat'
              );
            }
          } else {
            if (!isBossAlive && otherMonstersRemaining === 0) {
              addLog(
                `🎉 ¡Todos los monstruos han sido erradicados y el Jefe derrotado! Gana +${monster.bountyGold}🪙 y +${monster.bountyExp}💎 PH. ¡La mazmorra está despejada! ¡Id a las escaleras de salida!`,
                'loot'
              );
            } else {
              addLog(
                `⚔️ ¡${attackerName} destruye a ${monster.name}! Gana +${monster.bountyGold}🪙 y +${monster.bountyExp}💎 PH. (${otherMonstersRemaining} monstruos restantes)`,
                'combat'
              );
            }
          }
        } else {
          addLog(
            `⚔️ ${attackerName} asesta ${damageDealt} daño a ${monster.name}. (Le quedan ${remainingHp} PV)`,
            'combat'
          );
        }
      }

      // Hero attacked on their turn -> consumes this hero's action
      setCombatState(null);
      setHasActed(true);
    } else {
      // Monster attacked Hero during Morcar's turn
      const hero = heroes.find((h) => h.id === targetId);
      let updatedHeroesList = heroes;

      if (hero) {
        const remainingHp = Math.max(0, hero.bodyPoints - damageDealt);
        const isDead = remainingHp <= 0;

        const updatedHero: Hero = {
          ...hero,
          bodyPoints: remainingHp,
          isDead,
        };

        updatedHeroesList = heroes.map((h) => (h.id === updatedHero.id ? updatedHero : h));
        setHeroes(updatedHeroesList);

        if (isDead) {
          audio.playDamage();
          addLog(`💀 ¡${hero.name} ha caído en combate ante el ataque de ${attackerName}!`, 'danger');

          const allDead = updatedHeroesList.every((h) => h.isDead);
          if (allDead) {
            setCombatState(null);
            setPendingMonsterQueue([]);
            isMorcarProcessing.current = false;
            setActiveActorOverride(null);
            setOutcomeState({ isOpen: true, isVictory: false });
            return;
          }
        } else {
          addLog(`🛡️ ${attackerName} hiere a ${hero.name} infligiendo ${damageDealt} de daño.`, 'combat');
        }
      }

      setCombatState(null);
      setHasActed(false);

      if (pendingMorcarCallbackRef.current) {
        const cb = pendingMorcarCallbackRef.current;
        pendingMorcarCallbackRef.current = null;
        cb();
        return;
      }

      if (pendingMonsterQueue.length > 0) {
        executeNextMonsterAttack(pendingMonsterQueue, updatedHeroesList, activeQuest.monsters);
        return;
      }

      // Conclude Morcar's turn cleanly
      isMorcarProcessing.current = false;
      setActiveActorOverride(null);
      finishMorcarTurn();
    }
  };

  // ACTION: Search Room for Treasure
  const handleSearchTreasure = () => {
    if (!activeRoom || hasActed || activeHero.isDead) return;

    audio.playLoot();

    const updatedRooms = activeQuest.rooms.map((r) =>
      r.id === activeRoom.id ? { ...r, treasureSearched: true } : r
    );
    setActiveQuest((prev) => ({ ...prev, rooms: updatedRooms }));

    const rand = Math.random();
    if (rand < 0.45) {
      const gold = Math.floor(Math.random() * 40) + 20;
      const updatedHero: Hero = { ...activeHero, gold: activeHero.gold + gold };
      setHeroes((prev) => prev.map((h) => (h.id === updatedHero.id ? updatedHero : h)));
      addLog(`💰 ${activeHero.name} encuentra un cofre oculto con ${gold} monedas de oro!`, 'loot');
    } else if (rand < 0.75) {
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
      addLog(`🧪 ¡${activeHero.name} halla una Poción de Curación milagrosa!`, 'loot');
    } else {
      audio.playTrap();
      addLog(`⚠️ ¡EMBOSCADA! Un Goblin surge de las grietas atacando a ${activeHero.name}!`, 'trap');
      const dirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
      ];
      let ambushPos = { x: activeHero.x + 1, y: activeHero.y };
      for (const { dx, dy } of dirs) {
        const ax = activeHero.x + dx;
        const ay = activeHero.y + dy;
        const isOccHero = heroes.some((h) => !h.isDead && h.x === ax && h.y === ay);
        const isOccMon = activeQuest.monsters.some((m) => !m.isDead && m.x === ax && m.y === ay);
        if (!isOccHero && !isOccMon) {
          ambushPos = { x: ax, y: ay };
          break;
        }
      }

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
        x: ambushPos.x,
        y: ambushPos.y,
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
      addLog(`⚠️ ¡${activeHero.name} detecta con pericia ${foundCount} trampa(s) mortal(es)!`, 'trap');
    } else {
      addLog(`🔍 ${activeHero.name} inspecciona las losas: No hay trampas perceptibles.`, 'info');
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

    if (activeHero.heroClass === 'dwarf') {
      audio.playLoot();
      nearbyTrap.sprung = true;
      const updatedHero: Hero = { ...activeHero, gold: activeHero.gold + 25, skillPoints: activeHero.skillPoints + 1 };
      setHeroes((prev) => prev.map((h) => (h.id === updatedHero.id ? updatedHero : h)));
      addLog(
        `⛏️ ¡${activeHero.name} (Enano) neutraliza la trampa a la perfección y recupera 25🪙!`,
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
        addLog(`💥 ¡FALLO! La trampa detonó hiriendo a ${activeHero.name}.`, 'trap');
      } else {
        audio.playLoot();
        nearbyTrap.sprung = true;
        addLog(`🛠️ ¡${activeHero.name} desactiva la trampa con éxito!`, 'loot');
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
        addLog(`✨ ¡${activeHero.name} lanza ${spell.name} curando ${spell.value} PV a ${ally.name}!`, 'spell');
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
          addLog(`🔥 ¡El conjuro ${spell.name} calcina y destruye a ${monster.name}!`, 'spell');
          if (monster.isBoss) {
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
        addLog(`🪨 ¡${activeHero.name} otorga ${spell.name} (+1 Dado Def) a ${ally.name}!`, 'spell');
      }
    } else if (spell.effectType === 'sleep' || spell.effectType === 'tempest') {
      const monster = activeQuest.monsters.find((m) => m.id === targetId);
      if (monster) {
        addLog(`💤 ¡${monster.name} queda sumido en letargo mágico por ${spell.name}!`, 'spell');
      }
    }

    setHasActed(true);
  };

  // Next Hero or switch to Morcar
  const handleEndTurn = useCallback(() => {
    setMovementRemaining(0);
    setHasRolledMovement(false);
    setHasActed(false);
    aiVisitedThisTurn.current.clear();

    let nextIndex = activeHeroIndex + 1;
    while (nextIndex < heroes.length && heroes[nextIndex].isDead) {
      nextIndex++;
    }

    if (nextIndex >= heroes.length) {
      setIsMorcarTurn(true);
      addLog(`💀 TURNO DE MORCAR: ¡Las criaturas de las tinieblas se movilizan y atacan!`, 'danger');
    } else {
      setActiveHeroIndex(nextIndex);
      addLog(`Turno de ${heroes[nextIndex].name} (${heroes[nextIndex].title}).`, 'turn');
    }
  }, [activeHeroIndex, heroes, addLog]);

  // Morcar's Turn: MONSTERS ADVANCE STEP-BY-STEP AND ATTACK (Cinematic step animation with camera auto-focus!)
  const handleMorcarStep = () => {
    if (isMorcarProcessing.current || combatState) return;

    audio.playDamage();

    const livingHeroes = heroes.filter((h) => !h.isDead && h.bodyPoints > 0);
    if (livingHeroes.length === 0) {
      setOutcomeState({ isOpen: true, isVictory: false });
      return;
    }

    isMorcarProcessing.current = true;

    // Filter active, revealed, living monsters
    const activeMonsters = activeQuest.monsters.filter((m) => !m.isDead && m.revealed);

    if (activeMonsters.length === 0) {
      addLog(`Las sombras permanecen en calma. No hay criaturas despiertas.`, 'info');
      isMorcarProcessing.current = false;
      setActiveActorOverride(null);
      finishMorcarTurn();
      return;
    }

    let mIdx = 0;
    let latestMonsters = [...activeQuest.monsters];

    const processNextMonster = () => {
      if (mIdx >= activeMonsters.length) {
        // All monsters processed!
        isMorcarProcessing.current = false;
        setActiveActorOverride(null);
        finishMorcarTurn();
        return;
      }

      const monsterRef = activeMonsters[mIdx];
      mIdx++;

      // Verify monster is still alive
      const currentMonster = latestMonsters.find((m) => m.id === monsterRef.id && !m.isDead);
      if (!currentMonster) {
        processNextMonster();
        return;
      }

      const freshLivingHeroes = heroes.filter((h) => !h.isDead && h.bodyPoints > 0);
      if (freshLivingHeroes.length === 0) {
        isMorcarProcessing.current = false;
        setActiveActorOverride(null);
        setOutcomeState({ isOpen: true, isVictory: false });
        return;
      }

      // Compute movement path with latest monster positions!
      const movePath = getMonsterMovePath(currentMonster, activeQuest, freshLivingHeroes, latestMonsters);

      // Focus camera on monster before it moves
      setActiveActorOverride({ x: currentMonster.x, y: currentMonster.y });

      if (movePath.length === 0) {
        // Monster doesn't move. Check if it can attack!
        checkMonsterAttackAndProceed(currentMonster, freshLivingHeroes);
      } else {
        // Animate movement tile-by-tile
        let stepIdx = 0;
        addLog(`👹 ${currentMonster.name} avanza ${movePath.length} casillas acechando a los héroes.`, 'danger');

        const moveInterval = setInterval(() => {
          if (stepIdx >= movePath.length) {
            clearInterval(moveInterval);
            // Finished moving! Check attack
            const finalPos = movePath[movePath.length - 1];
            latestMonsters = latestMonsters.map((m) => (m.id === currentMonster.id ? { ...m, x: finalPos.x, y: finalPos.y } : m));
            const updatedFreshMonster = { ...currentMonster, x: finalPos.x, y: finalPos.y };
            checkMonsterAttackAndProceed(updatedFreshMonster, freshLivingHeroes);
            return;
          }

          const nextTile = movePath[stepIdx];
          stepIdx++;

          // Synchronize local tracking array
          latestMonsters = latestMonsters.map((m) => (m.id === currentMonster.id ? { ...m, x: nextTile.x, y: nextTile.y } : m));

          // Update monster position in quest state
          setActiveQuest((prev) => ({
            ...prev,
            monsters: prev.monsters.map((m) => (m.id === currentMonster.id ? { ...m, x: nextTile.x, y: nextTile.y } : m)),
          }));

          // Focus camera on current step tile & play step sound
          setActiveActorOverride({ x: nextTile.x, y: nextTile.y });
          audio.playStep();
        }, 220);
      }
    };

    const checkMonsterAttackAndProceed = (monster: Monster, freshLivingHeroes: Hero[]) => {
      // Find reachable adjacent living heroes
      const reachableHeroes = freshLivingHeroes.filter((hero) => {
        const dx = Math.abs(hero.x - monster.x);
        const dy = Math.abs(hero.y - monster.y);
        const isAdj = dx <= 1 && dy <= 1 && (dx + dy > 0);
        if (!isAdj) return false;
        return canCrossBoundary(monster.x, monster.y, hero.x, hero.y, activeQuest.rooms, activeQuest.doors);
      });

      if (reachableHeroes.length > 0) {
        const targetHero = reachableHeroes[0];
        const atkRoll = rollCombatDice(monster.attackDice);
        const defRoll = rollCombatDice(targetHero.defendDice);
        const hits = atkRoll.skulls;
        const blocks = defRoll.whiteShields;
        const dmg = Math.max(0, hits - blocks);

        // Store callback to resume after combat modal
        pendingMorcarCallbackRef.current = () => {
          setTimeout(processNextMonster, 300);
        };

        setActiveActorOverride({ x: monster.x, y: monster.y });

        setCombatState({
          attackerName: monster.name,
          attackerType: 'monster',
          attackerAttackDice: monster.attackDice,
          defenderName: targetHero.name,
          defenderType: 'hero',
          defenderDefendDice: targetHero.defendDice,
          defenderBodyPoints: targetHero.bodyPoints,
          attackerRoll: atkRoll,
          defenderRoll: defRoll,
          damageDealt: dmg,
          resolved: false,
          targetId: targetHero.id,
          isBoss: Boolean(monster.isBoss),
        });
      } else {
        // No attack possible, proceed to next monster
        setTimeout(processNextMonster, 180);
      }
    };

    processNextMonster();
  };

  // Automated Smart AI Hero behavior with full resource management
  useEffect(() => {
    if (gamePhase !== 'dungeon' || isMorcarTurn || !activeHero.isAI || activeHero.isDead || combatState) {
      return;
    }

    const aiTimer = setTimeout(() => {
      // 0. Emergency Potion Drink if HP is low (<= 50% HP or <= 3 HP)
      if (activeHero.bodyPoints <= Math.ceil(activeHero.maxBodyPoints * 0.5)) {
        const potionIdx = activeHero.inventory.findIndex(
          (i) => i.type === 'potion' || i.name.toLowerCase().includes('poción')
        );
        if (potionIdx >= 0) {
          audio.playLoot();
          const potion = activeHero.inventory[potionIdx];
          const newHp = Math.min(activeHero.maxBodyPoints, activeHero.bodyPoints + 4);
          const updatedInventory = activeHero.inventory.filter((_, idx) => idx !== potionIdx);
          const updatedHero = { ...activeHero, bodyPoints: newHp, inventory: updatedInventory };
          setHeroes((prev) => prev.map((h) => (h.id === updatedHero.id ? updatedHero : h)));
          addLog(
            `🧪 ¡${activeHero.name} (IA) bebe una ${potion.name} y recupera 4 PV! (${newHp}/${activeHero.maxBodyPoints} PV)`,
            'loot'
          );
          return;
        }
      }

      // 0b. Smart Auto-Purchase Skills if affordable!
      const affordableSkill = activeHero.skills.find(
        (s) =>
          !s.unlocked &&
          activeHero.skillPoints >= s.costSkillPoints &&
          activeHero.gold >= s.costGold &&
          (!s.reqSkillId || activeHero.skills.some((req) => req.id === s.reqSkillId && req.unlocked))
      );

      if (affordableSkill) {
        audio.playFanfare();
        const updatedSkills = activeHero.skills.map((s) => (s.id === affordableSkill.id ? { ...s, unlocked: true } : s));
        const bonusAtk = affordableSkill.passiveBonus?.attackDice || 0;
        const bonusDef = affordableSkill.passiveBonus?.defendDice || 0;
        const bonusHp = affordableSkill.passiveBonus?.maxBodyPoints || 0;

        const updatedHero: Hero = {
          ...activeHero,
          gold: activeHero.gold - affordableSkill.costGold,
          skillPoints: activeHero.skillPoints - affordableSkill.costSkillPoints,
          skills: updatedSkills,
          attackDice: activeHero.attackDice + bonusAtk,
          defendDice: activeHero.defendDice + bonusDef,
          maxBodyPoints: activeHero.maxBodyPoints + bonusHp,
          bodyPoints: activeHero.bodyPoints + bonusHp,
        };
        setHeroes((prev) => prev.map((h) => (h.id === updatedHero.id ? updatedHero : h)));
        addLog(
          `✨ ¡${activeHero.name} (IA) invierte sus recursos y desbloquea la habilidad: ${affordableSkill.name}!`,
          'spell'
        );
        return;
      }

      // Auto-buy Healing Potion if gold >= 100 and inventory has room
      if (activeHero.gold >= 120 && activeHero.inventory.length < 5) {
        const potionCount = activeHero.inventory.filter((i) => i.type === 'potion').length;
        if (potionCount < 2) {
          audio.playLoot();
          const newPotion = {
            id: `potion_ai_${Date.now()}`,
            name: 'Poción de Curación',
            type: 'potion' as const,
            description: 'Restaura hasta 4 Puntos de Cuerpo perdidos.',
            cost: 80,
            usableBy: ['barbarian', 'dwarf', 'elf', 'wizard'] as HeroClass[],
            icon: '🧪',
            consumable: true,
            effect: 'heal_4' as const,
          };
          const updatedHero: Hero = {
            ...activeHero,
            gold: activeHero.gold - 80,
            inventory: [...activeHero.inventory, newPotion],
          };
          setHeroes((prev) => prev.map((h) => (h.id === updatedHero.id ? updatedHero : h)));
          addLog(`🛍️ ¡${activeHero.name} (IA) compra una Poción de Curación en la Armería (80🪙)!`, 'loot');
          return;
        }
      }

      // 1. Roll movement dice first if not rolled yet
      if (!hasRolledMovement) {
        handleRollMovement();
        return;
      }

      // 2. Check if can cast heal spell on self or injured ally
      if (canCastSpell) {
        const healSpell = activeHero.spells.find((s) => !s.isUsed && s.effectType === 'heal');
        if (healSpell) {
          const injuredAlly = heroes.find((h) => !h.isDead && h.bodyPoints < h.maxBodyPoints);
          if (injuredAlly) {
            handleCastSpell(healSpell, injuredAlly.id, 'hero');
            return;
          }
        }
      }

      // 3. If adjacent unsearched furniture is present, search it!
      if (!hasActed && adjacentFurniture.length > 0) {
        handleSearchAdjacentFurniture();
        return;
      }

      // 4. If in room with no monsters and room hasn't been searched for treasure, search treasure!
      if (!hasActed && canSearchTreasure) {
        handleSearchTreasure();
        return;
      }

      // 5. Disarm trap if adjacent
      if (!hasActed && canDisarmTrap) {
        handleDisarmTrap();
        return;
      }

      // 6. If targetable monster is present, attack!
      if (targetableMonsters.length > 0 && !hasActed) {
        const targetMonster = activeQuest.monsters.find((m) => m.id === targetableMonsters[0]);
        if (targetMonster) {
          handleMonsterClick(targetMonster);
          return;
        }
      }

      // 7. If closed door is adjacent, open it!
      if (adjacentDoors.length > 0) {
        handleOpenDoor(adjacentDoors[0]);
        return;
      }

      // 8. Use smart BFS pathfinder (supporting ally pass-through!) towards monsters, doors, or party leader
      if (movementRemaining > 0) {
        const smartStep = getSmartAIMove(
          activeHero,
          activeQuest,
          heroes,
          activeQuest.monsters,
          aiVisitedThisTurn.current,
          movementRemaining
        );

        if (smartStep) {
          aiVisitedThisTurn.current.add(`${smartStep.x},${smartStep.y}`);
          handleTileClick(smartStep.x, smartStep.y);
          return;
        }
      }

      // 9. End turn
      handleEndTurn();
    }, 700);

    return () => clearTimeout(aiTimer);
  }, [
    gamePhase,
    isMorcarTurn,
    activeHero,
    hasRolledMovement,
    hasActed,
    movementRemaining,
    targetableMonsters,
    adjacentDoors,
    adjacentFurniture,
    canSearchTreasure,
    canSearchTraps,
    canDisarmTrap,
    canCastSpell,
    combatState,
    activeQuest,
    heroes,
    handleEndTurn,
    handleTileClick,
  ]);

  // Restart quest on victory/defeat
  const handleNextOrRetry = () => {
    if (selectedQuest.id.startsWith('procedural')) {
      startRandomQuest();
    } else {
      startQuest(selectedQuest);
    }
  };

  const handleDescendNextFloor = () => {
    const nextFloor = currentFloor + 1;
    setCurrentFloor(nextFloor);
    const newFloorQuest = generateProceduralQuest({ floorLevel: nextFloor, dungeonSize: 'epic' });
    setSelectedQuest(newFloorQuest);
    startQuest(newFloorQuest);
    addLog(`🏰 ¡La escuadra desciende al Piso ${nextFloor} de las catacumbas! Nuevos peligros y riquezas os aguardan.`, 'loot');
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
          onStartRandomGame={startRandomQuest}
          onGenerateRandomQuest={() => startRandomQuest()}
          onOpenInstructions={() => setShowInstructions(true)}
          onOpenLore={(heroClass) => {
            if (heroClass) setInitialLoreHero(heroClass);
            setShowLore(true);
          }}
          onOpenSkills={() => setShowSkills(true)}
        />
      ) : (
        /* Dungeon Exploration & Board View: VIEWPORT-LOCKED WITH PINNED COMMAND DOCK */
        <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-[#080706]">
          {/* Main Dungeon Arena: Scrollable board arena with auto-focus centering */}
          <main className="flex-1 h-full overflow-auto flex flex-col items-center justify-start p-4 sm:p-8 relative select-none min-h-0">
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
              allObjectivesComplete={areAllObjectivesComplete}
              activeActorTile={activeActorTile}
            />
          </main>

          {/* Pinned Fixed Command Dock: Active Hero & Actions without clutter */}
          <HUD
            quest={activeQuest}
            heroes={heroes}
            activeHeroIndex={activeHeroIndex}
            isMorcarTurn={isMorcarTurn}
            roundNumber={roundNumber}
            movementRemaining={movementRemaining}
            hasRolledMovement={hasRolledMovement}
            hasActed={hasActed}
            canAttack={canAttack}
            canCastSpell={canCastSpell}
            canSearchTreasure={canSearchTreasure}
            canSearchTraps={canSearchTraps}
            canDisarmTrap={canDisarmTrap}
            adjacentDoors={adjacentDoors}
            adjacentFurniture={adjacentFurniture}
            logs={logs}
            isBossDefeated={isBossDefeated}
            bossName={bossName}
            livingMonstersCount={livingMonstersCount}
            isDungeonCleared={isDungeonCleared}
            areAllObjectivesComplete={areAllObjectivesComplete}
            unlockedActiveSkill={unlockedActiveSkill}
            onUseActiveSkill={handleUseActiveSkill}
            onRollMovement={handleRollMovement}
            onInitiateAttack={handleInitiateAttack}
            onToggleHeroAI={handleToggleHeroAI}
            onOpenSpellCast={() => setShowSpellDialog(true)}
            onSearchTreasure={handleSearchTreasure}
            onSearchTraps={handleSearchTraps}
            onDisarmTrap={handleDisarmTrap}
            onOpenAdjacentDoor={handleOpenAdjacentDoor}
            onSearchAdjacentFurniture={handleSearchAdjacentFurniture}
            onDirectionalMove={handleDirectionalMove}
            onEndTurn={handleEndTurn}
            onMorcarStep={handleMorcarStep}
            onOpenSkills={() => setShowSkills(true)}
            onOpenInstructions={() => setShowInstructions(true)}
            onOpenLore={() => setShowLore(true)}
            onReturnToTitle={() => setGamePhase('title')}
            onGenerateRandomDungeon={startRandomQuest}
            onOpenPartyOverview={() => setShowPartyModal(true)}
            onOpenQuestBriefing={() => setShowQuestBriefing(true)}
            onOpenGameLogs={() => setShowLogsModal(true)}
            isCombatActive={Boolean(combatState)}
          />
        </div>
      )}

      {/* Combat Resolution Modal with Boss banner support */}
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
          isBoss={combatState.isBoss}
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
        onDescendNextFloor={handleDescendNextFloor}
      />

      {/* Floating Party Overview Modal */}
      <PartyOverviewModal
        isOpen={showPartyModal}
        onClose={() => setShowPartyModal(false)}
        heroes={heroes}
        activeHeroIndex={activeHeroIndex}
        onToggleHeroAI={handleToggleHeroAI}
        onOpenSkills={() => setShowSkills(true)}
      />

      {/* Floating Quest Briefing & Objectives Modal */}
      <QuestBriefingModal
        isOpen={showQuestBriefing}
        onClose={() => setShowQuestBriefing(false)}
        quest={activeQuest}
        isBossDefeated={isBossDefeated}
        bossName={bossName}
        livingMonstersCount={livingMonstersCount}
        areAllObjectivesComplete={areAllObjectivesComplete}
      />

      {/* Floating Complete Game Log Modal */}
      <GameLogModal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        logs={logs}
      />
    </div>
  );
}
