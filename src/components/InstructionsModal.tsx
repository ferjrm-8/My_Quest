import React, { useState } from 'react';
import { BookOpen, Shield, Swords, Sparkles, Footprints, AlertTriangle, X, Compass, Coins } from 'lucide-react';
import { SkullFaceIcon, WhiteShieldFaceIcon, BlackShieldFaceIcon } from './PixelIcons';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'combat' | 'magic' | 'actions' | 'skills'>('basics');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-stone-900 border-4 border-amber-600 rounded-lg shadow-2xl flex flex-col overflow-hidden text-stone-200">
        {/* Retro Header */}
        <div className="bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 p-4 border-b-2 border-amber-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold font-pixel text-amber-300 tracking-wider">
                MANUAL DEL JUEGO: HEROQUEST
              </h2>
              <p className="text-xs text-amber-200/70 font-medieval italic">
                Reglas canónicas oficiales de exploración, combate y magia de las Crónicas de Morcar
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-800 bg-stone-950/70 overflow-x-auto text-xs font-pixel">
          <button
            onClick={() => setActiveTab('basics')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'basics'
                ? 'border-amber-500 text-amber-400 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            1. Conceptos Básicos
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'actions'
                ? 'border-amber-500 text-amber-400 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Footprints className="w-4 h-4" />
            2. Turnos y Acciones
          </button>
          <button
            onClick={() => setActiveTab('combat')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'combat'
                ? 'border-amber-500 text-amber-400 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Swords className="w-4 h-4" />
            3. Dados y Combate
          </button>
          <button
            onClick={() => setActiveTab('magic')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'magic'
                ? 'border-amber-500 text-amber-400 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            4. Magia Elemental
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'skills'
                ? 'border-amber-500 text-amber-400 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            5. Habilidades y Armería
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm leading-relaxed">
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <div className="bg-stone-950/60 p-4 border border-stone-800 rounded">
                <h3 className="font-pixel text-amber-400 text-base mb-2">¿QUÉ ES HEROQUEST?</h3>
                <p className="text-stone-300">
                  HeroQuest es el legendario juego de mazmorras cooperativo donde un grupo de cuatro valientes héroes
                  (el Bárbaro, el Enano, el Elfo y el Mago) descienden a laberintos subterráneos repletos de peligros para
                  cumplir las misiones encomendadas por el sabio Mentor y derrotar las fuerzas del brujo Morcar (Zargon).
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-stone-800/60 p-4 border border-amber-900/60 rounded">
                  <h4 className="font-pixel text-red-400 text-xs mb-2">PUNTOS DE CUERPO (VIDA)</h4>
                  <p className="text-xs text-stone-300">
                    Miden la vitalidad y resistencia física del héroe. Si se reducen a 0 por el daño enemigo o trampas,
                    el héroe muere a menos que tome de inmediato una poción de curación o reciba un conjuro curativo.
                  </p>
                  <ul className="mt-2 text-xs space-y-1 text-stone-400">
                    <li>• Bárbaro: 8 Puntos de Cuerpo (el más resistente)</li>
                    <li>• Enano: 7 Puntos de Cuerpo</li>
                    <li>• Elfo: 6 Puntos de Cuerpo</li>
                    <li>• Mago: 4 Puntos de Cuerpo (muy frágil)</li>
                  </ul>
                </div>

                <div className="bg-stone-800/60 p-4 border border-blue-900/60 rounded">
                  <h4 className="font-pixel text-blue-400 text-xs mb-2">PUNTOS DE MENTE</h4>
                  <p className="text-xs text-stone-300">
                    Representan la inteligencia, fuerza de voluntad y resistencia mágica ante hechizos de miedo o letargo de Morcar.
                  </p>
                  <ul className="mt-2 text-xs space-y-1 text-stone-400">
                    <li>• Mago: 6 Puntos de Mente (erudito supremo)</li>
                    <li>• Elfo: 4 Puntos de Mente</li>
                    <li>• Enano: 3 Puntos de Mente</li>
                    <li>• Bárbaro: 2 Puntos de Mente</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-950/20 border border-amber-800/50 p-4 rounded text-xs">
                <span className="font-bold text-amber-300 font-pixel">NIEBLA DE GUERRA:</span>
                <p className="mt-1 text-stone-300">
                  Las habitaciones y pasillos no explorados permanecen en la oscuridad. Cuando un héroe avanza por un pasillo o abre
                  una puerta, el interior de la sala se revela inmediatamente, mostrando el mobiliario, los cofres y los monstruos
                  que acechan en su interior.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="bg-stone-950/60 p-4 border border-stone-800 rounded">
                <h3 className="font-pixel text-amber-400 text-base mb-2">SECUENCIA DEL TURNO DE UN HÉROE</h3>
                <p className="text-stone-300">
                  En su turno, cada héroe realiza su <strong>Movimiento</strong> y <strong>UNA Acción</strong> (en el orden que prefiera):
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 bg-stone-800/40 p-3 rounded border border-stone-700">
                  <Footprints className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-pixel text-emerald-400 text-xs">1. MOVIMIENTO (2 DADOS ROJOS)</h4>
                    <p className="text-xs text-stone-300 mt-1">
                      El héroe lanza 2 dados estándar de 6 caras (2d6). El resultado determina el número máximo de casillas que puede
                      desplazarse ortogonalmente (arriba, abajo, izquierda, derecha). No se permite atravesar paredes ni monstruos enemigos.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-stone-800/40 p-3 rounded border border-stone-700">
                  <Swords className="w-6 h-6 text-red-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-pixel text-red-400 text-xs">2. ATACAR</h4>
                    <p className="text-xs text-stone-300 mt-1">
                      Ataca a un monstruo adyacente (o a distancia con ballesta). Lanza tus Dados de Ataque según tu arma equipada.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-stone-800/40 p-3 rounded border border-stone-700">
                  <Sparkles className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-pixel text-blue-400 text-xs">3. LANZAR UN HECHIZO</h4>
                    <p className="text-xs text-stone-300 mt-1">
                      Solo el Mago y el Elfo pueden canalizar la magia. Requiere tener al objetivo en línea de visión no bloqueada por paredes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-stone-800/40 p-3 rounded border border-stone-700">
                  <Coins className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-pixel text-amber-400 text-xs">4. BUSCAR TESORO</h4>
                    <p className="text-xs text-stone-300 mt-1">
                      Si no hay monstruos en la sala, un héroe puede registrar la habitación para hallar oro, pociones mágicas o joyas.
                      ¡Cuidado! A veces se activan monstruos errantes o trampas venenosas. Cada sala solo puede ser registrada una vez.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-stone-800/40 p-3 rounded border border-stone-700">
                  <AlertTriangle className="w-6 h-6 text-yellow-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-pixel text-yellow-400 text-xs">5. BUSCAR TRAMPAS Y PUERTAS SECRETAS</h4>
                    <p className="text-xs text-stone-300 mt-1">
                      Revela cualquier trampa de foso, lanzas ocultas o rocas en la habitación o pasillo actual sin detonarlas.
                      El Enano puede desarmarlas con maestría garantizada; los demás héroes requieren herramientas de zapador.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'combat' && (
            <div className="space-y-4">
              <div className="bg-stone-950/60 p-4 border border-stone-800 rounded">
                <h3 className="font-pixel text-amber-400 text-base mb-2">EL SISTEMA DE DADOS DE HEROQUEST</h3>
                <p className="text-stone-300">
                  El combate en HeroQuest se resuelve con dados especiales de 6 caras con 3 tipos de símbolos:
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-stone-800/80 p-4 border-2 border-stone-600 rounded flex flex-col items-center text-center">
                  <SkullFaceIcon size={44} className="mb-2" />
                  <span className="font-pixel text-stone-100 text-xs">CALAVERA (3 CARAS)</span>
                  <span className="text-[11px] text-red-400 font-bold mt-1">IMPACTO DIRECTO (50%)</span>
                  <p className="text-xs text-stone-300 mt-2">
                    Tanto héroes como monstruos causan 1 herida por cada calavera obtenida en su tirada de ataque.
                  </p>
                </div>

                <div className="bg-stone-800/80 p-4 border-2 border-amber-600 rounded flex flex-col items-center text-center">
                  <WhiteShieldFaceIcon size={44} className="mb-2" />
                  <span className="font-pixel text-amber-300 text-xs">ESCUDO BLANCO (2 CARAS)</span>
                  <span className="text-[11px] text-cyan-400 font-bold mt-1">DEFENSA DE HÉROES (33%)</span>
                  <p className="text-xs text-stone-300 mt-2">
                    Cuando un héroe es atacado, cada escudo blanco obtenido anula 1 calavera del atacante.
                  </p>
                </div>

                <div className="bg-stone-800/80 p-4 border-2 border-red-700 rounded flex flex-col items-center text-center">
                  <BlackShieldFaceIcon size={44} className="mb-2" />
                  <span className="font-pixel text-red-400 text-xs">ESCUDO NEGRO (1 CARA)</span>
                  <span className="text-[11px] text-rose-500 font-bold mt-1">DEFENSA DE MONSTRUOS (16.7%)</span>
                  <p className="text-xs text-stone-300 mt-2">
                    Cuando un monstruo es atacado, únicamente los escudos negros le permiten bloquear calaveras de los héroes.
                  </p>
                </div>
              </div>

              <div className="bg-stone-950 p-4 border border-stone-800 rounded text-xs space-y-2">
                <h4 className="font-pixel text-amber-400">EJEMPLO DE COMBATE:</h4>
                <p className="text-stone-300">
                  El Bárbaro ataca a un Orco con su Espada Ancha (3 Dados de Ataque). Obtiene: 💀 Calavera, 💀 Calavera, 🛡️ Escudo Blanco (2 impactos).
                </p>
                <p className="text-stone-300">
                  El Orco se defiende con sus 2 Dados de Defensa. Obtiene: 🛡️⬛ Escudo Negro, 💀 Calavera (bloquea 1 impacto).
                </p>
                <p className="text-emerald-400 font-bold">
                  Resultado: 2 Calaveras - 1 Escudo Negro = 1 Daño. El Orco (que tiene 1 Punto de Cuerpo) es derrotado y retirado del tablero.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'magic' && (
            <div className="space-y-4">
              <div className="bg-stone-950/60 p-4 border border-stone-800 rounded">
                <h3 className="font-pixel text-amber-400 text-base mb-2">LOS CUATRO ELEMENTOS PRIMORDIALES</h3>
                <p className="text-stone-300">
                  Los poderes de la naturaleza están divididos en 4 grupos de 3 hechizos cada uno (12 en total):
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-stone-800/60 p-4 border border-red-800 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🔥</span>
                    <h4 className="font-pixel text-red-400 text-xs">HECHIZOS DE FUEGO</h4>
                  </div>
                  <ul className="text-xs space-y-2 text-stone-300">
                    <li>• <strong>Fuego de la Ira:</strong> Causa 1 daño a cualquier monstruo a la vista.</li>
                    <li>• <strong>Balas de Fuego:</strong> Lanza dos esferas que infligen 2 heridas.</li>
                    <li>• <strong>Valor:</strong> Otorga +2 dados de ataque en el siguiente asalto a un héroe.</li>
                  </ul>
                </div>

                <div className="bg-stone-800/60 p-4 border border-emerald-800 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🪨</span>
                    <h4 className="font-pixel text-emerald-400 text-xs">HECHIZOS DE TIERRA</h4>
                  </div>
                  <ul className="text-xs space-y-2 text-stone-300">
                    <li>• <strong>Piel de Roca:</strong> +1 dado de defensa permanente hasta recibir una herida.</li>
                    <li>• <strong>Fuerza Sanadora:</strong> Restaura hasta 4 Puntos de Cuerpo perdidos.</li>
                    <li>• <strong>Atravesar la Roca:</strong> Permite cruzar muros sólidos por un turno.</li>
                  </ul>
                </div>

                <div className="bg-stone-800/60 p-4 border border-blue-800 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">💧</span>
                    <h4 className="font-pixel text-blue-400 text-xs">HECHIZOS DE AGUA</h4>
                  </div>
                  <ul className="text-xs space-y-2 text-stone-300">
                    <li>• <strong>Agua Curativa:</strong> Devuelve hasta 4 Puntos de Cuerpo a un héroe.</li>
                    <li>• <strong>Sueño Mágico:</strong> Duerme a un monstruo, impidiéndole actuar o defender.</li>
                    <li>• <strong>Velo de Niebla:</strong> Permite pasar a través de casillas con monstruos.</li>
                  </ul>
                </div>

                <div className="bg-stone-800/60 p-4 border border-cyan-800 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🌪️</span>
                    <h4 className="font-pixel text-cyan-400 text-xs">HECHIZOS DE AIRE</h4>
                  </div>
                  <ul className="text-xs space-y-2 text-stone-300">
                    <li>• <strong>Tempestad:</strong> Paraliza a una criatura durante su turno.</li>
                    <li>• <strong>Viento Veloz:</strong> Duplica los puntos de movimiento obtenidos en dados.</li>
                    <li>• <strong>El Genio:</strong> Invoca a un poderoso espíritu que ataca con 5 dados de combate.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="bg-stone-950/60 p-4 border border-stone-800 rounded">
                <h3 className="font-pixel text-amber-400 text-base mb-2">PROGRESIÓN DE HABILIDADES Y ARMERÍA</h3>
                <p className="text-stone-300">
                  En esta adaptación digital, la sección de <strong>Habilidades y Arsenal</strong> está siempre disponible en pantalla:
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-stone-800/60 p-4 border border-amber-700/60 rounded">
                  <h4 className="font-pixel text-amber-400 text-xs mb-2">GANAR HABILIDADES Y EXPERIENCIA</h4>
                  <p className="text-xs text-stone-300">
                    Al derrotar monstruos, abrir cofres, desactivar trampas y superar misiones, cada héroe acumula <strong>Puntos de Habilidad</strong> y <strong>Monedas de Oro</strong>.
                  </p>
                  <p className="text-xs text-stone-400 mt-2">
                    Cada clase cuenta con un árbol único con 3 Rangos (Tier 1, Tier 2, Tier 3) con poderes pasivos y activos como el Ataque Torbellino del Bárbaro, el Ojo Codicioso del Enano o la Danza del Espejismo del Elfo.
                  </p>
                </div>

                <div className="bg-stone-800/60 p-4 border border-amber-700/60 rounded">
                  <h4 className="font-pixel text-amber-400 text-xs mb-2">LA ARMERÍA IMPERIAL</h4>
                  <p className="text-xs text-stone-300">
                    Gasta tu oro en la tienda para equipar a tus héroes con armas superiores (Espada Corta, Espada Ancha, Hacha de Batalla, Ballesta), protecciones (Casco, Escudo, Cota de Malla) y pociones curativas o de fuerza.
                  </p>
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
            ¡ENTENDIDO, A LAS ARMAS!
          </button>
        </div>
      </div>
    </div>
  );
};
