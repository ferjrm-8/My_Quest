import React from 'react';
import { X, Scroll, Award, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Quest } from '../types/heroquest';

interface QuestBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  quest: Quest;
  isBossDefeated: boolean;
  bossName: string;
  livingMonstersCount: number;
  areAllObjectivesComplete: boolean;
}

export const QuestBriefingModal: React.FC<QuestBriefingModalProps> = ({
  isOpen,
  onClose,
  quest,
  isBossDefeated,
  bossName,
  livingMonstersCount,
  areAllObjectivesComplete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-900 border-2 border-stone-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-stone-200">
        {/* Header */}
        <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scroll className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-base font-bold font-pixel text-amber-300">
                MISIÓN {quest.number}: {quest.title.toUpperCase()}
              </h2>
              <p className="text-xs text-stone-400 font-medieval">{quest.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition border border-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Intro scroll */}
          <div className="bg-[#181512] p-4 rounded-xl border border-amber-900/60 shadow-inner">
            <h3 className="font-pixel text-xs text-amber-400 mb-2">PALABRAS DE MENTOR</h3>
            <p className="text-sm text-stone-300 font-medieval leading-relaxed italic">
              {quest.intro}
            </p>
          </div>

          {/* Objectives Checkpoints */}
          <div className="space-y-3">
            <h3 className="font-pixel text-xs text-stone-400 tracking-wider">OBJETIVOS DE LA MISIÓN</h3>

            {/* Objective 1: Boss */}
            <div className={`p-3.5 rounded-lg border-2 flex items-center justify-between transition ${
              isBossDefeated
                ? 'bg-emerald-950/50 border-emerald-500/80 text-emerald-200'
                : 'bg-stone-950/80 border-stone-800 text-stone-300'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{isBossDefeated ? '💀✓' : '👑'}</span>
                <div>
                  <div className="font-pixel text-xs font-bold">1. Derrotar al Jefe: {bossName}</div>
                  <div className="text-[11px] text-stone-400 font-medieval">
                    {isBossDefeated ? '¡El Jefe ha sido aniquilado!' : 'Encuentra al Jefe y acábalo en combate.'}
                  </div>
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded font-pixel text-[10px] font-bold ${
                isBossDefeated ? 'bg-emerald-900 text-emerald-200' : 'bg-red-950 text-red-300 border border-red-800'
              }`}>
                {isBossDefeated ? 'COMPLETADO' : 'PENDIENTE'}
              </div>
            </div>

            {/* Objective 2: Clear Dungeon */}
            <div className={`p-3.5 rounded-lg border-2 flex items-center justify-between transition ${
              livingMonstersCount === 0
                ? 'bg-emerald-950/50 border-emerald-500/80 text-emerald-200'
                : 'bg-stone-950/80 border-stone-800 text-stone-300'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{livingMonstersCount === 0 ? '⚔️✓' : '👹'}</span>
                <div>
                  <div className="font-pixel text-xs font-bold">2. Purgar Todas las Criaturas del Caos</div>
                  <div className="text-[11px] text-stone-400 font-medieval">
                    {livingMonstersCount === 0
                      ? '¡La mazmorra ha sido completamente despejada!'
                      : `Quedan ${livingMonstersCount} monstruo(s) en la mazmorra.`}
                  </div>
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded font-pixel text-[10px] font-bold ${
                livingMonstersCount === 0 ? 'bg-emerald-900 text-emerald-200' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {livingMonstersCount === 0 ? 'COMPLETADO' : `${livingMonstersCount} VIVOS`}
              </div>
            </div>

            {/* Objective 3: Escape */}
            <div className={`p-3.5 rounded-lg border-2 flex items-center justify-between transition ${
              areAllObjectivesComplete
                ? 'bg-gradient-to-r from-amber-950/70 to-yellow-950/70 border-yellow-400 text-yellow-200 animate-pulse'
                : 'bg-stone-950/80 border-stone-800 text-stone-400'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{areAllObjectivesComplete ? '✨🪜' : '🪜🔒'}</span>
                <div>
                  <div className="font-pixel text-xs font-bold">3. Escapar por la Escalera de Salida</div>
                  <div className="text-[11px] text-stone-400 font-medieval">
                    {areAllObjectivesComplete
                      ? '¡La escalera está desbloqueada! Desplázate sobre ella para sellar la victoria.'
                      : 'La escalera está sellada. Debes completar los 2 objetivos anteriores para abrirla.'}
                  </div>
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded font-pixel text-[10px] font-bold ${
                areAllObjectivesComplete ? 'bg-yellow-500 text-stone-950' : 'bg-stone-900 text-stone-500'
              }`}>
                {areAllObjectivesComplete ? 'DESBLOQUEADA' : 'SELLADA'}
              </div>
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-stone-950/80 p-3 rounded-lg border border-stone-800 flex items-center justify-around text-xs font-pixel">
            <span className="text-amber-400 font-bold">RECOMPENSA ORO: +{quest.rewardGold} 🪙</span>
            <span className="text-cyan-400 font-bold">RECOMPENSA PH: +{quest.rewardSkillPoints} 💎</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-950 p-3 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-pixel text-xs border border-stone-700 transition cursor-pointer font-bold"
          >
            CERRAR
          </button>
        </div>
      </div>
    </div>
  );
};
