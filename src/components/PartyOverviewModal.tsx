import React from 'react';
import { X, Heart, Brain, Swords, Shield, Coins, Sparkles, User, Bot, Award } from 'lucide-react';
import { Hero } from '../types/heroquest';
import { HeroPortrait } from './PixelIcons';

interface PartyOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  heroes: Hero[];
  activeHeroIndex: number;
  onToggleHeroAI: (heroId: string) => void;
  onOpenSkills: () => void;
}

export const PartyOverviewModal: React.FC<PartyOverviewModalProps> = ({
  isOpen,
  onClose,
  heroes,
  activeHeroIndex,
  onToggleHeroAI,
  onOpenSkills,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-stone-900 border-2 border-stone-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-stone-200">
        {/* Header */}
        <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <h2 className="text-base font-bold font-pixel text-amber-300">ESCUADRA DE HÉROES</h2>
              <p className="text-xs text-stone-400 font-medieval">
                Estado vital, equipamiento y modo de control de los 4 aventureros
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition border border-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Heroes Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {heroes.map((hero, idx) => {
            const isActive = idx === activeHeroIndex;
            return (
              <div
                key={hero.id}
                className={`p-4 rounded-xl border-2 flex flex-col justify-between transition relative ${
                  hero.isDead
                    ? 'bg-stone-950/60 border-stone-800 opacity-60'
                    : isActive
                    ? 'bg-amber-950/40 border-amber-500 shadow-xl ring-2 ring-amber-500/30'
                    : 'bg-stone-950/80 border-stone-800'
                }`}
              >
                <div>
                  {/* Top: Portrait + Name + Mode badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <HeroPortrait heroClass={hero.heroClass} size={48} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-xs text-stone-100 font-bold truncate">{hero.name}</span>
                        {isActive && (
                          <span className="text-[9px] font-pixel bg-amber-500 text-stone-950 px-1.5 py-0.5 rounded font-bold animate-pulse">
                            TURNO
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400 font-medieval truncate">{hero.title}</div>
                    </div>
                  </div>

                  {/* AI / Manual Toggle Button */}
                  <div className="mb-3">
                    <button
                      onClick={() => onToggleHeroAI(hero.id)}
                      className={`w-full py-1.5 px-2 rounded-lg font-pixel text-[10px] flex items-center justify-center gap-1.5 border transition cursor-pointer font-bold ${
                        hero.isAI
                          ? 'bg-purple-950/80 border-purple-600 text-purple-200 hover:bg-purple-900'
                          : 'bg-emerald-950/80 border-emerald-600 text-emerald-200 hover:bg-emerald-900'
                      }`}
                    >
                      {hero.isAI ? (
                        <>
                          <Bot className="w-3.5 h-3.5 text-purple-400" />
                          <span>CONTROL POR IA</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5 text-emerald-400" />
                          <span>CONTROL MANUAL (JUGADOR)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Health and Mind Stats */}
                  <div className="space-y-2 mb-3 bg-stone-900/90 p-2.5 rounded-lg border border-stone-800">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-pixel text-red-400 mb-1">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" /> PUNTOS DE CUERPO
                        </span>
                        <span>
                          {hero.bodyPoints}/{hero.maxBodyPoints}
                        </span>
                      </div>
                      <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden border border-red-950">
                        <div
                          className="bg-red-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.max(0, (hero.bodyPoints / hero.maxBodyPoints) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] font-pixel text-blue-400 mb-1">
                        <span className="flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5" /> PUNTOS DE MENTE
                        </span>
                        <span>
                          {hero.mindPoints}/{hero.maxMindPoints}
                        </span>
                      </div>
                      <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden border border-blue-950">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.max(0, (hero.mindPoints / hero.maxMindPoints) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Combat & Treasure Stats */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-pixel text-stone-300 mb-3">
                    <div className="bg-stone-900/80 p-2 rounded border border-stone-800 flex items-center gap-1.5">
                      <Swords className="w-3.5 h-3.5 text-red-400" />
                      <span>{hero.attackDice} Dados Ataque</span>
                    </div>
                    <div className="bg-stone-900/80 p-2 rounded border border-stone-800 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-400" />
                      <span>{hero.defendDice} Dados Defensa</span>
                    </div>
                    <div className="bg-stone-900/80 p-2 rounded border border-stone-800 flex items-center gap-1.5 text-amber-400 font-bold">
                      <Coins className="w-3.5 h-3.5" />
                      <span>{hero.gold} Monedas</span>
                    </div>
                    <div className="bg-stone-900/80 p-2 rounded border border-stone-800 flex items-center gap-1.5 text-cyan-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{hero.skillPoints} Puntos Hab.</span>
                    </div>
                  </div>

                  {/* Inventory & Spells info */}
                  <div className="space-y-1 text-[10px] font-pixel text-stone-400 mb-3">
                    <div className="text-stone-300 font-bold">ARMA / EQUIPO:</div>
                    <div className="text-stone-400 text-[10px] bg-stone-900/60 p-1.5 rounded border border-stone-800/80">
                      {hero.inventory.length > 0 ? hero.inventory.map((i) => i.name).join(', ') : 'Sin armas'}
                    </div>

                    {hero.spells.length > 0 && (
                      <>
                        <div className="text-stone-300 font-bold mt-2">HECHIZOS ARCANOS:</div>
                        <div className="text-blue-300 text-[9px] bg-blue-950/40 p-1.5 rounded border border-blue-900/60">
                          {hero.spells.filter((s) => !s.isUsed).length} disponibles de {hero.spells.length}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Upgrade Button */}
                {hero.skillPoints > 0 && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSkills();
                    }}
                    className="w-full mt-2 py-2 px-3 bg-gradient-to-r from-cyan-900 to-amber-900 hover:from-cyan-800 hover:to-amber-800 text-yellow-200 border border-yellow-400/80 rounded-lg font-pixel text-[9px] flex items-center justify-center gap-1.5 shadow cursor-pointer transition animate-pulse font-bold"
                  >
                    <Award className="w-3.5 h-3.5 text-yellow-300" />
                    <span>MEJORAR ({hero.skillPoints} PH)</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-stone-950 p-3 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-pixel text-xs border border-stone-700 transition cursor-pointer font-bold"
          >
            VOLVER AL TABLERO
          </button>
        </div>
      </div>
    </div>
  );
};
