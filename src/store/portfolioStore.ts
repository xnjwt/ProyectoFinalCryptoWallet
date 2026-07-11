import { create } from 'zustand';


import {obtenerClavesPublicas} from '../services/walletService';
import {   obtenerSaldo } from '../services/cryptoService';
import { getCryptoPrices } from '../services/priceService';
import { useActivityStore } from './ActivityStore';

interface SaldoActivo {
  cantidad: number;
  valorUsd: number;
}

interface PortfolioState {
  saldos: Record<'BTC' | 'ETH' | 'SOL' | 'USDC' | 'USDT', SaldoActivo>;
  totalUsd: number;
  cargando: boolean;
  inicializado: boolean;
  actualizarPortafolio: () => Promise<void>;
}

const UMBRAL_CAMBIO = 0.000001; // ignora ruido de redondeo, no un cambio real de saldo

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  saldos: {
    BTC: { cantidad: 0, valorUsd: 0 },
    ETH: { cantidad: 0, valorUsd: 0 },
    SOL: { cantidad: 0, valorUsd: 0 },
    USDC: { cantidad: 0, valorUsd: 0 },
    USDT: { cantidad: 0, valorUsd: 0 },
  },
  totalUsd: 0,
  cargando: true,
  inicializado: false,

  actualizarPortafolio: async () => {
    try {
      const direccionSolana = obtenerClavesPublicas('solana');

      if (!direccionSolana) {
        set({ cargando: false });
        return;
      }

      const [saldoSol, saldoUsdc, saldoUsdt] = await Promise.all([
        obtenerSaldo('SOL'),
        obtenerSaldo('USDC'),
        obtenerSaldo('USDT'),
      ]);

      let precios: any = null;
      try {
        precios = await getCryptoPrices();
      } catch (error) {
        console.error('No se pudieron obtener precios (se sigue con saldos igual):', error);
      }

      const precioSol = precios?.solana?.usd || 0;
      const precioUsdc = precios?.['usd-coin']?.usd || 1;
      const precioUsdt = precios?.['tether']?.usd || 1;
      const valorSolUsd = saldoSol * precioSol;
      const valorUsdcUsd = saldoUsdc * precioUsdc;
      const valorUsdtUsd = saldoUsdt * precioUsdt;

      const { saldos: saldosAnteriores, inicializado } = get();

      console.log('[portfolioStore] ciclo →', {
        inicializado,
        saldoSolAnterior: saldosAnteriores.SOL.cantidad,
        saldoSolNuevo: saldoSol,
        saldoUsdcAnterior: saldosAnteriores.USDC.cantidad,
        saldoUsdcNuevo: saldoUsdc,
        saldoUsdtAnterior: saldosAnteriores.USDT.cantidad,
        saldoUsdtNuevo: saldoUsdt,
      });

      
      if (inicializado) {
        const deltaSol = saldoSol - saldosAnteriores.SOL.cantidad;
        const deltaUsdc = saldoUsdc - saldosAnteriores.USDC.cantidad;
        const deltaUsdt = saldoUsdt - saldosAnteriores.USDT.cantidad;

        if (deltaSol > UMBRAL_CAMBIO) {
          console.log('[portfolioStore] ✅ delta SOL detectado:', deltaSol);
          useActivityStore.getState().agregarActividad({
            tipo: 'RECIBIDO',
            symbol: 'SOL',
            cantidad: deltaSol,
          });
        }
        if (deltaUsdc > UMBRAL_CAMBIO) {
          console.log('[portfolioStore] ✅ delta USDC detectado:', deltaUsdc);
          useActivityStore.getState().agregarActividad({
            tipo: 'RECIBIDO',
            symbol: 'USDC',
            cantidad: deltaUsdc,
          });
        }
        if (deltaUsdt > UMBRAL_CAMBIO) {
          console.log('[portfolioStore] ✅ delta USDT detectado:', deltaUsdt);
          useActivityStore.getState().agregarActividad({
            tipo: 'RECIBIDO',
            symbol: 'USDT',
            cantidad: deltaUsdt,
          });
        }
      }

      set({
        saldos: {
          BTC: { cantidad: 0, valorUsd: 0 },
          ETH: { cantidad: 0, valorUsd: 0 },
          SOL: { cantidad: saldoSol, valorUsd: valorSolUsd },
          USDC: { cantidad: saldoUsdc, valorUsd: valorUsdcUsd },
          USDT: { cantidad: saldoUsdt, valorUsd: valorUsdtUsd },
        },
        totalUsd: valorSolUsd + valorUsdcUsd,
        cargando: false,
        inicializado: true,
      });
    } catch (error) {
      console.error('Error actualizando el portafolio:', error);
      set({ cargando: false });
    }
  },
}));