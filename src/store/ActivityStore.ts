import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TipoActividad = 'RECIBIDO' | 'ENVIADO';
export type SimboloActivo = 'BTC' | 'ETH' | 'SOL' | 'USDC'| 'USDT';

export interface Actividad {
  id: string;
  tipo: TipoActividad;
  symbol: SimboloActivo;
  cantidad: number;
  fecha: number;
}

interface ActivityState {
  actividades: Actividad[];
  agregarActividad: (actividad: Omit<Actividad, 'id' | 'fecha'>) => void;
}

const LIMITE_HISTORIAL = 20;

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      actividades: [],

      agregarActividad: (actividad) =>
        set((state) => ({
          actividades: [
            { ...actividad, id: crypto.randomUUID(), fecha: Date.now() },
            ...state.actividades,
          ].slice(0, LIMITE_HISTORIAL),
        })),
    }),
    {
      name: 'wallet_activity', // clave usada en localStorage
    }
  )
);