import { create } from 'zustand';
import {
  generateSeedPhrase,
  saveSeedToStorage,
  getSeedFromStorage,
  shuffleArray,
  validateSeedOrder,
  clearSeedFromStorage
} from '../services/walletService';

// 1. Añadimos las firmas faltantes a la interfaz
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
      // --- NUEVO: Si ya existe en local, le decimos al orquestador que está lista ---
      set({ seed: existingSeed, step: 3, isWalletConfigured: true });
    } else {
      const newSeed = generateSeedPhrase();
      set({ seed: newSeed, step: 1, isWalletConfigured: false });
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
      secondsLeft: 5,
      // --- NUEVO: Si reseteamos la wallet, también cambiamos el estado del orquestador ---
      isWalletConfigured: false 
    });
  },

  // --- NUEVO: Implementación de las funciones del orquestador ---
  completeWalletSetup: () => {
    set({ isWalletConfigured: true });
  },

  checkWalletStatus: async (uid: string) => {
    try {
      // const response = await fetch(`http://localhost:3000/api/wallet-status/${uid}`);
      // const data = await response.json();
      // set({ isWalletConfigured: data.isConfigured, step: data.isConfigured ? 3 : 1 });

      // POR AHORA:Evaluamos usando tu almacenamiento local para que puedas seguir programando el frontend
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