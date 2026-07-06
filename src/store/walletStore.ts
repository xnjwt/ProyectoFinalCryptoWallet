import { create } from 'zustand';
import {
  generateSeedPhrase,
  saveSeedToStorage,
  getSeedFromStorage,
  shuffleArray,
  validateSeedOrder,
  clearSeedFromStorage
} from '../services/walletService';

interface WalletState {
  seed: string;
  availableWords: string[];
  selectedWords: string[];
  validationResult: boolean | null;
  secondsLeft: number;
  isWalletConfigured: boolean; 

  initializeWallet: () => void;
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
  availableWords: [],
  selectedWords: [],
  validationResult: null,
  secondsLeft: 5,
  isWalletConfigured: false,

  initializeWallet: () => {
    const existingSeed = getSeedFromStorage();
    if (existingSeed) {
      set({ seed: existingSeed, isWalletConfigured: true });
    } else {
      const newSeed = generateSeedPhrase();
      set({ seed: newSeed, isWalletConfigured: false });
    }
  },

  setSeed: (seed) => set({ 
    seed, 
    isWalletConfigured: false, 
    secondsLeft: 5 
  }),

  decrementTimer: () => set((state) => ({ secondsLeft: state.secondsLeft - 1 })),

  selectWord: (word) => set((state) => ({
    validationResult: null,
    availableWords: state.availableWords.filter((w) => w !== word),
    selectedWords: [...state.selectedWords, word]
  })),

  deselectWord: (word) => set((state) => ({
    validationResult: null,
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
    const { seed, selectedWords } = get();
    const isValid = validateSeedOrder(seed, selectedWords);
    
    set({ validationResult: isValid });

    if (isValid) {
      try {
        saveSeedToStorage(seed); 
      } catch (error) {
        console.error("No se pudo guardar la semilla localmente:", error);
      }
      
      set({ isWalletConfigured: true }); 
      if (onSuccess) onSuccess();
    }
  },

  resetWallet: () => {
    clearSeedFromStorage();
    const newSeed = generateSeedPhrase();

    set({
      seed: newSeed,
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
        set({ seed: existingSeed, isWalletConfigured: true });
      } else {
        const newSeed = generateSeedPhrase();
        set({ seed: newSeed, isWalletConfigured: false });
      }
    } catch (error) {
      console.error("Error al verificar estado de la wallet:", error);
      set({ isWalletConfigured: false });
    }
  }
}));