import * as bip39 from 'bip39';
export const generateSeedPhrase = (): string => {
  return bip39.generateMnemonic(128);
};

interface ClavesPublicas {
    solana: string;
    bitcoin: string;
    ethereum: string;
}

type RedCripto = 'solana' | 'bitcoin' | 'ethereum';

export const guardarClavesPublicas = (direcciones: ClavesPublicas): void => {
    localStorage.setItem('wallet_public_keys', JSON.stringify(direcciones));
};

export function obtenerClavesPublicas(): ClavesPublicas;
export function obtenerClavesPublicas(red: RedCripto): string;
export function obtenerClavesPublicas(red: RedCripto | null): ClavesPublicas | string;
export function obtenerClavesPublicas(red: RedCripto | null = null): ClavesPublicas | string {
    const datos = localStorage.getItem('wallet_public_keys');
    
    if (!datos) {
        return red ? '' : { solana: '', bitcoin: '', ethereum: '' };
    }

    const claves: ClavesPublicas = JSON.parse(datos);

    if (!red) {
        return claves;
    }

    const redNormalizada = red.toLowerCase() as RedCripto;
    return claves[redNormalizada] || '';
}

export const saveSeedToStorage = (seed: string): void => {
  localStorage.setItem('wallet_seed', seed);
};
export const getSeedFromStorage = (): string | null => {
  return localStorage.getItem('wallet_seed');
};
export const clearSeedFromStorage = (): void => {
  localStorage.removeItem('wallet_seed');
};
export const validateSeedOrder = (originalSeed: string, inputtedSeed: string[]): boolean => {
  return originalSeed === inputtedSeed.join(' ');
};
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};