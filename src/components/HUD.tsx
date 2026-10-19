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
  Clock,
  ChevronRight,
  ListFilter,
  CheckCircle2,
} from 'lucide-react';
import { Hero, Quest, GameLog, Monster } from '../types/heroquest';
import { HeroPortrait } from './PixelIcons';
import { audio } from '../utils/audio';

interface HUDProps {
  quest: Quest;
  heroes: Hero[];
  activeHeroIndex: number;
  isMorcarTurn: boolean;
  roundNumber: number;
  movementRemaining: number;
  hasMoved: boolean;
  hasActed: boolean;
  canAttack: boolean;
  canCastSpell: boolean;
  canSearchTreasure: boolean;
  canSearchTraps: boolean;
  canDisarmTrap: boolean;
  logs: GameLog[];
  onRollMovement: () => void;
  onInitiateAttack: () => void;
  onOpenSpellCast: () => void;
  onSearchTreasure: () => void;
  onSearchTraps: () => void;
  onDisarmTrap: () => void;
  onEndTurn: () => void;
  onMorcarStep: () => void;
  onOpenSkills: () => void;
  onOpenInstructions: () => void;
  onOpenLore: () => void;
  onReturnToTitle: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  quest,
  heroes,
  activeHeroIndex,
  isMorcarTurn,
  roundNumber,
  movementRemaining,
  hasMoved,
  hasActed,
  canAttack,
  canCastSpell,
  canSearchTreasure,
  canSearchTraps,
  canDisarmTrap,
  logs,
  onRollMovement,
  onInitiateAttack,
  onOpenSpellCast,
  onSearchTreasure,
  onSearchTraps,
  onDisarmTrap,
  onEndTurn,
  onMorcarStep,
  onOpenSkills,
  onOpenInstructions,
  onOpenLore,
  onReturnToTitle,
}) => {
  const [showLogDrawer, setShowLogDrawer] = useState(false);
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

  return (
    <div className="w-full flex flex-col space-y-3">
      {/* Top Bar: Quest title, round & global navigation */}
      <div className="bg-stone-900 border-2 border-stone-700 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToTitle}
            className="px-2.5 py-1.5 bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-amber-300 font-pixel text-[10px] rounded border border-stone-800"
          >
            ← MENÚ
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-xs text-amber-300">
                MISIÓN {quest.number}: {quest.title}
              </span>
              <span className="text-[10px] font-pixel bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                RONDA {roundNumber}
              </span>
            </div>
            <div className="text-xs text-stone-400 font-medieval italic">{quest.objective}</div>
          </div>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex items-center gap-2">
          {/* Always Present Skills Button */}
          <button
            onClick={onOpenSkills}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-stone-950 font-pixel text-xs rounded border border-yellow-300 shadow flex items-center gap-1.5 font-bold transition cursor-pointer"
            title="Árbol de Habilidades, Armería y Equipamiento"
          >
            <Award className="w-4 h-4" />
            <span>HABILIDADES & TIENDA</span>
          </button>

          <button
            onClick={onOpenInstructions}
            className="px-2.5 py-1.5 bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-amber-300 font-pixel text-[10px] rounded border border-stone-700 flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">REGLAS</span>
          </button>

          <button
            onClick={onOpenLore}
            className="px-2.5 py-1.5 bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-amber-300 font-pixel text-[10px] rounded border border-stone-700 flex items-center gap-1"
          >
            <Scroll className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">HISTORIA</span>
          </button>

          <button
            onClick={handleToggleSound}
            className={`p-1.5 rounded border font-pixel text-[10px] ${
              soundMuted ? 'bg-red-950 border-red-700 text-red-400' : 'bg-stone-950 border-stone-800 text-stone-400'
            }`}
            title="Efectos de sonido"
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleToggleBgm}
            className={`p-1.5 rounded border font-pixel text-[10px] ${
              bgmActive ? 'bg-amber-950 border-amber-600 text-amber-300 animate-pulse' : 'bg-stone-950 border-stone-800 text-stone-400'
            }`}
            title="Música Chiptune 16-bits"
          >
            <Music className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Party Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {heroes.map((hero, idx) => {
          const isActive = !isMorcarTurn && idx === activeHeroIndex;
          return (
            <div
              key={hero.id}
              className={`p-2.5 rounded-lg border-2 transition relative flex flex-col justify-between ${
                hero.isDead
                  ? 'bg-stone-950/40 border-stone-800 opacity-50'
                  : isActive
                  ? 'bg-amber-950/70 border-amber-400 shadow-lg scale-102 ring-2 ring-amber-500/50'
                  : 'bg-stone-900/80 border-stone-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <HeroPortrait heroClass={hero.heroClass} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-[11px] text-stone-200 truncate">{hero.name}</span>
                    {isActive && (
                      <span className="text-[9px] font-pixel bg-amber-500 text-stone-950 px-1 rounded animate-pulse font-bold">
                        TURNO
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-400 font-medieval truncate">{hero.title}</div>
                </div>
              </div>

              {/* Mini Stats */}
              <div className="grid grid-cols-2 gap-1 mt-2 text-[10px] font-pixel">
                <div className="flex items-center gap-1 text-red-400">
                  <Heart className="w-3 h-3" />
                  <span>
                    {hero.bodyPoints}/{hero.maxBodyPoints}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-blue-400">
                  <Brain className="w-3 h-3" />
                  <span>
                    {hero.mindPoints}/{hero.maxMindPoints}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1 pt-1 border-t border-stone-800 text-[9px] font-pixel text-stone-400">
                <span className="text-amber-400">{hero.gold} 🪙</span>
                <span className="text-cyan-400">{hero.skillPoints} 💎 PH</span>
                <span className="text-stone-300">
                  ⚔️{hero.attackDice} 🛡️{hero.defendDice}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Action Console */}
      <div className="bg-stone-900 border-2 border-stone-700 rounded-lg p-4 shadow-2xl">
        {isMorcarTurn ? (
          /* MORCAR'S TURN BANNER */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-purple-950/60 border-2 border-purple-700 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💀</span>
              <div>
                <h3 className="font-pixel text-sm text-purple-300">TURNO DE MORCAR (ZARGON)</h3>
                <p className="text-xs text-purple-200/80 font-medieval italic">
                  Las criaturas de las tinieblas acechan, se desplazan y atacan a los intrusos
                </p>
              </div>
            </div>

            <button
              onClick={onMorcarStep}
              className="px-6 py-2.5 bg-purple-700 hover:bg-purple-600 text-stone-100 font-pixel text-xs rounded border-2 border-purple-400 shadow transition flex items-center gap-2 cursor-pointer font-bold"
            >
              EJECUTAR TURNO DE MORCAR <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* HERO'S TURN ACTIONS */
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2">
              <div className="flex items-center gap-2 font-pixel text-xs">
                <span className="text-amber-400">TURNO ACTUAL:</span>
                <span className="text-stone-100">{activeHero.name} ({activeHero.title})</span>
                {activeHero.isAI && (
                  <span className="bg-purple-900 text-purple-200 text-[10px] px-1.5 py-0.5 rounded">
                    CONTROL IA
                  </span>
                )}
              </div>

              {/* Movement dice step counter */}
              <div className="flex items-center gap-2 text-xs font-pixel">
                <span className="text-stone-400">PASOS RESTANTES:</span>
                <span className="text-emerald-400 text-sm font-bold bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                  {movementRemaining}
                </span>
              </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {/* 1. Move Button */}
              <button
                onClick={onRollMovement}
                disabled={hasMoved || activeHero.isDead}
                className={`py-2 px-2 rounded font-pixel text-[10px] flex flex-col items-center justify-center gap-1 border transition ${
                  hasMoved || activeHero.isDead
                    ? 'bg-stone-950 text-stone-600 border-stone-800 cursor-not-allowed'
                    : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-600 shadow-md cursor-pointer'
                }`}
              >
                <Footprints className="w-4 h-4" />
                <span>MOVER (2d6)</span>
              </button>

              {/* 2. Attack Button */}
              <button
                onClick={onInitiateAttack}
                disabled={hasActed || !canAttack || activeHero.isDead}
                className={`py-2 px-2 rounded font-pixel text-[10px] flex flex-col items-center justify-center gap-1 border transition ${
                  hasActed || !canAttack || activeHero.isDead
                    ? 'bg-stone-950 text-stone-600 border-stone-800 cursor-not-allowed'
                    : 'bg-red-950 hover:bg-red-900 text-red-300 border-red-600 shadow-md cursor-pointer animate-pulse'
                }`}
              >
                <Swords className="w-4 h-4" />
                <span>ATACAR</span>
              </button>

              {/* 3. Cast Spell */}
              <button
                onClick={onOpenSpellCast}
                disabled={hasActed || !canCastSpell || activeHero.isDead}
                className={`py-2 px-2 rounded font-pixel text-[10px] flex flex-col items-center justify-center gap-1 border transition ${
                  hasActed || !canCastSpell || activeHero.isDead
                    ? 'bg-stone-950 text-stone-600 border-stone-800 cursor-not-allowed'
                    : 'bg-blue-950 hover:bg-blue-900 text-blue-300 border-blue-600 shadow-md cursor-pointer'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>HECHIZO</span>
              </button>

              {/* 4. Search Treasure */}
              <button
                onClick={onSearchTreasure}
                disabled={hasActed || !canSearchTreasure || activeHero.isDead}
                className={`py-2 px-2 rounded font-pixel text-[10px] flex flex-col items-center justify-center gap-1 border transition ${
                  hasActed || !canSearchTreasure || activeHero.isDead
                    ? 'bg-stone-950 text-stone-600 border-stone-800 cursor-not-allowed'
                    : 'bg-amber-950 hover:bg-amber-900 text-amber-300 border-amber-600 shadow-md cursor-pointer'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>BUSCAR TESORO</span>
              </button>

              {/* 5. Search Traps */}
              <button
                onClick={onSearchTraps}
                disabled={hasActed || !canSearchTraps || activeHero.isDead}
                className={`py-2 px-2 rounded font-pixel text-[10px] flex flex-col items-center justify-center gap-1 border transition ${
                  hasActed || !canSearchTraps || activeHero.isDead
                    ? 'bg-stone-950 text-stone-600 border-stone-800 cursor-not-allowed'
                    : 'bg-yellow-950 hover:bg-yellow-900 text-yellow-300 border-yellow-600 shadow-md cursor-pointer'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>TRAMPAS</span>
              </button>

              {/* 6. Disarm Trap (if near detected trap) */}
              <button
                onClick={onDisarmTrap}
                disabled={!canDisarmTrap || hasActed || activeHero.isDead}
                className={`py-2 px-2 rounded font-pixel text-[10px] flex flex-col items-center justify-center gap-1 border transition ${
                  !canDisarmTrap || hasActed || activeHero.isDead
                    ? 'bg-stone-950 text-stone-600 border-stone-800 cursor-not-allowed'
                    : 'bg-teal-950 hover:bg-teal-900 text-teal-300 border-teal-600 shadow-md cursor-pointer'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>DESARMAR</span>
              </button>

              {/* 7. End Turn */}
              <button
                onClick={onEndTurn}
                className="py-2 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 rounded font-pixel text-[10px] flex flex-col items-center justify-center gap-1 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>FIN TURNO</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Combat & Dungeon Event Log */}
      <div className="bg-stone-950 border border-stone-800 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 font-pixel text-[11px] text-stone-400">
            <ListFilter className="w-3.5 h-3.5 text-amber-500" />
            <span>CRÓNICA DE LA MAZMORRA (REGISTRO):</span>
          </div>
          <span className="text-[10px] text-stone-500 font-pixel">Últimos eventos</span>
        </div>

        <div className="space-y-1 max-h-24 overflow-y-auto text-xs font-serif leading-relaxed pr-1">
          {logs.slice(-5).map((log) => (
            <div
              key={log.id}
              className={`p-1 rounded ${
                log.type === 'combat'
                  ? 'text-red-300 bg-red-950/20'
                  : log.type === 'spell'
                  ? 'text-blue-300 bg-blue-950/20'
                  : log.type === 'loot'
                  ? 'text-amber-300 bg-amber-950/20'
                  : log.type === 'trap'
                  ? 'text-yellow-300 bg-yellow-950/20'
                  : 'text-stone-300'
              }`}
            >
              <span className="text-stone-500 text-[10px] mr-2 font-mono">[{log.timestamp}]</span>
              {log.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
