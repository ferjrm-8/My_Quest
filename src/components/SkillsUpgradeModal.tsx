import React, { useState } from 'react';
import { Award, Shield, Swords, Sparkles, Coins, Check, Lock, ShoppingBag, X, Heart, Brain } from 'lucide-react';
import { Equipment, Hero, SkillNode } from '../types/heroquest';
import { SHOP_ITEMS } from '../data/skillsData';
import { HeroPortrait } from './PixelIcons';
import { audio } from '../utils/audio';

interface SkillsUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  heroes: Hero[];
  activeHeroId: string;
  onUpdateHero: (updatedHero: Hero) => void;
  onAddLog?: (message: string, type: 'info' | 'loot' | 'spell') => void;
}

export const SkillsUpgradeModal: React.FC<SkillsUpgradeModalProps> = ({
  isOpen,
  onClose,
  heroes,
  activeHeroId,
  onUpdateHero,
  onAddLog,
}) => {
  const [selectedHeroId, setSelectedHeroId] = useState<string>(activeHeroId || heroes[0]?.id || 'barbarian');
  const [viewTab, setViewTab] = useState<'skills' | 'shop' | 'inventory' | 'spells'>('skills');

  if (!isOpen) return null;

  const currentHero = heroes.find((h) => h.id === selectedHeroId) || heroes[0];
  if (!currentHero) return null;

  const handleUnlockSkill = (skill: SkillNode) => {
    if (skill.unlocked) return;
    if (currentHero.gold < skill.costGold || currentHero.skillPoints < skill.costSkillPoints) {
      audio.playBlock();
      return;
    }

    // Check prerequisite
    if (skill.reqSkillId) {
      const req = currentHero.skills.find((s) => s.id === skill.reqSkillId);
      if (!req || !req.unlocked) {
        audio.playBlock();
        return;
      }
    }

    audio.playFanfare();

    const updatedHero: Hero = {
      ...currentHero,
      gold: currentHero.gold - skill.costGold,
      skillPoints: currentHero.skillPoints - skill.costSkillPoints,
      skills: currentHero.skills.map((s) => (s.id === skill.id ? { ...s, unlocked: true } : s)),
      activePerks: [...currentHero.activePerks, skill.id],
    };

    // Apply passive bonuses
    if (skill.passiveBonus) {
      if (skill.passiveBonus.attackDice) {
        updatedHero.attackDice += skill.passiveBonus.attackDice;
      }
      if (skill.passiveBonus.defendDice) {
        updatedHero.defendDice += skill.passiveBonus.defendDice;
      }
      if (skill.passiveBonus.maxBodyPoints) {
        updatedHero.maxBodyPoints += skill.passiveBonus.maxBodyPoints;
        updatedHero.bodyPoints = Math.min(updatedHero.maxBodyPoints, updatedHero.bodyPoints + skill.passiveBonus.maxBodyPoints);
      }
      if (skill.passiveBonus.maxMindPoints) {
        updatedHero.maxMindPoints += skill.passiveBonus.maxMindPoints;
        updatedHero.mindPoints = Math.min(updatedHero.maxMindPoints, updatedHero.mindPoints + skill.passiveBonus.maxMindPoints);
      }
    }

    onUpdateHero(updatedHero);
    if (onAddLog) {
      onAddLog(`¡${currentHero.name} ha aprendido la habilidad: ${skill.name}!`, 'spell');
    }
  };

  const handleBuyItem = (item: Equipment) => {
    if (currentHero.gold < item.cost) {
      audio.playBlock();
      return;
    }
    if (!item.usableBy.includes(currentHero.heroClass)) {
      audio.playBlock();
      return;
    }

    audio.playLoot();

    const updatedHero: Hero = {
      ...currentHero,
      gold: currentHero.gold - item.cost,
      inventory: [...currentHero.inventory, { ...item, id: `${item.id}_${Date.now()}` }],
    };

    // If weapon has higher attack dice, update attackDice
    if (item.type === 'weapon' && item.attackDice && item.attackDice > updatedHero.attackDice) {
      updatedHero.attackDice = item.attackDice;
    }

    // If shield/armor gives defend dice bonus
    if (item.defendDiceBonus) {
      updatedHero.defendDice += item.defendDiceBonus;
    }

    onUpdateHero(updatedHero);
    if (onAddLog) {
      onAddLog(`¡${currentHero.name} ha comprado ${item.name} por ${item.cost} de oro!`, 'loot');
    }
  };

  const handleUsePotion = (item: Equipment, index: number) => {
    if (item.effect === 'heal_4') {
      audio.playSpell();
      const newInventory = [...currentHero.inventory];
      newInventory.splice(index, 1);
      const healedHp = Math.min(currentHero.maxBodyPoints, currentHero.bodyPoints + 4);

      const updatedHero: Hero = {
        ...currentHero,
        bodyPoints: healedHp,
        inventory: newInventory,
      };

      onUpdateHero(updatedHero);
      if (onAddLog) {
        onAddLog(`¡${currentHero.name} bebe la Poción de Curación y recupera puntos de vida!`, 'loot');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-stone-900 border-4 border-amber-600 rounded-lg shadow-2xl flex flex-col overflow-hidden text-stone-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 p-4 border-b-2 border-amber-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-7 h-7 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold font-pixel text-amber-300 tracking-wider">
                HABILIDADES Y ARSENAL DE LOS HÉROES
              </h2>
              <p className="text-xs text-amber-200/70 font-medieval italic">
                Desbloquea dones ancestrales, adquiere pertrechos de la armería imperial y forja tu leyenda
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

        {/* Hero Tabs Selector */}
        <div className="flex bg-stone-950 border-b border-stone-800 p-2 gap-2 overflow-x-auto">
          {heroes.map((hero) => {
            const isSelected = hero.id === currentHero.id;
            return (
              <button
                key={hero.id}
                onClick={() => setSelectedHeroId(hero.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded border font-pixel text-xs transition ${
                  isSelected
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                }`}
              >
                <HeroPortrait heroClass={hero.heroClass} size={28} />
                <div className="text-left">
                  <div>{hero.name}</div>
                  <div className="text-[10px] text-stone-400 font-sans flex items-center gap-2 mt-0.5">
                    <span className="text-amber-400 font-bold">{hero.gold} 🪙</span>
                    <span className="text-cyan-400 font-bold">{hero.skillPoints} 💎</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Hero Stat Banner */}
        <div className="bg-stone-950/90 px-6 py-3 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <HeroPortrait heroClass={currentHero.heroClass} size={50} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-sm text-amber-300">{currentHero.name}</span>
                <span className="text-xs text-stone-400 italic">({currentHero.title})</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-pixel mt-1 text-stone-300">
                <span className="flex items-center gap-1 text-red-400">
                  <Heart className="w-3.5 h-3.5" /> {currentHero.bodyPoints}/{currentHero.maxBodyPoints} Cuerpo
                </span>
                <span className="flex items-center gap-1 text-blue-400">
                  <Brain className="w-3.5 h-3.5" /> {currentHero.mindPoints}/{currentHero.maxMindPoints} Mente
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Swords className="w-3.5 h-3.5" /> {currentHero.attackDice} Dados Atq
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Shield className="w-3.5 h-3.5" /> {currentHero.defendDice} Dados Def
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-stone-900/90 px-4 py-2 rounded-lg border border-stone-700">
            <div className="flex items-center gap-1.5 text-amber-400 font-pixel text-xs">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>ORO: {currentHero.gold}</span>
            </div>
            <div className="h-4 w-px bg-stone-700" />
            <div className="flex items-center gap-1.5 text-cyan-400 font-pixel text-xs">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>PUNTOS HABILIDAD: {currentHero.skillPoints}</span>
            </div>
          </div>
        </div>

        {/* Sub-view navigation */}
        <div className="flex border-b border-stone-800 bg-stone-900/80 px-6 text-xs font-pixel">
          <button
            onClick={() => setViewTab('skills')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              viewTab === 'skills'
                ? 'border-amber-500 text-amber-300 bg-stone-850'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Award className="w-4 h-4" />
            Árbol de Habilidades ({currentHero.skills.filter((s) => s.unlocked).length}/{currentHero.skills.length})
          </button>
          <button
            onClick={() => setViewTab('shop')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              viewTab === 'shop'
                ? 'border-amber-500 text-amber-300 bg-stone-850'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            La Armería (Tienda)
          </button>
          <button
            onClick={() => setViewTab('inventory')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              viewTab === 'inventory'
                ? 'border-amber-500 text-amber-300 bg-stone-850'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            Inventario ({currentHero.inventory.length})
          </button>
          {currentHero.spells.length > 0 && (
            <button
              onClick={() => setViewTab('spells')}
              className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
                viewTab === 'spells'
                  ? 'border-amber-500 text-amber-300 bg-stone-850'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Grimorio de Hechizos ({currentHero.spells.length})
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewTab === 'skills' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-400 font-medieval mb-3 bg-stone-950/40 p-3 rounded border border-stone-800">
                Cada habilidad otorga bonificaciones activas o pasivas permanentes. Desbloquearlas requiere Monedas de Oro ganadas en las mazmorras y Puntos de Habilidad otorgados por victorias de combate y objetivos.
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {currentHero.skills.map((skill) => {
                  const reqMet = !skill.reqSkillId || currentHero.skills.some((s) => s.id === skill.reqSkillId && s.unlocked);
                  const canAfford = currentHero.gold >= skill.costGold && currentHero.skillPoints >= skill.costSkillPoints;

                  return (
                    <div
                      key={skill.id}
                      className={`p-4 rounded-lg border-2 transition relative flex flex-col justify-between ${
                        skill.unlocked
                          ? 'bg-amber-950/20 border-amber-600/70 shadow-md'
                          : reqMet
                          ? 'bg-stone-950/60 border-stone-700 hover:border-amber-700/60'
                          : 'bg-stone-950/30 border-stone-800 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl p-1 bg-stone-800 rounded border border-stone-700">{skill.icon}</span>
                            <div>
                              <h4 className="font-pixel text-xs text-amber-300">{skill.name}</h4>
                              <span className="text-[10px] text-stone-400 font-pixel uppercase">
                                Rango {skill.tier} • {skill.category}
                              </span>
                            </div>
                          </div>

                          {skill.unlocked ? (
                            <span className="px-2 py-1 bg-emerald-950 text-emerald-400 border border-emerald-700 rounded text-[10px] font-pixel flex items-center gap-1">
                              <Check className="w-3 h-3" /> APRENDIDA
                            </span>
                          ) : (
                            <div className="text-right">
                              <div className="text-[11px] font-pixel text-amber-400">{skill.costGold} 🪙</div>
                              <div className="text-[10px] font-pixel text-cyan-400">{skill.costSkillPoints} 💎 PH</div>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-stone-300 leading-relaxed mt-2">{skill.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between">
                        {skill.unlocked ? (
                          <span className="text-[11px] text-emerald-300 italic">Habilidad activa permanentemente en tu ficha.</span>
                        ) : !reqMet ? (
                          <span className="text-[11px] text-red-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Requiere habilidad previa
                          </span>
                        ) : (
                          <button
                            onClick={() => handleUnlockSkill(skill)}
                            disabled={!canAfford}
                            className={`px-4 py-2 rounded font-pixel text-xs transition border flex items-center gap-2 ${
                              canAfford
                                ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 border-amber-400 cursor-pointer font-bold'
                                : 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {canAfford ? 'DESBLOQUEAR HABILIDAD' : 'RECURSOS INSUFICIENTES'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewTab === 'shop' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-400 font-medieval mb-3 bg-stone-950/40 p-3 rounded border border-stone-800">
                La Armería Imperial ofrece pertrechos forjados por los mejores artesanos. Las armas aumentan los Dados de Ataque y las protecciones mejoran tus Dados de Defensa.
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SHOP_ITEMS.map((item) => {
                  const usable = item.usableBy.includes(currentHero.heroClass);
                  const canAfford = currentHero.gold >= item.cost;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border-2 transition flex flex-col justify-between ${
                        usable
                          ? 'bg-stone-950/70 border-stone-700 hover:border-amber-700/70'
                          : 'bg-stone-950/30 border-stone-800 opacity-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-3xl p-1 bg-stone-800 rounded border border-stone-700">{item.icon}</span>
                          <span className="font-pixel text-xs text-amber-400">{item.cost} 🪙</span>
                        </div>
                        <h4 className="font-pixel text-xs text-amber-300">{item.name}</h4>
                        <div className="text-[10px] text-stone-400 uppercase font-pixel mt-0.5">
                          {item.type} {item.twoHanded && '• Dos manos'} {item.rangedAttack && '• A distancia'}
                        </div>
                        <p className="text-xs text-stone-300 mt-2">{item.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between">
                        {!usable ? (
                          <span className="text-[10px] text-red-400">No utilizable por esta clase</span>
                        ) : (
                          <button
                            onClick={() => handleBuyItem(item)}
                            disabled={!canAfford}
                            className={`w-full py-2 rounded font-pixel text-xs transition border ${
                              canAfford
                                ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 border-amber-400 cursor-pointer font-bold'
                                : 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed'
                            }`}
                          >
                            {canAfford ? 'COMPRAR' : 'ORO INSUFICIENTE'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewTab === 'inventory' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-400 font-medieval mb-3 bg-stone-950/40 p-3 rounded border border-stone-800">
                Objetos, armas y pociones transportadas actualmente por {currentHero.name}. Puedes beber pociones de curación en cualquier momento.
              </div>

              {currentHero.inventory.length === 0 ? (
                <div className="text-center py-12 text-stone-500 font-pixel text-xs">
                  El morral de {currentHero.name} está vacío. Visita la Armería para pertrecharte.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentHero.inventory.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border-2 border-stone-700 bg-stone-950/80 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl p-1 bg-stone-800 rounded border border-stone-700">{item.icon}</span>
                          <div>
                            <h4 className="font-pixel text-xs text-amber-300">{item.name}</h4>
                            <span className="text-[10px] text-stone-400 uppercase font-pixel">{item.type}</span>
                          </div>
                        </div>
                        <p className="text-xs text-stone-300">{item.description}</p>
                      </div>

                      {item.consumable && item.effect === 'heal_4' && (
                        <button
                          onClick={() => handleUsePotion(item, index)}
                          className="mt-3 py-1.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white font-pixel text-xs rounded border border-emerald-400 transition"
                        >
                          BEBER POCIÓN (+4 PV)
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {viewTab === 'spells' && currentHero.spells.length > 0 && (
            <div className="space-y-4">
              <div className="text-xs text-stone-400 font-medieval mb-3 bg-stone-950/40 p-3 rounded border border-stone-800">
                Cartas de magia elemental asignadas a este héroe por Mentor. Cada conjuro puede ser lanzado una vez por misión.
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {currentHero.spells.map((spell) => (
                  <div
                    key={spell.id}
                    className={`p-4 rounded-lg border-2 transition ${
                      spell.isUsed
                        ? 'bg-stone-950/30 border-stone-800 opacity-40'
                        : 'bg-stone-950/80 border-amber-800/60 shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl p-1 bg-stone-800 rounded border border-stone-700">{spell.icon}</span>
                      <div>
                        <h4 className="font-pixel text-xs text-amber-300">{spell.name}</h4>
                        <span className="text-[10px] text-blue-400 font-pixel uppercase">
                          Elemento: {spell.element}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-300 mt-2">{spell.description}</p>
                    <div className="mt-3 pt-2 border-t border-stone-800 text-[10px] font-pixel">
                      {spell.isUsed ? (
                        <span className="text-stone-500">AGOTADO EN ESTA MISIÓN</span>
                      ) : (
                        <span className="text-emerald-400">DISPONIBLE PARA LANZAR</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-950 p-4 border-t border-stone-800 flex justify-between items-center">
          <div className="text-xs text-stone-400 font-medieval">
            * Las habilidades y armas se guardan automáticamente para tus héroes.
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-pixel text-xs rounded transition border-2 border-amber-400 font-bold"
          >
            GUARDAR Y SALIR
          </button>
        </div>
      </div>
    </div>
  );
};
