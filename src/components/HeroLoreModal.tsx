import React, { useState } from 'react';
import { Shield, Sparkles, Swords, Heart, Brain, X, Scroll, Award } from 'lucide-react';
import { HeroClass } from '../types/heroquest';
import { HEROES_LORE, MENTOR_LORE, MORCAR_LORE } from '../data/heroesData';
import { HeroPortrait } from './PixelIcons';

interface HeroLoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClass?: HeroClass;
}

export const HeroLoreModal: React.FC<HeroLoreModalProps> = ({
  isOpen,
  onClose,
  initialClass = 'barbarian',
}) => {
  const [selected, setSelected] = useState<HeroClass | 'mentor' | 'morcar'>(initialClass);

  if (!isOpen) return null;

  const currentHeroLore = selected !== 'mentor' && selected !== 'morcar' ? HEROES_LORE[selected] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-stone-900 border-4 border-amber-600 rounded-lg shadow-2xl flex flex-col overflow-hidden text-stone-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 p-4 border-b-2 border-amber-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scroll className="w-7 h-7 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold font-pixel text-amber-300 tracking-wider">
                HISTORIA Y CRÓNICAS DE LOS HÉROES
              </h2>
              <p className="text-xs text-amber-200/70 font-medieval italic">
                Extractos del Gran Libro de Loretome recopilados por Mentor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded transition border border-stone-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Hero Selector Tabs */}
        <div className="flex border-b border-stone-800 bg-stone-950/70 overflow-x-auto text-xs font-pixel">
          <button
            onClick={() => setSelected('barbarian')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              selected === 'barbarian'
                ? 'border-red-500 text-red-400 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            ⚔️ El Bárbaro
          </button>
          <button
            onClick={() => setSelected('dwarf')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              selected === 'dwarf'
                ? 'border-yellow-500 text-yellow-400 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            🪓 El Enano
          </button>
          <button
            onClick={() => setSelected('elf')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              selected === 'elf'
                ? 'border-emerald-500 text-emerald-400 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            🏹 El Elfo
          </button>
          <button
            onClick={() => setSelected('wizard')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              selected === 'wizard'
                ? 'border-blue-500 text-blue-400 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            🔮 El Mago
          </button>
          <button
            onClick={() => setSelected('mentor')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              selected === 'mentor'
                ? 'border-amber-500 text-amber-400 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            📜 Mentor
          </button>
          <button
            onClick={() => setSelected('morcar')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              selected === 'morcar'
                ? 'border-purple-500 text-purple-400 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            💀 Morcar (Zargon)
          </button>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {currentHeroLore && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row items-center gap-6 bg-stone-950/80 p-5 rounded-lg border-2 border-amber-900/60">
                <HeroPortrait heroClass={currentHeroLore.heroClass} size={84} />
                <div className="text-center md:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                    <h3 className="font-pixel text-lg text-amber-300">{currentHeroLore.name}</h3>
                    <span className="text-xs bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-700">
                      {currentHeroLore.origin}
                    </span>
                  </div>
                  <h4 className="text-stone-400 font-medieval text-sm italic">{currentHeroLore.title}</h4>
                  <p className="mt-2 text-xs font-serif text-amber-100/90 bg-stone-900/90 p-2.5 rounded border-l-4 border-amber-500">
                    {currentHeroLore.quote}
                  </p>
                </div>
              </div>

              {/* Stats overview in 16-bit style */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-red-950/40 border border-red-800/60 p-3 rounded">
                  <div className="flex items-center justify-center gap-1 text-red-400 mb-1">
                    <Heart className="w-4 h-4" />
                    <span className="font-pixel text-[10px]">CUERPO</span>
                  </div>
                  <span className="font-pixel text-xl text-red-300">
                    {currentHeroLore.heroClass === 'barbarian'
                      ? '8'
                      : currentHeroLore.heroClass === 'dwarf'
                      ? '7'
                      : currentHeroLore.heroClass === 'elf'
                      ? '6'
                      : '4'}
                  </span>
                </div>

                <div className="bg-blue-950/40 border border-blue-800/60 p-3 rounded">
                  <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                    <Brain className="w-4 h-4" />
                    <span className="font-pixel text-[10px]">MENTE</span>
                  </div>
                  <span className="font-pixel text-xl text-blue-300">
                    {currentHeroLore.heroClass === 'barbarian'
                      ? '2'
                      : currentHeroLore.heroClass === 'dwarf'
                      ? '3'
                      : currentHeroLore.heroClass === 'elf'
                      ? '4'
                      : '6'}
                  </span>
                </div>

                <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded">
                  <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                    <Swords className="w-4 h-4" />
                    <span className="font-pixel text-[10px]">ATAQUE</span>
                  </div>
                  <span className="font-pixel text-xl text-amber-300">
                    {currentHeroLore.heroClass === 'barbarian' ? '3 DADOS' : currentHeroLore.heroClass === 'wizard' ? '1 DADO' : '2 DADOS'}
                  </span>
                </div>

                <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded">
                  <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                    <Shield className="w-4 h-4" />
                    <span className="font-pixel text-[10px]">DEFENSA</span>
                  </div>
                  <span className="font-pixel text-xl text-emerald-300">2 DADOS</span>
                </div>
              </div>

              {/* History Text */}
              <div className="bg-stone-950/60 p-5 rounded-lg border border-stone-800 space-y-3">
                <h4 className="font-pixel text-amber-400 text-xs flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  BIOGRAFÍA E HISTORIA
                </h4>
                <p className="text-stone-300 leading-relaxed text-sm">{currentHeroLore.history}</p>
              </div>

              {/* Strengths and Weaknesses */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-stone-800/50 p-4 rounded border border-emerald-900/60">
                  <h5 className="font-pixel text-emerald-400 text-xs mb-2">FORTALEZAS</h5>
                  <ul className="text-xs space-y-1.5 text-stone-300">
                    {currentHeroLore.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-stone-800/50 p-4 rounded border border-red-900/60">
                  <h5 className="font-pixel text-red-400 text-xs mb-2">DEBILIDADES</h5>
                  <ul className="text-xs space-y-1.5 text-stone-300">
                    {currentHeroLore.weaknesses.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">✗</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {selected === 'mentor' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6 bg-stone-950/80 p-5 rounded-lg border-2 border-amber-600">
                <div className="w-20 h-20 rounded-md bg-gradient-to-b from-amber-600 to-amber-950 flex items-center justify-center text-4xl border-2 border-amber-400 shadow-md">
                  🧙‍♂️
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="font-pixel text-lg text-amber-300">{MENTOR_LORE.name}</h3>
                  <h4 className="text-stone-400 font-medieval text-sm italic">{MENTOR_LORE.title}</h4>
                  <p className="mt-2 text-xs font-serif text-amber-100/90 bg-stone-900/90 p-2.5 rounded border-l-4 border-amber-500">
                    {MENTOR_LORE.quote}
                  </p>
                </div>
              </div>

              <div className="bg-stone-950/60 p-5 rounded-lg border border-stone-800 space-y-3">
                <h4 className="font-pixel text-amber-400 text-xs">EL GUARDIÁN DE LORETOME</h4>
                <p className="text-stone-300 leading-relaxed text-sm">{MENTOR_LORE.description}</p>
                <p className="text-stone-300 leading-relaxed text-sm mt-2">
                  Mentor ha seleccionado cuidadosamente a estos cuatro campeones porque cada uno compensa las carencias del otro:
                  la fuerza bruta del Bárbaro protege la fragilidad del Mago, mientras que la ingeniería del Enano y los sentidos agudos
                  del Elfo salvan al grupo de trampas mortales y emboscadas.
                </p>
              </div>
            </div>
          )}

          {selected === 'morcar' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6 bg-stone-950/80 p-5 rounded-lg border-2 border-purple-700">
                <div className="w-20 h-20 rounded-md bg-gradient-to-b from-purple-800 to-black flex items-center justify-center text-4xl border-2 border-purple-500 shadow-md">
                  😈
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="font-pixel text-lg text-purple-400">{MORCAR_LORE.name}</h3>
                  <h4 className="text-stone-400 font-medieval text-sm italic">{MORCAR_LORE.title}</h4>
                  <p className="mt-2 text-xs font-serif text-purple-200 bg-stone-900/90 p-2.5 rounded border-l-4 border-purple-500">
                    {MORCAR_LORE.quote}
                  </p>
                </div>
              </div>

              <div className="bg-stone-950/60 p-5 rounded-lg border border-stone-800 space-y-3">
                <h4 className="font-pixel text-purple-400 text-xs">EL SEÑOR DEL CAOS</h4>
                <p className="text-stone-300 leading-relaxed text-sm">{MORCAR_LORE.description}</p>
                <div className="mt-3 bg-red-950/30 p-3 rounded border border-red-900/60 text-xs text-red-300">
                  <span className="font-bold font-pixel">LAS HORDAS DE MORCAR:</span>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>👺 Goblins (rápidos)</div>
                    <div>👹 Orcos (brutales)</div>
                    <div>🦎 Fimirs (anfibios)</div>
                    <div>💀 No-Muertos (criptas)</div>
                    <div>🦹 Guerreros Caos (4 dados)</div>
                    <div>🗿 Gárgola (Verag)</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-950 p-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-pixel text-xs rounded transition border-2 border-amber-400 font-bold"
          >
            VOLVER AL MENÚ
          </button>
        </div>
      </div>
    </div>
  );
};
