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
  step: number;
  availableWords: string[];
  selectedWords: string[];
  validationResult: boolean | null;
  secondsLeft: number;
  
  // Acciones (Actions)
  initializeWallet: () => void;
  setStep: (step: number) => void;
  decrementTimer: () => void;
  selectWord: (word: string) => void;
  deselectWord: (word: string) => void;
  resetVerification: () => void;
  verifySeed: (onSuccess: () => void) => void;
  resetWallet: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  seed: '',
  step: 0,
  availableWords: [],
  selectedWords: [],
  validationResult: null,
  secondsLeft: 5,

  initializeWallet: () => {
    const existingSeed = getSeedFromStorage();
    if (existingSeed) {
      set({ seed: existingSeed, step: 3 });
    } else {
      const newSeed = generateSeedPhrase();

      set({ seed: newSeed, step: 1 });
    }
  },

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
    const originalSeed = get?.().seed;
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
      saveSeedToStorage(seed)
      setTimeout(() => {
        set({ step: 3 });
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
      secondsLeft: 5
    });
  }
}));