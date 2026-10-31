import React, { useState } from 'react';
import {
  Footprints,
  Swords,
  Sparkles,
  Coins,
  AlertTriangle,
  Award,
  BookOpen,
  Scroll,
  Volume2,
  VolumeX,
  Music,
  Heart,
  Brain,
  Shield,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  DoorOpen,
  Package,
  Users,
  ScrollText,
  User,
  Bot,
} from 'lucide-react';
import { Hero, Quest, GameLog, Door, Furniture } from '../types/heroquest';
import { HeroPortrait } from './PixelIcons';
import { audio } from '../utils/audio';

interface HUDProps {
  quest: Quest;
  heroes: Hero[];
  activeHeroIndex: number;
  isMorcarTurn: boolean;
  roundNumber: number;
  movementRemaining: number;
  hasRolledMovement: boolean;
  hasActed: boolean;
  canAttack: boolean;
  canCastSpell: boolean;
  canSearchTreasure: boolean;
  canSearchTraps: boolean;
  canDisarmTrap: boolean;
  adjacentDoors: Door[];
  adjacentFurniture: Furniture[];
  logs: GameLog[];
  isBossDefeated: boolean;
  bossName: string;
  livingMonstersCount: number;
  isDungeonCleared: boolean;
  areAllObjectivesComplete: boolean;
  unlockedActiveSkill?: { name: string; icon: string; description: string; effect: string } | null;
  onUseActiveSkill?: () => void;
  onRollMovement: () => void;
  onInitiateAttack: () => void;
  onOpenSpellCast: () => void;
  onSearchTreasure: () => void;
  onSearchTraps: () => void;
  onDisarmTrap: () => void;
  onOpenAdjacentDoor?: () => void;
  onSearchAdjacentFurniture?: () => void;
  onDirectionalMove?: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onEndTurn: () => void;
  onMorcarStep: () => void;
  onOpenSkills: () => void;
  onOpenInstructions: () => void;
  onOpenLore: () => void;
  onReturnToTitle: () => void;
  onGenerateRandomDungeon?: () => void;
  onToggleHeroAI?: (heroId: string) => void;
  onOpenPartyOverview?: () => void;
  onOpenQuestBriefing?: () => void;
  onOpenGameLogs?: () => void;
  isCombatActive?: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  quest,
  heroes,
  activeHeroIndex,
  isMorcarTurn,
  roundNumber,
  movementRemaining,
  hasRolledMovement,
  hasActed,
  canAttack,
  canCastSpell,
  canSearchTreasure,
  canSearchTraps,
  canDisarmTrap,
  adjacentDoors,
  adjacentFurniture,
  logs,
  isBossDefeated,
  bossName,
  livingMonstersCount,
  isDungeonCleared,
  areAllObjectivesComplete,
  unlockedActiveSkill,
  onUseActiveSkill,
  onRollMovement,
  onInitiateAttack,
  onOpenSpellCast,
  onSearchTreasure,
  onSearchTraps,
  onDisarmTrap,
  onOpenAdjacentDoor,
  onSearchAdjacentFurniture,
  onDirectionalMove,
  onEndTurn,
  onMorcarStep,
  onOpenSkills,
  onOpenInstructions,
  onOpenLore,
  onReturnToTitle,
  onGenerateRandomDungeon,
  onToggleHeroAI,
  onOpenPartyOverview,
  onOpenQuestBriefing,
  onOpenGameLogs,
  isCombatActive = false,
}) => {
  const [bgmActive, setBgmActive] = useState(audio.getBgmState());
  const [soundMuted, setSoundMuted] = useState(audio.isMuted());

  const activeHero = heroes[activeHeroIndex] || heroes[0];

  const handleToggleSound = () => {
    const isEnabled = audio.toggleMute();
    setSoundMuted(!isEnabled);
    if (!isEnabled) setBgmActive(false);
  };

  const handleToggleBgm = () => {
    const state = audio.toggleBGM();
    setBgmActive(state);
  };

  // Get most recent 4 logs as requested
  const recentLogs = logs.slice(-4);

  return (
    <aside className="w-full md:w-84 lg:w-96 bg-stone-900 border-t-2 md:border-t-0 md:border-l-2 border-stone-800 flex flex-col justify-between shrink-0 shadow-2xl z-20 overflow-y-auto max-h-[45vh] md:max-h-full">
      {/* 1. TOP DOCKED BAR: Navigation, Modals & Quick Menu */}
      <div className="p-3 bg-stone-950 border-b border-stone-800/80 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={onReturnToTitle}
            className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-amber-300 font-pixel text-[10px] rounded border border-stone-800 transition cursor-pointer"
            title="Volver a la Pantalla de Inicio"
          >
            ← MENÚ
          </button>

          <div className="flex items-center gap-1.5">
            <span className="font-pixel text-[10px] text-amber-400 font-bold">R{roundNumber}</span>
            <span className="text-stone-600">|</span>
            <span className={`text-[9px] font-pixel px-1.5 py-0.5 rounded border font-bold ${
              areAllObjectivesComplete
                ? 'bg-yellow-500 text-stone-950 border-yellow-300 animate-pulse'
                : 'bg-stone-900 text-stone-400 border-stone-800'
            }`}>
              {areAllObjectivesComplete ? '✨ SALIDA LIBRE' : '🔒 SALIDA SELLADA'}
            </span>
          </div>

          {/* Sound & Music Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleSound}
              className={`p-1.5 rounded border text-xs transition cursor-pointer ${
                soundMuted
                  ? 'bg-red-950 border-red-700 text-red-400'
                  : 'bg-stone-900 border-stone-700 text-stone-300 hover:text-amber-400'
              }`}
              title={soundMuted ? 'Activar Efectos SFX' : 'Silenciar SFX'}
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleToggleBgm}
              className={`p-1.5 rounded border text-xs transition cursor-pointer ${
                bgmActive
                  ? 'bg-amber-950 border-amber-600 text-amber-300 animate-pulse'
                  : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-amber-400'
              }`}
              title={bgmActive ? 'Música Mazmorra Activa' : 'Activar Música BGM'}
            >
              <Music className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Access Drawer Buttons */}
        <div className="grid grid-cols-4 gap-1 pt-1 border-t border-stone-800/80 text-[9px] font-pixel">
          <button
            onClick={onOpenPartyOverview}
            className="py-1 px-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-800 rounded flex items-center justify-center gap-1 transition cursor-pointer font-bold"
            title="Ver estado de todos los héroes"
          >
            <Users className="w-3 h-3 text-cyan-400" />
            <span>GRUPO</span>
          </button>

          <button
            onClick={onOpenQuestBriefing}
            className="py-1 px-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-800 rounded flex items-center justify-center gap-1 transition cursor-pointer font-bold"
            title="Ver objetivos y progreso de la misión"
          >
            <Scroll className="w-3 h-3 text-amber-400" />
            <span>MISIÓN</span>
          </button>

          <button
            onClick={onOpenSkills}
            className="py-1 px-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-yellow-300 border border-stone-800 rounded flex items-center justify-center gap-1 transition cursor-pointer font-bold"
            title="Árbol de Habilidades y Armería"
          >
            <Award className="w-3 h-3 text-yellow-400" />
            <span>MEJORAS</span>
          </button>

          <button
            onClick={onOpenInstructions}
            className="py-1 px-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-800 rounded flex items-center justify-center gap-1 transition cursor-pointer font-bold"
            title="Reglas del juego"
          >
            <BookOpen className="w-3 h-3 text-stone-400" />
            <span>REGLAS</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN ACTIVE CONTROL BODY */}
      <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
        {isMorcarTurn ? (
          /* MORCAR'S TURN BANNER */
          <div className="bg-purple-950/80 border-2 border-purple-600 p-4 rounded-xl shadow-xl flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
            <span className="text-4xl">💀</span>
            <div>
              <h3 className="font-pixel text-sm text-purple-200 font-bold">TURNO DE MORCAR</h3>
              <p className="text-xs text-purple-300/80 font-medieval mt-1">
                Las criaturas de las sombras acechan, avanzan y atacan a los héroes.
              </p>
            </div>
            <button
              onClick={onMorcarStep}
              disabled={isCombatActive}
              className={`w-full py-3 px-4 bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500 text-white font-pixel text-xs rounded-lg border-2 border-purple-400 shadow-xl transition font-bold flex items-center justify-center gap-2 ${
                isCombatActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <span>{isCombatActive ? 'RESOLVIENDO COMBATE...' : 'EJECUTAR TURNO DE MORCAR'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* ACTIVE HERO'S TURN CARD & ACTIONS */
          <div className="space-y-3">
            {/* Active Hero Profile Card */}
            <div className="bg-stone-950 p-3 rounded-xl border-2 border-amber-500/80 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-3">
                <HeroPortrait heroClass={activeHero.heroClass} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-xs text-stone-100 font-bold truncate">
                      {activeHero.name}
                    </span>
                    {onToggleHeroAI && (
                      <button
                        onClick={() => onToggleHeroAI(activeHero.id)}
                        className={`text-[8px] font-pixel px-1.5 py-0.5 rounded border transition cursor-pointer font-bold ${
                          activeHero.isAI
                            ? 'bg-purple-950 border-purple-500 text-purple-300 hover:bg-purple-900'
                            : 'bg-emerald-950 border-emerald-500 text-emerald-300 hover:bg-emerald-900'
                        }`}
                        title={activeHero.isAI ? 'Modo IA activo. Clic para controlar MANUAL' : 'Modo MANUAL activo. Clic para pasar a IA'}
                      >
                        {activeHero.isAI ? '🤖 IA' : '👤 MANUAL'}
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-400 font-medieval truncate">{activeHero.title}</div>
                </div>
              </div>

              {/* Health and Mind bars */}
              <div className="mt-2.5 space-y-1.5 pt-2 border-t border-stone-800/80">
                <div className="flex items-center justify-between text-[10px] font-pixel">
                  <span className="flex items-center gap-1 text-red-400">
                    <Heart className="w-3 h-3" /> CUERPO (PV):
                  </span>
                  <span className="text-red-300 font-bold">
                    {activeHero.bodyPoints}/{activeHero.maxBodyPoints}
                  </span>
                </div>
                <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden border border-red-950">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.max(0, (activeHero.bodyPoints / activeHero.maxBodyPoints) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-pixel pt-1">
                  <span className="flex items-center gap-1 text-blue-400">
                    <Brain className="w-3 h-3" /> MENTE:
                  </span>
                  <span className="text-blue-300 font-bold">
                    {activeHero.mindPoints}/{activeHero.maxMindPoints}
                  </span>
                </div>
              </div>

              {/* Combat Stats & Gold */}
              <div className="mt-2 pt-2 border-t border-stone-800 flex items-center justify-between text-[10px] font-pixel text-stone-300">
                <span className="flex items-center gap-1">
                  <Swords className="w-3 h-3 text-red-400" /> {activeHero.attackDice} Ataque
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-blue-400" /> {activeHero.defendDice} Defensa
                </span>
                <span className="text-amber-400 font-bold">{activeHero.gold} 🪙</span>
                <span className="text-cyan-400 font-bold">{activeHero.skillPoints} 💎 PH</span>
              </div>
            </div>

            {/* MOVEMENT CONSOLE */}
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={onRollMovement}
                  disabled={hasRolledMovement || activeHero.isDead}
                  className={`flex-1 py-2 px-3 rounded-lg font-pixel text-[10px] flex items-center justify-center gap-1.5 border transition font-bold ${
                    hasRolledMovement || activeHero.isDead
                      ? 'bg-stone-900 text-stone-500 border-stone-800 cursor-not-allowed'
                      : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border-emerald-600 shadow cursor-pointer animate-pulse'
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{hasRolledMovement ? 'DADOS LANZADOS' : 'LANZAR 2d6 MOVIMIENTO'}</span>
                </button>

                {movementRemaining > 0 && (
                  <div className="ml-2 px-2.5 py-1.5 bg-emerald-950/80 border border-emerald-500 rounded-lg text-emerald-300 font-pixel text-xs font-bold animate-pulse">
                    {movementRemaining} PASOS
                  </div>
                )}
              </div>

              {/* Directional Pad when Movement is Available */}
              {movementRemaining > 0 && onDirectionalMove && (
                <div className="flex items-center justify-between pt-1 border-t border-stone-800/80">
                  <span className="text-[10px] font-medieval text-emerald-400 italic">
                    Usa WASD o el crucero:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDirectionalMove('left')}
                      className="p-1.5 bg-stone-800 hover:bg-emerald-800 text-white rounded border border-stone-700 cursor-pointer"
                      title="Izquierda (A)"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => onDirectionalMove('up')}
                        className="p-1.5 bg-stone-800 hover:bg-emerald-800 text-white rounded border border-stone-700 cursor-pointer"
                        title="Arriba (W)"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDirectionalMove('down')}
                        className="p-1.5 bg-stone-800 hover:bg-emerald-800 text-white rounded border border-stone-700 cursor-pointer"
                        title="Abajo (S)"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => onDirectionalMove('right')}
                      className="p-1.5 bg-stone-800 hover:bg-emerald-800 text-white rounded border border-stone-700 cursor-pointer"
                      title="Derecha (D)"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ACTIONS CONSOLE */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-pixel text-stone-400 font-bold px-1">
                ACCIONES DEL ASALTO:
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* 1. Attack Button */}
                <button
                  onClick={onInitiateAttack}
                  disabled={activeHero.isDead}
                  title={
                    hasActed
                      ? 'Acción ya usada este turno. En HeroQuest es 1 acción por ronda.'
                      : !canAttack
                      ? activeHero.heroClass === 'wizard'
                        ? 'Daga cuerpo a cuerpo (1 casilla). ¡Para atacar a distancia usa HECHIZO!'
                        : 'No hay enemigos a 1 casilla (muévete hasta quedar pegado al monstruo para golpearlo).'
                      : '¡Atacar a un monstruo adyacente!'
                  }
                  className={`py-2 px-2.5 rounded-lg font-pixel text-[10px] flex items-center justify-center gap-1.5 border transition cursor-pointer font-bold ${
                    activeHero.isDead
                      ? 'bg-stone-950 text-stone-600 border-stone-800 cursor-not-allowed'
                      : hasActed
                      ? 'bg-stone-950 text-stone-500 border-stone-800'
                      : canAttack
                      ? 'bg-red-900 hover:bg-red-800 text-red-100 border-red-500 shadow-lg animate-pulse ring-2 ring-red-500/50'
                      : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border-stone-700'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5 text-red-400" />
                  <span>
                    {hasActed
                      ? 'ACCIÓN USADA'
                      : canAttack
                      ? '⚔️ ¡ATACAR!'
                      : activeHero.heroClass === 'wizard'
                      ? 'DAGA (1 CAS)'
                      : 'ATACAR (1 CAS)'}
                  </span>
                </button>

                {/* 2. Spell Button */}
                <button
                  onClick={onOpenSpellCast}
                  disabled={hasActed || !canCastSpell || activeHero.isDead}
                  className={`py-2 px-2.5 rounded-lg font-pixel text-[10px] flex items-center justify-center gap-1.5 border transition font-bold ${
                    hasActed || !canCastSpell || activeHero.isDead
                      ? 'bg-stone-950 text-stone-600 border-stone-800 cursor-not-allowed'
                      : 'bg-blue-950 hover:bg-blue-900 text-blue-200 border-blue-600 shadow cursor-pointer animate-pulse'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {activeHero.heroClass === 'wizard' || activeHero.heroClass === 'elf'
                      ? `HECHIZO (${activeHero.spells.filter((s) => !s.isUsed).length})`
                      : 'HECHIZO'}
                  </span>
                </button>

                {/* 3. Search Treasure */}
                <button
                  onClick={onSearchTreasure}
                  disabled={hasActed || !canSearchTreasure || activeHero.isDead}
                  className={`py-2 px-2.5 rounded-lg font-pixel text-[10px] flex items-center justify-center gap-1.5 border transition font-bold ${
                    hasActed || !canSearchTreasure || activeHero.isDead
                      ? 'bg-stone-950 text-stone-600 border-stone-800 cursor-not-allowed'
                      : 'bg-amber-950 hover:bg-amber-900 text-amber-200 border-amber-600 shadow cursor-pointer'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>BUSCAR TESORO</span>
                </button>

                {/* 4. Search Traps */}
                <button
                  onClick={onSearchTraps}
                  disabled={hasActed || !canSearchTraps || activeHero.isDead}
                  className={`py-2 px-2.5 rounded-lg font-pixel text-[10px] flex items-center justify-center gap-1.5 border transition font-bold ${
                    hasActed || !canSearchTraps || activeHero.isDead
                      ? 'bg-stone-950 text-stone-600 border-stone-800 cursor-not-allowed'
                      : 'bg-yellow-950 hover:bg-yellow-900 text-yellow-200 border-yellow-600 shadow cursor-pointer'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                  <span>TRAMPAS</span>
                </button>

                {/* 5. Special Active Skill if Unlocked */}
                {unlockedActiveSkill && onUseActiveSkill && (
                  <button
                    onClick={onUseActiveSkill}
                    disabled={hasActed || activeHero.isDead}
                    className={`col-span-2 py-2 px-2.5 rounded-lg font-pixel text-[10px] flex items-center justify-center gap-2 border-2 transition font-bold ${
                      hasActed || activeHero.isDead
                        ? 'bg-stone-950 text-stone-600 border-stone-800 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-900 to-amber-900 text-yellow-200 border-yellow-400 shadow-lg cursor-pointer animate-pulse'
                    }`}
                  >
                    <span>{unlockedActiveSkill.icon}</span>
                    <span>{unlockedActiveSkill.name}</span>
                  </button>
                )}

                {/* 6. Context Actions: Door / Chest / Disarm */}
                {adjacentDoors.length > 0 && onOpenAdjacentDoor && (
                  <button
                    onClick={onOpenAdjacentDoor}
                    className="col-span-2 py-2 px-2.5 bg-amber-900 hover:bg-amber-800 text-yellow-100 border border-yellow-500 rounded-lg font-pixel text-[10px] flex items-center justify-center gap-1.5 shadow cursor-pointer font-bold animate-pulse"
                  >
                    <DoorOpen className="w-3.5 h-3.5 text-yellow-300" />
                    <span>🚪 ABRIR PUERTA ADYACENTE</span>
                  </button>
                )}

                {adjacentFurniture.length > 0 && onSearchAdjacentFurniture && (
                  <button
                    onClick={onSearchAdjacentFurniture}
                    className="col-span-2 py-2 px-2.5 bg-yellow-900 hover:bg-yellow-800 text-yellow-100 border border-yellow-400 rounded-lg font-pixel text-[10px] flex items-center justify-center gap-1.5 shadow cursor-pointer font-bold animate-pulse"
                  >
                    <Package className="w-3.5 h-3.5 text-yellow-300" />
                    <span>📦 REGISTRAR COFRE / MUEBLE</span>
                  </button>
                )}

                {canDisarmTrap && (
                  <button
                    onClick={onDisarmTrap}
                    disabled={hasActed || activeHero.isDead}
                    className="col-span-2 py-2 px-2.5 bg-teal-950 hover:bg-teal-900 text-teal-200 border border-teal-600 rounded-lg font-pixel text-[10px] flex items-center justify-center gap-1.5 shadow cursor-pointer font-bold"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-teal-400" />
                    <span>🛠️ DESARMAR TRAMPA</span>
                  </button>
                )}
              </div>

              {/* End Hero Turn Button */}
              <div className="pt-2">
                <button
                  onClick={onEndTurn}
                  disabled={activeHero.isDead}
                  className="w-full py-2.5 px-3 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 rounded-lg font-pixel text-xs flex items-center justify-center gap-2 shadow transition cursor-pointer font-bold"
                >
                  <span>PASAR TURNO</span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM MINI LOG TICKER */}
      <div className="p-3 bg-stone-950 border-t border-stone-800/80 shrink-0 space-y-1.5">
        <div className="flex items-center justify-between text-[9px] font-pixel text-stone-500">
          <span className="flex items-center gap-1">
            <ScrollText className="w-3 h-3 text-stone-400" /> REGISTRO RECIENTE:
          </span>
          <button
            onClick={onOpenGameLogs}
            className="text-amber-400 hover:text-amber-300 underline cursor-pointer font-bold"
          >
            Ver Todo ({logs.length})
          </button>
        </div>

        <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
          {recentLogs.map((log) => (
            <div
              key={log.id}
              className="text-[10px] font-medieval text-stone-300 leading-tight bg-stone-900/80 p-1.5 rounded border border-stone-800 flex items-start gap-1.5"
            >
              <span className="text-stone-500 font-pixel text-[8px] shrink-0 mt-0.5">[{log.timestamp}]</span>
              <span className="flex-1">{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
