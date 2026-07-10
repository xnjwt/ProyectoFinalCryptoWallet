import { create } from 'zustand';
import { getSeedFromStorage, obtenerClavesPublicas } from '../services/walletService';
import { deriveAddress, getSolanaBalance, getUsdcBalance } from '../services/cryptoService';

interface SaldoActivo {
  cantidad: number;
  valorUsd: number;
}

interface PortfolioState {
  saldos: Record<'BTC' | 'ETH' | 'SOL' | 'USDC', SaldoActivo>;
  totalUsd: number;
  cargando: boolean;
  actualizarPortafolio: () => Promise<void>;
}

const obtenerPrecios = async () => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,usd-coin&vs_currencies=usd'
  );
  if (!response.ok) throw new Error('Error al obtener precios');
  return response.json();
};

export const usePortfolioStore = create<PortfolioState>((set) => ({
  saldos: {
    BTC: { cantidad: 0, valorUsd: 0 },
    ETH: { cantidad: 0, valorUsd: 0 },
    SOL: { cantidad: 0, valorUsd: 0 },
    USDC: { cantidad: 0, valorUsd: 0 },
  },
  totalUsd: 0,
  cargando: true,

  actualizarPortafolio: async () => {
    try {
      const direccionSolana = obtenerClavesPublicas('solana');
      
      if (!direccionSolana) {
        set({ cargando: false });
        return;
      }

      const [saldoSol, saldoUsdc, precios] = await Promise.all([
        getSolanaBalance(direccionSolana),
        getUsdcBalance(direccionSolana),
        obtenerPrecios(),
      ]);

      const precioSol = precios?.solana?.usd || 0;
      const precioUsdc = precios?.['usd-coin']?.usd || 1;

      const valorSolUsd = saldoSol * precioSol;
      const valorUsdcUsd = saldoUsdc * precioUsdc;

      set({
        saldos: {
          BTC: { cantidad: 0, valorUsd: 0 },
          ETH: { cantidad: 0, valorUsd: 0 },
          SOL: { cantidad: saldoSol, valorUsd: valorSolUsd },
          USDC: { cantidad: saldoUsdc, valorUsd: valorUsdcUsd },
        },
        totalUsd: valorSolUsd + valorUsdcUsd,
        cargando: false,
      });
    } catch (error) {
      console.error('Error actualizando el portafolio:', error);
      set({ cargando: false });
    }
  },
}));