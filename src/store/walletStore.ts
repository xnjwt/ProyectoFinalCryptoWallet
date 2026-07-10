import { create } from 'zustand';
import {
  shuffleArray,
  clearSeedFromStorage,
  generarFraseSemilla,
  guardarClavesPublicas,
  derivarSemilla,
  guardarSemilla,
  validarOrdenSemilla,
  existeSemillaGuardada,
  importarBilletera
} from '../services/walletService';

interface WalletState {
  seed: string;
  availableWords: string[];
  selectedWords: string[];
  validationResult: boolean | null;
  secondsLeft: number;
  isWalletConfigured: boolean; 
  isVerifying: boolean;
  isImporting: boolean;
  importarWalletDesdeFrase: (seedPhrase: string, onSuccess: () => void, password?: string) => Promise<void>;

  initializeWallet: () => void;
  setSeed: (seed: string) => void;
  decrementTimer: () => void;
  selectWord: (word: string) => void;
  deselectWord: (word: string) => void;
  resetVerification: () => void;
  verifySeed: (onSuccess: () => void, password?: string) => Promise<void>;
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
  isVerifying: false,
  isImporting: false,

  importarWalletDesdeFrase: async (seedPhrase, onSuccess, password) => {
    if (get().isImporting) return;
    set({ isImporting: true });

    try {
      await importarBilletera(seedPhrase, password);
      set({ isWalletConfigured: true, seed: '' }); // Mantenemos la memoria RAM limpia
      if (onSuccess) onSuccess();
    } catch (error: any) {
      set({ isWalletConfigured: false });
      throw error; // Relanza 'FALLO_BIOMETRIA' o 'BIP39_INVALIDO' hacia la UI
    } finally {
      set({ isImporting: false });
    }
  },

  initializeWallet: () => {
    const yaConfigurada = existeSemillaGuardada();

    if (yaConfigurada) {
      // Si ya hay billetera, solo cambiamos la bandera para que la UI sepa qué pantalla mostrar.
      // NUNCA guardamos la semilla desencriptada en el estado. Se mantiene vacía.
      set({ isWalletConfigured: true, seed: '' });
    } else {
      // Solo si es una instalación nueva, generamos la frase para la pantalla de registro
      const nuevaSemilla = generarFraseSemilla();
      set({ seed: nuevaSemilla, isWalletConfigured: false });
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

  verifySeed: async (onSuccess, password) => {
    if (get().isVerifying) return; 
    const { seed, selectedWords } = get();
    const esValido = validarOrdenSemilla(seed, selectedWords);
    
    if (!esValido) {
      set({ validationResult: false });
      return;
    }
    set({ isVerifying: true });

    try {

      await guardarSemilla(seed, password); 
      const direccionesPublicas = derivarSemilla(seed);
      guardarClavesPublicas(direccionesPublicas);
      
      set({ validationResult: true, isWalletConfigured: true }); 
      if (onSuccess) onSuccess();
    } catch (error) {
      set({ validationResult: false, isWalletConfigured: false });
      throw error; // Lanzamos el error a la vista ('FALLO_BIOMETRIA')
    } finally {
      set({ isVerifying: false }); 
    }
  },

  resetWallet: () => {
    clearSeedFromStorage();
    const newSeed = generarFraseSemilla();

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
    // Usamos la comprobación silenciosa en lugar de obtenerSemilla
    const yaConfigurada = existeSemillaGuardada();

    if (yaConfigurada) {
      set({ isWalletConfigured: true, seed: '' });
    } else {
      const nuevaSemilla = generarFraseSemilla();
      set({ seed: nuevaSemilla, isWalletConfigured: false });
    }
  },
}));