import React, { useState } from 'react';
import { Play, BookOpen, Scroll, Award, Users, Bot, User, Volume2, VolumeX, Music, Shield, Sparkles, Compass } from 'lucide-react';
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
  onStartRandomGame?: () => void;
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
  onStartRandomGame,
  onOpenInstructions,
  onOpenLore,
  onOpenSkills,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [bgmActive, setBgmActive] = useState<boolean>(audio.getBgmState());
  const [soundMuted, setSoundMuted] = useState<boolean>(audio.isMuted());
  const [isRandomMode, setIsRandomMode] = useState<boolean>(true);

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
    <div className="h-screen w-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black text-stone-100 flex flex-col justify-between p-3 sm:p-5 overflow-hidden select-none">
      {/* ══════════════════════════════════════════════════════════════════════════════
          TOP HEADER: BRANDING, TITLE LOGO, QUICK ACTIONS & AUDIO CONTROLS
          ══════════════════════════════════════════════════════════════════════════════ */}
      <header className="flex items-center justify-between border-b border-amber-900/30 pb-3 gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            ⚔️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-pixel tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-amber-500 drop-shadow">
                HERO QUEST
              </h1>
              <span className="text-[9px] font-pixel bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                16-BIT EDITION
              </span>
            </div>
            <p className="text-[11px] font-medieval text-stone-400 tracking-wide">
              Emulador Táctico de Mazmorras • Dado de Combate • Magia Elemental
            </p>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInstructions}
            className="px-3 py-1.5 bg-stone-900/90 hover:bg-stone-800 border border-stone-700 hover:border-amber-500/70 rounded-lg text-xs font-pixel text-stone-200 hover:text-amber-300 flex items-center gap-1.5 transition cursor-pointer shadow"
            title="Ver Reglas del Juego"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">REGLAS</span>
          </button>

          <button
            onClick={() => onOpenLore()}
            className="px-3 py-1.5 bg-stone-900/90 hover:bg-stone-800 border border-stone-700 hover:border-amber-500/70 rounded-lg text-xs font-pixel text-stone-200 hover:text-amber-300 flex items-center gap-1.5 transition cursor-pointer shadow"
            title="Lore e Historia de la Campaña"
          >
            <Scroll className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">HISTORIA</span>
          </button>

          <button
            onClick={onOpenSkills}
            className="px-3 py-1.5 bg-stone-900/90 hover:bg-stone-800 border border-stone-700 hover:border-cyan-500/70 rounded-lg text-xs font-pixel text-stone-200 hover:text-cyan-300 flex items-center gap-1.5 transition cursor-pointer shadow"
            title="Armería y Habilidades de Héroes"
          >
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">ARMERÍA</span>
          </button>

          <div className="h-5 w-[1px] bg-stone-800 mx-1 hidden sm:block" />

          {/* Sound Mute */}
          <button
            onClick={handleToggleSound}
            className={`p-1.5 rounded-lg border font-pixel text-xs flex items-center gap-1 transition cursor-pointer ${
              soundMuted
                ? 'bg-red-950/80 border-red-700 text-red-400'
                : 'bg-stone-900/90 border-stone-700 text-stone-300 hover:text-amber-300'
            }`}
            title="Activar/Silenciar Efectos de Sonido"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* BGM Toggle */}
          <button
            onClick={handleToggleBgm}
            className={`p-1.5 rounded-lg border font-pixel text-xs flex items-center gap-1 transition cursor-pointer ${
              bgmActive
                ? 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse'
                : 'bg-stone-900/90 border-stone-700 text-stone-400 hover:text-stone-200'
            }`}
            title="Música Retro 16-bits"
          >
            <Music className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA (2 CONDENSED PANELS FITTING 16:9 VIEWPORT)
          ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 grid grid-cols-12 gap-3 sm:gap-4 my-2.5 min-h-0 overflow-hidden">
        {/* LEFT COLUMN: GAME MODE & QUEST SELECTION (5 Cols) */}
        <div className="col-span-12 lg:col-span-5 bg-stone-900/80 backdrop-blur-md border border-stone-800 rounded-xl p-3 sm:p-4 flex flex-col justify-between shadow-2xl min-h-0 overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="font-pixel text-xs text-amber-300 font-bold flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" /> MODO DE JUEGO & MISIÓN
              </span>
              <span className="text-[10px] text-stone-400 font-medieval">Elige tu reto</span>
            </div>

            {/* OPTION 1: Procedural Dynamic Dungeon */}
            <button
              onClick={() => {
                audio.playSpell();
                setIsRandomMode(true);
              }}
              className={`w-full p-3 text-left rounded-lg border transition cursor-pointer relative overflow-hidden group ${
                isRandomMode
                  ? 'bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-purple-950/90 border-yellow-400 ring-2 ring-yellow-400/40 shadow-xl'
                  : 'bg-stone-950/80 border-stone-800 hover:border-purple-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-pixel text-xs text-yellow-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> MAZMORRA ALEATORIA
                </span>
                <span className="text-[9px] font-pixel bg-amber-500 text-stone-950 px-1.5 py-0.5 rounded font-bold uppercase">
                  100% DINÁMICA
                </span>
              </div>
              <p className="text-xs text-purple-200 font-medieval italic mt-1 leading-snug">
                Mapas procedurales infinitos • 14+ salas • 25+ monstruos • Jefe Supremo en cada piso
              </p>
            </button>

            {/* OPTION 2: Classic Preset Story Quests */}
            <div>
              <span className="text-[10px] font-pixel text-stone-400 uppercase tracking-wider block mb-1.5">
                O Selecciona una Misión Clásica:
              </span>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {quests.map((q) => {
                  const isSelected = !isRandomMode && selectedQuest.id === q.id;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        audio.playStep();
                        setIsRandomMode(false);
                        onSelectQuest(q);
                      }}
                      className={`w-full p-2 text-left rounded-lg border transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/80 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                          : 'bg-stone-950/70 border-stone-800/80 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-xs text-amber-300 font-bold truncate">
                          Misión {q.number}: {q.title}
                        </span>
                        <span className="text-xs text-amber-400 font-pixel font-bold shrink-0">
                          +{q.rewardGold}🪙
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 font-medieval italic truncate mt-0.5">
                        {q.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quest Objectives Preview Box */}
          <div className="bg-stone-950/90 p-2.5 rounded-lg border border-stone-800/80 text-xs mt-2">
            <span className="font-pixel text-[10px] text-amber-400 font-bold block mb-1">
              CONDICIONES DE VICTORIA:
            </span>
            <p className="text-stone-300 font-medieval italic text-[11px] leading-snug">
              {isRandomMode
                ? '1) Aniquilar al Jefe Supremo. 2) Purgar a todos los monstruos. 3) Escapar con vida por las escaleras de salida.'
                : selectedQuest.objective}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: HERO SQUAD & PLAYER CONFIGURATION (7 Cols) */}
        <div className="col-span-12 lg:col-span-7 bg-stone-900/80 backdrop-blur-md border border-stone-800 rounded-xl p-3 sm:p-4 flex flex-col justify-between shadow-2xl min-h-0 overflow-y-auto">
          <div className="space-y-3">
            {/* Player Count Selection Row */}
            <div className="flex items-center justify-between bg-stone-950/80 p-2.5 rounded-lg border border-stone-800">
              <span className="font-pixel text-xs text-amber-300 font-bold flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" /> JUGADORES:
              </span>

              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => handlePlayerCountChange(count)}
                    className={`px-3 py-1 rounded font-pixel text-xs transition border cursor-pointer ${
                      playerCount === count
                        ? 'bg-amber-600 text-stone-950 border-amber-300 font-bold shadow-md scale-102 ring-1 ring-amber-400'
                        : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {count} {count === 1 ? 'Solo' : 'Coop'}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Heroes Grid (2x2 Grid for Compactness) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {heroes.map((hero) => (
                <div
                  key={hero.id}
                  className="bg-stone-950/90 p-2.5 rounded-lg border border-stone-800/90 flex flex-col justify-between gap-2 hover:border-amber-700/60 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <HeroPortrait heroClass={hero.heroClass} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-xs text-amber-300 font-bold truncate">
                          {hero.name}
                        </span>
                        <button
                          onClick={() => onOpenLore(hero.heroClass)}
                          className="text-[10px] font-pixel text-stone-400 hover:text-amber-300 underline cursor-pointer"
                        >
                          Lore
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-pixel mt-0.5 text-stone-300">
                        <span className="text-red-400 font-bold">❤️ {hero.bodyPoints} PV</span>
                        <span className="text-blue-400 font-bold">🧠 {hero.mindPoints} PM</span>
                        <span className="text-amber-300 font-bold">⚔️ {hero.attackDice}D</span>
                        <span className="text-emerald-400 font-bold">🛡️ {hero.defendDice}D</span>
                      </div>
                    </div>
                  </div>

                  {/* AI vs Player Toggle */}
                  <button
                    onClick={() => handleToggleHeroAI(hero.id)}
                    className={`w-full py-1 rounded font-pixel text-[11px] flex items-center justify-center gap-1.5 border transition cursor-pointer font-bold ${
                      hero.isAI
                        ? 'bg-purple-950/80 border-purple-600 text-purple-200 hover:bg-purple-900/90'
                        : 'bg-emerald-950/80 border-emerald-600 text-emerald-200 hover:bg-emerald-900/90'
                    }`}
                  >
                    {hero.isAI ? (
                      <>
                        <Bot className="w-3 h-3 text-purple-400" /> CONTROLADO POR IA
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 text-emerald-400" /> JUGADOR HUMANO
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          BOTTOM FOOTER BAR: QUOTE & MAIN START GAME ACTION BUTTON
          ══════════════════════════════════════════════════════════════════════════════ */}
      <footer className="flex flex-col sm:flex-row items-center justify-between border-t border-amber-900/30 pt-2.5 gap-3 shrink-0">
        <div className="text-xs text-stone-400 font-medieval italic truncate">
          «El peligro aguarda tras cada puerta de roble, pero la gloria del Imperio es eterna.» — Mentor
        </div>

        <button
          onClick={() => {
            audio.playFanfare();
            if (isRandomMode && onStartRandomGame) {
              onStartRandomGame();
            } else {
              onStartGame();
            }
          }}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-red-700 via-amber-600 to-red-700 hover:from-red-600 hover:via-amber-500 hover:to-red-600 text-stone-950 font-pixel text-xs sm:text-sm rounded-xl border-2 border-yellow-300 font-bold shadow-[0_0_20px_rgba(245,158,11,0.5)] transition transform hover:scale-102 active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
        >
          <Play className="w-5 h-5 fill-stone-950" />
          {isRandomMode ? '¡GENERAR Y ENTRAR A LA MAZMORRA!' : '¡DESCENDER A LA MAZMORRA!'}
        </button>
      </footer>
    </div>
  );
};
