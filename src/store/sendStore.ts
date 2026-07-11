import { create } from 'zustand';

import { obtenerClavesPublicas } from '../services/walletService';
import { obtenerSemilla } from '../services/walletService';
import { obtenerClavePrivadaSolana } from '../services/walletService';
import { orquestadorBilletera } from './../prooveedoresRpc';
import { SolicitudTransferencia, TransaccionNoFirmada } from '../services/EnviarCrypto/interfaces';

export type SendPhase = 'FORM' | 'SUMMARY';

interface SendState {
  faseActual: SendPhase;
  redSeleccionada: string;
  monto: string;
  tokenSeleccionado: string;
  direccionDestino: string;
  
  transaccionCruda: TransaccionNoFirmada | null;
  comisionEstimada: number;
  isProcessing: boolean;
  errorEnvio: string | null;

  setFaseActual: (fase: SendPhase) => void;
  setRed: (red: string) => void;
  setMonto: (monto: string) => void;
  setToken: (token: string) => void;
  setDireccionDestino: (direccion: string) => void;
  cargarDatosDesdeQR: (direccion: string, monto?: string, token?: string, red?: string) => void;
  resetearEnvio: () => void;

  prepararTransaccion: () => Promise<boolean>;
  ejecutarTransferencia: (password?: string) => Promise<string | null>;
}

export const useSendStore = create<SendState>((set, get) => ({
  faseActual: 'FORM',
  redSeleccionada: 'Solana',
  monto: '',
  tokenSeleccionado: 'USDC',
  direccionDestino: '',
  
  transaccionCruda: null,
  comisionEstimada: 0,
  isProcessing: false,
  errorEnvio: null,

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
    transaccionCruda: null,
    comisionEstimada: 0,
    isProcessing: false,
    errorEnvio: null
  }),

  prepararTransaccion: async () => {
    const { redSeleccionada, monto, tokenSeleccionado, direccionDestino } = get();
    set({ isProcessing: true, errorEnvio: null });

    try {
      const remitente = obtenerClavesPublicas('solana');
      
      const decimales = tokenSeleccionado.toUpperCase() === 'SOL' ? 9 : 6;

      const solicitud: SolicitudTransferencia = {
        red: redSeleccionada.toUpperCase() as any,
        clavePublicaRemitente: remitente,
        clavePublicaDestinatario: direccionDestino,
        simboloMoneda: tokenSeleccionado,
        cantidad: parseFloat(monto),
        decimalesMoneda: decimales
      };

      // 2. MODIFICADO: Usamos el orquestador instanciado
      const resultado = await orquestadorBilletera.construir(solicitud);

      if (resultado.exito && resultado.transaccionCruda) {
        set({ 
          transaccionCruda: resultado.transaccionCruda, 
          comisionEstimada: resultado.comisionEstimada || 0,
          faseActual: 'SUMMARY',
          isProcessing: false 
        });
        return true;
      } else {
        set({ errorEnvio: resultado.mensajeErrorAmigable || 'Error al construir la transacción', isProcessing: false });
        return false;
      }
    } catch (error: any) {
      set({ errorEnvio: error.message, isProcessing: false });
      return false;
    }
  },

  ejecutarTransferencia: async (password?: string) => {
    const { transaccionCruda } = get();
    if (!transaccionCruda) return null;

    set({ isProcessing: true, errorEnvio: null });

    try {
      const semilla = await obtenerSemilla(password);
      if (!semilla) throw new Error("No se pudo acceder a la bóveda");

      const clavePrivada = obtenerClavePrivadaSolana(semilla);

      // 3. MODIFICADO: Usamos el orquestador instanciado
      const resultadoFirma = await orquestadorBilletera.firmar(transaccionCruda, clavePrivada);
      if (!resultadoFirma.exito || !resultadoFirma.transaccionSerializada) {
        throw new Error(resultadoFirma.mensajeErrorAmigable);
      }

      const txFirmada = {
        red: transaccionCruda.red,
        transaccionSerializada: resultadoFirma.transaccionSerializada
      };

      // 4. MODIFICADO: Usamos el orquestador instanciado
      const resultadoTransmision = await orquestadorBilletera.transmitir(txFirmada);
      if (!resultadoTransmision.exito || !resultadoTransmision.hashTransaccion) {
        throw new Error(resultadoTransmision.mensajeErrorAmigable);
      }

      set({ isProcessing: false });
      return resultadoTransmision.hashTransaccion;

    } catch (error: any) {
      set({ errorEnvio: error.message, isProcessing: false });
      return null;
    }
  }
}));