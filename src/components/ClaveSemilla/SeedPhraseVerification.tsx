import { useWalletStore } from '../../store/walletStore';

export const SeedPhraseVerification = () => {
  const availableWords = useWalletStore((state) => state.availableWords);
  const selectedWords = useWalletStore((state) => state.selectedWords);
  const validationResult = useWalletStore((state) => state.validationResult);
  
  const selectWord = useWalletStore((state) => state.selectWord);
  const deselectWord = useWalletStore((state) => state.deselectWord);
  const setStep = useWalletStore((state) => state.setStep);
  const verifySeed = useWalletStore((state) => state.verifySeed);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="bg-[#0b1320] border border-cyan-900/30 rounded-2xl p-8 md:p-12 max-w-3xl w-full shadow-2xl">
        
        <h2 className="text-3xl font-semibold text-cyan-400 text-center mb-6">
          Verifica tu Semilla
        </h2>

        {/* Caja contenedora (Área de selección gris en tu imagen) */}
        <div className="min-h-[120px] p-4 border-2 border-dashed border-cyan-800/50 rounded-xl mb-6 flex flex-wrap content-start gap-2 bg-black/20">
          {selectedWords.map((word, index) => (
            <button
              key={`selected-${word}-${index}`}
              onClick={() => deselectWord(word)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-md cursor-pointer"
            >
              {word}
            </button>
          ))}
        </div>

        {/* Palabras disponibles (Chips en la parte inferior) */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {availableWords.map((word, index) => (
            <button
              key={`available-${word}-${index}`}
              onClick={() => selectWord(word)}
              className="border border-cyan-600 text-cyan-400 hover:bg-cyan-900/40 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors cursor-pointer"
            >
              {word}
            </button>
          ))}
        </div>

        {/* Alerta de validación */}
        {validationResult !== null && (
          <div className={`p-4 rounded-lg mb-6 text-center font-bold ${
            validationResult 
              ? 'bg-green-900/40 text-green-400 border border-green-800' 
              : 'bg-red-900/40 text-red-400 border border-red-800'
          }`}>
            {validationResult ? '¡Orden correcto! Preparando tu billetera...' : 'El orden es incorrecto. Inténtalo de nuevo.'}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-4">
          <button 
            onClick={() => setStep(1)} 
            className="flex-1 py-3 border border-purple-500/50 text-purple-400 hover:bg-purple-900/20 rounded-xl font-bold transition-colors"
          >
            VOLVER A ANOTAR
          </button>
          
          <button
            onClick={() => verifySeed(() => {})}
            
            disabled={selectedWords.length !== 12 || validationResult === true}
            className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${
              selectedWords.length === 12 && validationResult !== true
                ? 'bg-cyan-400 text-slate-900 hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            VALIDAR
          </button>
        </div>
        
      </div>
    </div>
  );
};