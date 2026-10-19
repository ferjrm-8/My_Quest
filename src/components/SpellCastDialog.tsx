import React, { useState } from 'react';
import { Sparkles, X, Heart, Shield, Zap } from 'lucide-react';
import { Hero, Monster, Spell } from '../types/heroquest';
import { audio } from '../utils/audio';

interface SpellCastDialogProps {
  isOpen: boolean;
  caster: Hero;
  spells: Spell[];
  visibleMonsters: Monster[];
  allies: Hero[];
  onCastSpell: (spell: Spell, targetId: string, targetType: 'monster' | 'hero') => void;
  onClose: () => void;
}

export const SpellCastDialog: React.FC<SpellCastDialogProps> = ({
  isOpen,
  caster,
  spells,
  visibleMonsters,
  allies,
  onCastSpell,
  onClose,
}) => {
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);

  if (!isOpen) return null;

  const availableSpells = spells.filter((s) => !s.isUsed);

  const handleSelectSpell = (spell: Spell) => {
    audio.playStep();
    setSelectedSpell(spell);
  };

  const handleConfirmTarget = (targetId: string, targetType: 'monster' | 'hero') => {
    if (!selectedSpell) return;
    audio.playSpell();
    onCastSpell(selectedSpell, targetId, targetType);
    setSelectedSpell(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-stone-900 border-4 border-blue-700 rounded-lg shadow-2xl overflow-hidden text-stone-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-stone-900 to-indigo-950 p-4 border-b-2 border-blue-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
            <div>
              <h3 className="font-pixel text-sm text-blue-300 uppercase tracking-wider">
                LANZAR HECHIZO ELEMENTAL
              </h3>
              <p className="text-xs text-blue-200/70 font-medieval italic">
                {caster.name} canaliza la magia de los cuatro elementos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-blue-300 hover:bg-stone-800 rounded transition border border-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {!selectedSpell ? (
            <div>
              <span className="font-pixel text-xs text-amber-400 block mb-3">
                1. ELIGE UN HECHIZO DE TU GRIMORIO:
              </span>

              {availableSpells.length === 0 ? (
                <div className="p-6 text-center text-stone-400 font-pixel text-xs bg-stone-950 rounded">
                  Todos tus hechizos han sido agotados en esta misión.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
                  {availableSpells.map((spell) => (
                    <button
                      key={spell.id}
                      onClick={() => handleSelectSpell(spell)}
                      className="p-3 bg-stone-950/80 hover:bg-blue-950/50 border-2 border-stone-700 hover:border-blue-500 rounded-lg text-left transition flex items-start gap-3"
                    >
                      <span className="text-3xl p-1 bg-stone-800 rounded border border-stone-700">{spell.icon}</span>
                      <div className="flex-1">
                        <div className="font-pixel text-xs text-blue-300">{spell.name}</div>
                        <div className="text-[10px] font-pixel text-stone-400 uppercase mt-0.5">
                          Elemento: {spell.element}
                        </div>
                        <p className="text-[11px] text-stone-300 mt-1 line-clamp-2">{spell.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-950/40 border border-blue-600/70 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedSpell.icon}</span>
                  <div>
                    <h4 className="font-pixel text-sm text-blue-300">{selectedSpell.name}</h4>
                    <p className="text-xs text-stone-300 mt-1">{selectedSpell.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSpell(null)}
                  className="px-2 py-1 bg-stone-800 text-stone-300 text-xs font-pixel rounded border border-stone-600 hover:bg-stone-700"
                >
                  CAMBIAR
                </button>
              </div>

              <span className="font-pixel text-xs text-amber-400 block">
                2. SELECCIONA EL OBJETIVO DEL CONJURO:
              </span>

              {/* Targets depending on spell type */}
              {selectedSpell.effectType === 'heal' || selectedSpell.effectType === 'buff_defense' ? (
                <div className="space-y-2">
                  <span className="text-xs text-stone-400 font-medieval italic">
                    Objetivos aliados (Héroes a la vista):
                  </span>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {allies.map((hero) => (
                      <button
                        key={hero.id}
                        onClick={() => handleConfirmTarget(hero.id, 'hero')}
                        className="p-3 bg-stone-950 hover:bg-emerald-950/60 border border-stone-700 hover:border-emerald-500 rounded-lg text-left transition flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-pixel text-xs text-emerald-300">{hero.name}</span>
                          <span className="text-[11px] text-stone-400">({hero.title})</span>
                        </div>
                        <span className="font-pixel text-xs text-red-400">
                          {hero.bodyPoints}/{hero.maxBodyPoints} PV
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-xs text-stone-400 font-medieval italic">
                    Monstruos visibles de Morcar:
                  </span>
                  {visibleMonsters.length === 0 ? (
                    <div className="p-4 text-center text-stone-400 font-pixel text-xs bg-stone-950 rounded">
                      No hay monstruos a la vista en este momento.
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-2">
                      {visibleMonsters.map((monster) => (
                        <button
                          key={monster.id}
                          onClick={() => handleConfirmTarget(monster.id, 'monster')}
                          className="p-3 bg-stone-950 hover:bg-red-950/60 border border-stone-700 hover:border-red-500 rounded-lg text-left transition flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{monster.icon}</span>
                            <div>
                              <div className="font-pixel text-xs text-red-300">{monster.name}</div>
                              <div className="text-[10px] text-stone-400 font-pixel">
                                {monster.bodyPoints}/{monster.maxBodyPoints} PV
                              </div>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-red-900/60 text-red-200 text-[10px] font-pixel rounded border border-red-700">
                            IMPACTAR
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-950 p-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-pixel text-xs rounded transition border border-stone-600"
          >
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
};
