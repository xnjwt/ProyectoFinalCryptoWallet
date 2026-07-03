import { create } from 'zustand';
import {
  generateSeedPhrase,
  saveSeedToStorage,
  getSeedFromStorage,
  shuffleArray,
  validateSeedOrder,
  clearSeedFromStorage
} from '../services/walletService';

//Añadimos las firmas faltantes a la interfaz
interface WalletState {
  seed: string;
  step: number;
  availableWords: string[];
  selectedWords: string[];
  validationResult: boolean | null;
  secondsLeft: number;
  isWalletConfigured: boolean; 

  // Acciones 
  initializeWallet: () => void;
  setStep: (step: number) => void;
  setSeed: (seed: string) => void;
  decrementTimer: () => void;
  selectWord: (word: string) => void;
  deselectWord: (word: string) => void;
  resetVerification: () => void;
  verifySeed: (onSuccess: () => void) => void;
  resetWallet: () => void;
  completeWalletSetup: () => void;
  checkWalletStatus: (uid: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  seed: '',
  step: 0,
  availableWords: [],
  selectedWords: [],
  validationResult: null,
  secondsLeft: 5,
  isWalletConfigured: false,

  initializeWallet: () => {
    const existingSeed = getSeedFromStorage();
    if (existingSeed) {
      set({ seed: existingSeed, step: 3, isWalletConfigured: true });
    } else {
      const newSeed = generateSeedPhrase();
      set({ seed: newSeed, step: 1, isWalletConfigured: false });
    }
  },

  // --Función para inyectar la semilla desde el formulario y forzar el inicio ---
  setSeed: (seed) => set({ 
    seed, 
    step: 1, 
    isWalletConfigured: false, 
    secondsLeft: 5 
  }),

  setStep: (step) => set({ step }),

  decrementTimer: () => set((state) => ({ secondsLeft: state.secondsLeft - 1 })),

  selectWord: (word) => set((state) => ({
    availableWords: state.availableWords.filter((w) => w !== word),
    selectedWords: [...state.selectedWords, word]
  })),

  deselectWord: (word) => set((state) => ({
    selectedWords: state.selectedWords.filter((w) => w !== word),
    availableWords: [...state.availableWords, word]
  })),

  resetVerification: () => {
    const originalSeed = get().seed; 
    if (!originalSeed) return;
    const words = originalSeed.split(' ');
    set({
      availableWords: shuffleArray(words),
      selectedWords: [],
      validationResult: null
    });
  },

  verifySeed: (onSuccess) => {
    const { seed, selectedWords, resetVerification } = get();
    const isValid = validateSeedOrder(seed, selectedWords);
    
    // 1. Reflejamos el éxito en la UI
    set({ validationResult: isValid });

    if (isValid) {
      // 2. Aislamos el guardado para evitar fallos silenciosos
      try {
        saveSeedToStorage(seed); 
      } catch (error) {
        console.error("No se pudo guardar la semilla localmente:", error);
      }
      
      // 3. Cambio de estado INSTANTÁNEO (Sin setTimeout)
      set({ step: 3, isWalletConfigured: true }); 
      
      // Ejecutamos el callback si existe
      if (onSuccess) onSuccess();
    } else {
      // Si la clave es incorrecta, limpiamos instantáneamente
      resetVerification();
    }
  },

  resetWallet: () => {
    clearSeedFromStorage();
    const newSeed = generateSeedPhrase();

    set({
      seed: newSeed,
      step: 1,
      availableWords: [],
      selectedWords: [],
      validationResult: null,
      secondsLeft: 5,
      isWalletConfigured: false 
    });
  },

  completeWalletSetup: () => {
    set({ isWalletConfigured: true });
  },

  checkWalletStatus: async (uid: string) => {
    try {
      const existingSeed = getSeedFromStorage();

      if (existingSeed) {
        // COMPORTAMIENTO 1: Si YA hay una clave guardada, directo al Dashboard
        set({ seed: existingSeed, isWalletConfigured: true, step: 3 });
      } else {
        // COMPORTAMIENTO 2: Si NO hay clave creada, generamos una nueva y vamos a la pantalla de creación
        const newSeed = generateSeedPhrase();
        set({ seed: newSeed, isWalletConfigured: false, step: 1 });
      }
    } catch (error) {
      console.error("Error al verificar estado de la wallet:", error);
      set({ isWalletConfigured: false, step: 1 });
    }
  }
}));