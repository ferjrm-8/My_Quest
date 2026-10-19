import React, { useState } from 'react';
import { Play, BookOpen, Scroll, Award, Users, Bot, User, Volume2, VolumeX, Music, Shield } from 'lucide-react';
import { Hero, HeroClass, Quest } from '../types/heroquest';
import { HeroPortrait } from './PixelIcons';
import { audio } from '../utils/audio';

interface TitleScreenProps {
  heroes: Hero[];
  quests: Quest[];
  selectedQuest: Quest;
  onSelectQuest: (quest: Quest) => void;
  onUpdateHeroConfig: (heroes: Hero[]) => void;
  onStartGame: () => void;
  onOpenInstructions: () => void;
  onOpenLore: (initialHero?: HeroClass) => void;
  onOpenSkills: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  heroes,
  quests,
  selectedQuest,
  onSelectQuest,
  onUpdateHeroConfig,
  onStartGame,
  onOpenInstructions,
  onOpenLore,
  onOpenSkills,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [bgmActive, setBgmActive] = useState<boolean>(audio.getBgmState());
  const [soundMuted, setSoundMuted] = useState<boolean>(audio.isMuted());

  const handlePlayerCountChange = (count: number) => {
    audio.playLoot();
    setPlayerCount(count);
    // Assign heroes: first N heroes are players, remaining are AI companions
    const updated = heroes.map((h, idx) => ({
      ...h,
      isAI: idx >= count,
      playerIndex: idx < count ? idx : -1,
    }));
    onUpdateHeroConfig(updated);
  };

  const handleToggleHeroAI = (heroId: string) => {
    audio.playStep();
    const updated = heroes.map((h) => {
      if (h.id === heroId) {
        return { ...h, isAI: !h.isAI };
      }
      return h;
    });
    onUpdateHeroConfig(updated);
  };

  const handleToggleBgm = () => {
    const state = audio.toggleBGM();
    setBgmActive(state);
  };

