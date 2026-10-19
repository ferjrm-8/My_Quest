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
  onGenerateRandomQuest?: (size: 'standard' | 'epic') => void;
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
  onGenerateRandomQuest,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [bgmActive, setBgmActive] = useState<boolean>(audio.getBgmState());
  const [soundMuted, setSoundMuted] = useState<boolean>(audio.isMuted());

  const handlePlayerCountChange = (count: number) => {
    audio.playLoot();
    setPlayerCount(count);
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
    <div className="relative min-h-screen w-full bg-stone-950 flex flex-col justify-between overflow-x-hidden p-4 md:p-6 select-none">
      {/* Top Bar with Audio Controls & 16-Bit Brand */}
      <div className="relative z-10 flex items-center justify-between border-b-2 border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
          <span className="font-pixel text-xs text-amber-400 tracking-wider font-bold">
            16-BIT EDITION • MB / GAMES WORKSHOP EMULATION
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded border font-pixel text-xs flex items-center gap-1.5 transition cursor-pointer ${
              soundMuted
                ? 'bg-red-950 border-red-700 text-red-400'
                : 'bg-stone-900 border-stone-700 text-stone-200 hover:text-amber-300'
            }`}
            title="Activar/Silenciar Efectos de Sonido"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline font-bold">{soundMuted ? 'MUDO' : 'SFX'}</span>
          </button>

          <button
            onClick={handleToggleBgm}
            className={`p-2 rounded border font-pixel text-xs flex items-center gap-1.5 transition cursor-pointer ${
              bgmActive
                ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-md animate-pulse'
                : 'bg-stone-900 border-stone-700 text-stone-300 hover:text-stone-100'
            }`}
            title="Activar/Desactivar Música Chiptune Retro 16-bits"
          >
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline font-bold">{bgmActive ? 'MÚSICA: ON' : 'MÚSICA: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Heroic Title Logo Area (Clear & Crisp) */}
      <div className="relative z-10 my-5 text-center">
        <div className="inline-block relative">
          <div className="relative px-8 py-5 bg-stone-900 border-4 border-amber-500 shadow-2xl rounded-lg">
            <h1 className="font-pixel text-4xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-amber-600 tracking-wider drop-shadow-md">
              HERO QUEST
            </h1>
            <div className="font-medieval text-xl sm:text-2xl text-red-400 tracking-widest mt-1 font-bold">
              ⚔️ CRÓNICAS DE MORCAR ⚔️
            </div>
            <div className="font-medieval text-sm sm:text-base text-amber-200/90 tracking-wide mt-2 font-semibold">
              EMULADOR TÁCTICO DE MAZMORRAS • DADOS DE COMBATE • MAGIA ELEMENTAL
            </div>
          </div>
        </div>
      </div>

      {/* Main Configuration Panels */}
      <div className="relative z-10 max-w-5xl mx-auto w-full grid md:grid-cols-12 gap-6 my-2">
        {/* Left Column: Player Count & Party Selection */}
        <div className="md:col-span-7 bg-stone-900 border-2 border-stone-700 rounded-lg p-5 shadow-xl space-y-5">
          {/* Step 1: Player count selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel text-xs text-amber-300 flex items-center gap-2 font-bold">
                <Users className="w-4 h-4 text-amber-400" />
                1. NÚMERO DE JUGADORES (1 - 4):
              </span>
              <span className="text-xs text-stone-300 font-pixel">
                {playerCount === 1 ? '1 Jugador + 3 IA aliadas' : `${playerCount} Jugadores cooperativos`}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => handlePlayerCountChange(count)}
                  className={`py-2.5 rounded font-pixel text-xs transition border flex flex-col items-center gap-1 cursor-pointer ${
                    playerCount === count
                      ? 'bg-amber-600 text-stone-950 border-amber-300 font-bold shadow-lg scale-102 ring-2 ring-amber-400/50'
                      : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-600 hover:text-stone-100'
                  }`}
                >
                  <span className="font-bold">{count} JUG</span>
                  <span className="text-[10px] font-sans font-medium">{count === 1 ? 'Solo/IA' : 'Coop'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Heroes list & control mode */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel text-xs text-amber-300 flex items-center gap-2 font-bold">
                <Shield className="w-4 h-4 text-amber-400" />
                2. CUADRILLA DE HÉROES (4 CAMPEONES):
              </span>
              <span className="text-xs text-stone-400 italic font-medieval">
                Haz clic para alternar Humano / IA
              </span>
            </div>

            <div className="space-y-2.5">
              {heroes.map((hero) => (
                <div
                  key={hero.id}
                  className="flex items-center justify-between bg-stone-950 p-3 rounded-lg border-2 border-stone-800 hover:border-amber-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <HeroPortrait heroClass={hero.heroClass} size={46} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-xs text-amber-300 font-bold">{hero.name}</span>
                        <span className="text-xs text-stone-300 font-medieval italic">({hero.title})</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-pixel mt-1 text-stone-300">
                        <span className="text-red-400 font-bold">❤️ {hero.bodyPoints} PV</span>
                        <span className="text-blue-400 font-bold">🧠 {hero.mindPoints} PM</span>
                        <span className="text-amber-300 font-bold">⚔️ {hero.attackDice}D</span>
                        <span className="text-emerald-400 font-bold">🛡️ {hero.defendDice}D</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenLore(hero.heroClass)}
                      className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 text-xs font-pixel rounded border border-stone-700 cursor-pointer font-bold transition"
                      title="Ver Historia y Lore"
                    >
                      LORE
                    </button>

                    <button
                      onClick={() => handleToggleHeroAI(hero.id)}
                      className={`px-3 py-1.5 rounded font-pixel text-xs flex items-center gap-1.5 border transition cursor-pointer font-bold ${
                        hero.isAI
                          ? 'bg-purple-950 border-purple-500 text-purple-200'
                          : 'bg-emerald-950 border-emerald-500 text-emerald-200'
                      }`}
                    >
                      {hero.isAI ? (
                        <>
                          <Bot className="w-3.5 h-3.5 text-purple-400" /> IA
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5 text-emerald-400" /> JUGADOR
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
          <div className="bg-stone-900 border-2 border-stone-700 rounded-lg p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-xs text-amber-300 flex items-center gap-2 font-bold">
                <Scroll className="w-4 h-4 text-amber-400" />
                3. SELECCIÓN DE MISIÓN:
              </span>
            </div>

            {/* Quick Generator Buttons */}
            {onGenerateRandomQuest && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    audio.playSpell();
                    onGenerateRandomQuest('standard');
                  }}
                  className="p-2 bg-gradient-to-r from-purple-950 to-indigo-950 hover:from-purple-900 hover:to-indigo-900 text-purple-200 rounded border border-purple-500 font-pixel text-[10px] flex items-center justify-center gap-1 font-bold cursor-pointer transition shadow"
                  title="Generar una nueva mazmorra 100% aleatoria"
                >
                  <span>🎲 NUEVA ALEATORIA</span>
                </button>
                <button
                  onClick={() => {
                    audio.playFanfare();
                    onGenerateRandomQuest('epic');
                  }}
                  className="p-2 bg-gradient-to-r from-red-950 to-amber-950 hover:from-red-900 hover:to-amber-900 text-amber-200 rounded border border-amber-500 font-pixel text-[10px] flex items-center justify-center gap-1 font-bold cursor-pointer transition shadow"
                  title="Generar una incursión extendida con 10+ salas y más jefes"
                >
                  <span>🏰 PARTIDA LARGA ÉPICA</span>
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {quests.map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    audio.playStep();
                    onSelectQuest(q);
                  }}
                  className={`w-full p-3 text-left rounded-lg border-2 transition cursor-pointer ${
                    selectedQuest.id === q.id
                      ? 'bg-amber-950/80 border-amber-400 shadow-lg ring-1 ring-amber-400/50'
                      : 'bg-stone-950 border-stone-800 hover:border-stone-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-xs text-amber-300 font-bold">
                      MISIÓN {q.number}: {q.title}
                    </span>
                    <span className="text-xs text-amber-400 font-pixel font-bold">{q.rewardGold} 🪙</span>
                  </div>
                  <div className="text-xs text-stone-300 font-medieval italic mt-1">{q.subtitle}</div>
                </button>
              ))}
            </div>

            <div className="bg-stone-950 p-3.5 rounded-lg border border-stone-800 text-xs space-y-1">
              <span className="font-pixel text-xs text-stone-300 font-bold">OBJETIVO PRINCIPAL:</span>
              <p className="text-amber-100 text-sm font-medieval italic leading-relaxed">{selectedQuest.objective}</p>
            </div>
          </div>

          {/* Quick Access Menu Cards (Rules, Lore, Skills) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onOpenInstructions}
              className="p-3 bg-stone-900 hover:bg-stone-800 border-2 border-amber-800 hover:border-amber-500 rounded-lg flex flex-col items-center justify-center text-center gap-1.5 transition text-amber-300 cursor-pointer shadow"
            >
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span className="font-pixel text-[10px] font-bold">REGLAS</span>
            </button>

            <button
              onClick={() => onOpenLore()}
              className="p-3 bg-stone-900 hover:bg-stone-800 border-2 border-amber-800 hover:border-amber-500 rounded-lg flex flex-col items-center justify-center text-center gap-1.5 transition text-amber-300 cursor-pointer shadow"
            >
              <Scroll className="w-5 h-5 text-amber-400" />
              <span className="font-pixel text-[10px] font-bold">HISTORIA</span>
            </button>

            <button
              onClick={onOpenSkills}
              className="p-3 bg-stone-900 hover:bg-stone-800 border-2 border-amber-800 hover:border-amber-500 rounded-lg flex flex-col items-center justify-center text-center gap-1.5 transition text-amber-300 cursor-pointer shadow"
            >
              <Award className="w-5 h-5 text-cyan-400" />
              <span className="font-pixel text-[10px] font-bold">HABILIDADES</span>
            </button>
          </div>

          {/* START GAME BUTTON */}
          <button
            onClick={() => {
              audio.playFanfare();
              onStartGame();
            }}
            className="w-full py-4 bg-gradient-to-r from-red-700 via-amber-600 to-red-700 hover:from-red-600 hover:via-amber-500 hover:to-red-600 text-stone-950 font-pixel text-sm sm:text-base rounded-lg border-4 border-yellow-300 shadow-2xl transition transform hover:scale-102 active:scale-98 flex items-center justify-center gap-3 font-bold cursor-pointer"
          >
            <Play className="w-6 h-6 fill-stone-950" />
            ¡DESCENDER A LA MAZMORRA!
          </button>
        </div>
      </div>

      {/* Bottom Footer Quote */}
      <div className="relative z-10 text-center text-xs text-stone-400 font-medieval border-t border-stone-800 pt-3">
        «El peligro aguarda tras cada puerta de roble, pero la gloria del Imperio es eterna.» — Mentor
      </div>
    </div>
  );
};
