import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Skull, RefreshCw, ChevronRight } from 'lucide-react';
import { Quest } from '../types/heroquest';
import { audio } from '../utils/audio';

interface QuestOutcomeModalProps {
  isOpen: boolean;
  isVictory: boolean;
  quest: Quest;
  onNextOrRetry: () => void;
  onOpenSkills: () => void;
  onDescendNextFloor?: () => void;
}

export const QuestOutcomeModal: React.FC<QuestOutcomeModalProps> = ({
  isOpen,
  isVictory,
  quest,
  onNextOrRetry,
  onOpenSkills,
  onDescendNextFloor,
}) => {
  useEffect(() => {
    if (isOpen) {
      if (isVictory) {
        audio.playFanfare();
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      } else {
        audio.playDamage();
      }
    }
  }, [isOpen, isVictory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div
        className={`relative w-full max-w-lg p-6 rounded-lg border-4 shadow-2xl text-center space-y-6 ${
          isVictory ? 'bg-stone-900 border-amber-500' : 'bg-stone-950 border-red-700'
        }`}
      >
        <div className="flex justify-center">
          {isVictory ? (
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl animate-bounce">
              🏆
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-950 border-2 border-red-600 flex items-center justify-center text-4xl animate-pulse">
              💀
            </div>
          )}
        </div>

        <div>
          <h2
            className={`font-pixel text-2xl tracking-wider ${
              isVictory ? 'text-amber-400' : 'text-red-500'
            }`}
          >
            {isVictory ? '¡VICTORIA HEROICA!' : '¡PARTIDA FALLIDA!'}
          </h2>
          <p className="text-xs font-medieval italic text-stone-300 mt-2">
            {isVictory
              ? `Habéis completado con éxito la misión: ${quest.title}. Mentor os felicita en nombre del Emperador.`
              : 'Las sombras de Morcar han devorado a vuestros héroes en las profundidades de la mazmorra.'}
          </p>
        </div>

        {isVictory && (
          <div className="bg-stone-950 p-4 rounded border border-amber-900 text-xs font-pixel space-y-2">
            <span className="text-amber-400 block">RECOMPENSAS DE MISIÓN:</span>
            <div className="flex justify-around text-sm">
              <span className="text-amber-300">+{quest.rewardGold} 🪙 ORO / HÉROE</span>
              <span className="text-cyan-300">+{quest.rewardSkillPoints} 💎 PH / HÉROE</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5 justify-center">
          {isVictory && onDescendNextFloor && (
            <button
              onClick={onDescendNextFloor}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-pixel text-xs sm:text-sm rounded border-2 border-yellow-300 font-bold shadow-xl transition flex items-center justify-center gap-2 cursor-pointer animate-pulse"
            >
              🪜 DESCENDER AL PISO {quest.number + 1} (PARTIDA LARGA CONTINUA)
            </button>
          )}

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {isVictory && (
              <button
                onClick={onOpenSkills}
                className="px-4 py-2.5 bg-amber-700 hover:bg-amber-600 text-stone-950 font-pixel text-xs rounded border border-amber-400 font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4" /> MEJORAR HABILIDADES
              </button>
            )}

            <button
              onClick={onNextOrRetry}
              className={`px-5 py-2.5 rounded font-pixel text-xs transition border flex items-center justify-center gap-2 font-bold cursor-pointer ${
                isVictory
                  ? 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-stone-600'
                  : 'bg-red-700 hover:bg-red-600 text-stone-100 border-red-500'
              }`}
            >
              {isVictory ? (
                <>
                  CONTINUAR AL MENÚ <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" /> REINTENTAR MISIÓN
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