  const handleToggleSound = () => {
    const isEnabled = audio.toggleMute();
    setSoundMuted(!isEnabled);
    if (!isEnabled) {
      setBgmActive(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-stone-950 flex flex-col justify-between overflow-x-hidden p-4 md:p-6 select-none crt-overlay">
      {/* Top Bar with Audio Controls & 16-Bit Brand */}
      <div className="relative z-10 flex items-center justify-between border-b-2 border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
          <span className="font-pixel text-[11px] text-amber-500 tracking-wider">
            16-BIT EDITION • MB / GAMES WORKSHOP EMULATION
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded border font-pixel text-[10px] flex items-center gap-1.5 transition ${
              soundMuted
                ? 'bg-red-950/80 border-red-700 text-red-400'
                : 'bg-stone-900 border-stone-700 text-stone-300 hover:text-amber-300'
            }`}
            title="Activar/Silenciar Efectos de Sonido"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundMuted ? 'MUDO' : 'SFX'}</span>
          </button>

          <button
            onClick={handleToggleBgm}
            className={`p-2 rounded border font-pixel text-[10px] flex items-center gap-1.5 transition ${
              bgmActive
                ? 'bg-amber-950/80 border-amber-600 text-amber-300 animate-pulse'
                : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'
            }`}
            title="Activar/Desactivar Música Chiptune Retro 16-bits"
          >
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline">{bgmActive ? 'MÚSICA: ON' : 'MÚSICA: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Heroic Title Logo Area */}
      <div className="relative z-10 my-6 text-center">
        <div className="inline-block relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-600 rounded-lg blur-lg opacity-30 animate-pulse" />
          <div className="relative px-6 py-4 bg-stone-900 border-4 border-amber-500 shadow-2xl rounded-lg">
            <h1 className="font-pixel text-3xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-700 tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)]">
              HERO QUEST
            </h1>
            <div className="font-medieval text-lg sm:text-2xl text-red-400 tracking-widest mt-1 font-bold">
              ⚔️ CRÓNICAS DE MORCAR ⚔️
            </div>
            <div className="font-pixel text-[9px] sm:text-[11px] text-stone-400 mt-2">
              EMULADOR TÁCTICO DE MAZMORRAS • DADOS DE COMBATE • MAGIA ELEMENTAL
            </div>
          </div>
        </div>
      </div>

      {/* Main Configuration Panels */}
      <div className="relative z-10 max-w-5xl mx-auto w-full grid md:grid-cols-12 gap-6 my-2">
        {/* Left Column: Player Count & Party Selection */}
        <div className="md:col-span-7 bg-stone-900/90 border-2 border-stone-700 rounded-lg p-5 shadow-xl space-y-5">
          {/* Step 1: Player count selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel text-xs text-amber-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                1. NÚMERO DE JUGADORES (1 - 4):
              </span>
              <span className="text-[10px] text-stone-400 font-pixel">
                {playerCount === 1 ? '1 Jugador + 3 IA aliadas' : `${playerCount} Jugadores cooperativos`}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => handlePlayerCountChange(count)}
                  className={`py-2 rounded font-pixel text-xs transition border flex flex-col items-center gap-1 ${
                    playerCount === count
                      ? 'bg-amber-600 text-stone-950 border-amber-300 font-bold shadow-lg scale-102'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <span>{count} JUG</span>
                  <span className="text-[9px] opacity-75">{count === 1 ? 'Solo/IA' : 'Coop'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Heroes list & control mode */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel text-xs text-amber-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                2. CUADRILLA DE HÉROES (4 CAMPEONES):
              </span>
              <span className="text-[10px] text-stone-400 italic font-medieval">
                Haz clic para alternar Humano / IA
              </span>
            </div>

            <div className="space-y-2.5">
              {heroes.map((hero) => (
                <div
                  key={hero.id}
                  className="flex items-center justify-between bg-stone-950/80 p-2.5 rounded border border-stone-800 hover:border-amber-800/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <HeroPortrait heroClass={hero.heroClass} size={42} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-xs text-stone-200">{hero.name}</span>
                        <span className="text-[11px] text-stone-400 font-medieval italic">({hero.title})</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-pixel text-stone-400 mt-0.5">
                        <span className="text-red-400">❤️ {hero.bodyPoints} PV</span>
                        <span className="text-blue-400">🧠 {hero.mindPoints} PM</span>
                        <span className="text-amber-400">⚔️ {hero.attackDice}D</span>
                        <span className="text-emerald-400">🛡️ {hero.defendDice}D</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenLore(hero.heroClass)}
                      className="px-2 py-1 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-amber-300 text-[10px] font-pixel rounded border border-stone-700"
                      title="Ver Historia y Lore"
                    >
                      LORE
                    </button>

                    <button
                      onClick={() => handleToggleHeroAI(hero.id)}
                      className={`px-3 py-1.5 rounded font-pixel text-[10px] flex items-center gap-1.5 border transition ${
                        hero.isAI
                          ? 'bg-purple-950/80 border-purple-600 text-purple-300'
                          : 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                      }`}
                    >
                      {hero.isAI ? (
                        <>
                          <Bot className="w-3.5 h-3.5" /> IA
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5" /> JUGADOR
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quest Selection & Direct Menu Access */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-4">
          {/* Quest Selection Box */}
          <div className="bg-stone-900/90 border-2 border-stone-700 rounded-lg p-5 shadow-xl space-y-3">
            <span className="font-pixel text-xs text-amber-400 flex items-center gap-2">
              <Scroll className="w-4 h-4 text-amber-400" />
              3. SELECCIÓN DE MISIÓN:
            </span>

            <div className="space-y-2">
              {quests.map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    audio.playStep();
                    onSelectQuest(q);
                  }}
                  className={`w-full p-3 text-left rounded border transition ${
                    selectedQuest.id === q.id
                      ? 'bg-amber-950/70 border-amber-500 shadow-md'
                      : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-xs text-amber-300">
                      MISIÓN {q.number}: {q.title}
                    </span>
                    <span className="text-[10px] text-amber-400 font-pixel">{q.rewardGold} 🪙</span>
                  </div>
                  <div className="text-xs text-stone-400 font-medieval italic mt-1">{q.subtitle}</div>
                </button>
              ))}
            </div>

            <div className="bg-stone-950 p-3 rounded border border-stone-800 text-xs space-y-1">
              <span className="font-pixel text-[10px] text-stone-400">OBJETIVO PRINCIPAL:</span>
              <p className="text-stone-300 text-xs italic">{selectedQuest.objective}</p>
            </div>
          </div>

          {/* Quick Access Menu Cards (Rules, Lore, Skills) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onOpenInstructions}
              className="p-3 bg-stone-900 hover:bg-stone-800 border-2 border-amber-900 hover:border-amber-600 rounded flex flex-col items-center justify-center text-center gap-1.5 transition text-amber-300"
            >
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span className="font-pixel text-[9px]">REGLAS & GUÍA</span>
            </button>

            <button
              onClick={() => onOpenLore()}
              className="p-3 bg-stone-900 hover:bg-stone-800 border-2 border-amber-900 hover:border-amber-600 rounded flex flex-col items-center justify-center text-center gap-1.5 transition text-amber-300"
            >
              <Scroll className="w-5 h-5 text-amber-400" />
              <span className="font-pixel text-[9px]">HISTORIA LORE</span>
            </button>

            <button
              onClick={onOpenSkills}
              className="p-3 bg-stone-900 hover:bg-stone-800 border-2 border-amber-900 hover:border-amber-600 rounded flex flex-col items-center justify-center text-center gap-1.5 transition text-amber-300"
            >
              <Award className="w-5 h-5 text-cyan-400" />
              <span className="font-pixel text-[9px]">HABILIDADES</span>
            </button>
          </div>

          {/* START GAME BUTTON */}
          <button
            onClick={() => {
              audio.playFanfare();
              onStartGame();
            }}
            className="w-full py-4 bg-gradient-to-r from-red-700 via-amber-600 to-red-700 hover:from-red-600 hover:via-amber-500 hover:to-red-600 text-stone-950 font-pixel text-base rounded-lg border-4 border-yellow-400 shadow-2xl transition transform hover:scale-102 active:scale-98 flex items-center justify-center gap-3 font-bold cursor-pointer"
          >
            <Play className="w-6 h-6 fill-stone-950" />
            ¡DESCENDER A LA MAZMORRA!
          </button>
        </div>
      </div>

      {/* Bottom Footer Quote */}
      <div className="relative z-10 text-center text-xs text-stone-500 font-medieval border-t border-stone-800 pt-3">
        «El peligro aguarda tras cada puerta de roble, pero la gloria del Imperio es eterna.» — Mentor
      </div>
    </div>
  );
};
