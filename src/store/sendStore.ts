import { create } from 'zustand';

export type SendPhase = 'FORM' | 'SUMMARY';

interface SendState {
  faseActual: SendPhase;
  redSeleccionada: string;
  monto: string;
  tokenSeleccionado: string;
  direccionDestino: string;
  
  setFaseActual: (fase: SendPhase) => void;
  setRed: (red: string) => void;
  setMonto: (monto: string) => void;
  setToken: (token: string) => void;
  setDireccionDestino: (direccion: string) => void;
  cargarDatosDesdeQR: (direccion: string, monto?: string, token?: string, red?: string) => void;
  resetearEnvio: () => void;
}

export const useSendStore = create<SendState>((set) => ({
  faseActual: 'FORM',
  redSeleccionada: 'Solana',
  monto: '',
  tokenSeleccionado: 'USDC',
  direccionDestino: '',

  setFaseActual: (fase) => set({ faseActual: fase }),
  setRed: (red) => set({ redSeleccionada: red }),
  setMonto: (monto) => set({ monto }),
  setToken: (token) => set({ tokenSeleccionado: token }),
  setDireccionDestino: (direccion) => set({ direccionDestino: direccion }),
  
  cargarDatosDesdeQR: (direccion, monto, token, red) => set((state) => ({
    direccionDestino: direccion,
    monto: monto || state.monto,
    tokenSeleccionado: token || state.tokenSeleccionado,
    redSeleccionada: red || state.redSeleccionada
  })),

  resetearEnvio: () => set({
    faseActual: 'FORM',
    monto: '',
    direccionDestino: '',
  })
}));