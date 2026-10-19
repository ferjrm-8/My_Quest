import React, { useState, useEffect } from 'react';
import { Swords, Shield, Heart, CheckCircle2 } from 'lucide-react';
import { CombatDiceRoll } from '../types/heroquest';
import { SkullFaceIcon, WhiteShieldFaceIcon, BlackShieldFaceIcon } from './PixelIcons';
import { audio } from '../utils/audio';

interface CombatModalProps {
  isOpen: boolean;
  attackerName: string;
  attackerType: 'hero' | 'monster';
  attackerDiceCount: number;
  defenderName: string;
  defenderType: 'hero' | 'monster';
  defenderDiceCount: number;
  defenderHp: number;
  defenderMaxHp: number;
  attackerRoll?: CombatDiceRoll;
  defenderRoll?: CombatDiceRoll;
  damageDealt?: number;
  isBoss?: boolean;
  onConfirm: () => void;
}

export const CombatModal: React.FC<CombatModalProps> = ({
  isOpen,
  attackerName,
  attackerType,
  attackerDiceCount,
  defenderName,
  defenderType,
  defenderDiceCount,
  defenderHp,
  defenderMaxHp,
  attackerRoll,
  defenderRoll,
  damageDealt = 0,
  isBoss = false,
  onConfirm,
}) => {
  const [animStep, setAnimStep] = useState<'rolling' | 'attack_shown' | 'defend_shown' | 'done'>('rolling');

  useEffect(() => {
    if (!isOpen) {
      setAnimStep('rolling');
      return;
    }

    audio.playDiceRoll();

    const t1 = setTimeout(() => {
      setAnimStep('attack_shown');
      audio.playAttack();
    }, 700);

    const t2 = setTimeout(() => {
      setAnimStep('defend_shown');
      if (defenderRoll && (defenderRoll.whiteShields > 0 || defenderRoll.blackShields > 0)) {
        audio.playBlock();
      }
    }, 1400);

    const t3 = setTimeout(() => {
      setAnimStep('done');
      if (damageDealt > 0) {
        audio.playDamage();
      }
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen, attackerRoll, defenderRoll, damageDealt]);

  if (!isOpen || !attackerRoll || !defenderRoll) return null;

  const hits = attackerRoll.skulls;
  const blocks = defenderType === 'hero' ? defenderRoll.whiteShields : defenderRoll.blackShields;
  const finalDamage = Math.max(0, hits - blocks);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-stone-900 border-4 border-red-700 rounded-lg shadow-2xl overflow-hidden text-stone-200">
        {/* Header */}
        <div className={`p-4 border-b-2 flex items-center justify-between ${
          isBoss 
            ? 'bg-gradient-to-r from-red-950 via-yellow-950 to-red-950 border-yellow-500 shadow-lg' 
            : 'bg-gradient-to-r from-red-950 via-stone-950 to-red-950 border-red-700'
        }`}>
          <div className="flex items-center gap-3">
            <Swords className={`w-6 h-6 animate-pulse ${isBoss ? 'text-yellow-400' : 'text-red-500'}`} />
            <div>
              <h3 className={`font-pixel text-base uppercase tracking-wider ${isBoss ? 'text-yellow-300 font-extrabold' : 'text-red-400'}`}>
                {isBoss ? '★ BATALLA CONTRA EL JEFE DE LA MAZMORRA ★' : 'COMBATE HEROQUEST'}
              </h3>
              {isBoss && (
                <div className="text-[10px] font-pixel text-red-300">
                  ¡CRIATURA COLOSAL DE MORCAR!
                </div>
              )}
            </div>
          </div>
          <span className="text-xs font-pixel text-stone-300 bg-stone-950 px-2 py-1 rounded border border-stone-800">
            {attackerType === 'hero' ? 'ATAQUE DEL HÉROE' : 'CONTRAATAQUE DE MORCAR'}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Fighters Display */}
          <div className="grid grid-cols-2 gap-4 text-center">
            {/* Attacker */}
            <div className="p-4 bg-stone-950/80 rounded-lg border-2 border-amber-600/60 flex flex-col items-center">
              <span className="text-xs font-pixel text-amber-400 mb-1">ATACANTE</span>
              <h4 className="font-pixel text-sm text-amber-200">{attackerName}</h4>
              <span className="text-xs text-stone-400 mt-1 flex items-center gap-1 font-pixel">
                <Swords className="w-3.5 h-3.5 text-amber-400" /> {attackerDiceCount} Dados de Ataque
              </span>
            </div>

            {/* Defender */}
            <div className="p-4 bg-stone-950/80 rounded-lg border-2 border-stone-700 flex flex-col items-center">
              <span className="text-xs font-pixel text-stone-400 mb-1">DEFENSOR</span>
              <h4 className="font-pixel text-sm text-stone-200">{defenderName}</h4>
              <div className="flex items-center gap-3 text-xs mt-1 font-pixel">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Shield className="w-3.5 h-3.5" /> {defenderDiceCount} Dados Def
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <Heart className="w-3.5 h-3.5" /> {defenderHp}/{defenderMaxHp} PV
                </span>
              </div>
            </div>
          </div>

          {/* Dice Results Box */}
          <div className="bg-stone-950 p-5 rounded-lg border border-stone-800 space-y-4">
            {/* Attacker's Dice */}
            <div>
              <div className="flex items-center justify-between text-xs font-pixel text-amber-400 mb-2">
                <span>TIRADA DE ATAQUE ({attackerDiceCount} DADOS):</span>
                {animStep !== 'rolling' && (
                  <span className="text-red-400 font-bold">
                    {hits} {hits === 1 ? 'CALAVERA (IMPACTO)' : 'CALAVERAS (IMPACTOS)'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 min-h-[44px]">
                {animStep === 'rolling' ? (
                  <div className="text-xs text-stone-400 font-pixel animate-pulse">Lanzando dados de combate... 🎲</div>
                ) : (
                  attackerRoll.dice.map((face, idx) => (
                    <div
                      key={idx}
                      className="transition transform duration-200 hover:scale-110"
                      title={face}
                    >
                      {face === 'skull' && <SkullFaceIcon size={38} className="drop-shadow-lg" />}
                      {face === 'white_shield' && <WhiteShieldFaceIcon size={38} className="opacity-40" />}
                      {face === 'black_shield' && <BlackShieldFaceIcon size={38} className="opacity-40" />}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="h-px bg-stone-800" />

            {/* Defender's Dice */}
            <div>
              <div className="flex items-center justify-between text-xs font-pixel text-cyan-400 mb-2">
                <span>TIRADA DE DEFENSA ({defenderDiceCount} DADOS):</span>
                {(animStep === 'defend_shown' || animStep === 'done') && (
                  <span className="text-emerald-400 font-bold">
                    {blocks} {blocks === 1 ? 'ESCUDO EFECTIVO' : 'ESCUDOS EFECTIVOS'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 min-h-[44px]">
                {animStep === 'rolling' || animStep === 'attack_shown' ? (
                  <div className="text-xs text-stone-500 font-pixel italic">Esperando tirada defensiva...</div>
                ) : (
                  defenderRoll.dice.map((face, idx) => {
                    const isEffective =
                      (defenderType === 'hero' && face === 'white_shield') ||
                      (defenderType === 'monster' && face === 'black_shield');

                    return (
                      <div
                        key={idx}
                        className={`transition transform duration-200 ${isEffective ? 'scale-105' : 'opacity-40'}`}
                        title={face}
                      >
                        {face === 'skull' && <SkullFaceIcon size={38} />}
                        {face === 'white_shield' && <WhiteShieldFaceIcon size={38} />}
                        {face === 'black_shield' && <BlackShieldFaceIcon size={38} />}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="text-[10px] text-stone-500 font-medieval mt-1">
                {defenderType === 'hero' ? 'Los héroes defienden con Escudos Blancos 🛡️' : 'Los monstruos de Morcar solo defienden con Escudos Negros 🛡️⬛'}
              </div>
            </div>
          </div>

          {/* Outcome resolution */}
          {animStep === 'done' && (
            <div
              className={`p-4 rounded-lg border-2 text-center transition animate-fade-in ${
                finalDamage > 0
                  ? 'bg-red-950/60 border-red-600 text-red-200'
                  : 'bg-stone-950/80 border-stone-700 text-stone-300'
              }`}
            >
              <div className="font-pixel text-sm mb-1">
                {finalDamage > 0
                  ? `¡${finalDamage} ${finalDamage === 1 ? 'HERIDA' : 'HERIDAS'} INFLIGIDA!`
                  : '¡ATAQUE COMPLETAMENTE BLOQUEADO!'}
              </div>
              <p className="text-xs text-stone-300">
                {hits} Calaveras - {blocks} Escudos ={' '}
                <strong>{finalDamage} Daño</strong> aplicado a {defenderName}.
                {defenderHp - finalDamage <= 0 && (
                  <span className="block mt-1 font-pixel text-amber-400 font-bold">
                    💀 ¡{defenderName} ha sido aniquilado!
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-950 p-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={onConfirm}
            disabled={animStep !== 'done'}
            className={`px-6 py-2.5 rounded font-pixel text-xs transition border flex items-center gap-2 ${
              animStep === 'done'
                ? 'bg-red-700 hover:bg-red-600 text-white border-red-500 cursor-pointer font-bold shadow-lg'
                : 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> CONTINUAR
          </button>
        </div>
      </div>
    </div>
  );
};
