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
    set({ validationResult: isValid });

    if (isValid) {
      saveSeedToStorage(seed); 
      setTimeout(() => {
        set({ step: 3, isWalletConfigured: true }); 
        onSuccess();
      }, 1500);
    } else {
      setTimeout(() => {
        resetVerification();
      }, 1500);
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
        set({ isWalletConfigured: true, step: 3 });
      } else {
        set({ isWalletConfigured: false });
      }
    } catch (error) {
      console.error("Error al verificar estado de la wallet:", error);
      set({ isWalletConfigured: false });
    }
  }
}));