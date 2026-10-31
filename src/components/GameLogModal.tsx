import React, { useState } from 'react';
import { X, ScrollText, Filter } from 'lucide-react';
import { GameLog } from '../types/heroquest';

interface GameLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: GameLog[];
}

export const GameLogModal: React.FC<GameLogModalProps> = ({ isOpen, onClose, logs }) => {
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl h-[80vh] bg-stone-900 border-2 border-stone-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-stone-200">
        {/* Header */}
        <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ScrollText className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-base font-bold font-pixel text-amber-300">REGISTRO DE BATALLA Y EVENTOS</h2>
              <p className="text-xs text-stone-400 font-medieval">
                Historial cronológico de combates, botín, trampas y conjuros de la expedición
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

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 p-3 bg-stone-950/60 border-b border-stone-800 text-[10px] font-pixel overflow-x-auto">
          <span className="text-stone-500 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> FILTRAR:
          </span>
          {[
            { id: 'all', label: 'TODOS' },
            { id: 'combat', label: '⚔️ COMBATE' },
            { id: 'spell', label: '✨ HECHIZOS' },
            { id: 'loot', label: '🪙 BOTÍN' },
            { id: 'trap', label: '⚠️ TRAMPAS' },
            { id: 'danger', label: '💀 PELIGRO' },
            { id: 'turn', label: '⏳ TURNOS' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded transition cursor-pointer font-bold ${
                filterType === tab.id
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#100e0c]">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs font-pixel text-stone-500">
              No hay eventos en esta categoría
            </div>
          ) : (
            filteredLogs.map((log) => {
              const bgClass =
                log.type === 'danger'
                  ? 'bg-red-950/40 border-red-800 text-red-200'
                  : log.type === 'combat'
                  ? 'bg-amber-950/30 border-amber-800 text-amber-200'
                  : log.type === 'loot'
                  ? 'bg-yellow-950/30 border-yellow-700 text-yellow-200'
                  : log.type === 'spell'
                  ? 'bg-blue-950/40 border-blue-800 text-blue-200'
                  : log.type === 'trap'
                  ? 'bg-purple-950/30 border-purple-800 text-purple-200'
                  : log.type === 'turn'
                  ? 'bg-stone-800/40 border-stone-700 text-stone-300'
                  : 'bg-stone-900 border-stone-800 text-stone-300';

              return (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-lg border text-xs font-medieval flex items-start gap-2.5 ${bgClass}`}
                >
                  <span className="font-pixel text-[9px] text-stone-400 mt-0.5 shrink-0 bg-stone-950/80 px-1.5 py-0.5 rounded border border-stone-800">
                    {log.timestamp}
                  </span>
                  <span className="flex-1 leading-relaxed">{log.text}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-950 p-3 border-t border-stone-800 flex justify-between items-center text-xs text-stone-500">
          <span>Total de eventos: {logs.length}</span>
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
