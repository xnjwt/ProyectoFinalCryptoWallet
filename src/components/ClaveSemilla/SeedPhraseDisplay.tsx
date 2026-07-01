import { useEffect } from 'react';
import { useWalletStore } from '../../store/walletStore';

export const SeedPhraseDisplay = () => {
  const seed = useWalletStore((state) => state.seed);
  const secondsLeft = useWalletStore((state) => state.secondsLeft);
  const decrementTimer = useWalletStore((state) => state.decrementTimer);
  const setStep = useWalletStore((state) => state.setStep);
  const resetVerification = useWalletStore((state) => state.resetVerification);

  // Si por alguna razón la semilla está vacía, mostramos un placeholder para no romper la UI
  const words = seed ? seed.split(' ') : Array(12).fill('...');

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(decrementTimer, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, decrementTimer]);

  const handleNext = () => {
    resetVerification(); // Prepara las palabras mezcladas antes de cambiar de vista
    setStep(2);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="bg-[#0b1320] border border-cyan-900/30 rounded-2xl p-8 md:p-12 max-w-3xl w-full shadow-2xl">
        
        <h2 className="text-3xl font-semibold text-cyan-400 text-center mb-3">
          Tu Frase Semilla
        </h2>
        
        <p className="text-gray-200 text-center mb-10 text-sm md:text-base font-medium">
          Anota estas 12 palabras en orden. Las necesitarás en el siguiente paso.
        </p>

        {/* Cuadrícula de palabras imitando el diseño original */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {words.map((word, index) => (
            <div
              key={`${word}-${index}`}
              className="border-2 border-cyan-600 rounded-lg py-3 px-2 flex items-center justify-center text-cyan-400 font-bold bg-transparent shadow-[0_0_10px_rgba(8,145,178,0.15)]"
            >
              <span className="text-cyan-200 mr-2">{index + 1}.</span> {word}
            </div>
          ))}
        </div>

        {/* Botón con efecto Neón */}
        <button
          onClick={handleNext}
          disabled={secondsLeft > 0}
          className={`w-full py-4 rounded-xl font-bold text-lg tracking-widest transition-all duration-300 ${
            secondsLeft > 0
              ? 'bg-cyan-900/50 text-cyan-700 cursor-not-allowed border border-cyan-900'
              : 'bg-cyan-400 text-slate-900 hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-[1.01]'
          }`}
        >
          {secondsLeft > 0 ? `ESPERA ${secondsLeft}s...` : 'SIGUIENTE'}
        </button>
        
      </div>
    </div>
  );
};